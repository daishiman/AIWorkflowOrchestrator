# Phase 5: 実装

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 5                                 |
| 機能名 | safety-gov-production-integration |
| 作成日 | 2026-03-31                        |

## 目的

Phase 4 のテストを Green にするための production 統合実装を行う。
6ファイルを修正し、全ての受入条件（AC-1〜AC-6）を満たす状態にする。

## 実行タスク

- 新規作成なし・既存修正のみの前提で対象ファイル一覧を確定する
- Main / Preload / Renderer の3境界を崩さずに ApprovalGate DI と execution API を接続する
- handler 登録、push 通知、session cleanup を同一 wave で実装する
- 実装直後に targeted test を実行し、Phase 6 の追加テスト前提を整える

### 実装計画（ファイル一覧）

#### 新規作成ファイル

なし（全て修正）

#### 修正ファイル

| ファイル                                                | 変更種別 | 主な変更内容                                  |
| ------------------------------------------------------- | -------- | --------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                    | 修正     | 3ハンドラ登録追加・ApprovalGate DI            |
| `apps/desktop/src/main/index.ts`                        | 修正     | ApprovalGate 生成（または index.ts 内で完結） |
| `apps/desktop/src/preload/index.ts`                     | 修正     | execution namespace 追加                      |
| `apps/desktop/src/preload/types.ts`                     | 修正     | ExecutionAPI 型追加・ElectronAPI 更新         |
| `apps/desktop/src/renderer/hooks/useApprovalFlow.ts`    | 修正     | electronAPI.execution 接続                    |
| `apps/desktop/src/renderer/hooks/useAdvancedConsole.ts` | 修正     | electronAPI.execution 接続                    |

### Step 1: `main/ipc/index.ts` 修正

import 追加:

```typescript
import { registerApprovalHandlers } from "./approvalHandlers";
import { registerDisclosureHandlers } from "./disclosureHandlers";
import { registerAdvancedConsoleHandlers } from "./advancedConsoleHandlers";
import { DefaultApprovalGate } from "../services/runtime/DefaultApprovalGate";
```

`registerAllIpcHandlers()` 関数内に追加（Safety Gate handlers 登録の近辺に追記）:

```typescript
// Safety Governance handlers（UT-6）
const approvalGate = new DefaultApprovalGate();
track("registerApprovalHandlers", () =>
  registerApprovalHandlers(mainWindow, approvalGate),
);
track("registerDisclosureHandlers", () =>
  registerDisclosureHandlers({
    mainWindow,
    getProviderName: () => "anthropic", // TODO: 実際の取得ロジックに置き換え
    getModelName: () => "claude-sonnet", // TODO: 実際の取得ロジックに置き換え
    getDestinations: () => [], // TODO: 実際の取得ロジックに置き換え
  }),
);
track("registerAdvancedConsoleHandlers", () =>
  registerAdvancedConsoleHandlers({
    mainWindow,
    getTerminalLog: () => "", // TODO: 実際の取得ロジックに置き換え
    getCopyCommand: () => "", // TODO: 実際の取得ロジックに置き換え
  }),
);
```

**TODO コメントの箇所は Phase 2 設計で特定した実際の DI ソースに置き換えること**

### Step 2: `preload/types.ts` 修正

```typescript
// ExecutionAPI インターフェース追加
export interface ExecutionAPI {
  getDisclosureInfo: () => Promise<{
    success: boolean;
    data?: unknown;
    error?: unknown;
  }>;
  getTerminalLog: (
    sessionId: string,
  ) => Promise<{ success: boolean; data?: string; error?: unknown }>;
  getCopyCommand: (
    sessionId: string,
  ) => Promise<{ success: boolean; data?: string; error?: unknown }>;
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

// ElectronAPI に execution フィールド追加
export interface ElectronAPI {
  // ... 既存フィールド ...
  execution: ExecutionAPI;
}
```

### Step 3: `preload/index.ts` 修正

`contextBridge.exposeInMainWorld('electronAPI', {...})` の中に追加:

