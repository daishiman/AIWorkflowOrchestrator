# 受け入れ基準

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 1                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 作成日     | 2026-04-13                                           |
| ステータス | 完了                                                 |

---

## 受け入れ基準一覧

| ID    | 基準                                                                                | 検証方法          | 優先度 |
| ----- | ----------------------------------------------------------------------------------- | ----------------- | ------ |
| AC-01 | `NODE_ENV=production` かつ `ANALYTICS_ENDPOINT_URL` 設定時に HTTP POST が呼ばれる   | Unit Test         | Must   |
| AC-02 | `NODE_ENV` が production 以外の場合は HTTP POST を呼ばない                          | Unit Test         | Must   |
| AC-03 | `ANALYTICS_ENDPOINT_URL` 未設定時は HTTP POST を呼ばずに `{ success: true }` を返す | Unit Test         | Must   |
| AC-04 | fetch タイムアウト（5000ms）後も `success: true` を返し、例外を外へ出さない         | Unit Test         | Must   |
| AC-05 | fetch 例外発生時も `success: true` を返し、例外を外へ出さない                       | Unit Test         | Must   |
| AC-06 | オプトアウト時は HTTP POST を呼ばずに `{ success: true, skipped: true }` を返す     | Unit Test（既存） | Must   |
| AC-07 | `pnpm typecheck && pnpm lint && pnpm test` が PASS                                  | CI                | Must   |

---

## 各基準の詳細

### AC-01: production 環境での HTTP POST 実行

**条件**:

- `process.env.NODE_ENV === "production"`
- `process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics"`
- 有効な analytics イベント（eventName, payload, timestamp）を送信

**期待結果**:

- `fetch` が 1 回呼ばれた
- 呼び出し時の引数に URL `"https://example.com/analytics"` が含まれた
- リクエストメソッドが `POST` だった
- レスポンスが `{ success: true }` だった

**テストコード概要**:

```typescript
it("production環境でHTTP POSTが呼ばれる", async () => {
  process.env.NODE_ENV = "production";
  process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
  const mockFetch = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", mockFetch);

  // analytics:send ハンドラーを呼び出す
  // mockFetch が1回呼ばれたことを確認
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(mockFetch).toHaveBeenCalledWith(
    "https://example.com/analytics",
    expect.objectContaining({ method: "POST" }),
  );
});
```

---

### AC-02: production 以外での HTTP POST 非実行

**条件**:

- `process.env.NODE_ENV = "development"` または `"test"`
- `process.env.ANALYTICS_ENDPOINT_URL` が設定済み

**期待結果**:

- `fetch` が呼ばれなかった
- レスポンスが `{ success: true }` だった

**テストコード概要**:

```typescript
it("development環境ではHTTP POSTを呼ばない", async () => {
  process.env.NODE_ENV = "development";
  process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
  const mockFetch = vi.fn();
  vi.stubGlobal("fetch", mockFetch);

  // analytics:send ハンドラーを呼び出す
  expect(mockFetch).not.toHaveBeenCalled();
});
```

---

### AC-03: ANALYTICS_ENDPOINT_URL 未設定時のスキップ

**条件**:

- `process.env.NODE_ENV = "production"`
- `process.env.ANALYTICS_ENDPOINT_URL` が未設定（undefined）または空文字列

**期待結果**:

- `fetch` が呼ばれなかった
- レスポンスが `{ success: true }` だった
- エラーがスローされなかった

**テストコード概要**:

```typescript
it("ANALYTICS_ENDPOINT_URL未設定時はfetchを呼ばない", async () => {
  process.env.NODE_ENV = "production";
  delete process.env.ANALYTICS_ENDPOINT_URL;
  const mockFetch = vi.fn();
  vi.stubGlobal("fetch", mockFetch);

  const result = await invokeAnalyticsSend({
    eventName: "test",
    payload: {},
    timestamp: Date.now(),
  });
  expect(mockFetch).not.toHaveBeenCalled();
  expect(result).toEqual({ success: true });
});
```

---

### AC-04: fetch タイムアウト後の正常応答

**条件**:

- `process.env.NODE_ENV = "production"`
- `process.env.ANALYTICS_ENDPOINT_URL` が設定済み
- `fetch` が AbortError をスロー（5000ms タイムアウト後）

**期待結果**:

- レスポンスが `{ success: true }` だった
- 例外が呼び出し元へ伝播しなかった

**テストコード概要**:

```typescript
it("fetchタイムアウト後もsuccess: trueを返す", async () => {
  process.env.NODE_ENV = "production";
  process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
  const mockFetch = vi.fn().mockRejectedValue(
    Object.assign(new Error("The operation was aborted"), {
      name: "AbortError",
    }),
  );
  vi.stubGlobal("fetch", mockFetch);

  const result = await invokeAnalyticsSend({
    eventName: "test",
    payload: {},
    timestamp: Date.now(),
  });
  expect(result).toEqual({ success: true });
});
```

---

### AC-05: fetch 例外発生時の正常応答

**条件**:

- `process.env.NODE_ENV = "production"`
- `process.env.ANALYTICS_ENDPOINT_URL` が設定済み
- `fetch` が任意の例外をスロー（ネットワーク断など）

**期待結果**:

- レスポンスが `{ success: true }` だった
- 例外が呼び出し元へ伝播しなかった

**テストコード概要**:

```typescript
it("fetchが例外をスローしてもsuccess: trueを返す", async () => {
  process.env.NODE_ENV = "production";
  process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
  const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
  vi.stubGlobal("fetch", mockFetch);

  const result = await invokeAnalyticsSend({
    eventName: "test",
    payload: {},
    timestamp: Date.now(),
  });
  expect(result).toEqual({ success: true });
});
```

---

### AC-06: オプトアウト時の HTTP POST 非実行

**条件**:

- `optedOut: true` を含む analytics イベント（Renderer 側オプトアウト）
- または `analyticsStore` の `analyticsOptOut = true`（Main 側オプトアウト）

**期待結果**:

- `fetch` が呼ばれなかった
- レスポンスが `{ success: true, skipped: true }` だった

**備考**: この基準は既存の Unit Test が既にカバーしていた。新規実装で構造を破っていないことを確認した。

---

### AC-07: CI パイプライン通過

**条件**: 実装後の状態

**期待結果**:

- `pnpm typecheck` が PASS（TypeScript 型エラーなし）
- `pnpm lint` が PASS（ESLint エラーなし）
- `pnpm test` が PASS（Vitest 全テスト通過）

---

## 検証優先順位

```
AC-01（必須動作）
AC-02（非実行ガード）
AC-03（URL未設定ガード）
AC-04（タイムアウト安全性）
AC-05（例外安全性）
AC-06（既存機能非破壊）
AC-07（CI通過）
```

---

## モック禁止事項

| 禁止事項                                      | 理由                                                          |
| --------------------------------------------- | ------------------------------------------------------------- |
| `vi.stubGlobal("window", ...)` の使用         | VSCPKR-02 フィードバック準拠。Electron環境で問題が発生した    |
| 実際の HTTP エンドポイントへの送信            | テスト時は必ず `vi.stubGlobal("fetch", mockFetch)` を使用した |
| `afterEach` での `vi.unstubAllGlobals()` 省略 | グローバルモックが他のテストに漏れないよう必ず解除した        |
