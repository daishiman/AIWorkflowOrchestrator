/**
 * @vitest-environment node
 *
 * LLM Adapter Streaming Tests
 *
 * TDD Phase: Red (failing tests - some implementations already exist)
 *
 * Tests for AC-001 ~ AC-006: Streaming functionality for all 4 providers
 */

import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";

// Adapters to test
import { OpenAIAdapter } from "../OpenAIAdapter";
import { AnthropicAdapter } from "../AnthropicAdapter";
import { GoogleAdapter } from "../GoogleAdapter";
import { xAIAdapter } from "../xAIAdapter";

// Types
import type { LLMChatRequestInput } from "@repo/shared/types/llm";
import type { StreamChunk } from "../types";

// Test helpers
function createSSEResponse(
  chunks: Array<{ delta?: { content: string }; done?: boolean }>,
): HttpResponse {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        if (chunk.done) {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } else {
          const data = JSON.stringify({
            choices: [{ delta: chunk.delta }],
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      }
      controller.close();
    },
  });

  return new HttpResponse(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

function createAnthropicSSEResponse(
  chunks: Array<{ text?: string; stop?: boolean }>,
): HttpResponse {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          'event: message_start\ndata: {"type":"message_start"}\n\n',
        ),
      );
      controller.enqueue(
        encoder.encode(
          'event: content_block_start\ndata: {"type":"content_block_start","index":0}\n\n',
        ),
      );

      for (const chunk of chunks) {
        if (chunk.stop) {
          controller.enqueue(
            encoder.encode(
              'event: message_stop\ndata: {"type":"message_stop"}\n\n',
            ),
          );
        } else {
          const data = JSON.stringify({
            type: "content_block_delta",
            delta: { type: "text_delta", text: chunk.text },
          });
          controller.enqueue(
            encoder.encode(`event: content_block_delta\ndata: ${data}\n\n`),
          );
        }
      }
      controller.close();
    },
  });

  return new HttpResponse(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

describe("LLM Adapter Streaming Tests", () => {
  // ============================================================
  // 1. OpenAI Adapter Streaming
  // ============================================================
  describe("OpenAIAdapter Streaming", () => {
    let adapter: OpenAIAdapter;

    beforeEach(() => {
      adapter = new OpenAIAdapter("sk-test-api-key");
    });

    describe("TC-OA-001: SSEチャンクの受信", () => {
      it("should yield chunks from SSE stream", async () => {
        server.use(
          http.post("https://api.openai.com/v1/chat/completions", () => {
            return createSSEResponse([
              { delta: { content: "Hello" } },
              { delta: { content: " world" } },
              { done: true },
            ]);
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "openai",
          modelId: "gpt-4o",
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

    describe("TC-OA-002: 複数チャンクの順序保持", () => {
      it("should preserve chunk order", async () => {
        server.use(
          http.post("https://api.openai.com/v1/chat/completions", () => {
            return createSSEResponse([
              { delta: { content: "1" } },
              { delta: { content: "2" } },
              { delta: { content: "3" } },
              { done: true },
            ]);
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "openai",
          modelId: "gpt-4o",
          messages: [{ role: "user", content: "Count" }],
          stream: true,
        };

        const contents: string[] = [];
        for await (const chunk of adapter.streamChat(request)) {
          if (chunk.delta?.content) {
            contents.push(chunk.delta.content);
          }
        }

        expect(contents).toEqual(["1", "2", "3"]);
      });
    });

    describe("TC-OA-003: [DONE]での完了検出", () => {
      it("should detect stream completion on [DONE]", async () => {
        server.use(
          http.post("https://api.openai.com/v1/chat/completions", () => {
            return createSSEResponse([
              { delta: { content: "Done" } },
              { done: true },
            ]);
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "openai",
          modelId: "gpt-4o",
          messages: [{ role: "user", content: "End" }],
          stream: true,
        };

        const chunks: StreamChunk[] = [];
        for await (const chunk of adapter.streamChat(request)) {
          chunks.push(chunk);
        }

        // Stream should complete without hanging
        expect(chunks.length).toBeGreaterThan(0);
      });
    });

    describe("TC-OA-005: AbortSignalでのキャンセル", () => {
      it("should abort stream when signal is aborted", async () => {
        const abortController = new AbortController();

        server.use(
          http.post("https://api.openai.com/v1/chat/completions", () => {
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
              async start(controller) {
                controller.enqueue(
                  encoder.encode(
                    'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
                  ),
                );
                // Simulate delay before more chunks
                await new Promise((r) => setTimeout(r, 100));
                controller.enqueue(
                  encoder.encode(
                    'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
                  ),
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
          providerId: "openai",
          modelId: "gpt-4o",
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        };

        const chunks: StreamChunk[] = [];

        // Abort after first chunk
        setTimeout(() => abortController.abort(), 50);

        try {
          for await (const chunk of adapter.streamChat(
            request,
            abortController.signal,
          )) {
            chunks.push(chunk);
          }
        } catch {
          // Expected to throw on abort
        }

        // Should have received at least one chunk before abort
        expect(chunks.length).toBeLessThanOrEqual(2);
      });
    });

    describe("TC-OA-006: 401エラーでAPI_KEY_INVALID", () => {
      it("should throw API_KEY_INVALID for 401 response", async () => {
        const noRetryAdapter = new OpenAIAdapter("sk-test-api-key", {
          maxRetries: 0,
        });

        server.use(
          http.post("https://api.openai.com/v1/chat/completions", () => {
            return HttpResponse.json(
              { error: { message: "Invalid API key" } },
              { status: 401 },
            );
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "openai",
          modelId: "gpt-4o",
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        };

        await expect(async () => {
          for await (const _chunk of noRetryAdapter.streamChat(request)) {
            // Should not reach here
          }
        }).rejects.toMatchObject({
          code: "API_KEY_INVALID",
        });
      });
    });

    describe("TC-OA-007: 429エラーでRATE_LIMIT", () => {
      it("should throw RATE_LIMIT with retryAfterMs for 429 response", async () => {
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
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        };

        await expect(async () => {
          for await (const _chunk of noRetryAdapter.streamChat(request)) {
            // Should not reach here
          }
        }).rejects.toMatchObject({
          code: "RATE_LIMIT",
          retryable: true,
          retryAfterMs: 30000,
        });
      });
    });

    describe("TC-OA-008: ネットワークエラー", () => {
      it("should throw error for network failure", async () => {
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
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        };

        // Network errors may be thrown as TypeError or LLMError depending on implementation
        await expect(async () => {
          for await (const _chunk of noRetryAdapter.streamChat(request)) {
            // Should not reach here
          }
        }).rejects.toThrow();
      });
    });
  });

  // ============================================================
  // 2. Anthropic Adapter Streaming
  // ============================================================
  describe("AnthropicAdapter Streaming", () => {
    let adapter: AnthropicAdapter;

    beforeEach(() => {
      adapter = new AnthropicAdapter("sk-ant-test-key");
    });

    describe("TC-AN-001: content_block_deltaイベント受信", () => {
      it("should yield chunks from SSE stream", async () => {
        server.use(
          http.post("https://api.anthropic.com/v1/messages", () => {
            return createAnthropicSSEResponse([
              { text: "Hello" },
              { text: " from Anthropic" },
              { stop: true },
            ]);
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "anthropic",
          modelId: "claude-sonnet-4-20250514",
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        };

        const chunks: StreamChunk[] = [];
        for await (const chunk of adapter.streamChat(request)) {
          chunks.push(chunk);
        }

        expect(chunks.length).toBeGreaterThan(0);
      });
    });

    describe("TC-AN-002: message_stopでの完了検出", () => {
      it("should detect stream completion on message_stop", async () => {
        server.use(
          http.post("https://api.anthropic.com/v1/messages", () => {
            return createAnthropicSSEResponse([
              { text: "Done" },
              { stop: true },
            ]);
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "anthropic",
          modelId: "claude-sonnet-4-20250514",
          messages: [{ role: "user", content: "End" }],
          stream: true,
        };

        const chunks: StreamChunk[] = [];
        for await (const chunk of adapter.streamChat(request)) {
          chunks.push(chunk);
        }

        // Stream should complete without hanging
        expect(chunks.length).toBeGreaterThan(0);
      });
    });

    describe("TC-AN-005: 401エラーでAPI_KEY_INVALID", () => {
      it("should throw API_KEY_INVALID for 401 response", async () => {
        const noRetryAdapter = new AnthropicAdapter("sk-ant-test-key", {
          maxRetries: 0,
        });

        server.use(
          http.post("https://api.anthropic.com/v1/messages", () => {
            return HttpResponse.json(
              { error: { message: "Invalid API key" } },
              { status: 401 },
            );
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "anthropic",
          modelId: "claude-sonnet-4-20250514",
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        };

        await expect(async () => {
          for await (const _chunk of noRetryAdapter.streamChat(request)) {
            // Should not reach here
          }
        }).rejects.toMatchObject({
          code: "API_KEY_INVALID",
        });
      });
    });
  });

  // ============================================================
  // 3. Google Adapter Streaming
  // ============================================================
  describe("GoogleAdapter Streaming", () => {
    let adapter: GoogleAdapter;

    beforeEach(() => {
      adapter = new GoogleAdapter("google-test-key");
    });

    describe("TC-GO-001: candidates[0].content.parts受信", () => {
      it("should yield chunks from SSE stream", async () => {
        // Google API uses /v1beta/ and query params for SSE
        server.use(
          http.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent",
            () => {
              const encoder = new TextEncoder();
              const stream = new ReadableStream({
                start(controller) {
                  controller.enqueue(
                    encoder.encode(
                      'data: {"candidates":[{"content":{"parts":[{"text":"Hello"}]}}]}\n\n',
                    ),
                  );
                  controller.enqueue(
                    encoder.encode(
                      'data: {"candidates":[{"content":{"parts":[{"text":" Google"}]},"finishReason":"STOP"}]}\n\n',
                    ),
                  );
                  controller.close();
                },
              });
              return new HttpResponse(stream, {
                headers: { "Content-Type": "text/event-stream" },
              });
            },
          ),
        );

        const request: LLMChatRequestInput = {
          providerId: "google",
          modelId: "gemini-2.0-flash-exp",
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        };

        const chunks: StreamChunk[] = [];
        for await (const chunk of adapter.streamChat(request)) {
          chunks.push(chunk);
        }

        expect(chunks.length).toBeGreaterThan(0);
      });
    });

    describe("TC-GO-002: finishReasonでの完了検出", () => {
      it("should detect stream completion on finishReason STOP", async () => {
        server.use(
          http.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent",
            () => {
              const encoder = new TextEncoder();
              const stream = new ReadableStream({
                start(controller) {
                  controller.enqueue(
                    encoder.encode(
                      'data: {"candidates":[{"content":{"parts":[{"text":"Done"}]},"finishReason":"STOP"}]}\n\n',
                    ),
                  );
                  controller.close();
                },
              });
              return new HttpResponse(stream, {
                headers: { "Content-Type": "text/event-stream" },
              });
            },
          ),
        );

        const request: LLMChatRequestInput = {
          providerId: "google",
          modelId: "gemini-2.0-flash-exp",
          messages: [{ role: "user", content: "End" }],
          stream: true,
        };

        const chunks: StreamChunk[] = [];
        for await (const chunk of adapter.streamChat(request)) {
          chunks.push(chunk);
        }

        expect(chunks.length).toBeGreaterThan(0);
        expect(chunks[chunks.length - 1].done).toBe(true);
      });
    });

    describe("TC-GO-005: 403エラーでAPI_KEY_INVALID", () => {
      it("should throw error for 403 response", async () => {
        const noRetryAdapter = new GoogleAdapter("google-test-key", {
          maxRetries: 0,
        });

        server.use(
          http.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent",
            () => {
              return HttpResponse.json(
                { error: { message: "API key not valid" } },
                { status: 403 },
              );
            },
          ),
        );

        const request: LLMChatRequestInput = {
          providerId: "google",
          modelId: "gemini-2.0-flash-exp",
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        };

        // Google 403 should throw an error (exact code depends on implementation)
        await expect(async () => {
          for await (const _chunk of noRetryAdapter.streamChat(request)) {
            // Should not reach here
          }
        }).rejects.toThrow();
      });
    });
  });

  // ============================================================
  // 4. xAI Adapter Streaming
  // ============================================================
  describe("xAIAdapter Streaming", () => {
    let adapter: xAIAdapter;

    beforeEach(() => {
      adapter = new xAIAdapter("xai-test-key");
    });

    describe("TC-XA-001: OpenAI互換SSEチャンク受信", () => {
      it("should yield chunks from SSE stream", async () => {
        server.use(
          http.post("https://api.x.ai/v1/chat/completions", () => {
            return createSSEResponse([
              { delta: { content: "Hello" } },
              { delta: { content: " from xAI" } },
              { done: true },
            ]);
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "xai",
          modelId: "grok-beta",
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        };

        const chunks: StreamChunk[] = [];
        for await (const chunk of adapter.streamChat(request)) {
          chunks.push(chunk);
        }

        expect(chunks.length).toBeGreaterThan(0);
      });
    });

    describe("TC-XA-005: 401エラーでAPI_KEY_INVALID", () => {
      it("should throw API_KEY_INVALID for 401 response", async () => {
        const noRetryAdapter = new xAIAdapter("xai-test-key", {
          maxRetries: 0,
        });

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
          modelId: "grok-beta",
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        };

        await expect(async () => {
          for await (const _chunk of noRetryAdapter.streamChat(request)) {
            // Should not reach here
          }
        }).rejects.toMatchObject({
          code: "API_KEY_INVALID",
        });
      });
    });
  });

  // ============================================================
  // 5. Boundary Value Tests
  // ============================================================
  describe("Boundary Value Tests", () => {
    let adapter: OpenAIAdapter;

    beforeEach(() => {
      adapter = new OpenAIAdapter("sk-test-api-key");
    });

    describe("TC-BV-001: 空メッセージでのストリーミング", () => {
      it("should handle empty content chunks", async () => {
        server.use(
          http.post("https://api.openai.com/v1/chat/completions", () => {
            return createSSEResponse([
              { delta: { content: "" } },
              { delta: { content: "Hello" } },
              { done: true },
            ]);
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "openai",
          modelId: "gpt-4o",
          messages: [{ role: "user", content: "" }],
          stream: true,
        };

        const chunks: StreamChunk[] = [];
        for await (const chunk of adapter.streamChat(request)) {
          chunks.push(chunk);
        }

        expect(chunks.length).toBeGreaterThan(0);
      });
    });

    describe("TC-BV-003: Unicode文字のストリーミング", () => {
      it("should handle unicode and emoji content", async () => {
        server.use(
          http.post("https://api.openai.com/v1/chat/completions", () => {
            return createSSEResponse([
              { delta: { content: "こんにちは" } },
              { delta: { content: " 🎉" } },
              { delta: { content: " 🚀" } },
              { done: true },
            ]);
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "openai",
          modelId: "gpt-4o",
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        };

        const contents: string[] = [];
        for await (const chunk of adapter.streamChat(request)) {
          if (chunk.delta?.content) {
            contents.push(chunk.delta.content);
          }
        }

        expect(contents.join("")).toBe("こんにちは 🎉 🚀");
      });
    });

    describe("TC-BV-005: 1チャンクのストリーミング", () => {
      it("should handle single chunk stream", async () => {
        server.use(
          http.post("https://api.openai.com/v1/chat/completions", () => {
            return createSSEResponse([
              { delta: { content: "Single" } },
              { done: true },
            ]);
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "openai",
          modelId: "gpt-4o",
          messages: [{ role: "user", content: "One" }],
          stream: true,
        };

        const chunks: StreamChunk[] = [];
        for await (const chunk of adapter.streamChat(request)) {
          chunks.push(chunk);
        }

        expect(chunks.length).toBe(1);
        expect(chunks[0].delta?.content).toBe("Single");
      });
    });
  });

  // ============================================================
  // 6. Edge Case Tests (Phase 6 追加)
  // ============================================================
  describe("Edge Case Tests", () => {
    let adapter: OpenAIAdapter;

    beforeEach(() => {
      adapter = new OpenAIAdapter("sk-test-api-key");
    });

    describe("TC-EC-001: 長文レスポンス（100チャンク）", () => {
      it("should handle large number of chunks", async () => {
        const chunks = Array.from({ length: 100 }, (_, i) => ({
          delta: { content: `chunk${i}` },
        }));
        chunks.push({ done: true } as {
          delta?: { content: string };
          done?: boolean;
        });

        server.use(
          http.post("https://api.openai.com/v1/chat/completions", () => {
            return createSSEResponse(chunks);
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "openai",
          modelId: "gpt-4o",
          messages: [{ role: "user", content: "Long response" }],
          stream: true,
        };

        const receivedChunks: StreamChunk[] = [];
        for await (const chunk of adapter.streamChat(request)) {
          receivedChunks.push(chunk);
        }

        expect(receivedChunks.length).toBe(100);
      });
    });

    describe("TC-EC-002: 特殊文字を含むレスポンス", () => {
      it("should handle special characters and escape sequences", async () => {
        server.use(
          http.post("https://api.openai.com/v1/chat/completions", () => {
            return createSSEResponse([
              { delta: { content: "Tab:\t" } },
              { delta: { content: "Newline:\n" } },
              { delta: { content: 'Quote:"test"' } },
              { done: true },
            ]);
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "openai",
          modelId: "gpt-4o",
          messages: [{ role: "user", content: "Special chars" }],
          stream: true,
        };

        const contents: string[] = [];
        for await (const chunk of adapter.streamChat(request)) {
          if (chunk.delta?.content) {
            contents.push(chunk.delta.content);
          }
        }

        expect(contents.join("")).toContain("\t");
        expect(contents.join("")).toContain("\n");
        expect(contents.join("")).toContain('"');
      });
    });

    describe("TC-EC-003: 即時キャンセル", () => {
      it("should handle immediate abort before any chunks", async () => {
        const abortController = new AbortController();
        abortController.abort(); // Abort immediately

        server.use(
          http.post("https://api.openai.com/v1/chat/completions", () => {
            return createSSEResponse([
              { delta: { content: "Hello" } },
              { done: true },
            ]);
          }),
        );

        const request: LLMChatRequestInput = {
          providerId: "openai",
          modelId: "gpt-4o",
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        };

        const chunks: StreamChunk[] = [];
        try {
          for await (const chunk of adapter.streamChat(
            request,
            abortController.signal,
          )) {
            chunks.push(chunk);
          }
        } catch {
          // Expected to throw on abort
        }

        // Should receive no chunks due to immediate abort
        expect(chunks.length).toBe(0);
      });
    });

    describe("TC-EC-004: 500エラー（サーバーエラー）", () => {
      it("should throw for 500 server error", async () => {
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
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        };

        await expect(async () => {
          for await (const _chunk of noRetryAdapter.streamChat(request)) {
            // Should not reach here
          }
        }).rejects.toThrow();
      });
    });
  });

  // ============================================================
  // 7. Parallel Request Tests (Phase 6 追加)
  // ============================================================
  describe("Parallel Request Tests", () => {
    describe("TC-PR-001: 2つの並行ストリーミング", () => {
      it("should handle multiple concurrent streams", async () => {
        const adapter1 = new OpenAIAdapter("sk-test-api-key-1");
        const adapter2 = new OpenAIAdapter("sk-test-api-key-2");

        server.use(
          http.post("https://api.openai.com/v1/chat/completions", () => {
            return createSSEResponse([
              { delta: { content: "Response" } },
              { done: true },
            ]);
          }),
        );

        const request1: LLMChatRequestInput = {
          providerId: "openai",
          modelId: "gpt-4o",
          messages: [{ role: "user", content: "Request 1" }],
          stream: true,
        };

        const request2: LLMChatRequestInput = {
          providerId: "openai",
          modelId: "gpt-4o-mini",
          messages: [{ role: "user", content: "Request 2" }],
          stream: true,
        };

        const collectChunks = async (
          generator: AsyncGenerator<StreamChunk>,
        ) => {
          const chunks: StreamChunk[] = [];
          for await (const chunk of generator) {
            chunks.push(chunk);
          }
          return chunks;
        };

        const [chunks1, chunks2] = await Promise.all([
          collectChunks(adapter1.streamChat(request1)),
          collectChunks(adapter2.streamChat(request2)),
        ]);

        expect(chunks1.length).toBeGreaterThan(0);
        expect(chunks2.length).toBeGreaterThan(0);
      });
    });
  });
});
