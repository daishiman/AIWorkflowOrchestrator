# Phase 10: release risk checklist

| #   | 観点             | 前提条件                                                                                   | 結果            |
| --- | ---------------- | ------------------------------------------------------------------------------------------ | --------------- |
| 1   | Manual test      | `/settings` で 5 TC を実行し証跡を残す                                                     | Phase 11 で実施 |
| 2   | restart restore  | persisted mode を再起動後に確認する                                                        | Phase 11 で実施 |
| 3   | UI status        | `message`, `errorCode`, `guidance` の視覚確認                                              | Phase 11 で実施 |
| 4   | Spec sync        | references 8 ファイル + workflow/log/index を更新する                                      | Phase 12 で実施 |
| 5   | Unassigned audit | 残タスク検出とリンク監査を実行する                                                         | Phase 12 で実施 |
| 6   | Validation       | `verify-all-specs`, `validate-phase-output`, `validate-phase11-screenshot-coverage` を通す | Phase 12 で実施 |

## 判定

- manual test 前提は揃っている
- system spec 同期前提も揃っている
- release blocker は 0 件
