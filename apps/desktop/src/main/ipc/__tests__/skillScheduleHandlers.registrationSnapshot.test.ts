/**
 * registerSkillScheduleHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-SKILLSCHEDULE-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-SKILLSCHEDULE-01: 重複チャンネルが存在しない
 * REG-COUNT-SKILLSCHEDULE-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-SKILLSCHEDULE-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-SKILLSCHEDULE-03: 各テストで handles が独立している
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrowserWindow } from "electron";

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
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn(),
}));

const mockMainWindow = {
  isDestroyed: () => false,
  webContents: { send: vi.fn() },
} as unknown as BrowserWindow;

const mockSkillScheduler = {
  schedule: vi.fn(),
  cancel: vi.fn(),
  list: vi.fn().mockResolvedValue([]),
  get: vi.fn().mockResolvedValue(null),
};

const mockScheduleStore = {
  save: vi.fn(),
  delete: vi.fn(),
  list: vi.fn().mockResolvedValue([]),
  get: vi.fn().mockResolvedValue(null),
};

describe("registerSkillScheduleHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-SKILLSCHEDULE-01〜REG-COUNT-SKILLSCHEDULE-01: 正常系", () => {
    beforeEach(async () => {
      const { registerSkillScheduleHandlers } =
        await import("../skillHandlers");
      registerSkillScheduleHandlers(
        mockMainWindow,
        mockSkillScheduler as never,
        mockScheduleStore as never,
      );
    });

    it("REG-SNAP-SKILLSCHEDULE-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-SKILLSCHEDULE-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-SKILLSCHEDULE-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(5);
    });
  });

  describe("REG-EDGE-SKILLSCHEDULE-01〜REG-EDGE-SKILLSCHEDULE-03: 境界値・異常系", () => {
    it("REG-EDGE-SKILLSCHEDULE-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = [
        "skill:schedule:list",
        "skill:schedule:list",
        "skill:schedule:create",
      ];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-SKILLSCHEDULE-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
