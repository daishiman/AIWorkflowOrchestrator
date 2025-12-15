/**
 * Search Types - 検索機能の共有型定義
 */

/**
 * 検索オプション
 */
export interface SearchOptions {
  /** 大文字小文字を区別 */
  caseSensitive: boolean;
  /** 単語単位で検索 */
  wholeWord: boolean;
  /** 正規表現を使用 */
  useRegex: boolean;
}

/**
 * 検索マッチ結果
 */
export interface SearchMatch {
  /** マッチしたテキスト */
  text: string;
  /** 行番号 (1-indexed) */
  line: number;
  /** 列番号 (1-indexed) */
  column: number;
  /** マッチした文字列の長さ */
  length: number;
  /** ファイルパス (ワークスペース検索の場合) */
  filePath?: string;
}

/**
 * 検索結果
 */
export interface SearchResult {
  /** マッチ結果配列 */
  matches: SearchMatch[];
  /** 総マッチ数 */
  totalCount: number;
  /** 検索対象ファイル数 (ワークスペース検索の場合) */
  fileCount?: number;
}

/**
 * デフォルト検索オプション
 */
export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  caseSensitive: false,
  wholeWord: false,
  useRegex: false,
};
