/**
 * Claude CLI IPC Handler - Main Process Handler Registration
 * Phase 5: TDD Green - Implementation
 *
 * @see docs/30-workflows/claude-code-cli-integration/outputs/phase-2/ipc-api-specification.md
 */

import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from "electron";
import { ZodError } from "zod";
import { ClaudeCliManager } from "./ClaudeCliManager";
import {
  validateIpcSender as validateIpcSenderFull,
  toIPCValidationError as toIPCValidationErrorFull,
} from "../infrastructure/security/ipc-validator";

// Simplified type for test compatibility
type SimpleSender = { id: number };
type SimpleValidationResult = { valid: boolean; reason?: string };

// Type-safe wrappers that match test expectations
const validateIpcSender = validateIpcSenderFull as unknown as (
  sender: SimpleSender,
) => SimpleValidationResult;
const toIPCValidationError = toIPCValidationErrorFull as unknown as (
  result: SimpleValidationResult,
) => { code: string; message: string };
import {
  listSkillsRequestSchema,
  getSkillDetailRequestSchema,
  executeScriptRequestSchema,
  terminateSessionRequestSchema,
  getSessionRequestSchema,
} from "@repo/shared";
import type {
  ListSkillsRequest,
  GetSkillDetailRequest,
  ExecuteScriptRequest,
  TerminateSessionRequest,
  GetSessionRequest,
} from "@repo/shared";

/**
 * Validation error class for IPC requests
 */
class ValidationError extends Error {
  public readonly code = "VALIDATION_ERROR";
  public readonly details: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * IPC Channel names
 */
const CHANNELS = {
  CHECK_INSTALLATION: "claude-cli:check-installation",
  LIST_SKILLS: "claude-cli:list-skills",
  GET_SKILL_DETAIL: "claude-cli:get-skill-detail",
  EXECUTE_SCRIPT: "claude-cli:execute-script",
  TERMINATE_SESSION: "claude-cli:terminate-session",
  LIST_SESSIONS: "claude-cli:list-sessions",
  GET_SESSION: "claude-cli:get-session",
  // Streaming events (main -> renderer)
  SESSION_OUTPUT: "claude-cli:session-output",
  SESSION_STATUS: "claude-cli:session-status",
} as const;

/**
 * Active manager instance
 */
let manager: ClaudeCliManager | null = null;

/**
 * Main プロセス内の他モジュールが ClaudeCliManager へアクセスするためのゲッター。
 * registerClaudeCliHandlers() 呼び出し前は null を返す。
 */
export function getClaudeCliManager(): ClaudeCliManager | null {
  return manager;
}

/**
 * Main window reference for streaming events
 */
let mainWindow: BrowserWindow | null = null;

/**
 * Get the skills base path from user home directory
 */
function getSkillsBasePath(): string {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  return `${home}/.claude/skills`;
}

/**
 * Validate IPC sender and throw if invalid
 */
function validateSender(event: IpcMainInvokeEvent): void {
  const validation = validateIpcSender(event.sender as SimpleSender);

  if (!validation.valid) {
    const error = toIPCValidationError(validation);
    throw { code: "IPC_VALIDATION_ERROR", message: error.message };
  }
}

/**
 * ZodError-like shape for type checking
 */
interface ZodErrorShape {
  errors: Array<{ message: string }>;
  name: string;
}

/**
 * Extract error messages from a ZodError-like structure
 */
function extractZodErrorMessages(error: unknown): string[] {
  // Check if it has the expected ZodError shape
  if (
    error !== null &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as ZodErrorShape).errors)
  ) {
    return (error as ZodErrorShape).errors.map(
      (e) => e.message || "Unknown error",
    );
  }
  // If we can't extract messages, return generic message
  return [error instanceof Error ? error.message : "Validation failed"];
}

/**
 * Check if an error is a ZodError (robust check that works across module boundaries)
 */
function isZodError(error: unknown): boolean {
  if (error instanceof ZodError) {
    return true;
  }
  // Fallback: check by structure if instanceof fails (can happen in tests)
  return (
    error !== null &&
    typeof error === "object" &&
    "name" in error &&
    (error as { name: string }).name === "ZodError"
  );
}

/**
 * Parse and validate request data using Zod schema
 */
function parseRequest<T>(
  schema: { parse: (data: unknown) => T },
  data: unknown,
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (isZodError(error)) {
      const messages = extractZodErrorMessages(error);
      throw new ValidationError(
        `Invalid request: ${messages.join(", ")}`,
        error,
      );
    }
    throw error;
  }
}

/**
 * Ensure manager is initialized
 */
function getManager(): ClaudeCliManager {
  if (!manager) {
    throw new Error("ClaudeCliManager not initialized");
  }
  return manager;
}

/**
 * Register Claude CLI IPC handlers
 */
