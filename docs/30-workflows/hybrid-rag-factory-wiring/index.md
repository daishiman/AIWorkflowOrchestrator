# Hybrid RAG Factory Wiring - パック仕様書

## 概要

`HybridRAGFactory.createFull()` / `createLite()` の本番 wiring を仕様化する単一タスク pack。現行 system spec は 2026-03-19 時点で `guidance stub` を正本としているため、本 pack は「stub 除去前提の current-state 修正 task」であることを明示する。

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| パック名   | `hybrid-rag-factory-wiring`                                              |
| 優先度     | 高                                                                       |
| ステータス | `spec_created`                                                           |
| 対象領域   | RAG / Search / Factory wiring                                            |
| 発見元     | `step-04-par-task-08-rag-embedding-extraction-runtime` Phase 12 未タスク |

## タスク一覧

| 順序 | タスクID        | ディレクトリ | 責務                                                                             | 実行順序 |
| ---- | --------------- | ------------ | -------------------------------------------------------------------------------- | -------- |
| 1    | `UT-RAG-08-002` | `tasks/`     | `HybridRAGFactory` の config 契約再定義、adapter 追加、factory wiring、spec sync | 直列     |

## 関心ごとの分離

| concern             | 内容                                                                         |
| ------------------- | ---------------------------------------------------------------------------- |
| Factory contract    | `FullHybridRAGConfig` / `LiteHybridRAGConfig` を現行実装に合わせて再定義する |
| Adapter boundary    | `KeywordSearchStrategy` を `ISearchStrategy` 契約へ橋渡しする                |
| LLM interface split | `ILLMProvider` / shared `ILLMClient` / CRAG `ILLMClient` の境界を明文化する  |
| System spec sync    | current runtime snapshot を same-wave で更新する                             |

## 仕様抽出方針

- 実行仕様の本体は `tasks/index.md` に集約する。
- pack 直下では「何の task pack か」「どこから発生したか」「どの task を開けばよいか」だけを持つ。
- `aiworkflow-requirements` 参照束、API 判定、機械検証、Phase 実行条件は task 側で管理する。

## 関連資料

| 種別         | パス                                                                                                                                                                                        | 用途                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 親 task      | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/index.md`                                                     | 未タスクの発生源と context を確認する |
| 未タスク正本 | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-002-hybrid-rag-factory-wiring.md` | 元の backlog 記述を確認する           |
| 実行 task    | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/index.md`                                                                                                                                | 実行用仕様書の入口                    |
