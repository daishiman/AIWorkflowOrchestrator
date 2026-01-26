/**
 * @file permission-handlers.test.ts
 * @description IPC Permission Handlers ユニットテスト
 * @phase Phase 5: 実装（TDD: Green）
 * @task TASK-4-2-permission-resolver-ipc-handlers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from "electron";
import type { PermissionResolver } from "../../services/skill/PermissionResolver";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";
import { IPC_CHANNELS } from "../../../preload/channels";

// モック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

// permission-handlers モジュールをインポート
import {
  registerPermissionHandlers,
  unregisterPermissionHandlers,
  createPermissionRequestForwarder,
} from "../permission-handlers";

describe("permission-handlers", () => {
  let mockWindow: BrowserWindow;
  let mockResolver: PermissionResolver;

  beforeEach(() => {
    vi.clearAllMocks();

    mockWindow = {
      webContents: {
        send: vi.fn(),
        id: 1,
      },
      isDestroyed: vi.fn().mockReturnValue(false),
    } as unknown as BrowserWindow;

    mockResolver = {
      resolveRequest: vi.fn(),
      waitForResponse: vi.fn(),
      cancelRequest: vi.fn(),
      cancelAll: vi.fn(),
      pendingCount: 0,
    } as unknown as PermissionResolver;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("registerPermissionHandlers", () => {
    it("should register skill:permission-response handler", () => {
      registerPermissionHandlers(mockWindow, mockResolver);
      expect(ipcMain.handle).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
        expect.any(Function),
      );
    });

    it("should call resolveRequest when response is received", async () => {
      registerPermissionHandlers(mockWindow, mockResolver);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      const mockEvent = {
        sender: mockWindow.webContents,
      } as IpcMainInvokeEvent;
      const response: SkillPermissionResponse = {
        requestId: "test-id",
        approved: true,
      };

      await handler(mockEvent, response);

      expect(mockResolver.resolveRequest).toHaveBeenCalledWith(response);
    });

    it("should validate sender from allowed window", async () => {
      registerPermissionHandlers(mockWindow, mockResolver);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      const mockEvent = {
        sender: mockWindow.webContents,
      } as IpcMainInvokeEvent;
      const response: SkillPermissionResponse = {
        requestId: "test-id",
        approved: true,
      };

      const result = await handler(mockEvent, response);

      expect(result).toEqual({ success: true });
    });

    it("should reject sender from unknown window", async () => {
      registerPermissionHandlers(mockWindow, mockResolver);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      const unknownWebContents = { id: 999 };
      const mockEvent = {
        sender: unknownWebContents,
      } as IpcMainInvokeEvent;
      const response: SkillPermissionResponse = {
        requestId: "test-id",
        approved: true,
      };

      const result = await handler(mockEvent, response);

      expect(result).toEqual({ success: false });
      expect(mockResolver.resolveRequest).not.toHaveBeenCalled();
    });
  });

  describe("unregisterPermissionHandlers", () => {
    it("should remove handler on unregister", () => {
      unregisterPermissionHandlers();
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
      );
    });
  });

  describe("createPermissionRequestForwarder", () => {
    it("should send request to renderer via IPC", () => {
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

    it("should skip if window is destroyed", () => {
      (mockWindow.isDestroyed as ReturnType<typeof vi.fn>).mockReturnValue(
        true,
      );

      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: {},
      };

      const forwarder = createPermissionRequestForwarder(mockWindow);
      forwarder(request);

      expect(mockWindow.webContents.send).not.toHaveBeenCalled();
    });

    it("should include all request fields", () => {
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: { command: "ls -la", timeout: 5000 },
        reason: "Test reason",
      };

      const forwarder = createPermissionRequestForwarder(mockWindow);
      forwarder(request);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
        expect.objectContaining({
          executionId: "exec-123",
          requestId: "req-456",
          toolName: "Bash",
          args: { command: "ls -la", timeout: 5000 },
          reason: "Test reason",
        }),
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty args in request", () => {
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: {},
      };

      const forwarder = createPermissionRequestForwarder(mockWindow);
      forwarder(request);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
        expect.objectContaining({
          args: {},
        }),
      );
    });

    it("should handle very long tool names", () => {
      const longToolName = "A".repeat(500);
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: longToolName,
        args: {},
      };

      const forwarder = createPermissionRequestForwarder(mockWindow);
      forwarder(request);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
        expect.objectContaining({
          toolName: longToolName,
        }),
      );
    });

    it("should handle large args object", () => {
      const largeArgs: Record<string, string> = {};
      for (let i = 0; i < 100; i++) {
        largeArgs[`key${i}`] = `value${i}`.repeat(100);
      }
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: largeArgs,
      };

      const forwarder = createPermissionRequestForwarder(mockWindow);
      forwarder(request);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
        expect.objectContaining({
          args: largeArgs,
        }),
      );
    });

    it("should handle response for unknown requestId", async () => {
      registerPermissionHandlers(mockWindow, mockResolver);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      const mockEvent = {
        sender: mockWindow.webContents,
      } as IpcMainInvokeEvent;
      const response: SkillPermissionResponse = {
        requestId: "unknown-id",
        approved: true,
      };

      const result = await handler(mockEvent, response);

      // ハンドラーは成功を返すが、resolverが存在しないIDを処理
      expect(result).toEqual({ success: true });
      expect(mockResolver.resolveRequest).toHaveBeenCalledWith(response);
    });

    it("should handle concurrent responses", async () => {
      registerPermissionHandlers(mockWindow, mockResolver);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      const mockEvent = {
        sender: mockWindow.webContents,
      } as IpcMainInvokeEvent;

      const responses = Array.from({ length: 10 }, (_, i) => ({
        requestId: `req-${i}`,
        approved: i % 2 === 0,
      }));

      // 同時に全てのレスポンスを送信
      const promises = responses.map((response) =>
        handler(mockEvent, response),
      );

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result).toEqual({ success: true });
      });
      expect(mockResolver.resolveRequest).toHaveBeenCalledTimes(10);
    });

    it("should handle response with rememberChoice option", async () => {
      registerPermissionHandlers(mockWindow, mockResolver);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      const mockEvent = {
        sender: mockWindow.webContents,
      } as IpcMainInvokeEvent;
      const response: SkillPermissionResponse = {
        requestId: "req-123",
        approved: true,
        rememberChoice: true,
      };

      await handler(mockEvent, response);

      expect(mockResolver.resolveRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          rememberChoice: true,
        }),
      );
    });

    it("should handle response with rejectReason", async () => {
      registerPermissionHandlers(mockWindow, mockResolver);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      const mockEvent = {
        sender: mockWindow.webContents,
      } as IpcMainInvokeEvent;
      const response: SkillPermissionResponse = {
        requestId: "req-123",
        approved: false,
        rejectReason: "User rejected for security reasons",
      };

      await handler(mockEvent, response);

      expect(mockResolver.resolveRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          rejectReason: "User rejected for security reasons",
        }),
      );
    });
  });
});
