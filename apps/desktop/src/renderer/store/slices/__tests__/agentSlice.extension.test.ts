/**
 * agentSlice拡張テスト（TASK-UI-03 Phase 4 - TDD Red）
 *
 * 実行履歴管理・詳細設定パネル状態・個別セレクタの拡張機能テスト。
 * コンポーネント未実装のためRed状態（インポートエラー）が期待される。
 */
import { describe, it, expect, beforeEach } from "vitest";
import { createAgentSlice, type AgentSlice } from "../agentSlice";

/**
 * 実行サマリ型（Phase 5で agentSlice に追加予定）
 */
interface ExecutionSummary {
  executionId: string;
  skillName: string;
  skillDisplayName: string;
  status: "completed" | "failed" | "executing" | "cancelled";
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null;
}

describe("agentSlice拡張 - 実行履歴・詳細設定", () => {
  let store: AgentSlice;
  let mockSet: (fn: (state: AgentSlice) => Partial<AgentSlice>) => void;
  let mockGet: () => AgentSlice;

  beforeEach(() => {
    mockSet = (fn: unknown) => {
      const partial =
        typeof fn === "function" ? fn(store) : (fn as Partial<AgentSlice>);
      Object.assign(store, partial);
    };
    mockGet = () => store;

    store = createAgentSlice(mockSet as never, mockGet as never, {} as never);
  });

  const createMockExecution = (
    overrides: Partial<ExecutionSummary> = {},
  ): ExecutionSummary => ({
    executionId: "exec-001",
    skillName: "test-skill",
    skillDisplayName: "テストスキル",
    status: "completed",
    startedAt: new Date("2026-03-07T10:00:00Z"),
    completedAt: new Date("2026-03-07T10:01:00Z"),
    duration: 60000,
    ...overrides,
  });

  describe("addExecutionToHistory", () => {
    it("実行履歴を先頭に追加する", () => {
      const execution = createMockExecution();

      // Phase 5 で実装予定のアクション

      const storeAny = store as any;
      expect(typeof storeAny.addExecutionToHistory).toBe("function");

      storeAny.addExecutionToHistory(execution);

      expect(storeAny.recentExecutions).toHaveLength(1);
      expect(storeAny.recentExecutions[0]).toEqual(execution);
    });

    it("10件を超えたら古いものを削除する", () => {
      const storeAny = store as any;

      // 11件追加
      for (let i = 0; i < 11; i++) {
        const execution = createMockExecution({
          executionId: `exec-${String(i).padStart(3, "0")}`,
          startedAt: new Date(
            `2026-03-07T${String(10 + i).padStart(2, "0")}:00:00Z`,
          ),
        });
        storeAny.addExecutionToHistory(execution);
      }

      expect(storeAny.recentExecutions).toHaveLength(10);
      // 最新（exec-010）が先頭にあること
      expect(storeAny.recentExecutions[0].executionId).toBe("exec-010");
      // 最古（exec-000）は削除されていること
      const ids = storeAny.recentExecutions.map(
        (e: ExecutionSummary) => e.executionId,
      );
      expect(ids).not.toContain("exec-000");
    });
  });

  describe("clearExecutionHistory", () => {
    it("全履歴をクリアする", () => {
      const storeAny = store as any;

      // 事前に履歴を追加
      storeAny.addExecutionToHistory(createMockExecution());
      expect(storeAny.recentExecutions).toHaveLength(1);

      storeAny.clearExecutionHistory();
      expect(storeAny.recentExecutions).toHaveLength(0);
    });
  });

  describe("setAdvancedSettingsOpen", () => {
    it("パネル開閉状態を切り替える", () => {
      const storeAny = store as any;

      // 初期状態は閉じている
      expect(storeAny.isAdvancedSettingsOpen).toBe(false);

      storeAny.setAdvancedSettingsOpen(true);
      expect(storeAny.isAdvancedSettingsOpen).toBe(true);

      storeAny.setAdvancedSettingsOpen(false);
      expect(storeAny.isAdvancedSettingsOpen).toBe(false);
    });
  });

  describe("useRecentExecutions セレクタ", () => {
    it("個別セレクタで履歴を取得する", async () => {
      const storeModule = await import("../../../store");

      const useRecentExecutions = (storeModule as any).useRecentExecutions;
      expect(typeof useRecentExecutions).toBe("function");
    });
  });

  // === Phase 6: テスト拡充 ===

  describe("境界値テスト", () => {
    it("recentExecutions の初期値が空配列", () => {
      expect(store.recentExecutions).toEqual([]);
      expect(store.recentExecutions).toHaveLength(0);
    });

    it("isAdvancedSettingsOpen の初期値が false", () => {
      expect(store.isAdvancedSettingsOpen).toBe(false);
    });
  });

  describe("エラー系テスト", () => {
    it("同一executionIdの重複追加でも件数が増える（重複チェックなし）", () => {
      const execution = createMockExecution({ executionId: "dup-001" });

      store.addExecutionToHistory(execution);
      store.addExecutionToHistory(execution);

      // 現在の実装は重複チェックをしないため2件になる
      expect(store.recentExecutions).toHaveLength(2);
      expect(store.recentExecutions[0].executionId).toBe("dup-001");
      expect(store.recentExecutions[1].executionId).toBe("dup-001");
    });

    it("addExecutionToHistoryを11回呼び出して10件制限を確認", () => {
      for (let i = 0; i < 11; i++) {
        store.addExecutionToHistory(
          createMockExecution({
            executionId: `limit-${String(i).padStart(3, "0")}`,
          }),
        );
      }

      expect(store.recentExecutions).toHaveLength(10);
      // 最新が先頭
      expect(store.recentExecutions[0].executionId).toBe("limit-010");
      // 最古（limit-000）は押し出されている
      expect(
        store.recentExecutions.some((e) => e.executionId === "limit-000"),
      ).toBe(false);
    });
  });

  describe("resetAgentState", () => {
    it("全状態をリセットするとrecentExecutionsも空になる", () => {
      store.addExecutionToHistory(createMockExecution());
      store.setAdvancedSettingsOpen(true);

      expect(store.recentExecutions).toHaveLength(1);
      expect(store.isAdvancedSettingsOpen).toBe(true);

      store.resetAgentState();

      expect(store.recentExecutions).toHaveLength(0);
      expect(store.isAdvancedSettingsOpen).toBe(false);
    });
  });
});
