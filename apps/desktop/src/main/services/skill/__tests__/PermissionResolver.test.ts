/**
 * PermissionResolver Unit Tests
 *
 * TASK-3-2: PermissionResolver 実装
 * Phase 4: テスト作成（TDD: Red）
 *
 * 権限確認リクエストの待機・解決を管理するクラスのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SkillPermissionResponse } from "@repo/shared";
import { PermissionResolver } from "../PermissionResolver";

describe("PermissionResolver", () => {
  let resolver: PermissionResolver;

  beforeEach(() => {
    vi.useFakeTimers();
    resolver = new PermissionResolver();
  });

  afterEach(() => {
    // クリーンアップ: 保留中のリクエストをすべてキャンセル
    resolver.cancelAll();
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("should use default timeout of 300000ms (5 minutes)", async () => {
      const requestId = "test-default-timeout";

      const waitPromise = resolver.waitForResponse(requestId);

      // 4分59秒経過 - まだタイムアウトしない
      vi.advanceTimersByTime(299999);
      expect(resolver.pendingCount).toBe(1);

      // 5分経過 - タイムアウト
      vi.advanceTimersByTime(1);

      await expect(waitPromise).rejects.toThrow("timed out");
      expect(resolver.pendingCount).toBe(0);
    });

    it("should use custom timeout when provided", async () => {
      const customResolver = new PermissionResolver(1000); // 1秒
      const requestId = "test-custom-timeout";

      const waitPromise = customResolver.waitForResponse(requestId);

      // 999ms経過 - まだタイムアウトしない
      vi.advanceTimersByTime(999);
      expect(customResolver.pendingCount).toBe(1);

      // 1秒経過 - タイムアウト
      vi.advanceTimersByTime(1);

      await expect(waitPromise).rejects.toThrow("timed out");
      expect(customResolver.pendingCount).toBe(0);
    });
  });

  describe("waitForResponse", () => {
    it("should resolve when resolveRequest is called", async () => {
      const requestId = "test-request-1";
      const response: SkillPermissionResponse = {
        requestId,
        approved: true,
        rememberChoice: false,
      };

      const waitPromise = resolver.waitForResponse(requestId);
      expect(resolver.pendingCount).toBe(1);

      // 非同期でレスポンスを送信
      queueMicrotask(() => {
        resolver.resolveRequest(response);
      });

      const result = await waitPromise;
      expect(result).toEqual(response);
      expect(resolver.pendingCount).toBe(0);
    });

    it("should timeout after default timeout", async () => {
      const requestId = "test-request-timeout";

      const waitPromise = resolver.waitForResponse(requestId);

      // 5分経過
      vi.advanceTimersByTime(300000);

      await expect(waitPromise).rejects.toThrow(
        `Permission request timed out: ${requestId}`,
      );
      expect(resolver.pendingCount).toBe(0);
    });

    it("should include requestId in timeout error message", async () => {
      const requestId = "unique-request-id-12345";

      const waitPromise = resolver.waitForResponse(requestId);
      vi.advanceTimersByTime(300000);

      await expect(waitPromise).rejects.toThrow(requestId);
    });

    it("should reject when signal is aborted", async () => {
      const requestId = "test-request-abort";
      const controller = new AbortController();

      const waitPromise = resolver.waitForResponse(
        requestId,
        controller.signal,
      );
      expect(resolver.pendingCount).toBe(1);

      controller.abort();

      await expect(waitPromise).rejects.toThrow(
        `Permission request aborted: ${requestId}`,
      );
      expect(resolver.pendingCount).toBe(0);
    });

    it("should reject immediately when signal is already aborted", async () => {
      const requestId = "test-pre-aborted";
      const controller = new AbortController();
      controller.abort();

      const waitPromise = resolver.waitForResponse(
        requestId,
        controller.signal,
      );

      await expect(waitPromise).rejects.toThrow("aborted");
    });

    it("should handle multiple concurrent requests independently", async () => {
      const requestId1 = "concurrent-1";
      const requestId2 = "concurrent-2";

      const waitPromise1 = resolver.waitForResponse(requestId1);
      const waitPromise2 = resolver.waitForResponse(requestId2);
      expect(resolver.pendingCount).toBe(2);

      // 最初のリクエストのみ解決
      const response1: SkillPermissionResponse = {
        requestId: requestId1,
        approved: true,
      };
      resolver.resolveRequest(response1);

      const result1 = await waitPromise1;
      expect(result1.approved).toBe(true);
      expect(resolver.pendingCount).toBe(1);

      // 2番目のリクエストはまだ待機中
      const response2: SkillPermissionResponse = {
        requestId: requestId2,
        approved: false,
      };
      resolver.resolveRequest(response2);

      const result2 = await waitPromise2;
      expect(result2.approved).toBe(false);
      expect(resolver.pendingCount).toBe(0);
    });

    // PR-03: waitForResponse - 記憶選択
    it("should include rememberChoice in resolved response", async () => {
      const requestId = "test-remember-choice";
      const response: SkillPermissionResponse = {
        requestId,
        approved: true,
        rememberChoice: true,
      };

      const waitPromise = resolver.waitForResponse(requestId);

      queueMicrotask(() => {
        resolver.resolveRequest(response);
      });

      const result = await waitPromise;
      expect(result.rememberChoice).toBe(true);
    });
  });

  describe("resolveRequest", () => {
    it("should resolve pending request with correct response", async () => {
      const requestId = "test-resolve";
      const response: SkillPermissionResponse = {
        requestId,
        approved: false,
        rejectReason: "User denied",
      };

      const waitPromise = resolver.waitForResponse(requestId);
      resolver.resolveRequest(response);

      const result = await waitPromise;
      expect(result.approved).toBe(false);
      expect(result.rejectReason).toBe("User denied");
    });

    it("should do nothing for unknown requestId", () => {
      const response: SkillPermissionResponse = {
        requestId: "unknown-id",
        approved: true,
      };

      // 例外が発生しないことを確認
      expect(() => {
        resolver.resolveRequest(response);
      }).not.toThrow();
      expect(resolver.pendingCount).toBe(0);
    });

    it("should clear timeout when resolved", async () => {
      const requestId = "test-clear-timeout";
      const response: SkillPermissionResponse = {
        requestId,
        approved: true,
      };

      const waitPromise = resolver.waitForResponse(requestId);
      resolver.resolveRequest(response);

      await waitPromise;

      // タイムアウト後もエラーにならない（タイマーがクリアされている）
      vi.advanceTimersByTime(300000);
      expect(resolver.pendingCount).toBe(0);
    });

    it("should not resolve the same request twice", async () => {
      const requestId = "test-double-resolve";
      const response1: SkillPermissionResponse = {
        requestId,
        approved: true,
      };
      const response2: SkillPermissionResponse = {
        requestId,
        approved: false,
      };

      const waitPromise = resolver.waitForResponse(requestId);
      resolver.resolveRequest(response1);

      const result = await waitPromise;
      expect(result.approved).toBe(true);

      // 2回目の解決は何もしない（エラーにならない）
      expect(() => {
        resolver.resolveRequest(response2);
      }).not.toThrow();
    });
  });

  describe("cancelRequest", () => {
    it("should reject pending request with reason", async () => {
      const requestId = "test-cancel";

      const waitPromise = resolver.waitForResponse(requestId);
      resolver.cancelRequest(requestId, "User cancelled");

      await expect(waitPromise).rejects.toThrow("User cancelled");
      expect(resolver.pendingCount).toBe(0);
    });

    it("should use default message when reason is not provided", async () => {
      const requestId = "test-cancel-default";

      const waitPromise = resolver.waitForResponse(requestId);
      resolver.cancelRequest(requestId);

      await expect(waitPromise).rejects.toThrow(
        `Request cancelled: ${requestId}`,
      );
    });

    it("should do nothing for unknown requestId", () => {
      expect(() => {
        resolver.cancelRequest("unknown-id");
      }).not.toThrow();
      expect(resolver.pendingCount).toBe(0);
    });

    it("should clear timeout when cancelled", async () => {
      const requestId = "test-cancel-timeout";

      const waitPromise = resolver.waitForResponse(requestId);
      resolver.cancelRequest(requestId);

      await expect(waitPromise).rejects.toThrow();

      // タイムアウト後も追加のエラーが発生しない
      vi.advanceTimersByTime(300000);
      expect(resolver.pendingCount).toBe(0);
    });
  });

  describe("cancelAll", () => {
    it("should cancel all pending requests", async () => {
      const requestId1 = "cancel-all-1";
      const requestId2 = "cancel-all-2";
      const requestId3 = "cancel-all-3";

      const waitPromise1 = resolver.waitForResponse(requestId1);
      const waitPromise2 = resolver.waitForResponse(requestId2);
      const waitPromise3 = resolver.waitForResponse(requestId3);

      expect(resolver.pendingCount).toBe(3);

      resolver.cancelAll();

      await expect(waitPromise1).rejects.toThrow();
      await expect(waitPromise2).rejects.toThrow();
      await expect(waitPromise3).rejects.toThrow();
      expect(resolver.pendingCount).toBe(0);
    });

    it("should work when no pending requests", () => {
      expect(resolver.pendingCount).toBe(0);
      expect(() => {
        resolver.cancelAll();
      }).not.toThrow();
      expect(resolver.pendingCount).toBe(0);
    });

    it("should clear all timeouts", async () => {
      const p1 = resolver.waitForResponse("cancel-timeout-1");
      const p2 = resolver.waitForResponse("cancel-timeout-2");

      resolver.cancelAll();

      // Promiseをハンドル（Unhandled Rejection防止）
      await expect(p1).rejects.toThrow("cancelled");
      await expect(p2).rejects.toThrow("cancelled");

      // タイムアウト後も追加のエラーが発生しない
      vi.advanceTimersByTime(300000);
      expect(resolver.pendingCount).toBe(0);
    });
  });

  describe("pendingCount", () => {
    it("should return 0 initially", () => {
      expect(resolver.pendingCount).toBe(0);
    });

    it("should return correct count after adding requests", async () => {
      const p1 = resolver.waitForResponse("count-1");
      expect(resolver.pendingCount).toBe(1);

      const p2 = resolver.waitForResponse("count-2");
      expect(resolver.pendingCount).toBe(2);

      const p3 = resolver.waitForResponse("count-3");
      expect(resolver.pendingCount).toBe(3);

      // クリーンアップ（Unhandled Rejection防止）
      resolver.cancelAll();
      await expect(p1).rejects.toThrow();
      await expect(p2).rejects.toThrow();
      await expect(p3).rejects.toThrow();
    });

    it("should decrease when request is resolved", async () => {
      const requestId = "count-resolve";
      const waitPromise = resolver.waitForResponse(requestId);
      expect(resolver.pendingCount).toBe(1);

      resolver.resolveRequest({
        requestId,
        approved: true,
      });

      await waitPromise;
      expect(resolver.pendingCount).toBe(0);
    });

    it("should decrease when request is cancelled", async () => {
      const requestId = "count-cancel";
      const waitPromise = resolver.waitForResponse(requestId);
      expect(resolver.pendingCount).toBe(1);

      resolver.cancelRequest(requestId);

      await expect(waitPromise).rejects.toThrow("cancelled");
      expect(resolver.pendingCount).toBe(0);
    });

    it("should decrease when request times out", async () => {
      const waitPromise = resolver.waitForResponse("count-timeout");
      expect(resolver.pendingCount).toBe(1);

      vi.advanceTimersByTime(300000);

      await expect(waitPromise).rejects.toThrow("timed out");
      expect(resolver.pendingCount).toBe(0);
    });

    it("should return 0 after cancelAll", async () => {
      const p1 = resolver.waitForResponse("count-all-1");
      const p2 = resolver.waitForResponse("count-all-2");
      expect(resolver.pendingCount).toBe(2);

      resolver.cancelAll();

      await expect(p1).rejects.toThrow("cancelled");
      await expect(p2).rejects.toThrow("cancelled");
      expect(resolver.pendingCount).toBe(0);
    });
  });

  describe("memory management", () => {
    it("should clean up resources after resolve", async () => {
      const requestId = "memory-resolve";
      const waitPromise = resolver.waitForResponse(requestId);

      resolver.resolveRequest({ requestId, approved: true });
      await waitPromise;

      // リソースがクリーンアップされている
      expect(resolver.pendingCount).toBe(0);
    });

    it("should clean up resources after timeout", async () => {
      const waitPromise = resolver.waitForResponse("memory-timeout");

      vi.advanceTimersByTime(300000);

      // タイムアウトでrejectされることを確認（Unhandled Rejection防止）
      await expect(waitPromise).rejects.toThrow("timed out");
      expect(resolver.pendingCount).toBe(0);
    });

    it("should clean up resources after abort", async () => {
      const controller = new AbortController();
      const waitPromise = resolver.waitForResponse(
        "memory-abort",
        controller.signal,
      );

      controller.abort();

      // abortでrejectされることを確認（Unhandled Rejection防止）
      await expect(waitPromise).rejects.toThrow("aborted");
      expect(resolver.pendingCount).toBe(0);
    });

    it("should clean up resources after cancel", async () => {
      const waitPromise = resolver.waitForResponse("memory-cancel");
      resolver.cancelRequest("memory-cancel");

      // cancelでrejectされることを確認（Unhandled Rejection防止）
      await expect(waitPromise).rejects.toThrow("cancelled");
      expect(resolver.pendingCount).toBe(0);
    });
  });
});

/**
 * Phase 6: テスト拡充 - エッジケースと並行処理テスト
 */
