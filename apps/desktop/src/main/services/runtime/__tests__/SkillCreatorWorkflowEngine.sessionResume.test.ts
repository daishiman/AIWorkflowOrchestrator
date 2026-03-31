import { describe, it, expect, beforeEach } from "vitest";
import { SkillCreatorWorkflowEngine } from "../SkillCreatorWorkflowEngine";
import type { SkillCreatorPersistedWorkflowCheckpoint } from "@repo/shared/types";

function createBaseCheckpoint(
  overrides?: Partial<SkillCreatorPersistedWorkflowCheckpoint>,
): SkillCreatorPersistedWorkflowCheckpoint {
  return {
    checkpointId: "cp-resume-001",
    planId: "plan-resume-001",
    checkpointType: "review-ready",
    workflowStateSnapshot: {
      currentPhase: "review",
      awaitingUserInput: {
        requestId: "req-1",
        reason: "plan_review",
        title: "計画レビュー",
        prompt: "確認してください",
        kind: "single_select",
        options: [
          { id: "ready_to_execute", label: "実行" },
          { id: "needs_changes", label: "見直し" },
        ],
        allowSkip: false,
        requestedAt: new Date().toISOString(),
      },
      verifyResult: null,
      phaseArtifacts: [
        {
          phase: "plan",
          type: "plan_result",
          timestamp: new Date().toISOString(),
          data: {
            planId: "plan-resume-001",
            skillName: "test",
            estimatedSteps: 2,
          },
        },
      ],
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-resume-001",
        currentPhase: "review",
        artifactCount: 1,
        updatedAt: new Date().toISOString(),
      },
    },
    compatibilitySnapshot: {
      routeSnapshot: { type: "integrated_api", permissionMode: "default" },
      sourceProvenance: {
        resolvedSkillCreatorRoot: "/root",
        resourceDescriptorHash: "hash-1",
      },
      engineVersion: "task-sdk-08-v1",
    },
    revision: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("SkillCreatorWorkflowEngine - Session Resume (TASK-P0-08)", () => {
  let engine: SkillCreatorWorkflowEngine;

  beforeEach(() => {
    engine = new SkillCreatorWorkflowEngine();
  });

  // ── listCheckpoints ──

  describe("listCheckpoints", () => {
    it("チェックポイントがない場合は空配列を返す", () => {
      expect(engine.listCheckpoints()).toEqual([]);
    });

    it("有効なチェックポイントが一覧に含まれる", () => {
      const cp = createBaseCheckpoint();
      // checkpoints Map に直接挿入するため hydrate を使用
      engine.hydrateFromCheckpoint(cp);
      // hydrateFromCheckpoint は workflows を更新するが checkpoints には入れない
      // listCheckpoints は checkpoints Map を走査するため、
      // テスト用に private フィールドへアクセス
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(cp.checkpointId, cp);

      const list = engine.listCheckpoints();
      expect(list).toHaveLength(1);
      expect(list[0].checkpointId).toBe("cp-resume-001");
      expect(list[0].planId).toBe("plan-resume-001");
      expect(list[0].currentPhase).toBe("review");
      expect(list[0].checkpointType).toBe("review-ready");
    });

    it("TTL 超過のチェックポイントはフィルタされる", () => {
      const expired = createBaseCheckpoint({
        checkpointId: "cp-expired",
        updatedAt: Date.now() - 86_400_001, // 24h + 1ms
      });
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(expired.checkpointId, expired);

      expect(engine.listCheckpoints()).toEqual([]);
    });

    it("invalidatedAt が設定済みのチェックポイントは除外される", () => {
      const invalidated = createBaseCheckpoint({
        checkpointId: "cp-invalidated",
        invalidatedAt: Date.now() - 1000,
      });
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(invalidated.checkpointId, invalidated);

      expect(engine.listCheckpoints()).toEqual([]);
    });

    it("複数チェックポイントから有効なものだけ返す", () => {
      const valid = createBaseCheckpoint({ checkpointId: "cp-valid" });
      const expired = createBaseCheckpoint({
        checkpointId: "cp-old",
        updatedAt: Date.now() - 86_400_001,
      });
      const invalidated = createBaseCheckpoint({
        checkpointId: "cp-inv",
        invalidatedAt: Date.now(),
      });

      const cpMap = (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints;
      cpMap.set(valid.checkpointId, valid);
      cpMap.set(expired.checkpointId, expired);
      cpMap.set(invalidated.checkpointId, invalidated);

      const list = engine.listCheckpoints();
      expect(list).toHaveLength(1);
      expect(list[0].checkpointId).toBe("cp-valid");
    });
  });

  // ── getCheckpointSnapshot ──

  describe("getCheckpointSnapshot", () => {
    it("存在するチェックポイントの snapshot を返す", () => {
      const cp = createBaseCheckpoint();
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(cp.checkpointId, cp);

      const snapshot = engine.getCheckpointSnapshot("cp-resume-001");
      expect(snapshot).toBeDefined();
      expect(snapshot!.planId).toBe("plan-resume-001");
      expect(snapshot!.currentPhase).toBe("review");
      expect(snapshot!.awaitingUserInput).not.toBeNull();
    });

    it("存在しない checkpointId は undefined を返す", () => {
      expect(engine.getCheckpointSnapshot("nonexistent")).toBeUndefined();
    });

    it("handoffBundle を含むチェックポイントも正しく snapshot を生成する", () => {
      const cp = createBaseCheckpoint({
        checkpointId: "cp-handoff",
        checkpointType: "handoff-ready",
        workflowStateSnapshot: {
          currentPhase: "handoff",
          awaitingUserInput: null,
          verifyResult: null,
          phaseArtifacts: [],
          resumeTokenEnvelope: {
            version: "task-sdk-02-v1",
            planId: "plan-resume-001",
            currentPhase: "handoff",
            artifactCount: 0,
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
      });
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(cp.checkpointId, cp);

      const snapshot = engine.getCheckpointSnapshot("cp-handoff");
      expect(snapshot!.handoffBundle).toBeDefined();
      expect(snapshot!.handoffBundle!.launcher).toBe("codex");
    });
  });

  // ── resumeFromCheckpoint ──

  describe("resumeFromCheckpoint", () => {
    it("compatible なチェックポイントからワークフローを復元する", () => {
      const cp = createBaseCheckpoint();
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(cp.checkpointId, cp);

      const snapshot = engine.resumeFromCheckpoint("cp-resume-001");
      expect(snapshot).toBeDefined();
      expect(snapshot!.planId).toBe("plan-resume-001");

      // workflows Map にも復元されている
      const state = engine.getWorkflowState("plan-resume-001");
      expect(state).toBeDefined();
      expect(state!.currentPhase).toBe("review");
    });

    it("存在しない checkpointId は undefined を返す", () => {
      expect(engine.resumeFromCheckpoint("nonexistent")).toBeUndefined();
    });

    it("version_mismatch のチェックポイントは復元できない（incompatible）", () => {
      const cp = createBaseCheckpoint({
        compatibilitySnapshot: {
          routeSnapshot: { type: "integrated_api", permissionMode: "default" },
          sourceProvenance: {
            resolvedSkillCreatorRoot: "/root",
            resourceDescriptorHash: "hash-1",
          },
          engineVersion: "old-version-v0",
        },
      });
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(cp.checkpointId, cp);

      expect(engine.resumeFromCheckpoint("cp-resume-001")).toBeUndefined();
    });

    it("active_lease_conflict のチェックポイントは復元できない（conflict）", () => {
      const cp = createBaseCheckpoint({
        lease: {
          leaseHolder: "other-process",
          leaseExpiresAt: Date.now() + 60_000, // 未来
        },
      });
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(cp.checkpointId, cp);

      expect(engine.resumeFromCheckpoint("cp-resume-001")).toBeUndefined();
    });

    it("期限切れのリースは conflict にならない", () => {
      const cp = createBaseCheckpoint({
        lease: {
          leaseHolder: "other-process",
          leaseExpiresAt: Date.now() - 1000, // 過去
        },
      });
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(cp.checkpointId, cp);

      const snapshot = engine.resumeFromCheckpoint("cp-resume-001");
      expect(snapshot).toBeDefined();
    });

    it("compatible_with_warning でも復元できる", () => {
      // まず既存のワークフローを登録（ルートが異なる）
      const existingCp = createBaseCheckpoint({
        checkpointId: "cp-existing",
        planId: "plan-resume-001",
        compatibilitySnapshot: {
          routeSnapshot: { type: "integrated_api", permissionMode: "default" },
          sourceProvenance: {
            resolvedSkillCreatorRoot: "/new-root",
            resourceDescriptorHash: "hash-2",
          },
          engineVersion: "task-sdk-08-v1",
        },
      });
      engine.hydrateFromCheckpoint(existingCp);

      // 別ルートのチェックポイント（warning が出る）
      const cp = createBaseCheckpoint({
        checkpointId: "cp-warning",
        planId: "plan-resume-001",
        compatibilitySnapshot: {
          routeSnapshot: { type: "integrated_api", permissionMode: "default" },
          sourceProvenance: {
            resolvedSkillCreatorRoot: "/old-root",
            resourceDescriptorHash: "hash-1",
          },
          engineVersion: "task-sdk-08-v1",
        },
      });
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(cp.checkpointId, cp);

      const snapshot = engine.resumeFromCheckpoint("cp-warning");
      expect(snapshot).toBeDefined();
    });
  });

  // ── deleteCheckpoint ──

  describe("deleteCheckpoint", () => {
    it("チェックポイントを削除する", () => {
      const cp = createBaseCheckpoint();
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(cp.checkpointId, cp);

      engine.deleteCheckpoint("cp-resume-001");
      expect(engine.getCheckpointSnapshot("cp-resume-001")).toBeUndefined();
    });

    it("存在しないチェックポイントを削除してもエラーにならない", () => {
      expect(() => engine.deleteCheckpoint("nonexistent")).not.toThrow();
    });
  });

  // ── evaluateCompatibility (listCheckpoints 経由で検証) ──

  describe("compatibility evaluation", () => {
    it("engineVersion が一致する場合は compatible", () => {
      const cp = createBaseCheckpoint();
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(cp.checkpointId, cp);

      const list = engine.listCheckpoints();
      expect(list[0].compatibility.status).toBe("compatible");
      expect(list[0].compatibility.reasons).toEqual([]);
    });

    it("engineVersion が異なる場合は incompatible", () => {
      const cp = createBaseCheckpoint({
        compatibilitySnapshot: {
          routeSnapshot: { type: "integrated_api", permissionMode: "default" },
          sourceProvenance: {
            resolvedSkillCreatorRoot: "/root",
            resourceDescriptorHash: "hash-1",
          },
          engineVersion: "outdated-v0",
        },
      });
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(cp.checkpointId, cp);

      const list = engine.listCheckpoints();
      expect(list[0].compatibility.status).toBe("incompatible");
      expect(list[0].compatibility.reasons).toContain("version_mismatch");
    });

    it("アクティブリースがある場合は conflict", () => {
      const cp = createBaseCheckpoint({
        lease: {
          leaseHolder: "pid-999",
          leaseExpiresAt: Date.now() + 300_000,
        },
      });
      (
        engine as unknown as {
          checkpoints: Map<string, SkillCreatorPersistedWorkflowCheckpoint>;
        }
      ).checkpoints.set(cp.checkpointId, cp);

      const list = engine.listCheckpoints();
      expect(list[0].compatibility.status).toBe("conflict");
      expect(list[0].compatibility.reasons).toContain("active_lease_conflict");
    });
  });
});
