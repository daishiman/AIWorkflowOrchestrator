# 型定義設計書 - Repository パターン実装

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | CONV-04-06 |
| Phase    | 2          |
| 作成日   | 2026-01-05 |

---

## 1. 既存型定義の活用

### 1.1 Result型 (`types/rag/result.ts`)

```typescript
// 成功型
interface Success<T> {
  readonly success: true;
  readonly data: T;
}

// 失敗型
interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

// 統合型 (Discriminated Union)
type Result<T, E = Error> = Success<T> | Failure<E>;

// コンストラクタ
const ok = <T>(data: T): Success<T>;
const err = <E>(error: E): Failure<E>;

// 型ガード
const isOk = <T, E>(result: Result<T, E>): result is Success<T>;
const isErr = <T, E>(result: Result<T, E>): result is Failure<E>;
```

### 1.2 RAGError型 (`types/rag/errors.ts`)

```typescript
// エラーコード定数
const ErrorCodes = Object.freeze({
  DB_CONNECTION_ERROR: "DB_CONNECTION_ERROR",
  DB_QUERY_ERROR: "DB_QUERY_ERROR",
  DB_TRANSACTION_ERROR: "DB_TRANSACTION_ERROR",
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",
  // ...
} as const);

type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// RAGError インターフェース
interface RAGError {
  readonly code: ErrorCode;
  readonly message: string;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;
  readonly cause?: Error;
}

// ファクトリ関数
const createRAGError = (
  code: ErrorCode,
  message: string,
  context?: Record<string, unknown>,
  cause?: Error,
): RAGError;
```

### 1.3 Branded ID型 (`types/rag/branded.ts`)

```typescript
// Brand基盤
declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

// ID型定義
type FileId = Brand<string, "FileId">;
type ChunkId = Brand<string, "ChunkId">;
type EntityId = Brand<string, "EntityId">;

// 型キャスト関数
const createFileId = (id: string): FileId;
const createChunkId = (id: string): ChunkId;
const createEntityId = (id: string): EntityId;

// UUID生成関数
const generateFileId = (): FileId;
const generateChunkId = (): ChunkId;
const generateEntityId = (): EntityId;
```

### 1.4 ページネーション型 (`types/rag/interfaces.ts`)

```typescript
// 入力パラメータ
interface PaginationParams {
  readonly limit: number;
  readonly offset: number;
}

// 結果型
interface PaginatedResult<T> {
  readonly items: T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly hasMore: boolean;
}
```

---

## 2. BaseRepository 型設計

### 2.1 ジェネリクス型パラメータ

```typescript
abstract class BaseRepository<
  TTable extends SQLiteTable,  // Drizzleテーブル型
  TSelect,                     // SELECT結果型 (テーブル.$inferSelect)
  TInsert,                     // INSERT入力型 (テーブル.$inferInsert)
  TId extends string           // Branded ID型
>
```

### 2.2 型パラメータの制約

| パラメータ | 制約                  | 目的                  |
| ---------- | --------------------- | --------------------- |
| TTable     | `extends SQLiteTable` | Drizzle APIとの互換性 |
| TSelect    | なし                  | テーブルから推論      |
| TInsert    | なし                  | テーブルから推論      |
| TId        | `extends string`      | Branded IDを受け入れ  |

### 2.3 メソッドシグネチャ

```typescript
// ID検索
findById(id: TId): Promise<Result<TSelect | null, RAGError>>;

// 全件取得
findAll(params?: PaginationParams): Promise<Result<PaginatedResult<TSelect>, RAGError>>;

// 作成
create(data: TInsert): Promise<Result<TSelect, RAGError>>;

// バッチ作成
createMany(data: TInsert[]): Promise<Result<TSelect[], RAGError>>;

// 更新
update(id: TId, data: Partial<TInsert>): Promise<Result<TSelect, RAGError>>;

// 削除
delete(id: TId): Promise<Result<void, RAGError>>;

// 存在確認
exists(id: TId): Promise<Result<boolean, RAGError>>;

// 件数取得
count(): Promise<Result<number, RAGError>>;
```

---

## 3. 具象Repository 型バインディング

### 3.1 FileRepository

```typescript
class FileRepository extends BaseRepository<
  typeof files,  // TTable = Drizzle files テーブル
  File,          // TSelect = typeof files.$inferSelect
  NewFile,       // TInsert = typeof files.$inferInsert
  FileId         // TId = Brand<string, "FileId">
>
```

**固有メソッド型:**

