/**
 * plan() LLM プロンプト定数
 *
 * TASK-SC-03-PLAN-LLM-PROMPT
 */
import type { PhaseResourceRequest } from "./PhaseResourcePlanner";

export const PLAN_PROMPT_CONSTANTS = {
  AGENT_SEPARATOR_START: "=== AGENT:",
  AGENT_SEPARATOR_END: "=== END AGENT:",
  REFERENCE_SEPARATOR_START: "=== REFERENCE:",
  REFERENCE_SEPARATOR_END: "=== END REFERENCE:",
  RESPONSE_FORMAT_START: "=== RESPONSE FORMAT ===",
  RESPONSE_FORMAT_END: "=== END RESPONSE FORMAT ===",
  DEFAULT_MODEL_ID: "claude-sonnet-4-20250514",
  DEFAULT_MAX_TOKENS: 4096,
  DEFAULT_TEMPERATURE: 0.3,
  DEFAULT_CONTEXT_BUDGET_BYTES: 16_384,
} as const;

export const PLAN_RESOURCE_REQUESTS: readonly PhaseResourceRequest[] = [
  {
    id: "discover-problem",
    kind: "agent",
    relativePath: "agents/discover-problem.md",
    tier: "required-core",
    required: true,
    legacyCategory: "agents",
    legacyName: "discover-problem.md",
  },
  {
    id: "design-workflow",
    kind: "agent",
    relativePath: "agents/design-workflow.md",
    tier: "required-core",
    required: true,
    legacyCategory: "agents",
    legacyName: "design-workflow.md",
  },
  {
    id: "plan-structure",
    kind: "agent",
    relativePath: "agents/plan-structure.md",
    tier: "required-core",
    required: true,
    legacyCategory: "agents",
    legacyName: "plan-structure.md",
  },
  {
    id: "overview",
    kind: "reference",
    relativePath: "references/overview.md",
    tier: "optional-quality",
    required: false,
    legacyCategory: "references",
    legacyName: "overview.md",
  },
] as const;

export const PLAN_RESPONSE_SCHEMA_INSTRUCTION = `${PLAN_PROMPT_CONSTANTS.RESPONSE_FORMAT_START}
You must respond with ONLY a valid JSON object (no markdown, no explanation).
The JSON must conform to the following schema:

{
  "skillName": "string - kebab-case name for the skill (e.g., 'github-issue-classifier')",
  "description": "string - one-line description of what the skill does",
  "agents": [
    {
      "name": "string - agent file name without extension (e.g., 'classify-issues')",
      "role": "string - what this agent does in the workflow"
    }
  ],
  "scripts": [
    {
      "name": "string - script file name (e.g., 'validate-labels.js')",
      "purpose": "string - what this script automates"
    }
  ],
  "triggers": ["string - when/how the skill is activated (e.g., 'GitHub Issue creation')"],
  "anchors": ["string - knowledge sources the skill depends on (e.g., 'GitHub API v4')"]
}

Rules:
- skillName must be kebab-case
- agents array must have at least 1 entry
- All string fields must be non-empty
${PLAN_PROMPT_CONSTANTS.RESPONSE_FORMAT_END}`;
