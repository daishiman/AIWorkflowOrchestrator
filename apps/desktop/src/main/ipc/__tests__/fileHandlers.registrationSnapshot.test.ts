/**
 * registerFileHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-FILE-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-FILE-01: 重複チャンネルが存在しない
 * REG-COUNT-FILE-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-FILE-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-FILE-03: 各テストで handles が独立している
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

vi.mock("fs/promises", () => ({
  readdir: vi.fn().mockResolvedValue([]),
  readFile: vi.fn().mockResolvedValue(""),
  writeFile: vi.fn().mockResolvedValue(undefined),
  rename: vi.fn().mockResolvedValue(undefined),
  stat: vi.fn().mockResolvedValue({ size: 0, mtime: new Date() }),
  access: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../services/watcher", () => ({
  FileWatcher: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    start: vi.fn(),
    stop: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe("registerFileHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-FILE-01〜REG-COUNT-FILE-01: 正常系", () => {
    beforeEach(async () => {
      const { registerFileHandlers } = await import("../fileHandlers");
      registerFileHandlers();
    });

    it("REG-SNAP-FILE-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-FILE-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-FILE-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(6);
    });
  });

  describe("REG-EDGE-FILE-01〜REG-EDGE-FILE-03: 境界値・異常系", () => {
    it("REG-EDGE-FILE-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = ["file:get-tree", "file:get-tree", "file:read"];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-FILE-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
