/**
 * @file コミュニティ検出サービス
 * @module @repo/shared/services/graph/community-detector
 * @description Leidenアルゴリズムを使用したコミュニティ検出サービス
 */

import type { Result } from "../../types/rag/result";
import { ok, err, isOk, isErr } from "../../types/rag/result";
import type { EntityId, CommunityId } from "../../types/rag/branded";
import type { ICommunityDetector } from "./interfaces/community-detector.interface";
import type { ICommunityRepository } from "./interfaces/community-repository.interface";
import type { IKnowledgeGraphStore } from "./knowledge-graph-store";
import type {
  Community,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
  GraphEdge,
  StoredEntity,
} from "./types";
import { CommunityDetectionError, CommunityErrorCode } from "./types";
import { LeidenAlgorithm } from "./leiden-algorithm";

/**
 * コミュニティ検出サービス
 *
 * @description
 * IKnowledgeGraphStoreからデータを取得し、
 * Leidenアルゴリズムでコミュニティを検出する。
 * 結果はICommunityRepositoryに保存できる。
 *
 * @example
 * const detector = new CommunityDetector(
 *   new LeidenAlgorithm(),
 *   graphStore,
 *   communityRepo,
 * );
 * const result = await detector.detect({ resolution: 1.0 });
 */
export class CommunityDetector implements ICommunityDetector {
  /**
   * コンストラクタ
   *
   * @param leiden Leidenアルゴリズム実装
   * @param graphStore ナレッジグラフストア
   * @param communityRepo コミュニティリポジトリ
   */
  constructor(
    private readonly leiden: LeidenAlgorithm,
    private readonly graphStore: IKnowledgeGraphStore,
    private readonly communityRepo: ICommunityRepository,
  ) {}

  /**
   * コミュニティを検出する
   *
   * @param options 検出オプション
   * @returns 検出結果（Result型）
   */
  async detect(
    options?: CommunityDetectionOptions,
  ): Promise<Result<CommunityDetectionResult, Error>> {
    try {
      // グラフデータを取得
      const graphResult = await this.loadGraphData();
      if (isErr(graphResult)) {
        return graphResult;
      }

      const { nodes, edges } = graphResult.data;

      // Leidenアルゴリズムを実行
      const result = this.leiden.detect(nodes, edges, options);

      return ok(result);
    } catch (error) {
      return err(
        new CommunityDetectionError(
          `Failed to detect communities: ${(error as Error).message}`,
          CommunityErrorCode.DETECTION_FAILED,
          error as Error,
        ),
      );
    }
  }

  /**
   * 検出結果をデータベースに保存する
   *
   * @param structure 保存するコミュニティ構造
   * @returns 保存成功の結果（Result型）
   */
  async saveResults(
    structure: CommunityStructure,
  ): Promise<Result<void, Error>> {
    try {
      // 既存データを削除
      const deleteResult = await this.communityRepo.deleteAll();
      if (isErr(deleteResult)) {
        return err(
          new CommunityDetectionError(
            `Failed to delete existing communities: ${deleteResult.error.message}`,
            CommunityErrorCode.SAVE_FAILED,
            deleteResult.error,
          ),
        );
      }

      // コミュニティを挿入
      const insertResult = await this.communityRepo.insertMany(
        structure.communities,
      );
      if (isErr(insertResult)) {
        return err(
          new CommunityDetectionError(
            `Failed to insert communities: ${insertResult.error.message}`,
            CommunityErrorCode.SAVE_FAILED,
            insertResult.error,
          ),
        );
      }

      // エンティティ-コミュニティマッピングを保存
      const mappings: Array<{ entityId: EntityId; communityId: CommunityId }> =
        [];
      for (const [entityId, communityIds] of structure.entityToCommunity) {
        for (const communityId of communityIds) {
          mappings.push({ entityId, communityId });
        }
      }

      if (mappings.length > 0) {
        const mappingResult =
          await this.communityRepo.addEntityCommunityMappings(mappings);
        if (isErr(mappingResult)) {
          return err(
            new CommunityDetectionError(
              `Failed to save entity-community mappings: ${mappingResult.error.message}`,
              CommunityErrorCode.SAVE_FAILED,
              mappingResult.error,
            ),
          );
        }
      }

      return ok(undefined);
    } catch (error) {
      return err(
        new CommunityDetectionError(
          `Failed to save results: ${(error as Error).message}`,
          CommunityErrorCode.SAVE_FAILED,
          error as Error,
        ),
      );
    }
  }

