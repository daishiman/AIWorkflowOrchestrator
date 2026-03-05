vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import { registerNotificationHandlers } from "../notificationHandlers";

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
});
