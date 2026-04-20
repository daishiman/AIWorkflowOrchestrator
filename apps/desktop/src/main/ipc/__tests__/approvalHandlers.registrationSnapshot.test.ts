/**
 * registerApprovalHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-APPROVAL-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-APPROVAL-01: 重複チャンネルが存在しない
 * REG-COUNT-APPROVAL-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-APPROVAL-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-APPROVAL-03: 各テストで handles が独立している
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
  BrowserWindow: vi.fn().mockImplementation(() => ({
    webContents: { send: vi.fn() },
    isDestroyed: vi.fn().mockReturnValue(false),
  })),
}));

describe("registerApprovalHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-APPROVAL-01〜REG-COUNT-APPROVAL-01: 正常系", () => {
    beforeEach(async () => {
      const mockMainWindow = {
        webContents: {
          send: vi.fn(),
          isDestroyed: vi.fn().mockReturnValue(false),
        },
        isDestroyed: vi.fn().mockReturnValue(false),
      };
      const mockApprovalGate = {
        grantApproval: vi.fn().mockReturnValue({ approved: true }),
        rejectApproval: vi.fn(),
      };
      const { registerApprovalHandlers } = await import("../approvalHandlers");
      registerApprovalHandlers(mockMainWindow as any, mockApprovalGate as any);
    });

    it("REG-SNAP-APPROVAL-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-APPROVAL-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-APPROVAL-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(1);
    });
  });

  describe("REG-EDGE-APPROVAL-01〜REG-EDGE-APPROVAL-03: 境界値・異常系", () => {
    it("REG-EDGE-APPROVAL-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = ["approval:respond", "approval:respond"];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(1);
    });

    it("REG-EDGE-APPROVAL-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
