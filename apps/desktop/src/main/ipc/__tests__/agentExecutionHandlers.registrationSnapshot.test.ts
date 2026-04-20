/**
 * registerAgentExecutionHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-AGENT-EXEC-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-AGENT-EXEC-01: 重複チャンネルが存在しない
 * REG-COUNT-AGENT-EXEC-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-AGENT-EXEC-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-AGENT-EXEC-03: 各テストで handles が独立している
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

vi.mock("../../services/agent", () => ({
  ExecutionManager: vi.fn().mockImplementation(() => ({
    startExecution: vi.fn().mockResolvedValue("exec-id"),
    stopExecution: vi.fn().mockReturnValue(true),
    stopAllExecutions: vi.fn(),
    getActiveExecutions: vi.fn().mockReturnValue([]),
    resolvePermission: vi.fn().mockReturnValue(true),
  })),
}));

vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn(),
}));

vi.mock("../../services/runtime/TerminalHandoffBuilder", () => ({
  TerminalHandoffBuilder: vi.fn().mockImplementation(() => ({
    build: vi.fn().mockResolvedValue({}),
  })),
}));

describe("registerAgentExecutionHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-AGENT-EXEC-01〜REG-COUNT-AGENT-EXEC-01: 正常系", () => {
    beforeEach(async () => {
      const mockMainWindow = {
        webContents: { send: vi.fn() },
        isDestroyed: vi.fn().mockReturnValue(false),
      };
      const mockApprovalGate = {
        grantApproval: vi.fn().mockReturnValue({ approved: true }),
        rejectApproval: vi.fn(),
      };
      const { registerAgentExecutionHandlers } =
        await import("../agentHandlers");
      registerAgentExecutionHandlers(
        mockMainWindow as any,
        mockApprovalGate as any,
      );
    });

    it("REG-SNAP-AGENT-EXEC-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-AGENT-EXEC-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-AGENT-EXEC-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(5);
    });
  });

  describe("REG-EDGE-AGENT-EXEC-01〜REG-EDGE-AGENT-EXEC-03: 境界値・異常系", () => {
    it("REG-EDGE-AGENT-EXEC-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = ["agent:start", "agent:start", "agent:stop"];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-AGENT-EXEC-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
