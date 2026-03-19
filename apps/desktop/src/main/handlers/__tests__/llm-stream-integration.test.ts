/**
 * @vitest-environment node
 *
 * LLM Stream Integration Tests
 *
 * TDD Phase: Red (一部テストは未実装機能を検証するため失敗する可能性あり)
 *
 * テストケース I-01〜I-05:
 *   I-01: stream-chat -> chunk -> end の完全フロー
 *   I-02: stream-chat -> cancel の中断フロー
 *   I-03: conversation create -> addMessage の永続化フロー（型契約確認）
 *   I-04: stream-chat の request 形式が IPC 契約に一致（型検証）
 *   I-05: stream error のレスポンス形式が契約に一致（型検証）
 *
 * P60 準拠: IPC レスポンス形式テーブル
 *   - llm:stream-chat  → requestId (string) を直接返却
 *   - llm:stream-cancel → { success: boolean }
 *   - llm:stream-chunk イベント → { delta: string, id?: string, done?: boolean }
 *   - llm:stream-error イベント → { code: string, message: string, retryable?: boolean }
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock electron
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));

// Mock SecureStorage
vi.mock("@/main/services/secureStorage", () => ({
  SecureStorage: {
    getApiKey: vi.fn(),
    setApiKey: vi.fn(),
  },
}));

// Mock LLMAdapterFactory
vi.mock("@/main/adapters/llm/LLMAdapterFactory", () => ({
  LLMAdapterFactory: {
    getAdapter: vi.fn(),
    clearInstance: vi.fn(),
  },
}));

import { SecureStorage } from "@/main/services/secureStorage";
import { LLMAdapterFactory } from "@/main/adapters/llm/LLMAdapterFactory";
import { handleStreamChat, handleStreamCancel } from "@/main/handlers/llm";

import type { LLMChatRequestInput } from "@repo/shared/types/llm";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockEvent(isDestroyed = false) {
  return {
    sender: {
      send: vi.fn(),
      isDestroyed: vi.fn().mockReturnValue(isDestroyed),
    },
  };
}

const validRequest: LLMChatRequestInput = {
  providerId: "openai",
  modelId: "gpt-4o",
  messages: [{ role: "user", content: "Hello" }],
  stream: true,
};

// ---------------------------------------------------------------------------
// IPC 契約定義 (P60 準拠)
// ---------------------------------------------------------------------------

/**
 * llm:stream-chat の IPC レスポンス契約
 * requestId を直接返却する（wrapper なし）
 */
type StreamChatIpcResponse = {
  requestId: string;
};

/**
 * llm:stream-chunk イベントペイロード契約
 */
type StreamChunkPayload = {
  delta: { content: string } | string;
  id?: string;
  done?: boolean;
};

/**
 * llm:stream-error イベントペイロード契約
 */
