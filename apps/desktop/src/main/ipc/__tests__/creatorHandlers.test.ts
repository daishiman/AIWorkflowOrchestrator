import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  BrowserWindow as BrowserWindowType,
  IpcMainInvokeEvent,
} from "electron";

const handlerMap = new Map<string, (...args: unknown[]) => unknown>();

vi.mock("electron", () => ({
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
  BrowserWindow: {
    fromWebContents: vi.fn(),
    getAllWindows: vi.fn(() => []),
  },
}));

import { BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import {
  registerRuntimeSkillCreatorHandlers,
  unregisterRuntimeSkillCreatorHandlers,
} from "../creatorHandlers";

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

describe("creatorHandlers", () => {
  const mockRuntimeSkillCreatorService = {
    plan: vi.fn(),
    execute: vi.fn(),
    improve: vi.fn(),
    applyImprovement: vi.fn(),
    getWorkflowStateSnapshot: vi.fn().mockReturnValue(undefined),
    submitUserInput: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();
    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      createMockMainWindow(),
    );
  });

  afterEach(() => {
    unregisterRuntimeSkillCreatorHandlers();
  });

  it("runtime service がない場合でも graceful degradation 用ハンドラを登録する", async () => {
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
    );

    expect(handlerMap.size).toBe(14);

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const result = await handler?.(createMockEvent(), { prompt: "spec" });

    expect(result).toEqual({
      success: false,
      error: "Runtime Skill Creator は現在利用できません",
    });
  });

  it("14 つの public runtime チャンネルを登録する", () => {
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_PLAN)).toBe(true);
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN)).toBe(true);
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE)).toBe(
      true,
    );
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT)).toBe(
      true,
    );
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL)).toBe(true);
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT)).toBe(
      true,
    );
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_GET_VERIFY_DETAIL)).toBe(
      true,
    );
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_REVERIFY_WORKFLOW)).toBe(
      true,
    );
    expect(
      handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_NORMALIZE_SDK_MESSAGES),
    ).toBe(true);
    expect(handlerMap.size).toBe(14);
  });

  it("plan ハンドラが trim 済み prompt と既定 auth を渡す", async () => {
    mockRuntimeSkillCreatorService.plan.mockResolvedValue({
      planId: "plan-001",
      skillSpec: "spec",
      estimatedSteps: 3,
    });
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const result = await handler?.(createMockEvent(), {
      prompt: "  spec  ",
    });

    expect(mockRuntimeSkillCreatorService.plan).toHaveBeenCalledWith(
      "spec",
      "api-key",
      null,
    );
    expect(result).toEqual({
      success: true,
      data: {
        planId: "plan-001",
        skillSpec: "spec",
        estimatedSteps: 3,
      },
    });
  });

  it("plan ハンドラは空白 prompt を拒否する", async () => {
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const result = await handler?.(createMockEvent(), {
      prompt: "   ",
    });

    expect(result).toEqual({
      success: false,
      error: "プロンプトが指定されていません",
    });
    expect(mockRuntimeSkillCreatorService.plan).not.toHaveBeenCalled();
  });

  it("execute ハンドラが planId と skillSpec を trim して委譲する", async () => {
    mockRuntimeSkillCreatorService.execute.mockResolvedValue({
      executeId: "exec-001",
      skillName: "my-skill",
      success: true,
    });
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN);
    const result = await handler?.(createMockEvent(), {
      planId: "  plan-001  ",
      skillSpec: "  my-skill\nbody  ",
      authMode: "subscription",
      apiKey: null,
    });

    expect(mockRuntimeSkillCreatorService.execute).toHaveBeenCalledWith(
      {
        planId: "plan-001",
        skillSpec: "my-skill\nbody",
        estimatedSteps: 3,
        skillName: "",
        description: "",
        agents: [],
        scripts: [],
        triggers: [],
        anchors: [],
      },
      "subscription",
      null,
    );
    expect(result).toEqual({
      success: true,
      data: {
        executeId: "exec-001",
        skillName: "my-skill",
        success: true,
      },
    });
  });

  it("improve ハンドラが feedback を伴って委譲する", async () => {
    mockRuntimeSkillCreatorService.improve.mockResolvedValue({
      improveId: "improve-001",
      suggestions: ["入力を整理する"],
    });
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL);
    const result = await handler?.(createMockEvent(), {
      skillName: "  my-skill  ",
      feedback: "  improve it  ",
    });

    expect(mockRuntimeSkillCreatorService.improve).toHaveBeenCalledWith(
      "my-skill",
      "improve it",
      "api-key",
      null,
    );
    expect(result).toEqual({
      success: true,
      data: {
        improveId: "improve-001",
        suggestions: ["入力を整理する"],
      },
    });
  });

  it("エラー時はサニタイズ済み文字列を返す", async () => {
    mockRuntimeSkillCreatorService.plan.mockRejectedValue(
      new Error("failed at /Users/dm/private token=secret"),
    );
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const result = (await handler?.(createMockEvent(), {
      prompt: "spec",
    })) as { success: boolean; error: string };

    expect(result.success).toBe(false);
    expect(result.error).not.toContain("/Users/dm/private");
    expect(result.error).not.toContain("secret");
  });

  it("不正 sender は toIPCValidationError 経由で reject される", async () => {
    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      null,
    );
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    await expect(
      handler?.(createMockEvent(999), { prompt: "spec" }),
    ).rejects.toBeDefined();
  });

  it("execute ハンドラは空白 planId を拒否する", async () => {
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN);
    const result = await handler?.(createMockEvent(), {
      planId: "   ",
      skillSpec: "spec",
    });

    expect(result).toEqual({
      success: false,
      error: "planId が指定されていません",
    });
    expect(mockRuntimeSkillCreatorService.execute).not.toHaveBeenCalled();
  });

  it("improve ハンドラは空白 skillName を拒否する", async () => {
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL);
    const result = await handler?.(createMockEvent(), {
      skillName: "",
      feedback: "some feedback",
    });

    expect(result).toEqual({
      success: false,
      error: "skillName が指定されていません",
    });
    expect(mockRuntimeSkillCreatorService.improve).not.toHaveBeenCalled();
  });

  it("improve ハンドラは空白 feedback を拒否する", async () => {
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL);
    const result = await handler?.(createMockEvent(), {
      skillName: "my-skill",
      feedback: "   ",
    });

    expect(result).toEqual({
      success: false,
      error: "feedback が指定されていません",
    });
    expect(mockRuntimeSkillCreatorService.improve).not.toHaveBeenCalled();
  });

  it("authMode 省略時は既定値 api-key が渡される", async () => {
    mockRuntimeSkillCreatorService.improve.mockResolvedValue({
      improveId: "i-1",
      suggestions: [],
    });
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL);
    await handler?.(createMockEvent(), {
      skillName: "skill",
      feedback: "fb",
    });

    expect(mockRuntimeSkillCreatorService.improve).toHaveBeenCalledWith(
      "skill",
      "fb",
      "api-key",
      null,
    );
  });

  it("非 Error オブジェクトの例外にはフォールバックメッセージを返す", async () => {
    mockRuntimeSkillCreatorService.plan.mockRejectedValue("string error");
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const result = (await handler?.(createMockEvent(), {
      prompt: "spec",
    })) as { success: boolean; error: string };

    expect(result.success).toBe(false);
    expect(result.error).toBe("Runtime plan の実行に失敗しました");
  });

  it("runtime service 未注入時は execute-plan も degraded response を返す", async () => {
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
    );

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN);
    const result = await handler?.(createMockEvent(), {
      planId: "plan-1",
      skillSpec: "spec",
    });

    expect(result).toEqual({
      success: false,
      error: "Runtime Skill Creator は現在利用できません",
    });
  });

  it("runtime service 未注入時は improve-skill も degraded response を返す", async () => {
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
    );

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL);
    const result = await handler?.(createMockEvent(), {
      skillName: "skill",
      feedback: "fb",
    });

    expect(result).toEqual({
      success: false,
      error: "Runtime Skill Creator は現在利用できません",
    });
  });

  it("unregister が 14 チャンネルを解除する", () => {
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );
    expect(handlerMap.size).toBe(14);

    unregisterRuntimeSkillCreatorHandlers();

    expect(handlerMap.size).toBe(0);
  });
});
