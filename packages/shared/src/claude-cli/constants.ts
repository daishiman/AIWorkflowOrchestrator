/**
 * Claude CLI Integration - Constants
 * @module claude-cli/constants
 */

import {
  MAX_SKILL_NAME_LENGTH,
  SKILL_NAME_PATTERN,
} from "../constants/skillName";

/**
 * IPC Channel names for Claude CLI operations
 */
export const CLAUDE_CLI_CHANNELS = {
  CHECK_INSTALLATION: "claude-cli:check-installation",
  LIST_SKILLS: "claude-cli:list-skills",
  GET_SKILL_DETAIL: "claude-cli:get-skill-detail",
  EXECUTE_SCRIPT: "claude-cli:execute-script",
  TERMINATE_SESSION: "claude-cli:terminate-session",
  LIST_SESSIONS: "claude-cli:list-sessions",
  GET_SESSION: "claude-cli:get-session",
  // Streaming events (main -> renderer)
  STREAM_STDOUT: "claude-cli:stream:stdout",
  STREAM_STDERR: "claude-cli:stream:stderr",
  STREAM_STATUS: "claude-cli:stream:status",
  STREAM_COMPLETE: "claude-cli:stream:complete",
  STREAM_ERROR: "claude-cli:stream:error",
} as const;

/**
 * All IPC channel names as a union type
 */
export type ClaudeCliChannel =
  (typeof CLAUDE_CLI_CHANNELS)[keyof typeof CLAUDE_CLI_CHANNELS];

/**
 * Default configuration values
 */
export const CLAUDE_CLI_DEFAULTS = {
  /** Maximum concurrent sessions */
  MAX_SESSIONS: 10,
  /** Default timeout for script execution (5 minutes) */
  DEFAULT_TIMEOUT_MS: 5 * 60 * 1000,
  /** Grace period for process termination (5 seconds) */
  GRACE_PERIOD_MS: 5000,
  /** Maximum skill name length */
  MAX_SKILL_NAME_LENGTH,
  /** Scan cache TTL (5 minutes) */
  SCAN_CACHE_TTL_MS: 5 * 60 * 1000,
} as const;

/**
 * Valid script file extensions
 */
export const VALID_SCRIPT_EXTENSIONS = [".mjs", ".js", ".ts", ".sh", ".py"];

export { SKILL_NAME_PATTERN, MAX_SKILL_NAME_LENGTH };

/**
 * Session ID pattern (UUID v4)
 */
export const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Terminal session statuses (session is finished)
 */
export const TERMINAL_STATUSES = ["completed", "failed", "terminated"] as const;

/**
 * Active session statuses (session is still running)
 */
export const ACTIVE_STATUSES = ["pending", "running"] as const;
