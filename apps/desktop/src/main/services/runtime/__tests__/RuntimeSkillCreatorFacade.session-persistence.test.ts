import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SkillCreatorPersistedWorkflowCheckpoint } from "@repo/shared/types";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { SkillCreatorWorkflowEngine } from "../SkillCreatorWorkflowEngine";
import type { SkillCreatorWorkflowSessionRepository } from "../../session";

const SESSION_TTL_MS = 86_400_000;
const SKILL_CREATOR_ENGINE_VERSION = "task-sdk-08-v1";

function createMockLLMAdapter(): ILLMAdapter {
  return {
    providerId: "anthropic" as ILLMAdapter["providerId"],
    sendChat: vi.fn().mockResolvedValue({
      content: JSON.stringify({
        skillName: "resume-skill",
        description: "resume test skill",
        agents: [{ name: "agent-1", role: "executor" }],
        scripts: [],
        triggers: [],
        anchors: [],
      }),
      model: "claude-sonnet-4-20250514",
      usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
    }),
    streamChat: vi.fn(),
    checkHealth: vi.fn(),
  } as ILLMAdapter;
}

function createCheckpoint(
  overrides: Partial<SkillCreatorPersistedWorkflowCheckpoint> = {},
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
        options: [{ id: "ready_to_execute", label: "実行する" }],
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
            skillName: "resume-skill",
            estimatedSteps: 1,
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
        planId: "plan-resume-001",
        currentPhase: "review",
        artifactCount: 2,
        routeSnapshot: { type: "integrated_api", permissionMode: "default" },
        sourceProvenance: {
          resolvedSkillCreatorRoot: "/tmp/skill-creator",
        },
        updatedAt: new Date().toISOString(),
      },
    },
    compatibilitySnapshot: {
      routeSnapshot: { type: "integrated_api", permissionMode: "default" },
      sourceProvenance: {
        resolvedSkillCreatorRoot: "/tmp/skill-creator",
      },
      engineVersion: SKILL_CREATOR_ENGINE_VERSION,
    },
    revision: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("RuntimeSkillCreatorFacade session persistence", () => {
  let workflowEngine: SkillCreatorWorkflowEngine;
  let sessionRepository: {
    saveCheckpoint: ReturnType<typeof vi.fn>;
    loadLatestCheckpoint: ReturnType<typeof vi.fn>;
    listCheckpoints: ReturnType<typeof vi.fn>;
    evaluateResumeCompatibility: ReturnType<typeof vi.fn>;
    cleanupExpiredLeases: ReturnType<typeof vi.fn>;
    cleanupExpiredCheckpoints: ReturnType<typeof vi.fn>;
    deleteCheckpoint: ReturnType<typeof vi.fn>;
  };
  let facade: RuntimeSkillCreatorFacade;

  beforeEach(() => {
    workflowEngine = new SkillCreatorWorkflowEngine();
    sessionRepository = {
      saveCheckpoint: vi.fn().mockReturnValue({ success: true, revision: 1 }),
      loadLatestCheckpoint: vi.fn().mockReturnValue(undefined),
      listCheckpoints: vi.fn().mockReturnValue([]),
      evaluateResumeCompatibility: vi.fn().mockReturnValue({
        status: "compatible",
        reasons: [],
        warnings: [],
      }),
      cleanupExpiredLeases: vi.fn().mockReturnValue(0),
      cleanupExpiredCheckpoints: vi.fn().mockReturnValue(0),
      deleteCheckpoint: vi.fn(),
    };

    facade = new RuntimeSkillCreatorFacade({
      skillExecutor: {
        execute: vi.fn(),
      } as unknown as SkillExecutor,
      workflowEngine,
      llmAdapter: createMockLLMAdapter(),
      resourceLoader: {
        getBasePath: () => "/tmp/skill-creator",
        loadAgent: vi.fn().mockResolvedValue("agent content"),
      } as never,
      sessionRepository:
        sessionRepository as unknown as SkillCreatorWorkflowSessionRepository,
      ownerInstanceId: "instance-1",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("plan() 後に review-ready checkpoint を永続化する", async () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });

    await facade.plan("resume spec", "api-key", "sk-test");

    expect(sessionRepository.saveCheckpoint).toHaveBeenCalledTimes(1);
    expect(sessionRepository.saveCheckpoint).toHaveBeenCalledWith(
      expect.objectContaining({
        checkpointType: "review-ready",
        ownerInstanceId: "instance-1",
        compatibilitySnapshot: expect.objectContaining({
          engineVersion: SKILL_CREATOR_ENGINE_VERSION,
          routeSnapshot: expect.objectContaining({
            type: "integrated_api",
            permissionMode: "default",
          }),
          sourceProvenance: expect.objectContaining({
            resolvedSkillCreatorRoot: "/tmp/skill-creator",
          }),
        }),
        workflowState: expect.objectContaining({
          currentPhase: "review",
          awaitingUserInput: expect.objectContaining({
            reason: "plan_review",
          }),
        }),
      }),
    );
  });

  it("listSessions() は永続化済み checkpoint を TTL フィルタ付きで返す", () => {
    const freshCheckpoint = createCheckpoint({
      checkpointId: "cp-fresh",
      updatedAt: Date.now() - 60_000,
    });
    const expiredCheckpoint = createCheckpoint({
      checkpointId: "cp-expired",
      planId: "plan-expired",
      updatedAt: Date.now() - SESSION_TTL_MS - 1,
    });
    sessionRepository.listCheckpoints.mockReturnValue([
      expiredCheckpoint,
      freshCheckpoint,
    ]);

    const sessions = facade.listSessions();

    expect(sessionRepository.cleanupExpiredLeases).toHaveBeenCalledTimes(1);
    expect(sessionRepository.cleanupExpiredCheckpoints).toHaveBeenCalledWith(
      SESSION_TTL_MS,
    );
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({
      checkpointId: "cp-fresh",
      sessionId: "cp-fresh",
      planId: "plan-resume-001",
      startedAt: expect.any(Number),
      compatibility: {
        status: "compatible",
      },
    });
  });

  it("resumeSession() は永続化済み checkpoint から workflow state を復元する", () => {
    const checkpoint = createCheckpoint();
    sessionRepository.listCheckpoints.mockReturnValue([checkpoint]);

    const snapshot = facade.resumeSession(checkpoint.checkpointId);

    expect(snapshot).toMatchObject({
      planId: "plan-resume-001",
      currentPhase: "review",
    });
    expect(facade.getWorkflowStateSnapshot("plan-resume-001")).toMatchObject({
      currentPhase: "review",
    });
  });

  it("resumeSessionWithResult() は非互換時に incompatible を返す", () => {
    const checkpoint = createCheckpoint();
    sessionRepository.listCheckpoints.mockReturnValue([checkpoint]);
    sessionRepository.evaluateResumeCompatibility.mockReturnValue({
      status: "incompatible",
      reasons: ["engine_version_mismatch"],
      warnings: [],
    });

    const result = facade.resumeSessionWithResult(checkpoint.checkpointId);

    expect(result).toEqual({ success: false, errorReason: "incompatible" });
  });

  it("resumeSessionWithResult() は期限切れセッションを削除する", () => {
    const checkpoint = createCheckpoint({
      updatedAt: Date.now() - SESSION_TTL_MS - 1,
    });
    sessionRepository.listCheckpoints.mockReturnValue([checkpoint]);

    const result = facade.resumeSessionWithResult(checkpoint.checkpointId);

    expect(result).toEqual({ success: false, errorReason: "expired" });
    expect(sessionRepository.deleteCheckpoint).toHaveBeenCalledWith(
      "plan-resume-001",
    );
  });

  it("deleteSession() は checkpointId から planId を解決して削除する", () => {
    const checkpoint = createCheckpoint();
    sessionRepository.listCheckpoints.mockReturnValue([checkpoint]);

    facade.deleteSession(checkpoint.checkpointId);

    expect(sessionRepository.deleteCheckpoint).toHaveBeenCalledWith(
      "plan-resume-001",
    );
  });

  it("cleanupExpiredSessions() は期限切れセッションを削除する", () => {
    sessionRepository.cleanupExpiredLeases.mockReturnValue(1);
    sessionRepository.cleanupExpiredCheckpoints.mockReturnValue(2);

    const cleaned = facade.cleanupExpiredSessions();

    expect(sessionRepository.cleanupExpiredLeases).toHaveBeenCalledTimes(1);
    expect(sessionRepository.cleanupExpiredCheckpoints).toHaveBeenCalledWith(
      SESSION_TTL_MS,
    );
    expect(cleaned).toBe(2);
  });
});
