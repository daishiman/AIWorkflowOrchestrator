# 要件定義書 - Repository パターン実装

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| タスクID   | CONV-04-06                             |
| タスク名   | Repository パターン実装                |
| 作成日     | 2026-01-05                             |
| 出力場所   | `packages/shared/src/db/repositories/` |
| 依存タスク | CONV-04-02, 04-03, 04-04, 04-05        |

---

## 1. 機能要件

### 1.1 BaseRepository（基底クラス）

汎用的なCRUD操作を提供する抽象クラス。

| ID     | 機能       | メソッド             | 戻り値型                                     |
| ------ | ---------- | -------------------- | -------------------------------------------- |
| FR-B01 | ID検索     | `findById(id)`       | `Result<TSelect \| null, RAGError>`          |
| FR-B02 | 全件取得   | `findAll(params?)`   | `Result<PaginatedResult<TSelect>, RAGError>` |
| FR-B03 | 作成       | `create(data)`       | `Result<TSelect, RAGError>`                  |
| FR-B04 | バッチ作成 | `createMany(data[])` | `Result<TSelect[], RAGError>`                |
| FR-B05 | 更新       | `update(id, data)`   | `Result<TSelect, RAGError>`                  |
| FR-B06 | 削除       | `delete(id)`         | `Result<void, RAGError>`                     |
| FR-B07 | 存在確認   | `exists(id)`         | `Result<boolean, RAGError>`                  |
| FR-B08 | 件数取得   | `count()`            | `Result<number, RAGError>`                   |

**ジェネリクス型パラメータ:**

- `TTable extends SQLiteTable` - Drizzle テーブル型
- `TSelect` - SELECT結果型（テーブルから推論）
- `TInsert` - INSERT入力型（テーブルから推論）
- `TId extends string` - Branded ID型

### 1.2 FileRepository（ファイルメタデータ）

ファイルメタデータの永続化を担当。`files`テーブルに対するCRUD操作を提供。

| ID     | 機能           | メソッド              | 戻り値型                         |
| ------ | -------------- | --------------------- | -------------------------------- |
| FR-F01 | ハッシュ検索   | `findByHash(hash)`    | `Result<File \| null, RAGError>` |
| FR-F02 | パス検索       | `findByPath(path)`    | `Result<File \| null, RAGError>` |
| FR-F03 | カテゴリ検索   | `findByCategory(cat)` | `Result<File[], RAGError>`       |
| FR-F04 | 論理削除       | `softDelete(id)`      | `Result<void, RAGError>`         |
| FR-F05 | 複数ID一括取得 | `findByIds(ids[])`    | `Result<File[], RAGError>`       |

**ID型:** `FileId`（Branded Type）

### 1.3 ChunkRepository（チャンク）

テキストチャンクの永続化を担当。`chunks`テーブルに対するCRUD操作を提供。

| ID     | 機能               | メソッド                 | 戻り値型                          |
| ------ | ------------------ | ------------------------ | --------------------------------- |
| FR-C01 | ファイルID検索     | `findByFileId(fileId)`   | `Result<Chunk[], RAGError>`       |
| FR-C02 | ファイルID一括削除 | `deleteByFileId(fileId)` | `Result<number, RAGError>`        |
| FR-C03 | ハッシュ検索       | `findByHash(hash)`       | `Result<Chunk \| null, RAGError>` |
| FR-C04 | 複数ID一括取得     | `findByIds(ids[])`       | `Result<Chunk[], RAGError>`       |
| FR-C05 | 隣接チャンク取得   | `findAdjacent(chunkId)`  | `Result<{prev, next}, RAGError>`  |

**ID型:** `ChunkId`（Branded Type）、関連: `FileId`

### 1.4 EntityRepository（エンティティ）

Knowledge Graphエンティティの永続化を担当。`entities`テーブルに対するCRUD操作を提供。

| ID     | 機能                | メソッド                           | 戻り値型                           |
| ------ | ------------------- | ---------------------------------- | ---------------------------------- |
| FR-E01 | 正規化名+タイプ検索 | `findByNormalizedNameAndType(...)` | `Result<Entity \| null, RAGError>` |
| FR-E02 | タイプ検索          | `findByType(type)`                 | `Result<Entity[], RAGError>`       |
| FR-E03 | 名前部分一致検索    | `searchByName(query)`              | `Result<Entity[], RAGError>`       |
| FR-E04 | 重要度上位取得      | `findTopByImportance(limit)`       | `Result<Entity[], RAGError>`       |
| FR-E05 | Upsert処理          | `upsert(data)`                     | `Result<Entity, RAGError>`         |

