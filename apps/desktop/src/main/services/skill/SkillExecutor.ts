/**
 * SkillExecutor - スキル実行エンジン
 *
 * TASK-3-1-A: SDK query() 基本実装
 * TASK-3-1-B: Hooks実装（PreToolUse/PostToolUse）
 * TASK-3-1-E: rememberChoice機能永続化（PermissionStore連携）
 * TASK-FIX-16-1: AuthKeyService統合（SDK認証キー管理）
 *
 * Claude Agent SDK の query() API を使用してスキルを実行し、
 * ストリーミングレスポンスを Renderer Process に配信する。
 * Hooksによるセキュリティチェックとツール実行通知を提供する。
 */

import { v4 as uuidv4 } from "uuid";
import type { BrowserWindow } from "electron";
import type {
  Skill,
  SkillPermissionResponse,
  IPermissionStore,
} from "@repo/shared";
import { isDangerousCommand, isProtectedPath } from "@repo/shared/constants";
import { SKILL_CHANNELS } from "@repo/shared/src/ipc/channels";
import { PermissionResolver } from "./PermissionResolver";
import { PermissionStore } from "./PermissionStore";
import type { IAuthKeyService } from "../auth/types";
import {
  asSdkMessageRecord,
  getSdkMessageType,
} from "../runtime/sdkMessageUtils";

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

/** リトライ可能なエラーの分類 */
export type RetryableErrorType =
  | "network"
  | "rate_limit"
  | "server_error"
  | "timeout";

/** リトライ設定 */
export interface RetryConfig {
  /** 最大リトライ回数（デフォルト: 3） */
  maxRetries: number;
  /** 基本待機時間（ミリ秒）（デフォルト: 1000） */
  baseDelayMs: number;
  /** 最大待機時間（ミリ秒）（デフォルト: 30000） */
  maxDelayMs: number;
  /** Jitter範囲 0-1（デフォルト: 0.2） */
  jitterFactor: number;
  /** バックオフ倍率（デフォルト: 2） */
  backoffMultiplier: number;
}

/** リトライ判定結果 */
export interface RetryableErrorResult {
  retryable: boolean;
  errorType?: RetryableErrorType;
  retryAfterMs?: number;
}

/** スキル実行リクエスト */
export interface SkillExecutionRequest {
  prompt: string;
  skillId: string;
  timeout?: number;
  sessionId?: string;
  /** リトライ設定（部分指定可能、未指定フィールドはデフォルト値） */
  retryConfig?: Partial<RetryConfig>;
}

