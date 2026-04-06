/**
 * Runtime Skill Creator IPC handlers
 *
 * RuntimeSkillCreatorFacade を public `skill-creator:*` surface に接続する。
 */

import { ipcMain, type BrowserWindow, type IpcMainInvokeEvent } from "electron";
import type {
  RuntimeSkillCreatorImproveResponse,
  RuntimeSkillCreatorImproveSuggestion,
  RuntimeSkillCreatorPlanResponse,
  LLMAdapterStatus,
  LLMAdapterStatusPayload,
  SkillCreatorUserInputSubmission,
  SkillCreatorWorkflowUiSnapshot,
  RuntimeSkillCreatorReverifyResponse,
  RuntimeSkillCreatorVerifyDetailResponse,
  ApplyImprovementResult,
  SkillCreatorSdkEvent,
  SkillCreatorSessionResumeResult,
  SkillCreatorGovernanceState,
} from "@repo/shared/types";
import type { AuthMode } from "@repo/shared/types/auth-mode";
import { IPC_CHANNELS } from "../../preload/channels";
import type { RuntimeSkillCreatorFacade } from "../services/runtime/RuntimeSkillCreatorFacade";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
import { sanitizeErrorMessage } from "./sanitizeErrorMessage";

interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const RUNTIME_SKILL_CREATOR_UNAVAILABLE =
  "Runtime Skill Creator は現在利用できません";

let registeredRuntimeSkillCreatorService: RuntimeSkillCreatorFacade | undefined;

function validationError(message: string): IpcResult<never> {
  return { success: false, error: message };
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value === "" || value.trim() === "";
}

function isSuggestion(
  value: unknown,
): value is RuntimeSkillCreatorImproveSuggestion {
  return (
    value != null &&
    typeof value === "object" &&
    "section" in value &&
    typeof value.section === "string" &&
    "before" in value &&
    typeof value.before === "string" &&
    "after" in value &&
    typeof value.after === "string" &&
    "reason" in value &&
    typeof value.reason === "string"
  );
}

function validateSuggestions(suggestions: unknown): IpcResult<never> | null {
  if (!Array.isArray(suggestions)) {
    return validationError("suggestions が配列ではありません");
  }
  if (suggestions.length === 0) {
    return validationError("suggestions が空です");
  }
  if (suggestions.length > 100) {
    return validationError("suggestions が上限（100件）を超えています");
  }
  for (let i = 0; i < suggestions.length; i++) {
    if (!isSuggestion(suggestions[i])) {
      return validationError(
        `suggestions[${i}] の構造が不正です（section/before/after/reason は全て string 必須）`,
      );
    }
  }
  return null;
}

function validateSender(
  event: IpcMainInvokeEvent,
  channel: string,
  mainWindow: BrowserWindow,
): void {
  const validation = validateIpcSender(event, channel, {
    getAllowedWindows: () => [mainWindow],
  });
  if (!validation.valid) {
    throw toIPCValidationError(validation);
  }
}

function emitWorkflowStateChanged(
  mainWindow: BrowserWindow,
  snapshot: SkillCreatorWorkflowUiSnapshot | null,
  errorMessage?: string,
): void {
  if (mainWindow.isDestroyed()) {
    return;
  }
  if (errorMessage !== undefined) {
    mainWindow.webContents.send(
      IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      snapshot,
      errorMessage,
    );
    return;
  }
  if (snapshot) {
    mainWindow.webContents.send(
      IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      snapshot,
    );
  }
}

function toAdapterStatusPayload(
  status: LLMAdapterStatus,
  failureReason: string | null,
): LLMAdapterStatusPayload {
  return {
    status,
    failureReason: status === "failed" ? failureReason : null,
  };
}

function emitAdapterStatusChanged(
  mainWindow: BrowserWindow,
  payload: LLMAdapterStatusPayload,
): void {
  if (mainWindow.isDestroyed()) {
    return;
  }
  mainWindow.webContents.send(
    IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
    payload,
  );
}

