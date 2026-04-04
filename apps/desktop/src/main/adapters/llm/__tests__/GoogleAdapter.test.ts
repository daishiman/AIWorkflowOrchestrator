/**
 * @vitest-environment node
 *
 * GoogleAdapter Tests
 *
 * TDD Phase: Red (failing tests - implementation not yet created)
 *
 * Tests for AC-ADAPTER-003: GoogleAdapter
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";

// Adapter to be implemented
import { GoogleAdapter } from "../GoogleAdapter";

// Types
import type { LLMChatRequestInput } from "@repo/shared/types/llm";
import type { StreamChunk } from "../types";

describe("GoogleAdapter", () => {
  let adapter: GoogleAdapter;

  beforeEach(() => {
    adapter = new GoogleAdapter("test-google-api-key");
  });

  afterEach(() => server.resetHandlers());

  describe("ADP-011: sendChat正常", () => {
    it("should return LLMChatResponse for valid request", async () => {
      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent",
          () => {
            return HttpResponse.json({
              candidates: [
                {
                  content: {
                    parts: [{ text: "Hello! How can I help you today?" }],
                    role: "model",
                  },
                  finishReason: "STOP",
                },
              ],
              usageMetadata: {
                promptTokenCount: 10,
                candidatesTokenCount: 15,
                totalTokenCount: 25,
              },
            });
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "google",
        modelId: "gemini-3.1-pro-preview",
        messages: [{ role: "user", content: "Hello" }],
      };

      const response = await adapter.sendChat(request);

      expect(response.content).toBe("Hello! How can I help you today?");
      expect(response.usage).toEqual({
        promptTokens: 10,
        completionTokens: 15,
        totalTokens: 25,
      });
      expect(response.finishReason).toBe("STOP");
    });

    it("should include API key in query parameter", async () => {
      let capturedUrl: URL = new URL("http://localhost");

      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          ({ request }) => {
            capturedUrl = new URL(request.url);
            return HttpResponse.json({
              candidates: [
                {
                  content: { parts: [{ text: "Response" }] },
                  finishReason: "STOP",
                },
              ],
              usageMetadata: {
                promptTokenCount: 5,
                candidatesTokenCount: 5,
                totalTokenCount: 10,
              },
            });
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "google",
        modelId: "gemini-3.1-pro-preview",
        messages: [{ role: "user", content: "Hello" }],
      };

      await adapter.sendChat(request);

      expect(capturedUrl.searchParams.get("key")).toBe("test-google-api-key");
    });
  });

  describe("ADP-012: リクエスト形式変換", () => {
    it("should convert LLMChatRequest to Gemini format", async () => {
      let capturedBody: Record<string, unknown> = {};

      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          async ({ request }) => {
            capturedBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({
              candidates: [
                {
                  content: { parts: [{ text: "Response" }] },
                  finishReason: "STOP",
                },
              ],
              usageMetadata: {
                promptTokenCount: 10,
                candidatesTokenCount: 5,
                totalTokenCount: 15,
              },
            });
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "google",
        modelId: "gemini-3.1-pro-preview",
        messages: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi there!" },
          { role: "user", content: "How are you?" },
        ],
      };

      await adapter.sendChat(request);

      // Gemini uses 'contents' with 'parts' structure
      expect(capturedBody.contents).toEqual([
        { role: "user", parts: [{ text: "Hello" }] },
        { role: "model", parts: [{ text: "Hi there!" }] },
        { role: "user", parts: [{ text: "How are you?" }] },
      ]);
    });

    it("should send systemPrompt as system_instruction field", async () => {
      let capturedBody: Record<string, unknown> = {};

      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          async ({ request }) => {
            capturedBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({
              candidates: [
                {
                  content: { parts: [{ text: "Response" }] },
                  finishReason: "STOP",
                },
              ],
              usageMetadata: {
                promptTokenCount: 10,
                candidatesTokenCount: 5,
                totalTokenCount: 15,
              },
            });
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "google",
        modelId: "gemini-3-flash-preview",
        messages: [{ role: "user", content: "Hello" }],
        systemPrompt: "You are a helpful assistant.",
      };

      await adapter.sendChat(request);

      expect(capturedBody.system_instruction).toEqual({
        parts: [{ text: "You are a helpful assistant." }],
      });
      expect(capturedBody.contents).toEqual([
        { role: "user", parts: [{ text: "Hello" }] },
      ]);
    });

    it("should omit system_instruction when systemPrompt is not provided", async () => {
      let capturedBody: Record<string, unknown> = {};

      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          async ({ request }) => {
            capturedBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({
              candidates: [
                {
                  content: { parts: [{ text: "Response" }] },
                  finishReason: "STOP",
                },
              ],
              usageMetadata: {
                promptTokenCount: 5,
                candidatesTokenCount: 5,
                totalTokenCount: 10,
              },
            });
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "google",
        modelId: "gemini-3-flash-preview",
        messages: [{ role: "user", content: "Hello" }],
      };

      await adapter.sendChat(request);

      expect(capturedBody.system_instruction).toBeUndefined();
      expect(capturedBody.contents).toEqual([
        { role: "user", parts: [{ text: "Hello" }] },
      ]);
    });

    it("should include temperature and maxOutputTokens in generationConfig with systemPrompt", async () => {
      let capturedBody: Record<string, unknown> = {};

      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          async ({ request }) => {
            capturedBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({
              candidates: [
                {
                  content: { parts: [{ text: "Response" }] },
                  finishReason: "STOP",
                },
              ],
              usageMetadata: {
                promptTokenCount: 5,
                candidatesTokenCount: 5,
                totalTokenCount: 10,
              },
            });
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "google",
        modelId: "gemini-3-flash-preview",
        messages: [{ role: "user", content: "Test" }],
        systemPrompt: "Be concise.",
        temperature: 0.5,
        maxTokens: 512,
      };

      await adapter.sendChat(request);

      expect(capturedBody.system_instruction).toEqual({
        parts: [{ text: "Be concise." }],
      });
      expect(capturedBody.generationConfig).toMatchObject({
        temperature: 0.5,
        maxOutputTokens: 512,
      });
    });

    it("should convert temperature and maxTokens", async () => {
      let capturedBody: Record<string, unknown> = {};

      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          async ({ request }) => {
            capturedBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({
              candidates: [
                {
                  content: { parts: [{ text: "Response" }] },
                  finishReason: "STOP",
                },
              ],
              usageMetadata: {
                promptTokenCount: 5,
                candidatesTokenCount: 10,
                totalTokenCount: 15,
              },
            });
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "google",
        modelId: "gemini-3.1-pro-preview",
        messages: [{ role: "user", content: "Hello" }],
        temperature: 0.8,
        maxTokens: 1000,
      };

      await adapter.sendChat(request);

      expect(capturedBody.generationConfig).toMatchObject({
        temperature: 0.8,
        maxOutputTokens: 1000,
      });
    });

    it("should omit system_instruction when systemPrompt is whitespace only", async () => {
      let capturedBody: Record<string, unknown> = {};

      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          async ({ request }) => {
            capturedBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({
              candidates: [
                {
                  content: { parts: [{ text: "Response" }] },
                  finishReason: "STOP",
                },
              ],
              usageMetadata: {
                promptTokenCount: 5,
                candidatesTokenCount: 5,
                totalTokenCount: 10,
              },
            });
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "google",
        modelId: "gemini-3-flash-preview",
        messages: [{ role: "user", content: "Hello" }],
        systemPrompt: "   ",
      };

      await adapter.sendChat(request);

      expect(capturedBody.system_instruction).toBeUndefined();
    });

    it("should omit system_instruction when systemPrompt is empty string", async () => {
      let capturedBody: Record<string, unknown> = {};

      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          async ({ request }) => {
            capturedBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({
              candidates: [
                {
                  content: { parts: [{ text: "Response" }] },
                  finishReason: "STOP",
                },
              ],
              usageMetadata: {
                promptTokenCount: 5,
                candidatesTokenCount: 5,
                totalTokenCount: 10,
              },
            });
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "google",
        modelId: "gemini-3-flash-preview",
        messages: [{ role: "user", content: "Hello" }],
        systemPrompt: "",
      };

      await adapter.sendChat(request);

      expect(capturedBody.system_instruction).toBeUndefined();
    });
  });

  describe("Error Mapping", () => {
    it("should map 400 to UNKNOWN error", async () => {
      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          () => {
            return HttpResponse.json(
              { error: { message: "Invalid request" } },
              { status: 400 },
            );
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "google",
        modelId: "gemini-3.1-pro-preview",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(adapter.sendChat(request)).rejects.toMatchObject({
        code: "UNKNOWN",
      });
    });

    it("should map 401/403 to API_KEY_INVALID", async () => {
      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          () => {
            return HttpResponse.json(
              { error: { message: "API key invalid" } },
              { status: 401 },
            );
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "google",
        modelId: "gemini-3.1-pro-preview",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(adapter.sendChat(request)).rejects.toMatchObject({
        code: "API_KEY_INVALID",
        retryable: false,
      });
    });

    it("should map 429 to RATE_LIMIT", async () => {
      // Use adapter with no retries for error tests
      const noRetryAdapter = new GoogleAdapter("test-google-api-key", {
        maxRetries: 0,
      });

      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          () => {
            return HttpResponse.json(
              { error: { message: "Resource exhausted" } },
              { status: 429 },
            );
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "google",
        modelId: "gemini-3.1-pro-preview",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(noRetryAdapter.sendChat(request)).rejects.toMatchObject({
        code: "RATE_LIMIT",
        retryable: true,
      });
    });

    it("should map network error to NETWORK_ERROR", async () => {
      // Use adapter with no retries for error tests
      const noRetryAdapter = new GoogleAdapter("test-google-api-key", {
        maxRetries: 0,
      });

      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          () => {
            return HttpResponse.error();
          },
        ),
      );

      const request: LLMChatRequestInput = {
        providerId: "google",
        modelId: "gemini-3.1-pro-preview",
        messages: [{ role: "user", content: "Hello" }],
      };

      await expect(noRetryAdapter.sendChat(request)).rejects.toMatchObject({
        code: "NETWORK_ERROR",
        retryable: true,
      });
    });
  });

  describe("streamChat", () => {
    it("should send system_instruction in streamChat", async () => {
      let capturedBody: Record<string, unknown> = {};

      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          async ({ request }) => {
            capturedBody = (await request.json()) as Record<string, unknown>;
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
              start(controller) {
                controller.enqueue(
                  encoder.encode(
                    'data: {"candidates":[{"content":{"parts":[{"text":"Hi"}]},"finishReason":"STOP"}]}\n\n',
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
        modelId: "gemini-3-flash-preview",
        messages: [{ role: "user", content: "Hi" }],
        systemPrompt: "You are concise.",
        stream: true,
      };

      const chunks: StreamChunk[] = [];
      for await (const chunk of adapter.streamChat(request)) {
        chunks.push(chunk);
      }

      expect(capturedBody.system_instruction).toEqual({
        parts: [{ text: "You are concise." }],
      });
      expect(chunks.length).toBeGreaterThan(0);
    });

    it("should yield chunks from streaming response", async () => {
      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
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
                    'data: {"candidates":[{"content":{"parts":[{"text":" world"}]}}]}\n\n',
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
        modelId: "gemini-3.1-pro-preview",
        messages: [{ role: "user", content: "Hi" }],
        stream: true,
      };

      const chunks: StreamChunk[] = [];
      for await (const chunk of adapter.streamChat(request)) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(0);
    });

    it("should ignore invalid JSON chunks in streamChat", async () => {
      server.use(
        http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/*",
          () => {
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
              start(controller) {
                controller.enqueue(encoder.encode("data: INVALID_JSON\n\n"));
                controller.enqueue(
                  encoder.encode(
                    'data: {"candidates":[{"content":{"parts":[{"text":"Valid chunk"}]}}]}\n\n',
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
        modelId: "gemini-3-flash-preview",
        messages: [{ role: "user", content: "Hi" }],
        stream: true,
      };

      const chunks: StreamChunk[] = [];
      for await (const chunk of adapter.streamChat(request)) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBe(1);
      expect(chunks[0].delta.content).toBe("Valid chunk");
    });
  });

  describe("checkHealth", () => {
    it("should return connected status for successful API call", async () => {
      server.use(
        http.get(
          "https://generativelanguage.googleapis.com/v1beta/models",
          () => {
            return HttpResponse.json({
              models: [{ name: "gemini-3.1-pro-preview" }],
            });
          },
        ),
      );

      const result = await adapter.checkHealth();

      expect(result.status).toBe("connected");
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it("should return error status when health check fails", async () => {
      server.use(
        http.get(
          "https://generativelanguage.googleapis.com/v1beta/models",
          () => {
            return HttpResponse.json(
              { error: { message: "Service unavailable" } },
              { status: 503 },
            );
          },
        ),
      );

      const result = await adapter.checkHealth();

      expect(result.status).toBe("error");
      expect(result.providerId).toBe("google");
      expect(result.errorMessage).toBeDefined();
      expect(result.checkedAt).toBeInstanceOf(Date);
    });
  });

  describe("Provider ID", () => {
    it("should return 'google' as providerId", () => {
      expect(adapter.providerId).toBe("google");
    });
  });
});
