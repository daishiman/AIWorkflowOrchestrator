/**
 * Process Manager - CLI Process Lifecycle Management
 * Phase 5: TDD Green - Implementation
 *
 * @see docs/30-workflows/claude-code-cli-integration/outputs/phase-2/architecture-design.md
 */

import { EventEmitter } from "events";
import { spawn as nodeSpawn, type ChildProcess } from "child_process";

export interface SpawnOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
}

export interface KillOptions {
  gracePeriodMs?: number;
  force?: boolean;
}

/**
 * Internal process tracking data
 */
interface ProcessInfo {
  process: ChildProcess;
  sessionId: string;
  command: string;
  args: string[];
  startedAt: number;
  timeoutId?: NodeJS.Timeout;
}

/**
 * Process started event
 */
export interface ProcessStartedEvent {
  sessionId: string;
  pid: number;
  command: string;
}

/**
 * Process terminated event
 */
export interface ProcessTerminatedEvent {
  sessionId: string;
  exitCode?: number;
  signal?: string;
}

/**
 * Process timeout event
 */
export interface ProcessTimeoutEvent {
  sessionId: string;
  timeoutMs: number;
}

/**
 * Manages CLI process lifecycle including spawn, kill, and timeout handling
 */
export class ProcessManager extends EventEmitter {
  private processes: Map<string, ProcessInfo> = new Map();

  constructor() {
    super();
  }

  /**
   * Spawn a new CLI process
   */
  async spawn(
    sessionId: string,
    command: string,
    args: string[],
    options?: SpawnOptions,
  ): Promise<string> {
    // Check if session already exists
    if (this.processes.has(sessionId)) {
      throw new Error(`Session ${sessionId} already exists`);
    }

    try {
      // Spawn process with security-conscious options
      const childProcess = nodeSpawn(command, args, {
        shell: false,
        stdio: ["pipe", "pipe", "pipe"],
        cwd: options?.cwd,
        env: options?.env ? { ...process.env, ...options.env } : process.env,
      });

      // Store process info
      const processInfo: ProcessInfo = {
        process: childProcess,
        sessionId,
        command,
        args,
        startedAt: Date.now(),
      };

      this.processes.set(sessionId, processInfo);

      // Set up stdout handler
      childProcess.stdout?.on("data", (data: Buffer) => {
        this.emit("stdout", sessionId, data.toString());
      });

      // Set up stderr handler
      childProcess.stderr?.on("data", (data: Buffer) => {
        this.emit("stderr", sessionId, data.toString());
      });

      // Set up exit handler
      childProcess.on("exit", (code, signal) => {
        this.handleProcessExit(sessionId, code, signal);
      });

      // Set up error handler
      childProcess.on("error", (err) => {
        this.handleProcessError(sessionId, err);
      });

      // Set up timeout if specified
      if (options?.timeoutMs) {
        this.setupTimeout(sessionId, options.timeoutMs);
      }

      // Emit process started event
      this.emit("processStarted", {
        sessionId,
        pid: childProcess.pid || 0,
        command,
      } satisfies ProcessStartedEvent);

      return sessionId;
    } catch (error) {
      // Clean up if spawn failed
      this.processes.delete(sessionId);
      throw error;
    }
  }

  /**
   * Kill a process by session ID
   */
  async kill(sessionId: string, options?: KillOptions): Promise<boolean> {
    const processInfo = this.processes.get(sessionId);

    if (!processInfo) {
      return false;
    }

    const { process: childProcess } = processInfo;

    // Clear timeout if exists
    if (processInfo.timeoutId) {
      clearTimeout(processInfo.timeoutId);
    }

    // Send SIGTERM first
    childProcess.kill("SIGTERM");

    // If grace period specified, set up SIGKILL timer
    if (options?.gracePeriodMs) {
      const gracePeriod = options.gracePeriodMs;

      await new Promise<void>((resolve) => {
        const killTimer = setTimeout(() => {
          // Check if process is still running
          if (this.processes.has(sessionId)) {
            childProcess.kill("SIGKILL");
          }
          resolve();
        }, gracePeriod);

        // Clean up timer if process exits before grace period
        childProcess.once("exit", () => {
          clearTimeout(killTimer);
          resolve();
        });
      });
    }

    // Emit terminated event
    this.emit("processTerminated", {
      sessionId,
    } satisfies ProcessTerminatedEvent);

    // Remove from tracking
    this.processes.delete(sessionId);

    return true;
  }

  /**
   * Get process by session ID
   */
  getProcess(sessionId: string): ChildProcess | null {
    const processInfo = this.processes.get(sessionId);
    return processInfo?.process ?? null;
  }

  /**
   * Get all running processes
   */
  getAllProcesses(): Map<string, ChildProcess> {
    const result = new Map<string, ChildProcess>();
    for (const [sessionId, info] of this.processes) {
      result.set(sessionId, info.process);
    }
    return result;
  }

  /**
   * Kill all running processes
   */
  async killAll(): Promise<void> {
    const killPromises: Promise<boolean>[] = [];

    for (const sessionId of this.processes.keys()) {
      killPromises.push(this.kill(sessionId));
    }

    await Promise.all(killPromises);
  }

  /**
   * Set up timeout for a process
   */
  private setupTimeout(sessionId: string, timeoutMs: number): void {
    const processInfo = this.processes.get(sessionId);
    if (!processInfo) return;

    processInfo.timeoutId = setTimeout(() => {
      // Check if process is still running
      if (this.processes.has(sessionId)) {
        // Emit timeout event
        this.emit("processTimeout", {
          sessionId,
          timeoutMs,
        } satisfies ProcessTimeoutEvent);

        // Kill the process
        this.kill(sessionId);
      }
    }, timeoutMs);
  }

  /**
   * Handle process exit
   */
  private handleProcessExit(
    sessionId: string,
    code: number | null,
    signal: NodeJS.Signals | null,
  ): void {
    const processInfo = this.processes.get(sessionId);
    if (!processInfo) return;

    // Clear timeout if exists
    if (processInfo.timeoutId) {
      clearTimeout(processInfo.timeoutId);
    }

    // Emit terminated event
    this.emit("processTerminated", {
      sessionId,
      exitCode: code ?? undefined,
      signal: signal ?? undefined,
    } satisfies ProcessTerminatedEvent);

    // Remove from tracking
    this.processes.delete(sessionId);
  }

  /**
   * Handle process error
   */
  private handleProcessError(sessionId: string, _error: Error): void {
    const processInfo = this.processes.get(sessionId);
    if (!processInfo) return;

    // Clear timeout if exists
    if (processInfo.timeoutId) {
      clearTimeout(processInfo.timeoutId);
    }

    // Emit terminated event with error
    this.emit("processTerminated", {
      sessionId,
    } satisfies ProcessTerminatedEvent);

    // Remove from tracking
    this.processes.delete(sessionId);
  }
}
