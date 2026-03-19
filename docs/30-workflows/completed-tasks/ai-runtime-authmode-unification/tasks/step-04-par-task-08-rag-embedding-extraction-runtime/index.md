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
| 更新日       | 2026-03-19                                                                                   |
| パック通称   | Task08（parent index の AI Surface 台帳参照）                                                |

## タスク概要

### 目的

AI_INDEX、embedding、query classifier、entity / relation extraction、community summary、GraphRAG / HybridRAG、CRAG relevance evaluator、reranking の backend AI 機能が `Integrated API Runtime` の capability を明示して動けるようにする。

### 背景

`aiHandlers.ts` の `AI_CHECK_CONNECTION` と `AI_INDEX` は TODO のままで、`communityHandlers.ts` には mock summary が残り、shared の embedding / extraction / graph service 群は API key 直前提のものと runtime 未接続のものが混在している。backend AI job は `Claude Code terminal` に逃がすべきではないため、`API integration only` か `guidance only` かを明示しないと実行経路が壊れる。

### 最終ゴール

RAG 系 backend AI 機能ごとに capability matrix、runtime resolver、fail-fast / guidance、terminal 非対応ポリシー、spec sync 先が確定している状態にする。

### 設計方針

- terminal surface や consumer subscription を backend job の fallback に使わない
- index job と online query は別責務として扱う
- production mock は設計上の残置を許可しない
- 各 surface は Task01 の access matrix を消費し、独自の mode 判定を持たない

### concern topology（3 lane）

| lane           | concern                                                                     | 判断ポイント                                        |
| -------------- | --------------------------------------------------------------------------- | --------------------------------------------------- |
| Index Lane     | AI_CHECK_CONNECTION, AI_INDEX                                               | job lifecycle と long-running 管理                  |
| Embedding Lane | embedding service/pipeline, providers                                       | API key 前提の provider 切替と batch/retry          |
| Search Lane    | classifier, extraction, graph summary, GraphRAG, HybridRAG, CRAG, reranking | online query pipeline の orchestration と fail-fast |

### 成果物一覧

| 種別               | 成果物                                                                                                                                                           | 配置先                                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 仕様書             | index.md / phase-1〜13 / artifacts.json                                                                                                                          | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime`                  |
| 設計成果物         | outputs/phase-N/\*.md                                                                                                                                            | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/outputs/phase-*/` |
| system spec 同期先 | api-ipc-system.md / interfaces-llm.md / llm-embedding.md / architecture-rag.md / rag-services.md / rag-query-pipeline.md / task-workflow.md / lessons-learned.md | `.claude/skills/aiworkflow-requirements/references/`                                                                                            |

## 参照ファイル

### パック横断資料

| 参照資料                        | パス                                                                                                     | 内容                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| pack parent index               | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                             | 実行順序、依存グラフ、共通方針の正本を確認する                                    |
| pack design audit               | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                               | 多角的監査の結論、禁止事項、依存整合を確認する                                    |
| pack UI/UX 図解                 | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                    | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                 |
| pack UI/UX 正本                 | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                 | 全 surface 共通の状態、CTA、microcopy 契約を確認する                              |
| Task01 foundation investigation | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | access matrix / resolver / fail-fast / terminal boundary の現行調査結果を継承する |

### ソースコード

