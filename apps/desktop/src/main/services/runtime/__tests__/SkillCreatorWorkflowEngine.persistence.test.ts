import { describe, it, expect, beforeEach } from "vitest";
import { SkillCreatorWorkflowEngine } from "../SkillCreatorWorkflowEngine";
import type { SkillCreatorPersistedWorkflowCheckpoint } from "@repo/shared/types";

function createMockCheckpoint(
  overrides?: Partial<SkillCreatorPersistedWorkflowCheckpoint>,
): SkillCreatorPersistedWorkflowCheckpoint {
  return {
    checkpointId: "cp-1",
    planId: "plan-hydrate",
    checkpointType: "review-ready",
    workflowStateSnapshot: {
      currentPhase: "review",
      awaitingUserInput: {
        requestId: "req-1",
        reason: "plan_review",
        title: "計画レビュー",
        prompt: "計画を確認してください",
        kind: "single_select",
        options: [
          { id: "ready_to_execute", label: "実行する" },
          { id: "needs_changes", label: "見直す" },
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
            planId: "plan-hydrate",
            skillName: "test-skill",
            estimatedSteps: 3,
          },
        },
        {
          phase: "plan",
          type: "route_snapshot",
          timestamp: new Date().toISOString(),
          data: { type: "integrated_api", permissionMode: "default" },
        },
      ],
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-hydrate",
        currentPhase: "review",
        artifactCount: 2,
        routeSnapshot: { type: "integrated_api", permissionMode: "default" },
        sourceProvenance: {
          resolvedSkillCreatorRoot: "/root",
          resourceDescriptorHash: "hash-1",
        },
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

describe("SkillCreatorWorkflowEngine persistence", () => {
  let engine: SkillCreatorWorkflowEngine;

  beforeEach(() => {
    engine = new SkillCreatorWorkflowEngine();
  });

  describe("hydrateFromCheckpoint", () => {
    it("review-ready checkpoint から currentPhase と awaitingUserInput を復元する", () => {
      const checkpoint = createMockCheckpoint();
      const snapshot = engine.hydrateFromCheckpoint(checkpoint);

      expect(snapshot.planId).toBe("plan-hydrate");
      expect(snapshot.currentPhase).toBe("review");
      expect(snapshot.awaitingUserInput).not.toBeNull();
      expect(snapshot.awaitingUserInput!.reason).toBe("plan_review");
    });

    it("hydrate 後に getWorkflowState で取得できる", () => {
      const checkpoint = createMockCheckpoint();
      engine.hydrateFromCheckpoint(checkpoint);

      const state = engine.getWorkflowState("plan-hydrate");
      expect(state).toBeDefined();
      expect(state!.currentPhase).toBe("review");
    });

    it("phaseArtifacts が復元される", () => {
      const checkpoint = createMockCheckpoint();
      const snapshot = engine.hydrateFromCheckpoint(checkpoint);

      expect(snapshot.phaseArtifacts).toHaveLength(2);
      expect(snapshot.phaseArtifacts[0].kind).toBe("plan_result");
      expect(snapshot.phaseArtifacts[1].kind).toBe("route_snapshot");
    });

    it("resumeTokenEnvelope が復元される", () => {
      const checkpoint = createMockCheckpoint();
      const snapshot = engine.hydrateFromCheckpoint(checkpoint);

      expect(snapshot.resumeTokenEnvelope.version).toBe("task-sdk-02-v1");
      expect(snapshot.resumeTokenEnvelope.planId).toBe("plan-hydrate");
      expect(snapshot.resumeTokenEnvelope.artifactCount).toBe(2);
    });

    it("verify-fail checkpoint から verifyResult を復元する", () => {
      const checkpoint = createMockCheckpoint({
        checkpointType: "verify-fail",
        workflowStateSnapshot: {
          currentPhase: "improve",
          awaitingUserInput: null,
          verifyResult: {
            status: "fail",
            reason: "verification_review",
            message: "Tests failed",
            nextAction: "improve",
            updatedAt: new Date().toISOString(),
          },
          phaseArtifacts: [],
          resumeTokenEnvelope: {
            version: "task-sdk-02-v1",
            planId: "plan-hydrate",
            currentPhase: "improve",
            artifactCount: 0,
            updatedAt: new Date().toISOString(),
          },
        },
      });

      const snapshot = engine.hydrateFromCheckpoint(checkpoint);
      expect(snapshot.verifyResult).not.toBeNull();
      expect(snapshot.verifyResult!.status).toBe("fail");
      expect(snapshot.verifyResult!.nextAction).toBe("improve");
    });

    it("handoff-ready checkpoint から handoffBundle を復元する", () => {
      const checkpoint = createMockCheckpoint({
        checkpointType: "handoff-ready",
        workflowStateSnapshot: {
          currentPhase: "handoff",
          awaitingUserInput: null,
          verifyResult: null,
          phaseArtifacts: [],
          resumeTokenEnvelope: {
            version: "task-sdk-02-v1",
            planId: "plan-hydrate",
            currentPhase: "handoff",
            artifactCount: 0,
            updatedAt: new Date().toISOString(),
          },
          handoffBundle: {
            launcher: "codex",
            promptBundle: "prompt",
            cwd: "/cwd",
            suggestedCommand: "run cmd",
            manualRetryRule: "retry rule",
          },
        },
      });

      const snapshot = engine.hydrateFromCheckpoint(checkpoint);
      expect(snapshot.handoffBundle).not.toBeNull();
      expect(snapshot.handoffBundle!.launcher).toBe("codex");
    });
  });

  describe("serializeArtifactsForPersistence", () => {
    it("存在しない planId で空配列を返す", () => {
      const entries = engine.serializeArtifactsForPersistence("nonexistent");
      expect(entries).toEqual([]);
    });

    it("hydrate 後のアーティファクトをシリアライズできる", () => {
      const checkpoint = createMockCheckpoint();
      engine.hydrateFromCheckpoint(checkpoint);

      const entries = engine.serializeArtifactsForPersistence("plan-hydrate");
      expect(entries).toHaveLength(2);
      expect(entries[0].phase).toBe("plan");
      expect(entries[0].type).toBe("plan_result");
      expect(entries[0].data).toEqual({
        planId: "plan-hydrate",
        skillName: "test-skill",
        estimatedSteps: 3,
      });
    });
  });
});
