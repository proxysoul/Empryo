import { describe, expect, test } from "bun:test";
import { cerebras } from "../src/core/llm/providers/cerebras.js";
import { createSessionFetchWrapper } from "../src/core/llm/providers/reasoning-fetch.js";
import { getAllProviders, getProvider } from "../src/core/llm/providers/index.js";

// ── Provider registration ─────────────────────────────────────────

describe("cerebras provider", () => {
	test("is registered as a builtin provider", () => {
		expect(getProvider("cerebras")).toBeDefined();
		expect(getProvider("cerebras")!.custom).toBeUndefined();
	});

	test("has required fields", () => {
		expect(cerebras.id).toBe("cerebras");
		expect(cerebras.name).toBe("Cerebras");
		expect(cerebras.envVar).toBe("CEREBRAS_API_KEY");
		expect(cerebras.secretKey).toBe("cerebras-api-key");
		expect(cerebras.icon).toBeTruthy();
		expect(cerebras.asciiIcon).toBeTruthy();
		expect(typeof cerebras.createModel).toBe("function");
		expect(typeof cerebras.fetchModels).toBe("function");
		expect(cerebras.fallbackModels.length).toBeGreaterThan(0);
		expect(cerebras.contextWindows.length).toBeGreaterThan(0);
		expect(getAllProviders().filter((p) => !p.custom)).toContain(cerebras);
	});
});

// ── Reasoning field renaming ──────────────────────────────────────
//
// Cerebras rejects `reasoning_content` on an assistant message with a 400
// `wrong_api_format` instead of ignoring it, but accepts the same string under
// `reasoning`. The OpenAI-compatible SDK round-trips the former, so the request
// wrapper rewrites it on the way out. Everything below locks that contract in,
// including that providers which REQUIRE `reasoning_content` are untouched.

function captureBody(): {
	seen: Record<string, unknown>[];
	raw: string[];
	fetchImpl: typeof fetch;
} {
	const seen: Record<string, unknown>[] = [];
	const raw: string[] = [];
	const fetchImpl = ((_input: unknown, init?: RequestInit) => {
		const body = String(init?.body ?? "");
		raw.push(body);
		try {
			seen.push(JSON.parse(body) as Record<string, unknown>);
		} catch {}
		return Promise.resolve(new Response("{}", { status: 200 }));
	}) as unknown as typeof fetch;
	return { seen, raw, fetchImpl };
}

const bodyWithHistory = () =>
	JSON.stringify({
		model: "gpt-oss-120b",
		messages: [
			{ role: "user", content: "run it" },
			{ role: "assistant", content: null, reasoning_content: "thought so far" },
			{ role: "tool", tool_call_id: "c1", content: "ok" },
		],
	});

describe("createSessionFetchWrapper — renameReasoningContent", () => {
	test("off by default: reasoning_content reaches the wire untouched", async () => {
		const { seen, fetchImpl } = captureBody();
		const wrapped = createSessionFetchWrapper({}, fetchImpl);
		await wrapped("https://example.test/v1/chat/completions", {
			method: "POST",
			body: bodyWithHistory(),
		});
		const messages = seen[0].messages as Record<string, unknown>[];
		expect(messages[1].reasoning_content).toBe("thought so far");
		expect(messages[1].reasoning).toBeUndefined();
	});

	test("on: renames reasoning_content to reasoning and keeps the value", async () => {
		const { seen, fetchImpl } = captureBody();
		const wrapped = createSessionFetchWrapper({}, fetchImpl, {
			renameReasoningContent: true,
		});
		await wrapped("https://example.test/v1/chat/completions", {
			method: "POST",
			body: bodyWithHistory(),
		});
		const messages = seen[0].messages as Record<string, unknown>[];
		expect(messages[1].reasoning_content).toBeUndefined();
		expect(messages[1].reasoning).toBe("thought so far");
	});

	test("on: an existing reasoning field wins over reasoning_content", async () => {
		const { seen, fetchImpl } = captureBody();
		const wrapped = createSessionFetchWrapper({}, fetchImpl, {
			renameReasoningContent: true,
		});
		await wrapped("https://example.test/v1/chat/completions", {
			method: "POST",
			body: JSON.stringify({
				messages: [{ role: "assistant", reasoning: "native", reasoning_content: "stale" }],
			}),
		});
		const messages = seen[0].messages as Record<string, unknown>[];
		expect(messages[0].reasoning).toBe("native");
		expect(messages[0].reasoning_content).toBeUndefined();
	});

	test("on: still merges the reasoning body it was given", async () => {
		const { seen, fetchImpl } = captureBody();
		const wrapped = createSessionFetchWrapper({ reasoning_effort: "high" }, fetchImpl, {
			renameReasoningContent: true,
		});
		await wrapped("https://example.test/v1/chat/completions", {
			method: "POST",
			body: JSON.stringify({ messages: [] }),
		});
		expect(seen[0].reasoning_effort).toBe("high");
	});

	test("non-JSON bodies pass through verbatim", async () => {
		const { raw, fetchImpl } = captureBody();
		const wrapped = createSessionFetchWrapper({}, fetchImpl, {
			renameReasoningContent: true,
		});
		await wrapped("https://example.test/v1/chat/completions", {
			method: "POST",
			body: "not json at all",
		});
		expect(raw[0]).toBe("not json at all");
	});
});
