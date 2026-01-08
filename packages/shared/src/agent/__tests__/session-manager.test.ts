/**
 * Session Manager Tests
 * Phase 4: TDD Red - All tests should fail until implementation
 *
 * Tests for session management functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SessionManager } from "../session-manager";
import { AgentSessionError, AgentErrorCode } from "../errors";

// Mock crypto.randomUUID for deterministic testing
const mockRandomUUID = vi.fn(() => "test-uuid-1234-5678-9abc-def012345678");
vi.mock("crypto", () => ({
  randomUUID: () => mockRandomUUID(),
}));

describe("SessionManager", () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-08T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("createSession", () => {
    it("should create a new session with unique ID", () => {
      const sessionId = sessionManager.createSession();
      expect(sessionId).toBe("test-uuid-1234-5678-9abc-def012345678");
    });

    it("should create session with correct initial state", () => {
      const sessionId = sessionManager.createSession();
      const session = sessionManager.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
      expect(session?.context.messageIds).toEqual([]);
      expect(session?.createdAt).toBe(Date.now());
      expect(session?.lastAccessedAt).toBe(Date.now());
    });

    it("should enforce maximum session limit", () => {
      // Create 10 sessions (max limit)
      for (let i = 0; i < 10; i++) {
        mockRandomUUID.mockReturnValueOnce(`session-${i}`);
        sessionManager.createSession();
      }

      // 11th session should evict oldest
      mockRandomUUID.mockReturnValueOnce("session-10");
      const newSessionId = sessionManager.createSession();

      expect(newSessionId).toBe("session-10");
      expect(sessionManager.getSession("session-0")).toBeUndefined();
    });

    it("should evict oldest session when limit exceeded", () => {
      // Create 10 sessions with different timestamps
      for (let i = 0; i < 10; i++) {
        mockRandomUUID.mockReturnValueOnce(`session-${i}`);
        sessionManager.createSession();
        vi.advanceTimersByTime(1000);
      }

      // Create 11th session
      mockRandomUUID.mockReturnValueOnce("session-10");
      sessionManager.createSession();

      // Oldest session should be evicted
      expect(sessionManager.getSession("session-0")).toBeUndefined();
      expect(sessionManager.getSession("session-10")).toBeDefined();
    });
  });

  describe("getSession", () => {
    it("should return session by ID", () => {
      const sessionId = sessionManager.createSession();
      const session = sessionManager.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
    });

    it("should return undefined for non-existent session", () => {
      const session = sessionManager.getSession("non-existent-id");
      expect(session).toBeUndefined();
    });

    it("should update lastAccessedAt on access", () => {
      const sessionId = sessionManager.createSession();
      const initialTime = Date.now();

      vi.advanceTimersByTime(5000);

      const session = sessionManager.getSession(sessionId);
      expect(session?.lastAccessedAt).toBe(initialTime + 5000);
    });
  });

  describe("resumeSession", () => {
    it("should resume existing session", () => {
      const sessionId = sessionManager.createSession();
      expect(() => sessionManager.resumeSession(sessionId)).not.toThrow();
    });

    it("should throw SESSION_NOT_FOUND for non-existent session", () => {
      expect(() =>
        sessionManager.resumeSession("non-existent-id"),
      ).toThrowError(AgentSessionError);
    });

    it("should throw error with SESSION_NOT_FOUND code", () => {
      try {
        sessionManager.resumeSession("non-existent-id");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AgentSessionError);
        expect((error as AgentSessionError).code).toBe(
          AgentErrorCode.SESSION_NOT_FOUND,
        );
      }
    });

    it("should update lastAccessedAt on resume", () => {
      const sessionId = sessionManager.createSession();
      const initialTime = Date.now();

      vi.advanceTimersByTime(10000);

      sessionManager.resumeSession(sessionId);
      const session = sessionManager.getSession(sessionId);
      expect(session?.lastAccessedAt).toBe(initialTime + 10000);
    });
  });

  describe("destroySession", () => {
    it("should destroy existing session", () => {
      const sessionId = sessionManager.createSession();
      sessionManager.destroySession(sessionId);
      expect(sessionManager.getSession(sessionId)).toBeUndefined();
    });

    it("should not throw for non-existent session", () => {
      expect(() =>
        sessionManager.destroySession("non-existent-id"),
      ).not.toThrow();
    });

    it("should allow creating new session after destroy", () => {
      const sessionId1 = sessionManager.createSession();
      sessionManager.destroySession(sessionId1);

      mockRandomUUID.mockReturnValueOnce("new-session-id");
      const sessionId2 = sessionManager.createSession();

      expect(sessionId2).toBe("new-session-id");
      expect(sessionManager.getSession(sessionId2)).toBeDefined();
    });
  });

  describe("addMessageToSession", () => {
    it("should add message ID to session context", () => {
      const sessionId = sessionManager.createSession();
      sessionManager.addMessageToSession(sessionId, "message-1");

      const session = sessionManager.getSession(sessionId);
      expect(session?.context.messageIds).toContain("message-1");
    });

    it("should add multiple messages to session", () => {
      const sessionId = sessionManager.createSession();
      sessionManager.addMessageToSession(sessionId, "message-1");
      sessionManager.addMessageToSession(sessionId, "message-2");
      sessionManager.addMessageToSession(sessionId, "message-3");

      const session = sessionManager.getSession(sessionId);
      expect(session?.context.messageIds).toEqual([
        "message-1",
        "message-2",
        "message-3",
      ]);
    });

    it("should throw for non-existent session", () => {
      expect(() =>
        sessionManager.addMessageToSession("non-existent", "message-1"),
      ).toThrowError(AgentSessionError);
    });

    it("should update lastAccessedAt when adding message", () => {
      const sessionId = sessionManager.createSession();
      const initialTime = Date.now();

      vi.advanceTimersByTime(3000);

      sessionManager.addMessageToSession(sessionId, "message-1");
      const session = sessionManager.getSession(sessionId);
      expect(session?.lastAccessedAt).toBe(initialTime + 3000);
    });
  });

  describe("getSessionCount", () => {
    it("should return 0 for no sessions", () => {
      expect(sessionManager.getSessionCount()).toBe(0);
    });

    it("should return correct count after creating sessions", () => {
      mockRandomUUID.mockReturnValueOnce("session-1");
      sessionManager.createSession();
      expect(sessionManager.getSessionCount()).toBe(1);

      mockRandomUUID.mockReturnValueOnce("session-2");
      sessionManager.createSession();
      expect(sessionManager.getSessionCount()).toBe(2);
    });

    it("should return correct count after destroying sessions", () => {
      mockRandomUUID.mockReturnValueOnce("session-1");
      const sessionId = sessionManager.createSession();
      expect(sessionManager.getSessionCount()).toBe(1);

      sessionManager.destroySession(sessionId);
      expect(sessionManager.getSessionCount()).toBe(0);
    });
  });

  describe("clearAllSessions", () => {
    it("should remove all sessions", () => {
      for (let i = 0; i < 5; i++) {
        mockRandomUUID.mockReturnValueOnce(`session-${i}`);
        sessionManager.createSession();
      }

      expect(sessionManager.getSessionCount()).toBe(5);

      sessionManager.clearAllSessions();

      expect(sessionManager.getSessionCount()).toBe(0);
    });
  });
});
