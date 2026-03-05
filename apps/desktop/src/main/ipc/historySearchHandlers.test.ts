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
  registerHistorySearchHandlers,
  type HistorySearchService,
} from "./historySearchHandlers";
import { IPC_CHANNELS } from "../../preload/channels";

describe("historySearchHandlers", () => {
  const validEvent = {};

  let mockValidateSender: ReturnType<typeof vi.fn>;

  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;
  let service: HistorySearchService;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();
    service = {
      search: vi.fn(async () => ({
        items: [
          {
            id: "h-1",
            sourceType: "chat",
            summary: "Agent conversation",
            timestamp: "2026-03-05T10:00:00.000Z",
            metadata: {},
          },
        ],
        totalCount: 1,
        hasMore: false,
      })),
      getStats: vi.fn(async () => ({
        chat: 1,
        file: 0,
        skill: 0,
        total: 1,
      })),
    };

    mockValidateSender = vi.fn().mockReturnValue({ valid: true });

    handleMock.mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    registerHistorySearchHandlers(service, {
      validateSender: mockValidateSender,
    });
  });

  it("history:search が検索結果を返す", async () => {
    const handler = handlers.get(IPC_CHANNELS.HISTORY_SEARCH);

    const result = (await handler!(validEvent, {
      query: "agent",
      filter: "all",
      limit: 30,
      offset: 0,
    })) as {
      success: boolean;
      data?: { items: Array<{ id: string }>; totalCount: number };
    };

    expect(result.success).toBe(true);
    expect(result.data?.items).toHaveLength(1);
    expect(result.data?.items[0].id).toBe("h-1");
    expect(result.data?.totalCount).toBe(1);
  });

  it("history:search はquery型不正を検証エラーにする", async () => {
    const handler = handlers.get(IPC_CHANNELS.HISTORY_SEARCH);
    const result = (await handler!(validEvent, {
      query: 123,
      filter: "all",
      limit: 30,
      offset: 0,
    })) as {
      success: boolean;
      error?: { code: string };
    };

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("history:get-stats が集計を返す", async () => {
    const handler = handlers.get(IPC_CHANNELS.HISTORY_GET_STATS);
    const result = (await handler!(validEvent)) as {
      success: boolean;
      data?: { total: number; chat: number };
    };

    expect(result.success).toBe(true);
    expect(result.data?.total).toBe(1);
    expect(result.data?.chat).toBe(1);
  });

  it("無効なsenderを拒否する", async () => {
    const handler = handlers.get(IPC_CHANNELS.HISTORY_SEARCH);
    mockValidateSender.mockReturnValueOnce({
      valid: false,
      errorCode: "INVALID_SENDER",
      errorMessage: "invalid sender",
    });

    const result = (await handler!(validEvent, {
      query: "agent",
      filter: "all",
      limit: 30,
      offset: 0,
    })) as {
      success: boolean;
      error?: { code: string };
    };

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INVALID_SENDER");
  });
});
