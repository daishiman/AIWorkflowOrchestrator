import { describe, expect, it } from "vitest";
import { SkillCreatorWorkflowEngine } from "../SkillCreatorWorkflowEngine";

function createPlanResult(overrides: Record<string, unknown> = {}) {
  return {
    planId: "plan-001",
    skillSpec: "test skill\nbody",
    estimatedSteps: 3,
    skillName: "test-skill",
    description: "workflow engine test",
    agents: [],
    scripts: [],
    triggers: [],
    anchors: [],
    ...overrides,
  };
}

describe("SkillCreatorWorkflowEngine", () => {
  it("plan result を review state と awaitingUserInput に変換する", () => {
    const engine = new SkillCreatorWorkflowEngine();

    const snapshot = engine.recordPlanResult(
      createPlanResult(),
      {
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      },
      {
        resolvedSkillCreatorRoot: "/tmp/skill-creator",
        resourceDescriptorHash: "hash-001",
      },
    );

    expect(snapshot.currentPhase).toBe("review");
    expect(snapshot.awaitingUserInput).toMatchObject({
      reason: "plan_review",
    });
    expect(snapshot.routeSnapshot).toEqual({
      type: "integrated_api",
      permissionMode: "default",
    });
    expect(snapshot.resumeTokenEnvelope).toMatchObject({
      currentPhase: "review",
      artifactCount: 2,
    });
    expect(snapshot.sourceProvenance).toMatchObject({
      resolvedSkillCreatorRoot: "/tmp/skill-creator",
      resourceDescriptorHash: "hash-001",
    });
  });

  it("execute result を verify phase と pending verifyResult に進める", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const planResult = createPlanResult();

    engine.recordPlanResult(planResult, {
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    engine.recordExecuteStart(planResult, {
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });

    const snapshot = engine.recordExecuteResult("plan-001", {
      executeId: "exec-001",
      skillName: "test-skill",
      success: true,
    });

    expect(snapshot.currentPhase).toBe("verify");
    expect(snapshot.verifyResult).toMatchObject({
      status: "pending",
      nextAction: "review",
    });
    expect(snapshot.phaseArtifacts.map((artifact) => artifact.kind)).toEqual([
      "route_snapshot",
      "plan_result",
      "route_snapshot",
      "execute_result",
      "verify_result",
    ]);
  });

  it("terminal_handoff execute を handoff phase と resume envelope に固定する", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const planResult = createPlanResult();

    const snapshot = engine.recordExecuteHandoff(
      planResult,
      {
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "spec",
          cwd: "/tmp/runtime",
          suggestedCommand: 'claude -p "spec"',
          manualRetryRule: "retry",
        },
      },
      {
        launcher: "claude",
        promptBundle: "spec",
        cwd: "/tmp/runtime",
        suggestedCommand: 'claude -p "spec"',
        manualRetryRule: "retry",
      },
    );

    expect(snapshot.currentPhase).toBe("handoff");
    expect(snapshot.verifyResult).toBeNull();
    expect(snapshot.routeSnapshot).toEqual({
      type: "terminal_handoff",
      launcher: "claude",
    });
    expect(snapshot.resumeTokenEnvelope.currentPhase).toBe("handoff");
  });

  it("verify fail を improve next action として保持する", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const planResult = createPlanResult();

    engine.recordPlanResult(planResult, {
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    engine.recordExecuteStart(planResult, {
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    engine.recordExecuteResult("plan-001", {
      executeId: "exec-001",
      skillName: "test-skill",
      success: true,
    });

    const snapshot = engine.recordVerifyFailure(
      "plan-001",
      "verify failed",
      "improve",
    );

    expect(snapshot.currentPhase).toBe("improve");
    expect(snapshot.verifyResult).toMatchObject({
      status: "fail",
      message: "verify failed",
      nextAction: "improve",
    });
  });
});
