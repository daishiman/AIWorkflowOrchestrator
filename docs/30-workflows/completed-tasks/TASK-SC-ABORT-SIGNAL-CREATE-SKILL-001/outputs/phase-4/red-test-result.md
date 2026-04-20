# Phase 4 Red Test Result

## 結論

Red 前提は成立していた。修正前の `runOrchestrateWorkflow()` / `runCreateWorkflow()` は `_signal` 未使用だったため、aborted signal を渡しても入口で停止しない状態だった。

## Red 対象

| ケース | 修正前の期待                                                  |
| ------ | ------------------------------------------------------------- |
| TC-03  | `runOrchestrateWorkflow()` が aborted signal で即時失敗しない |
| TC-04  | `runCreateWorkflow()` が aborted signal で即時失敗しない      |

## 備考

- public cancel 契約は既存テストで概ね成立済みだった
- 今回の Red は private workflow 入口保証の欠落だけに絞った