/** スキル実行レスポンス */
export interface SkillExecutionResponse {
  executionId: string;
  success: boolean;
  error?: SkillExecutionError;
  sdkMessages?: unknown[];
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
export type SkillStreamMessageType =
  | "text"
  | "tool_use"
  | "error"
  | "complete"
  | "retry";

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
// TASK-3-1-B: Hooks関連の型定義
// =================================================================

/** エラーカテゴリ（FR-006） */
export type ErrorCategory =
  | "sdk_error"
  | "permission_denied"
  | "timeout"
  | "network"
  | "unknown";

/** PreToolUse入力 */
interface PreToolUseInput {
  toolName: string;
  args: Record<string, unknown>;
}

/** PostToolUse入力 */
interface PostToolUseInput {
  toolName: string;
  result?: unknown;
}

/** PreToolUse結果 */
type PreToolUseResult = { proceed: true } | { proceed: false; message: string };

/** ツール使用通知の内容 */
interface ToolUseContent {
  toolName: string;
  args: Record<string, unknown>;
  toolUseId: string;
}

/** ツール結果通知の内容 */
interface ToolResultContent {
  toolUseId: string;
  success: boolean;
  result?: unknown;
}

/** ステータス通知の内容 */
interface StatusContent {
  status: string;
  detail: string;
}

/** エラー通知の内容 */
interface ErrorContent {
  code: ErrorCategory;
  message: string;
  retryable: boolean;
}

/** Hooks拡張ストリームメッセージ（tool_use/tool_result/status/error用） */
export type HooksStreamMessage =
  | {
      executionId: string;
      type: "tool_use";
      content: ToolUseContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "tool_result";
      content: ToolResultContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "status";
      content: StatusContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "error";
      content: ErrorContent;
      timestamp: number;
    };

// =================================================================
// Constants
// =================================================================

/** abort 理由 */
export type AbortReason = "denied" | "timeout" | "max_retries" | "unknown";

/** Permission フローコンテキスト */
export interface PermissionFlowContext {
  executionId: string;
  requestId: string;
  toolName: string;
  retryCount: number;
  maxRetries: number;
}

/** Permission フロー判定結果 */
export interface PermissionFlowResult {
  action: "approved" | "skip" | "retry" | "abort";
  reason?: AbortReason;
  retryCount?: number;
}

/** Permission リトライ最大回数 */
const PERMISSION_MAX_RETRIES = 3;

/** デフォルトのツールリスト */
const DEFAULT_TOOLS = ["Read", "Edit", "Bash", "Glob", "Grep"] as const;

/** デフォルトのタイムアウト（ミリ秒） */
const DEFAULT_TIMEOUT_MS = 30000;

/** Permission タイムアウトエラー (FR-102) */
export class PermissionTimeoutError extends Error {
  readonly timeoutMs: number;
  constructor(timeoutMs: number, toolName: string) {
    super(
      `Permission request timed out after ${timeoutMs}ms for tool: ${toolName}`,
    );
    this.name = "PermissionTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

/** 同時実行の最大数 */
const MAX_CONCURRENT_EXECUTIONS = 5;

/** 履歴保持期間（ミリ秒）- クリーンアップまでの待機時間 */
const HISTORY_RETENTION_MS = 60000;

/** リトライ対象のネットワークエラーコード */
const RETRYABLE_NETWORK_ERRORS = [
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
] as const;

/** デフォルトリトライ設定 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitterFactor: 0.2,
  backoffMultiplier: 2,
};

// =================================================================
// リトライ関連のモジュールレベル関数
// =================================================================

/**
 * Retry-Afterヘッダーの値をミリ秒にパースする
 */
function parseRetryAfterMs(error: unknown): number | undefined {
  const err = error as { headers?: Record<string, string> };
  const retryAfter = err?.headers?.["retry-after"];
  if (retryAfter === undefined || retryAfter === null) {
    return undefined;
  }
  const seconds = Number(retryAfter);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return seconds * 1000;
  }
  return undefined;
}

/**
 * エラーがリトライ対象かどうかを判定する
 *
 * @param error - 判定対象のエラー
 * @returns リトライ判定結果
 */
export function isRetryableError(error: unknown): RetryableErrorResult {
  if (error === null || error === undefined) {
    return { retryable: false };
  }

  if (!(error instanceof Error) && typeof error !== "object") {
    return { retryable: false };
  }

  const err = error as Error & {
    code?: string;
    status?: number;
    headers?: Record<string, string>;
  };

  // AbortError はリトライしない
  if (err.name === "AbortError") {
    return { retryable: false };
  }

  // ネットワークエラー
  if (
    err.code &&
    (RETRYABLE_NETWORK_ERRORS as readonly string[]).includes(err.code)
  ) {
    return { retryable: true, errorType: "network" };
  }

  // HTTP 429 (Rate Limit)
  if (err.status === 429) {
    return {
      retryable: true,
      errorType: "rate_limit",
      retryAfterMs: parseRetryAfterMs(error),
    };
  }

  // HTTP 5xx (Server Error)
  if (err.status !== undefined && err.status >= 500 && err.status < 600) {
    return { retryable: true, errorType: "server_error" };
  }

  // HTTP 4xx (Client Error) - 明示的に非リトライ
  if (err.status !== undefined && err.status >= 400 && err.status < 500) {
    return { retryable: false };
  }

  // タイムアウト
  if (err.name === "TimeoutError" || err.code === "TIMEOUT") {
    return { retryable: true, errorType: "timeout" };
  }

  return { retryable: false };
}

/**
 * リトライ間隔を計算する（Exponential Backoff with Jitter）
 *
 * @param attempt - リトライ試行回数（0始まり）
 * @param config - リトライ設定
 * @param retryAfterMs - Retry-Afterヘッダーから算出した待機時間（オプション）
 * @returns 待機時間（ミリ秒）
 */
export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig,
  retryAfterMs?: number,
): number {
  // Retry-Afterヘッダー優先（maxDelayMsでキャップ）
  if (retryAfterMs !== undefined) {
    return Math.min(
      Math.max(retryAfterMs, config.baseDelayMs),
      config.maxDelayMs,
    );
  }

  const exponentialDelay =
    config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);
  const cappedDelay = Math.min(config.maxDelayMs, exponentialDelay);
  const jitter = cappedDelay * (Math.random() * 2 - 1) * config.jitterFactor;
  return Math.max(0, cappedDelay + jitter);
}

