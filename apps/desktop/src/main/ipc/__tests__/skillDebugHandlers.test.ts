/**
 * Skill Debug IPC Handlers テスト (TASK-9H)
 *
 * テスト対象チャネル:
 * - skill:debug:start
 * - skill:debug:command
 * - skill:debug:breakpoint:add
 * - skill:debug:breakpoint:remove
 * - skill:debug:inspect
 * - skill:debug:evaluate
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Mock Setup ===

// Mock electron
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi
      .fn()
      .mockReturnValue({ id: 1, isDestroyed: () => false }),
  },
}));

// Mock electron-log
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock ipc-validator
const mockValidateIpcSender = vi.fn().mockReturnValue({ valid: true });
const mockToIPCValidationError = vi
  .fn()
  .mockImplementation(
    (result: { errorCode?: string; errorMessage?: string }) =>
      new Error(result.errorMessage ?? "Validation failed"),
  );

vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
}));

// Mock SkillDebugger
const mockDebugger = {
  startSession: vi.fn(),
  executeCommand: vi.fn(),
  addBreakpoint: vi.fn(),
  removeBreakpoint: vi.fn(),
  inspectVariable: vi.fn(),
  evaluateExpression: vi.fn(),
};

vi.mock("../../services/skill/SkillDebugger.js", () => ({
  SkillDebugger: vi.fn().mockImplementation(() => mockDebugger),
}));

// Import after mocks
import { ipcMain } from "electron";

// Mock BrowserWindow
const mockMainWindow = {
  webContents: {
    send: vi.fn(),
    getURL: vi.fn().mockReturnValue("file://"),
  },
  isDestroyed: () => false,
  id: 1,
} as unknown as BrowserWindowType;

/**
 * Mock IPC event factory
 */
const createMockEvent = (valid: boolean = true) =>
  ({
    sender: {
      id: valid ? 1 : 999,
      getURL: () => (valid ? "file://" : "https://malicious.com"),
    },
    senderFrame: { routingId: 0 },
  }) as unknown as Electron.IpcMainInvokeEvent;

// =============================================================================
// Test Suite
// =============================================================================

