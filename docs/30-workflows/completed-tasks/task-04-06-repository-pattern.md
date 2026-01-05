# CONV-04-06: Repository パターン実装

## 概要

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | CONV-04-06                                     |
| タスク名 | Repository パターン実装                        |
| 依存     | CONV-04-02, CONV-04-03, CONV-04-04, CONV-04-05 |
| 規模     | 中                                             |
| 出力場所 | `packages/shared/src/db/repositories/`         |

## 目的

各テーブルに対するCRUD操作を抽象化したRepositoryクラスを実装する。
データアクセス層とビジネスロジック層を分離し、テスタビリティを向上させる。

## 成果物

### 1. 基底Repositoryクラス

```typescript
// packages/shared/src/db/repositories/base.repository.ts

import { eq, sql, and, or, desc, asc } from "drizzle-orm";
import type { SQLiteTable, SQLiteColumn } from "drizzle-orm/sqlite-core";
import type { Database } from "../client";
import type {
  Result,
  RAGError,
  PaginationParams,
  PaginatedResult,
} from "../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../types/rag";

/**
 * 基底Repositoryクラス
 */
export abstract class BaseRepository<
  TTable extends SQLiteTable,
  TSelect,
  TInsert,
  TId extends string,
> {
  constructor(
    protected readonly db: Database,
    protected readonly table: TTable,
    protected readonly idColumn: SQLiteColumn,
  ) {}

  /**
   * IDで取得
   */
  async findById(id: TId): Promise<Result<TSelect | null, RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(this.table)
        .where(eq(this.idColumn, id))
        .limit(1);

      return ok(result[0] ?? null);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to find by id: ${id}`,
          { id },
          error as Error,
        ),
      );
    }
  }

  /**
   * 全件取得（ページネーション付き）
   */
  async findAll(
    params: PaginationParams = { limit: 20, offset: 0 },
  ): Promise<Result<PaginatedResult<TSelect>, RAGError>> {
    try {
      const [items, countResult] = await Promise.all([
        this.db
          .select()
          .from(this.table)
          .limit(params.limit)
          .offset(params.offset),
        this.db.select({ count: sql<number>`count(*)` }).from(this.table),
      ]);

      const total = countResult[0]?.count ?? 0;

      return ok({
        items: items as TSelect[],
        total,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + items.length < total,
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          "Failed to find all",
          { params },
          error as Error,
        ),
      );
    }
  }

  /**
   * 作成
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
          "Failed to create",
          { data },
          error as Error,
        ),
      );
    }
  }

  /**
   * バッチ作成
   */
  async createMany(data: TInsert[]): Promise<Result<TSelect[], RAGError>> {
    try {
      if (data.length === 0) return ok([]);

      const result = await this.db
        .insert(this.table)
        .values(data as any[])
        .returning();

      return ok(result as TSelect[]);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          "Failed to create many",
          { count: data.length },
          error as Error,
        ),
      );
    }
  }

  /**
   * 更新
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
          `Failed to update: ${id}`,
          { id, data },
          error as Error,
        ),
      );
    }
  }

  /**
   * 削除
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
          `Failed to delete: ${id}`,
          { id },
          error as Error,
        ),
      );
    }
  }

  /**
   * 存在確認
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
   * 件数取得
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
          "Failed to count",
          {},
          error as Error,
        ),
      );
    }
  }
}
```

### 2. FileRepository

```typescript
// packages/shared/src/db/repositories/file.repository.ts

import { eq, and, inArray, like, isNull } from "drizzle-orm";
import type { Database } from "../client";
import { files, type File, type NewFile } from "../schema/files";
import type { FileId } from "../../types/rag/branded";
import type { Result, RAGError } from "../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../types/rag";
import { BaseRepository } from "./base.repository";

/**
 * FileRepository - ファイルメタデータの永続化
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
   * ハッシュで検索（重複検出用）
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
          `Failed to find by hash: ${hash}`,
          { hash },
          error as Error,
        ),
      );
    }
  }

  /**
   * パスで検索
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
          `Failed to find by path: ${path}`,
          { path },
          error as Error,
        ),
      );
    }
  }

  /**
   * カテゴリで検索
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
          `Failed to find by category: ${category}`,
          { category },
          error as Error,
        ),
      );
    }
  }

  /**
   * 論理削除
   */
  async softDelete(id: FileId): Promise<Result<void, RAGError>> {
    try {
      await this.db
        .update(files)
        .set({ deletedAt: new Date() })
        .where(eq(files.id, id));

      return ok(undefined);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to soft delete: ${id}`,
          { id },
          error as Error,
        ),
      );
    }
  }

  /**
   * 複数ファイルの一括取得
   */
  async findByIds(ids: FileId[]): Promise<Result<File[], RAGError>> {
    try {
      if (ids.length === 0) return ok([]);

      const result = await this.db
        .select()
        .from(files)
        .where(and(inArray(files.id, ids), isNull(files.deletedAt)));

      return ok(result);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          "Failed to find by ids",
          { ids },
          error as Error,
        ),
      );
    }
  }
}
```

### 3. ChunkRepository

```typescript
// packages/shared/src/db/repositories/chunk.repository.ts

import { eq, and, inArray, desc } from "drizzle-orm";
import type { Database } from "../client";
import { chunks, type Chunk, type NewChunk } from "../schema/chunks";
import type { ChunkId, FileId } from "../../types/rag/branded";
import type { Result, RAGError } from "../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../types/rag";
import { BaseRepository } from "./base.repository";

/**
 * ChunkRepository - チャンクの永続化
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
   * ファイルIDで検索
   */
  async findByFileId(fileId: FileId): Promise<Result<Chunk[], RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(chunks)
        .where(eq(chunks.fileId, fileId))
        .orderBy(chunks.chunkIndex);

      return ok(result);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to find chunks by file id: ${fileId}`,
          { fileId },
          error as Error,
        ),
      );
    }
  }

  /**
   * ファイルIDでチャンクを削除
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
          `Failed to delete chunks by file id: ${fileId}`,
          { fileId },
          error as Error,
        ),
      );
    }
  }

  /**
   * ハッシュで検索（重複検出用）
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
   * 複数チャンクの一括取得
   */
  async findByIds(ids: ChunkId[]): Promise<Result<Chunk[], RAGError>> {
    try {
      if (ids.length === 0) return ok([]);

      const result = await this.db
        .select()
        .from(chunks)
        .where(inArray(chunks.id, ids));

      return ok(result);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          "Failed to find chunks by ids",
          { ids },
          error as Error,
        ),
      );
    }
  }

  /**
   * 隣接チャンクを取得
   */
  async findAdjacent(
    chunkId: ChunkId,
  ): Promise<Result<{ prev: Chunk | null; next: Chunk | null }, RAGError>> {
    try {
      const chunk = await this.db
        .select()
        .from(chunks)
        .where(eq(chunks.id, chunkId))
        .limit(1);

      if (chunk.length === 0) {
        return ok({ prev: null, next: null });
      }

      const [prev, next] = await Promise.all([
        chunk[0].prevChunkId
          ? this.db
              .select()
              .from(chunks)
              .where(eq(chunks.id, chunk[0].prevChunkId))
              .limit(1)
          : Promise.resolve([]),
        chunk[0].nextChunkId
          ? this.db
              .select()
              .from(chunks)
              .where(eq(chunks.id, chunk[0].nextChunkId))
              .limit(1)
          : Promise.resolve([]),
      ]);

      return ok({
        prev: prev[0] ?? null,
        next: next[0] ?? null,
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
```

### 4. EntityRepository

```typescript
// packages/shared/src/db/repositories/entity.repository.ts

import { eq, and, inArray, like, desc } from "drizzle-orm";
import type { Database } from "../client";
import {
  entities,
  type Entity,
  type NewEntity,
} from "../schema/graph/entities";
import type { EntityId } from "../../types/rag/branded";
import type { Result, RAGError } from "../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../types/rag";
import { BaseRepository } from "./base.repository";

/**
 * EntityRepository - エンティティの永続化
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
   * 正規化名とタイプで検索
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
          `Failed to find entity: ${normalizedName} (${type})`,
          { normalizedName, type },
          error as Error,
        ),
      );
    }
  }

  /**
   * タイプで検索
   */
  async findByType(type: string): Promise<Result<Entity[], RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(entities)
        .where(eq(entities.type, type))
        .orderBy(desc(entities.importance));

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
   * 名前で部分一致検索
   */
  async searchByName(query: string): Promise<Result<Entity[], RAGError>> {
    try {
      const result = await this.db
        .select()
        .from(entities)
        .where(like(entities.name, `%${query}%`))
        .orderBy(desc(entities.importance))
        .limit(50);

      return ok(result);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          `Failed to search entities: ${query}`,
          { query },
          error as Error,
        ),
      );
    }
  }

  /**
   * 重要度上位を取得
   */
  async findTopByImportance(
    limit: number = 20,
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
          "Failed to find top entities",
          { limit },
          error as Error,
        ),
      );
    }
  }

  /**
   * Upsert（存在すれば更新、なければ作成）
   */
  async upsert(data: NewEntity): Promise<Result<Entity, RAGError>> {
    try {
      // 既存チェック
      const existing = await this.findByNormalizedNameAndType(
        data.normalizedName,
        data.type,
      );

      if (existing.success && existing.data) {
        // 更新
        return this.update(existing.data.id as EntityId, {
          ...data,
          mentionCount: existing.data.mentionCount + 1,
        });
      }

      // 新規作成
      return this.create(data);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.DB_QUERY_ERROR,
          "Failed to upsert entity",
          { data },
          error as Error,
        ),
      );
    }
  }
}
```

### 5. Repositoryファクトリ

```typescript
// packages/shared/src/db/repositories/index.ts

