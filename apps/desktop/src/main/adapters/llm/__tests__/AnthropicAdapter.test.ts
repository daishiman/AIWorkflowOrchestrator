/**
 * @vitest-environment node
 *
 * AnthropicAdapter Tests
 *
 * TDD Phase: Red (failing tests - implementation not yet created)
 *
 * Tests for AC-ADAPTER-002: AnthropicAdapter
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";

// Adapter to be implemented
import { AnthropicAdapter } from "../AnthropicAdapter";

// Types
import type { LLMChatRequestInput } from "@repo/shared/types/llm";
import type { StreamChunk } from "../types";

describe("AnthropicAdapter", () => {
  let adapter: AnthropicAdapter;

  beforeEach(() => {
    adapter = new AnthropicAdapter("sk-ant-test-api-key");
  });

  afterEach(() => server.resetHandlers());

  describe("ADP-008: sendChat正常", () => {
    it("should return LLMChatResponse for valid request", async () => {
      server.use(
        http.post("https://api.anthropic.com/v1/messages", () => {
          return HttpResponse.json({
            content: [{ type: "text", text: "Hello! How can I assist you?" }],
            model: "claude-3-5-sonnet-20241022",
            stop_reason: "end_turn",
            usage: {
              input_tokens: 10,
              output_tokens: 15,
            },
          });
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet",
        messages: [{ role: "user", content: "Hello" }],
      };

      const response = await adapter.sendChat(request);

      expect(response.content).toBe("Hello! How can I assist you?");
      expect(response.model).toBe("claude-3-5-sonnet-20241022");
      expect(response.usage).toEqual({
        promptTokens: 10,
        completionTokens: 15,
        totalTokens: 25,
      });
      expect(response.finishReason).toBe("end_turn");
    });

    it("should set correct headers for Anthropic API", async () => {
      let capturedHeaders: Record<string, string | null> = {};

      server.use(
        http.post("https://api.anthropic.com/v1/messages", ({ request }) => {
          capturedHeaders = {
            "x-api-key": request.headers.get("x-api-key"),
            "anthropic-version": request.headers.get("anthropic-version"),
            "content-type": request.headers.get("content-type"),
          };
          return HttpResponse.json({
            content: [{ type: "text", text: "Response" }],
            usage: { input_tokens: 10, output_tokens: 5 },
          });
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet",
        messages: [{ role: "user", content: "Hello" }],
      };

      await adapter.sendChat(request);

      expect(capturedHeaders["x-api-key"]).toBe("sk-ant-test-api-key");
      expect(capturedHeaders["anthropic-version"]).toBe("2023-06-01");
      expect(capturedHeaders["content-type"]).toBe("application/json");
    });
  });

  describe("ADP-009: システムプロンプト変換", () => {
    it("should convert systemPrompt to Anthropic system parameter", async () => {
      let capturedBody: Record<string, unknown> = {};

      server.use(
        http.post(
          "https://api.anthropic.com/v1/messages",
          async ({ request }) => {
            capturedBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({
              content: [{ type: "text", text: "Response" }],
              usage: { input_tokens: 10, output_tokens: 5 },
            });
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet",
        messages: [{ role: "user", content: "Hello" }],
        systemPrompt: "You are a helpful coding assistant.",
      };

      await adapter.sendChat(request);

      // Anthropic uses 'system' as a top-level parameter, not in messages
      expect(capturedBody.system).toBe("You are a helpful coding assistant.");
      // Messages should not contain system message
      expect(capturedBody.messages).toEqual([
        { role: "user", content: "Hello" },
      ]);
    });
  });

  describe("ADP-010: エラーマッピング", () => {
    it("should map 401 to API_KEY_INVALID", async () => {
      server.use(
        http.post("https://api.anthropic.com/v1/messages", () => {
          return HttpResponse.json(
            {
              error: {
                type: "authentication_error",
                message: "Invalid API Key",
              },
            },
            { status: 401 },
          );
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(adapter.sendChat(request)).rejects.toMatchObject({
        code: "API_KEY_INVALID",
        retryable: false,
      });
    });

    it("should map 429 to RATE_LIMIT", async () => {
      // Use adapter with no retries for error tests
      const noRetryAdapter = new AnthropicAdapter("sk-ant-test-api-key", {
        maxRetries: 0,
      });

      server.use(
        http.post("https://api.anthropic.com/v1/messages", () => {
          return HttpResponse.json(
            {
              error: {
                type: "rate_limit_error",
                message: "Rate limit exceeded",
              },
            },
            { status: 429, headers: { "Retry-After": "60" } },
          );
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(noRetryAdapter.sendChat(request)).rejects.toMatchObject({
        code: "RATE_LIMIT",
        retryable: true,
        retryAfterMs: 60000,
      });
    });

    it("should map 500 to SERVICE_UNAVAILABLE", async () => {
      // Use adapter with no retries for error tests
      const noRetryAdapter = new AnthropicAdapter("sk-ant-test-api-key", {
        maxRetries: 0,
      });

      server.use(
        http.post("https://api.anthropic.com/v1/messages", () => {
          return HttpResponse.json(
            { error: { type: "api_error", message: "Internal error" } },
            { status: 500 },
          );
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(noRetryAdapter.sendChat(request)).rejects.toMatchObject({
        code: "SERVICE_UNAVAILABLE",
        retryable: true,
      });
    });

    it("should map network error to NETWORK_ERROR", async () => {
      // Use adapter with no retries for error tests
      const noRetryAdapter = new AnthropicAdapter("sk-ant-test-api-key", {
        maxRetries: 0,
      });

      server.use(
        http.post("https://api.anthropic.com/v1/messages", () => {
          return HttpResponse.error();
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet",
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
        http.post("https://api.anthropic.com/v1/messages", () => {
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(
                encoder.encode(
                  'data: {"type":"content_block_delta","delta":{"text":"Hello"}}\n\n',
                ),
              );
              controller.enqueue(
                encoder.encode(
                  'data: {"type":"content_block_delta","delta":{"text":" there"}}\n\n',
                ),
              );
              controller.enqueue(
                encoder.encode('data: {"type":"message_stop"}\n\n'),
              );
              controller.close();
            },
          });

          return new HttpResponse(stream, {
            headers: { "Content-Type": "text/event-stream" },
          });
        }),
      );

      const request: LLMChatRequestInput = {
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet",
        messages: [{ role: "user", content: "Hi" }],
        stream: true,
      };

      const chunks: StreamChunk[] = [];
      for await (const chunk of adapter.streamChat(request)) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].delta?.content).toBe("Hello");
    });
  });

  describe("checkHealth", () => {
    it("should return connected status for successful ping", async () => {
      server.use(
        http.post("https://api.anthropic.com/v1/messages", () => {
          return HttpResponse.json({
            content: [{ type: "text", text: "pong" }],
            usage: { input_tokens: 1, output_tokens: 1 },
          });
        }),
      );

      const result = await adapter.checkHealth();

      expect(result.status).toBe("connected");
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it("should return error status for failed ping", async () => {
      server.use(
        http.post("https://api.anthropic.com/v1/messages", () => {
          return HttpResponse.json(
            { error: { message: "Invalid API key" } },
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
    it("should return 'anthropic' as providerId", () => {
      expect(adapter.providerId).toBe("anthropic");
    });
  });
});
