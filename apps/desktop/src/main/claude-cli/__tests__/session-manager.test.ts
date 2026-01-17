/**
 * Session Manager Tests
 * Phase 4: TDD Red - All tests should fail until implementation
 *
 * Tests for session lifecycle management
 * @see docs/30-workflows/claude-code-cli-integration/outputs/phase-2/architecture-design.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock ProcessManager
const mockSpawn = vi.fn();
const mockKill = vi.fn();
const mockGetProcess = vi.fn();
const mockKillAll = vi.fn();
const mockProcessOn = vi.fn();

vi.mock("../ProcessManager", () => ({
  ProcessManager: vi.fn().mockImplementation(() => ({
    spawn: mockSpawn,
    kill: mockKill,
    getProcess: mockGetProcess,
    killAll: mockKillAll,
    on: mockProcessOn,
    getAllProcesses: vi.fn().mockReturnValue(new Map()),
  })),
}));

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("550e8400-e29b-41d4-a716-446655440000"),
}));

describe("SessionManager", () => {
  let SessionManager: typeof import("../SessionManager").SessionManager;
  let sessionManager: InstanceType<
    typeof import("../SessionManager").SessionManager
  >;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Default mock implementations
    mockSpawn.mockResolvedValue("550e8400-e29b-41d4-a716-446655440000");
    mockKill.mockResolvedValue(true);
    mockGetProcess.mockReturnValue({ pid: 12345 });

    // Import after mocks
    const module = await import("../SessionManager");
    SessionManager = module.SessionManager;
    sessionManager = new SessionManager({ maxSessions: 10 });
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("createSession", () => {
    it("should create new session with unique ID", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      expect(session.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("should track session metadata", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: ["--verbose"],
      });

      expect(session.skillName).toBe("test-skill");
      expect(session.status).toBe("pending");
      expect(session.startedAt).toBeDefined();
    });

    it("should emit session created event", async () => {
      const onCreated = vi.fn();
      sessionManager.on("sessionCreated", onCreated);

      await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      expect(onCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "550e8400-e29b-41d4-a716-446655440000",
        }),
      );
    });

    it("should start process via ProcessManager", async () => {
      await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: ["arg1", "arg2"],
      });

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.arrayContaining(["arg1", "arg2"]),
        expect.any(Object),
      );
    });

    it("should reject when session limit exceeded", async () => {
      const manager = new SessionManager({ maxSessions: 2 });

      // Create sessions up to limit
      const { v4 } = await import("uuid");
      (v4 as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce("session-1")
        .mockReturnValueOnce("session-2")
        .mockReturnValueOnce("session-3");

      await manager.createSession({
        skillName: "skill-1",
        scriptPath: "/path/1.mjs",
        args: [],
      });

      await manager.createSession({
        skillName: "skill-2",
        scriptPath: "/path/2.mjs",
        args: [],
      });

      await expect(
        manager.createSession({
          skillName: "skill-3",
          scriptPath: "/path/3.mjs",
          args: [],
        }),
      ).rejects.toThrow();
    });

    it("should set initial status to pending", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      expect(session.status).toBe("pending");
    });

    it("should handle process spawn failure", async () => {
      mockSpawn.mockRejectedValue(new Error("Spawn failed"));

      await expect(
        sessionManager.createSession({
          skillName: "test-skill",
          scriptPath: "/path/to/script.mjs",
          args: [],
        }),
      ).rejects.toThrow();
    });
  });

  describe("getSession", () => {
    it("should return existing session", async () => {
      const created = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      const retrieved = sessionManager.getSession(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it("should return undefined for non-existent session", () => {
      const session = sessionManager.getSession("nonexistent-id");

      expect(session).toBeUndefined();
    });

    it("should return session with current status", async () => {
      const created = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      // Simulate status change
      sessionManager.updateSessionStatus(created.id, "running");

      const retrieved = sessionManager.getSession(created.id);

      expect(retrieved?.status).toBe("running");
    });
  });

  describe("listSessions", () => {
    it("should return all active sessions", async () => {
      const { v4 } = await import("uuid");
      (v4 as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce("session-1")
        .mockReturnValueOnce("session-2");

      await sessionManager.createSession({
        skillName: "skill-1",
        scriptPath: "/path/1.mjs",
        args: [],
      });

      await sessionManager.createSession({
        skillName: "skill-2",
        scriptPath: "/path/2.mjs",
        args: [],
      });

      const sessions = sessionManager.listSessions();

      expect(sessions).toHaveLength(2);
    });

    it("should filter by status", async () => {
      const { v4 } = await import("uuid");
      (v4 as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce("session-1")
        .mockReturnValueOnce("session-2");

      await sessionManager.createSession({
        skillName: "skill-1",
        scriptPath: "/path/1.mjs",
        args: [],
      });

      const session2 = await sessionManager.createSession({
        skillName: "skill-2",
        scriptPath: "/path/2.mjs",
        args: [],
      });

      // Mark one as running
      sessionManager.updateSessionStatus(session2.id, "running");

      const runningSessions = sessionManager.listSessions({
        status: "running",
      });

      expect(runningSessions).toHaveLength(1);
      expect(runningSessions[0]?.id).toBe("session-2");
    });

    it("should return empty array when no sessions", () => {
      const sessions = sessionManager.listSessions();

      expect(sessions).toHaveLength(0);
    });
  });

  describe("destroySession", () => {
    it("should terminate and clean up session", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      await sessionManager.destroySession(session.id);

      expect(mockKill).toHaveBeenCalledWith(session.id, expect.any(Object));
    });

    it("should emit session destroyed event", async () => {
      const onDestroyed = vi.fn();
      sessionManager.on("sessionDestroyed", onDestroyed);

      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      await sessionManager.destroySession(session.id);

      expect(onDestroyed).toHaveBeenCalledWith(
        expect.objectContaining({
          id: session.id,
        }),
      );
    });

    it("should handle already destroyed session", async () => {
      const result = await sessionManager.destroySession("nonexistent");

      expect(result).toBe(false);
    });

    it("should update session status to terminated", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      await sessionManager.destroySession(session.id);

      const destroyed = sessionManager.getSession(session.id);
      expect(destroyed?.status).toBe("terminated");
    });

    it("should set completedAt timestamp", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      const beforeDestroy = Date.now();
      await sessionManager.destroySession(session.id);
      const afterDestroy = Date.now();

      const destroyed = sessionManager.getSession(session.id);
      expect(destroyed?.completedAt).toBeGreaterThanOrEqual(beforeDestroy);
      expect(destroyed?.completedAt).toBeLessThanOrEqual(afterDestroy);
    });

    it("should support force termination", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      await sessionManager.destroySession(session.id, { force: true });

      expect(mockKill).toHaveBeenCalledWith(
        session.id,
        expect.objectContaining({
          force: true,
        }),
      );
    });
  });

  describe("parallel sessions", () => {
    it("should manage multiple concurrent sessions", async () => {
      const { v4 } = await import("uuid");
      (v4 as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce("session-1")
        .mockReturnValueOnce("session-2")
        .mockReturnValueOnce("session-3");

      const sessions = await Promise.all([
        sessionManager.createSession({
          skillName: "skill-1",
          scriptPath: "/path/1.mjs",
          args: [],
        }),
        sessionManager.createSession({
          skillName: "skill-2",
          scriptPath: "/path/2.mjs",
          args: [],
        }),
        sessionManager.createSession({
          skillName: "skill-3",
          scriptPath: "/path/3.mjs",
          args: [],
        }),
      ]);

      expect(sessions).toHaveLength(3);
      expect(sessionManager.listSessions()).toHaveLength(3);
    });

    it("should isolate session state", async () => {
      const { v4 } = await import("uuid");
      (v4 as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce("session-1")
        .mockReturnValueOnce("session-2");

      const session1 = await sessionManager.createSession({
        skillName: "skill-1",
        scriptPath: "/path/1.mjs",
        args: [],
      });

      const session2 = await sessionManager.createSession({
        skillName: "skill-2",
        scriptPath: "/path/2.mjs",
        args: [],
      });

      // Update only session 1
      sessionManager.updateSessionStatus(session1.id, "completed");
      sessionManager.appendOutput(session1.id, "stdout", "output from 1");

      const retrieved1 = sessionManager.getSession(session1.id);
      const retrieved2 = sessionManager.getSession(session2.id);

      expect(retrieved1?.status).toBe("completed");
      expect(retrieved2?.status).toBe("pending");
      expect(retrieved1?.output).toContain("output from 1");
      expect(retrieved2?.output).toHaveLength(0);
    });

    it("should handle session limit", async () => {
      const manager = new SessionManager({ maxSessions: 2 });
      const { v4 } = await import("uuid");
      let counter = 0;
      (v4 as ReturnType<typeof vi.fn>).mockImplementation(
        () => `session-${++counter}`,
      );

      await manager.createSession({
        skillName: "skill-1",
        scriptPath: "/path/1.mjs",
        args: [],
      });

      await manager.createSession({
        skillName: "skill-2",
        scriptPath: "/path/2.mjs",
        args: [],
      });

      await expect(
        manager.createSession({
          skillName: "skill-3",
          scriptPath: "/path/3.mjs",
          args: [],
        }),
      ).rejects.toMatchObject({
        code: "SESSION_LIMIT_EXCEEDED",
      });
    });

    it("should allow new session after one completes", async () => {
      const manager = new SessionManager({ maxSessions: 2 });
      const { v4 } = await import("uuid");
      let counter = 0;
      (v4 as ReturnType<typeof vi.fn>).mockImplementation(
        () => `session-${++counter}`,
      );

      const session1 = await manager.createSession({
        skillName: "skill-1",
        scriptPath: "/path/1.mjs",
        args: [],
      });

      await manager.createSession({
        skillName: "skill-2",
        scriptPath: "/path/2.mjs",
        args: [],
      });

      // Destroy session 1
      await manager.destroySession(session1.id);

      // Should now allow new session
      const session3 = await manager.createSession({
        skillName: "skill-3",
        scriptPath: "/path/3.mjs",
        args: [],
      });

      expect(session3).toBeDefined();
    });
  });

  describe("cleanup", () => {
    it("should clean up orphaned sessions", async () => {
      const { v4 } = await import("uuid");
      (v4 as ReturnType<typeof vi.fn>).mockReturnValue("session-1");

      await sessionManager.createSession({
        skillName: "skill-1",
        scriptPath: "/path/1.mjs",
        args: [],
      });

      // Simulate process no longer exists
      mockGetProcess.mockReturnValue(null);

      await sessionManager.cleanupOrphanedSessions();

      const session = sessionManager.getSession("session-1");
      expect(session?.status).toBe("failed");
    });

    it("should clean up on application exit", async () => {
      const { v4 } = await import("uuid");
      (v4 as ReturnType<typeof vi.fn>).mockReturnValue("session-1");

      await sessionManager.createSession({
        skillName: "skill-1",
        scriptPath: "/path/1.mjs",
        args: [],
      });

      await sessionManager.shutdown();

      expect(mockKillAll).toHaveBeenCalled();
    });

    it("should handle cleanup errors", async () => {
      mockKillAll.mockRejectedValue(new Error("Cleanup failed"));

      // Should not throw
      await expect(sessionManager.shutdown()).resolves.not.toThrow();
    });

    it("should mark all sessions as terminated on shutdown", async () => {
      const { v4 } = await import("uuid");
      (v4 as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce("session-1")
        .mockReturnValueOnce("session-2");

      await sessionManager.createSession({
        skillName: "skill-1",
        scriptPath: "/path/1.mjs",
        args: [],
      });

      await sessionManager.createSession({
        skillName: "skill-2",
        scriptPath: "/path/2.mjs",
        args: [],
      });

      await sessionManager.shutdown();

      const sessions = sessionManager.listSessions();
      expect(sessions.every((s) => s.status === "terminated")).toBe(true);
    });
  });

  describe("updateSessionStatus", () => {
    it("should update session status", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      sessionManager.updateSessionStatus(session.id, "running");

      const updated = sessionManager.getSession(session.id);
      expect(updated?.status).toBe("running");
    });

    it("should emit status changed event", async () => {
      const onStatusChanged = vi.fn();
      sessionManager.on("statusChanged", onStatusChanged);

      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      sessionManager.updateSessionStatus(session.id, "running");

      expect(onStatusChanged).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: session.id,
          oldStatus: "pending",
          newStatus: "running",
        }),
      );
    });

    it("should set completedAt when status becomes terminal", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      sessionManager.updateSessionStatus(session.id, "completed");

      const updated = sessionManager.getSession(session.id);
      expect(updated?.completedAt).toBeDefined();
    });

    it("should ignore update for non-existent session", () => {
      // Should not throw
      expect(() =>
        sessionManager.updateSessionStatus("nonexistent", "running"),
      ).not.toThrow();
    });
  });

  describe("appendOutput", () => {
    it("should append stdout output", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      sessionManager.appendOutput(session.id, "stdout", "line 1");
      sessionManager.appendOutput(session.id, "stdout", "line 2");

      const updated = sessionManager.getSession(session.id);
      expect(updated?.output).toContain("line 1");
      expect(updated?.output).toContain("line 2");
    });

    it("should append stderr output", async () => {
      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      sessionManager.appendOutput(session.id, "stderr", "error message");

      const updated = sessionManager.getSession(session.id);
      expect(updated?.error).toContain("error message");
    });

    it("should emit output event", async () => {
      const onOutput = vi.fn();
      sessionManager.on("output", onOutput);

      const session = await sessionManager.createSession({
        skillName: "test-skill",
        scriptPath: "/path/to/script.mjs",
        args: [],
      });

      sessionManager.appendOutput(session.id, "stdout", "output");

      expect(onOutput).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: session.id,
          type: "stdout",
          content: "output",
        }),
      );
    });
  });

  describe("LRU eviction", () => {
    it("should evict oldest completed session when limit reached", async () => {
      const manager = new SessionManager({ maxSessions: 2 });
      const { v4 } = await import("uuid");
      let counter = 0;
      (v4 as ReturnType<typeof vi.fn>).mockImplementation(
        () => `session-${++counter}`,
      );

      const session1 = await manager.createSession({
        skillName: "skill-1",
        scriptPath: "/path/1.mjs",
        args: [],
      });

      // Mark session 1 as completed
      manager.updateSessionStatus(session1.id, "completed");

      await manager.createSession({
        skillName: "skill-2",
        scriptPath: "/path/2.mjs",
        args: [],
      });

      // Now at limit with one completed session
      // Creating third should evict completed session-1
      await manager.createSession({
        skillName: "skill-3",
        scriptPath: "/path/3.mjs",
        args: [],
      });

      const sessions = manager.listSessions();
      expect(sessions.find((s) => s.id === "session-1")).toBeUndefined();
    });

    it("should not evict running sessions", async () => {
      const manager = new SessionManager({ maxSessions: 2 });
      const { v4 } = await import("uuid");
      let counter = 0;
      (v4 as ReturnType<typeof vi.fn>).mockImplementation(
        () => `session-${++counter}`,
      );

      const session1 = await manager.createSession({
        skillName: "skill-1",
        scriptPath: "/path/1.mjs",
        args: [],
      });

      manager.updateSessionStatus(session1.id, "running");

      await manager.createSession({
        skillName: "skill-2",
        scriptPath: "/path/2.mjs",
        args: [],
      });

      // Should reject since both are non-evictable
      await expect(
        manager.createSession({
          skillName: "skill-3",
          scriptPath: "/path/3.mjs",
          args: [],
        }),
      ).rejects.toThrow();
    });
  });
});
