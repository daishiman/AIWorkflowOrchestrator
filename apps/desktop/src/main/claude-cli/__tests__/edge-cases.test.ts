/**
 * Edge Cases Tests
 * Phase 6: Test Enrichment - Boundary values and edge cases
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

// Mock fs for SkillScanner
vi.mock("fs", async (importOriginal) => {
  const original = await importOriginal<typeof import("fs")>();
  return {
    ...original,
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
    statSync: vi.fn(),
  };
});

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

describe("Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("ProcessManager Edge Cases", () => {
    let processManager: ProcessManager;

    beforeEach(() => {
      mockSpawn.mockReturnValue(createMockProcess() as unknown as ChildProcess);
      processManager = new ProcessManager();
    });

    it("should handle empty command arguments", async () => {
      const sessionId = "test-session";
      const result = await processManager.spawn(sessionId, "node", []);

      expect(result).toBe(sessionId);
      expect(mockSpawn).toHaveBeenCalledWith(
        "node",
        [],
        expect.objectContaining({
          shell: false,
        }),
      );
    });

    it("should handle very long command arguments", async () => {
      const sessionId = "test-session";
      const longArg = "a".repeat(10000);
      const args = [longArg];

      const result = await processManager.spawn(sessionId, "node", args);

      expect(result).toBe(sessionId);
      expect(mockSpawn).toHaveBeenCalledWith("node", args, expect.any(Object));
    });

    it("should handle special characters in arguments", async () => {
      const sessionId = "test-session";
      const specialArgs = [
        "--path=/tmp/test with spaces/file.txt",
        '--message="Hello, World!"',
        "--regex=^[a-z]+$",
        "--env=NODE_ENV=development",
      ];

      const result = await processManager.spawn(sessionId, "node", specialArgs);

      expect(result).toBe(sessionId);
      expect(mockSpawn).toHaveBeenCalledWith(
        "node",
        specialArgs,
        expect.any(Object),
      );
    });

    it("should handle unicode characters in arguments", async () => {
      const sessionId = "test-session";
      const unicodeArgs = [
        "--message=こんにちは世界",
        "--emoji=🚀",
        "--chinese=你好",
      ];

      const result = await processManager.spawn(sessionId, "node", unicodeArgs);

      expect(result).toBe(sessionId);
      expect(mockSpawn).toHaveBeenCalledWith(
        "node",
        unicodeArgs,
        expect.any(Object),
      );
    });

    it("should handle maximum concurrent processes tracking", async () => {
      // Spawn multiple processes
      for (let i = 0; i < 10; i++) {
        const mockProcess = createMockProcess(12345 + i);
        mockSpawn.mockReturnValueOnce(mockProcess as unknown as ChildProcess);
        await processManager.spawn(`session-${i}`, "node", ["test.mjs"]);
      }

      const allProcesses = processManager.getAllProcesses();
      expect(allProcesses.size).toBe(10);
    });

    it("should handle session ID with special characters", async () => {
      const specialSessionIds = [
        "session-with-dashes",
        "session_with_underscores",
        "session.with.dots",
        "session:with:colons",
      ];

      for (const sessionId of specialSessionIds) {
        mockSpawn.mockReturnValueOnce(
          createMockProcess() as unknown as ChildProcess,
        );
        const result = await processManager.spawn(sessionId, "node", [
          "test.mjs",
        ]);
        expect(result).toBe(sessionId);
      }
    });

    it("should handle very short timeout", async () => {
      vi.useFakeTimers();

      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const sessionId = "test-session";
      const onTimeout = vi.fn();

      processManager.on("processTimeout", onTimeout);
      await processManager.spawn(sessionId, "node", ["test.mjs"], {
        timeoutMs: 1,
      });

      vi.advanceTimersByTime(10);

      expect(onTimeout).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it("should handle zero timeout (no timeout)", async () => {
      vi.useFakeTimers();

      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);

      const sessionId = "test-session";
      const onTimeout = vi.fn();

      processManager.on("processTimeout", onTimeout);
      await processManager.spawn(sessionId, "node", ["test.mjs"], {
        timeoutMs: 0,
      });

      // Advance time significantly
      vi.advanceTimersByTime(60000);

      // No timeout should be triggered with 0ms (disabled)
      // Note: Implementation may treat 0 as "no timeout"
      const process = processManager.getProcess(sessionId);
      expect(process).not.toBeNull();

      vi.useRealTimers();
    });
  });

  describe("SessionManager Edge Cases", () => {
    let sessionManager: SessionManager;

    beforeEach(() => {
      mockSpawn.mockReturnValue(createMockProcess() as unknown as ChildProcess);
      sessionManager = new SessionManager({ maxSessions: 3 });
    });

    it("should handle maximum session limit", async () => {
      // Create max sessions
      for (let i = 0; i < 3; i++) {
        await sessionManager.createSession({
          skillName: `skill-${i}`,
          scriptPath: `/path/to/script-${i}.mjs`,
          args: [],
        });
      }

      // Try to create one more
      await expect(
        sessionManager.createSession({
          skillName: "skill-overflow",
          scriptPath: "/path/to/overflow.mjs",
          args: [],
        }),
      ).rejects.toThrow();
    });

    it("should handle rapid create/destroy cycles", async () => {
      for (let i = 0; i < 5; i++) {
        const mockProcess = createMockProcess(12345 + i);
        mockSpawn.mockReturnValueOnce(mockProcess as unknown as ChildProcess);
        const session = await sessionManager.createSession({
          skillName: `skill-${i}`,
          scriptPath: `/path/to/script-${i}.mjs`,
          args: [],
        });

        await sessionManager.destroySession(session.id);
      }

      const sessions = sessionManager.listSessions();
      // Destroyed sessions may remain with terminated status
      sessions.forEach((session) => {
        expect(session.status).toBe("terminated");
      });
    });

    it("should handle empty skill name gracefully", async () => {
      // Implementation does not validate empty skill names
      const session = await sessionManager.createSession({
        skillName: "",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      expect(session).toBeDefined();
      expect(session.skillName).toBe("");
    });

    it("should handle empty script path gracefully", async () => {
      // Implementation does not validate empty script paths
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "",
        args: [],
      });

      expect(session).toBeDefined();
      expect(session.scriptPath).toBe("");
    });

    it("should handle very long skill names", async () => {
      const longSkillName = "s".repeat(256);
      const session = await sessionManager.createSession({
        skillName: longSkillName,
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      expect(session.skillName).toBe(longSkillName);
    });

    it("should handle many arguments", async () => {
      const manyArgs = Array.from({ length: 100 }, (_, i) => `--arg${i}=value`);
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: manyArgs,
      });

      expect(session.args).toEqual(manyArgs);
    });

    it("should handle session with special characters in ID", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      // Session ID should be a valid UUID format
      expect(session.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it("should handle getSession with non-existent ID", () => {
      const session = sessionManager.getSession("non-existent-id");
      expect(session).toBeUndefined();
    });

    it("should handle destroySession with non-existent ID", async () => {
      const result = await sessionManager.destroySession("non-existent-id");
      expect(result).toBe(false);
    });
  });

  describe("SkillScanner Edge Cases", () => {
    let skillScanner: SkillScanner;
    const basePath = "/home/user/.claude/skills";

    beforeEach(async () => {
      skillScanner = new SkillScanner({ basePath });
    });

    it("should throw when filtering without scanning first", () => {
      // Filter requires scan to be performed first
      expect(() => skillScanner.filter({})).toThrow(
        /Scan must be performed before filtering/i,
      );
    });

    it("should return path for valid skill name without cache", () => {
      // Without cache, resolveSkillPath returns the constructed path
      const path = skillScanner.resolveSkillPath("valid-skill");
      expect(path).toBe(`${basePath}/valid-skill`);
    });

    it("should throw for invalid skill names", () => {
      // Path traversal attempts should throw
      expect(() => skillScanner.resolveSkillPath("../etc/passwd")).toThrow();
      expect(() => skillScanner.resolveSkillPath("skill/nested")).toThrow();
      expect(() => skillScanner.resolveSkillPath("")).toThrow();
    });
  });

  describe("Boundary Value Tests", () => {
    it("should handle minimum values", () => {
      const sessionManager = new SessionManager({ maxSessions: 1 });
      expect(sessionManager).toBeDefined();
    });

    it("should handle large numbers safely", () => {
      const sessionManager = new SessionManager({
        maxSessions: Number.MAX_SAFE_INTEGER,
      });
      expect(sessionManager).toBeDefined();
    });

    it("should handle negative values gracefully", () => {
      // Should handle or reject negative maxSessions
      expect(() => new SessionManager({ maxSessions: -1 })).not.toThrow();
    });

    it("should handle floating point numbers", () => {
      // Should truncate or handle floating point
      expect(() => new SessionManager({ maxSessions: 3.7 })).not.toThrow();
    });
  });
});
