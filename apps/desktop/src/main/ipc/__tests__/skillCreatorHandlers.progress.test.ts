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
import type {
  IpcMainInvokeEvent,
  BrowserWindow as BrowserWindowType,
} from "electron";

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

function createMockEvent(webContentsId = 1): IpcMainInvokeEvent {
  return {
    sender: {
      id: webContentsId,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

// ヘルパー: createSkill ハンドラー取得
function getCreateHandler() {
  return handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_CREATE);
}

// 有効な createSkill 引数
const validCreateArgs = {
  name: "test-skill",
  description: "テスト用スキル",
  mode: "collaborative",
};

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
    registerSkillCreatorHandlers(
      mainWindow as unknown as BrowserWindowType,
      mockSkillCreatorService as unknown as Parameters<
        typeof registerSkillCreatorHandlers
      >[1],
    );
    // デフォルトモック: createSkill は "/valid/skill/path" を返す
    mockSkillCreatorService.createSkill.mockResolvedValue("/valid/skill/path");
  });

  afterEach(() => {
    unregisterSkillCreatorHandlers();
  });

  it("TC-01: createSkill が onProgress コールバック付きで呼ばれること", async () => {
    // Arrange
    mockSkillCreatorService.createSkill.mockResolvedValue(
      "/path/to/test-skill",
    );
    const handler = getCreateHandler();
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
    const handler = getCreateHandler();
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
    const handler = getCreateHandler();
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
    const handler = getCreateHandler();
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

describe("SKILL_CREATOR_CREATE ハンドラー - onProgress コールバック配線", () => {
  let mockMainWindow: ReturnType<typeof createMockWindow>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();

    mockMainWindow = createMockWindow();
    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      mockMainWindow,
    );

    registerSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
      mockSkillCreatorService as unknown as Parameters<
        typeof registerSkillCreatorHandlers
      >[1],
    );

    // デフォルトモック: createSkill は "/valid/skill/path" を返す
    mockSkillCreatorService.createSkill.mockResolvedValue("/valid/skill/path");
  });

  afterEach(() => {
    unregisterSkillCreatorHandlers();
  });

  // ────────────────────────────────────────────────────────────────
  // TC-01: コールバックが呼ばれると sendSkillCreatorProgress が発火する
  // ────────────────────────────────────────────────────────────────
  describe("TC-01: onProgress コールバックが createSkill に渡される", () => {
    it("createSkill が第2引数としてコールバック関数を受け取ること", async () => {
      // createSkill 呼び出し時にコールバックを即座に呼び出すモック
      mockSkillCreatorService.createSkill.mockImplementation(
        async (
          _args: unknown,
          onProgress?: (progress: {
            phase: string;
            percentage: number;
            message: string;
          }) => void,
        ) => {
          onProgress?.({
            phase: "planning",
            percentage: 10,
            message: "計画中",
          });
          return "/valid/skill/path";
        },
      );

      const handler = getCreateHandler();
      expect(handler).toBeDefined();

      await handler!(createMockEvent(), validCreateArgs);

      // createSkill が呼ばれたことを確認
      expect(mockSkillCreatorService.createSkill).toHaveBeenCalledOnce();

      // 第2引数がコールバック関数であることを確認
      const callArgs = mockSkillCreatorService.createSkill.mock.calls[0];
      expect(typeof callArgs[1]).toBe("function");
    });

    it("onProgress コールバック内で mainWindow.webContents.send が呼ばれること", async () => {
      mockSkillCreatorService.createSkill.mockImplementation(
        async (
          _args: unknown,
          onProgress?: (progress: {
            phase: string;
            percentage: number;
            message: string;
          }) => void,
        ) => {
          onProgress?.({
            phase: "planning",
            percentage: 10,
            message: "計画中",
          });
          return "/valid/skill/path";
        },
      );

      const handler = getCreateHandler();
      await handler!(createMockEvent(), validCreateArgs);

      // webContents.send が SKILL_CREATOR_PROGRESS チャンネルで呼ばれること
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        expect.objectContaining({ phase: "planning" }),
      );
    });
  });

  // ────────────────────────────────────────────────────────────────
  // TC-02: planning フェーズの進捗が正しく送信される
  // ────────────────────────────────────────────────────────────────
  describe("TC-02: planning フェーズの進捗が正しく送信される", () => {
    it("{ phase: 'planning', percentage: 10, message: '...' } で send が呼ばれること", async () => {
      const planningProgress = {
        phase: "planning",
        percentage: 10,
        message: "計画中",
      };

      mockSkillCreatorService.createSkill.mockImplementation(
        async (
          _args: unknown,
          onProgress?: (progress: typeof planningProgress) => void,
        ) => {
          onProgress?.(planningProgress);
          return "/valid/skill/path";
        },
      );

      const handler = getCreateHandler();
      await handler!(createMockEvent(), validCreateArgs);

      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        planningProgress,
      );
    });
  });

  // ────────────────────────────────────────────────────────────────
  // TC-03: done フェーズの進捗が正しく送信される
  // ────────────────────────────────────────────────────────────────
  describe("TC-03: done フェーズの進捗が正しく送信される", () => {
    it("{ phase: 'done', percentage: 100, message: '...' } で send が呼ばれること", async () => {
      const doneProgress = {
        phase: "done",
        percentage: 100,
        message: "完了",
      };

      mockSkillCreatorService.createSkill.mockImplementation(
        async (
          _args: unknown,
          onProgress?: (progress: typeof doneProgress) => void,
        ) => {
          onProgress?.(doneProgress);
          return "/valid/skill/path";
        },
      );

      const handler = getCreateHandler();
      await handler!(createMockEvent(), validCreateArgs);

      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        doneProgress,
      );
    });

    it("複数フェーズの進捗が順番に送信されること", async () => {
      const progressEvents = [
        { phase: "planning", percentage: 10, message: "計画中" },
        { phase: "generating", percentage: 50, message: "生成中" },
        { phase: "done", percentage: 100, message: "完了" },
      ];

      mockSkillCreatorService.createSkill.mockImplementation(
        async (
          _args: unknown,
          onProgress?: (progress: (typeof progressEvents)[number]) => void,
        ) => {
          for (const p of progressEvents) {
            onProgress?.(p);
          }
          return "/valid/skill/path";
        },
      );

      const handler = getCreateHandler();
      await handler!(createMockEvent(), validCreateArgs);

      expect(mockMainWindow.webContents.send).toHaveBeenCalledTimes(3);
      expect(mockMainWindow.webContents.send).toHaveBeenNthCalledWith(
        1,
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        progressEvents[0],
      );
      expect(mockMainWindow.webContents.send).toHaveBeenNthCalledWith(
        3,
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        progressEvents[2],
      );
    });
  });

  // ────────────────────────────────────────────────────────────────
  // TC-04: createSkill の結果が正しく返される
  // ────────────────────────────────────────────────────────────────
  describe("TC-04: コールバック接続後も skillDir が正しく返される", () => {
    it("{ success: true, data: '/valid/skill/path' } が返ること", async () => {
      mockSkillCreatorService.createSkill.mockImplementation(
        async (
          _args: unknown,
          onProgress?: (progress: {
            phase: string;
            percentage: number;
            message: string;
          }) => void,
        ) => {
          onProgress?.({ phase: "done", percentage: 100, message: "完了" });
          return "/valid/skill/path";
        },
      );

      const handler = getCreateHandler();
      const result = await handler!(createMockEvent(), validCreateArgs);

      expect(result).toEqual({
        success: true,
        data: "/valid/skill/path",
      });
    });

    it("コールバックなし（デフォルト）でも戻り値が変わらないこと", async () => {
      // デフォルトモック（コールバック未呼出し）
      const handler = getCreateHandler();
      const result = await handler!(createMockEvent(), validCreateArgs);

      expect(result).toEqual({
        success: true,
        data: "/valid/skill/path",
      });
    });
  });

  // ────────────────────────────────────────────────────────────────
  // TC-05: mainWindow が破壊済みの場合に IPC 送信をスキップする
  // ────────────────────────────────────────────────────────────────
  describe("TC-05: mainWindow が破壊済みの場合に IPC 送信をスキップする", () => {
    it("isDestroyed() が true の場合に webContents.send が呼ばれないこと", async () => {
      // 破棄済みウィンドウで再登録
      vi.clearAllMocks();
      handlerMap.clear();

      const destroyedWindow = createMockWindow(true); // isDestroyed = true
      (
        BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>
      ).mockReturnValue(destroyedWindow);

      registerSkillCreatorHandlers(
        destroyedWindow as unknown as BrowserWindowType,
        mockSkillCreatorService as unknown as Parameters<
          typeof registerSkillCreatorHandlers
        >[1],
      );

      mockSkillCreatorService.createSkill.mockImplementation(
        async (
          _args: unknown,
          onProgress?: (progress: {
            phase: string;
            percentage: number;
            message: string;
          }) => void,
        ) => {
          onProgress?.({
            phase: "planning",
            percentage: 10,
            message: "計画中",
          });
          return "/valid/skill/path";
        },
      );

      const handler = getCreateHandler();
      await handler!(createMockEvent(), validCreateArgs);

      // isDestroyed が true なので send は呼ばれない
      expect(destroyedWindow.webContents.send).not.toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // TC-06: createSkill がエラーの場合にエラーレスポンスを返す
  // ────────────────────────────────────────────────────────────────
  describe("TC-06: createSkill がエラーの場合にエラーレスポンスを返す", () => {
    it("createSkill が reject した場合に { success: false, error: ... } が返ること", async () => {
      mockSkillCreatorService.createSkill.mockRejectedValue(
        new Error("スキル作成に失敗しました"),
      );

      const handler = getCreateHandler();
      const result = await handler!(createMockEvent(), validCreateArgs);

      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        }),
      );
    });

    it("エラー時でも webContents.send が呼ばれないこと", async () => {
      mockSkillCreatorService.createSkill.mockRejectedValue(
        new Error("スキル作成に失敗しました"),
      );

      const handler = getCreateHandler();
      await handler!(createMockEvent(), validCreateArgs);

      // エラーで失敗したため progress は送信されない
      expect(mockMainWindow.webContents.send).not.toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        expect.anything(),
      );
    });
  });
});
