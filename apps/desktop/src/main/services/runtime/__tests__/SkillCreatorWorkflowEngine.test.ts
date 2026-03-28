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

  it("execute failure を verification_review 付きの review snapshot として保持する", () => {
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

    const snapshot = engine.recordExecutionFailure("plan-001", {
      executeId: "exec-002",
      skillName: "test-skill",
      reason: "execution_failed",
      message: "executor failed",
    });

    expect(snapshot.currentPhase).toBe("review");
    expect(snapshot.awaitingUserInput).toMatchObject({
      reason: "verification_review",
    });
    expect(snapshot.verifyResult).toMatchObject({
      status: "fail",
      reason: "verification_review",
      message: "executor failed",
      nextAction: "review",
    });
    expect(
      snapshot.phaseArtifacts.filter(
        (artifact) => artifact.kind === "verify_result",
      ),
    ).toHaveLength(1);
    expect(
      snapshot.phaseArtifacts.filter(
        (artifact) => artifact.kind === "execute_result",
      ),
    ).toHaveLength(1);
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
    expect(snapshot.handoffBundle).toMatchObject({
      launcher: "claude",
      cwd: "/tmp/runtime",
    });
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
    const verifyArtifacts = snapshot.phaseArtifacts.filter(
      (artifact) => artifact.kind === "verify_result",
    );
    expect(verifyArtifacts).toHaveLength(2);
    expect(verifyArtifacts.at(-1)?.payload).toMatchObject(
      snapshot.verifyResult!,
    );
  });

  it("repeated failure でも execute_result / verify_result を append する", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const planResult = createPlanResult();
    const decision = {
      type: "integrated_api" as const,
      apiKey: "sk-test",
      permissionMode: "default" as const,
    };

    engine.recordPlanResult(planResult, decision);
    engine.recordExecuteStart(planResult, decision);
    engine.recordExecuteResult("plan-001", {
      executeId: "exec-001",
      skillName: "test-skill",
      success: true,
    });
    engine.recordVerifyFailure("plan-001", "verify failed #1", "improve");

    engine.recordExecuteStart(planResult, decision);
    const snapshot = engine.recordExecuteResult("plan-001", {
      executeId: "exec-002",
      skillName: "test-skill",
      success: true,
    });
    const failedSnapshot = engine.recordVerifyFailure(
      "plan-001",
      "verify failed #2",
      "improve",
    );

    expect(
      snapshot.phaseArtifacts.filter(
        (artifact) => artifact.kind === "execute_result",
      ),
    ).toHaveLength(2);
    expect(
      failedSnapshot.phaseArtifacts.filter(
        (artifact) => artifact.kind === "verify_result",
      ),
    ).toHaveLength(4);
    expect(failedSnapshot.verifyResult).toMatchObject({
      status: "fail",
      message: "verify failed #2",
    });
  });

  it("verify review は awaitingUserInput.reason=verification_review を生成する", () => {
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
      executeId: "exec-003",
      skillName: "test-skill",
      success: true,
    });

    const snapshot = engine.recordVerifyFailure(
      "plan-001",
      "verification requires review",
      "review",
    );

    expect(snapshot.currentPhase).toBe("review");
    expect(snapshot.awaitingUserInput).toMatchObject({
      reason: "verification_review",
    });
    expect(snapshot.awaitingUserInput?.prompt).toContain(
      "verification requires review",
    );
    expect(snapshot.verifyResult).toMatchObject({
      status: "fail",
      reason: "verification_review",
      nextAction: "review",
    });
  });

  it("invalid transition は state と artifact を変更せず reject する", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const planResult = createPlanResult();

    const snapshot = engine.recordPlanResult(planResult, {
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });

    expect(() =>
      engine.recordExecuteResult("plan-001", {
        executeId: "exec-invalid",
        skillName: "test-skill",
        success: true,
      }),
    ).toThrow("invalid workflow transition: review -> verify");
    expect(engine.getWorkflowState("plan-001")).toEqual(snapshot);
  });

  it("re-execute 後の repeated failure でも execute artifact を append する", () => {
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
    engine.recordExecutionFailure("plan-001", {
      executeId: "exec-010",
      skillName: "test-skill",
      reason: "execution_error",
      message: "first failure",
    });
    engine.recordExecuteStart(planResult, {
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    engine.recordExecutionFailure("plan-001", {
      executeId: "exec-011",
      skillName: "test-skill",
      reason: "execution_failed",
      message: "second failure",
    });

    const snapshot = engine.getWorkflowState("plan-001");
    const executeArtifacts =
      snapshot?.phaseArtifacts.filter(
        (artifact) => artifact.kind === "execute_result",
      ) ?? [];
    const verifyArtifacts =
      snapshot?.phaseArtifacts.filter(
        (artifact) => artifact.kind === "verify_result",
      ) ?? [];

    expect(executeArtifacts).toHaveLength(2);
    expect(verifyArtifacts).toHaveLength(2);
    expect(executeArtifacts.map((artifact) => artifact.payload)).toEqual([
      expect.objectContaining({
        executeId: "exec-010",
        reason: "execution_error",
      }),
      expect.objectContaining({
        executeId: "exec-011",
        reason: "execution_failed",
      }),
    ]);
  });
  it("submitUserInput は requestId 一致時に awaitingUserInput を解消する", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const snapshot = engine.recordPlanResult(createPlanResult(), {
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });

    const submitted = engine.submitUserInput("plan-001", {
      planId: "plan-001",
      requestId: snapshot.awaitingUserInput!.requestId,
      selectedOptionId: "ready_to_execute",
    });

    expect(submitted.awaitingUserInput).toBeNull();
    expect(
      submitted.phaseArtifacts.some(
        (artifact) => artifact.kind === "user_input_submission",
      ),
    ).toBe(true);
  });

  it("submitUserInput は stale requestId を reject する", () => {
    const engine = new SkillCreatorWorkflowEngine();
    engine.recordPlanResult(createPlanResult(), {
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });

    expect(() =>
      engine.submitUserInput("plan-001", {
        planId: "plan-001",
        requestId: "stale-request",
        selectedOptionId: "ready_to_execute",
      }),
    ).toThrow("stale requestId");
  });

  it("getVerifyDetail() は Layer 3 / Layer 4 detail を導出する", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const planResult = createPlanResult();

    engine.recordPlanResult(
      planResult,
      {
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "acceptEdits",
      },
      {
        resolvedSkillCreatorRoot: "/tmp/skill-creator",
        manifestPath: "/tmp/skill-creator/workflow.json",
        resourceDescriptorHash: "hash-verify-1",
      },
    );
    engine.recordExecuteStart(planResult, {
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "acceptEdits",
    });
    engine.recordExecuteResult("plan-001", {
      executeId: "exec-verify-1",
      skillName: "test-skill",
      success: true,
    });

    const detail = engine.getVerifyDetail("plan-001");

    expect(detail).toMatchObject({
      planId: "plan-001",
      currentPhase: "verify",
      status: "pending",
      evidenceCount: 7,
      route: {
        type: "integrated_api",
        permissionMode: "acceptEdits",
      },
      resourceDescriptorHash: "hash-verify-1",
      reverifyEligible: true,
    });
    expect(detail.checks).toHaveLength(4);
  });

  it("requestReverify() は pending verify を append する", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const planResult = createPlanResult();
    const decision = {
      type: "integrated_api" as const,
      apiKey: "sk-test",
      permissionMode: "default" as const,
    };

    engine.recordPlanResult(planResult, decision);
    engine.recordExecuteStart(planResult, decision);
    engine.recordExecuteResult("plan-001", {
      executeId: "exec-001",
      skillName: "test-skill",
      success: true,
    });
    engine.recordVerifyFailure("plan-001", "verify failed", "improve");

    const result = engine.requestReverify("plan-001");
    const snapshot = engine.getWorkflowState("plan-001");

    expect(result).toEqual({ accepted: true });
    expect(snapshot?.currentPhase).toBe("verify");
    expect(snapshot?.verifyResult).toMatchObject({
      status: "pending",
      nextAction: "review",
    });
    expect(
      snapshot?.phaseArtifacts.filter(
        (artifact) => artifact.kind === "verify_result",
      ),
    ).toHaveLength(3);
  });

  it("requestReverify() は terminal_handoff workflow を拒否する", () => {
    const engine = new SkillCreatorWorkflowEngine();

    engine.recordExecuteHandoff(
      createPlanResult(),
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

    const result = engine.requestReverify("plan-001");

    expect(result).toMatchObject({
      accepted: false,
    });
    expect(result.disabledReason).toContain("Task07 owner");
  });

  // ── submitUserInput phase transition semantics (AC-1〜AC-5, NFR-3) ──

  describe("submitUserInput phase transition semantics", () => {
    const decision = {
      type: "integrated_api" as const,
      apiKey: "sk-test",
      permissionMode: "default" as const,
    };

    function setupPlanReviewState(engine: SkillCreatorWorkflowEngine) {
      return engine.recordPlanResult(createPlanResult(), decision);
    }

    function setupVerificationReviewState(engine: SkillCreatorWorkflowEngine) {
      const planResult = createPlanResult();
      engine.recordPlanResult(planResult, decision);
      engine.recordExecuteStart(planResult, decision);
      return engine.recordExecutionFailure("plan-001", {
        executeId: "exec-001",
        skillName: "test-skill",
        reason: "execution_failed",
        message: "test failure",
      });
    }

    // AC-1
    it("plan_review ready_to_execute → currentPhase が execute に遷移する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const snapshot = setupPlanReviewState(engine);

      const submitted = engine.submitUserInput("plan-001", {
        planId: "plan-001",
        requestId: snapshot.awaitingUserInput!.requestId,
        selectedOptionId: "ready_to_execute",
      });

      expect(submitted.currentPhase).toBe("execute");
    });

    // AC-2
    it("plan_review needs_changes → currentPhase が plan に戻る", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const snapshot = setupPlanReviewState(engine);

      const submitted = engine.submitUserInput("plan-001", {
        planId: "plan-001",
        requestId: snapshot.awaitingUserInput!.requestId,
        selectedOptionId: "needs_changes",
      });

      expect(submitted.currentPhase).toBe("plan");
    });

    // AC-3
    it("verification_review approve → verifyResult.nextAction が handoff, status が pass になる", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const snapshot = setupVerificationReviewState(engine);

      const submitted = engine.submitUserInput("plan-001", {
        planId: "plan-001",
        requestId: snapshot.awaitingUserInput!.requestId,
        textValue: "Looks good, approved",
        selectedOptionId: "approve",
      });

      expect(submitted.verifyResult).toMatchObject({
        status: "pass",
        nextAction: "handoff",
      });
    });

    // AC-4
    it("verification_review improve → verifyResult.nextAction が improve になる", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const snapshot = setupVerificationReviewState(engine);

      const submitted = engine.submitUserInput("plan-001", {
        planId: "plan-001",
        requestId: snapshot.awaitingUserInput!.requestId,
        textValue: "Please improve the error handling",
        selectedOptionId: "improve",
      });

      expect(submitted.verifyResult).toMatchObject({
        nextAction: "improve",
      });
    });

    // AC-5
    it("verification_review reject → currentPhase が plan に遷移し verifyResult.nextAction が review になる", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const snapshot = setupVerificationReviewState(engine);

      const submitted = engine.submitUserInput("plan-001", {
        planId: "plan-001",
        requestId: snapshot.awaitingUserInput!.requestId,
        textValue: "This approach is wrong, start over",
        selectedOptionId: "reject",
      });

      expect(submitted.currentPhase).toBe("plan");
      expect(submitted.verifyResult).toMatchObject({
        status: "fail",
        nextAction: "review",
      });
    });

    // NFR-3: unknown option fallback
    it("verification_review で未知の selectedOptionId は no-op フォールバックする", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const snapshot = setupVerificationReviewState(engine);

      const submitted = engine.submitUserInput("plan-001", {
        planId: "plan-001",
        requestId: snapshot.awaitingUserInput!.requestId,
        textValue: "some feedback",
        selectedOptionId: "unknown_option",
      });

      expect(submitted.awaitingUserInput).toBeNull();
      expect(submitted.currentPhase).toBe("review");
    });

    // phase_transition artifact: 遷移あり
    it("phase 遷移発生時に phase_transition artifact が記録される", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const snapshot = setupPlanReviewState(engine);

      const submitted = engine.submitUserInput("plan-001", {
        planId: "plan-001",
        requestId: snapshot.awaitingUserInput!.requestId,
        selectedOptionId: "ready_to_execute",
      });

      const transitionArtifact = submitted.phaseArtifacts.find(
        (a) => (a.kind as string) === "phase_transition",
      );
      expect(transitionArtifact).toBeDefined();
      expect(transitionArtifact?.payload).toMatchObject({
        fromPhase: "review",
        toPhase: "execute",
        reason: "plan_review",
        selectedOptionId: "ready_to_execute",
      });
    });

    // phase_transition artifact: 遷移なし
    it("phase 遷移なしの場合は phase_transition artifact が記録されない", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const snapshot = setupVerificationReviewState(engine);

      const submitted = engine.submitUserInput("plan-001", {
        planId: "plan-001",
        requestId: snapshot.awaitingUserInput!.requestId,
        textValue: "Approved",
        selectedOptionId: "approve",
      });

      const transitionArtifact = submitted.phaseArtifacts.find(
        (a) => (a.kind as string) === "phase_transition",
      );
      expect(transitionArtifact).toBeUndefined();
    });
  });
});
