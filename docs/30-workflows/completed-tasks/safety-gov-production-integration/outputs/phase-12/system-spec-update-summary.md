# System Spec Update Summary

## current facts

- `apps/desktop/src/main/ipc/index.ts` に Safety Governance 関連 handler 登録が追加された。
- `apps/desktop/src/main/claude-cli/ipc-handler.ts` に `onSessionDestroyed` callback が追加され、`approvalGate.revokeAll(sessionId)` と接続された。
- `apps/desktop/src/preload/index.ts` / `types.ts` に `ExecutionAPI` と `electronAPI.execution` が追加された。
- `packages/shared/src/ipc/channels.ts` に execution terminal/copy command channel が追加され、desktop preload と shared channel 契約が同期された。

## same-wave sync 状況

| 項目                                | 状態                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| canonical Phase 12 成果物           | このレビューで補完                                                                     |
| `.claude` / `.agents` mirror parity | 一致                                                                                   |
| aiworkflow-requirements ledger      | `spec_created` 前提の記述が残っており、実装差分の current facts 反映は別 wave で要判断 |

## 補足

このレビューでは、まず code と workflow 配下成果物の矛盾解消を優先した。system spec の ledger 更新は、Phase 11 manual evidence の扱いとあわせて次 wave で閉じるのが安全。
