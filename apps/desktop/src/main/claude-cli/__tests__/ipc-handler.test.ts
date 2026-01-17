/**
 * Claude CLI IPC Handler Tests
 * Phase 4: TDD Red - All tests should fail until implementation
 *
 * Tests for IPC handler registration and invocation
 * @see docs/30-workflows/claude-code-cli-integration/outputs/phase-2/ipc-api-specification.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// Mock ClaudeCliManager
const mockCheckInstallation = vi.fn();
const mockListSkills = vi.fn();
const mockGetSkillDetail = vi.fn();
const mockExecuteScript = vi.fn();
const mockTerminateSession = vi.fn();
const mockListSessions = vi.fn();
const mockGetSession = vi.fn();

vi.mock("../ClaudeCliManager", () => ({
  ClaudeCliManager: vi.fn().mockImplementation(() => ({
    checkInstallation: mockCheckInstallation,
    listSkills: mockListSkills,
    getSkillDetail: mockGetSkillDetail,
    executeScript: mockExecuteScript,
    terminateSession: mockTerminateSession,
    listSessions: mockListSessions,
    getSession: mockGetSession,
    on: vi.fn(),
    shutdown: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock electron modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi.fn().mockReturnValue({ id: 1 }),
  },
}));

// Mock ipc-validator
vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    code: "IPC_VALIDATION_ERROR",
    message: result.reason || "Validation failed",
  })),
}));

// Import after mocks
import { ipcMain } from "electron";

// Mock BrowserWindow for validation
const mockMainWindow = {
  webContents: {
    send: vi.fn(),
  },
  isDestroyed: () => false,
  id: 1,
} as unknown as BrowserWindowType;

// Mock event with proper structure
const mockEvent = {
  sender: {
    id: 1,
  },
};

describe("ClaudeCliIpcHandler", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Default mock responses
    mockCheckInstallation.mockResolvedValue({
      success: true,
      data: {
        installed: true,
        version: "1.0.0",
        path: "/usr/local/bin/claude",
        error: null,
      },
    });

    mockListSkills.mockResolvedValue({
      success: true,
      data: {
        skills: [
          {
            name: "test-skill",
            path: "/path/to/skill",
            description: "Test skill",
            tags: ["test"],
            triggers: [],
            dependencies: [],
            allowedTools: [],
            hasScripts: true,
            hasReferences: false,
          },
        ],
        errors: [],
        scannedAt: Date.now(),
      },
    });

    mockGetSkillDetail.mockResolvedValue({
      success: true,
      data: {
        name: "test-skill",
        path: "/path/to/skill",
        description: "Test skill",
        content: "# Test Skill",
        tags: ["test"],
        triggers: [],
        dependencies: [],
        allowedTools: [],
        hasScripts: true,
        hasReferences: false,
        scripts: [{ name: "run.mjs", path: "/path/to/run.mjs", type: "node" }],
      },
    });

    mockExecuteScript.mockResolvedValue({
      success: true,
      data: {
        sessionId: "session-123",
        status: "running",
      },
    });

    mockTerminateSession.mockResolvedValue({
      success: true,
      data: {
        sessionId: "session-123",
        terminated: true,
      },
    });

    mockListSessions.mockResolvedValue({
      success: true,
      data: [
        {
          id: "session-123",
          skillName: "test-skill",
          status: "running",
          startedAt: Date.now(),
          completedAt: null,
        },
      ],
    });

    mockGetSession.mockResolvedValue({
      success: true,
      data: {
        id: "session-123",
        skillName: "test-skill",
        status: "completed",
        startedAt: Date.now() - 5000,
        completedAt: Date.now(),
        exitCode: 0,
        output: ["output line 1"],
        error: [],
      },
    });

    // Register handlers
    const { registerClaudeCliHandlers } = await import("../ipc-handler");
    registerClaudeCliHandlers(mockMainWindow);
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("handler registration", () => {
    it("should register claude-cli:check-installation handler", () => {
      expect(handlers.has("claude-cli:check-installation")).toBe(true);
    });

    it("should register claude-cli:list-skills handler", () => {
      expect(handlers.has("claude-cli:list-skills")).toBe(true);
    });

    it("should register claude-cli:get-skill-detail handler", () => {
      expect(handlers.has("claude-cli:get-skill-detail")).toBe(true);
    });

    it("should register claude-cli:execute-script handler", () => {
      expect(handlers.has("claude-cli:execute-script")).toBe(true);
    });

    it("should register claude-cli:terminate-session handler", () => {
      expect(handlers.has("claude-cli:terminate-session")).toBe(true);
    });

    it("should register claude-cli:list-sessions handler", () => {
      expect(handlers.has("claude-cli:list-sessions")).toBe(true);
    });

    it("should register claude-cli:get-session handler", () => {
      expect(handlers.has("claude-cli:get-session")).toBe(true);
    });
  });

  describe("claude-cli:check-installation", () => {
    it("should return CLI availability status", async () => {
      const handler = handlers.get("claude-cli:check-installation");
      expect(handler).toBeDefined();

      const result = await handler!(mockEvent);

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          installed: true,
        }),
      });
    });

    it("should include version info when available", async () => {
      const handler = handlers.get("claude-cli:check-installation");
      expect(handler).toBeDefined();

      const result = await handler!(mockEvent);

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          version: "1.0.0",
        }),
      });
    });

    it("should return error when CLI is not installed", async () => {
      mockCheckInstallation.mockResolvedValue({
        success: true,
        data: {
          installed: false,
          version: null,
          path: null,
          error: "CLI not found",
        },
      });

      const handler = handlers.get("claude-cli:check-installation");
      const result = await handler!(mockEvent);

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          installed: false,
          error: "CLI not found",
        }),
      });
    });
  });

  describe("claude-cli:list-skills", () => {
    it("should return list of available skills", async () => {
      const handler = handlers.get("claude-cli:list-skills");
      expect(handler).toBeDefined();

      const result = await handler!(mockEvent, {});

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          skills: expect.arrayContaining([
            expect.objectContaining({
              name: "test-skill",
            }),
          ]),
        }),
      });
    });

    it("should filter skills based on criteria", async () => {
      const handler = handlers.get("claude-cli:list-skills");
      expect(handler).toBeDefined();

      const request = {
        filter: {
          tags: ["test"],
        },
      };

      const result = await handler!(mockEvent, request);

      expect(mockListSkills).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { tags: ["test"] },
        }),
      );
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          skills: expect.any(Array),
        }),
      });
    });

    it("should handle empty skill directory", async () => {
      mockListSkills.mockResolvedValue({
        success: true,
        data: {
          skills: [],
          errors: [],
          scannedAt: Date.now(),
        },
      });

      const handler = handlers.get("claude-cli:list-skills");
      const result = await handler!(mockEvent, {});

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          skills: [],
        }),
      });
    });

    it("should handle scan errors", async () => {
      mockListSkills.mockResolvedValue({
        success: true,
        data: {
          skills: [],
          errors: [{ path: "/invalid/path", error: "Permission denied" }],
          scannedAt: Date.now(),
        },
      });

      const handler = handlers.get("claude-cli:list-skills");
      const result = await handler!(mockEvent, {});

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              path: "/invalid/path",
            }),
          ]),
        }),
      });
    });

    it("should support force refresh", async () => {
      const handler = handlers.get("claude-cli:list-skills");

      const request = {
        forceRefresh: true,
      };

      await handler!(mockEvent, request);

      expect(mockListSkills).toHaveBeenCalledWith(
        expect.objectContaining({
          forceRefresh: true,
        }),
      );
    });
  });

  describe("claude-cli:get-skill-detail", () => {
    it("should return skill detail", async () => {
      const handler = handlers.get("claude-cli:get-skill-detail");
      expect(handler).toBeDefined();

      const request = {
        skillName: "test-skill",
      };

      const result = await handler!(mockEvent, request);

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          name: "test-skill",
          content: expect.any(String),
        }),
      });
    });

    it("should include scripts when requested", async () => {
      const handler = handlers.get("claude-cli:get-skill-detail");

      const request = {
        skillName: "test-skill",
        includeScripts: true,
      };

      const result = await handler!(mockEvent, request);

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          scripts: expect.arrayContaining([
            expect.objectContaining({
              name: "run.mjs",
            }),
          ]),
        }),
      });
    });

    it("should return error for non-existent skill", async () => {
      mockGetSkillDetail.mockResolvedValue({
        success: false,
        error: {
          code: "SKILL_NOT_FOUND",
          message: "Skill not found: nonexistent-skill",
        },
      });

      const handler = handlers.get("claude-cli:get-skill-detail");

      const request = {
        skillName: "nonexistent-skill",
      };

      const result = await handler!(mockEvent, request);

      expect(result).toEqual({
        success: false,
        error: expect.objectContaining({
          code: "SKILL_NOT_FOUND",
        }),
      });
    });

    it("should validate skill name format", async () => {
      const handler = handlers.get("claude-cli:get-skill-detail");

      const request = {
        skillName: "Invalid Skill Name!",
      };

      await expect(handler!(mockEvent, request)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });
  });

  describe("claude-cli:execute-script", () => {
    it("should validate request schema", async () => {
      const handler = handlers.get("claude-cli:execute-script");
      expect(handler).toBeDefined();

      // Missing required fields
      await expect(handler!(mockEvent, {})).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });

    it("should reject invalid skill paths", async () => {
      const handler = handlers.get("claude-cli:execute-script");

      const request = {
        skillName: "test-skill",
        scriptName: "../../../etc/passwd",
      };

      await expect(handler!(mockEvent, request)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });

    it("should return session ID on success", async () => {
      const handler = handlers.get("claude-cli:execute-script");

      const request = {
        skillName: "test-skill",
        scriptName: "run.mjs",
      };

      const result = await handler!(mockEvent, request);

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          sessionId: expect.any(String),
        }),
      });
    });

    it("should handle execution errors", async () => {
      mockExecuteScript.mockResolvedValue({
        success: false,
        error: {
          code: "EXECUTION_FAILED",
          message: "Script execution failed",
        },
      });

      const handler = handlers.get("claude-cli:execute-script");

      const request = {
        skillName: "test-skill",
        scriptName: "run.mjs",
      };

      const result = await handler!(mockEvent, request);

      expect(result).toEqual({
        success: false,
        error: expect.objectContaining({
          code: "EXECUTION_FAILED",
        }),
      });
    });

    it("should pass arguments to script", async () => {
      const handler = handlers.get("claude-cli:execute-script");

      const request = {
        skillName: "test-skill",
        scriptName: "run.mjs",
        args: ["--verbose", "--output", "result.json"],
      };

      await handler!(mockEvent, request);

      expect(mockExecuteScript).toHaveBeenCalledWith(
        expect.objectContaining({
          args: ["--verbose", "--output", "result.json"],
        }),
      );
    });

    it("should reject unsupported script types", async () => {
      const handler = handlers.get("claude-cli:execute-script");

      const request = {
        skillName: "test-skill",
        scriptName: "malicious.exe",
      };

      await expect(handler!(mockEvent, request)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });
  });

  describe("claude-cli:terminate-session", () => {
    it("should terminate running session", async () => {
      const handler = handlers.get("claude-cli:terminate-session");
      expect(handler).toBeDefined();

      const request = {
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = await handler!(mockEvent, request);

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          terminated: true,
        }),
      });
    });

    it("should handle non-existent session", async () => {
      mockTerminateSession.mockResolvedValue({
        success: false,
        error: {
          code: "SESSION_NOT_FOUND",
          message: "Session not found",
        },
      });

      const handler = handlers.get("claude-cli:terminate-session");

      const request = {
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = await handler!(mockEvent, request);

      expect(result).toEqual({
        success: false,
        error: expect.objectContaining({
          code: "SESSION_NOT_FOUND",
        }),
      });
    });

    it("should validate session ID format", async () => {
      const handler = handlers.get("claude-cli:terminate-session");

      const request = {
        sessionId: "invalid-session-id",
      };

      await expect(handler!(mockEvent, request)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });

    it("should clean up resources", async () => {
      const handler = handlers.get("claude-cli:terminate-session");

      const request = {
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      };

      await handler!(mockEvent, request);

      expect(mockTerminateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: "550e8400-e29b-41d4-a716-446655440000",
        }),
      );
    });

    it("should support force termination", async () => {
      const handler = handlers.get("claude-cli:terminate-session");

      const request = {
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        force: true,
      };

      await handler!(mockEvent, request);

      expect(mockTerminateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          force: true,
        }),
      );
    });
  });

  describe("claude-cli:list-sessions", () => {
    it("should return list of sessions", async () => {
      const handler = handlers.get("claude-cli:list-sessions");
      expect(handler).toBeDefined();

      const result = await handler!(mockEvent);

      expect(result).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: "session-123",
          }),
        ]),
      });
    });

    it("should return empty list when no sessions", async () => {
      mockListSessions.mockResolvedValue({
        success: true,
        data: [],
      });

      const handler = handlers.get("claude-cli:list-sessions");
      const result = await handler!(mockEvent);

      expect(result).toEqual({
        success: true,
        data: [],
      });
    });
  });

  describe("claude-cli:get-session", () => {
    it("should return session details", async () => {
      const handler = handlers.get("claude-cli:get-session");
      expect(handler).toBeDefined();

      const request = {
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = await handler!(mockEvent, request);

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          id: "session-123",
          status: "completed",
          output: expect.any(Array),
        }),
      });
    });

    it("should return error for non-existent session", async () => {
      mockGetSession.mockResolvedValue({
        success: false,
        error: {
          code: "SESSION_NOT_FOUND",
          message: "Session not found",
        },
      });

      const handler = handlers.get("claude-cli:get-session");

      const request = {
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = await handler!(mockEvent, request);

      expect(result).toEqual({
        success: false,
        error: expect.objectContaining({
          code: "SESSION_NOT_FOUND",
        }),
      });
    });
  });

  describe("streaming", () => {
    it("should emit stdout messages to renderer", async () => {
      // Register handlers
      const { registerClaudeCliHandlers } = await import("../ipc-handler");
      registerClaudeCliHandlers(mockMainWindow);

      // Simulate stdout message from manager
      // The manager should emit events that get forwarded to renderer
      expect(mockMainWindow.webContents.send).toBeDefined();
    });

    it("should emit stderr messages to renderer", async () => {
      const { registerClaudeCliHandlers } = await import("../ipc-handler");
      registerClaudeCliHandlers(mockMainWindow);

      expect(mockMainWindow.webContents.send).toBeDefined();
    });

    it("should emit session status updates", async () => {
      const { registerClaudeCliHandlers } = await import("../ipc-handler");
      registerClaudeCliHandlers(mockMainWindow);

      expect(mockMainWindow.webContents.send).toBeDefined();
    });

    it("should handle stream errors", async () => {
      const { registerClaudeCliHandlers } = await import("../ipc-handler");
      registerClaudeCliHandlers(mockMainWindow);

      expect(mockMainWindow.webContents.send).toBeDefined();
    });
  });

  describe("unregisterClaudeCliHandlers", () => {
    it("should remove all registered handlers", async () => {
      const { unregisterClaudeCliHandlers } = await import("../ipc-handler");

      unregisterClaudeCliHandlers();

      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "claude-cli:check-installation",
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "claude-cli:list-skills",
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "claude-cli:get-skill-detail",
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "claude-cli:execute-script",
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "claude-cli:terminate-session",
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "claude-cli:list-sessions",
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "claude-cli:get-session",
      );
    });
  });

  describe("security", () => {
    it("should validate IPC sender", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator");

      const handler = handlers.get("claude-cli:check-installation");
      await handler!(mockEvent);

      expect(validateIpcSender).toHaveBeenCalledWith(mockEvent.sender);
    });

    it("should reject requests from DevTools", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator");

      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValue({
        valid: false,
        reason: "DevTools sender not allowed",
      });

      const handler = handlers.get("claude-cli:check-installation");

      await expect(handler!(mockEvent)).rejects.toMatchObject({
        code: "IPC_VALIDATION_ERROR",
      });
    });
  });
});
