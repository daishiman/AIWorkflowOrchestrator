# ベクトル検索の基礎

## pgvectorとは

pgvectorはPostgreSQLのベクトル類似度検索拡張機能です。
機械学習のEmbedding（ベクトル表現）を格納し、
類似したベクトルを高速に検索できます。

## セットアップ

### 拡張のインストール

```sql
-- pgvector拡張を有効化
CREATE EXTENSION IF NOT EXISTS vector;

-- バージョン確認
SELECT extversion FROM pg_extension WHERE extname = 'vector';
```

### Neon/Supabaseでの有効化

**Neon**:
- ダッシュボードで自動的に利用可能
- SQLで `CREATE EXTENSION vector;`

**Supabase**:
- ダッシュボード → Extensions → vector を有効化
- または `CREATE EXTENSION vector;`

## 基本的なスキーマ

### ベクトルカラムの作成

```sql
-- 基本的なドキュメントテーブル
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),  -- OpenAI ada-002/3-small
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- チャンク化されたドキュメント
CREATE TABLE document_chunks (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id),
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  UNIQUE (document_id, chunk_index)
);
```

### Drizzleでのスキーマ定義

```typescript
import { pgTable, serial, text, vector, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').default({}),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at').defaultNow(),
});
```

## ベクトルの次元数

### 主要なEmbeddingモデル

| プロバイダー | モデル | 次元数 | 特徴 |
|-------------|--------|--------|------|
| OpenAI | text-embedding-3-small | 1536 | コスト効率、汎用 |
| OpenAI | text-embedding-3-large | 3072 | 高精度 |
| OpenAI | text-embedding-ada-002 | 1536 | レガシー |
| Cohere | embed-english-v3.0 | 1024 | 英語特化 |
| Cohere | embed-multilingual-v3.0 | 1024 | 多言語対応 |
| Voyage | voyage-2 | 1024 | 高性能 |
| local | all-MiniLM-L6-v2 | 384 | 軽量 |
| local | all-mpnet-base-v2 | 768 | バランス型 |

### 次元数の選択

```yaml
選択基準:
  精度重視: 3072次元（text-embedding-3-large）
  バランス: 1536次元（text-embedding-3-small）
  コスト重視: 384-768次元（オープンソースモデル）
  ストレージ制約: 低次元モデルを選択

注意:
  - 次元数が大きいほど精度は高いがストレージとメモリを消費
  - 同じテーブル内では次元数を統一
  - 次元数変更にはデータ再生成が必要
```

## 距離関数

### コサイン距離（推奨）

```sql
-- コサイン距離（<=>）
-- 値の範囲: 0（同一）〜 2（正反対）
SELECT id, content,
  embedding <=> '[0.1, 0.2, ...]'::vector AS distance
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 5;
```

**特徴**:
- 正規化されたベクトルに最適
- 方向の類似性を測定
- 長さの影響を受けない

### L2距離（ユークリッド距離）

```sql
-- L2距離（<->）
-- 値の範囲: 0〜∞
SELECT id, content,
  embedding <-> '[0.1, 0.2, ...]'::vector AS distance
FROM documents
ORDER BY embedding <-> '[0.1, 0.2, ...]'::vector
LIMIT 5;
```

**特徴**:
- 幾何学的な距離
- ベクトルの長さも考慮
- 画像特徴量などに適する

### 内積（ドット積）

```sql
-- 内積（<#>）
-- 値の範囲: -∞〜∞（大きいほど類似）
-- ORDER BY では負の値でソート
SELECT id, content,
  (embedding <#> '[0.1, 0.2, ...]'::vector) * -1 AS similarity
FROM documents
ORDER BY embedding <#> '[0.1, 0.2, ...]'::vector
LIMIT 5;
```

**特徴**:
- 最も高速
- 正規化されたベクトルではコサインと同等
- MIPSアルゴリズムに使用

## ベクトルの正規化

### 正規化の重要性

```typescript
// 正規化関数
function normalize(vector: number[]): number[] {
  const magnitude = Math.sqrt(
    vector.reduce((sum, v) => sum + v * v, 0)
  );
  return vector.map(v => v / magnitude);
}

// 使用例
const embedding = await getEmbedding(text);
const normalizedEmbedding = normalize(embedding);
```

### SQLでの正規化

```sql
-- ベクトルの長さを確認
SELECT id, vector_norm(embedding) as norm
FROM documents
LIMIT 10;

-- 正規化（推奨: 保存前にアプリケーション側で）
UPDATE documents
SET embedding = embedding / vector_norm(embedding)
WHERE vector_norm(embedding) != 1;
```

## 基本的なクエリ

### 類似度検索

```sql
-- Top K 類似ドキュメント
SELECT
  id,
  content,
  1 - (embedding <=> $1::vector) AS similarity
FROM documents
WHERE embedding IS NOT NULL
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

### フィルタ付き検索

```sql
-- メタデータでフィルタ
SELECT id, content
FROM documents
WHERE metadata->>'category' = 'technical'
  AND embedding IS NOT NULL
ORDER BY embedding <=> $1::vector
LIMIT 10;

-- 日付範囲でフィルタ
SELECT id, content
FROM documents
WHERE created_at > NOW() - INTERVAL '30 days'
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

### 閾値による検索

```sql
-- 類似度が閾値以上のもののみ
SELECT id, content,
  1 - (embedding <=> $1::vector) AS similarity
FROM documents
WHERE embedding <=> $1::vector < 0.3  -- 距離0.3未満 = 類似度0.7以上
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

## Drizzleでのクエリ

```typescript
import { sql } from 'drizzle-orm';
import { db } from './db';
import { documents } from './schema';

// 類似度検索
async function searchSimilar(queryEmbedding: number[], limit = 10) {
  const embedding = `[${queryEmbedding.join(',')}]`;

  return db
    .select({
      id: documents.id,
      content: documents.content,
      similarity: sql<number>`1 - (${documents.embedding} <=> ${embedding}::vector)`,
    })
    .from(documents)
    .orderBy(sql`${documents.embedding} <=> ${embedding}::vector`)
    .limit(limit);
}

// フィルタ付き検索
async function searchWithFilter(
  queryEmbedding: number[],
  category: string,
  limit = 10
) {
  const embedding = `[${queryEmbedding.join(',')}]`;

  return db
    .select()
    .from(documents)
    .where(sql`${documents.metadata}->>'category' = ${category}`)
    .orderBy(sql`${documents.embedding} <=> ${embedding}::vector`)
    .limit(limit);
}
```

## チェックリスト

### セットアップ時
- [ ] pgvector拡張がインストールされているか？
- [ ] 適切な次元数を選択したか？
- [ ] ベクトルカラムが作成されているか？

### データ投入時
- [ ] Embeddingを正規化しているか？
- [ ] 次元数が一致しているか？
- [ ] NULL値の処理を考慮しているか？

### クエリ時
- [ ] 適切な距離関数を選択しているか？
- [ ] インデックスを作成しているか？
- [ ] フィルタを適切に使用しているか？
