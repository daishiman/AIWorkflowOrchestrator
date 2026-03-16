/**
 * Conversation IPC Handlers Tests
 *
 * TDD Green Phase: Tests with actual implementation.
 *
 * @see docs/30-workflows/llm-conversation-history-persistence/outputs/phase-4/test-cases.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type {
  ConversationSummary,
  Conversation,
  Message,
  ConversationIPCResponse,
} from "../../../shared/types/conversation";

// === Response type alias for test assertions ===
type IPCResponse<T> = ConversationIPCResponse<T>;

// === Mocks ===

// Mock ConversationRepository
const mockRepository = {
  listConversations: vi.fn(),
  getConversation: vi.fn(),
  createConversation: vi.fn(),
  updateConversation: vi.fn(),
  deleteConversation: vi.fn(),
  addMessage: vi.fn(),
  searchConversations: vi.fn(),
};

// Mock electron modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

// Import after mocks
import { ipcMain } from "electron";
import { registerConversationHandlers } from "../conversationHandlers";
import type { ConversationRepository } from "../../repositories/conversationRepository";

// Conversation IPC Channels
const CONVERSATION_CHANNELS = {
  LIST: "conversation:list",
  GET: "conversation:get",
  CREATE: "conversation:create",
  UPDATE: "conversation:update",
  DELETE: "conversation:delete",
  ADD_MESSAGE: "conversation:addMessage",
  SEARCH: "conversation:search",
} as const;

describe("conversationHandlers", () => {
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

    // Default mock responses
    mockRepository.listConversations.mockReturnValue([]);
    mockRepository.getConversation.mockReturnValue(null);
    mockRepository.createConversation.mockReturnValue({
      id: "test-id",
      userId: "local-user",
      title: "Test",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      isFavorite: false,
      isPinned: false,
      pinOrder: null,
      lastMessagePreview: null,
      metadata: {},
      messages: [],
    });
    mockRepository.updateConversation.mockReturnValue({
      id: "test-id",
      title: "Updated",
    });
    mockRepository.deleteConversation.mockReturnValue(undefined);
    mockRepository.addMessage.mockReturnValue({
      id: "msg-id",
      sessionId: "test-id",
      role: "user",
      content: "Hello",
      messageIndex: 0,
      timestamp: new Date().toISOString(),
      attachments: [],
      metadata: {},
    });
    mockRepository.searchConversations.mockReturnValue([]);

    // Register handlers with mock repository
    registerConversationHandlers(
      mockRepository as unknown as ConversationRepository,
    );
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // 2.1 conversation:list
  // ===========================================================================

  describe("conversation:list", () => {
    it("CH-CL-01: should return conversation list", async () => {
      // Given: Repositoryが一覧を返す
      const mockData: ConversationSummary[] = [
        {
          id: "conv-1",
          title: "Test Conversation",
          createdAt: "2026-01-10T00:00:00Z",
          updatedAt: "2026-01-10T00:00:00Z",
          messageCount: 5,
          lastMessagePreview: "Hello...",
          isFavorite: false,
          isPinned: false,
        },
      ];
      mockRepository.listConversations.mockReturnValue(mockData);

      const handler = handlers.get(CONVERSATION_CHANNELS.LIST);
      if (!handler) {
        throw new Error("conversation:list handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler(
        {},
        {
          userId: "local-user",
          limit: 50,
        },
      )) as IPCResponse<ConversationSummary[]>;

      // Then: { success: true, data: [...] }
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe("conv-1");
      }
    });

    it("CH-CL-02: should call Repository.listConversations", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.LIST);
      if (!handler) {
        throw new Error("conversation:list handler not registered");
      }

      await handler({}, { userId: "local-user", limit: 50, offset: 0 });

      expect(mockRepository.listConversations).toHaveBeenCalledWith(
        "local-user",
        expect.objectContaining({ limit: 50, offset: 0 }),
      );
    });

    it("CH-CL-03: should return error on Repository error", async () => {
      // Given: Repositoryがエラーをスロー
      mockRepository.listConversations.mockImplementation(() => {
        throw new Error("Database error");
      });

      const handler = handlers.get(CONVERSATION_CHANNELS.LIST);
      if (!handler) {
        throw new Error("conversation:list handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler(
        {},
        {
          userId: "local-user",
        },
      )) as IPCResponse<ConversationSummary[]>;

      // Then: { success: false, error: {...} }
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("DB_ERROR");
      }
    });

    it("CH-CL-04: should return error for empty userId", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.LIST);
      if (!handler) {
        throw new Error("conversation:list handler not registered");
      }

      const result = (await handler(
        {},
        {
          userId: "",
        },
      )) as IPCResponse<ConversationSummary[]>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });
  });

  // ===========================================================================
  // 2.2 conversation:get
  // ===========================================================================

  describe("conversation:get", () => {
    it("CH-CG-01: should return conversation details", async () => {
      // Given: 会話が存在
      const mockData: Conversation = {
        id: "conv-1",
        userId: "local-user",
        title: "Test",
        createdAt: "2026-01-10T00:00:00Z",
        updatedAt: "2026-01-10T00:00:00Z",
        messageCount: 1,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: "Hello",
        metadata: {},
        messages: [
          {
            id: "msg-1",
            sessionId: "conv-1",
            role: "user",
            content: "Hello",
            messageIndex: 0,
            timestamp: "2026-01-10T00:00:00Z",
            attachments: [],
            metadata: {},
          },
        ],
      };
      mockRepository.getConversation.mockReturnValue(mockData);

      const handler = handlers.get(CONVERSATION_CHANNELS.GET);
      if (!handler) {
        throw new Error("conversation:get handler not registered");
      }

      const result = (await handler(
        {},
        {
          id: "conv-1",
        },
      )) as IPCResponse<Conversation>;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("conv-1");
        expect(result.data.messages).toHaveLength(1);
      }
    });

    it("CH-CG-02: should return null for non-existent conversation", async () => {
      mockRepository.getConversation.mockReturnValue(null);

      const handler = handlers.get(CONVERSATION_CHANNELS.GET);
      if (!handler) {
        throw new Error("conversation:get handler not registered");
      }

      const result = (await handler(
        {},
        {
          id: "non-existent",
        },
      )) as IPCResponse<Conversation | null>;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it("CH-CG-03: should return error on Repository error", async () => {
      mockRepository.getConversation.mockImplementation(() => {
        throw new Error("Database error");
      });

      const handler = handlers.get(CONVERSATION_CHANNELS.GET);
      if (!handler) {
        throw new Error("conversation:get handler not registered");
      }

      const result = (await handler(
        {},
        {
          id: "conv-1",
        },
      )) as IPCResponse<Conversation>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("DB_ERROR");
      }
    });

    it("CH-CG-04: should return error for empty id", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.GET);
      if (!handler) {
        throw new Error("conversation:get handler not registered");
      }

      const result = (await handler(
        {},
        {
          id: "",
        },
      )) as IPCResponse<Conversation>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });
  });

  // ===========================================================================
  // 2.3 conversation:create
  // ===========================================================================

  describe("conversation:create", () => {
    it("CH-CC-01: should create conversation", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.CREATE);
      if (!handler) {
        throw new Error("conversation:create handler not registered");
      }

      const result = (await handler(
        {},
        {
          userId: "local-user",
          title: "New Conversation",
        },
      )) as IPCResponse<Conversation>;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBeDefined();
      }
      expect(mockRepository.createConversation).toHaveBeenCalled();
    });

    it("CH-CC-02: should create conversation with firstMessage", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.CREATE);
      if (!handler) {
        throw new Error("conversation:create handler not registered");
      }

      await handler(
        {},
        {
          userId: "local-user",
          title: "New Conversation",
          firstMessage: {
            content: "Hello!",
            role: "user",
          },
        },
      );

      expect(mockRepository.createConversation).toHaveBeenCalledWith(
        expect.objectContaining({
          firstMessage: expect.objectContaining({
            content: "Hello!",
            role: "user",
          }),
        }),
      );
    });

    it("CH-CC-03: should return error on Repository error", async () => {
      mockRepository.createConversation.mockImplementation(() => {
        throw new Error("Database error");
      });

      const handler = handlers.get(CONVERSATION_CHANNELS.CREATE);
      if (!handler) {
        throw new Error("conversation:create handler not registered");
      }

      const result = (await handler(
        {},
        {
          userId: "local-user",
          title: "New",
        },
      )) as IPCResponse<Conversation>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("DB_ERROR");
      }
    });

    it("CH-CC-04: should return error for empty title", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.CREATE);
      if (!handler) {
        throw new Error("conversation:create handler not registered");
      }

      const result = (await handler(
        {},
        {
          userId: "local-user",
          title: "",
        },
      )) as IPCResponse<Conversation>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });
  });

  // ===========================================================================
  // 2.4 conversation:update
  // ===========================================================================

  describe("conversation:update", () => {
    it("CH-CU-01: should update conversation", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.UPDATE);
      if (!handler) {
        throw new Error("conversation:update handler not registered");
      }

      const result = (await handler(
        {},
        {
          id: "conv-1",
          data: { title: "Updated Title" },
        },
      )) as IPCResponse<Conversation>;

      expect(result.success).toBe(true);
      expect(mockRepository.updateConversation).toHaveBeenCalledWith("conv-1", {
        title: "Updated Title",
      });
    });

    it("CH-CU-02: should return error for non-existent conversation", async () => {
      mockRepository.updateConversation.mockImplementation(() => {
        throw new Error("Conversation not found");
      });

      const handler = handlers.get(CONVERSATION_CHANNELS.UPDATE);
      if (!handler) {
        throw new Error("conversation:update handler not registered");
      }

      const result = (await handler(
        {},
        {
          id: "non-existent",
          data: { title: "New Title" },
        },
      )) as IPCResponse<Conversation>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toMatch(/NOT_FOUND|DB_ERROR/);
      }
    });

    it("CH-CU-03: should return error for empty id", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.UPDATE);
      if (!handler) {
        throw new Error("conversation:update handler not registered");
      }

      const result = (await handler(
        {},
        {
          id: "",
          data: { title: "New Title" },
        },
      )) as IPCResponse<Conversation>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });
  });

  // ===========================================================================
  // 2.5 conversation:delete
  // ===========================================================================

  describe("conversation:delete", () => {
    it("CH-CD-01: should delete conversation", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.DELETE);
      if (!handler) {
        throw new Error("conversation:delete handler not registered");
      }

      const result = (await handler(
        {},
        {
          id: "conv-1",
        },
      )) as IPCResponse<{ deleted: boolean }>;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.deleted).toBe(true);
      }
      expect(mockRepository.deleteConversation).toHaveBeenCalledWith("conv-1");
    });

    it("CH-CD-02: should return error on Repository error", async () => {
      mockRepository.deleteConversation.mockImplementation(() => {
        throw new Error("Database error");
      });

      const handler = handlers.get(CONVERSATION_CHANNELS.DELETE);
      if (!handler) {
        throw new Error("conversation:delete handler not registered");
      }

      const result = (await handler(
        {},
        {
          id: "conv-1",
        },
      )) as IPCResponse<{ deleted: boolean }>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("DB_ERROR");
      }
    });

    it("CH-CD-03: should return error for empty id", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.DELETE);
      if (!handler) {
        throw new Error("conversation:delete handler not registered");
      }

      const result = (await handler(
        {},
        {
          id: "",
        },
      )) as IPCResponse<{ deleted: boolean }>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });
  });

  // ===========================================================================
  // 2.6 conversation:addMessage
  // ===========================================================================

  describe("conversation:addMessage", () => {
    it("CH-AM-01: should add message to conversation", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.ADD_MESSAGE);
      if (!handler) {
        throw new Error("conversation:addMessage handler not registered");
      }

      const result = (await handler(
        {},
        {
          sessionId: "conv-1",
          message: {
            role: "user",
            content: "Hello!",
          },
        },
      )) as IPCResponse<Message>;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBeDefined();
      }
      expect(mockRepository.addMessage).toHaveBeenCalled();
    });

    it("CH-AM-02: should save LLM metadata", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.ADD_MESSAGE);
      if (!handler) {
        throw new Error("conversation:addMessage handler not registered");
      }

      await handler(
        {},
        {
          sessionId: "conv-1",
          message: {
            role: "assistant",
            content: "AI response",
            llmProvider: "openai",
            llmModel: "gpt-4",
            llmMetadata: { tokensUsed: 100 },
          },
        },
      );

      expect(mockRepository.addMessage).toHaveBeenCalledWith(
        "conv-1",
        expect.objectContaining({
          llmProvider: "openai",
          llmModel: "gpt-4",
          llmMetadata: { tokensUsed: 100 },
        }),
      );
    });

    it("CH-AM-03: should return error for non-existent session", async () => {
      mockRepository.addMessage.mockImplementation(() => {
        throw new Error("Session not found");
      });

      const handler = handlers.get(CONVERSATION_CHANNELS.ADD_MESSAGE);
      if (!handler) {
        throw new Error("conversation:addMessage handler not registered");
      }

      const result = (await handler(
        {},
        {
          sessionId: "non-existent",
          message: {
            role: "user",
            content: "Hello",
          },
        },
      )) as IPCResponse<Message>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toMatch(/NOT_FOUND|DB_ERROR/);
      }
    });

    it("CH-AM-04: should return error for empty sessionId", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.ADD_MESSAGE);
      if (!handler) {
        throw new Error("conversation:addMessage handler not registered");
      }

      const result = (await handler(
        {},
        {
          sessionId: "",
          message: {
            role: "user",
            content: "Hello",
          },
        },
      )) as IPCResponse<Message>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("CH-AM-05: should return error for empty content", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.ADD_MESSAGE);
      if (!handler) {
        throw new Error("conversation:addMessage handler not registered");
      }

      const result = (await handler(
        {},
        {
          sessionId: "conv-1",
          message: {
            role: "user",
            content: "",
          },
        },
      )) as IPCResponse<Message>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });
  });

  // ===========================================================================
  // 2.7 conversation:search
  // ===========================================================================

  describe("conversation:search", () => {
    it("CH-CS-01: should search conversations", async () => {
      const mockData: ConversationSummary[] = [
        {
          id: "conv-1",
          title: "TypeScript Tutorial",
          createdAt: "2026-01-10T00:00:00Z",
          updatedAt: "2026-01-10T00:00:00Z",
          messageCount: 5,
          lastMessagePreview: "Hello...",
          isFavorite: false,
          isPinned: false,
        },
      ];
      mockRepository.searchConversations.mockReturnValue(mockData);

      const handler = handlers.get(CONVERSATION_CHANNELS.SEARCH);
      if (!handler) {
        throw new Error("conversation:search handler not registered");
      }

      const result = (await handler(
        {},
        {
          userId: "local-user",
          query: "TypeScript",
        },
      )) as IPCResponse<ConversationSummary[]>;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
      }
    });

    it("CH-CS-02: should return empty array when no match", async () => {
      mockRepository.searchConversations.mockReturnValue([]);

      const handler = handlers.get(CONVERSATION_CHANNELS.SEARCH);
      if (!handler) {
        throw new Error("conversation:search handler not registered");
      }

      const result = (await handler(
        {},
        {
          userId: "local-user",
          query: "NonExistent",
        },
      )) as IPCResponse<ConversationSummary[]>;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it("CH-CS-03: should return error on Repository error", async () => {
      mockRepository.searchConversations.mockImplementation(() => {
        throw new Error("Database error");
      });

      const handler = handlers.get(CONVERSATION_CHANNELS.SEARCH);
      if (!handler) {
        throw new Error("conversation:search handler not registered");
      }

      const result = (await handler(
        {},
        {
          userId: "local-user",
          query: "test",
        },
      )) as IPCResponse<ConversationSummary[]>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("DB_ERROR");
      }
    });
  });

  // ===========================================================================
  // Handler Registration
  // ===========================================================================

  describe("registerConversationHandlers", () => {
    it("should register all conversation IPC handlers", () => {
      const expectedChannels = Object.values(CONVERSATION_CHANNELS);
      expectedChannels.forEach((channel) => {
        expect(handlers.has(channel)).toBe(true);
      });
    });
  });

  // ===========================================================================
  // Phase 6 - Additional Edge Case Tests
  // ===========================================================================

  describe("Edge Cases - Validation", () => {
    it("EC-VAL-01: should return error for whitespace-only userId", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.LIST);
      if (!handler) throw new Error("conversation:list handler not registered");

      const result = (await handler({}, { userId: "   " })) as IPCResponse<
        ConversationSummary[]
      >;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("EC-VAL-02: should return error for whitespace-only id", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.GET);
      if (!handler) throw new Error("conversation:get handler not registered");

      const result = (await handler(
        {},
        { id: "   " },
      )) as IPCResponse<Conversation>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("EC-VAL-03: should return error for whitespace-only title", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.CREATE);
      if (!handler)
        throw new Error("conversation:create handler not registered");

      const result = (await handler(
        {},
        { userId: "local-user", title: "   " },
      )) as IPCResponse<Conversation>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("EC-VAL-04: should return error for whitespace-only message content", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.ADD_MESSAGE);
      if (!handler)
        throw new Error("conversation:addMessage handler not registered");

      const result = (await handler(
        {},
        {
          sessionId: "conv-1",
          message: { role: "user", content: "   " },
        },
      )) as IPCResponse<Message>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("EC-VAL-05: should return error for missing message object", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.ADD_MESSAGE);
      if (!handler)
        throw new Error("conversation:addMessage handler not registered");

      const result = (await handler(
        {},
        { sessionId: "conv-1" },
      )) as IPCResponse<Message>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("EC-VAL-06: should return error for null message content", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.ADD_MESSAGE);
      if (!handler)
        throw new Error("conversation:addMessage handler not registered");

      const result = (await handler(
        {},
        {
          sessionId: "conv-1",
          message: { role: "user", content: null },
        },
      )) as IPCResponse<Message>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("EC-VAL-07: should return error for empty search userId", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.SEARCH);
      if (!handler)
        throw new Error("conversation:search handler not registered");

      const result = (await handler(
        {},
        { userId: "", query: "test" },
      )) as IPCResponse<ConversationSummary[]>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("EC-VAL-08: should return error for whitespace-only search userId", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.SEARCH);
      if (!handler)
        throw new Error("conversation:search handler not registered");

      const result = (await handler(
        {},
        { userId: "   ", query: "test" },
      )) as IPCResponse<ConversationSummary[]>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("EC-VAL-09: should return error for empty search query", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.SEARCH);
      if (!handler)
        throw new Error("conversation:search handler not registered");

      const result = (await handler(
        {},
        { userId: "local-user", query: "" },
      )) as IPCResponse<ConversationSummary[]>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("EC-VAL-10: should return error for whitespace-only search query", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.SEARCH);
      if (!handler)
        throw new Error("conversation:search handler not registered");

      const result = (await handler(
        {},
        { userId: "local-user", query: "   " },
      )) as IPCResponse<ConversationSummary[]>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });
  });

  describe("Edge Cases - Error Handling", () => {
    it("EC-ERR-01: should handle NOT_FOUND error code", async () => {
      mockRepository.updateConversation.mockImplementation(() => {
        throw new Error("Conversation not found");
      });

      const handler = handlers.get(CONVERSATION_CHANNELS.UPDATE);
      if (!handler)
        throw new Error("conversation:update handler not registered");

      const result = (await handler(
        {},
        { id: "missing-id", data: { title: "New" } },
      )) as IPCResponse<Conversation>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });

    it("EC-ERR-02: should handle generic error", async () => {
      mockRepository.listConversations.mockImplementation(() => {
        throw new Error("Unexpected internal error");
      });

      const handler = handlers.get(CONVERSATION_CHANNELS.LIST);
      if (!handler) throw new Error("conversation:list handler not registered");

      const result = (await handler(
        {},
        { userId: "local-user" },
      )) as IPCResponse<ConversationSummary[]>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("DB_ERROR");
        expect(result.error.message).toBe("Unexpected internal error");
      }
    });

    it("EC-ERR-03: should handle non-Error thrown objects", async () => {
      mockRepository.listConversations.mockImplementation(() => {
        throw "String error";
      });

      const handler = handlers.get(CONVERSATION_CHANNELS.LIST);
      if (!handler) throw new Error("conversation:list handler not registered");

      const result = (await handler(
        {},
        { userId: "local-user" },
      )) as IPCResponse<ConversationSummary[]>;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("UNKNOWN_ERROR");
      }
    });
  });

  describe("Edge Cases - Data Integrity", () => {
    it("EC-DI-01: should pass optional limit and offset correctly", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.LIST);
      if (!handler) throw new Error("conversation:list handler not registered");

      await handler({}, { userId: "local-user" });

      expect(mockRepository.listConversations).toHaveBeenCalledWith(
        "local-user",
        expect.objectContaining({}),
      );
    });

    it("EC-DI-02: should pass optional includeDeleted correctly", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.LIST);
      if (!handler) throw new Error("conversation:list handler not registered");

      await handler(
        {},
        { userId: "local-user", limit: 10, offset: 0, includeDeleted: true },
      );

      expect(mockRepository.listConversations).toHaveBeenCalledWith(
        "local-user",
        expect.objectContaining({ includeDeleted: true }),
      );
    });

    it("EC-DI-03: should pass update data with all optional fields", async () => {
      const handler = handlers.get(CONVERSATION_CHANNELS.UPDATE);
      if (!handler)
        throw new Error("conversation:update handler not registered");

      await handler(
        {},
        {
          id: "conv-1",
          data: {
            title: "New Title",
            isFavorite: true,
            isPinned: true,
            pinOrder: 1,
            metadata: { custom: true },
          },
        },
      );

      expect(mockRepository.updateConversation).toHaveBeenCalledWith(
        "conv-1",
        expect.objectContaining({
          title: "New Title",
          isFavorite: true,
          isPinned: true,
          pinOrder: 1,
          metadata: { custom: true },
        }),
      );
    });
  });
});
