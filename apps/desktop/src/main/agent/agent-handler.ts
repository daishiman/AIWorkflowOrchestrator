/**
 * Agent IPC Handler
 * Electron Main Process handler for Agent SDK communication
 */

import { ipcMain, type IpcMainInvokeEvent } from "electron";
import {
  AgentClient,
  SessionManager,
  AgentValidationError,
  queryRequestSchema,
  resumeSessionRequestSchema,
  destroySessionRequestSchema,
  type AgentStatus,
  type SDKMessage,
  type AgentClientConfig,
  type CreateSessionResponse,
} from "@repo/shared/agent";

interface AgentHandlerConfig {
  apiKey: string;
  defaultTimeout?: number;
  maxRetries?: number;
}

/**
 * Agent IPCハンドラー
 * - IPC経由でAgent SDK機能を公開
 * - バリデーション・セッション管理を統合
 */
export class AgentHandler {
  private agentClient: AgentClient;
  private sessionManager: SessionManager;
  private disposed: boolean = false;

  constructor(config: AgentHandlerConfig) {
    this.agentClient = new AgentClient({
      apiKey: config.apiKey,
      defaultTimeout: config.defaultTimeout,
      maxRetries: config.maxRetries,
    } as AgentClientConfig);
    this.sessionManager = new SessionManager();
  }

  /**
   * ハンドラを初期化し、IPCを登録する
   */
  async initialize(): Promise<void> {
    await this.agentClient.initialize();
    this.registerHandlers();
  }

  /**
   * ハンドラを破棄し、IPCを解除する
   */
  dispose(): void {
    this.disposed = true;
    ipcMain.removeHandler("agent:query");
    ipcMain.removeHandler("agent:get-status");
    ipcMain.removeHandler("agent:createSession");
    ipcMain.removeHandler("agent:resumeSession");
    ipcMain.removeHandler("agent:destroySession");
    ipcMain.removeHandler("agent:abort");
  }

  /**
   * クエリを実行する
   */
  async handleQuery(
    event: IpcMainInvokeEvent,
    request: unknown,
  ): Promise<void> {
    const parseResult = queryRequestSchema.safeParse(request);
    if (!parseResult.success) {
      throw new AgentValidationError(
        "Invalid query request",
        parseResult.error.issues,
      );
    }

    const { prompt, options } = parseResult.data;

    if (this.agentClient.isQueryRunning()) {
      this.agentClient.abort();
    }

    await this.agentClient.query(
      prompt,
      (message: SDKMessage) => {
        event.sender.send("agent:message", message);
      },
      options,
    );
  }

  /**
   * クエリを中断する
   */
  handleAbort(): void {
    this.agentClient.abort();
  }

  /**
   * ステータスを取得する
   */
  async handleGetStatus(): Promise<AgentStatus> {
    return this.agentClient.getStatus();
  }

  /**
   * 新しいセッションを作成する
   */
  async handleCreateSession(): Promise<CreateSessionResponse> {
    const sessionId = this.sessionManager.createSession();
    return { sessionId };
  }

  /**
   * セッションを再開する
   */
  async handleResumeSession(request: unknown): Promise<void> {
    const parseResult = resumeSessionRequestSchema.safeParse(request);
    if (!parseResult.success) {
      throw new AgentValidationError(
        "Invalid resume session request",
        parseResult.error.issues,
      );
    }

    const { sessionId } = parseResult.data;
    this.sessionManager.resumeSession(sessionId);
  }

  /**
   * セッションを破棄する
   */
  async handleDestroySession(request: unknown): Promise<void> {
    const parseResult = destroySessionRequestSchema.safeParse(request);
    if (!parseResult.success) {
      throw new AgentValidationError(
        "Invalid destroy session request",
        parseResult.error.issues,
      );
    }

    const { sessionId } = parseResult.data;
    this.sessionManager.destroySession(sessionId);
  }

  /**
   * IPCハンドラを登録する
   */
  private registerHandlers(): void {
    ipcMain.handle(
      "agent:query",
      async (event: IpcMainInvokeEvent, request: unknown) => {
        return this.handleQuery(event, request);
      },
    );

    ipcMain.handle("agent:get-status", async () => {
      return this.handleGetStatus();
    });

    ipcMain.handle("agent:createSession", async () => {
      return this.handleCreateSession();
    });

    ipcMain.handle("agent:resumeSession", async (_event, request: unknown) => {
      return this.handleResumeSession(request);
    });

    ipcMain.handle("agent:destroySession", async (_event, request: unknown) => {
      return this.handleDestroySession(request);
    });

    ipcMain.handle("agent:abort", () => {
      this.handleAbort();
    });
  }
}
