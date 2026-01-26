/**
 * @file permission-integration.test.ts
 * @description 権限確認IPC統合テスト
 * @phase Phase 5: 実装（TDD: Green）
 * @task TASK-4-2-permission-resolver-ipc-handlers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from "electron";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";
import { PermissionResolver } from "../main/services/skill/PermissionResolver";
import { IPC_CHANNELS } from "../preload/channels";

// Electron モック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

// permission-handlers モジュールをインポート
import {
  registerPermissionHandlers,
  createPermissionRequestForwarder,
} from "../main/ipc/permission-handlers";

describe("Permission IPC Integration", () => {
  let mockWindow: BrowserWindow;
  let permissionResolver: PermissionResolver;

  beforeEach(() => {
    vi.clearAllMocks();

    mockWindow = {
      webContents: {
        send: vi.fn(),
        id: 1,
      },
      isDestroyed: vi.fn().mockReturnValue(false),
    } as unknown as BrowserWindow;

    permissionResolver = new PermissionResolver(5000);
  });

  afterEach(() => {
    vi.clearAllMocks();
    permissionResolver.cancelAll();
  });

  describe("TC-42-001: 権限確認リクエスト送信", () => {
    it("should send request to Renderer via IPC", () => {
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: { command: "ls -la" },
        reason: "ディレクトリ内容を確認",
      };

      const forwarder = createPermissionRequestForwarder(mockWindow);
      forwarder(request);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
        request,
      );
    });
  });

  describe("TC-42-002: 権限確認レスポンス受信", () => {
    it("should receive response from Renderer via IPC", async () => {
      const response: SkillPermissionResponse = {
        requestId: "req-456",
        approved: true,
      };

      registerPermissionHandlers(mockWindow, permissionResolver);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      const mockEvent = {
        sender: mockWindow.webContents,
      } as IpcMainInvokeEvent;

      const result = await handler(mockEvent, response);

      expect(result).toEqual({ success: true });
    });
  });

  describe("TC-42-003: allow判断", () => {
    it("should resolve waitForResponse with approved=true", async () => {
      const requestId = "req-allow-test";

      // 応答を待機するPromiseを開始
      const promise = permissionResolver.waitForResponse(requestId);

      // 許可応答をシミュレート
      permissionResolver.resolveRequest({
        requestId,
        approved: true,
      });

      const result = await promise;
      expect(result.approved).toBe(true);
    });
  });

  describe("TC-42-004: deny判断", () => {
    it("should resolve waitForResponse with approved=false", async () => {
      const requestId = "req-deny-test";

      // 応答を待機するPromiseを開始
      const promise = permissionResolver.waitForResponse(requestId);

      // 拒否応答をシミュレート
      permissionResolver.resolveRequest({
        requestId,
        approved: false,
      });

      const result = await promise;
      expect(result.approved).toBe(false);
    });
  });

  describe("TC-42-005: タイムアウト", () => {
    it("should reject with timeout error", async () => {
      vi.useFakeTimers();

      const shortTimeoutResolver = new PermissionResolver(100);
      const requestId = "req-timeout-test";

      const promise = shortTimeoutResolver.waitForResponse(requestId);

      vi.advanceTimersByTime(100);

      await expect(promise).rejects.toThrow(/timed out/);

      vi.useRealTimers();
    });

    it("should not reject before timeout", async () => {
      vi.useFakeTimers();

      const shortTimeoutResolver = new PermissionResolver(100);
      const requestId = "req-timeout-test-2";

      const promise = shortTimeoutResolver.waitForResponse(requestId);

      // タイムアウト直前で応答
      vi.advanceTimersByTime(50);
      shortTimeoutResolver.resolveRequest({
        requestId,
        approved: true,
      });

      const result = await promise;
      expect(result.approved).toBe(true);

      vi.useRealTimers();
    });
  });

  describe("TC-42-006: 複数リクエストの同時処理", () => {
    it("should handle multiple requests in order (FIFO)", async () => {
      const promise1 = permissionResolver.waitForResponse("req-1");
      const promise2 = permissionResolver.waitForResponse("req-2");
      const promise3 = permissionResolver.waitForResponse("req-3");

      // 順番に応答
      permissionResolver.resolveRequest({ requestId: "req-1", approved: true });
      permissionResolver.resolveRequest({
        requestId: "req-2",
        approved: false,
      });
      permissionResolver.resolveRequest({ requestId: "req-3", approved: true });

      const [r1, r2, r3] = await Promise.all([promise1, promise2, promise3]);

      expect(r1.approved).toBe(true);
      expect(r2.approved).toBe(false);
      expect(r3.approved).toBe(true);
    });

    it("should handle rapid sequential responses", async () => {
      const requests = Array.from({ length: 10 }, (_, i) => `req-rapid-${i}`);
      const promises = requests.map((requestId) =>
        permissionResolver.waitForResponse(requestId),
      );

      // 高速連続応答
      requests.forEach((requestId, i) => {
        permissionResolver.resolveRequest({
          requestId,
          approved: i % 2 === 0,
        });
      });

      const results = await Promise.all(promises);

      results.forEach((result, i) => {
        expect(result.approved).toBe(i % 2 === 0);
      });
    });
  });

  describe("TC-42-007: AbortSignalキャンセル", () => {
    it("should cancel request when signal is aborted", async () => {
      const controller = new AbortController();
      const requestId = "req-abort-test";

      const promise = permissionResolver.waitForResponse(
        requestId,
        controller.signal,
      );

      controller.abort();

      await expect(promise).rejects.toThrow(/aborted/);
    });

    it("should cleanup pending request on abort", async () => {
      const controller = new AbortController();
      const requestId = "req-abort-cleanup-test";

      const promise = permissionResolver.waitForResponse(
        requestId,
        controller.signal,
      );

      expect(permissionResolver.pendingCount).toBe(1);

      controller.abort();

      await expect(promise).rejects.toThrow();

      expect(permissionResolver.pendingCount).toBe(0);
    });
  });

  describe("TC-42-008: ウィンドウ破棄", () => {
    it("should handle window destruction gracefully", () => {
      (mockWindow.isDestroyed as ReturnType<typeof vi.fn>).mockReturnValue(
        true,
      );

      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: { command: "ls" },
      };

      const forwarder = createPermissionRequestForwarder(mockWindow);

      // エラーなく処理される
      expect(() => forwarder(request)).not.toThrow();

      // 送信はスキップされる
      expect(mockWindow.webContents.send).not.toHaveBeenCalled();
    });
  });

  describe("統合テスト拡充: Full flow tests", () => {
    it("should complete full allow flow end-to-end", async () => {
      const requestId = "flow-allow-test";

      // 1. 応答待機を開始
      const promise = permissionResolver.waitForResponse(requestId);

      // 2. 許可応答を送信
      permissionResolver.resolveRequest({
        requestId,
        approved: true,
      });

      // 3. 結果を確認
      const result = await promise;
      expect(result.approved).toBe(true);
      expect(result.requestId).toBe(requestId);
    });

    it("should complete full deny flow end-to-end", async () => {
      const requestId = "flow-deny-test";

      const promise = permissionResolver.waitForResponse(requestId);

      permissionResolver.resolveRequest({
        requestId,
        approved: false,
        rejectReason: "User explicitly denied",
      });

      const result = await promise;
      expect(result.approved).toBe(false);
      expect(result.rejectReason).toBe("User explicitly denied");
    });

    it("should handle request during existing request", async () => {
      const request1Id = "existing-req-1";
      const request2Id = "existing-req-2";

      // 2つのリクエストを同時に待機
      const promise1 = permissionResolver.waitForResponse(request1Id);
      const promise2 = permissionResolver.waitForResponse(request2Id);

      expect(permissionResolver.pendingCount).toBe(2);

      // 逆順で応答
      permissionResolver.resolveRequest({
        requestId: request2Id,
        approved: true,
      });

      permissionResolver.resolveRequest({
        requestId: request1Id,
        approved: false,
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.approved).toBe(false);
      expect(result2.approved).toBe(true);
      expect(permissionResolver.pendingCount).toBe(0);
    });

    it("should handle mixed timeout and success responses", async () => {
      vi.useFakeTimers();

      const shortTimeoutResolver = new PermissionResolver(100);

      const successPromise = shortTimeoutResolver.waitForResponse("success-id");
      const timeoutPromise = shortTimeoutResolver.waitForResponse("timeout-id");

      // 成功応答を送信
      shortTimeoutResolver.resolveRequest({
        requestId: "success-id",
        approved: true,
      });

      // タイムアウトを進める
      vi.advanceTimersByTime(100);

      const successResult = await successPromise;
      expect(successResult.approved).toBe(true);

      await expect(timeoutPromise).rejects.toThrow(/timed out/);

      vi.useRealTimers();
    });
  });

  describe("統合テスト拡充: Error recovery", () => {
    it("should recover from response for non-existent request", () => {
      // 存在しないリクエストへの応答は無視される
      expect(() => {
        permissionResolver.resolveRequest({
          requestId: "non-existent",
          approved: true,
        });
      }).not.toThrow();

      expect(permissionResolver.pendingCount).toBe(0);
    });

    it("should handle duplicate responses gracefully", async () => {
      const requestId = "duplicate-test";

      const promise = permissionResolver.waitForResponse(requestId);

      // 最初の応答
      permissionResolver.resolveRequest({
        requestId,
        approved: true,
      });

      // 2回目の応答（無視される）
      expect(() => {
        permissionResolver.resolveRequest({
          requestId,
          approved: false,
        });
      }).not.toThrow();

      const result = await promise;
      expect(result.approved).toBe(true); // 最初の応答が使用される
    });

    it("should handle cancelAll during pending requests", async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        permissionResolver.waitForResponse(`cancel-test-${i}`),
      );

      expect(permissionResolver.pendingCount).toBe(5);

      permissionResolver.cancelAll();

      expect(permissionResolver.pendingCount).toBe(0);

      // 全てのPromiseがrejectされる
      for (const promise of promises) {
        await expect(promise).rejects.toThrow(/cancelled/);
      }
    });
  });

  describe("統合テスト拡充: IPC Channel Coverage", () => {
    it("should use correct IPC channel for request forwarding", () => {
      const request: SkillPermissionRequest = {
        executionId: "channel-test",
        requestId: "channel-req",
        toolName: "ChannelTest",
        args: {},
      };

      const forwarder = createPermissionRequestForwarder(mockWindow);
      forwarder(request);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
        expect.anything(),
      );
    });

    it("should use correct IPC channel for response handling", async () => {
      registerPermissionHandlers(mockWindow, permissionResolver);

      const calls = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls;
      const registeredChannel = calls.find(
        (call: unknown[]) => call[0] === IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
      );

      expect(registeredChannel).toBeDefined();
    });
  });
});
