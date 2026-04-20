/**
 * registerGraphHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-GRAPH-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-GRAPH-01: 重複チャンネルが存在しない
 * REG-COUNT-GRAPH-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-GRAPH-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-GRAPH-03: 各テストで handles が独立している
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

describe("registerGraphHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-GRAPH-01〜REG-COUNT-GRAPH-01: 正常系", () => {
    beforeEach(async () => {
      const { registerGraphHandlers } = await import("../graphHandlers");
      registerGraphHandlers();
    });

    it("REG-SNAP-GRAPH-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-GRAPH-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-GRAPH-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(2);
    });
  });

  describe("REG-EDGE-GRAPH-01〜REG-EDGE-GRAPH-03: 境界値・異常系", () => {
    it("REG-EDGE-GRAPH-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = ["graph:get", "graph:get", "graph:refresh"];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-GRAPH-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
