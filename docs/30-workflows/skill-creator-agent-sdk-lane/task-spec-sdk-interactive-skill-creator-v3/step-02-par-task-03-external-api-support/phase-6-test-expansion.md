# Phase 6: テスト拡充 -- External API Support（外部APIサポート）

## メタ情報

| 項目      | 値                   |
| --------- | -------------------- |
| Phase番号 | 6                    |
| 機能名    | external-api-support |
| タスクID  | TASK-SDK-SC-03       |
| 作成日    | 2026-04-02           |
| 依存Phase | Phase 5（実装完了）  |

## 目的

Phase 4 の基本テスト（T-01〜T-08）に加え、ネットワークエラー・認証失敗・URLバリデーション・エッジケースをカバーするテスト（T-09〜T-13）を追加する。

## Task 6-1: T-09 — ネットワークエラー時の挙動確認

```typescript
it("T-09: ネットワークエラー（DNS解決失敗等）が元のエラーとしてスローされる", async () => {
  const networkError = new TypeError("Failed to fetch");
  fetchMock.mockRejectedValueOnce(networkError);

  await expect(
    adapter.get("https://nonexistent.example.com/data"),
  ).rejects.toThrow(TypeError);

  await expect(
    adapter.get("https://nonexistent.example.com/data"),
  ).rejects.toThrow("Failed to fetch");
});
```

**検証ポイント**: ネットワークエラーは `ExternalApiTimeoutError` に変換されず、元のエラーがそのままスローされること。

## Task 6-2: T-10 — HTTP 500エラーでExternalApiHttpError（statusCode=500）

```typescript
it("T-10: 500レスポンスでExternalApiHttpErrorがスローされる（statusCode=500）", async () => {
  fetchMock.mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: async () => ({ message: "Internal Server Error" }),
  });

  await expect(
    adapter.get("https://api.example.com/error"),
  ).rejects.toMatchObject({
    name: "ExternalApiHttpError",
    statusCode: 500,
  });
});
```

**検証ポイント**: 5xxエラーも `ExternalApiHttpError` に変換され、`statusCode` が正しく設定されること。

## Task 6-3: T-11 — setAuth未呼び出し時に認証ヘッダーが付与されない

```typescript
it("T-11: setAuth未呼び出し状態では認証ヘッダーが付与されない", async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({}),
  });

  // setAuth を呼ばない
  await adapter.get("https://api.example.com/open");

  const calledHeaders = fetchMock.mock.calls[0][1].headers;
  expect(calledHeaders["Authorization"]).toBeUndefined();
  expect(calledHeaders["X-API-Key"]).toBeUndefined();
});
```

**検証ポイント**: 認証なし（`authType = none`）の場合、余分なヘッダーが付与されないこと。

## Task 6-4: T-12 — HTTPSでないURLに警告ログが出力される

```typescript
it("T-12: HTTPSでないURLにアクセスするとconsole.warnが出力される", async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({}),
  });
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  await adapter.get("http://api.example.com/resource");

  expect(warnSpy).toHaveBeenCalledWith(
    expect.stringContaining("non-HTTPS URL detected"),
  );
});
```

**検証ポイント**: SEC-01（HTTPSでないURLに警告）が実装で守られているか。

## Task 6-5: T-13 — POSTリクエストにContent-Typeヘッダーが自動付与される

```typescript
it("T-13: POSTリクエストにContent-Type: application/jsonが自動付与される", async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({}),
  });

  await adapter.post("https://api.example.com/data", { key: "value" });

  const calledHeaders = fetchMock.mock.calls[0][1].headers;
  expect(calledHeaders["Content-Type"]).toBe("application/json");
});
```

**検証ポイント**: POSTリクエスト時に `Content-Type: application/json` が自動設定されること。

## Task 6-6: テストファイル更新後の実行

```bash
pnpm --filter @repo/desktop vitest run \
  src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts \
  --reporter=verbose
```

期待する結果: **T-01〜T-13 全件 PASS**

## 参照資料

| 資料名             | パス                                                                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 4 テスト作成 | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/phase-4-test-creation.md`  |
| Phase 5 実装       | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/phase-5-implementation.md` |

## 完了条件

- [ ] T-09: ネットワークエラーが元のエラーとしてスローされるテストを追加した
- [ ] T-10: HTTP 500エラーでExternalApiHttpError（statusCode=500）テストを追加した
- [ ] T-11: setAuth未呼び出し時に認証ヘッダーが付与されないテストを追加した
- [ ] T-12: HTTPSでないURL警告ログテストを追加した
- [ ] T-13: POSTリクエストへのContent-Type自動付与テストを追加した
- [ ] T-01〜T-13 全件PASSを確認した

## 次の Phase: Phase 7（phase-7-coverage.md）
