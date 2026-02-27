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
import type { SkillName } from "@repo/shared/types/skill";
import type {
  SkillExecutionRequest,
  SkillAnalyzeRequest,
  SkillImproveRequest,
  SkillOptimizeRequest,
  SkillOptimizeVariantsRequest,
  SkillOptimizeEvaluateRequest,
  ScheduledSkill,
} from "@repo/shared";
import type { SkillScheduler } from "../services/skill/SkillScheduler";
import type { ScheduleStore } from "../services/skill/ScheduleStore";

// Module-level SkillExecutor instance for abort/getExecutionStatus
let _skillExecutorInstance: SkillExecutor | null = null;

// UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001: エラーサニタイゼーション
const STACK_TRACE_PATTERN = /\n\s+at\s+.*/g;
const UNIX_PATH_PATTERN = /\/[\w./\\-]+/g;
const WINDOWS_PATH_PATTERN = /[A-Z]:\\[\w.\\-]+/gi;
const SENSITIVE_DATA_PATTERN = /(token|key|password|secret)=\S+/gi;
const IP_ADDRESS_PATTERN = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?/g;
const JS_RUNTIME_ERROR_PATTERN =
  /Cannot read properties? of (undefined|null).*$/;
const DEFAULT_ERROR_MESSAGE = "スキル処理でエラーが発生しました";

/**
 * エラーメッセージをサニタイズし、内部情報の漏洩を防止する
 * - スタックトレースを除去
 * - Unixパス・Windowsパスを [path] に置換
 * - IPアドレス:ポートを [host] に置換
 * - JavaScriptランタイムエラーを汎用メッセージに置換
 * - 機密情報（token, key, password, secret）をマスク
 */
