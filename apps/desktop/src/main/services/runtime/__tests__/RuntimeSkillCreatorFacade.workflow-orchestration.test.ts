import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { SkillCreatorWorkflowEngine } from "../SkillCreatorWorkflowEngine";

function createPlanResult(overrides: Record<string, unknown> = {}) {
  return {
    planId: "plan-100",
    skillSpec: "engine-test\nbody",
    estimatedSteps: 3,
    skillName: "",
    description: "",
    agents: [],
    scripts: [],
    triggers: [],
    anchors: [],
    ...overrides,
  };
}

function createMockLLMAdapter(): ILLMAdapter {
  return {
    providerId: "anthropic" as ILLMAdapter["providerId"],
    sendChat: vi.fn().mockResolvedValue({
      content: JSON.stringify({
        skillName: "engine-test",
        description: "workflow test skill",
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

describe("RuntimeSkillCreatorFacade workflow orchestration", () => {
  let executeMock: ReturnType<typeof vi.fn>;
  let workflowEngine: SkillCreatorWorkflowEngine;
  let facade: RuntimeSkillCreatorFacade;
  let mockLLMAdapter: ILLMAdapter;

  beforeEach(() => {
    executeMock = vi.fn();
    workflowEngine = new SkillCreatorWorkflowEngine();
    mockLLMAdapter = createMockLLMAdapter();
    facade = new RuntimeSkillCreatorFacade({
      skillExecutor: {
        execute: executeMock,
      } as unknown as SkillExecutor,
      workflowEngine,
      llmAdapter: mockLLMAdapter,
      resourceLoader: {
        getBasePath: () => "/tmp/skill-creator",
        loadAgent: vi.fn().mockResolvedValue("agent content"),
      } as never,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("plan() integrated_api は engine に review state を記録する", async () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_100);

    const result = await facade.plan("spec body", "api-key", "sk-test");
    expect(result).toMatchObject({
      planId: "plan-1710000000100",
    });

    const snapshot = facade.getWorkflowStateSnapshot("plan-1710000000100");
    expect(snapshot).toMatchObject({
      currentPhase: "review",
      routeSnapshot: {
        type: "integrated_api",
        permissionMode: "default",
      },
      sourceProvenance: {
        resolvedSkillCreatorRoot: "/tmp/skill-creator",
      },
    });
    expect(snapshot?.awaitingUserInput?.reason).toBe("plan_review");
  });

  it("execute() integrated_api は engine を verify phase まで進める", async () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    executeMock.mockResolvedValue({
      executionId: "exec-100",
      success: true,
    });

    const result = await facade.execute(
      createPlanResult(),
      "api-key",
      "sk-test",
    );

    expect(result).toMatchObject({
      executeId: "exec-100",
      skillName: "engine-test",
      success: true,
      error: undefined,
    });
    expect(result).toHaveProperty("sdkEvents");
    expect(result).toHaveProperty("sourceProvenance");

    const snapshot = facade.getWorkflowStateSnapshot("plan-100");
    expect(snapshot).toMatchObject({
      currentPhase: "verify",
      verifyResult: {
        status: "pending",
        nextAction: "review",
      },
      routeSnapshot: {
        type: "integrated_api",
        permissionMode: "default",
      },
    });
  });

  it("execute() は sdk message を lane 正規化イベントへ変換して返す", async () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    executeMock.mockResolvedValue({
      executionId: "exec-200",
      success: true,
      sdkMessages: [
        { type: "system", subtype: "init", session_id: "sdk-session-200" },
        {
          type: "assistant",
          message: {
            content: [{ type: "text", text: "normalized assistant text" }],
          },
        },
        {
          type: "result",
          subtype: "success",
          stop_reason: "end_turn",
          session_id: "sdk-session-200",
        },
      ],
    });

    const result = await facade.execute(
      createPlanResult(),
      "api-key",
      "sk-test",
    );

    expect(result).toMatchObject({
      executeId: "exec-200",
      success: true,
      sessionId: "sdk-session-200",
      resultSubtype: "success",
      stopReason: "end_turn",
      sourceProvenance: {
        resolvedSkillCreatorRoot: "/tmp/skill-creator",
      },
    });
    expect(result).toHaveProperty("sdkEvents");
    if ("type" in result) {
      throw new Error("expected integrated_api execute result");
    }
    expect(result.sdkEvents).toEqual([
      expect.objectContaining({
        eventType: "init",
        sessionId: "sdk-session-200",
        sourceProvenance: {
          resolvedSkillCreatorRoot: "/tmp/skill-creator",
        },
      }),
      expect.objectContaining({
        eventType: "assistant",
        text: "normalized assistant text",
      }),
      expect.objectContaining({
        eventType: "result",
        sessionId: "sdk-session-200",
        resultSubtype: "success",
        stopReason: "end_turn",
      }),
    ]);
  });

  it("execute() は permission denial を正規化イベントと集約結果に保持する", async () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    executeMock.mockResolvedValue({
      executionId: "exec-201",
      success: false,
      error: {
        code: "EXECUTION_FAILED",
        message: "permission denied",
      },
      sdkMessages: [
        { type: "system", subtype: "init", session_id: "sdk-session-201" },
        {
          type: "result",
          subtype: "error_max_turns",
          stop_reason: "permission_denied",
          session_id: "sdk-session-201",
          permission_denials: [
            { tool_name: "Write", reason: "Approval required" },
          ],
        },
      ],
    });

    const result = await facade.execute(
      createPlanResult(),
      "api-key",
      "sk-test",
    );

    expect(result).toMatchObject({
      executeId: "exec-201",
      success: false,
      sessionId: "sdk-session-201",
      resultSubtype: "error_max_turns",
      stopReason: "permission_denied",
      permissionDenials: [
        {
          toolName: "Write",
          reason: "Approval required",
        },
      ],
    });
    if ("type" in result) {
      throw new Error("expected integrated_api execute result");
    }
    expect(result.sdkEvents).toEqual([
      expect.objectContaining({
        eventType: "init",
      }),
      expect.objectContaining({
        eventType: "result",
        permissionDenials: [
          {
            toolName: "Write",
            reason: "Approval required",
          },
        ],
      }),
    ]);
  });

  it("execute() success:false は verification_review 付きで review に戻す", async () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    executeMock.mockResolvedValue({
      executionId: "exec-101",
      success: false,
      error: {
        code: "EXECUTION_FAILED",
        message: "executor failed",
      },
    });

    const result = await facade.execute(
      createPlanResult(),
      "api-key",
      "sk-test",
    );

    expect(result).toMatchObject({
      executeId: "exec-101",
      skillName: "engine-test",
      success: false,
      error: "executor failed",
    });

    const snapshot = facade.getWorkflowStateSnapshot("plan-100");
    expect(snapshot).toMatchObject({
      currentPhase: "review",
      awaitingUserInput: {
        reason: "verification_review",
      },
      verifyResult: {
        status: "fail",
        reason: "verification_review",
        message: "executor failed",
        nextAction: "review",
      },
    });
  });

  it("execute() reject は失敗 snapshot を保存して error result を返す", async () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_200);
    executeMock.mockRejectedValue(new Error("executor rejected"));

    const result = await facade.execute(
      createPlanResult(),
      "api-key",
      "sk-test",
    );

    expect(result).toMatchObject({
      executeId: "exec-error-1710000000200",
      skillName: "engine-test",
      success: false,
      error: "executor rejected",
    });

    const snapshot = facade.getWorkflowStateSnapshot("plan-100");
    expect(snapshot).toMatchObject({
      currentPhase: "review",
      awaitingUserInput: {
        reason: "verification_review",
      },
      verifyResult: {
        status: "fail",
        reason: "verification_review",
        message: "executor rejected",
        nextAction: "review",
      },
    });
    expect(
      snapshot?.phaseArtifacts.filter(
        (artifact) => artifact.kind === "execute_result",
      ),
    ).toHaveLength(1);
  });

  it("failure verify_result artifact を facade snapshot から読める", async () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    executeMock.mockResolvedValue({
      executionId: "exec-100",
      success: true,
    });

    await facade.execute(createPlanResult(), "api-key", "sk-test");
    workflowEngine.recordVerifyFailure("plan-100", "verify failed", "improve");

    const snapshot = facade.getWorkflowStateSnapshot("plan-100");
    const verifyArtifacts =
      snapshot?.phaseArtifacts.filter(
        (artifact) => artifact.kind === "verify_result",
      ) ?? [];

    expect(snapshot).toMatchObject({
      currentPhase: "improve",
      verifyResult: {
        status: "fail",
        message: "verify failed",
        nextAction: "improve",
      },
    });
    expect(verifyArtifacts).toHaveLength(2);
    expect(verifyArtifacts.at(-1)?.payload).toMatchObject(
      snapshot?.verifyResult ?? {},
    );
  });

  it("getVerifyDetail() は facade から derived detail を返す", async () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    executeMock.mockResolvedValue({
      executionId: "exec-verify-1",
      success: true,
    });

    await facade.execute(createPlanResult(), "api-key", "sk-test");

    const detail = facade.getVerifyDetail("plan-100");

    expect(detail).toMatchObject({
      planId: "plan-100",
      currentPhase: "verify",
      status: "pending",
      reverifyEligible: true,
      route: {
        type: "integrated_api",
      },
    });
  });

  it("reverifyWorkflow() は engine detail を pending に戻す", async () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    executeMock.mockResolvedValue({
      executionId: "exec-verify-2",
      success: true,
    });

    await facade.execute(createPlanResult(), "api-key", "sk-test");
    workflowEngine.recordVerifyFailure("plan-100", "verify failed", "improve");

    const result = facade.reverifyWorkflow("plan-100");
    const snapshot = facade.getWorkflowStateSnapshot("plan-100");

    expect(result).toEqual({ accepted: true });
    expect(snapshot).toMatchObject({
      currentPhase: "verify",
      verifyResult: {
        status: "pending",
      },
    });
  });

  it("execute() terminal_handoff は executor を呼ばず handoff state を保存する", async () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "terminal_handoff",
      bundle: {
        launcher: "claude",
        promptBundle: "engine-test",
        cwd: "/tmp/runtime",
        suggestedCommand: 'claude -p "engine-test"',
        manualRetryRule: "retry",
      },
    });

    const result = await facade.execute(
      createPlanResult(),
      "api-key",
      "missing-key",
    );

    expect(result).toEqual({
      type: "terminal_handoff",
      bundle: {
        launcher: "claude",
        promptBundle: "engine-test",
        cwd: "/tmp/runtime",
        suggestedCommand: 'claude -p "engine-test"',
        manualRetryRule: "retry",
      },
    });
    expect(executeMock).not.toHaveBeenCalled();

    const snapshot = facade.getWorkflowStateSnapshot("plan-100");
    expect(snapshot).toMatchObject({
      currentPhase: "handoff",
      routeSnapshot: {
        type: "terminal_handoff",
        launcher: "claude",
      },
    });
  });

  it("execute() success:false は verification_review 付きで review に戻す", async () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    executeMock.mockResolvedValue({
      executionId: "exec-101",
      success: false,
      error: {
        code: "EXECUTION_FAILED",
        message: "executor failed",
      },
    });

    const result = await facade.execute(
      createPlanResult(),
      "api-key",
      "sk-test",
    );

    expect(result).toMatchObject({
      executeId: "exec-101",
      skillName: "engine-test",
      success: false,
      error: "executor failed",
    });

    const snapshot = facade.getWorkflowStateSnapshot("plan-100");
    expect(snapshot).toMatchObject({
      currentPhase: "review",
      awaitingUserInput: {
        reason: "verification_review",
      },
      verifyResult: {
        status: "fail",
        nextAction: "review",
        message: "executor failed",
      },
    });
  });

  it("execute() reject は失敗 snapshot を保存して error result を返す", async () => {
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    executeMock.mockRejectedValue(new Error("network down"));

    const result = await facade.execute(
      createPlanResult(),
      "api-key",
      "sk-test",
    );

    expect(result).toMatchObject({
      success: false,
      error: "network down",
    });
    expect(result).toHaveProperty("executeId");

    const snapshot = facade.getWorkflowStateSnapshot("plan-100");
    expect(snapshot).toMatchObject({
      currentPhase: "review",
      awaitingUserInput: {
        reason: "verification_review",
      },
      verifyResult: {
        status: "fail",
        nextAction: "review",
        message: "network down",
      },
    });
  });
});
