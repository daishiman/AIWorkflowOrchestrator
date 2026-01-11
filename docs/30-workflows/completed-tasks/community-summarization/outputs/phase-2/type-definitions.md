# 型定義書 - コミュニティ要約生成（CONV-08-03）

## メタ情報

| 項目     | 内容                 |
| -------- | -------------------- |
| タスクID | CONV-08-03           |
| タスク名 | コミュニティ要約生成 |
| 作成日   | 2026-01-11           |
| Phase    | 2（設計）            |

---

## 1. 新規型定義（packages/shared/src/services/graph/types.ts に追加）

### 1.1 CommunitySummary

コミュニティのLLM生成要約を表す型。

```typescript
/**
 * コミュニティのLLM生成要約
 *
 * @description
 * Leidenアルゴリズムで検出されたコミュニティに対してLLMで生成された要約。
 * グローバルクエリへの回答やセマンティック検索に使用される。
 */
export interface CommunitySummary {
  /**
   * コミュニティID（Branded Type）
   */
  communityId: CommunityId;

  /**
   * 階層レベル（0が最下層、数値が大きいほど上位）
   */
  level: number;

  /**
   * 要約文（LLM生成）
   * @example "このグループはプログラミング言語に関するエンティティで構成され..."
   */
  summary: string;

  /**
   * キーワード配列（検索用）
   * @example ["TypeScript", "JavaScript", "静的型付け"]
   */
  keywords: string[];

  /**
   * 主要エンティティ（最大5個）
   * @example ["TypeScript", "JavaScript", "Node.js"]
   */
  mainEntities: string[];

  /**
   * 主要関係（最大5個）
   * @example ["TypeScriptはJavaScriptのスーパーセット"]
   */
  mainRelations: string[];

  /**
   * 感情/傾向分析（オプション）
   */
  sentiment?: "positive" | "negative" | "neutral";

  /**
   * 信頼度スコア（0.0〜1.0）
   */
  confidence: number;

  /**
   * 要約のトークン数（推定値）
   */
  tokenCount: number;

  /**
   * 要約の埋め込みベクトル（セマンティック検索用）
   * @description generateEmbedding=true の場合に生成される
   */
  embedding?: number[];

  /**
   * 作成日時
   */
  createdAt: Date;
}
```

### 1.2 CommunitySummarizationOptions

要約生成オプションを表す型。

```typescript
/**
 * コミュニティ要約生成オプション
 */
export interface CommunitySummarizationOptions {
  /**
   * 要約の最大トークン数
   * @default 200
   */
  maxSummaryTokens?: number;

  /**
   * キーワードの最大数
   * @default 10
   */
  maxKeywords?: number;

  /**
   * 子コミュニティの要約を使用するか
   * @default true
   * @description 親コミュニティの要約生成時に子の要約をプロンプトに含める
   */
  useChildSummaries?: boolean;

  /**
   * 要約の埋め込みを生成するか
   * @default true
   * @description セマンティック検索を有効にするために必要
   */
  generateEmbedding?: boolean;

  /**
   * 並列処理の最大数
   * @default 5
   * @description summarizeAll()での同時処理数
   */
  maxConcurrency?: number;

  /**
   * 要約プロンプトのスタイル
   * @default "concise"
   */
  summaryStyle?: SummaryStyle;
}

/**
 * 要約スタイル
 */
export type SummaryStyle = "detailed" | "concise" | "technical";
```

### 1.3 CommunitySummarizationResult

全コミュニティ一括要約の結果を表す型。

```typescript
/**
 * 全コミュニティ一括要約の結果
 */
export interface CommunitySummarizationResult {
  /**
   * 生成された要約の配列
   */
  summaries: CommunitySummary[];

  /**
   * 使用した総トークン数
   */
  totalTokensUsed: number;

  /**
   * 処理時間（ミリ秒）
   */
  processingTimeMs: number;

  /**
   * 要約生成に失敗したコミュニティID
   * @description 部分失敗時でも処理は継続し、失敗したIDをここに記録
   */
  failedCommunities: CommunityId[];
}
```

---

## 2. 既存型との整合性

### 2.1 Community型（CONV-08-02で定義済み）

