/**
 * PermissionStore Integration Tests
 *
 * TASK-3-1-E: rememberChoice機能永続化
 * Phase 5: 実装完了（TDD: Green）
 *
 * 統合テスト: データフロー、エラーハンドリング、状態同期
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { AllowedToolEntry, PermissionStoreSchema } from "@repo/shared";

// electron-store モック
let mockStoreData: PermissionStoreSchema = {
  version: 1,
  allowedTools: [],
  updatedAt: new Date().toISOString(),
};

const mockStore = {
  get store() {
    return mockStoreData;
  },
  set store(value: PermissionStoreSchema) {
    mockStoreData = value;
  },
  get: vi.fn((key: string) => {
    if (key === "allowedTools") return mockStoreData.allowedTools;
    return mockStoreData;
  }),
  set: vi.fn((data: PermissionStoreSchema | Record<string, unknown>) => {
    if (typeof data === "object" && "allowedTools" in data) {
      mockStoreData = data as PermissionStoreSchema;
    }
  }),
  clear: vi.fn(() => {
    mockStoreData = {
      version: 1,
      allowedTools: [],
      updatedAt: new Date().toISOString(),
    };
  }),
};

vi.mock("electron-store", () => ({
  default: vi.fn(() => mockStore),
}));

import { PermissionStore } from "../PermissionStore";

describe("PermissionStore Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreData = {
      version: 1,
      allowedTools: [],
      updatedAt: new Date().toISOString(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =================================================================
  // データフローテスト: 許可→永続化→再読み込み
  // =================================================================

  describe("データフローテスト: 許可→永続化→再読み込み", () => {
    it("ツール許可がストアに永続化される", () => {
      const store = new PermissionStore();
      store.allowTool("Read");
      store.allowTool("Write");

      expect(mockStore.set).toHaveBeenCalled();

      // 永続化されたデータに Read と Write が含まれる
      const lastCall =
        mockStore.set.mock.calls[mockStore.set.mock.calls.length - 1];
      const savedData = lastCall[0] as PermissionStoreSchema;
      expect(savedData.allowedTools).toHaveLength(2);
      expect(savedData.allowedTools.map((e) => e.toolName)).toContain("Read");
      expect(savedData.allowedTools.map((e) => e.toolName)).toContain("Write");
    });

    it("再起動時に永続化されたツールが読み込まれる", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [
          { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
          { toolName: "Glob", allowedAt: "2026-01-25T12:05:00.000Z" },
        ],
        updatedAt: "2026-01-25T12:05:00.000Z",
      };

      const store = new PermissionStore();

      expect(store.isToolAllowed("Read")).toBe(true);
      expect(store.isToolAllowed("Glob")).toBe(true);
      expect(store.isToolAllowed("Write")).toBe(false);
    });

    it("許可→永続化→再読み込み→自動許可の完全フロー", () => {
      const store1 = new PermissionStore();
      store1.allowTool("Read");

      // ストアに保存されたデータを取得
      const savedData = mockStore.set.mock.calls[0][0] as PermissionStoreSchema;

      // 再起動をシミュレート
      mockStoreData = savedData;
      const store2 = new PermissionStore();

      expect(store2.isToolAllowed("Read")).toBe(true);
    });

    it("削除→永続化→再読み込みの完全フロー", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [
          { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
          { toolName: "Write", allowedAt: "2026-01-25T12:05:00.000Z" },
        ],
        updatedAt: "2026-01-25T12:05:00.000Z",
      };

      const store1 = new PermissionStore();
      expect(store1.isToolAllowed("Read")).toBe(true);
      store1.revokeTool("Read");

      // 再起動シミュレート
      const savedData = mockStore.set.mock.calls[0][0] as PermissionStoreSchema;
      mockStoreData = savedData;
      const store2 = new PermissionStore();

      expect(store2.isToolAllowed("Read")).toBe(false);
      expect(store2.isToolAllowed("Write")).toBe(true);
    });
  });

  // =================================================================
  // エラーハンドリングテスト: 設定ファイル破損回復
  // =================================================================

  describe("エラーハンドリングテスト: 設定ファイル破損回復", () => {
    it("破損したスキーマでデフォルト状態に回復する", () => {
      mockStoreData = {
        version: "invalid",
        allowedTools: "not-an-array",
        updatedAt: 12345,
      } as unknown as PermissionStoreSchema;

      const store = new PermissionStore();

      expect(store.getAllowedTools()).toEqual([]);
      expect(mockStore.clear).toHaveBeenCalled();
    });

    it("不完全なエントリでデフォルト状態に回復する", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [{ allowedAt: "2026-01-25T12:00:00.000Z" }],
        updatedAt: "2026-01-25T12:00:00.000Z",
      } as unknown as PermissionStoreSchema;

      const store = new PermissionStore();

      expect(store.getAllowedTools()).toEqual([]);
    });

    it("null データでデフォルト状態に回復する", () => {
      mockStoreData = null as unknown as PermissionStoreSchema;

      const store = new PermissionStore();

      expect(store.getAllowedTools()).toEqual([]);
    });

    it("書き込みエラー後も読み取りが動作する", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [],
        updatedAt: new Date().toISOString(),
      };
      mockStore.set.mockImplementationOnce(() => {
        throw new Error("Disk full");
      });

      const store = new PermissionStore();
      store.allowTool("Read");

      expect(store.isToolAllowed("Read")).toBe(true);
    });

    it("読み取りエラー後もインスタンスが使用可能", () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(
        mockStore,
        "store",
      );
      Object.defineProperty(mockStore, "store", {
        get: () => {
          throw new Error("File corrupted");
        },
        configurable: true,
      });

      const store = new PermissionStore();

      expect(store.getAllowedTools()).toEqual([]);
      store.allowTool("Read");
      expect(store.isToolAllowed("Read")).toBe(true);

      // クリーンアップ
      if (originalDescriptor) {
        Object.defineProperty(mockStore, "store", originalDescriptor);
      } else {
        Object.defineProperty(mockStore, "store", {
          get: () => mockStoreData,
          configurable: true,
        });
      }
    });
  });

  // =================================================================
  // 状態同期テスト
  // =================================================================

  describe("状態同期テスト", () => {
    it("キャッシュとストアが同期される", () => {
      const store = new PermissionStore();
      store.allowTool("Read");
      store.allowTool("Write");
      store.revokeTool("Read");

      // キャッシュの状態
      expect(store.isToolAllowed("Read")).toBe(false);
      expect(store.isToolAllowed("Write")).toBe(true);

      // ストアの状態
      const lastCall =
        mockStore.set.mock.calls[mockStore.set.mock.calls.length - 1];
      const savedData = lastCall[0] as PermissionStoreSchema;
      expect(savedData.allowedTools).toHaveLength(1);
      expect(savedData.allowedTools[0].toolName).toBe("Write");
    });

    it("clearAll がキャッシュとストアを同時にクリアする", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [
          { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
          { toolName: "Write", allowedAt: "2026-01-25T12:05:00.000Z" },
        ],
        updatedAt: "2026-01-25T12:05:00.000Z",
      };

      const store = new PermissionStore();
      expect(store.getAllowedTools()).toHaveLength(2);
      store.clearAll();

      // キャッシュがクリアされた
      expect(store.getAllowedTools()).toHaveLength(0);

      // ストアがクリアされた
      const lastCall =
        mockStore.set.mock.calls[mockStore.set.mock.calls.length - 1];
      const savedData = lastCall[0] as PermissionStoreSchema;
      expect(savedData.allowedTools).toHaveLength(0);
    });

    it("updatedAt が操作ごとに更新される", async () => {
      const store = new PermissionStore();
      store.allowTool("Read");
      const firstUpdate = mockStore.set.mock
        .calls[0][0] as PermissionStoreSchema;

      await new Promise((resolve) => setTimeout(resolve, 10));
      store.allowTool("Write");
      const secondUpdate = mockStore.set.mock
        .calls[1][0] as PermissionStoreSchema;

      expect(new Date(secondUpdate.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(firstUpdate.updatedAt).getTime(),
      );
    });
  });

  // =================================================================
  // スキーママイグレーションテスト（将来の拡張用）
  // =================================================================

  describe("スキーママイグレーション", () => {
    it("バージョン1のスキーマを正しく読み込む", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [
          { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
        ],
        updatedAt: "2026-01-25T12:00:00.000Z",
      };

      const store = new PermissionStore();

      expect(store.isToolAllowed("Read")).toBe(true);
    });

    it("未知のバージョンでも可能な限りデータを保持する", () => {
      mockStoreData = {
        version: 999,
        allowedTools: [
          { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
        ],
        updatedAt: "2026-01-25T12:00:00.000Z",
        futureField: "unknown",
      } as PermissionStoreSchema;

      const store = new PermissionStore();

      expect(store.isToolAllowed("Read")).toBe(true);
    });
  });
});

/**
 * Phase 6: 負荷テスト・並行処理テスト
 */
