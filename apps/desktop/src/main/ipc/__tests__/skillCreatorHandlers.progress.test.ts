/**
 * SkillCreator IPC Handlers - 進捗通知テスト
 * TASK-SW-STREAM-002: onProgress → sendSkillCreatorProgress IPC 接続
 *
 * TC-01: createSkill が onProgress コールバック付きで呼ばれること
 * TC-02: onProgress が呼ばれると SKILL_CREATOR_PROGRESS チャンネルで webContents.send が呼ばれること
 * TC-03: 進捗データ（phase/percentage/message）が正しく渡されること
 * TC-04: ウィンドウが destroyed の場合は send が呼ばれないこと
 * TC-05: sendSkillCreatorProgress 関数が export されていること
 * TC-06: sendSkillCreatorProgress がウィンドウ未 destroyed 時に send を呼ぶこと
 * TC-07: sendSkillCreatorProgress がウィンドウ destroyed 時に send を呼ばないこと
 * TC-08: createSkill の onProgress コールバックが sendSkillCreatorProgress に接続されていること
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { IpcMainInvokeEvent } from "electron";

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

import { BrowserWindow } from "electron";
import {
  registerSkillCreatorHandlers,
  unregisterSkillCreatorHandlers,
  sendSkillCreatorProgress,
} from "../skillCreatorHandlers";
import { IPC_CHANNELS } from "../../../preload/channels";

// テスト用ウィンドウファクトリ
function createMockWindow(isDestroyed = false) {
  return {
    id: 1,
    isDestroyed: vi.fn(() => isDestroyed),
    webContents: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
      send: vi.fn(),
    },
  } as unknown as import("electron").BrowserWindow;
}

function createMockEvent(): IpcMainInvokeEvent {
  return {
    sender: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

describe("SkillCreator IPC - 進捗通知 (TASK-SW-STREAM-002)", () => {
  let mainWindow: ReturnType<typeof createMockWindow>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();
    mainWindow = createMockWindow();
    // validateIpcSender が BrowserWindow.fromWebContents でウィンドウを特定するためにモック必須
    vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
      mainWindow as unknown as import("electron").BrowserWindow,
    );
    registerSkillCreatorHandlers(mainWindow, mockSkillCreatorService as any);
  });

  afterEach(() => {
    unregisterSkillCreatorHandlers();
  });

  it("TC-01: createSkill が onProgress コールバック付きで呼ばれること", async () => {
    // Arrange
    mockSkillCreatorService.createSkill.mockResolvedValue(
      "/path/to/test-skill",
    );
    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_CREATE);
    const event = createMockEvent();

    // Act
    await handler!(event, {
      name: "test-skill",
      description: "テスト",
      mode: "create",
    });

    // Assert: createSkill が呼ばれ、第2引数が関数（onProgress コールバック）であること
    expect(mockSkillCreatorService.createSkill).toHaveBeenCalledWith(
      expect.objectContaining({ name: "test-skill" }),
      expect.any(Function),
    );
  });

  it("TC-02: onProgress が呼ばれると SKILL_CREATOR_PROGRESS チャンネルで webContents.send が呼ばれること", async () => {
    // Arrange
    let capturedCallback: ((progress: unknown) => void) | undefined;
    mockSkillCreatorService.createSkill.mockImplementation(
      async (_opts: unknown, onProgress: (p: unknown) => void) => {
        capturedCallback = onProgress;
        return "/path/to/skill";
      },
    );
    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_CREATE);
    const event = createMockEvent();

    // Act
    await handler!(event, {
      name: "test-skill",
      description: "テスト",
      mode: "create",
    });

    // capturedCallback を手動で呼び出す
    const progressData = {
      phase: "planning",
      percentage: 10,
      message: "構造を計画しています",
    };
    capturedCallback?.(progressData);

    // Assert
    expect(mainWindow.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
      progressData,
    );
  });

  it("TC-03: 進捗データ（phase/percentage/message）が正しく渡されること", async () => {
    // Arrange
    let capturedCallback: ((progress: unknown) => void) | undefined;
    mockSkillCreatorService.createSkill.mockImplementation(
      async (_opts: unknown, onProgress: (p: unknown) => void) => {
        capturedCallback = onProgress;
        return "/path/to/skill";
      },
    );
    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_CREATE);
    const event = createMockEvent();
    await handler!(event, {
      name: "test-skill",
      description: "テスト",
      mode: "create",
    });

    const progressData = {
      phase: "generating-skill",
      percentage: 40,
      message: "SKILL.md を生成しています",
    };
    capturedCallback?.(progressData);

    // Assert: 渡されたデータがそのまま送られること
    expect(mainWindow.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
      expect.objectContaining({
        phase: "generating-skill",
        percentage: 40,
        message: "SKILL.md を生成しています",
      }),
    );
  });

  it("TC-04: ウィンドウが destroyed の場合は send が呼ばれないこと", () => {
    // Arrange: destroyed なウィンドウ
    const destroyedWindow = createMockWindow(true);
    const progressData = {
      phase: "planning",
      percentage: 10,
      message: "テスト",
    };

    // Act
    sendSkillCreatorProgress(destroyedWindow, progressData);

    // Assert
    expect(destroyedWindow.webContents.send).not.toHaveBeenCalled();
  });

  it("TC-05: sendSkillCreatorProgress 関数が export されていること", () => {
    expect(typeof sendSkillCreatorProgress).toBe("function");
  });

  it("TC-06: sendSkillCreatorProgress がウィンドウ未 destroyed 時に send を呼ぶこと", () => {
    // Arrange
    const progressData = {
      phase: "done",
      percentage: 100,
      message: "完了しました",
    };

    // Act
    sendSkillCreatorProgress(mainWindow, progressData);

    // Assert
    expect(mainWindow.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
      progressData,
    );
  });

  it("TC-07: sendSkillCreatorProgress がウィンドウ destroyed 時に send を呼ばないこと", () => {
    const destroyedWindow = createMockWindow(true);
    sendSkillCreatorProgress(destroyedWindow, {
      phase: "done",
      percentage: 100,
      message: "完了",
    });
    expect(destroyedWindow.webContents.send).not.toHaveBeenCalled();
  });

  it("TC-08: SKILL_CREATOR_CREATE ハンドラーの onProgress が sendSkillCreatorProgress に接続されていること", async () => {
    // Arrange: 複数回 onProgress が呼ばれるモック
    mockSkillCreatorService.createSkill.mockImplementation(
      async (_opts: unknown, onProgress: (p: unknown) => void) => {
        onProgress({ phase: "planning", percentage: 10, message: "計画中" });
        onProgress({ phase: "done", percentage: 100, message: "完了" });
        return "/path/to/skill";
      },
    );
    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_CREATE);
    const event = createMockEvent();

    // Act
    await handler!(event, {
      name: "test-skill",
      description: "テスト",
      mode: "create",
    });

    // Assert: 2 回 send が呼ばれること
    expect(mainWindow.webContents.send).toHaveBeenCalledTimes(2);
    expect(mainWindow.webContents.send).toHaveBeenNthCalledWith(
      1,
      IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
      { phase: "planning", percentage: 10, message: "計画中" },
    );
    expect(mainWindow.webContents.send).toHaveBeenNthCalledWith(
      2,
      IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
      { phase: "done", percentage: 100, message: "完了" },
    );
  });
});
