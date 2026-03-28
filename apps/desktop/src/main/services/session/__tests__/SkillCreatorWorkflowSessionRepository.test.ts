import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("electron-store", () => {
  class MockStore<T extends Record<string, unknown>> {
    private data: Partial<T>;
    private defaults: Partial<T>;
    constructor(options?: { name?: string; defaults?: Partial<T> }) {
      this.defaults = options?.defaults ?? ({} as Partial<T>);
      this.data = { ...this.defaults };
    }
    get<K extends keyof T>(key: K): T[K] | undefined {
      return this.data[key] as T[K] | undefined;
    }
    set<K extends keyof T>(key: K, value: T[K]): void {
      this.data[key] = value;
    }
    clear(): void {
      this.data = { ...this.defaults };
    }
    get path(): string {
      return "/tmp/mock-store";
    }
  }
  return { default: MockStore };
});

import { SkillCreatorWorkflowSessionRepository } from "../SkillCreatorWorkflowSessionRepository";
import type { SaveCheckpointInput } from "../SkillCreatorWorkflowSessionRepository";

function createInput(
  overrides?: Partial<SaveCheckpointInput>,
): SaveCheckpointInput {
  return {
    planId: "plan-1",
    checkpointType: "review-ready",
    workflowState: {
      currentPhase: "review",
      awaitingUserInput: {
        requestId: "plan-1:plan_review:2026-03-28T00:00:00.000Z",
        reason: "plan_review",
        title: "計画レビュー",
        prompt: "生成された計画を確認してください。",
        kind: "single_select",
        options: [
          { id: "ready_to_execute", label: "このまま実行する" },
          { id: "needs_changes", label: "内容を見直したい" },
        ],
        allowSkip: false,
        requestedAt: "2026-03-28T00:00:00.000Z",
      },
      verifyResult: null,
      phaseArtifacts: [
        {
          phase: "plan",
          type: "plan_result",
          timestamp: "2026-03-28T00:00:00.000Z",
          data: {
            planId: "plan-1",
            skillName: "test-skill",
            estimatedSteps: 3,
          },
        },
        {
          phase: "plan",
          type: "route_snapshot",
          timestamp: "2026-03-28T00:00:00.000Z",
          data: { type: "integrated_api", permissionMode: "default" },
        },
      ],
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-1",
        currentPhase: "review",
        artifactCount: 2,
        routeSnapshot: { type: "integrated_api", permissionMode: "default" },
        sourceProvenance: {
          resolvedSkillCreatorRoot: "/root",
          resourceDescriptorHash: "hash-1",
          manifestCacheKey: "cache-1",
        },
        updatedAt: new Date().toISOString(),
      },
    },
    compatibilitySnapshot: {
      routeSnapshot: { type: "integrated_api", permissionMode: "default" },
      sourceProvenance: {
        resolvedSkillCreatorRoot: "/root",
        resourceDescriptorHash: "hash-1",
        manifestCacheKey: "cache-1",
      },
      manifestCacheKey: "cache-1",
      resourceDescriptorHash: "hash-1",
      engineVersion: "task-sdk-08-v1",
    },
    ownerInstanceId: "instance-1",
    ...overrides,
  };
}

