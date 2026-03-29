import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type {
  BrowserWindow as BrowserWindowType,
  IpcMainInvokeEvent,
} from "electron";
import type { RuntimeSkillCreatorFacade } from "../../services/runtime/RuntimeSkillCreatorFacade";

const handlerMap = new Map<string, (...args: unknown[]) => unknown>();

vi.mock("electron", () => {
  const mockBrowserWindow = {
    fromWebContents: vi.fn(),
    getAllWindows: vi.fn(() => []),
  };

  return {
    ipcMain: {
      handle: vi.fn(
        (channel: string, handler: (...args: unknown[]) => unknown) => {
          handlerMap.set(channel, handler);
        },
      ),
      removeHandler: vi.fn((channel: string) => {
        handlerMap.delete(channel);
      }),
    },
    BrowserWindow: mockBrowserWindow,
  };
});

const mockSkillCreatorService = {
  detectMode: vi.fn(),
  createSkill: vi.fn(),
  executeTasks: vi.fn(),
  validateSkill: vi.fn(),
  validateWithSchema: vi.fn(),
  improveSkill: vi.fn(),
  forkSkill: vi.fn(),
  shareSkill: vi.fn(),
  scheduleSkill: vi.fn(),
  debugSkill: vi.fn(),
  generateDocs: vi.fn(),
  getStats: vi.fn(),
};

const mockRuntimeSkillCreatorService = {
  plan: vi.fn(),
  execute: vi.fn(),
  improve: vi.fn(),
  getWorkflowStateSnapshot: vi.fn(),
  submitUserInput: vi.fn(),
  getVerifyDetail: vi.fn(),
  reverifyWorkflow: vi.fn(),
};

import { BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import {
  registerSkillCreatorHandlers,
  unregisterSkillCreatorHandlers,
} from "../skillCreatorHandlers";

function createMockMainWindow() {
  return {
    id: 1,
    webContents: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
      send: vi.fn(),
    },
    isDestroyed: () => false,
  };
}

