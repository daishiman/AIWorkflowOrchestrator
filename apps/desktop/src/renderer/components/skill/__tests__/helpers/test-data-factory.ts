/**
 * テストデータファクトリ
 * TASK-10A-B: SkillAnalysisView テスト共通テストデータ
 */
import type {
  SkillAnalysis,
  AnalysisCategory,
  Suggestion,
  Risk,
  ImprovementResult,
  AppliedImprovement,
} from "@repo/shared/types/skill-improver";

export const createMockCategory = (
  overrides?: Partial<AnalysisCategory>,
): AnalysisCategory => ({
  name: "Code Quality",
  score: 75,
  details: "コード品質の分析結果",
  issues: ["未使用の変数が存在"],
  ...overrides,
});

export const createMockSuggestion = (
  overrides?: Partial<Suggestion>,
): Suggestion => ({
  type: "prompt",
  priority: "medium",
  description: "プロンプトの明確化を推奨",
  autoFixable: false,
  ...overrides,
});

export const createMockRisk = (overrides?: Partial<Risk>): Risk => ({
  category: "security",
  level: "medium",
  description: "外部入力のバリデーション不足",
  impact: "不正入力による予期しない動作",
  mitigation: "入力値のサニタイズを追加する",
  ...overrides,
});

export const createMockAppliedImprovement = (
  overrides?: Partial<AppliedImprovement>,
): AppliedImprovement => ({
  suggestion: createMockSuggestion(),
  result: "success",
  changes: ["プロンプトの明確化を実施"],
  ...overrides,
});

export const createMockAnalysis = (
  overrides?: Partial<SkillAnalysis>,
): SkillAnalysis => ({
  skillName: "test-skill",
  overallScore: 72,
  categories: [
    createMockCategory({ name: "Code Quality", score: 80 }),
    createMockCategory({ name: "Security", score: 60 }),
    createMockCategory({ name: "Documentation", score: 75 }),
  ],
  suggestions: [
    createMockSuggestion({
      priority: "high",
      autoFixable: true,
      description: "高優先度: セキュリティ改善",
    }),
    createMockSuggestion({
      priority: "medium",
      autoFixable: false,
      description: "中優先度: 構造改善",
    }),
    createMockSuggestion({
      priority: "low",
      autoFixable: true,
      description: "低優先度: ドキュメント追加",
    }),
  ],
  risks: [
    createMockRisk({ level: "high", description: "重要なセキュリティリスク" }),
    createMockRisk({
      level: "medium",
      description: "中程度のパフォーマンスリスク",
    }),
  ],
  ...overrides,
});

export const createMockImprovementResult = (
  overrides?: Partial<ImprovementResult>,
): ImprovementResult => ({
  skillName: "test-skill",
  applied: [createMockAppliedImprovement()],
  skipped: [],
  errors: [],
  executedAt: new Date("2026-03-02T00:00:00Z"),
  ...overrides,
});

/**
 * 高スコア分析結果（スコア85）
 */
export const createHighScoreAnalysis = (): SkillAnalysis =>
  createMockAnalysis({
    overallScore: 85,
    categories: [
      createMockCategory({ name: "Code Quality", score: 90 }),
      createMockCategory({ name: "Security", score: 85 }),
      createMockCategory({ name: "Documentation", score: 80 }),
    ],
    suggestions: [],
    risks: [],
  });

/**
 * 低スコア分析結果（スコア35）
 */
export const createLowScoreAnalysis = (): SkillAnalysis =>
  createMockAnalysis({
    overallScore: 35,
    categories: [
      createMockCategory({ name: "Code Quality", score: 30 }),
      createMockCategory({ name: "Security", score: 40 }),
      createMockCategory({ name: "Documentation", score: 35 }),
    ],
    risks: [
      createMockRisk({
        level: "critical",
        description: "クリティカルなセキュリティ脆弱性",
      }),
      createMockRisk({
        level: "high",
        description: "高レベルのパフォーマンス問題",
      }),
      createMockRisk({
        level: "medium",
        description: "中程度の互換性リスク",
      }),
      createMockRisk({
        level: "low",
        description: "軽微なメンテナンスリスク",
      }),
    ],
  });
