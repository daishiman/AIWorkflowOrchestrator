/**
 * registerNotificationHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-NOTIFICATION-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-NOTIFICATION-01: 重複チャンネルが存在しない
 * REG-COUNT-NOTIFICATION-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-NOTIFICATION-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-NOTIFICATION-03: 各テストで handles が独立している
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NotificationService } from "../notificationHandlers";

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

vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  })),
}));

vi.mock("../../infrastructure/security/ipc-validator", () => ({
  IPC_ERROR_CODES: { UNAUTHORIZED: "UNAUTHORIZED" },
  toIPCValidationError: vi.fn(),
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
}));

vi.mock("../sanitizeErrorMessage", () => ({
  sanitizeErrorMessage: vi.fn((msg: unknown) => String(msg)),
}));

const mockNotificationService: NotificationService = {
  getHistory: vi.fn().mockResolvedValue({ notifications: [], totalCount: 0 }),
  markRead: vi.fn().mockResolvedValue({ updated: false }),
  markAllRead: vi.fn().mockResolvedValue({ updatedCount: 0 }),
  delete: vi.fn().mockResolvedValue({ deleted: false }),
  clear: vi.fn().mockResolvedValue({ deletedCount: 0 }),
};

describe("registerNotificationHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-NOTIFICATION-01〜REG-COUNT-NOTIFICATION-01: 正常系", () => {
    beforeEach(async () => {
      const { registerNotificationHandlers } =
        await import("../notificationHandlers");
      registerNotificationHandlers(mockNotificationService, {});
    });

    it("REG-SNAP-NOTIFICATION-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-NOTIFICATION-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-NOTIFICATION-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(5);
    });
  });

  describe("REG-EDGE-NOTIFICATION-01〜REG-EDGE-NOTIFICATION-03: 境界値・異常系", () => {
    it("REG-EDGE-NOTIFICATION-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = [
        "notification:get-history",
        "notification:get-history",
        "notification:mark-read",
      ];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-NOTIFICATION-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
