/**
 * Agent Execution IPC Handlers
 *
 * Claude Agent SDK統合のためのIPCハンドラー
 * ExecutionManagerを介してエージェント実行を管理
 *
 * @see docs/30-workflows/claude-code-integration/outputs/phase-2/architecture-design.md
 */
import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { ExecutionManager } from "../services/agent";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
import type {
  AgentExecutionRequest,
  AgentStartResult,
  PermissionResponse,
  PermissionRules,
} from "@repo/shared";
import type { IAuthModeService } from "../services/auth/types";
import type { EnvironmentPreviewContent } from "@repo/shared/types/agent";
import type { EnvironmentService } from "../services/environment";
import { TerminalHandoffBuilder } from "../services/runtime/TerminalHandoffBuilder";
import type { IRuntimePolicyResolver } from "../services/runtime/RuntimePolicyResolver";
import type { IApprovalGate } from "../services/runtime/ApprovalGate";

// シングルトンのExecutionManager
let executionManager: ExecutionManager | null = null;

/**
 * エージェント実行IPCハンドラーを登録する
 * @param mainWindow メインウィンドウ
 * @param approvalGate ApprovalGate インスタンス
 * @param customRules カスタム権限ルール（オプション）
 */
export function registerAgentExecutionHandlers(
  mainWindow: BrowserWindow,
  approvalGate: IApprovalGate,
  customRules?: PermissionRules,
  runtimePolicyResolver?: IRuntimePolicyResolver,
  authModeService?: IAuthModeService,
): void {
  // ExecutionManagerを初期化
  executionManager = new ExecutionManager();

  // agent:start - エージェント実行を開始
  ipcMain.handle(
    IPC_CHANNELS.AGENT_EXECUTION_START,
    async (event: IpcMainInvokeEvent, request: AgentExecutionRequest) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.AGENT_EXECUTION_START,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (!request?.prompt || typeof request.prompt !== "string") {
        throw { code: "VALIDATION_ERROR", message: "prompt must be a string" };
      }

      // Runtime routing: central policy による handoff 分岐
      if (runtimePolicyResolver && authModeService) {
        const decision = await runtimePolicyResolver.resolveWithService(
          authModeService.getMode(),
        );
        if (decision.type === "terminal_handoff") {
          const reason = decision.bundle.manualRetryRule;
          const builder = new TerminalHandoffBuilder();
          const response: AgentStartResult = {
            success: false,
            handoff: true,
            error: reason,
            guidance: builder.buildForSurface(
              {
                surfaceType: "runtime",
                runtimeType: "agent",
                skillId: request.skillId,
                prompt: request.prompt,
                workingDirectory: request.workingDirectory,
              },
              reason,
            ),
          };
          return response;
        }
      }

      if (!executionManager) {
        throw {
          code: "NOT_INITIALIZED",
          message: "ExecutionManager not initialized",
        };
      }

      const executionId = await executionManager.startExecution(
        request,
        mainWindow,
        approvalGate,
        customRules,
      );

      return { success: true, executionId };
    },
  );

  // agent:stop - 特定の実行を停止
  ipcMain.handle(
    IPC_CHANNELS.AGENT_EXECUTION_STOP,
    async (event: IpcMainInvokeEvent, args: { executionId: string }) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.AGENT_EXECUTION_STOP,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (typeof args?.executionId !== "string") {
        throw {
          code: "VALIDATION_ERROR",
          message: "executionId must be a string",
        };
      }

      if (!executionManager) {
        throw {
          code: "NOT_INITIALIZED",
          message: "ExecutionManager not initialized",
        };
      }

      const success = executionManager.stopExecution(args.executionId);
      return { success };
    },
  );

  // agent:stop-all - すべての実行を停止
  ipcMain.handle(
    IPC_CHANNELS.AGENT_EXECUTION_STOP_ALL,
    async (event: IpcMainInvokeEvent) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.AGENT_EXECUTION_STOP_ALL,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (!executionManager) {
        throw {
          code: "NOT_INITIALIZED",
          message: "ExecutionManager not initialized",
        };
      }

      executionManager.stopAllExecutions();
      return { success: true };
    },
  );

  // agent:get-active-executions - アクティブな実行一覧を取得
  ipcMain.handle(
    IPC_CHANNELS.AGENT_EXECUTION_GET_ACTIVE,
    async (event: IpcMainInvokeEvent) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.AGENT_EXECUTION_GET_ACTIVE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (!executionManager) {
        throw {
          code: "NOT_INITIALIZED",
          message: "ExecutionManager not initialized",
        };
      }

      const executions = executionManager.getActiveExecutions();
      return { executions };
    },
  );

  // agent:permission:res - Permission応答を受け取る
  ipcMain.handle(
    IPC_CHANNELS.AGENT_EXECUTION_PERMISSION_RES,
    async (event: IpcMainInvokeEvent, response: PermissionResponse) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.AGENT_EXECUTION_PERMISSION_RES,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (typeof response?.requestId !== "string") {
        throw {
          code: "VALIDATION_ERROR",
          message: "requestId must be a string",
        };
      }

      if (typeof response?.approved !== "boolean") {
        throw {
          code: "VALIDATION_ERROR",
          message: "approved must be a boolean",
        };
      }

      if (!executionManager) {
        throw {
          code: "NOT_INITIALIZED",
          message: "ExecutionManager not initialized",
        };
      }

      // executionIdを取得するために、すべてのアクティブな実行を試行
      const activeExecutions = executionManager.getActiveExecutions();
      let resolved = false;

      for (const executionId of activeExecutions) {
        if (executionManager.resolvePermission(executionId, response)) {
          resolved = true;
          break;
        }
      }

      return { success: resolved };
    },
  );
}

