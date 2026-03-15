import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAgentSlice, type AgentSlice } from "../agentSlice";

function createStore(): { getState: () => AgentSlice } {
  let store = {} as AgentSlice;
  const state = {} as Partial<AgentSlice>;
  const set = (
    fn: ((current: AgentSlice) => Partial<AgentSlice>) | Partial<AgentSlice>,
  ) => {
    const partial =
      typeof fn === "function" ? fn(store) : (fn as Partial<AgentSlice>);
    Object.assign(state, partial);
    store = { ...store, ...state } as AgentSlice;
  };
  const get = () => store;
  store = createAgentSlice(set as never, get as never, {} as never);
  return {
    getState: () => store,
  };
}

describe("agentSlice.executeSkill preflight", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("auth-key未設定時は execute を呼ばずに error 状態へ遷移する", async () => {
    const executeMock = vi.fn().mockResolvedValue({ executionId: "exec-1" });

    Object.defineProperty(window, "electronAPI", {
      configurable: true,
      value: {
        authKey: {
          exists: vi.fn().mockResolvedValue({ exists: false }),
        },
        skill: {
          execute: executeMock,
        },
      },
    });

    const store = createStore();
    store.getState().selectSkillByName("test-skill");

    await store.getState().executeSkill("hello");

    expect(executeMock).not.toHaveBeenCalled();
    expect(store.getState().skillExecutionStatus).toBe("error");
    expect(store.getState().executionId).toBeNull();
    expect(store.getState().skillError).toContain("APIキー");
  });

  it("auth-key設定済みなら execute を呼び出して running 状態へ遷移する", async () => {
    const executeMock = vi.fn().mockResolvedValue({ executionId: "exec-2" });

    Object.defineProperty(window, "electronAPI", {
      configurable: true,
      value: {
        authKey: {
          exists: vi.fn().mockResolvedValue({ exists: true }),
        },
        skill: {
          execute: executeMock,
        },
      },
    });

    const store = createStore();
    store.getState().selectSkillByName("test-skill");

    await store.getState().executeSkill("hello");

    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(executeMock).toHaveBeenCalledWith({
      skillName: "test-skill",
      prompt: "hello",
    });
    expect(store.getState().skillExecutionStatus).toBe("running");
    expect(store.getState().executionId).toBe("exec-2");
    expect(store.getState().skillError).toBeNull();
  });

  it("auth-key確認失敗時は認証エラーに遷移し execute を抑止する", async () => {
    const executeMock = vi.fn().mockResolvedValue({ executionId: "exec-3" });

    Object.defineProperty(window, "electronAPI", {
      configurable: true,
      value: {
        authKey: {
          exists: vi.fn().mockRejectedValue(new Error("bridge failed")),
        },
        skill: {
          execute: executeMock,
        },
      },
    });

    const store = createStore();
    store.getState().selectSkillByName("test-skill");

    await store.getState().executeSkill("hello");

    expect(executeMock).not.toHaveBeenCalled();
    expect(store.getState().skillExecutionStatus).toBe("error");
    expect(store.getState().skillError).toContain(
      "APIキー設定状態の確認に失敗",
    );
  });

  it("subscription モードでは handoff guidance を保持する", async () => {
    const executeMock = vi.fn().mockResolvedValue({
      executionId: "handoff-1",
      success: false,
      handoff: true,
      error:
        "サブスクリプションモードのため、Claude Code CLI で続行してください。",
      guidance: {
        terminalCommand: 'claude "Continue this task"',
        contextSummary: "surface=skill skill=test-skill",
        reason:
          "サブスクリプションモードのため、Claude Code CLI で続行してください。",
      },
    });

    Object.defineProperty(window, "electronAPI", {
      configurable: true,
      value: {
        authMode: {
          get: vi.fn().mockResolvedValue({
            success: true,
            data: { mode: "subscription" },
          }),
        },
        authKey: {
          exists: vi.fn().mockResolvedValue({ exists: false }),
        },
        skill: {
          execute: executeMock,
        },
      },
    });

    const store = createStore();
    store.getState().selectSkillByName("test-skill");

    await store.getState().executeSkill("hello");

    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(store.getState().skillExecutionStatus).toBe("error");
    expect(store.getState().handoffGuidance).not.toBeNull();
    expect(store.getState().handoffGuidance?.terminalCommand).toContain(
      "claude",
    );
  });
});
