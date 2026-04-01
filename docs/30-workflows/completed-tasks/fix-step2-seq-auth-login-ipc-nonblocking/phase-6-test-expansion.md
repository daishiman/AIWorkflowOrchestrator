# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 6                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

Phase 4 の基本テストに加え、並列呼び出しと reject 時の fire-and-forget 挙動をカバーする。

## 実行タスク

- provider matrix を実在値に限定して確認する
- 並列呼び出し時に互いに干渉しないことを確認する
- reject ケースでも handler が待機しないことを確認する
- orchestrator 側の event 送信は別 suite で担保する

## 追加テストケース

### TC-06: 複数の provider に対して startOAuthFlow が呼び出される

```typescript
it.each(["google", "github", "discord"] as const)(
  "provider %s に対して startOAuthFlow が呼び出される",
  async (provider) => {
    mockAuthFlowOrchestrator.startOAuthFlow.mockResolvedValue(undefined);

    await invokeAuthLogin({ provider });

    expect(mockAuthFlowOrchestrator.startOAuthFlow).toHaveBeenCalledWith(
      provider,
    );
  },
);
```

### TC-07: 同時に複数の auth:login が呼び出された場合

```typescript
it("複数の auth:login が同時に呼び出された場合、handler 応答は独立する", async () => {
  const firstFlow = new Promise<void>(() => {});
  const secondFlow = new Promise<void>(() => {});

  mockAuthFlowOrchestrator.startOAuthFlow
    .mockReturnValueOnce(firstFlow)
    .mockReturnValueOnce(secondFlow);

  const [result1, result2] = await Promise.all([
    invokeAuthLogin({ provider: "github" }),
    invokeAuthLogin({ provider: "google" }),
  ]);

  expect(result1).toEqual({ success: true });
  expect(result2).toEqual({ success: true });
});
```

### TC-08: reject しても handler は完了する

```typescript
it("OAuth エラー時に handler は待機し続けず、ログのみ残す", async () => {
  const consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});
  mockAuthFlowOrchestrator.startOAuthFlow.mockRejectedValue(
    new Error("OAuth configuration error"),
  );

  const result = await invokeAuthLogin({ provider: "github" });
  await vi.runAllMicrotasksAsync();

  expect(result).toEqual({ success: true });
  expect(consoleErrorSpy).toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});
```

### TC-09: invalid provider は fire-and-forget 以前に拒否される

```typescript
it("invalid provider は startOAuthFlow を呼ばずに拒否される", async () => {
  const result = await invokeAuthLogin({ provider: "anthropic" as never });

  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("auth/invalid-provider");
  expect(mockAuthFlowOrchestrator.startOAuthFlow).not.toHaveBeenCalled();
});
```

## エッジケース一覧

| エッジケース  | テストID | 期待結果                                                                 |
| ------------- | -------- | ------------------------------------------------------------------------ |
| 実在 provider | TC-06    | `google/github/discord` がすべて呼ばれる                                 |
| 並列呼び出し  | TC-07    | handler 応答は独立し、orchestrator の cancellation は別 suite で確認する |
| reject 相当   | TC-08    | handler は待機せず、ログのみ残す                                         |
| 無効 provider | TC-09    | `auth/invalid-provider` で即時拒否                                       |

## 実行手順

```bash
pnpm --filter @repo/desktop exec vitest run src/main/ipc/authHandlers.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/auth/__tests__/authFlowOrchestrator.test.ts
```

## 統合テスト連携

| テスト対象                                                          | 役割                                         |
| ------------------------------------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.test.ts`                    | handler の即時応答と provider matrix を確認  |
| `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts` | orchestrator の success / failure 通知を確認 |

## 参照資料

| 資料名     | パス                          | 説明                         |
| ---------- | ----------------------------- | ---------------------------- |
| テスト作成 | `./phase-4-test-creation.md`  | 基本テストケース             |
| 実装       | `./phase-5-implementation.md` | logging-only fire-and-forget |

## 成果物

| 成果物         | パス                        | 説明       |
| -------------- | --------------------------- | ---------- |
| テスト拡充仕様 | `phase-6-test-expansion.md` | 本ファイル |

## 完了条件

- [ ] 実在 provider のマトリクスが定義されている
- [ ] 並列呼び出しの独立性が検証されている
- [ ] reject 相当でも handler が待機しないことが検証されている
- [ ] invalid provider の負例が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
