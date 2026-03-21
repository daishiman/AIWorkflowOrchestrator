# Phase 6: テスト拡充 - 回帰計画

## 実行結果

| 項目               | 結果       |
| ------------------ | ---------- |
| 実行日             | 2026-03-21 |
| Phase 4 既存テスト | 22 PASS    |
| Phase 6 追加テスト | 21 PASS    |
| 合計テスト数       | 43 PASS    |

## 追加テストケース

### ETC-01: CRAGオプションがCorrectiveRAGに渡される

- RelevanceEvaluator に maxEvaluate/correctThreshold/incorrectThreshold が渡されることを検証
- CorrectiveRAG に enableWebSearch/enableRefinement/ambiguousFilterThreshold が渡されることを検証

### ETC-02: enableCRAG: false 明示指定でCRAGなし

- RelevanceEvaluator/CorrectiveRAG が呼ばれないことを検証
- HybridRAGEngine に crag: null が渡されることを検証

### ETC-03: cohereModel が CohereReranker に渡される

- CohereReranker(apiKey, { model }) の引数を検証

### ETC-04: rerankerBatchSize が LLMReranker に渡される

- LLMReranker(client, { batchSize: 5 }) の引数を検証

### ETC-05/05b/05c: バリデーション優先順序

- cohereApiKey > cragLlmClient の優先順位
- voyageApiKey > cragLlmClient の優先順位
- rerankerLlmClient > cragLlmClient の優先順位

### 追加分岐テスト

- enableCRAG 未指定(undefined)でCRAGなし
- webSearcher 指定時に CorrectiveRAG に渡される
- communitySummarizer が GraphSearchStrategy に渡される
- rrfK 未指定時にデフォルト値60
- cohereModel/rerankerBatchSize 未指定時に undefined

### ETC-06: createLite() がLLM関連コンポーネントを使用しない

- LLMQueryClassifier/CohereReranker/VoyageReranker/LLMReranker/CorrectiveRAG/RelevanceEvaluator が呼ばれないことを検証
- RRFFusion デフォルト引数、GraphSearchStrategy に communitySummarizer なし

### ETC-07/08: createForTesting() 拡充

- ETC-07: 省略時のデフォルト(RRFFusion + NoOpReranker + crag:null + options:{})
- ETC-08: カスタム fusion/reranker/crag/options 全指定

### ETC-09: graph queryType limitation 回帰ガード

- GraphSearchStrategy コンストラクタ引数に queryType が含まれないことを確認
- 既知制限として記録、Phase 12 で未タスク化候補

### ETC-10/10b: adapter テスト

- createFull()/createLite() 両方で strategies.keyword/semantic/graph が全て定義されていることを検証

## 回帰リスク評価

| リスク                 | 影響度 | 対策                                             |
| ---------------------- | ------ | ------------------------------------------------ |
| Reranker 分岐変更      | 中     | 4パターン全てのテストで検証済み                  |
| CRAG 設定変更          | 中     | enabled/disabled/未指定の3パターンで検証済み     |
| バリデーション順序変更 | 低     | 3パターンの優先順位テストで検出可能              |
| adapter 変更           | 低     | vi.mock でモック化済み、Factory 配線テストで検証 |
