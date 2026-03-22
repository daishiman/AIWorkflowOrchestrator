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
});
