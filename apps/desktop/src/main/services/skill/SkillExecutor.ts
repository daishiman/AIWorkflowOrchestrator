/**
 * SkillExecutor - スキル実行エンジン
 *
 * TASK-3-1-A: SDK query() 基本実装
 *
 * Claude Agent SDK の query() API を使用してスキルを実行し、
 * ストリーミングレスポンスを Renderer Process に配信する。
 */

import { v4 as uuidv4 } from "uuid";
import type { BrowserWindow } from "electron";
import type { Skill } from "@repo/shared";

// =================================================================
// SkillExecutor専用の型定義
// @repo/shared の型と競合を避けるためローカルに定義
// =================================================================

/** 実行状態 */
export type ExecutionState =
  | "pending"
  | "running"
  | "completed"
  | "aborted"
  | "error";

/** スキル実行リクエスト */
export interface SkillExecutionRequest {
  prompt: string;
  skillId: string;
  timeout?: number;
  sessionId?: string;
}

/** スキル実行レスポンス */
export interface SkillExecutionResponse {
  executionId: string;
  success: boolean;
  error?: SkillExecutionError;
}

/** 実行情報 */
export interface ExecutionInfo {
  id: string;
  skillId: string;
  state: ExecutionState;
  startedAt: number;
  completedAt?: number;
}

/** ストリームメッセージタイプ */
export type SkillStreamMessageType = "text" | "tool_use" | "error" | "complete";

/** スキルストリームメッセージ */
export interface SkillStreamMessage {
  executionId: string;
  id: string;
  type: SkillStreamMessageType;
  content: string;
  timestamp: number;
  isComplete: boolean;
}

/** スキル実行エラーコード */
export type SkillExecutionErrorCode =
  | "EXECUTION_FAILED"
  | "TIMEOUT"
  | "ABORTED"
  | "MAX_CONCURRENT_EXCEEDED"
  | "SKILL_NOT_FOUND"
  | "VALIDATION_FAILED"
  | "SDK_ERROR"
  | "NETWORK_ERROR"
  | "AUTHENTICATION_ERROR";

/** スキル実行エラー */
export interface SkillExecutionError {
  code: SkillExecutionErrorCode;
  message: string;
  details?: unknown;
}

/** 実行コンテキスト（内部用） */
export interface ExecutionContext {
  id: string;
  skillId: string;
  abortController: AbortController;
  state: ExecutionState;
  startedAt: number;
  completedAt?: number;
}

/** SkillMetadata - Skillを拡張した実行用メタデータ */
export interface SkillMetadata extends Omit<Skill, "lastModified"> {
  // Skill型から継承: id, name, slug, description, path, triggers, anchors, allowedTools, etc.
}

// =================================================================
// Constants
// =================================================================

/** デフォルトのツールリスト */
const DEFAULT_TOOLS = ["Read", "Edit", "Bash", "Glob", "Grep"] as const;

/** デフォルトのタイムアウト（ミリ秒） */
const DEFAULT_TIMEOUT_MS = 30000;

/** 同時実行の最大数 */
const MAX_CONCURRENT_EXECUTIONS = 5;

/** 履歴保持期間（ミリ秒）- クリーンアップまでの待機時間 */
const HISTORY_RETENTION_MS = 60000;

// =================================================================
// SDK型定義（実際のSDKから取得）
// =================================================================

interface SDKQueryOptions {
  tools?: string[];
  permissionMode?: "default" | "plan" | "bypassPermissions";
  signal?: AbortSignal;
  timeout?: number;
}

interface SDKMessage {
  type?: string;
  content?: string;
  tool_use?: {
    name: string;
    input: unknown;
  };
  error?: {
    message: string;
  };
}

/**
 * SDKメッセージが有効なメッセージかを判定する型ガード
 */
function isValidSDKMessage(message: unknown): message is SDKMessage {
  if (message === null || typeof message !== "object") {
    return false;
  }
  return true;
}

/**
 * スキル実行エンジン
 *
 * @example
 * ```typescript
 * const executor = new SkillExecutor(mainWindow);
 * const response = await executor.execute(request, skill);
 * console.log(response.executionId);
 * ```
 */
