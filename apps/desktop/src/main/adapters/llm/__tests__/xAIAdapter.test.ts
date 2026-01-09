/**
 * @vitest-environment node
 *
 * xAIAdapter Tests
 *
 * TDD Phase: Red (failing tests - implementation not yet created)
 *
 * Tests for AC-ADAPTER-004: xAIAdapter
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";

// Adapter to be implemented
import { xAIAdapter } from "../xAIAdapter";

// Types
import type { LLMChatRequestInput } from "@repo/shared/types/llm";
import type { StreamChunk } from "../types";

describe("xAIAdapter", () => {
  let adapter: xAIAdapter;

  beforeEach(() => {
    adapter = new xAIAdapter("xai-test-api-key");
  });

  afterEach(() => server.resetHandlers());

  describe("ADP-013: sendChat正常", () => {
    it("should return LLMChatResponse for valid request", async () => {
      server.use(
        http.post("https://api.x.ai/v1/chat/completions", () => {
          return HttpResponse.json({
            choices: [
              {
                message: { role: "assistant", content: "Greetings! I'm Grok." },
                finish_reason: "stop",
              },
            ],
            usage: {
              prompt_tokens: 8,
              completion_tokens: 12,
              total_tokens: 20,
            },
            model: "grok-1",
          });
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "xai",
        modelId: "grok-1",
        messages: [{ role: "user", content: "Hello" }],
      };

      const response = await adapter.sendChat(request);

      expect(response.content).toBe("Greetings! I'm Grok.");
      expect(response.model).toBe("grok-1");
      expect(response.usage).toEqual({
        promptTokens: 8,
        completionTokens: 12,
        totalTokens: 20,
      });
      expect(response.finishReason).toBe("stop");
    });

    it("should set correct authorization header", async () => {
      let capturedHeaders: Record<string, string | null> = {};

      server.use(
        http.post("https://api.x.ai/v1/chat/completions", ({ request }) => {
          capturedHeaders = {
            authorization: request.headers.get("authorization"),
            "content-type": request.headers.get("content-type"),
          };
          return HttpResponse.json({
            choices: [
              { message: { content: "Response" }, finish_reason: "stop" },
            ],
            usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 },
          });
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "xai",
        modelId: "grok-1",
        messages: [{ role: "user", content: "Hello" }],
      };

      await adapter.sendChat(request);

      expect(capturedHeaders["authorization"]).toBe("Bearer xai-test-api-key");
      expect(capturedHeaders["content-type"]).toBe("application/json");
    });

    it("should handle system prompt", async () => {
      let capturedBody: Record<string, unknown> = {};

      server.use(
        http.post(
          "https://api.x.ai/v1/chat/completions",
          async ({ request }) => {
            capturedBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({
              choices: [
                { message: { content: "Response" }, finish_reason: "stop" },
              ],
              usage: {
                prompt_tokens: 10,
                completion_tokens: 5,
                total_tokens: 15,
              },
            });
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "xai",
        modelId: "grok-1",
        messages: [{ role: "user", content: "Hello" }],
        systemPrompt: "You are Grok, a witty AI.",
      };

      await adapter.sendChat(request);

      // xAI uses OpenAI-compatible format
      expect(capturedBody.messages).toEqual([
        { role: "system", content: "You are Grok, a witty AI." },
        { role: "user", content: "Hello" },
      ]);
    });

    it("should pass temperature and maxTokens", async () => {
      let capturedBody: Record<string, unknown> = {};

      server.use(
        http.post(
          "https://api.x.ai/v1/chat/completions",
          async ({ request }) => {
            capturedBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({
              choices: [
                { message: { content: "Response" }, finish_reason: "stop" },
              ],
              usage: {
                prompt_tokens: 5,
                completion_tokens: 5,
                total_tokens: 10,
              },
            });
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "xai",
        modelId: "grok-1",
        messages: [{ role: "user", content: "Hello" }],
        temperature: 0.9,
        maxTokens: 2000,
      };

      await adapter.sendChat(request);

      expect(capturedBody.temperature).toBe(0.9);
      expect(capturedBody.max_tokens).toBe(2000);
    });
  });

  describe("Error Mapping", () => {
    it("should map 401 to API_KEY_INVALID", async () => {
      server.use(
        http.post("https://api.x.ai/v1/chat/completions", () => {
          return HttpResponse.json(
            { error: { message: "Invalid API key" } },
            { status: 401 },
          );
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "xai",
        modelId: "grok-1",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(adapter.sendChat(request)).rejects.toMatchObject({
        code: "API_KEY_INVALID",
        retryable: false,
      });
    });

    it("should map 429 to RATE_LIMIT", async () => {
      // Use adapter with no retries for error tests
      const noRetryAdapter = new xAIAdapter("xai-test-api-key", {
        maxRetries: 0,
      });

      server.use(
        http.post("https://api.x.ai/v1/chat/completions", () => {
          return HttpResponse.json(
            { error: { message: "Rate limit exceeded" } },
            { status: 429, headers: { "Retry-After": "45" } },
          );
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "xai",
        modelId: "grok-1",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(noRetryAdapter.sendChat(request)).rejects.toMatchObject({
        code: "RATE_LIMIT",
        retryable: true,
        retryAfterMs: 45000,
      });
    });

    it("should map 500 to SERVICE_UNAVAILABLE", async () => {
      // Use adapter with no retries for error tests
      const noRetryAdapter = new xAIAdapter("xai-test-api-key", {
        maxRetries: 0,
      });

      server.use(
        http.post("https://api.x.ai/v1/chat/completions", () => {
          return HttpResponse.json(
            { error: { message: "Internal server error" } },
            { status: 500 },
          );
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "xai",
        modelId: "grok-1",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(noRetryAdapter.sendChat(request)).rejects.toMatchObject({
        code: "SERVICE_UNAVAILABLE",
        retryable: true,
      });
    });

    it("should map network error to NETWORK_ERROR", async () => {
      // Use adapter with no retries for error tests
      const noRetryAdapter = new xAIAdapter("xai-test-api-key", {
        maxRetries: 0,
      });

      server.use(
        http.post("https://api.x.ai/v1/chat/completions", () => {
          return HttpResponse.error();
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "xai",
        modelId: "grok-1",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(noRetryAdapter.sendChat(request)).rejects.toMatchObject({
        code: "NETWORK_ERROR",
        retryable: true,
      });
    });
  });

  describe("streamChat", () => {
    it("should yield chunks from SSE stream", async () => {
      server.use(
        http.post("https://api.x.ai/v1/chat/completions", () => {
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(
                encoder.encode(
                  'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
                ),
              );
              controller.enqueue(
                encoder.encode(
                  'data: {"choices":[{"delta":{"content":" from Grok"}}]}\n\n',
                ),
              );
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            },
          });

          return new HttpResponse(stream, {
            headers: { "Content-Type": "text/event-stream" },
          });
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "xai",
        modelId: "grok-1",
        messages: [{ role: "user", content: "Hi" }],
        stream: true,
      };

      const chunks: StreamChunk[] = [];
      for await (const chunk of adapter.streamChat(request)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2);
      expect(chunks[0].delta?.content).toBe("Hello");
      expect(chunks[1].delta?.content).toBe(" from Grok");
    });
  });

  describe("checkHealth", () => {
    it("should return connected status for successful API call", async () => {
      server.use(
        http.get("https://api.x.ai/v1/models", () => {
          return HttpResponse.json({ data: [{ id: "grok-1" }] });
        }),
      );

      const result = await adapter.checkHealth();

      expect(result.status).toBe("connected");
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it("should return error status for failed API call", async () => {
      server.use(
        http.get("https://api.x.ai/v1/models", () => {
          return HttpResponse.json(
            { error: { message: "Unauthorized" } },
            { status: 401 },
          );
        }),
      );

      const result = await adapter.checkHealth();

      expect(result.status).toBe("error");
      expect(result.errorMessage).toBeDefined();
    });
  });

  describe("Provider ID", () => {
    it("should return 'xai' as providerId", () => {
      expect(adapter.providerId).toBe("xai");
    });
  });
});
