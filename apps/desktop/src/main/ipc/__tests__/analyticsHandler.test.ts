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

import { beforeEach, describe, expect, it, vi } from "vitest";

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
});
