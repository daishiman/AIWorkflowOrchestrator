import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

const { handleMock } = vi.hoisted(() => ({
  handleMock: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: handleMock,
  },
}));

import {
  createInMemoryNotificationService,
  registerNotificationHandlers,
} from "./notificationHandlers";
import { IPC_CHANNELS } from "../../preload/channels";

describe("notificationHandlers", () => {
  const sender = {
    isDestroyed: () => false,
    send: vi.fn(),
  };

  const mainWindow = {
    webContents: sender,
    isDestroyed: () => false,
  } as unknown as BrowserWindowType;

  const validEvent = {
    sender,
    senderFrame: {
      url: "file://renderer/index.html",
    },
  };

  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    handleMock.mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );
  });

  it("notification:get-history が履歴を返す", async () => {
    const service = createInMemoryNotificationService([
      {
        id: "n-1",
        type: "info",
        source: { kind: "system" },
        payload: { title: "title", message: "message" },
        createdAt: "2026-03-05T10:00:00.000Z",
        readAt: null,
      },
    ]);

    registerNotificationHandlers(mainWindow, service);
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

  it("更新系チャネルは未認証の場合に拒否される", async () => {
    const service = createInMemoryNotificationService();

    registerNotificationHandlers(mainWindow, service, {
      isAuthenticated: () => false,
    });

    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_MARK_READ);
    const result = (await handler!(validEvent, {
      id: "n-1",
    })) as {
      success: boolean;
      error?: { code: string };
    };

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("AUTH_REQUIRED");
  });

  it("notification:mark-read はID未指定を検証エラーにする", async () => {
    const service = createInMemoryNotificationService();
    registerNotificationHandlers(mainWindow, service);

    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_MARK_READ);
    const result = (await handler!(validEvent, {})) as {
      success: boolean;
      error?: { code: string };
    };

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("notification:clear onlyRead が既読のみ削除する", async () => {
    const service = createInMemoryNotificationService([
      {
        id: "unread-1",
        type: "info",
        source: { kind: "system" },
        payload: { title: "title", message: "message" },
        createdAt: "2026-03-05T10:00:00.000Z",
        readAt: null,
      },
      {
        id: "read-1",
        type: "info",
        source: { kind: "system" },
        payload: { title: "title", message: "message" },
        createdAt: "2026-03-05T11:00:00.000Z",
        readAt: "2026-03-05T11:01:00.000Z",
      },
    ]);

    registerNotificationHandlers(mainWindow, service);
    const clearHandler = handlers.get(IPC_CHANNELS.NOTIFICATION_CLEAR);
    const clearResult = (await clearHandler!(validEvent, {
      onlyRead: true,
    })) as {
      success: boolean;
      data?: { removedCount?: number };
    };

    expect(clearResult.success).toBe(true);
    expect(clearResult.data?.removedCount).toBe(1);

    const getHandler = handlers.get(IPC_CHANNELS.NOTIFICATION_GET_HISTORY);
    const historyResult = (await getHandler!(validEvent, {
      limit: 10,
      offset: 0,
    })) as {
      success: boolean;
      data?: { totalCount: number };
    };

    expect(historyResult.success).toBe(true);
    expect(historyResult.data?.totalCount).toBe(1);
  });

  it("無効なsenderを拒否する", async () => {
    const service = createInMemoryNotificationService();
    registerNotificationHandlers(mainWindow, service);

    const invalidEvent = {
      sender: {
        isDestroyed: () => false,
      },
      senderFrame: {
        url: "https://malicious.example.com",
      },
    };

    const handler = handlers.get(IPC_CHANNELS.NOTIFICATION_GET_HISTORY);
    const result = (await handler!(invalidEvent, {})) as {
      success: boolean;
      error?: { code: string };
    };

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INVALID_SENDER");
  });
});
