# Phase 6: テスト拡充 - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目          | 値                                                                         |
| ------------- | -------------------------------------------------------------------------- |
| タスクID      | UT-RAG-08-002                                                              |
| Phase         | 6 - テスト拡充                                                             |
| 前提Phase     | Phase 5: 実装                                                              |
| 次Phase       | Phase 7: カバレッジ確認                                                    |
| 対象ファイル  | `packages/shared/src/services/search/__tests__/hybrid-rag-factory.test.ts` |
| 作成日        | 2026-03-20                                                                 |
| 前Phase成果物 | `outputs/phase-5/implementation-plan.md`                                   |

## 目的

Phase 4 の Red テストを Green にした後、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成するために追加テストを作成する。分岐網羅・境界値・limitation の回帰ガードを固定する。

## 実行タスク

- 分岐テスト追加: createReranker() の4パターン全てが正しいクラスを生成することを詳細検証する
- CRAG 分岐テスト追加: enableCRAG の true/false/未指定 + webSearcher の有無の組み合わせを網羅する
- バリデーション分岐追加: 複数バリデーションエラーの優先順序を検証する
- adapter テスト追加（該当する場合）: ILLMClient アダプタまたは KeywordSearchStrategy adapter の変換ロジックを検証する
- limitation 記録: graph queryType が Engine から GraphSearchStrategy に渡らない既知制限を回帰ガードとして記録する

## 追加テストケース設計

### ETC-01: createFull() の CRAG オプション渡し検証

| 項目     | 内容                                                                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 目的     | enableCRAG: true 時に CRAG オプション（cragMaxEvaluate, cragCorrectThreshold, cragIncorrectThreshold, ambiguousFilterThreshold）が CorrectiveRAG に渡されることを検証 |
| 入力     | FullHybridRAGConfig（enableCRAG: true, cragMaxEvaluate: 3, cragCorrectThreshold: 0.8）                                                                                |
| 期待結果 | HybridRAGEngine インスタンスが返される                                                                                                                                |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true                                                                                                              |

### ETC-02: createFull() の enableCRAG: false 明示指定

| 項目     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 目的     | enableCRAG を明示的に false にした場合に CRAG が null であることを検証 |
| 入力     | FullHybridRAGConfig（enableCRAG: false）                               |
| 期待結果 | HybridRAGEngine インスタンスが返される（CRAG なし）                    |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true               |

### ETC-03: createFull() の cohereModel オプション渡し検証

| 項目     | 内容                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| 目的     | rerankerType: "cohere" で cohereModel が CohereReranker に渡されることを検証                 |
| 入力     | FullHybridRAGConfig（rerankerType: "cohere", cohereApiKey: "key", cohereModel: "rerank-v3"） |
| 期待結果 | HybridRAGEngine インスタンスが返される                                                       |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true                                     |

### ETC-04: createFull() の rerankerBatchSize オプション渡し検証

| 項目     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 目的     | rerankerType: "llm" で rerankerBatchSize が LLMReranker に渡されることを検証 |
| 入力     | FullHybridRAGConfig（rerankerType: "llm", rerankerBatchSize: 5）             |
| 期待結果 | HybridRAGEngine インスタンスが返される                                       |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true                     |

### ETC-05: createFull() のバリデーション優先順序

| 項目     | 内容                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| 目的     | 複数のバリデーションエラーが同時に発生する場合、最初のバリデーションが優先されることを検証 |
| 入力     | FullHybridRAGConfig（rerankerType: "cohere", cohereApiKey 省略, llmProvider 省略）         |
| 期待結果 | 最初のバリデーション（llmProvider または cohereApiKey）のエラーが throw される             |
| 検証方法 | `expect(() => ...).toThrow()` でエラーメッセージを検証                                     |

### ETC-06: createLite() が LLM 関連コンポーネントを使用しないことの検証

| 項目     | 内容                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| 目的     | createLite() が llmClient / llmProvider を必要としないことを検証                                               |
| 入力     | LiteHybridRAGConfig（db, embeddingProvider, graphStore のみ）                                                  |
| 期待結果 | エラーなく HybridRAGEngine が返される                                                                          |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true。Config に llmClient が存在しないことを型レベルで確認 |

### ETC-07: createForTesting() オプションコンポーネント省略時のデフォルト

| 項目     | 内容                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------- |
| 目的     | createForTesting() で fusion / reranker / crag / options を省略した場合のデフォルト動作を検証   |
| 入力     | TestMocks（必須4プロパティのみ）                                                                |
| 期待結果 | HybridRAGEngine が RRFFusion(デフォルト) + NoOpReranker + crag: null + options: {} で生成される |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true                                        |

### ETC-08: createForTesting() カスタム fusion / reranker / crag

| 項目     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| 目的     | createForTesting() で全オプションを指定した場合の動作を検証                                 |
| 入力     | TestMocks（全プロパティ指定: queryClassifier, strategies, fusion, reranker, crag, options） |
| 期待結果 | 指定されたコンポーネントで HybridRAGEngine が生成される                                     |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true                                    |

### ETC-09: graph queryType limitation の回帰記録

