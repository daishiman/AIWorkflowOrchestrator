/**
 * RuntimeSkillCreatorFacade.executeAsync tests
 *
 * TASK-FIX-EXECUTE-PLAN-FF-001 Phase 6: テスト拡充
 * TC-T4-01: executeAsync の成功時に snapshot callback を通知する
 * TC-T4-02: executeAsync の失敗時に throw せず failure callback を通知する
 * TC-T4-03: adapter guard で execute が失敗した場合も snapshot callback を通知する
 * TC-T4-04: execute() が structured error を返した場合に error.message を snapshot callback へ伝搬する
 *           (TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001)
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
    // TASK-RT-02: llmAdapter を注入して execute guard を通過させる
    llmAdapter: createMockLLMAdapter(),
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
    // fix後: onPhaseChanged 経由 (call 1) + structured error パス経由 (call 2) で合計2回
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
    // TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 fix: error.message が第3引数に渡ることを確認
    expect(snapshotSpy).toHaveBeenCalledWith(
      "plan-003",
      expect.anything(),
      "Connection refused",
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

  it("TC-T4-04: execute() が structured error を返した場合に error.message を snapshot callback へ伝搬する", async () => {
    const { executeMock, facade, workflowEngine } = createFacade();
    const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    executeMock.mockResolvedValue({
      success: false,
      error: {
        code: "LLM_ADAPTER_NOT_READY",
        message: "API key not configured",
      },
    });

    await facade.executeAsync("plan-004", {
      planId: "plan-004",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    expect(phaseSpy).toHaveBeenNthCalledWith(1, "plan-004", "executing", 0);
    expect(phaseSpy).toHaveBeenNthCalledWith(2, "plan-004", "error", 0);
    // ワークフローエンジンがスナップショットを生成するため、snapshot callback は
    // (planId, snapshot) 形式で呼ばれる。error.message は verifyResult.message に含まれる。
    expect(snapshotSpy).toHaveBeenCalledWith(
      "plan-004",
      expect.objectContaining({
        planId: "plan-004",
        verifyResult: expect.objectContaining({
          message: "API key not configured",
        }),
      }),
    );
  });

  // ── TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 ──
  // T-01〜T-04: executeAsync エラー伝搬パス統一テスト（Phase 4 TDD Red）

  it("T-01: structured error パス - snapshot が存在する場合も error.message が第3引数に渡る", async () => {
    // facade.execute() を直接スパイ: RuntimeSkillCreatorExecuteErrorResponse を返す
    const { facade, workflowEngine } = createFacade();
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    const mockSnapshot = { planId: "plan-T01", currentPhase: "review" } as any;
    vi.spyOn(workflowEngine, "getWorkflowState").mockReturnValue(mockSnapshot);
    // execute() を直接モック: skillExecutor.execute 経由ではなく直接 structured error を返す
    vi.spyOn(facade, "execute").mockResolvedValue({
      success: false,
      error: {
        code: "llm_adapter_unavailable",
        message: "APIキーを設定してください",
      },
    } as any);

    await facade.executeAsync("plan-T01", {
      planId: "plan-T01",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    // structured error パス修正後: snapshot があっても error.message を第3引数に渡す
    expect(snapshotSpy).toHaveBeenCalledWith(
      "plan-T01",
      mockSnapshot,
      "APIキーを設定してください",
    );
  });

  it("T-02: catch パス - snapshot が存在する場合も error.message が第3引数に渡る", async () => {
    const { facade, workflowEngine } = createFacade();
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    const mockSnapshot = { planId: "plan-T02", currentPhase: "review" } as any;
    vi.spyOn(workflowEngine, "getWorkflowState").mockReturnValue(mockSnapshot);
    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockRejectedValue(
      new Error("execution failed unexpectedly"),
    );

    await facade.executeAsync("plan-T02", {
      planId: "plan-T02",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    // catch パス修正後: snapshot があっても errorMessage を第3引数に渡す
    expect(snapshotSpy).toHaveBeenCalledWith(
      "plan-T02",
      mockSnapshot,
      "execution failed unexpectedly",
    );
  });

  it("T-03: terminal_handoff パス - onWorkflowStateSnapshot の第3引数は undefined", async () => {
    const { executeMock, facade, workflowEngine } = createFacade();
    const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    executeMock.mockResolvedValue({
      type: "terminal_handoff",
      bundle: { planId: "plan-T03" },
    });

    await facade.executeAsync("plan-T03", {
      planId: "plan-T03",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    expect(phaseSpy).toHaveBeenCalledWith("plan-T03", "complete", 100);
    // 正常系では第3引数は渡らない（undefined）
    const calls = snapshotSpy.mock.calls;
    for (const call of calls) {
      expect(call[2]).toBeUndefined();
    }
  });

  it("T-04: success パス - onWorkflowStateSnapshot の第3引数は undefined", async () => {
    const { executeMock, facade, workflowEngine } = createFacade();
    const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });
    executeMock.mockResolvedValue({
      executionId: "exec-T04",
      success: true,
    });

    await facade.executeAsync("plan-T04", {
      planId: "plan-T04",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    expect(phaseSpy).toHaveBeenCalledWith("plan-T04", "complete", 100);
    // 正常系では第3引数は渡らない（undefined）
    const calls = snapshotSpy.mock.calls;
    for (const call of calls) {
      expect(call[2]).toBeUndefined();
    }
  });

  // ── Phase 6 追加テスト ──

  it("T-05: structured error パス - snapshot が undefined の場合も null として第2引数に渡る", async () => {
    // facade.execute() を直接スパイ: RuntimeSkillCreatorExecuteErrorResponse を返す
    const { facade, workflowEngine } = createFacade();
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    vi.spyOn(workflowEngine, "getWorkflowState").mockReturnValue(undefined);
    vi.spyOn(facade, "execute").mockResolvedValue({
      success: false,
      error: {
        code: "llm_adapter_unavailable",
        message: "APIキーを設定してください",
      },
    } as any);

    await facade.executeAsync("plan-T05", {
      planId: "plan-T05",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    // snapshot ?? null により undefined -> null に変換されること
    expect(snapshotSpy).toHaveBeenCalledWith(
      "plan-T05",
      null,
      "APIキーを設定してください",
    );
  });

  it("T-06: catch パス - Error 以外の値を throw した場合も String(error) が第3引数に渡る", async () => {
    const { facade, workflowEngine } = createFacade();
    const snapshotSpy = vi.fn();
    facade.onWorkflowStateSnapshot = snapshotSpy;

    vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockRejectedValue(
      "execution failed unexpectedly",
    );
    vi.spyOn(workflowEngine, "getWorkflowState").mockReturnValue(undefined);

    await facade.executeAsync("plan-T06", {
      planId: "plan-T06",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    // String(error) ルート: Error 以外は String() で変換されること
    expect(snapshotSpy).toHaveBeenCalledWith(
      "plan-T06",
      null,
      "execution failed unexpectedly",
    );
  });
});