describe("skillDebugHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // Capture registered handlers via ipcMain.handle mock
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Default mock responses
    mockDebugger.startSession.mockReturnValue({
      id: "session-1",
      skillName: "test-skill",
      status: "running",
      breakpoints: [],
      variables: {},
      callStack: [],
      startedAt: "2026-02-27T00:00:00.000Z",
    });
    mockDebugger.addBreakpoint.mockReturnValue({
      id: "bp-1",
      type: "tool",
      enabled: true,
    });
    mockDebugger.inspectVariable.mockReturnValue({ foo: "bar" });
    mockDebugger.evaluateExpression.mockReturnValue({
      result: 42,
      type: "number",
    });

    // Register handlers
    const { registerSkillDebugHandlers } =
      await import("../skillDebugHandlers");
    registerSkillDebugHandlers(mockMainWindow);
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Handler registration
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("handler registration", () => {
    it("should register all 6 debug handlers", () => {
      expect(handlers.size).toBe(6);
      expect(handlers.has("skill:debug:start")).toBe(true);
      expect(handlers.has("skill:debug:command")).toBe(true);
      expect(handlers.has("skill:debug:breakpoint:add")).toBe(true);
      expect(handlers.has("skill:debug:breakpoint:remove")).toBe(true);
      expect(handlers.has("skill:debug:inspect")).toBe(true);
      expect(handlers.has("skill:debug:evaluate")).toBe(true);
    });

    it("should unregister all handlers", async () => {
      const { unregisterSkillDebugHandlers } =
        await import("../skillDebugHandlers");
      unregisterSkillDebugHandlers();

      const removeHandler = ipcMain.removeHandler as ReturnType<typeof vi.fn>;
      expect(removeHandler).toHaveBeenCalledWith("skill:debug:start");
      expect(removeHandler).toHaveBeenCalledWith("skill:debug:command");
      expect(removeHandler).toHaveBeenCalledWith("skill:debug:breakpoint:add");
      expect(removeHandler).toHaveBeenCalledWith(
        "skill:debug:breakpoint:remove",
      );
      expect(removeHandler).toHaveBeenCalledWith("skill:debug:inspect");
      expect(removeHandler).toHaveBeenCalledWith("skill:debug:evaluate");
      expect(removeHandler).toHaveBeenCalledTimes(6);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // skill:debug:start
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("skill:debug:start", () => {
    it("should return session state for valid request", async () => {
      const handler = handlers.get("skill:debug:start")!;
      const result = await handler(createMockEvent(), {
        skillName: "test-skill",
        prompt: "debug this",
        breakpoints: [],
      });

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          id: "session-1",
          skillName: "test-skill",
          status: "running",
        }),
      });
      expect(mockDebugger.startSession).toHaveBeenCalledWith(
        "test-skill",
        "debug this",
        [],
      );
    });

    it("should return error for missing skillName", async () => {
      const handler = handlers.get("skill:debug:start")!;
      const result = await handler(createMockEvent(), {
        prompt: "debug this",
        breakpoints: [],
      });

      expect(result).toEqual({
        success: false,
        error: "skillName must be a non-empty string",
      });
    });

    it("should return error for missing prompt", async () => {
      const handler = handlers.get("skill:debug:start")!;
      const result = await handler(createMockEvent(), {
        skillName: "test-skill",
        breakpoints: [],
      });

      expect(result).toEqual({
        success: false,
        error: "prompt must be a non-empty string",
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // skill:debug:command
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("skill:debug:command", () => {
    it("should execute valid command", async () => {
      const handler = handlers.get("skill:debug:command")!;
      const result = await handler(createMockEvent(), {
        sessionId: "session-1",
        command: "continue",
      });

      expect(result).toEqual({ success: true });
      expect(mockDebugger.executeCommand).toHaveBeenCalledWith(
        "session-1",
        "continue",
      );
    });

    it("should return error for invalid command", async () => {
      const handler = handlers.get("skill:debug:command")!;
      const result = await handler(createMockEvent(), {
        sessionId: "session-1",
        command: "invalid-command",
      });

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining("command must be one of"),
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // skill:debug:breakpoint:add
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("skill:debug:breakpoint:add", () => {
    it("should add breakpoint for valid request", async () => {
      const handler = handlers.get("skill:debug:breakpoint:add")!;
      const result = await handler(createMockEvent(), {
        sessionId: "session-1",
        breakpoint: { type: "tool", toolName: "Read", enabled: true },
      });

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({ id: "bp-1", type: "tool" }),
      });
      expect(mockDebugger.addBreakpoint).toHaveBeenCalledWith("session-1", {
        type: "tool",
        toolName: "Read",
        enabled: true,
      });
    });

    it("should return error for missing breakpoint", async () => {
      const handler = handlers.get("skill:debug:breakpoint:add")!;
      const result = await handler(createMockEvent(), {
        sessionId: "session-1",
      });

      expect(result).toEqual({
        success: false,
        error: "breakpoint must be an object",
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // skill:debug:breakpoint:remove
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("skill:debug:breakpoint:remove", () => {
    it("should remove breakpoint for valid request", async () => {
      const handler = handlers.get("skill:debug:breakpoint:remove")!;
      const result = await handler(createMockEvent(), {
        sessionId: "session-1",
        breakpointId: "bp-1",
      });

      expect(result).toEqual({ success: true });
      expect(mockDebugger.removeBreakpoint).toHaveBeenCalledWith(
        "session-1",
        "bp-1",
      );
    });

    it("should return error for missing breakpointId", async () => {
      const handler = handlers.get("skill:debug:breakpoint:remove")!;
      const result = await handler(createMockEvent(), {
        sessionId: "session-1",
      });

      expect(result).toEqual({
        success: false,
        error: "breakpointId must be a non-empty string",
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // skill:debug:inspect
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("skill:debug:inspect", () => {
    it("should return variable value for valid request", async () => {
      const handler = handlers.get("skill:debug:inspect")!;
      const result = await handler(createMockEvent(), {
        sessionId: "session-1",
        path: "variables.foo",
      });

      expect(result).toEqual({
        success: true,
        data: { foo: "bar" },
      });
      expect(mockDebugger.inspectVariable).toHaveBeenCalledWith(
        "session-1",
        "variables.foo",
      );
    });

    it("should return error for missing path", async () => {
      const handler = handlers.get("skill:debug:inspect")!;
      const result = await handler(createMockEvent(), {
        sessionId: "session-1",
      });

      expect(result).toEqual({
        success: false,
        error: "path must be a non-empty string",
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // skill:debug:evaluate
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("skill:debug:evaluate", () => {
    it("should return evaluation result for valid expression", async () => {
      const handler = handlers.get("skill:debug:evaluate")!;
      const result = await handler(createMockEvent(), {
        sessionId: "session-1",
        expression: "1 + 1",
      });

      expect(result).toEqual({
        success: true,
        data: { result: 42, type: "number" },
      });
      expect(mockDebugger.evaluateExpression).toHaveBeenCalledWith(
        "session-1",
        "1 + 1",
      );
    });

    it("should return error for missing expression", async () => {
      const handler = handlers.get("skill:debug:evaluate")!;
      const result = await handler(createMockEvent(), {
        sessionId: "session-1",
      });

      expect(result).toEqual({
        success: false,
        error: "expression must be a non-empty string",
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IPC sender validation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe("IPC sender validation", () => {
    it("should throw for invalid sender", async () => {
      mockValidateIpcSender.mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_FORBIDDEN",
        errorMessage: "Unauthorized IPC call",
      });

      const handler = handlers.get("skill:debug:start")!;
      await expect(
        handler(createMockEvent(false), {
          skillName: "test-skill",
          prompt: "debug this",
          breakpoints: [],
        }),
      ).rejects.toThrow("Unauthorized IPC call");
    });
  });
});
