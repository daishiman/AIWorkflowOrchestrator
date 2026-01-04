# RAG実装パターン

## RAGアーキテクチャ

### 基本フロー

```
ユーザークエリ
    │
    ▼
┌──────────────┐
│ Embedding    │  ← クエリをベクトル化
│ Generation   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Vector       │  ← 類似ドキュメント検索
│ Search       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Context      │  ← 関連コンテキストを構築
│ Assembly     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ LLM          │  ← コンテキスト付きで生成
│ Generation   │
└──────┬───────┘
       │
       ▼
    回答
```

## ドキュメント処理

### チャンキング戦略

```typescript
interface ChunkConfig {
  maxTokens: number; // チャンクの最大トークン数
  overlap: number; // オーバーラップトークン数
  separator: string; // 分割セパレータ
}

const configs = {
  // 短いドキュメント向け
  short: { maxTokens: 256, overlap: 32, separator: "\n\n" },

  // 一般的なドキュメント向け
  standard: { maxTokens: 512, overlap: 64, separator: "\n\n" },

  // 長いドキュメント向け
  long: { maxTokens: 1024, overlap: 128, separator: "\n\n" },
};

function chunkDocument(text: string, config: ChunkConfig): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(config.separator);

  let currentChunk = "";
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);

    if (currentTokens + paragraphTokens > config.maxTokens) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // オーバーラップを含める
      currentChunk = getOverlap(currentChunk, config.overlap) + paragraph;
      currentTokens = estimateTokens(currentChunk);
    } else {
      currentChunk += config.separator + paragraph;
      currentTokens += paragraphTokens;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
```

### Embedding生成

```typescript
import { OpenAI } from "openai";

const openai = new OpenAI();

// 単一テキストのEmbedding
async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// バッチEmbedding（推奨）
async function getEmbeddings(texts: string[]): Promise<number[][]> {
  // APIの制限に応じてバッチサイズを調整
  const BATCH_SIZE = 100;
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch,
    });
    embeddings.push(...response.data.map((d) => d.embedding));
  }

  return embeddings;
}
```

## 検索パターン

### 基本的な類似度検索

```typescript
import { sql } from "drizzle-orm";

async function search(query: string, limit = 5) {
  const queryEmbedding = await getEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const results = await db
    .select({
      id: documents.id,
      content: documents.content,
      similarity: sql<number>`1 - (${documents.embedding} <=> ${embeddingStr}::vector)`,
    })
    .from(documents)
    .orderBy(sql`${documents.embedding} <=> ${embeddingStr}::vector`)
    .limit(limit);

  return results;
}
```

### ハイブリッド検索（ベクトル + キーワード）

```typescript
async function hybridSearch(query: string, limit = 5) {
  const queryEmbedding = await getEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  // ベクトル類似度 + 全文検索スコアの組み合わせ
  const results = await db.execute(sql`
    SELECT
      id,
      content,
      (1 - (embedding <=> ${embeddingStr}::vector)) * 0.7 +
      ts_rank(to_tsvector('english', content), plainto_tsquery('english', ${query})) * 0.3
      AS combined_score
    FROM documents
    WHERE
      embedding <=> ${embeddingStr}::vector < 0.5
      OR to_tsvector('english', content) @@ plainto_tsquery('english', ${query})
    ORDER BY combined_score DESC
    LIMIT ${limit}
  `);

  return results;
}
```

### メタデータフィルタリング

```typescript
interface SearchOptions {
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
}

async function searchWithFilters(
  query: string,
  options: SearchOptions,
  limit = 5,
) {
  const queryEmbedding = await getEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  let sqlQuery = sql`
    SELECT id, content,
      1 - (embedding <=> ${embeddingStr}::vector) AS similarity
    FROM documents
    WHERE embedding IS NOT NULL
  `;

  if (options.category) {
    sqlQuery = sql`${sqlQuery} AND metadata->>'category' = ${options.category}`;
  }

  if (options.dateFrom) {
    sqlQuery = sql`${sqlQuery} AND created_at >= ${options.dateFrom}`;
  }

  if (options.dateTo) {
    sqlQuery = sql`${sqlQuery} AND created_at <= ${options.dateTo}`;
  }

  if (options.tags?.length) {
    sqlQuery = sql`${sqlQuery} AND metadata->'tags' ?| ${options.tags}`;
  }

  sqlQuery = sql`${sqlQuery} ORDER BY embedding <=> ${embeddingStr}::vector LIMIT ${limit}`;

  return db.execute(sqlQuery);
}
```

