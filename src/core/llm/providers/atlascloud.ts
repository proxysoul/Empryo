import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { getProviderApiKey } from "../../secrets.js";
import type { ProviderDefinition, ProviderModelInfo } from "./types.js";

const BASE_URL = "https://api.atlascloud.ai/v1";

interface AtlasCloudModel {
  id: string;
}

export const atlascloud: ProviderDefinition = {
  id: "atlascloud",
  name: "Atlas Cloud",
  envVar: "ATLASCLOUD_API_KEY",
  icon: "", // nf-fa-globe U+F0AC
  secretKey: "atlascloud-api-key",
  keyUrl: "atlascloud.ai",
  asciiIcon: "⊕",
  description: "Multi-provider gateway",
  grouped: true,

  createModel(modelId: string) {
    const apiKey = getProviderApiKey("ATLASCLOUD_API_KEY");
    if (!apiKey) {
      throw new Error("ATLASCLOUD_API_KEY is not set");
    }
    return createOpenAICompatible({
      name: "atlascloud",
      baseURL: BASE_URL,
      apiKey,
    })(modelId);
  },

  async fetchModels(): Promise<ProviderModelInfo[] | null> {
    const apiKey = getProviderApiKey("ATLASCLOUD_API_KEY");
    if (!apiKey) return null;
    const res = await fetch(`${BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`Atlas Cloud API ${String(res.status)}`);
    const data = (await res.json()) as { data: AtlasCloudModel[] };
    return data.data.map((m) => ({ id: m.id, name: m.id }));
  },

  fallbackModels: [
    { id: "openai/gpt-4.1-mini", name: "GPT-4.1 Mini" },
    { id: "openai/gpt-5.4-mini", name: "GPT-5.4 Mini" },
    { id: "anthropic/claude-sonnet-4.6", name: "Claude Sonnet 4.6" },
    { id: "deepseek-ai/deepseek-v3.2", name: "DeepSeek V3.2" },
    { id: "Qwen/Qwen3-235B-A22B-Instruct-2507", name: "Qwen3 235B Instruct" },
    { id: "qwen/qwen3.5-35b-a3b", name: "Qwen3.5 35B A3B" },
    { id: "zai-org/GLM-4.6", name: "GLM-4.6" },
    { id: "moonshotai/kimi-k2.5", name: "Kimi K2.5" },
    { id: "minimaxai/minimax-m2.5", name: "MiniMax M2.5" },
  ],

  contextWindows: [
    ["gpt-4.1-mini", 1_047_576],
    ["gpt-5.4-mini", 400_000],
    ["claude-sonnet-4.6", 200_000],
    ["deepseek-v3.2", 163_840],
    ["qwen3-235b-a22b-instruct-2507", 131_072],
    ["qwen3.5-35b-a3b", 262_144],
    ["glm-4.6", 202_752],
    ["kimi-k2.5", 262_144],
    ["minimax-m2.5", 196_608],
  ],
};
