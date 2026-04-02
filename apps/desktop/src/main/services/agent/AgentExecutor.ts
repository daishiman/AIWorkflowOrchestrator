/**
 * AgentExecutor - 単一のエージェント実行を制御
 *
 * SDK query() API呼び出し、ストリーミング処理、エラーハンドリングを担当
 *
 * @see docs/30-workflows/claude-code-integration/outputs/phase-2/architecture-design.md
 */
import type { BrowserWindow } from "electron";
import {
  AGENT_DEFAULTS,
  type AgentExecutionRequest,
  type PermissionRules,
  type PermissionResponse,
  type AgentStreamMessage,
  type AgentExecutionStatus,
} from "@repo/shared";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { HooksFactory, PermissionResolver } from "./HooksFactory";
import { createPermissionOptions, mergeRules } from "./PermissionRules";
import { IPC_CHANNELS } from "../../../preload/channels";
import type { IApprovalGate } from "../runtime/ApprovalGate";

/**
 * AgentExecutor - 単一実行の制御クラス
 */
export class AgentExecutor {
  private request: AgentExecutionRequest;
  private mainWindow: BrowserWindow;
  private abortController: AbortController;
  private permissionResolver: PermissionResolver;
  private permissionRules: PermissionRules;
  private approvalGate: IApprovalGate;
  private startedAt: number = 0;

  constructor(
    request: AgentExecutionRequest,
    mainWindow: BrowserWindow,
    approvalGate: IApprovalGate,
    customRules?: PermissionRules,
  ) {
    this.request = request;
    this.mainWindow = mainWindow;
    this.abortController = new AbortController();
    this.permissionResolver = new PermissionResolver();
    this.permissionRules = mergeRules(customRules);
    this.approvalGate = approvalGate;
  }

  /**
   * 実行を開始する
   */
  async start(): Promise<void> {
    this.startedAt = Date.now();

    try {
      // 開始ステータスを送信
      this.sendStatus("running");

      // Hooksを生成
      const hooksFactory = new HooksFactory(
        this.mainWindow,
        this.request.executionId!,
        this.permissionResolver,
        this.approvalGate,
        this.request.executionId!,
      );
      const hooks = hooksFactory.createHooks();

      // 作業ディレクトリ
      const workingDirectory = this.request.workingDirectory || process.cwd();

      // Permission optionsを生成
      const permissions = createPermissionOptions(
        this.permissionRules,
        workingDirectory,
      );

      // SDKのquery()を呼び出し
      const conversation = query({
        prompt: this.request.prompt,
        options: {
          tools: this.request.tools || [...AGENT_DEFAULTS.DEFAULT_TOOLS],
          signal: this.abortController.signal,
          // @ts-expect-error - Claude Agent SDK型定義がインストール完了後に解決される
          hooks,
          permissions,
        },
      });

      // ストリーミング処理（Query自体がAsyncIterable）
      for await (const message of conversation) {
        // キャンセルチェック
        if (this.abortController.signal.aborted) {
          this.sendStatus("cancelled");
          return;
        }

        // メッセージをIPCで送信
        this.sendStreamMessage(message);
      }

      // 完了ステータスを送信
      this.sendStatus("completed");
    } catch (error) {
      if (this.abortController.signal.aborted) {
        this.sendStatus("cancelled");
        return;
      }

      // エラーを送信
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.sendErrorMessage(errorMessage);
      this.sendStatus("error", errorMessage);
    }
  }

  /**
   * 実行を停止する
   */
  stop(): void {
    this.abortController.abort();
  }

  /**
   * Permission応答を解決する
   *
   * @param response Permission応答
   */
  resolvePermission(response: PermissionResponse): void {
    this.permissionResolver.resolveRequest(response);
  }

  /**
   * IPC経由でRendererにデータを送信する共通ヘルパー
   */
  private sendToRenderer<T>(channel: string, data: T): void {
    this.mainWindow.webContents.send(channel, data);
  }

  /**
   * ストリーミングメッセージを送信
   */
  private sendStreamMessage(message: unknown): void {
    const streamMessage: AgentStreamMessage = {
      executionId: this.request.executionId!,
      type: this.getMessageType(message),
      content: message,
      timestamp: Date.now(),
    };

    this.sendToRenderer(IPC_CHANNELS.AGENT_EXECUTION_STREAM, streamMessage);
  }

  /**
   * エラーメッセージを送信
   */
  private sendErrorMessage(errorMessage: string): void {
    const streamMessage: AgentStreamMessage = {
      executionId: this.request.executionId!,
      type: "error",
      content: { message: errorMessage },
      timestamp: Date.now(),
    };

    this.sendToRenderer(IPC_CHANNELS.AGENT_EXECUTION_STREAM, streamMessage);
  }

  /**
   * ステータスを送信
   */
  private sendStatus(
    status: "running" | "completed" | "cancelled" | "error",
    error?: string,
  ): void {
    const executionStatus: AgentExecutionStatus = {
      executionId: this.request.executionId!,
      status,
      startedAt: this.startedAt,
      completedAt: status !== "running" ? Date.now() : undefined,
      error,
    };

    this.sendToRenderer(IPC_CHANNELS.AGENT_EXECUTION_STATUS, executionStatus);
  }

  /**
   * メッセージタイプを取得
   */
  private getMessageType(
    message: unknown,
  ): "assistant" | "user" | "result" | "tool_use" | "status" | "error" {
    if (typeof message === "object" && message !== null) {
      const type = (message as Record<string, unknown>).type;
      if (
        type === "assistant" ||
        type === "user" ||
        type === "result" ||
        type === "tool_use" ||
        type === "status" ||
        type === "error"
      ) {
        return type;
      }
    }
    return "assistant";
  }
}
