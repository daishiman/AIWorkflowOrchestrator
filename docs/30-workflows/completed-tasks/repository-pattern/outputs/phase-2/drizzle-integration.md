# Drizzle統合設計書 - Repository パターン実装

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | CONV-04-06 |
| Phase    | 2          |
| 作成日   | 2026-01-05 |

---

## 1. Drizzle ORM概要

### 1.1 プロジェクトでの使用状況

| 項目         | 値                                |
| ------------ | --------------------------------- |
| DB           | SQLite (better-sqlite3)           |
| Drizzle版    | drizzle-orm                       |
| スキーマ定義 | `packages/shared/src/db/schema/`  |
| 既存クエリ   | `packages/shared/src/db/queries/` |

### 1.2 使用するDrizzle API

```typescript
// インポート
import {
  eq,
  and,
  or,
  inArray,
  like,
  isNull,
  desc,
  asc,
  sql,
} from "drizzle-orm";
import type { SQLiteTable, SQLiteColumn } from "drizzle-orm/sqlite-core";
```

---

## 2. Database型の定義

### 2.1 現状のDB型推論

DrizzleはスキーマからDatabase型を推論:

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("./data.db");
export const db = drizzle(sqlite, { schema });

// Database型 = typeof db
type Database = ReturnType<typeof drizzle>;
```

### 2.2 Repositoryでの使用

```typescript
// base.repository.ts
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

// Database型を明示的に定義
export type Database = BetterSQLite3Database<Record<string, never>>;