describe("PermissionStore - Load and Concurrency Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreData = {
      version: 1,
      allowedTools: [],
      updatedAt: new Date().toISOString(),
    };
  });

  describe("大量データテスト", () => {
    it("100個のツールを許可できる", () => {
      const store = new PermissionStore();
      for (let i = 0; i < 100; i++) {
        store.allowTool(`Tool${i}`);
      }

      expect(store.getAllowedTools()).toHaveLength(100);
      expect(store.isToolAllowed("Tool50")).toBe(true);
    });

    it("大量のツール名でも isToolAllowed が高速に動作する", () => {
      const manyTools: AllowedToolEntry[] = [];
      for (let i = 0; i < 10000; i++) {
        manyTools.push({
          toolName: `Tool${i}`,
          allowedAt: new Date().toISOString(),
        });
      }
      mockStoreData = {
        version: 1,
        allowedTools: manyTools,
        updatedAt: new Date().toISOString(),
      };

      const store = new PermissionStore();
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        store.isToolAllowed(`Tool${Math.floor(Math.random() * 10000)}`);
      }
      const elapsed = performance.now() - start;

      // 1万回のランダムアクセスが 200ms 以内（CI環境でのフレイキーテスト対策）
      expect(elapsed).toBeLessThan(200);
    });
  });

  describe("連続操作テスト", () => {
    it("連続した許可と取り消しが正しく動作する", () => {
      const store = new PermissionStore();

      for (let i = 0; i < 10; i++) {
        store.allowTool("Read");
        store.revokeTool("Read");
      }
      store.allowTool("Read");

      expect(store.isToolAllowed("Read")).toBe(true);
      expect(store.getAllowedTools()).toHaveLength(1);
    });
  });
});
