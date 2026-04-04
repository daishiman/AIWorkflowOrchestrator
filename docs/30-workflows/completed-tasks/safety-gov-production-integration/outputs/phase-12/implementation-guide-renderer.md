# Implementation Guide Part 2: Renderer Integration

## タスク

UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001 — Safety Governance Production Integration

## 概要

本ドキュメントでは、Renderer 側の ExecutionAPI インターフェース設計、React Hooks、共有ユーティリティの実装を説明する。

---

## 1. ExecutionAPI インターフェース設計

`apps/desktop/src/preload/types.ts`（L1020-1047）で定義される `ExecutionAPI` は、Renderer が Safety Governance 機能にアクセスするための統一インターフェースである。

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

### 設計方針

- **invoke 系メソッド**: `getDisclosureInfo`, `getTerminalLog`, `getCopyCommand`, `respondApproval` の 4 つ。いずれも `safeInvoke()` を通じて IPC 呼び出しを行う
- **push 通知購読**: `onApprovalRequest` は `safeOn()` パターンで Main Process からの push 通知を購読し、unsubscribe 関数を返す
- **ElectronAPI への統合**: `ElectronAPI.execution` として `contextBridge` に公開される（`preload/types.ts` L1257-1258）

### Preload 側実装（preload/index.ts L367-389）

```typescript
execution: {
  getDisclosureInfo: () =>
    safeInvoke(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO),
  getTerminalLog: (sessionId: string) =>
    safeInvoke(IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG, sessionId),
  getCopyCommand: (sessionId: string) =>
    safeInvoke(IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND, sessionId),
  respondApproval: (request) =>
    safeInvoke(IPC_CHANNELS.APPROVAL_RESPOND, request),
  onApprovalRequest: (callback) =>
    safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback),
},
```

---

## 2. useApprovalFlow Hook

**ファイル**: `apps/desktop/src/renderer/hooks/useApprovalFlow.ts`

### 責務

- Approval Sheet の表示/非表示状態管理
- Main Process からの `approval:request` push 通知の購読
- IPC 経由の承認/拒否リクエスト送信

### インターフェース

```typescript
function useApprovalFlow(sessionId: string): UseApprovalFlowReturn;

interface UseApprovalFlowReturn {
  currentRequest: ApprovalRequest | null; // null = Sheet 非表示
  requestApproval: (request: ApprovalRequest) => void;
  approve: () => Promise<void>;
  reject: () => void;
  isProcessing: boolean;
}
```

### Push 通知購読フロー

```
Main Process
  │  webContents.send("approval:request", payload)
  ▼
Preload (safeOn)
  │  ipcRenderer.on("approval:request", callback)
  ▼
useApprovalFlow - useEffect
  │  execution.onApprovalRequest((payload) => {
  │    if (payload.sessionId === sessionId) {
  │      setCurrentRequest({...});  // Approval Sheet を表示
  │    }
  │  })
  ▼
ApprovalSheet コンポーネント
  │  currentRequest !== null の場合に表示
```

### 承認/拒否レスポンスフロー

```
ApprovalSheet "承認" ボタン
  │  approve()
  ▼
useApprovalFlow
  │  execution.respondApproval({
  │    sessionId, operationId, action: "approve"
  │  })
  ▼
Preload → safeInvoke("approval:respond", request)
  ▼
Main Process - approvalHandlers
  │  approvalGate.grantApproval(sessionId, operationId)
  │  → token 生成、ApprovalStatus 返却
```

### セッション ID フィルタリング

`onApprovalRequest` で受信した payload の `sessionId` と、hook に渡された `sessionId` 引数を比較し、一致する場合のみ `currentRequest` を更新する。これにより、複数セッションが同時に存在する場合でも正しいセッションにのみ通知が表示される。

---

## 3. useAdvancedConsole Hook

**ファイル**: `apps/desktop/src/renderer/hooks/useAdvancedConsole.ts`

### 責務

- Advanced Console Panel の開閉状態管理
- パネル表示時の IPC データフェッチ（遅延ロード）
- ターミナルログとコピーコマンドの取得

### インターフェース

