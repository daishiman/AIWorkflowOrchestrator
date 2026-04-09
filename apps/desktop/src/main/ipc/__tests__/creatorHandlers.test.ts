import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  BrowserWindow as BrowserWindowType,
  IpcMainInvokeEvent,
} from "electron";
import type { RuntimeSkillCreatorFacade } from "../services/runtime/RuntimeSkillCreatorFacade";

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
import type {
  SkillCreatorWorkflowUiSnapshot,
  SkillOutputReadyPayload,
} from "@repo/shared/types";
import { IPC_CHANNELS } from "../../../preload/channels";
import type { RuntimeSkillCreatorFacade } from "../services/runtime/RuntimeSkillCreatorFacade";
import type { SkillCreatorOutputHandler } from "../services/runtime/SkillCreatorOutputHandler";
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
    executeAsync: vi.fn().mockResolvedValue(undefined),
    verify: vi.fn(),
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

    expect(handlerMap.size).toBe(19);

    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const result = await handler?.(createMockEvent(), { prompt: "spec" });

    expect(result).toEqual({
      success: false,
      error: "Runtime Skill Creator は現在利用できません",
    });
  });

  it("17 つの public runtime チャンネルを登録する", () => {
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
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_VERIFY)).toBe(true);
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
    expect(handlerMap.size).toBe(19);
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

  it("execute ハンドラが fire-and-forget で planId を trim して executeAsync を呼ぶ", async () => {
    mockRuntimeSkillCreatorService.executeAsync.mockResolvedValue(undefined);
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

    expect(mockRuntimeSkillCreatorService.executeAsync).toHaveBeenCalledWith(
      "plan-001",
      expect.any(Object),
    );
    expect(result).toEqual({ accepted: true, planId: "plan-001" });
  });

  it("runtime facade の errorMessage 付き snapshot を state-changed event として送る", () => {
    const mainWindow = createMockMainWindow() as unknown as BrowserWindowType;
    registerRuntimeSkillCreatorHandlers(
      mainWindow,
      mockRuntimeSkillCreatorService as never,
    );

    const runtimeService =
      mockRuntimeSkillCreatorService as RuntimeSkillCreatorFacade & {
        onWorkflowStateSnapshot?: (
          planId: string,
          snapshot: SkillCreatorWorkflowUiSnapshot | null,
          errorMessage?: string,
        ) => void;
      };
    const snapshot = {
      planId: "plan-error",
      currentPhase: "review",
      awaitingUserInput: null,
      verifyResult: null,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-error",
        currentPhase: "review",
        artifactCount: 2,
        updatedAt: "2026-04-06T00:00:00.000Z",
      },
    } as SkillCreatorWorkflowUiSnapshot;

    runtimeService.onWorkflowStateSnapshot?.(
      "plan-error",
      snapshot,
      "API key is invalid",
    );

    expect(mainWindow.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      snapshot,
      "API key is invalid",
    );
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
    expect(mockRuntimeSkillCreatorService.executeAsync).not.toHaveBeenCalled();
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

  it("unregister が 19 チャンネルを解除する", () => {
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );
    expect(handlerMap.size).toBe(19);

    unregisterRuntimeSkillCreatorHandlers();

    expect(handlerMap.size).toBe(0);
  });

  // ── T-03: CONFIGURE_API チャンネル移管確認 ──────────────────
  it("T-03: CONFIGURE_API ハンドラーが creatorHandlers に登録されている", () => {
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    expect(handlerMap.has(IPC_CHANNELS.CONFIGURE_API)).toBe(true);
  });

  it("T-03b: CONFIGURE_API を Runtime IPC モードで invoke すると非対応エラーを返す", async () => {
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    const handler = handlerMap.get(IPC_CHANNELS.CONFIGURE_API);
    const config = {
      name: "Test API",
      url: "https://api.example.com",
      method: "GET" as const,
      authType: "none" as const,
    };
    const result = await handler?.(createMockEvent(), config);

    expect(result).toEqual(expect.objectContaining({ success: false }));
  });

  // ── T-04: IPC_CHANNELS.SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED チャンネル移管確認 ────
  it("T-04: IPC_CHANNELS.SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED ハンドラーが creatorHandlers に登録されている", () => {
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );

    expect(
      handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED),
    ).toBe(true);
  });

  it("T-04b: OVERWRITE_APPROVED を outputHandler 付きで invoke すると handleOverwriteApproved が呼ばれる", async () => {
    const mockOutputHandler: Partial<SkillCreatorOutputHandler> = {
      handleOverwriteApproved: vi.fn().mockResolvedValue(undefined),
    };

    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
      mockOutputHandler as SkillCreatorOutputHandler,
    );

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED,
    );
    const payload: SkillOutputReadyPayload = {
      skillName: "test-skill",
      savedPath: "/project/.claude/skills/test-skill/SKILL.md",
      content: "name: test-skill",
      requiresOverwriteConfirm: true,
    };

    const result = await handler?.(createMockEvent(), payload);

    expect(result).toEqual({ success: true });
    expect(mockOutputHandler.handleOverwriteApproved).toHaveBeenCalledWith(
      payload,
    );
  });
});
