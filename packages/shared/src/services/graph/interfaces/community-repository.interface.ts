/**
 * @file コミュニティリポジトリインターフェース
 * @module @repo/shared/services/graph/interfaces/community-repository
 * @description コミュニティデータの永続化インターフェース
 */

import type { Result } from "../../../types/rag/result";
import type { EntityId, CommunityId } from "../../../types/rag/branded";
import type { Community } from "../types";

/**
 * エンティティ-コミュニティマッピング
 */
export interface EntityCommunityMapping {
  readonly entityId: EntityId;
  readonly communityId: CommunityId;
}

/**
 * コミュニティリポジトリインターフェース
 *
 * @description
 * コミュニティデータの永続化を抽象化する。
 * SQLite実装が提供される。
 */
export interface ICommunityRepository {
  /**
   * コミュニティを挿入する
   *
   * @param community 挿入するコミュニティ
   * @returns 挿入されたコミュニティ（Result型）
   */
  insert(community: Community): Promise<Result<Community, Error>>;

  /**
   * 複数のコミュニティを一括挿入する
   *
   * @param communities 挿入するコミュニティリスト
   * @returns 挿入されたコミュニティリスト（Result型）
   */
  insertMany(
    communities: readonly Community[],
  ): Promise<Result<Community[], Error>>;

  /**
   * IDでコミュニティを取得する
   *
   * @param id コミュニティID
   * @returns コミュニティまたはnull（Result型）
   */
  findById(id: CommunityId): Promise<Result<Community | null, Error>>;

  /**
   * エンティティIDでコミュニティを取得する
   *
   * @param entityId エンティティID
   * @returns コミュニティリスト（Result型）
   */
  findByEntityId(entityId: EntityId): Promise<Result<Community[], Error>>;

  /**
   * レベルでコミュニティを取得する
   *
   * @param level 階層レベル
   * @returns コミュニティリスト（Result型）
   */
  findByLevel(level: number): Promise<Result<Community[], Error>>;

  /**
   * 全コミュニティを削除する
   *
   * @returns 削除成功の結果（Result型）
   */
  deleteAll(): Promise<Result<void, Error>>;

  /**
   * エンティティ-コミュニティマッピングを追加する
   *
   * @param entityId エンティティID
   * @param communityId コミュニティID
   * @returns 追加成功の結果（Result型）
   */
  addEntityCommunityMapping(
    entityId: EntityId,
    communityId: CommunityId,
  ): Promise<Result<void, Error>>;

  /**
   * 複数のエンティティ-コミュニティマッピングを一括追加する
   *
   * @param mappings マッピングリスト
   * @returns 追加成功の結果（Result型）
   */
  addEntityCommunityMappings(
    mappings: readonly EntityCommunityMapping[],
  ): Promise<Result<void, Error>>;
}
