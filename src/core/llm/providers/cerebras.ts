import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import { loadConfig } from "../../../config/index.js";
import { getProviderApiKey } from "../../secrets.js";
import { getCompatReasoningBody } from "../compat-reasoning.js";
import { createSessionFetchWrapper } from "./reasoning-fetch.js";
import type { ProviderDefinition, ProviderModelInfo } from "./types.js";

const BASE_URL = "https://api.cerebras.ai/v1";

/**
 * Cerebras Inference — OpenAI-compatible Chat Completions on wafer-scale hardware.
 *
 * Two upstream quirks worth knowing before touching this file:
 *
 * 1. The API rejects unknown request properties with a 400 `wrong_api_format`
 *    rather than ignoring them. It does not accept the OpenAI Responses-style
 *    `reasoning: { effort }` object nor DashScope's `enable_thinking`; both were
 *    confirmed to fail. Reasoning is controlled only through `reasoning_effort`,
 *    whose accepted values are `none | low | medium | high` — there is no
 *    `xhigh`/`max`. This provider deliberately stays out of the shared
 *    compatibility layers so nothing injects a shape Cerebras refuses; models
 *    run at their own defaults (`qwen-3.8-27b` → high, `gpt-oss-120b` → medium).
 *
 * 2. Reasoning is returned in a non-standard `message.reasoning` /
 *    `delta.reasoning` field (`reasoning_format: "parsed"`, the default). The
 *    OpenAI-compatible transport reads it and re-serialises it as
 *    `reasoning_content` on the next turn, which this API rejects with the same
 *    400 — so the request wrapper renames it back to `reasoning`, the field the
 *    API does accept on an assistant message. Without that, every turn that
 *    follows a tool call fails.
 *
 * Context windows and prices below come from the per-model docs (paid tier).
 */
export const cerebras: ProviderDefinition = {
  id: "cerebras",
  name: "Cerebras",
  envVar: "CEREBRAS_API_KEY",
  icon: "\uF2DB", // nf-fa-microchip U+F2DB
  secretKey: "cerebras-api-key",
  keyUrl: "cloud.cerebras.ai",
  asciiIcon: "CB",
  description: "Wafer-scale fast inference",

  createModel(modelId: string): LanguageModel {
    const apiKey = getProviderApiKey("CEREBRAS_API_KEY");
    if (!apiKey) {
      throw new Error("CEREBRAS_API_KEY is not set");
    }
    const reasoningBody = getCompatReasoningBody(`cerebras/${modelId}`, loadConfig());
    const requestFetch = createSessionFetchWrapper(reasoningBody, fetch, {
      renameReasoningContent: true,
    });
    const provider = createOpenAICompatible({
      name: "cerebras",
      baseURL: BASE_URL,
      apiKey,
      fetch: requestFetch as typeof fetch,
    });
    return provider.chatModel(modelId);
  },

  async fetchModels(): Promise<ProviderModelInfo[] | null> {
    const apiKey = getProviderApiKey("CEREBRAS_API_KEY");
    if (!apiKey) return null;
    const res = await fetch(`${BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`Cerebras API ${String(res.status)}`);
    const data = (await res.json()) as { data: { id: string }[] };
    return data.data.map((m) => ({ id: m.id, name: m.id }));
  },

  fallbackModels: [
    { id: "qwen-3.8-27b", name: "Qwen 3.8 27B" },
    { id: "gpt-oss-120b", name: "GPT OSS 120B" },
    { id: "gemma-4-31b", name: "Gemma 4 31B" },
  ],

  // https://inference-docs.cerebras.ai/models/overview — 65k free tier / 131k paid
  contextWindows: [
    ["qwen-3.8-27b", 131_072],
    ["gpt-oss-120b", 131_072],
    ["gemma-4-31b", 131_072],
    ["kimi-k2.7-code", 131_072],
  ],
};
