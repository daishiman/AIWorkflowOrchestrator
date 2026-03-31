# Changelog

## タスク

UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001 — Safety Governance Production Integration

---

## [2026-03-31] Safety Governance Production Integration

### 変更概要

TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 で個別に実装済みだった ApprovalGate / IPC handler / Renderer コンポーネントを、Electron アプリの production 起動パスに統合した。

---

### 変更ファイル一覧

#### Main Process

| ファイル                                          | 変更種別 | 変更内容                                                                                                                                                                                                                                   |
| ------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/desktop/src/main/ipc/index.ts`              | 修正     | Safety Governance セクション追加（L902-929）: `DefaultApprovalGate` 生成、3 ハンドラ登録（`registerApprovalHandlers`, `registerDisclosureHandlers`, `registerAdvancedConsoleHandlers`）、`onSessionDestroyed` コールバック接続（L989-994） |
| `apps/desktop/src/main/ipc/approvalHandlers.ts`   | 修正     | `pushApprovalRequest()` 関数を追加（L23-37）: Main -> Renderer への push 通知送信、`isDestroyed()` ガード付き                                                                                                                              |
| `apps/desktop/src/main/claude-cli/ipc-handler.ts` | 修正     | `ClaudeCliHandlerOptions.onSessionDestroyed` コールバック追加（L182）、`setupEventForwarding()` で `sessionDestroyed` イベント時にコールバック呼出（L327-328）                                                                             |

#### Preload

| ファイル                               | 変更種別 | 変更内容                                                                                                                                                                                                                   |
| -------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts` | 修正     | `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` の import 追加（L4-6）、5 チャンネル定数の登録（L394-399）、`ALLOWED_INVOKE_CHANNELS` に 4 チャンネル追加（L689-693）、`ALLOWED_ON_CHANNELS` に `APPROVAL_REQUEST` 追加（L748） |
| `apps/desktop/src/preload/index.ts`    | 修正     | `execution` namespace 追加（L367-389）: `getDisclosureInfo`, `getTerminalLog`, `getCopyCommand`, `respondApproval`, `onApprovalRequest` の 5 メソッド                                                                      |
| `apps/desktop/src/preload/types.ts`    | 修正     | `ExecutionAPI` インターフェース追加（L1020-1047）、`ElectronAPI.execution` プロパティ追加（L1257-1258）                                                                                                                    |

#### Renderer

| ファイル                                                | 変更種別 | 変更内容                                                                                                                      |
| ------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/hooks/useApprovalFlow.ts`    | 修正     | `getExecutionAPI()` 経由の IPC 通信に切替、`onApprovalRequest` push 通知購読の `useEffect` 追加、sessionId フィルタリング実装 |
| `apps/desktop/src/renderer/hooks/useAdvancedConsole.ts` | 修正     | `getExecutionAPI()` 経由の IPC 通信に切替、パネル表示時の遅延データフェッチ実装、キャンセル処理追加                           |
| `apps/desktop/src/renderer/utils/executionApi.ts`       | 新規     | `getExecutionAPI()` ユーティリティ関数（`window.electronAPI.execution` への型安全アクセス）                                   |

#### Shared

| ファイル                              | 変更種別 | 変更内容                                                              |
| ------------------------------------- | -------- | --------------------------------------------------------------------- |
| `packages/shared/src/ipc/channels.ts` | 既存     | `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` は既に定義済み（変更なし） |

#### テスト（新規作成）

| ファイル                                                                           | テスト数 | 対象                               |
| ---------------------------------------------------------------------------------- | -------- | ---------------------------------- |
| `src/main/ipc/__tests__/index.integration.test.ts`                                 | 11       | ハンドラ登録統合テスト             |
| `src/main/ipc/__tests__/approvalGate.revokeAll.test.ts`                            | 16       | revokeAll ライフサイクルテスト     |
| `src/main/ipc/__tests__/approvalHandlers.push.test.ts`                             | 13       | push 通知テスト                    |
| `src/main/ipc/__tests__/approvalHandlers.test.ts`                                  | 5        | approval:respond ハンドラテスト    |
| `src/main/ipc/__tests__/advancedConsoleIpc.test.ts`                                | 9        | Advanced Console ハンドラテスト    |
| `src/main/ipc/__tests__/consumerAuthGuard.test.ts`                                 | 6        | 送信元検証テスト                   |
| `src/main/ipc/__tests__/noAutoSend.test.ts`                                        | 6        | 自動送信防止テスト                 |
| `src/main/services/runtime/__tests__/approvalGate.test.ts`                         | 9        | ApprovalGate ユニットテスト        |
| `src/main/services/runtime/__tests__/governance-bundle.test.ts`                    | 19       | ガバナンスバンドルテスト           |
| `src/preload/__tests__/index.execution.test.ts`                                    | 32       | Preload execution API テスト       |
| `src/renderer/components/execution/__tests__/ApprovalSheet.test.tsx`               | 10       | ApprovalSheet コンポーネントテスト |
| `src/renderer/components/execution/__tests__/AdvancedConsolePanel.test.tsx`        | 12       | AdvancedConsolePanel テスト        |
| `src/renderer/components/execution/__tests__/SessionDisclosureBanner.test.tsx`     | 8        | SessionDisclosureBanner テスト     |
| `src/renderer/views/ExecutionConsoleView/__tests__/ctaHierarchy.test.tsx`          | 6        | CTA ヒエラルキーテスト             |
| `src/renderer/views/ExecutionConsoleView/__tests__/disclosureIntegration.test.tsx` | 14       | Disclosure 統合テスト              |

---

### Breaking Changes

なし。

既存の IPC チャンネルや API に対する破壊的変更はない。全ての変更は新規チャンネルの追加と既存 hook の IPC 通信方式の改善である。

---

### Migration Notes

#### Renderer Hooks の API 変更

**Before（旧実装）**:

```typescript
// 直接 invoke を使用
const result = await window.electronAPI.invoke("execution:get-disclosure-info");
```

**After（新実装）**:

```typescript
// execution namespace 経由
const result = await window.electronAPI.execution.getDisclosureInfo();
```

#### 影響を受けるコンポーネント

以下のコンポーネントは `electronAPI.execution.*` を使用するよう更新済み:

- `useApprovalFlow` hook → `execution.respondApproval()`, `execution.onApprovalRequest()`
- `useAdvancedConsole` hook → `execution.getTerminalLog()`, `execution.getCopyCommand()`
- `SessionDisclosureBanner` → `execution.getDisclosureInfo()`

#### 新規利用時の推奨パターン

```typescript
import { getExecutionAPI } from "../utils/executionApi";

// Electron 環境チェック込みのアクセス
const execution = getExecutionAPI();
if (!execution) return; // ブラウザ環境では undefined

await execution.respondApproval({
  sessionId: "xxx",
  operationId: "yyy",
  action: "approve",
});
```
