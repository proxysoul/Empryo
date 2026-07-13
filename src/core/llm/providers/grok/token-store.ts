import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  authFilePath,
  TOKEN_REFRESH_SKEW_MS,
  XAI_OAUTH_CLIENT_ID,
  XAI_OAUTH_FETCH_TIMEOUT_MS,
} from "./constants.js";

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenEndpoint?: string;
  email?: string;
  idToken?: string;
}

export interface SaveTokenInput {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  idToken?: string;
  tokenEndpoint?: string;
  email?: string;
}

/** Shape returned by xAI OAuth token endpoint (exchange + refresh). */
export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
  token_type?: string;
}

function extractEmailFromIdToken(idToken: string | undefined): string | undefined {
  if (!idToken) return undefined;
  try {
    const parts = idToken.split(".");
    if (!parts[1]) return undefined;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString()) as Record<
      string,
      unknown
    >;
    return typeof payload.email === "string" ? payload.email : undefined;
  } catch {
    return undefined;
  }
}

export function saveTokens(input: SaveTokenInput): void {
  const path = authFilePath();
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 });

  const existing = loadTokens();
  const data: TokenData = {
    accessToken: input.accessToken,
    refreshToken: input.refreshToken ?? existing?.refreshToken,
    expiresAt: input.expiresIn ? Date.now() + input.expiresIn * 1000 : existing?.expiresAt,
    tokenEndpoint: input.tokenEndpoint ?? existing?.tokenEndpoint,
    idToken: input.idToken ?? existing?.idToken,
    email: input.email ?? extractEmailFromIdToken(input.idToken) ?? existing?.email,
  };

  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
}

export function loadTokens(): TokenData | null {
  try {
    const raw = readFileSync(authFilePath(), "utf8");
    const data = JSON.parse(raw) as TokenData;
    if (!data?.accessToken || typeof data.accessToken !== "string") return null;
    return data;
  } catch {
    return null;
  }
}

export function deleteTokens(): void {
  try {
    unlinkSync(authFilePath());
  } catch {
    /* ignore missing file */
  }
}

export function isLoggedIn(): boolean {
  return !!loadTokens()?.accessToken;
}

export function getLoginStatus(): {
  loggedIn: boolean;
  email?: string;
  expiresAt?: number;
} {
  const tokens = loadTokens();
  if (!tokens?.accessToken) return { loggedIn: false };
  return {
    loggedIn: true,
    email: tokens.email,
    expiresAt: tokens.expiresAt,
  };
}

let refreshInflight: Promise<string> | null = null;

export async function getValidBearer(): Promise<string> {
  const tokens = loadTokens();
  if (!tokens?.accessToken) {
    throw new Error("Not logged in to Grok. Run /grok login first.");
  }

  const needsRefresh = !!tokens.expiresAt && Date.now() + TOKEN_REFRESH_SKEW_MS >= tokens.expiresAt;

  if (!needsRefresh) return tokens.accessToken;

  const refreshToken = tokens.refreshToken;
  const tokenEndpoint = tokens.tokenEndpoint;
  if (!refreshToken || !tokenEndpoint) {
    throw new Error(
      "Grok session expired and no refresh token is available. Run /grok login again.",
    );
  }

  if (refreshInflight) return refreshInflight;

  refreshInflight = (async () => {
    try {
      const res = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: XAI_OAUTH_CLIENT_ID,
          refresh_token: refreshToken,
        }),
        signal: AbortSignal.timeout(XAI_OAUTH_FETCH_TIMEOUT_MS),
      });

      if (!res.ok) {
        throw new Error("Grok token refresh failed. Run /grok login again.");
      }

      const refreshed = (await res.json()) as OAuthTokenResponse;
      if (typeof refreshed.access_token !== "string" || !refreshed.access_token) {
        throw new Error(
          "Grok token refresh returned an invalid access_token. Run /grok login again.",
        );
      }

      saveTokens({
        accessToken: refreshed.access_token,
        refreshToken:
          typeof refreshed.refresh_token === "string" ? refreshed.refresh_token : refreshToken,
        expiresIn: typeof refreshed.expires_in === "number" ? refreshed.expires_in : undefined,
        idToken: typeof refreshed.id_token === "string" ? refreshed.id_token : undefined,
        tokenEndpoint,
        email: tokens.email,
      });

      return refreshed.access_token;
    } finally {
      refreshInflight = null;
    }
  })();

  return refreshInflight;
}