```typescript
// ハッシュ検索
findByHash(hash: string): Promise<Result<File | null, RAGError>>;

// パス検索
findByPath(path: string): Promise<Result<File | null, RAGError>>;

// カテゴリ検索
findByCategory(category: string): Promise<Result<File[], RAGError>>;

// 論理削除
softDelete(id: FileId): Promise<Result<void, RAGError>>;

// 複数ID検索
findByIds(ids: FileId[]): Promise<Result<File[], RAGError>>;
```

### 3.2 ChunkRepository

```typescript
class ChunkRepository extends BaseRepository<
  typeof chunks,  // TTable
  Chunk,          // TSelect
  NewChunk,       // TInsert
  ChunkId         // TId
>
```

**固有メソッド型:**

```typescript
// ファイルID検索
findByFileId(fileId: FileId): Promise<Result<Chunk[], RAGError>>;

// ファイルID一括削除
deleteByFileId(fileId: FileId): Promise<Result<number, RAGError>>;

// ハッシュ検索
findByHash(hash: string): Promise<Result<Chunk | null, RAGError>>;

// 複数ID検索
findByIds(ids: ChunkId[]): Promise<Result<Chunk[], RAGError>>;

// 隣接チャンク取得
findAdjacent(chunkId: ChunkId): Promise<Result<{
  prev: Chunk | null;
  next: Chunk | null;
}, RAGError>>;
```

### 3.3 EntityRepository

```typescript
class EntityRepository extends BaseRepository<
  typeof entities,  // TTable
  Entity,           // TSelect
  NewEntity,        // TInsert
  EntityId          // TId
>
```

**固有メソッド型:**

```typescript
// 正規化名+タイプ検索
findByNormalizedNameAndType(
  normalizedName: string,
  type: string
): Promise<Result<Entity | null, RAGError>>;

// タイプ検索
findByType(type: string): Promise<Result<Entity[], RAGError>>;

// 名前部分一致検索
searchByName(query: string): Promise<Result<Entity[], RAGError>>;

// 重要度上位取得
findTopByImportance(limit?: number): Promise<Result<Entity[], RAGError>>;

// Upsert
upsert(data: NewEntity): Promise<Result<Entity, RAGError>>;
```

---

## 4. Repositories集約型

```typescript
interface Repositories {
  readonly files: FileRepository;
  readonly chunks: ChunkRepository;
  readonly entities: EntityRepository;
}

// ファクトリ関数
function createRepositories(db: Database): Repositories;
```

---

## 5. Database型定義

```typescript
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

// Repositoryで使用するDatabase型
export type Database = BetterSQLite3Database<Record<string, never>>;
```

---

## 6. 型安全性のポイント

### 6.1 Branded IDによる型区別

```typescript
// ❌ 型エラー: FileIdとChunkIdは互換性なし
const fileId: FileId = createFileId("123");
const chunkRepo = new ChunkRepository(db);
await chunkRepo.findById(fileId); // コンパイルエラー

// ✅ 正しい使用
const chunkId: ChunkId = createChunkId("456");
await chunkRepo.findById(chunkId); // OK
```

### 6.2 Result型によるエラーハンドリング

```typescript
const result = await fileRepo.findById(fileId);

if (isOk(result)) {
  const file = result.data; // File | null 型
  if (file) {
    console.log(file.name); // 型安全なアクセス
  }
} else {
  const error = result.error; // RAGError 型
  console.error(error.code, error.message);
}
```

### 6.3 ジェネリクスによる型推論

```typescript
// FileRepositoryでの型推論
const repo = new FileRepository(db);

// create: 入力はNewFile型、出力はResult<File, RAGError>
const created = await repo.create({
  name: "test.txt", // 型チェック: NewFile.name
  path: "/path/to/file", // 型チェック: NewFile.path
  // ...必須フィールド
});

// update: 入力はPartial<NewFile>、出力はResult<File, RAGError>
const updated = await repo.update(fileId, {
  name: "renamed.txt", // 型チェック: Partial<NewFile>
});
```

---

## 7. 型エクスポート構成

### 7.1 index.ts でのエクスポート

```typescript
// packages/shared/src/db/repositories/index.ts

// 型エクスポート
export type { Database } from "./base.repository";
export type { Repositories } from "./index";

// クラスエクスポート
export { BaseRepository } from "./base.repository";
export { FileRepository } from "./file.repository";
export { ChunkRepository } from "./chunk.repository";
export { EntityRepository } from "./entity.repository";

// ファクトリエクスポート
export { createRepositories } from "./index";
```

### 7.2 db/index.ts への統合

```typescript
// packages/shared/src/db/index.ts

// 既存エクスポートに追加
export * from "./repositories/index.js";
```

---

## 8. 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-05 | 1.0        | 初版作成 |
