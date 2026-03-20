# hybrid-rag-factory-wiring - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | `UT-RAG-08-002`                                                          |
| タスク名     | `HybridRAGFactory.createFull/createLite 実配線`                          |
| 分類         | 実装                                                                     |
| 対象機能     | RAG Search Factory wiring                                                |
| 優先度       | 高                                                                       |
| 見積もり規模 | M                                                                        |
| ステータス   | `spec_created`                                                           |
| 作成日       | 2026-03-20                                                               |
| 発見元       | `step-04-par-task-08-rag-embedding-extraction-runtime` Phase 12 未タスク |
| GitHub Issue | `#1368`                                                                  |

## タスク概要

### 目的

`packages/shared/src/services/search/hybrid-rag-factory.ts` の `createFull()` / `createLite()` を、現行コードと system spec の両方に整合する形で本番 wiring へ移行する。

### 現状認識

1. current runtime は `FACTORY_NOT_READY` stub で止まっている。
2. `KeywordSearchStrategy` は `HybridRAGEngine` が要求する `ISearchStrategy` と非互換である。
3. `LLMQueryClassifier`、`LLMReranker`、`RelevanceEvaluator` は同じ `llmClient` では直接共有できない。
4. `GraphSearchStrategy` は engine から `queryType` を受けないため、current engine 契約では local mode で動作する。

### スコープ

#### 含む

- `createFull()` / `createLite()` の config 契約再定義
- `KeywordSearchStrategy` を `ISearchStrategy` 契約へ橋渡しする adapter 追加
- placeholder 型の削除と実型 import への置換
- `Reranker` / `CRAG` / `queryClassifier` の依存分離
- factory wiring に対する unit test と regression test 追加
- Phase 12 での same-wave system spec sync

#### 含まない

- `KeywordSearchStrategy` 本体の public contract 変更
- `VectorSearchStrategy` / `GraphSearchStrategy` / `CorrectiveRAG` 本体の再設計
- `HybridRAGEngine` の queryType 伝播改善
- IPC / Renderer / API surface の追加

## 参照ファイル

| 参照資料         | パス                                                                                                                                                                                        | 内容                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| pack index       | `docs/30-workflows/hybrid-rag-factory-wiring/index.md`                                                                                                                                      | pack 全体方針            |
| source task      | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/index.md`                                                     | 発生元 context           |
| source backlog   | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-002-hybrid-rag-factory-wiring.md` | 未タスク原文             |
| factory 実装     | `packages/shared/src/services/search/hybrid-rag-factory.ts`                                                                                                                                 | 対象コード               |
| engine 契約      | `packages/shared/src/services/search/hybrid-rag-engine.ts`                                                                                                                                  | `ISearchStrategy` 接続点 |
| keyword strategy | `packages/shared/src/services/search/keyword-search-strategy.ts`                                                                                                                            | adapter 必要性の根拠     |

## 必要仕様抽出マトリクス

| 関心ごと                 | 参照仕様                                                                                      | 用途                                            |
| ------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| current runtime snapshot | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                       | `not-ready` 状態の正本確認                      |
| RAG contract root        | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`                         | `ILLMProvider` / family 契約の正本起点          |
| hybrid contract          | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`                      | `HybridRAGFactory` の同期先                     |
| pipeline                 | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md`                     | pipeline 親仕様                                 |
| search family index      | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                  | RAG family の index                             |
| graph store contract     | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md`   | `IKnowledgeGraphStore` の正本確認               |
| graph                    | `.claude/skills/aiworkflow-requirements/references/rag-search-graph.md`                       | `GraphSearchStrategy` 契約確認                  |
| CRAG                     | `.claude/skills/aiworkflow-requirements/references/rag-search-crag.md`                        | `CRAGOptions` / `IWebSearcher`                  |
| community summarizer     | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | optional dependency 判定                        |
| service inventory        | `.claude/skills/aiworkflow-requirements/references/rag-services.md`                           | Task08 系譜と service responsibility の補助確認 |
| quality                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements-details.md`           | TDD 運用                                        |
| coverage baseline        | `.claude/skills/aiworkflow-requirements/references/quality-requirements-advanced.md`          | baseline 比較                                   |

## 受入基準

| ID    | 基準                                                                                                                                                                                                                                                                                                                                |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01 | `createFull()` が required dependency を満たしたとき `HybridRAGEngine` を返す                                                                                                                                                                                                                                                       |
| AC-02 | `createLite()` が `RuleBasedQueryClassifier` + keyword adapter + `VectorSearchStrategy` + `GraphSearchStrategy` + `NoOpReranker` + `null CRAG` で engine を返す                                                                                                                                                                     |
| AC-03 | `FullHybridRAGConfig` が `llmProvider`、`rerankerLlmClient`、`cragLlmClient` を責務分離して定義する                                                                                                                                                                                                                                 |
| AC-04 | `@placeholder` 型と `FACTORY_NOT_READY` が除去される                                                                                                                                                                                                                                                                                |
| AC-05 | `cohereApiKey` / `voyageApiKey` / `cragLlmClient` など必須依存に silent fallback がない                                                                                                                                                                                                                                             |
| AC-06 | Phase 12 で `architecture-rag.md`、`rag-search-hybrid.md`、`rag-query-pipeline.md`、`task-workflow.md`、`lessons-learned-current.md` を same-wave で更新し、契約変更時のみ `interfaces-rag-search.md` / `interfaces-rag-knowledge-graph-store.md` / `rag-search-graph.md` / `rag-search-crag.md` / `rag-services.md` を追加同期する |

## タスク分解サマリー

| ID   | フェーズ    | サブタスク名   | 責務                                               | 依存 |
| ---- | ----------- | -------------- | -------------------------------------------------- | ---- |
| T-01 | Phase 1     | 要件整理       | blocker と scope を確定する                        | -    |
| T-02 | Phase 2     | 設計確定       | adapter / config / validation を設計する           | T-01 |
| T-03 | Phase 3     | レビューゲート | design の妥当性を判定する                          | T-02 |
| T-04 | Phase 4-7   | TDD 実行       | test plan、実装、回帰、coverage を固める           | T-03 |
| T-05 | Phase 8-10  | 品質整備       | refactor、QA、最終レビューを実施する               | T-04 |
| T-06 | Phase 11-13 | handoff        | manual walkthrough、spec sync、PR block を整理する | T-05 |

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス    |
| ----- | ---------------- | -------------------------------------------------------------- | ------------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | `not_started` |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | `not_started` |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | `not_started` |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | `not_started` |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | `not_started` |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | `not_started` |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | `not_started` |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | `not_started` |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | `not_started` |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | `not_started` |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | `not_started` |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | `not_started` |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | `not_started` |

## 統合テスト連携（Phase 1〜11 で必須）

- adapter を介した keyword / semantic / graph の 3 strategy 接続を各 Phase で扱う。
- `rerankerType` の 4 分岐と `enableCRAG` の条件分岐を各 Phase で確認する。
- current engine contract の制約により graph queryType が local-only であることを回帰観点として記録する。

## Phase 完了時の必須アクション

- 本 Phase 内の全タスクを 100% 実行完了と記録する。
- `artifacts.json` と `outputs/artifacts.json` を同時に扱う。
- Phase 12 までは commit / PR を実施しない。

## 検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/hybrid-rag-factory-wiring/tasks
pnpm --filter @repo/shared exec tsc --noEmit
pnpm --filter @repo/shared exec vitest run src/services/search/__tests__/hybrid-rag-factory.test.ts
```