## コンテキスト構築

### 基本的なコンテキスト組み立て

```typescript
function buildContext(results: SearchResult[]): string {
  return results
    .map((r, i) => `[Document ${i + 1}]\n${r.content}`)
    .join("\n\n---\n\n");
}

// プロンプトテンプレート
function buildPrompt(query: string, context: string): string {
  return `You are a helpful assistant. Answer the question based on the provided context.

Context:
${context}

Question: ${query}

Answer:`;
}
```

### リランキング

```typescript
// Cohere Rerankを使用した例
async function rerankResults(
  query: string,
  documents: string[],
  topN = 3,
): Promise<number[]> {
  const response = await cohere.rerank({
    model: "rerank-english-v2.0",
    query,
    documents,
    topN,
  });

  return response.results.map((r) => r.index);
}

// 使用例
async function searchWithRerank(query: string) {
  // 1. 多めに取得
  const initialResults = await search(query, 20);

  // 2. リランキング
  const rerankedIndices = await rerankResults(
    query,
    initialResults.map((r) => r.content),
    5,
  );

  // 3. リランク順に並べ替え
  return rerankedIndices.map((i) => initialResults[i]);
}
```

## LLM統合

### OpenAI Chat Completions

```typescript
async function generateAnswer(query: string, context: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant. Answer questions based on the provided context. If the answer cannot be found in the context, say so.",
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${query}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content || "";
}
```

### ストリーミング応答

```typescript
async function* streamAnswer(
  query: string,
  context: string,
): AsyncGenerator<string> {
  const stream = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: "Answer based on the context." },
      { role: "user", content: `Context:\n${context}\n\nQuestion: ${query}` },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
```

## 完全なRAGパイプライン

```typescript
interface RAGResult {
  answer: string;
  sources: Array<{ id: number; content: string; similarity: number }>;
}

async function ragQuery(query: string): Promise<RAGResult> {
  // 1. ベクトル検索
  const searchResults = await search(query, 5);

  // 2. コンテキスト構築
  const context = buildContext(searchResults);

  // 3. LLMで回答生成
  const answer = await generateAnswer(query, context);

  return {
    answer,
    sources: searchResults,
  };
}

// 使用例
const result = await ragQuery("What is the main feature of the product?");
console.log("Answer:", result.answer);
console.log(
  "Sources:",
  result.sources.map((s) => s.id),
);
```

## パフォーマンス最適化

### Embeddingキャッシュ

```typescript
// Redis等を使用したキャッシュ
import { Redis } from "ioredis";

const redis = new Redis();
const CACHE_TTL = 60 * 60 * 24; // 24時間

async function getCachedEmbedding(text: string): Promise<number[] | null> {
  const key = `embedding:${hashText(text)}`;
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

async function cacheEmbedding(
  text: string,
  embedding: number[],
): Promise<void> {
  const key = `embedding:${hashText(text)}`;
  await redis.setex(key, CACHE_TTL, JSON.stringify(embedding));
}

async function getEmbeddingWithCache(text: string): Promise<number[]> {
  const cached = await getCachedEmbedding(text);
  if (cached) return cached;

  const embedding = await getEmbedding(text);
  await cacheEmbedding(text, embedding);
  return embedding;
}
```

### バッチインジェスト

```typescript
async function ingestDocuments(
  documents: { content: string; metadata: any }[],
) {
  const BATCH_SIZE = 100;

  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);

    // Embeddingをバッチ生成
    const embeddings = await getEmbeddings(batch.map((d) => d.content));

    // DBにバッチ挿入
    await db.insert(documentsTable).values(
      batch.map((doc, j) => ({
        content: doc.content,
        metadata: doc.metadata,
        embedding: embeddings[j],
      })),
    );

    console.log(`Processed ${i + batch.length}/${documents.length}`);
  }
}
```

## チェックリスト

### RAG構築時

- [ ] チャンキング戦略を決めたか？
- [ ] Embeddingモデルを選択したか？
- [ ] インデックスを作成したか？
- [ ] 検索の精度をテストしたか？

### パフォーマンス最適化時

- [ ] Embeddingをキャッシュしているか？
- [ ] バッチ処理を使用しているか？
- [ ] 適切なインデックスパラメータか？
- [ ] レイテンシを測定したか？

### 品質改善時

- [ ] リランキングを検討したか？
- [ ] ハイブリッド検索を検討したか？
- [ ] フィルタリングは適切か？
- [ ] 回答の品質を評価しているか？
