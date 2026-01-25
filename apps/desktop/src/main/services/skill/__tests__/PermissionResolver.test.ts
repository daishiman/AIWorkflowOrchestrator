/**
 * PermissionResolver Unit Tests
 *
 * TASK-3-1-C: PermissionRequest Hook 統合
 * Phase 6: テスト拡充 - PermissionResolver の直接テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PermissionResolver } from "../PermissionResolver";

describe("PermissionResolver", () => {
  let resolver: PermissionResolver;

  beforeEach(() => {
    vi.useFakeTimers();
    resolver = new PermissionResolver(30000); // 30秒タイムアウト
  });

  afterEach(() => {
    vi.useRealTimers();
    resolver.cancelAll();
  });

  // =================================================================
  // 基本機能テスト
  // =================================================================

  describe("基本機能", () => {
    it("should resolve request when response is received", async () => {
      const requestId = "test-request-123";

      // 待機開始
      const responsePromise = resolver.waitForResponse(requestId);

      // 応答を送信
      resolver.resolveRequest({
        requestId,
        approved: true,
      });

      // 待機が解決される
      const response = await responsePromise;
      expect(response.approved).toBe(true);
      expect(response.requestId).toBe(requestId);
    });

    it("should reject request with rejectReason", async () => {
      const requestId = "test-request-456";

      const responsePromise = resolver.waitForResponse(requestId);

      resolver.resolveRequest({
        requestId,
        approved: false,
        rejectReason: "ユーザーにより拒否されました",
      });

      const response = await responsePromise;
      expect(response.approved).toBe(false);
      expect(response.rejectReason).toBe("ユーザーにより拒否されました");
    });

    it("should pass rememberChoice flag", async () => {
      const requestId = "test-request-789";

      const responsePromise = resolver.waitForResponse(requestId);

      resolver.resolveRequest({
        requestId,
        approved: true,
        rememberChoice: true,
      });

      const response = await responsePromise;
      expect(response.rememberChoice).toBe(true);
    });

    it("should track pending count correctly", () => {
      expect(resolver.pendingCount).toBe(0);

      void resolver.waitForResponse("req-1");
      expect(resolver.pendingCount).toBe(1);

      void resolver.waitForResponse("req-2");
      expect(resolver.pendingCount).toBe(2);

      resolver.resolveRequest({ requestId: "req-1", approved: true });
      expect(resolver.pendingCount).toBe(1);

      resolver.resolveRequest({ requestId: "req-2", approved: false });
      expect(resolver.pendingCount).toBe(0);
    });
  });

  // =================================================================
  // タイムアウトテスト
  // =================================================================

  describe("タイムアウト", () => {
    it("should reject on timeout", async () => {
      const requestId = "timeout-test";
      const timeout = 1000;

      const responsePromise = resolver.waitForResponse(
        requestId,
        undefined,
        timeout,
      );

      // タイムアウトまで進める
      vi.advanceTimersByTime(timeout + 100);

      await expect(responsePromise).rejects.toThrow(
        `Permission request timed out: ${requestId}`,
      );
    });

    it("should use default timeout when not specified", async () => {
      const requestId = "default-timeout-test";

      const responsePromise = resolver.waitForResponse(requestId);

      // デフォルトタイムアウト（30秒）まで進める
      vi.advanceTimersByTime(30001);

      await expect(responsePromise).rejects.toThrow("timed out");
    });

    it("should clear pending on timeout", async () => {
      const requestId = "timeout-clear-test";

      expect(resolver.pendingCount).toBe(0);

      const responsePromise = resolver.waitForResponse(
        requestId,
        undefined,
        1000,
      );
      expect(resolver.pendingCount).toBe(1);

      vi.advanceTimersByTime(1001);

      try {
        await responsePromise;
      } catch {
        // Expected
      }

      expect(resolver.pendingCount).toBe(0);
    });
  });

  // =================================================================
  // AbortSignalテスト
  // =================================================================

  describe("AbortSignal", () => {
    it("should reject when signal is aborted", async () => {
      const requestId = "abort-test";
      const abortController = new AbortController();

      const responsePromise = resolver.waitForResponse(
        requestId,
        abortController.signal,
      );

      // 中断
      abortController.abort();

      await expect(responsePromise).rejects.toThrow(
        `Permission request aborted: ${requestId}`,
      );
    });

    it("should reject immediately if signal is already aborted", async () => {
      const requestId = "pre-abort-test";
      const abortController = new AbortController();
      abortController.abort(); // 事前に中断

      const responsePromise = resolver.waitForResponse(
        requestId,
        abortController.signal,
      );

      await expect(responsePromise).rejects.toThrow(
        `Permission request aborted: ${requestId}`,
      );

      // 保留中に追加されないことを確認
      expect(resolver.pendingCount).toBe(0);
    });

    it("should clear pending on abort", async () => {
      const requestId = "abort-clear-test";
      const abortController = new AbortController();

      expect(resolver.pendingCount).toBe(0);

      const responsePromise = resolver.waitForResponse(
        requestId,
        abortController.signal,
      );
      expect(resolver.pendingCount).toBe(1);

      abortController.abort();

      try {
        await responsePromise;
      } catch {
        // Expected
      }

      expect(resolver.pendingCount).toBe(0);
    });
  });

  // =================================================================
  // キャンセルテスト
  // =================================================================

  describe("キャンセル", () => {
    it("should cancel specific request", async () => {
      const requestId = "cancel-test";

      const responsePromise = resolver.waitForResponse(requestId);

      resolver.cancelRequest(requestId, "キャンセルされました");

      await expect(responsePromise).rejects.toThrow("キャンセルされました");
    });

    it("should use default message when no reason provided", async () => {
      const requestId = "cancel-default-test";

      const responsePromise = resolver.waitForResponse(requestId);

      resolver.cancelRequest(requestId);

      await expect(responsePromise).rejects.toThrow(
        `Permission request cancelled: ${requestId}`,
      );
    });

    it("should cancel all pending requests", async () => {
      const promises = [
        resolver.waitForResponse("cancel-all-1"),
        resolver.waitForResponse("cancel-all-2"),
        resolver.waitForResponse("cancel-all-3"),
      ];

      expect(resolver.pendingCount).toBe(3);

      resolver.cancelAll();

      expect(resolver.pendingCount).toBe(0);

      // 全てが拒否されることを確認
      for (const promise of promises) {
        await expect(promise).rejects.toThrow("cancelled");
      }
    });
  });

  // =================================================================
  // エッジケーステスト
  // =================================================================

  describe("エッジケース", () => {
    it("should ignore resolve for non-existent request", () => {
      // 存在しないリクエストIDで呼び出してもエラーにならない
      expect(() => {
        resolver.resolveRequest({
          requestId: "non-existent",
          approved: true,
        });
      }).not.toThrow();
    });

    it("should ignore cancel for non-existent request", () => {
      expect(() => {
        resolver.cancelRequest("non-existent");
      }).not.toThrow();
    });

    it("should handle multiple resolves for same request", async () => {
      const requestId = "double-resolve-test";

      const responsePromise = resolver.waitForResponse(requestId);

      // 最初の解決
      resolver.resolveRequest({
        requestId,
        approved: true,
      });

      const response = await responsePromise;
      expect(response.approved).toBe(true);

      // 2回目の解決は無視される
      expect(() => {
        resolver.resolveRequest({
          requestId,
          approved: false,
        });
      }).not.toThrow();
    });

    it("should handle concurrent requests independently", async () => {
      const promises = [
        resolver.waitForResponse("concurrent-1"),
        resolver.waitForResponse("concurrent-2"),
        resolver.waitForResponse("concurrent-3"),
      ];

      // 順番を変えて解決
      resolver.resolveRequest({ requestId: "concurrent-2", approved: false });
      resolver.resolveRequest({ requestId: "concurrent-3", approved: true });
      resolver.resolveRequest({ requestId: "concurrent-1", approved: true });

      const results = await Promise.all(promises);

      expect(results[0].approved).toBe(true);
      expect(results[1].approved).toBe(false);
      expect(results[2].approved).toBe(true);
    });
  });

  // =================================================================
  // コンストラクタテスト
  // =================================================================

  describe("コンストラクタ", () => {
    it("should use custom default timeout", async () => {
      const customResolver = new PermissionResolver(5000);
      const requestId = "custom-timeout-test";

      const responsePromise = customResolver.waitForResponse(requestId);

      // カスタムタイムアウト（5秒）まで進める
      vi.advanceTimersByTime(5001);

      await expect(responsePromise).rejects.toThrow("timed out");

      customResolver.cancelAll();
    });

    it("should use default timeout of 300000ms when not specified", async () => {
      const defaultResolver = new PermissionResolver();
      const requestId = "default-300s-test";

      const responsePromise = defaultResolver.waitForResponse(requestId);

      // 5分（300秒）より少し進める
      vi.advanceTimersByTime(300001);

      await expect(responsePromise).rejects.toThrow("timed out");

      defaultResolver.cancelAll();
    });
  });
});
