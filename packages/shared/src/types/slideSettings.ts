/**
 * Slide Settings Types - スライド設定型定義
 *
 * presentation-slide-generatorスキルの出力先設定を管理するための型定義。
 *
 * @module @repo/shared/types/slideSettings
 */

/**
 * スライド設定インターフェース
 */
export interface SlideSettings {
  /** 出力ディレクトリパス */
  outputDirectory: string;
  /** ディレクトリが存在しない場合に自動作成するか */
  autoCreateDirectory: boolean;
  /** デフォルトテーマ */
  defaultTheme: "kanagawa";
  /** スキーマバージョン（マイグレーション用） */
  schemaVersion: number;
}

/**
 * デフォルトのスライド設定
 */
export const DEFAULT_SLIDE_SETTINGS: SlideSettings = {
  outputDirectory: "~/Documents/Slides",
  autoCreateDirectory: true,
  defaultTheme: "kanagawa",
  schemaVersion: 1,
};

/**
 * ディレクトリバリデーション結果（詳細版）
 */
export interface DirectoryValidationResult {
  /** 全体的な有効性 */
  valid: boolean;
  /** ディレクトリが存在するか */
  exists: boolean;
  /** 書き込み可能か */
  writable: boolean;
  /** エラーメッセージ（致命的な問題がある場合） */
  error?: string;
  /** 警告メッセージ（問題はあるが続行可能な場合） */
  warning?: string;
}

/**
 * バリデーション結果（シンプル版）
 *
 * IPCレスポンス用の簡潔なバリデーション結果型。
 */
export interface ValidationResult {
  /** バリデーションステータス */
  status: "valid" | "warning" | "error";
  /** メッセージ */
  message: string;
  /** 追加詳細（オプション） */
  details?: Record<string, unknown>;
}

/**
 * スライド設定取得レスポンス
 */
export interface SlideSettingsGetResponse {
  success: boolean;
  data?: SlideSettings;
  error?: string;
}

/**
 * ディレクトリ取得レスポンス
 */
export interface SlideSettingsGetDirectoryResponse {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * ディレクトリ設定レスポンス
 */
export interface SlideSettingsSetDirectoryResponse {
  success: boolean;
  error?: string;
}

/**
 * ディレクトリ選択レスポンス
 */
export interface SlideSettingsSelectDirectoryResponse {
  success: boolean;
  data?: string | null;
  error?: string;
}

/**
 * ディレクトリバリデーションレスポンス
 */
export interface SlideSettingsValidateDirectoryResponse {
  success: boolean;
  data?: ValidationResult;
  error?: string;
}

/**
 * スライド設定API型定義
 */
export interface SlideSettingsAPI {
  getDirectory: () => Promise<SlideSettingsGetDirectoryResponse>;
  setDirectory: (dirPath: string) => Promise<SlideSettingsSetDirectoryResponse>;
  selectDirectory: () => Promise<SlideSettingsSelectDirectoryResponse>;
  validateDirectory: (
    dirPath: string,
  ) => Promise<SlideSettingsValidateDirectoryResponse>;
  getAllSettings: () => Promise<SlideSettingsGetResponse>;
}
