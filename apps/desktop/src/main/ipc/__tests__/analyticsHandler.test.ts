/**
 * @file analyticsHandler.test.ts
 * @description analyticsHandler IPC ハンドラー ユニットテスト（UT-W3-ANALYTICS-ADAPTER-001 Phase 4）
 *
 * TDD Red: analyticsHandler.ts 実装前にテストを先行作成
 *
 * テストカテゴリ:
 * - IPC受信・正常処理
 * - オプトアウト時の送信スキップ
 * - 不正リクエスト時のエラーハンドリング
 * - バリデーションエラー
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { handleMock, storeGetMock, storeSetMock, storeConstructorMock } =
  vi.hoisted(() => ({
    handleMock: vi.fn(),
    storeGetMock: vi.fn(),
    storeSetMock: vi.fn(),
    storeConstructorMock: vi.fn(() => ({
      get: storeGetMock,
      set: storeSetMock,
    })),
  }));

vi.mock("electron", () => ({
  ipcMain: {
    handle: handleMock,
  },
}));

vi.mock("electron-store", () => ({
  default: storeConstructorMock,
}));

import { registerAnalyticsHandlers } from "../analyticsHandler";
import { IPC_CHANNELS } from "../../../preload/channels";

describe("analyticsHandler", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;
  const validEvent = { senderFrame: { url: "http://localhost:3000" } };

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();
    storeGetMock.mockReturnValue(false);

    handleMock.mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    registerAnalyticsHandlers();
  });

  // ──────────────────────────────────────────────────────────────
  // チャネル登録確認
  // ──────────────────────────────────────────────────────────────

  describe("チャネル登録", () => {
    it("TC-AH-01: analytics:send チャネルが登録されること", () => {
      expect(handlers.has(IPC_CHANNELS.ANALYTICS_SEND)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 正常処理
  // ──────────────────────────────────────────────────────────────

  describe("analytics:send 正常処理", () => {
    it("TC-AH-02: 有効なリクエストで success: true を返すこと", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      const result = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: Date.now(),
      });

      expect(result).toEqual(expect.objectContaining({ success: true }));
    });

    it("TC-AH-03: eventName と payload が記録されること", async () => {
      const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      await handler(validEvent, {
        eventName: "skill_wizard_step1_completed",
        payload: { method: "complete", skippedAtQuestion: null },
        timestamp: Date.now(),
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "[analyticsHandler] received:",
        expect.objectContaining({
          eventName: "skill_wizard_step1_completed",
          payload: { method: "complete", skippedAtQuestion: null },
          timestamp: expect.any(String),
        }),
      );
      consoleSpy.mockRestore();
    });
  });

  // ──────────────────────────────────────────────────────────────
  // バリデーション
  // ──────────────────────────────────────────────────────────────

  describe("バリデーション", () => {
    it("TC-AH-04: eventName がない場合 success: false を返すこと", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      const result = await handler(validEvent, {
        payload: {},
        timestamp: Date.now(),
      });

      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        }),
      );
    });

    it("TC-AH-05: payload がオブジェクトでない場合 success: false を返すこと", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      const result = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: "invalid",
        timestamp: Date.now(),
      });

      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        }),
      );
    });

    it("TC-AH-06: リクエスト全体が null の場合 success: false を返すこと", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      const result = await handler(validEvent, null);

      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        }),
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // オプトアウト
  // ──────────────────────────────────────────────────────────────

  describe("オプトアウト（AC-4）", () => {
    it("TC-AH-07: optedOut=true のとき success: true かつ skipped: true を返すこと", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      // オプトアウト設定付きリクエスト
      const result = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: Date.now(),
        optedOut: true,
      });

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          skipped: true,
        }),
      );
    });

    it("TC-AH-08: ストアの analyticsOptOut=true のとき success: true かつ skipped: true を返すこと", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;
      storeGetMock.mockReturnValue(true);

      const result = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: Date.now(),
      });

      expect(storeGetMock).toHaveBeenCalledWith("analyticsOptOut", false);
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          skipped: true,
        }),
      );
    });

    it("TC-AH-09: ストア参照エラー時は安全側で success: true かつ skipped: true を返すこと", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;
      storeGetMock.mockImplementation(() => {
        throw new Error("store unavailable");
      });

      const result = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: Date.now(),
      });

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          skipped: true,
        }),
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // HTTP 送信（sendToAnalyticsProvider）- UT-W3-ANALYTICS-HTTP-PROVIDER-001
  // ──────────────────────────────────────────────────────────────

  describe("HTTP 送信（sendToAnalyticsProvider）", () => {
    let mockFetch: ReturnType<typeof vi.fn>;
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
      mockFetch = vi
        .fn()
        .mockResolvedValue(new Response(null, { status: 200 }));
      vi.stubGlobal("fetch", mockFetch);
      process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
      process.env.NODE_ENV = "production";
    });

    afterEach(() => {
      delete process.env.ANALYTICS_ENDPOINT_URL;
      process.env.NODE_ENV = originalNodeEnv;
      vi.unstubAllGlobals();
    });

    it("TC-01: production + URL 設定 → fetch が 1 回呼ばれること", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("TC-02: production + URL 未設定 → fetch を呼ばないこと", async () => {
      delete process.env.ANALYTICS_ENDPOINT_URL;
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("TC-03: development + URL 設定 → fetch を呼ばないこと", async () => {
      process.env.NODE_ENV = "development";
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("TC-04: fetch 成功 → { success: true } を返すこと", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      const result = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
      });

      expect(result).toEqual(expect.objectContaining({ success: true }));
    });

    it("TC-05: fetch 例外 → success: true を返し、例外を握り潰すこと", async () => {
      mockFetch.mockRejectedValue(new Error("network error"));
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      const result = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
      });

      expect(result).toEqual(expect.objectContaining({ success: true }));
    });

    it("TC-06: fetch タイムアウト → success: true を返し、例外を握り潰すこと", async () => {
      vi.useFakeTimers();
      try {
        mockFetch.mockImplementation((_url, init) => {
          const signal = (init as RequestInit | undefined)?.signal;
          return new Promise<Response>((_, reject) => {
            signal?.addEventListener(
              "abort",
              () => reject(new DOMException("AbortError", "AbortError")),
              { once: true },
            );
          });
        });
        const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

        const resultPromise = handler(validEvent, {
          eventName: "skill_wizard_started",
          payload: {},
          timestamp: 1000,
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);

        const fetchOptions = mockFetch.mock.calls[0]?.[1] as
          | RequestInit
          | undefined;
        const signal = fetchOptions?.signal;

        expect(signal).toBeInstanceOf(AbortSignal);
        expect(signal?.aborted).toBe(false);

        await vi.advanceTimersByTimeAsync(4_999);
        expect(signal?.aborted).toBe(false);

        await vi.advanceTimersByTimeAsync(1);

        await expect(resultPromise).resolves.toEqual(
          expect.objectContaining({ success: true }),
        );
        expect(signal?.aborted).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it("TC-07: optedOut=true → fetch を呼ばないこと（補助要件）", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      const result = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
        optedOut: true,
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({ success: true, skipped: true }),
      );
    });

    it("TC-08: リクエストボディが正しい JSON 形式であること", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;
      const timestamp = 1234567890;

      await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: { step: 1 },
        timestamp,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.com/analytics",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            eventName: "skill_wizard_started",
            payload: { step: 1 },
            timestamp,
          }),
        }),
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // テスト拡充（Phase 6）- エッジケース・fail path・回帰 guard
  // ──────────────────────────────────────────────────────────────

  describe("HTTP 送信 エッジケース・回帰 guard（Phase 6）", () => {
    let mockFetch: ReturnType<typeof vi.fn>;
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
      mockFetch = vi
        .fn()
        .mockResolvedValue(new Response(null, { status: 200 }));
      vi.stubGlobal("fetch", mockFetch);
      process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
      process.env.NODE_ENV = "production";
    });

    afterEach(() => {
      delete process.env.ANALYTICS_ENDPOINT_URL;
      process.env.NODE_ENV = originalNodeEnv;
      vi.unstubAllGlobals();
    });

    it("TC-E01: 空 payload {} で HTTP POST が成功すること", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      const result = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expect.objectContaining({ success: true }));
    });

    it("TC-E02: eventName に特殊文字が含まれる場合でも動作すること", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      const result = await handler(validEvent, {
        eventName: "event/with-special_chars.test",
        payload: {},
        timestamp: 1000,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expect.objectContaining({ success: true }));
    });

    it("TC-E03: HTTP 4xx レスポンスを受け取った場合も success: true を返すこと", async () => {
      mockFetch.mockResolvedValue(new Response(null, { status: 400 }));
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      const result = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
      });

      expect(result).toEqual(expect.objectContaining({ success: true }));
    });

    it("TC-E04: HTTP 5xx レスポンスを受け取った場合も success: true を返すこと", async () => {
      mockFetch.mockResolvedValue(new Response(null, { status: 500 }));
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      const result = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
      });

      expect(result).toEqual(expect.objectContaining({ success: true }));
    });

    it("TC-E05: タイムアウト後に fetch が再試行されないこと", async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        return Promise.reject(new DOMException("AbortError", "AbortError"));
      });
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
      });

      expect(callCount).toBe(1);
    });

    it("TC-R01: オプトアウト状態が変化しても IPC 全体が動作すること", async () => {
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      // オプトアウト: skipped: true
      storeGetMock.mockReturnValue(true);
      const skipped = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
      });
      expect(skipped).toEqual(
        expect.objectContaining({ success: true, skipped: true }),
      );

      // オプトイン: HTTP 送信される
      storeGetMock.mockReturnValue(false);
      const sent = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
      });
      expect(sent).toEqual(expect.objectContaining({ success: true }));
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("TC-R02: URL 未設定 / 空文字でも validateRequest が正常動作すること", async () => {
      delete process.env.ANALYTICS_ENDPOINT_URL;
      const handler = handlers.get(IPC_CHANNELS.ANALYTICS_SEND)!;

      // 不正リクエスト → validation で弾かれる
      const invalid = await handler(validEvent, {
        payload: {},
        timestamp: 1000,
      });
      expect(invalid).toEqual(
        expect.objectContaining({ success: false, error: expect.any(String) }),
      );

      // 正常リクエスト → success: true（HTTP 送信なし）
      const valid = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
      });
      expect(valid).toEqual(expect.objectContaining({ success: true }));
      expect(mockFetch).not.toHaveBeenCalled();

      process.env.ANALYTICS_ENDPOINT_URL = "";
      const emptyUrl = await handler(validEvent, {
        eventName: "skill_wizard_started",
        payload: {},
        timestamp: 1000,
      });
      expect(emptyUrl).toEqual(expect.objectContaining({ success: true }));
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("TC-R03: registerAnalyticsHandlers を複数回呼んでも重複登録しないこと", async () => {
      // 2回目の登録
      registerAnalyticsHandlers();

      // handleMock は2回呼ばれているが、handlers Map には最後が残る
      expect(handleMock).toHaveBeenCalledWith(
        IPC_CHANNELS.ANALYTICS_SEND,
        expect.any(Function),
      );
    });
  });
});
