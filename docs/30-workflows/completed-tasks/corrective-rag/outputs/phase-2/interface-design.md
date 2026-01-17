# Phase 2 成果物: インターフェース設計

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| タスクID | CONV-07-06                                |
| フェーズ | Phase 2: 設計                             |
| 作成日   | 2026-01-16                                |
| 対象機能 | Corrective RAG (CRAG)                     |
| 実装場所 | packages/shared/src/services/search/crag/ |

---

## 1. 型定義ファイル構成

```typescript
// packages/shared/src/services/search/crag/types.ts

// ========================================
// Brand Types（既存の型を参照）
// ========================================
import type { ChunkId } from "@/types/rag/chunks";
import type { Result } from "@/types/rag/result";

// ========================================
// 外部依存型（既存の型を参照）
// ========================================
import type { FusedSearchResult } from "../fusion/rrf-fusion";
```

---

## 2. RelevanceEvaluator インターフェース

### 2.1 IRelevanceEvaluator

```typescript
/**
 * 関連性評価器のインターフェース
 */
export interface IRelevanceEvaluator {
  /**
   * 検索結果全体の関連性を評価
   * @param query 検索クエリ
   * @param results 検索結果配列
   * @returns 評価結果（成功時）またはエラー（失敗時）
   */
  evaluate(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<RelevanceEvaluation, Error>>;
}
```

### 2.2 EvaluatorOptions

```typescript
/**
 * RelevanceEvaluatorの設定オプション
 */
export interface EvaluatorOptions {
  /**
   * 評価する最大結果数
   * @default 5
   */
  maxEvaluate?: number;

  /**
   * "correct"判定の閾値
   * この値以上のスコアで"correct"と判定
   * @default 0.7
   */
  correctThreshold?: number;

  /**
   * "incorrect"判定の閾値
   * この値以下のスコアで"incorrect"と判定
   * @default 0.3
   */
  incorrectThreshold?: number;
}
```

### 2.3 RelevanceEvaluation

```typescript
/**
 * 関連性評価の結果
 */
export interface RelevanceEvaluation {
  /**
   * 全体の関連性スコア（0.0-1.0）
   * 上位結果に重みを付けた加重平均
   */
  overallScore: number;

  /**
   * 評価に基づくアクション
   * - correct: 結果が十分に関連性がある
   * - incorrect: 結果が関連性がない
   * - ambiguous: 結果の品質が混在
   */
  action: RelevanceAction;

  /**
   * 各結果の個別スコア
   */
  individualScores: IndividualScore[];

  /**
   * 評価の推論理由
   */
  reasoning: string;
}

/**
 * 関連性評価アクション
 */
export type RelevanceAction = "correct" | "incorrect" | "ambiguous";
```

### 2.4 IndividualScore

```typescript
/**
 * 個別の検索結果に対するスコア
 */
export interface IndividualScore {
  /**
   * チャンクID
   */
  chunkId: ChunkId;

  /**
   * 関連性スコア（0.0-1.0）
   */
  score: number;

  /**
   * スコアの理由
   */
  reason: string;
}
```

---

## 3. CorrectiveRAG インターフェース

### 3.1 ICorrectiveRAG

```typescript
/**
 * Corrective RAGのインターフェース
 */
export interface ICorrectiveRAG {
  /**
   * 検索結果を評価・補正
   * @param query 検索クエリ
   * @param results 検索結果配列
   * @returns CRAG処理結果（成功時）またはエラー（失敗時）
   */
  process(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<CRAGResult, Error>>;
}
```

### 3.2 CRAGOptions

```typescript
/**
 * CorrectiveRAGの設定オプション
 */
export interface CRAGOptions {
  /**
   * Web検索による補強を有効にするか
   * @default false
   */
  enableWebSearch?: boolean;

  /**
   * Knowledge Refinementを有効にするか
   * @default false
   */
  enableRefinement?: boolean;

  /**
   * Ambiguous時のフィルタ閾値
   * この値未満のスコアの結果を除外
   * @default 0.4
   */
  ambiguousFilterThreshold?: number;

  /**
   * Web検索を行う前の最小結果数
   * フィルタ後の結果数がこれ未満の場合にWeb検索を実行
   * @default 3
   */
  minResultsBeforeWebSearch?: number;

  /**
   * Web検索の結果数上限
   * @default 5
   */
  webSearchLimit?: number;
}
```

