# System Specification Update

## タスク

UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001 — Safety Governance Production Integration

## 概要

Safety Governance の production 統合により追加・変更されたアーキテクチャ要素をまとめる。

---

## 1. アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Main Process                                 │
│                                                                     │
│  ┌─────────────────────────────────┐                                │
│  │    registerAllIpcHandlers()     │                                │
│  │         (ipc/index.ts)         │                                │
│  │                                │                                │
│  │  ┌──────────────────────────┐  │   ┌──────────────────────────┐ │
│  │  │  DefaultApprovalGate     │──┼──▶│  registerApprovalHandlers│ │
│  │  │  (ApprovalGate.ts)       │  │   │  approval:respond        │ │
│  │  │                          │  │   └──────────────────────────┘ │
│  │  │  - grantApproval()       │  │                                │
│  │  │  - rejectApproval()      │  │   ┌──────────────────────────┐ │
│  │  │  - checkApproval()       │  │   │  registerDisclosure-     │ │
│  │  │  - revokeAll()      ─────┼──┼──▶│  Handlers                │ │
│  │  │                          │  │   │  execution:get-           │ │
│  │  └──────────────────────────┘  │   │  disclosure-info          │ │
│  │              │                 │   └──────────────────────────┘ │
│  │              │ revokeAll()     │                                │
│  │              ▼                 │   ┌──────────────────────────┐ │
│  │  ┌──────────────────────────┐  │   │  registerAdvancedConsole-│ │
│  │  │  registerClaudeCliHdlrs  │  │   │  Handlers                │ │
│  │  │  onSessionDestroyed ─────┼──┼──▶│  execution:get-terminal- │ │
│  │  │  callback                │  │   │  log                     │ │
│  │  └──────────────────────────┘  │   │  execution:get-copy-     │ │
│  │                                │   │  command                 │ │
│  └────────────────────────────────┘   └──────────────────────────┘ │
│                                                                     │
│  pushApprovalRequest()                                              │
│    mainWindow.webContents.send("approval:request", payload)         │
│                                                                     │
├─────────────────────────────── IPC ────────────────────────────────┤
│                                                                     │
│                      Preload (contextBridge)                        │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  electronAPI.execution                                      │    │
│  │                                                             │    │
│  │  invoke:                                                    │    │
│  │    respondApproval()   → safeInvoke("approval:respond")     │    │
│  │    getDisclosureInfo() → safeInvoke("execution:get-*")      │    │
│  │    getTerminalLog()    → safeInvoke("execution:get-*")      │    │
│  │    getCopyCommand()    → safeInvoke("execution:get-*")      │    │
│  │                                                             │    │
│  │  push:                                                      │    │
│  │    onApprovalRequest() → safeOn("approval:request")         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
├─────────────────────────────── IPC ────────────────────────────────┤
│                                                                     │
│                        Renderer Process                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  getExecutionAPI()  (renderer/utils/executionApi.ts)        │    │
│  │    └── window.electronAPI.execution                         │    │
│  └─────────────────┬──────────────────────┬────────────────────┘    │
│                    │                      │                         │
│  ┌─────────────────▼──────┐  ┌────────────▼────────────────────┐   │
│  │  useApprovalFlow()     │  │  useAdvancedConsole()           │   │
│  │  - onApprovalRequest   │  │  - getTerminalLog               │   │
│  │  - respondApproval     │  │  - getCopyCommand               │   │
│  └─────────────────┬──────┘  └────────────┬────────────────────┘   │
│                    │                      │                         │
│  ┌─────────────────▼──────────────────────▼────────────────────┐   │
│  │  ExecutionConsoleView                                       │   │
│  │  ├── SessionDisclosureBanner (Layer 1)                      │   │
│  │  ├── ApprovalSheet           (Layer 2)                      │   │
│  │  └── AdvancedConsolePanel    (Layer 3)                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. 新規追加コンポーネント

### Main Process

| コンポーネント                             | ファイル                                  | 追加内容                                                                 |
| ------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------ |
| DefaultApprovalGate インスタンス           | `src/main/ipc/index.ts` L903              | `registerAllIpcHandlers()` 内で生成、2 箇所に注入                        |
| registerApprovalHandlers                   | `src/main/ipc/approvalHandlers.ts`        | `approval:respond` ハンドラ + `pushApprovalRequest()`                    |
| registerDisclosureHandlers                 | `src/main/ipc/disclosureHandlers.ts`      | `execution:get-disclosure-info` ハンドラ                                 |
| registerAdvancedConsoleHandlers            | `src/main/ipc/advancedConsoleHandlers.ts` | `execution:get-terminal-log` / `execution:get-copy-command` ハンドラ     |
| onSessionDestroyed callback                | `src/main/ipc/index.ts` L991-993          | Claude CLI セッション終了時に `approvalGate.revokeAll(sessionId)` を呼出 |
| ClaudeCliHandlerOptions.onSessionDestroyed | `src/main/claude-cli/ipc-handler.ts` L182 | コールバックインターフェース追加                                         |

