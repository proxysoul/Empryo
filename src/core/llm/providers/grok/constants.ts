import { join } from "node:path";
import { configDir } from "../../../platform/index.js";

// Community OAuth client shared by progrok / Hermes / OpenClaw (MIT lineage).
// Unofficial — not endorsed by xAI. Documented in mintlify-docs/providers/grok.mdx.
export const XAI_OAUTH_CLIENT_ID = "b1a00492-073a-47ea-816f-4c329264a828";
export const XAI_OAUTH_SCOPE = "openid profile email offline_access grok-cli:access api:access";
export const XAI_OAUTH_ISSUER = "https://auth.x.ai";
export const XAI_OAUTH_DISCOVERY_URL = `${XAI_OAUTH_ISSUER}/.well-known/openid-configuration`;

export const XAI_OAUTH_FETCH_TIMEOUT_MS = 30 * 1000;
export const XAI_DEVICE_CODE_POLL_INTERVAL_MS = 5 * 1000;
export const TOKEN_REFRESH_SKEW_MS = 2 * 60 * 1000;

export const XAI_API_BASE_URL = "https://api.x.ai/v1";
export const DEFAULT_MODEL = "grok-4.3";

/** Token store path under SoulForge config dir (not ~/.progrok). */
export function authFilePath(): string {
  return join(configDir(), "xai-oauth.json");
}
