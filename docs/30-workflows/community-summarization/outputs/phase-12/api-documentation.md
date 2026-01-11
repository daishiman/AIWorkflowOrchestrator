# コミュニティ要約 API ドキュメント

## 概要

`CommunitySummarizer` は、Leidenアルゴリズムで検出されたコミュニティに対してLLMを使用して要約を生成するサービスです。

## インポート

```typescript
import { CommunitySummarizer } from "@repo/shared/services/graph/community-summarizer";
import type {
  ICommunitySummarizer,
  CommunitySummarizationOptions,
  CommunitySummary,
} from "@repo/shared/services/graph";
```

## コンストラクタ

```typescript
const summarizer = new CommunitySummarizer(
  llmProvider: ILLMProvider,
  embeddingProvider: IEmbeddingProvider,
  graphStore: IKnowledgeGraphStore,
  communityRepository: ICommunityRepository
);
```

### パラメータ

| パラメータ            | 型                     | 説明                     |
| --------------------- | ---------------------- | ------------------------ |
| `llmProvider`         | `ILLMProvider`         | LLM生成プロバイダー      |
| `embeddingProvider`   | `IEmbeddingProvider`   | 埋め込み生成プロバイダー |
| `graphStore`          | `IKnowledgeGraphStore` | ナレッジグラフストア     |
| `communityRepository` | `ICommunityRepository` | コミュニティリポジトリ   |

---

## メソッド

### summarize()

単一コミュニティの要約を生成します。

```typescript
async summarize(
  community: Community,
  entities: readonly StoredEntity[],
  relations: readonly StoredRelation[],
  options?: CommunitySummarizationOptions
): Promise<Result<CommunitySummary, Error>>
```

#### パラメータ

| パラメータ  | 型                               | 説明                       |
| ----------- | -------------------------------- | -------------------------- |
| `community` | `Community`                      | 対象コミュニティ           |
| `entities`  | `readonly StoredEntity[]`        | コミュニティ内エンティティ |
| `relations` | `readonly StoredRelation[]`      | コミュニティ内関係         |
| `options`   | `CommunitySummarizationOptions?` | オプション設定             |

#### 戻り値

`Result<CommunitySummary, Error>` - 成功時は要約、失敗時はエラー

#### 使用例

```typescript
const result = await summarizer.summarize(community, entities, relations, {
  summaryStyle: "concise",
});

if (result.success) {
  console.log(result.data.summary);
}
```

---

### summarizeAll()

全コミュニティの要約を階層順（子→親）で生成します。

```typescript
async summarizeAll(
  communityStructure: CommunityStructure,
  options?: CommunitySummarizationOptions
): Promise<Result<CommunitySummarizationResult, Error>>
```

#### パラメータ

| パラメータ           | 型                               | 説明             |
| -------------------- | -------------------------------- | ---------------- |
| `communityStructure` | `CommunityStructure`             | コミュニティ構造 |
| `options`            | `CommunitySummarizationOptions?` | オプション設定   |

#### 戻り値

`Result<CommunitySummarizationResult, Error>`

```typescript
interface CommunitySummarizationResult {
  summaries: CommunitySummary[];
  failedCommunities: CommunityId[];
  totalTokensUsed: number;
  processingTimeMs: number;
}
```

---

### searchSummaries()

コミュニティ要約をセマンティック検索します。

```typescript
async searchSummaries(
  query: string,
  options?: CommunitySummarySearchOptions
): Promise<Result<CommunitySummary[], Error>>
```

#### パラメータ

| パラメータ | 型                               | 説明           |
| ---------- | -------------------------------- | -------------- |
| `query`    | `string`                         | 検索クエリ     |
| `options`  | `CommunitySummarySearchOptions?` | 検索オプション |

#### 検索オプション

```typescript
interface CommunitySummarySearchOptions {
  limit?: number; // 最大結果数（デフォルト: 10）
  level?: number; // 特定レベルのみ検索
}
```

---

### updateSummary()

既存コミュニティの要約を再生成します。

```typescript
async updateSummary(
  communityId: CommunityId
): Promise<Result<CommunitySummary, Error>>
```

---

## オプション

### CommunitySummarizationOptions

```typescript
interface CommunitySummarizationOptions {
  maxSummaryTokens?: number; // 要約の最大トークン数（デフォルト: 200）
  maxKeywords?: number; // 最大キーワード数（デフォルト: 10）
  summaryStyle?: "concise" | "detailed" | "technical"; // スタイル（デフォルト: "concise"）
  generateEmbedding?: boolean; // 埋め込み生成（デフォルト: true）
  useChildSummaries?: boolean; // 子コミュニティ要約使用（デフォルト: true）
  maxConcurrency?: number; // 並列処理数（デフォルト: 5）
}
```

---

## 型定義

### CommunitySummary

```typescript
interface CommunitySummary {
  communityId: CommunityId;
  level: number;
  summary: string;
  keywords: string[];
  mainEntities: string[];
  mainRelations: string[];
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  tokenCount: number;
  embedding?: number[];
  createdAt: Date;
}
```

---

## エラーハンドリング

### エラーコード

| コード                  | 説明                     |
| ----------------------- | ------------------------ |
| `LLM_GENERATION_FAILED` | LLM生成失敗              |
| `JSON_PARSE_FAILED`     | JSONパース失敗           |
| `EMBEDDING_FAILED`      | 埋め込み生成失敗         |
| `DB_SAVE_FAILED`        | DB保存失敗               |
| `COMMUNITY_NOT_FOUND`   | コミュニティが存在しない |

### 使用例

```typescript
const result = await summarizer.summarize(community, entities, relations);

if (!result.success) {
  if (result.error instanceof CommunitySummarizationError) {
    console.error(`Error code: ${result.error.code}`);
  }
}
```
