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

// ===== Section: 採点ゲート型 (TASK-SKILL-LIFECYCLE-04) =====

/** スコアを 0-100 整数に正規化（防御的実装） */
export function normalizeScore(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.round(Math.max(0, Math.min(100, n)));
}

/** EvaluationBreakdown の5項目（均等重み）から総合スコアを算出 */
export function calculateScoreFromBreakdown(
  breakdown: EvaluationBreakdown,
): number {
  const raw =
    (breakdown.clarity +
      breakdown.specificity +
      breakdown.completeness +
      breakdown.reproducibility +
      breakdown.security) /
    5;
  return normalizeScore(raw);
}

/** 採点ゲート: 4段階の品質判定 */
export type ScoringGate =
  | "NEEDS_IMPROVEMENT" // 0-59: 改善必須
  | "SAVE_ALLOWED" // 60-79: 保存可・改善推奨
  | "USE_ALLOWED" // 80-99: 利用可
  | "RECOMMENDED"; // 100:   推奨

/** ゲート判定結果（UI制御用フラグ付き）*/
export interface ScoringGateResult {
  gate: ScoringGate;
  score: number;
  canSave: boolean;
  canUse: boolean;
  isRecommended: boolean;
}

/** スコア差分情報 */
export interface ScoreDelta {
  previousScore: number;
  newScore: number;
  delta: number;
  /** |delta| >= 3 で方向確定、2以下は neutral */
  direction: "up" | "neutral" | "down";
}

/** スコア → ScoringGate 判定（純粋関数）*/
export function getScoreGate(score: number): ScoringGate {
  const s = normalizeScore(score);
  if (s === 100) return "RECOMMENDED";
  if (s >= 80) return "USE_ALLOWED";
  if (s >= 60) return "SAVE_ALLOWED";
  return "NEEDS_IMPROVEMENT";
}

/** スコア → ScoringGateResult（UIフラグ込み）*/
export function getScoreGateResult(score: number): ScoringGateResult {
  const gate = getScoreGate(score);
  return {
    gate,
    score: normalizeScore(score),
    canSave: gate !== "NEEDS_IMPROVEMENT",
    canUse: gate === "USE_ALLOWED" || gate === "RECOMMENDED",
    isRecommended: gate === "RECOMMENDED",
  };
}

/** スコア差分を計算（pure function）*/
export function calculateScoreDelta(
  previousScore: number,
  newScore: number,
): ScoreDelta {
  const delta = normalizeScore(newScore) - normalizeScore(previousScore);
  const direction: ScoreDelta["direction"] =
    delta >= 3 ? "up" : delta <= -3 ? "down" : "neutral";
  return {
    previousScore: normalizeScore(previousScore),
    newScore: normalizeScore(newScore),
    delta,
    direction,
  };
}
