# アーキテクチャ設計書 - Repository パターン実装

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | CONV-04-06                             |
| Phase    | 2                                      |
| 作成日   | 2026-01-05                             |
| 出力先   | `packages/shared/src/db/repositories/` |

---

## 1. アーキテクチャ概要

### 1.1 レイヤード・アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│         (サービス層・ユースケース・ビジネスロジック)            │
└───────────────────────────┬─────────────────────────────────┘
                            │ 依存
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Repository Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Repositories Interface                    │ │
│  │    (FileRepository, ChunkRepository, EntityRepository) │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              BaseRepository<T>                         │ │
│  │         (汎用CRUD操作の抽象実装)                        │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ 依存
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                 Drizzle ORM                            │ │
│  │    (Schema定義、Query Builder、Type Inference)          │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   SQLite                               │ │
│  │              (永続化ストレージ)                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 依存の方向

```
Application → Repository Interface → BaseRepository → Drizzle → SQLite
     ↓
   types/rag (Result, RAGError, Branded ID)
```

**原則:**

- 上位層は下位層に依存
- Repository層は`types/rag`に依存（横断的関心事）
- インターフェースに対してプログラミング

---

## 2. ディレクトリ構造

### 2.1 Repository層の配置

```
packages/shared/src/db/
├── repositories/                  # ← 本タスクで新規作成
│   ├── index.ts                   # バレルエクスポート・ファクトリ
│   ├── base.repository.ts         # 基底Repositoryクラス
│   ├── file.repository.ts         # FileRepository
│   ├── chunk.repository.ts        # ChunkRepository
│   ├── entity.repository.ts       # EntityRepository
│   └── __tests__/                 # テストディレクトリ
│       ├── base.repository.test.ts
│       ├── file.repository.test.ts
│       ├── chunk.repository.test.ts
│       └── entity.repository.test.ts
├── schema/                        # 既存: テーブル定義
│   ├── files.ts
│   ├── chunks.ts
│   └── graph/
│       └── entities.ts
├── queries/                       # 既存: 検索クエリ
│   ├── chunks-search.ts
│   └── vector-search.ts
├── index.ts                       # DBモジュールエントリポイント
├── env.ts
├── migrate.ts
└── utils.ts
```

### 2.2 関連ディレクトリ

```
packages/shared/src/types/rag/
├── result.ts          # Result<T, E>型
├── errors.ts          # RAGError, ErrorCodes
├── branded.ts         # FileId, ChunkId, EntityId
├── interfaces.ts      # PaginationParams, PaginatedResult, Repository<T,ID>
└── index.ts           # バレルエクスポート
```

---

## 3. コンポーネント設計

### 3.1 BaseRepository

**責務:** 汎用CRUD操作の抽象実装

**メソッド:**

| メソッド   | 責務                     | 戻り値                                       |
| ---------- | ------------------------ | -------------------------------------------- |
| findById   | ID検索                   | `Result<TSelect \| null, RAGError>`          |
| findAll    | ページネーション付き全件 | `Result<PaginatedResult<TSelect>, RAGError>` |
| create     | 1件作成                  | `Result<TSelect, RAGError>`                  |
| createMany | バッチ作成               | `Result<TSelect[], RAGError>`                |
| update     | 更新                     | `Result<TSelect, RAGError>`                  |
| delete     | 削除                     | `Result<void, RAGError>`                     |
| exists     | 存在確認                 | `Result<boolean, RAGError>`                  |
| count      | 件数取得                 | `Result<number, RAGError>`                   |

**ジェネリクス:**

```typescript
abstract class BaseRepository<
  TTable extends SQLiteTable,  // Drizzleテーブル型
  TSelect,                     // SELECT結果型
  TInsert,                     // INSERT入力型
  TId extends string           // Branded ID型
>
```

### 3.2 FileRepository

**責務:** ファイルメタデータの永続化

**継承:** `BaseRepository<typeof files, File, NewFile, FileId>`

**固有メソッド:**

| メソッド       | 責務           | 特記           |
| -------------- | -------------- | -------------- |
| findByHash     | ハッシュ検索   | 論理削除を除外 |
| findByPath     | パス検索       | 論理削除を除外 |
| findByCategory | カテゴリ検索   | 論理削除を除外 |
| softDelete     | 論理削除       | deletedAt設定  |
| findByIds      | 複数ID一括取得 | 論理削除を除外 |

### 3.3 ChunkRepository

**責務:** テキストチャンクの永続化

**継承:** `BaseRepository<typeof chunks, Chunk, NewChunk, ChunkId>`

**固有メソッド:**

| メソッド       | 責務               | 特記                   |
| -------------- | ------------------ | ---------------------- |
| findByFileId   | ファイルID検索     | chunkIndex順でソート   |
| deleteByFileId | ファイルID一括削除 | 削除件数を返却         |
| findByHash     | ハッシュ検索       |                        |
| findByIds      | 複数ID一括取得     |                        |
| findAdjacent   | 隣接チャンク取得   | prev/nextChunkIdを参照 |

