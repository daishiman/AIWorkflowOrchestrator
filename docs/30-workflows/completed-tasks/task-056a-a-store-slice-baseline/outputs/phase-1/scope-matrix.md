# Phase 1 スコープ表

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE |
| Phase      | 1                                 |
| 作成日     | 2026-03-05                        |
| ステータス | completed                         |

## Scope Matrix

| 項目                                  | 判定 | 理由                                |
| ------------------------------------- | ---- | ----------------------------------- |
| 既存15 Slice + chatEditSlice の棚卸し | In   | 本タスクの主目的                    |
| Slice 境界マトリクス作成              | In   | `task-056c/056d` への入力として必須 |
| P31対策セレクタ規約の固定             | In   | 再発防止に必須                      |
| Store baseline型/定数の実装           | In   | 仕様と実装を同期するため            |
| Store baselineテスト追加              | In   | 境界判定の回帰防止                  |
| NotificationSlice 実装本体            | Out  | `task-056c` で実装                  |
| historySearchSlice 実装本体           | Out  | `task-056c` で実装                  |
| ViewType拡張のUIルーティング実装本体  | Out  | `task-056d` で実装                  |
| Main/Preload IPCチャネル追加          | Out  | `task-056a-b` で実装                |
| UIコンポーネントの新規作成            | Out  | 本タスクはStore境界基準化が対象     |

## 引き渡し前提

- `task-056c` は本タスクの `slice-boundary-matrix` を Notification/HistorySearch 実装の正本入力とする。
- `task-056d` は本タスクの `ViewType=extend` 判定をルーティング実装の正本入力とする。