### 3.3 CRAGResult

```typescript
/**
 * CRAG処理の結果
 */
export interface CRAGResult {
  /**
   * 補正後の検索結果
   * - correct: 入力結果（またはRefinement後）
   * - incorrect: 空配列
   * - ambiguous: フィルタ後の結果
   */
  results: FusedSearchResult[];

  /**
   * 評価情報
   */
  evaluation: {
    /**
     * 関連性スコア
     */
    relevanceScore: number;

    /**
     * 実行されたアクション
     */
    action: RelevanceAction;

    /**
     * 実行された補正アクション
     */
    corrections: CorrectionAction[];
  };

  /**
   * Web検索による補強コンテキスト
   * incorrect/ambiguousでWeb検索が実行された場合に設定
   */
  augmentedContext?: string;
}
```

### 3.4 CorrectionAction

```typescript
/**
 * 補正アクション
 */
export type CorrectionAction =
  | { type: "keep"; reason: string }
  | { type: "discard"; reason: string }
  | { type: "refine"; refinedQuery: string }
  | { type: "web_search"; searchQuery: string }
  | { type: "expand"; expansionStrategy: string };
```

---

## 4. 外部依存インターフェース

### 4.1 ILLMClient（既存インターフェース参照）

```typescript
/**
 * LLMクライアントのインターフェース
 * 既存のインターフェースを参照
 */
export interface ILLMClient {
  /**
   * プロンプトに対する補完を生成
   * @param options 補完オプション
   * @returns 生成されたテキスト（成功時）またはエラー（失敗時）
   */
  complete(options: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<Result<string, Error>>;
}
```

### 4.2 IWebSearcher（新規定義）

```typescript
/**
 * Web検索プロバイダーのインターフェース
 */
export interface IWebSearcher {
  /**
   * Web検索を実行
   * @param query 検索クエリ
   * @param limit 結果数上限
   * @returns 検索結果（成功時）またはエラー（失敗時）
   */
  search(
    query: string,
    limit: number,
  ): Promise<Result<WebSearchResult[], Error>>;
}

/**
 * Web検索結果
 */
export interface WebSearchResult {
  /**
   * 結果のタイトル
   */
  title: string;

  /**
   * 結果のURL
   */
  url: string;

  /**
   * 結果のスニペット
   */
  snippet: string;
}
```

---

## 5. 定数定義

```typescript
/**
 * デフォルト設定値
 */
export const CRAG_DEFAULTS = {
  /** 評価する最大結果数 */
  MAX_EVALUATE: 5,

  /** "correct"判定の閾値 */
  CORRECT_THRESHOLD: 0.7,

  /** "incorrect"判定の閾値 */
  INCORRECT_THRESHOLD: 0.3,

  /** Ambiguous時のフィルタ閾値 */
  AMBIGUOUS_FILTER_THRESHOLD: 0.4,

  /** Web検索前の最小結果数 */
  MIN_RESULTS_BEFORE_WEB_SEARCH: 3,

  /** Web検索結果数上限 */
  WEB_SEARCH_LIMIT: 5,

  /** LLM評価のタイムアウト（ミリ秒） */
  EVALUATION_TIMEOUT_MS: 10000,

  /** LLM評価の最大トークン数 */
  MAX_TOKENS: 500,

  /** LLM評価の温度 */
  TEMPERATURE: 0,
} as const;
```

---

## 6. 公開API設計

### 6.1 index.ts（エクスポート）

```typescript
// packages/shared/src/services/search/crag/index.ts

// ========================================
// クラスエクスポート
// ========================================
export { RelevanceEvaluator } from "./relevance-evaluator";
export { CorrectiveRAG } from "./corrective-rag";

// ========================================
// 型エクスポート
// ========================================
export type {
  // インターフェース
  IRelevanceEvaluator,
  ICorrectiveRAG,
  IWebSearcher,
  // オプション
  EvaluatorOptions,
  CRAGOptions,
  // 結果型
  RelevanceEvaluation,
  IndividualScore,
  CRAGResult,
  CorrectionAction,
  WebSearchResult,
  // 共通型
  RelevanceAction,
} from "./types";

// ========================================
// 定数エクスポート
// ========================================
export { CRAG_DEFAULTS } from "./types";
```

