# Corrective RAG（CRAG）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [interfaces-rag-search.md](./interfaces-rag-search.md)

検索結果の関連性をLLMで評価し、評価結果に応じて補正を行う自己修正RAGパイプライン。

**実装場所**: `packages/shared/src/services/search/crag/`

---

## 変更履歴

| バージョン | 日付       | 変更内容                                           |
| ---------- | ---------- | -------------------------------------------------- |
| v1.2.0     | 2026-03-20 | UT-RAG-08-002 実装準備: `ILLMClient` 形状差分と adapter 前提を追記 |
| v1.1.0     | 2026-01-26 | コードブロックを表形式・文章に変換（ガイドライン準拠） |
| v1.0.0     | -          | 初版作成                                           |

---

## アーキテクチャ

### 処理フロー

CRAGパイプラインは以下の順序で処理を行う。

| ステップ | 処理内容           | 説明                                   |
| -------- | ------------------ | -------------------------------------- |
| 1        | 検索結果受け取り   | HybridRAGからの検索結果を入力として受信 |
| 2        | RelevanceEvaluator | LLMを使用して検索結果の関連性を評価    |
| 3        | アクション判定     | 評価スコアに基づきアクションを決定     |
| 4        | 補正処理           | アクションに応じた補正を実行           |
| 5        | CRAGResult出力     | 補正済み検索結果を出力                 |

### アクション分岐

評価結果に応じて3種類のアクションに分岐する。

| アクション | 条件               | 処理内容                               |
| ---------- | ------------------ | -------------------------------------- |
| correct    | スコア ≥ 0.7       | 結果をそのまま使用（オプションでRefine）|
| ambiguous  | 0.3 < スコア < 0.7 | 低スコア結果をフィルタし、Refine実行   |
| incorrect  | スコア ≤ 0.3       | 結果を破棄し、Web検索で補強            |

---

## 主要インターフェース

### IRelevanceEvaluator

関連性評価器

| メソッド   | 戻り値                                      | 説明                     |
| ---------- | ------------------------------------------- | ------------------------ |
| evaluate() | Promise<Result<RelevanceEvaluation, Error>> | 検索結果全体の関連性評価 |

### ICorrectiveRAG

Corrective RAGプロセッサ

| メソッド  | 戻り値                             | 説明                 |
| --------- | ---------------------------------- | -------------------- |
| process() | Promise<Result<CRAGResult, Error>> | 検索結果を評価・補正 |

---

## 型定義

### RelevanceAction

関連性評価結果のアクション種別を表すユニオン型。

| 値        | 説明                                           |
| --------- | ---------------------------------------------- |
| correct   | 検索結果が十分に関連性あり（そのまま使用可能） |
| incorrect | 検索結果が関連性なし（破棄してWeb検索で補強）  |
| ambiguous | 検索結果が曖昧（フィルタリング後に再評価）     |

### RelevanceEvaluation

| プロパティ       | 型                | 説明                          |
| ---------------- | ----------------- | ----------------------------- |
| overallScore     | number            | 全体スコア（0.0-1.0）加重平均 |
| action           | RelevanceAction   | 評価アクション                |
| individualScores | IndividualScore[] | 各結果の個別スコア            |
| reasoning        | string            | 評価の推論理由                |

### IndividualScore

| プロパティ | 型      | 説明                    |
| ---------- | ------- | ----------------------- |
| chunkId    | ChunkId | チャンクID              |
| score      | number  | 関連性スコア（0.0-1.0） |
| reason     | string  | スコアの理由            |

### CRAGResult

| プロパティ       | 型                  | 説明                          |
| ---------------- | ------------------- | ----------------------------- |
| results          | FusedSearchResult[] | 補正後の検索結果              |
| evaluation       | object              | 評価情報（下記参照）          |
| augmentedContext | string \| undefined | Web検索による補強コンテキスト |

**evaluation**:

| プロパティ     | 型                 | 説明                   |
| -------------- | ------------------ | ---------------------- |
| relevanceScore | number             | 関連性スコア           |
| action         | RelevanceAction    | 実行されたアクション   |
| corrections    | CorrectionAction[] | 実行された補正アクション |

### CorrectionAction

補正処理のアクション種別を表す判別ユニオン型。typeプロパティで種別を判別する。

| type       | 追加プロパティ    | 説明                         |
| ---------- | ----------------- | ---------------------------- |
| keep       | reason: string    | 結果を保持（理由を記録）     |
| discard    | reason: string    | 結果を破棄（理由を記録）     |
| refine     | refinedQuery: string | クエリを再構成して再検索   |
| web_search | searchQuery: string  | Web検索で情報を補強        |
| expand     | expansionStrategy: string | 拡張戦略を適用して検索拡大 |

---

## 設定オプション

