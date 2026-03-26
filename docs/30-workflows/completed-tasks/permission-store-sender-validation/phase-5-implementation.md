# Phase 5: 実装

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 5                                  |
| 機能名   | permission-store-sender-validation |
| タスクID | UT-06-002-UT-1                     |
| Issue    | #1527                              |
| 作成日   | 2026-03-24                         |

## 目的

TDD Green フェーズ。Phase 4 で作成したテストを PASS させる最小限の実装を行う。

## 参照資料

| 資料名         | パス                                                     | 説明             |
| -------------- | -------------------------------------------------------- | ---------------- |
| Phase 2 設計   | `phase-2-design.md`                                      | 実装設計         |
| Phase 4 テスト | `phase-4-test-creation.md`                               | テストケース定義 |
| 対象ファイル   | `apps/desktop/src/main/ipc/permission-store-handlers.ts` | 修正対象         |
| 呼び出し元     | `apps/desktop/src/main/ipc/index.ts` L858-862            | 引数修正箇所     |

## 実行タスク

### Task 1: permission-store-handlers.ts の修正

1. import 追加: `BrowserWindow` (electron), `withValidation` (ipc-validator)
2. 関数シグネチャ変更: `(mainWindow: BrowserWindow, permissionStore: IPermissionStore)`
3. 各ハンドラに sender 検証追加（4箇所）:
   - `permission:getAllowedTools`: `async ()` → `async (event)` + 検証
   - `permission:revokeTool`: `_event` → `event` + 検証
   - `permission:clearAll`: `async ()` → `async (event)` + 検証
   - `permission:clear-session`: `_event` → `event` + 検証

### Task 2: ipc/index.ts の呼び出し修正

- L861: `registerPermissionStoreHandlers(permissionStore)` → `registerPermissionStoreHandlers(mainWindow, permissionStore)`

## 実行手順

### ステップ1: import 追加

```typescript
import type { BrowserWindow } from "electron";
import { withValidation } from "../../infrastructure/security/ipc-validator";
```

（`validateIpcSender` と `toIPCValidationError` は不要。`withValidation` が内部で使用する）

### ステップ2: 関数シグネチャ変更

第1引数に `mainWindow: BrowserWindow` を追加。

```typescript
// Before
export function registerPermissionStoreHandlers(
  permissionStore: IPermissionStore,
): void {

// After
export function registerPermissionStoreHandlers(
  mainWindow: BrowserWindow,
  permissionStore: IPermissionStore,
): void {
```

### ステップ3: 各ハンドラに sender 検証追加

各ハンドラを `withValidation` でラップする（4ハンドラ全て）。`withValidation` は内部で `validateIpcSender` を呼び出し、検証失敗時はエラー応答を `return` する（`throw` ではない）。

```typescript
ipcMain.handle(
  IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS,
  withValidation(
    IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS,
    async (): Promise<GetAllowedToolsResponse> => {
      try {
        const tools = permissionStore.getAllowedToolEntries();
        return { tools };
      } catch (error) {
        console.error(
          "[PermissionHandlers] Failed to get allowed tools:",
          error,
        );
        return { tools: [] };
      }
    },
    { getAllowedWindows: () => [mainWindow] },
  ),
);

// permission:revokeTool, permission:clearAll, permission:clear-session も同様に
// withValidation でラップする（既存ビジネスロジックは変更なし）
```

### ステップ4: 呼び出し元修正

`apps/desktop/src/main/ipc/index.ts` L861 付近を修正:

```typescript
// Before
registerPermissionStoreHandlers(permissionStore);

// After
registerPermissionStoreHandlers(mainWindow, permissionStore);
```

### ステップ5: テスト実行

全テスト（既存 + SEC-01~SEC-10）が PASS することを確認。

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/permission-store-handlers.test.ts
```

**注意**: `withValidation` は `return` パターンのため、テストのアサーションは `rejects.toThrow()` ではなく `toEqual(errorResponse)` を使用する。

## 統合テスト連携

- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/permission-store-handlers.test.ts` で全テスト PASS
- `pnpm typecheck` PASS

## 多角的チェック観点

- **セキュリティ**: 全4ハンドラで sender 検証が行われること
- **DI パターン**: mainWindow が正しく注入されていること
- **後方互換性**: 呼び出し元の修正漏れがないこと

## 成果物

| 成果物             | パス                                                     |
| ------------------ | -------------------------------------------------------- |
| 修正済みハンドラ   | `apps/desktop/src/main/ipc/permission-store-handlers.ts` |
| 修正済み呼び出し元 | `apps/desktop/src/main/ipc/index.ts`                     |

## 完了条件

- [ ] 全4ハンドラに withValidation ラッパーが適用されている
- [ ] 関数シグネチャに mainWindow: BrowserWindow が追加されている
- [ ] ipc/index.ts の呼び出しに mainWindow が渡されている
- [ ] 全テストが PASS する
- [ ] TypeScript 型チェックが PASS する

## 次のPhase

Phase 6: テスト拡充 — カバレッジ不足箇所のテスト追加

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクが完了している
- [ ] 完了条件の全項目がチェック済み
- [ ] 成果物が全て生成されている

## サブタスク管理

本Phaseのサブタスク:

- なし（単一タスクとして実行）
