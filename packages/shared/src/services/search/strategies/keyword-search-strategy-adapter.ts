/**
 * @file KeywordSearchStrategyAdapter
 * @description KeywordSearchStrategy を ISearchStrategy インターフェースに適合させるアダプタ
 * DT-03: keyword adapter 設計
 */

import type {
  SearchResultItem,
  SearchFilters,
  StrategyMetric,
  SearchQuery,
  SearchOptions,
} from "../../../types/rag/search/types";
import { QueryTypes, SearchStrategies } from "../../../types/rag/search/types";
import type { Result } from "./types";
import { ok, err } from "./types";
import type { ISearchStrategy } from "./types";
import type { KeywordSearchStrategy } from "../keyword-search-strategy";

const DEFAULT_FILTERS: SearchFilters = {
  fileIds: null,
  entityTypes: null,
  dateRange: null,
  minRelevance: 0,
};

const createDefaultOptions = (limit: number): SearchOptions => ({
  limit,
  offset: 0,
  includeMetadata: false,
  includeHighlights: false,
  rerankEnabled: false,
  cragEnabled: false,
  strategies: [SearchStrategies.KEYWORD],
  weights: { keyword: 1, semantic: 0, graph: 0 },
});

export class KeywordSearchStrategyAdapter implements ISearchStrategy {
  readonly name = "keyword";

  private lastMetric: StrategyMetric = {
    enabled: true,
    resultCount: 0,
    processingTime: 0,
    topScore: 0,
  };

  constructor(private readonly inner: KeywordSearchStrategy) {}

  async search(
    query: string,
    limit: number,
    filters?: SearchFilters,
  ): Promise<Result<SearchResultItem[], Error>> {
    const startTime = performance.now();
    try {
      const searchQuery: SearchQuery = {
        text: query,
        type: QueryTypes.LOCAL,
        embedding: null,
        filters: filters ?? DEFAULT_FILTERS,
        options: createDefaultOptions(limit),
      };

      const result = await this.inner.search(searchQuery);
      const items: SearchResultItem[] = Array.isArray(result) ? result : [];
      const processingTime = performance.now() - startTime;

      this.lastMetric = {
        enabled: true,
        resultCount: items.length,
        processingTime,
        topScore: items.length > 0 ? (items[0]?.score ?? 0) : 0,
      };

      return ok(items);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  getMetrics(): StrategyMetric {
    return this.lastMetric;
  }
}
