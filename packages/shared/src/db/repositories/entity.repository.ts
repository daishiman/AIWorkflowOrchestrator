/**
 * @file EntityRepository
 * @module @repo/shared/db/repositories/entity.repository
 * @description Knowledge Graphエンティティ管理用Repository
 */

import { eq, and, like, desc } from "drizzle-orm";
import { BaseRepository, type Database } from "./base.repository";
import {
  entities,
  type Entity,
  type NewEntity,
} from "../schema/graph/entities";
import { ok, err, type Result } from "../../types/rag/result";
import {
  createRAGError,
  ErrorCodes,
  type RAGError,
} from "../../types/rag/errors";
import type { EntityId } from "../../types/rag/branded";

// =============================================================================
// EntityRepository クラス
// =============================================================================

/**
 * EntityRepository
 * エンティティのCRUD操作と固有クエリを提供
 */
export class EntityRepository extends BaseRepository<
  typeof entities,
  Entity,
  NewEntity,
  EntityId
> {
  constructor(db: Database) {
    super(db, entities, entities.id);
  }

  /**
   * 正規化名とタイプでエンティティを検索
   * @param normalizedName - 正規化された名前
   * @param type - エンティティタイプ
   * @returns エンティティまたはnull
   */
  async findByNormalizedNameAndType(
    normalizedName: string,
    type: string,
  ): Promise<Result<Entity | null, RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(entities)
        .where(
          and(
            eq(entities.normalizedName, normalizedName),
            eq(entities.type, type),
          ),
        )
        .limit(1);

      return ok(result[0] ?? null);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to find entity by normalized name and type: ${normalizedName}, ${type}`,
          { normalizedName, type },
          error as Error,
        ),
      );
    }
  }

  /**
   * タイプでエンティティ一覧を取得
   * @param type - エンティティタイプ
   * @returns エンティティ配列
   */
  async findByType(type: string): Promise<Result<Entity[], RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(entities)
        .where(eq(entities.type, type));

      return ok(result);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to find entities by type: ${type}`,
          { type },
          error as Error,
        ),
      );
    }
  }

  /**
   * 名前で部分一致検索（重要度順）
   * @param query - 検索クエリ
   * @param limit - 最大件数（デフォルト50）
   * @returns エンティティ配列
   */
  async searchByName(
    query: string,
    limit: number = 50,
  ): Promise<Result<Entity[], RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(entities)
        .where(like(entities.name, `%${query}%`))
        .orderBy(desc(entities.importance))
        .limit(limit);

      return ok(result);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to search entities by name: ${query}`,
          { query },
          error as Error,
        ),
      );
    }
  }

  /**
   * 重要度上位のエンティティを取得
   * @param limit - 取得件数（デフォルト10）
   * @returns エンティティ配列
   */
  async findTopByImportance(
    limit: number = 10,
  ): Promise<Result<Entity[], RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(entities)
        .orderBy(desc(entities.importance))
        .limit(limit);

      return ok(result);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          "Failed to find top entities by importance",
          { limit },
          error as Error,
        ),
      );
    }
  }

  /**
   * エンティティをUpsert（正規化名+タイプで判定）
   * @param data - エンティティデータ
   * @returns 作成または更新されたエンティティ
   */
  async upsert(data: NewEntity): Promise<Result<Entity, RAGError>> {
    try {
      // 既存エンティティを検索
      const existing = await this.findByNormalizedNameAndType(
        data.normalizedName,
        data.type,
      );

      if (existing.success && existing.data) {
        // 更新
        const updateResult = await this.db
          .update(entities)
          .set({
            name: data.name,
            description: data.description,
            aliases: data.aliases,
            importance: data.importance,
            mentionCount: data.mentionCount,
            metadata: data.metadata,
            updatedAt: new Date(),
          })
          .where(eq(entities.id, existing.data.id))
          .returning();

        return ok(updateResult[0]);
      } else {
        // 新規作成
        const insertResult = await this.db
          .insert(entities)
          .values(data as any)
          .returning();

        return ok(insertResult[0]);
      }
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to upsert entity: ${data.normalizedName}`,
          { data },
          error as Error,
        ),
      );
    }
  }
}
