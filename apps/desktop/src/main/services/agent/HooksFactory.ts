/**
 * HooksFactory - SDK Hooksオブジェクトの生成
 *
 * Claude Agent SDK統合のためのHooksシステム実装
 * PreToolUse, PostToolUse, PermissionRequest Hookを提供
 *
 * @see docs/30-workflows/claude-code-integration/outputs/phase-2/architecture-design.md
 */
import type { BrowserWindow } from "electron";
import {
  DANGEROUS_PATTERNS,
  type PermissionResponse,
  type PermissionRequest,
} from "@repo/shared";
import { v4 as uuidv4 } from "uuid";
import { IPC_CHANNELS } from "../../../preload/channels";
import type { IApprovalGate } from "../runtime/ApprovalGate";
import { pushApprovalRequest } from "../../ipc/approvalHandlers";

/**
 * Hook入力型
 */
interface HookToolInput {
  toolName: string;
  args: Record<string, unknown>;
}

/**
 * Hook出力型
 */
interface HookResult {
  proceed: boolean;
  message?: string;
}

/**
 * Hookコンテキスト型
 */
interface HookContext {
  signal: AbortSignal;
}

/**
 * SDKのHooks型定義
 */
interface SDKHooks {
  PreToolUse?: (
    input: HookToolInput,
    toolUseId: string,
    context: HookContext,
  ) => Promise<HookResult>;
  PostToolUse?: (
    input: HookToolInput,
    toolUseId: string,
    context: HookContext,
  ) => Promise<void>;
  PermissionRequest?: (
    input: HookToolInput,
    toolUseId: string,
    context: HookContext,
  ) => Promise<HookResult>;
}

/**
 * PermissionResolver - Permission応答のPromise管理
 *
 * Renderer ProcessからのPermission応答を待機し、
 * 対応するPromiseを解決する
 */
export class PermissionResolver {
  private pendingRequests: Map<
    string,
    {
      resolve: (response: PermissionResponse) => void;
      reject: (error: Error) => void;
    }
  > = new Map();

  /**
   * Permission応答を待機する
   *
   * @param requestId リクエストID
   * @param signal AbortSignal
   * @returns Permission応答のPromise
   */
  waitForResponse(
    requestId: string,
    signal: AbortSignal,
  ): Promise<PermissionResponse> {
    return new Promise<PermissionResponse>((resolve, reject) => {
      // AbortSignalの処理
      const abortHandler = () => {
        this.pendingRequests.delete(requestId);
        reject(new Error("Aborted"));
      };

      if (signal.aborted) {
        reject(new Error("Aborted"));
        return;
      }

      signal.addEventListener("abort", abortHandler);

      this.pendingRequests.set(requestId, {
        resolve: (response: PermissionResponse) => {
          signal.removeEventListener("abort", abortHandler);
          this.pendingRequests.delete(requestId);
          resolve(response);
        },
        reject: (error: Error) => {
          signal.removeEventListener("abort", abortHandler);
          this.pendingRequests.delete(requestId);
          reject(error);
        },
      });
    });
  }

  /**
   * Permission応答を解決する
   *
   * @param response Permission応答
   */
  resolveRequest(response: PermissionResponse): void {
    const pending = this.pendingRequests.get(response.requestId);
    if (pending) {
      pending.resolve(response);
    }
  }
}

/**
 * HooksFactory - SDK Hooksオブジェクトの生成
 *
 * PreToolUse: 危険コマンドの検出とブロック
 * PostToolUse: ツール完了ステータスの送信
 * PermissionRequest: UIダイアログ連携
 */
export class HooksFactory {
  private mainWindow: BrowserWindow;
  private executionId: string;
  private permissionResolver: PermissionResolver;
  private approvalGate: IApprovalGate;
  private sessionId: string;

  constructor(
    mainWindow: BrowserWindow,
    executionId: string,
    permissionResolver: PermissionResolver,
    approvalGate: IApprovalGate,
    sessionId: string,
  ) {
    this.mainWindow = mainWindow;
    this.executionId = executionId;
    this.permissionResolver = permissionResolver;
    this.approvalGate = approvalGate;
    this.sessionId = sessionId;
  }

  /**
   * Hooksオブジェクトを生成する
   *
   * @returns SDK用のHooksオブジェクト
   */
  createHooks(): SDKHooks {
    return {
      PreToolUse: this.createPreToolUseHook(),
      PostToolUse: this.createPostToolUseHook(),
      PermissionRequest: this.createPermissionRequestHook(),
    };
  }

  /**
   * PreToolUse Hookを生成
   * 危険コマンドの検出とブロックを行う
   */
  private createPreToolUseHook(): SDKHooks["PreToolUse"] {
    return async (
      input: HookToolInput,
      _toolUseId: string,
      _context: HookContext,
    ): Promise<HookResult> => {
      // Bashツールの場合、危険コマンドをチェック
      if (input.toolName === "Bash") {
        const command = (input.args.command as string) || "";

        for (const pattern of DANGEROUS_PATTERNS.BASH_COMMANDS) {
          if (command.includes(pattern)) {
            const operationId = uuidv4();
            pushApprovalRequest(this.mainWindow, {
              sessionId: this.sessionId,
              operationId,
              operationType: "dangerous_bash_command",
              description: `Dangerous command blocked: ${pattern}`,
            });
            return {
              proceed: false,
              message: `Dangerous command blocked: ${pattern}`,
            };
          }
        }
      }

      return { proceed: true };
    };
  }

  /**
   * PostToolUse Hookを生成
   * ツール完了ステータスをIPCで送信する
   */
  private createPostToolUseHook(): SDKHooks["PostToolUse"] {
    return async (
      input: HookToolInput,
      _toolUseId: string,
      _context: HookContext,
    ): Promise<void> => {
      this.mainWindow.webContents.send(IPC_CHANNELS.AGENT_EXECUTION_STATUS, {
        executionId: this.executionId,
        type: "tool_completed",
        tool: input.toolName,
        timestamp: Date.now(),
      });
    };
  }

  /**
   * PermissionRequest Hookを生成
   * UIダイアログでユーザー確認を行う
   */
  private createPermissionRequestHook(): SDKHooks["PermissionRequest"] {
    return async (
      input: HookToolInput,
      _toolUseId: string,
      context: HookContext,
    ): Promise<HookResult> => {
      const requestId = uuidv4();

      // RendererにPermissionリクエストを送信
      const permissionRequest: PermissionRequest = {
        executionId: this.executionId,
        requestId,
        toolName: input.toolName,
        args: input.args,
      };

      this.mainWindow.webContents.send(
        IPC_CHANNELS.AGENT_EXECUTION_PERMISSION,
        permissionRequest,
      );

      // 応答を待機
      const response = await this.permissionResolver.waitForResponse(
        requestId,
        context.signal,
      );

      return {
        proceed: response.approved,
        message: response.rejectReason,
      };
    };
  }
}
