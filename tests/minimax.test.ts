import { describe, expect, test } from "bun:test";
import { computeModelCost } from "../src/stores/statusbar.js";
import { minimax } from "../src/core/llm/providers/minimax.js";
import { getCompatReasoningBody } from "../src/core/llm/compat-reasoning.js";
import type { AppConfig } from "../src/types/index.js";

function baseConfig(perf: Partial<AppConfig["performance"]> = {}): AppConfig {
  return {
    defaultModel: "",
    routerRules: [],
    editor: { command: "nvim", args: [] },
    theme: { name: "default" },
    performance: perf,
  } as unknown as AppConfig;
}

describe("MiniMax", () => {
  test("registers M3 and M2.7 as fallback models", () => {
    const ids = minimax.fallbackModels.map((m) => m.id);
    expect(ids).toContain("MiniMax-M3");
    expect(ids).toContain("MiniMax-M2.7");
  });

  test("declares M3 1M and M2.7 204.8k context windows", () => {
    const ctx = Object.fromEntries(minimax.contextWindows);
    expect(ctx["MiniMax-M3"]).toBe(1_000_000);
    expect(ctx["MiniMax-M2.7"]).toBe(204_800);
  });

  test("MiniMax is no longer a compat reasoning_effort body injector", () => {
    // After routing MiniMax through the Anthropic-compatible endpoint, the
    // OpenAI-compat reasoning_effort body must not be injected — it would
    // conflict with the Anthropic-shape thinking options.
    const cfg = baseConfig({ effort: "high" });
    expect(getCompatReasoningBody("minimax/MiniMax-M3", cfg)).toEqual({});
    expect(getCompatReasoningBody("minimax/MiniMax-M2.7", cfg)).toEqual({});
  });

  test("M3 cost = $0.6 in + $2.4 out per 1M", () => {
    const usage = { input: 1_000_000, output: 1_000_000, cacheRead: 0, cacheWrite: 0 };
    expect(computeModelCost("minimax/MiniMax-M3", usage)).toBeCloseTo(0.6 + 2.4, 4);
  });

  test("M2.7 cost = $0.3 in + $1.2 out per 1M", () => {
    const usage = { input: 1_000_000, output: 1_000_000, cacheRead: 0, cacheWrite: 0 };
    expect(computeModelCost("minimax/MiniMax-M2.7", usage)).toBeCloseTo(0.3 + 1.2, 4);
  });

  test("M3 cache read billed at 20% of input", () => {
    const cache = { input: 0, output: 0, cacheRead: 1_000_000, cacheWrite: 0 };
    expect(computeModelCost("minimax/MiniMax-M3", cache)).toBeCloseTo(0.12, 4);
  });
});
