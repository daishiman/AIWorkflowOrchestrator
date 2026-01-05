# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 2                    |
| Phase名    | 設計                 |
| 前提Phase  | Phase 1              |
| 後続Phase  | Phase 3              |
| ステータス | 完了                 |
| 作成日     | 2026-01-04           |
| 完了日     | 2026-01-04           |
| 機能名     | diskann-vector-index |

---

## 目的

embeddingsテーブル、ベクトルインデックス、ベクトル検索クエリの詳細設計を行う。

## 背景

Phase 1で定義した要件に基づき、Drizzle ORMを使用したスキーマ設計とlibSQLベクトル検索APIの設計を行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: schema-def

**パス**: `.claude/skills/schema-def/SKILL.md`

**Trigger条件**: データベーススキーマの設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- embeddingsテーブルスキーマ設計
- ベクトルインデックス設計

---

### スキル2: api-documentation-best-practices

**パス**: `.claude/skills/api-documentation-best-practices/SKILL.md`

**Trigger条件**: API設計・ドキュメントが必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- ベクトル検索API仕様

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 設計前に必ず以下のシステム仕様を確認し、既存アーキテクチャとの整合性を確保してください。

| 参照資料                   | パス                                                                           | 内容                           |
| -------------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| データベースアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/database-architecture.md`   | DB設計方針・テーブル構成       |
| データベース実装           | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle ORM実装パターン        |
| RAGアーキテクチャ          | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`        | RAGシステム全体設計            |
| RAGインターフェース        | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`          | 埋め込み・検索インターフェース |

### Phase成果物・コード

| 参照資料          | パス                                         | 内容                     |
| ----------------- | -------------------------------------------- | ------------------------ |
| Phase 1 成果物    | `outputs/phase-1/`                           | 要件定義書・受け入れ基準 |
| chunksスキーマ    | `packages/shared/src/db/schema/chunks.ts`    | 参照元テーブル           |
| relationsスキーマ | `packages/shared/src/db/schema/relations.ts` | 既存リレーション         |

---

## 成果物

| 成果物             | パス                                     | 内容                       |
| ------------------ | ---------------------------------------- | -------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | システムアーキテクチャ     |
| DB設計             | `outputs/phase-2/database-schema.md`     | embeddingsテーブル詳細設計 |
| API仕様            | `outputs/phase-2/api-specification.md`   | ベクトル検索API仕様        |

---

## 完了条件

- [x] embeddingsテーブルスキーマが設計されている
  - 全フィールド定義
  - インデックス定義
  - 外部キー制約
- [x] ベクトルインデックス設計が完了している
  - VectorIndexConfig インターフェース
  - デフォルト設定値
- [x] ベクトル検索API設計が完了している
  - VectorSearchResult インターフェース
  - VectorSearchOptions インターフェース
  - 各検索関数シグネチャ
- [x] Float32Array変換関数設計が完了している
- [x] マイグレーションSQL設計が完了している
- [x] リレーション設計が完了している

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## 設計仕様（参考）

### embeddingsテーブル設計

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

### ベクトルインデックス設計

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
  dimensions: 1536,
  metric: "cosine",
  maxElements: 1000000,
  efConstruction: 200,
  efSearch: 100,
};
```

### ベクトル検索API設計

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

export const vectorToBlob = (vector: Float32Array): Buffer;
export const blobToVector = (blob: Buffer): Float32Array;
export const searchByVector = async (db, queryVector, options): Promise<VectorSearchResult[]>;
export const searchByVectorL2 = async (db, queryVector, options): Promise<VectorSearchResult[]>;
export const searchByVectorDot = async (db, queryVector, options): Promise<VectorSearchResult[]>;
export const insertEmbeddingsBatch = async (db, items): Promise<void>;
```

---

## スキルフィードバック記録

Phase完了後、使用したスキルへのフィードバックを記録してください:

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill schema-def --result {{success|failure|partial}} --phase 2

node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill api-documentation-best-practices --result {{success|failure|partial}} --phase 2
```

### 記録内容

| スキル                           | 結果    | 備考                                                                                      |
| -------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| schema-def                       | success | embeddings テーブル・VectorIndexConfig・マイグレーションSQL・リレーション設計を完了       |
| api-documentation-best-practices | success | VectorSearchResult/Options型・検索関数・変換関数・バッチ挿入APIを詳細設計、エラー処理含む |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/diskann-vector-index/phase-3-design-review.md`