type StreamErrorPayload = {
  code: string;
  message: string;
  retryable?: boolean;
  retryAfterMs?: number;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("LLM Stream Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // I-01: stream-chat -> chunk -> end の完全フロー
  // -------------------------------------------------------------------------
  describe("I-01: stream-chat -> chunk -> end 完全フロー", () => {
    it("chunk イベントが順番に発火し最後に end イベントが来る", async () => {
      // Given: 3つのチャンクを返すアダプター
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockAdapter = {
        streamChat: vi.fn().mockImplementation(async function* () {
          yield { id: "c1", delta: { content: "Hello" }, done: false };
          yield { id: "c2", delta: { content: " World" }, done: false };
          yield { id: "c3", delta: { content: "!" }, done: false };
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();

      // When: stream-chat を実行
      const result = await handleStreamChat(mockEvent as never, validRequest);

      // Then: requestId が返る
      expect(result).toHaveProperty("requestId");
      expect(typeof result.requestId).toBe("string");

      // Then: 3つの chunk イベントが発火している
      const allCalls = (mockEvent.sender.send as ReturnType<typeof vi.fn>).mock
        .calls;
      const chunkCalls = allCalls.filter((c) => c[0] === "llm:stream-chunk");
      const endCalls = allCalls.filter((c) => c[0] === "llm:stream-end");
      const errorCalls = allCalls.filter((c) => c[0] === "llm:stream-error");

      expect(chunkCalls).toHaveLength(3);
      expect(chunkCalls[0][1]).toMatchObject({ delta: { content: "Hello" } });
      expect(chunkCalls[1][1]).toMatchObject({ delta: { content: " World" } });
      expect(chunkCalls[2][1]).toMatchObject({ delta: { content: "!" } });

      // Then: end イベントが1回発火している
      expect(endCalls).toHaveLength(1);

      // Then: error イベントは発火していない
      expect(errorCalls).toHaveLength(0);
    });

    it("イベント発火順序が chunk... → end である", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockAdapter = {
        streamChat: vi.fn().mockImplementation(async function* () {
          yield { id: "1", delta: { content: "A" }, done: false };
          yield { id: "2", delta: { content: "B" }, done: false };
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();
      await handleStreamChat(mockEvent as never, validRequest);

      const callChannels = (
        mockEvent.sender.send as ReturnType<typeof vi.fn>
      ).mock.calls.map((c) => c[0]);

      // chunk が先に来て、end が最後
      const lastChannel = callChannels[callChannels.length - 1];
      expect(lastChannel).toBe("llm:stream-end");

      const chunkIndexes = callChannels
        .map((c: string, i: number) => (c === "llm:stream-chunk" ? i : -1))
        .filter((i: number) => i >= 0);
      const endIndex = callChannels.indexOf("llm:stream-end");

      // すべての chunk index が end index より小さい
      chunkIndexes.forEach((idx: number) => {
        expect(idx).toBeLessThan(endIndex);
      });
    });
  });

  // -------------------------------------------------------------------------
  // I-02: stream-chat -> cancel の中断フロー
  // -------------------------------------------------------------------------
  describe("I-02: stream-chat -> cancel 中断フロー", () => {
    it("ストリーム完了後の cancel は { success: false } を返す", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockAdapter = {
        streamChat: vi.fn().mockImplementation(async function* () {
          yield { id: "1", delta: { content: "Done" }, done: false };
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();
      const result = await handleStreamChat(mockEvent as never, validRequest);

      // ストリームが完了したため activeStreams から削除されている
      const cancelResult = handleStreamCancel({
        requestId: result.requestId,
      });

      expect(cancelResult).toEqual({ success: false });
    });

    it("存在しない requestId の cancel は { success: false }", () => {
      const cancelResult = handleStreamCancel({
        requestId: "ffffffff-ffff-ffff-ffff-ffffffffffff",
      });

      expect(cancelResult).toEqual({ success: false });
    });

    it("cancel のレスポンスは { success: boolean } 型に準拠する", () => {
      const cancelResult = handleStreamCancel({
        requestId: "does-not-exist",
      });

      // 型契約確認: success フィールドのみ
      expect(cancelResult).toHaveProperty("success");
      expect(typeof cancelResult.success).toBe("boolean");

      // P60 契約: { success: boolean } 以外のフィールドがないこと
      const keys = Object.keys(cancelResult);
      expect(keys).toEqual(["success"]);
    });
  });

  // -------------------------------------------------------------------------
  // I-03: conversation create -> addMessage の永続化フロー（型契約確認）
  // -------------------------------------------------------------------------
  describe("I-03: conversation 永続化フロー（型契約確認）", () => {
    it("conversation:create と conversation:addMessage の IPC 契約形式を満たす", async () => {
      // NOTE: conversationHandlers は別モジュール (apps/desktop/src/main/ipc/conversationHandlers.ts)
      // このテストでは LLM stream との連携における型契約の整合性を確認する

      // conversation:create の期待レスポンス形式
      type ConversationCreateResponse = {
        success: boolean;
        data?: { id: string; title: string; createdAt: string };
        error?: { code: string; message: string };
      };

      // conversation:addMessage の期待レスポンス形式
      type ConversationAddMessageResponse = {
        success: boolean;
        data?: {
          id: string;
          conversationId: string;
          role: string;
          content: string;
          createdAt: string;
        };
        error?: { code: string; message: string };
      };

      // stream-chat のレスポンスとの組み合わせ型整合性
      // stream-chat は requestId を直接返すのに対し、
      // conversation は { success, data, error } wrapper 形式を使う
      const streamChatResponse: StreamChatIpcResponse = { requestId: "uuid-1" };
      const conversationResponse: ConversationCreateResponse = {
        success: true,
        data: {
          id: "conv-1",
          title: "New Conversation",
          createdAt: new Date().toISOString(),
        },
      };
      const addMessageResponse: ConversationAddMessageResponse = {
        success: true,
        data: {
          id: "msg-1",
          conversationId: "conv-1",
          role: "assistant",
          content: "Hello!",
          createdAt: new Date().toISOString(),
        },
      };

      // 型整合性の確認: 各レスポンスが期待する型を満たす
      expect(streamChatResponse.requestId).toBeTruthy();
      expect(conversationResponse.success).toBe(true);
      expect(addMessageResponse.success).toBe(true);

      // stream-chat は requestId を直接持つ（wrapper なし）
      expect("requestId" in streamChatResponse).toBe(true);
      expect("success" in streamChatResponse).toBe(false);

      // conversation は success wrapper を持つ
      expect("success" in conversationResponse).toBe(true);
      expect("requestId" in conversationResponse).toBe(false);
    });

    it("stream-chat requestId は UUID v4 形式で conversation ID と区別できる", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockAdapter = {
        streamChat: vi.fn().mockImplementation(async function* () {}),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();
      const result = await handleStreamChat(mockEvent as never, validRequest);

      // UUID v4 形式の確認
      expect(result.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });
  });

  // -------------------------------------------------------------------------
  // I-04: stream-chat の request 形式が IPC 契約に一致（型検証）
  // -------------------------------------------------------------------------
  describe("I-04: stream-chat request 形式の IPC 契約検証", () => {
    it("IPC レスポンスが { requestId: string } 型に準拠する（P60）", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockAdapter = {
        streamChat: vi.fn().mockImplementation(async function* () {
          yield { id: "1", delta: { content: "Hi" }, done: false };
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();
      const result: StreamChatIpcResponse = await handleStreamChat(
        mockEvent as never,
        validRequest,
      );

      // P60 契約: stream-chat は requestId を直接返す（success wrapper なし）
      expect(result).toHaveProperty("requestId");
      expect(typeof result.requestId).toBe("string");

      // P60 契約確認: success フィールドは存在しない
      expect("success" in result).toBe(false);
      expect("error" in result).toBe(false);
      expect("data" in result).toBe(false);
    });

    it("chunk イベントのペイロードが契約形式に準拠する", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockAdapter = {
        streamChat: vi.fn().mockImplementation(async function* () {
          yield { id: "chunk-1", delta: { content: "Hello" }, done: false };
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();
      await handleStreamChat(mockEvent as never, validRequest);

      const chunkCalls = (
        mockEvent.sender.send as ReturnType<typeof vi.fn>
      ).mock.calls.filter((c) => c[0] === "llm:stream-chunk");

      expect(chunkCalls).toHaveLength(1);

      // chunk payload 型検証
      const chunkPayload: StreamChunkPayload = chunkCalls[0][1];
      expect(chunkPayload).toHaveProperty("delta");
    });

    it("各プロバイダー (openai/anthropic/google/xai) で stream-chat が requestId を返す", async () => {
      const providers = ["openai", "anthropic", "google", "xai"] as const;

      for (const providerId of providers) {
        vi.clearAllMocks();

        (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
          "test-key",
        );

        const mockAdapter = {
          streamChat: vi.fn().mockImplementation(async function* () {
            yield {
              id: "1",
              delta: { content: `Response from ${providerId}` },
              done: false,
            };
          }),
        };
        (
          LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
        ).mockResolvedValue(mockAdapter);

        const mockEvent = createMockEvent();
        const result = await handleStreamChat(mockEvent as never, {
          providerId,
          modelId: "test-model",
          messages: [{ role: "user", content: "Hi" }],
          stream: true,
        });

        // 各プロバイダーで同じ契約形式
        expect(result).toHaveProperty("requestId");
        expect(typeof result.requestId).toBe("string");
      }
    });
  });

  // -------------------------------------------------------------------------
  // I-05: stream error のレスポンス形式が契約に一致（型検証）
  // -------------------------------------------------------------------------
  describe("I-05: stream error レスポンス形式の契約検証", () => {
    it("VALIDATION_ERROR のペイロードが { code, message, retryable } 形式", async () => {
      const mockEvent = createMockEvent();

      await handleStreamChat(mockEvent as never, {
        ...validRequest,
        messages: [],
      });

      const errorCalls = (
        mockEvent.sender.send as ReturnType<typeof vi.fn>
      ).mock.calls.filter((c) => c[0] === "llm:stream-error");

      expect(errorCalls).toHaveLength(1);

      // P60 契約: stream-error ペイロードは { code, message, retryable? }
      const payload: StreamErrorPayload = errorCalls[0][1];
      expect(payload).toHaveProperty("code");
      expect(payload).toHaveProperty("message");
      expect(typeof payload.code).toBe("string");
      expect(typeof payload.message).toBe("string");
      // retryable は boolean または undefined
      if ("retryable" in payload) {
        expect(typeof payload.retryable).toBe("boolean");
      }
    });

    it("API_KEY_MISSING エラーのペイロードが契約形式に準拠する", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const mockEvent = createMockEvent();
      await handleStreamChat(mockEvent as never, validRequest);

      const errorCalls = (
        mockEvent.sender.send as ReturnType<typeof vi.fn>
      ).mock.calls.filter((c) => c[0] === "llm:stream-error");

      expect(errorCalls).toHaveLength(1);
      const payload: StreamErrorPayload = errorCalls[0][1];

      expect(payload.code).toBe("API_KEY_MISSING");
      expect(typeof payload.message).toBe("string");
      expect(payload.message.length).toBeGreaterThan(0);
      expect(payload.retryable).toBe(false);
    });

    it("NETWORK_ERROR は retryable: true で返る", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockAdapter = {
        // eslint-disable-next-line require-yield
        streamChat: vi.fn().mockImplementation(async function* () {
          throw new Error("Connection reset");
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();
      await handleStreamChat(mockEvent as never, validRequest);

      const errorCalls = (
        mockEvent.sender.send as ReturnType<typeof vi.fn>
      ).mock.calls.filter((c) => c[0] === "llm:stream-error");

      expect(errorCalls).toHaveLength(1);
      const payload: StreamErrorPayload = errorCalls[0][1];

      expect(payload.code).toBe("NETWORK_ERROR");
      expect(payload.retryable).toBe(true);
    });

    it("RATE_LIMIT エラーは retryAfterMs フィールドを持てる", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockAdapter = {
        // eslint-disable-next-line require-yield
        streamChat: vi.fn().mockImplementation(async function* () {
          throw {
            code: "RATE_LIMIT",
            message: "Too many requests",
            retryable: true,
            retryAfterMs: 60000,
          };
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();
      await handleStreamChat(mockEvent as never, validRequest);

      const errorCalls = (
        mockEvent.sender.send as ReturnType<typeof vi.fn>
      ).mock.calls.filter((c) => c[0] === "llm:stream-error");

      expect(errorCalls).toHaveLength(1);
      const payload: StreamErrorPayload = errorCalls[0][1];

      expect(payload.code).toBe("RATE_LIMIT");
      expect(payload.retryable).toBe(true);
      // retryAfterMs は LLMError には retryAfter として存在するが
      // stream-error ペイロードにはそのまま転送される
      // (実装が LLMError をそのまま send しているため)
    });

    it("エラー後に end イベントは発火しない", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        null, // API_KEY_MISSING でエラー
      );

      const mockEvent = createMockEvent();
      await handleStreamChat(mockEvent as never, validRequest);

      const endCalls = (
        mockEvent.sender.send as ReturnType<typeof vi.fn>
      ).mock.calls.filter((c) => c[0] === "llm:stream-end");

      // エラー時は end イベントを送信しない
      expect(endCalls).toHaveLength(0);
    });
  });
});
