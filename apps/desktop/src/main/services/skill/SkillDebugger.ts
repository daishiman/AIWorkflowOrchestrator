import type { BrowserWindow } from "electron";
import vm from "vm";
import { DebugSession } from "./DebugSession";
import { IPC_CHANNELS } from "../../../preload/channels";
import type {
  DebugSessionState,
  Breakpoint,
  DebugCommand,
  DebugEvent,
  DebugEvaluateResponse,
} from "@repo/shared";
import { DEBUG_CONSTANTS } from "@repo/shared";

/**
 * スキルデバッガー Facade クラス
 *
 * デバッグセッションのライフサイクル管理、ブレークポイント管理、
 * コマンド実行、変数インスペクション、式評価の統合窓口。
 * 同時実行は1セッションのみ（排他制御）。
 */
export class SkillDebugger {
  /** アクティブセッション（同時実行は1つのみ） */
  private activeSession: DebugSession | null = null;
  /** セッションタイムアウトタイマー */
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly mainWindow: BrowserWindow) {}

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // セッション管理
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * デバッグセッションを開始する
   * @throws セッションが既に実行中の場合
   */
  startSession(
    skillName: string,
    prompt: string,
    breakpoints: Omit<Breakpoint, "id">[],
  ): DebugSessionState {
    if (this.activeSession !== null) {
      throw new Error("A debug session is already active");
    }

    const session = new DebugSession(skillName);
    session.start();

    // 初期ブレークポイントを追加
    for (const bp of breakpoints) {
      session.addBreakpoint(bp);
    }

    this.activeSession = session;

    // セッションタイムアウトタイマー設定
    this.sessionTimer = setTimeout(() => {
      this.stopSession(session);
    }, DEBUG_CONSTANTS.SESSION_TIMEOUT_MS);

    return session.toJSON();
  }

  /**
   * デバッグコマンドを実行する
   * @throws セッションが存在しない場合、sessionIdが不一致の場合
   */
  executeCommand(sessionId: string, command: DebugCommand): void {
    const session = this.validateSessionId(sessionId);

    switch (command) {
      case "continue":
        if (session.status === "paused") {
          session.resume();
        }
        break;
      case "stepOver":
        if (session.status === "paused") {
          session.recordStep("tool_call");
        }
        break;
      case "stepInto":
        if (session.status === "paused") {
          session.pushCallStack("step-into", "tool");
          session.recordStep("tool_call");
        }
        break;
      case "stepOut":
        if (session.status === "paused") {
          session.popCallStack();
          session.recordStep("tool_call");
        }
        break;
      case "pause":
        if (session.status === "running") {
          session.pause();
        } else {
          throw new Error("Cannot pause: session is not running");
        }
        break;
      case "stop":
        this.stopSession(session);
        break;
      default: {
        const _exhaustive: never = command;
        throw new Error(`Unknown command: ${_exhaustive}`);
      }
    }
  }

  /**
   * セッションを停止する（内部）
   */
  private stopSession(session: DebugSession): void {
    try {
      if (session.status === "running" || session.status === "paused") {
        session.complete();
      }
    } catch {
      // 既に completed/error の場合は無視
    }
    this.emitDebugEvent({
      type: "session-ended",
      sessionId: session.id,
      completedAt: new Date().toISOString(),
    });
    this.cleanupSession();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ブレークポイント管理
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  addBreakpoint(sessionId: string, bp: Omit<Breakpoint, "id">): Breakpoint {
    const session = this.validateSessionId(sessionId);
    return session.addBreakpoint(bp);
  }

  removeBreakpoint(sessionId: string, breakpointId: string): void {
    const session = this.validateSessionId(sessionId);
    const removed = session.removeBreakpoint(breakpointId);
    if (!removed) {
      throw new Error(`Breakpoint not found: ${breakpointId}`);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // インスペクション
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  inspectVariable(sessionId: string, path: string): unknown {
    const session = this.validateSessionId(sessionId);
    return session.getVariable(path);
  }

  evaluateExpression(
    sessionId: string,
    expression: string,
  ): DebugEvaluateResponse {
    const session = this.validateSessionId(sessionId);

    if (session.status !== "paused") {
      throw new Error("Can only evaluate expressions when session is paused");
    }

    const variables = session.getVariables();
    const result = this.evaluateInSandbox(
      expression,
      variables,
      DEBUG_CONSTANTS.EXPRESSION_TIMEOUT_MS,
    );

    return {
      result,
      type: typeof result,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // セッション状態取得
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getSessionState(sessionId: string): DebugSessionState {
    const session = this.validateSessionId(sessionId);
    return session.toJSON();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // プライベートメソッド
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * デバッグイベントを Renderer に送信する
   */
  private emitDebugEvent(event: DebugEvent): void {
    try {
      if (!this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send(IPC_CHANNELS.SKILL_DEBUG_EVENT, event);
      }
    } catch {
      // ウィンドウが破棄済みの場合は無視
    }
  }

  /**
   * セッションをクリーンアップする
   */
  private cleanupSession(): void {
    if (this.sessionTimer !== null) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    this.activeSession = null;
  }

  /**
   * セッションIDを検証してセッションを返す
   * @throws セッションが存在しない場合、IDが不一致の場合
   */
  private validateSessionId(sessionId: string): DebugSession {
    if (this.activeSession === null) {
      throw new Error("No active debug session");
    }
    if (this.activeSession.id !== sessionId) {
      throw new Error(
        `Session ID mismatch: expected ${this.activeSession.id}, got ${sessionId}`,
      );
    }
    return this.activeSession;
  }

  /**
   * サンドボックスで式を評価する
   * vm.createContext で隔離コンテキストを作成し、セッション変数のみアクセス可能。
   * process/require/fs などのグローバルは自動的にブロックされる。
   */
  private evaluateInSandbox(
    expression: string,
    variables: Record<string, unknown>,
    timeoutMs: number,
  ): unknown {
    const sandbox = { ...variables };
    const context = vm.createContext(sandbox);
    try {
      return vm.runInContext(expression, context, { timeout: timeoutMs });
    } catch (error) {
      if ((error as Error).message?.includes("timed out")) {
        throw new Error("Expression evaluation timed out");
      }
      throw error;
    }
  }
}