export interface ClaudeCliHandlerOptions {
  /** セッション破棄時に呼ばれるコールバック（approval token クリーンアップ等） */
  onSessionDestroyed?: (sessionId: string) => void;
}

export function registerClaudeCliHandlers(
  browserWindow: BrowserWindow,
  options?: ClaudeCliHandlerOptions,
): void {
  mainWindow = browserWindow;

  // Initialize manager
  manager = new ClaudeCliManager({
    skillsBasePath: getSkillsBasePath(),
  });

  // Set up event forwarding to renderer
  setupEventForwarding(options?.onSessionDestroyed);

  // Register handlers
  ipcMain.handle(
    CHANNELS.CHECK_INSTALLATION,
    async (event: IpcMainInvokeEvent) => {
      validateSender(event);
      return getManager().checkInstallation();
    },
  );

  ipcMain.handle(
    CHANNELS.LIST_SKILLS,
    async (event: IpcMainInvokeEvent, request: unknown) => {
      validateSender(event);
      const parsed = parseRequest(
        listSkillsRequestSchema,
        request || {},
      ) as ListSkillsRequest;
      return getManager().listSkills(parsed);
    },
  );

  ipcMain.handle(
    CHANNELS.GET_SKILL_DETAIL,
    async (event: IpcMainInvokeEvent, request: unknown) => {
      validateSender(event);
      const parsed = parseRequest(
        getSkillDetailRequestSchema,
        request,
      ) as GetSkillDetailRequest;
      return getManager().getSkillDetail(parsed);
    },
  );

  ipcMain.handle(
    CHANNELS.EXECUTE_SCRIPT,
    async (event: IpcMainInvokeEvent, request: unknown) => {
      validateSender(event);
      const parsed = parseRequest(
        executeScriptRequestSchema,
        request,
      ) as ExecuteScriptRequest;
      return getManager().executeScript(parsed);
    },
  );

  ipcMain.handle(
    CHANNELS.TERMINATE_SESSION,
    async (event: IpcMainInvokeEvent, request: unknown) => {
      validateSender(event);
      const parsed = parseRequest(
        terminateSessionRequestSchema,
        request,
      ) as TerminateSessionRequest;
      return getManager().terminateSession(parsed);
    },
  );

  ipcMain.handle(CHANNELS.LIST_SESSIONS, async (event: IpcMainInvokeEvent) => {
    validateSender(event);
    return getManager().listSessions();
  });

  ipcMain.handle(
    CHANNELS.GET_SESSION,
    async (event: IpcMainInvokeEvent, request: unknown) => {
      validateSender(event);
      const parsed = parseRequest(
        getSessionRequestSchema,
        request,
      ) as GetSessionRequest;
      return getManager().getSession(parsed);
    },
  );
}

/**
 * Set up event forwarding from manager to renderer
 */
function setupEventForwarding(
  onSessionDestroyed?: (sessionId: string) => void,
): void {
  if (!manager || !mainWindow) {
    return;
  }

  // Forward output events
  manager.on(
    "output",
    (event: { sessionId: string; type: string; content: string }) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(CHANNELS.SESSION_OUTPUT, event);
      }
    },
  );

  // Forward status change events
  manager.on(
    "statusChanged",
    (event: { sessionId: string; oldStatus: string; newStatus: string }) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(CHANNELS.SESSION_STATUS, event);
      }
    },
  );

  // Forward session created events
  manager.on(
    "sessionCreated",
    (event: {
      id: string;
      skillName: string;
      status: string;
      startedAt: number;
    }) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(CHANNELS.SESSION_STATUS, {
          sessionId: event.id,
          newStatus: event.status,
        });
      }
    },
  );

  // Forward session destroyed events + cleanup
  manager.on(
    "sessionDestroyed",
    (event: { id: string; status: string; completedAt: number }) => {
      // セッション終了時のクリーンアップ（approval token 無効化等）
      if (onSessionDestroyed) {
        onSessionDestroyed(event.id);
      }

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(CHANNELS.SESSION_STATUS, {
          sessionId: event.id,
          newStatus: event.status,
        });
      }
    },
  );
}

/**
 * Unregister Claude CLI IPC handlers
 */
export function unregisterClaudeCliHandlers(): void {
  // Remove all handlers
  ipcMain.removeHandler(CHANNELS.CHECK_INSTALLATION);
  ipcMain.removeHandler(CHANNELS.LIST_SKILLS);
  ipcMain.removeHandler(CHANNELS.GET_SKILL_DETAIL);
  ipcMain.removeHandler(CHANNELS.EXECUTE_SCRIPT);
  ipcMain.removeHandler(CHANNELS.TERMINATE_SESSION);
  ipcMain.removeHandler(CHANNELS.LIST_SESSIONS);
  ipcMain.removeHandler(CHANNELS.GET_SESSION);

  // Shutdown manager
  if (manager) {
    manager.shutdown();
    manager = null;
  }

  mainWindow = null;
}
