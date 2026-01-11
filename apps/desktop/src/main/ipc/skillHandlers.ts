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
import { validateIpcSender } from "../infrastructure/security/ipc-validator";

/**
 * スキル管理IPCハンドラーを登録する
 * @param _mainWindow メインウィンドウ（将来的な拡張用）
 * @param skillService スキルサービスインスタンス
 */
export function registerSkillHandlers(
  _mainWindow: BrowserWindow,
  skillService: SkillService,
): void {
  // skill:list-available - 利用可能なスキルをスキャン
  ipcMain.handle(
    IPC_CHANNELS.SKILL_LIST_AVAILABLE,
    async (
      event: IpcMainInvokeEvent,
      args?: { basePath?: string; forceRefresh?: boolean },
    ) => {
      if (!validateIpcSender(event.sender)) {
        throw { code: "AUTH_ERROR", message: "Invalid IPC sender" };
      }
      return skillService.scanAvailableSkills(args?.forceRefresh);
    },
  );

  // skill:list-imported - インポート済みスキルを取得
  ipcMain.handle(
    IPC_CHANNELS.SKILL_LIST_IMPORTED,
    async (event: IpcMainInvokeEvent) => {
      if (!validateIpcSender(event.sender)) {
        throw { code: "AUTH_ERROR", message: "Invalid IPC sender" };
      }
      return skillService.getImportedSkills();
    },
  );

  // skill:import - スキルをインポート
  ipcMain.handle(
    IPC_CHANNELS.SKILL_IMPORT,
    async (event: IpcMainInvokeEvent, args: { skillIds: string[] }) => {
      if (!validateIpcSender(event.sender)) {
        throw { code: "AUTH_ERROR", message: "Invalid IPC sender" };
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
      if (!validateIpcSender(event.sender)) {
        throw { code: "AUTH_ERROR", message: "Invalid IPC sender" };
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
      if (!validateIpcSender(event.sender)) {
        throw { code: "AUTH_ERROR", message: "Invalid IPC sender" };
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
