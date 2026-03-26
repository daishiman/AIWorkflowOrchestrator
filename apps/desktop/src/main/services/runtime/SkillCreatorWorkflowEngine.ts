import type {
  RuntimeSkillCreatorExecuteResult,
  RuntimeSkillCreatorPlanResult,
  TerminalHandoffBundle,
} from "@repo/shared/types";
import type { RuntimeDecision } from "./RuntimePolicyResolver";

export type SkillCreatorWorkflowPhase =
  | "plan"
  | "review"
  | "execute"
  | "verify"
  | "improve"
  | "handoff";

export type SkillCreatorAwaitingUserInputReason =
  | "plan_review"
  | "verification_review";

export type SkillCreatorWorkflowFailureReason =
  | "execution_error"
  | "execution_failed"
  | "verification_review";

export interface SkillCreatorAwaitingUserInput {
  reason: SkillCreatorAwaitingUserInputReason;
  prompt: string;
  requestedAt: string;
}

export interface SkillCreatorVerifyResult {
  status: "pending" | "pass" | "fail";
  reason?: SkillCreatorWorkflowFailureReason;
  message?: string;
  nextAction?: "review" | "improve";
  updatedAt: string;
}

export interface SkillCreatorWorkflowSourceProvenance {
  resolvedSkillCreatorRoot?: string;
  resourceDescriptorHash?: string;
  manifestPath?: string;
  manifestCacheKey?: string;
}

export interface SkillCreatorRouteSnapshot {
  type: RuntimeDecision["type"];
  permissionMode?: "default" | "acceptEdits" | "bypassPermissions";
  launcher?: string;
}

export interface SkillCreatorResumeTokenEnvelope {
  version: "task-sdk-02-v1";
  planId: string;
  currentPhase: SkillCreatorWorkflowPhase;
  artifactCount: number;
  routeSnapshot?: SkillCreatorRouteSnapshot;
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
  updatedAt: string;
}

export interface SkillCreatorWorkflowArtifact {
  id: string;
  phase: SkillCreatorWorkflowPhase;
  kind:
    | "route_snapshot"
    | "plan_result"
    | "execute_result"
    | "handoff_bundle"
    | "verify_result";
  createdAt: string;
  payload: unknown;
}

export interface SkillCreatorWorkflowStateSnapshot {
  planId: string;
  currentPhase: SkillCreatorWorkflowPhase;
  awaitingUserInput: SkillCreatorAwaitingUserInput | null;
  verifyResult: SkillCreatorVerifyResult | null;
  phaseArtifacts: SkillCreatorWorkflowArtifact[];
  resumeTokenEnvelope: SkillCreatorResumeTokenEnvelope;
  routeSnapshot?: SkillCreatorRouteSnapshot;
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
}

interface SkillCreatorWorkflowState extends Omit<
  SkillCreatorWorkflowStateSnapshot,
  "phaseArtifacts"
> {
  phaseArtifacts: SkillCreatorWorkflowArtifact[];
}

export class SkillCreatorWorkflowEngine {
  private readonly workflows = new Map<string, SkillCreatorWorkflowState>();

  recordPlanResult(
    planResult: RuntimeSkillCreatorPlanResult,
    decision: RuntimeDecision,
    sourceProvenance?: SkillCreatorWorkflowSourceProvenance,
  ): SkillCreatorWorkflowStateSnapshot {
    const state = this.ensureWorkflow(planResult.planId, sourceProvenance);
    this.captureRouteSnapshot(state, decision, "plan");
    this.appendArtifact(state, "plan", "plan_result", {
      planId: planResult.planId,
      skillName: planResult.skillName,
      estimatedSteps: planResult.estimatedSteps,
      agentCount: planResult.agents.length,
      scriptCount: planResult.scripts.length,
    });

    state.currentPhase = "review";
    state.awaitingUserInput = {
      reason: "plan_review",
      prompt: "生成された計画を確認し、実行するか判断してください。",
      requestedAt: nowIso(),
    };
    state.verifyResult = null;
    this.refreshResumeToken(state);
    return this.snapshot(state);
  }

  recordExecuteStart(
    planResult: RuntimeSkillCreatorPlanResult,
    decision: RuntimeDecision,
    sourceProvenance?: SkillCreatorWorkflowSourceProvenance,
  ): SkillCreatorWorkflowStateSnapshot {
    const state = this.ensureWorkflow(planResult.planId, sourceProvenance);
    if (!this.getLatestArtifact(state, "plan_result")) {
      this.appendArtifact(state, "plan", "plan_result", {
        planId: planResult.planId,
        skillName: planResult.skillName,
        estimatedSteps: planResult.estimatedSteps,
      });
    }
    if (state.currentPhase === "plan") {
      state.currentPhase = "review";
    }
    this.assertTransition(state.currentPhase, "execute");

    this.captureRouteSnapshot(state, decision, "review");
    state.currentPhase = "execute";
    state.awaitingUserInput = null;
    state.verifyResult = null;
    this.refreshResumeToken(state);
    return this.snapshot(state);
  }

