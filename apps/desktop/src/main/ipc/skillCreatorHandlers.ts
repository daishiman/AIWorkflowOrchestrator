/**
 * Skill Creator IPC Handlers
 *
 * TASK-9B-H: SkillCreatorService用のIPCハンドラー
 * 5つのinvokeチャンネル + 1つのprogressチャンネルを提供
 *
 * @module @repo/desktop/main/ipc/skillCreatorHandlers
 */
import { ipcMain, BrowserWindow } from "electron";
import type { IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type { SkillCreatorService } from "../services/skill/SkillCreatorService";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
import type {
  CreateSkillOptions,
  ExecuteTasksOptions,
  SkillCreatorMode,
  ExecutionReport,
} from "@repo/shared/types";

/**
 * IPC結果型
 */
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * SkillCreator IPCハンドラーを登録する
 * @param mainWindow メインウィンドウ
 * @param skillCreatorService SkillCreatorServiceインスタンス
 */
export function registerSkillCreatorHandlers(
  mainWindow: BrowserWindow,
  skillCreatorService: SkillCreatorService,
): void {
  // skill-creator:detect-mode - リクエストからモードを判定
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE,
    async (
      event: IpcMainInvokeEvent,
      args: { request: string },
    ): Promise<IpcResult<SkillCreatorMode>> => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      // 引数バリデーション
      if (typeof args?.request !== "string" || args.request.trim() === "") {
        return {
          success: false,
          error: "リクエスト文字列が指定されていません",
        };
      }

      try {
        const mode = await skillCreatorService.detectMode(args.request);
        return { success: true, data: mode };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "モード判定に失敗しました",
        };
      }
    },
  );

  // skill-creator:create - スキルを作成
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_CREATE,
    async (
      event: IpcMainInvokeEvent,
      args: CreateSkillOptions,
    ): Promise<IpcResult<string>> => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_CREATE,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      // 引数バリデーション
      if (
        typeof args?.name !== "string" ||
        typeof args?.description !== "string" ||
        typeof args?.mode !== "string"
      ) {
        return {
          success: false,
          error: "スキル名、説明、モードが正しく指定されていません",
        };
      }

      try {
        const skillDir = await skillCreatorService.createSkill(args);
        return { success: true, data: skillDir };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "スキル作成に失敗しました",
        };
      }
    },
  );

  // skill-creator:execute-tasks - タスクを実行
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS,
    async (
      event: IpcMainInvokeEvent,
      args: ExecuteTasksOptions,
    ): Promise<IpcResult<ExecutionReport>> => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      // 引数バリデーション
      if (typeof args?.tasksDir !== "string" || args.tasksDir.trim() === "") {
        return {
          success: false,
          error: "タスクディレクトリが指定されていません",
        };
      }

      try {
        const report = await skillCreatorService.executeTasks(args);
        return { success: true, data: report };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "タスク実行に失敗しました",
        };
      }
    },
  );

  // skill-creator:validate - スキルを検証
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_VALIDATE,
    async (
      event: IpcMainInvokeEvent,
      args: { skillDir: string },
    ): Promise<IpcResult<boolean>> => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_VALIDATE,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      // 引数バリデーション
      if (typeof args?.skillDir !== "string" || args.skillDir.trim() === "") {
        return {
          success: false,
          error: "スキルディレクトリが指定されていません",
        };
      }

      try {
        const isValid = await skillCreatorService.validateSkill(args.skillDir);
        return { success: true, data: isValid };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "スキル検証に失敗しました",
        };
      }
    },
  );

  // skill-creator:validate-schema - スキーマでデータを検証
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA,
    async (
      event: IpcMainInvokeEvent,
      args: { schemaName: string; data: unknown },
    ): Promise<IpcResult<boolean>> => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      // 引数バリデーション
      if (
        typeof args?.schemaName !== "string" ||
        args.schemaName.trim() === "" ||
        args?.data === undefined
      ) {
        return {
          success: false,
          error: "スキーマ名とデータが正しく指定されていません",
        };
      }

      try {
        const isValid = await skillCreatorService.validateWithSchema(
          args.schemaName,
          args.data,
        );
        return { success: true, data: isValid };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "スキーマ検証に失敗しました",
        };
      }
    },
  );
}

/**
 * 進捗通知をRendererに送信する
 * @param mainWindow メインウィンドウ
 * @param progress 進捗データ
 */
export function sendSkillCreatorProgress(
  mainWindow: BrowserWindow,
  progress: {
    phase: string;
    percentage: number;
    message: string;
  },
): void {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
  }
}

/**
 * SkillCreator IPCハンドラーを解除する
 */
export function unregisterSkillCreatorHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA);
}
