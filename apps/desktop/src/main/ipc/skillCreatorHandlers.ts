/**
 * Skill Creator IPC Handlers
 *
 * TASK-9B-H: SkillCreatorService用のIPCハンドラー
 * 標準の12 invoke + 1 progress に加え、
 * runtime facade 注入時は public runtime 3 invoke も同じ surface へ統合する。
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
import type { RuntimeSkillCreatorFacade } from "../services/runtime/RuntimeSkillCreatorFacade";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
import {
  registerRuntimeSkillCreatorHandlers,
  unregisterRuntimeSkillCreatorHandlers,
} from "./creatorHandlers";
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
  runtimeSkillCreatorService?: RuntimeSkillCreatorFacade,
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
      args: unknown,
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

      const createArgs = args as {
        name?: unknown;
        description?: unknown;
        mode?: unknown;
        tasksDir?: unknown;
        skillDir?: unknown;
        [key: string]: unknown;
      };

      // P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）
      if (
        typeof createArgs?.name !== "string" ||
        typeof createArgs?.description !== "string" ||
        typeof createArgs?.mode !== "string"
      ) {
        return {
          success: false,
          error: "スキル名、説明、モードが正しく指定されていません",
        };
      }
      if (
        createArgs.name === "" ||
        createArgs.description === "" ||
        createArgs.mode === ""
      ) {
        return {
          success: false,
          error: "スキル名、説明、モードが正しく指定されていません",
        };
      }
      if (
        createArgs.name.trim() === "" ||
        createArgs.description.trim() === "" ||
        createArgs.mode.trim() === ""
      ) {
        return {
          success: false,
          error: "スキル名、説明、モードが正しく指定されていません",
        };
      }

      const allowedModes: SkillCreatorMode[] = [
        "collaborative",
        "orchestrate",
        "create",
        "update",
        "improve-prompt",
      ];
      if (!allowedModes.includes(createArgs.mode as SkillCreatorMode)) {
        return {
          success: false,
          error: "スキル名、説明、モードが正しく指定されていません",
        };
      }

      const validatedArgs = {
        ...createArgs,
        name: createArgs.name,
        description: createArgs.description,
        mode: createArgs.mode as SkillCreatorMode,
      } as CreateSkillOptions & {
        tasksDir?: string;
        skillDir?: string;
      };

      // L3: パストラバーサル防止
      if (
        typeof validatedArgs.tasksDir === "string" &&
        !validatePath(validatedArgs.tasksDir, "tasksDir")
      ) {
        return {
          success: false,
          error: "無効なパスが指定されました: tasksDir",
        };
      }
      if (
        typeof validatedArgs.skillDir === "string" &&
        !validatePath(validatedArgs.skillDir, "skillDir")
      ) {
        return {
          success: false,
          error: "無効なパスが指定されました: skillDir",
        };
      }

      try {
        const skillDir = await skillCreatorService.createSkill(validatedArgs);
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

  // skill-creator:improve - スキルを改善
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_IMPROVE,
    async (
      event: IpcMainInvokeEvent,
      args: { skillName: string; autoApply?: boolean },
    ): Promise<IpcResult<unknown>> => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_IMPROVE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        return { success: false, error: "スキル名が指定されていません" };
      }
      try {
        const result = await skillCreatorService.improveSkill(
          args.skillName,
          args.autoApply ?? false,
        );
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: sanitizeErrorMessage(error) };
      }
    },
  );

  // skill-creator:fork - スキルをフォーク
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_FORK,
    async (
      event: IpcMainInvokeEvent,
      args: {
        sourceName: string;
        newName: string;
        options?: Record<string, boolean>;
      },
    ): Promise<IpcResult<string>> => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_FORK,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (
        typeof args?.sourceName !== "string" ||
        args.sourceName.trim() === ""
      ) {
        return { success: false, error: "元スキル名が指定されていません" };
      }
      if (typeof args?.newName !== "string" || args.newName.trim() === "") {
        return { success: false, error: "新スキル名が指定されていません" };
      }
      try {
        const result = await skillCreatorService.forkSkill(
          args.sourceName,
          args.newName,
          args.options || {},
        );
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: sanitizeErrorMessage(error) };
      }
    },
  );

  // skill-creator:share - スキルを共有
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_SHARE,
    async (
      event: IpcMainInvokeEvent,
      args: { skillName: string; format: string },
    ): Promise<IpcResult<string>> => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_SHARE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        return { success: false, error: "スキル名が指定されていません" };
      }
      if (typeof args?.format !== "string" || args.format.trim() === "") {
        return { success: false, error: "フォーマットが指定されていません" };
      }
      try {
        const result = await skillCreatorService.shareSkill(
          "export",
          args.format,
          args.skillName,
        );
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: sanitizeErrorMessage(error) };
      }
    },
  );

  // skill-creator:schedule - スキルスケジュール設定
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_SCHEDULE,
    async (
      event: IpcMainInvokeEvent,
      args: {
        skillName: string;
        schedule: {
          skillName: string;
          scheduleType: string;
          value: string;
          isEnabled: boolean;
        };
      },
    ): Promise<IpcResult<void>> => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_SCHEDULE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        return { success: false, error: "スキル名が指定されていません" };
      }
      try {
        await skillCreatorService.scheduleSkill(args.skillName, args.schedule);
        return { success: true };
      } catch (error) {
        return { success: false, error: sanitizeErrorMessage(error) };
      }
    },
  );

  // skill-creator:debug - スキルデバッグ
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_DEBUG,
    async (
      event: IpcMainInvokeEvent,
      args: {
        skillName: string;
        options?: { verbose?: boolean; breakpoints?: string[] };
      },
    ): Promise<IpcResult<unknown>> => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_DEBUG,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        return { success: false, error: "スキル名が指定されていません" };
      }
      try {
        const result = await skillCreatorService.debugSkill(
          args.skillName,
          args.options || {},
        );
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: sanitizeErrorMessage(error) };
      }
    },
  );

  // skill-creator:generate-docs - ドキュメント生成
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_GENERATE_DOCS,
    async (
      event: IpcMainInvokeEvent,
      args: { skillName: string; format?: string; sections?: string[] },
    ): Promise<IpcResult<string>> => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_GENERATE_DOCS,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        return { success: false, error: "スキル名が指定されていません" };
      }
      try {
        const result = await skillCreatorService.generateDocs(
          args.skillName,
          args.format || "markdown",
          args.sections || [],
        );
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: sanitizeErrorMessage(error) };
      }
    },
  );

  // skill-creator:stats - 使用統計取得
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_STATS,
    async (
      event: IpcMainInvokeEvent,
      args: { skillName?: string; period?: string },
    ): Promise<IpcResult<unknown>> => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_STATS,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      try {
        const result = await skillCreatorService.getStats(
          args?.skillName || "",
          args?.period || "7d",
        );
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: sanitizeErrorMessage(error) };
      }
    },
  );

  registerRuntimeSkillCreatorHandlers(mainWindow, runtimeSkillCreatorService);
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
  // Phase 5 extended handlers
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_IMPROVE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_FORK);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_SHARE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_SCHEDULE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_DEBUG);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GENERATE_DOCS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_STATS);
  unregisterRuntimeSkillCreatorHandlers();
}
