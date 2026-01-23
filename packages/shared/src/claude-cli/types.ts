/**
 * Claude CLI Integration - Type Definitions
 * @module claude-cli/types
 */

// =============================================================================
// Common Types
// =============================================================================

/**
 * API error for Claude CLI operations
 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Result type for Claude CLI API operations
 */
export type ClaudeCliResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

// =============================================================================
// Session Types
// =============================================================================

/**
 * Session status values
 */
export type SessionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "terminated";

/**
 * Session summary (for list view)
 */
export interface SessionSummary {
  id: string;
  skillName: string;
  status: SessionStatus;
  startedAt: number;
  completedAt: number | null;
}

/**
 * Session detail (full information)
 */
export interface SessionDetail extends SessionSummary {
  scriptPath: string;
  args: string[];
  exitCode?: number;
  output: string[];
  error: string[];
}

/**
 * Session creation options
 */
export interface CreateSessionOptions {
  skillName: string;
  scriptPath: string;
  args: string[];
  cwd?: string;
  timeoutMs?: number;
}

/**
 * Session filter criteria
 */
export interface SessionFilter {
  status?: SessionStatus;
  skillName?: string;
}

// =============================================================================
// Skill Types
// =============================================================================

/**
 * Skill metadata (scan result) for Claude CLI
 * Note: Named ClaudeCliSkillMetadata to avoid conflict with SkillMetadata in types/skill.ts (§5.1)
 */
export interface ClaudeCliSkillMetadata {
  name: string;
  path: string;
  description: string;
  tags: string[];
  triggers: string[];
  dependencies: string[];
  allowedTools: string[];
  hasScripts: boolean;
  hasReferences: boolean;
}

/**
 * Skill detail for Claude CLI (full information including content)
 * Note: Named ClaudeCliSkillDetail to avoid conflict with existing SkillDetail in types/skill.ts
 */
export interface ClaudeCliSkillDetail extends ClaudeCliSkillMetadata {
  content: string;
  scripts?: ScriptInfo[];
  references?: string[];
}

/**
 * Script information
 */
export interface ScriptInfo {
  name: string;
  path: string;
  type: "node" | "shell" | "python";
}

/**
 * Scan result from skill scanner
 */
export interface ScanResult {
  skills: ClaudeCliSkillMetadata[];
  errors: ScanError[];
  scannedAt: number;
}

/**
 * Scan error
 */
export interface ScanError {
  path: string;
  error: string;
}

/**
 * Filter criteria for skills
 */
export interface FilterCriteria {
  name?: string;
  tags?: string[];
  keyword?: string;
}

// =============================================================================
// CLI Installation Types
// =============================================================================

/**
 * CLI installation status
 */
export interface CliInstallationStatus {
  installed: boolean;
  version: string | null;
  path: string | null;
  error: string | null;
}

// =============================================================================
// IPC Request/Response Types
// =============================================================================

/**
 * List skills request
 */
export interface ListSkillsRequest {
  filter?: FilterCriteria;
  forceRefresh?: boolean;
}

/**
 * Get skill detail request
 */
export interface GetSkillDetailRequest {
  skillName: string;
  includeScripts?: boolean;
  includeReferences?: boolean;
}

/**
 * Execute script request
 */
export interface ExecuteScriptRequest {
  skillName: string;
  scriptName: string;
  args?: string[];
  cwd?: string;
  timeoutMs?: number;
}

/**
 * Execute script response
 */
export interface ExecuteScriptResponse {
  sessionId: string;
  status: SessionStatus;
}

/**
 * Terminate session request
 */
export interface TerminateSessionRequest {
  sessionId: string;
  force?: boolean;
}

/**
 * Terminate session response
 */
export interface TerminateSessionResponse {
  sessionId: string;
  terminated: boolean;
}

/**
 * Get session request
 */
export interface GetSessionRequest {
  sessionId: string;
}

// =============================================================================
// Process Types
// =============================================================================

/**
 * Spawn options for process manager
 */
export interface SpawnOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
}

/**
 * Kill options for process manager
 */
export interface KillOptions {
  force?: boolean;
  gracePeriodMs?: number;
}

// =============================================================================
// Event Types
// =============================================================================

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
 * Session created event
 */
export interface SessionCreatedEvent {
  id: string;
  skillName: string;
  status: SessionStatus;
  startedAt: number;
}

/**
 * Session destroyed event
 */
export interface SessionDestroyedEvent {
  id: string;
  status: SessionStatus;
  completedAt: number;
}

/**
 * Status changed event
 */
export interface StatusChangedEvent {
  sessionId: string;
  oldStatus: SessionStatus;
  newStatus: SessionStatus;
}

/**
 * Output event
 */
export interface OutputEvent {
  sessionId: string;
  type: "stdout" | "stderr";
  content: string;
}

// =============================================================================
// Streaming Event Types (for IPC)
// =============================================================================

/**
 * Stream data event (sent to renderer)
 */
export interface StreamDataEvent {
  sessionId: string;
  type: "stdout" | "stderr";
  data: string;
}

/**
 * Stream complete event (sent to renderer)
 */
export interface StreamCompleteEvent {
  sessionId: string;
  exitCode: number;
}

/**
 * Stream error event (sent to renderer)
 */
export interface StreamErrorEvent {
  sessionId: string;
  error: string;
}
