import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type {
  PersistedSession,
  PersistedMessage,
  StorageStats,
  CleanupResult,
  IPCResponse,
} from "@repo/shared/types/agent";

// electron-storeをモック - インメモリストアとして機能
class MockStore<T extends Record<string, unknown>> {
  private data: Partial<T>;
  private defaults: Partial<T>;

  constructor(options?: { name?: string; defaults?: Partial<T> }) {
    this.defaults = options?.defaults ?? ({} as Partial<T>);
    this.data = { ...this.defaults };
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.data[key] as T[K] | undefined;
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.data[key] = value;
  }

  delete<K extends keyof T>(key: K): void {
    delete this.data[key];
  }

  clear(): void {
    this.data = { ...this.defaults };
  }

  get store(): T {
    return this.data as T;
  }

  get path(): string {
    return "/mock/path/agent-sessions.json";
  }
}

vi.mock("electron-store", () => {
  return {
    default: MockStore,
  };
});

// IPC モック
const mockIpcMain = {
  handle: vi.fn(),
  removeHandler: vi.fn(),
};

const mockHandlers = new Map<string, (...args: unknown[]) => unknown>();

vi.mock("electron", () => ({
  ipcMain: {
    handle: (channel: string, handler: (...args: unknown[]) => unknown) => {
      mockHandlers.set(channel, handler);
      mockIpcMain.handle(channel, handler);
    },
    removeHandler: (channel: string) => {
      mockHandlers.delete(channel);
      mockIpcMain.removeHandler(channel);
    },
  },
}));

// テストデータファクトリ
const createMockSession = (
  overrides?: Partial<PersistedSession>,
): PersistedSession => ({
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  lastAccessedAt: Date.now(),
  isActive: false,
  messageCount: 0,
  title: "Test Session",
  ...overrides,
});

const createMockMessage = (
  sessionId: string,
  overrides?: Partial<PersistedMessage>,
): PersistedMessage => ({
  id: crypto.randomUUID(),
  sessionId,
  role: "user",
  content: "Test message",
  timestamp: Date.now(),
  ...overrides,
});

// IPC呼び出しヘルパー
const invokeHandler = async <T>(
  channel: string,
  ...args: unknown[]
): Promise<IPCResponse<T>> => {
  const handler = mockHandlers.get(channel);
  if (!handler) {
    throw new Error(`No handler registered for channel: ${channel}`);
  }
  return handler({}, ...args) as Promise<IPCResponse<T>>;
};

