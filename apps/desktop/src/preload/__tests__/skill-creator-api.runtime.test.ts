import { beforeEach, describe, expect, it, vi } from "vitest";
import { ALLOWED_INVOKE_CHANNELS, IPC_CHANNELS } from "../channels";

const { mockInvoke, mockOn, mockRemoveListener } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
  mockOn: vi.fn(),
  mockRemoveListener: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: mockInvoke,
    on: mockOn,
    removeListener: mockRemoveListener,
  },
}));

import { skillCreatorAPI } from "../skill-creator-api";
import type { SkillCreatorAPI } from "../skill-creator-api";

describe("SkillCreator runtime preload API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runtime 用 3 チャンネルが定義され invoke whitelist に含まれる", () => {
    expect(IPC_CHANNELS.SKILL_CREATOR_PLAN).toBe("skill-creator:plan");
    expect(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN).toBe(
      "skill-creator:execute-plan",
    );
    expect(IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE).toBe(
      "skill-creator:get-workflow-state",
    );
    expect(IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT).toBe(
      "skill-creator:submit-user-input",
    );
    expect(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL).toBe(
      "skill-creator:improve-skill",
    );
    expect(IPC_CHANNELS.SKILL_CREATOR_GET_VERIFY_DETAIL).toBe(
      "skill-creator:get-verify-detail",
    );
    expect(IPC_CHANNELS.SKILL_CREATOR_REVERIFY_WORKFLOW).toBe(
      "skill-creator:reverify-workflow",
    );

    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_GET_VERIFY_DETAIL,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_REVERIFY_WORKFLOW,
    );
  });

  it("SkillCreatorAPI に runtime 用メソッドが公開されている", () => {
    const api: SkillCreatorAPI = skillCreatorAPI;

    expect(typeof api.planSkill).toBe("function");
    expect(typeof api.executePlan).toBe("function");
    expect(typeof api.getWorkflowState).toBe("function");
    expect(typeof api.submitUserInput).toBe("function");
    expect(typeof api.onWorkflowStateChanged).toBe("function");
    expect(typeof api.onOutputReady).toBe("function");
    expect(typeof api.improveSkillWithFeedback).toBe("function");
    expect(typeof api.getVerifyDetail).toBe("function");
    expect(typeof api.reverifyWorkflow).toBe("function");
  });

  it("planSkill が正しいチャンネルと payload で invoke する", async () => {
    const expected = {
      success: true,
      data: {
        planId: "plan-001",
        skillSpec: "spec",
        estimatedSteps: 3,
      },
    };
    mockInvoke.mockResolvedValue(expected);

    const result = await skillCreatorAPI.planSkill(
      "spec",
      "subscription",
      null,
    );

    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_CREATOR_PLAN, {
      prompt: "spec",
      authMode: "subscription",
      apiKey: null,
    });
    expect(result).toEqual(expected);
  });

  it("executePlan が planId と skillSpec を送る", async () => {
    const expected = {
      accepted: true as const,
      planId: "plan-001",
    };
    mockInvoke.mockResolvedValue(expected);

    const result = await skillCreatorAPI.executePlan(
      "plan-001",
      "skill-a\nbody",
      "api-key",
      "sk-test",
    );

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
      {
        planId: "plan-001",
        skillSpec: "skill-a\nbody",
        authMode: "api-key",
        apiKey: "sk-test",
      },
    );
    expect(result).toEqual({
      success: true,
      data: expected,
    });
  });

  it("improveSkillWithFeedback が skillName と feedback を送る", async () => {
    const expected = {
      success: true,
      data: {
        improveId: "improve-001",
        suggestions: ["入力バリデーションを強化する"],
      },
    };
    mockInvoke.mockResolvedValue(expected);

    const result = await skillCreatorAPI.improveSkillWithFeedback(
      "skill-a",
      "入力を見直して",
    );

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL,
      {
        skillName: "skill-a",
        feedback: "入力を見直して",
        authMode: undefined,
        apiKey: undefined,
      },
    );
    expect(result).toEqual(expected);
  });

  it("planSkill が null apiKey を明示的に渡す", async () => {
    mockInvoke.mockResolvedValue({ success: true, data: {} });

    await skillCreatorAPI.planSkill("spec", "api-key", null);

    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_CREATOR_PLAN, {
      prompt: "spec",
      authMode: "api-key",
      apiKey: null,
    });
  });

  it("executePlan が省略引数でも正しい payload を送る", async () => {
    mockInvoke.mockResolvedValue({ accepted: true, planId: "plan-1" });

    await skillCreatorAPI.executePlan("plan-1", "spec");

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
      {
        planId: "plan-1",
        skillSpec: "spec",
        authMode: undefined,
        apiKey: undefined,
      },
    );
  });

  it("executePlan が accepted ack を返す場合も正しく受け取れる", async () => {
    const acceptedResponse = {
      accepted: true as const,
      planId: "plan-002",
    };
    mockInvoke.mockResolvedValue(acceptedResponse);

    const result = await skillCreatorAPI.executePlan(
      "plan-002",
      "large-spec",
      "api-key",
      "sk-test",
    );

    expect(result).toEqual({
      success: true,
      data: acceptedResponse,
    });
    expect(result.data).toHaveProperty("accepted", true);
  });

  it("executePlan が失敗レスポンスを返す場合も envelope を保持する", async () => {
    const expected = {
      success: false,
      error: "実行に失敗しました",
    };
    mockInvoke.mockResolvedValue(expected);

    const result = await skillCreatorAPI.executePlan("plan-003", "broken-spec");

    expect(result).toEqual(expected);
    expect(result.success).toBe(false);
    expect(result.error).toBe("実行に失敗しました");
  });
  it("getWorkflowState が planId を送る", async () => {
    mockInvoke.mockResolvedValue({
      success: true,
      data: { planId: "plan-1", currentPhase: "review" },
    });

    await skillCreatorAPI.getWorkflowState("plan-1");

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE,
      { planId: "plan-1" },
    );
  });

  it("submitUserInput が submission payload を送る", async () => {
    mockInvoke.mockResolvedValue({
      success: true,
      data: { planId: "plan-1", currentPhase: "review" },
    });

    await skillCreatorAPI.submitUserInput({
      planId: "plan-1",
      requestId: "req-1",
      selectedOptionId: "ready_to_execute",
    });

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT,
      {
        planId: "plan-1",
        requestId: "req-1",
        selectedOptionId: "ready_to_execute",
      },
    );
  });

  it("onOutputReady が output-ready チャンネルに登録される", () => {
    const callback = vi.fn();
    const cleanup = skillCreatorAPI.onOutputReady(callback);

    expect(mockOn).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_OUTPUT_READY,
      expect.any(Function),
    );

    cleanup();
    expect(mockRemoveListener).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_OUTPUT_READY,
      expect.any(Function),
    );
  });

  it("onWorkflowStateChanged が listener を登録し cleanup で解除する", () => {
    const callback = vi.fn();

    const cleanup = skillCreatorAPI.onWorkflowStateChanged(callback);

    expect(mockOn).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      expect.any(Function),
    );

    cleanup();

    expect(mockRemoveListener).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      expect.any(Function),
    );
  });

  it("getVerifyDetail が planId を送る", async () => {
    const expected = {
      success: true,
      data: {
        planId: "plan-verify-1",
        currentPhase: "verify",
        status: "pending",
        checks: [],
        evidenceCount: 3,
        route: {
          type: "integrated_api",
          summary: "integrated_api (default)",
        },
        reverifyEligible: true,
        delegatedGovernanceNote: "Task07",
        delegatedSessionNote: "Task08",
      },
    };
    mockInvoke.mockResolvedValue(expected);

    const result = await skillCreatorAPI.getVerifyDetail("plan-verify-1");

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_GET_VERIFY_DETAIL,
      {
        planId: "plan-verify-1",
      },
    );
    expect(result).toEqual(expected);
  });

  it("reverifyWorkflow が planId を送る", async () => {
    const expected = {
      success: true,
      data: {
        accepted: true,
      },
    };
    mockInvoke.mockResolvedValue(expected);

    const result = await skillCreatorAPI.reverifyWorkflow("plan-verify-2");

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_REVERIFY_WORKFLOW,
      {
        planId: "plan-verify-2",
      },
    );
    expect(result).toEqual(expected);
  });
});
