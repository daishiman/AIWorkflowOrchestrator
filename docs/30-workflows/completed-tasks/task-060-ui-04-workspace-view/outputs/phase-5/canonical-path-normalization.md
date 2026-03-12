# Phase 5 Canonical Path Normalization

## 正規化結果

| 対象                        | 旧状態                                                                     | 新状態                              | 判定 |
| --------------------------- | -------------------------------------------------------------------------- | ----------------------------------- | ---- |
| parent pointer 分割先       | 04B / 04C が task-00 配下の stale path を指していた                        | `../completed-task/...` に統一      | 完了 |
| master index Step 6-B / 6-C | 04A / 04B / 04C が旧 task path 表記だった                                  | completed-task task spec 表記に統一 | 完了 |
| parent workflow root        | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/index.md` | 変更なし、canonical root として維持 | 完了 |
| system spec                 | 04B current path 残存                                                      | Phase 12 で `.claude` 正本へ同期    | 保留 |

## ルール

- parent / index / ledger は completed-tasks path を canonical とする
- system spec に current path が残る場合は Phase 12 の同期対象として扱う
- child workflow のステータス本文は親で複製しない
