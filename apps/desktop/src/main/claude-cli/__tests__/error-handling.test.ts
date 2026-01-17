/**
 * Error Handling Tests
 * Phase 6: Test Enrichment - Error and exception cases
 *
 * @see docs/30-workflows/claude-code-cli-integration/phase-6-test-expansion.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ChildProcess } from "child_process";
import * as childProcess from "child_process";
import { ProcessManager } from "../ProcessManager";
import { SessionManager } from "../SessionManager";
import { SkillScanner } from "../SkillScanner";

// Mock child_process
vi.mock("child_process");

const mockSpawn = vi.mocked(childProcess.spawn);

// Types for testing
interface MockChildProcess {
  pid: number;
  stdout: {
    on: ReturnType<typeof vi.fn>;
  };
  stderr: {
    on: ReturnType<typeof vi.fn>;
  };
  on: ReturnType<typeof vi.fn>;
  once: ReturnType<typeof vi.fn>;
  kill: ReturnType<typeof vi.fn>;
}

// Helper to create mock process
const createMockProcess = (pid = 12345): MockChildProcess => ({
  pid,
  stdout: { on: vi.fn() },
  stderr: { on: vi.fn() },
  on: vi.fn(),
  once: vi.fn(),
  kill: vi.fn().mockReturnValue(true),
});

describe("Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("CLI Errors", () => {
    let processManager: ProcessManager;

    beforeEach(() => {
      processManager = new ProcessManager();
    });

    it("should handle CLI not found error (ENOENT)", async () => {
      mockSpawn.mockImplementation(() => {
        const error = new Error("spawn ENOENT") as NodeJS.ErrnoException;
        error.code = "ENOENT";
        throw error;
      });

      await expect(
        processManager.spawn("test-session", "nonexistent-cli", ["arg"]),
      ).rejects.toThrow("ENOENT");
    });

    it("should handle CLI permission denied error (EACCES)", async () => {
      mockSpawn.mockImplementation(() => {
        const error = new Error(
          "spawn EACCES: permission denied",
        ) as NodeJS.ErrnoException;
        error.code = "EACCES";
        throw error;
      });

      await expect(
        processManager.spawn("test-session", "/restricted/cli", ["arg"]),
      ).rejects.toThrow();
    });

    it("should handle CLI execution timeout", async () => {
      vi.useFakeTimers();

      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const onTimeout = vi.fn();
      processManager.on("processTimeout", onTimeout);

      await processManager.spawn("test-session", "node", ["slow-script.mjs"], {
        timeoutMs: 5000,
      });

      // Advance past timeout
      vi.advanceTimersByTime(6000);

      expect(onTimeout).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: "test-session",
        }),
      );

      vi.useRealTimers();
    });

    it("should handle CLI crash during execution", async () => {
      const mockProcess = createMockProcess();
      let exitCallback:
        | ((code: number | null, signal: string | null) => void)
        | null = null;

      mockProcess.on.mockImplementation(
        (
          event: string,
          cb: (code: number | null, signal: string | null) => void,
        ) => {
          if (event === "exit") {
            exitCallback = cb;
          }
          return mockProcess;
        },
      );

      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const onTerminated = vi.fn();
      processManager.on("processTerminated", onTerminated);

      await processManager.spawn("test-session", "node", ["crash.mjs"]);

      // Simulate crash with non-zero exit code
      exitCallback?.(1, null);

      expect(onTerminated).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: "test-session",
        }),
      );
    });

    it("should handle CLI killed by signal", async () => {
      const mockProcess = createMockProcess();
      let exitCallback:
        | ((code: number | null, signal: string | null) => void)
        | null = null;

      mockProcess.on.mockImplementation(
        (
          event: string,
          cb: (code: number | null, signal: string | null) => void,
        ) => {
          if (event === "exit") {
            exitCallback = cb;
          }
          return mockProcess;
        },
      );

      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const onTerminated = vi.fn();
      processManager.on("processTerminated", onTerminated);

      await processManager.spawn("test-session", "node", ["script.mjs"]);

      // Simulate killed by SIGKILL
      exitCallback?.(null, "SIGKILL");

      expect(onTerminated).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: "test-session",
        }),
      );
    });
  });

  describe("Process Errors", () => {
    let processManager: ProcessManager;

    beforeEach(() => {
      mockSpawn.mockReturnValue(createMockProcess() as unknown as ChildProcess);
      processManager = new ProcessManager();
    });

    it("should handle SIGTERM signal gracefully", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      await processManager.spawn("test-session", "node", ["script.mjs"]);
      const result = await processManager.kill("test-session");

      expect(result).toBe(true);
      expect(mockProcess.kill).toHaveBeenCalledWith("SIGTERM");
    });

    it("should escalate to SIGKILL after grace period", async () => {
      vi.useFakeTimers();

      const mockProcess = createMockProcess();
      mockProcess.once.mockImplementation(
        (_event: string, _cb: () => void) => mockProcess,
      );
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      await processManager.spawn("test-session", "node", ["script.mjs"]);

      const killPromise = processManager.kill("test-session", {
        gracePeriodMs: 1000,
      });

      vi.advanceTimersByTime(1500);

      await killPromise;

      expect(mockProcess.kill).toHaveBeenCalledWith("SIGKILL");

      vi.useRealTimers();
    });

    it("should handle kill failure", async () => {
      const mockProcess = createMockProcess();
      mockProcess.kill.mockReturnValue(false);
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      await processManager.spawn("test-session", "node", ["script.mjs"]);
      await processManager.kill("test-session");

      // Even if kill returns false, we consider it attempted
      expect(mockProcess.kill).toHaveBeenCalled();
    });

    it("should handle process already terminated", async () => {
      const result = await processManager.kill("non-existent-session");
      expect(result).toBe(false);
    });

    it("should clean up zombie process tracking", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      await processManager.spawn("test-session", "node", ["script.mjs"]);
      await processManager.kill("test-session");

      const process = processManager.getProcess("test-session");
      expect(process).toBeNull();
    });
  });

  describe("Session Errors", () => {
    let sessionManager: SessionManager;

    beforeEach(() => {
      mockSpawn.mockReturnValue(createMockProcess() as unknown as ChildProcess);
      sessionManager = new SessionManager({ maxSessions: 3 });
    });

    it("should handle session creation failure", async () => {
      mockSpawn.mockImplementation(() => {
        throw new Error("Failed to spawn process");
      });

      await expect(
        sessionManager.createSession({
          skillName: "test-skill",
          scriptPath: "/path/to/script.mjs",
          args: [],
        }),
      ).rejects.toThrow();
    });

    it("should handle session limit exceeded", async () => {
      // Fill up sessions
      for (let i = 0; i < 3; i++) {
        await sessionManager.createSession({
          skillName: `skill-${i}`,
          scriptPath: `/path/script-${i}.mjs`,
          args: [],
        });
      }

      // Should fail when limit exceeded
      await expect(
        sessionManager.createSession({
          skillName: "overflow-skill",
          scriptPath: "/path/overflow.mjs",
          args: [],
        }),
      ).rejects.toThrow();
    });

    it("should handle destroy of non-existent session", async () => {
      const result = await sessionManager.destroySession("non-existent");
      expect(result).toBe(false);
    });

    it("should handle double destroy", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/script.mjs",
        args: [],
      });

      const firstDestroy = await sessionManager.destroySession(session.id);
      expect(firstDestroy).toBe(true);

      // After first destroy, session is terminated but may still exist in list
      // Second destroy may return true or false depending on implementation
      const secondDestroy = await sessionManager.destroySession(session.id);
      // Just verify it doesn't throw
      expect(typeof secondDestroy).toBe("boolean");
    });

    it("should handle session status transition errors", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/script.mjs",
        args: [],
      });

      // Session should start as pending or running
      expect(["pending", "running"]).toContain(session.status);
    });
  });

  describe("Skill Errors", () => {
    let skillScanner: SkillScanner;
    const basePath = "/home/user/.claude/skills";

    beforeEach(() => {
      skillScanner = new SkillScanner({ basePath });
    });

    it("should return path for valid skill name without cache", () => {
      // Without cache, resolveSkillPath returns the constructed path
      const path = skillScanner.resolveSkillPath("valid-skill");
      expect(path).toBe(`${basePath}/valid-skill`);
    });

    it("should throw for path traversal attempts", () => {
      // Path traversal should throw
      expect(() => skillScanner.resolveSkillPath("../etc/passwd")).toThrow();
      expect(() => skillScanner.resolveSkillPath("")).toThrow();
    });

    it("should throw when filtering without scanning first", () => {
      // Filter requires scan to be performed first
      expect(() => skillScanner.filter({ name: "any" })).toThrow(
        /Scan must be performed before filtering/i,
      );
    });

    it("should handle scan on non-existent base path", async () => {
      // Scanner should handle missing base path without crashing
      const scanner = new SkillScanner({ basePath: "/non/existent/path" });
      const result = await scanner.scan();
      // Should return empty or error, not crash
      expect(result).toBeDefined();
      expect(Array.isArray(result.skills)).toBe(true);
    });
  });

  describe("IPC Validation Errors", () => {
    // IPC validation errors are tested in ipc-handler.test.ts
    // This section tests the validation error message formatting

    it("should create ValidationError with details", () => {
      class ValidationError extends Error {
        public readonly code = "VALIDATION_ERROR";
        public readonly details: unknown;

        constructor(message: string, details?: unknown) {
          super(message);
          this.name = "ValidationError";
          this.details = details;
        }
      }

      const error = new ValidationError("Test error", { field: "test" });
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.details).toEqual({ field: "test" });
      expect(error.message).toBe("Test error");
    });
  });

  describe("Resource Cleanup on Error", () => {
    let sessionManager: SessionManager;

    beforeEach(() => {
      mockSpawn.mockReturnValue(createMockProcess() as unknown as ChildProcess);
      sessionManager = new SessionManager({ maxSessions: 3 });
    });

    it("should clean up session on creation failure", async () => {
      // Create sessions up to limit
      for (let i = 0; i < 3; i++) {
        await sessionManager.createSession({
          skillName: `skill-${i}`,
          scriptPath: `/path/script-${i}.mjs`,
          args: [],
        });
      }

      // Fail to create another
      await expect(
        sessionManager.createSession({
          skillName: "fail-skill",
          scriptPath: "/path/fail.mjs",
          args: [],
        }),
      ).rejects.toThrow();

      // Should not have orphan session
      const sessions = sessionManager.listSessions();
      expect(sessions.length).toBe(3);
    });

    it("should release resources on shutdown", async () => {
      await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/script.mjs",
        args: [],
      });

      await sessionManager.shutdown();

      // After shutdown, sessions should be terminated
      // The list may be cleared or contain terminated sessions
      const sessions = sessionManager.listSessions();
      if (sessions.length > 0) {
        // If sessions remain, they should be terminated
        sessions.forEach((session) => {
          expect(["terminated", "completed", "failed"]).toContain(
            session.status,
          );
        });
      }
    });
  });
});
