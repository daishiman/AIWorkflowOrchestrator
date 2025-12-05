---
name: vector-search-alternatives
description: |
  SQLiteベースプロジェクト向けのベクトル検索実装の代替戦略スキル。
  pgvectorの代わりに、外部ベクトルDB、SQLite VSS拡張、
  アプリケーションレベル検索など複数のアプローチを提供します。

  ⚠️ 注意: このスキルは元々PostgreSQL pgvector向けでしたが、
  SQLiteベースプロジェクト向けに再構成されています。

  📚 代替アプローチ:
  1. **外部ベクトルデータベース**: Pinecone, Weaviate, Qdrant, Milvus
  2. **SQLite VSS拡張**: 実験的なSQLiteベクトル検索サポート
  3. **アプリケーションレベル**: メモリ内類似度計算
  4. **Turso拡張**: Turso特有のベクトル検索機能（将来対応）
  5. **ハイブリッドアプローチ**: SQLite + 外部ベクトルDB

  専門分野:
  - ベクトル検索アーキテクチャ設計
  - 外部ベクトルDBとSQLiteの統合
  - RAGシステムの実装戦略
  - Embedding管理とキャッシング
  - パフォーマンストレードオフ分析

  使用タイミング:
  - SQLiteプロジェクトでベクトル検索を実装する時
  - RAGシステムを構築する時
  - ベクトルDB選定を行う時
  - セマンティック検索を追加する時

  Use proactively when implementing vector search in SQLite projects,
  building RAG systems, or selecting vector database solutions.
version: 2.0.0
---

# Vector Search Alternatives for SQLite Projects

## ⚠️ 重要な変更

このスキルは元々PostgreSQL pgvector向けに作成されましたが、
本プロジェクトはSQLite（Turso）を使用しているため、
代替アプローチに焦点を当てた内容に再構成されています。

## 概要

SQLiteネイティブではベクトル検索をサポートしていないため、
複数の代替アプローチを検討する必要があります。
このスキルは、各アプローチの特徴、実装方法、トレードオフを提供します。

**主要な価値**:

- SQLiteプロジェクトでのベクトル検索実装ガイダンス
- 複数の代替ソリューションの比較と選択基準
- RAGシステム構築のアーキテクチャパターン
- パフォーマンスとコストのトレードオフ分析

**対象ユーザー**:

- `@dba-mgr`エージェント
- バックエンド開発者
- AIエンジニア
- アーキテクト

## 代替アプローチ一覧

### 1. 外部ベクトルデータベース（推奨）

**概要**: 専用のベクトルデータベースをSQLiteと併用する

**選択肢**:

| サービス     | 特徴                               | 料金モデル      | 推奨用途                       |
| ------------ | ---------------------------------- | --------------- | ------------------------------ |
| **Pinecone** | フルマネージド、高速、スケーラブル | 使用量課金      | プロダクション、高トラフィック |
| **Weaviate** | OSS、セルフホスト可、GraphQL       | 無料/マネージド | 柔軟性重視、コスト削減         |
| **Qdrant**   | OSS、高性能、Rust実装              | 無料/マネージド | パフォーマンス重視             |
| **Milvus**   | OSS、大規模対応                    | 無料/マネージド | 大規模データセット             |

**実装例（Pinecone）**:

```typescript
import { Pinecone } from "@pinecone-database/pinecone";

// 初期化
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// インデックス取得
const index = pinecone.index("my-index");

// Embedding追加（SQLiteのIDと関連付け）
await index.upsert([
  {
    id: "doc-1", // SQLiteのドキュメントID
    values: embedding, // 1536次元のベクトル
    metadata: { content: "text", userId: 123 },
  },
]);

// 類似検索
const results = await index.query({
  vector: queryEmbedding,
  topK: 10,
  includeMetadata: true,
});

// SQLiteから詳細情報を取得
const docIds = results.matches.map((m) => m.id);
const docs = await db.query.documents.findMany({
  where: inArray(documents.id, docIds),
});
```

**メリット**:

- 高速で正確なベクトル検索
- インデックス管理が自動
- スケーラビリティが高い
- 豊富な機能（フィルタリング、名前空間など）

**デメリット**:

- 追加コスト発生
- 外部依存が増加
- データ同期が必要
- レイテンシの可能性

### 2. SQLite VSS拡張（実験的）

**概要**: SQLite用のベクトル類似度検索拡張機能

**リポジトリ**: https://github.com/asg017/sqlite-vss

**実装例**:

```sql
-- 拡張のロード
.load ./vss0

-- 仮想テーブル作成
CREATE VIRTUAL TABLE documents_vss USING vss0(
  embedding(1536)  -- OpenAI embeddingの次元数
);

-- Embeddingの追加
INSERT INTO documents_vss(rowid, embedding)
VALUES (1, vector_from_blob(?));

-- 類似検索
SELECT
  rowid,
  distance
FROM documents_vss
WHERE vss_search(
  embedding,
  vector_from_blob(?)
)
LIMIT 10;
```

**メリット**:

