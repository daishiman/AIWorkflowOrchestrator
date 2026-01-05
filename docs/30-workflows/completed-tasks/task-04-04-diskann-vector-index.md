# DiskANN ベクトルインデックス設定 - タスク仕様書

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | CONV-04-04                                  |
| タスク名     | DiskANN ベクトルインデックス設定            |
| 親タスク     | CONV-04 (データベーススキーマ)              |
| 依存タスク   | CONV-04-03 (content_chunks テーブル + FTS5) |
| 規模         | 中                                          |
| 見積もり工数 | 0.5日                                       |
| ステータス   | 未実施                                      |

---

## 1. 目的

埋め込みベクトルを保存し、高速なベクトル類似度検索を可能にするテーブルとインデックスを定義する。セマンティック検索基盤となる。

---

## 2. 背景

libSQLは2024年にベクトル検索機能を追加。DiskANNベースの近似最近傍探索（ANN）をサポートしており、これを活用してRAGシステムのセマンティック検索を実現する。

---

## 3. 成果物

| 種別             | ファイル                                                             | 説明                     |
| ---------------- | -------------------------------------------------------------------- | ------------------------ |
| スキーマ         | `packages/shared/src/db/schema/embeddings.ts`                        | embeddingsテーブル定義   |
| インデックス     | `packages/shared/src/db/schema/vector-index.ts`                      | ベクトルインデックス管理 |
| クエリ           | `packages/shared/src/db/queries/vector-search.ts`                    | ベクトル検索クエリ       |
| リレーション     | `packages/shared/src/db/schema/relations.ts`                         | リレーション更新         |
| マイグレーション | `packages/shared/src/db/migrations/0006_create_embeddings_table.sql` | マイグレーションSQL      |
| テスト           | `packages/shared/src/db/schema/__tests__/embeddings.test.ts`         | 単体テスト               |

---

## 4. 入力

- chunks テーブル（CONV-04-03で定義済み）
- Float32Array 形式の埋め込みベクトル
- モデル情報（model_id, dimensions）

---

## 5. 出力

- embeddings テーブル（ベクトル保存）
- ベクトルインデックス（DiskANN）
- ベクトル検索API（コサイン類似度、ユークリッド距離、内積）

---

## 6. 実装仕様

### 6.1 embeddingsテーブル定義

```typescript
// packages/shared/src/db/schema/embeddings.ts
export const embeddings = sqliteTable(
  "embeddings",
  {
    id: uuidPrimaryKey(),
    chunkId: text("chunk_id")
      .notNull()
      .references(() => chunks.id, { onDelete: "cascade" }),
    vector: blob("vector", { mode: "buffer" }).notNull(),
    modelId: text("model_id").notNull(),
    dimensions: integer("dimensions").notNull(),
    normalizedMagnitude: real("normalized_magnitude").notNull(),
    ...timestamps,
  },
  (table) => ({
    chunkIdIdx: uniqueIndex("embeddings_chunk_id_idx").on(table.chunkId),
    modelIdIdx: index("embeddings_model_id_idx").on(table.modelId),
  }),
);
```

### 6.2 ベクトルインデックス設定

```typescript
// packages/shared/src/db/schema/vector-index.ts
export interface VectorIndexConfig {
  readonly name: string;
  readonly dimensions: number;
  readonly metric: "cosine" | "l2" | "dot";
  readonly maxElements?: number;
  readonly efConstruction?: number;
  readonly efSearch?: number;
}

export const defaultVectorIndexConfig: VectorIndexConfig = {
  name: "embeddings_vector_idx",
  dimensions: 1536, // OpenAI text-embedding-3-small
  metric: "cosine",
  maxElements: 1000000,
  efConstruction: 200,
  efSearch: 100,
};
```

### 6.3 ベクトル検索クエリ

```typescript
// packages/shared/src/db/queries/vector-search.ts
export interface VectorSearchResult {
  chunkId: string;
  embeddingId: string;
  distance: number;
  similarity: number;
  content: string;
  contextualContent: string | null;
}

export interface VectorSearchOptions {
  limit?: number;
  minSimilarity?: number;
  fileIds?: string[];
  modelId?: string;
}

// Float32Array ⇔ Blob 変換
export const vectorToBlob = (vector: Float32Array): Buffer;
export const blobToVector = (blob: Buffer): Float32Array;

// 検索関数
export const searchByVector = async (db, queryVector, options): Promise<VectorSearchResult[]>;
export const searchByVectorL2 = async (db, queryVector, options): Promise<VectorSearchResult[]>;
export const searchByVectorDot = async (db, queryVector, options): Promise<VectorSearchResult[]>;
export const insertEmbeddingsBatch = async (db, items): Promise<void>;
```

### 6.4 マイグレーションSQL

