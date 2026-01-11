/**
 * @file コミュニティ要約サービスインターフェース
 * @module @repo/shared/services/graph/interfaces/community-summarizer
 * @description コミュニティ要約生成サービスの抽象化インターフェース
 */

import type { Result } from "../../../types/rag/result";
import type { CommunityId } from "../../../types/rag/branded";
import type {
  Community,
  CommunityStructure,
  StoredEntity,
  StoredRelation,
  CommunitySummary,
  CommunitySummarizationOptions,
  CommunitySummarizationResult,
} from "../types";

/**
 * コミュニティ要約検索オプション
 */
export interface CommunitySummarySearchOptions {
  /** 検索対象の階層レベル */
  readonly level?: number;

  /** 返却する最大結果数 (デフォルト: 10) */
  readonly limit?: number;
}

/**
 * コミュニティ要約生成サービスのインターフェース
 *
 * @description
 * Leidenアルゴリズムで検出されたコミュニティに対してLLMで要約を生成し、
 * グローバルクエリへの回答に使用できる形式で保存する。
 * 要約の埋め込みも生成してセマンティック検索を可能にする。
 */
export interface ICommunitySummarizer {
  /**
   * 単一コミュニティの要約を生成
   *
   * @param community - 要約対象のコミュニティ
   * @param entities - コミュニティ内のエンティティ
   * @param relations - コミュニティ内の関係
   * @param options - 要約生成オプション
   * @returns 生成された要約、またはエラー
   *
   * @example
   * ```typescript
   * const result = await summarizer.summarize(
   *   community,
   *   entities,
   *   relations,
   *   { summaryStyle: "technical" }
   * );
   * if (result.ok) {
   *   console.log(result.value.summary);
   * }
   * ```
   */
  summarize(
    community: Community,
    entities: readonly StoredEntity[],
    relations: readonly StoredRelation[],
    options?: CommunitySummarizationOptions,
  ): Promise<Result<CommunitySummary, Error>>;

  /**
   * 全コミュニティの要約を生成（階層順）
   *
   * @param communityStructure - コミュニティ構造（全コミュニティを含む）
   * @param options - 要約生成オプション
   * @returns 全要約の生成結果、またはエラー
   *
   * @description
   * 階層の深い順（子→親）に処理することで、親コミュニティの要約に
   * 子コミュニティの要約を活用できる。
   *
   * @example
   * ```typescript
   * const result = await summarizer.summarizeAll(structure, {
   *   maxConcurrency: 5,
   *   useChildSummaries: true,
   * });
   * if (result.ok) {
   *   console.log(`Generated ${result.value.summaries.length} summaries`);
   *   console.log(`Failed: ${result.value.failedCommunities.length}`);
   * }
   * ```
   */
  summarizeAll(
    communityStructure: CommunityStructure,
    options?: CommunitySummarizationOptions,
  ): Promise<Result<CommunitySummarizationResult, Error>>;

  /**
   * コミュニティ要約をセマンティック検索
   *
   * @param query - 検索クエリ文字列
   * @param options - 検索オプション（レベル指定、結果数制限）
   * @returns 類似度順にソートされた要約の配列、またはエラー
   *
   * @description
   * クエリの埋め込みを生成し、要約の埋め込みとのコサイン距離で
   * 類似検索を行う。レベル指定で特定階層のみに絞り込める。
   *
   * @example
   * ```typescript
   * const result = await summarizer.searchSummaries(
   *   "プログラミング言語の特徴",
   *   { level: 0, limit: 5 }
   * );
   * if (result.ok) {
   *   result.value.forEach(s => console.log(s.summary));
   * }
   * ```
   */
  searchSummaries(
    query: string,
    options?: CommunitySummarySearchOptions,
  ): Promise<Result<CommunitySummary[], Error>>;

  /**
   * 要約を更新（グラフ変更時）
   *
   * @param communityId - 更新対象のコミュニティID
   * @returns 更新された要約、またはエラー
   *
   * @description
   * コミュニティの情報を再取得し、要約を再生成する。
   * グラフに変更があった場合の再計算に使用。
   *
   * @example
   * ```typescript
   * const result = await summarizer.updateSummary(communityId);
   * if (result.ok) {
   *   console.log(`Updated: ${result.value.createdAt}`);
   * }
   * ```
   */
  updateSummary(
    communityId: CommunityId,
  ): Promise<Result<CommunitySummary, Error>>;
}