- SQLite内で完結
- 外部依存なし
- 低コスト

**デメリット**:

- 実験的な機能（本番環境非推奨）
- Tursoでサポートされていない
- パフォーマンスが限定的
- ドキュメント不足

### 3. アプリケーションレベル検索

**概要**: メモリ内でコサイン類似度を計算

**実装例**:

```typescript
// Embeddingをメモリにロード（起動時）
const embeddingsCache = await db.query.documents.findMany({
  columns: {
    id: true,
    embedding: true,
  },
});

// コサイン類似度計算
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// 類似検索
function findSimilar(queryEmbedding: number[], topK: number = 10) {
  const similarities = embeddingsCache.map((doc) => ({
    id: doc.id,
    similarity: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}
```

**最適化版（大規模データ対応）**:

```typescript
import { Worker } from "worker_threads";

// ワーカープールで並列計算
class VectorSearchWorkerPool {
  private workers: Worker[] = [];

  constructor(poolSize: number = 4) {
    for (let i = 0; i < poolSize; i++) {
      this.workers.push(new Worker("./vector-search-worker.js"));
    }
  }

  async search(
    queryEmbedding: number[],
    embeddings: Array<{ id: string; embedding: number[] }>,
    topK: number,
  ): Promise<Array<{ id: string; similarity: number }>> {
    // データを分割して各ワーカーに配分
    const chunkSize = Math.ceil(embeddings.length / this.workers.length);
    const chunks = [];
    for (let i = 0; i < embeddings.length; i += chunkSize) {
      chunks.push(embeddings.slice(i, i + chunkSize));
    }

    // 並列計算
    const results = await Promise.all(
      chunks.map((chunk, i) =>
        this.workers[i].postMessage({ queryEmbedding, chunk }),
      ),
    );

    // 結果をマージしてソート
    return results
      .flat()
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
}
```

**メリット**:

- 完全なコントロール
- 外部依存なし
- カスタマイズ可能

**デメリット**:

- メモリ制約（大規模データで問題）
- パフォーマンスが低い
- スケーラビリティに課題
- 自前実装のメンテナンスコスト

### 4. ハイブリッドアプローチ（推奨）

**概要**: SQLite + 外部ベクトルDB + キャッシング

**アーキテクチャ**:

```
┌─────────────────────────────────────────────┐
│          Application Layer                   │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Redis    │  │ Pinecone │  │ SQLite   │  │
│  │ Cache    │←→│ Vector   │←→│ Metadata │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

**実装例**:

```typescript
class HybridVectorSearch {
  constructor(
    private db: DrizzleDB,
    private pinecone: PineconeClient,
    private redis: RedisClient,
  ) {}

