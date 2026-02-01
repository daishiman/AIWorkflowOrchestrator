/**
 * @file permissionHistorySlice 状態管理テスト
 * @description TDD Red Phase - Permission履歴Store操作のテスト
 * @feature task-imp-permission-history-001
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  createPermissionHistorySlice,
  type PermissionHistorySlice,
} from "../permissionHistorySlice";
import {
  type PermissionHistoryEntry,
  PERMISSION_HISTORY_MAX_ENTRIES,
} from "../../../components/skill/permissionHistory";

// ==========================================================================
// ヘルパー関数
// ==========================================================================

function _createMockEntry(
  overrides: Partial<PermissionHistoryEntry> = {},
): PermissionHistoryEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    toolName: "Bash",
    argsSnapshot: "ls -la",
    decision: "approved",
    ...overrides,
  };
}

// ==========================================================================
// テストスイート
// ==========================================================================

describe("permissionHistorySlice", () => {
  let store: PermissionHistorySlice;
  let mockSet: (
    fn:
      | ((state: PermissionHistorySlice) => Partial<PermissionHistorySlice>)
      | Partial<PermissionHistorySlice>,
  ) => void;

  beforeEach(() => {
    const state: Partial<PermissionHistorySlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function"
          ? fn(store)
          : (fn as Partial<PermissionHistorySlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };

    store = createPermissionHistorySlice(
      mockSet as never,
      (() => store) as never,
      {} as never,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // 初期状態
  // ==========================================================================

  describe("初期状態", () => {
    it("permissionHistoryが空配列である", () => {
      expect(store.permissionHistory).toEqual([]);
    });

    it("historyFilterが空オブジェクトである", () => {
      expect(store.historyFilter).toEqual({});
    });
  });

  // ==========================================================================
  // addHistoryEntry
  // ==========================================================================

  describe("addHistoryEntry", () => {
    it("エントリを履歴の先頭に追加する（最新が先頭）", () => {
      const entry1 = {
        toolName: "Bash",
        argsSnapshot: "ls",
        decision: "approved" as const,
      };
      const entry2 = {
        toolName: "Read",
        argsSnapshot: "/tmp/test",
        decision: "denied" as const,
      };

      store.addHistoryEntry(entry1);
      store.addHistoryEntry(entry2);

      expect(store.permissionHistory).toHaveLength(2);
      expect(store.permissionHistory[0].toolName).toBe("Read");
      expect(store.permissionHistory[1].toolName).toBe("Bash");
    });

    it("エントリにidとtimestampを自動付与する", () => {
      store.addHistoryEntry({
        toolName: "Bash",
        argsSnapshot: "ls",
        decision: "approved",
      });

      const entry = store.permissionHistory[0];
      expect(entry.id).toBeDefined();
      expect(entry.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(entry.timestamp).toBeDefined();
      expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);
    });

    it("1000件の上限を超えた場合、最も古いエントリを削除する", () => {
      // 1000件のエントリを追加
      for (let i = 0; i < PERMISSION_HISTORY_MAX_ENTRIES; i++) {
        store.addHistoryEntry({
          toolName: "Bash",
          argsSnapshot: `command-${i}`,
          decision: "approved",
        });
      }

      expect(store.permissionHistory).toHaveLength(
        PERMISSION_HISTORY_MAX_ENTRIES,
      );

      // 1001件目を追加
      store.addHistoryEntry({
        toolName: "Read",
        argsSnapshot: "overflow-entry",
        decision: "denied",
      });

      expect(store.permissionHistory).toHaveLength(
        PERMISSION_HISTORY_MAX_ENTRIES,
      );
      expect(store.permissionHistory[0].argsSnapshot).toBe("overflow-entry");
    });

    it("既存エントリを保持したまま新規エントリを追加する", () => {
      store.addHistoryEntry({
        toolName: "Bash",
        argsSnapshot: "ls",
        decision: "approved",
      });

      const firstEntryId = store.permissionHistory[0].id;

      store.addHistoryEntry({
        toolName: "Read",
        argsSnapshot: "/tmp/test",
        decision: "denied",
      });

      expect(store.permissionHistory).toHaveLength(2);
      expect(store.permissionHistory[1].id).toBe(firstEntryId);
    });

    it("追加時刻のタイムスタンプを正確に設定する", () => {
      const before = new Date().toISOString();
      store.addHistoryEntry({
        toolName: "Bash",
        argsSnapshot: "ls",
        decision: "approved",
      });
      const after = new Date().toISOString();

      const timestamp = store.permissionHistory[0].timestamp;
      expect(timestamp >= before).toBe(true);
      expect(timestamp <= after).toBe(true);
    });
  });

  // ==========================================================================
  // clearHistory
  // ==========================================================================

  describe("clearHistory", () => {
    it("全履歴エントリを削除する", () => {
      store.addHistoryEntry({
        toolName: "Bash",
        argsSnapshot: "ls",
        decision: "approved",
      });
      store.addHistoryEntry({
        toolName: "Read",
        argsSnapshot: "/tmp",
        decision: "denied",
      });

      expect(store.permissionHistory).toHaveLength(2);

      store.clearHistory();

      expect(store.permissionHistory).toEqual([]);
    });

    it("空の履歴に対しても安全に動作する", () => {
      expect(store.permissionHistory).toHaveLength(0);

      store.clearHistory();

      expect(store.permissionHistory).toEqual([]);
    });
  });

  // ==========================================================================
  // setHistoryFilter
  // ==========================================================================

  describe("setHistoryFilter", () => {
    it("ツール名フィルタを設定する", () => {
      store.setHistoryFilter({ toolName: "Bash" });
      expect(store.historyFilter).toEqual({ toolName: "Bash" });
    });

    it("判断結果フィルタを設定する", () => {
      store.setHistoryFilter({ decision: "denied" });
      expect(store.historyFilter).toEqual({ decision: "denied" });
    });

    it("複数のフィルタを同時に設定する", () => {
      store.setHistoryFilter({ toolName: "Bash", decision: "approved" });
      expect(store.historyFilter).toEqual({
        toolName: "Bash",
        decision: "approved",
      });
    });

    it("undefinedを設定してフィルタをクリアする", () => {
      store.setHistoryFilter({ toolName: "Bash", decision: "approved" });
      store.setHistoryFilter({});
      expect(store.historyFilter).toEqual({});
    });
  });

  // ==========================================================================
  // エッジケース
  // ==========================================================================

  describe("エッジケース", () => {
    it("1000件ちょうどの場合、上限を超えない", () => {
      for (let i = 0; i < PERMISSION_HISTORY_MAX_ENTRIES; i++) {
        store.addHistoryEntry({
          toolName: "Bash",
          argsSnapshot: `cmd-${i}`,
          decision: "approved",
        });
      }

      expect(store.permissionHistory).toHaveLength(
        PERMISSION_HISTORY_MAX_ENTRIES,
      );
    });

    it("連続した高速追加でデータが失われない", () => {
      for (let i = 0; i < 50; i++) {
        store.addHistoryEntry({
          toolName: `Tool-${i}`,
          argsSnapshot: `args-${i}`,
          decision: i % 2 === 0 ? "approved" : "denied",
        });
      }

      expect(store.permissionHistory).toHaveLength(50);
    });

    it("approved_onceの判断結果が正しく保存される", () => {
      store.addHistoryEntry({
        toolName: "Bash",
        argsSnapshot: "ls",
        decision: "approved_once",
      });

      expect(store.permissionHistory[0].decision).toBe("approved_once");
    });
  });
});
