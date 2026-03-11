# Phase 8 責務境界チェックリスト

| 観点                     | 確認内容                                                         | 判定 |
| ------------------------ | ---------------------------------------------------------------- | ---- |
| View                     | store selector と preload 呼び出しだけを扱う                     | PASS |
| Presentational component | selector を持たない                                              | PASS |
| Hook                     | layout / resize / watcher のロジックをそれぞれ分離               | PASS |
| Store                    | `workspaceSlice`, `fileSelectionSlice` を再利用し新規 slice なし | PASS |
| 04B / 04C                | placeholder 境界を維持し直接 import なし                         | PASS |
| IPC                      | `file:*` / `workspace:*` の既存 namespace に閉じる               | PASS |

## 懸念

未解消の boundary 問題は検出されていない。
