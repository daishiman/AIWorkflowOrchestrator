/**
 * スキル共有・インポート機能の型定義
 * @see docs/30-workflows/skill-share/outputs/phase-2/api-specification.md
 */

/** 共有ソースの種別 */
export type ShareSourceType = "github" | "gist" | "url" | "local";

/** 共有エクスポート先の種別 */
export type ShareDestinationType = "gist" | "local";

/** スキル共有ソース定義 */
export interface ShareTarget {
  type: ShareSourceType;
  /** GitHub リポジトリ（例: "owner/repo"）-- type="github" 時に必須 */
  repo?: string;
  /** ブランチ名 -- type="github" 時にオプション（デフォルト: "main"） */
  branch?: string;
  /** リポジトリ内のパス -- type="github" 時にオプション（デフォルト: "/"） */
  path?: string;
  /** Gist ID -- type="gist" 時に必須 */
  gistId?: string;
  /** ローカルファイルパス -- type="local" 時に必須 */
  localPath?: string;
  /** URL -- type="url" 時に必須 */
  url?: string;
}

/** スキルエクスポート先定義 */
export interface ShareDestination {
  type: ShareDestinationType;
  /** Gist ID -- 空文字列で新規作成、既存 ID で更新 */
  gistId?: string;
  /** ローカルエクスポート先パス */
  localPath?: string;
}

/** インポート結果 */
export interface ShareImportResult {
  success: boolean;
  skillName: string;
  skillPath: string;
  source: ShareTarget;
  /** ISO 8601 形式の日時文字列 */
  importedAt: string;
}

/** エクスポート結果 */
export interface ShareExportResult {
  success: boolean;
  destination: ShareDestination;
  exportedFiles: string[];
  /** Gist エクスポート時の共有 URL */
  shareUrl?: string;
}

/** ソース検証結果 */
export interface ShareValidateSourceResult {
  isReachable: boolean;
  hasSkillMd: boolean;
  skillName?: string;
  errors: string[];
}

/** スキル共有エラーカテゴリ */
export type ShareErrorCategory =
  | "validation"
  | "business"
  | "external"
  | "infrastructure"
  | "internal";

/** スキル共有エラー */
export interface ShareError {
  code: number;
  message: string;
  category: ShareErrorCategory;
  isRetryable: boolean;
}

/** Result パターン */
export interface ShareResult<T> {
  success: boolean;
  data?: T;
  error?: ShareError;
}
