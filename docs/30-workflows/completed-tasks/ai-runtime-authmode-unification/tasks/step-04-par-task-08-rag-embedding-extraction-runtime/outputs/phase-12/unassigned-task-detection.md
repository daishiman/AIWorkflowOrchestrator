# Phase 12 Task 4: 未タスク検出レポート

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| Phase      | 12                                               |
| 作成日     | 2026-03-19                                       |
| ステータス | completed                                        |
| 検出件数   | 14件（独立指示書 13件 + 1件は統合）              |

## サマリー

| 区分                         | 件数 | 状態 |
| ---------------------------- | ---- | ---- |
| 独立指示書を作成した未タスク | 13   | 完了 |
| 既存タスクへ統合した未タスク | 1    | 完了 |
| backlog 登録                 | 13   | 完了 |
| 関連 completed record 反映   | 13   | 完了 |

統合対象:

- `UT-RAG-08-014 aiHandlers.ts 既存コメント cleanup` は `UT-RAG-08-006` に統合した

## formalize 完了済み未タスク

| タスクID      | 概要                                          | 優先度 | 指示書                                                                                                                                                                                                    |
| ------------- | --------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UT-RAG-08-001 | communityHandlers IPC response 形式統一       | 中     | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-001-community-handlers-response-unification.md` |
| UT-RAG-08-002 | HybridRAGFactory.createFull/createLite 実配線 | 高     | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-002-hybrid-rag-factory-wiring.md`               |
| UT-RAG-08-003 | Embedding仕様差分 SD-E01〜07 の仕様書更新     | 中     | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-003-embedding-spec-sync.md`                     |
| UT-RAG-08-004 | HybridRAGEngine any 型安全化                  | 中     | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-004-hybrid-rag-engine-type-safety.md`           |
| UT-RAG-08-005 | ILLMClient 型定義統一                         | 中     | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-005-illmclient-type-unification.md`             |
| UT-RAG-08-006 | aiHandlers coverage improvement               | 中     | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-006-ai-handlers-coverage-improvement.md`        |
| UT-RAG-08-007 | openai provider unit tests                    | 低     | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-007-openai-provider-unit-tests.md`              |
| UT-RAG-08-008 | circuit breaker / async utils tests           | 低     | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-008-circuit-breaker-async-utils-tests.md`       |
| UT-RAG-08-009 | contract-matrix.md postconditions 3件修正     | 低     | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-009-contract-matrix-postconditions-fix.md`      |
| UT-RAG-08-010 | AI_INDEX 排他制御設計                         | 中     | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-010-ai-index-exclusive-control-design.md`       |
| UT-RAG-08-011 | AI_INDEX guidance template 設計               | 低     | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-011-ai-index-guidance-message-template.md`      |
| UT-RAG-08-012 | Main Process DI 組み立て責務設計              | 中     | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-012-main-process-di-assembly-design.md`         |
| UT-RAG-08-013 | SF-07 RelevanceEvaluator 修正                 | 中     | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-013-relevance-evaluator-sf07-fix.md`            |

## 3ステップ完了確認

| ステップ | 内容                                                                                                                                                         | 結果 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| 1        | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/` に指示書作成 | PASS |
| 2        | `task-workflow-backlog.md` に登録                                                                                                                            | PASS |
| 3        | `task-workflow-completed-skill-lifecycle.md` に follow-up として反映                                                                                         | PASS |

## 補足

- current build capture 環境問題は feature blocker ではないため未タスク化しない
- llm-embedding を含む broader spec drift は `UT-RAG-08-003` で追跡する
- physical filename は task-spec canonical path に合わせて lowercase `task-rag-08-*.md` へ正規化した
- `audit-unassigned-tasks --json --diff-from HEAD --target-file <task-rag-08-*.md>` を 13件に対して実行し、`currentViolations=0` を確認した
