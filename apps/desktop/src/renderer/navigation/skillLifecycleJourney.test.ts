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
});
