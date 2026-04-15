/**
 * @file AnalyticsHttpProvider.test.ts
 * @description AnalyticsHttpProvider ユニットテスト（UT-W3-ANALYTICS-HTTP-PROVIDER-001 Phase 4）
 *
 * TDD: AC-1〜AC-6 をカバーするテストを先行作成
 *
 * テストカテゴリ:
 * - TC-01: ANALYTICS_ENDPOINT_URL 未設定時の no-op 動作（AC-5）
 * - TC-02: HTTP POST リクエスト送信（AC-1）
 * - TC-03: タイムアウト時の AbortController キャンセル（AC-2）
 * - TC-04: ネットワークエラー時の success: false（AC-2）
 * - TC-05: 最大 3 回リトライ（AC-3）
 * - TC-06: sentCount インクリメント（AC-4）
 * - TC-07: failedCount インクリメント（AC-4）
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsHttpProvider } from "../AnalyticsHttpProvider";

const ENDPOINT = "https://analytics.example.com/events";

const makeEvent = () => ({
  eventName: "test_event",
  payload: { key: "value" },
  timestamp: 1000,
});

describe("AnalyticsHttpProvider", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.ANALYTICS_ENDPOINT_URL;
    process.env.ANALYTICS_ENDPOINT_URL = ENDPOINT;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ANALYTICS_ENDPOINT_URL;
    } else {
      process.env.ANALYTICS_ENDPOINT_URL = originalEnv;
    }
    vi.useRealTimers();
  });

  // ──────────────────────────────────────────────────────────────
  // TC-01: ANALYTICS_ENDPOINT_URL 未設定時は no-op（AC-5）
  // ──────────────────────────────────────────────────────────────

  describe("TC-01: ANALYTICS_ENDPOINT_URL 未設定時は no-op", () => {
    it("should return { success: true, skipped: true } without sending HTTP request", async () => {
      delete process.env.ANALYTICS_ENDPOINT_URL;
      const mockFetch = vi.fn();
      const provider = new AnalyticsHttpProvider({
        fetchFn: mockFetch,
        baseRetryDelayMs: 0,
      });

      const result = await provider.send(makeEvent());

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────
  // TC-02: HTTP POST リクエストが送信される（AC-1）
  // ──────────────────────────────────────────────────────────────

  describe("TC-02: HTTP POST リクエストが送信される", () => {
    it("should call fetch with correct method, headers, and body", async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, status: 200 });
      const provider = new AnalyticsHttpProvider({
        fetchFn: mockFetch,
        baseRetryDelayMs: 0,
      });
      const event = makeEvent();

      const result = await provider.send(event);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0] as [
        string,
        RequestInit & { signal: AbortSignal },
      ];
      expect(url).toBe(ENDPOINT);
      expect(options.method).toBe("POST");
      expect((options.headers as Record<string, string>)["Content-Type"]).toBe(
        "application/json",
      );
      const body = JSON.parse(options.body as string) as typeof event;
      expect(body.eventName).toBe(event.eventName);
      expect(body.payload).toEqual(event.payload);
      expect(body.timestamp).toBe(event.timestamp);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // TC-03: タイムアウト時に AbortController でキャンセルされる（AC-2）
  // ──────────────────────────────────────────────────────────────

  describe("TC-03: タイムアウト時に AbortController でキャンセルされる", () => {
    it("should return { success: false } when fetch times out", async () => {
      vi.useFakeTimers();

      // fetch が永遠に pending
      const mockFetch = vi.fn().mockImplementation(
        (_url: string, options: { signal: AbortSignal }) =>
          new Promise<never>((_resolve, reject) => {
            options.signal.addEventListener("abort", () => {
              reject(
                new DOMException("The operation was aborted.", "AbortError"),
              );
            });
          }),
      );

      const provider = new AnalyticsHttpProvider({
        fetchFn: mockFetch,
        timeoutMs: 5000,
        maxRetries: 0, // リトライなしでタイムアウトのみ確認
        baseRetryDelayMs: 0,
      });

      const sendPromise = provider.send(makeEvent());
      await vi.advanceTimersByTimeAsync(5001);
      const result = await sendPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────────────
  // TC-04: ネットワークエラー時に success: false が返る（AC-2）
  // ──────────────────────────────────────────────────────────────

  describe("TC-04: ネットワークエラー時に success: false が返る", () => {
    it("should return { success: false } when fetch throws network error", async () => {
      vi.useFakeTimers();
      // 初回 + 3回リトライ = 計4回 reject
      const mockFetch = vi
        .fn()
        .mockRejectedValue(new TypeError("Failed to fetch"));

      const provider = new AnalyticsHttpProvider({
        fetchFn: mockFetch,
        baseRetryDelayMs: 10,
        maxRetries: 3,
      });

      const sendPromise = provider.send(makeEvent());
      await vi.runAllTimersAsync();
      const result = await sendPromise;

      expect(result.success).toBe(false);
      expect(typeof result.error).toBe("string");
    });

    it("should not throw an exception (error is caught internally)", async () => {
      vi.useFakeTimers();
      const mockFetch = vi
        .fn()
        .mockRejectedValue(new TypeError("Failed to fetch"));

      const provider = new AnalyticsHttpProvider({
        fetchFn: mockFetch,
        baseRetryDelayMs: 10,
        maxRetries: 3,
      });

      const sendPromise = provider.send(makeEvent());
      await vi.runAllTimersAsync();

      // 例外がスローされないこと（Promise が reject されない）
      await expect(sendPromise).resolves.toMatchObject({ success: false });
    });
  });

  // ──────────────────────────────────────────────────────────────
  // TC-05: リトライが最大 3 回実行される（AC-3）
  // ──────────────────────────────────────────────────────────────

  describe("TC-05: リトライが最大 3 回実行される", () => {
    it("should retry up to 3 times before returning failure", async () => {
      vi.useFakeTimers();
      // 初回 + リトライ3回 = 計4回 reject
      const mockFetch = vi
        .fn()
        .mockRejectedValue(new TypeError("Network error"));

      const provider = new AnalyticsHttpProvider({
        fetchFn: mockFetch,
        baseRetryDelayMs: 10,
        maxRetries: 3,
      });

      const sendPromise = provider.send(makeEvent());
      await vi.runAllTimersAsync();
      const result = await sendPromise;

      expect(mockFetch).toHaveBeenCalledTimes(4); // 初回 + 3リトライ
      expect(result.success).toBe(false);
    });

    it("should not retry on HTTP 4xx responses", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      });

      const provider = new AnalyticsHttpProvider({
        fetchFn: mockFetch,
        baseRetryDelayMs: 10,
        maxRetries: 3,
      });

      const result = await provider.send(makeEvent());

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(false);
      expect(result.retryCount).toBe(0);
    });

    it("should succeed on retry if fetch recovers", async () => {
      vi.useFakeTimers();
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new TypeError("Network error"))
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const provider = new AnalyticsHttpProvider({
        fetchFn: mockFetch,
        baseRetryDelayMs: 10,
        maxRetries: 3,
      });

      const sendPromise = provider.send(makeEvent());
      await vi.runAllTimersAsync();
      const result = await sendPromise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });

    it("should apply exponential backoff between retries", async () => {
      vi.useFakeTimers();
      const mockFetch = vi
        .fn()
        .mockRejectedValue(new TypeError("Network error"));

      const baseRetryDelayMs = 100;
      const provider = new AnalyticsHttpProvider({
        fetchFn: mockFetch,
        baseRetryDelayMs,
        maxRetries: 3,
      });

      const sendPromise = provider.send(makeEvent());

      // 1回目試行後、1回目リトライ前の待機（100ms）
      await vi.advanceTimersByTimeAsync(99);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1); // 100ms 経過
      // 2回目試行が実行される
      await vi.advanceTimersByTimeAsync(0);
      expect(mockFetch).toHaveBeenCalledTimes(2);

      await vi.runAllTimersAsync();
      await sendPromise;
    });
  });

  // ──────────────────────────────────────────────────────────────
  // TC-06: sentCount が正確にインクリメントされる（AC-4）
  // ──────────────────────────────────────────────────────────────

  describe("TC-06: sentCount が正確にインクリメントされる", () => {
    it("should increment sentCount on successful send", async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });

      let sentCount = 0;
      const mockStore = {
        get: vi.fn((key: string, defaultVal: number) => {
          if (key === "sentCount") return sentCount;
          return defaultVal;
        }),
        set: vi.fn((key: string, value: number) => {
          if (key === "sentCount") sentCount = value;
        }),
      };

      const provider = new AnalyticsHttpProvider({
        fetchFn: mockFetch,
        baseRetryDelayMs: 0,
        store: mockStore as Parameters<
          typeof AnalyticsHttpProvider
        >[0]["store"],
      });

      await provider.send(makeEvent());
      await provider.send(makeEvent());
      await provider.send(makeEvent());

      expect(sentCount).toBe(3);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // TC-07: failedCount が正確にインクリメントされる（AC-4）
  // ──────────────────────────────────────────────────────────────

  describe("TC-07: failedCount が正確にインクリメントされる", () => {
    it("should increment failedCount once after all retries exhausted", async () => {
      vi.useFakeTimers();
      const mockFetch = vi
        .fn()
        .mockRejectedValue(new TypeError("Network error"));

      let failedCount = 0;
      const mockStore = {
        get: vi.fn((key: string, defaultVal: number) => {
          if (key === "failedCount") return failedCount;
          return defaultVal;
        }),
        set: vi.fn((key: string, value: number) => {
          if (key === "failedCount") failedCount = value;
        }),
      };

      const provider = new AnalyticsHttpProvider({
        fetchFn: mockFetch,
        baseRetryDelayMs: 10,
        maxRetries: 3,
        store: mockStore as Parameters<
          typeof AnalyticsHttpProvider
        >[0]["store"],
      });

      const sendPromise = provider.send(makeEvent());
      await vi.runAllTimersAsync();
      await sendPromise;

      // リトライ中間ではなく、全失敗後に1回だけインクリメント
      expect(failedCount).toBe(1);
      const failedSetCalls = mockStore.set.mock.calls.filter(
        ([key]) => key === "failedCount",
      );
      expect(failedSetCalls).toHaveLength(1);
    });

    it("should NOT increment failedCount when send succeeds", async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const mockStore = {
        get: vi.fn().mockReturnValue(0),
        set: vi.fn(),
      };

      const provider = new AnalyticsHttpProvider({
        fetchFn: mockFetch,
        baseRetryDelayMs: 0,
        store: mockStore as Parameters<
          typeof AnalyticsHttpProvider
        >[0]["store"],
      });

      await provider.send(makeEvent());

      const failedSetCalls = mockStore.set.mock.calls.filter(
        ([key]) => key === "failedCount",
      );
      expect(failedSetCalls).toHaveLength(0);
    });

    it("should NOT increment failedCount when endpoint URL is not set (skipped)", async () => {
      delete process.env.ANALYTICS_ENDPOINT_URL;
      const mockStore = {
        get: vi.fn().mockReturnValue(0),
        set: vi.fn(),
      };

      const provider = new AnalyticsHttpProvider({
        fetchFn: vi.fn(),
        baseRetryDelayMs: 0,
        store: mockStore as Parameters<
          typeof AnalyticsHttpProvider
        >[0]["store"],
      });

      const result = await provider.send(makeEvent());

      expect(result.skipped).toBe(true);
      expect(mockStore.set).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Phase 6 拡充テスト: TC-10〜TC-17
  // ──────────────────────────────────────────────────────────────

  describe("Phase 6 テスト拡充", () => {
    // 共有モック store（TC-13〜TC-17 で再利用）
    const makeStore = () => {
      const counts: Record<string, number> = { sentCount: 0, failedCount: 0 };
      return {
        store: {
          get: vi.fn(
            (key: string, defaultVal: number) => counts[key] ?? defaultVal,
          ),
          set: vi.fn((key: string, value: number) => {
            counts[key] = value;
          }),
        },
        counts,
      };
    };

    // ──────────────────────────────────────────
    // TC-10: 同時並行送信
    // ──────────────────────────────────────────
    describe("TC-10: 複数イベントの同時並行送信（AC-1, AC-4）", () => {
      it("should process all concurrent events independently via HTTP POST", async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        const provider = new AnalyticsHttpProvider({
          fetchFn: mockFetch,
          baseRetryDelayMs: 0,
        });
        const events = [
          { eventName: "ev1", payload: {}, timestamp: 1001 },
          { eventName: "ev2", payload: {}, timestamp: 1002 },
          { eventName: "ev3", payload: {}, timestamp: 1003 },
        ];

        const results = await Promise.all(events.map((e) => provider.send(e)));

        expect(mockFetch).toHaveBeenCalledTimes(3);
        results.forEach((r) => expect(r.success).toBe(true));
      });

      it("should not propagate failure of one event to others", async () => {
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({ ok: true })
          .mockRejectedValueOnce(new TypeError("Network error"))
          .mockResolvedValueOnce({ ok: true });

        const provider = new AnalyticsHttpProvider({
          fetchFn: mockFetch,
          baseRetryDelayMs: 0,
          maxRetries: 0,
        });

        const results = await Promise.all([
          provider.send({ eventName: "ev1", payload: {}, timestamp: 1001 }),
          provider.send({ eventName: "ev2", payload: {}, timestamp: 1002 }),
          provider.send({ eventName: "ev3", payload: {}, timestamp: 1003 }),
        ]);

        expect(results[0].success).toBe(true);
        expect(results[1].success).toBe(false);
        expect(results[2].success).toBe(true);
      });
    });

    // ──────────────────────────────────────────
    // TC-11: 巨大ペイロードの送信
    // ──────────────────────────────────────────
    describe("TC-11: 巨大ペイロード送信（AC-1）", () => {
      it("should successfully send a payload larger than 1MB", async () => {
        const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true });
        const provider = new AnalyticsHttpProvider({
          fetchFn: mockFetch,
          baseRetryDelayMs: 0,
        });

        const result = await provider.send({
          eventName: "large-event",
          payload: { data: "x".repeat(1024 * 1024) },
          timestamp: Date.now(),
        });

        expect(result.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    // ──────────────────────────────────────────
    // TC-12: 特殊文字を含む eventName
    // ──────────────────────────────────────────
    describe("TC-12: 特殊文字を含む eventName のシリアライズ（AC-1）", () => {
      it("should correctly serialize eventName with special characters", async () => {
        const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true });
        const provider = new AnalyticsHttpProvider({
          fetchFn: mockFetch,
          baseRetryDelayMs: 0,
        });
        const specialName = "user/login\n🎉";

        const result = await provider.send({
          eventName: specialName,
          payload: {},
          timestamp: Date.now(),
        });

        expect(result.success).toBe(true);
        const [, options] = mockFetch.mock.calls[0] as [
          string,
          { body: string },
        ];
        const body = JSON.parse(options.body) as { eventName: string };
        expect(body.eventName).toBe(specialName);
      });
    });

    // ──────────────────────────────────────────
    // TC-13: 1 回目成功（リトライなし）
    // ──────────────────────────────────────────
    describe("TC-13: 初回成功時はリトライなし（AC-1, AC-3, AC-4）", () => {
      it("should succeed on first attempt without retrying", async () => {
        vi.useFakeTimers();
        const { store, counts } = makeStore();
        const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true });
        const provider = new AnalyticsHttpProvider({
          fetchFn: mockFetch,
          baseRetryDelayMs: 10,
          store: store as Parameters<typeof AnalyticsHttpProvider>[0]["store"],
        });

        const sendPromise = provider.send(makeEvent());
        await vi.runAllTimersAsync();
        const result = await sendPromise;

        expect(result.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(counts.sentCount).toBe(1);
        expect(counts.failedCount ?? 0).toBe(0);
      });
    });

    // ──────────────────────────────────────────
    // TC-14: 1 回リトライ後成功
    // ──────────────────────────────────────────
    describe("TC-14: 1 回リトライ後成功（AC-3, AC-4）", () => {
      it("should succeed after one retry and increment sentCount", async () => {
        vi.useFakeTimers();
        const { store, counts } = makeStore();
        const mockFetch = vi
          .fn()
          .mockRejectedValueOnce(new Error("network error"))
          .mockResolvedValueOnce({ ok: true });
        const provider = new AnalyticsHttpProvider({
          fetchFn: mockFetch,
          baseRetryDelayMs: 10,
          store: store as Parameters<typeof AnalyticsHttpProvider>[0]["store"],
        });

        const sendPromise = provider.send(makeEvent());
        await vi.runAllTimersAsync();
        const result = await sendPromise;

        expect(result.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(counts.sentCount).toBe(1);
        expect(counts.failedCount ?? 0).toBe(0);
      });
    });

    // ──────────────────────────────────────────
    // TC-15: 3 回全て失敗
    // ──────────────────────────────────────────
    describe("TC-15: 全リトライ失敗後 success:false（AC-2, AC-3, AC-4）", () => {
      it("should return failure and increment failedCount after 3 retries", async () => {
        vi.useFakeTimers();
        const { store, counts } = makeStore();
        const mockFetch = vi.fn().mockRejectedValue(new Error("always fail"));
        const provider = new AnalyticsHttpProvider({
          fetchFn: mockFetch,
          baseRetryDelayMs: 10,
          maxRetries: 3,
          store: store as Parameters<typeof AnalyticsHttpProvider>[0]["store"],
        });

        const sendPromise = provider.send(makeEvent());
        await vi.runAllTimersAsync();
        const result = await sendPromise;

        expect(result.success).toBe(false);
        expect(mockFetch).toHaveBeenCalledTimes(4); // 初回 + 3リトライ
        expect(counts.sentCount ?? 0).toBe(0);
        expect(counts.failedCount).toBe(1);
      });
    });

    // ──────────────────────────────────────────
    // TC-16: sentCount / failedCount 積算確認
    // ──────────────────────────────────────────
    describe("TC-16: sentCount と failedCount の積算確認（AC-4）", () => {
      it("should accumulate sentCount=2 and failedCount=1 after 2 success, 1 failure", async () => {
        vi.useFakeTimers();
        const { store, counts } = makeStore();
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({ ok: true })
          .mockResolvedValueOnce({ ok: true })
          .mockRejectedValue(new Error("fail"));
        const provider = new AnalyticsHttpProvider({
          fetchFn: mockFetch,
          baseRetryDelayMs: 10,
          maxRetries: 0, // リトライなしで即座に失敗
          store: store as Parameters<typeof AnalyticsHttpProvider>[0]["store"],
        });

        let p = provider.send(makeEvent());
        await vi.runAllTimersAsync();
        await p;

        p = provider.send(makeEvent());
        await vi.runAllTimersAsync();
        await p;

        p = provider.send(makeEvent());
        await vi.runAllTimersAsync();
        await p;

        expect(counts.sentCount).toBe(2);
        expect(counts.failedCount).toBe(1);
      });
    });

    // ──────────────────────────────────────────
    // TC-17: カウンター整合性確認
    // ──────────────────────────────────────────
    describe("TC-17: sentCount + failedCount の整合性（AC-4）", () => {
      it("should have sentCount + failedCount equal total send attempts", async () => {
        vi.useFakeTimers();
        const { store, counts } = makeStore();
        const mockFetch = vi
          .fn()
          .mockResolvedValueOnce({ ok: true })
          .mockResolvedValueOnce({ ok: true })
          .mockResolvedValueOnce({ ok: true })
          .mockRejectedValue(new Error("fail"));
        const provider = new AnalyticsHttpProvider({
          fetchFn: mockFetch,
          baseRetryDelayMs: 10,
          maxRetries: 0,
          store: store as Parameters<typeof AnalyticsHttpProvider>[0]["store"],
        });

        for (let i = 0; i < 5; i++) {
          const p = provider.send(makeEvent());
          await vi.runAllTimersAsync();
          await p;
        }

        expect((counts.sentCount ?? 0) + (counts.failedCount ?? 0)).toBe(5);
      });
    });
  });
});
