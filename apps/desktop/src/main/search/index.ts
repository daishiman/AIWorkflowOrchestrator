/**
 * Search Module - ファイル検索機能
 *
 * このモジュールは以下のコンポーネントを提供します:
 * - PatternMatcher: テキスト検索のパターンマッチング
 * - FileReader: ファイル読み込みユーティリティ
 * - BinaryDetector: バイナリ/テキスト判定
 * - GlobResolver: Globパターンによるファイル検索
 * - SearchService: 検索オーケストレーション
 * - WorkspaceSearchService: ワークスペース全体検索
 */

export {
  PatternMatcher,
  type SearchOptions as PatternSearchOptions,
  type MatchResult,
} from "./PatternMatcher";
export { FileReader, type FileContent } from "./FileReader";
export { BinaryDetector } from "./BinaryDetector";
export { GlobResolver, type GlobOptions } from "./GlobResolver";
export {
  SearchService,
  type SearchOptions,
  type SearchResult,
} from "./SearchService";
export {
  WorkspaceSearchService,
  type WorkspaceSearchOptions,
  type WorkspaceSearchResult,
  type GroupedSearchResults,
  type SearchStats,
} from "./WorkspaceSearchService";
