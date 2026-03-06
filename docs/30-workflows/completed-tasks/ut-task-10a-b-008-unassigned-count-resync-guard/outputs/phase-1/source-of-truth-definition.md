# Phase 1 正本定義

## 正本順位

1. `task-workflow.md` の残課題表と完了記録
2. completed 指示書と unassigned 指示書の物理配置
3. `ui-ux-feature-components.md`
4. parent `unassigned-task-detection.md`
5. Issue / 元指示書 / 旧検出件数

## active set 導出ルール

| ルール | 内容                                                                         |
| ------ | ---------------------------------------------------------------------------- |
| R-1    | `task-workflow.md` の `UT-TASK-10A-B-*` 行から取り消し線なしを active とする |
| R-2    | completed 指示書に移管済み 001/003/008 は completed 集合へ入れる             |
| R-3    | derived ledger は canonical と同じ集合だけを持つ                             |
| R-4    | physical-only anomaly は active set に昇格させず、別記録する                 |

## 固定値

- current active set: `002 / 004 / 005 / 006 / 007 / 009`
- completed set: `001 / 003 / 008`
- 合否コマンド: `validate-task10ab-ledger-sync` → `verify-unassigned-links` → `audit --diff-from HEAD`
