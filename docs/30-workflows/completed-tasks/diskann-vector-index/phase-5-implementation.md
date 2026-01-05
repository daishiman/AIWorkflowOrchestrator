# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 5                    |
| Phase名    | 実装（TDD Green）    |
| 前提Phase  | Phase 4              |
| 後続Phase  | Phase 6              |
| ステータス | 完了                 |
| 作成日     | 2026-01-04           |
| 完了日     | 2026-01-04           |
| 機能名     | diskann-vector-index |

---

## 目的

TDDの「Green」フェーズとして、Phase 4で作成した失敗テストをパスさせる最小限の実装を行う。

## 背景

テスト駆動開発に従い、テストをパスさせることに集中し、リファクタリングはPhase 6で行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: tdd-principles

**パス**: `.claude/skills/tdd-principles/SKILL.md`

**Trigger条件**: TDDサイクルを実行する場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 実装コード（テストがパスする状態）

---

### スキル2: type-safety-patterns

**パス**: `.claude/skills/type-safety-patterns/SKILL.md`

**Trigger条件**: TypeScript型安全性が重要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行

**期待される成果物**:

- 型安全な実装

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装時に以下のシステム仕様との整合性を確認してください。

| 参照資料                   | パス                                                                           | 内容                           |
| -------------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| データベースアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/database-architecture.md`   | DB設計方針・テーブル構成       |
| データベース実装           | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle ORM実装パターン        |
| RAGアーキテクチャ          | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`        | RAGシステム全体設計            |
| RAGインターフェース        | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`          | 埋め込み・検索インターフェース |

### Phase成果物・コード

| 参照資料       | パス                                                         | 内容            |
| -------------- | ------------------------------------------------------------ | --------------- |
| Phase 2 成果物 | `outputs/phase-2/`                                           | 設計書・API仕様 |
| Phase 4 成果物 | `outputs/phase-4/`                                           | テスト仕様書    |
| テストコード   | `packages/shared/src/db/schema/__tests__/embeddings.test.ts` | 失敗するテスト  |

---

## 成果物

| 成果物               | パス                                                                 | 内容                             |
| -------------------- | -------------------------------------------------------------------- | -------------------------------- |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`                          | 実装内容のサマリー               |
| embeddingsスキーマ   | `packages/shared/src/db/schema/embeddings.ts`                        | テーブル定義（コード成果物）     |
| ベクトルインデックス | `packages/shared/src/db/schema/vector-index.ts`                      | インデックス管理（コード成果物） |
| ベクトル検索         | `packages/shared/src/db/queries/vector-search.ts`                    | 検索クエリ（コード成果物）       |
| リレーション         | `packages/shared/src/db/schema/relations.ts`                         | 更新（コード成果物）             |
| マイグレーション     | `packages/shared/src/db/migrations/0006_create_embeddings_table.sql` | SQL（コード成果物）              |

---

## 完了条件

- [x] embeddingsテーブルスキーマが実装されている
- [x] VectorIndexConfig/defaultVectorIndexConfigが実装されている
- [x] ベクトル検索関数が実装されている
  - searchByVector（コサイン類似度）
  - searchByVectorL2（ユークリッド距離）
  - searchByVectorDot（内積）
- [x] Float32Array変換関数が実装されている
  - vectorToBlob
  - blobToVector
- [x] バッチ挿入関数が実装されている
  - insertEmbeddingsBatch
- [x] マイグレーションSQLが作成されている
- [x] リレーションが更新されている
- [x] 全テストがパスする（Green状態）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run -- --grep "embeddings"
```

**確認項目**:

- [x] テストが成功することを確認（Green状態）

**実行結果**:

```
 ✓ src/db/schema/__tests__/embeddings.test.ts (53 tests) 10ms

 Test Files  62 passed (62)
      Tests  2625 passed | 6 todo (2631)
```

---

## 実装仕様（参考）

### embeddingsテーブル

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

### ベクトルインデックス

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

### ベクトル検索クエリ

```typescript
// packages/shared/src/db/queries/vector-search.ts
export const vectorToBlob = (vector: Float32Array): Buffer => {
  return Buffer.from(vector.buffer);
};

export const blobToVector = (blob: Buffer): Float32Array => {
  return new Float32Array(blob.buffer, blob.byteOffset, blob.length / 4);
};

export const searchByVector = async (
  db: LibSQLDatabase,
  queryVector: Float32Array,
  options: VectorSearchOptions = {},
): Promise<VectorSearchResult[]> => {
  // 実装
};
```

### マイグレーションSQL

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

CREATE INDEX IF NOT EXISTS embeddings_vector_idx
ON embeddings(vector)
USING vector(1536)
WITH (metric = 'cosine');
```

---

## スキルフィードバック記録

Phase完了後、使用したスキルへのフィードバックを記録してください:

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill tdd-principles --result {{success|failure|partial}} --phase 5

node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill type-safety-patterns --result {{success|failure|partial}} --phase 5
```

### 記録内容

| スキル               | 結果    | 備考                                                 |
| -------------------- | ------- | ---------------------------------------------------- |
| tdd-principles       | success | テストがすべてGreen状態に。TDDサイクルを正常に完了   |
| type-safety-patterns | success | 型安全な実装。LibSQLDatabase型、Float32Array型を活用 |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/diskann-vector-index/phase-6-refactoring.md`