### Preload

| コンポーネント               | ファイル                                 | 追加内容                                         |
| ---------------------------- | ---------------------------------------- | ------------------------------------------------ |
| ExecutionAPI 型定義          | `src/preload/types.ts` L1020-1047        | 5 メソッドの型定義                               |
| execution namespace          | `src/preload/index.ts` L367-389          | contextBridge 経由の API 公開                    |
| APPROVAL_CHANNELS import     | `src/preload/channels.ts` L4-6, L394-399 | 共有チャンネル定数のインポート                   |
| ALLOWED_INVOKE_CHANNELS 追加 | `src/preload/channels.ts` L689-693       | 4 invoke チャンネルのホワイトリスト登録          |
| ALLOWED_ON_CHANNELS 追加     | `src/preload/channels.ts` L748           | `approval:request` push 通知のホワイトリスト登録 |

### Renderer

| コンポーネント          | ファイル                                   | 追加内容                        |
| ----------------------- | ------------------------------------------ | ------------------------------- |
| getExecutionAPI()       | `src/renderer/utils/executionApi.ts`       | 型安全な ExecutionAPI アクセサ  |
| useApprovalFlow hook    | `src/renderer/hooks/useApprovalFlow.ts`    | push 通知購読 + 承認/拒否フロー |
| useAdvancedConsole hook | `src/renderer/hooks/useAdvancedConsole.ts` | パネル開閉 + データフェッチ     |

---

## 3. IPC チャンネルテーブル

| チャンネル名                    | 方向             | 種別   | ハンドラ                          | 目的                                                       |
| ------------------------------- | ---------------- | ------ | --------------------------------- | ---------------------------------------------------------- |
| `approval:respond`              | Renderer -> Main | invoke | `registerApprovalHandlers`        | Renderer からの承認/拒否応答を Main の ApprovalGate に委譲 |
| `approval:request`              | Main -> Renderer | push   | `pushApprovalRequest()`           | 危険操作・外部送信の承認リクエストを Renderer に通知       |
| `execution:get-disclosure-info` | Renderer -> Main | invoke | `registerDisclosureHandlers`      | AI サービス利用情報（プロバイダ名・モデル名）を取得        |
| `execution:get-terminal-log`    | Renderer -> Main | invoke | `registerAdvancedConsoleHandlers` | セッションのターミナル出力を取得（API key sanitize 済み）  |
| `execution:get-copy-command`    | Renderer -> Main | invoke | `registerAdvancedConsoleHandlers` | セッションのコピーコマンドを取得（API key sanitize 済み）  |

### チャンネル定数の定義元

全 5 チャンネルは `packages/shared/src/ipc/channels.ts` で定義され、`apps/desktop/src/preload/channels.ts` で re-export される。

```typescript
// packages/shared/src/ipc/channels.ts
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

---

## 4. セキュリティ制約

| ID           | 制約                                                        | 実装箇所                                                            |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| DENY-5       | Disclosure 応答に API key / token を含めない                | `disclosureHandlers.ts` — provider 名・model 名・送信先種別のみ返却 |
| DENY-6       | Terminal log / copy command から API key を除去             | `advancedConsoleHandlers.ts` — `sanitizeForApiKeys()`               |
| P42          | 3 段バリデーション（null check → type check → value check） | 全 handler で実装                                                   |
| Sender 検証  | `event.sender !== mainWindow.webContents` チェック          | 全 handler の先頭で実施                                             |
| Token TTL    | Approval token は 300 秒で自動失効                          | `ApprovalGate.ts` APPROVAL_TTL_SECONDS                              |
| 単一操作失効 | 承認済み token は 1 回使用で無効化                          | `ApprovalGate.checkApproval()` — `entry.used = true`                |

---

## 5. ライフサイクル統合

```
セッション開始
  │
  ▼
実行中（running state）
  │  ├── approval:request push (Main → Renderer)
  │  ├── approval:respond invoke (Renderer → Main)
  │  └── execution:get-* invoke (Renderer → Main)
  │
  ▼
セッション終了（abort / done）
  │  ClaudeCliManager "sessionDestroyed" event
  │    └── onSessionDestroyed callback
  │         └── approvalGate.revokeAll(sessionId)
  │              └── 全 pending token を削除
  ▼
クリーンアップ完了
```
