/**
 * Session Manager - Session Lifecycle Management
 * Phase 5: TDD Green - Implementation
 *
 * @see docs/30-workflows/claude-code-cli-integration/outputs/phase-2/architecture-design.md
 */

import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";
import type { SessionStatus } from "@repo/shared";
import { ProcessManager } from "./ProcessManager";

export interface SessionManagerConfig {
  maxSessions?: number;
  defaultTimeoutMs?: number;
}

export interface CreateSessionOptions {
  skillName: string;
  scriptPath: string;
  args: string[];
  cwd?: string;
  timeoutMs?: number;
}

export interface DestroySessionOptions {
  force?: boolean;
}

export interface ListSessionsOptions {
  status?: SessionStatus;
}

export interface Session {
  id: string;
  skillName: string;
  scriptPath: string;
  args: string[];
  status: SessionStatus;
  startedAt: number;
  completedAt: number | null;
  exitCode: number | null;
  output: string[];
  error: string[];
}

/**
 * Terminal status values (session is finished)
 */
const TERMINAL_STATUSES: SessionStatus[] = [
  "completed",
  "failed",
  "terminated",
];

/**
 * Session limit exceeded error
 */
export class SessionLimitExceededError extends Error {
  public readonly code = "SESSION_LIMIT_EXCEEDED";

  constructor(maxSessions: number, currentSessions: number) {
    super(
      `Session limit exceeded: ${currentSessions}/${maxSessions} sessions active`,
    );
    this.name = "SessionLimitExceededError";
    Object.setPrototypeOf(this, SessionLimitExceededError.prototype);
  }
}

/**
 * Manages session lifecycle including creation, tracking, and cleanup
 */
export class SessionManager extends EventEmitter {
  private sessions: Map<string, Session> = new Map();
  private processManager: ProcessManager;
  private maxSessions: number;
  private defaultTimeoutMs: number;

  constructor(config?: SessionManagerConfig) {
    super();
    this.maxSessions = config?.maxSessions ?? 10;
    this.defaultTimeoutMs = config?.defaultTimeoutMs ?? 5 * 60 * 1000; // 5 minutes
    this.processManager = new ProcessManager();

    // Set up process manager event handlers
    this.setupProcessManagerEvents();
  }

  /**
   * Create a new session
   */
  async createSession(options: CreateSessionOptions): Promise<Session> {
    // Check if we need to evict a completed session (LRU)
    // Use total sessions count, not just active sessions
    if (this.sessions.size >= this.maxSessions) {
      // Try to evict a completed session (LRU)
      const evicted = this.tryEvictCompletedSession();

      if (!evicted) {
        // All sessions are active, cannot create new one
        throw new SessionLimitExceededError(
          this.maxSessions,
          this.sessions.size,
        );
      }
    }

    // Generate unique session ID
    const sessionId = uuidv4();

    // Create session object
    const session: Session = {
      id: sessionId,
      skillName: options.skillName,
      scriptPath: options.scriptPath,
      args: options.args,
      status: "pending",
      startedAt: Date.now(),
      completedAt: null,
      exitCode: null,
      output: [],
      error: [],
    };

    // Store session
    this.sessions.set(sessionId, session);

    try {
      // Spawn process
      await this.processManager.spawn(
        sessionId,
        "node",
        [options.scriptPath, ...options.args],
        {
          cwd: options.cwd,
          timeoutMs: options.timeoutMs ?? this.defaultTimeoutMs,
        },
      );

      // Emit session created event
      this.emit("sessionCreated", {
        id: session.id,
        skillName: session.skillName,
        status: session.status,
        startedAt: session.startedAt,
      });

      return session;
    } catch (error) {
      // Remove session if spawn failed
      this.sessions.delete(sessionId);
      throw error;
    }
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * List all sessions, optionally filtered
   */
  listSessions(options?: ListSessionsOptions): Session[] {
    const sessions = Array.from(this.sessions.values());

    if (options?.status) {
      return sessions.filter((s) => s.status === options.status);
    }

    return sessions;
  }

  /**
   * Destroy a session
   */
  async destroySession(
    sessionId: string,
    options?: DestroySessionOptions,
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return false;
    }

    // Kill the process
    await this.processManager.kill(sessionId, {
      force: options?.force,
    });

    // Update session status
    session.status = "terminated";
    session.completedAt = Date.now();

    // Emit session destroyed event
    this.emit("sessionDestroyed", {
      id: session.id,
      status: session.status,
      completedAt: session.completedAt,
    });

    return true;
  }

