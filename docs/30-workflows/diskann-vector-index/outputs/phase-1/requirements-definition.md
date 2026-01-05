# DiskANN ベクトルインデックス - 要件定義書

## メタ情報

| 項目           | 内容                                        |
| -------------- | ------------------------------------------- |
| 文書バージョン | 1.0                                         |
| 作成日         | 2026-01-04                                  |
| タスクID       | CONV-04-04                                  |
| タスク名       | DiskANN ベクトルインデックス設定            |
| 依存タスク     | CONV-04-03 (content_chunks テーブル + FTS5) |

---

## 1. 概要

### 1.1 目的

埋め込みベクトルを保存し、高速なベクトル類似度検索を可能にするテーブルとインデックスを定義する。RAGシステムのセマンティック検索基盤を提供する。

### 1.2 背景

libSQLは2024年にベクトル検索機能を追加し、DiskANNベースの近似最近傍探索（ANN）をサポートしている。既存のchunksテーブル（FTS5全文検索）と連携し、セマンティック検索を実現する。

### 1.3 システム仕様との整合性

本要件は以下の既存システム仕様と整合する：

| 参照資料                | 整合確認内容                                  |
| ----------------------- | --------------------------------------------- |
| database-architecture   | Turso/libSQL/Drizzle ORM構成に準拠            |
| interfaces-rag          | EmbeddingEntity型定義、Branded Types使用      |
| architecture-rag        | RAGシステムアーキテクチャとの統合             |
| database-implementation | Drizzle ORMパターン、マイグレーション規則準拠 |

---

## 2. 機能要件（Functional Requirements）

### FR-01: embeddingsテーブル定義

| 項目   | 内容                                                            |
| ------ | --------------------------------------------------------------- |
| 要件ID | FR-01                                                           |
| 要件名 | embeddingsテーブルをDrizzle ORMスキーマで定義する               |
| 説明   | 埋め込みベクトルを保存するためのテーブルをDrizzle ORMで定義する |
| 入力   | Drizzle ORM スキーマ定義                                        |
| 出力   | `packages/shared/src/db/schema/embeddings.ts`                   |
| 優先度 | 必須                                                            |

**カラム定義:**

| カラム名             | 型      | 制約                         | 説明                     |
| -------------------- | ------- | ---------------------------- | ------------------------ |
| id                   | TEXT    | PRIMARY KEY (UUID)           | 埋め込みID               |
| chunk_id             | TEXT    | NOT NULL, UNIQUE, FK(chunks) | 関連チャンクID           |
| vector               | BLOB    | NOT NULL                     | 埋め込みベクトル         |
| model_id             | TEXT    | NOT NULL                     | 使用モデルID             |
| dimensions           | INTEGER | NOT NULL                     | ベクトル次元数           |
| normalized_magnitude | REAL    | NOT NULL                     | 正規化済みマグニチュード |
| created_at           | INTEGER | NOT NULL, DEFAULT            | 作成日時                 |
| updated_at           | INTEGER | NOT NULL, DEFAULT            | 更新日時                 |

**インデックス:**

- `embeddings_chunk_id_idx`: chunk_id (UNIQUE)
- `embeddings_model_id_idx`: model_id

### FR-02: chunksテーブルとのリレーション

| 項目   | 内容                                             |
| ------ | ------------------------------------------------ |
| 要件ID | FR-02                                            |
| 要件名 | chunksテーブルとの外部キーリレーションを定義する |
| 説明   | chunk削除時にカスケード削除を実行する            |
| 入力   | chunks.id                                        |
| 出力   | リレーション定義 (`relations.ts` 更新)           |
| 優先度 | 必須                                             |

### FR-03: ベクトルインデックス管理

