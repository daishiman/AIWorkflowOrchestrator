/**
 * ResumeCompatibilityEvaluator
 * TASK-SDK-08: session-persistence-and-resume-contract
 *
 * 保存された checkpoint と現在の runtime 状態を比較し、
 * resume 可否を判定する。silent resume を防ぐ明示的な判定を行う。
 */

import type {
  SkillCreatorCompatibilitySnapshot,
  SkillCreatorPersistedWorkflowCheckpoint,
  ResumeCompatibilityResult,
  ResumeCompatibilityStatus,
  ResumeIncompatibilityReason,
  WorkflowCheckpointLease,
} from "@repo/shared/types";

export interface ResumeEvaluationContext {
  currentSnapshot: SkillCreatorCompatibilitySnapshot;
  currentInstanceId: string;
  now?: number;
}

export class ResumeCompatibilityEvaluator {
  evaluate(
    checkpoint: SkillCreatorPersistedWorkflowCheckpoint,
    context: ResumeEvaluationContext,
  ): ResumeCompatibilityResult {
    const reasons: ResumeIncompatibilityReason[] = [];
    const warnings: string[] = [];
    const now = context.now ?? Date.now();

    if (checkpoint.invalidatedAt != null) {
      return {
        status: "incompatible",
        reasons: ["checkpoint_not_found"],
        warnings: [],
      };
    }

    this.checkVersion(checkpoint, context.currentSnapshot, reasons);
    this.checkRoute(checkpoint, context.currentSnapshot, reasons);
    this.checkProvenance(
      checkpoint,
      context.currentSnapshot,
      reasons,
      warnings,
    );
    this.checkLease(checkpoint.lease, context.currentInstanceId, now, reasons);
    this.checkRevision(checkpoint, reasons);

    const status = this.deriveStatus(reasons, warnings);
    return { status, reasons, warnings };
  }

  private checkVersion(
    checkpoint: SkillCreatorPersistedWorkflowCheckpoint,
    current: SkillCreatorCompatibilitySnapshot,
    reasons: ResumeIncompatibilityReason[],
  ): void {
    const storedVersion = checkpoint.compatibilitySnapshot.engineVersion;
    const storedMajor = this.extractMajor(storedVersion);
    const currentMajor = this.extractMajor(current.engineVersion);

    if (storedMajor !== currentMajor) {
      reasons.push("version_mismatch");
    }
  }

  private checkRoute(
    checkpoint: SkillCreatorPersistedWorkflowCheckpoint,
    current: SkillCreatorCompatibilitySnapshot,
    reasons: ResumeIncompatibilityReason[],
  ): void {
    const storedType = checkpoint.compatibilitySnapshot.routeSnapshot?.type;
    const currentType = current.routeSnapshot?.type;

    if (storedType && currentType && storedType !== currentType) {
      reasons.push("route_type_mismatch");
    }
  }

  private checkProvenance(
    checkpoint: SkillCreatorPersistedWorkflowCheckpoint,
    current: SkillCreatorCompatibilitySnapshot,
    reasons: ResumeIncompatibilityReason[],
    warnings: string[],
  ): void {
    const stored = checkpoint.compatibilitySnapshot;

    if (
      stored.manifestCacheKey &&
      current.manifestCacheKey &&
      stored.manifestCacheKey !== current.manifestCacheKey
    ) {
      reasons.push("manifest_cache_key_mismatch");
    }

    if (
      stored.resourceDescriptorHash &&
      current.resourceDescriptorHash &&
      stored.resourceDescriptorHash !== current.resourceDescriptorHash
    ) {
      reasons.push("resource_descriptor_hash_mismatch");
    }

    const storedRoot = stored.sourceProvenance?.resolvedSkillCreatorRoot;
    const currentRoot = current.sourceProvenance?.resolvedSkillCreatorRoot;

    if (storedRoot && currentRoot && storedRoot !== currentRoot) {
      const hashMatch =
        stored.resourceDescriptorHash === current.resourceDescriptorHash;
      const cacheKeyMatch =
        stored.manifestCacheKey === current.manifestCacheKey;

      if (hashMatch && cacheKeyMatch) {
        warnings.push(
          `Skill creator root relocated: ${storedRoot} → ${currentRoot}`,
        );
        reasons.push("root_relocation_warning");
      }
    }
  }

  private checkLease(
    lease: WorkflowCheckpointLease | undefined,
    currentInstanceId: string,
    now: number,
    reasons: ResumeIncompatibilityReason[],
  ): void {
    if (!lease) return;

    if (
      lease.ownerInstanceId !== currentInstanceId &&
      lease.leaseExpiresAt > now
    ) {
      reasons.push("active_lease_conflict");
    }
  }

  private checkRevision(
    checkpoint: SkillCreatorPersistedWorkflowCheckpoint,
    reasons: ResumeIncompatibilityReason[],
  ): void {
    // revision check は save 時に expectedRevision と比較するため、
    // evaluate 単体では revision_mismatch を返さない。
    // repository.saveCheckpoint() がこの判定を行う。
    void checkpoint;
    void reasons;
  }

  private deriveStatus(
    reasons: ResumeIncompatibilityReason[],
    warnings: string[],
  ): ResumeCompatibilityStatus {
    const hasIncompat = reasons.some(
      (r) =>
        r === "version_mismatch" ||
        r === "route_type_mismatch" ||
        r === "manifest_cache_key_mismatch" ||
        r === "resource_descriptor_hash_mismatch" ||
        r === "checkpoint_not_found" ||
        r === "missing_workflow_payload",
    );
    if (hasIncompat) return "incompatible";

    const hasConflict = reasons.some(
      (r) => r === "revision_mismatch" || r === "active_lease_conflict",
    );
    if (hasConflict) return "conflict";

    if (reasons.includes("root_relocation_warning") || warnings.length > 0) {
      return "compatible_with_warning";
    }

    return "compatible";
  }

  private extractMajor(version: string): string {
    // "task-sdk-02-v1" → "task-sdk-02"
    // "task-sdk-08-v1" → "task-sdk-08"
    const parts = version.split("-v");
    return parts[0] ?? version;
  }
}
