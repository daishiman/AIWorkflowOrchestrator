/**
 * registerDashboardHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-DASHBOARD-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-DASHBOARD-01: 重複チャンネルが存在しない
 * REG-COUNT-DASHBOARD-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-DASHBOARD-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-DASHBOARD-03: 各テストで handles が独立している
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

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
}));

describe("registerDashboardHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-DASHBOARD-01〜REG-COUNT-DASHBOARD-01: 正常系", () => {
    beforeEach(async () => {
      const { registerDashboardHandlers } =
        await import("../dashboardHandlers");
      registerDashboardHandlers();
    });

    it("REG-SNAP-DASHBOARD-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-DASHBOARD-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-DASHBOARD-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(2);
    });
  });

  describe("REG-EDGE-DASHBOARD-01〜REG-EDGE-DASHBOARD-03: 境界値・異常系", () => {
    it("REG-EDGE-DASHBOARD-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = [
        "dashboard:get-stats",
        "dashboard:get-stats",
        "dashboard:get-activity",
      ];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-DASHBOARD-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