import type { Database } from "../client";
import { FileRepository } from "./file.repository";
import { ChunkRepository } from "./chunk.repository";
import { EntityRepository } from "./entity.repository";
// 他のRepositoryもインポート

/**
 * Repository集約
 */
export interface Repositories {
  readonly files: FileRepository;
  readonly chunks: ChunkRepository;
  readonly entities: EntityRepository;
  // 他のRepositoryを追加
}

/**
 * Repositoryファクトリ
 */
export const createRepositories = (db: Database): Repositories => ({
  files: new FileRepository(db),
  chunks: new ChunkRepository(db),
  entities: new EntityRepository(db),
});

// 個別エクスポート
export { BaseRepository } from "./base.repository";
export { FileRepository } from "./file.repository";
export { ChunkRepository } from "./chunk.repository";
export { EntityRepository } from "./entity.repository";
```

## ディレクトリ構造

```
packages/shared/src/db/repositories/
├── index.ts              # バレルエクスポート・ファクトリ
├── base.repository.ts    # 基底Repository
├── file.repository.ts    # FileRepository
├── chunk.repository.ts   # ChunkRepository
├── entity.repository.ts  # EntityRepository
├── relation.repository.ts      # RelationRepository
├── community.repository.ts     # CommunityRepository
├── embedding.repository.ts     # EmbeddingRepository
└── conversion.repository.ts    # ConversionRepository
```

## 受け入れ条件

- [ ] `BaseRepository` が実装されている（CRUD操作）
- [ ] `FileRepository` が実装されている
- [ ] `ChunkRepository` が実装されている
- [ ] `EntityRepository` が実装されている
- [ ] 全Repositoryが `Result<T, RAGError>` を返す
- [ ] ファクトリ関数 `createRepositories` が実装されている
- [ ] ページネーション対応している
- [ ] エラーハンドリングが適切に実装されている
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- CONV-04-02: files/conversions テーブル実装
- CONV-04-03: content_chunks テーブル + FTS5
- CONV-04-04: DiskANN ベクトルインデックス設定
- CONV-04-05: Knowledge Graph テーブル群

### このタスクに依存するもの

- CONV-05-01: ログ記録サービス実装
- CONV-06-01: チャンキング戦略実装
- CONV-08-01: Knowledge Graph ストア実装

## 備考

- すべてのメソッドは `Result<T, RAGError>` を返し、エラーを型安全に扱う
- トランザクションが必要な場合は、サービス層で `withTransaction` を使用
- 複雑なクエリは個別Repositoryに実装（検索系は別途Queryクラスに分離も可）
- テスト時はモックRepositoryを注入可能な設計
