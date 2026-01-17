# Phase 1 成果物: 要件定義書

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| タスクID | CONV-07-06                                |
| フェーズ | Phase 1: 要件定義                         |
| 作成日   | 2026-01-16                                |
| 対象機能 | Corrective RAG (CRAG)                     |
| 実装場所 | packages/shared/src/services/search/crag/ |

---

## 1. 機能要件 (Functional Requirements)

### FR-001: LLMベースの関連性評価

| 項目   | 内容                                                                         |
| ------ | ---------------------------------------------------------------------------- |
| ID     | FR-001                                                                       |
| 要件   | LLMを使用して検索結果の関連性を評価できる                                    |
| 優先度 | 必須                                                                         |
| 説明   | ILLMClient.complete()を使用し、検索結果とクエリの関連性を0-1スコアで評価する |
| 入力   | SearchQuery, FusedSearchResult[]                                             |
| 出力   | RelevanceEvaluation (overallScore, action, individualScores)                 |

### FR-002: 3段階アクション分類

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| ID           | FR-002                                                                   |
| 要件         | 関連性評価結果を3段階（correct/incorrect/ambiguous）で分類できる         |
| 優先度       | 必須                                                                     |
| 説明         | 全体スコアに基づいてアクションを決定（閾値: correct≥0.7, incorrect≤0.3） |
| 判定ロジック | overallScore ≥ 0.7 → correct, ≤ 0.3 → incorrect, 中間 → ambiguous        |

### FR-003: Correct処理

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| ID         | FR-003                                               |
| 要件       | "correct"判定時、検索結果をそのまま返却できる        |
| 優先度     | 必須                                                 |
| 説明       | 関連性が高い場合、入力された検索結果をそのまま返却   |
| オプション | enableRefinement: true時はKnowledge Refinementを適用 |

### FR-004: Incorrect処理（Web検索補強）

| 項目   | 内容                                                                 |
| ------ | -------------------------------------------------------------------- |
| ID     | FR-004                                                               |
| 要件   | "incorrect"判定時、検索結果を破棄しWeb検索で補強できる（オプション） |
| 優先度 | 任意                                                                 |
| 説明   | 関連性が低い場合、元の結果を破棄し、IWebSearcher経由でWeb検索を実行  |
| 条件   | enableWebSearch: true かつ webSearcherが注入されている場合           |

### FR-005: Ambiguous処理（フィルタリング）

| 項目   | 内容                                                                  |
| ------ | --------------------------------------------------------------------- |
| ID     | FR-005                                                                |
| 要件   | "ambiguous"判定時、低スコア結果をフィルタリングできる                 |
| 優先度 | 必須                                                                  |
| 説明   | 個別スコアがambiguousFilterThreshold（デフォルト0.4）未満の結果を除外 |

### FR-006: Knowledge Refinement

| 項目   | 内容                                                       |
| ------ | ---------------------------------------------------------- |
| ID     | FR-006                                                     |
| 要件   | Knowledge Refinementにより不要情報を除去できる             |
| 優先度 | 任意                                                       |
| 説明   | enableRefinement: true時に、検索結果から関連部分のみを抽出 |

### FR-007: 個別スコア算出

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| ID       | FR-007                                                   |
| 要件     | 個別の検索結果に対して関連性スコア（0-1）を算出できる    |
| 優先度   | 必須                                                     |
| 説明     | LLMからの評価（0-10スコア）を0-1に正規化し、各結果に付与 |
| 出力形式 | IndividualScore { chunkId, score, reason }               |

### FR-008: 全体スコア計算（加重平均）

| 項目   | 内容                                                   |
| ------ | ------------------------------------------------------ |
| ID     | FR-008                                                 |
| 要件   | 全体の関連性スコアを加重平均で計算できる               |
| 優先度 | 必須                                                   |
| 説明   | 上位結果に重みを付けた加重平均（weights[i] = 1/(i+1)） |
| 計算式 | overallScore = Σ(score[i] \* weight[i]) / Σ(weight[i]) |

### FR-009: 評価プロンプトカスタマイズ

| 項目   | 内容                                                      |
| ------ | --------------------------------------------------------- |
| ID     | FR-009                                                    |
| 要件   | 評価プロンプトをカスタマイズ可能なオプションを提供できる  |
| 優先度 | 任意                                                      |
| 説明   | EvaluatorOptionsでmaxEvaluate、閾値などをカスタマイズ可能 |

---

## 2. 非機能要件 (Non-Functional Requirements)

### NFR-001: タイムアウト制御

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| ID       | NFR-001                                            |
| 要件     | 評価処理のタイムアウトは10秒以内                   |
| 優先度   | 必須                                               |
| 説明     | LLM API呼び出しにタイムアウト設定（10000ms）を適用 |
| 測定方法 | 統合テストでタイムアウトを確認                     |