/**
 * AbortSignal対応のsleep関数
 *
 * @param ms - 待機時間（ミリ秒）
 * @param signal - AbortSignal（オプション）
 * @returns Promise<void>
 * @throws AbortError（signal.abort()時）
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

/** 機密情報として除去するキーのパターン */
const SENSITIVE_KEY_PATTERNS = [
  "password",
  "passwd",
  "pwd",
  "secret",
  "token",
  "bearer",
  "key",
  "apikey",
  "api_key",
  "credential",
  "auth",
  "access_token",
  "refresh_token",
  "private_key",
] as const;

// =================================================================
// SDK型定義（実際のSDKから取得）
// =================================================================

interface SDKQueryOptions {
  tools?: string[];
  permissionMode?:
    | "default"
    | "acceptEdits"
    | "bypassPermissions"
    | "plan"
    | "delegate"
    | "dontAsk";
  abortController?: AbortController;
  timeout?: number;
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
  private permissionResolver: PermissionResolver;
  private permissionStore: IPermissionStore | null;
  private authKeyService: IAuthKeyService | null;
  private retryCounters: Map<string, number> = new Map();
  private abortedExecutions: Set<string> = new Set();

  /**
   * コンストラクタ
   *
   * @param mainWindow - メインウィンドウ
   * @param permissionStore - 権限永続化ストア（オプション、DIまたはデフォルト作成）
   * @param authKeyService - 認証キー管理サービス（オプション、TASK-FIX-16-1）
   */
  constructor(
    mainWindow: BrowserWindow,
    permissionStore?: IPermissionStore,
    authKeyService?: IAuthKeyService,
  ) {
    this.mainWindow = mainWindow;
    this.permissionResolver = new PermissionResolver();
    this.permissionStore = permissionStore ?? new PermissionStore();
    this.authKeyService = authKeyService ?? null;
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
      // query() API 呼び出し（リトライ付き）
      const response = await this.executeWithRetry(
        executionId,
        request,
        skill,
        abortController,
      );

      const sdkMessages: unknown[] = [];

      // ストリーミング処理
      for await (const message of response.stream()) {
        if (abortController.signal.aborted) {
          break;
        }
        sdkMessages.push(message);
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
        sdkMessages,
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
   * リトライ付きでSDK query()を実行する
   *
   * @param executionId - 実行ID
   * @param request - 実行リクエスト
   * @param skill - スキルメタデータ
   * @param abortController - AbortController
   * @returns SDKレスポンス
   */
  private async executeWithRetry(
    executionId: string,
    request: SkillExecutionRequest,
    skill: SkillMetadata,
    abortController: AbortController,
  ): Promise<{ stream: () => AsyncIterable<unknown> }> {
    const config: RetryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...request.retryConfig,
    };

    let lastError: unknown;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      // abort チェック
      if (abortController.signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      try {
        const fullPrompt = await this.buildPrompt(request.prompt, skill);
        const response = await this.callSDKQuery(fullPrompt, {
          tools: skill.allowedTools || [...DEFAULT_TOOLS],
          permissionMode: "default",
          abortController,
          timeout: request.timeout ?? this.defaultTimeout,
        });
        return response;
      } catch (error) {
        lastError = error;

        const retryResult = isRetryableError(error);

        // リトライ不可の場合は即座にスロー
        if (!retryResult.retryable) {
          throw error;
        }

        // 最後の試行の場合はスロー
        if (attempt >= config.maxRetries) {
          throw error;
        }

        // abort チェック
        if (abortController.signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }

        // バックオフ計算
        const delayMs = calculateBackoffDelay(
          attempt,
          config,
          retryResult.retryAfterMs,
        );

        // リトライストリーミングイベント送信
        this.sendStream({
          executionId,
          id: uuidv4(),
          type: "retry",
          content: JSON.stringify({
            attempt,
            maxRetries: config.maxRetries,
            delayMs,
            errorType: retryResult.errorType,
            errorMessage:
              error instanceof Error ? error.message : String(error),
          }),
          timestamp: Date.now(),
          isComplete: false,
        });

        // バックオフ待機（AbortSignal対応）
        await sleep(delayMs, abortController.signal);
      }
    }

    // 到達不能だが型安全のため
    throw lastError;
  }

  /**
   * SDK query() を呼び出す
   * NOTE: 実際の実装では claude-agent-sdk を使用
   * 型宣言によりクエリ関数は型安全
   *
   * TASK-FIX-16-1: AuthKeyService から API キーを取得
   */
  private async callSDKQuery(
    prompt: string,
    options: SDKQueryOptions,
  ): Promise<{ stream: () => AsyncIterable<unknown> }> {
    // TASK-FIX-16-1: API キーを取得
    const apiKey = await this.getApiKey();

    // Dynamic import for SDK（SDK実型により型安全）
    const { query } = await import("@anthropic-ai/claude-agent-sdk");

    // TASK-9B-I: SDK query() を型安全に呼び出す（as any 不要）
    const conversation = query({
      prompt,
      options: {
        env: { ANTHROPIC_API_KEY: apiKey }, // TASK-FIX-16-1: 環境変数経由で認証キーを渡す
        tools: options.tools,
        permissionMode: options.permissionMode,
        abortController: options.abortController,
      },
    });

    // Query は AsyncGenerator<SDKMessage, void> を extends するため直接 AsyncIterable として返却
    return {
      stream: () => conversation,
    };
  }

  /**
   * API キーを取得する
   *
   * TASK-FIX-16-1: AuthKeyService 経由で取得、環境変数フォールバック対応
   *
   * @returns API キー
   * @throws Error - キーが設定されていない場合
   */
  private async getApiKey(): Promise<string> {
    // AuthKeyService 経由で取得
    if (this.authKeyService) {
      const key = await this.authKeyService.getKey();
      if (key) {
        return key;
      }
    }

    // 環境変数フォールバック
    const envKey = process.env.ANTHROPIC_API_KEY;
    if (envKey) {
      return envKey;
    }

    // キー未設定エラー
    const error: SkillExecutionError = {
      code: "AUTHENTICATION_ERROR",
      message:
        "Anthropic API Key is not configured. Please set it in Settings.",
    };
    throw error;
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
    // shared helper による前処理
    const msg = asSdkMessageRecord(message);
    if (!msg) {
      return null;
    }

    const msgType = getSdkMessageType(msg);

    let type: SkillStreamMessageType;
    let content: string;

    if (msgType === "text" && typeof msg.content === "string") {
      type = "text";
      content = msg.content as string;
    } else if (msgType === "tool_use" && msg.tool_use) {
      type = "tool_use";
      const toolUse = msg.tool_use as { name: string; input: unknown };
      content = JSON.stringify({
        name: toolUse.name,
        input: toolUse.input,
      });
    } else if (msgType === "error" || msg.error) {
      type = "error";
      const error = msg.error as { message: string } | undefined;
      content = error?.message ?? "Unknown error";
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
    this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message);
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

    // TASK-FIX-16-1: SkillExecutionError オブジェクトがそのまま throw された場合
    // (例: AUTHENTICATION_ERROR)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error
    ) {
      const errorObj = error as SkillExecutionError;
      return {
        code: errorObj.code,
        message: errorObj.message,
        details: errorObj.details,
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
      this.abortedExecutions.delete(executionId);
    }, HISTORY_RETENTION_MS);
  }

