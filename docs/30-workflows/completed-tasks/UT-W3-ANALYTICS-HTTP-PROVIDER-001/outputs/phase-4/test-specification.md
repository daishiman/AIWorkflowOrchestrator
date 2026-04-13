# Phase 4 テスト仕様書

## タスク: UT-W3-ANALYTICS-HTTP-PROVIDER-001

## 対象フェーズ: Phase 4 — テスト設計 (Red)

## 作成日: 2026-04-13

---

## 概要

`sendToAnalyticsProvider` 関数の HTTP 送信ロジックに対するユニットテスト仕様。
テストフレームワークは Vitest を使用し、`vi.stubGlobal("fetch", ...)` でグローバル `fetch` をモックする。

---

## テストケース一覧（TC-01〜TC-08）

### TC-01: 本番環境かつ ANALYTICS_ENDPOINT_URL が設定されている場合、fetch を呼び出す

| 項目      | 内容                                                                           |
| --------- | ------------------------------------------------------------------------------ |
| テスト ID | TC-01                                                                          |
| 対象関数  | `sendToAnalyticsProvider`                                                      |
| 前提条件  | `NODE_ENV=production`, `ANALYTICS_ENDPOINT_URL=https://example.com/collect`    |
| 入力      | `{ eventName: "page_view", payload: { page: "/" }, timestamp: 1712345678000 }` |
| 期待結果  | `fetch` が 1 回呼ばれ、引数が正しいこと（URL・method・headers・body）          |
| 検証方法  | `expect(mockFetch).toHaveBeenCalledOnce()` / `toHaveBeenCalledWith(...)`       |

---

### TC-02: NODE_ENV が production 以外の場合、fetch を呼び出さない

| 項目      | 内容                                                                         |
| --------- | ---------------------------------------------------------------------------- |
| テスト ID | TC-02                                                                        |
| 対象関数  | `sendToAnalyticsProvider`                                                    |
| 前提条件  | `NODE_ENV=development`, `ANALYTICS_ENDPOINT_URL=https://example.com/collect` |
| 入力      | `{ eventName: "page_view", payload: {}, timestamp: 1712345678000 }`          |
| 期待結果  | `fetch` が呼ばれないこと                                                     |
| 検証方法  | `expect(mockFetch).not.toHaveBeenCalled()`                                   |

---

### TC-03: ANALYTICS_ENDPOINT_URL が未設定の場合、fetch を呼び出さない

| 項目      | 内容                                                                         |
| --------- | ---------------------------------------------------------------------------- |
| テスト ID | TC-03                                                                        |
| 対象関数  | `sendToAnalyticsProvider`                                                    |
| 前提条件  | `NODE_ENV=production`, `ANALYTICS_ENDPOINT_URL` 未設定（undefined）          |
| 入力      | `{ eventName: "click", payload: { id: "btn-1" }, timestamp: 1712345678000 }` |
| 期待結果  | `fetch` が呼ばれないこと                                                     |
| 検証方法  | `expect(mockFetch).not.toHaveBeenCalled()`                                   |

---

### TC-04: fetch が成功した場合、Promise が resolve されること

| 項目      | 内容                                                                  |
| --------- | --------------------------------------------------------------------- |
| テスト ID | TC-04                                                                 |
| 対象関数  | `sendToAnalyticsProvider`                                             |
| 前提条件  | `NODE_ENV=production`, URL 設定済み、`fetch` が 200 を返す            |
| 入力      | `{ eventName: "test", payload: {}, timestamp: 0 }`                    |
| 期待結果  | `await sendToAnalyticsProvider(...)` が例外なく終了する               |
| 検証方法  | `await expect(sendToAnalyticsProvider(...)).resolves.toBeUndefined()` |

---

### TC-05: fetch がネットワークエラーを throw した場合、例外が外部に伝播しないこと

| 項目      | 内容                                                                               |
| --------- | ---------------------------------------------------------------------------------- |
| テスト ID | TC-05                                                                              |
| 対象関数  | `sendToAnalyticsProvider`                                                          |
| 前提条件  | `NODE_ENV=production`, URL 設定済み、`fetch` が `throw new Error("Network Error")` |
| 入力      | `{ eventName: "test", payload: {}, timestamp: 0 }`                                 |
| 期待結果  | `await sendToAnalyticsProvider(...)` が例外なく終了する（エラーを握り潰す）        |
| 検証方法  | `await expect(sendToAnalyticsProvider(...)).resolves.toBeUndefined()`              |

---

### TC-06: fetch がタイムアウトした場合（AbortError）、例外が外部に伝播しないこと

| 項目      | 内容                                                                  |
| --------- | --------------------------------------------------------------------- |
| テスト ID | TC-06                                                                 |
| 対象関数  | `sendToAnalyticsProvider`                                             |
| 前提条件  | `NODE_ENV=production`, URL 設定済み、`fetch` が `AbortError` を throw |
| 入力      | `{ eventName: "test", payload: {}, timestamp: 0 }`                    |
| 期待結果  | `await sendToAnalyticsProvider(...)` が例外なく終了する               |
| 検証方法  | `await expect(sendToAnalyticsProvider(...)).resolves.toBeUndefined()` |

---

### TC-07: リクエストボディに eventName・payload・timestamp が含まれること

| 項目      | 内容                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------- |
| テスト ID | TC-07                                                                                                                     |
| 対象関数  | `sendToAnalyticsProvider`                                                                                                 |
| 前提条件  | `NODE_ENV=production`, URL 設定済み                                                                                       |
| 入力      | `{ eventName: "purchase", payload: { amount: 1000 }, timestamp: 9999 }`                                                   |
| 期待結果  | `fetch` の body 引数に `JSON.stringify({ eventName: "purchase", payload: { amount: 1000 }, timestamp: 9999 })` が含まれる |
| 検証方法  | `toHaveBeenCalledWith(url, expect.objectContaining({ body: JSON.stringify(...) }))`                                       |

---

### TC-08: Content-Type ヘッダーが `application/json` に設定されること

| 項目      | 内容                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------- |
| テスト ID | TC-08                                                                                                     |
| 対象関数  | `sendToAnalyticsProvider`                                                                                 |
| 前提条件  | `NODE_ENV=production`, URL 設定済み                                                                       |
| 入力      | `{ eventName: "test", payload: {}, timestamp: 0 }`                                                        |
| 期待結果  | `fetch` の headers に `{ "Content-Type": "application/json" }` が含まれる                                 |
| 検証方法  | `toHaveBeenCalledWith(url, expect.objectContaining({ headers: { "Content-Type": "application/json" } }))` |

---

## テスト実行コマンド

```bash
pnpm --filter @repo/desktop test -- analyticsHandler
```
