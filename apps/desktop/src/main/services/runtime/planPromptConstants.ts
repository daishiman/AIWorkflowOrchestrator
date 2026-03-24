/**
 * plan() LLM プロンプト定数
 *
 * TASK-SC-03-PLAN-LLM-PROMPT
 */

export const PLAN_PROMPT_CONSTANTS = {
  AGENT_SEPARATOR_START: "=== AGENT:",
  AGENT_SEPARATOR_END: "=== END AGENT:",
  RESPONSE_FORMAT_START: "=== RESPONSE FORMAT ===",
  RESPONSE_FORMAT_END: "=== END RESPONSE FORMAT ===",
  AGENT_NAMES: [
    "discover-problem",
    "design-workflow",
    "plan-structure",
  ] as const,
  DEFAULT_MODEL_ID: "claude-sonnet-4-20250514",
  DEFAULT_MAX_TOKENS: 4096,
  DEFAULT_TEMPERATURE: 0.3,
} as const;

export const PLAN_RESPONSE_SCHEMA_INSTRUCTION = `${PLAN_PROMPT_CONSTANTS.RESPONSE_FORMAT_START}
You must respond with ONLY a valid JSON object (no markdown, no explanation).
The JSON must conform to the following schema:

{
  "skillName": "string - kebab-case name for the skill (e.g., 'github-issue-classifier')",
  "description": "string - one-line description of what the skill does",
  "category": "string - one of: simple, standard, complex, automation, integration",
  "customizations": {
    "additionalDirectories": ["string[] - extra dirs beyond category template (optional)"],
    "additionalFiles": [{ "path": "string", "purpose": "string" }],
    "excludedDefaults": ["string[] - template defaults to exclude (optional)"]
  },
  "files": [
    {
      "path": "string - relative path like agents/foo.md",
      "purpose": "string - what this file does"
    }
  ],
  "reasoning": "string - why this category and structure were chosen",
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
- category must be one of: simple, standard, complex, automation, integration
- files should list all planned output files including agents and scripts
- reasoning should explain the category choice
${PLAN_PROMPT_CONSTANTS.RESPONSE_FORMAT_END}`;