  // =================================================================
  // TASK-3-1-B: Hooks実装
  // =================================================================

  /** 文字列の最大表示長（truncate用） */
  private static readonly MAX_DISPLAY_LENGTH = 50;

  /**
   * argsからファイルパスを取得するヘルパー
   * Write/Edit ツールの両方の引数形式に対応
   */
  private getFilePathFromArgs(args: Record<string, unknown>): string {
    return (args.path as string) || (args.file_path as string) || "";
  }

  /**
   * 文字列を指定長で切り詰める
   */
  private truncateString(
    str: string,
    maxLength: number = SkillExecutor.MAX_DISPLAY_LENGTH,
  ): string {
    return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
  }

  /**
   * Hooksを作成する（FR-001〜FR-005）
   *
   * @param executionId - 実行ID
   * @returns PreToolUse / PostToolUse Hooks オブジェクト
   */
  createHooks(executionId: string) {
    return {
      /**
       * PreToolUse Hook - ツール実行前のセキュリティチェックと通知
       *
       * FR-001: 危険コマンドのブロック
       * FR-002: 保護パスへの書き込みブロック
       * FR-003: ツール実行開始通知
       */
      PreToolUse: async (
        input: PreToolUseInput,
        toolUseId: string,
        _context: { signal: AbortSignal },
      ): Promise<PreToolUseResult> => {
        // FR-001: 危険コマンドチェック
        if (input.toolName === "Bash") {
          const command = (input.args.command as string) || "";
          if (isDangerousCommand(command)) {
            this.sendHooksStream({
              executionId,
              type: "status",
              content: {
                status: "tool_completed",
                detail: `危険なコマンドをブロック: ${this.truncateString(command)}`,
              },
              timestamp: Date.now(),
            });
            return {
              proceed: false,
              message: `危険なコマンドをブロックしました: ${command}`,
            };
          }
        }

        // FR-002: 保護パスチェック
        if (input.toolName === "Write" || input.toolName === "Edit") {
          const filePath = this.getFilePathFromArgs(input.args);
          if (isProtectedPath(filePath)) {
            this.sendHooksStream({
              executionId,
              type: "status",
              content: {
                status: "tool_completed",
                detail: `保護パスへの書き込みをブロック: ${filePath}`,
              },
              timestamp: Date.now(),
            });
            return {
              proceed: false,
              message: `保護されたパスへの書き込みをブロックしました: ${filePath}`,
            };
          }
        }

        // FR-003: ツール実行開始を通知
        this.sendHooksStream({
          executionId,
          type: "tool_use",
          content: {
            toolName: input.toolName,
            args: input.args,
            toolUseId,
          },
          timestamp: Date.now(),
        });

        // FR-101〜FR-106: Permission チェック + フォールバック統合
        return await this.handlePermissionCheck(
          executionId,
          input.toolName,
          input.args,
          _context.signal,
        );
      },

      /**
       * PostToolUse Hook - ツール実行後の結果通知
       *
       * FR-004: ツール実行結果通知
       * FR-005: ツール完了ステータス通知
       */
      PostToolUse: async (
        input: PostToolUseInput,
        toolUseId: string,
        _context: { signal: AbortSignal },
      ): Promise<Record<string, never>> => {
        // FR-004: ツール結果を通知
        this.sendHooksStream({
          executionId,
          type: "tool_result",
          content: {
            toolUseId,
            success: true,
            result: input.result,
          },
          timestamp: Date.now(),
        });

        // FR-005: 完了ステータスを通知
        this.sendHooksStream({
          executionId,
          type: "status",
          content: {
            status: "tool_completed",
            detail: input.toolName,
          },
          timestamp: Date.now(),
        });

        return {};
      },
    };
  }

