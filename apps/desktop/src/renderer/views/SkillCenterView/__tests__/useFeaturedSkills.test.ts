import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { SkillMetadata, SkillName } from "@repo/shared/types/skill";

// --- テストデータファクトリ ---

const createMockSkillMetadata = (
  overrides: Partial<SkillMetadata> = {},
): SkillMetadata => ({
  name: "test-skill" as SkillName,
  description: "テスト用スキル",
  path: ".claude/skills/test-skill/SKILL.md",
  allowedTools: ["Read", "Write"],
  updatedAt: new Date("2026-01-01"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
  ...overrides,
});

// --- Store モック ---

const mockImportedSkills: string[] = [];

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
  useAvailableSkillsMetadata: vi.fn(() => []),
  useImportedSkills: vi.fn(() => mockImportedSkills),
  useIsLoadingSkills: vi.fn(() => false),
  useSkillError: vi.fn(() => null),
  useSkillFilter: vi.fn(() => ""),
  useSkillCategory: vi.fn(() => null),
  useFetchSkills: vi.fn(() => vi.fn()),
  useImportSkill: vi.fn(() => vi.fn()),
  useRemoveSkill: vi.fn(() => vi.fn()),
  useSetSkillFilter: vi.fn(() => vi.fn()),
  useSetSkillCategory: vi.fn(() => vi.fn()),
}));

// テスト対象のフック（実装はPhase 5で作成される）
import { useFeaturedSkills } from "../hooks/useFeaturedSkills";

