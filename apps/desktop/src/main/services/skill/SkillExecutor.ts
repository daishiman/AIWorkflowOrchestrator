/**
 * SkillExecutor - スキル実行エンジン
 *
 * TASK-3-1-A: SDK query() 基本実装
 * TASK-3-1-B: Hooks実装（PreToolUse/PostToolUse）
 * TASK-3-1-E: rememberChoice機能永続化（PermissionStore連携）
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

/** デフォルトのツールリスト */
const DEFAULT_TOOLS = ["Read", "Edit", "Bash", "Glob", "Grep"] as const;

/** デフォルトのタイムアウト（ミリ秒） */
const DEFAULT_TIMEOUT_MS = 30000;

/** 同時実行の最大数 */
const MAX_CONCURRENT_EXECUTIONS = 5;

/** 履歴保持期間（ミリ秒）- クリーンアップまでの待機時間 */
const HISTORY_RETENTION_MS = 60000;

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
  private permissionResolver: PermissionResolver;
  private permissionStore: IPermissionStore | null;

  /**
   * コンストラクタ
   *
   * @param mainWindow - メインウィンドウ
   * @param permissionStore - 権限永続化ストア（オプション、DIまたはデフォルト作成）
   */
  constructor(mainWindow: BrowserWindow, permissionStore?: IPermissionStore) {
    this.mainWindow = mainWindow;
    this.permissionResolver = new PermissionResolver();
    this.permissionStore = permissionStore ?? new PermissionStore();
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

        return { proceed: true };
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
      this.mainWindow.webContents.send("skill:stream", message);
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
}
