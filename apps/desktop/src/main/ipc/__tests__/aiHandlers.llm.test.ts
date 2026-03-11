/**
 * @file aiHandlers LLM API統合テスト
 * @description システムプロンプト付きLLM API呼び出しのテスト
 * @feature system-prompt-llm-api
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain } from "electron";

// Mock modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  BrowserWindow: {
    getFocusedWindow: vi.fn(),
  },
}));

vi.mock("../../adapters/llm/LLMAdapterFactory", () => ({
  LLMAdapterFactory: {
    getAdapter: vi.fn(),
  },
}));

vi.mock("../llmConfigProvider", () => ({
  getSelectedLLMConfig: vi.fn(),
}));

vi.mock("../../utils/buildMessages", () => ({
  buildMessages: vi.fn(),
}));

import { registerAIHandlers } from "../aiHandlers";
import { IPC_CHANNELS } from "../../../preload/channels";
import { LLMAdapterFactory } from "../../adapters/llm/LLMAdapterFactory";
import { getSelectedLLMConfig } from "../llmConfigProvider";
import { buildMessages } from "../../utils/buildMessages";
import type { AIChatRequest } from "../../../preload/types";

describe("aiHandlers - LLM API統合", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;
  let mockAdapter: {
    sendChat: ReturnType<typeof vi.fn>;
    streamChat: ReturnType<typeof vi.fn>;
    checkHealth: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Default mock adapter
    mockAdapter = {
      sendChat: vi.fn(),
      streamChat: vi.fn(),
      checkHealth: vi.fn(),
    };

    registerAIHandlers();
  });

  describe("システムプロンプト付きLLM API呼び出し", () => {
    it("システムプロンプト付きでLLM APIを正しく呼び出す", async () => {
      // Setup mocks
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "system", content: "You are a translator" },
        { role: "user", content: "Hello" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "こんにちは",
        model: "gpt-4o",
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      });

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const request: AIChatRequest = {
        message: "Hello",
        systemPrompt: "You are a translator",
        ragEnabled: false,
      };

      const result = (await handler({}, request)) as {
        success: boolean;
        data?: { message: string; conversationId: string };
        error?: string;
      };

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe("こんにちは");
      expect(buildMessages).toHaveBeenCalledWith(
        "Hello",
        "You are a translator",
      );
      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("openai");
      expect(mockAdapter.sendChat).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            { role: "system", content: "You are a translator" },
            { role: "user", content: "Hello" },
          ],
          modelId: "gpt-4o",
        }),
      );
    });

    it("システムプロンプトなしでユーザーメッセージのみ送信する", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet-20241022",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "Hi there!",
        model: "claude-3-5-sonnet-20241022",
        usage: { promptTokens: 5, completionTokens: 3, totalTokens: 8 },
      });

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const request: AIChatRequest = {
        message: "Hello",
        ragEnabled: false,
      };

      const result = (await handler({}, request)) as {
        success: boolean;
        data?: { message: string };
      };

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe("Hi there!");
      expect(buildMessages).toHaveBeenCalledWith("Hello", undefined);
    });
  });

  describe("プロバイダー/モデル選択", () => {
    it("request に providerId/modelId がある場合は Main 設定より優先する", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet-20241022",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "Response",
        model: "gpt-4o-mini",
        usage: { promptTokens: 5, completionTokens: 3, totalTokens: 8 },
      });
      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      await handler(
        {},
        {
          message: "Hello",
          ragEnabled: false,
          providerId: "openai",
          modelId: "gpt-4o-mini",
        },
      );

      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("openai");
      expect(mockAdapter.sendChat).toHaveBeenCalledWith(
        expect.objectContaining({
          modelId: "gpt-4o-mini",
          providerId: "openai",
        }),
      );
    });

    it("providerId/modelId の片方だけ指定時はエラーを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;

      const result = (await handler(
        {},
        {
          message: "Hello",
          ragEnabled: false,
          providerId: "openai",
        },
      )) as { success: boolean; error?: string };

      expect(result.success).toBe(false);
      expect(result.error).toContain("セットで指定");
    });

    it("サポート外 providerId 指定時はエラーを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;

      const result = (await handler(
        {},
        {
          message: "Hello",
          ragEnabled: false,
          providerId: "invalid-provider",
          modelId: "model-x",
        },
      )) as { success: boolean; error?: string };

      expect(result.success).toBe(false);
      expect(result.error).toContain("サポート外");
    });

    it("選択されたプロバイダーのアダプターを取得する", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "google",
        modelId: "gemini-1.5-pro",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "Response",
        model: "gemini-1.5-pro",
        usage: { promptTokens: 5, completionTokens: 3, totalTokens: 8 },
      });

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      await handler({}, { message: "Hello", ragEnabled: false });

      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("google");
    });

    it("選択されたモデルIDをリクエストに含める", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "xai",
        modelId: "grok-beta",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "Response",
        model: "grok-beta",
        usage: { promptTokens: 5, completionTokens: 3, totalTokens: 8 },
      });

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      await handler({}, { message: "Hello", ragEnabled: false });

      expect(mockAdapter.sendChat).toHaveBeenCalledWith(
        expect.objectContaining({
          modelId: "grok-beta",
        }),
      );
    });
  });

  describe("エラーハンドリング", () => {
    it("LLM設定が未取得の場合にエラーを返す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue(null);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: false },
      )) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("LLMプロバイダー");
    });

    it("APIキー未設定時にエラーを返す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      vi.mocked(LLMAdapterFactory.getAdapter).mockRejectedValue(
        new Error("API key not found for provider: openai"),
      );

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: false },
      )) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("API key not found");
    });

    it("LLMエラー時に適切なエラーメッセージを返す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      mockAdapter.sendChat.mockRejectedValue({
        code: "RATE_LIMIT",
        message: "Rate limit exceeded",
        retryable: true,
        retryAfterMs: 60000,
      });

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: false },
      )) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("レート制限");
    });

    it("ネットワークエラー時にリトライ可能なエラーを返す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      mockAdapter.sendChat.mockRejectedValue({
        code: "NETWORK_ERROR",
        message: "Network error",
        retryable: true,
      });

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: false },
      )) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("ネットワーク");
    });

    it("予期しないエラー時にクラッシュせずエラーを返す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      mockAdapter.sendChat.mockRejectedValue(new Error("Unexpected error"));

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: false },
      )) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("会話ID管理", () => {
    it("新しい会話IDを生成する", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "Hi",
        model: "gpt-4o",
        usage: { promptTokens: 5, completionTokens: 2, totalTokens: 7 },
      });

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: false },
      )) as {
        success: boolean;
        data?: { conversationId: string };
      };

      expect(result.data?.conversationId).toMatch(/^conv-/);
    });

    it("既存の会話IDを維持する", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "Hi",
        model: "gpt-4o",
        usage: { promptTokens: 5, completionTokens: 2, totalTokens: 7 },
      });

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        {
          message: "Hello",
          ragEnabled: false,
          conversationId: "existing-conv-123",
        },
      )) as {
        success: boolean;
        data?: { conversationId: string };
      };

      expect(result.data?.conversationId).toBe("existing-conv-123");
    });
  });

  describe("RAGソース", () => {
    it("RAG有効時に空のソースリストを返す（RAG未実装）", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "Response",
        model: "gpt-4o",
        usage: { promptTokens: 5, completionTokens: 3, totalTokens: 8 },
      });

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: true },
      )) as {
        success: boolean;
        data?: { ragSources?: string[] };
      };

      expect(result.data?.ragSources).toEqual([]);
    });

    it("RAG無効時にragSourcesをundefinedで返す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "Response",
        model: "gpt-4o",
        usage: { promptTokens: 5, completionTokens: 3, totalTokens: 8 },
      });

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: false },
      )) as {
        success: boolean;
        data?: { ragSources?: string[] };
      };

      expect(result.data?.ragSources).toBeUndefined();
    });
  });

  // Phase 6: テスト拡充 - プロバイダー別テスト
  describe.each([
    { providerId: "openai" as const, modelId: "gpt-4o" },
    { providerId: "anthropic" as const, modelId: "claude-3-5-sonnet-20241022" },
    { providerId: "google" as const, modelId: "gemini-1.5-pro" },
    { providerId: "xai" as const, modelId: "grok-beta" },
  ])("$providerId プロバイダー", ({ providerId, modelId }) => {
    it("システムプロンプト付きでAPIを呼び出す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId,
        modelId,
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Hello" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "Response from " + providerId,
        model: modelId,
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      });

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        {
          message: "Hello",
          systemPrompt: "You are helpful",
          ragEnabled: false,
        },
      )) as {
        success: boolean;
        data?: { message: string };
      };

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe("Response from " + providerId);
      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith(providerId);
      expect(mockAdapter.sendChat).toHaveBeenCalledWith(
        expect.objectContaining({
          modelId,
          providerId,
        }),
      );
    });

    it("システムプロンプトなしでAPIを呼び出す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId,
        modelId,
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "Response",
        model: modelId,
        usage: { promptTokens: 5, completionTokens: 3, totalTokens: 8 },
      });

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: false },
      )) as {
        success: boolean;
        data?: { message: string };
      };

      expect(result.success).toBe(true);
      expect(buildMessages).toHaveBeenCalledWith("Hello", undefined);
    });
  });

  // Phase 6: テスト拡充 - 追加エラーケース
  describe("追加エラーケース", () => {
    it("APIキー無効エラー時に適切なメッセージを返す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      mockAdapter.sendChat.mockRejectedValue({
        code: "API_KEY_INVALID",
        message: "Invalid API key",
        retryable: false,
      });

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: false },
      )) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("APIキーが無効");
    });

    it("タイムアウトエラー時に適切なメッセージを返す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      mockAdapter.sendChat.mockRejectedValue({
        code: "TIMEOUT",
        message: "Request timeout",
        retryable: true,
      });

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: false },
      )) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("タイムアウト");
    });

    it("コンテキスト長超過エラー時に適切なメッセージを返す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "A".repeat(100000) },
      ]);

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      mockAdapter.sendChat.mockRejectedValue({
        code: "CONTEXT_LENGTH_EXCEEDED",
        message: "Context length exceeded",
        retryable: false,
      });

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "A".repeat(100000), ragEnabled: false },
      )) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("長すぎます");
    });

    it("コンテンツフィルターエラー時に適切なメッセージを返す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      mockAdapter.sendChat.mockRejectedValue({
        code: "CONTENT_FILTER",
        message: "Content filtered",
        retryable: false,
      });

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: false },
      )) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("コンテンツフィルター");
    });

    it("サービス利用不可エラー時に適切なメッセージを返す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet-20241022",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      mockAdapter.sendChat.mockRejectedValue({
        code: "SERVICE_UNAVAILABLE",
        message: "Service unavailable",
        retryable: true,
      });

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: false },
      )) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("一時的に利用できません");
    });

    it("モデル未検出エラー時に適切なメッセージを返す", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "non-existent-model",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Hello" },
      ]);

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      mockAdapter.sendChat.mockRejectedValue({
        code: "MODEL_NOT_FOUND",
        message: "Model not found",
        retryable: false,
      });

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        { message: "Hello", ragEnabled: false },
      )) as {
        success: boolean;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("モデルが見つかりません");
    });
  });

  // Phase 6: 統合テスト拡充
  describe("統合フロー", () => {
    it("複数メッセージを同一会話IDで送信できる", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "user", content: "Message" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "Response",
        model: "gpt-4o",
        usage: { promptTokens: 5, completionTokens: 3, totalTokens: 8 },
      });

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;

      // First message - new conversation
      const result1 = (await handler(
        {},
        { message: "First message", ragEnabled: false },
      )) as {
        success: boolean;
        data?: { conversationId: string };
      };

      expect(result1.success).toBe(true);
      const conversationId = result1.data?.conversationId;
      expect(conversationId).toMatch(/^conv-/);

      // Second message - same conversation
      const result2 = (await handler(
        {},
        { message: "Second message", ragEnabled: false, conversationId },
      )) as {
        success: boolean;
        data?: { conversationId: string };
      };

      expect(result2.success).toBe(true);
      expect(result2.data?.conversationId).toBe(conversationId);
    });

    it("長いシステムプロンプトでも正常に動作する", async () => {
      const longSystemPrompt = "あなたは親切なアシスタントです。".repeat(100);

      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet-20241022",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "system", content: longSystemPrompt },
        { role: "user", content: "Hello" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "Response",
        model: "claude-3-5-sonnet-20241022",
        usage: { promptTokens: 500, completionTokens: 10, totalTokens: 510 },
      });

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        {
          message: "Hello",
          systemPrompt: longSystemPrompt,
          ragEnabled: false,
        },
      )) as {
        success: boolean;
        data?: { message: string };
      };

      expect(result.success).toBe(true);
      expect(buildMessages).toHaveBeenCalledWith("Hello", longSystemPrompt);
    });

    it("Unicode文字を含むメッセージを正しく処理する", async () => {
      vi.mocked(getSelectedLLMConfig).mockResolvedValue({
        providerId: "google",
        modelId: "gemini-1.5-pro",
      });

      vi.mocked(buildMessages).mockReturnValue([
        { role: "system", content: "あなたは日本語アシスタントです 🎌" },
        { role: "user", content: "こんにちは 👋" },
      ]);

      mockAdapter.sendChat.mockResolvedValue({
        content: "こんにちは！お手伝いできることがあれば教えてください 😊",
        model: "gemini-1.5-pro",
        usage: { promptTokens: 20, completionTokens: 15, totalTokens: 35 },
      });

      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);

      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const result = (await handler(
        {},
        {
          message: "こんにちは 👋",
          systemPrompt: "あなたは日本語アシスタントです 🎌",
          ragEnabled: false,
        },
      )) as {
        success: boolean;
        data?: { message: string };
      };

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain("こんにちは");
    });
  });
});
