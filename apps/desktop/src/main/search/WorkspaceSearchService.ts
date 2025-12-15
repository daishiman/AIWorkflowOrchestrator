/**
 * WorkspaceSearchService - ワークスペース全体検索
 *
 * 機能:
 * - 複数ファイルの並列検索
 * - ファイルタイプフィルタ
 * - 除外パターン（.gitignore互換）
 * - 検索結果のグルーピング
 * - 検索キャンセル機能
 * - 検索統計
 */

import * as path from "path";
import {
  SearchService,
  type SearchResult,
  type SearchOptions,
} from "./SearchService";
import { mergeExcludePatterns } from "../utils";

export interface WorkspaceSearchOptions {
  query: string;
  workspacePath: string;
  include: string[];
  exclude?: string[];
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  contextLines?: number;
  maxFileSize?: number;
  maxConcurrency?: number;
}

export interface WorkspaceSearchResult extends SearchResult {
  relativePath: string;
}

export interface GroupedSearchResults {
  [filePath: string]: WorkspaceSearchResult[];
}

export interface SearchStats {
  totalMatches: number;
  filesWithMatches: number;
  filesSearched: number;
  duration: number;
  results: WorkspaceSearchResult[];
}

export class WorkspaceSearchService {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  /**
   * ワークスペース検索を実行
   */
  async search(
    options: WorkspaceSearchOptions,
    signal?: AbortSignal,
  ): Promise<WorkspaceSearchResult[]> {
    if (!options.query) {
      return [];
    }

    // キャンセルチェック
    if (signal?.aborted) {
      return [];
    }

    // 検索オプションを構築
    const searchOptions: SearchOptions = {
      query: options.query,
      include: this.resolveIncludePaths(options.workspacePath, options.include),
      exclude: mergeExcludePatterns(options.exclude),
      caseSensitive: options.caseSensitive,
      wholeWord: options.wholeWord,
      useRegex: options.useRegex,
      contextLines: options.contextLines,
      maxFileSize: options.maxFileSize,
    };

    try {
      const results = await this.searchService.search(searchOptions);

      // キャンセルチェック
      if (signal?.aborted) {
        return [];
      }

      // 相対パスを追加
      return results.map((result) => ({
        ...result,
        relativePath: path.relative(options.workspacePath, result.file),
      }));
    } catch (error) {
      if (signal?.aborted) {
        return [];
      }
      throw error;
    }
  }

  /**
   * 検索結果をファイルごとにグルーピング
   */
  async searchGrouped(
    options: WorkspaceSearchOptions,
    signal?: AbortSignal,
  ): Promise<GroupedSearchResults> {
    const results = await this.search(options, signal);

    const grouped: GroupedSearchResults = {};

    for (const result of results) {
      if (!grouped[result.file]) {
        grouped[result.file] = [];
      }
      grouped[result.file].push(result);
    }

    return grouped;
  }

  /**
   * 検索結果と統計情報を取得
   */
  async searchWithStats(
    options: WorkspaceSearchOptions,
    signal?: AbortSignal,
  ): Promise<SearchStats> {
    const startTime = Date.now();

    const results = await this.search(options, signal);

    const filesWithMatches = new Set(results.map((r) => r.file)).size;

    return {
      totalMatches: results.length,
      filesWithMatches,
      filesSearched: filesWithMatches, // 簡略化: マッチしたファイル数のみ
      duration: Date.now() - startTime,
      results,
    };
  }

  /**
   * includeパターンをワークスペースパスに解決
   */
  private resolveIncludePaths(
    workspacePath: string,
    include: string[],
  ): string[] {
    return include.map((pattern) => {
      // 既に絶対パスまたはglobパターンの場合はそのまま
      if (path.isAbsolute(pattern) || pattern.startsWith("*")) {
        return path.join(workspacePath, pattern);
      }
      return path.join(workspacePath, pattern);
    });
  }
}