| 項目   | 内容                                                          |
| ------ | ------------------------------------------------------------- |
| 要件ID | FR-03                                                         |
| 要件名 | DiskANNベクトルインデックスの作成・削除・再構築機能を提供する |
| 説明   | libSQLのベクトルインデックス機能を活用した管理APIを実装する   |
| 入力   | VectorIndexConfig                                             |
| 出力   | `packages/shared/src/db/schema/vector-index.ts`               |
| 優先度 | 必須                                                          |

**機能:**

- `createVectorIndex()`: ベクトルインデックス作成
- `dropVectorIndex()`: ベクトルインデックス削除
- `rebuildVectorIndex()`: ベクトルインデックス再構築
- `getIndexStats()`: インデックス統計情報取得

### FR-04: コサイン類似度検索

| 項目   | 内容                                                      |
| ------ | --------------------------------------------------------- |
| 要件ID | FR-04                                                     |
| 要件名 | コサイン類似度によるベクトル検索機能を実装する            |
| 説明   | libSQLの`vector_distance_cos`関数を使用した検索を提供する |
| 入力   | Float32Array (クエリベクトル), VectorSearchOptions        |
| 出力   | VectorSearchResult[]                                      |
| 優先度 | 必須                                                      |

### FR-05: ユークリッド距離検索

| 項目   | 内容                                                     |
| ------ | -------------------------------------------------------- |
| 要件ID | FR-05                                                    |
| 要件名 | ユークリッド距離によるベクトル検索機能を実装する         |
| 説明   | libSQLの`vector_distance_l2`関数を使用した検索を提供する |
| 入力   | Float32Array (クエリベクトル), VectorSearchOptions       |
| 出力   | VectorSearchResult[]                                     |
| 優先度 | 必須                                                     |

### FR-06: 内積検索

| 項目   | 内容                                               |
| ------ | -------------------------------------------------- |
| 要件ID | FR-06                                              |
| 要件名 | 内積によるベクトル検索機能を実装する               |
| 説明   | libSQLの`vector_dot`関数を使用した検索を提供する   |
| 入力   | Float32Array (クエリベクトル), VectorSearchOptions |
| 出力   | VectorSearchResult[]                               |
| 優先度 | 必須                                               |

### FR-07: Float32Array ⇔ Blob 変換

| 項目   | 内容                                                     |
| ------ | -------------------------------------------------------- |
| 要件ID | FR-07                                                    |
| 要件名 | Float32ArrayとBlob間の変換関数を実装する                 |
| 説明   | JavaScriptのFloat32ArrayとSQLiteのBLOB間で相互変換を行う |
| 入力   | Float32Array または Buffer                               |
| 出力   | Buffer または Float32Array                               |
| 優先度 | 必須                                                     |

**関数:**

- `vectorToBlob(vector: Float32Array): Buffer`
- `blobToVector(blob: Buffer): Float32Array`

### FR-08: バッチ挿入

| 項目   | 内容                                                      |
| ------ | --------------------------------------------------------- |
| 要件ID | FR-08                                                     |
| 要件名 | 埋め込みベクトルのバッチ挿入機能を実装する                |
| 説明   | 複数の埋め込みを効率的に挿入し、100件単位でバッチ分割する |
| 入力   | EmbeddingInsertItem[]                                     |
| 出力   | void                                                      |
| 優先度 | 必須                                                      |

### FR-09: 検索オプション

| 項目   | 内容                                                             |
| ------ | ---------------------------------------------------------------- |
| 要件ID | FR-09                                                            |
| 要件名 | ベクトル検索のフィルタリングオプションを実装する                 |
| 説明   | 検索結果のlimit、minSimilarity、fileIds、modelIdフィルターを提供 |
| 入力   | VectorSearchOptions                                              |
| 出力   | フィルタリングされたVectorSearchResult[]                         |
| 優先度 | 必須                                                             |

### FR-10: マイグレーション

