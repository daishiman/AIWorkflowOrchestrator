import { describe, expect, it } from "vitest";
import { SkillCreatorWorkflowEngine } from "../SkillCreatorWorkflowEngine";

const TEST_ENGINE_VERSION = "task-sdk-08-v1" as const;

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
    const executeArtifact = snapshot.phaseArtifacts.find(
      (artifact) => artifact.kind === "execute_result",
    );
    expect(executeArtifact?.payload).toMatchObject({
      executeId: "exec-001",
      skillName: "test-skill",
      success: true,
    });
  });

  it("execute artifact に persistResult / persistError を保持する", () => {
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
      persistResult: {
        skillPath: "/tmp/test-skill",
        files: ["SKILL.md"],
      },
      persistError: null,
    });

    const executeArtifact = snapshot.phaseArtifacts.find(
      (artifact) => artifact.kind === "execute_result",
    );
    expect(executeArtifact?.payload).toMatchObject({
      persistResult: {
        skillPath: "/tmp/test-skill",
        files: ["SKILL.md"],
      },
      persistError: null,
    });
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
      reverifyEligible: false,
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

  // ── TASK-P0-02: verify→improve→re-verify closed loop ──

  describe("verify→improve→re-verify closed loop", () => {
    const decision = {
      type: "integrated_api" as const,
      apiKey: "sk-test",
      permissionMode: "default" as const,
    };

    function setupVerifyPhase(engine: SkillCreatorWorkflowEngine) {
      const planResult = createPlanResult();
      engine.recordPlanResult(planResult, decision);
      engine.recordExecuteStart(planResult, decision);
      engine.recordExecuteResult("plan-001", {
        executeId: "exec-001",
        skillName: "test-skill",
        success: true,
      });
      return planResult;
    }

    function setupImprovePhase(engine: SkillCreatorWorkflowEngine) {
      setupVerifyPhase(engine);
      engine.recordVerifyFailure("plan-001", "checks failed", "improve");
    }

    function hydrateImproveCheckpoint(
      engine: SkillCreatorWorkflowEngine,
      phaseArtifacts: Array<{
        phase: "execute" | "verify";
        type: string;
        data: unknown;
      }>,
    ) {
      engine.hydrateFromCheckpoint({
        checkpointId: "cp-001",
        planId: "plan-001",
        checkpointType: "verify-fail",
        workflowStateSnapshot: {
          currentPhase: "improve",
          awaitingUserInput: null,
          verifyResult: {
            status: "fail",
            message: "rehydrated",
            nextAction: "improve",
            updatedAt: "2026-03-30T00:00:00.000Z",
          },
          phaseArtifacts: phaseArtifacts.map((artifact, idx) => ({
            phase: artifact.phase,
            type: artifact.type,
            timestamp: `2026-03-30T00:00:0${idx}.000Z`,
            data: artifact.data,
          })),
          resumeTokenEnvelope: {
            version: "task-sdk-02-v1",
            planId: "plan-001",
            currentPhase: "improve",
            artifactCount: phaseArtifacts.length,
            updatedAt: "2026-03-30T00:00:10.000Z",
          },
          handoffBundle: null,
        },
        compatibilitySnapshot: {
          engineVersion: TEST_ENGINE_VERSION,
        },
        revision: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // AC-1: recordVerifyPass() が WorkflowEngine に存在する
    it("recordVerifyPass() で verify→review に遷移し pass 状態を記録する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      setupVerifyPhase(engine);

      const snapshot = engine.recordVerifyPass("plan-001", [
        {
          id: "layer1-check",
          layer: "layer1",
          severity: "info",
          summary: "all checks passed",
        },
      ]);

      expect(snapshot.currentPhase).toBe("review");
      expect(snapshot.verifyResult).toMatchObject({
        status: "pass",
        nextAction: "handoff",
      });
    });

    // recordVerifyPass() は verify phase 以外ではエラーになる
    it("recordVerifyPass() を verify phase 以外で呼ぶとエラーになる", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const planResult = createPlanResult();
      engine.recordPlanResult(planResult, decision);

      expect(() => engine.recordVerifyPass("plan-001", [])).toThrow(
        "invalid workflow transition",
      );
    });

    // AC-3: improve→verify (re-verify) phase 遷移が動作する
    it("requestReverify() で improve→verify 遷移が動作する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      setupImprovePhase(engine);

      const result = engine.requestReverify("plan-001");
      const snapshot = engine.getWorkflowState("plan-001");

      expect(result).toEqual({ accepted: true });
      expect(snapshot?.currentPhase).toBe("verify");
      expect(snapshot?.verifyResult).toMatchObject({
        status: "pending",
      });
    });

    // AC-4: execute→verify(fail)→improve→verify(pass) の完全サイクル
    it("complete cycle: execute→verify(fail)→improve→verify(pass)", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const planResult = createPlanResult();

      // Step 1: plan→review→execute
      engine.recordPlanResult(planResult, decision);
      engine.recordExecuteStart(planResult, decision);

      // Step 2: execute→verify (pending)
      const execSnapshot = engine.recordExecuteResult("plan-001", {
        executeId: "exec-001",
        skillName: "test-skill",
        success: true,
      });
      expect(execSnapshot.currentPhase).toBe("verify");

      // Step 3: verify(fail)→improve
      const failSnapshot = engine.recordVerifyFailure(
        "plan-001",
        "issues found",
        "improve",
      );
      expect(failSnapshot.currentPhase).toBe("improve");
      expect(failSnapshot.verifyResult?.nextAction).toBe("improve");

      // Step 4: improve→verify (re-verify)
      const reverifyResult = engine.requestReverify("plan-001");
      expect(reverifyResult.accepted).toBe(true);
      const reverifySnapshot = engine.getWorkflowState("plan-001");
      expect(reverifySnapshot?.currentPhase).toBe("verify");

      // Step 5: verify(pass)→review
      const passSnapshot = engine.recordVerifyPass("plan-001", [
        {
          id: "layer1-check",
          layer: "layer1",
          severity: "info",
          summary: "all checks passed",
        },
      ]);
      expect(passSnapshot.currentPhase).toBe("review");
      expect(passSnapshot.verifyResult).toMatchObject({
        status: "pass",
        nextAction: "handoff",
      });
    });

    // AC-6: requestReverify() が improve phase でのみ許可される
    it("requestReverify() を improve 以外の phase で呼ぶと拒否される", () => {
      const engine = new SkillCreatorWorkflowEngine();
      setupVerifyPhase(engine);

      // verify phase で呼ぶ
      const result = engine.requestReverify("plan-001");
      expect(result.accepted).toBe(false);
      expect(result.disabledReason).toBeDefined();
    });

    // エッジケース: verify pass 後に再度 recordVerifyPass を呼ぶとエラー
    it("verify pass 後に再度 recordVerifyPass を呼ぶとエラーになる", () => {
      const engine = new SkillCreatorWorkflowEngine();
      setupVerifyPhase(engine);
      engine.recordVerifyPass("plan-001", []);

      // review phase で recordVerifyPass を呼ぶとエラー
      expect(() => engine.recordVerifyPass("plan-001", [])).toThrow(
        "invalid workflow transition",
      );
    });

    // エッジケース: improve without prior fail
    it("verify fail を経ずに improve に遷移しようとするとエラーになる", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const planResult = createPlanResult();
      engine.recordPlanResult(planResult, decision);

      // review phase から直接 improve に遷移しようとする
      expect(() =>
        engine.recordVerifyFailure("plan-001", "test", "improve"),
      ).toThrow("invalid workflow transition");
    });

    // UI snapshot: verify pass 状態の verifyResult
    it("verify pass snapshot は verifyResult.status=pass を含む", () => {
      const engine = new SkillCreatorWorkflowEngine();
      setupVerifyPhase(engine);

      engine.recordVerifyPass("plan-001", [
        {
          id: "layer1-check",
          layer: "layer1",
          severity: "info",
          summary: "passed",
        },
      ]);

      const snapshot = engine.getWorkflowState("plan-001");
      expect(snapshot?.verifyResult?.status).toBe("pass");
      expect(snapshot?.verifyResult?.nextAction).toBe("handoff");
    });

    // verify artifact が recordVerifyPass で追加される
    it("recordVerifyPass() は verify_result artifact を追加する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      setupVerifyPhase(engine);

      const snapshot = engine.recordVerifyPass("plan-001", []);

      const verifyArtifacts = snapshot.phaseArtifacts.filter(
        (a) => a.kind === "verify_result",
      );
      // pending の verify_result + pass の verify_result
      expect(verifyArtifacts.length).toBeGreaterThanOrEqual(2);
      expect(verifyArtifacts.at(-1)?.payload).toMatchObject({
        status: "pass",
        nextAction: "handoff",
      });
    });

    // Phase 6: 複数回 re-verify（2周サイクル）
    it("improve→verify→fail→improve→verify→pass の2周サイクル", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const planResult = createPlanResult();

      engine.recordPlanResult(planResult, decision);
      engine.recordExecuteStart(planResult, decision);
      engine.recordExecuteResult("plan-001", {
        executeId: "exec-001",
        skillName: "test-skill",
        success: true,
      });

      // 1周目: verify fail → improve → re-verify
      engine.recordVerifyFailure("plan-001", "round 1 fail", "improve");
      engine.requestReverify("plan-001");

      // 2周目: verify fail again → improve → re-verify → pass
      engine.recordVerifyFailure("plan-001", "round 2 fail", "improve");
      engine.requestReverify("plan-001");
      const passSnapshot = engine.recordVerifyPass("plan-001", []);

      expect(passSnapshot.currentPhase).toBe("review");
      expect(passSnapshot.verifyResult?.status).toBe("pass");
    });

    // Phase 6: improve→verify→fail→improve サイクルが正しく動作する
    it("improve→verify→fail→improve サイクルが正しく動作する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const planResult = createPlanResult();

      engine.recordPlanResult(planResult, decision);
      engine.recordExecuteStart(planResult, decision);
      engine.recordExecuteResult("plan-001", {
        executeId: "exec-001",
        skillName: "test-skill",
        success: true,
      });

      // verify fail → improve
      engine.recordVerifyFailure("plan-001", "first fail", "improve");
      expect(engine.getWorkflowState("plan-001")?.currentPhase).toBe("improve");

      // re-verify → verify fail again → improve
      engine.requestReverify("plan-001");
      engine.recordVerifyFailure("plan-001", "second fail", "improve");
      expect(engine.getWorkflowState("plan-001")?.currentPhase).toBe("improve");
    });

    // Phase 6: requestReverify() eligibility - execute result なし
    it("requestReverify() は execute result なしで拒否する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      hydrateImproveCheckpoint(engine, [
        {
          phase: "verify",
          type: "verify_result",
          data: {
            status: "fail",
            message: "checks failed",
            nextAction: "improve",
          },
        },
      ]);
      const result = engine.requestReverify("plan-001");
      expect(result.accepted).toBe(false);
      expect(result.disabledReason).toContain("実行結果がまだ存在しない");
    });

    // Phase 6: requestReverify() eligibility - 最後の実行が失敗
    it("requestReverify() は最後の実行が失敗した場合に拒否する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      hydrateImproveCheckpoint(engine, [
        {
          phase: "execute",
          type: "execute_result",
          data: {
            executeId: "exec-001",
            skillName: "test-skill",
            success: false,
            error: "failed",
          },
        },
        {
          phase: "verify",
          type: "verify_result",
          data: {
            status: "fail",
            message: "failed",
            nextAction: "improve",
          },
        },
      ]);

      const result = engine.requestReverify("plan-001");
      expect(result.accepted).toBe(false);
      expect(result.disabledReason).toContain("最後の実行が成功していない");
    });

    // Phase 6: handoff 後の requestReverify 拒否
    it("handoff 後の requestReverify は拒否される", () => {
      const engine = new SkillCreatorWorkflowEngine();
      engine.recordExecuteHandoff(
        createPlanResult(),
        {
          type: "terminal_handoff",
          bundle: {
            launcher: "claude",
            promptBundle: "spec",
            cwd: "/tmp",
            suggestedCommand: 'claude -p "spec"',
            manualRetryRule: "retry",
          },
        },
        {
          launcher: "claude",
          promptBundle: "spec",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "spec"',
          manualRetryRule: "retry",
        },
      );

      const result = engine.requestReverify("plan-001");
      expect(result.accepted).toBe(false);
    });

    // Phase 6: verification engine 未注入の graceful degradation
    it("checks が空配列の場合も recordVerifyPass が動作する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      setupVerifyPhase(engine);

      const snapshot = engine.recordVerifyPass("plan-001", []);
      expect(snapshot.currentPhase).toBe("review");
      expect(snapshot.verifyResult?.status).toBe("pass");
    });

    // Phase 6: requestReverify() eligibility - review phase
    it("requestReverify() は review phase で拒否する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const planResult = createPlanResult();
      engine.recordPlanResult(planResult, decision);

      const result = engine.requestReverify("plan-001");
      expect(result.accepted).toBe(false);
      expect(result.disabledReason).toContain("improve フェーズ以外");
    });

    // Phase 6: requestReverify() eligibility - plan phase
    it("requestReverify() は plan phase で拒否する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      createPlanResult(); // just to have a default planId
      // plan phase にいるワークフローを作る
      const planResult = createPlanResult();
      engine.recordPlanResult(planResult, decision);
      // plan_review で needs_changes → plan phase に戻る
      const snapshot = engine.getWorkflowState("plan-001");
      const submitted = engine.submitUserInput("plan-001", {
        planId: "plan-001",
        requestId: snapshot!.awaitingUserInput!.requestId,
        selectedOptionId: "needs_changes",
      });
      expect(submitted.currentPhase).toBe("plan");

      const result = engine.requestReverify("plan-001");
      expect(result.accepted).toBe(false);
    });
  });

  // ── TASK-RT-05: multi_select validation ──

  describe("multi_select validation", () => {
    function setupMultiSelectState(engine: SkillCreatorWorkflowEngine) {
      const snapshot = engine.recordPlanResult(createPlanResult(), {
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      const requestId = snapshot.awaitingUserInput!.requestId;
      // Override awaitingUserInput to multi_select for testing validation
      const workflows = (
        engine as unknown as {
          workflows: Map<string, { awaitingUserInput: unknown }>;
        }
      ).workflows;
      const state = workflows.get("plan-001")!;
      state.awaitingUserInput = {
        requestId,
        reason: "plan_review" as const,
        title: "Multi Select Test",
        prompt: "Select multiple options",
        kind: "multi_select" as const,
        options: [
          { id: "opt-a", label: "Option A" },
          { id: "opt-b", label: "Option B" },
          { id: "opt-c", label: "Option C" },
        ],
        requestedAt: new Date().toISOString(),
      };
      return requestId;
    }

    // T4-4: 既知 option id 配列なら pass
    it("既知 option id の配列で submit が成功する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const requestId = setupMultiSelectState(engine);

      const submitted = engine.submitUserInput("plan-001", {
        planId: "plan-001",
        requestId,
        selectedOptionIds: ["opt-a", "opt-b"],
      });

      expect(submitted.awaitingUserInput).toBeNull();
    });

    // T4-2: 空配列なら fail
    it("selectedOptionIds が空配列なら reject する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const requestId = setupMultiSelectState(engine);

      expect(() =>
        engine.submitUserInput("plan-001", {
          planId: "plan-001",
          requestId,
          selectedOptionIds: [],
        }),
      ).toThrow("selectedOptionIds is required");
    });

    // T4-2: undefined なら fail
    it("selectedOptionIds が undefined なら reject する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const requestId = setupMultiSelectState(engine);

      expect(() =>
        engine.submitUserInput("plan-001", {
          planId: "plan-001",
          requestId,
        }),
      ).toThrow("selectedOptionIds is required");
    });

    // T4-3: 未知 option id を含むと fail
    it("未知の option id を含むと reject する", () => {
      const engine = new SkillCreatorWorkflowEngine();
      const requestId = setupMultiSelectState(engine);

      expect(() =>
        engine.submitUserInput("plan-001", {
          planId: "plan-001",
          requestId,
          selectedOptionIds: ["opt-a", "unknown-id"],
        }),
      ).toThrow("selectedOptionIds is invalid");
    });
  });
});
