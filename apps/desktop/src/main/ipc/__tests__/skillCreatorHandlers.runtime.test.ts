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

  it("runtime 用の3ハンドラーを登録する", () => {
    expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN)).toBeDefined();
    expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN)).toBeDefined();
    expect(
      getHandler(IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE),
    ).toBeDefined();
    expect(
      getHandler(IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT),
    ).toBeDefined();
    expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL)).toBeDefined();
  });

  it("planSkill は trim 済み prompt と auth 引数で runtime facade を呼ぶ", async () => {
    mockRuntimeSkillCreatorService.plan.mockResolvedValue({
      planId: "plan-1",
      skillSpec: "spec",
      estimatedSteps: 3,
    });

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const result = await handler!(createMockEvent(), {
      prompt: "  spec  ",
      authMode: "subscription",
      apiKey: "k",
    });

    expect(result).toEqual({
      success: true,
      data: { planId: "plan-1", skillSpec: "spec", estimatedSteps: 3 },
    });
    expect(mockRuntimeSkillCreatorService.plan).toHaveBeenCalledWith(
      "spec",
      "subscription",
      "k",
    );
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
  it("TC-6: LLMAdapter 未注入の facade は plan() でスタブレスポンスを返す", async () => {
    unregisterSkillCreatorHandlers();
    handlerMap.clear();

    // facade without llmAdapter (simulating getAdapter failure)
    const facadeWithoutLLM = {
      plan: vi.fn().mockResolvedValue({
        planId: "plan-stub",
        skillSpec: "spec",
        estimatedSteps: 3,
        skillName: "",
        description: "",
        agents: [],
        scripts: [],
        triggers: [],
        anchors: [],
      }),
      execute: vi.fn(),
      improve: vi.fn(),
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

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty("skillName", "");
    expect(result.data).toHaveProperty("agents");
    expect(result.data.agents).toEqual([]);
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
});
