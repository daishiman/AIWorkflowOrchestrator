# Phase 11: Manual Test Report (NON_VISUAL)

**Task**: UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001
**Type**: NON_VISUAL structural verification
**Date**: 2026-03-31
**Overall Result**: **STRUCTURAL PASS WITH FOLLOW-UP (4 PASS + 1 NOTE)**

---

## MT-1: IPC Handler Registration Structural Test

**Result: PASS**

**File**: `apps/desktop/src/main/ipc/index.ts`

### Import 検証

3つのハンドラモジュールと DefaultApprovalGate が正しくインポートされている:

| Import                            | 行番号 | 確認                                                                           |
| --------------------------------- | ------ | ------------------------------------------------------------------------------ |
| `registerApprovalHandlers`        | L49    | `import { registerApprovalHandlers } from "./approvalHandlers";`               |
| `registerDisclosureHandlers`      | L50    | `import { registerDisclosureHandlers } from "./disclosureHandlers";`           |
| `registerAdvancedConsoleHandlers` | L51    | `import { registerAdvancedConsoleHandlers } from "./advancedConsoleHandlers";` |
| `DefaultApprovalGate`             | L52    | `import { DefaultApprovalGate } from "../services/runtime/ApprovalGate";`      |

### インスタンス生成・登録呼び出し検証

| 処理                                     | 行番号   | コード                                                                                      |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| approvalGate 生成                        | L903     | `const approvalGate = new DefaultApprovalGate();`                                           |
| registerApprovalHandlers 呼び出し        | L904-905 | `registerApprovalHandlers(mainWindow, approvalGate)`                                        |
| registerDisclosureHandlers 呼び出し      | L910-919 | `registerDisclosureHandlers({ mainWindow, getDisclosureInfo: ... })`                        |
| registerAdvancedConsoleHandlers 呼び出し | L923-929 | `registerAdvancedConsoleHandlers({ mainWindow, getTerminalLog: ..., getCopyCommand: ... })` |

### onSessionDestroyed コールバック検証

L989-995 で `registerClaudeCliHandlers` に `onSessionDestroyed` コールバックが渡されている:

```typescript
registerClaudeCliHandlers(mainWindow, {
  onSessionDestroyed: (sessionId: string) => {
    approvalGate.revokeAll(sessionId);
  },
});
```

同一の `approvalGate` インスタンスが L903 で生成され、L904 のハンドラ登録と L991 のコールバックの両方で共有されている。

---

## MT-2: Preload API Completeness Test

**Result: PASS**

**File**: `apps/desktop/src/preload/index.ts`

### execution namespace 検証 (L367-389)

`electronAPI` オブジェクト内に `execution` ネームスペースが存在し、`contextBridge.exposeInMainWorld("electronAPI", electronAPI)` (L626) で公開されている。

### 5 メソッドの存在と安全性検証

| メソッド            | 行番号   | ラッパー     | チャネル参照                                 |
| ------------------- | -------- | ------------ | -------------------------------------------- |
| `getDisclosureInfo` | L369-370 | `safeInvoke` | `IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO` |
| `getTerminalLog`    | L371-372 | `safeInvoke` | `IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG`    |
| `getCopyCommand`    | L373-374 | `safeInvoke` | `IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND`    |
| `respondApproval`   | L375-380 | `safeInvoke` | `IPC_CHANNELS.APPROVAL_RESPOND`              |
| `onApprovalRequest` | L381-388 | `safeOn`     | `IPC_CHANNELS.APPROVAL_REQUEST`              |

全メソッドが `safeInvoke` または `safeOn` を使用しており、生の `ipcRenderer` 呼び出しは存在しない。
全チャネル参照が `IPC_CHANNELS` 定数経由であり、文字列リテラルは使用されていない。

### ExecutionAPI 型定義検証

**File**: `apps/desktop/src/preload/types.ts` (L1021-1047)

`ExecutionAPI` インターフェースに5つのメソッドが定義されており、preload 実装と型が一致している。

---

## MT-3: Approval Flow Transport Trace

**Result: NOTE**

