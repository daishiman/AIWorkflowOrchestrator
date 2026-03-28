/**
 * SkillCreatorWorkflowSessionRepository
 * TASK-SDK-08: session-persistence-and-resume-contract
 *
 * workflow checkpoint の save/load/invalidate を管理する repository。
 * WorkflowSessionStorage を内部依存とし、ResumeCompatibilityEvaluator を使って
 * resume 可否を判定する。
 */

import { randomUUID } from "crypto";
import type {
  SkillCreatorPersistedWorkflowCheckpoint,
  SkillCreatorCheckpointType,
  SkillCreatorCompatibilitySnapshot,
  SkillCreatorWorkflowArtifactEntry,
  SkillCreatorResumeTokenEnvelope,
  SkillCreatorUserInputRequest,
  SkillCreatorVerifyResult,
  ResumeCompatibilityResult,
  WorkflowCheckpointLease,
  TerminalHandoffBundle,
  SkillCreatorWorkflowPhase,
} from "@repo/shared/types";
import { WorkflowSessionStorage } from "./WorkflowSessionStorage";
import {
  ResumeCompatibilityEvaluator,
  type ResumeEvaluationContext,
} from "./ResumeCompatibilityEvaluator";

const DEFAULT_LEASE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface SaveCheckpointInput {
  planId: string;
  checkpointType: SkillCreatorCheckpointType;
  workflowState: {
    currentPhase: SkillCreatorWorkflowPhase;
    awaitingUserInput: SkillCreatorUserInputRequest | null;
    verifyResult: SkillCreatorVerifyResult | null;
    phaseArtifacts: SkillCreatorWorkflowArtifactEntry[];
    resumeTokenEnvelope: SkillCreatorResumeTokenEnvelope;
    handoffBundle?: TerminalHandoffBundle | null;
  };
  compatibilitySnapshot: SkillCreatorCompatibilitySnapshot;
  expectedRevision?: number;
  ownerInstanceId: string;
}

export interface SaveCheckpointResult {
  success: boolean;
  checkpointId?: string;
  revision?: number;
  error?:
    | "revision_mismatch"
    | "active_lease_conflict"
    | "missing_workflow_payload";
}

export interface SkillCreatorWorkflowSessionRepositoryOptions {
  storage?: WorkflowSessionStorage;
  evaluator?: ResumeCompatibilityEvaluator;
  leaseTtlMs?: number;
}

export class SkillCreatorWorkflowSessionRepository {
  private storage: WorkflowSessionStorage;
  private evaluator: ResumeCompatibilityEvaluator;
  private leaseTtlMs: number;

  constructor(options: SkillCreatorWorkflowSessionRepositoryOptions = {}) {
    this.storage = options.storage ?? new WorkflowSessionStorage();
    this.evaluator = options.evaluator ?? new ResumeCompatibilityEvaluator();
    this.leaseTtlMs = options.leaseTtlMs ?? DEFAULT_LEASE_TTL_MS;
  }

