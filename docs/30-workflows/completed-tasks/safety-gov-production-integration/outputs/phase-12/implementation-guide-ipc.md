# Implementation Guide Part 1: IPC Integration

## タスク

UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001 — Safety Governance Production Integration

## 概要

本ドキュメントでは、Safety Governance の 3 つの IPC ハンドラがどのように Main Process に登録されるかを説明する。

---

## 1. 3 ハンドラの登録

`apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers()` 内で、以下 3 つのハンドラが `track()` ヘルパーを通じて登録される（L902-929）。

### 1.1 registerApprovalHandlers

```typescript
// ipc/index.ts L903-905
const approvalGate = new DefaultApprovalGate();
track("registerApprovalHandlers", () =>
  registerApprovalHandlers(mainWindow, approvalGate),
);
```

- **ファイル**: `apps/desktop/src/main/ipc/approvalHandlers.ts`
- **チャンネル**: `approval:respond`（invoke）
- **責務**: Renderer からの承認/拒否リクエストを受信し、`ApprovalGate.grantApproval()` / `rejectApproval()` に委譲する
- **セキュリティ**: `event.sender !== mainWindow.webContents` による送信元検証、P42 準拠 3 段バリデーション

### 1.2 registerDisclosureHandlers

```typescript
// ipc/index.ts L910-919
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
```

- **ファイル**: `apps/desktop/src/main/ipc/disclosureHandlers.ts`
- **チャンネル**: `execution:get-disclosure-info`（invoke）
- **責務**: AI サービスの利用情報（プロバイダ名・モデル名・送信先）を Renderer に返す
- **セキュリティ**: DENY-5 準拠 — API key / token を含めない

### 1.3 registerAdvancedConsoleHandlers

```typescript
// ipc/index.ts L923-929
track("registerAdvancedConsoleHandlers", () =>
  registerAdvancedConsoleHandlers({
    mainWindow,
    getTerminalLog: async (_sessionId: string) => [],
    getCopyCommand: async (_sessionId: string) => null,
  }),
);
```

- **ファイル**: `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts`
- **チャンネル**: `execution:get-terminal-log`（invoke）、`execution:get-copy-command`（invoke）
- **責務**: セッションのターミナル出力とコピーコマンドを Renderer に返す
- **セキュリティ**: DENY-6 準拠 — `sanitizeForApiKeys()` で `sk-ant-*` / `sk-*` パターンを `[REDACTED]` に置換

---

## 2. DI パターン: DefaultApprovalGate

`DefaultApprovalGate` は `registerAllIpcHandlers()` のスコープ内で 1 回だけ生成される（L903）。

```
registerAllIpcHandlers()
  └─ const approvalGate = new DefaultApprovalGate()
      ├─ registerApprovalHandlers(mainWindow, approvalGate)  // L904-905
      └─ registerClaudeCliHandlers(mainWindow, {             // L989-994
           onSessionDestroyed: (sessionId) => {
             approvalGate.revokeAll(sessionId);
           }
         })
```

### 重要な設計判断

- `approvalGate` は関数スコープ内のローカル変数であり、module-level singleton ではない
- `registerApprovalHandlers` と `registerClaudeCliHandlers` の 2 箇所からのみ参照される
- セッション終了時の `revokeAll()` コールバックは Claude CLI の `onSessionDestroyed` を通じて接続される

---

## 3. チャンネル定数フロー

チャンネル定数は以下の 5 層を経由して Main Process から Renderer に到達する。

