/**
 * 検索・置換機能 型定義
 */

/**
 * 検索オプション
 */
export interface SearchOptions {
  /** 大文字小文字を区別するか */
  caseSensitive: boolean;
  /** 単語単位でマッチするか */
  wholeWord: boolean;
  /** 正規表現を使用するか */
  regex: boolean;
}

/**
 * ワークスペース検索オプション
 */
export interface WorkspaceSearchOptions extends SearchOptions {
  /** インクルードパターン (glob) */
  include?: string[];
  /** エクスクルードパターン (glob) */
  exclude?: string[];
  /** 最大結果数 */
  maxResults?: number;
  /** コンテキスト行数 */
  contextLines?: number;
  /** プレビューモード（ファイル変更しない） */
  preview?: boolean;
  /** ドライランモード */
  dryRun?: boolean;
}

/**
 * マッチ情報
 */
export interface SearchMatch {
  /** 行番号 (1-indexed) */
  line: number;
  /** 列番号 (1-indexed) */
  column: number;
  /** マッチした文字列の長さ */
  length: number;
  /** マッチしたテキスト */
  text: string;
  /** マッチした行全体のテキスト */
  lineText: string;
  /** コンテキスト（前後の行） */
  context: {
    before: string[];
    after: string[];
  };
}

/**
 * ファイル検索結果
 */
export interface FileSearchResult {
  /** ファイルパス */
  filePath: string;
  /** マッチ一覧 */
  matches: SearchMatch[];
}

/**
 * 置換情報
 */
export interface Replacement {
  /** 行番号 (1-indexed) */
  line: number;
  /** 列番号 (1-indexed) */
  column: number;
  /** 置換前のテキスト */
  originalText: string;
  /** 置換後のテキスト */
  replacedText: string;
}

/**
 * 置換結果
 */
export interface ReplaceResult {
  /** 置換後のコンテンツ */
  content: string;
  /** 置換した件数 */
  count: number;
  /** 置換詳細一覧 */
  replacements: Replacement[];
}

/**
 * ワークスペース置換結果
 */
export interface WorkspaceReplaceResult {
  /** ファイルパス */
  filePath: string;
  /** 置換に成功したか */
  success: boolean;
  /** 置換した件数 */
  count?: number;
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** 置換詳細（プレビュー時） */
  replacements?: Replacement[];
}

/**
 * パターンマッチ結果
 */
export interface PatternMatch {
  /** マッチ開始位置 */
  index: number;
  /** マッチしたテキスト */
  text: string;
  /** キャプチャグループ */
  groups?: Record<string, string>;
}

/**
 * 検索ステータス
 */
export type SearchStatus =
  | "idle"
  | "searching"
  | "completed"
  | "cancelled"
  | "error";

/**
 * 検索エラー
 */
export interface SearchError {
  /** エラーコード */
  code:
    | "INVALID_PATTERN"
    | "TIMEOUT"
    | "FILE_READ_ERROR"
    | "PATH_TRAVERSAL"
    | "UNKNOWN";
  /** エラーメッセージ */
  message: string;
  /** 詳細情報 */
  details?: unknown;
}

/**
 * 検索設定
 */
export interface SearchSettings {
  /** 検索履歴の最大保持件数 */
  maxHistoryItems: number;
  /** デバウンス時間 (ms) */
  debounceMs: number;
  /** タイムアウト時間 (ms) */
  timeoutMs: number;
  /** デフォルトのコンテキスト行数 */
  defaultContextLines: number;
  /** デフォルトの除外パターン */
  defaultExcludePatterns: string[];
}

/**
 * 検索履歴エントリ
 */
export interface SearchHistoryEntry {
  /** 検索パターン */
  pattern: string;
  /** 検索オプション */
  options: SearchOptions;
  /** 検索日時 */
  timestamp: Date;
}
