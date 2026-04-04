/**
 * SkillCreatorIpcBridge - IPC ブリッジクラス
 * TASK-SDK-SC-01: SDK Session Bridge
 *
 * Electron の IPC ハンドラーを登録・解除し、
 * Renderer ↔ Main ↔ SkillCreatorSdkSession の通信を中継する。
 *
 * アーキテクチャ:
 * - sessionFactory DI でテスト時にモック注入可能
 * - SDK / IPC 通信の責務を明確に分離
 * - register() 前に内部で unregister() を実行して二重登録を防止
 */

import { ipcMain } from "electron";
import type { BrowserWindow, IpcMainInvokeEvent } from "electron";
import {
  SKILL_CREATOR_EXTERNAL_API_CHANNELS,
  SKILL_CREATOR_SESSION_CHANNELS,
} from "@repo/shared/ipc/channels";
import type {
  ExternalApiConnectionConfig,
  SkillCreatorSessionStartRequest,
  SkillCreatorSessionCompleteEvent,
  SkillCreatorSessionErrorEvent,
  UserInputAnswer,
  UserInputQuestion,
} from "@repo/shared/types";
import { SkillLocator } from "./SkillLocator";
import type { ExternalApiConfigRequiredPayload } from "./SkillCreatorSdkSession";
import { SkillCreatorSdkSession } from "./SkillCreatorSdkSession";

/** sessionFactory の型 */
export type SessionFactory = (
  sessionId: string,
  onQuestion: (q: UserInputQuestion) => void,
  onExternalApiConfigRequired: (
    payload: ExternalApiConfigRequiredPayload,
  ) => void,
  onComplete: (r: string) => void,
  onError: (e: string) => void,
) => SkillCreatorSdkSession;

type ConfigureApiResult = {
  success: boolean;
  error?: string;
};

export class SkillCreatorIpcBridge {
  private currentSession: SkillCreatorSdkSession | null = null;
  private registered = false;
  private readonly handleWindowClosed = (): void => {
    this.abortCurrentSession(
      "[SkillCreatorIpcBridge] Session stopped because the window was closed",
      true,
    );
  };

  constructor(
    private readonly window: BrowserWindow,
    private readonly sessionFactory: SessionFactory = (
      sessionId,
      onQuestion,
      onExternalApiConfigRequired,
      onComplete,
      onError,
    ) => {
      const skillCreatorDir = SkillLocator.resolveSkillDir("skill-creator");
      return new SkillCreatorSdkSession(
        sessionId,
        skillCreatorDir,
        onQuestion,
        onExternalApiConfigRequired,
        onComplete,
        onError,
      );
    },
  ) {}

  /**
   * IPC ハンドラーを登録する。
   * 二重登録防止のため、内部で先に unregister() を実行する。
   */
  register(): void {
    this.unregister();

    this.window.once?.("closed", this.handleWindowClosed);

    ipcMain.handle(
      SKILL_CREATOR_SESSION_CHANNELS.START_SESSION,
      async (event, req: SkillCreatorSessionStartRequest) => {
        await this.onStartSession(event, req);
      },
    );

    ipcMain.handle(
      SKILL_CREATOR_SESSION_CHANNELS.ANSWER,
      async (event, answer: UserInputAnswer) => {
        await this.onAnswer(event, answer);
      },
    );

    ipcMain.handle(
      SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API,
      async (event, config: ExternalApiConnectionConfig) => {
        return await this.onConfigureApi(event, config);
      },
    );

    this.registered = true;
  }

  /**
   * IPC ハンドラーを解除する。
   * メモリリーク防止のため、アプリ終了時または不要になった時点で呼び出す。
   */
  unregister(): void {
    this.abortCurrentSession(
      "[SkillCreatorIpcBridge] Session stopped during unregister",
      true,
    );
    this.window.removeListener?.("closed", this.handleWindowClosed);
    this.window.off?.("closed", this.handleWindowClosed);
    ipcMain.removeHandler(SKILL_CREATOR_SESSION_CHANNELS.START_SESSION);
    ipcMain.removeHandler(SKILL_CREATOR_SESSION_CHANNELS.ANSWER);
    ipcMain.removeHandler(SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API);
    this.registered = false;
  }

  /** 現在のセッションを返す（テスト用） */
  getCurrentSession(): SkillCreatorSdkSession | null {
    return this.currentSession;
  }

  /** 登録状態を返す（テスト用） */
  isRegistered(): boolean {
    return this.registered;
  }

  // ── Private ──────────────────────────────────────────

