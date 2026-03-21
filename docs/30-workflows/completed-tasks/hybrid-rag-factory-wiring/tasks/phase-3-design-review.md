# Phase 3: 設計レビュー - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目          | 値                                                          |
| ------------- | ----------------------------------------------------------- |
| タスクID      | `UT-RAG-08-002`                                             |
| Phase         | `3 - 設計レビュー`                                          |
| 前提Phase     | `Phase 2: 設計`                                             |
| 次Phase       | `Phase 4: テスト作成`                                       |
| 対象ファイル  | `packages/shared/src/services/search/hybrid-rag-factory.ts` |
| 作成日        | 2026-03-20                                                  |
| 前Phase成果物 | `outputs/phase-2/design.md`                                 |

## 目的

Phase 2 設計が「現行コードに整合するか」「scope creep を起こしていないか」「Phase 12 の同期対象まで固定できているか」を判定する。

## 実行タスク

- adapter 設計レビュー: keyword bridge の責務を検証する
- config 設計レビュー: LLM interface split を安全に扱えているか確認する
- scope レビュー: engine 改修を別 concern として切れているか確認する
- spec sync レビュー: Phase 12 の same-wave 同期対象が不足していないか確認する

## レビュー観点

### RV-01: Factory パターンの適切性

- [ ] `createFull()` / `createLite()` が `static` メソッドとして適切か
- [ ] helper へ責務分離できているか
- [ ] `createForTesting()` との一貫性が保たれているか

### RV-02: 型置換と config 契約の完全性

- [ ] 5つのプレースホルダー型が全て削除対象として管理されていること
- [ ] `@placeholder` JSDoc タグが残存していないこと
- [ ] 置換先の import パスが実在すること
- [ ] `FullHybridRAGConfig` / `LiteHybridRAGConfig` が現行 interface split と一致していること
- [ ] `TestMocks` が影響を受けないこと

### RV-03: エラーハンドリング設計（P62 準拠）

- [ ] `cohereApiKey` / `voyageApiKey` の不足が明示エラーになるか
- [ ] `rerankerType === "llm"` で `rerankerLlmClient` 不足が明示エラーになるか
- [ ] `enableCRAG === true` で `cragLlmClient` 不足が明示エラーになるか
- [ ] `llmProvider` が必須であることが config 契約に固定されているか
- [ ] エラーメッセージに `HybridRAGFactory.createFull():` が付くか
- [ ] 暗黙 fallback が存在しないか

### RV-04: HybridRAGEngine コンストラクタとの整合性

- [ ] `LLMQueryClassifier` が `IQueryClassifier` を満たすか
- [ ] `RuleBasedQueryClassifier` が `IQueryClassifier` を満たすか
- [ ] keyword adapter / `VectorSearchStrategy` / `GraphSearchStrategy` が `ISearchStrategy` を満たすか
- [ ] `RRFFusion` が `IFusionStrategy` を満たすか
- [ ] 4種 `Reranker` が `IReranker` を満たすか
- [ ] `CorrectiveRAG | null` が engine 契約に一致するか

### RV-05: DIP と関心ごとの分離

- [ ] keyword 特有の bridge が adapter へ閉じ込められているか
- [ ] caller が interface を渡す構造になっているか
- [ ] factory が strategy 本体の責務を奪っていないか

### RV-06: テスタビリティ

- [ ] full / lite / error path を個別にテストできるか
- [ ] `createForTesting()` の回帰 guard を維持できるか
- [ ] adapter 単体テストを分離できるか

### RV-07: ILLMClient / ILLMProvider 型互換性

- [ ] shared `ILLMClient` と CRAG `ILLMClient` の差分が明確か
- [ ] `LLMReranker` 用と `RelevanceEvaluator` 用の client を分離した設計になっているか
- [ ] `LLMQueryClassifier` が要求する `ILLMProvider` と config の `llmProvider` が一致するか

### RV-08: Phase 12 sync 対象の妥当性

- [ ] `architecture-rag.md`, `rag-search-hybrid.md`, `rag-query-pipeline.md` が必須同期対象として記載されているか
- [ ] `task-workflow.md` と `lessons-learned-current.md` が same-wave sync に含まれているか
- [ ] API spec が `N/A` 判定であることが記録されているか

## ゲート判定

| 判定  | 対応                              |
| ----- | --------------------------------- |
| PASS  | Phase 4 へ進む                    |
| MINOR | 指摘を修正してから Phase 4 へ進む |
| MAJOR | Phase 2 へ戻る                    |

## 参照資料

| 資料名                | パス / 場所                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義書    | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-1-requirements.md`                                                  |
| Phase 2 設計書        | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-2-design.md`                                                        |
| hybrid-rag-factory.ts | `packages/shared/src/services/search/hybrid-rag-factory.ts`                                                                  |
| architecture-rag      | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                                                      |
| pitfalls              | `.claude/rules/06-known-pitfalls.md#P19`, `.claude/rules/06-known-pitfalls.md#P34`, `.claude/rules/06-known-pitfalls.md#P62` |

## 成果物

| 成果物           | パス                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------ |
| 設計レビュー結果 | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-3/design-review.md` |

## 完了条件

- [ ] RV-01 から RV-08 の判定結果が記録されている
- [ ] ゲート判定が明記されている
- [ ] follow-up 候補がある場合は明記されている
- [ ] Phase 4 に渡すテスト観点が整理されている

## 統合テスト連携

- RV-04 の engine 整合性は Phase 4 の factory / adapter テストへ反映する
- RV-06 のテスタビリティ要件は Phase 4 のモック設計へ反映する
- RV-03 のバリデーション設計は Phase 4 の異常系テストケースへ反映する

## 多角的チェック観点（AIが判断）

1. `keyword-search-strategy-adapter.ts` を追加した場合の import cycle がないか。
2. `communitySummarizer` を optional のまま full config に含める妥当性があるか。
3. graph queryType limitation を follow-up に切り出す妥当性があるか。

## タスク100%実行確認【必須】

- [ ] 本仕様書の全セクションを読み通し、漏れがないことを確認した
- [ ] レビュー観点が網羅的であることを確認した
- [ ] 次 Phase へ十分な引き継ぎがあることを確認した

## 次Phase

Phase 4: テスト作成 → `phase-4-test-creation.md`
