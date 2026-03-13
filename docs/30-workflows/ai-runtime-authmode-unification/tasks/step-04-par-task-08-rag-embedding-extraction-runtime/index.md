# rag-embedding-extraction-runtime - タスク実行仕様書

## ユーザーからの元の指示

```text
AI 機能を `Integrated API Runtime` と `ユーザー操作の Claude Code terminal surface` に分離し、すべての AI surface で切替・handoff・UI/UX・実行順序が分かるタスク仕様書を task-specification-creator と aiworkflow-requirements に従って整備する。実装は行わない。
```

## メタ情報

| 項目         | 内容                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| タスクID     | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001                                             |
| タスク名     | rag-embedding-extraction-runtime                                                             |
| 分類         | 設計                                                                                         |
| 対象機能     | RAG / AI_INDEX / Embedding / Extraction / Graph Summary / CRAG / Reranking の runtime ルール |
| 優先度       | 高                                                                                           |
| 見積もり規模 | 中規模                                                                                       |
| ステータス   | spec_created                                                                                 |
| 作成日       | 2026-03-13                                                                                   |

## タスク概要

### 目的

AI_INDEX、embedding、query classifier、entity / relation extraction、community summary、GraphRAG / HybridRAG、CRAG relevance evaluator、reranking の backend AI 機能が `Integrated API Runtime` の capability を明示して動けるようにする。

### 背景

`aiHandlers.ts` の `AI_CHECK_CONNECTION` と `AI_INDEX` は TODO のままで、`communityHandlers.ts` には mock summary が残り、shared の embedding / extraction / graph service 群は API key 直前提のものと runtime 未接続のものが混在している。backend AI job は `Claude Code terminal` に逃がすべきではないため、`API integration only` か `guidance only` かを明示しないと実行経路が壊れる。

### 最終ゴール

RAG 系 backend AI 機能ごとに capability matrix、runtime resolver、fail-fast / guidance、terminal 非対応ポリシー、spec sync 先が確定している状態にする。

### 成果物一覧

| 種別               | 成果物                                                                                                                                                           | 配置先                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 仕様書             | index.md / phase-1〜13 / artifacts.json                                                                                                                          | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime`                  |
| 設計成果物         | outputs/phase-_/_.md                                                                                                                                             | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/outputs/phase-*/` |
| system spec 同期先 | api-ipc-system.md / interfaces-llm.md / llm-embedding.md / architecture-rag.md / rag-services.md / rag-query-pipeline.md / task-workflow.md / lessons-learned.md | `/.claude/skills/aiworkflow-requirements/references/`                                                                           |

## 参照ファイル

| 参照資料                  | パス                                                                                                                                                                                  | 内容                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| pack parent index         | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                                                                                                          | 実行順序、依存グラフ、共通方針の正本を確認する                                                  |
| pack design audit         | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                                                                                            | 多角的監査の結論、禁止事項、依存整合を確認する                                                  |
| pack UI/UX 図解           | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                                                                                                 | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                               |
| pack UI/UX 正本           | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                                                                                              | 全 surface 共通の状態、CTA、microcopy 契約を確認する                                            |
| Task01 foundation outputs | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-2/design-summary.md`                                        | access matrix / resolver / fail-fast / terminal boundary の共通契約を継承する                   |
| Task01 settings review    | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-11/screenshots/TC-11-00-settings-authmode-review-board.png` | 設定画面（認証方式カード・Claude Agent SDK APIキー・APIキー設定一覧）の改善要求を設計へ反映する |
| aiHandlers                | `apps/desktop/src/main/ipc/aiHandlers.ts`                                                                                                                                             | `AI_CHECK_CONNECTION` / `AI_INDEX` の TODO を確認する                                           |
| communityHandlers         | `apps/desktop/src/main/ipc/communityHandlers.ts`                                                                                                                                      | community summary mock の現状を確認する                                                         |
| embedding-service         | `packages/shared/src/services/embedding/embedding-service.ts`                                                                                                                         | embedding 実行サービスを確認する                                                                |
| openai-provider           | `packages/shared/src/services/embedding/providers/openai-provider.ts`                                                                                                                 | API key 前提の provider を確認する                                                              |
| llm-query-classifier      | `packages/shared/src/services/search/llm-query-classifier.ts`                                                                                                                         | query classifier の LLM 依存を確認する                                                          |
| entity-extractor          | `packages/shared/src/services/extraction/entity-extractor.ts`                                                                                                                         | entity extraction の runtime 依存を確認する                                                     |
| relation-extractor        | `packages/shared/src/services/extraction/relation-extractor.ts`                                                                                                                       | relation extraction の runtime 依存を確認する                                                   |
| community-summarizer      | `packages/shared/src/services/graph/community-summarizer.ts`                                                                                                                          | graph summary の runtime 依存を確認する                                                         |
| graphrag-query-service    | `packages/shared/src/services/search/graphrag-query-service.ts`                                                                                                                       | GraphRAG query の runtime 依存を確認する                                                        |
| hybrid-rag-factory        | `packages/shared/src/services/search/hybrid-rag-factory.ts`                                                                                                                           | HybridRAG の組み立て点を確認する                                                                |
| relevance-evaluator       | `packages/shared/src/services/search/crag/relevance-evaluator.ts`                                                                                                                     | CRAG relevance evaluator の runtime 依存を確認する                                              |
| cross-encoder-reranker    | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts`                                                                                                             | reranking の runtime 依存を確認する                                                             |

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名     | 責務                                                                                        | 依存 |
| ---- | ---------- | ---------------- | ------------------------------------------------------------------------------------------- | ---- |
| T-01 | Phase 1    | 要件整理         | backend AI surface の capability と gap を整理する                                          | -    |
| T-02 | Phase 2    | 設計確定         | capability matrix / resolver / fail-fast を設計する                                         | T-01 |
| T-03 | Phase 3    | レビューゲート   | api-key-only と guidance-only の境界が矛盾しないか判定する                                  | T-02 |
| T-04 | Phase 4-7  | テスト仕様化     | AI_INDEX / embedding / extraction / graph summary / CRAG / reranking のテスト仕様を定義する | T-03 |
| T-05 | Phase 8-13 | 文書化と handoff | spec sync と rollout 順序を整理する                                                         | T-04 |

## 実行フロー

1. Phase 1-3 で capability matrix、authority、review gate を固める。
2. Phase 4-7 で index / embedding / extraction / graph summary の回帰テスト仕様を固める。
3. Phase 8-13 で実装順序、spec sync、handoff を固める。

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | not_started |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | not_started |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | not_started |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | not_started |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | not_started |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | not_started |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | not_started |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | not_started |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | not_started |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | not_started |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | not_started |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | not_started |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## 統合テスト連携（Phase 1〜11で必須）

- AI_INDEX、check connection、embedding、query classifier、extraction、graph summary、CRAG、reranking の接続点を各 Phase で必ず扱う。
- 本タスクでは capability matrix、long-running job、guidance、mock 排除を統合テスト観点の中心に置く。

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
