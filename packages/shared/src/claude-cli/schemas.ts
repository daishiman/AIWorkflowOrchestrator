/**
 * Claude CLI Integration - Zod Schemas
 * @module claude-cli/schemas
 */

import { z } from "zod";
import {
  SKILL_NAME_PATTERN,
  SESSION_ID_PATTERN,
  VALID_SCRIPT_EXTENSIONS,
  CLAUDE_CLI_DEFAULTS,
} from "./constants";

// =============================================================================
// Base Schemas
// =============================================================================

/**
 * Skill name schema (kebab-case validation)
 */
export const skillNameSchema = z
  .string()
  .min(1, "Skill name cannot be empty")
  .max(
    CLAUDE_CLI_DEFAULTS.MAX_SKILL_NAME_LENGTH,
    `Skill name must be at most ${CLAUDE_CLI_DEFAULTS.MAX_SKILL_NAME_LENGTH} characters`,
  )
  .regex(SKILL_NAME_PATTERN, "Skill name must be kebab-case (e.g., my-skill)")
  .refine((name) => !name.includes(".."), "Skill name cannot contain '..'");

/**
 * Script name schema (validates extension)
 */
export const scriptNameSchema = z
  .string()
  .min(1, "Script name cannot be empty")
  .refine(
    (name) =>
      VALID_SCRIPT_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext)),
    `Script must have a valid extension: ${VALID_SCRIPT_EXTENSIONS.join(", ")}`,
  )
  .refine(
    (name) => !name.includes(".."),
    "Script name cannot contain path traversal",
  );

/**
 * Session ID schema (UUID v4 format)
 */
export const sessionIdSchema = z
  .string()
  .regex(SESSION_ID_PATTERN, "Invalid session ID format (must be UUID v4)");

/**
 * Session status schema
 */
export const sessionStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
  "terminated",
]);

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * Filter criteria schema
 */
export const filterCriteriaSchema = z.object({
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
  keyword: z.string().optional(),
});

/**
 * List skills request schema
 */
export const listSkillsRequestSchema = z.object({
  filter: filterCriteriaSchema.optional(),
  forceRefresh: z.boolean().optional(),
});

/**
 * Get skill detail request schema
 */
export const getSkillDetailRequestSchema = z.object({
  skillName: skillNameSchema,
  includeScripts: z.boolean().optional(),
  includeReferences: z.boolean().optional(),
});

/**
 * Execute script request schema
 */
export const executeScriptRequestSchema = z.object({
  skillName: skillNameSchema,
  scriptName: scriptNameSchema,
  args: z.array(z.string()).optional(),
  cwd: z.string().optional(),
  timeoutMs: z.number().positive().optional(),
});

/**
 * Terminate session request schema
 */
export const terminateSessionRequestSchema = z.object({
  sessionId: sessionIdSchema,
  force: z.boolean().optional(),
});

/**
 * Get session request schema
 */
export const getSessionRequestSchema = z.object({
  sessionId: sessionIdSchema,
});

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validate a skill name
 */
export function validateSkillName(name: string): boolean {
  return skillNameSchema.safeParse(name).success;
}

/**
 * Validate a script name
 */
export function validateScriptName(name: string): boolean {
  return scriptNameSchema.safeParse(name).success;
}

/**
 * Validate a session ID
 */
export function validateSessionId(id: string): boolean {
  return sessionIdSchema.safeParse(id).success;
}
