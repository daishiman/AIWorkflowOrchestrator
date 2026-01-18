import { describe, it, expect, beforeEach, vi } from "vitest";
import type {
  PersistedSession,
  PersistedMessage,
  StorageStats,
  CleanupResult,
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

describe("SessionPersistenceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadSessions", () => {
    it("should return empty array when no sessions exist", async () => {
      // TDD Red: このテストは実装がないため失敗する
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const sessions = await service.loadSessions();

      expect(sessions).toEqual([]);
    });

    it("should return all persisted sessions", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const mockSession = createMockSession();
      await service.saveSession(mockSession);

      const sessions = await service.loadSessions();

      expect(sessions).toHaveLength(1);
      // saveSessionはlastAccessedAtを自動更新するため、その他のプロパティを比較
      expect(sessions[0].id).toBe(mockSession.id);
      expect(sessions[0].createdAt).toBe(mockSession.createdAt);
      expect(sessions[0].isActive).toBe(mockSession.isActive);
      expect(sessions[0].messageCount).toBe(mockSession.messageCount);
      expect(sessions[0].title).toBe(mockSession.title);
      expect(sessions[0].lastAccessedAt).toBeGreaterThanOrEqual(
        mockSession.lastAccessedAt,
      );
    });

    it("should sort sessions by lastAccessedAt descending", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      // 先に保存するセッション（saveSessionでlastAccessedAtが更新される）
      const firstSession = createMockSession();
      await service.saveSession(firstSession);

      // 少し待ってから2つ目を保存（lastAccessedAtに差をつける）
      await new Promise((resolve) => setTimeout(resolve, 5));
      const secondSession = createMockSession();
      await service.saveSession(secondSession);

      const sessions = await service.loadSessions();

      // 後から保存されたセッションが先頭（lastAccessedAt降順）
      expect(sessions[0].id).toBe(secondSession.id);
      expect(sessions[1].id).toBe(firstSession.id);
      expect(sessions[0].lastAccessedAt).toBeGreaterThan(
        sessions[1].lastAccessedAt,
      );
    });
  });

  describe("saveSession", () => {
    it("should save a new session", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const session = createMockSession();
      await service.saveSession(session);

      const sessions = await service.loadSessions();
      expect(sessions).toContainEqual(session);
    });

    it("should update lastAccessedAt when saving", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const session = createMockSession({ lastAccessedAt: 1000 });
      const beforeSave = Date.now();
      await service.saveSession(session);

      const sessions = await service.loadSessions();
      expect(sessions[0].lastAccessedAt).toBeGreaterThanOrEqual(beforeSave);
    });

    it("should validate session data with Zod schema", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const invalidSession = {
        id: "not-a-uuid",
        createdAt: "invalid",
      } as unknown as PersistedSession;

      await expect(service.saveSession(invalidSession)).rejects.toThrow();
    });
  });

  describe("deleteSession", () => {
    it("should delete a session by id", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const session = createMockSession();
      await service.saveSession(session);
      await service.deleteSession(session.id);

      const sessions = await service.loadSessions();
      expect(sessions).not.toContainEqual(session);
    });

    it("should delete associated messages when deleting session", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const session = createMockSession();
      const message = createMockMessage(session.id);

      await service.saveSession(session);
      await service.saveMessage(message);
      await service.deleteSession(session.id);

      const messages = await service.loadMessages(session.id);
      expect(messages).toEqual([]);
    });

    it("should throw error when session not found", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      await expect(service.deleteSession("non-existent-id")).rejects.toThrow();
    });
  });

  describe("updateSession", () => {
    it("should update session fields", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const session = createMockSession({ title: "Original" });
      await service.saveSession(session);
      await service.updateSession(session.id, { title: "Updated" });

      const sessions = await service.loadSessions();
      expect(sessions[0].title).toBe("Updated");
    });

    it("should not update id or createdAt", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const session = createMockSession();
      const originalCreatedAt = session.createdAt;
      await service.saveSession(session);

      await service.updateSession(session.id, {
        createdAt: Date.now() + 10000,
      } as Partial<PersistedSession>);

      const sessions = await service.loadSessions();
      expect(sessions[0].createdAt).toBe(originalCreatedAt);
    });
  });

  describe("loadMessages", () => {
    it("should return empty array when no messages exist", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const messages = await service.loadMessages("some-session-id");

      expect(messages).toEqual([]);
    });

    it("should return messages for a specific session", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const session = createMockSession();
      const message = createMockMessage(session.id);

      await service.saveSession(session);
      await service.saveMessage(message);

      const messages = await service.loadMessages(session.id);

      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
    });

    it("should support pagination with limit and offset", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const session = createMockSession();
      await service.saveSession(session);

      for (let i = 0; i < 10; i++) {
        await service.saveMessage(
          createMockMessage(session.id, { content: `Message ${i}` }),
        );
      }

      const messages = await service.loadMessages(session.id, {
        limit: 5,
        offset: 2,
      });

      expect(messages).toHaveLength(5);
    });
  });

  describe("saveMessage", () => {
    it("should save a message", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const session = createMockSession();
      const message = createMockMessage(session.id);

      await service.saveSession(session);
      await service.saveMessage(message);

      const messages = await service.loadMessages(session.id);
      expect(messages).toContainEqual(message);
    });

    it("should update session messageCount", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const session = createMockSession({ messageCount: 0 });
      await service.saveSession(session);
      await service.saveMessage(createMockMessage(session.id));

      const sessions = await service.loadSessions();
      expect(sessions[0].messageCount).toBe(1);
    });

    it("should validate message data with Zod schema", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const invalidMessage = {
        id: "not-a-uuid",
        role: "invalid",
      } as unknown as PersistedMessage;

      await expect(service.saveMessage(invalidMessage)).rejects.toThrow();
    });
  });

  describe("clearAll", () => {
    it("should delete all sessions and messages", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const session = createMockSession();
      await service.saveSession(session);
      await service.saveMessage(createMockMessage(session.id));

      await service.clearAll();

      const sessions = await service.loadSessions();
      const messages = await service.loadMessages(session.id);

      expect(sessions).toEqual([]);
      expect(messages).toEqual([]);
    });
  });

  describe("getStorageStats", () => {
    it("should return storage statistics", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const stats: StorageStats = await service.getStorageStats();

      expect(stats).toHaveProperty("totalSessions");
      expect(stats).toHaveProperty("totalMessages");
      expect(stats).toHaveProperty("usedSize");
      expect(stats).toHaveProperty("maxSize");
      expect(stats).toHaveProperty("usageRatio");
      expect(stats).toHaveProperty("lastUpdated");
    });

    it("should calculate correct session and message counts", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService();

      const session1 = createMockSession();
      const session2 = createMockSession();
      await service.saveSession(session1);
      await service.saveSession(session2);
      await service.saveMessage(createMockMessage(session1.id));
      await service.saveMessage(createMockMessage(session1.id));

      const stats = await service.getStorageStats();

      expect(stats.totalSessions).toBe(2);
      expect(stats.totalMessages).toBe(2);
    });
  });

  describe("enforceStorageLimits (LRU)", () => {
    it("should delete oldest sessions when storage limit exceeded", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService({
        maxSessions: 2,
      });

      const oldSession = createMockSession({
        lastAccessedAt: Date.now() - 20000,
      });
      const midSession = createMockSession({
        lastAccessedAt: Date.now() - 10000,
      });
      const newSession = createMockSession({ lastAccessedAt: Date.now() });

      await service.saveSession(oldSession);
      await service.saveSession(midSession);
      await service.saveSession(newSession);

      const result: CleanupResult = await service.enforceStorageLimits();

      expect(result.deletedSessions).toBe(1);
      expect(result.deletedSessionIds).toContain(oldSession.id);

      const sessions = await service.loadSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions.map((s) => s.id)).not.toContain(oldSession.id);
    });

    it("should trigger cleanup when storage reaches warning threshold", async () => {
      const { SessionPersistenceService } =
        await import("../SessionPersistenceService");
      const service = new SessionPersistenceService({
        maxStorageSize: 1000,
        lruWarningThreshold: 0.9,
      });

      // 大きなデータを保存してしきい値を超える
      const session = createMockSession();
      await service.saveSession(session);

      const largeMessage = createMockMessage(session.id, {
        content: "x".repeat(900),
      });
      await service.saveMessage(largeMessage);

      const stats = await service.getStorageStats();
      expect(stats.usageRatio).toBeGreaterThanOrEqual(0.9);
    });
  });
});
