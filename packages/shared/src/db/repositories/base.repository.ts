/**
 * @file BaseRepository 基底クラス
 * @module @repo/shared/db/repositories/base.repository
 * @description 共通CRUD操作を提供する抽象基底Repositoryクラス
 */

import { eq, sql } from "drizzle-orm";
import type { SQLiteTable, SQLiteColumn } from "drizzle-orm/sqlite-core";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { ok, err, type Result } from "../../types/rag/result";
import {
  createRAGError,
  ErrorCodes,
  type RAGError,
} from "../../types/rag/errors";
import type {
  PaginationParams,
  PaginatedResult,
} from "../../types/rag/interfaces";

// =============================================================================
// 型定義
// =============================================================================

/**
 * Repositoryで使用するDatabase型
 */
export type Database = BetterSQLite3Database<Record<string, never>>;

/**
 * デフォルトのページネーションパラメータ
 */
const DEFAULT_PAGINATION: PaginationParams = {
  limit: 100,
  offset: 0,
};

// =============================================================================
// BaseRepository クラス
// =============================================================================

/**
 * 基底Repositoryクラス
 * 共通のCRUD操作を提供する抽象クラス
 *
 * @template TTable - Drizzleテーブル型
 * @template TSelect - SELECT結果型 (テーブルから推論)
 * @template TInsert - INSERT入力型 (テーブルから推論)
 * @template TId - Branded ID型 (string拡張)
 */
export abstract class BaseRepository<
  TTable extends SQLiteTable,
  TSelect,
  TInsert,
  TId extends string,
> {
  /**
   * @param db - Drizzle データベースインスタンス
   * @param table - 対象テーブル
   * @param idColumn - ID カラム
   */
  constructor(
    protected readonly db: Database,
    protected readonly table: TTable,
    protected readonly idColumn: SQLiteColumn,
  ) {}

  /**
   * IDでレコードを取得
   * @param id - 検索対象のID
   * @returns レコードまたはnull
   */
  async findById(id: TId): Promise<Result<TSelect | null, RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(this.table)
        .where(eq(this.idColumn, id))
        .limit(1);

      return ok((result[0] as TSelect) ?? null);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to find record by ID: ${id}`,
          { id },
          error as Error,
        ),
      );
    }
  }

  /**
   * 全レコードを取得（ページネーション付き）
   * @param params - ページネーションパラメータ
   * @returns ページネーション結果
   */
  async findAll(
    params?: PaginationParams,
  ): Promise<Result<PaginatedResult<TSelect>, RAGError>> {
    const { limit, offset } = params ?? DEFAULT_PAGINATION;

    try {
      const [items, countResult] = await Promise.all([
        this.db.select().from(this.table).limit(limit).offset(offset),
        this.db.select({ count: sql<number>`count(*)` }).from(this.table),
      ]);

      const total = countResult[0]?.count ?? 0;

      return ok({
        items: items as TSelect[],
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          "Failed to find all records",
          { limit, offset },
          error as Error,
        ),
      );
    }
  }

  /**
   * レコードを作成
   * @param data - 作成データ
   * @returns 作成されたレコード
   */
  async create(data: TInsert): Promise<Result<TSelect, RAGError>> {
    try {
      const result = await this.db
        .insert(this.table)
        .values(data as any)
        .returning();

      return ok(result[0] as TSelect);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          "Failed to create record",
          { data },
          error as Error,
        ),
      );
    }
  }

  /**
   * 複数レコードを一括作成
   * @param data - 作成データの配列
   * @returns 作成されたレコードの配列
   */
  async createMany(data: TInsert[]): Promise<Result<TSelect[], RAGError>> {
    if (data.length === 0) {
      return ok([]);
    }

    try {
      const result = await this.db
        .insert(this.table)
        .values(data as any[])
        .returning();

      return ok(result as unknown as TSelect[]);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          "Failed to create records",
          { count: data.length },
          error as Error,
        ),
      );
    }
  }

  /**
   * レコードを更新
   * @param id - 更新対象のID
   * @param data - 更新データ
   * @returns 更新されたレコード
   */
  async update(
    id: TId,
    data: Partial<TInsert>,
  ): Promise<Result<TSelect, RAGError>> {
    try {
      const result = await this.db
        .update(this.table)
        .set(data as any)
        .where(eq(this.idColumn, id))
        .returning();

      if (result.length === 0) {
        return err(
          createRAGError(
            ErrorCodes.RECORD_NOT_FOUND,
            `Record not found: ${id}`,
            { id },
          ),
        );
      }

      return ok(result[0] as TSelect);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to update record: ${id}`,
          { id, data },
          error as Error,
        ),
      );
    }
  }

  /**
   * レコードを削除
   * @param id - 削除対象のID
   * @returns void
   */
  async delete(id: TId): Promise<Result<void, RAGError>> {
    try {
      const result = await this.db
        .delete(this.table)
        .where(eq(this.idColumn, id))
        .returning();

      if (result.length === 0) {
        return err(
          createRAGError(
            ErrorCodes.RECORD_NOT_FOUND,
            `Record not found: ${id}`,
            { id },
          ),
        );
      }

      return ok(undefined);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to delete record: ${id}`,
          { id },
          error as Error,
        ),
      );
    }
  }

  /**
   * レコードの存在確認
   * @param id - 確認対象のID
   * @returns 存在すればtrue
   */
  async exists(id: TId): Promise<Result<boolean, RAGError>> {
    try {
      const result = await this.db
        .select({ count: sql<number>`1` })
        .from(this.table)
        .where(eq(this.idColumn, id))
        .limit(1);

      return ok(result.length > 0);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to check existence: ${id}`,
          { id },
          error as Error,
        ),
      );
    }
  }

  /**
   * レコード件数を取得
   * @returns 件数
   */
  async count(): Promise<Result<number, RAGError>> {
    try {
      const result = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(this.table);

      return ok(result[0]?.count ?? 0);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          "Failed to count records",
          {},
          error as Error,
        ),
      );
    }
  }
}