### EvaluatorOptions

| プロパティ         | 型     | デフォルト | 説明                |
| ------------------ | ------ | ---------- | ------------------- |
| maxEvaluate        | number | 5          | 評価する最大結果数  |
| correctThreshold   | number | 0.7        | correct判定の閾値   |
| incorrectThreshold | number | 0.3        | incorrect判定の閾値 |

### CRAGOptions

| プロパティ                | 型      | デフォルト | 説明                       |
| ------------------------- | ------- | ---------- | -------------------------- |
| enableWebSearch           | boolean | false      | Web検索補強を有効化        |
| enableRefinement          | boolean | false      | Knowledge Refinement有効化 |
| ambiguousFilterThreshold  | number  | 0.4        | Ambiguous時のフィルタ閾値  |
| minResultsBeforeWebSearch | number  | 3          | Web検索前の最小結果数      |
| webSearchLimit            | number  | 5          | Web検索結果数上限          |

---

## 外部依存インターフェース

### ILLMClient

| メソッド   | 戻り値                         | 説明                 |
| ---------- | ------------------------------ | -------------------- |
| complete() | Promise<Result<string, Error>> | プロンプト補完を生成 |

**complete()パラメータ**:

| パラメータ  | 型     | 説明           |
| ----------- | ------ | -------------- |
| prompt      | string | プロンプト     |
| maxTokens   | number | 最大トークン数 |
| temperature | number | 生成温度       |

**実装メモ**:

- `RelevanceEvaluator` は `complete({ prompt, maxTokens, temperature })` 形状を要求する
- `services/llm/types.ts` 側 `ILLMClient` は `complete(prompt, options?)` 形状であり、そのままは代入できない
- `HybridRAGFactory` で CRAG を組み立てる場合は、`llm/types` 側 client からこの形状へ変換する adapter を用意する

### IWebSearcher

| メソッド | 戻り値                                    | 説明          |
| -------- | ----------------------------------------- | ------------- |
| search() | Promise<Result<WebSearchResult[], Error>> | Web検索を実行 |

### WebSearchResult

| プロパティ | 型     | 説明             |
| ---------- | ------ | ---------------- |
| title      | string | 結果のタイトル   |
| url        | string | 結果のURL        |
| snippet    | string | 結果のスニペット |

---

## 定数

### CRAG_DEFAULTS

| 定数名                        | 値    | 説明                    |
| ----------------------------- | ----- | ----------------------- |
| MAX_EVALUATE                  | 5     | 評価する最大結果数      |
| CORRECT_THRESHOLD             | 0.7   | correct判定の閾値       |
| INCORRECT_THRESHOLD           | 0.3   | incorrect判定の閾値     |
| AMBIGUOUS_FILTER_THRESHOLD    | 0.4   | Ambiguous時フィルタ閾値 |
| MIN_RESULTS_BEFORE_WEB_SEARCH | 3     | Web検索前の最小結果数   |
| WEB_SEARCH_LIMIT              | 5     | Web検索結果数上限       |
| EVALUATION_TIMEOUT_MS         | 10000 | LLM評価タイムアウト(ms) |
| MAX_TOKENS                    | 500   | LLM評価の最大トークン数 |
| TEMPERATURE                   | 0     | LLM評価の温度           |

---

## 型ガード

| 関数名                | 説明                           |
| --------------------- | ------------------------------ |
| isCRAGResultCorrect   | CRAGResultがcorrect判定か      |
| isCRAGResultIncorrect | CRAGResultがincorrect判定か    |
| isCRAGResultAmbiguous | CRAGResultがambiguous判定か    |
| isKeepAction          | CorrectionActionがkeepか       |
| isDiscardAction       | CorrectionActionがdiscardか    |
| isWebSearchAction     | CorrectionActionがweb_searchか |

---

## アクション決定ロジック

| 条件               | アクション | 処理                                   |
| ------------------ | ---------- | -------------------------------------- |
| overallScore ≥ 0.7 | correct    | 結果をそのまま使用（Refineオプション） |
| overallScore ≤ 0.3 | incorrect  | 結果を破棄、Web検索で補強              |
| 0.3 < score < 0.7  | ambiguous  | 低スコア結果をフィルタ+Refine          |

---

## テスト品質

- **RelevanceEvaluator**: 12テストケース（RE-001〜RE-012）
- **CorrectiveRAG**: 11テストケース（CR-001〜CR-011）
- **カバレッジ**: Line 80%+, Branch 60%+, Function 80%+

**詳細参照**: `docs/30-workflows/corrective-rag/outputs/phase-12/implementation-guide.md`

---

## 関連ドキュメント

- [検索クエリ・結果型定義](./rag-search-types.md)
- [HybridRAG統合](./rag-search-hybrid.md)
