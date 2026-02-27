/**
 * ScheduleStore Unit Tests
 *
 * TASK-9G Phase 4: TDD Red Phase
 * 15 test cases (D-01 to D-15)
 *
 * Tests CRUD operations, run history management, and persistence/restoration.
 * All tests should be in Red state (ScheduleStore implementation doesn't exist yet).
 *
 * P9 compliance: beforeEach resets all mocks and creates new ScheduleStore instance.
 * P19 compliance: Tests runtime validation on corrupted/invalid stored data.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  ScheduledSkill,
  ScheduledRunResult,
} from "@repo/shared/src/types/skill-schedule";

// electron-store モック
const mockStoreGet = vi.fn().mockReturnValue([]);
const mockStoreSet = vi.fn();

vi.mock("electron-store", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: mockStoreGet,
      set: mockStoreSet,
    })),
  };
});

// ScheduleStore のインポート（モック後）
// Phase 5 で実装が作成されるまでは import エラーになる（Red状態）
import { ScheduleStore } from "../ScheduleStore";

// =============================================================================
// テストヘルパー
// =============================================================================

/**
 * テスト用 ScheduledSkill オブジェクトを生成する。
 */
function createTestSchedule(
  overrides: Partial<ScheduledSkill> = {},
): ScheduledSkill {
  return {
    id: overrides.id ?? "test-schedule-001",
    skillName: overrides.skillName ?? "daily-report",
    prompt: overrides.prompt ?? "本日の進捗をまとめてください",
    schedule: overrides.schedule ?? {
      type: "cron",
      cronExpression: "0 18 * * 1-5",
    },
    enabled: overrides.enabled ?? true,
    lastRun: overrides.lastRun ?? null,
    nextRun: overrides.nextRun ?? null,
    runHistory: overrides.runHistory ?? [],
    notification: overrides.notification ?? {
      onSuccess: false,
      onFailure: true,
      notificationType: "system",
    },
  };
}