export class SkillExecutor {
  private mainWindow: BrowserWindow;
  private activeExecutions: Map<string, ExecutionContext> = new Map();
  private readonly maxConcurrentExecutions: number = MAX_CONCURRENT_EXECUTIONS;
  private readonly defaultTimeout: number = DEFAULT_TIMEOUT_MS;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  /**
   * スキルを実行する
   *
   * @param request - 実行リクエスト
   * @param skill - スキルメタデータ
   * @returns 実行レスポンス
   */
  async execute(
    request: SkillExecutionRequest,
    skill: SkillMetadata,
  ): Promise<SkillExecutionResponse> {
    // 同時実行数チェック
    if (this.activeExecutions.size >= this.maxConcurrentExecutions) {
      return {
        executionId: "",
        success: false,
        error: {
          code: "MAX_CONCURRENT_EXCEEDED",
          message: `Maximum concurrent executions (${this.maxConcurrentExecutions}) exceeded`,
        },
      };
    }

    // executionId 生成
    const executionId = uuidv4();

    // AbortController 作成
    const abortController = new AbortController();

    // ExecutionContext 登録
    const context: ExecutionContext = {
      id: executionId,
      skillId: skill.id,
      abortController,
      state: "pending",
      startedAt: Date.now(),
    };
    this.activeExecutions.set(executionId, context);

    // 状態更新: running
    this.updateExecutionState(executionId, "running");

    try {
      // プロンプト構築
      const fullPrompt = await this.buildPrompt(request.prompt, skill);

      // query() API 呼び出し
      // NOTE: 実際のSDK呼び出しは claude-agent-sdk パッケージから
      // 現在はモック対応のため、直接呼び出しを実装
      const response = await this.callSDKQuery(fullPrompt, {
        tools: skill.allowedTools || [...DEFAULT_TOOLS],
        permissionMode: "default",
        signal: abortController.signal,
        timeout: request.timeout ?? this.defaultTimeout,
      });

      // ストリーミング処理
      for await (const message of response.stream()) {
        if (abortController.signal.aborted) {
          break;
        }
        await this.handleStreamMessage(executionId, message);
      }

      // 完了通知
      this.sendStream({
        executionId,
        id: uuidv4(),
        type: "complete",
        content: "",
        timestamp: Date.now(),
        isComplete: true,
      });

      // 状態更新: completed
      this.updateExecutionState(executionId, "completed");

      return {
        executionId,
        success: true,
      };
    } catch (error) {
      return this.handleExecutionError(executionId, error);
    } finally {
      // クリーンアップ
      this.cleanup(executionId);
    }
  }

  /**
   * 実行を中断する
   *
   * @param executionId - 実行ID
   * @returns 中断成功の場合 true
   */
  abort(executionId: string): boolean {
    const context = this.activeExecutions.get(executionId);

    if (!context) {
      return false;
    }

    // AbortController でキャンセル
    context.abortController.abort();

    // 状態更新
    this.updateExecutionState(executionId, "aborted");

    // 中断通知を Renderer に送信
    this.sendStream({
      executionId,
      id: uuidv4(),
      type: "error",
      content: "Execution aborted by user",
      timestamp: Date.now(),
      isComplete: true,
    });

    return true;
  }

  /**
   * アクティブな実行一覧を取得
   *
   * @returns 実行情報の配列
   */
  getActiveExecutions(): ExecutionInfo[] {
    return Array.from(this.activeExecutions.values()).map((ctx) => ({
      id: ctx.id,
      skillId: ctx.skillId,
      state: ctx.state,
      startedAt: ctx.startedAt,
      completedAt: ctx.completedAt,
    }));
  }

  /**
   * 特定の実行状態を取得
   *
   * @param executionId - 実行ID
   * @returns 実行情報（見つからない場合 undefined）
   */
  getExecutionStatus(executionId: string): ExecutionInfo | undefined {
    const context = this.activeExecutions.get(executionId);

    if (!context) {
      return undefined;
    }

    return {
      id: context.id,
      skillId: context.skillId,
      state: context.state,
      startedAt: context.startedAt,
      completedAt: context.completedAt,
    };
  }

  // =================================================================
  // Private Methods
  // =================================================================

  /**
   * SDK query() を呼び出す
   * NOTE: 実際の実装では claude-agent-sdk を使用
   * SDK型定義が不完全なため、anyキャストを使用
   */
  private async callSDKQuery(
    prompt: string,
    options: SDKQueryOptions,
  ): Promise<{ stream: () => AsyncIterable<SDKMessage> }> {
    // Dynamic import for SDK
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { query } = (await import("@anthropic-ai/claude-agent-sdk")) as any;

    const conversation = query({
      prompt,
      options: {
        tools: options.tools,
        permissionMode: options.permissionMode,
        signal: options.signal,
      },
    });

    return {
      stream: () => conversation.stream(),
    };
  }

  /**
   * プロンプトを構築する
   */
  private async buildPrompt(
    userPrompt: string,
    skill: SkillMetadata,
  ): Promise<string> {
    const contextInfo = this.buildContextInfo(skill);

    return `${contextInfo}

## User Request

${userPrompt}`;
  }

