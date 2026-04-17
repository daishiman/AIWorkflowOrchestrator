/**
 * SkillCreator IPC Handlers - onProgress Callback Wiring Tests
 * TASK-SW-STREAM-002
 * TC-01 ~ TC-06
 *
 * TDD Red フェーズ: 実装前に作成（Phase 4）
 * Green フェーズ: Phase 5 の実装後に PASS することを確認
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type {
  IpcMainInvokeEvent,
  BrowserWindow as BrowserWindowType,
} from "electron";

// ハンドラーマップ（テスト内からハンドラーを呼び出すため）
const handlerMap = new Map<string, (...args: unknown[]) => unknown>();

// Mock electron
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

// SkillCreatorService モック
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

vi.mock("../../services/skill/SkillCreatorService", () => ({
  SkillCreatorService: vi.fn(() => mockSkillCreatorService),
}));

// Import after mocks
import { BrowserWindow } from "electron";
import {
  registerSkillCreatorHandlers,
  unregisterSkillCreatorHandlers,
} from "../skillCreatorHandlers";
import { IPC_CHANNELS } from "../../../preload/channels";

// ヘルパー: モック mainWindow 作成
function createMockMainWindow(isDestroyed = false) {
  return {
    id: 1,
    webContents: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
      send: vi.fn(),
    },
    isDestroyed: vi.fn().mockReturnValue(isDestroyed),
  };
}

// ヘルパー: モック IpcMainInvokeEvent 作成
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

describe("SKILL_CREATOR_CREATE ハンドラー - onProgress コールバック配線", () => {
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

      const destroyedWindow = createMockMainWindow(true); // isDestroyed = true
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