  /**
   * Update session status
   */
  updateSessionStatus(sessionId: string, status: SessionStatus): void {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    const oldStatus = session.status;
    session.status = status;

    // Set completedAt for terminal statuses
    if (TERMINAL_STATUSES.includes(status) && !session.completedAt) {
      session.completedAt = Date.now();
    }

    // Emit status changed event
    this.emit("statusChanged", {
      sessionId,
      oldStatus,
      newStatus: status,
    });
  }

  /**
   * Append output to a session
   */
  appendOutput(
    sessionId: string,
    type: "stdout" | "stderr",
    content: string,
  ): void {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    if (type === "stdout") {
      session.output.push(content);
    } else {
      session.error.push(content);
    }

    // Emit output event
    this.emit("output", {
      sessionId,
      type,
      content,
    });
  }

  /**
   * Clean up orphaned sessions (process no longer exists)
   */
  async cleanupOrphanedSessions(): Promise<void> {
    for (const [sessionId, session] of this.sessions) {
      // Check if process still exists
      const process = this.processManager.getProcess(sessionId);

      if (!process && !TERMINAL_STATUSES.includes(session.status)) {
        // Process no longer exists, mark as failed
        session.status = "failed";
        session.completedAt = Date.now();
      }
    }
  }

  /**
   * Shutdown all sessions
   */
  async shutdown(): Promise<void> {
    try {
      // Kill all processes
      await this.processManager.killAll();
    } catch {
      // Ignore errors during shutdown
    }

    // Mark all sessions as terminated
    for (const session of this.sessions.values()) {
      if (!TERMINAL_STATUSES.includes(session.status)) {
        session.status = "terminated";
        session.completedAt = Date.now();
      }
    }
  }

  /**
   * Get count of active (non-terminal) sessions
   */
  private getActiveSessionCount(): number {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (!TERMINAL_STATUSES.includes(session.status)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Try to evict a completed session (LRU based on completedAt)
   */
  private tryEvictCompletedSession(): boolean {
    // Find oldest completed session
    let oldestSession: Session | null = null;
    let oldestCompletedAt = Infinity;

    for (const session of this.sessions.values()) {
      if (
        TERMINAL_STATUSES.includes(session.status) &&
        session.completedAt &&
        session.completedAt < oldestCompletedAt
      ) {
        oldestSession = session;
        oldestCompletedAt = session.completedAt;
      }
    }

    if (oldestSession) {
      this.sessions.delete(oldestSession.id);
      return true;
    }

    return false;
  }

  /**
   * Set up process manager event handlers
   */
  private setupProcessManagerEvents(): void {
    // Handle stdout
    this.processManager.on("stdout", (sessionId: string, data: string) => {
      this.appendOutput(sessionId, "stdout", data);
      this.updateSessionStatus(sessionId, "running");
    });

    // Handle stderr
    this.processManager.on("stderr", (sessionId: string, data: string) => {
      this.appendOutput(sessionId, "stderr", data);
    });

    // Handle process terminated
    this.processManager.on(
      "processTerminated",
      (event: { sessionId: string; exitCode?: number; signal?: string }) => {
        const session = this.sessions.get(event.sessionId);
        if (session) {
          session.exitCode = event.exitCode ?? null;

          // Determine final status based on exit code
          if (event.exitCode === 0) {
            this.updateSessionStatus(event.sessionId, "completed");
          } else if (session.status !== "terminated") {
            this.updateSessionStatus(event.sessionId, "failed");
          }
        }
      },
    );

    // Handle process timeout
    this.processManager.on("processTimeout", (event: { sessionId: string }) => {
      this.updateSessionStatus(event.sessionId, "failed");
    });
  }
}
