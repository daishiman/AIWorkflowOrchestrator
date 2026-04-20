# Phase 8 Navigation Refactor Summary

| 対象                       | Before           | After                 | 理由         |
| -------------------------- | ---------------- | --------------------- | ------------ |
| `runOrchestrateWorkflow()` | `_signal` 未使用 | `signal` + 入口 guard | 契約の一貫性 |
| `runCreateWorkflow()`      | `_signal` 未使用 | `signal` + 入口 guard | 契約の一貫性 |

## 追加抽象化

導入しない。既存 helper と既存テスト構成で十分。
