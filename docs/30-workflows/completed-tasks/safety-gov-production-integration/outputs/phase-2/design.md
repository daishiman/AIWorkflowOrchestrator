# Phase 2: 設計書

## C-1: IPC Handler 登録設計

`registerAllIpcHandlers()` の Safety Gate handlers セクション（L878付近）の直後に追加。

```typescript
// Safety Governance handlers（UT-6: production統合）
const approvalGate = new DefaultApprovalGate();
track("registerApprovalHandlers", () =>
  registerApprovalHandlers(mainWindow, approvalGate),
);
track("registerDisclosureHandlers", () =>
  registerDisclosureHandlers({
    mainWindow,
    getDisclosureInfo: async () => ({
      aiServiceName: "anthropic",
      modelName: "claude-sonnet",
      externalDestinations: [],
    }),
  }),
);
track("registerAdvancedConsoleHandlers", () =>
  registerAdvancedConsoleHandlers({
    mainWindow,
    getTerminalLog: async (_sessionId: string) => [],
    getCopyCommand: async (_sessionId: string) => null,
  }),
);
```

**DI 境界**: `DefaultApprovalGate` は `main/ipc/index.ts` 内でインスタンス生成。`IApprovalGate` インターフェースは `ApprovalGate.ts` に既存。

## C-2: ApprovalGate DI 設計

- `DefaultApprovalGate` を `registerAllIpcHandlers()` 内で1回生成
- `registerApprovalHandlers` の第2引数に DI 注入
- revokeAll() のため `approvalGate` 参照をセッション終了ハンドラにも渡す（C-5参照）

## C-3: Preload execution namespace 設計

### 型定義 (`preload/types.ts`)

```typescript
export interface ExecutionAPI {
  getDisclosureInfo: () => Promise<{
    success: boolean;
    data?: unknown;
    error?: unknown;
  }>;
  getTerminalLog: (
    sessionId: string,
  ) => Promise<{ success: boolean; data?: string[]; error?: unknown }>;
  getCopyCommand: (
    sessionId: string,
  ) => Promise<{ success: boolean; data?: string | null; error?: unknown }>;
  respondApproval: (request: {
    sessionId: string;
    operationId: string;
    action: "approve" | "reject";
  }) => Promise<{ success: boolean; error?: unknown }>;
  onApprovalRequest: (
    callback: (payload: {
      operationType: string;
      description: string;
      destination: string;
      sessionId: string;
      operationId: string;
    }) => void,
  ) => () => void;
}
```

`ElectronAPI` に `execution: ExecutionAPI` フィールド追加。

### 実装 (`preload/index.ts`)

```typescript
execution: {
  getDisclosureInfo: () => safeInvoke(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO),
  getTerminalLog: (sessionId: string) => safeInvoke(IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG, sessionId),
  getCopyCommand: (sessionId: string) => safeInvoke(IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND, sessionId),
  respondApproval: (request) => safeInvoke(IPC_CHANNELS.APPROVAL_RESPOND, request),
  onApprovalRequest: (callback) => safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback),
},
```

## C-4: Push 通知設計

`approval:request` の push は `approvalHandlers` のロジック変更ではなく、セッション実行フロー内で `mainWindow.webContents.send()` を呼ぶ。

```typescript
if (!mainWindow.webContents.isDestroyed()) {
  mainWindow.webContents.send(IPC_CHANNELS.APPROVAL_REQUEST, payload);
}
```

現時点では push 発火ポイントが未確定のため、handler 登録テストでは mock による検証にとどめる。

## C-5: revokeAll() 統合設計

`agentHandlers.ts` にセッション停止・終了時のフックが存在する場合、そこに `approvalGate.revokeAll(sessionId)` を追加。

代替案: `registerAllIpcHandlers()` 内で agent stop/abort ハンドラに approvalGate を渡し、セッション終了コールバック内で呼び出す。

## Renderer hooks 更新設計

### useApprovalFlow.ts

- `window.electronAPI.invoke("approval:respond", ...)` → `window.electronAPI.execution.respondApproval({...})`
- `onApprovalRequest` push リスナー追加

### useAdvancedConsole.ts

- `electronAPI.invoke("execution:get-terminal-log", ...)` → `electronAPI.execution.getTerminalLog(sessionId)`
- `electronAPI.invoke("execution:get-copy-command", ...)` → `electronAPI.execution.getCopyCommand(sessionId)`