/**
 * エージェント実行IPCハンドラーを解除する
 */
export function unregisterAgentExecutionHandlers(): void {
  // すべての実行を停止
  if (executionManager) {
    executionManager.stopAllExecutions();
    executionManager = null;
  }

  // ハンドラーを解除
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_EXECUTION_START);
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_EXECUTION_STOP);
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_EXECUTION_STOP_ALL);
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_EXECUTION_GET_ACTIVE);
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_EXECUTION_PERMISSION_RES);
}

/**
 * ExecutionManagerのインスタンスを取得（テスト用）
 */
export function getExecutionManager(): ExecutionManager | null {
  return executionManager;
}

// ============================================
// Environment Backend Handlers (AGENT-007)
// ============================================

/**
 * Environment Backend用IPCハンドラーを登録する
 * @param environmentService EnvironmentServiceインスタンス
 */
export function registerEnvironmentHandlers(
  environmentService: EnvironmentService,
): void {
  // agent:extract-content - コンテンツ抽出・サニタイズ
  ipcMain.handle(
    IPC_CHANNELS.AGENT_EXTRACT_CONTENT,
    async (
      _event: IpcMainInvokeEvent,
      args: { text: string; executionId: string },
    ): Promise<EnvironmentPreviewContent> => {
      // 引数バリデーション
      if (typeof args?.text !== "string") {
        throw { code: "VALIDATION_ERROR", message: "text must be a string" };
      }
      if (typeof args?.executionId !== "string" || !args.executionId) {
        throw {
          code: "VALIDATION_ERROR",
          message: "executionId must be a non-empty string",
        };
      }

      return environmentService.extractAndSanitize(args.text, args.executionId);
    },
  );

  // agent:get-preview-content - プレビューコンテンツ取得
  ipcMain.handle(
    IPC_CHANNELS.AGENT_GET_PREVIEW_CONTENT,
    async (
      _event: IpcMainInvokeEvent,
      args: { executionId: string },
    ): Promise<EnvironmentPreviewContent | null> => {
      // 引数バリデーション
      if (typeof args?.executionId !== "string") {
        throw {
          code: "VALIDATION_ERROR",
          message: "executionId must be a string",
        };
      }

      return environmentService.getPreviewContent(args.executionId);
    },
  );

  // agent:cleanup-temp-files - 一時ファイルクリーンアップ
  ipcMain.handle(
    IPC_CHANNELS.AGENT_CLEANUP_TEMP_FILES,
    async (): Promise<boolean> => {
      await environmentService.cleanupTempFiles();
      return true;
    },
  );
}

/**
 * Environment Backend用IPCハンドラーを解除する
 */
export function unregisterEnvironmentHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_EXTRACT_CONTENT);
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_GET_PREVIEW_CONTENT);
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_CLEANUP_TEMP_FILES);
}

/**
 * Agent Skills IPCハンドラーを登録する (UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 Rule-2 fix)
 * 将来の実装タスク: UT-FIX-IPC-MAIN-HANDLER-IMPL-001
 */
export function registerAgentSkillHandlers(mainWindow: BrowserWindow): void {
  // agent:get-skills - スキル一覧取得
  ipcMain.handle(
    IPC_CHANNELS.AGENT_GET_SKILLS,
    async (_event: IpcMainInvokeEvent) => {
      return { success: true, data: [] };
    },
  );

  // agent:get-skill-detail - スキル詳細取得
  ipcMain.handle(
    IPC_CHANNELS.AGENT_GET_SKILL_DETAIL,
    async (_event: IpcMainInvokeEvent, _skillId: string) => {
      return { success: true, data: null };
    },
  );

  // agent:execute - エージェント実行
  ipcMain.handle(
    IPC_CHANNELS.AGENT_EXECUTE,
    async (_event: IpcMainInvokeEvent, _request: unknown) => {
      return { success: true, data: null };
    },
  );

  // agent:permission-respond - 権限リクエスト応答
  ipcMain.handle(
    IPC_CHANNELS.AGENT_PERMISSION_RESPOND,
    async (_event: IpcMainInvokeEvent, _response: unknown) => {
      mainWindow.webContents.send(IPC_CHANNELS.AGENT_PERMISSION_REQUEST, null);
      return { success: true };
    },
  );
}

export function unregisterAgentSkillHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_GET_SKILLS);
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_GET_SKILL_DETAIL);
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_EXECUTE);
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_PERMISSION_RESPOND);
}