| 項目   | 内容                                                                 |
| ------ | -------------------------------------------------------------------- |
| 要件ID | FR-10                                                                |
| 要件名 | embeddingsテーブルとベクトルインデックスのマイグレーションを作成     |
| 説明   | SQLマイグレーションファイルを作成し、正常に実行できること            |
| 入力   | マイグレーションSQL                                                  |
| 出力   | `packages/shared/src/db/migrations/0006_create_embeddings_table.sql` |
| 優先度 | 必須                                                                 |

---

## 3. 非機能要件（Non-Functional Requirements）

### NFR-01: パフォーマンス - 検索速度

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| 要件ID   | NFR-01                                     |
| 品質特性 | パフォーマンス効率性                       |
| 要件名   | ベクトル検索の応答時間                     |
| 説明     | データ規模に応じた検索時間の目標を達成する |
| 測定方法 | 検索クエリの実行時間を計測                 |
| 優先度   | 必須                                       |

**目標値:**

| データ規模       | 検索時間目標 |
| ---------------- | ------------ |
| < 10,000件       | < 50ms       |
| 10,000-100,000件 | < 100ms      |
| > 100,000件      | < 200ms      |

### NFR-02: パフォーマンス - バッチ挿入

| 項目     | 内容                                        |
| -------- | ------------------------------------------- |
| 要件ID   | NFR-02                                      |
| 品質特性 | パフォーマンス効率性                        |
| 要件名   | バッチ挿入の効率性                          |
| 説明     | 大量データの挿入時にメモリ使用量を制御する  |
| 測定方法 | バッチサイズ100件での挿入時間・メモリ使用量 |
| 目標値   | 100件/バッチで処理、メモリ増加 < 50MB       |
| 優先度   | 必須                                        |

### NFR-03: 信頼性 - データ整合性

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| 要件ID   | NFR-03                                          |
| 品質特性 | 信頼性                                          |
| 要件名   | ベクトルデータの整合性保証                      |
| 説明     | Float32Array ⇔ Blob変換でデータ損失が発生しない |
| 測定方法 | 往復変換テストで値の一致を確認                  |
| 目標値   | 100%のデータ保持（浮動小数点精度内）            |
| 優先度   | 必須                                            |

### NFR-04: 信頼性 - カスケード削除

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| 要件ID   | NFR-04                                             |
| 品質特性 | 信頼性                                             |
| 要件名   | 外部キー制約によるカスケード削除の正確性           |
| 説明     | chunk削除時に関連embeddingが確実に削除される       |
| 測定方法 | カスケード削除テストで孤立レコードがないことを確認 |
| 目標値   | 孤立レコード 0件                                   |
| 優先度   | 必須                                               |

### NFR-05: 保守性 - コード品質

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 要件ID   | NFR-05                                 |
| 品質特性 | 保守性                                 |
| 要件名   | コード品質基準の達成                   |
| 説明     | ESLint、TypeScript型チェックをパスする |
| 測定方法 | Lint、型チェックの実行結果             |
| 目標値   | ESLint警告0件、TypeScriptエラー0件     |
| 優先度   | 必須                                   |

### NFR-06: 保守性 - ドキュメント

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| 要件ID   | NFR-06                                        |
| 品質特性 | 保守性                                        |
| 要件名   | JSDocコメントの記述                           |
| 説明     | 全パブリック関数・型にJSDocコメントを記述する |
| 測定方法 | コードレビューでJSDocの有無を確認             |
| 目標値   | 全パブリックAPIにJSDoc記述                    |
| 優先度   | 必須                                          |

### NFR-07: 互換性 - Drizzle ORM

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| 要件ID   | NFR-07                                       |
| 品質特性 | 互換性                                       |
| 要件名   | Drizzle ORMパターンへの準拠                  |
| 説明     | 既存のDrizzle ORMスキーマパターンに準拠する  |
| 測定方法 | database-implementation.mdのパターンとの比較 |
| 目標値   | 既存パターンとの100%整合                     |
| 優先度   | 必須                                         |

