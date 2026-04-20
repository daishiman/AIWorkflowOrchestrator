/**
 * registerHistoryHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-HISTORY-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-HISTORY-01: 重複チャンネルが存在しない
 * REG-COUNT-HISTORY-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-HISTORY-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-HISTORY-03: 各テストで handles が独立している
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrowserWindow } from "electron";
import type { HistoryService } from "../historyHandlers";

const { mockIpcMainHandle, mockIpcMainOn } = vi.hoisted(() => ({
  mockIpcMainHandle: vi.fn(),
  mockIpcMainOn: vi.fn().mockReturnValue({ removeAllListeners: vi.fn() }),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: mockIpcMainHandle,
    removeHandler: vi.fn(),
    on: mockIpcMainOn,
    removeAllListeners: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));

const mockMainWindow = {
  isDestroyed: () => false,
  webContents: { send: vi.fn() },
} as unknown as BrowserWindow;

const mockHistoryService: HistoryService = {
  getFileHistory: vi
    .fn()
    .mockResolvedValue({ items: [], totalCount: 0, hasMore: false }),
  getVersionDetail: vi.fn().mockResolvedValue(null),
  getConversionLogs: vi
    .fn()
    .mockResolvedValue({ items: [], totalCount: 0, hasMore: false }),
  restoreVersion: vi.fn().mockResolvedValue(null),
};

describe("registerHistoryHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-HISTORY-01〜REG-COUNT-HISTORY-01: 正常系", () => {
    beforeEach(async () => {
      const { registerHistoryHandlers } = await import("../historyHandlers");
      registerHistoryHandlers(mockMainWindow, mockHistoryService);
    });

    it("REG-SNAP-HISTORY-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-HISTORY-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-HISTORY-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(4);
    });
  });

  describe("REG-EDGE-HISTORY-01〜REG-EDGE-HISTORY-03: 境界値・異常系", () => {
    it("REG-EDGE-HISTORY-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = [
        "history:getFileHistory",
        "history:getFileHistory",
        "history:getVersionDetail",
      ];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-HISTORY-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