  /**
   * start-session IPC を処理する。
   */
  private async onStartSession(
    event: IpcMainInvokeEvent,
    req: SkillCreatorSessionStartRequest,
  ): Promise<void> {
    this.assertSender(event);

    if (!req || typeof req.request !== "string" || req.request.trim() === "") {
      throw new Error(
        "[SkillCreatorIpcBridge] start-session request must include a non-empty request string",
      );
    }

    if (this.hasActiveSession()) {
      const message =
        "[SkillCreatorIpcBridge] A skill creator session is already running";
      console.warn(message);
      throw new Error(message);
    }

    this.currentSession = null;

    const sessionId =
      req.sessionId ??
      `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const session = this.sessionFactory(
      sessionId,
      (question) => this.emitQuestionReceived(question),
      (payload) => this.emitExternalApiConfigRequired(payload),
      (result) => {
        this.currentSession = null;
        this.emitSessionComplete(result);
      },
      (error) => {
        this.currentSession = null;
        this.emitSessionError(error);
      },
    );

    this.currentSession = session;

    void session.startSession(req.request).catch((error) => {
      console.error(
        "[SkillCreatorIpcBridge] Unexpected error in startSession:",
        error instanceof Error ? error.message : String(error),
      );
    });
  }

  /**
   * answer IPC を処理する。
   */
  private async onAnswer(
    event: IpcMainInvokeEvent,
    answer: UserInputAnswer,
  ): Promise<void> {
    this.assertSender(event);

    if (!this.currentSession) {
      throw new Error(
        "[SkillCreatorIpcBridge] Received answer but no active session",
      );
    }

    const currentQuestion = this.currentSession.getState().currentQuestion;
    if (!currentQuestion) {
      throw new Error(
        "[SkillCreatorIpcBridge] Received answer but no question is pending",
      );
    }

    if (currentQuestion.toolCallId !== answer.toolCallId) {
      throw new Error(
        `[SkillCreatorIpcBridge] toolCallId mismatch: expected ${currentQuestion.toolCallId}, got ${answer.toolCallId}`,
      );
    }

    this.currentSession.sendAnswer(answer);
  }

  /**
   * configure-api IPC を処理する。
   */
  private async onConfigureApi(
    event: IpcMainInvokeEvent,
    config: ExternalApiConnectionConfig,
  ): Promise<ConfigureApiResult> {
    this.assertSender(event);

    if (!this.currentSession) {
      return {
        success: false,
        error:
          "[SkillCreatorIpcBridge] Received external API config but no active session",
      };
    }

    if (!this.isValidExternalApiConfig(config)) {
      const error = "外部API設定の形式が不正です";
      this.emitApiConfigured({ success: false, error });
      this.emitApiTestResult({ ok: false, error });
      return {
        success: false,
        error: `[SkillCreatorIpcBridge] ${error}`,
      };
    }

    try {
      this.currentSession.sendExternalApiConfig(config);
      this.emitApiConfigured({ success: true });
      this.emitApiTestResult({ ok: true });
      return {
        success: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.emitApiConfigured({ success: false, error: message });
      this.emitApiTestResult({ ok: false, error: message });
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Main → Renderer: question-received イベントを送出する。
   */
  private emitQuestionReceived(question: UserInputQuestion): void {
    if (this.window.webContents.isDestroyed()) {
      return;
    }

    this.window.webContents.send(
      SKILL_CREATOR_SESSION_CHANNELS.QUESTION_RECEIVED,
      question,
    );
  }

  /**
   * Main → Renderer: session-complete イベントを送出する。
   */
  private emitSessionComplete(result: string): void {
    if (this.window.webContents.isDestroyed()) {
      return;
    }

    const payload: SkillCreatorSessionCompleteEvent = { result };
    this.window.webContents.send(
      SKILL_CREATOR_SESSION_CHANNELS.SESSION_COMPLETE,
      payload,
    );
  }

  /**
   * Main → Renderer: session-error イベントを送出する。
   */
  private emitSessionError(error: string): void {
    if (this.window.webContents.isDestroyed()) {
      return;
    }

    const payload: SkillCreatorSessionErrorEvent = { error };
    this.window.webContents.send(
      SKILL_CREATOR_SESSION_CHANNELS.SESSION_ERROR,
      payload,
    );
  }

  /**
   * Main → Renderer: external-api-config-required イベントを送出する。
   */
  private emitExternalApiConfigRequired(
    payload: ExternalApiConfigRequiredPayload,
  ): void {
    if (this.window.webContents.isDestroyed()) {
      return;
    }
    this.window.webContents.send(
      SKILL_CREATOR_SESSION_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED,
      payload,
    );
  }

  private emitApiConfigured(payload: {
    success: boolean;
    error?: string;
  }): void {
    if (this.window.webContents.isDestroyed()) {
      return;
    }
    this.window.webContents.send(
      SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_CONFIGURED,
      payload,
    );
  }

  private emitApiTestResult(payload: {
    ok: boolean;
    latencyMs?: number;
    error?: string;
  }): void {
    if (this.window.webContents.isDestroyed()) {
      return;
    }
    this.window.webContents.send(
      SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_TEST_RESULT,
      payload,
    );
  }

  private hasActiveSession(): boolean {
    if (!this.currentSession) {
      return false;
    }

    const status = this.currentSession.getState().status;
    return status === "running" || status === "awaiting-input";
  }

  private abortCurrentSession(message: string, silent: boolean): void {
    if (!this.currentSession) {
      return;
    }

    this.currentSession.abort(message, { silent });
    this.currentSession = null;
  }

  private isValidExternalApiConfig(
    config: ExternalApiConnectionConfig,
  ): boolean {
    if (!config || typeof config !== "object") {
      return false;
    }
    if (typeof config.name !== "string" || config.name.trim() === "") {
      return false;
    }
    if (typeof config.url !== "string" || config.url.trim() === "") {
      return false;
    }
    if (config.method !== "GET" && config.method !== "POST") {
      return false;
    }
    if (
      config.authType !== "none" &&
      config.authType !== "api-key" &&
      config.authType !== "bearer" &&
      config.authType !== "basic"
    ) {
      return false;
    }
    if (
      config.authType !== "none" &&
      (typeof config.credential !== "string" || config.credential.trim() === "")
    ) {
      return false;
    }
    if (
      config.headers !== undefined &&
      (typeof config.headers !== "object" || Array.isArray(config.headers))
    ) {
      return false;
    }
    if (config.headers) {
      for (const [key, value] of Object.entries(config.headers)) {
        if (typeof key !== "string" || key.trim() === "") {
          return false;
        }
        if (typeof value !== "string") {
          return false;
        }
      }
    }
    return true;
  }

  private assertSender(event: IpcMainInvokeEvent): void {
    if (event.sender.id !== this.window.webContents.id) {
      throw new Error(
        "[SkillCreatorIpcBridge] IPC sender does not match the active window",
      );
    }
  }
}
