/**
 * @file FileRepository
 * @module @repo/shared/db/repositories/file.repository
 * @description ファイルメタデータ管理用Repository
 */

import { eq, and, isNull, inArray } from "drizzle-orm";
import { BaseRepository, type Database } from "./base.repository";
import { files, type File, type NewFile } from "../schema/files";
import { ok, err, type Result } from "../../types/rag/result";
import {
  createRAGError,
  ErrorCodes,
  type RAGError,
} from "../../types/rag/errors";
import type { FileId } from "../../types/rag/branded";

// =============================================================================
// FileRepository クラス
// =============================================================================

/**
 * FileRepository
 * ファイルメタデータのCRUD操作と固有クエリを提供
 */
export class FileRepository extends BaseRepository<
  typeof files,
  File,
  NewFile,
  FileId
> {
  constructor(db: Database) {
    super(db, files, files.id);
  }

  /**
   * IDでファイルを取得（論理削除を除外）
   * @override
   */
  async findById(id: FileId): Promise<Result<File | null, RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(files)
        .where(and(eq(files.id, id), isNull(files.deletedAt)))
        .limit(1);

      return ok(result[0] ?? null);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to find file by ID: ${id}`,
          { id },
          error as Error,
        ),
      );
    }
  }

  /**
   * ハッシュ値でファイルを検索
   * @param hash - SHA-256ハッシュ値
   * @returns ファイルまたはnull
   */
  async findByHash(hash: string): Promise<Result<File | null, RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(files)
        .where(and(eq(files.hash, hash), isNull(files.deletedAt)))
        .limit(1);

      return ok(result[0] ?? null);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to find file by hash: ${hash}`,
          { hash },
          error as Error,
        ),
      );
    }
  }

  /**
   * パスでファイルを検索
   * @param path - ファイルパス
   * @returns ファイルまたはnull
   */
  async findByPath(path: string): Promise<Result<File | null, RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(files)
        .where(and(eq(files.path, path), isNull(files.deletedAt)))
        .limit(1);

      return ok(result[0] ?? null);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to find file by path: ${path}`,
          { path },
          error as Error,
        ),
      );
    }
  }

  /**
   * カテゴリでファイル一覧を取得
   * @param category - ファイルカテゴリ
   * @returns ファイル配列
   */
  async findByCategory(category: string): Promise<Result<File[], RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(files)
        .where(and(eq(files.category, category), isNull(files.deletedAt)));

      return ok(result);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to find files by category: ${category}`,
          { category },
          error as Error,
        ),
      );
    }
  }

  /**
   * ファイルを論理削除
   * @param id - 削除対象のファイルID
   * @returns void
   */
  async softDelete(id: FileId): Promise<Result<void, RAGError>> {
    try {
      const result = await this.db
        .update(files)
        .set({ deletedAt: new Date() })
        .where(and(eq(files.id, id), isNull(files.deletedAt)))
        .returning();

      if (result.length === 0) {
        return err(
          createRAGError(
            ErrorCodes.RECORD_NOT_FOUND,
            `File not found or already deleted: ${id}`,
            { id },
          ),
        );
      }

      return ok(undefined);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to soft delete file: ${id}`,
          { id },
          error as Error,
        ),
      );
    }
  }

  /**
   * 複数IDでファイルを一括取得
   * @param ids - ファイルID配列
   * @returns ファイル配列
   */
  async findByIds(ids: FileId[]): Promise<Result<File[], RAGError>> {
    if (ids.length === 0) {
      return ok([]);
    }

    try {
      const result = await this.db
        .select()
        .from(files)
        .where(and(inArray(files.id, ids), isNull(files.deletedAt)));

      return ok(result);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          "Failed to find files by IDs",
          { ids },
          error as Error,
        ),
      );
    }
  }
}
