/**
 * @file ChunkRepository
 * @module @repo/shared/db/repositories/chunk.repository
 * @description チャンク管理用Repository
 */

import { eq, inArray, asc } from "drizzle-orm";
import { BaseRepository, type Database } from "./base.repository";
import { chunks, type Chunk, type NewChunk } from "../schema/chunks";
import { ok, err, type Result } from "../../types/rag/result";
import {
  createRAGError,
  ErrorCodes,
  type RAGError,
} from "../../types/rag/errors";
import type { ChunkId, FileId } from "../../types/rag/branded";

// =============================================================================
// ChunkRepository クラス
// =============================================================================

/**
 * ChunkRepository
 * チャンクのCRUD操作と固有クエリを提供
 */
export class ChunkRepository extends BaseRepository<
  typeof chunks,
  Chunk,
  NewChunk,
  ChunkId
> {
  constructor(db: Database) {
    super(db, chunks, chunks.id);
  }

  /**
   * ファイルIDでチャンク一覧を取得
   * @param fileId - ファイルID
   * @returns チャンク配列（chunkIndex順）
   */
  async findByFileId(fileId: FileId): Promise<Result<Chunk[], RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(chunks)
        .where(eq(chunks.fileId, fileId))
        .orderBy(asc(chunks.chunkIndex));

      return ok(result);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to find chunks by file ID: ${fileId}`,
          { fileId },
          error as Error,
        ),
      );
    }
  }

  /**
   * ファイルIDでチャンクを一括削除
   * @param fileId - ファイルID
   * @returns 削除件数
   */
  async deleteByFileId(fileId: FileId): Promise<Result<number, RAGError>> {
    try {
      const result = await this.db
        .delete(chunks)
        .where(eq(chunks.fileId, fileId))
        .returning();

      return ok(result.length);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to delete chunks by file ID: ${fileId}`,
          { fileId },
          error as Error,
        ),
      );
    }
  }

  /**
   * ハッシュ値でチャンクを検索
   * @param hash - SHA-256ハッシュ値
   * @returns チャンクまたはnull
   */
  async findByHash(hash: string): Promise<Result<Chunk | null, RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(chunks)
        .where(eq(chunks.hash, hash))
        .limit(1);

      return ok(result[0] ?? null);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to find chunk by hash: ${hash}`,
          { hash },
          error as Error,
        ),
      );
    }
  }

  /**
   * 複数IDでチャンクを一括取得
   * @param ids - チャンクID配列
   * @returns チャンク配列
   */
  async findByIds(ids: ChunkId[]): Promise<Result<Chunk[], RAGError>> {
    if (ids.length === 0) {
      return ok([]);
    }

    try {
      const result = await this.db
        .select()
        .from(chunks)
        .where(inArray(chunks.id, ids));

      return ok(result);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          "Failed to find chunks by IDs",
          { ids },
          error as Error,
        ),
      );
    }
  }

  /**
   * 隣接チャンクを取得
   * @param chunkId - 基準チャンクID
   * @returns 前後のチャンク
   */
  async findAdjacent(
    chunkId: ChunkId,
  ): Promise<Result<{ prev: Chunk | null; next: Chunk | null }, RAGError>> {
    try {
      // まず対象チャンクを取得
      const chunkResult = await this.db
        .select()
        .from(chunks)
        .where(eq(chunks.id, chunkId))
        .limit(1);

      if (chunkResult.length === 0) {
        return err(
          createRAGError(
            ErrorCodes.RECORD_NOT_FOUND,
            `Chunk not found: ${chunkId}`,
            { chunkId },
          ),
        );
      }

      const chunk = chunkResult[0];

      // 前後のチャンクを取得
      const [prevResult, nextResult] = await Promise.all([
        chunk.prevChunkId
          ? this.db
              .select()
              .from(chunks)
              .where(eq(chunks.id, chunk.prevChunkId))
              .limit(1)
          : Promise.resolve([]),
        chunk.nextChunkId
          ? this.db
              .select()
              .from(chunks)
              .where(eq(chunks.id, chunk.nextChunkId))
              .limit(1)
          : Promise.resolve([]),
      ]);

      return ok({
        prev: prevResult[0] ?? null,
        next: nextResult[0] ?? null,
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to find adjacent chunks: ${chunkId}`,
          { chunkId },
          error as Error,
        ),
      );
    }
  }
}
