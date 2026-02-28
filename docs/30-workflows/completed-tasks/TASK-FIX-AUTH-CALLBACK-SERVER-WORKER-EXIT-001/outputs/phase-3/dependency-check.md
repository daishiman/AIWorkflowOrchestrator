# Phase 3 依存整合表

| 依存対象                | 影響                                   | 判定 |
| ----------------------- | -------------------------------------- | ---- |
| `AuthFlowOrchestrator`  | `waitForCallback` 利用のみ、IF変更なし | OK   |
| `api-ipc-auth`          | 変更なし                               | OK   |
| `interfaces-auth`       | 型変更なし                             | OK   |
| テスト基盤 (Vitest/MSW) | 警告のみ、失敗なし                     | OK   |
