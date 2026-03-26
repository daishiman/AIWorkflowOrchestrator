# Implementation Guide: permission-store-handlers sender 検証追加

## Task: UT-06-002-UT-1 | Issue: #1527

---

## Part 1: 概念説明

### IPC sender 検証とは?

Electron アプリには「メインプロセス」と「レンダラープロセス」の2つの世界があります。

**日常の例え: 病院の受付**

病院の受付では、患者が来たときに必ず「身分証の確認」をしますよね。これが「sender 検証」です。

- **患者** = レンダラープロセス（画面を表示する側）
- **受付** = IPC ハンドラ（リクエストを受け付ける側）
- **身分証確認** = `validateIpcSender`（送信元の確認）
- **診察室** = PermissionStore（権限データの操作）

身分証を確認せずに診察室に通してしまうと、部外者が患者のカルテを見たり書き換えたりできてしまいます。同じように、sender 検証なしの IPC ハンドラは、悪意のあるスクリプトや DevTools から権限データを操作される危険があります。

### なぜ全てのハンドラで必要?

4つのハンドラ（ツール一覧取得・取り消し・全クリア・セッションクリア）のうち1つでも検証がなければ、そこが「裏口」になります。泥棒は正面玄関ではなく、鍵のかかっていない窓から入ります。

---

## Part 2: 開発者向け実装詳細

### 変更概要

`permission-store-handlers.ts` の全4ハンドラに `withValidation` ラッパーを適用し、不正な BrowserWindow からの IPC 呼び出しを拒否するようにしました。

### 変更ファイル

| File                                                                    | Change                                    |
| ----------------------------------------------------------------------- | ----------------------------------------- |
| `apps/desktop/src/main/ipc/permission-store-handlers.ts`                | Signature change + withValidation wrapper |
| `apps/desktop/src/main/ipc/index.ts`                                    | Call site updated with mainWindow         |
| `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts` | Mock + 14 new tests                       |

### API Change

```typescript
// Before
export function registerPermissionStoreHandlers(
  permissionStore: IPermissionStore,
): void;

// After
export function registerPermissionStoreHandlers(
  mainWindow: BrowserWindow,
  permissionStore: IPermissionStore,
): void;
```

### withValidation Pattern

```typescript
ipcMain.handle(
  IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS,
  withValidation(
    IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS,
    async (): Promise<GetAllowedToolsResponse> => {
      // Business logic unchanged
    },
    { getAllowedWindows: () => [mainWindow] },
  ),
);
```

### Testing

Mock setup for sender validation:

```typescript
vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
  withValidation: (channel, handler, options) => {
    return async (event, ...args) => {
      const validation = mockValidateIpcSender(event, channel, options);
      if (!validation.valid) return mockToIPCValidationError(validation);
      return handler(event, ...args);
    };
  },
}));
```

### revokeTool P42 Validation (追加改善)

レビュー指摘により、`revokeTool` ハンドラにも P42準拠3段バリデーションを追加:

```typescript
// P42準拠 3段バリデーション
if (typeof args?.toolName !== "string" || args.toolName.trim() === "") {
  return { success: false };
}
permissionStore.revokeTool(args.toolName.trim());
```

### Test Summary

- 42 total tests (26 existing + 16 new)
- SEC-01~04: Valid sender returns normal response
- SEC-05~08: Invalid sender returns error (not throw)
- SEC-09: All 4 handlers call validateIpcSender + channel name verification (P45)
- SEC-10: getAllowedWindows callback returns [mainWindow]
- SEC-11~14: Edge cases (FORBIDDEN, pre-validation block, concurrency, per-handler callback)
- revokeTool: space-only toolName validation (P42)
- unregisterPermissionStoreHandlers: 4-channel removeHandler verification
