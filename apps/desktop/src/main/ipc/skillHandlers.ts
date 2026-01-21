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
      try {
        const result = await skillService.scanAvailableSkills(
          args?.forceRefresh,
        );
        return { success: true, data: result.skills };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "スキャンに失敗しました",
        };
      }
    },
  );

  // skill:list-imported - インポート済みスキルを取得
  ipcMain.handle(
    IPC_CHANNELS.SKILL_LIST_IMPORTED,
    async (event: IpcMainInvokeEvent) => {
      console.log("[skillHandlers][DEBUG] skill:list-imported - START");
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_LIST_IMPORTED,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        console.log(
          "[skillHandlers][DEBUG] skill:list-imported - validation FAILED",
        );
        throw toIPCValidationError(validation);
      }
      console.log(
        "[skillHandlers][DEBUG] skill:list-imported - validation PASSED",
      );
      try {
        console.log(
          "[skillHandlers][DEBUG] Calling skillService.getImportedSkills()...",
        );
        const skills = await skillService.getImportedSkills();
        console.log(
          "[skillHandlers][DEBUG] getImportedSkills result:",
          skills?.length,
          "skills",
        );
        return { success: true, data: skills };
      } catch (error) {
        console.error(
          "[skillHandlers][DEBUG] skill:list-imported ERROR:",
          error,
        );
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "スキル取得に失敗しました",
        };
      }
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
        return { success: false, error: "skillId must be a string" };
      }
      try {
        const skill = await skillService.getSkillById(args.skillId);
        if (skill) {
          return { success: true, data: skill };
        }
        return { success: false, error: "スキルが見つかりません" };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "スキル取得に失敗しました",
        };
      }
    },
  );

  // skill:execute - スキルを実行
  ipcMain.handle(
    IPC_CHANNELS.SKILL_EXECUTE,
    async (
      event: IpcMainInvokeEvent,
      args: { skillId: string; params?: Record<string, unknown> },
    ) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillId !== "string" || args.skillId === "") {
        return { success: false, error: "skillId must be a string" };
      }
      try {
        const result = await skillService.executeSkill(
          args.skillId,
          args.params,
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "スキル実行に失敗しました",
        };
      }
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
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_EXECUTE);
}
