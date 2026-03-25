# UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001: Safety Governance Production 統合

```yaml
issue_number: 1609
task_id: UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001
task_name: Safety Governance Production 統合
category: 改善
target_feature: ExecutionConsole
priority: 高
scale: 大規模
status: 未実施
source_phase: Phase 12
created_date: 2026-03-25
dependencies: []
```

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| タスクID | UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001    |
| 優先度   | 高                                              |
| 元タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 検出日   | 2026-03-25                                      |
| 由来     | Phase 12 UT-6, UT-7, UT-8, UT-9                 |

---

## 概要

TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 で作成した ApprovalGate・IPC handler・Renderer コンポーネントを production コードに統合する。現在は独立した設計コードとして存在するが、Main Process 起動パスへの接続、Preload contextBridge への公開、Push 通知の実装、セッション終了時のクリーンアップが未接続。

## 背景・苦戦箇所

元タスクでは ApprovalGate / approvalHandlers / disclosureHandlers / advancedConsoleHandlers を個別に実装し、85テストが全パスする状態まで到達した。しかし以下の production 統合ステップが未実施:

1. **IPC Handler 登録（UT-6）**: `main/ipc/index.ts` への3ハンドラ追加。ApprovalGate のインスタンスを DI で注入する必要あり
2. **Preload API 公開（UT-7）**: `preload/index.ts` の `electronAPI` に `execution` 名前空間を追加。safeInvoke/safeOn パターンに従う必要あり
3. **Approval Request Push（UT-8）**: Main → Renderer への `approval:request` push 通知。`webContents.send()` を使用し、ALLOWED_ON_CHANNELS に登録済み
4. **revokeAll() セッション終了（UT-9）**: abort/done 遷移時に `ApprovalGate.revokeAll(sessionId)` を呼び出してトークンを無効化

苦戦が予想される点:

- Main Process 起動シーケンスでの ApprovalGate シングルトン管理と DI パターン
- Preload API 型定義の整合（`preload/types.ts` に execution namespace 追加が必要）
- Push 通知のタイミング制御（Renderer の準備完了を待つ必要あり）

## 対応方針

### Step 1: ApprovalGate シングルトン作成

`main/index.ts` または `main/services/index.ts` で `DefaultApprovalGate` インスタンスを作成し、IPC handler の登録時に注入する。

### Step 2: IPC Handler 登録

```typescript
// main/ipc/index.ts
import { registerApprovalHandlers } from "./approvalHandlers";
import { registerDisclosureHandlers } from "./disclosureHandlers";
import { registerAdvancedConsoleHandlers } from "./advancedConsoleHandlers";

// 登録処理
registerApprovalHandlers(mainWindow, approvalGate);
registerDisclosureHandlers({
  mainWindow,
  getProviderName,
  getModelName,
  getDestinations,
});
registerAdvancedConsoleHandlers({ mainWindow, getTerminalLog, getCopyCommand });
```

### Step 3: Preload API 公開

```typescript
// preload/index.ts (execution namespace追加)
execution: {
  getDisclosureInfo: () => safeInvoke(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO),
  getTerminalLog: (sessionId: string) => safeInvoke(IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG, sessionId),
  getCopyCommand: (sessionId: string) => safeInvoke(IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND, sessionId),
  respondApproval: (request) => safeInvoke(IPC_CHANNELS.APPROVAL_RESPOND, request),
  onApprovalRequest: (callback) => safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback),
}
```

### Step 4: Push 通知実装

```typescript
// Main Process からの通知
mainWindow.webContents.send(IPC_CHANNELS.APPROVAL_REQUEST, {
  operationType: "external_send",
  description: "...",
  destination: "...",
});
```

### Step 5: revokeAll() 呼び出し

セッション状態が done/aborted に遷移するハンドラ内で `approvalGate.revokeAll(sessionId)` を呼び出す。

## 変更対象ファイル

| ファイル                                                | 変更種別 |
| ------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/index.ts`                    | 修正     |
| `apps/desktop/src/main/index.ts`                        | 修正     |
| `apps/desktop/src/preload/index.ts`                     | 修正     |
| `apps/desktop/src/preload/types.ts`                     | 修正     |
| `apps/desktop/src/renderer/hooks/useApprovalFlow.ts`    | 修正     |
| `apps/desktop/src/renderer/hooks/useAdvancedConsole.ts` | 修正     |

## 完了条件

- [ ] 3つの IPC handler が `main/ipc/index.ts` から登録されている
- [ ] ApprovalGate が DI でハンドラに注入されている
- [ ] Preload の contextBridge に execution API が公開されている
- [ ] Main → Renderer の approval:request push が動作する
- [ ] セッション終了時に revokeAll() が呼び出される
- [ ] 既存 85 テスト + 新規統合テストが PASS する
