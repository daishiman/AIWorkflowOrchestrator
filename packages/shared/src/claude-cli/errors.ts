/**
 * Claude CLI Integration - Error Types
 * @module claude-cli/errors
 */

/**
 * Error codes for Claude CLI operations
 */
export const CLAUDE_CLI_ERROR_CODES = {
  // Installation errors
  CLI_NOT_INSTALLED: "CLI_NOT_INSTALLED",
  CLI_VERSION_MISMATCH: "CLI_VERSION_MISMATCH",

  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_SKILL_NAME: "INVALID_SKILL_NAME",
  INVALID_SCRIPT_NAME: "INVALID_SCRIPT_NAME",
  INVALID_SESSION_ID: "INVALID_SESSION_ID",
  PATH_TRAVERSAL_DETECTED: "PATH_TRAVERSAL_DETECTED",

  // Skill errors
  SKILL_NOT_FOUND: "SKILL_NOT_FOUND",
  SCRIPT_NOT_FOUND: "SCRIPT_NOT_FOUND",
  SKILL_PARSE_ERROR: "SKILL_PARSE_ERROR",

  // Session errors
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  SESSION_LIMIT_EXCEEDED: "SESSION_LIMIT_EXCEEDED",
  SESSION_ALREADY_EXISTS: "SESSION_ALREADY_EXISTS",

  // Execution errors
  EXECUTION_FAILED: "EXECUTION_FAILED",
  EXECUTION_TIMEOUT: "EXECUTION_TIMEOUT",
  SPAWN_FAILED: "SPAWN_FAILED",

  // IPC errors
  IPC_VALIDATION_ERROR: "IPC_VALIDATION_ERROR",
  HANDLER_NOT_REGISTERED: "HANDLER_NOT_REGISTERED",

  // General errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
} as const;

export type ClaudeCliErrorCode =
  (typeof CLAUDE_CLI_ERROR_CODES)[keyof typeof CLAUDE_CLI_ERROR_CODES];

/**
 * Structured error for Claude CLI operations
 */
export interface ClaudeCliError {
  code: ClaudeCliErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Error class for Claude CLI operations
 */
export class ClaudeCliException extends Error {
  public readonly code: ClaudeCliErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ClaudeCliErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ClaudeCliException";
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ClaudeCliException.prototype);
  }

  toJSON(): ClaudeCliError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Create a validation error
 */
export function createValidationError(
  message: string,
  details?: Record<string, unknown>,
): ClaudeCliException {
  return new ClaudeCliException(
    CLAUDE_CLI_ERROR_CODES.VALIDATION_ERROR,
    message,
    details,
  );
}

/**
 * Create a session limit exceeded error
 */
export function createSessionLimitError(
  maxSessions: number,
  currentSessions: number,
): ClaudeCliException {
  return new ClaudeCliException(
    CLAUDE_CLI_ERROR_CODES.SESSION_LIMIT_EXCEEDED,
    `Session limit exceeded: ${currentSessions}/${maxSessions}`,
    { maxSessions, currentSessions },
  );
}

/**
 * Create a skill not found error
 */
export function createSkillNotFoundError(
  skillName: string,
): ClaudeCliException {
  return new ClaudeCliException(
    CLAUDE_CLI_ERROR_CODES.SKILL_NOT_FOUND,
    `Skill not found: ${skillName}`,
    { skillName },
  );
}

/**
 * Create a session not found error
 */
export function createSessionNotFoundError(
  sessionId: string,
): ClaudeCliException {
  return new ClaudeCliException(
    CLAUDE_CLI_ERROR_CODES.SESSION_NOT_FOUND,
    `Session not found: ${sessionId}`,
    { sessionId },
  );
}
