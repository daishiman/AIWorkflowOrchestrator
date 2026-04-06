/**
 * improve() LLM プロンプト定数
 *
 * TASK-SC-05-IMPROVE-LLM (MINOR-2 対応)
 */
import type { PhaseResourceRequest } from "./PhaseResourcePlanner";

export const IMPROVE_PROMPT_CONSTANTS = {
  RESPONSE_FORMAT_START: "=== IMPROVE RESPONSE FORMAT ===",
  RESPONSE_FORMAT_END: "=== END IMPROVE RESPONSE FORMAT ===",
  DEFAULT_MODEL_ID: "claude-sonnet-4-20250514",
  DEFAULT_MAX_TOKENS: 8192,
  DEFAULT_TEMPERATURE: 0.3,
  DEFAULT_CONTEXT_BUDGET_BYTES: 12_288,
} as const;

export const IMPROVE_RESOURCE_REQUESTS: readonly PhaseResourceRequest[] = [
  {
    id: "improve-prompt",
    kind: "agent",
    relativePath: "agents/improve-prompt.md",
    tier: "required-core",
    required: true,
    legacyCategory: "agents",
    legacyName: "improve-prompt.md",
  },
  {
    id: "feedback-loop",
    kind: "reference",
    relativePath: "references/feedback-loop.md",
    tier: "optional-quality",
    required: false,
    legacyCategory: "references",
    legacyName: "feedback-loop.md",
  },
] as const;

export const IMPROVE_RESPONSE_SCHEMA_INSTRUCTION = `${IMPROVE_PROMPT_CONSTANTS.RESPONSE_FORMAT_START}
You must respond with ONLY a valid JSON object (no markdown, no explanation).
The JSON must conform to the following schema:

{
  "skillName": "string - name of the skill being improved",
  "targetAgent": "string - path to the target agent file (e.g., 'agents/xxx.md')",
  "analysisResults": {
    "structureScore": "number 1-5",
    "clarityScore": "number 1-5",
    "reproducibilityScore": "number 1-5",
    "efficiencyScore": "number 1-5"
  },
  "improvements": [
    {
      "section": "string - target section name",
      "issue": "string - description of the problem",
      "pattern": "string - improvement pattern name",
      "before": "string - text before change",
      "after": "string - text after change"
    }
  ],
  "improvedContent": "string - full improved SKILL.md content"
}

Rules:
- All string fields must be non-empty
- improvements array may be empty if no improvements are needed
- before/after must be exact text excerpts from the SKILL.md
${IMPROVE_PROMPT_CONSTANTS.RESPONSE_FORMAT_END}`;
