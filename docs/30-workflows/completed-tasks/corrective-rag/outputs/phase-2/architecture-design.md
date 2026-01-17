# Phase 2 成果物: アーキテクチャ設計

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| タスクID | CONV-07-06                                |
| フェーズ | Phase 2: 設計                             |
| 作成日   | 2026-01-16                                |
| 対象機能 | Corrective RAG (CRAG)                     |
| 実装場所 | packages/shared/src/services/search/crag/ |

---

## 1. アーキテクチャ概要

### 1.1 設計方針

Corrective RAG (CRAG) は以下の設計方針に基づいて実装する：

| 方針             | 内容                                                    |
| ---------------- | ------------------------------------------------------- |
| 単一責任原則     | RelevanceEvaluatorとCorrectiveRAGを分離                 |
| 依存性注入       | ILLMClient・IWebSearcherをコンストラクタで注入          |
| Result型パターン | 例外をthrowせず、Result<T, Error>でエラーを明示的に扱う |
| オプショナル機能 | Web検索・Knowledge Refinementはオプション               |
| パイプライン統合 | HybridRAG（RRF Fusion + Reranking）の後段として動作     |

### 1.2 システム全体における位置づけ

```
┌─────────────────────────────────────────────────────────────────────┐
│                      HybridRAG Search Pipeline                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐                      │
│  │  Keyword  │   │ Semantic  │   │   Graph   │                      │
│  │  Search   │   │  Search   │   │  Search   │                      │
│  └─────┬─────┘   └─────┬─────┘   └─────┬─────┘                      │
│        │               │               │                             │
│        └───────────────┼───────────────┘                             │
│                        ▼                                             │
│              ┌─────────────────┐                                     │
│              │   RRF Fusion    │                                     │
│              │   + Reranking   │                                     │
│              └────────┬────────┘                                     │
│                       │                                              │
│                       ▼ FusedSearchResult[]                          │
│              ┌─────────────────┐                                     │
│              │ Corrective RAG  │  ← ★ 本タスクの対象                 │
│              │    (CRAG)       │                                     │
│              └────────┬────────┘                                     │
│                       │                                              │
│                       ▼ CRAGResult                                   │
│              ┌─────────────────┐                                     │
│              │   LLM Response  │                                     │
│              │   Generation    │                                     │
│              └─────────────────┘                                     │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. クラス構成

### 2.1 クラス図

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CorrectiveRAG                                │
│                     (Main Orchestrator)                              │
├─────────────────────────────────────────────────────────────────────┤
│ - evaluator: IRelevanceEvaluator                                     │
│ - webSearcher: IWebSearcher | null                                   │
│ - options: CRAGOptions                                               │
├─────────────────────────────────────────────────────────────────────┤
│ + process(query, results): Promise<Result<CRAGResult, Error>>       │
│ - handleCorrect(query, results, eval): Promise<Result<CRAGResult>>  │
│ - handleIncorrect(query, results, eval): Promise<Result<CRAGResult>>│
│ - handleAmbiguous(query, results, eval): Promise<Result<CRAGResult>>│
│ - refineKnowledge(results, eval): Promise<FusedSearchResult[]>      │
│ - performWebSearch(query): Promise<Result<WebSearchResult[], Error>>│
│ - formatWebResults(results): string                                 │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
┌─────────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ RelevanceEvaluator  │ │  IWebSearcher   │ │   ILLMClient    │
│   (Evaluation)      │ │   (Optional)    │ │   (Required)    │
├─────────────────────┤ └─────────────────┘ └─────────────────┘
│ - llmClient         │
│ - options           │
├─────────────────────┤
│ + evaluate()        │
│ - evaluateIndiv()   │
│ - buildPrompt()     │
│ - parseResponse()   │
│ - calcOverall()     │
│ - determineAction() │
│ - calcVariance()    │
│ - genReasoning()    │
└─────────────────────┘
```

### 2.2 責務分担

| クラス             | 責務                                      |
| ------------------ | ----------------------------------------- |
| CorrectiveRAG      | CRAG処理全体のオーケストレーション        |
| RelevanceEvaluator | LLMを使用した検索結果の関連性評価         |
| IWebSearcher       | Web検索プロバイダーの抽象化（オプション） |
| ILLMClient         | LLMプロバイダーの抽象化（必須）           |

---

## 3. 処理フロー

### 3.1 メインフロー