  /**
   * Hooks用ストリームメッセージを送信する
   * BrowserWindowが破棄されている場合は安全にスキップする
   */
  private sendHooksStream(message: HooksStreamMessage): void {
    try {
      if (this.mainWindow.isDestroyed()) {
        return;
      }
      this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message);
    } catch (error) {
      // IPC送信エラーはログ出力のみで処理を継続
      console.error("[SkillExecutor] Failed to send hooks stream:", error);
    }
  }

  /**
   * エラーカテゴリを判定する（FR-006）
   *
   * @param error - 判定対象のエラー
   * @returns エラーカテゴリ
   */
  categorizeError(error: unknown): ErrorCategory {
    if (error instanceof Error) {
      // AbortError = タイムアウト
      if (error.name === "AbortError") return "timeout";

      // permissionを含む = 権限エラー
      if (error.message.toLowerCase().includes("permission"))
        return "permission_denied";

      // network/fetchを含む = ネットワークエラー
      if (
        error.message.toLowerCase().includes("network") ||
        error.message.toLowerCase().includes("fetch")
      )
        return "network";

      // SDK/APIを含む = SDKエラー
      if (error.message.includes("SDK") || error.message.includes("API"))
        return "sdk_error";
    }

    return "unknown";
  }

  /**
   * リトライ可能かどうかを判定する（FR-007）
   *
   * @param error - 判定対象のエラー
   * @returns リトライ可能な場合 true
   */
  isRetryable(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("network") ||
        message.includes("timeout") ||
        message.includes("econnreset")
      ) {
        return true;
      }
    }
    return false;
  }

  // =================================================================
  // Permission Request 関連メソッド（TASK-3-1-C）
  // =================================================================

  /**
   * 引数をサニタイズする
   *
   * 機密情報を除去し、長文を省略する。
   * Renderer に送信される権限リクエストの引数に使用。
   *
   * @param args - サニタイズ対象の引数
   * @param depth - 現在の再帰深度（内部用）
   * @returns サニタイズされた引数
   */
  sanitizeArgs(
    args: Record<string, unknown>,
    depth: number = 0,
  ): Record<string, unknown> {
    // 深度制限（循環参照対策）
    const MAX_DEPTH = 10;
    if (depth >= MAX_DEPTH) {
      return { _truncated: "[深度制限超過]" };
    }

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(args)) {
      // 機密キーの除去（大文字小文字を区別しない）
      const keyLower = key.toLowerCase();
      if (SENSITIVE_KEY_PATTERNS.some((k) => keyLower.includes(k))) {
        sanitized[key] = "[REDACTED]";
        continue;
      }

      // null/undefined はそのまま
      if (value === null || value === undefined) {
        sanitized[key] = value;
        continue;
      }

      // 文字列の長文省略
      if (typeof value === "string") {
        if (value.length > 500) {
          const omittedCount = value.length - 500;
          sanitized[key] =
            `${value.substring(0, 500)}...[省略: ${omittedCount}文字]`;
        } else {
          sanitized[key] = value;
        }
        continue;
      }

      // 配列の処理
      if (Array.isArray(value)) {
        sanitized[key] = value.map((item) => {
          if (typeof item === "object" && item !== null) {
            return this.sanitizeArgs(
              item as Record<string, unknown>,
              depth + 1,
            );
          }
          return item;
        });
        continue;
      }

      // オブジェクトの再帰処理
      if (typeof value === "object") {
        sanitized[key] = this.sanitizeArgs(
          value as Record<string, unknown>,
          depth + 1,
        );
        continue;
      }

      // その他（数値、真偽値など）はそのまま
      sanitized[key] = value;
    }

    return sanitized;
  }

  /**
   * 権限リクエストの理由を生成する
   *
   * ツール名と引数から、ユーザーに分かりやすい日本語の理由文を生成。
   *
   * @param toolName - ツール名
   * @param args - ツール引数
   * @returns 理由文字列
   */
  getPermissionReason(toolName: string, args: Record<string, unknown>): string {
    const MAX_REASON_LENGTH = 150;

    switch (toolName) {
      case "Bash": {
        const command = (args.command as string) || "";
        if (!command) {
          return "Bash コマンドを実行";
        }
        const truncated =
          command.length > 100 ? `${command.substring(0, 100)}...` : command;
        const reason = `コマンドを実行: ${truncated}`;
        return reason.length > MAX_REASON_LENGTH
          ? `${reason.substring(0, MAX_REASON_LENGTH)}...`
          : reason;
      }

      case "Write": {
        const path = (args.file_path as string) || (args.path as string) || "";
        return `ファイルを作成: ${path}`;
      }

      case "Edit": {
        const path = (args.file_path as string) || (args.path as string) || "";
        return `ファイルを編集: ${path}`;
      }

      case "Read": {
        const path = (args.file_path as string) || (args.path as string) || "";
        return `ファイルを読み取り: ${path}`;
      }

      case "Glob": {
        const pattern = (args.pattern as string) || "";
        return `ファイルを検索: ${pattern}`;
      }

      case "Grep": {
        const pattern = (args.pattern as string) || "";
        return `テキストを検索: ${pattern}`;
      }

      case "Task": {
        const desc = (args.description as string) || "";
        const truncated =
          desc.length > 50 ? `${desc.substring(0, 50)}...` : desc;
        return `サブタスクを実行: ${truncated}`;
      }

      default:
        return `${toolName} を実行`;
    }
  }

  /**
   * 権限応答を処理する
   *
   * Renderer から IPC 経由で受け取った権限応答を PermissionResolver に渡す。
   * TASK-3-1-E: rememberChoice=true かつ approved=true の場合、ツールを永続化。
   *
   * @param requestId - リクエストID
   * @param approved - 承認されたか
   * @param rememberChoice - 選択を記憶するか（オプション）
   * @param rejectReason - 拒否理由（オプション）
   * @param toolName - ツール名（永続化用、オプション）
   */
  handlePermissionResponse(
    requestId: string,
    approved: boolean,
    rememberChoice?: boolean,
    rejectReason?: string,
    toolName?: string,
  ): void {
    // TASK-3-1-E: 許可を永続化
    if (approved && rememberChoice && toolName && this.permissionStore) {
      this.permissionStore.allowTool(toolName);
      console.info(`[SkillExecutor] Tool permission persisted: ${toolName}`);
    }

    this.permissionResolver.resolveRequest({
      requestId,
      approved,
      rememberChoice,
      rejectReason,
    });
  }

  /**
   * 権限リクエストを送信し、応答を待機する
   *
   * TASK-3-1-E: 許可済みツールは自動許可（ダイアログスキップ）
   *
   * @param executionId - 実行ID
   * @param toolName - ツール名
   * @param args - ツール引数
   * @param signal - AbortSignal
   * @returns 権限応答
   */
  async sendPermissionRequest(
    executionId: string,
    toolName: string,
    args: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<SkillPermissionResponse> {
    // TASK-3-1-E: 許可済みツールは自動許可
    if (this.permissionStore?.isToolAllowed(toolName)) {
      console.info(
        `[SkillExecutor] Auto-approving tool (already allowed): ${toolName}`,
      );
      return {
        requestId: uuidv4(),
        approved: true,
        rememberChoice: true, // 既に記憶済みなので常にtrue
      };
    }

    const requestId = uuidv4();

    // Renderer に権限リクエストを送信
    if (!this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(
        SKILL_CHANNELS.SKILL_PERMISSION_REQUEST,
        {
          executionId,
          requestId,
          toolName,
          args: this.sanitizeArgs(args),
          reason: this.getPermissionReason(toolName, args),
        },
      );
    }

    // 応答を待機
    return this.permissionResolver.waitForResponse(requestId, signal);
  }

  /**
   * タイムアウト付き権限リクエスト送信 (FR-102)
   *
   * Promise.race で sendPermissionRequest とタイムアウトを競合させる。
   * タイムアウト時は PermissionTimeoutError をスロー。
   * 成功時は clearTimeout でタイマーを解放（メモリリーク防止）。
   */
  private sendPermissionRequestWithTimeout(
    executionId: string,
    toolName: string,
    args: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<SkillPermissionResponse> {
    return new Promise<SkillPermissionResponse>((resolve, reject) => {
      let settled = false;

      const timeoutId = setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new PermissionTimeoutError(this.defaultTimeout, toolName));
        }
      }, this.defaultTimeout);

      this.sendPermissionRequest(executionId, toolName, args, signal)
        .then((response) => {
          if (!settled) {
            settled = true;
            clearTimeout(timeoutId);
            resolve(response);
          }
        })
        .catch((error) => {
          if (!settled) {
            settled = true;
            clearTimeout(timeoutId);
            reject(error);
          }
        });
    });
  }

  /**
   * PreToolUse Hook 用 Permission チェック (FR-101〜FR-106)
   *
   * フロー:
   * 1. sendPermissionRequestWithTimeout でタイムアウト付き権限リクエスト
   * 2. approved → { proceed: true }
   * 3. 拒否 → processPermissionFallback で分岐
   *    - skip → executeSkipFlow + { proceed: false }
   *    - retry → ループ再実行 (max PERMISSION_MAX_RETRIES)
   *    - abort/max_retries → executeAbortFlow + throw
   * 4. 例外 → fail-closed: executeAbortFlow("unknown") + throw (NFR-101)
   */
  async handlePermissionCheck(
    executionId: string,
    toolName: string,
    args: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<PreToolUseResult> {
    try {
      let retryCount = 0;

      while (true) {
        const response = await this.sendPermissionRequestWithTimeout(
          executionId,
          toolName,
          args,
          signal,
        );

        // 承認された場合
        if (response.approved) {
          // rememberChoice が true の場合、ツールを許可リストに追加
          if (response.rememberChoice && this.permissionStore) {
            this.permissionStore.allowTool(toolName);
          }
          return { proceed: true };
        }

        // 拒否された場合 → フォールバック処理
        const context: PermissionFlowContext = {
          executionId,
          requestId: response.requestId,
          toolName,
          retryCount,
          maxRetries: PERMISSION_MAX_RETRIES,
        };

        const fallback = await this.processPermissionFallback(
          response,
          context,
        );

        switch (fallback.action) {
          case "approved":
            return { proceed: true };

          case "skip":
            this.executeSkipFlow(executionId, toolName);
            return {
              proceed: false,
              message: `Permission denied: tool "${toolName}" was skipped`,
            };

          case "retry":
            retryCount = fallback.retryCount ?? retryCount + 1;
            continue;

          case "abort":
            throw new Error(
              `Permission flow aborted: reason=${fallback.reason}, tool=${toolName}`,
            );
        }
      }
    } catch (error: unknown) {
      // NFR-101: fail-closed — 予期しない例外は abort に倒す
      if (error instanceof PermissionTimeoutError) {
        await this.executeAbortFlow("timeout", executionId);
        throw error;
      }
      // processPermissionFallback 内で既に abort 済みの場合は再スロー
      if (this.abortedExecutions.has(executionId)) {
        throw error;
      }
      // 未知の例外 → abort
      await this.executeAbortFlow("unknown", executionId);
      throw error;
    }
  }

  // =================================================================
  // UT-06-005: Permission Fallback Flows
  // abort/skip/retry/timeout フォールバック制御
  // =================================================================

  /**
   * Permission応答のフォールバック処理
   *
   * フロー分岐:
   * - approved=true → { action: "approved" }
   * - approved=false, skip=true → { action: "skip" }
   * - approved=false, retryCount < maxRetries → { action: "retry" }
   * - approved=false, retryCount >= maxRetries → { action: "abort", reason: "max_retries" }
   *
   * NFR-1: 不明なエラー時は fail-closed（abort）
   */
  async processPermissionFallback(
    response: SkillPermissionResponse,
    context: PermissionFlowContext,
  ): Promise<PermissionFlowResult> {
    try {
      // approved の場合
      if (response.approved) {
        return { action: "approved" };
      }

      // skip の場合
      if ("skip" in response && response.skip === true) {
        console.info(
          `[SkillExecutor] skip: tool=${context.toolName}, executionId=${context.executionId}`,
        );
        return { action: "skip" };
      }

      // retry 判定
      const maxRetries = context.maxRetries ?? PERMISSION_MAX_RETRIES;
      const nextRetryCount = context.retryCount + 1;
      if (nextRetryCount >= maxRetries) {
        // max retries 到達 → abort
        console.warn(
          `[SkillExecutor] max_retries reached: retryCount=${nextRetryCount}, executionId=${context.executionId}`,
        );
        await this.executeAbortFlow("max_retries", context.executionId);
        return {
          action: "abort",
          reason: "max_retries",
          retryCount: nextRetryCount,
        };
      }

      // retry
      console.info(
        `[SkillExecutor] retry: retryCount=${nextRetryCount}/${maxRetries}, executionId=${context.executionId}`,
      );
      this.retryCounters.set(context.requestId, nextRetryCount);
      return {
        action: "retry",
        retryCount: nextRetryCount,
      };
    } catch (error: unknown) {
      // NFR-1: fail-closed
      console.error(
        "[SkillExecutor] unknown error in permission fallback",
        error,
      );
      await this.executeAbortFlow("unknown", context.executionId);
      return { action: "abort", reason: "unknown" };
    }
  }

  /**
   * abort 4ステップフローの実行
   *
   * Step 1: cancelAll() - 全pending permissionリクエストをキャンセル
   * Step 2: revokeSessionEntries(executionId) - セッション内一時許可を取消
   * Step 3: log - abort イベントをログに記録
   * Step 4: IPC - Renderer に abort 通知を送信
   *
   * NFR-3: 冪等性 - 二重 abort でエラー非発生
   */
  async executeAbortFlow(
    reason: AbortReason,
    executionId: string,
  ): Promise<void> {
    // 冪等性: 既に aborted なら何もしない
    if (this.abortedExecutions.has(executionId)) {
      return;
    }
    this.abortedExecutions.add(executionId);

    // Step 1: cancelAll
    try {
      this.permissionResolver.cancelAll();
    } catch (error: unknown) {
      console.error("[SkillExecutor] cancelAll failed during abort", error);
    }

    // Step 2: revokeSessionEntries
    try {
      if (this.permissionStore) {
        const revokedCount =
          this.permissionStore.revokeSessionEntries?.(executionId) ?? 0;
        if (revokedCount > 0) {
          console.info(
            `[SkillExecutor] revoked ${revokedCount} session entries`,
          );
        }
      }
    } catch (error: unknown) {
      console.error(
        "[SkillExecutor] revokeSessionEntries failed during abort",
        error,
      );
    }

    // Step 3: log
    console.warn(
      `[SkillExecutor] abort: reason=${reason}, executionId=${executionId}`,
    );

    // Step 4: IPC notification
    if (!this.mainWindow.isDestroyed()) {
      this.sendStream({
        executionId,
        id: uuidv4(),
        type: "error",
        content: `Execution aborted: ${reason}`,
        timestamp: Date.now(),
        isComplete: true,
      });
    }

    // 状態更新
    this.updateExecutionState(executionId, "aborted");

    // リトライカウンタクリア
    this.retryCounters.clear();
  }

  /**
   * skip フローの実行
   *
   * 現在のツール実行をスキップし、後続処理を継続する。
   * ExecutionState は "running" のまま維持。
   */
  executeSkipFlow(executionId: string, toolName: string): void {
    // ログ記録
    console.info(
      `[SkillExecutor] skip: toolName=${toolName}, executionId=${executionId}`,
    );

    // IPC通知
    if (!this.mainWindow.isDestroyed()) {
      this.sendStream({
        executionId,
        id: uuidv4(),
        type: "tool_use",
        content: `Tool skipped: ${toolName}`,
        timestamp: Date.now(),
        isComplete: false,
      });
    }
  }
}