```sql
-- 0006_create_embeddings_table.sql
CREATE TABLE IF NOT EXISTS embeddings (
  id TEXT PRIMARY KEY,
  chunk_id TEXT NOT NULL UNIQUE REFERENCES chunks(id) ON DELETE CASCADE,
  vector BLOB NOT NULL,
  model_id TEXT NOT NULL,
  dimensions INTEGER NOT NULL,
  normalized_magnitude REAL NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS embeddings_chunk_id_idx ON embeddings(chunk_id);
CREATE INDEX IF NOT EXISTS embeddings_model_id_idx ON embeddings(model_id);

-- ベクトルインデックス（libSQL専用構文）
CREATE INDEX IF NOT EXISTS embeddings_vector_idx
ON embeddings(vector)
USING vector(1536)
WITH (metric = 'cosine');
```

---

## 7. テストケース

```typescript
describe("embeddings テーブル", () => {
  it("埋め込みを挿入できる", async () => {});
  it("chunkId で一意性が保証される", async () => {});
  it("chunk 削除時にカスケード削除される", async () => {});
});

describe("ベクトルインデックス", () => {
  it("インデックスを作成できる", async () => {});
  it("インデックスを削除できる", async () => {});
  it("インデックスを再構築できる", async () => {});
  it("統計情報を取得できる", async () => {});
});

describe("ベクトル検索", () => {
  it("コサイン類似度検索が動作する", async () => {});
  it("ユークリッド距離検索が動作する", async () => {});
  it("内積検索が動作する", async () => {});
  it("minSimilarity でフィルタリングされる", async () => {});
  it("fileIds でフィルタリングできる", async () => {});
  it("結果が類似度順でソートされる", async () => {});
});

describe("バッチ挿入", () => {
  it("複数の埋め込みを一括挿入できる", async () => {});
  it("大量データでもバッチ分割される", async () => {});
});

describe("Float32Array 変換", () => {
  it("vectorToBlob が正しく変換する", async () => {});
  it("blobToVector が正しく復元する", async () => {});
  it("往復変換でデータが保持される", async () => {});
});
```

---

## 8. 完了条件

- [ ] `embeddings` テーブルが Drizzle スキーマで定義されている
- [ ] ベクトルインデックス作成/削除/再構築が動作する
- [ ] コサイン類似度検索（`vector_distance_cos`）が実装されている
- [ ] ユークリッド距離検索（`vector_distance_l2`）が実装されている
- [ ] 内積検索（`vector_dot`）が実装されている
- [ ] Float32Array ⇔ Blob 変換が実装されている
- [ ] バッチ挿入（100件単位）が実装されている
- [ ] chunks テーブルとのリレーションが定義されている
- [ ] マイグレーションが正常に実行できる
- [ ] 全テストがパス
- [ ] TypeScript 型エラーなし
- [ ] ESLint 警告なし
- [ ] JSDoc コメントが記述されている

---

## 9. 依存関係

### このタスクが依存するもの

| タスクID   | タスク名                       | 状態 |
| ---------- | ------------------------------ | ---- |
| CONV-04-03 | content_chunks テーブル + FTS5 | 完了 |

### このタスクに依存するもの

| タスクID   | タスク名                   | 状態   |
| ---------- | -------------------------- | ------ |
| CONV-06-02 | 埋め込みプロバイダー抽象化 | 未実施 |
| CONV-07-03 | ベクトル検索戦略 (DiskANN) | 未実施 |

---

## 10. 次のタスク

- CONV-06-02: 埋め込みプロバイダー抽象化

---

## 11. 参照情報

- [libSQL Vector Search Documentation](https://github.com/libsql/libsql/blob/main/libsql-sqlite3/doc/vector_search.md)
- [Turso Native Vector Search](https://turso.tech/blog/turso-native-vector-search-now-in-beta)
- [DiskANN: Fast Accurate Billion-point Nearest Neighbor Search](https://github.com/microsoft/DiskANN)

---

## 12. 備考

- libSQLのベクトル機能は比較的新しく、APIが変更される可能性がある
- 本番環境ではTurso（libSQLのマネージドサービス）の使用を推奨
- 1536次元（OpenAI text-embedding-3-small）を想定しているが、設定で変更可能
- 大規模データセットでは、インデックス構築に時間がかかる場合がある
- `vector_distance_cos`、`vector_distance_l2`、`vector_dot` はlibSQL固有の関数

---

## 13. パフォーマンス指標

| データ規模       | 検索時間（目標） | インデックス使用 |
| ---------------- | ---------------- | ---------------- |
| < 10,000件       | < 50ms           | 不要             |
| 10,000-100,000件 | < 100ms          | 推奨             |
| > 100,000件      | < 200ms          | 必須             |
