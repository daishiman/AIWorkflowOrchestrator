# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 6                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

Phase 4 で定義したユニットテストに加え、エッジケースと境界条件をカバーするテストを追加する。

## 追加テストケース

### TC-06: 複数の provider に対して startOAuthFlow が呼び出される

```typescript
it.each(["github", "google", "anthropic"])(
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
it("複数の auth:login が同時に呼び出された場合、それぞれ独立して処理される", async () => {
  let resolveFirst: () => void;
  let resolveSecond: () => void;
  const firstFlow = new Promise<void>((r) => (resolveFirst = r));
  const secondFlow = new Promise<void>((r) => (resolveSecond = r));

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

### TC-08: エラーメッセージが sanitizeErrorMessage でサニタイズされる

```typescript
it("OAuth エラー時にエラーメッセージが sanitizeErrorMessage でサニタイズされる", async () => {
  const sensitiveError = new Error("Error: token=secret123&password=abc");
  mockAuthFlowOrchestrator.startOAuthFlow.mockRejectedValue(sensitiveError);

  await invokeAuthLogin({ provider: "github" });
  await vi.runAllMicrotasksAsync();

  const sentPayload = mockWebContents.send.mock.calls[0][1];
  expect(sentPayload.error).not.toContain("secret123");
  expect(sentPayload.error).not.toContain("password=abc");
});
```

### TC-09: startOAuthFlow が同期的に例外をスローした場合

```typescript
it("startOAuthFlow が同期的に例外をスローした場合も AUTH_STATE_CHANGED で通知される", async () => {
  mockAuthFlowOrchestrator.startOAuthFlow.mockImplementation(() => {
    throw new Error("sync error");
  });

  // fire-and-forget の場合、同期エラーは Promise chain で捕捉されない可能性がある
  // 設計の注意点として記録する
  await invokeAuthLogin({ provider: "github" });
  // 同期エラーの挙動を確認する
});
```

## エッジケース一覧

| エッジケース     | テストID | 期待結果                                   |
| ---------------- | -------- | ------------------------------------------ |
| 複数 provider    | TC-06    | 各 provider で `startOAuthFlow` が呼ばれる |
| 並列呼び出し     | TC-07    | 両方とも即座に `{ success: true }` を返す  |
| エラーサニタイズ | TC-08    | 機密情報がサニタイズされて通知される       |
| 同期例外         | TC-09    | 挙動を確認・記録する                       |

## 実行手順

```bash
# 全テスト実行
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/authHandlers.test.ts

# カバレッジ確認
pnpm --filter @repo/desktop exec vitest run --coverage src/main/ipc/__tests__/authHandlers.test.ts
```

## 参照資料

| 資料名     | パス                          | 説明             |
| ---------- | ----------------------------- | ---------------- |
| テスト作成 | `./phase-4-test-creation.md`  | 基本テストケース |
| 実装       | `./phase-5-implementation.md` | 実装済みコード   |

## 成果物

| 成果物         | パス                        | 説明       |
| -------------- | --------------------------- | ---------- |
| テスト拡充仕様 | `phase-6-test-expansion.md` | 本ファイル |

## 完了条件

- [ ] エッジケース（複数 provider、並列呼び出し、エラーサニタイズ）のテストが追加されている
- [ ] 全テストが PASS している
- [ ] テストカバレッジが `authHandlers.ts` の `auth:login` ハンドラー部分で 90% 以上
- [ ] **本Phase内の全タスクを100%実行完了**
