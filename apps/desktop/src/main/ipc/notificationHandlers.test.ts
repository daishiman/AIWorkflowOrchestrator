import { beforeEach, describe, expect, it, vi } from "vitest";
const { handleMock } = vi.hoisted(() => ({
  handleMock: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: handleMock,
  },
}));

import {
  registerNotificationHandlers,
  type NotificationService,
} from "./notificationHandlers";
import { IPC_CHANNELS } from "../../preload/channels";

describe("notificationHandlers", () => {
  const validEvent = {};

  let mockValidateSender: ReturnType<typeof vi.fn>;

  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;
  let service: NotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    service = {
      getHistory: vi.fn(async () => ({
        notifications: [
          {
            id: "n-1",
            type: "info",
            title: "title",
            timestamp: "2026-03-05T10:00:00.000Z",
            isRead: false,
            source: { kind: "system" },
          },
        ],
        totalCount: 1,
      })),
      markRead: vi.fn(async () => ({ updated: true })),
      markAllRead: vi.fn(async () => ({ updatedCount: 1 })),
      delete: vi.fn(async () => ({ deleted: true })),
      clear: vi.fn(async () => ({ deletedCount: 1 })),
    };

    mockValidateSender = vi.fn().mockReturnValue({ valid: true });

    handleMock.mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    registerNotificationHandlers(service, {
      validateSender: mockValidateSender,
    });
  });

  it("notification:get-history が履歴を返す", async () => {
    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_GET_HISTORY);

    expect(handler).toBeDefined();
    const result = (await handler!(validEvent, {
      limit: 10,
      offset: 0,
    })) as {
      success: boolean;
      data?: { notifications: unknown[]; totalCount: number };
    };

    expect(result.success).toBe(true);
    expect(result.data?.notifications).toHaveLength(1);
    expect(result.data?.totalCount).toBe(1);
  });

  it("notification:mark-read はnotificationId未指定を検証エラーにする", async () => {
    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_MARK_READ);

    const result = (await handler!(validEvent, {})) as {
      success: boolean;
      error?: { code: string };
    };

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("notification:mark-read は更新結果を返す", async () => {
    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_MARK_READ);

    const result = (await handler!(validEvent, {
      notificationId: "n-1",
    })) as {
      success: boolean;
      data?: { updated: boolean };
    };

    expect(result.success).toBe(true);
    expect(result.data?.updated).toBe(true);
  });

  it("notification:delete はnotificationId未指定を検証エラーにする", async () => {
    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_DELETE);

    const result = (await handler!(validEvent, {})) as {
      success: boolean;
      error?: { code: string };
    };

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("notification:delete は削除結果を返す", async () => {
    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_DELETE);

    const result = (await handler!(validEvent, {
      notificationId: "n-1",
    })) as {
      success: boolean;
      data?: { deleted: boolean };
    };

    expect(result.success).toBe(true);
    expect(result.data?.deleted).toBe(true);
  });

  it("notification:clear が削除件数を返す", async () => {
    const clearHandler = handlers.get(IPC_CHANNELS.NOTIFICATION_CLEAR);
    const clearResult = (await clearHandler!(validEvent)) as {
      success: boolean;
      data?: { deletedCount?: number };
    };

    expect(clearResult.success).toBe(true);
    expect(clearResult.data?.deletedCount).toBe(1);
  });

  it("無効なsenderを拒否する", async () => {
    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_GET_HISTORY);
    mockValidateSender.mockReturnValueOnce({
      valid: false,
      errorCode: "INVALID_SENDER",
      errorMessage: "invalid sender",
    });
    const result = (await handler!(validEvent, {})) as {
      success: boolean;
      error?: { code: string };
    };

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INVALID_SENDER");
  });
});