```typescript
function useAdvancedConsole(sessionId: string): UseAdvancedConsoleReturn;

interface UseAdvancedConsoleReturn {
  isOpen: boolean;
  toggle: () => void;
  terminalOutput: string[];
  copyCommand: string | null;
  isLoading: boolean;
}
```

### データフェッチフロー

```
toggle() → isOpen = true
  ▼
useEffect (isOpen && sessionId が truthy)
  │  setIsLoading(true)
  │  const [logResult, cmdResult] = await Promise.all([
  │    execution.getTerminalLog(sessionId),
  │    execution.getCopyCommand(sessionId),
  │  ])
  ▼
Main Process handlers
  │  getTerminalLog → sanitizeForApiKeys() → 応答
  │  getCopyCommand → sanitizeForApiKeys() → 応答
  ▼
setTerminalOutput(logResult.data)
setCopyCommand(cmdResult.data)
setIsLoading(false)
```

### キャンセル処理

`useEffect` のクリーンアップで `cancelled = true` フラグを設定し、非同期処理完了後の state 更新を防止する（React strict mode / 競合状態対策）。

---

## 4. 共有ユーティリティ: getExecutionAPI()

**ファイル**: `apps/desktop/src/renderer/utils/executionApi.ts`

```typescript
import type { ExecutionAPI } from "../../preload/types";

export function getExecutionAPI(): ExecutionAPI | undefined {
  return (window as { electronAPI?: { execution?: ExecutionAPI } }).electronAPI
    ?.execution;
}
```

### 設計意図

- **Electron 外での安全な動作**: ブラウザ環境等で `window.electronAPI` が存在しない場合に `undefined` を返す
- **型安全性**: `ExecutionAPI` 型を import して型キャストを行う
- **共通化**: `useApprovalFlow` と `useAdvancedConsole` の両方から呼ばれる共通アクセサ。各 hook 内で null チェック後に使用する
- **抽出の経緯**: 当初は各 hook 内にインラインで記述されていたが、Phase 8（リファクタリング）で `renderer/utils/executionApi.ts` に抽出された

---

## 5. コンポーネント統合

Renderer 側のコンポーネント階層は以下の通り:

```
ExecutionConsoleView (src/renderer/views/ExecutionConsoleView/index.tsx)
  ├── SessionDisclosureBanner
  │     └── getExecutionAPI().getDisclosureInfo()
  ├── ApprovalSheet
  │     └── useApprovalFlow(sessionId)
  │           ├── approve() → respondApproval()
  │           └── reject() → respondApproval()
  └── AdvancedConsolePanel
        └── useAdvancedConsole(sessionId)
              ├── getTerminalLog()
              └── getCopyCommand()
```

### CTA ヒエラルキー

- **Layer 1 (Primary Surface)**: SessionDisclosureBanner — AI 利用情報の常時表示
- **Layer 2 (Safety Surface)**: ApprovalSheet — 危険操作・外部送信の承認 UI
- **Layer 3 (Detail Surface)**: AdvancedConsolePanel — ターミナルログ・コピーコマンド

---

## 関連ファイル一覧

| ファイル                                                                     | 役割                                      |
| ---------------------------------------------------------------------------- | ----------------------------------------- |
| `apps/desktop/src/preload/types.ts`                                          | ExecutionAPI インターフェース定義         |
| `apps/desktop/src/preload/index.ts`                                          | execution namespace の contextBridge 実装 |
| `apps/desktop/src/renderer/hooks/useApprovalFlow.ts`                         | Approval フロー管理 hook                  |
| `apps/desktop/src/renderer/hooks/useAdvancedConsole.ts`                      | Advanced Console 管理 hook                |
| `apps/desktop/src/renderer/utils/executionApi.ts`                            | getExecutionAPI() 共有ユーティリティ      |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`             | 統合ビュー                                |
| `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx`           | 承認 UI コンポーネント                    |
| `apps/desktop/src/renderer/components/execution/AdvancedConsolePanel.tsx`    | コンソールパネルコンポーネント            |
| `apps/desktop/src/renderer/components/execution/SessionDisclosureBanner.tsx` | 開示バナーコンポーネント                  |
