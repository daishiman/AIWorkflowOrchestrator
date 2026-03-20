# Phase 10: 最終レビュー - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目          | 値                                                          |
| ------------- | ----------------------------------------------------------- |
| タスクID      | `UT-RAG-08-002`                                             |
| Phase         | `10 - 最終レビュー`                                         |
| 前提Phase     | `Phase 9: 品質保証`                                         |
| 次Phase       | `Phase 11: 手動テスト`                                      |
| 対象ファイル  | `packages/shared/src/services/search/hybrid-rag-factory.ts` |
| 作成日        | 2026-03-20                                                  |
| 前Phase成果物 | `outputs/phase-9/quality-report.md`                         |

## 目的

実装・テスト・品質・Phase 12 sync 対象を多角的に検証し、最終判定を確定する。follow-up を formalize し、Phase 11 と Phase 12 へ明確に引き継ぐ。

## 実行タスク

- [ ] 品質レビュー: Phase 9 report の typecheck / test / coverage を確認する
- [ ] 設計レビュー: Phase 3 のレビュー観点（RV-01〜RV-07）を実装に照らして再検証する
- [ ] Pitfall チェック: P19 / P42 / P62 / P63 の各パターンを実装で確認する
- [ ] DIP 準拠チェック: IPC ハンドラ相当部分の依存方向を確認する
- [ ] limitation レビュー: graph queryType 等の follow-up 対象を formalize する
- [ ] Phase 12 sync 対象レビュー: 最終確認を行う
- [ ] ゲート判定: PASS / MINOR / MAJOR / CRITICAL を 1 つに確定する

## RV-01〜RV-07 再検証（Phase 3 レビュー観点の再確認）

### RV-01: Factory パターンの適切性（再確認）

- [ ] `createFull()` / `createLite()` が `static` メソッドとして適切に実装されているか
- [ ] helper が責務ごとに適切に分離されているか（`validateFullConfig` / `createReranker` / `createCrag`）
- [ ] `createForTesting()` との一貫性が保たれているか

### RV-02: 型置換と config 契約の完全性（再確認）

- [ ] 5 つのプレースホルダー型が全て削除されていること
- [ ] `@placeholder` JSDoc タグがゼロ件であること（grep で確認済みであること）
- [ ] 置換先の import パスが実在すること
- [ ] `FullHybridRAGConfig` / `LiteHybridRAGConfig` が設計と一致していること
- [ ] `TestMocks` が影響を受けていないこと

### RV-03: エラーハンドリング設計（P62 準拠、再確認）

- [ ] `cohereApiKey` / `voyageApiKey` の不足が明示エラーになっているか
- [ ] `rerankerType === "llm"` で `rerankerLlmClient` 不足が明示エラーになっているか
- [ ] `enableCRAG === true` で `cragLlmClient` 不足が明示エラーになっているか
- [ ] `llmProvider` が必須であることが config 契約に固定されているか
- [ ] エラーメッセージに `HybridRAGFactory.createFull():` が付いているか
- [ ] 暗黙 fallback が存在しないか（P62 準拠）

### RV-04: HybridRAGEngine コンストラクタとの整合性（再確認）

- [ ] `LLMQueryClassifier` が `IQueryClassifier` を満たしているか
- [ ] `RuleBasedQueryClassifier` が `IQueryClassifier` を満たしているか
- [ ] keyword adapter / `VectorSearchStrategy` / `GraphSearchStrategy` が `ISearchStrategy` を満たしているか
- [ ] `RRFFusion` が `IFusionStrategy` を満たしているか
- [ ] 4 種 `Reranker` が `IReranker` を満たしているか
- [ ] `CorrectiveRAG | null` が engine 契約に一致しているか

### RV-05: DIP と関心の分離（再確認）

- [ ] keyword 特有の bridge が `KeywordSearchStrategyAdapter` へ閉じ込められているか
- [ ] factory が interface を受け取り、具象クラスの生成を helper に限定しているか
- [ ] factory が strategy 本体の責務を奪っていないか

### RV-06: テスタビリティ（再確認）

- [ ] full / lite / error path が個別にテストされているか
- [ ] `createForTesting()` の回帰 guard が維持されているか
- [ ] adapter 単体テストが分離されているか

### RV-07: ILLMClient / ILLMProvider 型互換性（再確認）

- [ ] shared `ILLMClient` と CRAG `ILLMClient` の差分が alias で安全に管理されているか
- [ ] `LLMReranker` 用と `RelevanceEvaluator` 用の client が分離されているか
- [ ] `LLMQueryClassifier` が要求する `ILLMProvider` と config の `llmProvider` が一致しているか

## Pitfall チェック

### P62 準拠チェック（暗黙 fallback がないこと）

- [ ] `cohereApiKey` が空のとき `DEFAULT_CONFIG` 等へ fallback していないか
- [ ] `rerankerLlmClient` が未定義のとき silent skip していないか
- [ ] `cragLlmClient` が未定義のとき CRAG を暗黙生成していないか

### P42 準拠チェック（`.trim()` バリデーション）

- [ ] `cohereApiKey?.trim() === ""` チェックが存在するか
- [ ] `voyageApiKey?.trim() === ""` チェックが存在するか
- [ ] 文字列バリデーション全体が 3 段（型チェック → 空文字列 → トリム空文字列）になっているか

### P19 準拠チェック（`as` キャスト不使用）

