/**
 * Agent SDK Client
 * @module @repo/shared/agent/agent-client
 */

import ClaudeSDK from "@anthropic-ai/claude-agent-sdk";
import type {
  AgentStatus,
  AgentStatusType,
  AgentClientConfig,
  SDKMessage,
  QueryOptions,
} from "./types";
import {
  AgentInitializationError,
  AgentQueryError,
  AgentTimeoutError,
  AgentAbortedError,
} from "./errors";

/**
 * デフォルト設定値
 */
const DEFAULT_CONFIG = {
  defaultTimeout: 30000,
  maxRetries: 3,
  initialRetryDelay: 1000,
  maxRetryDelay: 4000,
};

interface SDKInstance {
  query: (
    options: {
      prompt: string;
      sessionId?: string;
      systemPrompt?: string;
    },
    onMessage?: (message: SDKMessage) => void,
  ) => Promise<{ id: string; messages?: SDKMessage[] }>;
  abort: () => void;
}

/**
 * Agent SDKクライアント
 * - SDKの初期化・クエリ実行・中断を管理
 * - 指数バックオフによるリトライ機能
 */
export class AgentClient {
  private config: Required<AgentClientConfig>;
  private sdk: SDKInstance | null = null;
  private statusState: AgentStatusType = "not_initialized";
  private statusError?: string;
  private statusTimestamp: number = Date.now();
  private queryRunning: boolean = false;
  private abortController: AbortController | null = null;

  constructor(config: AgentClientConfig) {
    if (!config.apiKey) {
      throw new AgentInitializationError("API key is required");
    }

    this.config = {
      apiKey: config.apiKey,
      defaultTimeout: config.defaultTimeout ?? DEFAULT_CONFIG.defaultTimeout,
      maxRetries: config.maxRetries ?? DEFAULT_CONFIG.maxRetries,
      initialRetryDelay:
        config.initialRetryDelay ?? DEFAULT_CONFIG.initialRetryDelay,
      maxRetryDelay: config.maxRetryDelay ?? DEFAULT_CONFIG.maxRetryDelay,
    };
  }

  /**
   * 設定を取得する
   */
  getConfig(): Required<AgentClientConfig> {
    return { ...this.config };
  }

  /**
   * ステータスを取得する
   */
  getStatus(): AgentStatus {
    return {
      status: this.statusState,
      error: this.statusError,
      timestamp: this.statusTimestamp,
    };
  }

  /**
   * SDKを初期化する
   */
  async initialize(): Promise<void> {
    if (this.sdk) {
      return;
    }

    this.updateStatus("initializing");

    try {
      this.sdk = new ClaudeSDK({ apiKey: this.config.apiKey }) as SDKInstance;
      this.updateStatus("initialized");
    } catch (error) {
      this.updateStatus("error", (error as Error).message);
      throw new AgentInitializationError(
        "SDK initialization failed",
        error as Error,
      );
    }
  }

  /**
   * クエリを実行する
   */
  async query(
    prompt: string,
    onMessage: (message: SDKMessage) => void,
    options?: QueryOptions,
  ): Promise<void> {
    if (!this.sdk) {
      throw new AgentInitializationError("SDK not initialized");
    }

    this.queryRunning = true;
    this.abortController = new AbortController();
    const timeout = options?.timeout ?? this.config.defaultTimeout;

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= this.config.maxRetries) {
      try {
        await this.executeQueryWithTimeout(
          prompt,
          onMessage,
          options,
          timeout,
          this.abortController.signal,
        );
        this.queryRunning = false;
        return;
      } catch (error) {
        lastError = error as Error;

        if (
          error instanceof AgentAbortedError ||
          error instanceof AgentTimeoutError
        ) {
          this.queryRunning = false;
          throw error;
        }

        attempt++;
        if (attempt <= this.config.maxRetries) {
          const delay = Math.min(
            this.config.initialRetryDelay * Math.pow(2, attempt - 1),
            this.config.maxRetryDelay,
          );
          await this.sleep(delay);
        }
      }
    }

    this.queryRunning = false;
    throw new AgentQueryError(
      `Query failed after ${this.config.maxRetries} retries`,
      lastError ?? undefined,
    );
  }

  /**
   * 実行中のクエリを中断する
   */
  abort(): void {
    if (this.sdk) {
      this.sdk.abort();
    }
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * クエリが実行中かどうかを返す
   */
  isQueryRunning(): boolean {
    return this.queryRunning;
  }

  /**
   * タイムアウト付きでクエリを実行する
   */
  private async executeQueryWithTimeout(
    prompt: string,
    onMessage: (message: SDKMessage) => void,
    options: QueryOptions | undefined,
    timeout: number,
    signal: AbortSignal,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let isAborted = false;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      const handleAbort = () => {
        isAborted = true;
        cleanup();
        reject(new AgentAbortedError());
      };

      signal.addEventListener("abort", handleAbort, { once: true });

      timeoutId = setTimeout(() => {
        if (!isAborted) {
          cleanup();
          reject(new AgentTimeoutError());
        }
      }, timeout);

      this.sdk!.query(
        {
          prompt,
          sessionId: options?.sessionId,
          systemPrompt: options?.systemPrompt,
        },
        (message: SDKMessage) => {
          onMessage(message);
        },
      )
        .then(() => {
          cleanup();
          if (!isAborted) {
            resolve();
          }
        })
        .catch((error) => {
          cleanup();
          if (isAborted) {
            reject(new AgentAbortedError());
          } else {
            reject(new AgentQueryError("Query failed", error));
          }
        });
    });
  }

  /**
   * ステータスを更新する
   */
  private updateStatus(status: AgentStatusType, error?: string): void {
    this.statusState = status;
    this.statusError = error;
    this.statusTimestamp = Date.now();
  }

  /**
   * 指定時間待機する
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