  recordExecuteResult(
    planId: string,
    result: RuntimeSkillCreatorExecuteResult,
  ): SkillCreatorWorkflowStateSnapshot {
    const state = this.getRequiredWorkflow(planId);
    this.assertTransition(state.currentPhase, "verify");
    if (!result.success) {
      return this.recordExecutionFailure(planId, {
        executeId: result.executeId,
        skillName: result.skillName,
        reason: "execution_failed",
        message: result.error ?? "Skill execution failed.",
      });
    }
    this.appendArtifact(state, "execute", "execute_result", {
      executeId: result.executeId,
      skillName: result.skillName,
      success: result.success,
      error: result.error,
    });

    state.currentPhase = "verify";
    state.verifyResult = {
      status: "pending",
      nextAction: "review",
      updatedAt: nowIso(),
    };
    this.appendArtifact(state, "verify", "verify_result", state.verifyResult);
    this.refreshResumeToken(state);
    return this.snapshot(state);
  }

  recordExecutionFailure(
    planId: string,
    input: {
      executeId: string;
      skillName: string;
      reason: Exclude<SkillCreatorWorkflowFailureReason, "verification_review">;
      message: string;
    },
  ): SkillCreatorWorkflowStateSnapshot {
    const state = this.getRequiredWorkflow(planId);
    this.assertPhase(state.currentPhase, "execute", "execute");
    const updatedAt = nowIso();
    this.appendArtifact(state, "execute", "execute_result", {
      executeId: input.executeId,
      skillName: input.skillName,
      success: false,
      error: input.message,
      reason: input.reason,
    });

    state.currentPhase = "review";
    state.awaitingUserInput = {
      reason: "verification_review",
      prompt: buildVerificationReviewPrompt(input.message),
      requestedAt: updatedAt,
    };
    state.verifyResult = {
      status: "fail",
      reason: "verification_review",
      message: input.message,
      nextAction: "review",
      updatedAt,
    };
    this.appendArtifact(state, "verify", "verify_result", state.verifyResult);
    this.refreshResumeToken(state);
    return this.snapshot(state);
  }

  recordExecuteHandoff(
    planResult: RuntimeSkillCreatorPlanResult,
    decision: RuntimeDecision,
    bundle: TerminalHandoffBundle,
    sourceProvenance?: SkillCreatorWorkflowSourceProvenance,
  ): SkillCreatorWorkflowStateSnapshot {
    const state = this.ensureWorkflow(planResult.planId, sourceProvenance);
    if (!this.getLatestArtifact(state, "plan_result")) {
      this.appendArtifact(state, "plan", "plan_result", {
        planId: planResult.planId,
        skillName: planResult.skillName,
        estimatedSteps: planResult.estimatedSteps,
      });
    }
    if (state.currentPhase === "plan") {
      state.currentPhase = "review";
    }
    this.assertTransition(state.currentPhase, "handoff");

    this.captureRouteSnapshot(state, decision, "review");
    this.appendArtifact(state, "handoff", "handoff_bundle", {
      launcher: bundle.launcher,
      suggestedCommand: bundle.suggestedCommand,
      manualRetryRule: bundle.manualRetryRule,
    });

    state.currentPhase = "handoff";
    state.awaitingUserInput = null;
    state.verifyResult = null;
    this.refreshResumeToken(state);
    return this.snapshot(state);
  }

  recordVerifyFailure(
    planId: string,
    message: string,
    nextAction: "review" | "improve" = "improve",
  ): SkillCreatorWorkflowStateSnapshot {
    const state = this.getRequiredWorkflow(planId);
    this.assertTransition(
      state.currentPhase,
      nextAction === "improve" ? "improve" : "review",
    );
    const updatedAt = nowIso();
    state.currentPhase = nextAction === "improve" ? "improve" : "review";
    state.awaitingUserInput =
      nextAction === "review"
        ? {
            reason: "verification_review",
            prompt: buildVerificationReviewPrompt(message),
            requestedAt: updatedAt,
          }
        : null;
    state.verifyResult = {
      status: "fail",
      reason: nextAction === "review" ? "verification_review" : undefined,
      message,
      nextAction,
      updatedAt,
    };
    this.appendArtifact(state, "verify", "verify_result", state.verifyResult);
    this.refreshResumeToken(state);
    return this.snapshot(state);
  }

  getWorkflowState(
    planId: string,
  ): SkillCreatorWorkflowStateSnapshot | undefined {
    const state = this.workflows.get(planId);
    return state ? this.snapshot(state) : undefined;
  }