export function registerRuntimeSkillCreatorHandlers(
  mainWindow: BrowserWindow,
  runtimeSkillCreatorService?: RuntimeSkillCreatorFacade,
): void {
  registeredRuntimeSkillCreatorService = runtimeSkillCreatorService;

  // fire-and-forget 完了通知のワイヤリング:
  // executeAsync が snapshot 更新を行った際に SKILL_CREATOR_WORKFLOW_STATE_CHANGED イベントで Renderer に通知する
  if (runtimeSkillCreatorService) {
    runtimeSkillCreatorService.onWorkflowStateSnapshot = (
      _planId,
      snapshot,
      errorMessage,
    ) => {
      if (snapshot || errorMessage !== undefined) {
        emitWorkflowStateChanged(mainWindow, snapshot, errorMessage);
      }
    };
    runtimeSkillCreatorService.onAdapterStatusChanged = (
      status,
      failureReason,
    ) => {
      emitAdapterStatusChanged(
        mainWindow,
        toAdapterStatusPayload(status, failureReason),
      );
    };
  }

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_PLAN,
    async (
      event: IpcMainInvokeEvent,
      args: { prompt: string; authMode?: AuthMode; apiKey?: string | null },
    ): Promise<IpcResult<RuntimeSkillCreatorPlanResponse>> => {
      validateSender(event, IPC_CHANNELS.SKILL_CREATOR_PLAN, mainWindow);

      if (isBlank(args?.prompt)) {
        return validationError("プロンプトが指定されていません");
      }
      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        const result = await runtimeSkillCreatorService.plan(
          args.prompt.trim(),
          args.authMode ?? "api-key",
          args.apiKey ?? null,
        );
        if ("planId" in result) {
          const snapshot = runtimeSkillCreatorService.getWorkflowStateSnapshot(
            result.planId,
          );
          if (snapshot) {
            emitWorkflowStateChanged(mainWindow, snapshot);
          }
        }
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(
            error,
            "Runtime plan の実行に失敗しました",
          ),
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
    async (
      event: IpcMainInvokeEvent,
    ): Promise<IpcResult<LLMAdapterStatusPayload>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
        mainWindow,
      );

      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        return {
          success: true,
          data: toAdapterStatusPayload(
            runtimeSkillCreatorService.llmAdapterStatus,
            runtimeSkillCreatorService.llmAdapterFailureReason,
          ),
        };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(
            error,
            "LLMAdapter 状態の取得に失敗しました",
          ),
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
    async (
      event: IpcMainInvokeEvent,
    ): Promise<IpcResult<LLMAdapterStatusPayload>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
        mainWindow,
      );

      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        return {
          success: true,
          data: toAdapterStatusPayload(
            runtimeSkillCreatorService.llmAdapterStatus,
            runtimeSkillCreatorService.llmAdapterFailureReason,
          ),
        };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(
            error,
            "LLMAdapter 状態の取得に失敗しました",
          ),
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
    async (
      event: IpcMainInvokeEvent,
      args: {
        planId: string;
        skillSpec: string;
        authMode?: AuthMode;
        apiKey?: string | null;
      },
    ): Promise<IpcResult<never> | { accepted: true; planId: string }> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
        mainWindow,
      );

      if (isBlank(args?.planId)) {
        return validationError("planId が指定されていません");
      }
      if (isBlank(args?.skillSpec)) {
        return validationError("skillSpec が指定されていません");
      }
      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      const planId = args.planId.trim();
      // fire-and-forget: バックグラウンドで非同期実行
      // snapshot 通知は executeAsync → onWorkflowStateSnapshot → SKILL_CREATOR_WORKFLOW_STATE_CHANGED に流れる
      void runtimeSkillCreatorService.executeAsync(planId, args);
      return { accepted: true, planId };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE,
    async (
      event: IpcMainInvokeEvent,
      args: { planId: string },
    ): Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE,
        mainWindow,
      );

      if (isBlank(args?.planId)) {
        return validationError("planId が指定されていません");
      }
      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      const snapshot = runtimeSkillCreatorService.getWorkflowStateSnapshot(
        args.planId.trim(),
      );
      if (!snapshot) {
        return validationError("workflow state が見つかりません");
      }

      return { success: true, data: snapshot };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT,
    async (
      event: IpcMainInvokeEvent,
      args: SkillCreatorUserInputSubmission,
    ): Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT,
        mainWindow,
      );

      if (isBlank(args?.planId)) {
        return validationError("planId が指定されていません");
      }
      if (isBlank(args?.requestId)) {
        return validationError("requestId が指定されていません");
      }
      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        const snapshot = runtimeSkillCreatorService.submitUserInput(
          args.planId.trim(),
          args,
        );
        emitWorkflowStateChanged(mainWindow, snapshot);
        return { success: true, data: snapshot };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(
            error,
            "workflow user input の送信に失敗しました",
          ),
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL,
    async (
      event: IpcMainInvokeEvent,
      args: {
        skillName: string;
        feedback: string;
        authMode?: AuthMode;
        apiKey?: string | null;
      },
    ): Promise<IpcResult<RuntimeSkillCreatorImproveResponse>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL,
        mainWindow,
      );

      if (isBlank(args?.skillName)) {
        return validationError("skillName が指定されていません");
      }
      if (isBlank(args?.feedback)) {
        return validationError("feedback が指定されていません");
      }
      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        const result = await runtimeSkillCreatorService.improve(
          args.skillName.trim(),
          args.feedback.trim(),
          args.authMode ?? "api-key",
          args.apiKey ?? null,
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(
            error,
            "Runtime improve の実行に失敗しました",
          ),
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
    async (
      event: IpcMainInvokeEvent,
      args: {
        skillName: string;
        suggestions: RuntimeSkillCreatorImproveSuggestion[];
      },
    ): Promise<IpcResult<ApplyImprovementResult>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
        mainWindow,
      );

      if (isBlank(args?.skillName)) {
        return validationError("skillName が指定されていません");
      }

      const suggestionsError = validateSuggestions(args?.suggestions);
      if (suggestionsError) {
        return suggestionsError;
      }

      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        const result = await runtimeSkillCreatorService.applyImprovement(
          args.skillName.trim(),
          args.suggestions,
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(error, "改善提案の適用に失敗しました"),
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_GET_VERIFY_DETAIL,
    async (
      event: IpcMainInvokeEvent,
      args: { planId: string },
    ): Promise<IpcResult<RuntimeSkillCreatorVerifyDetailResponse>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_GET_VERIFY_DETAIL,
        mainWindow,
      );

      if (isBlank(args?.planId)) {
        return validationError("planId が指定されていません");
      }
      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        const result = runtimeSkillCreatorService.getVerifyDetail(
          args.planId.trim(),
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(
            error,
            "verify detail の取得に失敗しました",
          ),
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_REVERIFY_WORKFLOW,
    async (
      event: IpcMainInvokeEvent,
      args: { planId: string },
    ): Promise<IpcResult<RuntimeSkillCreatorReverifyResponse>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_REVERIFY_WORKFLOW,
        mainWindow,
      );

      if (isBlank(args?.planId)) {
        return validationError("planId が指定されていません");
      }
      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        const result = runtimeSkillCreatorService.reverifyWorkflow(
          args.planId.trim(),
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(error, "再検証の要求に失敗しました"),
        };
      }
    },
  );

  // SDK Message 正規化 (TASK-RT-06)
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_NORMALIZE_SDK_MESSAGES,
    async (
      event: IpcMainInvokeEvent,
      args: { messages: unknown[] },
    ): Promise<IpcResult<SkillCreatorSdkEvent[]>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_NORMALIZE_SDK_MESSAGES,
        mainWindow,
      );

      if (!Array.isArray(args?.messages)) {
        return validationError("messages が配列ではありません");
      }
      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        const events = runtimeSkillCreatorService.normalizeSdkStream(
          args.messages,
        );
        return { success: true, data: events };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(
            error,
            "SDK メッセージ正規化に失敗しました",
          ),
        };
      }
    },
  );

  // ── Session Resume handlers (TASK-P0-08) ──

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS,
    async (event: IpcMainInvokeEvent) => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS,
        mainWindow,
      );
      if (!runtimeSkillCreatorService) {
        return { success: false, error: RUNTIME_SKILL_CREATOR_UNAVAILABLE };
      }
      return { success: true, data: runtimeSkillCreatorService.listSessions() };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL,
    async (event: IpcMainInvokeEvent, args: { checkpointId: string }) => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL,
        mainWindow,
      );
      if (!args?.checkpointId?.trim()) {
        return { success: false, error: "checkpointId が指定されていません" };
      }
      if (!runtimeSkillCreatorService) {
        return { success: false, error: RUNTIME_SKILL_CREATOR_UNAVAILABLE };
      }
      const detail = runtimeSkillCreatorService.getSessionDetail(
        args.checkpointId,
      );
      if (!detail) {
        return { success: false, error: "セッションが見つかりません" };
      }
      return { success: true, data: detail };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION,
    async (
      event: IpcMainInvokeEvent,
      args: { checkpointId: string },
    ): Promise<SkillCreatorSessionResumeResult> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION,
        mainWindow,
      );
      if (!args?.checkpointId?.trim()) {
        return { success: false, error: "checkpointId が指定されていません" };
      }
      if (!runtimeSkillCreatorService) {
        return {
          success: false,
          error: RUNTIME_SKILL_CREATOR_UNAVAILABLE,
          errorReason: "not_found",
        };
      }
      const resumeResult = runtimeSkillCreatorService.resumeSessionWithResult(
        args.checkpointId,
      );
      if (!resumeResult.success || !resumeResult.workflowSnapshot) {
        const reason = resumeResult.errorReason;
        return {
          success: false,
          error:
            reason === "expired"
              ? "セッションの有効期限が切れています"
              : reason === "incompatible"
                ? "セッションが現在の環境と互換性がありません"
                : reason === "not_found"
                  ? "セッションが見つかりません"
                  : "セッションの復元に失敗しました",
          errorReason: reason ?? "not_found",
        };
      }
      mainWindow.webContents.send(
        IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
        resumeResult.workflowSnapshot,
      );
      return resumeResult;
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION,
    async (event: IpcMainInvokeEvent, args: { checkpointId: string }) => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION,
        mainWindow,
      );
      if (!args?.checkpointId?.trim()) {
        throw new Error("checkpointId が指定されていません");
      }
      if (!runtimeSkillCreatorService) {
        throw new Error(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }
      runtimeSkillCreatorService.deleteSession(args.checkpointId);
      return;
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS,
    async (event: IpcMainInvokeEvent): Promise<number> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS,
        mainWindow,
      );
      if (!runtimeSkillCreatorService) {
        return 0;
      }
      return runtimeSkillCreatorService.cleanupExpiredSessions();
    },
  );

  // Governance State 取得 (TASK-P0-09)
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE,
    async (
      event: IpcMainInvokeEvent,
    ): Promise<IpcResult<SkillCreatorGovernanceState>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE,
        mainWindow,
      );

      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        const state = runtimeSkillCreatorService.getGovernanceState();
        return { success: true, data: state };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(
            error,
            "Governance 状態の取得に失敗しました",
          ),
        };
      }
    },
  );
}

export function unregisterRuntimeSkillCreatorHandlers(): void {
  if (registeredRuntimeSkillCreatorService) {
    registeredRuntimeSkillCreatorService.onWorkflowStateSnapshot = undefined;
    registeredRuntimeSkillCreatorService.onAdapterStatusChanged = undefined;
    registeredRuntimeSkillCreatorService = undefined;
  }

  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_VERIFY_DETAIL);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_REVERIFY_WORKFLOW);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_NORMALIZE_SDK_MESSAGES);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE);
}
