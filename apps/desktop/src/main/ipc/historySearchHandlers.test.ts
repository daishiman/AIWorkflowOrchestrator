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
  createInMemoryHistorySearchService,
  registerHistorySearchHandlers,
} from "./historySearchHandlers";
import { IPC_CHANNELS } from "../../preload/channels";

describe("historySearchHandlers", () => {
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

  it("history:search が検索結果を返す", async () => {
    const service = createInMemoryHistorySearchService([
      {
        id: "h-1",
        type: "conversation",
        title: "Agent conversation",
        snippet: "agent output",
        createdAt: "2026-03-05T10:00:00.000Z",
      },
      {
        id: "h-2",
        type: "execution",
        title: "Skill execution",
        snippet: "execution summary",
        createdAt: "2026-03-05T11:00:00.000Z",
      },
    ]);

    registerHistorySearchHandlers(mainWindow, service);
    const handler = handlers.get(IPC_CHANNELS.HISTORY_SEARCH);

    const result = (await handler!(validEvent, {
      query: "agent",
      page: 1,
      pageSize: 10,
    })) as {
      success: boolean;
      data?: { results: Array<{ id: string }>; pagination: { total: number } };
    };

    expect(result.success).toBe(true);
    expect(result.data?.results).toHaveLength(1);
    expect(result.data?.results[0].id).toBe("h-1");
    expect(result.data?.pagination.total).toBe(1);
  });

  it("history:search は空queryを検証エラーにする", async () => {
    const service = createInMemoryHistorySearchService();
    registerHistorySearchHandlers(mainWindow, service);

    const handler = handlers.get(IPC_CHANNELS.HISTORY_SEARCH);
    const result = (await handler!(validEvent, {
      query: "   ",
      page: 1,
      pageSize: 10,
    })) as {
      success: boolean;
      error?: { code: string };
    };

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("history:get-stats が集計を返す", async () => {
    const service = createInMemoryHistorySearchService([
      {
        id: "h-1",
        type: "conversation",
        title: "Conversation",
        snippet: "snippet",
        createdAt: "2026-03-05T10:00:00.000Z",
      },
      {
        id: "h-2",
        type: "notification",
        title: "Notification",
        snippet: "snippet",
        createdAt: "2026-03-05T11:00:00.000Z",
      },
    ]);

    registerHistorySearchHandlers(mainWindow, service);
    const handler = handlers.get(IPC_CHANNELS.HISTORY_GET_STATS);
    const result = (await handler!(validEvent)) as {
      success: boolean;
      data?: { totalCount: number; unreadNotificationCount: number };
    };

    expect(result.success).toBe(true);
    expect(result.data?.totalCount).toBe(2);
    expect(result.data?.unreadNotificationCount).toBe(1);
  });

  it("無効なsenderを拒否する", async () => {
    const service = createInMemoryHistorySearchService();
    registerHistorySearchHandlers(mainWindow, service);

    const invalidEvent = {
      sender: {
        isDestroyed: () => false,
      },
      senderFrame: {
        url: "https://malicious.example.com",
      },
    };

    const handler = handlers.get(IPC_CHANNELS.HISTORY_SEARCH);
    const result = (await handler!(invalidEvent, {
      query: "agent",
      page: 1,
      pageSize: 10,
    })) as {
      success: boolean;
      error?: { code: string };
    };

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INVALID_SENDER");
  });
});
