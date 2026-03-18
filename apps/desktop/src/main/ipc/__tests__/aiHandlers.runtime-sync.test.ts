import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain } from "electron";

// Mock electron modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

// Mock LLM dependencies
vi.mock("../../adapters/llm/LLMAdapterFactory", () => ({
  LLMAdapterFactory: {
    getAdapter: vi.fn(),
  },
}));

vi.mock("../llmConfigProvider", () => ({
  getSelectedLLMConfig: vi.fn(),
}));

vi.mock("../../utils/buildMessages", () => ({
  buildMessages: vi.fn().mockReturnValue([{ role: "user", content: "Hello" }]),
}));

import { registerAIHandlers } from "../aiHandlers";
import { IPC_CHANNELS } from "../../../preload/channels";
import { LLMAdapterFactory } from "../../adapters/llm/LLMAdapterFactory";
import { getSelectedLLMConfig } from "../llmConfigProvider";

describe("aiHandlers runtime-sync (GAP-01/03)", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    registerAIHandlers();
  });

  // ---------------------------------------------------------------------------
  // IT-001: providerId/modelId 明示時に成功
  // ---------------------------------------------------------------------------
  it("IT-001: providerId/modelId 明示時に AI_CHAT が成功レスポンスを返す", async () => {
    const mockSendChat = vi.fn().mockResolvedValue({
      content: "Mock AI response",
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    });
    (
      LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ sendChat: mockSendChat });

    const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
    const result = (await handler(
      {},
      {
        message: "Hello",
        providerId: "openai",
        modelId: "gpt-4o",
      },
    )) as {
      success: boolean;
      data: { message: string; conversationId: string };
    };

    expect(result.success).toBe(true);
    expect(result.data.message).toBeTruthy();
    expect(result.data.conversationId).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // IT-002: providerId 未指定 (modelId のみ指定) → バリデーションエラー
  // ---------------------------------------------------------------------------
  it("IT-002: providerId 未指定（modelId のみ指定）の場合にエラーを返す", async () => {
    const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
    const result = (await handler(
      {},
      {
        message: "Hello",
        // providerId 省略
        modelId: "gpt-4o",
      },
    )) as { success: boolean; error?: string };

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // IT-003: providerId 空文字 (P42: 空文字チェック)
  // ---------------------------------------------------------------------------
  it("IT-003: providerId が空文字の場合にエラーを返す（P42準拠）", async () => {
    const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
    const result = (await handler(
      {},
      {
        message: "Hello",
        providerId: "",
        modelId: "gpt-4o",
      },
    )) as { success: boolean; error?: string };

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // IT-004: providerId スペースのみ (P42: トリム後空文字チェック)
  // ---------------------------------------------------------------------------
  it("IT-004: providerId がスペースのみの場合にエラーを返す（P42 トリム準拠）", async () => {
    const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
    const result = (await handler(
      {},
      {
        message: "Hello",
        providerId: "   ",
        modelId: "gpt-4o",
      },
    )) as { success: boolean; error?: string };

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // IT-005: API key 未設定 → AUTH_ERROR相当のエラー
  // ---------------------------------------------------------------------------
  it("IT-005: API key 未設定の場合に認証エラーを返す", async () => {
    const apiKeyMissingError = {
      code: "API_KEY_MISSING",
      message: "API key is missing",
      retryable: false,
    };
    (
      LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
    ).mockRejectedValue(apiKeyMissingError);

    const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
    const result = (await handler(
      {},
      {
        message: "Hello",
        providerId: "openai",
        modelId: "gpt-4o",
      },
    )) as { success: boolean; error?: string };

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // IT-009: AI_CHECK_CONNECTION ハンドラが現時点で登録済みであることを確認
  //         (Phase 5 で廃止予定のため、廃止前は存在することが期待値)
  // ---------------------------------------------------------------------------
  it("IT-009: AI_CHECK_CONNECTION ハンドラが現時点でまだ登録されている（廃止前の確認）", () => {
    expect(handlers.has(IPC_CHANNELS.AI_CHECK_CONNECTION)).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 補足: getSelectedLLMConfig フォールバック経路の確認
  // ---------------------------------------------------------------------------
  it("providerId/modelId 未指定時は getSelectedLLMConfig にフォールバックする", async () => {
    (getSelectedLLMConfig as ReturnType<typeof vi.fn>).mockResolvedValue({
      providerId: "anthropic",
      modelId: "claude-opus-4-6",
    });

    const mockSendChat = vi.fn().mockResolvedValue({
      content: "Fallback response",
      usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15 },
    });
    (
      LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ sendChat: mockSendChat });

    const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
    const result = (await handler({}, { message: "Hello" })) as {
      success: boolean;
      data?: { message: string };
    };

    expect(result.success).toBe(true);
    expect(getSelectedLLMConfig).toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // 補足: getSelectedLLMConfig が null を返す場合
  // ---------------------------------------------------------------------------
  it("getSelectedLLMConfig が null の場合はエラーを返す", async () => {
    (getSelectedLLMConfig as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
    const result = (await handler({}, { message: "Hello" })) as {
      success: boolean;
      error?: string;
    };

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
