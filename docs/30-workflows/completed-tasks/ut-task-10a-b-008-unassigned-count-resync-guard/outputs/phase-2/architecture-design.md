# Phase 2 アーキテクチャ設計

## 設計方針

- SubAgent-A: canonical 集合の導出
- SubAgent-B: `task-workflow.md` 同期
- SubAgent-C: `ui-ux-feature-components.md` / detection 同期
- SubAgent-D: 検証順固定

## 3層モデル

| 層         | ファイル                                        | 役割                        |
| ---------- | ----------------------------------------------- | --------------------------- |
| canonical  | `task-workflow.md`                              | active/completed 集合の正本 |
| derived    | `ui-ux-feature-components.md`, parent detection | 表示用台帳                  |
| historical | Issue #996, 元指示書                            | 起票背景                    |

## 完了状態モデル

| 状態      | 条件                                                                |
| --------- | ------------------------------------------------------------------- |
| active    | 残課題表に非取り消し線で存在し、`unassigned-task/` に物理配置がある |
| completed | 完了記録があり、`completed-tasks/` に物理配置がある                 |
| anomaly   | 物理ファイルはあるが canonical 未登録                               |

## 期待状態

- active: 6件
- completed: 3件
- anomaly: blocking ではなく risk 扱い