```
入力: FusedSearchResult[] (from RRF + Reranking)
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│              RelevanceEvaluator.evaluate()                       │
│                                                                   │
│  1. 入力検証（空配列チェック）                                   │
│  2. 評価対象結果の選択（上位maxEvaluate件）                      │
│  3. 評価プロンプト構築                                           │
│  4. LLM API呼び出し                                              │
│  5. レスポンスパース                                             │
│  6. 個別スコア算出（0-1正規化）                                  │
│  7. 全体スコア計算（加重平均）                                   │
│  8. アクション決定                                               │
│  9. 推論理由生成                                                 │
└───────────────────────────────────────────────────────────────┬─┘
                                                                 │
                                                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RelevanceEvaluation                         │
│  {                                                               │
│    overallScore: number (0-1),                                   │
│    action: "correct" | "incorrect" | "ambiguous",                │
│    individualScores: IndividualScore[],                          │
│    reasoning: string                                             │
│  }                                                               │
└───────────────────────────────────────────────────────────────┬─┘
                                                                 │
                                                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CorrectiveRAG.process()                       │
│                                                                   │
│  switch(action) {                                                │
│    case "correct":   → handleCorrect()                           │
│    case "incorrect": → handleIncorrect()                         │
│    case "ambiguous": → handleAmbiguous()                         │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 アクション別処理フロー

#### CORRECT (overallScore ≥ 0.7)

```
handleCorrect()
  │
  ├─ [enableRefinement: false]
  │      │
  │      └→ 結果をそのまま返却
  │
  └─ [enableRefinement: true]
         │
         └→ refineKnowledge() → 結果を返却
```

#### INCORRECT (overallScore ≤ 0.3)

```
handleIncorrect()
  │
  ├─ [enableWebSearch: false または webSearcher: null]
  │      │
  │      └→ 空の結果を返却 (results: [])
  │
  └─ [enableWebSearch: true かつ webSearcher あり]
         │
         ├→ 元の結果を破棄
         ├→ performWebSearch(query)
         └→ augmentedContext に Web検索結果を設定
```

#### AMBIGUOUS (0.3 < overallScore < 0.7)

```
handleAmbiguous()
  │
  ├→ 低スコア結果をフィルタ (score < ambiguousFilterThreshold)
  │
  ├─ [enableRefinement: true]
  │      │
  │      └→ refineKnowledge()
  │
  └─ [enableWebSearch: true かつ 結果数 < minResultsBeforeWebSearch]
         │
         └→ performWebSearch() → augmentedContext に追加
```

---

## 4. データフロー

### 4.1 入出力型の流れ

```
入力
────────────────────────────────────────────────────────────────────
FusedSearchResult[]
├── chunkId: ChunkId
├── content: string
├── score: number (RRF + Reranking score)
└── sources: SearchSource[]

                            ↓

内部処理
────────────────────────────────────────────────────────────────────
RelevanceEvaluation
├── overallScore: number (0-1)
├── action: "correct" | "incorrect" | "ambiguous"
├── individualScores: IndividualScore[]
│   └── { chunkId, score, reason }
└── reasoning: string

                            ↓

出力
────────────────────────────────────────────────────────────────────
CRAGResult
├── results: FusedSearchResult[] (補正後の結果)
├── evaluation: {
│   ├── relevanceScore: number
│   ├── action: "correct" | "incorrect" | "ambiguous"
│   └── corrections: CorrectionAction[]
│ }
└── augmentedContext?: string (Web検索結果、オプション)
```

---

## 5. 依存関係設計

### 5.1 依存関係図

```
                    ┌───────────────────┐
                    │    ILLMClient     │
                    │    (Required)     │
                    └─────────┬─────────┘
                              │
                              ▼
┌───────────────────┐   ┌───────────────────┐
│ RelevanceEvaluator│◄──│   CorrectiveRAG   │
└───────────────────┘   └─────────┬─────────┘
                                  │
                                  ▼
                    ┌───────────────────┐
                    │   IWebSearcher    │
                    │    (Optional)     │
                    └───────────────────┘
```

### 5.2 依存性注入パターン

```typescript
// 1. 基本構成（Web検索なし）
const llmClient: ILLMClient = new OpenAIClient(config);
const evaluator = new RelevanceEvaluator(llmClient, {
  maxEvaluate: 5,
  correctThreshold: 0.7,
  incorrectThreshold: 0.3,
});
const crag = new CorrectiveRAG(evaluator, null, {
  enableWebSearch: false,
  enableRefinement: false,
});

