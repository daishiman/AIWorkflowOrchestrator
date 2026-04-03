# Phase 4: テスト作成（TDD: Red） -- External API Support（外部APIサポート）

## メタ情報

| 項目      | 値                            |
| --------- | ----------------------------- |
| Phase番号 | 4                             |
| 機能名    | external-api-support          |
| タスクID  | TASK-SDK-SC-03                |
| 作成日    | 2026-04-02                    |
| 依存Phase | Phase 3（設計レビュー通過後） |

## 目的

TDDのRed段階として、実装前にテストを作成する。
全テストが最初は失敗（Red）し、Phase 5の実装完了後にPassする（Green）ことを確認する。

## テストファイル

```
apps/desktop/src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts
```

## Task 4-1: テストスイート構成

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HttpExternalApiAdapter } from "../HttpExternalApiAdapter";
import {
  ExternalApiTimeoutError,
  ExternalApiHttpError,
} from "@repo/shared/src/types/skillCreatorExternalApi";

describe("HttpExternalApiAdapter", () => {
  let adapter: HttpExternalApiAdapter;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new HttpExternalApiAdapter();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // T-01 〜 T-06 を以下に配置
});
```

## Task 4-2: テストケース詳細

### T-01: HTTP GETリクエストが正常実行

```typescript
it("T-01: GET 200レスポンスをT型で返す", async () => {
  const mockData = { id: 1, name: "テストデータ" };
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => mockData,
  });

  const result = await adapter.get<typeof mockData>(
    "https://api.example.com/data",
  );

  expect(result).toEqual(mockData);
  expect(fetchMock).toHaveBeenCalledWith(
    "https://api.example.com/data",
    expect.objectContaining({ method: "GET" }),
  );
});
```

### T-02: HTTP POSTリクエストがJSONボディ付きで実行

```typescript
it("T-02: POST JSONボディを送信し200レスポンスを返す", async () => {
  const requestBody = { query: "外部API接続テスト" };
  const mockResponse = { result: "success" };
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => mockResponse,
  });

  const result = await adapter.post<typeof mockResponse>(
    "https://api.example.com/query",
    requestBody,
  );

  expect(result).toEqual(mockResponse);
  expect(fetchMock).toHaveBeenCalledWith(
    "https://api.example.com/query",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify(requestBody),
    }),
  );
});
```

### T-03: api-key認証でX-API-Keyヘッダーが正しく設定される

```typescript
it("T-03: api-key認証でリクエストにX-API-Keyヘッダーが付与される", async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({}),
  });

  adapter.setAuth("api-key", "my-secret-api-key");
  await adapter.get("https://api.example.com/resource");

  const calledHeaders = fetchMock.mock.calls[0][1].headers;
  expect(calledHeaders["X-API-Key"]).toBe("my-secret-api-key");
});
```

### T-04: bearer認証でAuthorizationヘッダーが正しく設定される

```typescript
it("T-04: bearer認証でAuthorization: Bearer ヘッダーが付与される", async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({}),
  });

  adapter.setAuth("bearer", "my-bearer-token");
  await adapter.get("https://api.example.com/resource");

  const calledHeaders = fetchMock.mock.calls[0][1].headers;
  expect(calledHeaders["Authorization"]).toBe("Bearer my-bearer-token");
});
```

### T-05: basic認証でAuthorizationヘッダーが正しく設定される

```typescript
it("T-05: basic認証でAuthorization: Basic ヘッダーがbase64エンコードされて付与される", async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({}),
  });

  // "user:password" をbase64エンコードすると "dXNlcjpwYXNzd29yZA=="
  adapter.setAuth("basic", "user:password");
  await adapter.get("https://api.example.com/resource");

  const calledHeaders = fetchMock.mock.calls[0][1].headers;
  expect(calledHeaders["Authorization"]).toBe("Basic dXNlcjpwYXNzd29yZA==");
});
```

### T-06: 30秒タイムアウトが機能する

```typescript
it("T-06: 30秒タイムアウトでExternalApiTimeoutErrorがスローされる", async () => {
  const abortError = new DOMException(
    "The operation was aborted",
    "AbortError",
  );
  fetchMock.mockRejectedValueOnce(abortError);

  await expect(adapter.get("https://api.example.com/slow")).rejects.toThrow(
    ExternalApiTimeoutError,
  );
});
```

### T-07: 4xx/5xxエラーが適切なエラーオブジェクトに変換される

```typescript
it("T-07: 404レスポンスでExternalApiHttpErrorがスローされる（statusCode=404）", async () => {
  fetchMock.mockResolvedValueOnce({
    ok: false,
    status: 404,
    json: async () => ({ message: "Not Found" }),
  });

  const promise = adapter.get("https://api.example.com/missing");

  await expect(promise).rejects.toThrow(ExternalApiHttpError);
  await expect(
    adapter.get("https://api.example.com/missing"),
  ).rejects.toMatchObject({ statusCode: 404 });
});
```

### T-08: APIキーがログに出力されない

```typescript
it("T-08: APIキーがconsole.logに出力されない（セキュリティ検証）", async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({}),
  });

  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

  adapter.setAuth("api-key", "super-secret-key-12345");
  await adapter.get("https://api.example.com/resource");

  const allLogCalls = [
    ...logSpy.mock.calls.flat(),
    ...infoSpy.mock.calls.flat(),
  ].join(" ");
  expect(allLogCalls).not.toContain("super-secret-key-12345");
});
```

## Task 4-3: テスト実行コマンド（Red確認）

```bash
pnpm --filter @repo/desktop vitest run \
  src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts
```

期待する結果（Phase 4時点）: **全テスト FAIL**（実装が存在しないため）

## Task 4-4: テストファイル配置確認

```bash
ls apps/desktop/src/main/services/runtime/adapters/__tests__/
# HttpExternalApiAdapter.test.ts が存在することを確認
```

## 参照資料

| 資料名       | パス                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 2 設計 | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/phase-2-design.md` |

## 完了条件

- [ ] テストファイル `HttpExternalApiAdapter.test.ts` を作成した
- [ ] T-01: HTTP GET正常系テストを作成した
- [ ] T-02: HTTP POST JSONボディテストを作成した
- [ ] T-03: api-key認証ヘッダーテストを作成した
- [ ] T-04: bearer認証ヘッダーテストを作成した
- [ ] T-05: basic認証base64エンコードテストを作成した
- [ ] T-06: 30秒タイムアウトテストを作成した
- [ ] T-07: HTTP 404エラー変換テストを作成した
- [ ] T-08: APIキーログ非出力セキュリティテストを作成した
- [ ] Phase 4時点で全テストがFAIL（Red）することを確認した

## 次の Phase: Phase 5（phase-5-implementation.md）
