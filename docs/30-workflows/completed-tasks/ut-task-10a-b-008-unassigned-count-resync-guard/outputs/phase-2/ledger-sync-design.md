# Phase 2 台帳同期設計

## 同期順

1. `task-workflow.md` を completed/active に更新
2. `ui-ux-feature-components.md` を active/completed 2表へ分離
3. parent `unassigned-task-detection.md` を current snapshot へ更新
4. `lessons-learned.md` と補助仕様へ再利用ルールを反映

## 反映内容

| 台帳                          | 反映                                          |
| ----------------------------- | --------------------------------------------- |
| `task-workflow.md`            | 003/008 を完了化、TASK-10A-B 節へ完了記録追加 |
| `ui-ux-feature-components.md` | active 6件 / completed 3件へ分離              |
| detection                     | current snapshot 6件 / completed 3件を明記    |

## rollback 条件

- `validate-task10ab-ledger-sync` が FAIL した場合は derived 側を差し戻す
- `verify-unassigned-links` が current 差分で FAIL した場合は参照パスを是正する
