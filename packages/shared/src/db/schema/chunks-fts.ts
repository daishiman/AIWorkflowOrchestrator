/**
 * chunks_fts FTS5仮想テーブルとトリガー管理
 *
 * @description
 * SQLite FTS5（Full-Text Search 5）を使用した全文検索機能を提供。
 * Drizzle ORMはFTS5を直接サポートしないため、raw SQLで管理。
 *
 * @see docs/30-workflows/rag-conversion-system/design-chunks-fts5.md
 */

import { sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

/**
 * FTS5仮想テーブル設定
 */
export const FTS5_CONFIG = {
  /** FTS5仮想テーブル名 */
  tableName: "chunks_fts",

  /** ソーステーブル名 */
  sourceTable: "chunks",

  /** トークナイザー設定（日本語・英語対応） */
  tokenizer: "unicode61 remove_diacritics 2",

  /** インデックス対象カラム */
  indexedColumns: ["content", "contextual_content", "parent_header"],
} as const;

/**
 * FTS5仮想テーブルを作成
 *
 * @param db - Drizzle ORM データベースインスタンス
 * @throws {Error} テーブル作成に失敗した場合
 *
 * @example
 * ```typescript
 * await createChunksFtsTable(db);
 * ```
 */
export async function createChunksFtsTable(
  db: LibSQLDatabase<Record<string, never>>,
): Promise<void> {
  await db.run(sql`
    CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
      content,
      contextual_content,
      parent_header,
      content='chunks',
      content_rowid='rowid',
      tokenize=${sql.raw(`'${FTS5_CONFIG.tokenizer}'`)}
    )
  `);
}

/**
 * FTS5同期用トリガーを作成
 *
 * @description
 * chunksテーブルの変更をchunks_ftsに自動同期するトリガーを作成。
 * - INSERT: 新規レコードをFTS5に追加
 * - UPDATE: DELETE + INSERTで確実に再インデックス化
 * - DELETE: FTS5からレコードを削除
 *
 * @param db - Drizzle ORM データベースインスタンス
 * @throws {Error} トリガー作成に失敗した場合
 */
export async function createChunksFtsTriggers(
  db: LibSQLDatabase<Record<string, never>>,
): Promise<void> {
  // INSERTトリガー
  await db.run(sql`
    CREATE TRIGGER IF NOT EXISTS chunks_fts_insert AFTER INSERT ON chunks BEGIN
      INSERT INTO chunks_fts(rowid, content, contextual_content, parent_header)
      VALUES (new.rowid, new.content, new.contextual_content, new.parent_header);
    END
  `);

  // UPDATEトリガー（DELETE + INSERT）
  // FTS5の仕様: 外部コンテンツテーブル使用時、UPDATE文は使用不可
  await db.run(sql`
    CREATE TRIGGER IF NOT EXISTS chunks_fts_update AFTER UPDATE ON chunks BEGIN
      DELETE FROM chunks_fts WHERE rowid = old.rowid;
      INSERT INTO chunks_fts(rowid, content, contextual_content, parent_header)
      VALUES (new.rowid, new.content, new.contextual_content, new.parent_header);
    END
  `);

  // DELETEトリガー
  await db.run(sql`
    CREATE TRIGGER IF NOT EXISTS chunks_fts_delete AFTER DELETE ON chunks BEGIN
      DELETE FROM chunks_fts WHERE rowid = old.rowid;
    END
  `);
}

/**
 * chunks_fts FTS5仮想テーブルとトリガーを初期化
 *
 * @description
 * この関数はアプリケーション起動時、マイグレーション時、またはテスト時に呼び出される。
 * IF NOT EXISTS句により冪等性が保証されている。
 *
 * @param db - Drizzle ORM データベースインスタンス
 * @throws {Error} FTS5テーブルまたはトリガー作成に失敗した場合
 *
 * @example
 * ```typescript
 * import { initializeChunksFts } from './chunks-fts';
 *
 * // アプリケーション起動時
 * await initializeChunksFts(db);
 * ```
 */
export async function initializeChunksFts(
  db: LibSQLDatabase<Record<string, never>>,
): Promise<void> {
  await createChunksFtsTable(db);
  await createChunksFtsTriggers(db);
}

/**
 * FTS5インデックスを最適化
 *
 * @description
 * 大量のINSERT/DELETE後に実行することで、インデックスの断片化を解消。
 * 定期的なメンテナンスタスクとして実行を推奨。
 *
 * @param db - Drizzle ORM データベースインスタンス
 *
 * @example
 * ```typescript
 * // 週次メンテナンスジョブで実行
 * await optimizeChunksFts(db);
 * ```
 */
export async function optimizeChunksFts(
  db: LibSQLDatabase<Record<string, never>>,
): Promise<void> {
  await db.run(sql`INSERT INTO chunks_fts(chunks_fts) VALUES('optimize')`);
}

/**
 * FTS5インデックスを再構築
 *
 * @description
 * chunksテーブルの全データをFTS5インデックスに再構築。
 * インデックスの破損や不整合が発生した場合に使用。
 *
 * @param db - Drizzle ORM データベースインスタンス
 *
 * @example
 * ```typescript
 * // 整合性エラー発生時
 * await rebuildChunksFts(db);
 * ```
 */
export async function rebuildChunksFts(
  db: LibSQLDatabase<Record<string, never>>,
): Promise<void> {
  await db.run(sql`INSERT INTO chunks_fts(chunks_fts) VALUES('rebuild')`);
}

/**
 * FTS5とchunksテーブルの整合性チェック結果
 */
export interface ChunksFtsIntegrityResult {
  /** 整合性が取れているか */
  isConsistent: boolean;
  /** chunksテーブルのレコード数 */
  chunksCount: number;
  /** chunks_ftsのレコード数 */
  chunksFtsCount: number;
}

/**
 * FTS5とchunksテーブルの整合性をチェック
 *
 * @description
 * chunksテーブルとchunks_ftsのレコード数を比較し、
 * 同期が取れているかを確認する。
 *
 * @param db - Drizzle ORM データベースインスタンス
 * @returns 整合性チェック結果
 *
 * @example
 * ```typescript
 * const result = await checkChunksFtsIntegrity(db);
 * if (!result.isConsistent) {
 *   console.error('FTS5 index out of sync!');
 *   await rebuildChunksFts(db);
 * }
 * ```
 */
export async function checkChunksFtsIntegrity(
  db: LibSQLDatabase<Record<string, never>>,
): Promise<ChunksFtsIntegrityResult> {
  const result = await db.all<{ chunks_count: number; fts_count: number }>(sql`
    SELECT
      (SELECT COUNT(*) FROM chunks) as chunks_count,
      (SELECT COUNT(*) FROM chunks_fts) as fts_count
  `);

  const row = result[0];
  const chunksCount = row?.chunks_count ?? 0;
  const chunksFtsCount = row?.fts_count ?? 0;

  return {
    isConsistent: chunksCount === chunksFtsCount,
    chunksCount,
    chunksFtsCount,
  };
}

/**
 * FTS5仮想テーブルとトリガーを削除
 *
 * @description
 * テスト環境でのクリーンアップや、スキーマ変更時に使用。
 * 本番環境では慎重に使用すること。
 *
 * @param db - Drizzle ORM データベースインスタンス
 *
 * @example
 * ```typescript
 * // テストのafterEachで使用
 * await dropChunksFts(db);
 * ```
 */
export async function dropChunksFts(
  db: LibSQLDatabase<Record<string, never>>,
): Promise<void> {
  // トリガーを先に削除
  await db.run(sql`DROP TRIGGER IF EXISTS chunks_fts_insert`);
  await db.run(sql`DROP TRIGGER IF EXISTS chunks_fts_update`);
  await db.run(sql`DROP TRIGGER IF EXISTS chunks_fts_delete`);

  // FTS5仮想テーブルを削除
  await db.run(sql`DROP TABLE IF EXISTS chunks_fts`);
}
