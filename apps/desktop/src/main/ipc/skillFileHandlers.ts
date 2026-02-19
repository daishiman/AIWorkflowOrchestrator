/**
 * Skill File IPC Handlers (TASK-9A-B)
 *
 * SkillFileManager の6つのファイル操作メソッドを IPC 経由で
 * Renderer プロセスから呼び出せるようにするハンドラーセット。
 *
 * セキュリティ: 多層防御
 * 1. validateIpcSender — 送信元ウィンドウ検証
 * 2. 引数バリデーション — 型チェック + 空文字列チェック
 * 3. SkillFileManager 内部 — パストラバーサル防止 + 読み取り専用チェック
 */
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
import { SkillFileManager } from "../services/skill/SkillFileManager";
import {
  SkillNotFoundError,
  ReadonlySkillError,
  PathTraversalError,
  FileExistsError,
  FileNotFoundError,
} from "../services/skill/errors";
import type { SkillService } from "../services/skill/SkillService";

/**
 * 既知のスキルファイルエラーかどうかを判定する型ガード関数
 *
 * 既知エラー → error.message をそのままクライアントに返す（ビジネスロジックのエラー）
 * 未知エラー → "Internal error" を返して内部情報を漏洩しない
 */
function isKnownSkillFileError(
  error: unknown,
): error is
  | SkillNotFoundError
  | ReadonlySkillError
  | PathTraversalError
  | FileExistsError
  | FileNotFoundError {
  return (
    error instanceof SkillNotFoundError ||
    error instanceof ReadonlySkillError ||
    error instanceof PathTraversalError ||
    error instanceof FileExistsError ||
    error instanceof FileNotFoundError
  );
}

/**
 * スキルファイル操作IPCハンドラーを登録する
 * @param mainWindow メインウィンドウ
 * @param skillFileManager SkillFileManager インスタンス
 * @param skillService スキルサービス（writeFile 後の再スキャン用、任意）
 */
export function registerSkillFileHandlers(
  mainWindow: BrowserWindow,
  skillFileManager: SkillFileManager,
  skillService?: SkillService,
): void {
  // skill:readFile
  ipcMain.handle(
    IPC_CHANNELS.SKILL_READ_FILE,
    async (
      event: IpcMainInvokeEvent,
      args: { skillName: string; relativePath: string },
    ) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_READ_FILE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        return {
          success: false,
          error: "skillName must be a non-empty string",
        };
      }
      if (
        typeof args?.relativePath !== "string" ||
        args.relativePath.trim() === ""
      ) {
        return {
          success: false,
          error: "relativePath must be a non-empty string",
        };
      }
      try {
        const content = await skillFileManager.readFile(
          args.skillName,
          args.relativePath,
        );
        return { success: true, data: content };
      } catch (error) {
        if (isKnownSkillFileError(error)) {
          return { success: false, error: error.message };
        }
        return { success: false, error: "Internal error" };
      }
    },
  );

  // skill:writeFile
  ipcMain.handle(
    IPC_CHANNELS.SKILL_WRITE_FILE,
    async (
      event: IpcMainInvokeEvent,
      args: { skillName: string; relativePath: string; content: string },
    ) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_WRITE_FILE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        return {
          success: false,
          error: "skillName must be a non-empty string",
        };
      }
      if (
        typeof args?.relativePath !== "string" ||
        args.relativePath.trim() === ""
      ) {
        return {
          success: false,
          error: "relativePath must be a non-empty string",
        };
      }
      if (typeof args?.content !== "string") {
        return { success: false, error: "content must be a string" };
      }
      try {
        await skillFileManager.writeFile(
          args.skillName,
          args.relativePath,
          args.content,
        );
        // 書き込み後にスキル情報を再スキャン
        await skillService?.scanAvailableSkills();
        return { success: true };
      } catch (error) {
        if (isKnownSkillFileError(error)) {
          return { success: false, error: error.message };
        }
        return { success: false, error: "Internal error" };
      }
    },
  );

  // skill:createFile
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATE_FILE,
    async (
      event: IpcMainInvokeEvent,
      args: { skillName: string; relativePath: string; content: string },
    ) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_CREATE_FILE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        return {
          success: false,
          error: "skillName must be a non-empty string",
        };
      }
      if (
        typeof args?.relativePath !== "string" ||
        args.relativePath.trim() === ""
      ) {
        return {
          success: false,
          error: "relativePath must be a non-empty string",
        };
      }
      if (typeof args?.content !== "string") {
        return { success: false, error: "content must be a string" };
      }
      try {
        await skillFileManager.createFile(
          args.skillName,
          args.relativePath,
          args.content,
        );
        return { success: true };
      } catch (error) {
        if (isKnownSkillFileError(error)) {
          return { success: false, error: error.message };
        }
        return { success: false, error: "Internal error" };
      }
    },
  );

  // skill:deleteFile
  ipcMain.handle(
    IPC_CHANNELS.SKILL_DELETE_FILE,
    async (
      event: IpcMainInvokeEvent,
      args: { skillName: string; relativePath: string },
    ) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_DELETE_FILE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        return {
          success: false,
          error: "skillName must be a non-empty string",
        };
      }
      if (
        typeof args?.relativePath !== "string" ||
        args.relativePath.trim() === ""
      ) {
        return {
          success: false,
          error: "relativePath must be a non-empty string",
        };
      }
      try {
        await skillFileManager.deleteFile(args.skillName, args.relativePath);
        return { success: true };
      } catch (error) {
        if (isKnownSkillFileError(error)) {
          return { success: false, error: error.message };
        }
        return { success: false, error: "Internal error" };
      }
    },
  );

  // skill:listBackups
  ipcMain.handle(
    IPC_CHANNELS.SKILL_LIST_BACKUPS,
    async (event: IpcMainInvokeEvent, args: { skillName: string }) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_LIST_BACKUPS,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        return {
          success: false,
          error: "skillName must be a non-empty string",
        };
      }
      try {
        const backups = await skillFileManager.listBackups(args.skillName);
        return { success: true, data: backups };
      } catch (error) {
        if (isKnownSkillFileError(error)) {
          return { success: false, error: error.message };
        }
        return { success: false, error: "Internal error" };
      }
    },
  );

  // skill:restoreBackup
  ipcMain.handle(
    IPC_CHANNELS.SKILL_RESTORE_BACKUP,
    async (
      event: IpcMainInvokeEvent,
      args: { skillName: string; backupPath: string },
    ) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_RESTORE_BACKUP,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        return {
          success: false,
          error: "skillName must be a non-empty string",
        };
      }
      if (
        typeof args?.backupPath !== "string" ||
        args.backupPath.trim() === ""
      ) {
        return {
          success: false,
          error: "backupPath must be a non-empty string",
        };
      }
      try {
        await skillFileManager.restoreBackup(args.skillName, args.backupPath);
        return { success: true };
      } catch (error) {
        if (isKnownSkillFileError(error)) {
          return { success: false, error: error.message };
        }
        return { success: false, error: "Internal error" };
      }
    },
  );
}

/**
 * スキルファイル操作IPCハンドラーを解除する
 */
export function unregisterSkillFileHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_READ_FILE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_WRITE_FILE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATE_FILE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DELETE_FILE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_LIST_BACKUPS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_RESTORE_BACKUP);
}