describe("useFeaturedSkills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空配列を渡すと空配列を返す", () => {
    const { result } = renderHook(() =>
      useFeaturedSkills({ allSkills: [], importedSkillNames: [] }),
    );
    expect(result.current).toEqual([]);
  });

  it("未追加スキルのみをフィルタリングする", () => {
    const skills = [
      createMockSkillMetadata({ name: "skill-a" as SkillName }),
      createMockSkillMetadata({ name: "skill-b" as SkillName }),
      createMockSkillMetadata({ name: "skill-c" as SkillName }),
    ];
    const importedNames = ["skill-a"];

    const { result } = renderHook(() =>
      useFeaturedSkills({
        allSkills: skills,
        importedSkillNames: importedNames,
      }),
    );

    // skill-a はインポート済みなので除外される
    const resultNames = result.current.map((s) => s.name);
    expect(resultNames).not.toContain("skill-a");
    expect(resultNames).toContain("skill-b");
    expect(resultNames).toContain("skill-c");
  });

  it("最大3件に制限する", () => {
    const skills = [
      createMockSkillMetadata({ name: "skill-1" as SkillName }),
      createMockSkillMetadata({ name: "skill-2" as SkillName }),
      createMockSkillMetadata({ name: "skill-3" as SkillName }),
      createMockSkillMetadata({ name: "skill-4" as SkillName }),
      createMockSkillMetadata({ name: "skill-5" as SkillName }),
    ];

    const { result } = renderHook(() =>
      useFeaturedSkills({ allSkills: skills, importedSkillNames: [] }),
    );

    expect(result.current).toHaveLength(3);
  });

  it("maxCount パラメータで件数を制御できる", () => {
    const skills = [
      createMockSkillMetadata({ name: "skill-1" as SkillName }),
      createMockSkillMetadata({ name: "skill-2" as SkillName }),
      createMockSkillMetadata({ name: "skill-3" as SkillName }),
      createMockSkillMetadata({ name: "skill-4" as SkillName }),
    ];

    const { result } = renderHook(() =>
      useFeaturedSkills({
        allSkills: skills,
        importedSkillNames: [],
        maxCount: 2,
      }),
    );

    expect(result.current).toHaveLength(2);
  });

  it("インポート済みスキルは除外される", () => {
    const skills = [
      createMockSkillMetadata({ name: "imported-skill" as SkillName }),
      createMockSkillMetadata({ name: "available-skill" as SkillName }),
    ];
    const importedNames = ["imported-skill"];

    const { result } = renderHook(() =>
      useFeaturedSkills({
        allSkills: skills,
        importedSkillNames: importedNames,
      }),
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe("available-skill");
  });

  // --- inferCategory 分岐テスト ---

  it("inferCategory: 'テスト' を含む description は testing カテゴリ", () => {
    const skills = [
      createMockSkillMetadata({
        name: "test-cat-skill" as SkillName,
        description: "テストを自動化するスキル",
      }),
    ];

    const { result } = renderHook(() =>
      useFeaturedSkills({ allSkills: skills, importedSkillNames: [] }),
    );

    // テストカテゴリのスキルが選定される（結果に含まれる）
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe("test-cat-skill");
  });

  it("inferCategory: '設計' を含む description は design カテゴリ", () => {
    const skills = [
      createMockSkillMetadata({
        name: "design-cat-skill" as SkillName,
        description: "設計パターンを提案する",
      }),
    ];

    const { result } = renderHook(() =>
      useFeaturedSkills({ allSkills: skills, importedSkillNames: [] }),
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe("design-cat-skill");
  });

  it("inferCategory: 'セキュリティ' を含む description は security カテゴリ", () => {
    const skills = [
      createMockSkillMetadata({
        name: "security-cat-skill" as SkillName,
        description: "セキュリティ監査を実施する",
      }),
    ];

    const { result } = renderHook(() =>
      useFeaturedSkills({ allSkills: skills, importedSkillNames: [] }),
    );

    expect(result.current).toHaveLength(1);
  });

  it("inferCategory: 'ドキュメント' を含む description は documentation カテゴリ", () => {
    const skills = [
      createMockSkillMetadata({
        name: "doc-cat-skill" as SkillName,
        description: "ドキュメントを自動生成する",
      }),
    ];

    const { result } = renderHook(() =>
      useFeaturedSkills({ allSkills: skills, importedSkillNames: [] }),
    );

    expect(result.current).toHaveLength(1);
  });

  it("inferCategory: 'パフォーマンス' を含む description は performance カテゴリ", () => {
    const skills = [
      createMockSkillMetadata({
        name: "perf-cat-skill" as SkillName,
        description: "パフォーマンスを測定する",
      }),
    ];

    const { result } = renderHook(() =>
      useFeaturedSkills({ allSkills: skills, importedSkillNames: [] }),
    );

    expect(result.current).toHaveLength(1);
  });

  it("inferCategory: '開発' を含む description は development カテゴリ", () => {
    const skills = [
      createMockSkillMetadata({
        name: "dev-cat-skill" as SkillName,
        description: "開発ワークフローを改善する",
      }),
    ];

    const { result } = renderHook(() =>
      useFeaturedSkills({ allSkills: skills, importedSkillNames: [] }),
    );

    expect(result.current).toHaveLength(1);
  });

  it("inferCategory: 一致しない description は other カテゴリ", () => {
    const skills = [
      createMockSkillMetadata({
        name: "other-cat-skill" as SkillName,
        description: "料理のレシピを提案する",
      }),
    ];

    const { result } = renderHook(() =>
      useFeaturedSkills({ allSkills: skills, importedSkillNames: [] }),
    );

    expect(result.current).toHaveLength(1);
  });

  // --- ensureCategoryDiversity テスト ---

  it("ensureCategoryDiversity: 同カテゴリ最大2件の制限が適用される", () => {
    // 全て同じカテゴリ（testing）のスキルを4件用意
    const skills = [
      createMockSkillMetadata({
        name: "test-1" as SkillName,
        description: "テスト用スキル1",
        agents: [
          {
            filename: "a1.md",
            relativePath: "agents/a1.md",
            size: 100,
          },
          {
            filename: "a2.md",
            relativePath: "agents/a2.md",
            size: 100,
          },
          {
            filename: "a3.md",
            relativePath: "agents/a3.md",
            size: 100,
          },
        ],
      }),
      createMockSkillMetadata({
        name: "test-2" as SkillName,
        description: "テスト用スキル2",
        agents: [
          {
            filename: "a1.md",
            relativePath: "agents/a1.md",
            size: 100,
          },
          {
            filename: "a2.md",
            relativePath: "agents/a2.md",
            size: 100,
          },
        ],
      }),
      createMockSkillMetadata({
        name: "test-3" as SkillName,
        description: "テスト用スキル3",
        agents: [
          {
            filename: "a1.md",
            relativePath: "agents/a1.md",
            size: 100,
          },
        ],
      }),
      createMockSkillMetadata({
        name: "other-skill" as SkillName,
        description: "料理のレシピ提案",
      }),
    ];

    const { result } = renderHook(() =>
      useFeaturedSkills({
        allSkills: skills,
        importedSkillNames: [],
        maxCount: 3,
      }),
    );

    expect(result.current).toHaveLength(3);
    // 同カテゴリ（testing）のスキルが最大2件に制限される
    const testingSkills = result.current.filter(
      (s) => s.description.includes("テスト") || s.description.includes("test"),
    );
    expect(testingSkills.length).toBeLessThanOrEqual(2);
  });

  it("ensureCategoryDiversity: パス2でスキップされたスキルで枠を埋める", () => {
    // 異なるカテゴリのスキルを用意（maxPerCategory=2 が効くようにする）
    // カテゴリA: 3件、カテゴリB: 0件 → maxCount=3 の場合、
    // パス1で2件、パス2で1件選定される
    const skills = [
      createMockSkillMetadata({
        name: "test-a1" as SkillName,
        description: "テスト用スキルA1",
        agents: [
          {
            filename: "a.md",
            relativePath: "agents/a.md",
            size: 100,
          },
          {
            filename: "b.md",
            relativePath: "agents/b.md",
            size: 100,
          },
          {
            filename: "c.md",
            relativePath: "agents/c.md",
            size: 100,
          },
        ],
      }),
      createMockSkillMetadata({
        name: "test-a2" as SkillName,
        description: "テスト用スキルA2",
        agents: [
          {
            filename: "a.md",
            relativePath: "agents/a.md",
            size: 100,
          },
          {
            filename: "b.md",
            relativePath: "agents/b.md",
            size: 100,
          },
        ],
      }),
      createMockSkillMetadata({
        name: "test-a3" as SkillName,
        description: "テスト用スキルA3",
        agents: [
          {
            filename: "a.md",
            relativePath: "agents/a.md",
            size: 100,
          },
        ],
      }),
    ];

    const { result } = renderHook(() =>
      useFeaturedSkills({
        allSkills: skills,
        importedSkillNames: [],
        maxCount: 3,
      }),
    );

    // パス2でスキップされたスキル（test-a3）が追加され、3件になる
    expect(result.current).toHaveLength(3);
  });

  // --- popularity ソートテスト ---

  it("popularity（agents + references + indexes の合計）でソートされる", () => {
    const skills = [
      createMockSkillMetadata({
        name: "low-pop" as SkillName,
        description: "料理レシピ（低人気）",
        agents: [],
        references: [],
        indexes: [],
      }),
      createMockSkillMetadata({
        name: "high-pop" as SkillName,
        description: "旅行プラン（高人気）",
        agents: [
          {
            filename: "a1.md",
            relativePath: "agents/a1.md",
            size: 100,
          },
          {
            filename: "a2.md",
            relativePath: "agents/a2.md",
            size: 100,
          },
        ],
        references: [
          {
            filename: "r.md",
            relativePath: "references/r.md",
            size: 100,
          },
        ],
        indexes: [],
      }),
    ];

    const { result } = renderHook(() =>
      useFeaturedSkills({
        allSkills: skills,
        importedSkillNames: [],
        maxCount: 2,
      }),
    );

    // popularity 降順: high-pop（3）が先
    expect(result.current[0].name).toBe("high-pop");
    expect(result.current[1].name).toBe("low-pop");
  });

  it("不完全なメタデータ（配列/description欠落）でもクラッシュしない", () => {
    const malformedSkill = {
      ...createMockSkillMetadata({
        name: "malformed-skill" as SkillName,
      }),
      description: undefined,
      agents: undefined,
      references: undefined,
      indexes: undefined,
    } as unknown as SkillMetadata;

    const healthySkill = createMockSkillMetadata({
      name: "healthy-skill" as SkillName,
      description: "テストを補助するスキル",
      agents: [
        { filename: "a.md", relativePath: "agents/a.md", size: 100 },
        { filename: "b.md", relativePath: "agents/b.md", size: 100 },
      ],
    });

    const { result } = renderHook(() =>
      useFeaturedSkills({
        allSkills: [malformedSkill, healthySkill],
        importedSkillNames: [],
        maxCount: 2,
      }),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current.map((s) => s.name)).toEqual(
      expect.arrayContaining(["malformed-skill", "healthy-skill"]),
    );
  });
});
