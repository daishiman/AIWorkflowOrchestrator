# Phase 2: 設計 - クエリ分類器

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 2                            |
| タスクID     | CONV-07-01                   |
| Phase名      | 設計                         |
| 前提Phase    | Phase 1 (要件定義)           |
| 次Phase      | Phase 3 (設計レビューゲート) |
| 推定作業時間 | 3時間                        |
| ステータス   | 未着手                       |

---

## 目的

クエリ分類器のアーキテクチャ・詳細設計を行い、実装の指針を確立する。既存のシステム仕様との整合性を確保しながら、拡張性・テスト容易性を考慮した設計を行う。

---

## アーキテクチャ設計

### 全体アーキテクチャ

```
                         ┌─────────────────────────────────────────┐
                         │          HybridRAG Pipeline             │
                         │                                         │
                         │  ┌───────────────────────────────────┐  │
                         │  │      Query Classifier              │  │
                         │  │  ┌─────────────┐  ┌─────────────┐  │  │
  Query ─────────────────┼──┼─▶│   LLM       │  │  Rule-Based │  │  │
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

## 詳細設計

### 型定義

```typescript
// packages/shared/src/services/search/types.ts

import { z } from "zod";

/**
 * クエリタイプ
 * - local: 特定エンティティ・事実に関する質問
 * - global: 全体テーマ・傾向に関する質問
 * - relationship: エンティティ間関係に関する質問
 * - hybrid: 複合・不明な場合のデフォルト
 */
export const queryTypeSchema = z.enum([
  "local",
  "global",
  "relationship",
  "hybrid",
]);
export type QueryType = z.infer<typeof queryTypeSchema>;

/**
 * 検索重み
 * - 合計が1.0になることをZodで保証
 */
export const searchWeightsSchema = z
  .object({
    keyword: z.number().min(0).max(1),
    semantic: z.number().min(0).max(1),
    graph: z.number().min(0).max(1),
  })
  .refine((weights) => {
    const sum = weights.keyword + weights.semantic + weights.graph;
    return Math.abs(sum - 1.0) < 0.01; // 浮動小数点誤差許容
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
  /** LLMを使用するか（falseの場合はルールベース） */
  useLLM?: boolean;
  /** 最小信頼度（これ未満はhybridにフォールバック） */
  minConfidence?: number;
  /** エンティティ抽出を行うか */
  extractEntities?: boolean;
}

/**
 * デフォルトオプション
 */
export const DEFAULT_CLASSIFICATION_OPTIONS: Required<QueryClassificationOptions> =
  {
    useLLM: true,
    minConfidence: 0.6,
    extractEntities: true,
  };
```

### インターフェース設計

```typescript
// packages/shared/src/services/search/query-classifier.ts

import type { Result } from "@/types/result";
import type {
  QueryClassification,
  QueryClassificationOptions,
  QueryType,
  SearchWeights,
} from "./types";

/**
 * クエリ分類器インターフェース
 *
 * 検索クエリを分類し、最適な検索戦略を決定するための基盤を提供する。
 * LLMベース・ルールベースの2つの実装が存在する。
 */
export interface IQueryClassifier {
  /**
   * クエリを分類
   *
   * @param query - 検索クエリ文字列（1-1000文字）
   * @param options - 分類オプション（任意）
   * @returns 分類結果またはエラー
   */
  classify(
    query: string,
    options?: QueryClassificationOptions,
  ): Promise<Result<QueryClassification, Error>>;

  /**
   * クエリタイプに応じた検索重みを取得
   *
   * @param type - クエリタイプ
   * @returns 検索重み（keyword/semantic/graph）
   */
  getSearchWeights(type: QueryType): SearchWeights;
}
```

### LLMベース分類器設計

```typescript
// packages/shared/src/services/search/llm-query-classifier.ts

import type { ILLMProvider } from "@/services/llm/types";
import type { IQueryClassifier } from "./query-classifier";

/**
 * LLMを使用したクエリ分類器
 *
 * 特徴:
 * - 高精度な分類（未知パターンにも対応）
 * - エンティティ抽出・意図理解が可能
 * - LLMエラー時はルールベースにフォールバック
 */
export class LLMQueryClassifier implements IQueryClassifier {
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly fallbackClassifier: IQueryClassifier,
  ) {}

  // 実装詳細はPhase 5で記述
}
```

### ルールベース分類器設計

```typescript
// packages/shared/src/services/search/rule-based-query-classifier.ts

import type { IQueryClassifier } from "./query-classifier";

