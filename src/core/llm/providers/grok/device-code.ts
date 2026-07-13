import {
  XAI_DEVICE_CODE_POLL_INTERVAL_MS,
  XAI_OAUTH_CLIENT_ID,
  XAI_OAUTH_FETCH_TIMEOUT_MS,
  XAI_OAUTH_SCOPE,
} from "./constants.js";
import { fetchOIDCDiscovery } from "./discovery.js";
import { type OAuthTokenResponse, saveTokens } from "./token-store.js";

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete?: string;
  expires_in: number;
  interval?: number;
}

export interface DeviceCodeStatus {
  userCode: string;
  verificationUri: string;
  verificationUriComplete?: string;
}

export interface LoginWithDeviceCodeOptions {
  onCode?: (info: DeviceCodeStatus) => void;
  onStatus?: (message: string) => void;
  signal?: AbortSignal;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Grok login cancelled."));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error("Grok login cancelled."));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function loginWithDeviceCode(options: LoginWithDeviceCodeOptions = {}): Promise<void> {
  const { onCode, onStatus, signal } = options;

  onStatus?.("Discovering xAI OAuth endpoints...");
  const discovery = await fetchOIDCDiscovery();

  if (!discovery.deviceAuthorizationEndpoint) {
    throw new Error("xAI does not advertise device-code flow via OIDC discovery.");
  }

  if (signal?.aborted) throw new Error("Grok login cancelled.");

  onStatus?.("Requesting device code...");
  const dcRes = await fetch(discovery.deviceAuthorizationEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: XAI_OAUTH_CLIENT_ID,
      scope: XAI_OAUTH_SCOPE,
    }),
    signal: signal ?? AbortSignal.timeout(XAI_OAUTH_FETCH_TIMEOUT_MS),
  });

  if (!dcRes.ok) {
    throw new Error(`Device code request failed: ${await dcRes.text()}`);
  }

  const dc = (await dcRes.json()) as DeviceCodeResponse;
  const codeInfo = {
    userCode: dc.user_code,
    verificationUri: dc.verification_uri,
    verificationUriComplete: dc.verification_uri_complete,
  };
  onCode?.(codeInfo);

  // When no UI callback is wired (tests / headless), print the code ourselves.
  if (!onCode) {
    const completeUrl = dc.verification_uri_complete || dc.verification_uri;
    onStatus?.(`Open: ${completeUrl}`);
    onStatus?.(`Enter code: ${dc.user_code}`);
  }
  onStatus?.("Waiting for authorization...");

  // Server-provided interval is authoritative; fall back to the default poll floor.
  let intervalMs =
    typeof dc.interval === "number" && dc.interval >= 0
      ? Math.max(dc.interval * 1000, 0)
      : XAI_DEVICE_CODE_POLL_INTERVAL_MS;
  const deadline = Date.now() + dc.expires_in * 1000;

  while (Date.now() < deadline) {
    if (signal?.aborted) throw new Error("Grok login cancelled.");
    if (intervalMs > 0) await sleep(intervalMs, signal);

    const pollRes = await fetch(discovery.tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        client_id: XAI_OAUTH_CLIENT_ID,
        device_code: dc.device_code,
      }),
      signal: signal ?? AbortSignal.timeout(XAI_OAUTH_FETCH_TIMEOUT_MS),
    });

    if (pollRes.ok) {
      const tokens = (await pollRes.json()) as OAuthTokenResponse;
      if (typeof tokens.access_token !== "string" || !tokens.access_token) {
        throw new Error("Device code exchange returned an invalid access_token.");
      }
      saveTokens({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        idToken: tokens.id_token,
        tokenEndpoint: discovery.tokenEndpoint,
      });
      onStatus?.("Logged in to Grok successfully.");
      return;
    }

    let err: { error?: string; error_description?: string };
    try {
      err = (await pollRes.json()) as { error?: string; error_description?: string };
    } catch {
      throw new Error(`Device code poll failed: HTTP ${String(pollRes.status)}`);
    }

    if (err.error === "authorization_pending") continue;
    if (err.error === "slow_down") {
      intervalMs += 5000;
      continue;
    }
    throw new Error(`Device code poll failed: ${err.error_description || err.error || "unknown"}`);
  }

  throw new Error("Device code expired. Run /grok login again.");
}
