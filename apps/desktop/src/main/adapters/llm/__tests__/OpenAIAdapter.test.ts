/**
 * @vitest-environment node
 *
 * OpenAIAdapter Tests
 *
 * TDD Phase: Red (failing tests - implementation not yet created)
 *
 * Tests for AC-ADAPTER-001: OpenAIAdapter
 */

import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";

// Adapter to be implemented
import { OpenAIAdapter } from "../OpenAIAdapter";

// Types
import type { LLMChatRequestInput } from "@repo/shared/types/llm";
import type { StreamChunk } from "../types";

describe("OpenAIAdapter", () => {
  let adapter: OpenAIAdapter;

  beforeEach(() => {
    adapter = new OpenAIAdapter("sk-test-api-key");
  });

  describe("ADP-001: sendChat正常", () => {
    it("should return LLMChatResponse for valid request", async () => {
      // Given: Successful API response
      server.use(
        http.post("https://api.openai.com/v1/chat/completions", () => {
          return HttpResponse.json({
            choices: [
              {
                message: {
                  role: "assistant",
                  content: "Hello! How can I help?",
                },
                finish_reason: "stop",
              },
            ],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 15,
              total_tokens: 25,
            },
            model: "gpt-4o",
          });
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "openai",
        modelId: "gpt-4o",
        messages: [{ role: "user", content: "Hello" }],
      };

      // When
      const response = await adapter.sendChat(request);

      // Then
      expect(response.content).toBe("Hello! How can I help?");
      expect(response.model).toBe("gpt-4o");
      expect(response.usage).toEqual({
        promptTokens: 10,
        completionTokens: 15,
        totalTokens: 25,
      });
      expect(response.finishReason).toBe("stop");
    });

    it("should include system prompt in messages", async () => {
      let capturedBody: Record<string, unknown> = {};

      server.use(
        http.post(
          "https://api.openai.com/v1/chat/completions",
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
        providerId: "openai",
        modelId: "gpt-4o",
        messages: [{ role: "user", content: "Hello" }],
        systemPrompt: "You are a helpful assistant.",
      };

      await adapter.sendChat(request);

      expect(capturedBody.messages).toEqual([
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello" },
      ]);
    });

    it("should pass temperature and maxTokens", async () => {
      let capturedBody: Record<string, unknown> = {};

      server.use(
        http.post(
          "https://api.openai.com/v1/chat/completions",
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
        providerId: "openai",
        modelId: "gpt-4o",
        messages: [{ role: "user", content: "Hello" }],
        temperature: 0.5,
        maxTokens: 500,
      };

      await adapter.sendChat(request);

      expect(capturedBody.temperature).toBe(0.5);
      expect(capturedBody.max_tokens).toBe(500);
    });
  });

  describe("ADP-002: streamChat正常", () => {
    it("should yield chunks from SSE stream", async () => {
      // Given: SSE response
      server.use(
        http.post("https://api.openai.com/v1/chat/completions", () => {
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
                  'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
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
        providerId: "openai",
        modelId: "gpt-4o",
        messages: [{ role: "user", content: "Hi" }],
        stream: true,
      };

      // When
      const chunks: StreamChunk[] = [];
      for await (const chunk of adapter.streamChat(request)) {
        chunks.push(chunk);
      }

      // Then
      expect(chunks).toHaveLength(2);
      expect(chunks[0].delta?.content).toBe("Hello");
      expect(chunks[1].delta?.content).toBe(" world");
    });
  });

  describe("ADP-003: checkHealth正常", () => {
    it("should return connected status for successful health check", async () => {
      server.use(
        http.get("https://api.openai.com/v1/models", () => {
          return HttpResponse.json({ data: [{ id: "gpt-4o" }] });
        }),
      );

      const result = await adapter.checkHealth();

      expect(result.status).toBe("connected");
      expect(result.latency).toBeGreaterThanOrEqual(0);
      expect(result.checkedAt).toBeDefined();
    });
  });

  describe("ADP-004: 401エラーマッピング", () => {
    it("should map 401 to API_KEY_INVALID", async () => {
      server.use(
        http.post("https://api.openai.com/v1/chat/completions", () => {
          return HttpResponse.json(
            { error: { message: "Incorrect API key" } },
            { status: 401 },
          );
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "openai",
        modelId: "gpt-4o",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(adapter.sendChat(request)).rejects.toMatchObject({
        code: "API_KEY_INVALID",
        retryable: false,
      });
    });
  });

  describe("ADP-005: 429エラーマッピング", () => {
    it("should map 429 to RATE_LIMIT with retryAfterMs", async () => {
      // Use adapter with no retries for error tests
      const noRetryAdapter = new OpenAIAdapter("sk-test-api-key", {
        maxRetries: 0,
      });

      server.use(
        http.post("https://api.openai.com/v1/chat/completions", () => {
          return HttpResponse.json(
            { error: { message: "Rate limit exceeded" } },
            { status: 429, headers: { "Retry-After": "30" } },
          );
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "openai",
        modelId: "gpt-4o",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(noRetryAdapter.sendChat(request)).rejects.toMatchObject({
        code: "RATE_LIMIT",
        retryable: true,
        retryAfterMs: 30000,
      });
    });
  });

  describe("ADP-006: 500エラーマッピング", () => {
    it("should map 500 to SERVICE_UNAVAILABLE with retryable", async () => {
      // Use adapter with no retries for error tests
      const noRetryAdapter = new OpenAIAdapter("sk-test-api-key", {
        maxRetries: 0,
      });

      server.use(
        http.post("https://api.openai.com/v1/chat/completions", () => {
          return HttpResponse.json(
            { error: { message: "Internal server error" } },
            { status: 500 },
          );
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "openai",
        modelId: "gpt-4o",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(noRetryAdapter.sendChat(request)).rejects.toMatchObject({
        code: "SERVICE_UNAVAILABLE",
        retryable: true,
      });
    });
  });

  describe("ADP-007: ネットワークエラー", () => {
    it("should map fetch failure to NETWORK_ERROR", async () => {
      // Use adapter with no retries for error tests
      const noRetryAdapter = new OpenAIAdapter("sk-test-api-key", {
        maxRetries: 0,
      });

      server.use(
        http.post("https://api.openai.com/v1/chat/completions", () => {
          return HttpResponse.error();
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "openai",
        modelId: "gpt-4o",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(noRetryAdapter.sendChat(request)).rejects.toMatchObject({
        code: "NETWORK_ERROR",
        retryable: true,
      });
    });
  });

  describe("Provider ID", () => {
    it("should return 'openai' as providerId", () => {
      expect(adapter.providerId).toBe("openai");
    });
  });
});
