import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  BrowserWindow as BrowserWindowType,
  IpcMainInvokeEvent,
} from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import type { RuntimeSkillCreatorFacade } from "../../services/runtime/RuntimeSkillCreatorFacade";

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

vi.mock(
  "../../infrastructure/security/ipc-validator",
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import("../../infrastructure/security/ipc-validator")
      >();
    return {
      ...original,
      validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
    };
  },
);

vi.mock("../sanitizeErrorMessage", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../sanitizeErrorMessage")>();
  return {
    ...original,
    sanitizeErrorMessage: vi.fn(original.sanitizeErrorMessage),
  };
});

import { BrowserWindow } from "electron";
import {
  registerRuntimeSkillCreatorHandlers,
  unregisterRuntimeSkillCreatorHandlers,
} from "../creatorHandlers";
import { validateIpcSender } from "../../infrastructure/security/ipc-validator";
import { sanitizeErrorMessage } from "../sanitizeErrorMessage";

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

function createVerifyResult() {
  return {
    skillName: "test-skill",
    passed: false,
    checkResults: [
      {
        checkId: "L1-001",
        label: "SKILL.md exists",
        passed: true,
        message: "path: /tmp/test-skill/SKILL.md",
      },
      {
        checkId: "L1-002",
        label: "agents/ directory is missing",
        passed: false,
        message: "path: /tmp/test-skill/agents",
      },
    ],
    summary: "1件の検証チェックで警告またはエラーが見つかりました",
  };
}

describe("skill-creator:verify ハンドラ", () => {
  let mockMainWindow: ReturnType<typeof createMockMainWindow>;

  const mockRuntimeSkillCreatorService = {
    verify: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();

    mockMainWindow = createMockMainWindow();
    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      mockMainWindow,
    );

    vi.mocked(validateIpcSender).mockReturnValue({ valid: true });

    registerRuntimeSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as unknown as RuntimeSkillCreatorFacade,
    );
  });

  afterEach(() => {
    unregisterRuntimeSkillCreatorHandlers();
  });

  function getHandler() {
    return handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_VERIFY);
  }

  it("正常系: verify 成功時に success=true で VerifyResult を返す", async () => {
    const verifyResult = createVerifyResult();
    mockRuntimeSkillCreatorService.verify.mockResolvedValue(verifyResult);

    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "  test-skill  ",
      authMode: "subscription",
      apiKey: "api-key-123",
    });

    expect(result).toEqual({
      success: true,
      data: verifyResult,
    });
    expect(mockRuntimeSkillCreatorService.verify).toHaveBeenCalledWith(
      "test-skill",
      "subscription",
      "api-key-123",
    );
  });

  it("バリデーション: skillName が空白のみの場合はエラー", async () => {
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "   ",
    });

    expect(result).toEqual({
      success: false,
      error: "skillName が指定されていません",
    });
    expect(mockRuntimeSkillCreatorService.verify).not.toHaveBeenCalled();
  });

  it("runtimeSkillCreatorService が未注入の場合は利用不可エラー", async () => {
    unregisterRuntimeSkillCreatorHandlers();
    handlerMap.clear();

    registerRuntimeSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
    );

    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "test-skill",
    });

    expect(result).toEqual({
      success: false,
      error: "Runtime Skill Creator は現在利用できません",
    });
  });

  it("異常系: facade.verify 例外時に sanitize されたエラーを返す", async () => {
    vi.mocked(sanitizeErrorMessage).mockReturnValue(
      "サニタイズ済み verify エラー",
    );
    mockRuntimeSkillCreatorService.verify.mockRejectedValue(
      new Error("verify failed"),
    );

    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "test-skill",
    });

    expect(result).toEqual({
      success: false,
      error: "サニタイズ済み verify エラー",
    });
    expect(sanitizeErrorMessage).toHaveBeenCalledWith(
      expect.any(Error),
      "verify の実行に失敗しました",
    );
  });

  it("セキュリティ: validateIpcSender が失敗した場合は例外が送出される", async () => {
    vi.mocked(validateIpcSender).mockReturnValueOnce({
      valid: false,
      errorCode: "IPC_UNAUTHORIZED",
      errorMessage: "unauthorized sender",
    });

    const handler = getHandler();
    await expect(
      handler!(createMockEvent(), {
        skillName: "test-skill",
      }),
    ).rejects.toThrow();
  });

  it("unregisterRuntimeSkillCreatorHandlers で verify ハンドラが解除される", () => {
    expect(getHandler()).toBeDefined();

    unregisterRuntimeSkillCreatorHandlers();

    expect(getHandler()).toBeUndefined();
  });
});