### A. Renderer → Main (承認応答フロー)

| Step | Layer    | File                                        | Lines    | Description                                                                                          |
| ---- | -------- | ------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| 1    | Renderer | `src/renderer/hooks/useApprovalFlow.ts`     | L75-91   | `approve()` が `execution.respondApproval({ sessionId, operationId, action: "approve" })` を呼び出す |
| 2    | Renderer | `src/renderer/utils/executionApi.ts`        | L17      | `getExecutionAPI()` が `window.electronAPI.execution` を返す                                         |
| 3    | Preload  | `src/preload/index.ts`                      | L375-380 | `respondApproval` が `safeInvoke(IPC_CHANNELS.APPROVAL_RESPOND, request)` を実行                     |
| 4    | Main     | `src/main/ipc/approvalHandlers.ts`          | L43-114  | `ipcMain.handle(IPC_CHANNELS.APPROVAL_RESPOND, ...)` が受信                                          |
| 4a   | Main     | 同上                                        | L47-52   | sender 検証: `event.sender !== mainWindow.webContents`                                               |
| 4b   | Main     | 同上                                        | L55-100  | P42 準拠 3段バリデーション (request null チェック / sessionId / operationId / action)                |
| 4c   | Main     | 同上                                        | L103-108 | `approvalGate.grantApproval(req.sessionId, req.operationId)` を呼び出し                              |
| 4d   | Main     | 同上                                        | L110-111 | reject の場合は `approvalGate.rejectApproval(req.sessionId, req.operationId)`                        |
| 5    | Main     | `src/main/services/runtime/ApprovalGate.ts` | L67-81   | `grantApproval()`: crypto-safe token を生成、Map に保存、`ApprovalStatus` を返却                     |

### B. Main → Renderer (プッシュ通知フロー)

| Step | Layer    | File                                    | Lines    | Description                                                                                                                           |
| ---- | -------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Main     | `src/main/ipc/approvalHandlers.ts`      | L23-37   | `pushApprovalRequest(mainWindow, payload)` が `mainWindow.webContents.send(IPC_CHANNELS.APPROVAL_REQUEST, payload)` を実行            |
| 2    | Preload  | `src/preload/index.ts`                  | L381-388 | `onApprovalRequest` が `safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback)` でリスナー登録                                               |
| 3    | Renderer | `src/renderer/hooks/useApprovalFlow.ts` | L46-68   | `useEffect` 内で `execution.onApprovalRequest(callback)` を購読。`sessionId` が一致する場合にのみ `setCurrentRequest()` で state 更新 |

データフローは Renderer → Preload → Main → ApprovalGate (応答) と Main → Preload → Renderer (プッシュ通知) の輸送経路としては正しく接続されている。

ただし `pushApprovalRequest()` の production 呼び出し元は現時点で未接続であり、実ランタイムで approval request を自動発火する経路までは本レポート単体では確認できない。この点は Phase 12 の未タスクとして別途 formalize する。

---

## MT-4: Session Lifecycle Cleanup Trace

**Result: PASS**

### セッション破棄 → revokeAll の呼び出しチェーン

| Step | File                                        | Lines    | Description                                                                                                            |
| ---- | ------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1    | `src/main/claude-cli/SessionManager.ts`     | L200     | `this.emit("sessionDestroyed", { id, status, completedAt })`                                                           |
| 2    | `src/main/claude-cli/ClaudeCliManager.ts`   | L372     | `this.emit("sessionDestroyed", event)` (SessionManager イベントの転送)                                                 |
| 3    | `src/main/claude-cli/ipc-handler.ts`        | L277-338 | `setupEventForwarding(onSessionDestroyed)` 内の `manager.on("sessionDestroyed", ...)` (L323-338)                       |
| 3a   | 同上                                        | L327-329 | `if (onSessionDestroyed) { onSessionDestroyed(event.id); }`                                                            |
| 4    | `src/main/ipc/index.ts`                     | L989-995 | `registerClaudeCliHandlers(mainWindow, { onSessionDestroyed: (sessionId) => { approvalGate.revokeAll(sessionId); } })` |
| 5    | `src/main/services/runtime/ApprovalGate.ts` | L123-129 | `revokeAll(sessionId)`: `entries` Map から `sessionId` に一致するエントリをすべて `delete`                             |

