import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  getGrokLogoutPopupLines,
  getGrokStatusPopupLines,
  register,
} from "../src/core/commands/grok.js";
import {
  getGrokLoginSuccessLines,
  wrapInfoText,
} from "../src/core/llm/providers/grok/auth.js";
import { getAllProviders, getProvider } from "../src/core/llm/providers/index.js";
import {
  clearDiscoveryCache,
  deleteTokens,
  fetchOIDCDiscovery,
  getLoginStatus,
  getValidBearer,
  grok,
  isLoggedIn,
  loadTokens,
  loginWithDeviceCode,
  saveTokens,
} from "../src/core/llm/providers/grok.js";

const originalFetch = globalThis.fetch;
const originalHome = process.env.HOME;
const originalLocalAppData = process.env.LOCALAPPDATA;

let tempHome: string;

function setIsolatedConfigHome(): void {
  tempHome = mkdtempSync(join(tmpdir(), "soulforge-grok-oauth-"));
  process.env.HOME = tempHome;
  delete process.env.LOCALAPPDATA;
  mkdirSync(join(tempHome, ".soulforge"), { recursive: true, mode: 0o700 });
}

function restoreEnv(): void {
  globalThis.fetch = originalFetch;
  if (originalHome === undefined) delete process.env.HOME;
  else process.env.HOME = originalHome;
  if (originalLocalAppData === undefined) delete process.env.LOCALAPPDATA;
  else process.env.LOCALAPPDATA = originalLocalAppData;
  clearDiscoveryCache();
  if (tempHome) rmSync(tempHome, { recursive: true, force: true });
}

const theme = {
  success: "green",
  brandSecondary: "red",
  warning: "yellow",
  textPrimary: "white",
  textSecondary: "gray",
} as const;

describe("grok provider registration", () => {
  test("is registered as a builtin provider", () => {
    expect(getProvider("grok")).toBeDefined();
    expect(getAllProviders().filter((provider) => !provider.custom)).toHaveLength(23);
  });

  test("has subscription metadata and auth hooks", () => {
    expect(grok.id).toBe("grok");
    expect(grok.name).toBe("Grok (subscription)");
    expect(grok.envVar).toBe("");
    expect(grok.badge).toBe("subscription");
    expect(grok.noAuthLabel).toBe("login required — Enter to authenticate");
    expect(grok.authErrorLabel).toBe("login/session error");
    expect(grok.onRequestAuth).toBeDefined();
    expect(grok.checkAvailability).toBeDefined();
    expect(grok.fallbackModels.some((m) => m.id === "grok-4.3")).toBe(true);
  });

  test("createModel without tokens throws cleanly", () => {
    setIsolatedConfigHome();
    try {
      expect(() => grok.createModel("grok-4.3")).toThrow(/\/grok login/);
    } finally {
      restoreEnv();
    }
  });
});

describe("grok token store", () => {
  beforeEach(() => {
    setIsolatedConfigHome();
  });

  afterEach(() => {
    restoreEnv();
  });

  test("save/load/delete tokens", () => {
    expect(isLoggedIn()).toBe(false);
    saveTokens({
      accessToken: "access-1",
      refreshToken: "refresh-1",
      expiresIn: 3600,
      tokenEndpoint: "https://auth.x.ai/oauth/token",
      idToken: [
        "eyJhbGciOiJub25lIn0",
        Buffer.from(JSON.stringify({ email: "user@example.com" })).toString("base64url"),
        "sig",
      ].join("."),
    });

    const loaded = loadTokens();
    expect(loaded?.accessToken).toBe("access-1");
    expect(loaded?.refreshToken).toBe("refresh-1");
    expect(loaded?.email).toBe("user@example.com");
    expect(loaded?.tokenEndpoint).toBe("https://auth.x.ai/oauth/token");
    expect(typeof loaded?.expiresAt).toBe("number");
    expect(isLoggedIn()).toBe(true);
    expect(getLoginStatus()).toMatchObject({ loggedIn: true, email: "user@example.com" });

    const path = join(tempHome, ".soulforge", "xai-oauth.json");
    const raw = readFileSync(path, "utf8");
    expect(raw).toContain("access-1");

    deleteTokens();
    expect(loadTokens()).toBeNull();
    expect(isLoggedIn()).toBe(false);
  });

  test("getValidBearer returns non-expired token without refresh", async () => {
    saveTokens({
      accessToken: "still-good",
      refreshToken: "refresh-1",
      expiresIn: 3600,
      tokenEndpoint: "https://auth.x.ai/oauth/token",
    });
    const calls: string[] = [];
    globalThis.fetch = mock(async (input: RequestInfo | URL) => {
      calls.push(String(input));
      throw new Error("should not refresh");
    }) as typeof fetch;

    await expect(getValidBearer()).resolves.toBe("still-good");
    expect(calls).toHaveLength(0);
  });

  test("getValidBearer refreshes near-expiry tokens and persists", async () => {
    saveTokens({
      accessToken: "old-access",
      refreshToken: "refresh-1",
      expiresIn: 30, // within 2-minute skew
      tokenEndpoint: "https://auth.x.ai/oauth/token",
    });

    globalThis.fetch = mock(async () =>
      Response.json({
        access_token: "new-access",
        refresh_token: "refresh-2",
        expires_in: 3600,
      }),
    ) as typeof fetch;

    await expect(getValidBearer()).resolves.toBe("new-access");
    expect(loadTokens()?.accessToken).toBe("new-access");
    expect(loadTokens()?.refreshToken).toBe("refresh-2");
  });

  test("getValidBearer throws actionable error when refresh fails", async () => {
    saveTokens({
      accessToken: "old-access",
      refreshToken: "refresh-1",
      expiresIn: 30,
      tokenEndpoint: "https://auth.x.ai/oauth/token",
    });

    globalThis.fetch = mock(async () => new Response("nope", { status: 401 })) as typeof fetch;

    await expect(getValidBearer()).rejects.toThrow(/\/grok login/);
  });

  test("expired without refresh path throws", async () => {
    const path = join(tempHome, ".soulforge", "xai-oauth.json");
    writeFileSync(
      path,
      JSON.stringify({
        accessToken: "stale",
        expiresAt: Date.now() - 1000,
      }),
      { mode: 0o600 },
    );

    await expect(getValidBearer()).rejects.toThrow(/refresh token/);
  });
});

