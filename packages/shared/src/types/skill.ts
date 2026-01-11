/**
 * スキル管理UI用の型定義
 * @module skill
 */

/**
 * アンカー（参照文献）情報
 */
export interface Anchor {
  /** 参照元名（source） */
  source: string;
  /** @deprecated Use `source` instead */
  name?: string;
  /** 適用方法 */
  application: string;
  /** 目的 */
  purpose: string;
}

/**
 * 環境設定
 */
export interface EnvironmentConfig {
  type: "html" | "markdown" | "code";
  autoRefresh?: boolean;
  debounce?: number;
}

/**
 * スキルカテゴリ
 */
export type SkillCategory =
  | "testing"
  | "design"
  | "development"
  | "documentation"
  | "security"
  | "performance"
  | "other";

/**
 * スキルカテゴリのラベルとカラー定義
 */
export const SKILL_CATEGORIES: Record<
  SkillCategory,
  { label: string; color: string }
> = {
  testing: { label: "テスト", color: "green" },
  design: { label: "設計", color: "blue" },
  development: { label: "開発", color: "purple" },
  documentation: { label: "ドキュメント", color: "orange" },
  security: { label: "セキュリティ", color: "red" },
  performance: { label: "パフォーマンス", color: "yellow" },
  other: { label: "その他", color: "gray" },
};

/**
 * スキルの基本情報
 */
export interface Skill {
  /** 一意識別子（パスのハッシュ） */
  id: string;
  /** スキル名（SKILL.md解析） */
  name: string;
  /** ディレクトリ名 */
  slug: string;
  /** 概要説明 */
  description: string;
  /** .claude/skills/xxx/SKILL.md */
  path: string;
  /** Triggerキーワード */
  triggers: string[];
  /** Anchor一覧 */
  anchors: Anchor[];
  /** カテゴリ（推論または手動設定） */
  category?: SkillCategory | string;
  /** 環境設定 */
  environment?: EnvironmentConfig;
  /** ライセンス */
  license?: string;
  /** 許可されたツール */
  allowedTools?: string[];
  /** タグ */
  tags?: string[];
  /** 依存関係 */
  dependencies?: string[];
  /** 最終更新日（Date） */
  lastModified: Date;
  /** @deprecated Use `lastModified` instead */
  lastUpdated?: string;
}

/**
 * スキル詳細情報（拡張）
 */
export interface SkillDetail extends Skill {
  /** ワークフロー定義 */
  workflow?: string;
  /** ベストプラクティス */
  bestPractices?: string[];
  /** 参照リンク */
  references?: string[];
  /** 関連アセット */
  assets?: string[];
  /** SKILL.mdの全文コンテンツ */
  fullContent?: string;
}

/**
 * インポート設定（永続化用）
 */
export interface SkillImportConfig {
  /** インポート済みスキルID */
  importedSkillIds: string[];
  /** 最終更新日時 */
  lastUpdated: string;
}

/**
 * 操作結果
 */
export interface OperationResult<T = void> {
  /** 成功フラグ */
  success: boolean;
  /** 成功時のデータ */
  data?: T;
  /** エラーメッセージ */
  error?: string;
}

/**
 * スキルスキャンエラー
 */
export interface SkillScanError {
  /** エラーが発生したパス */
  path: string;
  /** エラーメッセージ */
  error: string;
  /** エラーコード */
  code: "PARSE_ERROR" | "READ_ERROR" | "INVALID_FORMAT";
}

/**
 * スキルスキャン結果
 */
export interface SkillScanResult {
  /** 検出されたスキル */
  skills: Skill[];
  /** スキャン中のエラー */
  errors: SkillScanError[];
  /** スキャン日時 */
  scannedAt: Date;
}

/**
 * インポート結果
 */
export interface ImportResult {
  /** 成功フラグ */
  success: boolean;
  /** インポートされた件数 */
  importedCount: number;
  /** エラーメッセージ */
  errors: string[];
}

/**
 * 削除結果
 */
export interface RemoveResult {
  /** 成功フラグ */
  success: boolean;
  /** 実際に削除されたか */
  removed: boolean;
}

/**
 * IPCエラー
 */
export interface IPCError {
  /** エラーコード */
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "AUTH_ERROR" | "INTERNAL_ERROR";
  /** エラーメッセージ */
  message: string;
  /** 詳細情報 */
  details?: unknown;
}
