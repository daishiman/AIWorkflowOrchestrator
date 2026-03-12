# Phase 5 Pointer Doc Update Plan

## 実施した更新

1. parent pointer の「分割先」リンクを completed-task へ寄せた
2. master index の 04A / 04B / 04C 参照を completed-task 側へ寄せた
3. parent workflow root (`index.md`) を canonical root とする説明は既存記述を維持した

## 導線確認

| 導線                                              | 状態 | 根拠                                                          |
| ------------------------------------------------- | ---- | ------------------------------------------------------------- |
| parent pointer -> parent workflow root            | PASS | `task-060-ui-04-workspace-view.md` の canonical workflow root |
| parent pointer -> 04A / 04B / 04C child task spec | PASS | completed-task 相対パスへ更新済み                             |
| master index -> parent pointer role               | PASS | Step 6-D の parent role 記述が維持されている                  |

## 残件

- system spec 側の canonical path 同期は Phase 12 で実施する
- `spec_created` の台帳登録は Phase 12 で実施する