---

## 7. 使用例

### 7.1 基本的な使用方法

```typescript
import {
  RelevanceEvaluator,
  CorrectiveRAG,
  type ILLMClient,
} from "@/services/search/crag";

// 1. LLMクライアントを用意（既存のクライアント）
const llmClient: ILLMClient = /* ... */;

// 2. RelevanceEvaluatorを作成
const evaluator = new RelevanceEvaluator(llmClient, {
  maxEvaluate: 5,
  correctThreshold: 0.7,
  incorrectThreshold: 0.3,
});

// 3. CorrectiveRAGを作成（Web検索なし）
const crag = new CorrectiveRAG(evaluator, null, {
  enableWebSearch: false,
  enableRefinement: false,
});

// 4. 処理を実行
const result = await crag.process(query, fusedResults);

if (result.success) {
  console.log("Action:", result.data.evaluation.action);
  console.log("Results:", result.data.results.length);
} else {
  console.error("Error:", result.error.message);
}
```

### 7.2 Web検索を使用する場合

```typescript
import {
  RelevanceEvaluator,
  CorrectiveRAG,
  type IWebSearcher,
} from "@/services/search/crag";

// Web検索プロバイダーを用意
const webSearcher: IWebSearcher = /* ... */;

// CorrectiveRAGを作成（Web検索あり）
const crag = new CorrectiveRAG(evaluator, webSearcher, {
  enableWebSearch: true,
  enableRefinement: true,
  webSearchLimit: 5,
  minResultsBeforeWebSearch: 3,
});

const result = await crag.process(query, fusedResults);

if (result.success && result.data.augmentedContext) {
  console.log("Web検索結果:", result.data.augmentedContext);
}
```

---

## 8. 型ガード・ユーティリティ

```typescript
/**
 * CRAGResultの型ガード
 */
export function isCRAGResultCorrect(result: CRAGResult): boolean {
  return result.evaluation.action === "correct";
}

export function isCRAGResultIncorrect(result: CRAGResult): boolean {
  return result.evaluation.action === "incorrect";
}

export function isCRAGResultAmbiguous(result: CRAGResult): boolean {
  return result.evaluation.action === "ambiguous";
}

/**
 * CorrectionActionの型ガード
 */
export function isKeepAction(
  action: CorrectionAction,
): action is { type: "keep"; reason: string } {
  return action.type === "keep";
}

export function isDiscardAction(
  action: CorrectionAction,
): action is { type: "discard"; reason: string } {
  return action.type === "discard";
}

export function isWebSearchAction(
  action: CorrectionAction,
): action is { type: "web_search"; searchQuery: string } {
  return action.type === "web_search";
}
```

---

## 9. 既存型との整合性

### 9.1 FusedSearchResult（RRF Fusionの出力）

```typescript
// packages/shared/src/services/search/fusion/rrf-fusion.ts より参照
interface FusedSearchResult {
  chunkId: ChunkId;
  content: string;
  score: number;
  sources: SearchSource[];
}
```

### 9.2 Result型

```typescript
// packages/shared/src/types/rag/result.ts より参照
type Result<T, E> = Ok<T> | Err<E>;
```

### 9.3 CRAGScore（既存の検索オプション）

```typescript
// interfaces-rag-search.md より参照
interface CRAGScore {
  relevance: "correct" | "incorrect" | "ambiguous";
  confidence: number;
  needsWebSearch: boolean;
  refinedQuery: string | null;
}
```

---

## 10. 完了確認

- [x] RelevanceEvaluatorのインターフェースが設計されている
- [x] CorrectiveRAGのインターフェースが設計されている
- [x] 外部依存（ILLMClient・IWebSearcher）が設計されている
- [x] オプション・設定値の型が定義されている
- [x] 公開APIが設計されている
- [x] 使用例が提供されている
- [x] 既存型との整合性が確認されている
