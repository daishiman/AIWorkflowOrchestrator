/**
 * Search Types - 検索機能の型定義
 */

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  pattern?: string;
}

export interface SearchMatch {
  text: string;
  line: number;
  column: number;
  length: number;
}
