# Phase 2: 設計

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 2              |
| 機能名 | corrective-rag |
| 作成日 | 2026-01-16     |

## 目的

要件を実現可能な構造に落とし込み、RelevanceEvaluator・CorrectiveRAGのアーキテクチャを設計する。

## 実行タスク

- アーキテクチャ設計: CRAG全体構造の設計とパターン選定
- インターフェース設計: 各クラスのpublic APIとデータ型の定義
- 依存関係設計: ILLMClient・IWebSearcherとの連携設計

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                       |
| ---------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| 検索クエリ・結果型定義 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | CRAGScore型、SearchOptions |
| RAGアーキテクチャ      | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | HybridRAGパイプライン      |
| コアインターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md`       | Result型、Logger           |

## 実行手順

### 1. アーキテクチャ設計

#### クラス構成

```
┌─────────────────────────────────────────────────────────────────┐
│                       CorrectiveRAG                              │
│                  (Main Orchestrator)                             │
├─────────────────────────────────────────────────────────────────┤
│  process(query, results) → CRAGResult                           │
│    ├─ evaluator.evaluate(query, results)                        │
│    └─ handleCorrect() / handleIncorrect() / handleAmbiguous()   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
┌─────────────────┐   ┌─────────────┐   ┌─────────────────┐
│RelevanceEvaluator│   │IWebSearcher │   │ ILLMClient     │
│ (Evaluation)    │   │ (Optional)  │   │ (Required)     │
├─────────────────┤   └─────────────┘   └─────────────────┘
│ evaluate()      │
│ evaluateIndiv() │
│ buildPrompt()   │
│ parseResponse() │
└─────────────────┘
```

#### 処理フロー

```
FusedSearchResult[] (from RRF + Reranking)
    ↓
RelevanceEvaluator.evaluate(query, results)
    ↓
┌───────────────────────────────────────────────────────────────┐
│                   RelevanceEvaluation                          │
│  overallScore: number (0-1)                                   │
│  action: "correct" | "incorrect" | "ambiguous"                │
│  individualScores: IndividualScore[]                          │
│  reasoning: string                                            │
└───────────────────────────────────────────────────────────────┘
    ↓
CorrectiveRAG.process() → CRAGResult
    ├─ correct:    handleCorrect()   → 結果をそのまま返す
    ├─ incorrect:  handleIncorrect() → Web検索で補強（オプション）
    └─ ambiguous:  handleAmbiguous() → 低スコア結果をフィルタ
```

### 2. インターフェース設計

#### RelevanceEvaluator

```typescript
interface IRelevanceEvaluator {
  evaluate(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<RelevanceEvaluation, Error>>;
}

interface EvaluatorOptions {
  maxEvaluate?: number; // 評価する最大結果数 (default: 5)
  correctThreshold?: number; // "correct"判定閾値 (default: 0.7)
  incorrectThreshold?: number; // "incorrect"判定閾値 (default: 0.3)
}

interface RelevanceEvaluation {
  overallScore: number; // 0.0-1.0
  action: "correct" | "incorrect" | "ambiguous";
  individualScores: IndividualScore[];
  reasoning: string;
}

interface IndividualScore {
  chunkId: ChunkId;
  score: number; // 0.0-1.0
  reason: string;
}
```

#### CorrectiveRAG

```typescript
interface ICorrectiveRAG {
  process(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<CRAGResult, Error>>;
}

interface CRAGOptions {
  enableWebSearch?: boolean; // Web検索有効化 (default: false)
  enableRefinement?: boolean; // Knowledge Refinement有効化 (default: false)
  ambiguousFilterThreshold?: number; // Ambiguous時フィルタ閾値 (default: 0.4)
  minResultsBeforeWebSearch?: number; // Web検索前の最小結果数 (default: 3)
  webSearchLimit?: number; // Web検索結果数上限 (default: 5)
}

interface CRAGResult {
  results: FusedSearchResult[];
  evaluation: {
    relevanceScore: number;
    action: "correct" | "incorrect" | "ambiguous";
    corrections: CorrectionAction[];
  };
  augmentedContext?: string; // Web検索結果（オプション）
}

type CorrectionAction =
  | { type: "keep"; reason: string }
  | { type: "discard"; reason: string }
  | { type: "refine"; refinedQuery: string }
  | { type: "web_search"; searchQuery: string }
  | { type: "expand"; expansionStrategy: string };
```

#### 外部依存インターフェース

```typescript
// ILLMClient（既存インターフェース）
interface ILLMClient {
  complete(options: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<Result<string, Error>>;
}

// IWebSearcher（新規定義）
interface IWebSearcher {
  search(
    query: string,
    limit: number,
  ): Promise<Result<WebSearchResult[], Error>>;
}

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}
```

### 3. 依存関係設計

#### 依存性注入

```typescript
// CorrectiveRAGの生成
const evaluator = new RelevanceEvaluator(llmClient, evaluatorOptions);
const crag = new CorrectiveRAG(evaluator, webSearcher, cragOptions);

// webSearcherはnull許容（オプション機能）
const cragWithoutWeb = new CorrectiveRAG(evaluator, null, cragOptions);
```

#### ディレクトリ構成

```
packages/shared/src/services/search/crag/
├── index.ts                    # エクスポート
├── types.ts                    # 型定義
├── relevance-evaluator.ts      # RelevanceEvaluatorクラス
├── corrective-rag.ts           # CorrectiveRAGクラス
└── __tests__/
    ├── relevance-evaluator.test.ts
    ├── corrective-rag.test.ts
    └── crag.integration.test.ts
```

## 統合テスト連携【必須】

統合ポイント/契約（ILLMClient・IWebSearcher）を設計に反映:

| 統合ポイント              | 契約定義                                            |
| ------------------------- | --------------------------------------------------- |
| RelevanceEvaluator→LLM    | ILLMClient.complete()で評価プロンプトを送信         |
| CorrectiveRAG→WebSearcher | IWebSearcher.search()でWeb検索（オプション）        |
| 入力                      | FusedSearchResult[]（RRF Fusion + Rerankingの出力） |
| 出力                      | CRAGResult（評価・補正・補強コンテキスト）          |

## 成果物

| 成果物           | パス                                     | 説明               |
| ---------------- | ---------------------------------------- | ------------------ |
| アーキテクチャ   | `outputs/phase-2/architecture-design.md` | クラス構成・フロー |
| インターフェース | `outputs/phase-2/interface-design.md`    | 型定義・API設計    |

## 完了条件

- [ ] アーキテクチャ（クラス構成・処理フロー）が定義されている
- [ ] RelevanceEvaluatorのインターフェースが設計されている
- [ ] CorrectiveRAGのインターフェースが設計されている
- [ ] 外部依存（ILLMClient・IWebSearcher）が設計されている
- [ ] ディレクトリ構成が定義されている
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. アーキテクチャ設計
3. RelevanceEvaluatorインターフェース設計
4. CorrectiveRAGインターフェース設計
5. 外部依存インターフェース設計
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/corrective-rag --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