  private ensureWorkflow(
    planId: string,
    sourceProvenance?: SkillCreatorWorkflowSourceProvenance,
  ): SkillCreatorWorkflowState {
    const existing = this.workflows.get(planId);
    if (existing) {
      if (sourceProvenance) {
        existing.sourceProvenance = {
          ...existing.sourceProvenance,
          ...sourceProvenance,
        };
      }
      this.refreshResumeToken(existing);
      return existing;
    }

    const state: SkillCreatorWorkflowState = {
      planId,
      currentPhase: "plan",
      awaitingUserInput: null,
      verifyResult: null,
      phaseArtifacts: [],
      routeSnapshot: undefined,
      sourceProvenance,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId,
        currentPhase: "plan",
        artifactCount: 0,
        routeSnapshot: undefined,
        sourceProvenance,
        updatedAt: nowIso(),
      },
    };
    this.workflows.set(planId, state);
    return state;
  }

  private getRequiredWorkflow(planId: string): SkillCreatorWorkflowState {
    const state = this.workflows.get(planId);
    if (!state) {
      throw new Error(`workflow state not found for planId: ${planId}`);
    }
    return state;
  }

  private captureRouteSnapshot(
    state: SkillCreatorWorkflowState,
    decision: RuntimeDecision,
    phase: SkillCreatorWorkflowPhase,
  ): void {
    const snapshot = toRouteSnapshot(decision);
    state.routeSnapshot = snapshot;
    this.appendArtifact(state, phase, "route_snapshot", snapshot);
  }

  private getLatestArtifact(
    state: SkillCreatorWorkflowState,
    kind: SkillCreatorWorkflowArtifact["kind"],
  ): SkillCreatorWorkflowArtifact | undefined {
    return [...state.phaseArtifacts]
      .reverse()
      .find((artifact) => artifact.kind === kind);
  }

  private assertTransition(
    currentPhase: SkillCreatorWorkflowPhase,
    nextPhase: SkillCreatorWorkflowPhase,
  ): void {
    const allowedTransitions: Record<
      SkillCreatorWorkflowPhase,
      SkillCreatorWorkflowPhase[]
    > = {
      plan: ["review"],
      review: ["execute", "handoff"],
      execute: ["verify"],
      verify: ["review", "improve"],
      improve: [],
      handoff: [],
    };

    if (allowedTransitions[currentPhase].includes(nextPhase)) {
      return;
    }

    throw new Error(
      `invalid workflow transition: ${currentPhase} -> ${nextPhase}`,
    );
  }

  private assertPhase(
    currentPhase: SkillCreatorWorkflowPhase,
    expectedPhase: SkillCreatorWorkflowPhase,
    attemptedPhase: SkillCreatorWorkflowPhase,
  ): void {
    if (currentPhase === expectedPhase) {
      return;
    }

    throw new Error(
      `invalid workflow transition: ${currentPhase} -> ${attemptedPhase}`,
    );
  }

  private appendArtifact(
    state: SkillCreatorWorkflowState,
    phase: SkillCreatorWorkflowPhase,
    kind: SkillCreatorWorkflowArtifact["kind"],
    payload: unknown,
  ): void {
    const sequence =
      state.phaseArtifacts.filter(
        (artifact) => artifact.phase === phase && artifact.kind === kind,
      ).length + 1;
    const artifact: SkillCreatorWorkflowArtifact = {
      id: `${state.planId}:${phase}:${kind}:${sequence}`,
      phase,
      kind,
      createdAt: nowIso(),
      payload,
    };

    state.phaseArtifacts.push(artifact);
  }

  private refreshResumeToken(state: SkillCreatorWorkflowState): void {
    state.resumeTokenEnvelope = {
      version: "task-sdk-02-v1",
      planId: state.planId,
      currentPhase: state.currentPhase,
      artifactCount: state.phaseArtifacts.length,
      routeSnapshot: state.routeSnapshot,
      sourceProvenance: state.sourceProvenance,
      updatedAt: nowIso(),
    };
  }

  private snapshot(
    state: SkillCreatorWorkflowState,
  ): SkillCreatorWorkflowStateSnapshot {
    return {
      planId: state.planId,
      currentPhase: state.currentPhase,
      awaitingUserInput: state.awaitingUserInput
        ? { ...state.awaitingUserInput }
        : null,
      verifyResult: state.verifyResult ? { ...state.verifyResult } : null,
      phaseArtifacts: state.phaseArtifacts.map((artifact) => ({ ...artifact })),
      resumeTokenEnvelope: {
        ...state.resumeTokenEnvelope,
        routeSnapshot: state.resumeTokenEnvelope.routeSnapshot
          ? { ...state.resumeTokenEnvelope.routeSnapshot }
          : undefined,
        sourceProvenance: state.resumeTokenEnvelope.sourceProvenance
          ? { ...state.resumeTokenEnvelope.sourceProvenance }
          : undefined,
      },
      routeSnapshot: state.routeSnapshot
        ? { ...state.routeSnapshot }
        : undefined,
      sourceProvenance: state.sourceProvenance
        ? { ...state.sourceProvenance }
        : undefined,
    };
  }
}

function toRouteSnapshot(decision: RuntimeDecision): SkillCreatorRouteSnapshot {
  if (decision.type === "integrated_api") {
    return {
      type: "integrated_api",
      permissionMode: decision.permissionMode ?? "default",
    };
  }

  return {
    type: "terminal_handoff",
    launcher: decision.bundle.launcher,
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

function buildVerificationReviewPrompt(message: string): string {
  return `検証結果を確認し、修正方針を判断してください: ${message}`;
}
