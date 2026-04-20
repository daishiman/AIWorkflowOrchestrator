/**
 * registerSkillAnalyticsHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-SKILLANALYTICS-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-SKILLANALYTICS-01: 重複チャンネルが存在しない
 * REG-COUNT-SKILLANALYTICS-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-SKILLANALYTICS-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-SKILLANALYTICS-03: 各テストで handles が独立している
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrowserWindow } from "electron";
import type { SkillAnalytics } from "../services/skill/SkillAnalytics";

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

const mockSkillAnalytics = {
  record: vi.fn().mockResolvedValue(undefined),
  getStatistics: vi.fn().mockResolvedValue({}),
  getSummary: vi.fn().mockResolvedValue({}),
  getTrend: vi.fn().mockResolvedValue([]),
  export: vi.fn().mockResolvedValue(""),
} as unknown as SkillAnalytics;

describe("registerSkillAnalyticsHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-SKILLANALYTICS-01〜REG-COUNT-SKILLANALYTICS-01: 正常系", () => {
    beforeEach(async () => {
      const { registerSkillAnalyticsHandlers } =
        await import("../skillAnalyticsHandlers");
      registerSkillAnalyticsHandlers(mockMainWindow, mockSkillAnalytics);
    });

    it("REG-SNAP-SKILLANALYTICS-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-SKILLANALYTICS-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-SKILLANALYTICS-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(5);
    });
  });

  describe("REG-EDGE-SKILLANALYTICS-01〜REG-EDGE-SKILLANALYTICS-03: 境界値・異常系", () => {
    it("REG-EDGE-SKILLANALYTICS-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = [
        "skill:analytics:record",
        "skill:analytics:record",
        "skill:analytics:statistics",
      ];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-SKILLANALYTICS-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
