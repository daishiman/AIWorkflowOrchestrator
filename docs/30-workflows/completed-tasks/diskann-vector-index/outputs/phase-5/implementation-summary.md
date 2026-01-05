# Phase 5: 実装サマリー

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| Phase    | 5          |
| 完了日   | 2026-01-04 |
| テスト数 | 53         |
| 状態     | Green      |

---

## 実装内容

### 1. embeddingsテーブルスキーマ

**ファイル**: `packages/shared/src/db/schema/embeddings.ts`

```typescript
export const embeddings = sqliteTable(
  "embeddings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    chunkId: text("chunk_id")
      .notNull()
      .references(() => chunks.id, { onDelete: "cascade" }),
    vector: blob("vector", { mode: "buffer" }).notNull(),
    modelId: text("model_id").notNull(),
    dimensions: integer("dimensions").notNull(),
    normalizedMagnitude: real("normalized_magnitude").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    chunkIdIdx: uniqueIndex("embeddings_chunk_id_idx").on(table.chunkId),
    modelIdIdx: index("embeddings_model_id_idx").on(table.modelId),
  }),
);
```

**型エクスポート**:

- `Embedding` - SELECT型
- `NewEmbedding` - INSERT型

---

### 2. ベクトルインデックス管理

**ファイル**: `packages/shared/src/db/schema/vector-index.ts`

**型定義**:

- `VectorIndexConfig` - インデックス設定
- `VectorIndexStats` - 統計情報

**関数**:

| 関数                  | 説明               |
| --------------------- | ------------------ |
| `createVectorIndex`   | インデックス作成   |
| `dropVectorIndex`     | インデックス削除   |
| `rebuildVectorIndex`  | インデックス再構築 |
| `getVectorIndexStats` | 統計情報取得       |

**プリセット設定**:

- `vectorIndexConfigs.openai_small` (1536次元)
- `vectorIndexConfigs.openai_large` (3072次元)
- `vectorIndexConfigs.cohere_multilingual` (1024次元)

---

### 3. ベクトル検索クエリ

**ファイル**: `packages/shared/src/db/queries/vector-search.ts`

**型定義**:

- `VectorSearchResult` - 検索結果
- `VectorSearchOptions` - 検索オプション
- `EmbeddingInsertItem` - 挿入データ

**データ変換関数**:

| 関数                 | 説明                  |
| -------------------- | --------------------- |
| `vectorToBlob`       | Float32Array → Buffer |
| `blobToVector`       | Buffer → Float32Array |
| `normalizeVector`    | ベクトル正規化        |
| `calculateMagnitude` | マグニチュード計算    |
| `validateVector`     | ベクトル検証          |

**検索関数**:

| 関数                | メトリクス       |
| ------------------- | ---------------- |
| `searchByVector`    | コサイン類似度   |
| `searchByVectorL2`  | ユークリッド距離 |
| `searchByVectorDot` | 内積             |

**挿入関数**:

| 関数                    | 説明       |
| ----------------------- | ---------- |
| `insertEmbedding`       | 単一挿入   |
| `insertEmbeddingsBatch` | バッチ挿入 |

**削除関数**:

| 関数                       | 説明               |
| -------------------------- | ------------------ |
| `deleteEmbeddingByChunkId` | チャンクID指定削除 |
| `deleteEmbeddingsByFileId` | ファイルID指定削除 |

**ユーティリティ関数**:

| 関数                       | 説明               |
| -------------------------- | ------------------ |
| `getEmbeddingByChunkId`    | チャンクID指定取得 |
| `countEmbeddingsByModelId` | モデル別カウント   |

---

### 4. リレーション定義

**ファイル**: `packages/shared/src/db/schema/relations.ts`

**追加リレーション**:

```typescript
// chunks → embeddings (1:1)
embedding: one(embeddings, {
  fields: [chunks.id],
  references: [embeddings.chunkId],
});

// embeddings → chunks (1:1)
chunk: one(chunks, {
  fields: [embeddings.chunkId],
  references: [chunks.id],
});
```

---

### 5. マイグレーションSQL

**ファイル**: `packages/shared/drizzle/migrations/0004_create_embeddings_table.sql`

**内容**:

- embeddingsテーブル作成
- chunk_id ユニークインデックス
- model_id インデックス
- DiskANNベクトルインデックス（1536次元、コサイン類似度）

---

## テスト結果

```
 ✓ src/db/schema/__tests__/embeddings.test.ts (53 tests) 10ms
```

### テストカバレッジ

| カテゴリ             | テスト数 |
| -------------------- | -------- |
| スキーマ             | 14       |
| ベクトルインデックス | 9        |
| データ変換           | 15       |
| 検索関数             | 6        |
| 挿入関数             | 4        |
| ユーティリティ       | 5        |
| **合計**             | **53**   |

---

## エクスポートパス

```typescript
// スキーマ
import { embeddings, Embedding, NewEmbedding } from "@repo/shared/db";

// ベクトルインデックス
import {
  VectorIndexConfig,
  VectorIndexStats,
  defaultVectorIndexConfig,
  vectorIndexConfigs,
  createVectorIndex,
  dropVectorIndex,
  rebuildVectorIndex,
  getVectorIndexStats,
} from "@repo/shared/db";

// ベクトル検索
import {
  VectorSearchResult,
  VectorSearchOptions,
  EmbeddingInsertItem,
  vectorToBlob,
  blobToVector,
  normalizeVector,
  calculateMagnitude,
  validateVector,
  searchByVector,
  searchByVectorL2,
  searchByVectorDot,
  insertEmbedding,
  insertEmbeddingsBatch,
  deleteEmbeddingByChunkId,
  deleteEmbeddingsByFileId,
  getEmbeddingByChunkId,
  countEmbeddingsByModelId,
} from "@repo/shared/db";
```

---

## 次のフェーズ

Phase 6: リファクタリング（`phase-6-refactoring.md`）
