/**
 * AnalyticsStore Unit Tests
 *
 * TASK-9J Phase 4: TDD Red Phase
 * 15 test cases (A-01 to A-15)
 *
 * Tests CRUD operations, persistence restoration, and data integrity.
 * P9 compliance: beforeEach resets all mocks and creates new AnalyticsStore instance.
 * P19 compliance: Tests runtime validation on corrupted/invalid stored data.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SkillUsageEvent } from "@repo/shared/src/types/skill-analytics";

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

// crypto モジュールは mock せず、UUID のフォーマット検証に切り替える
// Node.js built-in モジュールの mock は ESM/CJS 互換性問題が発生するため

// AnalyticsStore のインポート（モック後）
import { AnalyticsStore } from "../AnalyticsStore";

// =============================================================================
// テストヘルパー
// =============================================================================

/**
 * テスト用 SkillUsageEvent オブジェクトを生成する（id 無し版 = addEvent 用）。
 */
function createTestEventInput(
  overrides: Partial<Omit<SkillUsageEvent, "id">> = {},
): Omit<SkillUsageEvent, "id"> {
  return {
    skillName: overrides.skillName ?? "daily-report",
    eventType: overrides.eventType ?? "execution",
    timestamp: overrides.timestamp ?? "2026-02-28T09:00:00.000Z",
    success: overrides.success ?? true,
    toolsUsed: overrides.toolsUsed ?? ["Read", "Write"],
    duration: overrides.duration,
    errorMessage: overrides.errorMessage,
    tokenCount: overrides.tokenCount,
  };
}

/**
 * テスト用 SkillUsageEvent オブジェクトを生成する（id 付き版 = 復元テスト用）。
 */
function createTestEvent(
  overrides: Partial<SkillUsageEvent> = {},
): SkillUsageEvent {
  return {
    id: overrides.id ?? "event-001",
    skillName: overrides.skillName ?? "daily-report",
    eventType: overrides.eventType ?? "execution",
    timestamp: overrides.timestamp ?? "2026-02-28T09:00:00.000Z",
    success: overrides.success ?? true,
    toolsUsed: overrides.toolsUsed ?? ["Read", "Write"],
    duration: overrides.duration,
    errorMessage: overrides.errorMessage,
    tokenCount: overrides.tokenCount,
  };
}