  async search(query: string, topK: number = 10) {
    // 1. キャッシュチェック
    const cacheKey = `search:${hashQuery(query)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 2. Embedding生成
    const embedding = await generateEmbedding(query);

    // 3. Pineconeで類似検索
    const vectorResults = await this.pinecone.query({
      vector: embedding,
      topK: topK * 2, // 余分に取得してフィルタリング
    });

    // 4. SQLiteからメタデータ取得
    const docIds = vectorResults.matches.map((m) => m.id);
    const docs = await this.db.query.documents.findMany({
      where: inArray(documents.id, docIds),
      with: {
        user: true, // リレーション
        tags: true,
      },
    });

    // 5. スコアでソートして返却
    const results = docs
      .map((doc) => {
        const vectorScore = vectorResults.matches.find(
          (m) => m.id === doc.id,
        )?.score;
        return { ...doc, score: vectorScore };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    // 6. キャッシュに保存（5分）
    await this.redis.setex(cacheKey, 300, JSON.stringify(results));

    return results;
  }

  async upsert(document: Document) {
    // 1. SQLiteに保存
    const [inserted] = await this.db
      .insert(documents)
      .values(document)
      .returning();

    // 2. Embedding生成
    const embedding = await generateEmbedding(document.content);

    // 3. Pineconeに追加
    await this.pinecone.upsert([
      {
        id: inserted.id,
        values: embedding,
        metadata: {
          userId: document.userId,
          createdAt: inserted.createdAt.toISOString(),
        },
      },
    ]);

    // 4. キャッシュ無効化
    await this.redis.del(`search:*`);

    return inserted;
  }
}
```

**メリット**:

- 最高のパフォーマンス
- スケーラブル
- SQLiteの強みを活かせる
- キャッシングで低レイテンシ

**デメリット**:

- 複雑性が高い
- コストが高い
- データ同期の管理

## 推奨アーキテクチャ

### 小規模プロジェクト（< 10,000ドキュメント）

```
SQLite (メタデータ) + アプリケーションレベル検索
```

- コスト: 最低
- 実装: シンプル
- パフォーマンス: 許容範囲

### 中規模プロジェクト（10,000 - 100,000ドキュメント）

```
SQLite (メタデータ) + Pinecone (ベクトル) + Redis (キャッシュ)
```

- コスト: 中程度
- 実装: 複雑
- パフォーマンス: 高速

### 大規模プロジェクト（> 100,000ドキュメント）

```
SQLite (メタデータ) + Qdrant/Weaviate (ベクトル) + Redis (キャッシュ) + CDN
```

- コスト: 高い
- 実装: 高度
- パフォーマンス: 最高速

## RAG実装パターン

### パターン1: シンプルRAG

```typescript
async function simpleRAG(question: string) {
  // 1. 質問をEmbedding化
  const queryEmbedding = await generateEmbedding(question);

  // 2. 類似ドキュメント検索
  const relevantDocs = await vectorSearch.search(queryEmbedding, 5);

  // 3. コンテキストを構築
  const context = relevantDocs.map((doc) => doc.content).join("\n\n");

  // 4. LLMに質問
  const response = await llm.chat({
    messages: [
      {
        role: "system",
        content: `以下のコンテキストを使用して質問に答えてください：\n\n${context}`,
      },
      { role: "user", content: question },
    ],
  });

  return response;
}
```

### パターン2: ハイブリッドRAG（ベクトル + キーワード）

```typescript
async function hybridRAG(question: string) {
  // 1. ベクトル検索
  const vectorResults = await vectorSearch.search(question, 10);

  // 2. SQLiteのFTS5でキーワード検索
  const keywordResults = await db.query.documents.findMany({
    where: sql`${documents.content} MATCH ${question}`,
    limit: 10,
  });

  // 3. 結果をマージ（RRF: Reciprocal Rank Fusion）
  const merged = mergeResults(vectorResults, keywordResults);

  // 4. LLMに質問
  const context = merged
    .slice(0, 5)
    .map((doc) => doc.content)
    .join("\n\n");
  return await llm.chat({ context, question });
}

function mergeResults(
  vectorResults: Document[],
  keywordResults: Document[],
): Document[] {
  const scores = new Map<string, number>();

  // RRFスコア計算
  vectorResults.forEach((doc, rank) => {
    scores.set(doc.id, (scores.get(doc.id) || 0) + 1 / (rank + 60));
  });

  keywordResults.forEach((doc, rank) => {
    scores.set(doc.id, (scores.get(doc.id) || 0) + 1 / (rank + 60));
  });

  // スコアでソート
  return Array.from(scores.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => vectorResults.find((d) => d.id === id)!)
    .filter(Boolean);
}
```

## ベストプラクティス

### すべきこと

1. **Embeddingをキャッシュする**

```typescript
const embeddingCache = new Map<string, number[]>();

async function getCachedEmbedding(text: string): Promise<number[]> {
  const key = hashText(text);
  if (embeddingCache.has(key)) {
    return embeddingCache.get(key)!;
  }

  const embedding = await generateEmbedding(text);
  embeddingCache.set(key, embedding);
  return embedding;
}
```

2. **バッチ処理を使う**

```typescript
// 一度に複数のEmbeddingを生成
const embeddings = await openai.embeddings.create({
  input: documents.map((d) => d.content),
  model: "text-embedding-3-small",
});
```

3. **データ同期を自動化する**

```typescript
// Drizzle ORM フック
db.$extends({
  query: {
    documents: {
      async create({ args, query }) {
        const result = await query(args);
        // Pineconeに自動同期
        await syncToPinecone(result);
        return result;
      },
    },
  },
});
```

### 避けるべきこと

1. **同期的なEmbedding生成** - バックグラウンドジョブを使用
2. **大量データのメモリロード** - ページネーションとストリーミング
3. **キャッシュなし** - RedisやCDNを活用

## トラブルシューティング

### 問題1: 検索が遅い

**原因**: アプリケーションレベル検索でのフルスキャン

**解決策**:

- Pineconeなど外部ベクトルDBに移行
- Worker Threadsで並列化
- Redisでキャッシング

### 問題2: コストが高い

**原因**: Embedding生成が頻繁

**解決策**:

- Embeddingをキャッシュ
- バッチ処理でAPI呼び出し削減
- オープンソースモデル検討（sentence-transformers）

### 問題3: データ同期ずれ

**原因**: SQLiteとベクトルDBの不整合

**解決策**:

- トランザクション的な更新
- 定期的な同期ジョブ
- イベント駆動アーキテクチャ

## 関連スキル

- **database-design** - SQLiteスキーマ設計
- **api-integration** - 外部ベクトルDB統合
- **caching-strategies** - キャッシング最適化

## 変更履歴

| バージョン | 日付       | 変更内容                          |
| ---------- | ---------- | --------------------------------- |
| 2.0.0      | 2025-12-04 | SQLite代替案に再構成              |
| 1.0.0      | 2025-11-27 | 初版作成（pgvector向け - 非推奨） |

## 参考文献

- **Pinecone**: https://www.pinecone.io/
- **Weaviate**: https://weaviate.io/
- **Qdrant**: https://qdrant.tech/
- **SQLite VSS**: https://github.com/asg017/sqlite-vss
- **OpenAI Embeddings**: https://platform.openai.com/docs/guides/embeddings
