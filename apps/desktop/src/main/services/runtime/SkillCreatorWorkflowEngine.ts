import type {
  RuntimeSkillCreatorExecuteResult,
  RuntimeSkillCreatorPlanResult,
  SkillCreatorAwaitingUserInputReason as SharedSkillCreatorAwaitingUserInputReason,
  SkillCreatorRouteSnapshot as SharedSkillCreatorRouteSnapshot,
  SkillCreatorResumeTokenEnvelope as SharedSkillCreatorResumeTokenEnvelope,
  SkillCreatorUserInputRequest as SharedSkillCreatorUserInputRequest,
  SkillCreatorUserInputSubmission,
  SkillCreatorVerifyResult as SharedSkillCreatorVerifyResult,
  SkillCreatorWorkflowFailureReason as SharedSkillCreatorWorkflowFailureReason,
  SkillCreatorWorkflowPhase as SharedSkillCreatorWorkflowPhase,
  SkillCreatorWorkflowSourceProvenance as SharedSkillCreatorWorkflowSourceProvenance,
  SkillCreatorWorkflowUiSnapshot,
  RuntimeSkillCreatorReverifyResult,
  TerminalHandoffBundle,
  RuntimeSkillCreatorVerifyCheck,
  RuntimeSkillCreatorVerifyDetail,
  SkillCreatorPersistedWorkflowCheckpoint,
  SkillCreatorWorkflowArtifactEntry,
  ResumeCompatibilityResult,
  ResumeIncompatibilityReason,
  SkillCreatorSessionListItem,
} from "@repo/shared/types";
import { SKILL_CREATOR_ENGINE_VERSION } from "@repo/shared/types";
import type { RuntimeDecision } from "./RuntimePolicyResolver";

export type SkillCreatorWorkflowPhase = SharedSkillCreatorWorkflowPhase;
export type SkillCreatorAwaitingUserInputReason =
  SharedSkillCreatorAwaitingUserInputReason;
export type SkillCreatorWorkflowFailureReason =
  SharedSkillCreatorWorkflowFailureReason;
export type SkillCreatorAwaitingUserInput = SharedSkillCreatorUserInputRequest;
export type SkillCreatorVerifyResult = SharedSkillCreatorVerifyResult;
export interface SkillCreatorWorkflowSourceProvenance extends SharedSkillCreatorWorkflowSourceProvenance {
  candidateRoots?: string[];
  selectedRoots?: string[];
  selectedResourceIds?: string[];
  droppedResourceIds?: string[];
  structureSignature?: string;
  degradeReasons?: string[];
}
export type SkillCreatorRouteSnapshot = SharedSkillCreatorRouteSnapshot;
export interface SkillCreatorResumeTokenEnvelope extends Omit<
  SharedSkillCreatorResumeTokenEnvelope,
  "routeSnapshot" | "sourceProvenance"
> {
  routeSnapshot?: SkillCreatorRouteSnapshot;
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
}

export interface SkillCreatorWorkflowArtifact {
  id: string;
  phase: SkillCreatorWorkflowPhase;
  kind:
    | "route_snapshot"
    | "plan_result"
    | "execute_result"
    | "handoff_bundle"
    | "verify_result"
    | "user_input_submission"
    | "phase_transition";
  createdAt: string;
  payload: unknown;
}

export interface SkillCreatorWorkflowStateSnapshot extends SkillCreatorWorkflowUiSnapshot {
  planId: string;
  currentPhase: SkillCreatorWorkflowPhase;
  awaitingUserInput: SkillCreatorAwaitingUserInput | null;
  verifyResult: SkillCreatorVerifyResult | null;
  phaseArtifacts: SkillCreatorWorkflowArtifact[];
  resumeTokenEnvelope: SkillCreatorResumeTokenEnvelope;
  routeSnapshot?: SkillCreatorRouteSnapshot;
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
  handoffBundle?: TerminalHandoffBundle | null;
}

interface SkillCreatorWorkflowState extends Omit<
  SkillCreatorWorkflowStateSnapshot,
  "phaseArtifacts"
