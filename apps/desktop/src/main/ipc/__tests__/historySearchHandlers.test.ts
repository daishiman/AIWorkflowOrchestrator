vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import { registerHistorySearchHandlers } from "../historySearchHandlers";

describe("historySearchHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;
  let mockValidateSender: ReturnType<typeof vi.fn>;

  const mockService = {
    search: vi.fn(),
    getStats: vi.fn(),
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

    mockService.search.mockResolvedValue({
      items: [],
      totalCount: 0,
      hasMore: false,
    });
    mockService.getStats.mockResolvedValue({
      chat: 0,
      file: 0,
      skill: 0,
      total: 0,
    });

    registerHistorySearchHandlers(mockService, {
      validateSender: mockValidateSender,
    });
  });

  it("history searchチャネルを登録する", () => {
    expect(handlers.has(IPC_CHANNELS.HISTORY_SEARCH)).toBe(true);
    expect(handlers.has(IPC_CHANNELS.HISTORY_GET_STATS)).toBe(true);
  });

  it("history:searchでサービス検索を呼ぶ", async () => {
    const handler = handlers.get(IPC_CHANNELS.HISTORY_SEARCH)!;

    const result = await handler(
      {},
      {
        query: "react",
        filter: "all",
        limit: 30,
        offset: 0,
      },
    );

    expect(mockService.search).toHaveBeenCalledWith({
      query: "react",
      filter: "all",
      limit: 30,
      offset: 0,
    });
    expect(result).toEqual({
      success: true,
      data: {
        items: [],
        totalCount: 0,
        hasMore: false,
      },
    });
  });

  it("history:searchでP42の3段バリデーションを行う", async () => {
    const handler = handlers.get(IPC_CHANNELS.HISTORY_SEARCH)!;

    const result1 = (await handler(
      {},
      {
        query: 123,
        filter: "all",
        limit: 30,
        offset: 0,
      },
    )) as { success: boolean; error?: { code: string } };
    expect(result1.success).toBe(false);
    expect(result1.error?.code).toBe("VALIDATION_ERROR");

    const result2 = (await handler(
      {},
      {
        query: "",
        filter: "all",
        limit: 30,
        offset: 0,
      },
    )) as { success: boolean; error?: { code: string } };
    expect(result2.success).toBe(true);

    const result3 = (await handler(
      {},
      {
        query: "   ",
        filter: "all",
        limit: 30,
        offset: 0,
      },
    )) as { success: boolean; error?: { code: string } };
    expect(result3.success).toBe(true);
  });

  it("history:searchでtrim後のqueryをサービスへ渡す", async () => {
    const handler = handlers.get(IPC_CHANNELS.HISTORY_SEARCH)!;

    await handler(
      {},
      {
        query: "  react hooks  ",
        filter: "all",
        limit: 30,
        offset: 0,
      },
    );

    expect(mockService.search).toHaveBeenCalledWith({
      query: "react hooks",
      filter: "all",
      limit: 30,
      offset: 0,
    });
  });

  it("history:get-statsを返す", async () => {
    const handler = handlers.get(IPC_CHANNELS.HISTORY_GET_STATS)!;

    const result = await handler({});

    expect(mockService.getStats).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: true,
      data: { chat: 0, file: 0, skill: 0, total: 0 },
    });
  });

  it("sender検証で拒否された場合はエラーを返す", async () => {
    const handler = handlers.get(IPC_CHANNELS.HISTORY_SEARCH)!;
    mockValidateSender.mockReturnValueOnce({
      valid: false,
      errorCode: "IPC_FORBIDDEN",
      errorMessage: "forbidden",
    });

    const result = (await handler(
      {},
      {
        query: "react",
        filter: "all",
        limit: 30,
        offset: 0,
      },
    )) as { success: boolean; error?: { code: string } };

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("IPC_FORBIDDEN");
    expect(mockService.search).not.toHaveBeenCalled();
  });
});
