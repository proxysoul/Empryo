import { createAnthropic } from "@ai-sdk/anthropic";
import { getProviderApiKey } from "../../secrets.js";
import { withSessionHeaders } from "./reasoning-fetch.js";
import type { ProviderDefinition, ProviderModelInfo } from "./types.js";

// Regional Anthropic-compatible endpoints for MiniMax.
// global_en: https://platform.minimax.io — international account keys.
// cn_zh:     https://platform.minimaxi.com — China account keys.
// An account's key only validates against its own region, so the active
// region is resolved at createModel time (global_en default, cn_zh via env).
const ANTHROPIC_BASE_URLS: Record<string, string> = {
  global_en: "https://api.minimax.io/anthropic",
  cn_zh: "https://api.minimaxi.com/anthropic",
};

function resolveMinimaxBaseURL(): string {
  const region = (process.env.MINIMAX_REGION ?? "global_en").toLowerCase();
  return ANTHROPIC_BASE_URLS[region] ?? ANTHROPIC_BASE_URLS.global_en ?? "";
}

export const minimax: ProviderDefinition = {
  id: "minimax",
  name: "MiniMax",
  envVar: "MINIMAX_API_KEY",
  icon: "󰫈", // nf-md-alpha_m U+F0AC8
  secretKey: "minimax-api-key",
  keyUrl: "platform.minimaxi.com",
  asciiIcon: "M",
  description: "M3 / M2 series models",

  createModel(modelId: string) {
    const apiKey = getProviderApiKey("MINIMAX_API_KEY");
    if (!apiKey) {
      throw new Error("MINIMAX_API_KEY is not set");
    }
    // Route through the Anthropic-compatible MiniMax endpoint with an explicit
    // regional base URL (global_en default, cn_zh via MINIMAX_REGION) and the
    // session-header fetch wrapper for cache-affinity routing.
    return createAnthropic({
      apiKey,
      baseURL: resolveMinimaxBaseURL(),
      fetch: withSessionHeaders() as typeof fetch,
    })(modelId);
  },

  async fetchModels(): Promise<ProviderModelInfo[] | null> {
    // MiniMax doesn't expose a public models listing endpoint
    return null;
  },

  fallbackModels: [
    { id: "MiniMax-M3", name: "MiniMax M3" },
    { id: "MiniMax-M2.7", name: "MiniMax M2.7" },
  ],

  // from https://platform.minimax.io/docs/api-reference/text-openai-api#supported-models
  // M3 = 1M context, adaptive/disabled thinking; M2.7 = 204.8k, always-on thinking.
  contextWindows: [
    ["MiniMax-M3", 1_000_000],
    ["MiniMax-M2.7", 204_800],
    ["MiniMax-M2.5", 204_800],
    ["MiniMax-M2.1", 204_800],
    ["MiniMax-M2", 204_800],
  ],
};
