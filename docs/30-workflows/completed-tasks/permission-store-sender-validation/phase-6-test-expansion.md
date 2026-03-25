# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 6                                  |
| 機能名   | permission-store-sender-validation |
| タスクID | UT-06-002-UT-1                     |
| Issue    | #1527                              |
| 作成日   | 2026-03-24                         |

## 目的

Phase 5 で追加した sender 検証のカバレッジを強化し、エッジケースのテストを追加する。

## 参照資料

| 資料名             | パス                                     | 説明                   |
| ------------------ | ---------------------------------------- | ---------------------- |
| Phase 4 テスト     | `phase-4-test-creation.md`               | 基本テストケース       |
| Phase 5 実装       | `phase-5-implementation.md`              | 実装詳細               |
| P41: v8 カバレッジ | `.claude/rules/06-known-pitfalls.md#P41` | コールバックカバレッジ |

## 実行タスク

### Task 1: エッジケーステスト追加

- SEC-11: validateIpcSender が IPC_FORBIDDEN を返す場合（DevTools 経由等の不正アクセス）
- SEC-12: sender 検証と既存バリデーション（P42 3段バリデーション）の両方が機能することの確認
- SEC-13: 並行リクエストでの sender 検証の一貫性
- SEC-14: mainWindow 破棄後のリクエスト処理（`getAllowedWindows` が破棄済み BrowserWindow を返す場合の挙動確認）

```typescript
describe("sender 検証 - エッジケース", () => {
  it("SEC-11: validateIpcSender が IPC_FORBIDDEN を返すとエラー応答を返す", async () => {
    mockValidateIpcSender.mockReturnValue({
      valid: false,
      reason: "IPC_FORBIDDEN",
    });
    // 各ハンドラでエラー応答を確認
    const result = await invokeHandler(...);
    expect(result).toEqual(expect.objectContaining({ success: false }));
  });

  it("SEC-12: 不正 sender の場合は既存バリデーション前にエラー応答を返す", async () => {
    // sender 検証が先に実行され、permissionStore メソッドが呼ばれないことを確認
    mockValidateIpcSender.mockReturnValue({ valid: false, reason: "UNKNOWN_SENDER" });
    const result = await invokeHandler(...);
    expect(result).toEqual(expect.objectContaining({ success: false }));
    expect(mockPermissionStore.getAllowedTools).not.toHaveBeenCalled();
  });

  it("SEC-13: 並行リクエストで sender 検証が独立して機能する", async () => {
    // 並行実行しても各リクエストが独立して sender 検証を受けることを確認
  });
});
```

### Task 2: カバレッジ確認用テスト

getAllowedWindows コールバック内の mainWindow 参照が正しく解決されることを各ハンドラで個別検証（P41対策の強化）。

```typescript
describe("getAllowedWindows コールバック検証（P41対策）", () => {
  it("permission:getAllowedTools の getAllowedWindows が [mainWindow] を返す", async () => {
    await invokeHandler(IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS, createMockEvent());
    const calls = mockValidateIpcSender.mock.calls.filter(
      (call) => call[1] === IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS,
    );
    expect(calls[0][2].getAllowedWindows()).toEqual([mockMainWindow]);
  });

  it("permission:revokeTool の getAllowedWindows が [mainWindow] を返す", async () => { ... });
  it("permission:clearAll の getAllowedWindows が [mainWindow] を返す", async () => { ... });
  it("permission:clear-session の getAllowedWindows が [mainWindow] を返す", async () => { ... });
});
```

## 実行手順

### ステップ1: エッジケーステスト追加

`describe("sender 検証 - エッジケース")` ブロックを追加し SEC-11~SEC-13 を実装。

### ステップ2: P41対策テスト追加

`describe("getAllowedWindows コールバック検証（P41対策）")` ブロックを追加し、各ハンドラのコールバック検証テストを実装。

### ステップ3: カバレッジ実行

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/permission-store-handlers.test.ts
```

## 統合テスト連携

- 全テスト PASS
- Branch Coverage 60% 以上を達成
- Function Coverage 80% 以上を達成（P41対策テストにより getAllowedWindows コールバックがカバーされる）

## 多角的チェック観点

- **テスト品質**: エッジケースの網羅性
- **P41対策**: コールバック関数のカバレッジ確保
- **独立性**: テスト間の状態共有がないこと（beforeEach でリセット）

## 成果物

| 成果物         | パス                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| 拡充済みテスト | `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts` |

## 完了条件

- [ ] SEC-11~SEC-14 のエッジケーステストが追加されている
- [ ] getAllowedWindows コールバックの個別検証テストが追加されている
- [ ] 全テストが PASS する

## 次のPhase

Phase 7: カバレッジ確認

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクが完了している
- [ ] 完了条件の全項目がチェック済み
- [ ] 成果物が全て生成されている

## サブタスク管理

本Phaseのサブタスク:

- なし（単一タスクとして実行）