/**
 * ルールベースのクエリ分類器
 *
 * 特徴:
 * - 高速（ミリ秒単位）
 * - パターンマッチングによる決定論的分類
 * - LLMのフォールバック用途
 */
export class RuleBasedQueryClassifier implements IQueryClassifier {
  // グローバルクエリパターン（日本語・英語）
  private readonly globalPatterns: RegExp[] = [
    /全体(の|は)/,
    /概要/,
    /テーマ/,
    /主(な|要な)話題/,
    /何について/,
    /どんな内容/,
    /要約/,
    /まとめ/,
    /overview/i,
    /summary/i,
    /what is this (about|document)/i,
    /main (topic|theme)/i,
  ];

  // 関係性クエリパターン（日本語・英語）
  private readonly relationshipPatterns: RegExp[] = [
    /(.+)と(.+)の関係/,
    /(.+)と(.+)の違い/,
    /(.+)と(.+)の比較/,
    /(.+)が(.+)に与える影響/,
    /なぜ(.+)が(.+)/,
    /(.+)はなぜ(.+)/,
    /(.+)と(.+)はどう関連/,
    /relationship between/i,
    /difference between/i,
    /compare (.+) (and|with) (.+)/i,
    /how does (.+) (affect|impact) (.+)/i,
  ];

  // 実装詳細はPhase 5で記述
}
```

### 検索重みマッピング

| クエリタイプ | keyword | semantic | graph | 理由                               |
| ------------ | ------- | -------- | ----- | ---------------------------------- |
| local        | 0.35    | 0.35     | 0.30  | 特定情報はVector+Keyword重視       |
| global       | 0.20    | 0.30     | 0.50  | 全体把握はGraph（Community）重視   |
| relationship | 0.20    | 0.20     | 0.60  | 関係性はGraph検索が最適            |
| hybrid       | 0.33    | 0.33     | 0.34  | 均等配分（不明時のフォールバック） |

---

## 依存関係

### 外部依存

| 依存         | 用途                     | パッケージ/パス        |
| ------------ | ------------------------ | ---------------------- |
| ILLMProvider | LLM通信の抽象化          | `@/services/llm/types` |
| Result型     | エラーハンドリング       | `@/types/result`       |
| Zod          | ランタイムバリデーション | `zod`                  |

### 内部依存

| 依存                     | 用途                |
| ------------------------ | ------------------- |
| RuleBasedQueryClassifier | LLMのフォールバック |

---

## ディレクトリ構成

```
packages/shared/src/services/search/
├── __tests__/
│   └── query-classifier.test.ts    # テスト
├── types.ts                         # 型定義
├── query-classifier.ts              # インターフェース
├── llm-query-classifier.ts          # LLMベース実装
├── rule-based-query-classifier.ts   # ルールベース実装
└── index.ts                         # エクスポート
```

---

## テスト戦略

### ユニットテスト

| テスト対象               | テスト内容                          |
| ------------------------ | ----------------------------------- |
| RuleBasedQueryClassifier | パターンマッチング、キーワード抽出  |
| LLMQueryClassifier       | 分類結果パース、フォールバック動作  |
| getSearchWeights         | 各タイプに応じた重み返却            |
| 型スキーマ               | Zodバリデーション（境界値・異常値） |

### 統合テスト

| テスト対象                     | テスト内容               |
| ------------------------------ | ------------------------ |
| LLM→ルールベースフォールバック | エラー時の切り替え動作   |
| 分類→重み取得                  | 分類結果に基づく重み算出 |

---

## システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                         | 内容                      |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| 検索クエリ・結果型  | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | SearchWeights既存定義確認 |
| RAGアーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | パイプライン統合ポイント  |
| LLMインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`        | ILLMProvider仕様確認      |

---

## 成果物

| 成果物 | 配置先                      |
| ------ | --------------------------- |
| 設計書 | `outputs/phase-2/design.md` |

---

## 完了条件

- [ ] アーキテクチャ図が作成されている
- [ ] 全ての型定義が設計されている
- [ ] インターフェースが設計されている
- [ ] LLMベース分類器の設計が完了している
- [ ] ルールベース分類器の設計が完了している
- [ ] 検索重みマッピングが定義されている
- [ ] ディレクトリ構成が決定している
- [ ] テスト戦略が策定されている
- [ ] システム仕様との整合性が確認されている
- [ ] 設計書が `outputs/phase-2/design.md` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 3（設計レビューゲート）へ進み、設計の妥当性を検証する。