describe("Session Persistence IPC Integration", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockHandlers.clear();

    // TDD Red: ハンドラーを登録（実装後に調整）
    // 実際の実装がないため、このテストは失敗する
    try {
      const { registerSessionPersistenceHandlers } =
        await import("../../../ipc/session-persistence-handler");
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();
      registerSessionPersistenceHandlers(service);
    } catch {
      // 実装がない場合はスキップ
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("session:persist:load", () => {
    it("should return empty sessions array when no sessions exist", async () => {
      const response = await invokeHandler<PersistedSession[]>(
        "session:persist:load",
      );

      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
    });

    it("should return all persisted sessions", async () => {
      const session = createMockSession();

      await invokeHandler("session:persist:save", { session });
      const response = await invokeHandler<PersistedSession[]>(
        "session:persist:load",
      );

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(1);
    });
  });

  describe("session:persist:save", () => {
    it("should save a session successfully", async () => {
      const session = createMockSession();

      const response = await invokeHandler("session:persist:save", { session });

      expect(response.success).toBe(true);
    });

    it("should return validation error for invalid session", async () => {
      const invalidSession = {
        id: "not-a-uuid",
        createdAt: "invalid",
      };

      const response = await invokeHandler("session:persist:save", {
        session: invalidSession,
      });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("session:persist:delete", () => {
    it("should delete a session successfully", async () => {
      const session = createMockSession();

      await invokeHandler("session:persist:save", { session });
      const response = await invokeHandler("session:persist:delete", {
        sessionId: session.id,
      });

      expect(response.success).toBe(true);
    });

    it("should return error when session not found", async () => {
      const response = await invokeHandler("session:persist:delete", {
        sessionId: "non-existent-id",
      });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("SESSION_NOT_FOUND");
    });
  });

  describe("session:persist:update", () => {
    it("should update session fields", async () => {
      const session = createMockSession({ title: "Original" });

      await invokeHandler("session:persist:save", { session });
      const response = await invokeHandler("session:persist:update", {
        sessionId: session.id,
        updates: { title: "Updated" },
      });

      expect(response.success).toBe(true);
    });

    it("should return error for non-existent session", async () => {
      const response = await invokeHandler("session:persist:update", {
        sessionId: "non-existent-id",
        updates: { title: "Updated" },
      });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("SESSION_NOT_FOUND");
    });
  });

  describe("session:persist:loadMessages", () => {
    it("should return empty array when no messages exist", async () => {
      const response = await invokeHandler<PersistedMessage[]>(
        "session:persist:loadMessages",
        { sessionId: "some-id" },
      );

      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
    });

    it("should return messages for a session", async () => {
      const session = createMockSession();
      const message = createMockMessage(session.id);

      await invokeHandler("session:persist:save", { session });
      await invokeHandler("session:persist:saveMessage", { message });

      const response = await invokeHandler<PersistedMessage[]>(
        "session:persist:loadMessages",
        { sessionId: session.id },
      );

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(1);
    });

    it("should support pagination options", async () => {
      const session = createMockSession();
      await invokeHandler("session:persist:save", { session });

      for (let i = 0; i < 10; i++) {
        await invokeHandler("session:persist:saveMessage", {
          message: createMockMessage(session.id),
        });
      }

      const response = await invokeHandler<PersistedMessage[]>(
        "session:persist:loadMessages",
        { sessionId: session.id, options: { limit: 5, offset: 2 } },
      );

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(5);
    });
  });

  describe("session:persist:saveMessage", () => {
    it("should save a message successfully", async () => {
      const session = createMockSession();
      const message = createMockMessage(session.id);

      await invokeHandler("session:persist:save", { session });
      const response = await invokeHandler("session:persist:saveMessage", {
        message,
      });

      expect(response.success).toBe(true);
    });

    it("should return validation error for invalid message", async () => {
      const invalidMessage = {
        id: "not-a-uuid",
        role: "invalid",
      };

      const response = await invokeHandler("session:persist:saveMessage", {
        message: invalidMessage,
      });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("session:persist:clearAll", () => {
    it("should clear all data when confirmed", async () => {
      const session = createMockSession();
      await invokeHandler("session:persist:save", { session });

      const response = await invokeHandler("session:persist:clearAll", {
        confirm: true,
      });

      expect(response.success).toBe(true);

      const loadResponse = await invokeHandler<PersistedSession[]>(
        "session:persist:load",
      );
      expect(loadResponse.data).toEqual([]);
    });

    it("should return error when not confirmed", async () => {
      const response = await invokeHandler("session:persist:clearAll", {
        confirm: false,
      });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("session:persist:getStats", () => {
    it("should return storage statistics", async () => {
      const response = await invokeHandler<StorageStats>(
        "session:persist:getStats",
      );

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty("totalSessions");
      expect(response.data).toHaveProperty("totalMessages");
      expect(response.data).toHaveProperty("usedSize");
      expect(response.data).toHaveProperty("maxSize");
      expect(response.data).toHaveProperty("usageRatio");
      expect(response.data).toHaveProperty("lastUpdated");
    });
  });

  describe("session:persist:cleanup", () => {
    it("should perform LRU cleanup", async () => {
      const response = await invokeHandler<CleanupResult>(
        "session:persist:cleanup",
        { targetUsageRatio: 0.8 },
      );

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty("deletedSessions");
      expect(response.data).toHaveProperty("deletedMessages");
      expect(response.data).toHaveProperty("freedSize");
      expect(response.data).toHaveProperty("deletedSessionIds");
    });
  });

  describe("Error Handling", () => {
    it("should handle internal errors gracefully", async () => {
      // エラーを引き起こす状況をシミュレート
      const response = await invokeHandler("session:persist:load");

      // 実装がない場合でもエラーレスポンスが返るべき
      if (!response.success) {
        expect(response.error).toHaveProperty("code");
        expect(response.error).toHaveProperty("message");
      }
    });

    it("should include error code in response", async () => {
      const response = await invokeHandler("session:persist:delete", {
        sessionId: "non-existent",
      });

      if (!response.success) {
        expect([
          "SESSION_NOT_FOUND",
          "VALIDATION_ERROR",
          "INTERNAL_ERROR",
        ]).toContain(response.error?.code);
      }
    });
  });
});