describe("grok discovery + device-code", () => {
  beforeEach(() => {
    setIsolatedConfigHome();
    clearDiscoveryCache();
  });

  afterEach(() => {
    restoreEnv();
  });

  test("fetchOIDCDiscovery maps endpoints and caches", async () => {
    let hits = 0;
    globalThis.fetch = mock(async (input: RequestInfo | URL) => {
      hits += 1;
      expect(String(input)).toContain("openid-configuration");
      return Response.json({
        authorization_endpoint: "https://auth.x.ai/oauth/authorize",
        token_endpoint: "https://auth.x.ai/oauth/token",
        device_authorization_endpoint: "https://auth.x.ai/oauth/device",
      });
    }) as typeof fetch;

    const first = await fetchOIDCDiscovery();
    const second = await fetchOIDCDiscovery();
    expect(first.tokenEndpoint).toBe("https://auth.x.ai/oauth/token");
    expect(first.deviceAuthorizationEndpoint).toBe("https://auth.x.ai/oauth/device");
    expect(second).toEqual(first);
    expect(hits).toBe(1);
  });

  test("fetchOIDCDiscovery rejects untrusted hosts", async () => {
    globalThis.fetch = mock(async () =>
      Response.json({
        authorization_endpoint: "https://evil.example/oauth/authorize",
        token_endpoint: "https://evil.example/oauth/token",
      }),
    ) as typeof fetch;

    await expect(fetchOIDCDiscovery()).rejects.toThrow(/untrusted/);
  });

  test("device-code poll: pending then success", async () => {
    const events: string[] = [];
    let poll = 0;

    globalThis.fetch = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("openid-configuration")) {
        return Response.json({
          authorization_endpoint: "https://auth.x.ai/oauth/authorize",
          token_endpoint: "https://auth.x.ai/oauth/token",
          device_authorization_endpoint: "https://auth.x.ai/oauth/device",
        });
      }
      if (url.includes("/oauth/device") && init?.method === "POST") {
        return Response.json({
          device_code: "dev-1",
          user_code: "ABCD-EFGH",
          verification_uri: "https://auth.x.ai/device",
          verification_uri_complete: "https://auth.x.ai/device?user_code=ABCD-EFGH",
          expires_in: 600,
          interval: 0,
        });
      }
      if (url.includes("/oauth/token")) {
        poll += 1;
        if (poll === 1) {
          return Response.json({ error: "authorization_pending" }, { status: 400 });
        }
        return Response.json({
          access_token: "device-access",
          refresh_token: "device-refresh",
          expires_in: 3600,
          id_token: [
            "eyJhbGciOiJub25lIn0",
            Buffer.from(JSON.stringify({ email: "device@example.com" })).toString("base64url"),
            "sig",
          ].join("."),
        });
      }
      throw new Error(`unexpected fetch ${url}`);
    }) as typeof fetch;

    await loginWithDeviceCode({
      onStatus: (m) => events.push(m),
      onCode: (info) => {
        expect(info.userCode).toBe("ABCD-EFGH");
      },
    });

    expect(isLoggedIn()).toBe(true);
    expect(loadTokens()?.accessToken).toBe("device-access");
    expect(loadTokens()?.email).toBe("device@example.com");
    expect(events.some((e) => e.includes("Logged in"))).toBe(true);
  });
});