### NFR-08: 互換性 - 型システム

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| 要件ID   | NFR-08                                   |
| 品質特性 | 互換性                                   |
| 要件名   | interfaces-ragの型定義との整合           |
| 説明     | EmbeddingEntity、Branded Typesと整合する |
| 測定方法 | interfaces-rag.mdの型定義との比較        |
| 目標値   | 既存型定義との100%整合                   |
| 優先度   | 必須                                     |

### NFR-09: テスト可能性

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| 要件ID   | NFR-09                               |
| 品質特性 | テスト可能性                         |
| 要件名   | 単体テストのカバレッジ               |
| 説明     | 主要機能に対する単体テストを実装する |
| 測定方法 | テストカバレッジの計測               |
| 目標値   | カバレッジ 80%以上                   |
| 優先度   | 必須                                 |

### NFR-10: セキュリティ - 入力検証

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| 要件ID   | NFR-10                                     |
| 品質特性 | セキュリティ                               |
| 要件名   | 入力パラメータの検証                       |
| 説明     | ベクトル次元数、検索オプションを検証する   |
| 測定方法 | 不正入力に対するエラーハンドリングのテスト |
| 目標値   | 全不正入力で適切なエラーを返す             |
| 優先度   | 必須                                       |

---

## 4. 型定義（interfaces-rag.mdとの整合）

### 4.1 既存型定義（参照）

```typescript
// interfaces-rag.md より
declare const EmbeddingIdBrand: unique symbol;
type EmbeddingId = string & {
  readonly [EmbeddingIdBrand]: typeof EmbeddingIdBrand;
};

interface EmbeddingEntity {
  id: EmbeddingId;
  chunkId: ChunkId;
  modelId: EmbeddingModelId;
  modelVersion?: string;
  vector: Float32Array;
  dimensions: number;
  normalizedMagnitude: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 追加型定義

```typescript
// 本実装で追加する型
interface VectorIndexConfig {
  readonly name: string;
  readonly dimensions: number;
  readonly metric: "cosine" | "l2" | "dot";
  readonly maxElements?: number;
  readonly efConstruction?: number;
  readonly efSearch?: number;
}

interface VectorSearchResult {
  chunkId: string;
  embeddingId: string;
  distance: number;
  similarity: number;
  content: string;
  contextualContent: string | null;
}

interface VectorSearchOptions {
  limit?: number;
  minSimilarity?: number;
  fileIds?: string[];
  modelId?: string;
}
```

---

## 5. 依存関係

### 5.1 前提条件

| 依存タスク  | 内容                  | 状態     |
| ----------- | --------------------- | -------- |
| CONV-04-03  | chunksテーブル + FTS5 | 完了     |
| Drizzle ORM | スキーマ定義基盤      | 利用可能 |
| libSQL      | ベクトル検索機能      | 利用可能 |

### 5.2 後続タスク

| タスクID   | タスク名                   |
| ---------- | -------------------------- |
| CONV-06-02 | 埋め込みプロバイダー抽象化 |
| CONV-07-03 | ベクトル検索戦略 (DiskANN) |

---

## 6. 制約事項

1. **libSQL依存**: ベクトル検索機能はlibSQL固有のAPI（`vector_distance_cos`等）に依存
2. **次元数固定**: デフォルトは1536次元（OpenAI text-embedding-3-small）、設定で変更可能
3. **インデックス構築時間**: 大規模データセットではインデックス構築に時間がかかる可能性
4. **API安定性**: libSQLのベクトル機能は比較的新しく、APIが変更される可能性

---

## 7. 参照情報

- [libSQL Vector Search Documentation](https://github.com/libsql/libsql/blob/main/libsql-sqlite3/doc/vector_search.md)
- [Turso Native Vector Search](https://turso.tech/blog/turso-native-vector-search-now-in-beta)
- [DiskANN: Fast Accurate Billion-point Nearest Neighbor Search](https://github.com/microsoft/DiskANN)
- `.claude/skills/aiworkflow-requirements/references/database-architecture.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`
