# System Spec Update Summary - UT-RAG-08-002

## 更新日: 2026-03-21

## Step 1-A: タスク完了記録

| ファイル                              | 更新内容                                 | 状態 |
| ------------------------------------- | ---------------------------------------- | ---- |
| `aiworkflow-requirements/LOGS.md`     | 実装完了と same-wave sync 完了を追記     | 完了 |
| `task-specification-creator/LOGS.md`  | Phase 12 最終更新完了を追記              | 完了 |
| `aiworkflow-requirements/SKILL.md`    | 変更履歴に実装完了同期エントリ追加       | 完了 |
| `task-specification-creator/SKILL.md` | 変更履歴に Phase 12 最終更新エントリ追加 | 完了 |

## Step 1-B: 実装状況テーブル

判定: 更新あり。

- `HybridRAGFactory.createFull()` / `createLite()` は実配線済みで、`HybridRAGEngine` を返す。
- `validateFullConfig()` は 4 条件の明示エラーを維持しつつ、`HybridRAGFactory.createFull():` プレフィックスへ統一した。
- `KeywordSearchStrategyAdapter` により keyword search は `ISearchStrategy` 契約へ接続済み。

## Step 1-C: 関連タスクテーブル

- `task-workflow-backlog.md` の `UT-RAG-08-002` を「Phase 12 完了 / PR未着手」へ更新した。
- follow-up 3件（UT-RAG-08-006/007/008）を backlog へ登録した。
- `UT-RAG-08-008` は config 未実装ではなく、global graph mode の仕上げタスクへ定義を更新した。

## Step 1-D: topic-map.md 再生成

- `generate-index.js` 実行済み
- `indexes/topic-map.md` / `indexes/keywords.json` を再生成済み
- `.claude` と `.agents` の mirror は再同期済み

## Step 2: Domain Spec Sync

| ファイル                     | 更新内容                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `architecture-rag.md`        | current runtime snapshot を実装済みに更新                                           |
| `rag-search-hybrid.md`       | factory method 状態、config 契約、wiring blocker、follow-up を current facts に更新 |
| `rag-query-pipeline.md`      | createFull/createLite の runtime 状態を実装済みに更新し、既知制約を明記             |
| `rag-services.md`            | service inventory の stale な stub 記述を補正                                       |
| `task-workflow-backlog.md`   | current task と follow-up 3件を同期                                                 |
| `lessons-learned-current.md` | 実装波の教訓と stale-doc 再発防止観点を同期                                         |

## 条件付きファイル判定結果

| ファイル                                  | 判定 | 理由                                           |
| ----------------------------------------- | ---- | ---------------------------------------------- |
| `interfaces-rag.md`                       | N/A  | `ILLMProvider` 契約そのものは変更なし          |
| `interfaces-rag-search.md`                | N/A  | `ISearchStrategy` 契約変更なし                 |
| `interfaces-rag-knowledge-graph-store.md` | N/A  | `IKnowledgeGraphStore` 契約変更なし            |
| `rag-search-graph.md`                     | N/A  | GraphSearchStrategy 本体契約変更なし           |
| `rag-search-crag.md`                      | N/A  | `CRAGOptions` / `IWebSearcher` 契約変更なし    |
| `rag-services.md`                         | 更新 | current inventory に stub 文言が残っていたため |

## API 判定

N/A: service / IPC / public API の追加変更なし。更新対象は shared service wiring と system spec inventory の同期に限る。