| 参照資料               | パス                                                                      | 内容                                                   |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| aiHandlers             | `apps/desktop/src/main/ipc/aiHandlers.ts`                                 | `AI_CHECK_CONNECTION` / `AI_INDEX` の TODO を確認する  |
| communityHandlers      | `apps/desktop/src/main/ipc/communityHandlers.ts`                          | community summary mock の現状を確認する                |
| embedding-service      | `packages/shared/src/services/embedding/embedding-service.ts`             | embedding 実行サービスを確認する                       |
| embedding-pipeline     | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`   | batch / retry / persistence を含む pipeline を確認する |
| openai-provider        | `packages/shared/src/services/embedding/providers/openai-provider.ts`     | API key 前提の provider を確認する                     |
| qwen3-provider         | `packages/shared/src/services/embedding/providers/qwen3-provider.ts`      | 追加 provider の capability と key 前提を確認する      |
| llm-query-classifier   | `packages/shared/src/services/search/llm-query-classifier.ts`             | query classifier の LLM 依存を確認する                 |
| entity-extractor       | `packages/shared/src/services/extraction/entity-extractor.ts`             | entity extraction の runtime 依存を確認する            |
| relation-extractor     | `packages/shared/src/services/extraction/relation-extractor.ts`           | relation extraction の runtime 依存を確認する          |
| community-summarizer   | `packages/shared/src/services/graph/community-summarizer.ts`              | graph summary の runtime 依存を確認する                |
| graphrag-query-service | `packages/shared/src/services/search/graphrag-query-service.ts`           | GraphRAG query の runtime 依存を確認する               |
| hybrid-rag-engine      | `packages/shared/src/services/search/hybrid-rag-engine.ts`                | HybridRAG 実行と rerank / CRAG handoff を確認する      |
| hybrid-rag-factory     | `packages/shared/src/services/search/hybrid-rag-factory.ts`               | HybridRAG の組み立て点を確認する                       |
| relevance-evaluator    | `packages/shared/src/services/search/crag/relevance-evaluator.ts`         | CRAG relevance evaluator の runtime 依存を確認する     |
| cross-encoder-reranker | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts` | reranking の runtime 依存を確認する                    |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                      | 内容                                           |
| ------------------ | ------------------------------------------------------------------------- | ---------------------------------------------- |
| api-ipc-system     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`     | `AI_CHECK_CONNECTION` / `AI_INDEX` の正本      |
| interfaces-llm     | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`     | embedding / chat 周辺の正本                    |
| llm-embedding      | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`      | embedding provider / pipeline 契約の正本       |
| architecture-rag   | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`   | RAG / graph / search 正本                      |
| rag-services       | `.claude/skills/aiworkflow-requirements/references/rag-services.md`       | classifier / extraction / community 関連の正本 |
| rag-query-pipeline | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md` | GraphRAG / HybridRAG の正本                    |
| task-workflow      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`      | 完了タスク / 未タスク / 証跡                   |
| lessons-learned    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`    | spec sync / UI drift 教訓                      |

### aiworkflow-requirements 抽出起点

| 参照資料                         | パス                                                                                            | 内容                                                                                                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| workflow foundation              | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | AI runtime / auth-mode foundation の current canonical set と Task08 への伝搬先を確認する                                                                      |
| resource-map                     | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                | Task08 専用 row `設計仕様（RAG runtime / AI_INDEX / Embedding / Extraction / Graph Summary）` と `設計同期（AI runtime/auth-mode unification）` から逆引きする |
| quick-reference                  | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                             | Task08 専用ショートカットから canonical spec の最短導線を確認する                                                                                              |
| quick-reference-search-patterns  | `.claude/skills/aiworkflow-requirements/indexes/quick-reference-search-patterns.md`             | `AI_INDEX` / `AI_CHECK_CONNECTION` / `entity extraction` / `relation extraction` / `graph summary` / `query classifier` を `1概念1クエリ` で分割検索する       |
| api-ipc-system-core              | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                      | `AI_CHECK_CONNECTION` legacy 方針、`AI_INDEX`、long-running job 契約を確認する                                                                                 |
| interfaces-rag                   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`                           | relation extraction、entity extraction、GraphRAG の上位契約を確認する                                                                                          |
| interfaces-rag-entity-extraction | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md`         | `IEntityExtractor` と fallback 抽出器の契約を確認する                                                                                                          |
| interfaces-rag-search            | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                    | GraphRAG / HybridRAG / CRAG / reranking の共通契約を確認する                                                                                                   |
| interfaces-rag-graphrag-query    | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-graphrag-query.md`            | GraphRAG query service 契約を確認する                                                                                                                          |
| interfaces-rag-chunk-embedding   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-chunk-embedding.md`           | chunk / embedding 型と provider 境界を確認する                                                                                                                 |
| interfaces-rag-community-summary | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md`   | community summary 契約を確認する                                                                                                                               |
| api-internal-embedding           | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`                   | embedding API の request / response を確認する                                                                                                                 |
| rag-search-hybrid                | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`                        | HybridRAG 4 stage pipeline を確認する                                                                                                                          |
| rag-search-crag                  | `.claude/skills/aiworkflow-requirements/references/rag-search-crag.md`                          | CRAG evaluation / correction action を確認する                                                                                                                 |
| error-handling                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                           | fail-fast / explicit error propagation の cross-cutting を確認する                                                                                             |
| security-electron-ipc            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                    | IPC 引数検証、秘密情報非露出、guidance-only 契約を確認する                                                                                                     |
| quality-requirements             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                     | silent fallback 排除、coverage、品質ゲート基準を確認する                                                                                                       |

