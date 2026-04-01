/**
 * RuntimeSkillCreatorFacade.executeAsync tests
 *
 * TASK-FIX-EXECUTE-PLAN-FF-001 Phase 6: テスト拡充
 * TC-T4-01: executeAsync の成功時に snapshot callback を通知する
 * TC-T4-02: executeAsync の失敗時に throw せず failure callback を通知する
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { SkillCreatorWorkflowEngine } from "../SkillCreatorWorkflowEngine";

function createFacade() {
  const executeMock = vi.fn();
  const workflowEngine = new SkillCreatorWorkflowEngine();
  const facade = new RuntimeSkillCreatorFacade({
    skillExecutor: {
      execute: executeMock,
    } as unknown as SkillExecutor,
    workflowEngine,
  });

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
});