function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return DEFAULT_ERROR_MESSAGE;
  }

  let message = error.message;

  // JavaScriptランタイムエラーは内部実装の詳細を含むため汎用メッセージに置換
  if (JS_RUNTIME_ERROR_PATTERN.test(message)) {
    return DEFAULT_ERROR_MESSAGE;
  }

  message = message.replace(STACK_TRACE_PATTERN, "");
  message = message.replace(UNIX_PATH_PATTERN, "[path]");
  message = message.replace(WINDOWS_PATH_PATTERN, "[path]");
  message = message.replace(IP_ADDRESS_PATTERN, "[host]");
  message = message.replace(SENSITIVE_DATA_PATTERN, "$1=***");

  return message || DEFAULT_ERROR_MESSAGE;
}

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
        log.error("[skillHandlers] skill:list failed:", error);
        return {
          success: false,
          error: sanitizeErrorMessage(error),
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
      log.error("[skillHandlers] skill:scan failed:", error);
      return {
        success: false,
        error: sanitizeErrorMessage(error),
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
          error: sanitizeErrorMessage(error),
        };
      }
    },
  );

  // skill:import - スキルをインポート（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001: ImportedSkill型を返す）
  ipcMain.handle(
    IPC_CHANNELS.SKILL_IMPORT,
    async (event: IpcMainInvokeEvent, skillName: SkillName) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_IMPORT, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      // P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
      if (typeof skillName !== "string" || skillName.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "skillName must be a non-empty string",
        };
      }

      // Step 1: インポート実行
      const result = await skillService.importSkills([skillName]);

      // Step 2: インポート成功時、ImportedSkill を取得して返す
      if (result.success && result.importedCount > 0) {
        const importedSkill = await skillService.getSkillByName(skillName);
        if (importedSkill) {
          return importedSkill;
        }
      }

      // Step 3: インポート失敗またはスキル取得失敗時はエラー
      throw {
        code: "IMPORT_ERROR",
        message:
          result.errors.length > 0
            ? result.errors.join(", ")
            : `Failed to import skill: ${skillName}`,
      };
    },
  );

  // skill:remove - スキルを削除
  ipcMain.handle(
    IPC_CHANNELS.SKILL_REMOVE,
    async (event: IpcMainInvokeEvent, skillName: SkillName) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_REMOVE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      // P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
      if (typeof skillName !== "string" || skillName.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "skillName must be a non-empty string",
        };
      }
      return skillService.removeSkill(skillName);
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
      if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "skillId must be a non-empty string",
        };
      }
      try {
        const skill = await skillService.getSkillById(args.skillId);
        if (skill) {
          return { success: true, data: skill };
        }
        return { success: false, error: "スキルが見つかりません" };
      } catch (error) {
        log.error("[skillHandlers] skill:get-detail failed:", error);
        return {
          success: false,
          error: sanitizeErrorMessage(error),
        };
      }
    },
  );

  // skill:execute - スキルを実行
  ipcMain.handle(
    IPC_CHANNELS.SKILL_EXECUTE,
    async (
      event: IpcMainInvokeEvent,
      args:
        | SkillExecutionRequest
        | { skillId: string; params?: Record<string, unknown> },
    ) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      const isSkillNameRequest = (
        payload: SkillExecutionRequest | { skillId: string },
      ): payload is SkillExecutionRequest =>
        typeof payload === "object" &&
        payload !== null &&
        "skillName" in payload;

      const hasSkillName = isSkillNameRequest(args);
      if (hasSkillName) {
        if (
          typeof args.skillName !== "string" ||
          args.skillName.trim() === ""
        ) {
          throw {
            code: "VALIDATION_ERROR",
            message: "skillName must be a non-empty string",
          };
        }
      } else if (
        typeof args?.skillId !== "string" ||
        args.skillId.trim() === ""
      ) {
        throw {
          code: "VALIDATION_ERROR",
          message: "skillId must be a non-empty string",
        };
      }

      try {
        if (hasSkillName) {
          // Main service executes by skillId; resolve from name to align with preload contract.
          const { skills } = await skillService.scanAvailableSkills();
          const skill = skills.find((item) => item.name === args.skillName);
          if (!skill) {
            return { success: false, error: "スキルが見つかりません" };
          }

          const result = await skillService.executeSkill(skill.id, {
            prompt: args.prompt,
          });
          return { success: true, data: result };
        }

        const result = await skillService.executeSkill(
          args.skillId,
          args.params,
        );
        return { success: true, data: result };
      } catch (error) {
        log.error("[skillHandlers] skill:execute failed:", error);
        return {
          success: false,
          error: sanitizeErrorMessage(error),
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
      if (typeof executionId !== "string" || executionId.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "executionId must be a non-empty string",
        };
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
      if (typeof executionId !== "string" || executionId.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "executionId must be a non-empty string",
        };
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
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "skillName must be a non-empty string",
        };
      }
      try {
        const skill = await skillService.getSkillByName(args.skillName);
        if (!skill) {
          return { success: false, error: "スキルが見つかりません" };
        }
        const analysis = await skillAnalyzer.analyze(skill);
        return { success: true, data: analysis };
      } catch (error) {
        log.error("[skillHandlers] skill:analyze failed:", error);
        return {
          success: false,
          error: sanitizeErrorMessage(error),
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
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "skillName must be a non-empty string",
        };
      }
      if (!args.analysis) {
        throw {
          code: "VALIDATION_ERROR",
          message: "analysis must be provided",
        };
      }
      try {
        const result = await skillImprover.applyImprovements(
          args.skillName,
          args.analysis,
          args.options,
        );
        return { success: true, data: result };
      } catch (error) {
        log.error("[skillHandlers] skill:improve failed:", error);
        return {
          success: false,
          error: sanitizeErrorMessage(error),
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
      // UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001: throw統一（return→throw）
      if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "prompt must be a non-empty string",
        };
      }
      try {
        const result = await promptOptimizer.optimize(args.prompt);
        return { success: true, data: result };
      } catch (error) {
        log.error("[skillHandlers] skill:optimize failed:", error);
        return {
          success: false,
          error: sanitizeErrorMessage(error),
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
      // UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001: throw統一（return→throw）
      if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "prompt must be a non-empty string",
        };
      }
      try {
        const variants = await promptOptimizer.generateVariants(
          args.prompt,
          args.count,
        );
        return { success: true, data: variants };
      } catch (error) {
        log.error("[skillHandlers] skill:optimize:variants failed:", error);
        return {
          success: false,
          error: sanitizeErrorMessage(error),
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
      // UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001: throw統一（return→throw）
      if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "prompt must be a non-empty string",
        };
      }
      try {
        const evaluation = await promptOptimizer.evaluate(args.prompt);
        return { success: true, data: evaluation };
      } catch (error) {
        log.error("[skillHandlers] skill:optimize:evaluate failed:", error);
        return {
          success: false,
          error: sanitizeErrorMessage(error),
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

// ========================================
// TASK-9G: スキルスケジュール実行機能
// ========================================

/**
 * P42準拠 3段バリデーション: 文字列引数を検証する
 *
 * @param value - 検証対象の値
 * @param argName - 引数名（エラーメッセージ用）
 * @returns 検証成功時は null、失敗時はエラーレスポンスオブジェクト
 */
function validateStringArg(
  value: unknown,
  argName: string,
): { success: false; error: string } | null {
  if (typeof value !== "string" || value.trim() === "") {
    return {
      success: false,
      error: `${argName} must be a non-empty string`,
    };
  }
  return null;
}

/**
 * IPC エラーレスポンスを構築する
 *
 * @param error - キャッチされたエラー
 * @returns 統一されたエラーレスポンス
 */
function toIpcErrorResponse(error: unknown): {
  success: false;
  error: string;
} {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Internal error",
  };
}

/**
 * スキルスケジュール管理IPCハンドラーを登録する
 *
 * @param mainWindow メインウィンドウ
 * @param skillScheduler スケジューラサービス
 * @param scheduleStore スケジュールストア
 */
export function registerSkillScheduleHandlers(
  mainWindow: BrowserWindow,
  skillScheduler: SkillScheduler,
  scheduleStore: ScheduleStore,
): void {
  // skill:schedule:list - スケジュール一覧を取得
  ipcMain.handle(
    IPC_CHANNELS.SKILL_SCHEDULE_LIST,
    async (event: IpcMainInvokeEvent) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_SCHEDULE_LIST,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }
      try {
        const schedules = scheduleStore.getAll();
        return { success: true, data: schedules };
      } catch (error) {
        return toIpcErrorResponse(error);
      }
    },
  );

  // skill:schedule:add - スケジュールを追加
  ipcMain.handle(
    IPC_CHANNELS.SKILL_SCHEDULE_ADD,
    async (
      event: IpcMainInvokeEvent,
      args: Omit<ScheduledSkill, "id" | "runHistory">,
    ) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_SCHEDULE_ADD,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }

      // P42準拠: 3段バリデーション（共通関数使用）
      const skillNameError = validateStringArg(args?.skillName, "skillName");
      if (skillNameError) return skillNameError;

      const promptError = validateStringArg(args?.prompt, "prompt");
      if (promptError) return promptError;

      // スケジュール種別ごとのバリデーション
      if (!args.schedule || typeof args.schedule.type !== "string") {
        return {
          success: false,
          error: "schedule.type is required",
        };
      }
      if (
        args.schedule.type === "cron" &&
        (typeof args.schedule.cronExpression !== "string" ||
          args.schedule.cronExpression.trim() === "")
      ) {
        return {
          success: false,
          error: "cronExpression is required for cron schedule type",
        };
      }
      if (args.schedule.type === "interval") {
        if (
          typeof args.schedule.interval !== "number" ||
          args.schedule.interval <= 0
        ) {
          return {
            success: false,
            error: "interval must be a positive number",
          };
        }
      }

      try {
        const schedule = await skillScheduler.addSchedule(args);
        return { success: true, data: schedule };
      } catch (error) {
        return toIpcErrorResponse(error);
      }
    },
  );

  // skill:schedule:update - スケジュールを更新
  ipcMain.handle(
    IPC_CHANNELS.SKILL_SCHEDULE_UPDATE,
    async (
      event: IpcMainInvokeEvent,
      args: { id: string; updates: Partial<ScheduledSkill> },
    ) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_SCHEDULE_UPDATE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }

      // P42準拠: 3段バリデーション（共通関数使用）
      const idError = validateStringArg(args?.id, "id");
      if (idError) return idError;

      try {
        await skillScheduler.updateSchedule(args.id, args.updates);
        return { success: true };
      } catch (error) {
        return toIpcErrorResponse(error);
      }
    },
  );

  // skill:schedule:delete - スケジュールを削除
  ipcMain.handle(
    IPC_CHANNELS.SKILL_SCHEDULE_DELETE,
    async (event: IpcMainInvokeEvent, args: { id: string }) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_SCHEDULE_DELETE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }

      // P42準拠: 3段バリデーション（共通関数使用）
      const idError = validateStringArg(args?.id, "id");
      if (idError) return idError;

      try {
        await skillScheduler.deleteSchedule(args.id);
        return { success: true };
      } catch (error) {
        return toIpcErrorResponse(error);
      }
    },
  );

  // skill:schedule:toggle - スケジュールの有効/無効を切り替え
  ipcMain.handle(
    IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE,
    async (event: IpcMainInvokeEvent, args: { id: string }) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }

      // P42準拠: 3段バリデーション（共通関数使用）
      const idError = validateStringArg(args?.id, "id");
      if (idError) return idError;

      try {
        const schedule = scheduleStore.getById(args.id);
        if (!schedule) {
          return {
            success: false,
            error: `Schedule not found: ${args.id}`,
          };
        }

        if (schedule.enabled) {
          await skillScheduler.disableSchedule(args.id);
        } else {
          await skillScheduler.enableSchedule(args.id);
        }

        // 更新後のスケジュールを返す
        const updated = scheduleStore.getById(args.id);
        return { success: true, data: updated };
      } catch (error) {
        return toIpcErrorResponse(error);
      }
    },
  );
}

/**
 * スキルスケジュール管理IPCハンドラーを解除する
 */
export function unregisterSkillScheduleHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_LIST);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_ADD);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_UPDATE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_DELETE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE);
}
