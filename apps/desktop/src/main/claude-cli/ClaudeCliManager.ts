/**
 * Claude CLI Manager - Facade for CLI Integration
 * Phase 5: TDD Green - Implementation
 *
 * @see docs/30-workflows/claude-code-cli-integration/outputs/phase-2/architecture-design.md
 */

import { EventEmitter } from "events";
import { exec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import type {
  CliInstallationStatus,
  ListSkillsRequest,
  ScanResult,
  GetSkillDetailRequest,
  ClaudeCliSkillDetail,
  ExecuteScriptRequest,
  ExecuteScriptResponse,
  TerminateSessionRequest,
  TerminateSessionResponse,
  SessionSummary,
  GetSessionRequest,
  SessionDetail,
  ClaudeCliResult,
} from "@repo/shared";
import { SkillScanner } from "./SkillScanner";
import { SessionManager, type Session } from "./SessionManager";

const execAsync = promisify(exec);

export interface ClaudeCliManagerConfig {
  skillsBasePath: string;
  maxSessions?: number;
  defaultTimeoutMs?: number;
}

/**
 * Facade for Claude CLI integration
 * Provides a unified API for skill scanning, session management, and script execution
 */
export class ClaudeCliManager extends EventEmitter {
  private config: ClaudeCliManagerConfig;
  private skillScanner: SkillScanner;
  private sessionManager: SessionManager;

  constructor(config: ClaudeCliManagerConfig) {
    super();
    this.config = config;

    // Initialize skill scanner
    this.skillScanner = new SkillScanner({
      basePath: config.skillsBasePath,
    });

    // Initialize session manager
    this.sessionManager = new SessionManager({
      maxSessions: config.maxSessions,
      defaultTimeoutMs: config.defaultTimeoutMs,
    });

    // Forward events from session manager
    this.setupEventForwarding();
  }

  /**
   * Check if Claude CLI is installed
   */
  async checkInstallation(): Promise<ClaudeCliResult<CliInstallationStatus>> {
    try {
      // Try to get Claude CLI version
      const { stdout } = await execAsync("claude --version");
      const version = stdout.trim();

      // Try to find the CLI path
      let cliPath: string | null = null;
      try {
        const { stdout: whichOutput } = await execAsync("which claude");
        cliPath = whichOutput.trim();
      } catch {
        // which command failed, try whereis
        try {
          const { stdout: whereisOutput } = await execAsync("whereis claude");
          const parts = whereisOutput.trim().split(/\s+/);
          if (parts.length > 1) {
            cliPath = parts[1];
          }
        } catch {
          // Unable to find path, but CLI is available
        }
      }

      return {
        success: true,
        data: {
          installed: true,
          version,
          path: cliPath,
          error: null,
        },
      };
    } catch (error) {
      return {
        success: true,
        data: {
          installed: false,
          version: null,
          path: null,
          error: error instanceof Error ? error.message : "CLI not found",
        },
      };
    }
  }

  /**
   * List available skills
   */
  async listSkills(
    request: ListSkillsRequest,
  ): Promise<ClaudeCliResult<ScanResult>> {
    try {
      // Scan skills
      const scanResult = await this.skillScanner.scan({
        forceRefresh: request.forceRefresh,
      });

      // Apply filters if provided
      if (request.filter) {
        const filteredSkills = this.skillScanner.filter(request.filter);
        return {
          success: true,
          data: {
            skills: filteredSkills,
            errors: scanResult.errors,
            scannedAt: scanResult.scannedAt,
          },
        };
      }

      return {
        success: true,
        data: scanResult,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "SCAN_FAILED",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Get skill detail
   */
  async getSkillDetail(
    request: GetSkillDetailRequest,
  ): Promise<ClaudeCliResult<ClaudeCliSkillDetail>> {
    try {
      // Ensure skills are scanned
      await this.skillScanner.scan();

      const detail = await this.skillScanner.getSkillDetail(request.skillName, {
        includeScripts: request.includeScripts,
        includeReferences: request.includeReferences,
      });

      if (!detail) {
        return {
          success: false,
          error: {
            code: "SKILL_NOT_FOUND",
            message: `Skill not found: ${request.skillName}`,
          },
        };
      }

      return {
        success: true,
        data: detail,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "SKILL_NOT_FOUND",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Execute a script
   */
  async executeScript(
    request: ExecuteScriptRequest,
  ): Promise<ClaudeCliResult<ExecuteScriptResponse>> {
    try {
      // Ensure skills are scanned
      await this.skillScanner.scan();

      // Resolve skill path
      const skillPath = this.skillScanner.resolveSkillPath(request.skillName);
      const scriptPath = join(skillPath, "scripts", request.scriptName);

      // Create session
      const session = await this.sessionManager.createSession({
        skillName: request.skillName,
        scriptPath,
        args: request.args || [],
        cwd: request.cwd,
        timeoutMs: request.timeoutMs,
      });

      return {
        success: true,
        data: {
          sessionId: session.id,
          status: session.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "EXECUTION_FAILED",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Terminate a session
   */
  async terminateSession(
    request: TerminateSessionRequest,
  ): Promise<ClaudeCliResult<TerminateSessionResponse>> {
    try {
      const terminated = await this.sessionManager.destroySession(
        request.sessionId,
        {
          force: request.force,
        },
      );

      if (!terminated) {
        return {
          success: false,
          error: {
            code: "SESSION_NOT_FOUND",
            message: `Session not found: ${request.sessionId}`,
          },
        };
      }

      return {
        success: true,
        data: {
          sessionId: request.sessionId,
          terminated: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "TERMINATION_FAILED",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * List all sessions
   */
  async listSessions(): Promise<ClaudeCliResult<SessionSummary[]>> {
    try {
      const sessions = this.sessionManager.listSessions();

      const summaries: SessionSummary[] = sessions.map((s: Session) => ({
        id: s.id,
        skillName: s.skillName,
        status: s.status,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
      }));

      return {
        success: true,
        data: summaries,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "LIST_SESSIONS_FAILED",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Get session detail
   */
  async getSession(
    request: GetSessionRequest,
  ): Promise<ClaudeCliResult<SessionDetail>> {
    try {
      const session = this.sessionManager.getSession(request.sessionId);

      if (!session) {
        return {
          success: false,
          error: {
            code: "SESSION_NOT_FOUND",
            message: `Session not found: ${request.sessionId}`,
          },
        };
      }

      const detail: SessionDetail = {
        id: session.id,
        skillName: session.skillName,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        scriptPath: session.scriptPath,
        args: session.args,
        exitCode: session.exitCode ?? undefined,
        output: session.output,
        error: session.error,
      };

      return {
        success: true,
        data: detail,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "GET_SESSION_FAILED",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Shutdown the manager
   */
  async shutdown(): Promise<void> {
    await this.sessionManager.shutdown();
  }

  /**
   * Set up event forwarding from session manager
   */
  private setupEventForwarding(): void {
    // Forward session events
    this.sessionManager.on("sessionCreated", (event) => {
      this.emit("sessionCreated", event);
    });

    this.sessionManager.on("sessionDestroyed", (event) => {
      this.emit("sessionDestroyed", event);
    });

    this.sessionManager.on("statusChanged", (event) => {
      this.emit("statusChanged", event);
    });

    this.sessionManager.on("output", (event) => {
      this.emit("output", event);
    });
  }
}