### 3.4 EntityRepository

**責務:** Knowledge Graphエンティティの永続化

**継承:** `BaseRepository<typeof entities, Entity, NewEntity, EntityId>`

**固有メソッド:**

| メソッド                    | 責務                | 特記                 |
| --------------------------- | ------------------- | -------------------- |
| findByNormalizedNameAndType | 正規化名+タイプ検索 | 一意性保証           |
| findByType                  | タイプ検索          | importance降順       |
| searchByName                | 名前部分一致検索    | LIKE検索、最大50件   |
| findTopByImportance         | 重要度上位取得      | デフォルト20件       |
| upsert                      | Upsert処理          | mentionCount自動更新 |

### 3.5 Repositoriesファクトリ

**責務:** 全Repositoryインスタンスの一括生成

```typescript
interface Repositories {
  readonly files: FileRepository;
  readonly chunks: ChunkRepository;
  readonly entities: EntityRepository;
}

function createRepositories(db: Database): Repositories;
```

---

## 4. 依存関係

### 4.1 内部依存

```
file.repository.ts    ──┐
chunk.repository.ts   ──┼──▶ base.repository.ts ──▶ types/rag/*
entity.repository.ts  ──┘

index.ts ──▶ file.repository.ts
         ──▶ chunk.repository.ts
         ──▶ entity.repository.ts
```

### 4.2 外部依存

| パッケージ  | 用途           | インポート元                     |
| ----------- | -------------- | -------------------------------- |
| drizzle-orm | クエリビルダー | `eq`, `and`, `sql`, `inArray`等  |
| @types/rag  | 型定義         | `Result`, `RAGError`, `FileId`等 |
| db/schema   | テーブル定義   | `files`, `chunks`, `entities`    |

### 4.3 インポート例

```typescript
// base.repository.ts
import { eq, sql, and, or, desc, asc } from "drizzle-orm";
import type { SQLiteTable, SQLiteColumn } from "drizzle-orm/sqlite-core";
import type {
  Result,
  RAGError,
  PaginationParams,
  PaginatedResult,
} from "../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../types/rag";

// file.repository.ts
import { eq, and, inArray, like, isNull } from "drizzle-orm";
import { files, type File, type NewFile } from "../schema/files";
import type { FileId } from "../../types/rag/branded";
import { BaseRepository } from "./base.repository";
```

---

## 5. エラーハンドリング戦略

### 5.1 Result型による統一

すべてのメソッドは `Result<T, RAGError>` を返却:

```typescript
// 成功時
return ok(result);

// 失敗時
return err(
  createRAGError(
    ErrorCodes.DB_QUERY_ERROR,
    "Failed to find by id",
    { id }, // context
    error as Error, // cause
  ),
);
```

### 5.2 使用するErrorCodes

| コード           | 用途                      |
| ---------------- | ------------------------- |
| DB_QUERY_ERROR   | クエリ実行エラー          |
| RECORD_NOT_FOUND | update/delete時のID未検出 |

### 5.3 try-catchパターン

```typescript
async findById(id: TId): Promise<Result<TSelect | null, RAGError>> {
  try {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.idColumn, id))
      .limit(1);
    return ok(result[0] ?? null);
  } catch (error) {
    return err(createRAGError(
      ErrorCodes.DB_QUERY_ERROR,
      `Failed to find by id: ${id}`,
      { id },
      error as Error
    ));
  }
}
```

---

## 6. ページネーション設計

### 6.1 入力型

```typescript
interface PaginationParams {
  readonly limit: number; // デフォルト: 20
  readonly offset: number; // デフォルト: 0
}
```

### 6.2 出力型

```typescript
interface PaginatedResult<T> {
  readonly items: T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly hasMore: boolean;
}
```

### 6.3 hasMore計算

```typescript
hasMore: offset + items.length < total;
```

---

## 7. パフォーマンス考慮

### 7.1 並列クエリ

findAllでは count と select を並列実行:

```typescript
const [items, countResult] = await Promise.all([
  this.db.select().from(this.table).limit(limit).offset(offset),
  this.db.select({ count: sql<number>`count(*)` }).from(this.table),
]);
```

### 7.2 早期リターン

空配列入力時の最適化:

```typescript
async createMany(data: TInsert[]): Promise<Result<TSelect[], RAGError>> {
  if (data.length === 0) return ok([]);
  // ...
}
```

### 7.3 インデックス活用

既存テーブルのインデックスを活用:

- files: hash, path, category
- chunks: file_id, hash
- entities: normalized_name + type, type, importance

---

## 8. テスタビリティ設計

### 8.1 依存性注入

```typescript
class FileRepository extends BaseRepository<...> {
  constructor(db: Database) {  // DIポイント
    super(db, files, files.id);
  }
}
```

### 8.2 テスト用DBセットアップ

```typescript
// テストファイル
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database(":memory:");
const db = drizzle(sqlite);
// マイグレーション実行
const repos = createRepositories(db);
```

---

## 9. 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-05 | 1.0        | 初版作成 |