コールバックチェーンの完全性:

- `ClaudeCliManager` → `sessionDestroyed` event emit
- `ipc-handler.ts` `setupEventForwarding` → `onSessionDestroyed(event.id)` callback
- `ipc/index.ts` → `approvalGate.revokeAll(sessionId)` 呼び出し
- `ApprovalGate.revokeAll()` → Map からの全エントリ削除

セッション終了時に approval token が確実に無効化される経路が確認できた。

---

## MT-5: Channel Whitelist Completeness

**Result: PASS**

**File**: `apps/desktop/src/preload/channels.ts`

### チャネル定数定義 (shared パッケージ)

**File**: `packages/shared/src/ipc/channels.ts` (L139-151)

```typescript
export const APPROVAL_CHANNELS = {
  APPROVAL_RESPOND: "approval:respond",
  APPROVAL_REQUEST: "approval:request",
} as const;

export const EXECUTION_CHANNELS = {
  EXECUTION_GET_DISCLOSURE_INFO: "execution:get-disclosure-info",
  EXECUTION_GET_TERMINAL_LOG: "execution:get-terminal-log",
  EXECUTION_GET_COPY_COMMAND: "execution:get-copy-command",
} as const;
```

### IPC_CHANNELS への統合 (L394-399)

```typescript
APPROVAL_RESPOND: APPROVAL_CHANNELS.APPROVAL_RESPOND,
APPROVAL_REQUEST: APPROVAL_CHANNELS.APPROVAL_REQUEST,
EXECUTION_GET_DISCLOSURE_INFO: EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
EXECUTION_GET_TERMINAL_LOG: EXECUTION_CHANNELS.EXECUTION_GET_TERMINAL_LOG,
EXECUTION_GET_COPY_COMMAND: EXECUTION_CHANNELS.EXECUTION_GET_COPY_COMMAND,
```

### ALLOWED_INVOKE_CHANNELS 検証 (L688-693)

| チャネル                                     | 行番号 | 含有 |
| -------------------------------------------- | ------ | ---- |
| `IPC_CHANNELS.APPROVAL_RESPOND`              | L689   | YES  |
| `IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO` | L690   | YES  |
| `IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG`    | L691   | YES  |
| `IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND`    | L692   | YES  |

### ALLOWED_ON_CHANNELS 検証 (L748)

| チャネル                        | 行番号 | 含有 |
| ------------------------------- | ------ | ---- |
| `IPC_CHANNELS.APPROVAL_REQUEST` | L748   | YES  |

全5チャネルがホワイトリストに正しく登録されている。

---

## Summary

| Test ID | Test Name                                | Result   |
| ------- | ---------------------------------------- | -------- |
| MT-1    | IPC Handler Registration Structural Test | **PASS** |
| MT-2    | Preload API Completeness Test            | **PASS** |
| MT-3    | Approval Flow Transport Trace            | **NOTE** |
| MT-4    | Session Lifecycle Cleanup Trace          | **PASS** |
| MT-5    | Channel Whitelist Completeness           | **PASS** |

**Overall: STRUCTURAL PASS WITH FOLLOW-UP**

Safety Governance Production Integration の構造的整合性は確認できた。
IPC ハンドラ登録、Preload API 公開、セッションライフサイクルのクリーンアップ、チャネルホワイトリストは正しく接続されている。一方で approval request の production 発火元は未接続であり、完全な実運用フロー確認には follow-up が必要。

```json
{
  "workflow": "docs/30-workflows/safety-gov-production-integration",
  "phase": 11,
  "mode": "NON_VISUAL",
  "note": "Visible surface の追加はないため、manual-test-checklist/result を正本とする。validator 互換のため placeholder PNG を 1 件だけ保持する。",
  "captures": [
    "outputs/phase-11/screenshots/TC-11-00-non-visual-placeholder.png"
  ]
}
```
