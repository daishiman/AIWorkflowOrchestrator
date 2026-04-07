/**
 * Session Resume IPC Handler Tests (TASK-P0-08)
 */
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

describe("creatorHandlers - Session Resume (TASK-P0-08)", () => {
  const mockSnapshot = {
    planId: "plan-abc-123",
    currentPhase: "review",
    awaitingUserInput: null,
    verifyResult: null,
    resumeTokenEnvelope: {
      version: "task-sdk-02-v1",
      planId: "plan-abc-123",
      currentPhase: "review",
      artifactCount: 0,
      updatedAt: new Date().toISOString(),
    },
  };

  const mockSessions = [
    {
      checkpointId: "cp-001",
      planId: "plan-abc-123",
      checkpointType: "review-ready",
      currentPhase: "review",
      createdAt: Date.now() - 3_600_000,
      updatedAt: Date.now() - 1_800_000,
      compatibility: { status: "compatible", reasons: [], warnings: [] },
    },
  ];

  const mockRuntimeSkillCreatorService = {
    plan: vi.fn(),
    execute: vi.fn(),
    improve: vi.fn(),
    applyImprovement: vi.fn(),
    getWorkflowStateSnapshot: vi.fn().mockReturnValue(undefined),
    submitUserInput: vi.fn(),
    getVerifyDetail: vi.fn(),
    reverifyWorkflow: vi.fn(),
    normalizeSdkStream: vi.fn(),
    listSessions: vi.fn().mockReturnValue(mockSessions),
    getSessionDetail: vi.fn().mockReturnValue(mockSnapshot),
    resumeSession: vi.fn().mockReturnValue(mockSnapshot),
    resumeSessionWithResult: vi.fn().mockReturnValue({
      success: true,
      workflowSnapshot: mockSnapshot,
    }),
    deleteSession: vi.fn(),
    cleanupExpiredSessions: vi.fn().mockReturnValue(2),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();
    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      createMockMainWindow(),
    );
    registerRuntimeSkillCreatorHandlers(
      createMockMainWindow() as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as never,
    );
  });

  afterEach(() => {
    unregisterRuntimeSkillCreatorHandlers();
  });

  // AC-8: IPC 経由でセッション一覧取得
  describe("SKILL_CREATOR_LIST_SESSIONS", () => {
    it("セッション一覧を取得できる", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS);
      expect(handler).toBeDefined();

      const result = await handler?.(createMockEvent());
      expect(result).toEqual({
        success: true,
        data: mockSessions,
      });
      expect(mockRuntimeSkillCreatorService.listSessions).toHaveBeenCalledTimes(
        1,
      );
    });

    it("Facade 未初期化時はエラーを返す", async () => {
      handlerMap.clear();
      registerRuntimeSkillCreatorHandlers(
        createMockMainWindow() as unknown as BrowserWindowType,
      );

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS);
      const result = await handler?.(createMockEvent());
      expect(result).toEqual({
        success: false,
        error: "Runtime Skill Creator は現在利用できません",
      });
    });
  });

  // AC-8: IPC 経由でセッション詳細取得
  describe("SKILL_CREATOR_GET_SESSION_DETAIL", () => {
    it("セッション詳細を取得できる", async () => {
      const handler = handlerMap.get(
        IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL,
      );
      const result = await handler?.(createMockEvent(), {
        checkpointId: "cp-001",
      });
      expect(result).toEqual({
        success: true,
        data: mockSnapshot,
      });
    });

    it("checkpointId が空の場合はバリデーションエラー", async () => {
      const handler = handlerMap.get(
        IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL,
      );
      const result = await handler?.(createMockEvent(), {
        checkpointId: "",
      });
      expect(result).toEqual({
        success: false,
        error: "checkpointId が指定されていません",
      });
    });

    it("セッションが見つからない場合はエラー", async () => {
      mockRuntimeSkillCreatorService.getSessionDetail.mockReturnValueOnce(
        undefined,
      );
      const handler = handlerMap.get(
        IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL,
      );
      const result = await handler?.(createMockEvent(), {
        checkpointId: "cp-not-found",
      });
      expect(result).toEqual({
        success: false,
        error: "セッションが見つかりません",
      });
    });
  });

  // AC-2: セッション復元
  describe("SKILL_CREATOR_RESUME_SESSION", () => {
    it("セッションを復元できる", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION);
      const result = await handler?.(createMockEvent(), {
        checkpointId: "cp-001",
      });
      expect(result).toEqual({
        success: true,
        workflowSnapshot: mockSnapshot,
      });
      expect(
        mockRuntimeSkillCreatorService.resumeSessionWithResult,
      ).toHaveBeenCalledWith("cp-001");
    });

    it("復元失敗時はエラーを返す", async () => {
      mockRuntimeSkillCreatorService.resumeSessionWithResult.mockReturnValueOnce(
        { success: false, errorReason: "incompatible" },
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION);
      const result = await handler?.(createMockEvent(), {
        checkpointId: "cp-incompatible",
      });
      expect(result).toEqual({
        success: false,
        error: "セッションが現在の環境と互換性がありません",
        errorReason: "incompatible",
      });
    });

    it("checkpointId が空の場合はバリデーションエラー", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION);
      const result = await handler?.(createMockEvent(), {
        checkpointId: "  ",
      });
      expect(result).toEqual({
        success: false,
        error: "checkpointId が指定されていません",
      });
    });

    it("復元成功時に workflowStateChanged イベントが emit される", async () => {
      const mainWindow = createMockMainWindow();
      handlerMap.clear();
      registerRuntimeSkillCreatorHandlers(
        mainWindow as unknown as BrowserWindowType,
        mockRuntimeSkillCreatorService as never,
      );

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION);
      await handler?.(createMockEvent(), { checkpointId: "cp-001" });
      expect(mainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
        mockSnapshot,
      );
    });
  });

  // セッション削除
  describe("SKILL_CREATOR_DELETE_SESSION", () => {
    it("セッションを削除できる", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION);
      const result = await handler?.(createMockEvent(), {
        checkpointId: "cp-001",
      });
      expect(result).toEqual({
        success: true,
      });
      expect(mockRuntimeSkillCreatorService.deleteSession).toHaveBeenCalledWith(
        "cp-001",
      );
    });

    it("checkpointId が空の場合はバリデーションエラー", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION);
      await expect(
        handler?.(createMockEvent(), {
          checkpointId: "",
        }),
      ).resolves.toEqual({
        success: false,
        error: "checkpointId が指定されていません",
      });
    });
  });

  // 期限切れセッション削除
  describe("SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS", () => {
    it("期限切れセッションを削除できる", async () => {
      const handler = handlerMap.get(
        IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS,
      );
      const result = await handler?.(createMockEvent());
      expect(result).toBe(2);
      expect(
        mockRuntimeSkillCreatorService.cleanupExpiredSessions,
      ).toHaveBeenCalledTimes(1);
    });
  });

  // チャネル登録確認
  it("セッション復元用の5チャネルが登録されている", () => {
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS)).toBe(true);
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL)).toBe(
      true,
    );
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION)).toBe(
      true,
    );
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION)).toBe(
      true,
    );
    expect(
      handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS),
    ).toBe(true);
  });
});