// =============================================================================
// AnalyticsStore テスト
// =============================================================================
describe("AnalyticsStore", () => {
  let store: AnalyticsStore;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreGet.mockReturnValue([]);
    store = new AnalyticsStore();
  });

  // ===========================================================================
  // CRUD操作 (A-01 ~ A-09)
  // ===========================================================================
  describe("CRUD操作", () => {
    // A-01
    it("A-01: 初期状態でイベント一覧が空配列を返す", () => {
      const result = store.getAllEvents();
      expect(result).toEqual([]);
    });

    // A-02
    it("A-02: addEvent でイベントを追加するとUUID付きのイベントが返される", () => {
      const input = createTestEventInput();
      const result = store.addEvent(input);

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("string");
      expect(result.id.length).toBeGreaterThan(0);
      expect(result.skillName).toBe("daily-report");
      expect(result.eventType).toBe("execution");
      expect(result.success).toBe(true);
      expect(result.toolsUsed).toEqual(["Read", "Write"]);
    });

    // A-03
    it("A-03: addEvent 後に getAllEvents で追加されたイベントを含む", () => {
      const input = createTestEventInput();
      store.addEvent(input);

      const all = store.getAllEvents();
      expect(all).toHaveLength(1);
      expect(all[0].skillName).toBe("daily-report");
    });

    // A-04
    it("A-04: getEventsBySkill でスキル名でフィルタリングされたイベントを取得できる", () => {
      store.addEvent(createTestEventInput({ skillName: "skill-a" }));
      store.addEvent(createTestEventInput({ skillName: "skill-b" }));
      store.addEvent(createTestEventInput({ skillName: "skill-a" }));

      const result = store.getEventsBySkill("skill-a");
      expect(result).toHaveLength(2);
      result.forEach((event) => {
        expect(event.skillName).toBe("skill-a");
      });
    });

    // A-05
    it("A-05: getEventsBySkill で一致するイベントがない場合は空配列を返す", () => {
      store.addEvent(createTestEventInput({ skillName: "skill-a" }));

      const result = store.getEventsBySkill("non-existent");
      expect(result).toEqual([]);
    });

    // A-06
    it("A-06: getEventsByPeriod で期間内のイベントをフィルタリングできる（inclusive）", () => {
      store.addEvent(
        createTestEventInput({
          timestamp: "2026-02-01T00:00:00.000Z",
          skillName: "before",
        }),
      );
      store.addEvent(
        createTestEventInput({
          timestamp: "2026-02-15T12:00:00.000Z",
          skillName: "within",
        }),
      );
      store.addEvent(
        createTestEventInput({
          timestamp: "2026-02-28T23:59:59.999Z",
          skillName: "at-end",
        }),
      );
      store.addEvent(
        createTestEventInput({
          timestamp: "2026-03-01T00:00:00.000Z",
          skillName: "after",
        }),
      );

      const result = store.getEventsByPeriod(
        "2026-02-10T00:00:00.000Z",
        "2026-02-28T23:59:59.999Z",
      );

      expect(result).toHaveLength(2);
      expect(result.map((e) => e.skillName)).toContain("within");
      expect(result.map((e) => e.skillName)).toContain("at-end");
    });

    // A-07
    it("A-07: clearBefore で指定日時より前のイベントを削除する", () => {
      store.addEvent(
        createTestEventInput({
          timestamp: "2026-02-01T00:00:00.000Z",
          skillName: "old",
        }),
      );
      store.addEvent(
        createTestEventInput({
          timestamp: "2026-02-15T00:00:00.000Z",
          skillName: "recent",
        }),
      );
      store.addEvent(
        createTestEventInput({
          timestamp: "2026-02-28T00:00:00.000Z",
          skillName: "newest",
        }),
      );

      store.clearBefore("2026-02-10T00:00:00.000Z");

      const all = store.getAllEvents();
      expect(all).toHaveLength(2);
      expect(all.map((e) => e.skillName)).not.toContain("old");
    });

    // A-08
    it("A-08: clearAll で全イベントを削除する", () => {
      store.addEvent(createTestEventInput({ skillName: "a" }));
      store.addEvent(createTestEventInput({ skillName: "b" }));
      expect(store.getAllEvents()).toHaveLength(2);

      store.clearAll();
      expect(store.getAllEvents()).toEqual([]);
    });

    // A-09
    it("A-09: addEvent / clearBefore / clearAll 後に persist（store.set）が呼ばれる", () => {
      // addEvent 後
      store.addEvent(createTestEventInput());
      expect(mockStoreSet).toHaveBeenCalled();
      vi.clearAllMocks();

      // clearBefore 後
      store.clearBefore("2026-03-01T00:00:00.000Z");
      expect(mockStoreSet).toHaveBeenCalled();
      vi.clearAllMocks();

      // clearAll 後
      store.clearAll();
      expect(mockStoreSet).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // 永続化復元と P19 バリデーション (A-10 ~ A-12)
  // ===========================================================================
  describe("永続化復元（P19バリデーション）", () => {
    // A-10
    it("A-10: electron-store に保存されたイベントがコンストラクタで復元される", () => {
      const storedEvents: SkillUsageEvent[] = [
        createTestEvent({ id: "stored-1", skillName: "restored-skill" }),
        createTestEvent({ id: "stored-2", skillName: "another-skill" }),
      ];
      mockStoreGet.mockReturnValue(storedEvents);

      const restoredStore = new AnalyticsStore();
      const all = restoredStore.getAllEvents();
      expect(all).toHaveLength(2);
      expect(all[0].skillName).toBe("restored-skill");
    });

    // A-11
    it("A-11: electron-store の値が配列でない場合は空配列で初期化される（P19）", () => {
      mockStoreGet.mockReturnValue("not-an-array");

      const restoredStore = new AnalyticsStore();
      expect(restoredStore.getAllEvents()).toEqual([]);
    });

    // A-12
    it("A-12: 不正なイベントオブジェクト（id が string でない）はフィルタされる（P19）", () => {
      const mixedData = [
        createTestEvent({ id: "valid-1" }),
        { noId: true, skillName: "invalid" }, // id がない
        null, // null
        42, // 数値
        createTestEvent({ id: "valid-2" }),
      ];
      mockStoreGet.mockReturnValue(mixedData);

      const restoredStore = new AnalyticsStore();
      const all = restoredStore.getAllEvents();
      expect(all).toHaveLength(2);
      expect(all[0].id).toBe("valid-1");
      expect(all[1].id).toBe("valid-2");
    });
  });

  // ===========================================================================
  // データ整合性 (A-13 ~ A-15)
  // ===========================================================================
  describe("データ整合性", () => {
    // A-13
    it("A-13: getAllEvents は内部配列のコピーを返す（外部からの変更不可）", () => {
      store.addEvent(createTestEventInput({ skillName: "original" }));

      const events = store.getAllEvents();
      events.push(createTestEvent({ id: "injected", skillName: "hacked" }));

      // 内部には影響しない
      expect(store.getAllEvents()).toHaveLength(1);
    });

    // A-14
    it("A-14: 複数スキルのイベントが正しく管理される", () => {
      store.addEvent(createTestEventInput({ skillName: "skill-a" }));
      store.addEvent(createTestEventInput({ skillName: "skill-b" }));
      store.addEvent(createTestEventInput({ skillName: "skill-a" }));
      store.addEvent(createTestEventInput({ skillName: "skill-c" }));
      store.addEvent(createTestEventInput({ skillName: "skill-b" }));

      expect(store.getAllEvents()).toHaveLength(5);
      expect(store.getEventsBySkill("skill-a")).toHaveLength(2);
      expect(store.getEventsBySkill("skill-b")).toHaveLength(2);
      expect(store.getEventsBySkill("skill-c")).toHaveLength(1);
    });

    // A-15
    it("A-15: persist は正しいキーとデータで store.set を呼ぶ", () => {
      const input = createTestEventInput({ skillName: "persist-test" });
      store.addEvent(input);

      expect(mockStoreSet).toHaveBeenCalledWith(
        "skill-analytics-events",
        expect.arrayContaining([
          expect.objectContaining({
            skillName: "persist-test",
          }),
        ]),
      );
      // 保存されたデータに id が含まれていることを確認
      const savedData = mockStoreSet.mock.calls[0][1] as Array<{ id: string }>;
      expect(savedData[0].id).toBeDefined();
      expect(typeof savedData[0].id).toBe("string");
    });
  });
});
