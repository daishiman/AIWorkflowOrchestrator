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

const terminalHandoffBundle = {
  launcher: "claude",
  promptBundle: "large-spec",
  cwd: "/tmp/runtime-skill",
  suggestedCommand: 'claude -p "large-spec"',
  manualRetryRule: "認証設定を確認してから CLI で再実行する",
};

describe("SkillCreator runtime preload API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runtime 用 3 チャンネルが定義され invoke whitelist に含まれる", () => {
    expect(IPC_CHANNELS.SKILL_CREATOR_PLAN).toBe("skill-creator:plan");
    expect(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN).toBe(
      "skill-creator:execute-plan",
    );
    expect(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL).toBe(
      "skill-creator:improve-skill",
    );

    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL,
    );
  });

  it("SkillCreatorAPI に runtime 用メソッドが公開されている", () => {
    const api: SkillCreatorAPI = skillCreatorAPI;

    expect(typeof api.planSkill).toBe("function");
    expect(typeof api.executePlan).toBe("function");
    expect(typeof api.improveSkillWithFeedback).toBe("function");
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
      success: true,
      data: {
        executeId: "exec-001",
        skillName: "skill-a",
        success: true,
      },
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
    expect(result).toEqual(expected);
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
    mockInvoke.mockResolvedValue({ success: true, data: {} });

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

  it("executePlan が terminal_handoff レスポンスを返す場合も正しく受け取れる", async () => {
    const terminalHandoffResponse = {
      success: true,
      data: {
        type: "terminal_handoff" as const,
        bundle: terminalHandoffBundle,
      },
    };
    mockInvoke.mockResolvedValue(terminalHandoffResponse);

    const result = await skillCreatorAPI.executePlan(
      "plan-002",
      "large-spec",
      "api-key",
      "sk-test",
    );

    expect(result).toEqual(terminalHandoffResponse);
    expect(result.data).toHaveProperty("type", "terminal_handoff");
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
});
