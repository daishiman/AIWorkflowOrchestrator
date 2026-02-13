/**
 * Skill Creator IPC Handlers
 *
 * TASK-9B-H: SkillCreatorService用のIPCハンドラー
 * 5つのinvokeチャンネル + 1つのprogressチャンネルを提供
 *
 * UT-9B-H-003: セキュリティ強化
 * - validatePath: パストラバーサル攻撃防止
 * - sanitizeErrorMessage: エラーレスポンスからの内部情報漏洩防止
 * - ALLOWED_SCHEMA_NAMES: スキーマ名ホワイトリスト検証
 *
 * @module @repo/desktop/main/ipc/skillCreatorHandlers
 */
import path from "path";
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
 * 許可されたスキーマ名のホワイトリスト。
 *
 * - "task-spec": タスク仕様スキーマ（SkillCreatorService.validateSchema で使用）
 * - "skill-spec": スキル仕様スキーマ（SkillCreatorService.validateSchema で使用）
 * - "mode": モードスキーマ（SkillCreatorService.validateSchema で使用）
 *
 * 新規スキーマ追加時は以下の手順で更新:
 * 1. ResourceLoader にスキーマファイルを追加
 * 2. この配列にスキーマ名を追加
 * 3. テストにも対応するケースを追加
 */
const ALLOWED_SCHEMA_NAMES = ["task-spec", "skill-spec", "mode"] as const;

/** sanitizeErrorMessage で使用するサニタイズ正規表現パターン */
const STACK_TRACE_PATTERN = /\n\s+at\s+.*/g;
const UNIX_PATH_PATTERN = /\/[\w./\\-]+/g;
const WINDOWS_PATH_PATTERN = /[A-Z]:\\[\w.\\-]+/gi;
const SENSITIVE_DATA_PATTERN = /(token|key|password|secret)=\S+/gi;

/** sanitizeErrorMessage のデフォルトエラーメッセージ */
const DEFAULT_ERROR_MESSAGE = "スキル作成処理でエラーが発生しました";

/**
 * パスのバリデーション（パストラバーサル対策）
 *
 * SkillFileManager.validatePath() と同等のロジックをIPCハンドラーレベルで実行する。
 * 以下の攻撃パターンを検出して null を返す:
 * - 空文字列 / NULLバイト（`\0`）
 * - UNCパス（`\\server\share`）
 * - 上位ディレクトリ参照（`../` / `..\`）
 *
 * @param inputPath - 検証対象のパス文字列
 * @param _paramName - エラーメッセージ用のパラメータ名（呼び出し元で使用）
 * @returns 正規化されたパス（`path.resolve()` 適用済み）、または検証失敗時にnull
 */
function validatePath(inputPath: string, _paramName: string): string | null {
  if (!inputPath || inputPath.includes("\0")) {
    return null;
  }
  if (inputPath.startsWith("\\\\")) {
    return null;
  }
  if (inputPath.includes("../") || inputPath.includes("..\\")) {
    return null;
  }
  return path.resolve(inputPath);
}

/**
 * エラーメッセージのサニタイズ（内部情報漏洩防止）
 *
 * authModeHandlers.ts の sanitizeErrorMessage() と同等のパターン。
 * 以下の内部情報をエラーメッセージから除去する:
 * - スタックトレース行（`at Function.run (/app/src/...)` 形式）
 * - Unixファイルパス（`/Users/user/project/...` 形式）
 * - Windowsファイルパス（`C:\Users\...` 形式）
 * - トークン・APIキー・パスワード（`token=xxx` 形式）
 *
 * @param error - キャッチされたエラーオブジェクト（unknown型で受け取り実行時検証）
 * @returns サニタイズ済みのエラーメッセージ文字列
 */
function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return DEFAULT_ERROR_MESSAGE;
  }

  let message = error.message;

  message = message.replace(STACK_TRACE_PATTERN, "");
  message = message.replace(UNIX_PATH_PATTERN, "[path]");
  message = message.replace(WINDOWS_PATH_PATTERN, "[path]");
  message = message.replace(SENSITIVE_DATA_PATTERN, "$1=***");

  return message || DEFAULT_ERROR_MESSAGE;
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
          error: sanitizeErrorMessage(error),
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

      // L3: パストラバーサル防止
      const argsWithPaths = args as CreateSkillOptions & {
        tasksDir?: string;
        skillDir?: string;
      };
      if (
        typeof argsWithPaths.tasksDir === "string" &&
        !validatePath(argsWithPaths.tasksDir, "tasksDir")
      ) {
        return {
          success: false,
          error: "無効なパスが指定されました: tasksDir",
        };
      }
      if (
        typeof argsWithPaths.skillDir === "string" &&
        !validatePath(argsWithPaths.skillDir, "skillDir")
      ) {
        return {
          success: false,
          error: "無効なパスが指定されました: skillDir",
        };
      }

      try {
        const skillDir = await skillCreatorService.createSkill(args);
        return { success: true, data: skillDir };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(error),
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

      // L3: パストラバーサル防止
      if (!validatePath(args.tasksDir, "tasksDir")) {
        return {
          success: false,
          error: "無効なパスが指定されました: tasksDir",
        };
      }
      if (
        typeof (args as ExecuteTasksOptions & { skillDir?: string })
          .skillDir === "string" &&
        !validatePath(
          (args as ExecuteTasksOptions & { skillDir?: string }).skillDir!,
          "skillDir",
        )
      ) {
        return {
          success: false,
          error: "無効なパスが指定されました: skillDir",
        };
      }

      try {
        const report = await skillCreatorService.executeTasks(args);
        return { success: true, data: report };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(error),
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

      // L3: パストラバーサル防止
      if (!validatePath(args.skillDir, "skillDir")) {
        return {
          success: false,
          error: "無効なパスが指定されました: skillDir",
        };
      }

      try {
        const isValid = await skillCreatorService.validateSkill(args.skillDir);
        return { success: true, data: isValid };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(error),
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

      // L3: schemaNameホワイトリスト検証
      if (
        !ALLOWED_SCHEMA_NAMES.includes(
          args.schemaName as (typeof ALLOWED_SCHEMA_NAMES)[number],
        )
      ) {
        return {
          success: false,
          error: `無効なスキーマ名が指定されました: ${args.schemaName}`,
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
          error: sanitizeErrorMessage(error),
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