- [ ] factory / adapter / helper で `as` 型キャストを使っていないか
- [ ] `in` 演算子と `typeof` による実行時型検証になっているか

### DIP 準拠チェック

- [ ] factory のヘルパー関数引数が具象クラスではなくインターフェースになっているか（P61 対策）
- [ ] `registerXxxHandlers` 相当の箇所で具象クラスを直接渡していないか

## follow-up の formalize

### FU-01: HybridRAGEngine の queryType 伝播改善（必須 follow-up 候補）

- Phase 1 NFR-04 で本 task の必須要件から除外済み。
- 実装後も local-only で動作していることを確認する。
- follow-up タスク候補として `unassigned-task/` に登録するかここで判定する。

### FU-02: ILLMClient インターフェース統一

- shared `ILLMClient` と CRAG `ILLMClient` の統一は本 task スコープ外。
- alias で回避済みだが、将来の混乱防止のため follow-up 候補として記録する。

### FU-03: `rag-services.md` / `interfaces-rag-search.md` 等の条件付き同期

- Phase 12 で同期対象に追加するかここで判定する。
- `契約変更があった場合のみ追加同期` の条件を確認する。

## Phase 12 sync 対象の最終確認

| 対象ファイル                              | sync 必須か    | 判定     |
| ----------------------------------------- | -------------- | -------- |
| `architecture-rag.md`                     | 必須           | 未判定   |
| `rag-search-hybrid.md`                    | 必須           | 未判定   |
| `rag-query-pipeline.md`                   | 必須           | 未判定   |
| `task-workflow.md`                        | 必須           | 未判定   |
| `lessons-learned-current.md`              | 必須           | 未判定   |
| `interfaces-rag-search.md`                | 契約変更時のみ | 未判定   |
| `interfaces-rag-knowledge-graph-store.md` | 契約変更時のみ | 未判定   |
| `rag-search-graph.md`                     | 契約変更時のみ | 未判定   |
| `rag-search-crag.md`                      | 契約変更時のみ | 未判定   |
| `rag-services.md`                         | 契約変更時のみ | 未判定   |
| `api-*.md`                                | N/A            | N/A 確定 |

## ゲート判定

| 判定     | 条件                                  | 対応                                               |
| -------- | ------------------------------------- | -------------------------------------------------- |
| PASS     | 全 RV PASS + Pitfall 0 件 + 品質 PASS | Phase 11 へ                                        |
| MINOR    | 軽微な指摘あり（振る舞い影響なし）    | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 設計違反 / 振る舞い不一致             | 影響範囲に応じて Phase 1-8 へ戻る                  |
| CRITICAL | 受入基準 AC-01〜AC-06 を満たさない    | Phase 1 へ戻り要件再確認                           |

## 参照資料

| 資料名                         | パス / 場所                                                                                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義書             | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-1-requirements.md`                                                                                            |
| Phase 2 設計書                 | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-2-design.md`                                                                                                  |
| Phase 3 設計レビュー書         | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-3-design-review.md`                                                                                           |
| Phase 1 要件成果物             | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-1/requirements.md`                                                                                    |
| Phase 2 設計成果物             | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-2/design.md`                                                                                          |
| Phase 5 実装成果物             | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-5/implementation-plan.md`                                                                             |
| Phase 8 リファクタリング成果物 | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-8/refactoring-log.md`                                                                                 |
| Phase 9 品質レポート           | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-9/quality-report.md`                                                                                  |
| architecture-rag               | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                                                                                                |
| rag-search-hybrid              | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`                                                                                               |
| task-workflow                  | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                   |
| pitfalls                       | `.claude/rules/06-known-pitfalls.md#P19`, `.claude/rules/06-known-pitfalls.md#P42`, `.claude/rules/06-known-pitfalls.md#P61`, `.claude/rules/06-known-pitfalls.md#P62` |

## 成果物

| 成果物           | パス                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------ |
| 最終レビュー結果 | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-10/final-review.md` |
| minor issues     | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-10/minor-issues.md` |

## 完了条件

- [ ] RV-01 から RV-07 の再検証結果が記録されている
- [ ] Pitfall チェック（P62 / P42 / P19 / DIP）の結果が記録されている
- [ ] follow-up（FU-01〜FU-03）の formalize 判定が記録されている
- [ ] Phase 12 sync 対象の最終判定が確定している
- [ ] ゲート判定が 1 つに確定している
- [ ] MINOR 指摘がある場合は未タスク仕様書に変換済みである
- [ ] Phase 11 / 12 へ引き継ぐ観点が明示されている

## 多角的チェック観点（AIが判断）

1. graph queryType limitation を本 task の fail にすべきか、follow-up にすべきか。
2. `rag-services.md` を同期対象に追加する必要があるか。
3. API N/A 判定を覆す変更（service / IPC / public API 追加）が紛れ込んでいないか。
4. MINOR 指摘を「機能影響なし」として省略していないか（省略不可）。

## タスク100%実行確認【必須】

- [ ] 本仕様書の全セクションを読み通し、漏れがないことを確認した
- [ ] RV-01〜RV-07 を全て実装に照らして確認した
- [ ] Pitfall チェックを全項目実施した
- [ ] ゲート判定が説明可能な根拠に基づいていることを確認した
- [ ] Phase 11 へ十分な引き継ぎがあることを確認した

## 次Phase

Phase 11: 手動テスト → `phase-11-manual-test.md`
