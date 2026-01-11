# Phase 2 成果物: 設計書

## タスク情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | CONV-07-01 |
| Phase      | 2          |
| 完了日時   | 2026-01-11 |
| ステータス | 完了       |

---

## 1. アーキテクチャ設計

### 全体アーキテクチャ

```
┌─────────────────────────────────────────┐
│          HybridRAG Pipeline             │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │      Query Classifier              │  │
│  │  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │    LLM      │  │  Rule-Based │  │  │
│  │  │  Classifier │  │  Classifier │  │  │
│  │  └──────┬──────┘  └──────┬──────┘  │  │
│  │         │ fallback       │         │  │
│  │         └────────────────┘         │  │
│  │                │                   │  │
│  │                ▼                   │  │
│  │      QueryClassification           │  │
│  └───────────────────────────────────┘  │
│                  │                      │
│                  ▼                      │
│  ┌───────────────────────────────────┐  │
│  │      Search Strategy Selector      │  │
│  │      (SearchWeights算出)           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### レイヤー構成

| レイヤー    | 責務                         | ファイル                         |
| ----------- | ---------------------------- | -------------------------------- |
| Interface   | 分類器の抽象インターフェース | `query-classifier.ts`            |
| Domain      | 分類結果・オプションの型定義 | `types.ts`                       |
| Application | LLMベース分類器実装          | `llm-query-classifier.ts`        |
| Application | ルールベース分類器実装       | `rule-based-query-classifier.ts` |

---

## 2. 型定義設計

### types.ts

```typescript
import { z } from "zod";

/**
 * クエリタイプ
 */
export const queryTypeSchema = z.enum([
  "local",
  "global",
  "relationship",
  "hybrid",
]);
export type QueryType = z.infer<typeof queryTypeSchema>;

/**
 * 検索重み（合計1.0）
 */
export const searchWeightsSchema = z
  .object({
    keyword: z.number().min(0).max(1),
    semantic: z.number().min(0).max(1),
    graph: z.number().min(0).max(1),
  })
  .refine((weights) => {
    const sum = weights.keyword + weights.semantic + weights.graph;
    return Math.abs(sum - 1.0) < 0.01;
  }, "検索重みの合計は1.0である必要があります");

export type SearchWeights = z.infer<typeof searchWeightsSchema>;

/**
 * クエリ分類結果
 */
export interface QueryClassification {
  type: QueryType;
  confidence: number;
  extractedEntities: string[];
  relationHint?: string;
  keywords: string[];
  intent: string;
}

/**
 * クエリ分類オプション
 */
export interface QueryClassificationOptions {
  useLLM?: boolean;
  minConfidence?: number;
  extractEntities?: boolean;
}

export const DEFAULT_CLASSIFICATION_OPTIONS: Required<QueryClassificationOptions> =
  {
    useLLM: true,
    minConfidence: 0.6,
    extractEntities: true,
  };
```

---

## 3. インターフェース設計

### query-classifier.ts

```typescript
import type { Result } from "@/types/result";
import type {
  QueryClassification,
  QueryClassificationOptions,
  QueryType,
  SearchWeights,
} from "./types";

/**
 * クエリ分類器インターフェース
 */
export interface IQueryClassifier {
  classify(
    query: string,
    options?: QueryClassificationOptions,
  ): Promise<Result<QueryClassification, Error>>;

  getSearchWeights(type: QueryType): SearchWeights;
}
```

---

## 4. LLMベース分類器設計

### llm-query-classifier.ts

```typescript
export class LLMQueryClassifier implements IQueryClassifier {
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly fallbackClassifier: IQueryClassifier,
  ) {}

  async classify(
    query: string,
    options?: QueryClassificationOptions,
  ): Promise<Result<QueryClassification, Error>> {
    // 1. オプション解決
    // 2. useLLM=falseならフォールバック
    // 3. LLM呼び出し
    // 4. JSONパース
    // 5. 信頼度チェック
    // 6. エラー時フォールバック
  }

  getSearchWeights(type: QueryType): SearchWeights {
    return SEARCH_WEIGHTS[type];
  }
}
```

---

## 5. ルールベース分類器設計

### rule-based-query-classifier.ts

```typescript
export class RuleBasedQueryClassifier implements IQueryClassifier {
  // グローバルクエリパターン
  private readonly globalPatterns: RegExp[] = [
    /全体(の|は)/,
    /概要/,
    /テーマ/,
    /主(な|要な)話題/,
    /何について/,
    /要約/,
    /overview/i,
    /summary/i,
    /what is this (about|document)/i,
    /main (topic|theme)/i,
  ];