### NFR-002: エラーハンドリング

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| ID         | NFR-002                                                 |
| 要件       | LLM API呼び出しの失敗時にエラーを適切にハンドリングする |
| 優先度     | 必須                                                    |
| 説明       | Result.err()でエラーを返却、例外をthrowしない           |
| エラー種別 | LLM接続エラー、タイムアウト、パースエラー               |

### NFR-003: テストカバレッジ

| 項目     | 内容                                              |
| -------- | ------------------------------------------------- |
| ID       | NFR-003                                           |
| 要件     | テストカバレッジ Line 80%以上                     |
| 優先度   | 必須                                              |
| 測定方法 | `pnpm test:coverage`でLine Coverage 80%以上を確認 |

### NFR-004: 型安全性

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| ID       | NFR-004                                  |
| 要件     | 型安全性を確保（TypeScript strict mode） |
| 優先度   | 必須                                     |
| 説明     | any型の使用を避け、厳密な型定義を維持    |
| 検証方法 | `pnpm typecheck`でエラーなしを確認       |

### NFR-005: Result型エラーハンドリング

| 項目   | 内容                                                    |
| ------ | ------------------------------------------------------- |
| ID     | NFR-005                                                 |
| 要件   | Result型でエラーを明示的に扱う                          |
| 優先度 | 必須                                                    |
| 説明   | RAGパイプライン標準に従い、Result<T, Error>で結果を返却 |
| 参照   | packages/shared/src/types/rag/result.ts                 |

### NFR-006: Web検索の依存性注入

| 項目   | 内容                                               |
| ------ | -------------------------------------------------- |
| ID     | NFR-006                                            |
| 要件   | Web検索オプションは依存性注入で制御可能            |
| 優先度 | 任意                                               |
| 説明   | IWebSearcherインターフェースをコンストラクタで注入 |

---

## 3. 統合テスト連携要件

### 接続要件

| カテゴリ     | 要件                                                          |
| ------------ | ------------------------------------------------------------- |
| LLM API接続  | ILLMClient.complete()を使用して関連性評価プロンプトを送信     |
| 検索結果入力 | FusedSearchResult[]（RRF Fusion + Rerankingの出力）を受け取る |
| Web検索連携  | IWebSearcher.search()（オプション、DI可能）                   |
| 出力形式     | CRAGResult（評価結果・補正結果・補強コンテキスト）            |

### インターフェース契約

```typescript
// ILLMClient（既存インターフェース）
interface ILLMClient {
  complete(options: {
    prompt: string;
    maxTokens: number;
    temperature: number;
  }): Promise<Result<string, Error>>;
}

// IWebSearcher（新規定義）
interface IWebSearcher {
  search(
    query: string,
    limit: number,
  ): Promise<Result<WebSearchResult[], Error>>;
}

// FusedSearchResult（RRF Fusion出力）
interface FusedSearchResult {
  chunkId: ChunkId;
  content: string;
  score: number;
  sources: SearchSource[];
}

// CRAGResult（CRAG出力）
interface CRAGResult {
  results: FusedSearchResult[];
  evaluation: {
    relevanceScore: number;
    action: "correct" | "incorrect" | "ambiguous";
    corrections: CorrectionAction[];
  };
  augmentedContext?: string;
}
```

---

## 4. 依存関係

| 依存先                  | 種別       | 説明                                    |
| ----------------------- | ---------- | --------------------------------------- |
| CONV-07-05 (RRF Fusion) | 前提       | FusedSearchResult[]を入力として受け取る |
| ILLMClient              | 必須       | 関連性評価のLLM呼び出し                 |
| IWebSearcher            | オプション | Web検索による補強（DI可能）             |
| Result型                | 必須       | エラーハンドリング                      |
| FusedSearchResult       | 必須       | 入力型定義                              |

---

## 5. システム仕様との整合性確認

| 参照資料                 | 確認項目                                          | 整合性 |
| ------------------------ | ------------------------------------------------- | ------ |
| interfaces-rag-search.md | CRAGScore型、cragEnabledオプションの定義を確認    | ✅     |
| architecture-rag.md      | HybridRAGパイプラインにおけるCRAGの位置付けを確認 | ✅     |
| interfaces-core.md       | Result型、ILLMClient定義を確認                    | ✅     |
| error-handling.md        | エラー分類・リトライ戦略を確認                    | ✅     |

---

## 6. 完了確認

- [x] 全機能要件（FR-001〜FR-009）が抽出されている
- [x] 全非機能要件（NFR-001〜NFR-006）が抽出されている
- [x] 各要件に優先度が設定されている
- [x] 接続要件（LLM API/検索結果入力/Web検索連携）が明記されている
- [x] システム仕様との整合性が確認されている
