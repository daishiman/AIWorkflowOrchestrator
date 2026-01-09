/**
 * スライド依存関係管理システム - 型定義
 * @module slide/types
 */

/**
 * スライドプロジェクトの構造
 */
export interface SlideProject {
  /** プロジェクトのルートパス */
  path: string;
  /** structure.mdのパス */
  structurePath: string;
  /** index.htmlのパス */
  htmlPath: string;
  /** 同期状態 */
  syncStatus: SyncStatus;
  /** 最終同期日時 */
  lastSyncAt: Date | null;
}

/**
 * 同期状態
 */
export type SyncStatus = "synced" | "out-of-sync" | "syncing" | "error";

/**
 * スキルフェーズ
 */
export type SkillPhase = "hearing" | "structure" | "html" | "modifier";

/**
 * スキル実行結果
 */
export interface SkillExecutionResult {
  /** 実行したフェーズ */
  phase: SkillPhase;
  /** 成功フラグ */
  success: boolean;
  /** 出力内容 */
  output?: string;
  /** エラーメッセージ */
  error?: string;
  /** 実行時間（ミリ秒） */
  duration: number;
}

/**
 * ファイルウォッチャー設定
 */
export interface WatcherConfig {
  /** 永続的な監視 */
  persistent: boolean;
  /** 初回イベントを無視 */
  ignoreInitial: boolean;
  /** 書き込み完了を待機 */
  awaitWriteFinish: {
    /** 安定化閾値（ミリ秒） */
    stabilityThreshold: number;
    /** ポーリング間隔（ミリ秒） */
    pollInterval: number;
  };
  /** 除外パターン */
  ignored: string[];
}

/**
 * 変更コンテキスト（無限ループ防止用）
 */
export interface ChangeContext {
  /** 変更の発生元 */
  source: "user" | "skill";
  /** タイムスタンプ */
  timestamp: number;
  /** スキルフェーズ（スキル起因の場合） */
  skillPhase?: SkillPhase;
}

/**
 * スライドエラーコード
 */
export type SlideErrorCode =
  | "SLIDE_E001" // プロジェクトが見つからない
  | "SLIDE_E002" // structure.mdが見つからない
  | "SLIDE_E003" // index.htmlが見つからない
  | "SLIDE_E004" // ファイル読み込みエラー
  | "SLIDE_E005" // ファイル書き込みエラー
  | "SLIDE_E006" // スキル実行エラー
  | "SLIDE_E007" // 同期エラー
  | "SLIDE_E008" // キャンセルエラー
  | "SLIDE_E009" // タイムアウトエラー
  | "SLIDE_E999"; // 不明なエラー

/**
 * スライドエラー
 */
export interface SlideError {
  /** エラーコード */
  code: SlideErrorCode;
  /** エラーメッセージ */
  message: string;
  /** 詳細情報 */
  details?: Record<string, unknown>;
}

/**
 * IPC応答の基本型
 */
export interface SlideResponse<T = void> {
  /** 成功フラグ */
  success: boolean;
  /** データ */
  data?: T;
  /** エラー情報 */
  error?: SlideError;
}