describe("PermissionResolver - Edge Cases", () => {
  let resolver: PermissionResolver;

  beforeEach(() => {
    vi.useFakeTimers();
    resolver = new PermissionResolver();
  });

  afterEach(() => {
    resolver.cancelAll();
    vi.useRealTimers();
  });

  describe("duplicate requestId handling", () => {
    it("should handle same requestId called twice (Map overwrite)", async () => {
      const requestId = "dup-request-1";

      // 最初のリクエスト
      const promise1 = resolver.waitForResponse(requestId);

      // 同じ requestId で2回目を呼ぶ（上書き）
      const promise2 = resolver.waitForResponse(requestId);

      expect(resolver.pendingCount).toBe(1); // Map なので1つ

      // 解決
      resolver.resolveRequest({
        requestId,
        approved: true,
      });

      // 後から登録した promise2 が解決される
      await expect(promise2).resolves.toEqual({
        requestId,
        approved: true,
      });

      // promise1 はタイムアウトまで待機（クリーンアップ）
      vi.advanceTimersByTime(300000);
      await expect(promise1).rejects.toThrow("timed out");
    });

    it("should allow new waitForResponse after resolve", async () => {
      const requestId = "reuse-request-1";

      // 1回目
      const promise1 = resolver.waitForResponse(requestId);
      resolver.resolveRequest({ requestId, approved: true });
      await promise1;

      // 2回目（同じ requestId）
      const promise2 = resolver.waitForResponse(requestId);
      expect(resolver.pendingCount).toBe(1);

      resolver.resolveRequest({ requestId, approved: false });
      const result = await promise2;
      expect(result.approved).toBe(false);
    });
  });

  describe("extreme timeout values", () => {
    it("should handle zero timeout", async () => {
      const zeroTimeoutResolver = new PermissionResolver(0);
      const requestId = "zero-timeout-1";

      const promise = zeroTimeoutResolver.waitForResponse(requestId);

      vi.advanceTimersByTime(0);

      await expect(promise).rejects.toThrow("timed out");
    });

    it("should handle very short timeout (1ms)", async () => {
      const shortResolver = new PermissionResolver(1);
      const requestId = "short-timeout-1";

      const promise = shortResolver.waitForResponse(requestId);

      vi.advanceTimersByTime(1);

      await expect(promise).rejects.toThrow("timed out");
    });
  });

  describe("concurrent requests", () => {
    it("should handle multiple concurrent requests", async () => {
      const requests = ["req-a", "req-b", "req-c", "req-d", "req-e"];
      const promises = requests.map((id) => resolver.waitForResponse(id));

      expect(resolver.pendingCount).toBe(5);

      // 順番に解決
      for (const id of requests) {
        resolver.resolveRequest({ requestId: id, approved: true });
      }

      const results = await Promise.all(promises);
      expect(results.every((r) => r.approved)).toBe(true);
      expect(resolver.pendingCount).toBe(0);
    });

    it("should cancel only specified requests", async () => {
      const promise1 = resolver.waitForResponse("keep-1");
      const promise2 = resolver.waitForResponse("cancel-1");
      const promise3 = resolver.waitForResponse("keep-2");

      expect(resolver.pendingCount).toBe(3);

      resolver.cancelRequest("cancel-1");

      await expect(promise2).rejects.toThrow("cancelled");
      expect(resolver.pendingCount).toBe(2);

      // 残りを解決
      resolver.resolveRequest({ requestId: "keep-1", approved: true });
      resolver.resolveRequest({ requestId: "keep-2", approved: true });

      await expect(promise1).resolves.toBeDefined();
      await expect(promise3).resolves.toBeDefined();
    });

    it("should resolve requests in any order", async () => {
      const promise1 = resolver.waitForResponse("order-1");
      const promise2 = resolver.waitForResponse("order-2");
      const promise3 = resolver.waitForResponse("order-3");

      // 順番を変えて解決
      resolver.resolveRequest({ requestId: "order-3", approved: true });
      resolver.resolveRequest({ requestId: "order-1", approved: false });
      resolver.resolveRequest({ requestId: "order-2", approved: true });

      const [r1, r2, r3] = await Promise.all([promise1, promise2, promise3]);

      expect(r1.approved).toBe(false);
      expect(r2.approved).toBe(true);
      expect(r3.approved).toBe(true);
    });
  });

  describe("extended memory management", () => {
    it("should not leak timers after resolve", async () => {
      const requestId = "timer-test-1";
      const promise = resolver.waitForResponse(requestId);

      resolver.resolveRequest({ requestId, approved: true });
      await promise;

      // タイムアウト時間経過後もエラーにならない
      vi.advanceTimersByTime(300000);
      expect(resolver.pendingCount).toBe(0);
    });

    it("should not leak timers after cancel", async () => {
      const requestId = "timer-test-2";
      const promise = resolver.waitForResponse(requestId);

      resolver.cancelRequest(requestId);
      await expect(promise).rejects.toThrow("cancelled");

      // タイムアウト時間経過後も追加エラーにならない
      vi.advanceTimersByTime(300000);
      expect(resolver.pendingCount).toBe(0);
    });

    it("should handle many requests without leaking", async () => {
      const requestCount = 100;
      const promises: Promise<SkillPermissionResponse>[] = [];

      // 多数のリクエストを作成
      for (let i = 0; i < requestCount; i++) {
        promises.push(resolver.waitForResponse(`batch-${i}`));
      }

      expect(resolver.pendingCount).toBe(requestCount);

      // 全てキャンセル
      resolver.cancelAll();

      // 全Promiseのrejectを待機（Unhandled Rejection防止）
      for (const p of promises) {
        await expect(p).rejects.toThrow("cancelled");
      }

      expect(resolver.pendingCount).toBe(0);
    });
  });

  describe("AbortSignal edge cases", () => {
    it("should handle already aborted signal", async () => {
      const controller = new AbortController();
      controller.abort(); // 事前に abort

      const promise = resolver.waitForResponse("pre-abort", controller.signal);

      await expect(promise).rejects.toThrow("aborted");
    });

    it("should not affect other requests when one is aborted", async () => {
      const controller = new AbortController();

      const promise1 = resolver.waitForResponse(
        "abort-test-1",
        controller.signal,
      );
      const promise2 = resolver.waitForResponse("abort-test-2");

      controller.abort();

      await expect(promise1).rejects.toThrow("aborted");
      expect(resolver.pendingCount).toBe(1);

      resolver.resolveRequest({ requestId: "abort-test-2", approved: true });
      await expect(promise2).resolves.toBeDefined();
    });

    it("should handle multiple requests with same AbortController", async () => {
      const controller = new AbortController();

      const promise1 = resolver.waitForResponse(
        "multi-abort-1",
        controller.signal,
      );
      const promise2 = resolver.waitForResponse(
        "multi-abort-2",
        controller.signal,
      );

      controller.abort();

      await expect(promise1).rejects.toThrow("aborted");
      await expect(promise2).rejects.toThrow("aborted");
      expect(resolver.pendingCount).toBe(0);
    });
  });
});
