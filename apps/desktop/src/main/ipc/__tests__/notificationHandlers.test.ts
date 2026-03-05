vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import {
  emitNotificationNew,
  registerNotificationHandlers,
} from "../notificationHandlers";

describe("notificationHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;
  let mockValidateSender: ReturnType<typeof vi.fn>;

  const mockService = {
    getHistory: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();
    mockValidateSender = vi.fn().mockReturnValue({ valid: true });

    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    mockService.getHistory.mockResolvedValue({
      notifications: [],
      totalCount: 0,
    });
    mockService.markRead.mockResolvedValue({ updated: true });
    mockService.markAllRead.mockResolvedValue({ updatedCount: 1 });
    mockService.clear.mockResolvedValue({ deletedCount: 1 });

    registerNotificationHandlers(mockService, {
      validateSender: mockValidateSender,
    });
  });

  it("notificationチャネルを登録する", () => {
    expect(handlers.has(IPC_CHANNELS.NOTIFICATION_GET_HISTORY)).toBe(true);
    expect(handlers.has(IPC_CHANNELS.NOTIFICATION_MARK_READ)).toBe(true);
    expect(handlers.has(IPC_CHANNELS.NOTIFICATION_MARK_ALL_READ)).toBe(true);
    expect(handlers.has(IPC_CHANNELS.NOTIFICATION_CLEAR)).toBe(true);
  });

  it("history取得を委譲する", async () => {
    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_GET_HISTORY)!;

    const result = await handler({}, { limit: 10, offset: 0 });

    expect(mockService.getHistory).toHaveBeenCalledWith({
      limit: 10,
      offset: 0,
    });
    expect(result).toEqual({
      success: true,
      data: { notifications: [], totalCount: 0 },
    });
  });

  it("sender検証で拒否された場合はエラーを返す", async () => {
    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_GET_HISTORY)!;
    mockValidateSender.mockReturnValueOnce({
      valid: false,
      errorCode: "IPC_FORBIDDEN",
      errorMessage: "forbidden",
    });

    const result = (await handler({}, { limit: 10, offset: 0 })) as {
      success: boolean;
      error?: { code: string; message: string };
    };

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("IPC_FORBIDDEN");
    expect(mockService.getHistory).not.toHaveBeenCalled();
  });

  it("mark-readでP42の3段バリデーションを行う", async () => {
    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_MARK_READ)!;

    const result1 = (await handler({}, { notificationId: 42 })) as {
      success: boolean;
      error?: { code: string; message: string };
    };
    expect(result1.success).toBe(false);
    expect(result1.error?.code).toBe("VALIDATION_ERROR");

    const result2 = (await handler({}, { notificationId: "" })) as {
      success: boolean;
      error?: { code: string; message: string };
    };
    expect(result2.success).toBe(false);
    expect(result2.error?.code).toBe("VALIDATION_ERROR");

    const result3 = (await handler({}, { notificationId: "   " })) as {
      success: boolean;
      error?: { code: string; message: string };
    };
    expect(result3.success).toBe(false);
    expect(result3.error?.code).toBe("VALIDATION_ERROR");
  });

  it("mark-all-readを委譲する", async () => {
    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_MARK_ALL_READ)!;

    const result = await handler({});

    expect(mockService.markAllRead).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: true,
      data: { updatedCount: 1 },
    });
  });

  it("clearを委譲する", async () => {
    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_CLEAR)!;

    const result = await handler({});

    expect(mockService.clear).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: true,
      data: { deletedCount: 1 },
    });
  });

  it("emitNotificationNewは正常時にイベント配信する", () => {
    const send = vi.fn();
    const mainWindow = {
      isDestroyed: () => false,
      webContents: {
        isDestroyed: () => false,
        send,
      },
    };

    const result = emitNotificationNew(mainWindow as never, {
      id: "n-1",
      type: "info",
      title: "hello",
      detail: "world",
      timestamp: "2026-03-05T12:00:00.000Z",
      isRead: false,
      source: { kind: "system" },
    });

    expect(result).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(IPC_CHANNELS.NOTIFICATION_NEW, {
      notification: {
        id: "n-1",
        type: "info",
        title: "hello",
        detail: "world",
        timestamp: "2026-03-05T12:00:00.000Z",
        isRead: false,
        source: { kind: "system" },
      },
    });
  });

  it("emitNotificationNewは破棄済みwindowで配信しない", () => {
    const send = vi.fn();
    const destroyedWindow = {
      isDestroyed: () => true,
      webContents: {
        isDestroyed: () => false,
        send,
      },
    };

    const result = emitNotificationNew(destroyedWindow as never, {
      id: "n-2",
      type: "warning",
      title: "blocked",
      timestamp: "2026-03-05T12:00:00.000Z",
      isRead: false,
      source: { kind: "system" },
    });

    expect(result).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });
});
