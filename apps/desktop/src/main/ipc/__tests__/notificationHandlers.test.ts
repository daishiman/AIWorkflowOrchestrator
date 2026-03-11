const { storeState, storeSetMock } = vi.hoisted(() => ({
  storeState: {
    notifications: [] as Array<Record<string, unknown>>,
  },
  storeSetMock: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn((key: string, fallback: unknown) => {
      if (key === "notifications") {
        return storeState.notifications;
      }
      return fallback;
    }),
    set: storeSetMock.mockImplementation((key: string, value: unknown) => {
      if (key === "notifications" && Array.isArray(value)) {
        storeState.notifications = value as Array<Record<string, unknown>>;
      }
    }),
  })),
}));

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import {
  createNotificationService,
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
    delete: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    storeState.notifications = [];
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
    mockService.delete.mockResolvedValue({ deleted: true });
    mockService.clear.mockResolvedValue({ deletedCount: 1 });

    registerNotificationHandlers(mockService, {
      validateSender: mockValidateSender,
    });
  });

  it("notificationチャネルを登録する", () => {
    expect(handlers.has(IPC_CHANNELS.NOTIFICATION_GET_HISTORY)).toBe(true);
    expect(handlers.has(IPC_CHANNELS.NOTIFICATION_MARK_READ)).toBe(true);
    expect(handlers.has(IPC_CHANNELS.NOTIFICATION_MARK_ALL_READ)).toBe(true);
    expect(handlers.has(IPC_CHANNELS.NOTIFICATION_DELETE)).toBe(true);
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

  it("deleteを委譲する", async () => {
    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_DELETE)!;

    const result = await handler({}, { notificationId: "n-1" });

    expect(mockService.delete).toHaveBeenCalledWith("n-1");
    expect(result).toEqual({
      success: true,
      data: { deleted: true },
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

  it("createNotificationServiceはlimit/offsetのfallbackで履歴を返す", async () => {
    storeState.notifications = [
      {
        id: "n-1",
        type: "info",
        title: "first",
        timestamp: "2026-03-05T12:00:00.000Z",
        isRead: false,
        source: { kind: "system" },
      },
      {
        id: "n-2",
        type: "warning",
        title: "second",
        timestamp: "2026-03-05T11:00:00.000Z",
        isRead: true,
        source: { kind: "system" },
      },
    ];

    const service = createNotificationService();
    const result = await service.getHistory({
      limit: Number.NaN,
      offset: -1,
    });

    expect(result.notifications).toHaveLength(2);
    expect(result.totalCount).toBe(2);
  });

  it("createNotificationServiceはmarkRead/markAllRead/delete/clearを永続状態へ反映する", async () => {
    storeState.notifications = [
      {
        id: "n-1",
        type: "info",
        title: "first",
        timestamp: "2026-03-05T12:00:00.000Z",
        isRead: false,
        source: { kind: "system" },
      },
      {
        id: "n-2",
        type: "warning",
        title: "second",
        timestamp: "2026-03-05T11:00:00.000Z",
        isRead: false,
        source: { kind: "system" },
      },
    ];

    const service = createNotificationService();

    await expect(service.markRead("n-1")).resolves.toEqual({ updated: true });
    expect(storeState.notifications[0].isRead).toBe(true);

    await expect(service.markAllRead()).resolves.toEqual({ updatedCount: 1 });
    expect(
      storeState.notifications.every((notification) => notification.isRead),
    ).toBe(true);

    await expect(service.delete("n-2")).resolves.toEqual({ deleted: true });
    expect(storeState.notifications).toHaveLength(1);

    await expect(service.clear()).resolves.toEqual({ deletedCount: 1 });
    expect(storeState.notifications).toHaveLength(0);
    expect(storeSetMock).toHaveBeenCalled();
  });

  it("createNotificationServiceは存在しないID削除でfalseを返す", async () => {
    storeState.notifications = [
      {
        id: "n-1",
        type: "info",
        title: "first",
        timestamp: "2026-03-05T12:00:00.000Z",
        isRead: false,
        source: { kind: "system" },
      },
    ];

    const service = createNotificationService();
    const result = await service.delete("unknown");

    expect(result).toEqual({ deleted: false });
    expect(storeState.notifications).toHaveLength(1);
  });

  it("emitNotificationNewは無効なtimestampを現在時刻へ正規化する", () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00.000Z"));

    const send = vi.fn();
    const mainWindow = {
      isDestroyed: () => false,
      webContents: {
        isDestroyed: () => false,
        send,
      },
    };

    emitNotificationNew(mainWindow as never, {
      id: "n-3",
      type: "info",
      title: "fallback",
      timestamp: "invalid",
      isRead: false,
      source: { kind: "system" },
    });

    expect(send).toHaveBeenCalledWith(IPC_CHANNELS.NOTIFICATION_NEW, {
      notification: {
        id: "n-3",
        type: "info",
        title: "fallback",
        timestamp: "2026-03-05T12:00:00.000Z",
        isRead: false,
        source: { kind: "system" },
      },
    });
  });
});
