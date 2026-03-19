import { describe, expect, it } from "vitest";
import {
  SKILL_LIFECYCLE_ADVANCED_ROUTES,
  SKILL_LIFECYCLE_DEPENDENCY_CONTRACTS,
  SKILL_LIFECYCLE_ENTRY_VIEW,
  SKILL_LIFECYCLE_JOB_GUIDES,
  getSkillLifecycleSurfaceResponsibility,
  isSupportingAdvancedLifecycleRoute,
  normalizeSkillLifecycleView,
} from "./skillLifecycleJourney";
import type { SkillLifecycleJobGuide } from "./skillLifecycleJourney";

describe("skillLifecycleJourney", () => {
  it("一次導線の入口を skillCenter に固定する", () => {
    expect(SKILL_LIFECYCLE_ENTRY_VIEW).toBe("skillCenter");
    expect(SKILL_LIFECYCLE_JOB_GUIDES.map((job) => job.id)).toEqual([
      "create",
      "use",
      "improve",
    ]);
  });

  it("legacy alias を canonical view へ正規化する", () => {
    expect(normalizeSkillLifecycleView("skill-center")).toBe("skillCenter");
    expect(normalizeSkillLifecycleView("workspace")).toBe("workspace");
  });

  it("主要 surface の責務を取得できる", () => {
    expect(getSkillLifecycleSurfaceResponsibility("skill-center")?.label).toBe(
      "Skill Center",
    );
    expect(
      getSkillLifecycleSurfaceResponsibility("agent")?.forbiddenResponsibility,
    ).toContain("代替");
  });

  it("advanced route を補助導線として識別する", () => {
    expect(
      isSupportingAdvancedLifecycleRoute("/advanced/skill-management-panel"),
    ).toBe(true);
    expect(isSupportingAdvancedLifecycleRoute("/advanced/debug-panel")).toBe(
      false,
    );
    expect(SKILL_LIFECYCLE_ADVANCED_ROUTES).toHaveLength(4);
  });

  it("後続タスク向け依存契約を4件持つ", () => {
    expect(
      SKILL_LIFECYCLE_DEPENDENCY_CONTRACTS.map((item) => item.taskId),
    ).toEqual([
      "TASK-SKILL-LIFECYCLE-02",
      "TASK-SKILL-LIFECYCLE-03",
      "TASK-SKILL-LIFECYCLE-04",
      "TASK-SKILL-LIFECYCLE-05",
    ]);
  });

  it("TC-SL-01: SkillLifecycleJobGuide 型が onAction?: () => void を受け入れること (AC-4)", () => {
    const guideWithAction: SkillLifecycleJobGuide = {
      id: "create",
      title: "テスト",
      entryLabel: "テストエントリ",
      handoffLabel: "テストハンドオフ",
      summary: "テストサマリー",
      completion: "テスト完了",
      onAction: () => {},
    };
    expect(guideWithAction.onAction).toBeTypeOf("function");
  });

  it("TC-SL-02: SkillLifecycleJobGuide 型で onAction を省略できること (AC-4)", () => {
    const guideWithoutAction: SkillLifecycleJobGuide = {
      id: "use",
      title: "テスト",
      entryLabel: "テストエントリ",
      handoffLabel: "テストハンドオフ",
      summary: "テストサマリー",
      completion: "テスト完了",
    };
    expect(guideWithoutAction.onAction).toBeUndefined();
  });

  it("TC-SL-03: 既存の SKILL_LIFECYCLE_JOB_GUIDES 定数が onAction なしで有効であること (AC-4)", () => {
    SKILL_LIFECYCLE_JOB_GUIDES.forEach((guide) => {
      expect(guide.onAction).toBeUndefined();
    });
  });

  it("TC-SL-04: normalizeSkillLifecycleView が skillAnalysis を変換せず返すこと (AC-6)", () => {
    expect(
      normalizeSkillLifecycleView(
        "skillAnalysis" as import("../store/types").ViewType,
      ),
    ).toBe("skillAnalysis");
  });

  it("TC-SL-05: normalizeSkillLifecycleView が skillCreate を変換せず返すこと (AC-6)", () => {
    expect(
      normalizeSkillLifecycleView(
        "skillCreate" as import("../store/types").ViewType,
      ),
    ).toBe("skillCreate");
  });

  it("TC-SL-06: onAction が関数型であることの型安全性検証", () => {
    const guide: SkillLifecycleJobGuide = {
      id: "create",
      title: "テスト",
      entryLabel: "エントリ",
      handoffLabel: "ハンドオフ",
      summary: "サマリー",
      completion: "完了",
      onAction: () => {},
    };
    expect(typeof guide.onAction).toBe("function");
  });

  it("TC-SL-07: onAction 呼び出しが正常に実行されること", () => {
    let called = false;
    const guide: SkillLifecycleJobGuide = {
      id: "use",
      title: "テスト",
      entryLabel: "エントリ",
      handoffLabel: "ハンドオフ",
      summary: "サマリー",
      completion: "完了",
      onAction: () => {
        called = true;
      },
    };
    guide.onAction?.();
    expect(called).toBe(true);
  });

  it("TC-SL-08: SKILL_LIFECYCLE_JOB_GUIDES の各 guide が id, title, entryLabel, handoffLabel, summary, completion を全て持つこと", () => {
    const requiredKeys = [
      "id",
      "title",
      "entryLabel",
      "handoffLabel",
      "summary",
      "completion",
    ] as const;

    SKILL_LIFECYCLE_JOB_GUIDES.forEach((guide) => {
      requiredKeys.forEach((key) => {
        expect(guide).toHaveProperty(key);
        expect(typeof guide[key]).toBe("string");
      });
    });
  });

  it('TC-SL-09: normalizeSkillLifecycleView に "skill-center" を渡すと "skillCenter" に変換されること', () => {
    const result = normalizeSkillLifecycleView(
      "skill-center" as import("../store/types").ViewType,
    );
    expect(result).toBe("skillCenter");
  });

  it('TC-SL-10: normalizeSkillLifecycleView に "dashboard" を渡すとそのまま返されること', () => {
    const result = normalizeSkillLifecycleView(
      "dashboard" as import("../store/types").ViewType,
    );
    expect(result).toBe("dashboard");
  });

  it("TC-SL-11: SkillLifecycleJobGuide の onAction が undefined でもアクセスしてもエラーにならないこと（optional chaining互換）", () => {
    const guide: SkillLifecycleJobGuide = {
      id: "improve",
      title: "テスト",
      entryLabel: "エントリ",
      handoffLabel: "ハンドオフ",
      summary: "サマリー",
      completion: "完了",
    };
    // optional chaining でアクセスしてもエラーにならないことを検証
    expect(() => guide.onAction?.()).not.toThrow();
    expect(guide.onAction).toBeUndefined();
  });

  it("TC-SL-12: 全ての SKILL_LIFECYCLE_JOB_GUIDES が ctaLabel を持つこと", () => {
    SKILL_LIFECYCLE_JOB_GUIDES.forEach((guide) => {
      expect(guide.ctaLabel).toBeDefined();
      expect(typeof guide.ctaLabel).toBe("string");
      expect((guide.ctaLabel ?? "").length).toBeGreaterThan(0);
    });
  });

  it("TC-SL-13: ctaLabel の値が期待通りであること", () => {
    const ctaLabels = SKILL_LIFECYCLE_JOB_GUIDES.map((guide) => guide.ctaLabel);
    expect(ctaLabels).toEqual(["作成を始める", "使ってみる", "改善する"]);
  });

  it("TC-SL-14: SkillLifecycleJobGuide 型で ctaLabel を省略できること", () => {
    const guideWithoutCtaLabel: SkillLifecycleJobGuide = {
      id: "create",
      title: "テスト",
      entryLabel: "エントリ",
      handoffLabel: "ハンドオフ",
      summary: "サマリー",
      completion: "完了",
    };
    expect(guideWithoutCtaLabel.ctaLabel).toBeUndefined();
  });

  it("TC-SL-15: SkillLifecycleJobGuide 型で ctaLabel を指定できること", () => {
    const guideWithCtaLabel: SkillLifecycleJobGuide = {
      id: "use",
      title: "テスト",
      entryLabel: "エントリ",
      handoffLabel: "ハンドオフ",
      summary: "サマリー",
      completion: "完了",
      ctaLabel: "カスタムCTA",
    };
    expect(guideWithCtaLabel.ctaLabel).toBe("カスタムCTA");
  });
});