```typescript
execution: {
  getDisclosureInfo: () =>
    safeInvoke(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO),
  getTerminalLog: (sessionId: string) =>
    safeInvoke(IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG, sessionId),
  getCopyCommand: (sessionId: string) =>
    safeInvoke(IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND, sessionId),
  respondApproval: (request: {
    sessionId: string;
    operationId: string;
    action: 'approve' | 'reject';
  }) => safeInvoke(IPC_CHANNELS.APPROVAL_RESPOND, request),
  onApprovalRequest: (callback: (payload: unknown) => void) =>
    safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback),
},
```

### Step 4: `renderer/hooks/useApprovalFlow.ts` 修正

```typescript
// electronAPI.execution.respondApproval を呼ぶよう更新
// electronAPI.execution.onApprovalRequest を呼ぶよう更新
// 既存のプレースホルダー実装を削除
```

### Step 5: `renderer/hooks/useAdvancedConsole.ts` 修正

```typescript
// electronAPI.execution.getTerminalLog を呼ぶよう更新
// electronAPI.execution.getCopyCommand を呼ぶよう更新
```

### Step 6: revokeAll() セッション終了連携（UT-9）

Phase 2 設計で特定したセッション終了ポイントに `approvalGate.revokeAll(sessionId)` を追加する。
**実装前に必ず `agentHandlers.ts` またはセッション管理サービスを確認すること**:

```bash
grep -rn "done\|abort\|session.*end" apps/desktop/src/main/ipc/agentHandlers.ts | head -20
```

### Step 7: 実装後テスト実行

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# 新規統合テスト実行
pnpm --filter @repo/desktop test -- \
  apps/desktop/src/main/ipc/__tests__/index.integration.test.ts \
  apps/desktop/src/preload/__tests__/index.execution.test.ts

# 全テスト実行（既存85テストを含む）
pnpm --filter @repo/desktop test
```

## 参照資料

| 参照資料                       | パス                                                   |
| ------------------------------ | ------------------------------------------------------ |
| Phase 2 設計書                 | `outputs/phase-2/design.md`                            |
| Phase 4 テスト計画             | `outputs/phase-4/test-plan.md`                         |
| 既実装 approvalHandlers        | `apps/desktop/src/main/ipc/approvalHandlers.ts`        |
| 既実装 disclosureHandlers      | `apps/desktop/src/main/ipc/disclosureHandlers.ts`      |
| 既実装 advancedConsoleHandlers | `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts` |
| IPC チャンネル定数             | `apps/desktop/src/preload/channels.ts`                 |

## 統合テスト連携【必須】

| 判定項目             | 基準       | 結果（実行時に記録） |
| -------------------- | ---------- | -------------------- |
| typecheck PASS       | エラー 0件 | -                    |
| 新規統合テスト Green | 全 pass    | -                    |
| 既存 85 テスト Green | 全 pass    | -                    |

## 成果物

| 成果物       | パス                                        | 説明                       |
| ------------ | ------------------------------------------- | -------------------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 変更ファイル一覧・差分概要 |

## 完了条件

- [ ] `main/ipc/index.ts` に3ハンドラが登録されている（AC-1）
- [ ] `DefaultApprovalGate` が DI で注入されている（AC-2）
- [ ] `preload/index.ts` に execution namespace が追加されている（AC-3）
- [ ] `preload/types.ts` に `ExecutionAPI` 型が定義されている（AC-3）
- [ ] approval:request push 通知が実装されている（AC-4）
- [ ] revokeAll() がセッション終了時に呼ばれる（AC-5）
- [ ] `useApprovalFlow.ts` が electronAPI.execution に接続されている
- [ ] `useAdvancedConsole.ts` が electronAPI.execution に接続されている
- [ ] typecheck がエラー 0件
- [ ] 新規統合テスト + 既存 85 テストが全 pass（AC-6）
- [ ] `outputs/phase-5/implementation-summary.md` が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
