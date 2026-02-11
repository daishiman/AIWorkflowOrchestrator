/**
 * Skill Management IPC Handlers
 *
 * Per Phase 3 review, these use the `skill:` prefix channels.
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-3/review-summary.md
 */
import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import log from "electron-log";
import { IPC_CHANNELS } from "../../preload/channels";
import { SkillService } from "../services/skill/SkillService";
import { SkillExecutor } from "../services/skill/SkillExecutor";
import { SkillAnalyzer } from "../services/skill/SkillAnalyzer";
import { SkillImprover } from "../services/skill/SkillImprover";
import { PromptOptimizer } from "../services/skill/PromptOptimizer";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
import type {
  SkillAnalyzeRequest,
  SkillImproveRequest,
  SkillOptimizeRequest,
  SkillOptimizeVariantsRequest,
  SkillOptimizeEvaluateRequest,
} from "@repo/shared";

// Module-level SkillExecutor instance for abort/getExecutionStatus
let _skillExecutorInstance: SkillExecutor | null = null;

/**
 * スキル管理IPCハンドラーを登録する
 * @param mainWindow メインウィンドウ
 * @param skillService スキルサービスインスタンス
 */
export function registerSkillHandlers(
  mainWindow: BrowserWindow,
  skillService: SkillService,
): void {
  // Initialize SkillExecutor instance
  _skillExecutorInstance = new SkillExecutor(mainWindow);

  // TASK-FIX-7-1: SkillExecutorをSkillServiceに注入
  skillService.setSkillExecutor(_skillExecutorInstance);

  // skill:list - 利用可能なスキルをスキャン (TASK-FIX-4-1-IPC-CONSOLIDATION: unified from SKILL_LIST_AVAILABLE)
  ipcMain.handle(
    IPC_CHANNELS.SKILL_LIST,
    async (
      event: IpcMainInvokeEvent,
      args?: { basePath?: string; forceRefresh?: boolean },
    ) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_LIST, {
        getAllowedWindows: () => [mainWindow],
      });
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

  // skill:scan - スキルの強制再スキャン (TASK-FIX-17-1-SKILL-SCAN-HANDLER)
  ipcMain.handle(IPC_CHANNELS.SKILL_SCAN, async (event: IpcMainInvokeEvent) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_SCAN, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    try {
      const result = await skillService.scanAvailableSkills(true);
      return { success: true, data: result.skills };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "スキャンに失敗しました",
      };
    }
  });

  // skill:getImported - インポート済みスキルを取得 (TASK-FIX-4-1-IPC-CONSOLIDATION: unified from SKILL_LIST_IMPORTED)
  ipcMain.handle(
    IPC_CHANNELS.SKILL_GET_IMPORTED,
    async (event: IpcMainInvokeEvent) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_GET_IMPORTED,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      try {
        const skills = await skillService.getImportedSkills();
        return { success: true, data: skills };
      } catch (error) {
        log.error("[skillHandlers] skill:getImported failed:", error);
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

  // skill:abort - スキル実行の中断
  ipcMain.handle(
    IPC_CHANNELS.SKILL_ABORT,
    async (event: IpcMainInvokeEvent, executionId: string) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_ABORT, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof executionId !== "string" || executionId === "") {
        return false;
      }
      if (!_skillExecutorInstance) {
        return false;
      }
      return _skillExecutorInstance.abort(executionId);
    },
  );

  // skill:get-status - 実行状態の取得
  ipcMain.handle(
    IPC_CHANNELS.SKILL_GET_STATUS,
    async (event: IpcMainInvokeEvent, executionId: string) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_GET_STATUS,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof executionId !== "string" || executionId === "") {
        return null;
      }
      if (!_skillExecutorInstance) {
        return null;
      }
      return _skillExecutorInstance.getExecutionStatus(executionId) ?? null;
    },
  );

  // ========================================
  // TASK-9C: スキル改善・自動修正機能
  // ========================================

  // スキル改善サービスのインスタンスを初期化
  const skillsDir = skillService.getSkillsDirectory();
  const skillAnalyzer = new SkillAnalyzer(skillsDir);
  const skillImprover = new SkillImprover(skillsDir);
  const promptOptimizer = new PromptOptimizer();

  // skill:analyze - スキル分析
  ipcMain.handle(
    IPC_CHANNELS.SKILL_ANALYZE,
    async (event: IpcMainInvokeEvent, args: SkillAnalyzeRequest) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_ANALYZE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName === "") {
        return { success: false, error: "スキル名が指定されていません" };
      }
      try {
        const skill = await skillService.getSkillByName(args.skillName);
        if (!skill) {
          return { success: false, error: "スキルが見つかりません" };
        }
        const analysis = await skillAnalyzer.analyze(skill);
        return { success: true, data: analysis };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "スキル分析に失敗しました",
        };
      }
    },
  );

  // skill:improve - スキル改善
  ipcMain.handle(
    IPC_CHANNELS.SKILL_IMPROVE,
    async (event: IpcMainInvokeEvent, args: SkillImproveRequest) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_IMPROVE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName === "") {
        return { success: false, error: "スキル名が指定されていません" };
      }
      if (!args.analysis) {
        return { success: false, error: "分析結果が指定されていません" };
      }
      try {
        const result = await skillImprover.applyImprovements(
          args.skillName,
          args.analysis,
          args.options,
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "スキル改善に失敗しました",
        };
      }
    },
  );

  // skill:optimize - プロンプト最適化
  ipcMain.handle(
    IPC_CHANNELS.SKILL_OPTIMIZE,
    async (event: IpcMainInvokeEvent, args: SkillOptimizeRequest) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_OPTIMIZE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
        return { success: false, error: "プロンプトが指定されていません" };
      }
      try {
        const result = await promptOptimizer.optimize(args.prompt);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "プロンプト最適化に失敗しました",
        };
      }
    },
  );

  // skill:optimize:variants - バリアント生成
  ipcMain.handle(
    IPC_CHANNELS.SKILL_OPTIMIZE_VARIANTS,
    async (event: IpcMainInvokeEvent, args: SkillOptimizeVariantsRequest) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_OPTIMIZE_VARIANTS,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
        return { success: false, error: "プロンプトが指定されていません" };
      }
      try {
        const variants = await promptOptimizer.generateVariants(
          args.prompt,
          args.count,
        );
        return { success: true, data: variants };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "バリアント生成に失敗しました",
        };
      }
    },
  );

  // skill:optimize:evaluate - プロンプト評価
  ipcMain.handle(
    IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE,
    async (event: IpcMainInvokeEvent, args: SkillOptimizeEvaluateRequest) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
        return { success: false, error: "プロンプトが指定されていません" };
      }
      try {
        const evaluation = await promptOptimizer.evaluate(args.prompt);
        return { success: true, data: evaluation };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "プロンプト評価に失敗しました",
        };
      }
    },
  );
}

/**
 * スキル管理IPCハンドラーを解除する
 */
export function unregisterSkillHandlers(): void {
  _skillExecutorInstance = null;
  // TASK-FIX-4-1-IPC-CONSOLIDATION: unified channels
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_LIST);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCAN); // TASK-FIX-17-1-SKILL-SCAN-HANDLER
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_GET_IMPORTED);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_IMPORT);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_REMOVE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_GET_DETAIL);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_EXECUTE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ABORT);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_GET_STATUS);
  // TASK-9C: スキル改善・自動修正機能
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYZE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_IMPROVE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_OPTIMIZE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_OPTIMIZE_VARIANTS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE);
}
