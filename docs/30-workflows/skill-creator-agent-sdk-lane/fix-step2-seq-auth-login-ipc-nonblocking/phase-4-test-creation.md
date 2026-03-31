# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 4                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

`auth:login` ハンドラーの fire-and-forget 修正を検証するユニットテストを定義・作成する（Red フェーズ）。

## テスト対象

- `apps/desktop/src/main/ipc/authHandlers.ts` の `auth:login` ハンドラー

## テストファイル

- `apps/desktop/src/main/ipc/__tests__/authHandlers.test.ts`（新規作成または既存ファイルへの追加）

## テスト仕様

### TC-01: auth:login が即座にレスポンスを返す

```typescript
it("auth:login ハンドラーが startOAuthFlow の完了を待たず即座に { success: true } を返す", async () => {
  // Arrange
  const slowOAuthFlow = new Promise<void>((resolve) =>
    setTimeout(resolve, 10_000),
  );
  mockAuthFlowOrchestrator.startOAuthFlow.mockReturnValue(slowOAuthFlow);

  // Act
  const startTime = Date.now();
  const result = await invokeAuthLogin({ provider: "github" });
  const elapsed = Date.now() - startTime;

  // Assert
  expect(result).toEqual({ success: true });
  expect(elapsed).toBeLessThan(1000); // 1秒以内に返ること（5000ms タイムアウトの余裕を持つ）
});
```

### TC-02: OAuth 成功後に AUTH_STATE_CHANGED イベントは発火しない（authFlowOrchestrator 内部が担当）

```typescript
it("auth:login ハンドラー自体は AUTH_STATE_CHANGED イベントを直接送信しない（成功パス）", async () => {
  // Arrange
  mockAuthFlowOrchestrator.startOAuthFlow.mockResolvedValue(undefined);

  // Act
  await invokeAuthLogin({ provider: "github" });

  // Assert: ハンドラーは直接 AUTH_STATE_CHANGED を送信しない
  // （成功通知は authFlowOrchestrator 内部が行う）
  expect(mockWebContents.send).not.toHaveBeenCalledWith(
    IPC_CHANNELS.AUTH_STATE_CHANGED,
    expect.objectContaining({ authenticated: true }),
  );
});
```

### TC-03: OAuth フロー失敗時に AUTH_STATE_CHANGED で失敗を通知する

```typescript
it("startOAuthFlow が reject した場合、AUTH_STATE_CHANGED に { authenticated: false, error } を送信する", async () => {
  // Arrange
  const oauthError = new Error("OAuth flow failed");
  mockAuthFlowOrchestrator.startOAuthFlow.mockRejectedValue(oauthError);

  // Act
  await invokeAuthLogin({ provider: "github" });
  // fire-and-forget のため、.catch() が解決されるまで待機
  await vi.runAllMicrotasksAsync();

  // Assert
  expect(mockWebContents.send).toHaveBeenCalledWith(
    IPC_CHANNELS.AUTH_STATE_CHANGED,
    {
      authenticated: false,
      error: sanitizeErrorMessage(oauthError),
    },
  );
});
```

### TC-04: auth:login は startOAuthFlow を呼び出す

```typescript
it("auth:login ハンドラーが startOAuthFlow を provider 引数付きで呼び出す", async () => {
  // Arrange
  mockAuthFlowOrchestrator.startOAuthFlow.mockResolvedValue(undefined);

  // Act
  await invokeAuthLogin({ provider: "github" });

  // Assert
  expect(mockAuthFlowOrchestrator.startOAuthFlow).toHaveBeenCalledWith(
    "github",
  );
});
```

### TC-05: auth:login は IPC_TIMEOUT_MS 以内にレスポンスを返す

```typescript
it("auth:login が 5000ms (IPC_TIMEOUT_MS) 以内にレスポンスを返す", async () => {
  // Arrange: OAuth フローが完了しない状態をシミュレート
  mockAuthFlowOrchestrator.startOAuthFlow.mockImplementation(
    () => new Promise(() => {}), // never resolves
  );

  // Act & Assert: 5000ms 以内に完了すること
  await expect(
    Promise.race([
      invokeAuthLogin({ provider: "github" }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 5000),
      ),
    ]),
  ).resolves.toEqual({ success: true });
});
```

## 統合テスト観点

| テストID | 確認観点                     | 期待結果                                                               |
| -------- | ---------------------------- | ---------------------------------------------------------------------- |
| TC-01    | 即時レスポンス               | `{ success: true }` が 1 秒以内に返る                                  |
| TC-02    | 成功時の直接イベント送信なし | `AUTH_STATE_CHANGED` を直接送信しない                                  |
| TC-03    | 失敗時のイベント通知         | `AUTH_STATE_CHANGED` に `{ authenticated: false, error }` が送信される |
| TC-04    | `startOAuthFlow` 呼び出し    | provider 引数付きで呼び出される                                        |
| TC-05    | IPC タイムアウト回避         | 5000ms 以内にレスポンス                                                |

## 実行手順

### ステップ 1: テストファイルの確認・作成

```bash
# 既存テストファイルの確認
ls apps/desktop/src/main/ipc/__tests__/

# テスト実行（Red: 修正前のコードでテストが失敗することを確認）
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/authHandlers.test.ts
```

### ステップ 2: テストの実行（Red フェーズ確認）

- TC-01: 修正前は失敗する（`await` があるため 5 秒以上かかる）
- TC-03: 修正前は失敗する（`.catch()` がないため `AUTH_STATE_CHANGED` が送信されない）

## 参照資料

| 資料名          | パス                                        | 説明                 |
| --------------- | ------------------------------------------- | -------------------- |
| 設計書          | `./phase-2-design.md`                       | fire-and-forget 設計 |
| authHandlers.ts | `apps/desktop/src/main/ipc/authHandlers.ts` | テスト対象           |

## 成果物

| 成果物         | パス                                                       | 説明             |
| -------------- | ---------------------------------------------------------- | ---------------- |
| テスト仕様     | `phase-4-test-creation.md`                                 | 本ファイル       |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/authHandlers.test.ts` | 実装テストコード |

## 完了条件

- [ ] TC-01 〜 TC-05 のテストケースが定義されている
- [ ] `auth:login` が即座にレスポンスを返すことを検証するテストがある
- [ ] OAuth 完了後に `AUTH_STATE_CHANGED` イベントが発火することを検証するテストがある
- [ ] OAuth エラー時に `AUTH_STATE_CHANGED` で `authenticated: false` が通知されることを検証するテストがある
- [ ] Red フェーズで修正前コードがテスト失敗することが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