// 2. フル構成（Web検索あり）
const webSearcher: IWebSearcher = new BraveSearchAdapter(apiKey);
const cragWithWeb = new CorrectiveRAG(evaluator, webSearcher, {
  enableWebSearch: true,
  enableRefinement: true,
  webSearchLimit: 5,
});
```

---

## 6. ディレクトリ構成

```
packages/shared/src/services/search/crag/
├── index.ts                      # 公開エクスポート
├── types.ts                      # 型定義・インターフェース
├── relevance-evaluator.ts        # RelevanceEvaluatorクラス
├── corrective-rag.ts             # CorrectiveRAGクラス
└── __tests__/
    ├── relevance-evaluator.test.ts    # RelevanceEvaluator ユニットテスト
    ├── corrective-rag.test.ts         # CorrectiveRAG ユニットテスト
    └── crag.integration.test.ts       # 統合テスト
```

### 6.1 ファイル責務

| ファイル                    | 責務                             |
| --------------------------- | -------------------------------- |
| index.ts                    | 公開API・型のエクスポート        |
| types.ts                    | 型定義・インターフェース・定数   |
| relevance-evaluator.ts      | RelevanceEvaluatorクラス実装     |
| corrective-rag.ts           | CorrectiveRAGクラス実装          |
| relevance-evaluator.test.ts | RelevanceEvaluatorユニットテスト |
| corrective-rag.test.ts      | CorrectiveRAGユニットテスト      |
| crag.integration.test.ts    | LLM連携統合テスト                |

---

## 7. 統合ポイント設計

### 7.1 入力統合（RRF Fusion + Reranking → CRAG）

| 項目   | 内容                                |
| ------ | ----------------------------------- |
| 入力型 | FusedSearchResult[]                 |
| 入力元 | CONV-07-05 (RRF Fusion + Reranking) |
| 検証   | 空配列チェック、型検証              |

### 7.2 外部サービス統合

| 統合先          | インターフェース | 用途                 |
| --------------- | ---------------- | -------------------- |
| LLMプロバイダー | ILLMClient       | 関連性評価           |
| Web検索         | IWebSearcher     | 補強コンテキスト取得 |

### 7.3 出力統合（CRAG → HybridRAG統合）

| 項目   | 内容                       |
| ------ | -------------------------- |
| 出力型 | CRAGResult                 |
| 出力先 | CONV-07-07 (HybridRAG統合) |
| 検証   | Result型で成功/失敗を明示  |

---

## 8. エラーハンドリング設計

### 8.1 エラー分類

| エラー種別                | 発生箇所             | 処理方法                     |
| ------------------------- | -------------------- | ---------------------------- |
| 入力検証エラー            | evaluate()           | Result.err()で即座に返却     |
| LLM接続エラー             | evaluateIndividual() | Result.err()で上位に伝播     |
| LLMレスポンスパースエラー | parseResponse()      | デフォルト値でフォールバック |
| Web検索エラー             | performWebSearch()   | Web検索をスキップして続行    |

### 8.2 フォールバック戦略

| シナリオ                  | フォールバック動作                   |
| ------------------------- | ------------------------------------ |
| LLMレスポンスがパース不能 | score: 0.5、reason: "Parse error"    |
| Web検索失敗               | augmentedContextなしで結果を返却     |
| 空の検索結果入力          | action: "incorrect"、overallScore: 0 |

---

## 9. 要件との整合性確認

| 要件ID  | 設計対応                                              | 状態 |
| ------- | ----------------------------------------------------- | ---- |
| FR-001  | RelevanceEvaluator.evaluate() + ILLMClient.complete() | ✅   |
| FR-002  | determineAction()で3段階分類                          | ✅   |
| FR-003  | handleCorrect()で結果をそのまま返却                   | ✅   |
| FR-004  | handleIncorrect() + IWebSearcher（オプション）        | ✅   |
| FR-005  | handleAmbiguous()で低スコアフィルタ                   | ✅   |
| FR-006  | refineKnowledge()（enableRefinement: true時）         | ✅   |
| FR-007  | evaluateIndividual()で個別スコア算出                  | ✅   |
| FR-008  | calculateOverallScore()で加重平均                     | ✅   |
| FR-009  | EvaluatorOptionsでカスタマイズ可能                    | ✅   |
| NFR-001 | タイムアウト設定（LLM呼び出し時）                     | ✅   |
| NFR-002 | Result<T, Error>でエラー返却                          | ✅   |
| NFR-005 | 全公開メソッドでResult型使用                          | ✅   |
| NFR-006 | IWebSearcherのコンストラクタ注入                      | ✅   |

---

## 10. 完了確認

- [x] アーキテクチャ（クラス構成・処理フロー）が定義されている
- [x] システム全体における位置づけが明確である
- [x] 依存関係設計が完了している
- [x] ディレクトリ構成が定義されている
- [x] 統合ポイントが設計されている
- [x] エラーハンドリング戦略が定義されている
- [x] 要件との整合性が確認されている
