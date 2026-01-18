import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type {
  PersistedSession,
  PersistedMessage,
  StorageMetadata,
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

describe("SessionStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with default schema", async () => {
      // TDD Red: このテストは実装がないため失敗する
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      expect(storage).toBeDefined();
    });

    it("should accept custom store name", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage({ name: "custom-sessions" });

      expect(storage).toBeDefined();
    });
  });

  describe("getSessions", () => {
    it("should return empty array when no sessions exist", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const sessions = storage.getSessions();

      expect(sessions).toEqual([]);
    });

    it("should return all stored sessions", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const mockSession = createMockSession();
      storage.setSessions([mockSession]);

      const sessions = storage.getSessions();

      expect(sessions).toHaveLength(1);
      expect(sessions[0]).toEqual(mockSession);
    });
  });

  describe("setSessions", () => {
    it("should store sessions", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const sessions = [createMockSession(), createMockSession()];
      storage.setSessions(sessions);

      const stored = storage.getSessions();
      expect(stored).toHaveLength(2);
    });

    it("should overwrite existing sessions", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      storage.setSessions([createMockSession()]);
      storage.setSessions([createMockSession(), createMockSession()]);

      const stored = storage.getSessions();
      expect(stored).toHaveLength(2);
    });

    it("should update metadata lastUpdated", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const beforeUpdate = Date.now();
      storage.setSessions([createMockSession()]);

      const metadata = storage.getMetadata();
      expect(metadata.lastUpdated).toBeGreaterThanOrEqual(beforeUpdate);
    });
  });

  describe("getMessages", () => {
    it("should return empty array when no messages exist for session", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const messages = storage.getMessages("some-session-id");

      expect(messages).toEqual([]);
    });

    it("should return messages for specific session", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const sessionId = crypto.randomUUID();
      const message = createMockMessage(sessionId);
      storage.setMessages(sessionId, [message]);

      const messages = storage.getMessages(sessionId);

      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
    });
  });

  describe("setMessages", () => {
    it("should store messages for a session", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const sessionId = crypto.randomUUID();
      const messages = [
        createMockMessage(sessionId),
        createMockMessage(sessionId),
      ];
      storage.setMessages(sessionId, messages);

      const stored = storage.getMessages(sessionId);
      expect(stored).toHaveLength(2);
    });

    it("should not affect other sessions' messages", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const sessionId1 = crypto.randomUUID();
      const sessionId2 = crypto.randomUUID();

      storage.setMessages(sessionId1, [createMockMessage(sessionId1)]);
      storage.setMessages(sessionId2, [
        createMockMessage(sessionId2),
        createMockMessage(sessionId2),
      ]);

      expect(storage.getMessages(sessionId1)).toHaveLength(1);
      expect(storage.getMessages(sessionId2)).toHaveLength(2);
    });
  });

  describe("deleteMessages", () => {
    it("should delete messages for a session", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const sessionId = crypto.randomUUID();
      storage.setMessages(sessionId, [createMockMessage(sessionId)]);
      storage.deleteMessages(sessionId);

      const messages = storage.getMessages(sessionId);
      expect(messages).toEqual([]);
    });
  });

  describe("getMetadata", () => {
    it("should return storage metadata", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const metadata = storage.getMetadata();

      expect(metadata).toHaveProperty("version");
      expect(metadata).toHaveProperty("lastUpdated");
      expect(metadata).toHaveProperty("totalSize");
    });

    it("should have default version 1.0.0", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const metadata = storage.getMetadata();

      expect(metadata.version).toBe("1.0.0");
    });
  });

  describe("setMetadata", () => {
    it("should update metadata", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const newMetadata: StorageMetadata = {
        version: "1.1.0",
        lastUpdated: Date.now(),
        totalSize: 1000,
      };
      storage.setMetadata(newMetadata);

      const metadata = storage.getMetadata();
      expect(metadata.version).toBe("1.1.0");
      expect(metadata.totalSize).toBe(1000);
    });
  });

  describe("clear", () => {
    it("should clear all data", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const session = createMockSession();
      storage.setSessions([session]);
      storage.setMessages(session.id, [createMockMessage(session.id)]);

      storage.clear();

      expect(storage.getSessions()).toEqual([]);
      expect(storage.getMessages(session.id)).toEqual([]);
    });

    it("should reset metadata to defaults", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      storage.setMetadata({
        version: "2.0.0",
        lastUpdated: Date.now(),
        totalSize: 5000,
      });

      storage.clear();

      const metadata = storage.getMetadata();
      expect(metadata.version).toBe("1.0.0");
      expect(metadata.totalSize).toBe(0);
    });
  });

  describe("calculateSize", () => {
    it("should calculate approximate storage size", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const session = createMockSession();
      storage.setSessions([session]);

      const size = storage.calculateSize();

      expect(size).toBeGreaterThan(0);
    });

    it("should include messages in size calculation", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const session = createMockSession();
      storage.setSessions([session]);
      const sizeWithoutMessages = storage.calculateSize();

      storage.setMessages(session.id, [
        createMockMessage(session.id, {
          content: "Large content ".repeat(100),
        }),
      ]);
      const sizeWithMessages = storage.calculateSize();

      expect(sizeWithMessages).toBeGreaterThan(sizeWithoutMessages);
    });
  });

  describe("validation", () => {
    it("should validate session data on set", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const invalidSession = {
        id: "not-a-uuid",
        createdAt: "invalid",
      } as unknown as PersistedSession;

      expect(() => storage.setSessions([invalidSession])).toThrow();
    });

    it("should validate message data on set", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      const invalidMessage = {
        id: "not-a-uuid",
        role: "invalid",
      } as unknown as PersistedMessage;

      expect(() =>
        storage.setMessages("session-id", [invalidMessage]),
      ).toThrow();
    });

    it("should skip invalid sessions when loading", async () => {
      const { SessionStorage } = await import("../SessionStorage");
      const storage = new SessionStorage();

      // 内部的に不正なデータがある場合のテスト
      // 実装でskipInvalidをサポートする場合
      const sessions = storage.getSessions({ skipInvalid: true });

      expect(Array.isArray(sessions)).toBe(true);
    });
  });
});