  /**
   * スキルコンテキスト情報を構築する
   */
  private buildContextInfo(skill: SkillMetadata): string {
    const anchorsText = skill.anchors
      .map((a) => `- ${a.source} / ${a.application} / ${a.purpose}`)
      .join("\n");

    return `# Skill Context

**Skill**: ${skill.name}
**Description**: ${skill.description}

## Anchors
${anchorsText || "No anchors defined"}

## Allowed Tools
${skill.allowedTools?.join(", ") || DEFAULT_TOOLS.join(", ")}`;
  }

  /**
   * ストリームメッセージを処理する
   */
  private async handleStreamMessage(
    executionId: string,
    message: unknown,
  ): Promise<void> {
    // メッセージ変換
    const streamMessage = this.convertToStreamMessage(executionId, message);

    // null の場合はスキップ（未知のメッセージタイプ）
    if (!streamMessage) {
      return;
    }

    // IPC 経由で Renderer に送信
    this.sendStream(streamMessage);
  }

  /**
   * SDK メッセージを SkillStreamMessage に変換する
   */
  private convertToStreamMessage(
    executionId: string,
    message: unknown,
  ): SkillStreamMessage | null {
    // 型ガードによる検証
    if (!isValidSDKMessage(message)) {
      return null;
    }

    const msg = message;

    let type: SkillStreamMessageType;
    let content: string;

    if (msg.type === "text" && msg.content) {
      type = "text";
      content = msg.content;
    } else if (msg.type === "tool_use" && msg.tool_use) {
      type = "tool_use";
      content = JSON.stringify({
        name: msg.tool_use.name,
        input: msg.tool_use.input,
      });
    } else if (msg.type === "error" || msg.error) {
      type = "error";
      content = msg.error?.message ?? "Unknown error";
    } else {
      // 未知のメッセージタイプ
      return null;
    }

    return {
      executionId,
      id: uuidv4(),
      type,
      content,
      timestamp: Date.now(),
      isComplete: false,
    };
  }

  /**
   * IPC経由でストリームメッセージを送信する
   */
  private sendStream(message: SkillStreamMessage): void {
    // BrowserWindow が有効かチェック
    if (this.mainWindow.isDestroyed()) {
      return;
    }

    // IPC 経由で Renderer に送信
    this.mainWindow.webContents.send("skill:stream", message);
  }

  /**
   * 実行状態を更新する
   */
  private updateExecutionState(
    executionId: string,
    state: ExecutionState,
  ): void {
    const context = this.activeExecutions.get(executionId);

    if (!context) {
      return;
    }

    context.state = state;

    if (state === "completed" || state === "aborted" || state === "error") {
      context.completedAt = Date.now();
    }
  }

  /**
   * エラーを処理する
   */
  private handleExecutionError(
    executionId: string,
    error: unknown,
  ): SkillExecutionResponse {
    // 状態更新
    this.updateExecutionState(executionId, "error");

    // エラータイプ判定
    const skillError = this.convertToSkillError(error);

    // エラー通知を Renderer に送信
    this.sendStream({
      executionId,
      id: uuidv4(),
      type: "error",
      content: skillError.message,
      timestamp: Date.now(),
      isComplete: true,
    });

    // ログ出力
    this.logError(executionId, skillError, error);

    return {
      executionId,
      success: false,
      error: skillError,
    };
  }

  /**
   * エラーを SkillExecutionError に変換する
   */
  private convertToSkillError(error: unknown): SkillExecutionError {
    // AbortError（中断）
    if (error instanceof Error && error.name === "AbortError") {
      return {
        code: "ABORTED",
        message: "Execution was aborted",
      };
    }

    // TimeoutError
    if (error instanceof Error && error.name === "TimeoutError") {
      return {
        code: "TIMEOUT",
        message: "Execution timed out",
      };
    }

    // 一般エラー
    if (error instanceof Error) {
      return {
        code: "EXECUTION_FAILED",
        message: error.message,
        details: { stack: error.stack },
      };
    }

    // 不明なエラー
    return {
      code: "EXECUTION_FAILED",
      message: "An unknown error occurred",
      details: error,
    };
  }

  /**
   * エラーをログ出力する
   */
  private logError(
    executionId: string,
    error: SkillExecutionError,
    originalError?: unknown,
  ): void {
    console.error("[SkillExecutor] Execution error:", {
      executionId,
      errorCode: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
      details: error.details,
      stack: originalError instanceof Error ? originalError.stack : undefined,
    });
  }

  /**
   * リソースをクリーンアップする
   */
  private cleanup(executionId: string): void {
    const context = this.activeExecutions.get(executionId);

    if (!context) {
      return;
    }

    // 完了時刻を記録
    if (!context.completedAt) {
      context.completedAt = Date.now();
    }

    // 一定時間後に Map から削除（履歴保持のため即削除しない）
    setTimeout(() => {
      this.activeExecutions.delete(executionId);
    }, HISTORY_RETENTION_MS);
  }
}
