/**
 * PermissionStore Unit Tests
 *
 * TASK-3-1-E: rememberChoice機能永続化
 * Phase 5: 実装完了（TDD: Green）
 *
 * 権限設定永続化ストアのユニットテスト
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
  get: vi.fn(),
  set: vi.fn(),
  clear: vi.fn(),
};

vi.mock("electron-store", () => ({
  default: vi.fn(() => mockStore),
}));

// PermissionStore のインポート（モック後）
import { PermissionStore } from "../PermissionStore";

describe("PermissionStore", () => {
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
  // isToolAllowed テスト
  // =================================================================

  describe("isToolAllowed", () => {
    it("未許可ツールに対してfalseを返す", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [],
        updatedAt: new Date().toISOString(),
      };

      const store = new PermissionStore();

      expect(store.isToolAllowed("Read")).toBe(false);
    });

    it("許可済みツールに対してtrueを返す", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [
          { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
        ],
        updatedAt: new Date().toISOString(),
      };

      const store = new PermissionStore();

      expect(store.isToolAllowed("Read")).toBe(true);
    });

    it("大文字小文字を区別する", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [
          { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
        ],
        updatedAt: new Date().toISOString(),
      };

      const store = new PermissionStore();

      expect(store.isToolAllowed("read")).toBe(false);
      expect(store.isToolAllowed("READ")).toBe(false);
    });

    it("空文字のツール名に対してfalseを返す", () => {
      const store = new PermissionStore();

      expect(store.isToolAllowed("")).toBe(false);
    });
  });

  // =================================================================
  // allowTool テスト
  // =================================================================

  describe("allowTool", () => {
    it("ツールを許可リストに追加する", () => {
      const store = new PermissionStore();
      store.allowTool("Read");

      expect(store.isToolAllowed("Read")).toBe(true);
      expect(mockStore.set).toHaveBeenCalled();
    });

    it("既に許可済みのツールは重複追加しない（日時は更新）", () => {
      const originalDate = "2026-01-25T10:00:00.000Z";
      mockStoreData = {
        version: 1,
        allowedTools: [{ toolName: "Read", allowedAt: originalDate }],
        updatedAt: originalDate,
      };

      const store = new PermissionStore();
      store.allowTool("Read");

      // リストは1つのまま、日時が更新される
      expect(store.getAllowedTools()).toHaveLength(1);
      const entries = store.getAllowedToolEntries();
      expect(entries[0].allowedAt).not.toBe(originalDate);
    });

    it("許可時にstoreを更新する", () => {
      const store = new PermissionStore();
      store.allowTool("Bash");

      expect(mockStore.set).toHaveBeenCalled();
    });

    it("複数のツールを許可できる", () => {
      const store = new PermissionStore();
      store.allowTool("Read");
      store.allowTool("Write");
      store.allowTool("Glob");

      expect(store.getAllowedTools()).toHaveLength(3);
      expect(store.isToolAllowed("Read")).toBe(true);
      expect(store.isToolAllowed("Write")).toBe(true);
      expect(store.isToolAllowed("Glob")).toBe(true);
    });
  });

  // =================================================================
  // revokeTool テスト
  // =================================================================

  describe("revokeTool", () => {
    it("ツールを許可リストから削除する", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [
          { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
        ],
        updatedAt: new Date().toISOString(),
      };

      const store = new PermissionStore();
      expect(store.isToolAllowed("Read")).toBe(true);
      store.revokeTool("Read");

      expect(store.isToolAllowed("Read")).toBe(false);
    });

    it("存在しないツールの削除は無視する", () => {
      const store = new PermissionStore();

      expect(() => store.revokeTool("NonExistent")).not.toThrow();
    });

    it("削除時にstoreを更新する", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [
          { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
        ],
        updatedAt: new Date().toISOString(),
      };

      const store = new PermissionStore();
      store.revokeTool("Read");

      expect(mockStore.set).toHaveBeenCalled();
    });

    it("存在しないツール削除時はstoreを更新しない", () => {
      const store = new PermissionStore();
      vi.clearAllMocks();
      store.revokeTool("NonExistent");

      expect(mockStore.set).not.toHaveBeenCalled();
    });
  });

  // =================================================================
  // getAllowedTools テスト
  // =================================================================

  describe("getAllowedTools", () => {
    it("許可済みツール一覧を返す", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [
          { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
          { toolName: "Write", allowedAt: "2026-01-25T12:05:00.000Z" },
          { toolName: "Glob", allowedAt: "2026-01-25T12:10:00.000Z" },
        ],
        updatedAt: new Date().toISOString(),
      };

      const store = new PermissionStore();
      const tools = store.getAllowedTools();

      expect(tools).toHaveLength(3);
      expect(tools).toContain("Read");
      expect(tools).toContain("Write");
      expect(tools).toContain("Glob");
    });

    it("許可済みツールがない場合は空配列を返す", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [],
        updatedAt: new Date().toISOString(),
      };

      const store = new PermissionStore();
      const tools = store.getAllowedTools();

      expect(tools).toEqual([]);
    });
  });

  // =================================================================
  // getAllowedToolEntries テスト
  // =================================================================

  describe("getAllowedToolEntries", () => {
    it("許可済みツールの詳細情報を返す", () => {
      const entries: AllowedToolEntry[] = [
        { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
        { toolName: "Write", allowedAt: "2026-01-25T12:05:00.000Z" },
      ];
      mockStoreData = {
        version: 1,
        allowedTools: entries,
        updatedAt: new Date().toISOString(),
      };

      const store = new PermissionStore();
      const result = store.getAllowedToolEntries();

      expect(result).toHaveLength(2);
      expect(result[0].toolName).toBe("Read");
      expect(result[0].allowedAt).toBe("2026-01-25T12:00:00.000Z");
      expect(result[1].toolName).toBe("Write");
    });

    it("空の場合は空配列を返す", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [],
        updatedAt: new Date().toISOString(),
      };

      const store = new PermissionStore();
      const result = store.getAllowedToolEntries();

      expect(result).toEqual([]);
    });
  });

  // =================================================================
  // clearAll テスト
  // =================================================================

  describe("clearAll", () => {
    it("全許可設定をクリアする", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [
          { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
          { toolName: "Write", allowedAt: "2026-01-25T12:05:00.000Z" },
          { toolName: "Glob", allowedAt: "2026-01-25T12:10:00.000Z" },
        ],
        updatedAt: new Date().toISOString(),
      };

      const store = new PermissionStore();
      expect(store.getAllowedTools()).toHaveLength(3);
      store.clearAll();

      expect(store.getAllowedTools()).toHaveLength(0);
      expect(store.isToolAllowed("Read")).toBe(false);
    });

    it("クリア時にstoreを更新する", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [
          { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
        ],
        updatedAt: new Date().toISOString(),
      };

      const store = new PermissionStore();
      store.clearAll();

      expect(mockStore.set).toHaveBeenCalled();
    });

    it("空の状態でクリアしても問題ない", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [],
        updatedAt: new Date().toISOString(),
      };

      const store = new PermissionStore();

      expect(() => store.clearAll()).not.toThrow();
    });
  });

  // =================================================================
  // スキーマバリデーション テスト
  // =================================================================

  describe("Schema Validation", () => {
    it("有効なスキーマをロードする", () => {
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

    it("無効なスキーマ（バージョンなし）でデフォルトにリセットする", () => {
      mockStoreData = {
        allowedTools: [],
        updatedAt: "2026-01-25T12:00:00.000Z",
      } as unknown as PermissionStoreSchema;

      const _store = new PermissionStore();

      expect(mockStore.clear).toHaveBeenCalled();
    });

    it("無効なスキーマ（allowedToolsが配列でない）でデフォルトにリセットする", () => {
      mockStoreData = {
        version: 1,
        allowedTools: "not-an-array",
        updatedAt: "2026-01-25T12:00:00.000Z",
      } as unknown as PermissionStoreSchema;

      const _store = new PermissionStore();

      expect(mockStore.clear).toHaveBeenCalled();
    });

    it("無効なエントリ（toolNameがない）でデフォルトにリセットする", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [{ allowedAt: "2026-01-25T12:00:00.000Z" }],
        updatedAt: "2026-01-25T12:00:00.000Z",
      } as unknown as PermissionStoreSchema;

      const _store = new PermissionStore();

      expect(mockStore.clear).toHaveBeenCalled();
    });
  });

  // =================================================================
  // エラーハンドリング テスト
  // =================================================================

  describe("Error Handling", () => {
    it("読み込みエラー時にデフォルト状態で動作する", () => {
      // ストア読み込み時にエラーを発生させる
      Object.defineProperty(mockStore, "store", {
        get: () => {
          throw new Error("Read error");
        },
        configurable: true,
      });

      const store = new PermissionStore();

      expect(store.getAllowedTools()).toEqual([]);

      // モックを元に戻す
      Object.defineProperty(mockStore, "store", {
        get: () => mockStoreData,
        configurable: true,
      });
    });

    it("書き込みエラー時もキャッシュは維持される", () => {
      mockStoreData = {
        version: 1,
        allowedTools: [],
        updatedAt: new Date().toISOString(),
      };
      mockStore.set.mockImplementation(() => {
        throw new Error("Write error");
      });

      const store = new PermissionStore();
      store.allowTool("Read");

      // キャッシュは更新されている
      expect(store.isToolAllowed("Read")).toBe(true);
    });
  });

  // =================================================================
  // パフォーマンス テスト
  // =================================================================

  describe("Performance", () => {
    it("isToolAllowed は O(1) で動作する（インメモリキャッシュ）", () => {
      // 大量のツールを許可
      const manyTools: AllowedToolEntry[] = [];
      for (let i = 0; i < 1000; i++) {
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
        store.isToolAllowed("Tool500");
      }
      const elapsed = performance.now() - start;

      // 1万回の呼び出しが 100ms 以内に完了
      expect(elapsed).toBeLessThan(100);
    });
  });
});

/**
 * Phase 6: エッジケーステスト
 */
describe("PermissionStore - Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreData = {
      version: 1,
      allowedTools: [],
      updatedAt: new Date().toISOString(),
    };
  });

  describe("特殊なツール名", () => {
    it("日本語のツール名を処理できる", () => {
      const store = new PermissionStore();
      store.allowTool("日本語ツール");
      expect(store.isToolAllowed("日本語ツール")).toBe(true);
    });

    it("特殊文字を含むツール名を処理できる", () => {
      const store = new PermissionStore();
      store.allowTool("tool-with-special_chars.v2");
      expect(store.isToolAllowed("tool-with-special_chars.v2")).toBe(true);
    });

    it("スペースを含むツール名を処理できる", () => {
      const store = new PermissionStore();
      store.allowTool("Tool With Spaces");
      expect(store.isToolAllowed("Tool With Spaces")).toBe(true);
    });
  });

  describe("同時操作", () => {
    it("連続した許可と取り消しを正しく処理する", () => {
      const store = new PermissionStore();
      store.allowTool("Read");
      store.revokeTool("Read");
      store.allowTool("Read");
      expect(store.isToolAllowed("Read")).toBe(true);
      expect(store.getAllowedTools()).toHaveLength(1);
    });
  });
});
