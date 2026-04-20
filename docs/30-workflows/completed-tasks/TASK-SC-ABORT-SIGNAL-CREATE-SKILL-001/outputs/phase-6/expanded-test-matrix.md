# Phase 6 Expanded Test Matrix

| ID    | 観点                                | 対象                       | 状態     |
| ----- | ----------------------------------- | -------------------------- | -------- |
| EX-01 | aborted signal で即時失敗           | `runOrchestrateWorkflow()` | 追加済み |
| EX-02 | signal なしで正常終了               | `runOrchestrateWorkflow()` | 追加済み |
| EX-03 | aborted signal で即時失敗           | `runCreateWorkflow()`      | 追加済み |
| EX-04 | signal なしで structure plan を返す | `runCreateWorkflow()`      | 追加済み |

## 補足

- public cancel 契約の既存ケースは維持
- private 入口保証だけを最小追加した
