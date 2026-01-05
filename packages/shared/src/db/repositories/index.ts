/**
 * @file Repositories エクスポート・ファクトリ
 * @module @repo/shared/db/repositories
 * @description Repository層の統合エントリポイント
 */

// =============================================================================
// 型エクスポート
// =============================================================================

export type { Database } from "./base.repository";

// =============================================================================
// クラスエクスポート
// =============================================================================

export { BaseRepository } from "./base.repository";
export { FileRepository } from "./file.repository";
export { ChunkRepository } from "./chunk.repository";
export { EntityRepository } from "./entity.repository";

// =============================================================================
// 型定義
// =============================================================================

import type { Database } from "./base.repository";
import { FileRepository } from "./file.repository";
import { ChunkRepository } from "./chunk.repository";
import { EntityRepository } from "./entity.repository";

/**
 * Repositories集約インターフェース
 */
export interface Repositories {
  readonly files: FileRepository;
  readonly chunks: ChunkRepository;
  readonly entities: EntityRepository;
}

// =============================================================================
// ファクトリ関数
// =============================================================================

/**
 * Repositoriesを生成するファクトリ関数
 * @param db - Drizzleデータベースインスタンス
 * @returns Repositoriesオブジェクト
 *
 * @example
 * ```typescript
 * import { drizzle } from 'drizzle-orm/better-sqlite3';
 * import Database from 'better-sqlite3';
 * import { createRepositories } from './db/repositories';
 *
 * const sqlite = new Database('./data.db');
 * const db = drizzle(sqlite);
 * const repos = createRepositories(db);
 *
 * // 使用例
 * const fileResult = await repos.files.findById(fileId);
 * const chunkResult = await repos.chunks.findByFileId(fileId);
 * const entityResult = await repos.entities.searchByName('TypeScript');
 * ```
 */
export function createRepositories(db: Database): Repositories {
  return {
    files: new FileRepository(db),
    chunks: new ChunkRepository(db),
    entities: new EntityRepository(db),
  };
}