describe("grok availability + models", () => {
  beforeEach(() => {
    setIsolatedConfigHome();
  });

  afterEach(() => {
    restoreEnv();
  });

  test("checkAvailability true/false", async () => {
    expect(await grok.checkAvailability?.()).toBe(false);
    saveTokens({ accessToken: "a", expiresIn: 3600, tokenEndpoint: "https://auth.x.ai/oauth/token" });
    expect(await grok.checkAvailability?.()).toBe(true);
  });

  test("fetchModels filters embed ids", async () => {
    saveTokens({
      accessToken: "a",
      expiresIn: 3600,
      tokenEndpoint: "https://auth.x.ai/oauth/token",
    });
    globalThis.fetch = mock(async () =>
      Response.json({
        data: [
          { id: "grok-4.3", context_window: 2_000_000 },
          { id: "text-embedding-3", context_window: 8192 },
          { id: "grok-3", context_window: 131_072 },
        ],
      }),
    ) as typeof fetch;

    const models = await grok.fetchModels();
    expect(models?.map((m) => m.id)).toEqual(["grok-4.3", "grok-3"]);
  });
});

describe("grok commands", () => {
  test("registers status, login, logout, and switch commands", () => {
    const map = new Map();
    register(map);
    expect(map.has("/grok")).toBe(true);
    expect(map.has("/grok status")).toBe(true);
    expect(map.has("/grok login")).toBe(true);
    expect(map.has("/grok logout")).toBe(true);
    expect(map.has("/grok switch")).toBe(true);
  });

  test("builds status popup lines", () => {
    const lines = getGrokStatusPopupLines(
      { loggedIn: false },
      theme as ReturnType<typeof import("../src/core/theme/index.js").getThemeTokens>,
    );
    expect(lines[0]).toMatchObject({ type: "entry", label: "Logged in", desc: "no" });
  });

  test("builds logout popup lines with active-model warning", () => {
    const lines = getGrokLogoutPopupLines(
      { ok: true, message: "Logged out of Grok (subscription)." },
      true,
      theme as ReturnType<typeof import("../src/core/theme/index.js").getThemeTokens>,
    );
    expect(lines[0]).toMatchObject({
      type: "text",
      label: "Logged out of Grok (subscription).",
    });
    expect(lines[2]).toMatchObject({
      type: "text",
      label:
        "The active model is still Grok (subscription). Switch models or log back in before your next prompt.",
    });
  });

  test("success lines mention login, model picker, and regional VPN note", () => {
    const lines = getGrokLoginSuccessLines(
      theme as ReturnType<typeof import("../src/core/theme/index.js").getThemeTokens>,
    );
    expect(lines[0]).toMatchObject({
      type: "text",
      label: "Logged in to Grok (subscription).",
    });
    expect(
      lines.some((l) => l.type === "text" && /Ctrl\+L|model picker|\/models/i.test(l.label ?? "")),
    ).toBe(true);
    const regionText = lines
      .filter((l) => l.type === "text")
      .map((l) => l.label ?? "")
      .join(" ");
    expect(regionText).toMatch(/VPN/i);
    expect(regionText).toMatch(/region/i);
    expect(regionText).toMatch(/subscription-only models/i);
    // No single line should exceed the wrap width used by the login popup.
    for (const l of lines) {
      if (l.type === "text" && l.label) expect(l.label.length).toBeLessThanOrEqual(76);
    }
  });

  test("wrapInfoText splits long notes and hard-wraps URLs", () => {
    const note = wrapInfoText(
      "Note: not all models are available in every region. A VPN (e.g. to the US) may be required for the newest subscription-only models.",
      "gray",
      40,
    );
    expect(note.length).toBeGreaterThan(1);
    expect(note.every((l) => (l.label?.length ?? 0) <= 40)).toBe(true);

    const url =
      "https://accounts.x.ai/oauth2/device?user_code=K9DA-66NC&extra=padding-to-force-hard-wrap-aaaaaaaa";
    const urlLines = wrapInfoText(url, "white", 40);
    expect(urlLines.length).toBeGreaterThan(1);
    expect(urlLines.map((l) => l.label).join("")).toBe(url);
  });
});
