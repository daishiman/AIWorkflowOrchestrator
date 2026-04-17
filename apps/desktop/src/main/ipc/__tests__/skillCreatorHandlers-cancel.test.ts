/**
 * SkillCreator IPC Handlers - キャンセルハンドラー テスト
 * TASK-SW-CANCEL-003: SKILL_CREATOR_CANCEL IPC ハンドラー
 *
 * TC-05: SKILL_CREATOR_CANCEL ハンドラーが登録されること
 * TC-06: SKILL_CREATOR_CANCEL ハンドラーが cancelCurrentOperation() を呼ぶこと
 * TC-07: unregisterSkillCreatorHandlers() が SKILL_CREATOR_CANCEL ハンドラーを解除すること
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// handlerMap: テストから登録済みハンドラーを呼び出すためのマップ
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

// SkillCreatorService のモック
const mockSkillCreatorService = {
  detectMode: vi.fn(),
  createSkill: vi.fn(),
  executeTasks: vi.fn(),
  validateSkill: vi.fn(),
  validateWithSchema: vi.fn(),
  cancelCurrentOperation: vi.fn(),
  improveSkill: vi.fn(),
  forkSkill: vi.fn(),
  shareSkill: vi.fn(),
  scheduleSkill: vi.fn(),
  debugSkill: vi.fn(),
  generateDocs: vi.fn(),
  getStats: vi.fn(),
};

vi.mock("../../services/skill/SkillCreatorService", () => ({
  SkillCreatorService: vi.fn(() => mockSkillCreatorService),
}));

import { ipcMain, BrowserWindow } from "electron";
import {
  registerSkillCreatorHandlers,
  unregisterSkillCreatorHandlers,
} from "../skillCreatorHandlers";
import { IPC_CHANNELS } from "../../../preload/channels";

function createMockWindow() {
  return {
    id: 1,
    isDestroyed: vi.fn(() => false),
    webContents: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
      send: vi.fn(),
    },
  } as unknown as import("electron").BrowserWindow;
}

function createMockEvent(): import("electron").IpcMainInvokeEvent {
  return {
    sender: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as import("electron").IpcMainInvokeEvent;
}

describe("SkillCreator IPC - キャンセルハンドラー (TASK-SW-CANCEL-003)", () => {
  let mainWindow: ReturnType<typeof createMockWindow>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();
    mainWindow = createMockWindow();
    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      mainWindow,
    );
  });

  afterEach(() => {
    unregisterSkillCreatorHandlers();
  });

  it("TC-05: registerSkillCreatorHandlers() が SKILL_CREATOR_CANCEL ハンドラーを登録すること", () => {
    // Act
    registerSkillCreatorHandlers(mainWindow, mockSkillCreatorService as any);

    // Assert
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_CANCEL)).toBe(true);
  });

  it("TC-06: SKILL_CREATOR_CANCEL ハンドラーが cancelCurrentOperation() を呼ぶこと", async () => {
    // Arrange
    registerSkillCreatorHandlers(mainWindow, mockSkillCreatorService as any);
    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_CANCEL);

    // Act
    const result = await handler!(createMockEvent());

    // Assert
    expect(
      mockSkillCreatorService.cancelCurrentOperation,
    ).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });

  it("TC-07: unregisterSkillCreatorHandlers() が SKILL_CREATOR_CANCEL ハンドラーを解除すること", () => {
    // Arrange
    registerSkillCreatorHandlers(mainWindow, mockSkillCreatorService as any);
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_CANCEL)).toBe(true);

    // Act
    unregisterSkillCreatorHandlers();

    // Assert: removeHandler が SKILL_CREATOR_CANCEL チャンネルで呼ばれること
    expect(vi.mocked(ipcMain.removeHandler)).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_CANCEL,
    );
  });
});
