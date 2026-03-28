import { describe, it, expect } from "vitest";
import { ResumeCompatibilityEvaluator } from "../ResumeCompatibilityEvaluator";
import type {
  SkillCreatorPersistedWorkflowCheckpoint,
  SkillCreatorCompatibilitySnapshot,
} from "@repo/shared/types";

function createBaseCheckpoint(
  overrides?: Partial<SkillCreatorPersistedWorkflowCheckpoint>,
): SkillCreatorPersistedWorkflowCheckpoint {
  return {
    checkpointId: "cp-1",
    planId: "plan-1",
    checkpointType: "review-ready",
    workflowStateSnapshot: {
      currentPhase: "review",
      awaitingUserInput: null,
      verifyResult: null,
      phaseArtifacts: [],
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-1",
        currentPhase: "review",
        artifactCount: 0,
        updatedAt: new Date().toISOString(),
      },
    },
    compatibilitySnapshot: {
      routeSnapshot: { type: "integrated_api", permissionMode: "default" },
      sourceProvenance: {
        resolvedSkillCreatorRoot: "/path/to/root",
        resourceDescriptorHash: "hash-abc",
        manifestCacheKey: "cache-key-1",
      },
      manifestCacheKey: "cache-key-1",
      resourceDescriptorHash: "hash-abc",
      engineVersion: "task-sdk-08-v1",
    },
    revision: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

function createCurrentSnapshot(
  overrides?: Partial<SkillCreatorCompatibilitySnapshot>,
): SkillCreatorCompatibilitySnapshot {
  return {
    routeSnapshot: { type: "integrated_api", permissionMode: "default" },
    sourceProvenance: {
      resolvedSkillCreatorRoot: "/path/to/root",
      resourceDescriptorHash: "hash-abc",
      manifestCacheKey: "cache-key-1",
    },
    manifestCacheKey: "cache-key-1",
    resourceDescriptorHash: "hash-abc",
    engineVersion: "task-sdk-08-v1",
    ...overrides,
  };
}

describe("ResumeCompatibilityEvaluator", () => {
  const evaluator = new ResumeCompatibilityEvaluator();
  const instanceId = "instance-1";

  it("全フィールド一致で compatible を返す", () => {
    const result = evaluator.evaluate(createBaseCheckpoint(), {
      currentSnapshot: createCurrentSnapshot(),
      currentInstanceId: instanceId,
    });
    expect(result.status).toBe("compatible");
    expect(result.reasons).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  // RG-03: version mismatch → incompatible
  it("version major 差分で incompatible を返す", () => {
    const checkpoint = createBaseCheckpoint();
    const result = evaluator.evaluate(checkpoint, {
      currentSnapshot: createCurrentSnapshot({
        engineVersion: "task-sdk-99-v1",
      }),
      currentInstanceId: instanceId,
    });
    expect(result.status).toBe("incompatible");
    expect(result.reasons).toContain("version_mismatch");
  });

  // RG-04: route type mismatch → incompatible
  it("route type 差分で incompatible を返す", () => {
    const result = evaluator.evaluate(createBaseCheckpoint(), {
      currentSnapshot: createCurrentSnapshot({
        routeSnapshot: { type: "terminal_handoff", launcher: "codex" },
      }),
      currentInstanceId: instanceId,
    });
    expect(result.status).toBe("incompatible");
    expect(result.reasons).toContain("route_type_mismatch");
  });

  // RG-05: hash mismatch → incompatible
  it("resourceDescriptorHash 差分で incompatible を返す", () => {
    const result = evaluator.evaluate(createBaseCheckpoint(), {
      currentSnapshot: createCurrentSnapshot({
        resourceDescriptorHash: "hash-different",
      }),
      currentInstanceId: instanceId,
    });
    expect(result.status).toBe("incompatible");
    expect(result.reasons).toContain("resource_descriptor_hash_mismatch");
  });

  it("manifestCacheKey 差分で incompatible を返す", () => {
    const result = evaluator.evaluate(createBaseCheckpoint(), {
      currentSnapshot: createCurrentSnapshot({
        manifestCacheKey: "cache-key-different",
      }),
      currentInstanceId: instanceId,
    });
    expect(result.status).toBe("incompatible");
    expect(result.reasons).toContain("manifest_cache_key_mismatch");
  });

  // RG-06: root relocation only → compatible_with_warning
  it("root のみ変更（hash/cacheKey 一致）で compatible_with_warning を返す", () => {
    const result = evaluator.evaluate(createBaseCheckpoint(), {
      currentSnapshot: createCurrentSnapshot({
        sourceProvenance: {
          resolvedSkillCreatorRoot: "/new/path/to/root",
          resourceDescriptorHash: "hash-abc",
          manifestCacheKey: "cache-key-1",
        },
      }),
      currentInstanceId: instanceId,
    });
    expect(result.status).toBe("compatible_with_warning");
    expect(result.reasons).toContain("root_relocation_warning");
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  // RG-07: active lease by another writer → conflict
  it("他者の active lease で conflict を返す", () => {
    const checkpoint = createBaseCheckpoint({
      lease: {
        ownerInstanceId: "other-instance",
        leaseExpiresAt: Date.now() + 60_000,
        acquiredAt: Date.now(),
      },
    });
    const result = evaluator.evaluate(checkpoint, {
      currentSnapshot: createCurrentSnapshot(),
      currentInstanceId: instanceId,
    });
    expect(result.status).toBe("conflict");
    expect(result.reasons).toContain("active_lease_conflict");
  });

  it("自分が lease owner の場合は conflict にしない", () => {
    const checkpoint = createBaseCheckpoint({
      lease: {
        ownerInstanceId: instanceId,
        leaseExpiresAt: Date.now() + 60_000,
        acquiredAt: Date.now(),
      },
    });
    const result = evaluator.evaluate(checkpoint, {
      currentSnapshot: createCurrentSnapshot(),
      currentInstanceId: instanceId,
    });
    expect(result.status).toBe("compatible");
  });

  it("lease が expired なら conflict にしない", () => {
    const checkpoint = createBaseCheckpoint({
      lease: {
        ownerInstanceId: "other-instance",
        leaseExpiresAt: Date.now() - 1000,
        acquiredAt: Date.now() - 60_000,
      },
    });
    const result = evaluator.evaluate(checkpoint, {
      currentSnapshot: createCurrentSnapshot(),
      currentInstanceId: instanceId,
    });
    expect(result.status).toBe("compatible");
  });

  it("invalidated checkpoint は incompatible を返す", () => {
    const checkpoint = createBaseCheckpoint({
      invalidatedAt: Date.now(),
    });
    const result = evaluator.evaluate(checkpoint, {
      currentSnapshot: createCurrentSnapshot(),
      currentInstanceId: instanceId,
    });
    expect(result.status).toBe("incompatible");
    expect(result.reasons).toContain("checkpoint_not_found");
  });

  it("複数の incompatibility reason が同時に返される", () => {
    const result = evaluator.evaluate(createBaseCheckpoint(), {
      currentSnapshot: createCurrentSnapshot({
        engineVersion: "task-sdk-99-v1",
        routeSnapshot: { type: "terminal_handoff", launcher: "codex" },
        resourceDescriptorHash: "hash-different",
      }),
      currentInstanceId: instanceId,
    });
    expect(result.status).toBe("incompatible");
    expect(result.reasons).toContain("version_mismatch");
    expect(result.reasons).toContain("route_type_mismatch");
    expect(result.reasons).toContain("resource_descriptor_hash_mismatch");
    expect(result.reasons).toHaveLength(3);
  });

  it("incompatible は conflict より優先される", () => {
    const checkpoint = createBaseCheckpoint({
      lease: {
        ownerInstanceId: "other-instance",
        leaseExpiresAt: Date.now() + 60_000,
        acquiredAt: Date.now(),
      },
    });
    const result = evaluator.evaluate(checkpoint, {
      currentSnapshot: createCurrentSnapshot({
        routeSnapshot: { type: "terminal_handoff", launcher: "codex" },
      }),
      currentInstanceId: instanceId,
    });
    expect(result.status).toBe("incompatible");
    expect(result.reasons).toContain("route_type_mismatch");
    expect(result.reasons).toContain("active_lease_conflict");
  });
});
