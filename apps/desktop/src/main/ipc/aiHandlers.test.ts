import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain } from "electron";

// Mock electron modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

// Mock LLM dependencies to avoid SecureStorage access
vi.mock("../adapters/llm/LLMAdapterFactory", () => ({
  LLMAdapterFactory: {
    getAdapter: vi.fn().mockResolvedValue({
      sendChat: vi.fn().mockResolvedValue({
        content: "Mock AI response",
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      }),
    }),
  },
}));

vi.mock("./llmConfigProvider", () => ({
  getSelectedLLMConfig: vi.fn().mockResolvedValue({
    providerId: "openai",
    modelId: "gpt-4o",
  }),
}));

vi.mock("../utils/buildMessages", () => ({
  buildMessages: vi.fn().mockReturnValue([{ role: "user", content: "Hello" }]),
}));

import { registerAIHandlers } from "./aiHandlers";
import { IPC_CHANNELS } from "../../preload/channels";

describe("aiHandlers", () => {
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

  describe("registerAIHandlers", () => {
    it("AI_CHATハンドラーを登録する", () => {
      expect(handlers.has(IPC_CHANNELS.AI_CHAT)).toBe(true);
    });

    it("AI_CHECK_CONNECTIONハンドラーを登録する", () => {
      expect(handlers.has(IPC_CHANNELS.AI_CHECK_CONNECTION)).toBe(true);
    });

    it("AI_INDEXハンドラーを登録する", () => {
      expect(handlers.has(IPC_CHANNELS.AI_INDEX)).toBe(true);
    });
  });

  describe("AI_CHAT handler", () => {
    it("チャットメッセージに応答する", async () => {
      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;

      const result = (await handler(
        {},
        {
          message: "Hello",
        },
      )) as {
        success: boolean;
        data: { message: string; conversationId: string };
      };

      expect(result.success).toBe(true);
      expect(result.data.message).toBeTruthy();
      expect(result.data.conversationId).toBeTruthy();
    });

    it("conversationIdを維持する", async () => {
      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;
      const conversationId = "test-conv-123";

      const result = (await handler(
        {},
        {
          message: "Hello",
          conversationId,
        },
      )) as {
        success: boolean;
        data: { conversationId: string };
      };

      expect(result.data.conversationId).toBe(conversationId);
    });

    it("conversationIdがない場合は新しいIDを生成する", async () => {
      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;

      const result = (await handler(
        {},
        {
          message: "Hello",
        },
      )) as {
        success: boolean;
        data: { conversationId: string };
      };

      expect(result.data.conversationId).toMatch(/^conv-/);
    });

    it("RAGが有効な場合にソースを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;

      const result = (await handler(
        {},
        {
          message: "Hello",
          ragEnabled: true,
        },
      )) as {
        success: boolean;
        data: { ragSources: string[] };
      };

      expect(result.success).toBe(true);
      expect(result.data.ragSources).toBeDefined();
      // RAG implementation returns empty array as placeholder (TODO: actual RAG integration)
      expect(Array.isArray(result.data.ragSources)).toBe(true);
    });

    it("RAGが無効な場合にソースを返さない", async () => {
      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;

      const result = (await handler(
        {},
        {
          message: "Hello",
          ragEnabled: false,
        },
      )) as {
        success: boolean;
        data: { ragSources: undefined };
      };

      expect(result.data.ragSources).toBeUndefined();
    });

    it("systemPromptが設定されている場合に受け取る", async () => {
      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;

      const result = (await handler(
        {},
        {
          message: "Hello",
          systemPrompt: "You are a helpful assistant.",
        },
      )) as {
        success: boolean;
        data: { message: string };
      };

      expect(result.success).toBe(true);
      expect(result.data.message).toBeTruthy();
    });

    it("systemPromptが空文字の場合も正しく処理する", async () => {
      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;

      const result = (await handler(
        {},
        {
          message: "Hello",
          systemPrompt: "",
        },
      )) as {
        success: boolean;
        data: { message: string };
      };

      expect(result.success).toBe(true);
    });

    it("systemPromptがnullやundefinedでも正しく処理する", async () => {
      const handler = handlers.get(IPC_CHANNELS.AI_CHAT)!;

      const result = (await handler(
        {},
        {
          message: "Hello",
          systemPrompt: undefined,
        },
      )) as {
        success: boolean;
        data: { message: string };
      };

      expect(result.success).toBe(true);
    });
  });

  describe("AI_CHECK_CONNECTION handler", () => {
    it("接続状態を返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.AI_CHECK_CONNECTION)!;

      const result = (await handler({}, {})) as {
        success: boolean;
        data: {
          status: string;
          indexedDocuments: number;
          lastSyncTime: Date;
        };
      };

      expect(result.success).toBe(true);
      expect(result.data.status).toBe("connected");
      expect(typeof result.data.indexedDocuments).toBe("number");
      expect(result.data.lastSyncTime).toBeInstanceOf(Date);
    });
  });

  describe("AI_INDEX handler", () => {
    it("フォルダをインデックスする", async () => {
      const handler = handlers.get(IPC_CHANNELS.AI_INDEX)!;

      const result = (await handler(
        {},
        {
          folderPath: "/test/path",
          recursive: true,
        },
      )) as {
        success: boolean;
        data: {
          indexedCount: number;
          skippedCount: number;
          errors: string[];
        };
      };

      expect(result.success).toBe(true);
      expect(typeof result.data.indexedCount).toBe("number");
      expect(typeof result.data.skippedCount).toBe("number");
      expect(Array.isArray(result.data.errors)).toBe(true);
    });
  });
});
