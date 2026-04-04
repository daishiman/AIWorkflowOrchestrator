/**
 * RuntimeSkillCreatorFacade.executeAsync tests
 *
 * TASK-FIX-EXECUTE-PLAN-FF-001 Phase 6: テスト拡充
 * TC-T4-01: executeAsync の成功時に snapshot callback を通知する
 * TC-T4-02: executeAsync の失敗時に throw せず failure callback を通知する
 * TC-T4-03: adapter guard で execute が失敗した場合も snapshot callback を通知する
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ILLMAdapter } from "../../../adapters/llm/types";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { SkillCreatorWorkflowEngine } from "../SkillCreatorWorkflowEngine";

function createMockLLMAdapter(): ILLMAdapter {
  return {
    providerId: "anthropic" as ILLMAdapter["providerId"],
    sendChat: vi.fn(),
    streamChat: vi.fn(),
    checkHealth: vi.fn(),
  } as unknown as ILLMAdapter;
}

function createFacade() {
  const executeMock = vi.fn();
  const workflowEngine = new SkillCreatorWorkflowEngine();
  const facade = new RuntimeSkillCreatorFacade({
    skillExecutor: {
      execute: executeMock,
    } as unknown as SkillExecutor,
    workflowEngine,
  });
  // TASK-UT-RT-01: _llmAdapterStatus ガードを通過させるため
  facade.setLLMAdapter(createMockLLMAdapter());

  return {
    executeMock,
    facade,
    workflowEngine,
  };
}

describe("RuntimeSkillCreatorFacade.executeAsync", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-T4-01: executeAsync の成功時に snapshot callback を通知する", async () => {
    const { executeMock, facade, workflowEngine } = createFacade();
    const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
    const completeSpy = vi.fn();
    facade.onWorkflowStateSnapshot = completeSpy;

    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    executeMock.mockResolvedValue({
      executionId: "exec-001",
      success: true,
    });

    await facade.executeAsync("plan-001", {
      planId: "plan-001",
      skillSpec: "  skill spec  ",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(phaseSpy).toHaveBeenNthCalledWith(1, "plan-001", "executing", 0);
    expect(phaseSpy).toHaveBeenNthCalledWith(2, "plan-001", "complete", 100);
    expect(completeSpy).toHaveBeenCalledTimes(1);
    expect(completeSpy).toHaveBeenCalledWith(
      "plan-001",
      expect.objectContaining({
        planId: "plan-001",
        currentPhase: "verify",
      }),
    );
  });

  it("TC-T4-02: executeAsync の失敗時に throw せず failure callback を通知する", async () => {
    const { executeMock, facade, workflowEngine } = createFacade();
    const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
    const completeSpy = vi.fn();
    facade.onWorkflowStateSnapshot = completeSpy;

    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockRejectedValue(
      new Error("resolve failed"),
    );
    executeMock.mockResolvedValue({
      executionId: "exec-002",
      success: true,
    });

    await expect(
      facade.executeAsync("plan-002", {
        planId: "plan-002",
        skillSpec: "skill spec",
        authMode: "api-key",
        apiKey: "sk-test",
      }),
    ).resolves.toBeUndefined();

    expect(executeMock).not.toHaveBeenCalled();
    expect(phaseSpy).toHaveBeenNthCalledWith(1, "plan-002", "executing", 0);
    expect(phaseSpy).toHaveBeenNthCalledWith(2, "plan-002", "error", 0);
    expect(completeSpy).toHaveBeenCalledTimes(1);
    expect(completeSpy).toHaveBeenCalledWith(
      "plan-002",
      null,
      "resolve failed",
    );
  });

  it("TC-T4-03: adapter guard で execute が失敗した場合も snapshot callback を通知する", async () => {
    const { executeMock, facade, workflowEngine } = createFacade();
    const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;
    facade.setLLMAdapterFailed("Connection refused");

    await facade.executeAsync("plan-003", {
      planId: "plan-003",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    expect(executeMock).not.toHaveBeenCalled();
    expect(phaseSpy).toHaveBeenNthCalledWith(1, "plan-003", "executing", 0);
    expect(phaseSpy).toHaveBeenNthCalledWith(2, "plan-003", "error", 0);
    expect(snapshotSpy).toHaveBeenCalledTimes(1);
    expect(snapshotSpy).toHaveBeenCalledWith(
      "plan-003",
      expect.objectContaining({
        planId: "plan-003",
        currentPhase: "review",
        handoffBundle: null,
        verifyResult: expect.objectContaining({
          status: "fail",
          reason: "verification_review",
          message: "Connection refused",
          nextAction: "review",
        }),
        resumeTokenEnvelope: expect.objectContaining({
          version: "task-sdk-02-v1",
          planId: "plan-003",
          currentPhase: "review",
        }),
      }),
    );
    expect(workflowEngine.getWorkflowState("plan-003")).toEqual(
      expect.objectContaining({
        planId: "plan-003",
        currentPhase: "review",
        handoffBundle: null,
        verifyResult: expect.objectContaining({
          status: "fail",
          reason: "verification_review",
          message: "Connection refused",
          nextAction: "review",
        }),
      }),
    );
  });
});