## タスク分解サマリー

| ID   | フェーズ    | サブタスク名     | 責務                                                                                                | 依存 |
| ---- | ----------- | ---------------- | --------------------------------------------------------------------------------------------------- | ---- |
| T-01 | Phase 1     | 要件整理         | P50チェック、capability inventory、FR/NFR分類、番号付き受入基準を定義する                           | -    |
| T-02 | Phase 2     | 設計確定         | concern topology（3 lane）、capability matrix、runtime resolver、error policy、UI/UX 契約を設計する | T-01 |
| T-03 | Phase 3     | レビューゲート   | PASS/MINOR/MAJOR 判定、simpler alternative 検討、MINOR 追跡テーブルを作成する                       | T-02 |
| T-04 | Phase 4-7   | テスト仕様化     | 事前確認（重複検出/IPC形式/import副作用）、テスト・実装・回帰・カバレッジを定義する                 | T-03 |
| T-05 | Phase 8-9   | 品質整備         | リファクタリング5観点、品質検証9タスク、品質ゲート一括判定を実施する                                | T-04 |
| T-06 | Phase 10-11 | レビューと検証   | PASS/MINOR/MAJOR/CRITICAL判定、runtime walkthrough + screenshot review board 検証を実施する         | T-05 |
| T-07 | Phase 12-13 | 文書化と handoff | 6タスク構造（SF-02/SF-03対応）、spec sync、blocked/user approval を整理する                         | T-06 |

## 実行フロー

1. **Phase 1-3**: capability matrix、authority、review gate を固める（直列）
2. **Phase 4-7**: テスト事前確認、テスト仕様、実装計画、回帰、カバレッジを固める
3. **Phase 8-9**: リファクタリング5観点、品質検証9タスク、品質ゲートを固める
4. **Phase 10-11**: CRITICAL判定付き最終レビュー、runtime walkthrough と screenshot review board 検証を実施する
5. **Phase 12-13**: 6タスク構造ドキュメント、blocked PR下書きを整理する

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス  | 主要改善点                                               |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- | -------------------------------------------------------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed   | P50チェック、番号付きAC、FR/NFR分類                      |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed   | 3 lane topology、validation matrix、UI/UX契約            |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed   | MINOR追跡テーブル、Phase 4開始条件                       |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed   | 重複検出、IPC形式合意、import副作用チェック              |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed   | 回帰baseline、register/unregister ペア確認               |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed   | query classifier / extraction / CRAG / reranking 回帰    |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed   | Line 80%/Branch 60%/Function 80% + extraction/classifier |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed   | 5観点 + extraction/query-classifier helper 境界          |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed   | 9タスク、extraction/guidance を含む品質ゲート            |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed   | PASS/MINOR/MAJOR/CRITICAL 4段階ゲート                    |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed   | screenshot review board + runtime walkthrough            |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed   | 6タスク構造、SF-02/SF-03、compliance check               |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started | blocked/user approval、Phase 12完了根拠                  |

## 統合テスト連携（Phase 1〜11で必須）

- AI_INDEX、check connection、embedding、query classifier、extraction、graph summary、CRAG、reranking の接続点を各 Phase で必ず扱う
- 本タスクでは capability matrix、long-running job、guidance、mock 排除を統合テスト観点の中心に置く
- 3 lane（Index / Embedding / Search）の境界を跨ぐ統合テスト観点を各 Phase で確認する

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する
- 成果物パスと完了条件を確認する
- artifacts.json を更新対象として扱う

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime --phase N
```