export abstract class BaseRepository<...> {
  constructor(
    protected readonly db: Database,
    // ...
  ) {}
}
```

---

## 3. テーブル型との統合

### 3.1 filesテーブル

```typescript
// db/schema/files.ts (既存)
export const files = sqliteTable("files", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  mimeType: text("mime_type").notNull(),
  category: text("category").notNull(),
  size: integer("size").notNull(),
  hash: text("hash").notNull(),
  encoding: text("encoding").notNull().default("utf-8"),
  lastModified: integer("last_modified", { mode: "timestamp" }).notNull(),
  metadata: text("metadata").notNull().default("{}"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
```

**Repository統合:**

```typescript
// file.repository.ts
import { files, type File, type NewFile } from "../schema/files";

export class FileRepository extends BaseRepository<
  typeof files, // TTable
  File, // TSelect = typeof files.$inferSelect
  NewFile, // TInsert = typeof files.$inferInsert
  FileId // TId
> {
  constructor(db: Database) {
    super(db, files, files.id);
  }
}
```

### 3.2 chunksテーブル

```typescript
// db/schema/chunks.ts (既存)
export const chunks = sqliteTable("chunks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fileId: text("file_id")
    .notNull()
    .references(() => files.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  contextualContent: text("contextual_content"),
  chunkIndex: integer("chunk_index").notNull(),
  startLine: integer("start_line"),
  endLine: integer("end_line"),
  startChar: integer("start_char"),
  endChar: integer("end_char"),
  parentHeader: text("parent_header"),
  strategy: text("strategy").notNull(),
  tokenCount: integer("token_count").notNull(),
  hash: text("hash").notNull(),
  prevChunkId: text("prev_chunk_id"),
  nextChunkId: text("next_chunk_id"),
  overlapTokens: integer("overlap_tokens").notNull().default(0),
  metadata: text("metadata", { mode: "json" }).$type<ChunkMetadata>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;
```

### 3.3 entitiesテーブル

```typescript
// db/schema/graph/entities.ts (既存)
export const entities = sqliteTable("entities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  normalizedName: text("normalized_name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  aliases: text("aliases", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .default(sql`'[]'`),
  embedding: blob("embedding"),
  embeddingModelId: text("embedding_model_id"),
  importance: real("importance").notNull().default(0.5),
  mentionCount: integer("mention_count").notNull().default(1),
  metadata: text("metadata", { mode: "json" }).$type<EntityMetadata>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type Entity = typeof entities.$inferSelect;
export type NewEntity = typeof entities.$inferInsert;
```

---

## 4. クエリパターン

### 4.1 SELECT (単一)

```typescript
// findById
const result = await this.db
  .select()
  .from(this.table)
  .where(eq(this.idColumn, id))
  .limit(1);
return result[0] ?? null;
```

### 4.2 SELECT (複数 + ページネーション)

```typescript
// findAll
const [items, countResult] = await Promise.all([
  this.db.select().from(this.table).limit(params.limit).offset(params.offset),
  this.db.select({ count: sql<number>`count(*)` }).from(this.table),
]);
```

### 4.3 SELECT (条件付き)

```typescript
// findByHash (論理削除除外)
const result = await this.db
  .select()
  .from(files)
  .where(and(eq(files.hash, hash), isNull(files.deletedAt)))
  .limit(1);
```

### 4.4 SELECT (複数ID)

```typescript
// findByIds
const result = await this.db
  .select()
  .from(files)
  .where(and(inArray(files.id, ids), isNull(files.deletedAt)));
```

### 4.5 SELECT (LIKE検索)

```typescript
// searchByName
const result = await this.db
  .select()
  .from(entities)
  .where(like(entities.name, `%${query}%`))
  .orderBy(desc(entities.importance))
  .limit(50);
```

### 4.6 INSERT (単一)

```typescript
// create
const result = await this.db
  .insert(this.table)
  .values(data as any) // Drizzle型の制約回避
  .returning();
return result[0];
```

### 4.7 INSERT (バッチ)

```typescript
// createMany
const result = await this.db
  .insert(this.table)
  .values(data as any[])
  .returning();
return result;
```

### 4.8 UPDATE

```typescript
// update
const result = await this.db
  .update(this.table)
  .set(data as any)
  .where(eq(this.idColumn, id))
  .returning();

if (result.length === 0) {
  return err(createRAGError(ErrorCodes.RECORD_NOT_FOUND, ...));
}
return ok(result[0]);
```

### 4.9 DELETE

```typescript
// delete
const result = await this.db
  .delete(this.table)
  .where(eq(this.idColumn, id))
  .returning();

if (result.length === 0) {
  return err(createRAGError(ErrorCodes.RECORD_NOT_FOUND, ...));
}
return ok(undefined);
```

### 4.10 論理削除

```typescript
// softDelete
await this.db
  .update(files)
  .set({ deletedAt: new Date() })
  .where(eq(files.id, id));
```

---

## 5. 型キャスト方針

### 5.1 `as any` 使用箇所

Drizzleのジェネリクス制約により、一部で `as any` が必要:

```typescript
// insert時のvalues
.values(data as any)        // TInsertがジェネリクスのため
.values(data as any[])      // createMany

// update時のset
.set(data as any)           // Partial<TInsert>がジェネリクスのため
```

**理由:** Drizzleの型推論はテーブルリテラル型を期待するが、ジェネリクス `TTable` では推論が困難。

### 5.2 型安全性の担保

- 入力はジェネリクス型パラメータで型チェック済み
- 出力は `as TSelect` でキャスト
- ランタイムエラーはDrizzleが検出

```typescript
// 型安全な呼び出し側
const repo = new FileRepository(db);
const result = await repo.create({
  name: "test.txt", // 型チェック: NewFile型
  path: "/path/to/file",
  // ...
});
// result: Result<File, RAGError> - 型安全
```

---

## 6. SQLite固有機能

### 6.1 returning()

SQLiteはINSERT/UPDATE/DELETEで `RETURNING` 句をサポート:

```typescript
const result = await this.db.insert(this.table).values(data).returning(); // 挿入されたレコードを返却
```

### 6.2 count()

```typescript
const countResult = await this.db
  .select({ count: sql<number>`count(*)` })
  .from(this.table);
```

### 6.3 exists相当

```typescript
const result = await this.db
  .select({ count: sql<number>`1` })
  .from(this.table)
  .where(eq(this.idColumn, id))
  .limit(1);
return result.length > 0;
```

---

## 7. トランザクション（将来拡張）

現在のスコープ外だが、サービス層での使用例:

```typescript
// サービス層でのトランザクション使用
await db.transaction(async (tx) => {
  const fileRepo = new FileRepository(tx);
  const chunkRepo = new ChunkRepository(tx);

  await fileRepo.delete(fileId);
  await chunkRepo.deleteByFileId(fileId);
});
```

---

## 8. 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-05 | 1.0        | 初版作成 |
