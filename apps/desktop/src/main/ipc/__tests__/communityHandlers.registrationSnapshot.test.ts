/**
 * registerCommunityHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-COMMUNITY-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-COMMUNITY-01: 重複チャンネルが存在しない
 * REG-COUNT-COMMUNITY-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-COMMUNITY-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-COMMUNITY-03: 各テストで handles が独立している
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

describe("registerCommunityHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-COMMUNITY-01〜REG-COUNT-COMMUNITY-01: 正常系", () => {
    beforeEach(async () => {
      const { registerCommunityHandlers } =
        await import("../communityHandlers");
      registerCommunityHandlers();
    });

    it("REG-SNAP-COMMUNITY-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-COMMUNITY-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-COMMUNITY-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(6);
    });
  });

  describe("REG-EDGE-COMMUNITY-01〜REG-EDGE-COMMUNITY-03: 境界値・異常系", () => {
    it("REG-EDGE-COMMUNITY-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = [
        "community:get-all",
        "community:get-all",
        "community:get-by-level",
      ];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-COMMUNITY-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