  /**
   * エンティティが属するコミュニティを取得する
   *
   * @param entityId エンティティID
   * @returns コミュニティリスト（Result型）
   */
  async getCommunitiesForEntity(
    entityId: EntityId,
  ): Promise<Result<Community[], Error>> {
    try {
      const result = await this.communityRepo.findByEntityId(entityId);
      if (isErr(result)) {
        return err(
          new CommunityDetectionError(
            `Failed to get communities for entity: ${result.error.message}`,
            CommunityErrorCode.NOT_FOUND,
            result.error,
          ),
        );
      }

      return ok(result.data);
    } catch (error) {
      return err(
        new CommunityDetectionError(
          `Failed to get communities for entity: ${(error as Error).message}`,
          CommunityErrorCode.NOT_FOUND,
          error as Error,
        ),
      );
    }
  }

  /**
   * 指定レベルのコミュニティを取得する
   *
   * @param level 階層レベル（0が最下層）
   * @returns コミュニティリスト（Result型）
   */
  async getCommunitiesByLevel(
    level: number,
  ): Promise<Result<Community[], Error>> {
    try {
      const result = await this.communityRepo.findByLevel(level);
      if (isErr(result)) {
        return err(
          new CommunityDetectionError(
            `Failed to get communities by level: ${result.error.message}`,
            CommunityErrorCode.NOT_FOUND,
            result.error,
          ),
        );
      }

      return ok(result.data);
    } catch (error) {
      return err(
        new CommunityDetectionError(
          `Failed to get communities by level: ${(error as Error).message}`,
          CommunityErrorCode.NOT_FOUND,
          error as Error,
        ),
      );
    }
  }

  /**
   * コミュニティのメンバーエンティティを取得する
   *
   * @param communityId コミュニティID
   * @returns エンティティリスト（Result型）
   */
  async getCommunityMembers(
    communityId: CommunityId,
  ): Promise<Result<StoredEntity[], Error>> {
    try {
      // コミュニティを取得
      const communityResult = await this.communityRepo.findById(communityId);
      if (isErr(communityResult)) {
        return err(
          new CommunityDetectionError(
            `Failed to get community: ${communityResult.error.message}`,
            CommunityErrorCode.NOT_FOUND,
            communityResult.error,
          ),
        );
      }

      if (!communityResult.data) {
        return err(
          new CommunityDetectionError(
            `Community not found: ${communityId}`,
            CommunityErrorCode.NOT_FOUND,
          ),
        );
      }

      const community = communityResult.data;

      // メンバーエンティティを取得
      const members: StoredEntity[] = [];
      for (const entityId of community.memberEntityIds) {
        const entityResult = await this.graphStore.getEntity(entityId);
        if (isOk(entityResult) && entityResult.data) {
          members.push(entityResult.data);
        }
      }

      return ok(members);
    } catch (error) {
      return err(
        new CommunityDetectionError(
          `Failed to get community members: ${(error as Error).message}`,
          CommunityErrorCode.NOT_FOUND,
          error as Error,
        ),
      );
    }
  }

  // ===========================================================================
  // Private: グラフデータ読み込み
  // ===========================================================================

  /**
   * グラフストアからノードとエッジを読み込む
   */
  private async loadGraphData(): Promise<
    Result<{ nodes: EntityId[]; edges: GraphEdge[] }, Error>
  > {
    try {
      // 全エンティティを取得
      const entitiesResult = await this.graphStore.findEntities({});
      if (isErr(entitiesResult)) {
        return err(
          new CommunityDetectionError(
            `Failed to load entities: ${entitiesResult.error.message}`,
            CommunityErrorCode.GRAPH_LOAD_FAILED,
            entitiesResult.error,
          ),
        );
      }

      const entities = entitiesResult.data;
      const nodes = entities.map((e) => e.id);

      // 各エンティティの関係を取得してエッジを構築
      const edgeMap = new Map<string, GraphEdge>();

      for (const entity of entities) {
        const relationsResult = await this.graphStore.getRelations(entity.id, {
          direction: "both",
        });

        if (isErr(relationsResult)) {
          continue; // エラーは無視して続行
        }

        for (const relation of relationsResult.data) {
          // エッジの重複を避けるためのキー
          const edgeKey = this.createEdgeKey(
            relation.sourceEntityId,
            relation.targetEntityId,
          );

          if (!edgeMap.has(edgeKey)) {
            edgeMap.set(edgeKey, {
              source: relation.sourceEntityId,
              target: relation.targetEntityId,
              weight: relation.weight,
            });
          }
        }
      }

      const edges = Array.from(edgeMap.values());

      return ok({ nodes, edges });
    } catch (error) {
      return err(
        new CommunityDetectionError(
          `Failed to load graph data: ${(error as Error).message}`,
          CommunityErrorCode.GRAPH_LOAD_FAILED,
          error as Error,
        ),
      );
    }
  }

  /**
   * エッジキーを作成（ソートして重複を防ぐ）
   */
  private createEdgeKey(source: EntityId, target: EntityId): string {
    const sorted = [source, target].sort();
    return `${sorted[0]}-${sorted[1]}`;
  }
}