function createMockEvent(webContentsId = 1): IpcMainInvokeEvent {
  return {
    sender: {
      id: webContentsId,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

function getHandler(channel: string) {
  return handlerMap.get(channel);
}

describe("SkillCreator runtime IPC handlers", () => {
  let mockMainWindow: ReturnType<typeof createMockMainWindow>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();

    mockMainWindow = createMockMainWindow();
    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      mockMainWindow,
    );

    registerSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
      mockSkillCreatorService as never,
      mockRuntimeSkillCreatorService as unknown as RuntimeSkillCreatorFacade,
    );
  });

  afterEach(() => {
    unregisterSkillCreatorHandlers();
  });

  it("runtime 用の 7 ハンドラーを登録する", () => {
    expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN)).toBeDefined();
    expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN)).toBeDefined();
    expect(
      getHandler(IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE),
    ).toBeDefined();
    expect(
      getHandler(IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT),
    ).toBeDefined();
    expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL)).toBeDefined();
    expect(
      getHandler(IPC_CHANNELS.SKILL_CREATOR_GET_VERIFY_DETAIL),
    ).toBeDefined();
    expect(
      getHandler(IPC_CHANNELS.SKILL_CREATOR_REVERIFY_WORKFLOW),
    ).toBeDefined();
  });

  it("planSkill は trim 済み prompt と auth 引数で runtime facade を呼ぶ", async () => {
    mockRuntimeSkillCreatorService.plan.mockResolvedValue({
      planId: "plan-1",
      skillSpec: "spec",
      estimatedSteps: 3,
      adapterStatus: "ready",
    });

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const result = await handler!(createMockEvent(), {
      prompt: "  spec  ",
      authMode: "subscription",
      apiKey: "k",
    });

    expect(result).toEqual({
      success: true,
      data: {
        planId: "plan-1",
        skillSpec: "spec",
        estimatedSteps: 3,
        adapterStatus: "ready",
      },
    });
    expect(mockRuntimeSkillCreatorService.plan).toHaveBeenCalledWith(
      "spec",
      "subscription",
      "k",
    );
  });

  it("planSkill は outer success=true のまま inner error payload を返せる", async () => {
    mockRuntimeSkillCreatorService.plan.mockResolvedValue({
      success: false,
      error: "APIキーを設定してください",
      errorCode: "LLM_ADAPTER_FAILED",
      adapterStatus: "failed",
    });

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const result = await handler!(createMockEvent(), {
      prompt: "spec",
      authMode: "api-key",
      apiKey: null,
    });

    expect(result).toEqual({
      success: true,
      data: {
        success: false,
        error: "APIキーを設定してください",
        errorCode: "LLM_ADAPTER_FAILED",
        adapterStatus: "failed",
      },
    });
    expect(mockRuntimeSkillCreatorService.plan).toHaveBeenCalledWith(
      "spec",
      "api-key",
      null,
    );
  });

  it("planSkill は initializing エラーも outer success=true で返す", async () => {
    mockRuntimeSkillCreatorService.plan.mockResolvedValue({
      success: false,
      error: "LLMAdapter の初期化中です。しばらくお待ちください",
      errorCode: "LLM_ADAPTER_INITIALIZING",
      adapterStatus: "initializing",
    });

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const result = await handler!(createMockEvent(), {
      prompt: "spec",
    });

    expect(result).toEqual({
      success: true,
      data: {
        success: false,
        error: "LLMAdapter の初期化中です。しばらくお待ちください",
        errorCode: "LLM_ADAPTER_INITIALIZING",
        adapterStatus: "initializing",
      },
    });
  });

  it("executePlan は blank skillSpec を拒否する", async () => {
    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN);
    const result = await handler!(createMockEvent(), {
      planId: "plan-1",
      skillSpec: "   ",
    });

    expect(result).toEqual({
      success: false,
      error: "skillSpec が指定されていません",
    });
    expect(mockRuntimeSkillCreatorService.execute).not.toHaveBeenCalled();
  });

  it("improveSkillWithFeedback は service 例外を sanitize して返す", async () => {
    mockRuntimeSkillCreatorService.improve.mockRejectedValue(
      new Error("Failure at /Users/test/project/file.ts\n    at runtime"),
    );

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL);
    const result = await handler!(createMockEvent(), {
      skillName: "demo",
      feedback: "more tests",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("[path]");
    expect(result.error).not.toContain("/Users/test/project");
  });

  it("getVerifyDetail は trim 済み planId で runtime facade を呼ぶ", async () => {
    mockRuntimeSkillCreatorService.getVerifyDetail.mockReturnValue({
      planId: "plan-verify-1",
      currentPhase: "verify",
      status: "pending",
      checks: [],
      evidenceCount: 2,
      route: {
        type: "integrated_api",
        summary: "integrated_api (default)",
      },
      reverifyEligible: true,
      delegatedGovernanceNote: "Task07",
      delegatedSessionNote: "Task08",
    });

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_GET_VERIFY_DETAIL);
    const result = await handler!(createMockEvent(), {
      planId: "  plan-verify-1  ",
    });

    expect(result).toEqual({
      success: true,
      data: expect.objectContaining({
        planId: "plan-verify-1",
        reverifyEligible: true,
      }),
    });
    expect(mockRuntimeSkillCreatorService.getVerifyDetail).toHaveBeenCalledWith(
      "plan-verify-1",
    );
  });

  it("reverifyWorkflow は facade の結果をそのまま返す", async () => {
    mockRuntimeSkillCreatorService.reverifyWorkflow.mockReturnValue({
      accepted: false,
      disabledReason: "実行結果がまだ存在しないため再検証できません。",
    });

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_REVERIFY_WORKFLOW);
    const result = await handler!(createMockEvent(), {
      planId: "plan-verify-2",
    });

    expect(result).toEqual({
      success: true,
      data: {
        accepted: false,
        disabledReason: "実行結果がまだ存在しないため再検証できません。",
      },
    });
    expect(
      mockRuntimeSkillCreatorService.reverifyWorkflow,
    ).toHaveBeenCalledWith("plan-verify-2");
  });

  // TC-5: DI 配線で ResourceLoader が生成されること（間接検証）
  it("TC-5: ResourceLoader 注入済みの facade が plan() で loadAgent を呼ぶ", async () => {
    unregisterSkillCreatorHandlers();
    handlerMap.clear();

    const mockResourceLoader = { loadAgent: vi.fn() };
    (mockResourceLoader.loadAgent as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("content-1")
      .mockResolvedValueOnce("content-2")
      .mockResolvedValueOnce("content-3");

    // Facade with both resourceLoader and llmAdapter injected
    const facadeWithDI = {
      plan: vi.fn().mockResolvedValue({
        planId: "plan-123",
        skillSpec: "spec",
        estimatedSteps: 2,
        skillName: "test-skill",
      }),
      execute: vi.fn(),
      improve: vi.fn(),
      getWorkflowStateSnapshot: vi.fn().mockReturnValue(undefined),
      submitUserInput: vi.fn(),
    };

    registerSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
      mockSkillCreatorService as never,
      facadeWithDI as unknown as RuntimeSkillCreatorFacade,
    );

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const result = await handler!(createMockEvent(), {
      prompt: "test spec",
      authMode: "api-key",
      apiKey: "sk-test",
    });

    expect(result).toEqual({
      success: true,
      data: {
        planId: "plan-123",
        skillSpec: "spec",
        estimatedSteps: 2,
        skillName: "test-skill",
      },
    });
    expect(facadeWithDI.plan).toHaveBeenCalledWith(
      "test spec",
      "api-key",
      "sk-test",
    );
  });

  // TC-6: LLMAdapterFactory.getAdapter() 失敗時の graceful degradation
  it("TC-6: LLMAdapter 未注入の facade は plan() で明示的エラーレスポンスを返す", async () => {
    unregisterSkillCreatorHandlers();
    handlerMap.clear();

    // facade without llmAdapter (simulating getAdapter failure)
    const facadeWithoutLLM = {
      plan: vi.fn().mockResolvedValue({
        success: false,
        error: "APIキーを設定してください",
        errorCode: "LLM_ADAPTER_FAILED",
        adapterStatus: "failed",
      }),
      execute: vi.fn(),
      improve: vi.fn(),
      getWorkflowStateSnapshot: vi.fn().mockReturnValue(undefined),
      submitUserInput: vi.fn(),
    };

    registerSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
      mockSkillCreatorService as never,
      facadeWithoutLLM as unknown as RuntimeSkillCreatorFacade,
    );

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const result = await handler!(createMockEvent(), {
      prompt: "spec",
      authMode: "api-key",
      apiKey: null,
    });

    expect(result).toEqual({
      success: true,
      data: {
        success: false,
        error: "APIキーを設定してください",
        errorCode: "LLM_ADAPTER_FAILED",
        adapterStatus: "failed",
      },
    });
  });

  it("runtime facade 未注入でも graceful degradation で応答する", async () => {
    unregisterSkillCreatorHandlers();
    handlerMap.clear();

    registerSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
      mockSkillCreatorService as never,
    );

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const result = await handler!(createMockEvent(), { prompt: "spec" });

    expect(result).toEqual({
      success: false,
      error: "Runtime Skill Creator は現在利用できません",
    });
  });

  it("getWorkflowState は snapshot を返す", async () => {
    mockRuntimeSkillCreatorService.getWorkflowStateSnapshot.mockReturnValue({
      planId: "plan-1",
      currentPhase: "review",
      awaitingUserInput: null,
      verifyResult: null,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-1",
        currentPhase: "review",
        artifactCount: 2,
        updatedAt: "2026-03-27T00:00:00.000Z",
      },
    });

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE);
    const result = await handler!(createMockEvent(), { planId: "plan-1" });

    expect(result.success).toBe(true);
    expect(
      mockRuntimeSkillCreatorService.getWorkflowStateSnapshot,
    ).toHaveBeenCalledWith("plan-1");
  });

  it("submitUserInput は facade を呼び state changed event を送る", async () => {
    mockRuntimeSkillCreatorService.submitUserInput.mockReturnValue({
      planId: "plan-1",
      currentPhase: "review",
      awaitingUserInput: null,
      verifyResult: null,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-1",
        currentPhase: "review",
        artifactCount: 3,
        updatedAt: "2026-03-27T00:00:00.000Z",
      },
    });

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT);
    const result = await handler!(createMockEvent(), {
      planId: "plan-1",
      requestId: "req-1",
      selectedOptionId: "ready_to_execute",
    });

    expect(result.success).toBe(true);
    expect(mockRuntimeSkillCreatorService.submitUserInput).toHaveBeenCalledWith(
      "plan-1",
      {
        planId: "plan-1",
        requestId: "req-1",
        selectedOptionId: "ready_to_execute",
      },
    );
    expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      expect.objectContaining({
        planId: "plan-1",
        currentPhase: "review",
      }),
    );
  });

  // AC-6: facade snapshot が engine の内部 state と構造的に等価
  it("submitUserInput の facade snapshot は engine snapshot をそのまま返す", async () => {
    const engineSnapshot = {
      planId: "plan-1",
      currentPhase: "execute",
      awaitingUserInput: null,
      verifyResult: null,
      phaseArtifacts: [],
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-1",
        currentPhase: "execute",
        artifactCount: 4,
        updatedAt: "2026-03-27T00:00:00.000Z",
      },
    };
    mockRuntimeSkillCreatorService.submitUserInput.mockReturnValue(
      engineSnapshot,
    );

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT);
    const result = await handler!(createMockEvent(), {
      planId: "plan-1",
      requestId: "req-2",
      selectedOptionId: "ready_to_execute",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(engineSnapshot);
  });

  // AC-7: IPC handler が state-changed event で遷移後 snapshot を送信する
  it("submitUserInput 後の state-changed event は遷移後の snapshot を含む", async () => {
    const transitionedSnapshot = {
      planId: "plan-1",
      currentPhase: "execute",
      awaitingUserInput: null,
      verifyResult: null,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-1",
        currentPhase: "execute",
        artifactCount: 5,
        updatedAt: "2026-03-27T00:00:00.000Z",
      },
    };
    mockRuntimeSkillCreatorService.submitUserInput.mockReturnValue(
      transitionedSnapshot,
    );

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT);
    await handler!(createMockEvent(), {
      planId: "plan-1",
      requestId: "req-3",
      selectedOptionId: "ready_to_execute",
    });

    expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      expect.objectContaining({
        currentPhase: "execute",
      }),
    );
  });
});
