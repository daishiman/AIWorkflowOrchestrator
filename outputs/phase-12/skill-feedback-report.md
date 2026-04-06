# Phase 12: スキルフィードバック — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## 学び

1. runtime guard は入口で統一すると UI/IPC/テストの一貫性が保たれる
2. structured error を shared type で定義し、renderer は message 正規化に専念させると責務が分離できる
3. execute ack 後の snapshot 再読込で failure path の取りこぼしを防げる
4. improve failure の snapshot は `recordImproveFailure()` に寄せると phase 遷移の整合が保てる
5. Phase 11 NON_VISUAL は証跡ファイルの current facts 化まで含めないと drift が残る

## next action

特になし（follow-up は未タスク検出レポートに記録済み）。
