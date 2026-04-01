# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 4                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

`auth:login` ハンドラーの fire-and-forget 修正を検証するユニットテストを定義する（Red フェーズ）。

## 実行タスク

- 即時レスポンスと 500ms 制約を検証する
- provider validation を維持していることを確認する
- `startOAuthFlow()` の起動責務だけを handler が持つことを確認する
- `AUTH_STATE_CHANGED` の通知責務は orchestrator 側に残す

## テスト対象

- `apps/desktop/src/main/ipc/authHandlers.ts` の `auth:login` ハンドラー

## テストファイル

- `apps/desktop/src/main/ipc/authHandlers.test.ts`（更新）

## テスト仕様

### TC-01: auth:login が即座にレスポンスを返す

```typescript
it("auth:login ハンドラーが startOAuthFlow の完了を待たず即座に { success: true } を返す", async () => {
  const slowOAuthFlow = new Promise<void>(() => {});
  mockAuthFlowOrchestrator.startOAuthFlow.mockReturnValue(slowOAuthFlow);

  const startTime = Date.now();
  const result = await invokeAuthLogin({ provider: "github" });
  const elapsed = Date.now() - startTime;

  expect(result).toEqual({ success: true });
  expect(elapsed).toBeLessThan(500);
});
```

### TC-02: 無効な provider は即時エラーで返す

```typescript
it("auth:login ハンドラーが無効な provider を拒否する", async () => {
  const result = await invokeAuthLogin({ provider: "invalid-provider" });

  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("auth/invalid-provider");
  expect(mockAuthFlowOrchestrator.startOAuthFlow).not.toHaveBeenCalled();
});
```

### TC-03: auth:login は startOAuthFlow を provider 引数付きで呼び出す

```typescript
it("auth:login ハンドラーが startOAuthFlow を provider 引数付きで呼び出す", async () => {
  mockAuthFlowOrchestrator.startOAuthFlow.mockResolvedValue(undefined);

  await invokeAuthLogin({ provider: "github" });

  expect(mockAuthFlowOrchestrator.startOAuthFlow).toHaveBeenCalledWith(
    "github",
  );
});
```

### TC-04: auth:login は AUTH_STATE_CHANGED を直接送信しない

```typescript
it("auth:login ハンドラーは AUTH_STATE_CHANGED を直接送信しない", async () => {
  mockAuthFlowOrchestrator.startOAuthFlow.mockResolvedValue(undefined);

  await invokeAuthLogin({ provider: "github" });

  expect(mockWebContentsSend).not.toHaveBeenCalledWith(
    IPC_CHANNELS.AUTH_STATE_CHANGED,
    expect.anything(),
  );
});
```

### TC-05: startOAuthFlow の失敗は orchestrator に委ねられる

```typescript
it("startOAuthFlow が reject しても handler は待機し続けない", async () => {
  mockAuthFlowOrchestrator.startOAuthFlow.mockRejectedValue(
    new Error("OAuth configuration error"),
  );

  const result = await invokeAuthLogin({ provider: "github" });
  await vi.runAllMicrotasksAsync();

  expect(result).toEqual({ success: true });
  expect(mockWebContentsSend).not.toHaveBeenCalledWith(
    IPC_CHANNELS.AUTH_STATE_CHANGED,
    expect.objectContaining({
      authenticated: false,
      error: expect.any(String),
    }),
  );
});
```

## 統合テスト連携

| テストID | 確認観点                  | 期待結果                                |
| -------- | ------------------------- | --------------------------------------- |
| TC-01    | 即時レスポンス            | `{ success: true }` が 500ms 以内に返る |
| TC-02    | provider validation       | 無効値は `auth/invalid-provider`        |
| TC-03    | `startOAuthFlow` 呼び出し | provider 引数付きで呼ばれる             |
| TC-04    | handler の責務境界        | `AUTH_STATE_CHANGED` を直接送らない     |
| TC-05    | fire-and-forget           | reject しても handler は待機しない      |

## 実行手順

### ステップ 1: テストファイルの確認・作成

```bash
pnpm --filter @repo/desktop exec vitest run src/main/ipc/authHandlers.test.ts
```

### ステップ 2: Red フェーズ確認

- TC-01: 修正前は失敗する（`await` により 500ms を超える）
- TC-04: 修正前は handler が失敗イベントを重複送信する可能性がある

## 参照資料

| 資料名                  | パス                                                 | 説明                 |
| ----------------------- | ---------------------------------------------------- | -------------------- |
| 設計書                  | `./phase-2-design.md`                                | fire-and-forget 設計 |
| authHandlers.ts         | `apps/desktop/src/main/ipc/authHandlers.ts`          | 修正対象             |
| authFlowOrchestrator.ts | `apps/desktop/src/main/auth/authFlowOrchestrator.ts` | event source         |

## 成果物

| 成果物         | パス                                             | 説明             |
| -------------- | ------------------------------------------------ | ---------------- |
| テスト仕様     | `phase-4-test-creation.md`                       | 本ファイル       |
| テストファイル | `apps/desktop/src/main/ipc/authHandlers.test.ts` | 実装テストコード |

## 完了条件

- [ ] TC-01 〜 TC-05 のテストケースが定義されている
- [ ] `auth:login` が 500ms 以内にレスポンスを返すことを検証するテストがある
- [ ] provider validation が維持されていることを検証するテストがある
- [ ] `AUTH_STATE_CHANGED` を handler が直接送信しないことを検証するテストがある
- [ ] Red フェーズで修正前コードがテスト失敗することが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