| 項目     | 内容                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| 目的     | HybridRAGEngine が GraphSearchStrategy に queryType を渡さない既知制限を回帰ガードとして記録       |
| 入力     | createFull() で生成した Engine                                                                     |
| 期待結果 | Engine.search() 呼び出し時に GraphSearchStrategy.search() の options 引数に queryType が含まれない |
| 検証方法 | モック GraphSearchStrategy の search() に渡された引数を spy で検証                                 |

### ETC-10: adapter テスト（ILLMClient 型不整合解決後に追加）

| 項目     | 内容                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------- |
| 目的     | ILLMClient アダプタ（選択肢B の場合）または cragLlmClient（選択肢A の場合）が正しく機能することを検証 |
| 入力     | DT-01 選択肢に依存                                                                                    |
| 期待結果 | RelevanceEvaluator に渡される llmClient が正しい complete() シグネチャを持つ                          |
| 検証方法 | Phase 5 の設計判断確定後にテスト内容を確定する                                                        |

## テスト構造（追加分）

```
describe("HybridRAGFactory", () => {
  // Phase 4 のテスト（TC-01〜TC-16）は既存

  describe("createFull() -- 拡充", () => {
    it("ETC-01: CRAG オプションが CorrectiveRAG に渡される")
    it("ETC-02: enableCRAG: false で CRAG なし Engine を返す")
    it("ETC-03: cohereModel が CohereReranker に渡される")
    it("ETC-04: rerankerBatchSize が LLMReranker に渡される")
    it("ETC-05: バリデーション優先順序が一貫している")
  })
  describe("createLite() -- 拡充", () => {
    it("ETC-06: LLM 関連コンポーネントを使用しない")
  })
  describe("createForTesting() -- 拡充", () => {
    it("ETC-07: オプション省略時のデフォルト動作")
    it("ETC-08: カスタム fusion / reranker / crag")
  })
  describe("limitation 回帰ガード", () => {
    it("ETC-09: graph queryType が Engine から渡らない")
  })
  describe("adapter", () => {
    it("ETC-10: ILLMClient アダプタ / cragLlmClient")
  })
})
```

## 参照資料

| 資料名                        | パス / 場所                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| Phase 4 テスト仕様            | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-4-test-creation.md`         |
| Phase 5 実装仕様              | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-5-implementation.md`        |
| graph contract                | `.claude/skills/aiworkflow-requirements/references/rag-search-graph.md`              |
| CRAG contract                 | `.claude/skills/aiworkflow-requirements/references/rag-search-crag.md`               |
| quality-requirements-advanced | `.claude/skills/aiworkflow-requirements/references/quality-requirements-advanced.md` |

## 成果物

| 成果物           | パス                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------- |
| 拡充テストコード | `packages/shared/src/services/search/__tests__/hybrid-rag-factory.test.ts`（追記）     |
| 回帰計画         | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-6/regression-plan.md` |

## 完了条件

- [ ] ETC-01〜ETC-10 の追加テストケースが作成されている（ETC-10 は DT-01 選択肢確定後）
- [ ] rerankerType 4パターンの分岐が全て Green で検証されている
- [ ] CRAG の enabled / disabled / 未指定 / webSearcher有無 の組み合わせが検証されている
- [ ] createForTesting() のデフォルト動作とカスタム動作の両方が検証されている
- [ ] graph queryType limitation が回帰ガードとして記録されている
- [ ] 外部 API（Cohere, Voyage）のテストがネットワーク依存を持っていない（モックで完結）
- [ ] 全テスト（TC + ETC）が Green で PASS している
- [ ] `cd packages/shared && pnpm vitest run src/services/search/__tests__/hybrid-rag-factory.test.ts` が全 PASS

## 統合テスト連携

- Phase 7 で scoped coverage を測定する前に、全分岐のテストが完了していること
- ETC-09 の limitation は Phase 12 の未タスク検出で future improvement として記録する
- adapter テスト（ETC-10）は統合テストの観点も含む（ILLMClient 変換の E2E）

## 多角的チェック観点（AIが判断）

1. **graph queryType limitation**: テストを失敗テスト（`.todo` / `.skip`）にするか、documentation-only（コメント記録）にするか。Engine の仕様変更が本タスクスコープ外であるため、コメント + 未タスク化が妥当
2. **mock の粒度**: adapter と factory で mock の粒度が一致しているか。factory テストでは Engine レベルのインスタンス検証、adapter テストでは変換ロジックの詳細検証と分離する
3. **external API key 系テスト**: Cohere / Voyage のテストがネットワーク通信を発生させないこと。`fetch` をモックし、API 呼び出しが到達しないことを確認する

## タスク100%実行確認【必須】

- [ ] 本仕様書の全セクションを読み通し、漏れがないことを確認した
- [ ] 追加テストケース（ETC-01〜ETC-10）が設計されていることを確認した
- [ ] 回帰ガードが増やせることを確認した
- [ ] 次 Phase（Phase 7: カバレッジ確認）への十分な材料があることを確認した

## 次Phase

Phase 7: カバレッジ確認 → `phase-7-coverage-check.md`