// =============================================================================
// ScheduleStore テスト
// =============================================================================
describe("ScheduleStore", () => {
  let store: ScheduleStore;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreGet.mockReturnValue([]);
    store = new ScheduleStore();
  });

  // ===========================================================================
  // CRUD操作 (D-01 ~ D-10)
  // ===========================================================================
  describe("CRUD操作", () => {
    // D-01
    it("D-01: 初期状態でスケジュール一覧が空配列を返す", () => {
      const result = store.getAll();
      expect(result).toEqual([]);
    });

    // D-02
    it("D-02: スケジュールを追加すると一覧に含まれる", () => {
      const schedule = createTestSchedule();
      store.add(schedule);

      const all = store.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].skillName).toBe("daily-report");
    });

    // D-03
    it("D-03: 追加されたスケジュールに自動生成されたIDが付与される", () => {
      const schedule = createTestSchedule();
      store.add(schedule);

      const all = store.getAll();
      expect(all[0].id).toBeDefined();
      expect(typeof all[0].id).toBe("string");
      // UUID v4 形式のチェック（ハイフン区切り）
      expect(all[0].id.length).toBeGreaterThan(0);
    });

    // D-04
    it("D-04: IDを指定してスケジュールを取得できる", () => {
      const schedule = createTestSchedule({ id: "specific-id" });
      const created = store.add(schedule);

      const result = store.getById(created.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id);
      expect(result?.skillName).toBe("daily-report");
    });

    // D-05
    it("D-05: 存在しないIDで取得すると undefined を返す", () => {
      const result = store.getById("non-existent");
      expect(result).toBeUndefined();
    });

    // D-06
    it("D-06: スケジュールを更新すると変更が反映される", () => {
      const schedule = createTestSchedule({ id: "update-target" });
      const created = store.add(schedule);

      store.update(created.id, { enabled: false });

      const updated = store.getById(created.id);
      expect(updated?.enabled).toBe(false);
    });

    // D-07
    it("D-07: 存在しないIDの更新で例外がスローされる", () => {
      expect(() => {
        store.update("non-existent", { enabled: false });
      }).toThrow();
    });

    // D-08
    it("D-08: スケジュールを削除すると一覧から除外される", () => {
      const schedule = createTestSchedule({ id: "delete-target" });
      const created = store.add(schedule);
      expect(store.getAll()).toHaveLength(1);

      store.delete(created.id);
      expect(store.getAll()).toHaveLength(0);
    });

    // D-09
    it("D-09: 存在しないIDの削除で例外がスローされる", () => {
      expect(() => {
        store.delete("non-existent");
      }).toThrow();
    });

    // D-10
    it("D-10: electron-store の set がスケジュール変更時に呼び出される", () => {
      const schedule = createTestSchedule({ id: "persist-test" });

      // add 後に set が呼ばれる
      const created = store.add(schedule);
      expect(mockStoreSet).toHaveBeenCalled();

      vi.clearAllMocks();

      // update 後に set が呼ばれる
      store.update(created.id, { enabled: false });
      expect(mockStoreSet).toHaveBeenCalled();

      vi.clearAllMocks();

      // delete 後に set が呼ばれる
      store.delete(created.id);
      expect(mockStoreSet).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // 実行履歴 (D-11 ~ D-13)
  // ===========================================================================
  describe("実行履歴", () => {
    // D-11
    it("D-11: 実行結果を追加すると runHistory に蓄積される", () => {
      const schedule = createTestSchedule({ id: "history-test" });
      const created = store.add(schedule);

      const runResult: ScheduledRunResult = {
        runId: "run-001",
        startedAt: "2026-02-27T09:00:00.000Z",
        completedAt: "2026-02-27T09:01:00.000Z",
        success: true,
        output: "Completed successfully",
      };

      store.addRunResult(created.id, runResult);

      const updated = store.getById(created.id);
      expect(updated?.runHistory).toHaveLength(1);
      expect(updated?.runHistory[0].runId).toBe("run-001");
      expect(updated?.runHistory[0].success).toBe(true);
    });

    // D-12
    it("D-12: runHistory は最大100件を保持し、超過分は古い順に削除される", () => {
      const schedule = createTestSchedule({ id: "history-limit-test" });
      const created = store.add(schedule);

      // 101件の実行結果を追加
      for (let i = 0; i < 101; i++) {
        const runResult: ScheduledRunResult = {
          runId: `run-${String(i).padStart(3, "0")}`,
          startedAt: new Date(Date.now() + i * 60000).toISOString(),
          success: true,
        };
        store.addRunResult(created.id, runResult);
      }

      const updated = store.getById(created.id);
      expect(updated?.runHistory.length).toBe(100);
      // 最も古いエントリ（run-000）は削除されている
      expect(updated?.runHistory[0].runId).not.toBe("run-000");
    });

    // D-13
    it("D-13: lastRun が実行結果追加時に更新される", () => {
      const schedule = createTestSchedule({ id: "lastrun-test" });
      const created = store.add(schedule);

      const startedAt = "2026-02-27T15:30:00.000Z";
      const runResult: ScheduledRunResult = {
        runId: "run-last",
        startedAt,
        success: true,
      };

      store.addRunResult(created.id, runResult);

      const updated = store.getById(created.id);
      expect(updated?.lastRun).toBe(startedAt);
    });
  });

  // ===========================================================================
  // 永続化復元 (D-14 ~ D-15)
  // ===========================================================================
  describe("永続化復元", () => {
    // D-14
    it("D-14: コンストラクタで electron-store からスケジュールが復元される", () => {
      const savedSchedules = [
        createTestSchedule({ id: "restored-1" }),
        createTestSchedule({ id: "restored-2", skillName: "weekly-review" }),
      ];
      mockStoreGet.mockReturnValue(savedSchedules);

      const restoredStore = new ScheduleStore();
      const all = restoredStore.getAll();

      expect(mockStoreGet).toHaveBeenCalledWith("scheduledSkills");
      expect(all).toHaveLength(2);
      expect(all[0].id).toBe("restored-1");
      expect(all[1].id).toBe("restored-2");
    });

    // D-15
    it("D-15: 保存データが不正（配列でない）場合に空配列にフォールバックする", () => {
      // 不正データ: 文字列
      mockStoreGet.mockReturnValue("corrupted data");
      const corruptedStore1 = new ScheduleStore();
      expect(corruptedStore1.getAll()).toEqual([]);

      // 不正データ: null
      mockStoreGet.mockReturnValue(null);
      const corruptedStore2 = new ScheduleStore();
      expect(corruptedStore2.getAll()).toEqual([]);

      // 不正データ: number
      mockStoreGet.mockReturnValue(42);
      const corruptedStore3 = new ScheduleStore();
      expect(corruptedStore3.getAll()).toEqual([]);

      // 不正データ: undefined
      mockStoreGet.mockReturnValue(undefined);
      const corruptedStore4 = new ScheduleStore();
      expect(corruptedStore4.getAll()).toEqual([]);
    });
  });

  // ===========================================================================
  // Phase 6: 境界値テスト拡充 (DB-01 ~ DB-05)
  // ===========================================================================
  describe("境界値テスト", () => {
    // DB-01
    it("DB-01: 複数スケジュール（10件）追加後に全件取得できる", () => {
      for (let i = 0; i < 10; i++) {
        store.add(
          createTestSchedule({
            id: `schedule-${i}`,
            skillName: `skill-${i}`,
          }),
        );
      }
      expect(store.getAll()).toHaveLength(10);
    });

    // DB-02
    it("DB-02: 同一スキルに複数スケジュールを登録できる", () => {
      store.add(
        createTestSchedule({
          id: "same-skill-1",
          skillName: "shared-skill",
          schedule: { type: "cron", cronExpression: "0 9 * * *" },
        }),
      );
      store.add(
        createTestSchedule({
          id: "same-skill-2",
          skillName: "shared-skill",
          schedule: { type: "interval", interval: 60000 },
        }),
      );

      const all = store.getAll();
      expect(all).toHaveLength(2);
      const sharedSkills = all.filter((s) => s.skillName === "shared-skill");
      expect(sharedSkills).toHaveLength(2);
    });

    // DB-03
    it("DB-03: update で enabled 以外のフィールド（prompt）も変更できる", () => {
      const created = store.add(createTestSchedule({ id: "prompt-update" }));
      store.update(created.id, { prompt: "新しいプロンプト" });

      const updated = store.getById(created.id);
      expect(updated?.prompt).toBe("新しいプロンプト");
    });

    // DB-04
    it("DB-04: addRunResult で completedAt / output フィールドが保存される", () => {
      const created = store.add(createTestSchedule({ id: "full-result" }));

      const runResult: ScheduledRunResult = {
        runId: "run-full",
        startedAt: "2026-02-27T09:00:00.000Z",
        completedAt: "2026-02-27T09:05:00.000Z",
        success: true,
        output: "Task completed successfully with 3 items processed",
      };

      store.addRunResult(created.id, runResult);

      const updated = store.getById(created.id);
      expect(updated?.runHistory[0].completedAt).toBe(
        "2026-02-27T09:05:00.000Z",
      );
      expect(updated?.runHistory[0].output).toBe(
        "Task completed successfully with 3 items processed",
      );
      expect(updated?.runHistory[0].runId).toBe("run-full");
      expect(updated?.runHistory[0].startedAt).toBe("2026-02-27T09:00:00.000Z");
      expect(updated?.runHistory[0].success).toBe(true);
    });

    // DB-05
    it("DB-05: 保存データの各要素が不正（id フィールド欠損）な場合にフィルタされる", () => {
      const validSchedule = createTestSchedule({ id: "valid-1" });
      const invalidElement = { skillName: "no-id", prompt: "test" }; // id 欠損

      mockStoreGet.mockReturnValue([validSchedule, invalidElement]);

      const restoredStore = new ScheduleStore();
      const all = restoredStore.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe("valid-1");
    });
  });
});
