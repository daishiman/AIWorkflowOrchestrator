/**
 * SkillBlueprint 型定義テスト
 *
 * UT-SC-03-004: SkillBlueprint 型追加・plan() 出力互換移行
 * Phase 4: テストファースト（TDD Red phase）
 */

import { describe, expect, it } from "vitest";
import type {
  SkillBlueprint,
  SkillTemplateCategory,
  PlannedFile,
  CategoryTemplate,
  RuntimeSkillCreatorPlanResult,
} from "../skillCreator";
import { CATEGORY_TEMPLATES } from "../skillCreator";

// ------------------------------------------------------------------
// 1. SkillBlueprint 型互換性テスト
// ------------------------------------------------------------------
describe("SkillBlueprint 型互換性", () => {
  it("RuntimeSkillCreatorPlanResult は SkillBlueprint に代入可能", () => {
    const planResult: RuntimeSkillCreatorPlanResult = {
      planId: "test-plan-001",
      skillName: "test-skill",
      description: "test description",
      category: "simple",
      customizations: {},
      files: [],
      reasoning: "test reasoning",
      skillSpec: "test spec",
      estimatedSteps: 3,
      agents: [],
      scripts: [],
      triggers: [],
      anchors: [],
    };

    // SkillBlueprint 型の変数に代入できることを確認
    const blueprint: SkillBlueprint = planResult;
    expect(blueprint.skillName).toBe("test-skill");
    expect(blueprint.category).toBe("simple");
    expect(blueprint.files).toEqual([]);
    expect(blueprint.reasoning).toBe("test reasoning");
  });

  it("SkillBlueprint は RuntimeSkillCreatorPlanResult の全 SkillBlueprint フィールドを持つ", () => {
    const blueprint: SkillBlueprint = {
      skillName: "my-skill",
      description: "A skill",
      category: "standard",
      customizations: {
        additionalDirectories: ["extra"],
        additionalFiles: [{ path: "extra/file.md", purpose: "Extra" }],
        excludedDefaults: ["agents"],
      },
      files: [{ path: "agents/main.md", purpose: "Main agent" }],
      reasoning: "Standard structure fits well",
    };

    expect(blueprint.skillName).toBe("my-skill");
    expect(blueprint.customizations.additionalDirectories).toEqual(["extra"]);
  });
});

// ------------------------------------------------------------------
// 2. SkillCategory 型テスト
// ------------------------------------------------------------------
describe("SkillTemplateCategory 型", () => {
  it("5つのカテゴリ値が有効", () => {
    const categories: SkillTemplateCategory[] = [
      "simple",
      "standard",
      "complex",
      "automation",
      "integration",
    ];
    expect(categories).toHaveLength(5);
  });
});

// ------------------------------------------------------------------
// 3. PlannedFile 型テスト
// ------------------------------------------------------------------
describe("PlannedFile 型", () => {
  it("path と purpose を持つ", () => {
    const file: PlannedFile = {
      path: "agents/analyze-pr.md",
      purpose: "PR分析のLLM Task仕様書",
    };
    expect(file.path).toBe("agents/analyze-pr.md");
    expect(file.purpose).toBe("PR分析のLLM Task仕様書");
  });
});

// ------------------------------------------------------------------
// 4. CATEGORY_TEMPLATES 定数テスト
// ------------------------------------------------------------------
describe("CATEGORY_TEMPLATES 定数", () => {
  it("5つのカテゴリ全てのテンプレートが定義されている", () => {
    const keys = Object.keys(CATEGORY_TEMPLATES);
    expect(keys).toContain("simple");
    expect(keys).toContain("standard");
    expect(keys).toContain("complex");
    expect(keys).toContain("automation");
    expect(keys).toContain("integration");
    expect(keys).toHaveLength(5);
  });

  it("simple カテゴリは空のディレクトリ配列を持つ", () => {
    expect(CATEGORY_TEMPLATES.simple.dirs).toEqual([]);
    expect(CATEGORY_TEMPLATES.simple.desc).toBeTruthy();
  });

  it("standard カテゴリは agents, references を含む", () => {
    expect(CATEGORY_TEMPLATES.standard.dirs).toContain("agents");
    expect(CATEGORY_TEMPLATES.standard.dirs).toContain("references");
  });

  it("complex カテゴリは agents, scripts, references, schemas を含む", () => {
    const dirs = CATEGORY_TEMPLATES.complex.dirs;
    expect(dirs).toContain("agents");
    expect(dirs).toContain("scripts");
    expect(dirs).toContain("references");
    expect(dirs).toContain("schemas");
  });

  it("各テンプレートが CategoryTemplate 型に準拠する", () => {
    for (const [, template] of Object.entries(CATEGORY_TEMPLATES)) {
      const t: CategoryTemplate = template;
      expect(Array.isArray(t.dirs)).toBe(true);
      expect(typeof t.desc).toBe("string");
      expect(t.desc.length).toBeGreaterThan(0);
    }
  });
});
