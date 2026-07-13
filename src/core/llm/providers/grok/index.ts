import { createXai } from "@ai-sdk/xai";
import type { LanguageModel } from "ai";
import { createSessionFetchWrapper, type ReasoningFetchFn } from "../reasoning-fetch.js";
import type { ProviderDefinition, ProviderModelInfo } from "../types.js";
import { XAI_API_BASE_URL } from "./constants.js";
import { getValidBearer, isLoggedIn } from "./token-store.js";

interface XaiModel {
  id: string;
  context_length?: number;
}

function createGrokOAuthFetch(): ReasoningFetchFn {
  return createSessionFetchWrapper({}, async (input, init) => {
    const token = await getValidBearer();
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  });
}

function createGrokModel(modelId: string): LanguageModel {
  if (!isLoggedIn()) {
    throw new Error("Not logged in to Grok. Run /grok login or press Enter in the model picker.");
  }
  // createXai is sync; refresh lives in the fetch wrapper so every request gets a valid bearer.
  return createXai({
    apiKey: "oauth",
    fetch: createGrokOAuthFetch() as typeof fetch,
  })(modelId);
}

export const GROK_FALLBACK_MODELS: ProviderModelInfo[] = [
  { id: "grok-4.3", name: "Grok 4.3" },
  { id: "grok-4.20", name: "Grok 4.20" },
  { id: "grok-4.1-fast", name: "Grok 4.1 Fast" },
  { id: "grok-4-fast", name: "Grok 4 Fast" },
  { id: "grok-4", name: "Grok 4" },
  { id: "grok-code-fast-1", name: "Grok Code Fast 1" },
  { id: "grok-3", name: "Grok 3" },
  { id: "grok-3-mini", name: "Grok 3 Mini" },
];

export const GROK_CONTEXT_WINDOWS: [pattern: string, tokens: number][] = [
  ["grok-4.3", 2_000_000],
  ["grok-4.20", 2_000_000],
  ["grok-4.1-fast", 2_000_000],
  ["grok-4-fast", 2_000_000],
  ["grok-code-fast-1", 256_000],
  ["grok-4.1", 2_000_000],
  ["grok-4", 256_000],
  ["grok-3", 131_072],
  ["grok-2", 131_072],
  ["grok", 131_072],
];

export const grok: ProviderDefinition = {
  id: "grok",
  name: "Grok (subscription)",
  // Empty envVar keeps this out of getProviderSecretEntries() (OAuth, not API key).
  envVar: "",
  icon: "\uF0E7", // nf-fa-bolt — same as xai
  asciiIcon: "G",
  description: "SuperGrok via xAI OAuth",
  badge: "subscription",
  noAuthLabel: "login required — Enter to authenticate",
  authErrorLabel: "login/session error",
  onRequestAuth: async () => {
    const { requestGrokAuth } = await import("./auth.js");
    await requestGrokAuth();
  },
  createModel: createGrokModel,
  async fetchModels(): Promise<ProviderModelInfo[] | null> {
    if (!isLoggedIn()) return null;
    try {
      const token = await getValidBearer();
      const res = await fetch(`${XAI_API_BASE_URL}/models`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`xAI API ${String(res.status)}`);
      const data = (await res.json()) as { data: XaiModel[] };
      const result: ProviderModelInfo[] = [];
      for (const m of data.data) {
        if (!m.id.includes("embed")) {
          result.push({ id: m.id, name: m.id, contextWindow: m.context_length });
        }
      }
      return result;
    } catch {
      return null;
    }
  },
  fallbackModels: GROK_FALLBACK_MODELS,
  contextWindows: GROK_CONTEXT_WINDOWS,
  checkAvailability: async () => isLoggedIn(),
};

export { loginWithDeviceCode } from "./device-code.js";
export { clearDiscoveryCache, fetchOIDCDiscovery } from "./discovery.js";
export {
  deleteTokens,
  getLoginStatus,
  getValidBearer,
  isLoggedIn,
  loadTokens,
  saveTokens,
} from "./token-store.js";
// auth.ts is intentionally not re-exported here — it imports models/UI and would
// create a circular init cycle with providers/index.ts. Use dynamic import or
// import from "./grok/auth.js" directly.