describe("SkillCreatorWorkflowSessionRepository", () => {
  let repo: SkillCreatorWorkflowSessionRepository;

  beforeEach(() => {
    repo = new SkillCreatorWorkflowSessionRepository();
  });

  describe("saveCheckpoint / loadLatestCheckpoint", () => {
    // RG-01: review-ready checkpoint save/load
    it("review-ready checkpoint を保存し復元できる", () => {
      const result = repo.saveCheckpoint(createInput());
      expect(result.success).toBe(true);
      expect(result.revision).toBe(1);

      const loaded = repo.loadLatestCheckpoint("plan-1");
      expect(loaded).toBeDefined();
      expect(loaded!.planId).toBe("plan-1");
      expect(loaded!.checkpointType).toBe("review-ready");
      expect(loaded!.workflowStateSnapshot.currentPhase).toBe("review");
    });

    // RG-02: handoff-ready checkpoint save/load
    it("handoff-ready checkpoint を保存し復元できる", () => {
      const result = repo.saveCheckpoint(
        createInput({
          checkpointType: "handoff-ready",
          compatibilitySnapshot: {
            routeSnapshot: { type: "terminal_handoff", launcher: "codex" },
            sourceProvenance: {
              resolvedSkillCreatorRoot: "/root",
              resourceDescriptorHash: "hash-1",
              manifestCacheKey: "cache-1",
            },
            manifestCacheKey: "cache-1",
            resourceDescriptorHash: "hash-1",
            engineVersion: "task-sdk-08-v1",
          },
          workflowState: {
            currentPhase: "handoff",
            awaitingUserInput: null,
            verifyResult: null,
            phaseArtifacts: [
              {
                phase: "plan",
                type: "plan_result",
                timestamp: "2026-03-28T00:00:00.000Z",
                data: {
                  planId: "plan-1",
                  skillName: "test-skill",
                  estimatedSteps: 3,
                },
              },
              {
                phase: "handoff",
                type: "route_snapshot",
                timestamp: "2026-03-28T00:00:00.000Z",
                data: { type: "terminal_handoff", launcher: "codex" },
              },
              {
                phase: "handoff",
                type: "handoff_bundle",
                timestamp: "2026-03-28T00:00:00.000Z",
                data: {
                  launcher: "codex",
                  promptBundle: "prompt",
                  cwd: "/cwd",
                  suggestedCommand: "cmd",
                  manualRetryRule: "rule",
                },
              },
            ],
            resumeTokenEnvelope: {
              version: "task-sdk-02-v1",
              planId: "plan-1",
              currentPhase: "handoff",
              artifactCount: 3,
              routeSnapshot: { type: "terminal_handoff", launcher: "codex" },
              sourceProvenance: {
                resolvedSkillCreatorRoot: "/root",
                resourceDescriptorHash: "hash-1",
                manifestCacheKey: "cache-1",
              },
              updatedAt: new Date().toISOString(),
            },
            handoffBundle: {
              launcher: "codex",
              promptBundle: "prompt",
              cwd: "/cwd",
              suggestedCommand: "cmd",
              manualRetryRule: "rule",
            },
          },
        }),
      );
      expect(result.success).toBe(true);

      const loaded = repo.loadLatestCheckpoint("plan-1");
      expect(loaded!.checkpointType).toBe("handoff-ready");
      expect(loaded!.workflowStateSnapshot.handoffBundle?.launcher).toBe(
        "codex",
      );
    });

    it("execute-complete checkpoint を保存し復元できる", () => {
      const result = repo.saveCheckpoint(
        createInput({
          checkpointType: "execute-complete",
          workflowState: {
            currentPhase: "verify",
            awaitingUserInput: null,
            verifyResult: {
              status: "pending",
              nextAction: "review",
              updatedAt: new Date().toISOString(),
            },
            phaseArtifacts: [
              {
                phase: "execute",
                type: "execute_result",
                timestamp: "2026-03-28T00:00:00.000Z",
                data: {
                  executeId: "exec-1",
                  skillName: "test-skill",
                  success: true,
                },
              },
            ],
            resumeTokenEnvelope: {
              version: "task-sdk-02-v1",
              planId: "plan-1",
              currentPhase: "verify",
              artifactCount: 1,
              routeSnapshot: {
                type: "integrated_api",
                permissionMode: "default",
              },
              sourceProvenance: {
                resolvedSkillCreatorRoot: "/root",
                resourceDescriptorHash: "hash-1",
                manifestCacheKey: "cache-1",
              },
              updatedAt: new Date().toISOString(),
            },
          },
        }),
      );
      expect(result.success).toBe(true);

      const loaded = repo.loadLatestCheckpoint("plan-1");
      expect(loaded!.checkpointType).toBe("execute-complete");
      expect(loaded!.workflowStateSnapshot.verifyResult?.status).toBe(
        "pending",
      );
    });

    it("revision が保存ごとに increment される", () => {
      const r1 = repo.saveCheckpoint(createInput());
      expect(r1.revision).toBe(1);

      const r2 = repo.saveCheckpoint(createInput({ expectedRevision: 1 }));
      expect(r2.revision).toBe(2);
    });
  });

  describe("stale write guard", () => {
    // RG-08: expected revision mismatch → conflict
    it("revision mismatch で save を reject する", () => {
      repo.saveCheckpoint(createInput());

      const result = repo.saveCheckpoint(createInput({ expectedRevision: 99 }));
      expect(result.success).toBe(false);
      expect(result.error).toBe("revision_mismatch");
    });

    it("既存 checkpoint に expectedRevision なしで save を reject する", () => {
      repo.saveCheckpoint(createInput());

      const result = repo.saveCheckpoint(createInput());
      expect(result.success).toBe(false);
      expect(result.error).toBe("revision_mismatch");
    });

    // RG-07 (repository 側): active lease conflict
    it("他者の active lease で save を reject する", () => {
      repo.saveCheckpoint(createInput());

      const result = repo.saveCheckpoint(
        createInput({
          ownerInstanceId: "other-instance",
          expectedRevision: 1,
        }),
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe("active_lease_conflict");
    });

    it("expired lease なら別 instance でも save できる", () => {
      // leaseTtlMs=0 で lease を即時 expire させる
      repo = new SkillCreatorWorkflowSessionRepository({
        leaseTtlMs: 0,
      });
      repo.saveCheckpoint(createInput());

      // leaseTtlMs=0 で leaseExpiresAt === acquiredAt なので、
      // Date.now() >= leaseExpiresAt は成立する
      const result = repo.saveCheckpoint(
        createInput({
          ownerInstanceId: "other-instance",
          expectedRevision: 1,
        }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe("invalidateCheckpoint", () => {
    it("checkpoint を invalidate すると load で undefined が返る", () => {
      repo.saveCheckpoint(createInput());
      const invalidated = repo.invalidateCheckpoint("plan-1");
      expect(invalidated).toBe(true);

      const loaded = repo.loadLatestCheckpoint("plan-1");
      expect(loaded).toBeUndefined();
    });

    it("存在しない planId を invalidate すると false が返る", () => {
      expect(repo.invalidateCheckpoint("nonexistent")).toBe(false);
    });
  });

  describe("evaluateResumeCompatibility", () => {
    it("存在しない checkpoint で incompatible を返す", () => {
      const result = repo.evaluateResumeCompatibility("nonexistent", {
        currentSnapshot: createInput().compatibilitySnapshot,
        currentInstanceId: "instance-1",
      });
      expect(result.status).toBe("incompatible");
      expect(result.reasons).toContain("checkpoint_not_found");
    });

    it("一致する checkpoint で compatible を返す", () => {
      repo.saveCheckpoint(createInput());

      const result = repo.evaluateResumeCompatibility("plan-1", {
        currentSnapshot: createInput().compatibilitySnapshot,
        currentInstanceId: "instance-1",
      });
      expect(result.status).toBe("compatible");
    });

    it("workflow payload が壊れている checkpoint で missing_workflow_payload を返す", () => {
      const malformedStorage = {
        getCheckpoint: () =>
          ({
            checkpointId: "cp-1",
            planId: "plan-1",
            checkpointType: "review-ready",
            workflowStateSnapshot: undefined,
            compatibilitySnapshot: createInput().compatibilitySnapshot,
            revision: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }) as never,
        getAllCheckpoints: () => ({}),
        setCheckpoint: () => undefined,
        deleteCheckpoint: () => undefined,
      };

      repo = new SkillCreatorWorkflowSessionRepository({
        storage: malformedStorage as never,
      });

      const result = repo.evaluateResumeCompatibility("plan-1", {
        currentSnapshot: createInput().compatibilitySnapshot,
        currentInstanceId: "instance-1",
      });
      expect(result.status).toBe("incompatible");
      expect(result.reasons).toContain("missing_workflow_payload");
    });
  });

  describe("listCheckpoints", () => {
    it("invalidated でない checkpoint のみ返す", () => {
      repo.saveCheckpoint(createInput({ planId: "plan-1" }));
      repo.saveCheckpoint(
        createInput({
          planId: "plan-2",
          workflowState: {
            ...createInput().workflowState,
            resumeTokenEnvelope: {
              ...createInput().workflowState.resumeTokenEnvelope,
              planId: "plan-2",
            },
            phaseArtifacts: createInput().workflowState.phaseArtifacts.map(
              (entry) =>
                entry.type === "plan_result"
                  ? {
                      ...entry,
                      data: {
                        ...(entry.data as Record<string, unknown>),
                        planId: "plan-2",
                      },
                    }
                  : entry,
            ),
          },
        }),
      );
      repo.invalidateCheckpoint("plan-1");

      const list = repo.listCheckpoints();
      expect(list).toHaveLength(1);
      expect(list[0].planId).toBe("plan-2");
    });
  });

  describe("cleanupExpiredLeases", () => {
    it("expired lease をクリーンアップする", () => {
      repo = new SkillCreatorWorkflowSessionRepository({
        leaseTtlMs: 0,
      });
      repo.saveCheckpoint(createInput());

      const cleaned = repo.cleanupExpiredLeases();
      expect(cleaned).toBe(1);

      const loaded = repo.loadLatestCheckpoint("plan-1");
      expect(loaded!.lease).toBeUndefined();
    });
  });

  // RG-09: workflow payload なし legacy session → graceful reject
  describe("legacy session coexistence", () => {
    it("checkpoint が存在しない planId で loadLatestCheckpoint は undefined", () => {
      const loaded = repo.loadLatestCheckpoint("legacy-plan");
      expect(loaded).toBeUndefined();
    });

    it("workflow payload が欠損した checkpoint は loadLatestCheckpoint で undefined", () => {
      const malformedStorage = {
        getCheckpoint: () =>
          ({
            checkpointId: "cp-1",
            planId: "legacy-plan",
            checkpointType: "review-ready",
            workflowStateSnapshot: undefined,
            compatibilitySnapshot: createInput().compatibilitySnapshot,
            revision: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }) as never,
        getAllCheckpoints: () => ({}),
        setCheckpoint: () => undefined,
        deleteCheckpoint: () => undefined,
      };

      repo = new SkillCreatorWorkflowSessionRepository({
        storage: malformedStorage as never,
      });

      const loaded = repo.loadLatestCheckpoint("legacy-plan");
      expect(loaded).toBeUndefined();
    });

    it("workflow payload が欠損した checkpoint は listCheckpoints で除外される", () => {
      const malformedCheckpoint = {
        checkpointId: "cp-1",
        planId: "legacy-plan",
        checkpointType: "review-ready",
        workflowStateSnapshot: {
          currentPhase: "review",
          awaitingUserInput: null,
          verifyResult: null,
          phaseArtifacts: [],
          resumeTokenEnvelope: {
            version: "task-sdk-02-v1",
            planId: "legacy-plan",
            currentPhase: "review",
            artifactCount: 0,
            updatedAt: new Date().toISOString(),
          },
        },
        compatibilitySnapshot: {
          routeSnapshot: { type: "integrated_api", permissionMode: "default" },
          sourceProvenance: {
            resolvedSkillCreatorRoot: "/root",
            resourceDescriptorHash: "hash-1",
            manifestCacheKey: "cache-1",
          },
          manifestCacheKey: "cache-1",
          resourceDescriptorHash: "hash-1",
          engineVersion: "task-sdk-08-v1",
        },
        revision: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const malformedStorage = {
        getCheckpoint: () => malformedCheckpoint as never,
        getAllCheckpoints: () => ({
          "legacy-plan": malformedCheckpoint as never,
        }),
        setCheckpoint: () => undefined,
        deleteCheckpoint: () => undefined,
      };

      repo = new SkillCreatorWorkflowSessionRepository({
        storage: malformedStorage as never,
      });

      const list = repo.listCheckpoints();
      expect(list).toHaveLength(0);
    });
  });

  // RG-10: cleanup 後の整合性
  describe("cleanup 後の整合性", () => {
    it("deleteCheckpoint 後に loadLatestCheckpoint は undefined", () => {
      repo.saveCheckpoint(createInput());
      repo.deleteCheckpoint("plan-1");

      const loaded = repo.loadLatestCheckpoint("plan-1");
      expect(loaded).toBeUndefined();
    });
  });
});