  saveCheckpoint(input: SaveCheckpointInput): SaveCheckpointResult {
    const existing = this.storage.getCheckpoint(input.planId);
    const now = Date.now();

    // revision check: stale write guard
    if (existing) {
      if (input.expectedRevision == null) {
        return { success: false, error: "revision_mismatch" };
      }
      if (existing.revision !== input.expectedRevision) {
        return { success: false, error: "revision_mismatch" };
      }
    }

    // lease check: another writer holds an active lease
    if (existing?.lease) {
      if (
        existing.lease.ownerInstanceId !== input.ownerInstanceId &&
        existing.lease.leaseExpiresAt > now
      ) {
        return { success: false, error: "active_lease_conflict" };
      }
    }

    const newRevision = existing ? existing.revision + 1 : 1;
    const checkpointId = randomUUID();

    const lease: WorkflowCheckpointLease = {
      ownerInstanceId: input.ownerInstanceId,
      leaseExpiresAt: now + this.leaseTtlMs,
      acquiredAt: now,
    };

    if (
      !hasUsableWorkflowPayload(
        input.planId,
        input.workflowState,
        input.checkpointType,
        input.compatibilitySnapshot,
      )
    ) {
      return { success: false, error: "missing_workflow_payload" };
    }

    const checkpoint: SkillCreatorPersistedWorkflowCheckpoint = {
      checkpointId,
      planId: input.planId,
      checkpointType: input.checkpointType,
      workflowStateSnapshot: input.workflowState,
      compatibilitySnapshot: input.compatibilitySnapshot,
      revision: newRevision,
      lease,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.storage.setCheckpoint(input.planId, checkpoint);

    return {
      success: true,
      checkpointId,
      revision: newRevision,
    };
  }

  loadLatestCheckpoint(
    planId: string,
  ): SkillCreatorPersistedWorkflowCheckpoint | undefined {
    const checkpoint = this.storage.getCheckpoint(planId);
    if (!checkpoint || checkpoint.invalidatedAt != null) {
      return undefined;
    }
    if (
      !hasUsableWorkflowPayload(
        planId,
        checkpoint.workflowStateSnapshot,
        checkpoint.checkpointType,
        checkpoint.compatibilitySnapshot,
      )
    ) {
      return undefined;
    }
    return checkpoint;
  }

  invalidateCheckpoint(planId: string): boolean {
    const checkpoint = this.storage.getCheckpoint(planId);
    if (!checkpoint) return false;

    this.storage.setCheckpoint(planId, {
      ...checkpoint,
      invalidatedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return true;
  }

  deleteCheckpoint(planId: string): void {
    this.storage.deleteCheckpoint(planId);
  }

  evaluateResumeCompatibility(
    planId: string,
    context: ResumeEvaluationContext,
  ): ResumeCompatibilityResult {
    const checkpoint = this.storage.getCheckpoint(planId);
    if (!checkpoint) {
      return {
        status: "incompatible",
        reasons: ["checkpoint_not_found"],
        warnings: [],
      };
    }
    if (
      !hasUsableWorkflowPayload(
        planId,
        checkpoint.workflowStateSnapshot,
        checkpoint.checkpointType,
        checkpoint.compatibilitySnapshot,
      )
    ) {
      return {
        status: "incompatible",
        reasons: ["missing_workflow_payload"],
        warnings: [],
      };
    }
    return this.evaluator.evaluate(checkpoint, context);
  }

  listCheckpoints(): SkillCreatorPersistedWorkflowCheckpoint[] {
    const all = this.storage.getAllCheckpoints();
    return Object.values(all).filter(
      (cp) =>
        cp.invalidatedAt == null &&
        hasUsableWorkflowPayload(
          cp.planId,
          cp.workflowStateSnapshot,
          cp.checkpointType,
          cp.compatibilitySnapshot,
        ),
    );
  }

  cleanupExpiredLeases(): number {
    const all = this.storage.getAllCheckpoints();
    const now = Date.now();
    let cleaned = 0;

    for (const [planId, checkpoint] of Object.entries(all)) {
      if (checkpoint.lease && checkpoint.lease.leaseExpiresAt <= now) {
        this.storage.setCheckpoint(planId, {
          ...checkpoint,
          lease: undefined,
          updatedAt: now,
        });
        cleaned++;
      }
    }
    return cleaned;
  }
}

function hasUsableWorkflowPayload(
  planId: string,
  workflowState: SaveCheckpointInput["workflowState"] | undefined,
  checkpointType: SkillCreatorCheckpointType,
  compatibilitySnapshot?: SkillCreatorCompatibilitySnapshot,
): boolean {
  if (!workflowState) {
    return false;
  }

  const { currentPhase, phaseArtifacts, resumeTokenEnvelope } = workflowState;
  if (
    !currentPhase ||
    !Array.isArray(phaseArtifacts) ||
    !resumeTokenEnvelope ||
    phaseArtifacts.length === 0 ||
    resumeTokenEnvelope.planId === "" ||
    resumeTokenEnvelope.planId == null
  ) {
    return false;
  }

  if (
    resumeTokenEnvelope.planId !== planId ||
    resumeTokenEnvelope.currentPhase !== currentPhase ||
    resumeTokenEnvelope.artifactCount !== phaseArtifacts.length ||
    !resumeTokenEnvelope.routeSnapshot ||
    !resumeTokenEnvelope.sourceProvenance
  ) {
    return false;
  }

  if (
    !compatibilitySnapshot?.routeSnapshot ||
    !compatibilitySnapshot?.sourceProvenance
  ) {
    return false;
  }

  if (
    !isSameRouteSnapshot(
      resumeTokenEnvelope.routeSnapshot,
      compatibilitySnapshot.routeSnapshot,
    ) ||
    !isSameSourceProvenance(
      resumeTokenEnvelope.sourceProvenance,
      compatibilitySnapshot.sourceProvenance,
    )
  ) {
    return false;
  }

  switch (checkpointType) {
    case "review-ready":
      return (
        currentPhase === "review" &&
        workflowState.awaitingUserInput != null &&
        phaseArtifacts.some((entry) => entry.type === "plan_result") &&
        phaseArtifacts.some((entry) => entry.type === "route_snapshot")
      );
    case "execute-complete":
      return (
        currentPhase === "verify" &&
        workflowState.verifyResult?.status === "pending" &&
        phaseArtifacts.some((entry) => entry.type === "execute_result")
      );
    case "verify-fail":
      return (
        workflowState.verifyResult?.status === "fail" &&
        phaseArtifacts.some((entry) => entry.type === "verify_result")
      );
    case "handoff-ready":
      return (
        currentPhase === "handoff" &&
        workflowState.handoffBundle != null &&
        phaseArtifacts.some((entry) => entry.type === "handoff_bundle")
      );
    default:
      return false;
  }
}

function isSameRouteSnapshot(
  left: NonNullable<SkillCreatorResumeTokenEnvelope["routeSnapshot"]>,
  right: NonNullable<SkillCreatorCompatibilitySnapshot["routeSnapshot"]>,
): boolean {
  if (left.type !== right.type) {
    return false;
  }

  if (left.permissionMode !== right.permissionMode) {
    return false;
  }

  if (left.launcher !== right.launcher) {
    return false;
  }

  return true;
}

function isSameSourceProvenance(
  left: NonNullable<SkillCreatorResumeTokenEnvelope["sourceProvenance"]>,
  right: NonNullable<SkillCreatorCompatibilitySnapshot["sourceProvenance"]>,
): boolean {
  return (
    left.resolvedSkillCreatorRoot === right.resolvedSkillCreatorRoot &&
    left.resourceDescriptorHash === right.resourceDescriptorHash &&
    left.manifestPath === right.manifestPath &&
    left.manifestCacheKey === right.manifestCacheKey
  );
}
