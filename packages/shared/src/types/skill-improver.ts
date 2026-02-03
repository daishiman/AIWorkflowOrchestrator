/**
 * スキル改善・自動修正機能の型定義
 * TASK-9C: Skill Improver Types
 *
 * @module skill-improver
 */

// ========================================
// Section: 分析結果型 (SkillAnalyzer)
// ========================================

/**
 * 提案の種別
 */
export type SuggestionType =
  | "prompt"
  | "structure"
  | "documentation"
  | "security"
  | "performance";

/**
 * 提案の優先度
 */
export type SuggestionPriority = "high" | "medium" | "low";

/**
 * 改善提案
 */
export interface Suggestion {
  /** 提案種別 */
  type: SuggestionType;

  /** 優先度 */
  priority: SuggestionPriority;

  /** 提案内容の説明 */
  description: string;

  /** 自動修正可能かどうか */
  autoFixable: boolean;

  /** 修正対象のファイルパス（オプション） */
  targetPath?: string;

  /** 推奨される修正内容（オプション） */
  suggestedFix?: string;
}

/**
 * リスク情報
 */
export interface Risk {
  /** リスクの種類 */
  category: "security" | "compatibility" | "performance" | "maintenance";

  /** リスクレベル */
  level: "critical" | "high" | "medium" | "low";

  /** リスクの説明 */
  description: string;

  /** 影響範囲 */
  impact: string;

  /** 緩和策 */
  mitigation?: string;
}

/**
 * 分析カテゴリ
 */
export interface AnalysisCategory {
  /** カテゴリ名 */
  name: string;

  /** スコア (0-100) */
  score: number;

  /** 詳細説明 */
  details: string;

  /** 検出された問題 */
  issues: string[];
}

/**
 * スキル分析結果
 */
export interface SkillAnalysis {
  /** 分析対象のスキル名 */
  skillName: string;

  /** 総合スコア (0-100) */
  overallScore: number;

  /** カテゴリ別分析結果 */
  categories: AnalysisCategory[];

  /** 改善提案リスト */
  suggestions: Suggestion[];

  /** リスク情報リスト */
  risks: Risk[];

  /** 分析日時 */
  analyzedAt?: Date;
}

// ========================================
// Section: 改善実行型 (SkillImprover)
// ========================================

/**
 * 改善オプション
 */
export interface ImprovementOptions {
  /** 自動修正を適用するかどうか */
  autoFix?: boolean;

  /** 適用する提案種別のフィルタ */
  types?: SuggestionType[];

  /** 最低優先度（これ以上の優先度のみ適用） */
  minPriority?: SuggestionPriority;

  /** ドライラン（実際には変更しない） */
  dryRun?: boolean;

  /** バックアップを作成するかどうか（デフォルト: true） */
  createBackup?: boolean;
}

/**
 * 適用済み改善
 */
export interface AppliedImprovement {
  /** 元の提案 */
  suggestion: Suggestion;

  /** 適用結果 */
  result: "success" | "partial" | "failed";

  /** 変更内容の説明 */
  changes: string[];

  /** エラーメッセージ（失敗時） */
  error?: string;
}

/**
 * 改善実行結果
 */
export interface ImprovementResult {
  /** スキル名 */
  skillName: string;

  /** 適用された改善 */
  applied: AppliedImprovement[];

  /** スキップされた提案 */
  skipped: Suggestion[];

  /** エラーが発生した改善 */
  errors: Array<{
    suggestion: Suggestion;
    error: string;
  }>;

  /** バックアップパス（作成された場合） */
  backupPath?: string;

  /** 実行日時 */
  executedAt: Date;
}

// ========================================
// Section: プロンプト最適化型 (PromptOptimizer)
// ========================================

/**
 * 最適化メトリクス
 */
export interface OptimizationMetrics {
  /** 明確さスコア (0-100) */
  clarityScore: number;

  /** 具体性スコア (0-100) */
  specificityScore: number;

  /** 完全性スコア (0-100) */
  completenessScore: number;
}

/**
 * プロンプト最適化結果
 */
export interface OptimizationResult {
  /** 元のプロンプト */
  original: string;

  /** 最適化後のプロンプト */
  optimized: string;

  /** 変更点の説明 */
  changes: string[];

  /** 最適化メトリクス */
  metrics: OptimizationMetrics;
}

/**
 * プロンプト評価の内訳
 */
export interface EvaluationBreakdown {
  /** 明確さ (0-100) */
  clarity: number;

  /** 具体性 (0-100) */
  specificity: number;

  /** 完全性 (0-100) */
  completeness: number;

  /** 再現性 (0-100) */
  reproducibility: number;

  /** セキュリティ (0-100) */
  security: number;
}

/**
 * プロンプト評価結果
 */
export interface PromptEvaluation {
  /** 総合スコア (0-100) */
  score: number;

  /** スコアの内訳 */
  breakdown?: EvaluationBreakdown;

  /** フィードバックコメント */
  feedback: string[];
}

// ========================================
// Section: IPC リクエスト/レスポンス型
// ========================================

/**
 * skill:analyze のリクエスト
 */
export interface SkillAnalyzeRequest {
  /** スキル名 */
  skillName: string;
}

/**
 * skill:improve のリクエスト
 */
export interface SkillImproveRequest {
  /** スキル名 */
  skillName: string;

  /** 分析結果 */
  analysis: SkillAnalysis;

  /** 改善オプション */
  options?: ImprovementOptions;
}

/**
 * skill:optimize のリクエスト
 */
export interface SkillOptimizeRequest {
  /** 最適化対象のプロンプト */
  prompt: string;
}

/**
 * skill:optimize:variants のリクエスト
 */
export interface SkillOptimizeVariantsRequest {
  /** 元のプロンプト */
  prompt: string;

  /** 生成するバリアント数（デフォルト: 3） */
  count?: number;
}

/**
 * skill:optimize:evaluate のリクエスト
 */
export interface SkillOptimizeEvaluateRequest {
  /** 評価対象のプロンプト */
  prompt: string;
}