  // 関係性クエリパターン
  private readonly relationshipPatterns: RegExp[] = [
    /(.+)と(.+)の関係/,
    /(.+)と(.+)の違い/,
    /(.+)と(.+)の比較/,
    /relationship between/i,
    /difference between/i,
    /compare (.+) (and|with) (.+)/i,
  ];

  async classify(query: string): Promise<Result<QueryClassification, Error>> {
    // 1. グローバルパターンチェック
    // 2. 関係性パターンチェック（エンティティ抽出含む）
    // 3. デフォルトはlocal
    // 4. キーワード抽出
  }

  getSearchWeights(type: QueryType): SearchWeights {
    return SEARCH_WEIGHTS[type];
  }
}
```

---

## 6. 検索重みマッピング

| クエリタイプ | keyword | semantic | graph | 理由                         |
| ------------ | ------- | -------- | ----- | ---------------------------- |
| local        | 0.35    | 0.35     | 0.30  | 特定情報はVector+Keyword重視 |
| global       | 0.20    | 0.30     | 0.50  | 全体把握はGraph重視          |
| relationship | 0.20    | 0.20     | 0.60  | 関係性はGraph検索が最適      |
| hybrid       | 0.33    | 0.33     | 0.34  | 均等配分（フォールバック）   |

```typescript
export const SEARCH_WEIGHTS: Record<QueryType, SearchWeights> = {
  local: { keyword: 0.35, semantic: 0.35, graph: 0.3 },
  global: { keyword: 0.2, semantic: 0.3, graph: 0.5 },
  relationship: { keyword: 0.2, semantic: 0.2, graph: 0.6 },
  hybrid: { keyword: 0.33, semantic: 0.33, graph: 0.34 },
};
```

---

## 7. ディレクトリ構成

```
packages/shared/src/services/search/
├── __tests__/
│   ├── types.test.ts
│   ├── rule-based-query-classifier.test.ts
│   ├── llm-query-classifier.test.ts
│   └── query-classifier.integration.test.ts
├── types.ts
├── query-classifier.ts
├── llm-query-classifier.ts
├── rule-based-query-classifier.ts
└── index.ts
```

---

## 8. 依存関係

### 外部依存

| 依存     | 用途                     | パッケージ       |
| -------- | ------------------------ | ---------------- |
| zod      | ランタイムバリデーション | `zod`            |
| Result型 | エラーハンドリング       | `@/types/result` |

### 内部依存

| 依存                     | 用途                |
| ------------------------ | ------------------- |
| RuleBasedQueryClassifier | LLMのフォールバック |

---

## 9. システム仕様参照

| 参照資料           | パス                                                                         | 確認内容                 |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------ |
| 検索クエリ・結果型 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | SearchWeights既存定義    |
| RAGアーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | パイプライン統合ポイント |

---

## 10. 完了条件チェックリスト

- [x] アーキテクチャ図が作成されている
- [x] 全ての型定義が設計されている
- [x] インターフェースが設計されている
- [x] LLMベース分類器の設計が完了している
- [x] ルールベース分類器の設計が完了している
- [x] 検索重みマッピングが定義されている
- [x] ディレクトリ構成が決定している
- [x] 依存関係が整理されている
- [x] システム仕様との整合性が確認されている
- [x] 設計書が `outputs/phase-2/design.md` に出力されている
- [x] 本Phase内の全タスクを100%実行完了
