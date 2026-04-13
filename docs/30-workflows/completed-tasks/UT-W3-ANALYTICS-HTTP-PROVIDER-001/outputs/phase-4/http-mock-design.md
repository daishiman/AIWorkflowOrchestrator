# Phase 4 HTTP モック設計

## タスク: UT-W3-ANALYTICS-HTTP-PROVIDER-001

## 対象フェーズ: Phase 4 — HTTP モック設計

## 作成日: 2026-04-13

---

## 概要

`sendToAnalyticsProvider` は `fetch` を使って外部 HTTP エンドポイントにイベントを送信する。
テスト環境では実際の HTTP 通信を行わないため、`vi.stubGlobal("fetch", ...)` を用いてグローバル `fetch` をモックする設計とした。

---

## モック設計方針

| 項目                       | 内容                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------- |
| モック対象                 | グローバル `fetch` 関数                                                            |
| モック手法                 | `vi.stubGlobal("fetch", vi.fn())`                                                  |
| リストア方法               | `afterEach(() => vi.unstubAllGlobals())`                                           |
| 成功レスポンス             | `vi.fn().mockResolvedValue(new Response(null, { status: 200 }))`                   |
| ネットワークエラー         | `vi.fn().mockRejectedValue(new Error("Network Error"))`                            |
| タイムアウト（AbortError） | `vi.fn().mockImplementation((_url, init) => { const signal = init?.signal; ... })` |

---

## モックセットアップコード例

```typescript
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("sendToAnalyticsProvider", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", mockFetch);
    process.env.NODE_ENV = "production";
    process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/collect";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.ANALYTICS_ENDPOINT_URL;
  });

  it("TC-01: fetch が呼ばれること", async () => {
    await sendToAnalyticsProvider({
      eventName: "page_view",
      payload: { page: "/" },
      timestamp: 1712345678000,
    });
    expect(mockFetch).toHaveBeenCalledOnce();
  });
});
```

---

## モックが必要な理由

1. **テスト環境の分離**: 実際の外部サービスへの通信を防ぎ、テストを冪等にする
2. **エラーケースの再現**: ネットワークエラーや AbortError を確実に再現できる
3. **呼び出し引数の検証**: `toHaveBeenCalledWith` で URL・メソッド・ヘッダー・ボディを検証できる
4. **実行速度**: 実際の HTTP 通信より高速に完了する

---

## 環境変数のモック設計

| 変数名                   | テスト前の設定                         | テスト後のリストア      |
| ------------------------ | -------------------------------------- | ----------------------- |
| `NODE_ENV`               | `"production"` に上書き                | Vitest が自動リストア   |
| `ANALYTICS_ENDPOINT_URL` | `"https://example.com/collect"` に設定 | `afterEach` で `delete` |

---

## AbortController のモック設計

タイムアウト（5000ms）のテストは、`vi.useFakeTimers()` と `AbortController.signal` を組み合わせて、実時間を待たずに `controller.abort()` の発火を再現する設計とした。
`fetch` モックは `signal.addEventListener("abort", ...)` で `AbortError` を返し、5000ms 到達時に abort 経路とエラー握り潰しを同時に検証できる。
