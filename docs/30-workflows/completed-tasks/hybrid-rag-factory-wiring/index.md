# Hybrid RAG Factory Wiring - パック仕様書

## 概要

`HybridRAGFactory.createFull()` / `createLite()` の実配線は完了した。現在の pack は、実装済み wiring・回帰テスト・same-wave system spec sync・follow-up 台帳を保持する current workflow root である。Phase 13 の PR 作成だけは未着手。

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| パック名   | `hybrid-rag-factory-wiring`                                              |
| 優先度     | 高                                                                       |
| ステータス | `completed`                                                              |
| 対象領域   | RAG / Search / Factory wiring                                            |
| 発見元     | `step-04-par-task-08-rag-embedding-extraction-runtime` Phase 12 未タスク |

## タスク一覧

| 順序 | タスクID        | ディレクトリ | 責務                                                                             | 実行順序 |
| ---- | --------------- | ------------ | -------------------------------------------------------------------------------- | -------- |
| 1    | `UT-RAG-08-002` | `tasks/`     | `HybridRAGFactory` の config 契約再定義、adapter 追加、factory wiring、spec sync | 直列     |

## current status

| concern             | 状態                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Factory contract    | `FullHybridRAGConfig` / `LiteHybridRAGConfig` を実装へ同期済み                                                              |
| Adapter boundary    | `KeywordSearchStrategyAdapter` 追加済み                                                                                     |
| LLM interface split | `llmProvider` / `rerankerLlmClient` / `cragLlmClient` に責務分離済み                                                        |
| System spec sync    | `architecture-rag.md` / `rag-search-hybrid.md` / `rag-query-pipeline.md` / `rag-services.md` / backlog / lessons を更新済み |
| 残課題              | Phase 13 PR 作成、follow-up 3件（UT-RAG-08-006〜008）                                                                       |

## 仕様抽出方針

- 実行仕様の本体は `tasks/index.md` に集約する。
- pack 直下では task pack の目的・現在地・参照入口だけを保持する。
- 実装済み事実と未着手の PR 作成を分けて管理する。

## 関連資料

| 種別         | パス                                                                                                                                                                                        | 用途                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 親 task      | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/index.md`                                                     | 未タスクの発生源と context を確認する |
| 未タスク正本 | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-002-hybrid-rag-factory-wiring.md` | 元の backlog 記述を確認する           |
| 実行 task    | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/index.md`                                                                                                                                | 実行用仕様書の入口                    |