> {
  phaseArtifacts: SkillCreatorWorkflowArtifact[];
}

/**
 * executeAsync の内部進捗フェーズ。
 * Renderer 公開用の WorkflowPhase とは別の、バックグラウンド実行の進捗ラベル。
 */
export type SkillCreatorExecuteAsyncPhase = "executing" | "complete" | "error";

/**
 * フェーズ遷移通知コールバック型。
 * planId を含めることで、複数の同時実行でも通知元を識別できる。
 */
export type PhaseChangedCallback = (
  planId: string,
  phase: SkillCreatorExecuteAsyncPhase,
  progress: number,
) => void;

export class SkillCreatorWorkflowEngine {
  private readonly workflows = new Map<string, SkillCreatorWorkflowState>();
  private readonly checkpoints = new Map<
    string,
    SkillCreatorPersistedWorkflowCheckpoint
  >();

  /**
   * フェーズ遷移通知コールバック。
   * 設定した場合、triggerPhaseTransition() 呼び出し時に発火する。
   * planId を含めて通知するため、並列実行でも安全に扱える。
   */
  onPhaseChanged?: PhaseChangedCallback;

  /**
   * フェーズ遷移イベントを発火する。
   * onPhaseChanged が設定されている場合に呼ぶ。未設定時は何もしない（Optional Chaining）。
   *
   * @param planId - 実行対象の planId
   * @param phase - 実行内部フェーズ名（例: "executing", "complete", "error"）
   * @param progress - 進捗率（0-100）
   */
  triggerPhaseTransition(
    planId: string,
    phase: SkillCreatorExecuteAsyncPhase,
    progress: number,
  ): void {
    this.onPhaseChanged?.(planId, phase, progress);
  }

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
    state.awaitingUserInput = createPlanReviewRequest(planResult.planId);
    state.verifyResult = null;
    state.handoffBundle = null;
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
    state.handoffBundle = null;
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
      sessionId: result.sessionId,
      resultSubtype: result.resultSubtype,
      stopReason: result.stopReason,
      permissionDenials: result.permissionDenials,
      sdkEvents: result.sdkEvents,
      sourceProvenance: result.sourceProvenance,
      persistResult: result.persistResult,
      persistError: result.persistError,
    });

    state.currentPhase = "verify";
    state.verifyResult = {
      status: "pending",
      nextAction: "review",
      updatedAt: nowIso(),
    };
    state.handoffBundle = null;
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
      sessionId?: string;
      resultSubtype?: string;
      stopReason?: string;
      permissionDenials?: RuntimeSkillCreatorExecuteResult["permissionDenials"];
      sdkEvents?: RuntimeSkillCreatorExecuteResult["sdkEvents"];
      sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
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
      sessionId: input.sessionId,
      resultSubtype: input.resultSubtype,
      stopReason: input.stopReason,
      permissionDenials: input.permissionDenials,
      sdkEvents: input.sdkEvents,
      sourceProvenance: input.sourceProvenance,
    });

    state.currentPhase = "review";
    state.awaitingUserInput = createVerificationReviewRequest(
      planId,
      input.message,
      updatedAt,
    );
    state.verifyResult = {
      status: "fail",
      reason: "verification_review",
      message: input.message,
      nextAction: "review",
      updatedAt,
    };
    state.handoffBundle = null;
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
    state.handoffBundle = { ...bundle };
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
        ? createVerificationReviewRequest(planId, message, updatedAt)
        : null;
    state.verifyResult = {
      status: "fail",
      reason: nextAction === "review" ? "verification_review" : undefined,
      message,
      nextAction,
      updatedAt,
    };
    state.handoffBundle = null;
    this.appendArtifact(state, "verify", "verify_result", state.verifyResult);
    this.refreshResumeToken(state);
    return this.snapshot(state);
  }

  /**
   * verify 成功時の状態遷移を記録する。
   * verifyResult.status を "pass" に設定し、nextAction を "handoff" に設定する。
   * currentPhase は "verify" のまま維持（handoff への遷移は別のステップ）。
   *
   * TASK-P0-02: verify→improve→re-verify 閉ループ
   */
  recordVerifyPass(
    planId: string,
    checks: RuntimeSkillCreatorVerifyCheck[],
  ): SkillCreatorWorkflowStateSnapshot {
    const state = this.getRequiredWorkflow(planId);
    const updatedAt = nowIso();
    state.currentPhase = "verify";
    state.verifyResult = {
      ...state.verifyResult,
      status: "pass",
      nextAction: "handoff",
      updatedAt,
    };
    this.appendArtifact(state, "verify", "verify_result", {
      ...state.verifyResult,
      checks,
    });
    this.refreshResumeToken(state);
    return this.snapshot(state);
  }

  /**
   * improve 試行の開始を記録し、試行カウントをインクリメントする。
   * phase を "improve" に遷移させる。
   *
   * TASK-P0-02: verify→improve→re-verify 閉ループ
   */
  recordImproveAttempt(
    planId: string,
    failedChecks: RuntimeSkillCreatorVerifyCheck[],
  ): SkillCreatorWorkflowStateSnapshot {
    const state = this.getRequiredWorkflow(planId);
    // 閉ループ: verify→improve は通常遷移、improve→improve は自己遷移（re-verify 後の再試行）
    if (state.currentPhase !== "improve") {
      this.assertTransition(state.currentPhase, "improve");
    }

    const currentCount = state.verifyResult?.improveAttemptCount ?? 0;
    const updatedAt = nowIso();
    state.verifyResult = {
      ...state.verifyResult,
      status: "fail",
      improveAttemptCount: currentCount + 1,
      failedChecksSummary: failedChecks
        .filter((c) => c.severity !== "info")
        .map((c) => `${c.id}: ${c.summary}`)
        .join("; "),
      updatedAt,
    };
    state.currentPhase = "improve";
    this.appendArtifact(state, "verify", "verify_result", {
      ...state.verifyResult,
      failedChecks,
    });
    this.refreshResumeToken(state);
    return this.snapshot(state);
  }

  /**
   * 現在の improve 試行回数を取得する。
   *
   * TASK-P0-02: verify→improve→re-verify 閉ループ
   */
  getImproveAttemptCount(planId: string): number {
    const state = this.workflows.get(planId);
    if (!state) return 0;
    return state.verifyResult?.improveAttemptCount ?? 0;
  }

  getWorkflowState(
    planId: string,
  ): SkillCreatorWorkflowStateSnapshot | undefined {
    const state = this.workflows.get(planId);
    return state ? this.snapshot(state) : undefined;
  }

  submitUserInput(
    planId: string,
    submission: SkillCreatorUserInputSubmission,
  ): SkillCreatorWorkflowStateSnapshot {
    const state = this.getRequiredWorkflow(planId);
    const request = state.awaitingUserInput;
    if (!request) {
      throw new Error("No pending user input for this workflow");
    }
    if (submission.planId !== planId) {
      throw new Error("planId mismatch");
    }
    if (request.requestId !== submission.requestId) {
      throw new Error("stale requestId");
    }

    validateUserInputSubmission(request, submission);

    this.appendArtifact(state, state.currentPhase, "user_input_submission", {
      requestId: submission.requestId,
      payload: sanitizeSubmissionPayload(submission),
    });

    const beforePhase = state.currentPhase;
    state.awaitingUserInput = null;
    if (submission.textValue?.trim()) {
      state.verifyResult = {
        ...(state.verifyResult ?? {
          status: "fail",
          nextAction: "review",
          updatedAt: nowIso(),
        }),
        message: submission.textValue.trim(),
        updatedAt: nowIso(),
      };
    }

    this.applyPhaseTransition(state, request.reason, submission);

    const afterPhase = state.currentPhase;
    if (beforePhase !== afterPhase) {
      this.appendArtifact(state, afterPhase, "phase_transition", {
        fromPhase: beforePhase,
        toPhase: afterPhase,
        reason: request.reason,
        selectedOptionId: submission.selectedOptionId,
        selectedOptionIds: normalizeSelectedOptionIds(submission),
      });
    }

    this.refreshResumeToken(state);
    return this.snapshot(state);
  }

  private applyPhaseTransition(
    state: SkillCreatorWorkflowState,
    reason: SkillCreatorAwaitingUserInputReason,
    submission: SkillCreatorUserInputSubmission,
  ): void {
    switch (reason) {
      case "plan_review":
        this.applyPlanReviewTransition(state, submission);
        break;
      case "verification_review":
        this.applyVerificationReviewTransition(state, submission);
        break;
      default:
        // NFR-3: unknown reason はフォールバック（何もしない）
        break;
    }
  }

  private applyPlanReviewTransition(
    state: SkillCreatorWorkflowState,
    submission: SkillCreatorUserInputSubmission,
  ): void {
    switch (submission.selectedOptionId) {
      case "ready_to_execute":
        state.currentPhase = "execute";
        break;
      case "needs_changes":
        state.currentPhase = "plan";
        break;
    }
  }

  private applyVerificationReviewTransition(
    state: SkillCreatorWorkflowState,
    submission: SkillCreatorUserInputSubmission,
  ): void {
    const base = state.verifyResult ?? {
      status: "fail" as const,
      nextAction: "review" as const,
      updatedAt: nowIso(),
    };

    switch (submission.selectedOptionId) {
      case "approve":
        state.verifyResult = {
          ...base,
          status: "pass",
          nextAction: "handoff",
          updatedAt: nowIso(),
        };
        break;
      case "improve":
        state.verifyResult = {
          ...base,
          nextAction: "improve",
          updatedAt: nowIso(),
        };
        break;
      case "reject":
        state.verifyResult = {
          ...base,
          status: "fail",
          nextAction: "review",
          updatedAt: nowIso(),
        };
        state.currentPhase = "plan";
        break;
    }
  }

  getVerifyDetail(planId: string): RuntimeSkillCreatorVerifyDetail {
    return this.buildVerifyDetail(this.getRequiredWorkflow(planId));
  }

  requestReverify(planId: string): RuntimeSkillCreatorReverifyResult {
    const state = this.getRequiredWorkflow(planId);
    const disabledReason = this.getReverifyDisabledReason(state);
    if (disabledReason) {
      return {
        accepted: false,
        disabledReason,
      };
    }

    state.currentPhase = "verify";
    state.awaitingUserInput = null;
    state.verifyResult = {
      status: "pending",
      message:
        "再検証を要求しました。detail surface を更新して続行してください。",
      nextAction: "review",
      updatedAt: nowIso(),
    };
    this.appendArtifact(state, "verify", "verify_result", state.verifyResult);
    this.refreshResumeToken(state);

    return { accepted: true };
  }

  /**
   * persisted checkpoint から workflow state を復元する。
   * TASK-SDK-08: phase boundary checkpoint からの hydrate。
   */
  hydrateFromCheckpoint(
    checkpoint: SkillCreatorPersistedWorkflowCheckpoint,
  ): SkillCreatorWorkflowStateSnapshot {
    const ws = checkpoint.workflowStateSnapshot;

    const artifacts: SkillCreatorWorkflowArtifact[] = ws.phaseArtifacts.map(
      (entry, idx) => ({
        id: `${checkpoint.planId}:${entry.phase}:${entry.type}:restored-${idx}`,
        phase: entry.phase,
        kind: entry.type as SkillCreatorWorkflowArtifact["kind"],
        createdAt: entry.timestamp,
        payload: entry.data,
      }),
    );

    const state: SkillCreatorWorkflowState = {
      planId: checkpoint.planId,
      currentPhase: ws.currentPhase,
      awaitingUserInput: ws.awaitingUserInput,
      verifyResult: ws.verifyResult,
      phaseArtifacts: artifacts,
      resumeTokenEnvelope:
        ws.resumeTokenEnvelope as SkillCreatorResumeTokenEnvelope,
      routeSnapshot: checkpoint.compatibilitySnapshot.routeSnapshot,
      sourceProvenance: checkpoint.compatibilitySnapshot.sourceProvenance as
        | SkillCreatorWorkflowSourceProvenance
        | undefined,
      handoffBundle: ws.handoffBundle ?? null,
    };

    this.workflows.set(checkpoint.planId, state);
    return this.snapshot(state);
  }

  /**
   * 現在の workflow state を永続化用 artifact entries に変換する。
   * TASK-SDK-08: saveCheckpoint の入力データを engine から取得する。
   */
  serializeArtifactsForPersistence(
    planId: string,
  ): SkillCreatorWorkflowArtifactEntry[] {
    const state = this.workflows.get(planId);
    if (!state) return [];

    return state.phaseArtifacts.map((artifact) => ({
      phase: artifact.phase,
      type: artifact.kind,
      timestamp: artifact.createdAt,
      data: artifact.payload,
    }));
  }

  /**
   * 有効な（TTL内・未無効化）チェックポイントの一覧を返す。(TASK-P0-08)
   */
  listCheckpoints(): SkillCreatorSessionListItem[] {
    const now = Date.now();
    const TTL_MS = 86_400_000; // 24h
    const result: SkillCreatorSessionListItem[] = [];

    for (const cp of this.checkpoints.values()) {
      if (now - cp.updatedAt > TTL_MS) continue;
      if (cp.invalidatedAt !== undefined) continue;

      const compatibility = this.evaluateCompatibility(cp);
      result.push({
        checkpointId: cp.checkpointId,
        planId: cp.planId,
        currentPhase: cp.workflowStateSnapshot.currentPhase,
        checkpointType: cp.checkpointType,
        compatibility,
        updatedAt: cp.updatedAt,
      });
    }

    return result;
  }

  /**
   * チェックポイントから UI スナップショットを返す。(TASK-P0-08)
   */
  getCheckpointSnapshot(
    checkpointId: string,
  ): SkillCreatorWorkflowStateSnapshot | undefined {
    const cp = this.checkpoints.get(checkpointId);
    if (!cp) return undefined;
    return this.buildSnapshotFromCheckpoint(cp);
  }

  /**
   * チェックポイントから workflow を復元する。incompatible/conflict は undefined。(TASK-P0-08)
   */
  resumeFromCheckpoint(
    checkpointId: string,
  ): SkillCreatorWorkflowStateSnapshot | undefined {
    const cp = this.checkpoints.get(checkpointId);
    if (!cp) return undefined;

    const compatibility = this.evaluateCompatibility(cp);
    if (
      compatibility.status === "incompatible" ||
      compatibility.status === "conflict"
    ) {
      return undefined;
    }

    return this.hydrateFromCheckpoint(cp);
  }

  /**
   * チェックポイントを削除する。存在しない場合は何もしない。(TASK-P0-08)
   */
  deleteCheckpoint(checkpointId: string): void {
    this.checkpoints.delete(checkpointId);
  }

  private evaluateCompatibility(
    cp: SkillCreatorPersistedWorkflowCheckpoint,
  ): ResumeCompatibilityResult {
    // Active lease check
    if (cp.lease && cp.lease.leaseExpiresAt > Date.now()) {
      return {
        status: "conflict",
        reasons: ["active_lease_conflict" as ResumeIncompatibilityReason],
        warnings: [],
      };
    }

    // Engine version check
    if (
      cp.compatibilitySnapshot.engineVersion !== SKILL_CREATOR_ENGINE_VERSION
    ) {
      return {
        status: "incompatible",
        reasons: ["version_mismatch" as ResumeIncompatibilityReason],
        warnings: [],
      };
    }

    // Provenance mismatch → compatible_with_warning
    const currentWorkflow = this.workflows.get(cp.planId);
    if (
      currentWorkflow?.sourceProvenance?.resolvedSkillCreatorRoot &&
      cp.compatibilitySnapshot.sourceProvenance?.resolvedSkillCreatorRoot &&
      currentWorkflow.sourceProvenance.resolvedSkillCreatorRoot !==
        cp.compatibilitySnapshot.sourceProvenance.resolvedSkillCreatorRoot
    ) {
      return {
        status: "compatible_with_warning",
        reasons: [],
        warnings: ["スキルクリエイターのルートパスが変更されています"],
      };
    }

    return { status: "compatible", reasons: [], warnings: [] };
  }

  private buildSnapshotFromCheckpoint(
    cp: SkillCreatorPersistedWorkflowCheckpoint,
  ): SkillCreatorWorkflowStateSnapshot {
    const ws = cp.workflowStateSnapshot;
    const artifacts: SkillCreatorWorkflowArtifact[] = ws.phaseArtifacts.map(
      (entry, idx) => ({
        id: `${cp.planId}:${entry.phase}:${entry.type}:snapshot-${idx}`,
        phase: entry.phase,
        kind: entry.type as SkillCreatorWorkflowArtifact["kind"],
        createdAt: entry.timestamp,
        payload: entry.data,
      }),
    );

    return {
      planId: cp.planId,
      currentPhase: ws.currentPhase,
      awaitingUserInput: ws.awaitingUserInput,
      verifyResult: ws.verifyResult,
      phaseArtifacts: artifacts,
      resumeTokenEnvelope:
        ws.resumeTokenEnvelope as SkillCreatorResumeTokenEnvelope,
      routeSnapshot: cp.compatibilitySnapshot.routeSnapshot,
      sourceProvenance: cp.compatibilitySnapshot.sourceProvenance as
        | SkillCreatorWorkflowSourceProvenance
        | undefined,
      handoffBundle: ws.handoffBundle ?? null,
    };
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
      handoffBundle: null,
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
      improve: ["execute"],
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
      handoffBundle: state.handoffBundle ? { ...state.handoffBundle } : null,
    };
  }

  private buildVerifyDetail(
    state: SkillCreatorWorkflowState,
  ): RuntimeSkillCreatorVerifyDetail {
    const status = state.verifyResult?.status ?? "pending";
    const disabledReason = this.getReverifyDisabledReason(state);
    const route = toVerifyDetailRoute(state.routeSnapshot);
    const checks = this.buildVerifyChecks(state, route.summary, disabledReason);

    return {
      planId: state.planId,
      currentPhase: state.currentPhase,
      status,
      message: state.verifyResult?.message,
      nextAction: state.verifyResult?.nextAction,
      checks,
      evidenceCount: countVerifyEvidence(state),
      resolvedSkillCreatorRoot:
        state.sourceProvenance?.resolvedSkillCreatorRoot,
      manifestPath: state.sourceProvenance?.manifestPath,
      resourceDescriptorHash: state.sourceProvenance?.resourceDescriptorHash,
      manifestCacheKey: state.sourceProvenance?.manifestCacheKey,
      route,
      reverifyEligible: disabledReason == null,
      disabledReason,
      delegatedGovernanceNote:
        "approval / disclosure / manual boundary は Task07 owner として参照表示に留めます。",
      delegatedSessionNote:
        "persistence / resume invalidation / stale session は Task08 owner として参照表示に留めます。",
    };
  }

  private buildVerifyChecks(
    state: SkillCreatorWorkflowState,
    routeSummary: string,
    disabledReason?: string,
  ): RuntimeSkillCreatorVerifyCheck[] {
    const status = state.verifyResult?.status ?? "pending";
    const checks: RuntimeSkillCreatorVerifyCheck[] = [
      {
        id: "layer3-verify-status",
        layer: "layer3",
        severity: toVerifyCheckSeverity(status),
        summary:
          state.verifyResult?.message ??
          "verify summary は owner を変えず engine snapshot から導出します。",
        evidenceSummary: `nextAction=${state.verifyResult?.nextAction ?? "review"}`,
      },
      {
        id: "layer3-route-snapshot",
        layer: "layer3",
        severity:
          state.routeSnapshot?.type === "terminal_handoff" ? "warning" : "info",
        summary: routeSummary,
        evidenceSummary: `phase=${state.currentPhase}`,
      },
      {
        id: "layer4-provenance",
        layer: "layer4",
        severity: hasAnyProvenance(state) ? "info" : "warning",
        summary: hasAnyProvenance(state)
          ? "source provenance / hash evidence を detail surface へ投影できます。"
          : "source provenance は一部未取得ですが optional field として扱います。",
        evidenceSummary: summarizeProvenance(state.sourceProvenance),
      },
      {
        id: "layer4-reverify-action",
        layer: "layer4",
        severity: disabledReason ? "warning" : "info",
        summary: disabledReason
          ? `re-verify は現在無効です: ${disabledReason}`
          : "re-verify action は verify loop を再開できます。",
        evidenceSummary: "Task07 / Task08 owner 項目は引数へ混入させません。",
      },
    ];

    return checks;
  }

  private getReverifyDisabledReason(
    state: SkillCreatorWorkflowState,
  ): string | undefined {
    if (state.currentPhase === "execute") {
      return "実行中は再検証できません。";
    }
    if (state.routeSnapshot?.type === "terminal_handoff") {
      return "terminal_handoff の再検証導線は Task07 owner のため、この surface では再実行しません。";
    }

    const latestExecuteResult = getExecuteArtifactPayload(
      this.getLatestArtifact(state, "execute_result"),
    );
    if (!latestExecuteResult) {
      return "実行結果がまだ存在しないため再検証できません。";
    }
    if (!latestExecuteResult.success) {
      return "最後の実行が成功していないため再検証できません。";
    }

    return undefined;
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

function createPlanReviewRequest(
  planId: string,
  requestedAt = nowIso(),
): SkillCreatorAwaitingUserInput {
  return {
    requestId: buildRequestId(planId, "plan_review", requestedAt),
    reason: "plan_review",
    title: "計画レビュー",
    prompt: "生成された計画を確認し、次のアクションを選択してください。",
    kind: "single_select",
    options: [
      {
        id: "ready_to_execute",
        label: "このまま実行する",
      },
      {
        id: "needs_changes",
        label: "内容を見直したい",
      },
    ],
    allowSkip: false,
    requestedAt,
  };
}

function createVerificationReviewRequest(
  planId: string,
  message: string,
  requestedAt = nowIso(),
): SkillCreatorAwaitingUserInput {
  return {
    requestId: buildRequestId(planId, "verification_review", requestedAt),
    reason: "verification_review",
    title: "検証レビュー",
    prompt: buildVerificationReviewPrompt(message),
    kind: "single_select",
    options: [
      {
        id: "approve",
        label: "承認してhandoffへ進む",
      },
      {
        id: "improve",
        label: "改善して再検証する",
      },
      {
        id: "reject",
        label: "差し戻して再計画する",
      },
    ],
    allowSkip: false,
    requestedAt,
  };
}

function buildRequestId(
  planId: string,
  reason: SkillCreatorAwaitingUserInputReason,
  requestedAt: string,
): string {
  return `${planId}:${reason}:${requestedAt}`;
}

function validateUserInputSubmission(
  request: SkillCreatorAwaitingUserInput,
  submission: SkillCreatorUserInputSubmission,
): void {
  switch (request.kind) {
    case "single_select":
      if (!submission.selectedOptionId) {
        throw new Error("selectedOptionId is invalid");
      }
      // NFR-3: verification_review は unknown option を no-op fallback として許容する
      if (
        request.reason !== "verification_review" &&
        !request.options?.some(
          (option) => option.id === submission.selectedOptionId,
        )
      ) {
        throw new Error("selectedOptionId is invalid");
      }
      return;
    case "multi_select": {
      const selectedOptionIds = normalizeSelectedOptionIds(submission);
      if (selectedOptionIds.length === 0) {
        throw new Error("selectedOptionIds is required");
      }
      if (
        request.reason !== "verification_review" &&
        !selectedOptionIds.every((selectedId) =>
          request.options?.some((option) => option.id === selectedId),
        )
      ) {
        throw new Error("selectedOptionIds is invalid");
      }
      return;
    }
    case "free_text":
      if (!submission.textValue || submission.textValue.trim() === "") {
        throw new Error("textValue is required");
      }
      return;
    case "secret":
      if (!submission.secretValue || submission.secretValue.trim() === "") {
        throw new Error("secretValue is required");
      }
      return;
    case "confirm":
      if (typeof submission.confirmed !== "boolean") {
        throw new Error("confirmed is required");
      }
      return;
  }
}

function normalizeSelectedOptionIds(
  submission: SkillCreatorUserInputSubmission,
): string[] {
  return submission.selectedOptionIds ?? submission.selectedValues ?? [];
}

function sanitizeSubmissionPayload(
  submission: SkillCreatorUserInputSubmission,
): SkillCreatorUserInputSubmission {
  if (!submission.secretValue) {
    return { ...submission };
  }

  return {
    ...submission,
    secretValue: "[REDACTED]",
  };
}

function toVerifyCheckSeverity(
  status: SkillCreatorVerifyResult["status"],
): RuntimeSkillCreatorVerifyCheck["severity"] {
  if (status === "fail") {
    return "error";
  }
  if (status === "pass") {
    return "info";
  }
  return "warning";
}

function hasAnyProvenance(state: SkillCreatorWorkflowState): boolean {
  return Boolean(
    state.sourceProvenance?.resolvedSkillCreatorRoot ||
    state.sourceProvenance?.manifestPath ||
    state.sourceProvenance?.resourceDescriptorHash ||
    state.sourceProvenance?.manifestCacheKey,
  );
}

function summarizeProvenance(
  provenance?: SkillCreatorWorkflowSourceProvenance,
): string {
  if (!provenance) {
    return "source provenance unavailable";
  }

  const facts = [
    provenance.resolvedSkillCreatorRoot
      ? `root=${provenance.resolvedSkillCreatorRoot}`
      : null,
    provenance.manifestPath ? `manifest=${provenance.manifestPath}` : null,
    provenance.resourceDescriptorHash
      ? `hash=${provenance.resourceDescriptorHash}`
      : null,
    provenance.manifestCacheKey
      ? `cacheKey=${provenance.manifestCacheKey}`
      : null,
  ].filter((value): value is string => value != null);

  return facts.length > 0 ? facts.join(", ") : "source provenance unavailable";
}

function toVerifyDetailRoute(
  routeSnapshot?: SkillCreatorRouteSnapshot,
): RuntimeSkillCreatorVerifyDetail["route"] {
  if (!routeSnapshot) {
    return {
      type: "integrated_api",
      summary: "route snapshot はまだ生成されていません。",
    };
  }

  if (routeSnapshot.type === "terminal_handoff") {
    return {
      type: "terminal_handoff",
      launcher: routeSnapshot.launcher,
      summary: `terminal_handoff via ${routeSnapshot.launcher ?? "unknown launcher"}`,
    };
  }

  return {
    type: "integrated_api",
    permissionMode: routeSnapshot.permissionMode,
    summary: `integrated_api (${routeSnapshot.permissionMode ?? "default"})`,
  };
}

function countVerifyEvidence(state: SkillCreatorWorkflowState): number {
  const artifactEvidenceCount = state.phaseArtifacts.filter((artifact) =>
    ["route_snapshot", "execute_result", "verify_result"].includes(
      artifact.kind,
    ),
  ).length;
  const provenanceEvidenceCount = [
    state.sourceProvenance?.resolvedSkillCreatorRoot,
    state.sourceProvenance?.manifestPath,
    state.sourceProvenance?.resourceDescriptorHash,
    state.sourceProvenance?.manifestCacheKey,
  ].filter(Boolean).length;

  return artifactEvidenceCount + provenanceEvidenceCount;
}

function getExecuteArtifactPayload(
  artifact?: SkillCreatorWorkflowArtifact,
): { success?: boolean } | undefined {
  if (
    !artifact ||
    artifact.payload == null ||
    typeof artifact.payload !== "object"
  ) {
    return undefined;
  }

  return artifact.payload as { success?: boolean };
}
