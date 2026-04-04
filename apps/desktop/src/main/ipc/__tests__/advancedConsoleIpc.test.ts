/**
 * advancedConsoleIpc テスト
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 Phase 4
 * テストケース: ADV-12〜ADV-18, ADV-20〜ADV-25
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

  // ADV-16: getTerminalLog が実セッションの output を返す（API キー sanitize 確認）
  it("ADV-16: getTerminalLog が実 SessionManager output を返す", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    const mockOutput = ["line 1", "line 2", "sk-ant-SECRET should be redacted"];
    mockGetTerminalLog.mockResolvedValue(mockOutput);

    const result = (await terminalLogHandler(event, "session-123")) as {
      success: boolean;
      data: string[];
    };

    expect(result.success).toBe(true);
    // sanitizeForApiKeys が適用され API キーが REDACTED になること
    expect(result.data.join("\n")).not.toContain("sk-ant-SECRET");
    expect(result.data.some((l: string) => l.includes("[REDACTED]"))).toBe(
      true,
    );
  });

  // ADV-17: getCopyCommand が scriptPath + args の結合を返す
  it("ADV-17: getCopyCommand が scriptPath + args の結合を返す", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    mockGetCopyCommand.mockResolvedValue("/path/to/skill.js --flag value");

    const result = (await copyCommandHandler(event, "session-abc")) as {
      success: boolean;
      data: string | null;
    };

    expect(result.success).toBe(true);
    expect(result.data).toBe("/path/to/skill.js --flag value");
  });

  // ADV-18: セッション未存在時に TERMINAL_LOG_ERROR エラーコードを返し、API key を残さない
  it("ADV-18: セッション未存在時に TERMINAL_LOG_ERROR エラーコードを返し、メッセージを sanitize する", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    mockGetTerminalLog.mockImplementation(async () => {
      const err = new Error(
        "Session not found: sk-ant-abc123def456ghi789jkl012mno345pq",
      );
      (err as NodeJS.ErrnoException).code = "SESSION_NOT_FOUND";
      throw err;
    });

    const result = (await terminalLogHandler(event, "nonexistent-session")) as {
      success: boolean;
      error: { code: string };
    };

    expect(result.success).toBe(false);
    expect(result.error.code).toBe("TERMINAL_LOG_ERROR");
    expect(result.error.message).not.toContain("sk-ant-");
    expect(result.error.message).toContain("[REDACTED]");
  });

  // ADV-25: copy-command のエラー応答も API key を残さない
  it("ADV-25: getCopyCommand のエラー応答も sanitize する", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    mockGetCopyCommand.mockImplementation(async () => {
      const err = new Error(
        "Copy failed: sk-ant-abc123def456ghi789jkl012mno345pq",
      );
      (err as NodeJS.ErrnoException).code = "SESSION_NOT_FOUND";
      throw err;
    });

    const result = (await copyCommandHandler(event, "session-abc")) as {
      success: boolean;
      error: { code: string; message: string };
    };

    expect(result.success).toBe(false);
    expect(result.error.code).toBe("COPY_COMMAND_ERROR");
    expect(result.error.message).not.toContain("sk-ant-");
    expect(result.error.message).toContain("[REDACTED]");
  });

  // ADV-20: output が空配列のセッション（SESSION_NOT_FOUND にはならない）
  it("ADV-20: getTerminalLog — output が空配列のセッションは [] を返す", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    mockGetTerminalLog.mockResolvedValue([]);

    const result = (await terminalLogHandler(event, "session-empty")) as {
      success: boolean;
      data: string[];
    };

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  // ADV-21: getCopyCommand — args なしのセッション（末尾スペースなし）
  it("ADV-21: getCopyCommand — args なしのセッションは scriptPath のみを返す", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    mockGetCopyCommand.mockResolvedValue("/path/to/skill.js");

    const result = (await copyCommandHandler(event, "session-noargs")) as {
      success: boolean;
      data: string | null;
    };

    expect(result.success).toBe(true);
    expect(result.data).toBe("/path/to/skill.js");
    expect(result.data).not.toMatch(/ $/);
  });

  // ADV-22: getCopyCommand — 複数 args のセッション
  it("ADV-22: getCopyCommand — 複数 args のセッションは結合文字列を返す", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    mockGetCopyCommand.mockResolvedValue(
      "/path/to/skill.js --skill mySkill --verbose",
    );

    const result = (await copyCommandHandler(event, "session-multiargs")) as {
      success: boolean;
      data: string | null;
    };

    expect(result.success).toBe(true);
    expect(result.data).toBe("/path/to/skill.js --skill mySkill --verbose");
  });

  // ADV-23: getTerminalLog — 依存が空配列を返した場合の pass-through
  it("ADV-23: getTerminalLog が空配列をそのまま返す", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    mockGetTerminalLog.mockResolvedValue([]);

    const result = (await terminalLogHandler(event, "session-null-mgr")) as {
      success: boolean;
      data: string[];
    };

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  // ADV-24: getCopyCommand — 依存が null を返した場合の pass-through
  it("ADV-24: getCopyCommand が null をそのまま返す", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    mockGetCopyCommand.mockResolvedValue(null);

    const result = (await copyCommandHandler(event, "session-null-mgr")) as {
      success: boolean;
      data: string | null;
    };

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });
});
