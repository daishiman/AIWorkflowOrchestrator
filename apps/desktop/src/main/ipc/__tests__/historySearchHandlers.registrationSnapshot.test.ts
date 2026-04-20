/**
 * registerHistorySearchHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-HISTORYSEARCH-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-HISTORYSEARCH-01: 重複チャンネルが存在しない
 * REG-COUNT-HISTORYSEARCH-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-HISTORYSEARCH-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-HISTORYSEARCH-03: 各テストで handles が独立している
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HistorySearchService } from "../historySearchHandlers";

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

vi.mock("../../infrastructure/security/ipc-validator", () => ({
  IPC_ERROR_CODES: { UNAUTHORIZED: "UNAUTHORIZED" },
  toIPCValidationError: vi.fn(),
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
}));

vi.mock("../sanitizeErrorMessage", () => ({
  sanitizeErrorMessage: vi.fn((msg: unknown) => String(msg)),
}));

const mockHistorySearchService: HistorySearchService = {
  search: vi
    .fn()
    .mockResolvedValue({ items: [], totalCount: 0, hasMore: false }),
  getStats: vi.fn().mockResolvedValue({ chat: 0, file: 0, skill: 0, total: 0 }),
};

describe("registerHistorySearchHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-HISTORYSEARCH-01〜REG-COUNT-HISTORYSEARCH-01: 正常系", () => {
    beforeEach(async () => {
      const { registerHistorySearchHandlers } =
        await import("../historySearchHandlers");
      registerHistorySearchHandlers(mockHistorySearchService, {});
    });

    it("REG-SNAP-HISTORYSEARCH-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-HISTORYSEARCH-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-HISTORYSEARCH-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(2);
    });
  });

  describe("REG-EDGE-HISTORYSEARCH-01〜REG-EDGE-HISTORYSEARCH-03: 境界値・異常系", () => {
    it("REG-EDGE-HISTORYSEARCH-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = [
        "history:search",
        "history:search",
        "history:search:stats",
      ];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-HISTORYSEARCH-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