```
packages/shared/src/ipc/channels.ts
  │  APPROVAL_CHANNELS.APPROVAL_RESPOND = "approval:respond"
  │  APPROVAL_CHANNELS.APPROVAL_REQUEST = "approval:request"
  │  EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO = "execution:get-disclosure-info"
  │  EXECUTION_CHANNELS.EXECUTION_GET_TERMINAL_LOG = "execution:get-terminal-log"
  │  EXECUTION_CHANNELS.EXECUTION_GET_COPY_COMMAND = "execution:get-copy-command"
  ▼
apps/desktop/src/preload/channels.ts
  │  import { APPROVAL_CHANNELS, EXECUTION_CHANNELS } from "@repo/shared/src/ipc/channels"
  │  IPC_CHANNELS.APPROVAL_RESPOND = APPROVAL_CHANNELS.APPROVAL_RESPOND
  │  IPC_CHANNELS.APPROVAL_REQUEST = APPROVAL_CHANNELS.APPROVAL_REQUEST
  │  IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO = EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO
  │  IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG = EXECUTION_CHANNELS.EXECUTION_GET_TERMINAL_LOG
  │  IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND = EXECUTION_CHANNELS.EXECUTION_GET_COPY_COMMAND
  ▼
ALLOWED_INVOKE_CHANNELS (channels.ts L689-693)
  │  invoke 用ホワイトリスト: APPROVAL_RESPOND, EXECUTION_GET_*
  ▼
ALLOWED_ON_CHANNELS (channels.ts L748)
  │  push 通知用ホワイトリスト: APPROVAL_REQUEST
  ▼
IPC handlers (approvalHandlers.ts, disclosureHandlers.ts, advancedConsoleHandlers.ts)
  │  ipcMain.handle(IPC_CHANNELS.APPROVAL_RESPOND, ...)
  │  ipcMain.handle(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO, ...)
  │  ipcMain.handle(IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG, ...)
  │  ipcMain.handle(IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND, ...)
  ▼
Preload API (preload/index.ts L367-389)
  │  electronAPI.execution.respondApproval → safeInvoke(APPROVAL_RESPOND)
  │  electronAPI.execution.getDisclosureInfo → safeInvoke(EXECUTION_GET_DISCLOSURE_INFO)
  │  electronAPI.execution.getTerminalLog → safeInvoke(EXECUTION_GET_TERMINAL_LOG)
  │  electronAPI.execution.getCopyCommand → safeInvoke(EXECUTION_GET_COPY_COMMAND)
  │  electronAPI.execution.onApprovalRequest → safeOn(APPROVAL_REQUEST)
```

---

## 4. TODO(DI) 項目

現在プレースホルダーコールバックが設定されている箇所。将来の実サービス統合時に差し替える。

### 4.1 getDisclosureInfo（ipc/index.ts L907-918）

```typescript
// TODO(DI): Replace getDisclosureInfo with actual service when available.
//   Current placeholder returns static metadata.
//   Production implementation should read from LLM provider config.
```

**現在の動作**: 固定値 `{ aiServiceName: "anthropic", modelName: "claude-sonnet", externalDestinations: [] }` を返す

**将来の実装**: `LLMAdapterFactory` や `AuthKeyService` から現在のプロバイダ設定を動的に読み取る

### 4.2 getTerminalLog / getCopyCommand（ipc/index.ts L920-929）

```typescript
// TODO(DI): Replace getTerminalLog / getCopyCommand with actual session log service when available.
//   Current placeholders return empty data.
//   Production implementation should read from ClaudeCliManager session logs.
```

**現在の動作**: `getTerminalLog` は空配列 `[]`、`getCopyCommand` は `null` を返す

**将来の実装**: `ClaudeCliManager` のセッションログ API から実データを取得する

---

## 関連ファイル一覧

| ファイル                                                 | 役割                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                     | ハンドラ登録オーケストレーター                              |
| `apps/desktop/src/main/ipc/approvalHandlers.ts`          | approval:respond ハンドラ + pushApprovalRequest             |
| `apps/desktop/src/main/ipc/disclosureHandlers.ts`        | execution:get-disclosure-info ハンドラ                      |
| `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts`   | execution:get-terminal-log / get-copy-command ハンドラ      |
| `apps/desktop/src/main/services/runtime/ApprovalGate.ts` | Approval token 管理サービス                                 |
| `apps/desktop/src/main/claude-cli/ipc-handler.ts`        | onSessionDestroyed コールバック受け口                       |
| `packages/shared/src/ipc/channels.ts`                    | 共有チャンネル定数（APPROVAL_CHANNELS, EXECUTION_CHANNELS） |
| `apps/desktop/src/preload/channels.ts`                   | デスクトップ用チャンネル統合・ホワイトリスト                |
