/**
 * @file コミュニティ検出インターフェース
 * @module @repo/shared/services/graph/interfaces/community-detector
 * @description コミュニティ検出サービスのインターフェース定義
 */

import type { Result } from "../../../types/rag/result";
import type { EntityId, CommunityId } from "../../../types/rag/branded";
import type {
  Community,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
  StoredEntity,
} from "../types";

/**
 * コミュニティ検出サービスインターフェース
 *
 * @description
 * Leidenアルゴリズムによるコミュニティ検出と
 * 検出結果の永続化・取得を行う。
 */
export interface ICommunityDetector {
  /**
   * コミュニティを検出する
   *
   * @param options 検出オプション
   * @returns 検出結果（Result型）
   *
   * @example
   * const result = await detector.detect({ resolution: 1.0 });
   * if (isOk(result)) {
   *   console.log(`Found ${result.data.structure.communities.length} communities`);
   * }
   */
  detect(
    options?: CommunityDetectionOptions,
  ): Promise<Result<CommunityDetectionResult, Error>>;

  /**
   * 検出結果をデータベースに保存する
   *
   * @param structure 保存するコミュニティ構造
   * @returns 保存成功の結果（Result型）
   *
   * @example
   * const saveResult = await detector.saveResults(structure);
   * if (isErr(saveResult)) {
   *   console.error('Failed to save:', saveResult.error);
   * }
   */
  saveResults(structure: CommunityStructure): Promise<Result<void, Error>>;

  /**
   * エンティティが属するコミュニティを取得する
   *
   * @param entityId エンティティID
   * @returns コミュニティリスト（Result型）
   *
   * @description
   * 階層構造のため、エンティティは複数のコミュニティに属する場合がある
   */
  getCommunitiesForEntity(
    entityId: EntityId,
  ): Promise<Result<Community[], Error>>;

  /**
   * 指定レベルのコミュニティを取得する
   *
   * @param level 階層レベル（0が最下層）
   * @returns コミュニティリスト（Result型）
   */
  getCommunitiesByLevel(level: number): Promise<Result<Community[], Error>>;

  /**
   * コミュニティのメンバーエンティティを取得する
   *
   * @param communityId コミュニティID
   * @returns エンティティリスト（Result型）
   */
  getCommunityMembers(
    communityId: CommunityId,
  ): Promise<Result<StoredEntity[], Error>>;
}