```typescript
// interfaces-rag-community-detection.md より

interface Community {
  id: CommunityId; // Branded Type
  level: number; // 階層レベル（0が最下層）
  memberEntityIds: EntityId[]; // 直接メンバーエンティティID
  childCommunityIds: CommunityId[]; // 子コミュニティID
  parentCommunityId?: CommunityId; // 親コミュニティID
  size: number; // コミュニティサイズ
  internalEdges: number; // 内部エッジ数
  externalEdges: number; // 外部エッジ数
  modularity: number; // モジュラリティ貢献
  summary?: string; // コミュニティ要約（LLM生成） ← ここに保存
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 CommunityStructure型（CONV-08-02で定義済み）

```typescript
interface CommunityStructure {
  communities: Community[]; // 全コミュニティ
  levels: number; // 階層レベル数
  totalModularity: number; // グラフ全体のモジュラリティ
  entityToCommunity: Map<EntityId, CommunityId[]>; // エンティティ→コミュニティ
}
```

### 2.3 CommunityId（Branded Type）

```typescript
// 既存の Branded Type 定義を使用
declare const __brand: unique symbol;

export type CommunityId = string & { [__brand]: "CommunityId" };

// 生成関数
export function createCommunityId(id: string): CommunityId {
  return id as CommunityId;
}
```

---

## 3. 関連型（既存）

### 3.1 StoredEntity（IKnowledgeGraphStore）

```typescript
interface StoredEntity {
  id: EntityId;
  name: string;
  normalizedName: string;
  type: EntityType;
  description?: string;
  aliases: string[];
  confidence: number;
  mentionCount: number;
  importance: number;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 StoredRelation（IKnowledgeGraphStore）

```typescript
interface StoredRelation {
  id: RelationId;
  sourceEntityId: EntityId;
  targetEntityId: EntityId;
  relationType: RelationType;
  description?: string;
  confidence: number;
  bidirectional: boolean;
  evidence: RelationEvidence[];
  createdAt: Date;
}
```

---

## 4. 型の使用例

### 4.1 要約生成

```typescript
import type { CommunitySummary, CommunitySummarizationOptions } from "./types";

const options: CommunitySummarizationOptions = {
  maxSummaryTokens: 300,
  maxKeywords: 15,
  useChildSummaries: true,
  generateEmbedding: true,
  maxConcurrency: 3,
  summaryStyle: "technical",
};

const result = await summarizer.summarize(
  community,
  entities,
  relations,
  options,
);

if (result.ok) {
  const summary: CommunitySummary = result.value;
  console.log(summary.summary);
  console.log(summary.keywords);
}
```

### 4.2 一括要約結果の処理

```typescript
import type { CommunitySummarizationResult } from "./types";

const result = await summarizer.summarizeAll(structure, options);

if (result.ok) {
  const {
    summaries,
    totalTokensUsed,
    processingTimeMs,
    failedCommunities,
  }: CommunitySummarizationResult = result.value;

  console.log(`Generated: ${summaries.length}`);
  console.log(`Failed: ${failedCommunities.length}`);
  console.log(`Tokens: ${totalTokensUsed}`);
  console.log(`Time: ${processingTimeMs}ms`);
}
```

---

## 5. バリデーション制約

### 5.1 CommunitySummary

| フィールド    | 制約                        |
| ------------- | --------------------------- |
| summary       | 空文字列不可                |
| keywords      | 空配列不可、maxKeywords以下 |
| mainEntities  | 最大5個                     |
| mainRelations | 最大5個                     |
| confidence    | 0.0〜1.0の範囲              |
| tokenCount    | 0より大きい                 |

### 5.2 CommunitySummarizationOptions

| フィールド       | 制約                                   |
| ---------------- | -------------------------------------- |
| maxSummaryTokens | 1以上                                  |
| maxKeywords      | 1以上                                  |
| maxConcurrency   | 1以上                                  |
| summaryStyle     | "detailed" \| "concise" \| "technical" |

---

## 完了条件

- [x] CommunitySummary型が設計されている
- [x] CommunitySummarizationOptions型が設計されている
- [x] CommunitySummarizationResult型が設計されている
- [x] Branded Types（CommunityId）との整合性が確認されている
- [x] 既存型（Community, CommunityStructure）との関係が明確化されている
- [x] 型の使用例が記載されている