**ID型:** `EntityId`（Branded Type）

### 1.5 Repositoryファクトリ

全Repositoryインスタンスを一括生成する関数。

| ID     | 機能               | 関数                     | 戻り値型       |
| ------ | ------------------ | ------------------------ | -------------- |
| FR-A01 | Repository一括生成 | `createRepositories(db)` | `Repositories` |

**Repositories型:**

```typescript
interface Repositories {
  readonly files: FileRepository;
  readonly chunks: ChunkRepository;
  readonly entities: EntityRepository;
}
```

---

## 2. 非機能要件

### 2.1 型安全性

| ID      | 要件                     | 詳細                                     |
| ------- | ------------------------ | ---------------------------------------- |
| NFR-T01 | Result型返却             | 全メソッドは`Result<T, RAGError>`を返す  |
| NFR-T02 | Branded ID型使用         | FileId, ChunkId, EntityIdで型レベル区別  |
| NFR-T03 | ジェネリクス型パラメータ | BaseRepositoryは型パラメータで柔軟に対応 |
| NFR-T04 | 厳密な型チェック         | `as any`使用は最小限に抑える             |

### 2.2 エラーハンドリング

| ID      | 要件             | 詳細                                    |
| ------- | ---------------- | --------------------------------------- |
| NFR-E01 | ErrorCodes使用   | エラーコードは`ErrorCodes`定数から選択  |
| NFR-E02 | 原因エラー保持   | `cause`フィールドで元のエラーを保持     |
| NFR-E03 | コンテキスト情報 | `context`フィールドでデバッグ情報を付加 |
| NFR-E04 | try-catchラップ  | DB操作は必ずtry-catchでラップ           |

**主要ErrorCodes:**

- `DB_QUERY_ERROR` - クエリ実行エラー
- `RECORD_NOT_FOUND` - レコード未検出

### 2.3 ページネーション

| ID      | 要件                   | 詳細                                       |
| ------- | ---------------------- | ------------------------------------------ |
| NFR-P01 | PaginationParams型使用 | `{ limit: number, offset: number }`        |
| NFR-P02 | PaginatedResult型返却  | `{ items, total, limit, offset, hasMore }` |
| NFR-P03 | デフォルト値           | limit=20, offset=0                         |

### 2.4 パフォーマンス

| ID      | 要件               | 詳細                                |
| ------- | ------------------ | ----------------------------------- |
| NFR-F01 | バッチ処理対応     | `createMany`で複数レコード一括挿入  |
| NFR-F02 | 並列クエリ         | `findAll`でcount + selectを並列実行 |
| NFR-F03 | 空配列早期リターン | 空配列入力時は即座に成功を返却      |

### 2.5 テスタビリティ

| ID      | 要件                 | 詳細                                      |
| ------- | -------------------- | ----------------------------------------- |
| NFR-S01 | DI対応               | コンストラクタでDatabase依存性を注入      |
| NFR-S02 | モック可能           | テスト時にin-memory DBで検証可能          |
| NFR-S03 | インターフェース準拠 | `Repository<T, ID>`インターフェースを実装 |

---

## 3. 依存するシステム仕様

### 3.1 既存型定義

| 型名             | パス                      | 用途                 |
| ---------------- | ------------------------- | -------------------- |
| Result           | `types/rag/result.ts`     | 成功/失敗のラッパー  |
| RAGError         | `types/rag/errors.ts`     | エラー型             |
| ErrorCodes       | `types/rag/errors.ts`     | エラーコード定数     |
| FileId/ChunkId等 | `types/rag/branded.ts`    | Branded ID型         |
| PaginationParams | `types/rag/interfaces.ts` | ページネーション入力 |
| PaginatedResult  | `types/rag/interfaces.ts` | ページネーション結果 |

### 3.2 既存テーブル定義

| テーブル | パス                          | 型名              |
| -------- | ----------------------------- | ----------------- |
| files    | `db/schema/files.ts`          | File, NewFile     |
| chunks   | `db/schema/chunks.ts`         | Chunk, NewChunk   |
| entities | `db/schema/graph/entities.ts` | Entity, NewEntity |

---

## 4. 成果物一覧

| ファイル               | 内容                           |
| ---------------------- | ------------------------------ |
| `base.repository.ts`   | 基底Repositoryクラス           |
| `file.repository.ts`   | FileRepository                 |
| `chunk.repository.ts`  | ChunkRepository                |
| `entity.repository.ts` | EntityRepository               |
| `index.ts`             | ファクトリ・バレルエクスポート |

---

## 5. 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-05 | 1.0        | 初版作成 |
