# System Spec Update Summary - UT-RAG-08-002

## 更新日: 2026-03-20

## Step 1-A: タスク完了記録

| ファイル                              | 更新内容                               | 状態 |
| ------------------------------------- | -------------------------------------- | ---- |
| `aiworkflow-requirements/LOGS.md`     | UT-RAG-08-002 仕様書作成完了記録を追記 | 完了 |
| `task-specification-creator/LOGS.md`  | UT-RAG-08-002 仕様書作成完了記録を追記 | 完了 |
| `aiworkflow-requirements/SKILL.md`    | v9.02.06 変更履歴エントリ追加          | 完了 |
| `task-specification-creator/SKILL.md` | v10.09.02 変更履歴エントリ追加         | 完了 |

## Step 1-B: 実装状況テーブル

判定: N/A（HybridRAGFactory の実装ステータスは変更なし。仕様書作成段階のため、実装ステータスは `FACTORY_NOT_READY` のまま）

## Step 1-C: 関連タスクテーブル

- `task-workflow-backlog.md` に UT-RAG-08-002 を登録済み（ステータス: spec_created）
- 未タスク3件（UT-RAG-08-006/007/008）を同テーブルに登録済み

## Step 1-D: topic-map.md 再生成

- `generate-index.js` 実行済み（373ファイル / 92,106行 / 2,364キーワード）
- mirror sync 実行済み（diff -qr 差分0件）

## Step 2: Domain Spec Sync（必須3ファイル）

| ファイル                | バージョン       | 更新内容                                                        |
| ----------------------- | ---------------- | --------------------------------------------------------------- |
| `architecture-rag.md`   | v2.0.1 -> v2.0.2 | HybridRAGFactory runtime status 更新、P64 known issue 追記      |
| `rag-search-hybrid.md`  | v1.2.2 -> v1.2.3 | Phase 3 レビュー結果、wiring blocker checklist ステータス列追加 |
| `rag-query-pipeline.md` | v1.1.1 -> v1.2.0 | createFull/createLite 組み立て設計詳細追記                      |

## Step 2: 条件付きファイル判定結果

| ファイル                                  | 判定            | 理由                                                        |
| ----------------------------------------- | --------------- | ----------------------------------------------------------- |
| `interfaces-rag.md`                       | N/A             | ILLMProvider は既存定義で変更なし                           |
| `interfaces-rag-search.md`                | N/A             | ISearchStrategy 契約変更なし                                |
| `interfaces-rag-knowledge-graph-store.md` | N/A             | IKnowledgeGraphStore 契約変更なし                           |
| `rag-search-graph.md`                     | N/A             | GraphSearchStrategy 契約変更なし                            |
| `rag-search-crag.md`                      | N/A（同期済み） | v1.2.0 で ILLMClient 形状差分を既に記録済み                 |
| `rag-services.md`                         | N/A（同期済み） | v1.3.0 で LLMQueryClassifier constructor 契約を既に記録済み |

## API 判定

N/A: service / IPC / public API の変更なし（本タスクは packages/shared 内のファクトリ実装のみ）

## 追加更新（監査結果による改善）

| ファイル                                                       | 更新内容                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------- |
| `.claude/rules/06-known-pitfalls.md`                           | P64（モノレポ内同名インターフェースのシグネチャドリフト）追加 |
| `lessons-learned-rag-embedding-runtime.md`                     | L-RAG-07（Factory wiring 型互換性事前検証パターン）追記       |
| `task-specification-creator/references/phase-template-core.md` | Phase 3 に「同名型ドリフト検出」観点追加                      |
| `aiworkflow-requirements/SKILL.md`                             | Trigger セクションに RAG 関連キーワード追加                   |
