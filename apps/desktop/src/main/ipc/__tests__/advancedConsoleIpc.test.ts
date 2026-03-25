/**
 * advancedConsoleIpc テスト
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 Phase 4
 * テストケース: ADV-12〜ADV-15
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from "electron";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

vi.mock("../../../preload/channels", async () => {
  const actual = await vi.importActual<
    typeof import("../../../preload/channels")
  >("../../../preload/channels");
  return actual;
});

import { registerAdvancedConsoleHandlers } from "../advancedConsoleHandlers";
import {
  ALLOWED_INVOKE_CHANNELS,
  IPC_CHANNELS,
} from "../../../preload/channels";

describe("advancedConsoleIpc", () => {
  let mockMainWindow: BrowserWindow;
  let terminalLogHandler: (
    event: IpcMainInvokeEvent,
    sessionId: unknown,
  ) => Promise<unknown>;
  let copyCommandHandler: (
    event: IpcMainInvokeEvent,
    sessionId: unknown,
  ) => Promise<unknown>;

  const mockGetTerminalLog = vi.fn();
  const mockGetCopyCommand = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    mockMainWindow = {
      webContents: { id: 1 },
      isDestroyed: vi.fn().mockReturnValue(false),
    } as unknown as BrowserWindow;

    registerAdvancedConsoleHandlers({
      mainWindow: mockMainWindow,
      getTerminalLog: mockGetTerminalLog,
      getCopyCommand: mockGetCopyCommand,
    });

    // handle が2回呼ばれる（terminal-log, copy-command）
    const calls = vi.mocked(ipcMain.handle).mock.calls;
    const terminalLogCall = calls.find(
      (c) => c[0] === IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG,
    );
    const copyCommandCall = calls.find(
      (c) => c[0] === IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND,
    );

    terminalLogHandler = terminalLogCall![1] as typeof terminalLogHandler;
    copyCommandHandler = copyCommandCall![1] as typeof copyCommandHandler;
  });

  // ADV-12: execution:get-terminal-log が raw output を返す
  it("ADV-12: get-terminal-log returns raw output array", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    const logs = ["$ claude -p 'test'", "Running...", "Done."];
    mockGetTerminalLog.mockResolvedValue(logs);

    const result = (await terminalLogHandler(event, "session-1")) as {
      success: boolean;
      data: string[];
    };
    expect(result.success).toBe(true);
    expect(result.data).toEqual(logs);
  });

  // ADV-13: execution:get-copy-command が API key を含まない (DENY-6)
  it("ADV-13: get-copy-command sanitizes API keys from output", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    // API key を含むコマンド
    const commandWithKey =
      'claude -p "test" --api-key sk-ant-abc123def456ghi789jkl012mno345pq';
    mockGetCopyCommand.mockResolvedValue(commandWithKey);

    const result = (await copyCommandHandler(event, "session-1")) as {
      success: boolean;
      data: string | null;
    };
    expect(result.success).toBe(true);
    expect(result.data).not.toContain("sk-ant-");
    expect(result.data).toContain("[REDACTED]");
  });

  // ADV-13b: terminal-log も API key を sanitize する
  it("ADV-13b: get-terminal-log sanitizes API keys from logs", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    const logsWithKey = [
      "Using key: sk-ant-abc123def456ghi789jkl012mno345pq",
      "Also sk-1234567890123456789012345 detected",
    ];
    mockGetTerminalLog.mockResolvedValue(logsWithKey);

    const result = (await terminalLogHandler(event, "session-1")) as {
      success: boolean;
      data: string[];
    };
    expect(result.success).toBe(true);
    for (const line of result.data) {
      expect(line).not.toMatch(/sk-ant-[a-zA-Z0-9_-]+/);
      expect(line).not.toMatch(/sk-[a-zA-Z0-9_-]{20,}/);
    }
  });

  // ADV-14: 新規 IPC channel が ALLOWED_INVOKE_CHANNELS に登録されている
  it("ADV-14: new IPC channels are registered in ALLOWED_INVOKE_CHANNELS", () => {
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.APPROVAL_RESPOND);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
    );
  });

  // ADV-15: P42 準拠 3 段バリデーション
  describe("ADV-15: P42 3-step validation", () => {
    const makeEvent = () =>
      ({
        sender: mockMainWindow.webContents,
      }) as unknown as IpcMainInvokeEvent;

    it("rejects non-string sessionId", async () => {
      const r = (await terminalLogHandler(makeEvent(), 123)) as {
        success: boolean;
      };
      expect(r.success).toBe(false);
    });

    it("rejects empty string sessionId", async () => {
      const r = (await terminalLogHandler(makeEvent(), "")) as {
        success: boolean;
      };
      expect(r.success).toBe(false);
    });

    it("rejects whitespace-only sessionId", async () => {
      const r = (await terminalLogHandler(makeEvent(), "   ")) as {
        success: boolean;
      };
      expect(r.success).toBe(false);
    });

    it("applies same validation to copy-command handler", async () => {
      const r1 = (await copyCommandHandler(makeEvent(), null)) as {
        success: boolean;
      };
      expect(r1.success).toBe(false);

      const r2 = (await copyCommandHandler(makeEvent(), "")) as {
        success: boolean;
      };
      expect(r2.success).toBe(false);
    });
  });

  // sender 検証
  it("rejects unknown sender for terminal-log", async () => {
    const event = {
      sender: { id: 999 },
    } as unknown as IpcMainInvokeEvent;

    const result = (await terminalLogHandler(event, "session-1")) as {
      success: boolean;
      error: { code: string };
    };
    expect(result.success).toBe(false);
    expect(result.error.code).toBe("UNAUTHORIZED");
  });
});
