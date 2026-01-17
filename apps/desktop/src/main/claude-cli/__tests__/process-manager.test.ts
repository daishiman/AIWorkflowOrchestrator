/**
 * Process Manager Tests
 * Phase 4: TDD Red - All tests should fail until implementation
 *
 * Tests for CLI process lifecycle management
 * @see docs/30-workflows/claude-code-cli-integration/outputs/phase-2/architecture-design.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ChildProcess } from "child_process";
import * as childProcess from "child_process";
import { ProcessManager } from "../ProcessManager";

// Mock child_process
vi.mock("child_process");

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

const mockSpawn = vi.mocked(childProcess.spawn);

describe("ProcessManager", () => {
  let processManager: ProcessManager;

  // Helper to create mock process
  const createMockProcess = (): MockChildProcess => ({
    pid: 12345,
    stdout: {
      on: vi.fn(),
    },
    stderr: {
      on: vi.fn(),
    },
    on: vi.fn(),
    once: vi.fn(),
    kill: vi.fn().mockReturnValue(true),
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock process
    mockSpawn.mockReturnValue(createMockProcess() as unknown as ChildProcess);

    processManager = new ProcessManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("spawn", () => {
    it("should spawn a new CLI process", async () => {
      const sessionId = "test-session-id";
      const command = "node";
      const args = ["test.mjs"];

      await processManager.spawn(sessionId, command, args);

      expect(mockSpawn).toHaveBeenCalledWith(
        command,
        args,
        expect.objectContaining({
          shell: false,
          stdio: ["pipe", "pipe", "pipe"],
        }),
      );
    });

    it("should return session ID for tracking", async () => {
      const sessionId = "test-session-id";
      const result = await processManager.spawn(sessionId, "node", [
        "test.mjs",
      ]);

      expect(result).toBe(sessionId);
    });

    it("should track process in running processes map", async () => {
      const sessionId = "test-session-id";
      await processManager.spawn(sessionId, "node", ["test.mjs"]);

      const process = processManager.getProcess(sessionId);
      expect(process).not.toBeNull();
    });

    it("should set up stdout event handler", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const sessionId = "test-session-id";
      await processManager.spawn(sessionId, "node", ["test.mjs"]);

      expect(mockProcess.stdout.on).toHaveBeenCalledWith(
        "data",
        expect.any(Function),
      );
    });

    it("should set up stderr event handler", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const sessionId = "test-session-id";
      await processManager.spawn(sessionId, "node", ["test.mjs"]);

      expect(mockProcess.stderr.on).toHaveBeenCalledWith(
        "data",
        expect.any(Function),
      );
    });

    it("should handle spawn errors gracefully", async () => {
      mockSpawn.mockImplementation(() => {
        throw new Error("spawn ENOENT");
      });

      const sessionId = "test-session-id";

      await expect(
        processManager.spawn(sessionId, "nonexistent", ["arg"]),
      ).rejects.toThrow();
    });

    it("should emit process started event", async () => {
      const sessionId = "test-session-id";
      const onStart = vi.fn();

      processManager.on("processStarted", onStart);
      await processManager.spawn(sessionId, "node", ["test.mjs"]);

      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId,
        }),
      );
    });

    it("should reject if session already exists", async () => {
      const sessionId = "test-session-id";
      await processManager.spawn(sessionId, "node", ["test.mjs"]);

      await expect(
        processManager.spawn(sessionId, "node", ["test.mjs"]),
      ).rejects.toThrow();
    });

    it("should use custom working directory when provided", async () => {
      const sessionId = "test-session-id";
      const cwd = "/custom/working/dir";

      await processManager.spawn(sessionId, "node", ["test.mjs"], { cwd });

      expect(mockSpawn).toHaveBeenCalledWith(
        "node",
        ["test.mjs"],
        expect.objectContaining({
          cwd,
        }),
      );
    });
  });

  describe("kill", () => {
    it("should terminate process by session ID", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const sessionId = "test-session-id";
      await processManager.spawn(sessionId, "node", ["test.mjs"]);

      const result = await processManager.kill(sessionId);

      expect(result).toBe(true);
      expect(mockProcess.kill).toHaveBeenCalledWith("SIGTERM");
    });

    it("should emit process terminated event", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const sessionId = "test-session-id";
      const onTerminated = vi.fn();

      processManager.on("processTerminated", onTerminated);
      await processManager.spawn(sessionId, "node", ["test.mjs"]);
      await processManager.kill(sessionId);

      expect(onTerminated).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId,
        }),
      );
    });

    it("should handle already terminated process", async () => {
      const sessionId = "nonexistent-session";

      const result = await processManager.kill(sessionId);

      expect(result).toBe(false);
    });

    it("should force kill after grace period", async () => {
      vi.useFakeTimers();

      const mockProcess = createMockProcess();
      // Setup once for exit listener
      mockProcess.once.mockImplementation(
        (_event: string, _cb: () => void) => mockProcess,
      );
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const sessionId = "test-session-id";
      await processManager.spawn(sessionId, "node", ["test.mjs"]);

      // Start kill (SIGTERM)
      const killPromise = processManager.kill(sessionId, {
        gracePeriodMs: 5000,
      });

      // Fast forward past grace period
      vi.advanceTimersByTime(6000);

      await killPromise;

      // Should have called SIGKILL after grace period
      expect(mockProcess.kill).toHaveBeenCalledWith("SIGKILL");

      vi.useRealTimers();
    });

    it("should remove process from tracking after kill", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const sessionId = "test-session-id";
      await processManager.spawn(sessionId, "node", ["test.mjs"]);
      await processManager.kill(sessionId);

      const process = processManager.getProcess(sessionId);
      expect(process).toBeNull();
    });
  });

  describe("timeout", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should terminate process after timeout", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const sessionId = "test-session-id";
      const timeoutMs = 5000;

      await processManager.spawn(sessionId, "node", ["test.mjs"], {
        timeoutMs,
      });

      // Fast forward past timeout
      vi.advanceTimersByTime(6000);

      expect(mockProcess.kill).toHaveBeenCalled();
    });

    it("should emit timeout event", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const sessionId = "test-session-id";
      const onTimeout = vi.fn();
      const timeoutMs = 5000;

      processManager.on("processTimeout", onTimeout);
      await processManager.spawn(sessionId, "node", ["test.mjs"], {
        timeoutMs,
      });

      // Fast forward past timeout
      vi.advanceTimersByTime(6000);

      expect(onTimeout).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId,
        }),
      );
    });

    it("should clean up resources on timeout", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const sessionId = "test-session-id";
      const timeoutMs = 5000;

      await processManager.spawn(sessionId, "node", ["test.mjs"], {
        timeoutMs,
      });

      // Fast forward past timeout
      vi.advanceTimersByTime(6000);

      const process = processManager.getProcess(sessionId);
      expect(process).toBeNull();
    });

    it("should not timeout if process completes before timeout", async () => {
      let exitCallback:
        | ((code: number | null, signal: string | null) => void)
        | null = null;
      const mockProcess = createMockProcess();
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

      const sessionId = "test-session-id";
      const onTimeout = vi.fn();
      const timeoutMs = 5000;

      processManager.on("processTimeout", onTimeout);
      await processManager.spawn(sessionId, "node", ["test.mjs"], {
        timeoutMs,
      });

      // Process completes before timeout
      vi.advanceTimersByTime(3000);
      exitCallback?.(0, null);

      // Fast forward past original timeout
      vi.advanceTimersByTime(3000);

      expect(onTimeout).not.toHaveBeenCalled();
    });
  });

  describe("getProcess", () => {
    it("should return process for existing session", async () => {
      const sessionId = "test-session-id";
      await processManager.spawn(sessionId, "node", ["test.mjs"]);

      const process = processManager.getProcess(sessionId);

      expect(process).not.toBeNull();
      expect(process?.pid).toBe(12345);
    });

    it("should return null for non-existent session", () => {
      const process = processManager.getProcess("nonexistent");

      expect(process).toBeNull();
    });
  });

  describe("getAllProcesses", () => {
    it("should return all running processes", async () => {
      await processManager.spawn("session-1", "node", ["test1.mjs"]);
      await processManager.spawn("session-2", "node", ["test2.mjs"]);

      const processes = processManager.getAllProcesses();

      expect(processes.size).toBe(2);
      expect(processes.has("session-1")).toBe(true);
      expect(processes.has("session-2")).toBe(true);
    });

    it("should return empty map when no processes", () => {
      const processes = processManager.getAllProcesses();

      expect(processes.size).toBe(0);
    });
  });

  describe("killAll", () => {
    it("should terminate all running processes", async () => {
      const mockProcess1 = createMockProcess();
      const mockProcess2 = createMockProcess();
      mockProcess2.pid = 12346;

      mockSpawn
        .mockReturnValueOnce(mockProcess1 as unknown as ChildProcess)
        .mockReturnValueOnce(mockProcess2 as unknown as ChildProcess);

      await processManager.spawn("session-1", "node", ["test1.mjs"]);
      await processManager.spawn("session-2", "node", ["test2.mjs"]);

      await processManager.killAll();

      expect(mockProcess1.kill).toHaveBeenCalled();
      expect(mockProcess2.kill).toHaveBeenCalled();
    });

    it("should clear all processes from tracking", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      await processManager.spawn("session-1", "node", ["test1.mjs"]);

      await processManager.killAll();

      const processes = processManager.getAllProcesses();
      expect(processes.size).toBe(0);
    });
  });
});
