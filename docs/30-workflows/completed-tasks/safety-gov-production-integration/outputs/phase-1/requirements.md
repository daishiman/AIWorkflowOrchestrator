# Phase 1: 要件定義 — 成果物

## 既存実装状態調査結果（P50チェック）

| ファイル                                | 状態       | 備考                                                                            |
| --------------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| `main/ipc/approvalHandlers.ts`          | 実装済み   | `registerApprovalHandlers(mainWindow, approvalGate: IApprovalGate)`             |
| `main/ipc/disclosureHandlers.ts`        | 実装済み   | `registerDisclosureHandlers({mainWindow, getDisclosureInfo})`                   |
| `main/ipc/advancedConsoleHandlers.ts`   | 実装済み   | `registerAdvancedConsoleHandlers({mainWindow, getTerminalLog, getCopyCommand})` |
| `main/services/runtime/ApprovalGate.ts` | 実装済み   | `DefaultApprovalGate` + `IApprovalGate` interface                               |
| `main/ipc/index.ts`                     | **未登録** | 3ハンドラが `registerAllIpcHandlers` に含まれていない                           |
| `preload/index.ts`                      | **未公開** | `execution` namespace が contextBridge に存在しない                             |
| `preload/types.ts`                      | **未定義** | `ExecutionAPI` 型定義がない                                                     |
| `preload/channels.ts`                   | 定義済み   | 5チャンネル全て定義・ホワイトリスト登録済み                                     |
| `renderer/hooks/useApprovalFlow.ts`     | 実装済み   | `electronAPI.invoke()` ジェネリック呼び出し（型不安全）                         |
| `renderer/hooks/useAdvancedConsole.ts`  | 実装済み   | `electronAPI.invoke()` ジェネリック呼び出し（型不安全）                         |

### IPC チャンネル状態

| チャンネル                    | 定数 | ALLOWED_INVOKE | ALLOWED_ON | 値                              |
| ----------------------------- | ---- | -------------- | ---------- | ------------------------------- |
| APPROVAL_RESPOND              | ✅   | ✅             | -          | `approval:respond`              |
| APPROVAL_REQUEST              | ✅   | -              | ✅         | `approval:request`              |
| EXECUTION_GET_DISCLOSURE_INFO | ✅   | ✅             | -          | `execution:get-disclosure-info` |
| EXECUTION_GET_TERMINAL_LOG    | ✅   | ✅             | -          | `execution:get-terminal-log`    |
| EXECUTION_GET_COPY_COMMAND    | ✅   | ✅             | -          | `execution:get-copy-command`    |

### 既存テスト数

- `approvalHandlers.test.ts` — 存在
- `advancedConsoleIpc.test.ts` — 存在

## 機能要件

### FR-1: IPC Handler 登録

- `registerAllIpcHandlers()` 内で `registerApprovalHandlers(mainWindow, approvalGate)` を登録
- `registerAllIpcHandlers()` 内で `registerDisclosureHandlers({mainWindow, getDisclosureInfo})` を登録
- `registerAllIpcHandlers()` 内で `registerAdvancedConsoleHandlers({mainWindow, getTerminalLog, getCopyCommand})` を登録

### FR-2: ApprovalGate シングルトン

- `DefaultApprovalGate` インスタンスを `registerAllIpcHandlers()` 内で生成し DI 注入

### FR-3: Preload execution API 公開

- `preload/index.ts` の `electronAPI` に `execution` 名前空間追加
- `safeInvoke` / `safeOn` パターン準拠
- `preload/types.ts` の `ElectronAPI` に `ExecutionAPI` 型追加

### FR-4: Approval Request Push 通知

- `mainWindow.webContents.send(IPC_CHANNELS.APPROVAL_REQUEST, payload)` で Renderer に Push
- `ALLOWED_ON_CHANNELS` に `APPROVAL_REQUEST` 登録済み（確認済み）

### FR-5: revokeAll() セッション終了連携

- セッション `done` / `aborted` 遷移時に `approvalGate.revokeAll(sessionId)` を呼び出し
- agentHandlers.ts のセッション停止フロー内に統合

### FR-6: Renderer hooks の IPC 接続

- `useApprovalFlow.ts` — `electronAPI.execution.respondApproval()` / `onApprovalRequest()` に切替
- `useAdvancedConsole.ts` — `electronAPI.execution.getTerminalLog()` / `getCopyCommand()` に切替

## 非機能要件

- **NFR-1**: `ExecutionAPI` インターフェース定義。`any` 型禁止
- **NFR-2**: sender 検証維持、contextBridge 経由のみ
- **NFR-3**: 既存テスト互換性維持

## 受入条件

| ID   | 条件                                                     | 検証方法                |
| ---- | -------------------------------------------------------- | ----------------------- |
| AC-1 | 3つの IPC handler が `registerAllIpcHandlers()` から登録 | コードレビュー + テスト |
| AC-2 | `DefaultApprovalGate` が DI で注入                       | コードレビュー + テスト |
| AC-3 | `electronAPI.execution` が contextBridge に公開          | Preload テスト          |
| AC-4 | approval:request push 通知が動作                         | 統合テスト              |
| AC-5 | セッション終了時に `revokeAll()` 呼び出し                | テスト                  |
| AC-6 | 既存テスト + 新規テストが全 PASS                         | テスト実行              |

## スコープ

**含む**: handler 登録、DI 注入、Preload API 公開、型定義追加、hooks 接続、統合テスト

**含まない**: handler ロジック変更、新規 UI コンポーネント、IPC_CHANNELS 定数追加（既存）
