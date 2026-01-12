/**
 * Skill Management IPC Handlers
 *
 * Per Phase 3 review, these use the `skill:` prefix channels.
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-3/review-summary.md
 */
import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { SkillService } from "../services/skill/SkillService";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";

/**
 * スキル管理IPCハンドラーを登録する
 * @param mainWindow メインウィンドウ
 * @param skillService スキルサービスインスタンス
 */
export function registerSkillHandlers(
  mainWindow: BrowserWindow,
  skillService: SkillService,
): void {
  // skill:list-available - 利用可能なスキルをスキャン
  ipcMain.handle(
    IPC_CHANNELS.SKILL_LIST_AVAILABLE,
    async (
      event: IpcMainInvokeEvent,
      args?: { basePath?: string; forceRefresh?: boolean },
    ) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_LIST_AVAILABLE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      return skillService.scanAvailableSkills(args?.forceRefresh);
    },
  );

  // skill:list-imported - インポート済みスキルを取得
  ipcMain.handle(
    IPC_CHANNELS.SKILL_LIST_IMPORTED,
    async (event: IpcMainInvokeEvent) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_LIST_IMPORTED,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      return skillService.getImportedSkills();
    },
  );

  // skill:import - スキルをインポート
  ipcMain.handle(
    IPC_CHANNELS.SKILL_IMPORT,
    async (event: IpcMainInvokeEvent, args: { skillIds: string[] }) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_IMPORT, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (!Array.isArray(args?.skillIds)) {
        throw {
          code: "VALIDATION_ERROR",
          message: "skillIds must be an array",
        };
      }
      return skillService.importSkills(args.skillIds);
    },
  );

  // skill:remove - スキルを削除
  ipcMain.handle(
    IPC_CHANNELS.SKILL_REMOVE,
    async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_REMOVE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillId !== "string") {
        throw { code: "VALIDATION_ERROR", message: "skillId must be a string" };
      }
      return skillService.removeSkill(args.skillId);
    },
  );

  // skill:get-detail - スキル詳細を取得
  ipcMain.handle(
    IPC_CHANNELS.SKILL_GET_DETAIL,
    async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_GET_DETAIL,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillId !== "string") {
        throw { code: "VALIDATION_ERROR", message: "skillId must be a string" };
      }
      return skillService.getSkillById(args.skillId);
    },
  );
}

/**
 * スキル管理IPCハンドラーを解除する
 */
export function unregisterSkillHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_LIST_AVAILABLE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_LIST_IMPORTED);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_IMPORT);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_REMOVE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_GET_DETAIL);
}
