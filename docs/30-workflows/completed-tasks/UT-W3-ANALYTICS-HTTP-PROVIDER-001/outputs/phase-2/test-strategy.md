# テスト戦略

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 2                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 作成日     | 2026-04-13                                           |
| ステータス | 完了                                                 |

---

## テスト方針

`sendToAnalyticsProvider` の実装はユニットテストのみで検証した。実際の HTTP 通信は行わず、`global.fetch` をモックした。テストフレームワークは Vitest を使用した。

---

## モック戦略

### fetch のモック方法

```typescript
// 正しいモック方法
const mockFetch = vi.fn().mockResolvedValue({ ok: true });
vi.stubGlobal("fetch", mockFetch);

// afterEach で解除
afterEach(() => {
  vi.unstubAllGlobals();
});
```

### 禁止事項

| 禁止事項                                      | 理由                                                          |
| --------------------------------------------- | ------------------------------------------------------------- |
| `vi.stubGlobal("window", ...)`                | Electron 環境で問題が発生した（VSCPKR-02 フィードバック準拠） |
| 実際の HTTP エンドポイントへの送信            | テストの再現性・速度・副作用排除のため                        |
| `afterEach` での `vi.unstubAllGlobals()` 省略 | グローバルモックが他テストに漏れるため                        |

### 環境変数のモック方法

```typescript
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

// テスト内で設定
process.env.NODE_ENV = "production";
process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
```

---

## テストパターン分類

### パターン A: HTTP POST 実行確認（AC-01 対応）

**目的**: production 環境かつ URL 設定済みの場合に fetch が呼ばれることを確認する

```typescript
describe("production環境でHTTP POSTが実行される", () => {
  it("fetchが1回呼ばれる", async () => {
    process.env.NODE_ENV = "production";
    process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    await invokeAnalyticsSend({
      eventName: "test_event",
      payload: { key: "value" },
      timestamp: 1234567890,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://example.com/analytics",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "test_event",
          payload: { key: "value" },
          timestamp: 1234567890,
        }),
      }),
    );
  });
});
```

### パターン B: 非実行ガード確認（AC-02 対応）

**目的**: production 以外の環境で fetch が呼ばれないことを確認する

```typescript
describe("production以外の環境ではHTTP POSTが実行されない", () => {
  it.each(["development", "test", undefined])(
    "NODE_ENV=%s のとき fetchを呼ばない",
    async (nodeEnv) => {
      process.env.NODE_ENV = nodeEnv;
      process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
      const mockFetch = vi.fn();
      vi.stubGlobal("fetch", mockFetch);

      await invokeAnalyticsSend({
        eventName: "test",
        payload: {},
        timestamp: 0,
      });

      expect(mockFetch).not.toHaveBeenCalled();
    },
  );
});
```

### パターン C: URL 未設定スキップ確認（AC-03 対応）

**目的**: `ANALYTICS_ENDPOINT_URL` 未設定時にスキップされることを確認する

```typescript
describe("ANALYTICS_ENDPOINT_URL未設定時はスキップされる", () => {
  it.each([undefined, ""])(
    "URL=%s のとき fetchを呼ばずにsuccess: trueを返す",
    async (url) => {
      process.env.NODE_ENV = "production";
      process.env.ANALYTICS_ENDPOINT_URL = url;
      const mockFetch = vi.fn();
      vi.stubGlobal("fetch", mockFetch);

      const result = await invokeAnalyticsSend({
        eventName: "test",
        payload: {},
        timestamp: 0,
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    },
  );
});
```

### パターン D: タイムアウト安全性確認（AC-04 対応）

**目的**: AbortError 発生後も `success: true` を返すことを確認する

```typescript
describe("fetchタイムアウト後も正常応答を返す", () => {
  it("AbortError後もsuccess: trueを返す", async () => {
    process.env.NODE_ENV = "production";
    process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
    const abortError = Object.assign(new Error("The operation was aborted"), {
      name: "AbortError",
    });
    const mockFetch = vi.fn().mockRejectedValue(abortError);
    vi.stubGlobal("fetch", mockFetch);

    const result = await invokeAnalyticsSend({
      eventName: "test",
      payload: {},
      timestamp: 0,
    });

    expect(result).toEqual({ success: true });
  });
});
```

### パターン E: 例外安全性確認（AC-05 対応）

**目的**: fetch の任意の例外後も `success: true` を返すことを確認する

```typescript
describe("fetchが例外をスローしても正常応答を返す", () => {
  it("TypeError後もsuccess: trueを返す", async () => {
    process.env.NODE_ENV = "production";
    process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
    const mockFetch = vi.fn().mockRejectedValue(new TypeError("Network error"));
    vi.stubGlobal("fetch", mockFetch);

    const result = await invokeAnalyticsSend({
      eventName: "test",
      payload: {},
      timestamp: 0,
    });

    expect(result).toEqual({ success: true });
  });
});
```

### パターン F: オプトアウト非送信確認（AC-06 対応）

**目的**: オプトアウト時に fetch が呼ばれず `skipped: true` が返ることを確認する（既存テストの非破壊確認）

```typescript
describe("オプトアウト時はHTTP POSTが実行されない", () => {
  it("optedOut: true のとき fetchを呼ばずにskipped: trueを返す", async () => {
    process.env.NODE_ENV = "production";
    process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const result = await invokeAnalyticsSend({
      eventName: "test",
      payload: {},
      timestamp: 0,
      optedOut: true,
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, skipped: true });
  });
});
```

---

## テストファイル構成

```
apps/desktop/src/main/ipc/
└── analyticsHandler.test.ts    ← 既存ファイルへ新規テストケースを追加
```

新規テストファイルは作成しなかった。既存の `analyticsHandler.test.ts` に HTTP 送信パスのテストを追加した。

---

## テスト実行コマンド

```bash
# analyticsHandler 単体
pnpm --filter @repo/desktop test -- analyticsHandler

# 全テスト
pnpm test
```

---

## テストカバレッジ目標

| テストパターン | 対応 AC | カバー対象コードパス               |
| -------------- | ------- | ---------------------------------- |
| A              | AC-01   | URL 設定 + production → fetch 実行 |
| B              | AC-02   | NODE_ENV != production → return    |
| C              | AC-03   | URL 未設定 → return                |
| D              | AC-04   | AbortError → catch → void          |
| E              | AC-05   | TypeError → catch → void           |
| F              | AC-06   | optOut → skipped（既存パス）       |

全 AC（AC-01〜AC-06）がユニットテストでカバーされた。AC-07（CI PASS）はテスト実行結果で確認した。
