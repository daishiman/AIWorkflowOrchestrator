# Phase 6: テスト拡充

## 目的

verify 失敗、route fallback、session 互換、child task 境界などの edge case を補う。

## 実行タスク

- verify fail / warning / retry
- API unavailable → handoff
- manifest 更新後の resume 互換
- child task 間の依存崩れ検出

## 成果物

| 成果物         | パス                        | 説明           |
| -------------- | --------------------------- | -------------- |
| テスト拡充方針 | `phase-6-test-expansion.md` | edge case 観点 |

## 完了条件

- [ ] verify / route / session / dependency の edge case が列挙されている
- [ ] **本Phase内の全タスクを100%実行完了**
