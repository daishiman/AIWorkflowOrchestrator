# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 4                                  |
| 機能名   | permission-store-sender-validation |
| タスクID | UT-06-002-UT-1                     |
| Issue    | #1527                              |
| 作成日   | 2026-03-24                         |

## 目的

TDD Red フェーズ。sender 検証のテストを先に作成し、実装前にテストが失敗することを確認する。

## 参照資料

| 資料名       | パス                                                                    | 説明                      |
| ------------ | ----------------------------------------------------------------------- | ------------------------- |
| Phase 2 設計 | `phase-2-design.md`                                                     | テスト設計（セクション4） |
| 既存テスト   | `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts` | 修正対象                  |

## 実行タスク

### Task 1: 既存テストの修正

- 全ての `registerPermissionStoreHandlers(mockPermissionStore)` 呼び出しを `registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore)` に変更
- `mockMainWindow` の定義を追加
- `validateIpcSender` のモックを追加（`vi.mock` で常に `{ valid: true }` を返す）
- 既存テストでは `{} as IpcMainInvokeEvent` で渡している event を `createMockEvent()` に変更

### Task 2: sender 検証テスト追加（SEC-01~SEC-10）

- SEC-01~SEC-04: 正常な sender からの各ハンドラ呼び出し → 正常応答
- SEC-05~SEC-08: 不正 sender（`validateIpcSender` が `{ valid: false }` を返す）からの各ハンドラ → エラー応答を返す
- SEC-09: 全4ハンドラで `validateIpcSender` が呼ばれることの確認
- SEC-10: `getAllowedWindows` コールバックが `[mainWindow]` を返すこと（P41対策）

## 実行手順

### ステップ1: モック追加

テストファイル先頭にモックと mockMainWindow を追加。

```typescript
vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn(
    (v) => new Error(v.reason ?? "IPC validation failed"),
  ),
}));

const mockMainWindow = {
  id: 1,
  webContents: { id: 1 },
} as unknown as BrowserWindow;

function createMockEvent(senderId = 1): IpcMainInvokeEvent {
  return {
    sender: { id: senderId },
    senderFrame: null,
  } as unknown as IpcMainInvokeEvent;
}
```

### ステップ2: 既存テスト修正

registerPermissionStoreHandlers の呼び出しに mockMainWindow を追加。

```typescript
// Before
registerPermissionStoreHandlers(mockPermissionStore);

// After
registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
```

### ステップ3: sender 検証テストブロック追加

`describe("sender 検証 (UT-06-002-UT-1)")` ブロックを追加し SEC-01~SEC-10 を実装。

```typescript
describe("sender 検証 (UT-06-002-UT-1)", () => {
  let mockValidateIpcSender: ReturnType<typeof vi.fn>;
  let mockToIPCValidationError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockValidateIpcSender = vi.mocked(validateIpcSender);
    mockToIPCValidationError = vi.mocked(toIPCValidationError);
    mockValidateIpcSender.mockReturnValue({ valid: true });
    registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
  });

  // SEC-01~SEC-04: 正常 sender（withValidation が valid: true を返す）
  it("SEC-01: 正常 sender から permission:getAllowedTools を呼ぶと正常応答", async () => {
    const handler = handlers.get(IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS);
    const result = await handler(createMockEvent());
    expect(result).toHaveProperty("tools");
  });

  // SEC-02, SEC-03, SEC-04 は SEC-01 と同上パターン（対象チャンネルのみ異なる）

  // SEC-05~SEC-08: 不正 sender から各ハンドラがエラー応答を返す
  it("SEC-05: 不正 sender から permission:getAllowedTools を呼ぶとエラー応答を返す", async () => {
    const errorResponse = {
      success: false,
      error: { code: "IPC_UNAUTHORIZED", message: "Unauthorized" },
    };
    mockValidateIpcSender.mockReturnValue({
      valid: false,
      reason: "UNKNOWN_SENDER",
    });
    mockToIPCValidationError.mockReturnValue(errorResponse);
    const handler = handlers.get(IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS);
    const result = await handler(createMockEvent(999));
    expect(result).toEqual(errorResponse);
    expect(mockPermissionStore.getAllowedToolEntries).not.toHaveBeenCalled();
  });

  // SEC-06, SEC-07, SEC-08 は SEC-05 と同上パターン（対象チャンネルのみ異なる）

  // SEC-09: 全4ハンドラで validateIpcSender が呼ばれること
  it("SEC-09: 全4ハンドラで validateIpcSender が呼ばれる", async () => {
    const channels = [
      IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS,
      IPC_CHANNELS.PERMISSION_REVOKE_TOOL,
      IPC_CHANNELS.PERMISSION_CLEAR_ALL,
      IPC_CHANNELS.PERMISSION_CLEAR_SESSION,
    ];
    for (const ch of channels) {
      const handler = handlers.get(ch);
      await handler(createMockEvent(), { toolName: "test", sessionId: "s1" });
    }
    expect(mockValidateIpcSender).toHaveBeenCalledTimes(4);
  });

  // SEC-10: getAllowedWindows コールバック検証（P41対策）
  it("SEC-10: getAllowedWindows コールバックが [mainWindow] を返す", async () => {
    const handler = handlers.get(IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS);
    await handler(createMockEvent());
    const options = mockValidateIpcSender.mock.calls[0][2];
    expect(options.getAllowedWindows()).toEqual([mockMainWindow]);
  });
});
```

## 統合テスト連携

- Phase 4 完了時点では sender 検証テスト（SEC-05~SEC-10）は FAIL が期待される（TDD Red）
- 既存テストは mock 追加により PASS を維持

## 多角的チェック観点

- **テスト設計**: 正常系・異常系・コールバック検証の網羅
- **P41対策**: getAllowedWindows のコールバック呼び出し検証

## 成果物

| 成果物         | パス                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| 修正済みテスト | `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts` |

## 完了条件

- [ ] mockMainWindow, createMockEvent, validateIpcSender モックが定義されている
- [ ] 既存テストの registerPermissionStoreHandlers 呼び出しに mockMainWindow が追加されている
- [ ] SEC-01~SEC-10 のテストケースが作成されている
- [ ] 既存テストが PASS すること（モック追加後）
- [ ] SEC-05~SEC-10 が FAIL すること（Phase 5 実装前のため）

## 次のPhase

Phase 5: 実装 — プロダクションコード実装（TDD Green）

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクが完了している
- [ ] 完了条件の全項目がチェック済み
- [ ] 成果物が全て生成されている

## サブタスク管理

本Phaseのサブタスク:

- なし（単一タスクとして実行）
