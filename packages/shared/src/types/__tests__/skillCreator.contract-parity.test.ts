import { describe, expect, expectTypeOf, it } from "vitest";
import type {
  RuntimeSkillCreatorExecuteErrorResponse,
  RuntimeSkillCreatorExecuteResponse,
  LLMAdapterStatusPayload,
  RuntimeSkillCreatorImproveResponse,
  RuntimeSkillCreatorPlanResponse,
} from "../skillCreator";

describe("skillCreator contract parity", () => {
  it("plan / execute / improve の runtime union が terminal_handoff を表現できる", () => {
    const planResponse: RuntimeSkillCreatorPlanResponse = {
      type: "terminal_handoff",
      guidance: {
        terminalCommand: 'claude -p "plan"',
        contextSummary: "surface=skill skill=unknown",
        reason: "terminal_handoff",
      },
    };
    const executeResponse: RuntimeSkillCreatorExecuteResponse = {
      type: "terminal_handoff",
      bundle: {
        launcher: "claude",
        promptBundle: "plan",
        cwd: "/tmp/runtime",
        suggestedCommand: 'claude -p "plan"',
        manualRetryRule: "retry",
      },
    };
    const improveResponse: RuntimeSkillCreatorImproveResponse = {
      type: "terminal_handoff",
      guidance: {
        terminalCommand: 'claude -p "improve"',
        contextSummary: "surface=skill skill=test",
        reason: "terminal_handoff",
      },
    };

    expect(planResponse.type).toBe("terminal_handoff");
    expect(executeResponse.type).toBe("terminal_handoff");
    expect(improveResponse.type).toBe("terminal_handoff");
  });

  it("execute response union は success result と handoff result の両方を受け入れる", () => {
    expectTypeOf<RuntimeSkillCreatorExecuteResponse>().toMatchTypeOf<
      | {
          executeId: string;
          skillName: string;
          success: boolean;
          error?: string;
          sessionId?: string;
          resultSubtype?: string;
          stopReason?: string;
          permissionDenials?: Array<{
            toolName?: string;
            toolUseId?: string;
            reason: string;
          }>;
          sdkEvents?: Array<{
            eventType: string;
          }>;
        }
      | {
          type: "terminal_handoff";
          bundle: {
            launcher: string;
            promptBundle: string;
            cwd: string;
            suggestedCommand: string;
            manualRetryRule: string;
          };
        }
      | RuntimeSkillCreatorExecuteErrorResponse
    >();
  });

  it("LLMAdapterStatusPayload は status/failureReason の契約を満たす", () => {
    const payload: LLMAdapterStatusPayload = {
      status: "failed",
      failureReason: "ANTHROPIC_API_KEY environment variable is not set",
    };

    expect(payload.status).toBe("failed");
    expect(payload.failureReason).toContain("ANTHROPIC_API_KEY");
  });
});
