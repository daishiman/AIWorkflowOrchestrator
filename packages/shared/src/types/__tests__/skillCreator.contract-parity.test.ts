import { describe, expect, expectTypeOf, it } from "vitest";
import type {
  RuntimeSkillCreatorExecuteErrorResponse,
  RuntimeSkillCreatorExecuteResponse,
  RuntimeSkillCreatorExecuteResult,
  LLMAdapterStatusPayload,
  RuntimeSkillCreatorImproveResponse,
  RuntimeSkillCreatorPlanResponse,
  TerminalHandoffBundle,
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

  it("execute response union は既知メンバーと厳密一致する", () => {
    type ExpectedRuntimeSkillCreatorExecuteResponse =
      | RuntimeSkillCreatorExecuteResult
      | {
          type: "terminal_handoff";
          bundle: TerminalHandoffBundle;
        }
      | RuntimeSkillCreatorExecuteErrorResponse;

    expectTypeOf<RuntimeSkillCreatorExecuteResponse>().toEqualTypeOf<ExpectedRuntimeSkillCreatorExecuteResponse>();
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
