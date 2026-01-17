/**
 * Agent SDK Client - Claude Agent SDKとの連携
 * @module main/slide/agent-client
 *
 * Main Process内でAgent SDKを使用するためのクライアント。
 * Electron preload経由ではなく、直接IPCハンドラーを使用する。
 */

import Anthropic from "@anthropic-ai/sdk";
import { safeStorage } from "electron";
import Store from "electron-store";

/**
 * SDKメッセージタイプ（Main Process用ローカル定義）
 */
type SDKMessageType =
  | "text"
  | "tool_use"
  | "tool_result"
  | "error"
  | "complete";

/**
 * SDKメッセージ（Main Process用ローカル定義）
 * @repo/shared/agentの型と互換性を持つ
 */
interface SDKMessage {
  id: string;
  type: SDKMessageType;
  content: string;
  timestamp: number;
  isComplete: boolean;
}

/**
 * Modifier Skill用のAgent APIインターフェース
 * Renderer向けのAgentAPIを簡素化したMain Process用バージョン
 */
export interface ModifierAgentAPI {
  query(
    options: ModifierAgentQueryOptions,
  ): Promise<ModifierAgentQueryResponse>;
  abort(): void;
  getStatus(): AgentInternalStatus;
  onMessage(callback: (message: SDKMessage) => void): () => void;
}

/**
 * Modifier Agent用のクエリオプション
 */
export interface ModifierAgentQueryOptions {
  prompt: string;
  options?: {
    sessionId?: string;
    systemPrompt?: string;
    timeout?: number;
  };
}

/**
 * Modifier Agent用のクエリレスポンス
 */
export interface ModifierAgentQueryResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Agent内部ステータス
 */
export type AgentInternalStatus = "idle" | "running" | "error";

/**
 * Agent APIインスタンス（シングルトン）
 */
let agentAPIInstance: ModifierAgentAPI | null = null;

/**
 * メッセージリスナー
 */
const messageListeners = new Set<(message: SDKMessage) => void>();

/**
 * 現在のステータス
 */
let currentStatus: AgentInternalStatus = "idle";

/**
 * AbortController for current query
 */
let currentAbortController: AbortController | null = null;

/**
 * Electron Store for API key storage
 */
const store = new Store<{ anthropic_api_key?: string }>();

/**
 * SDK設定定数
 */
const SDK_CONFIG = {
  model: "claude-sonnet-4-20250514" as const,
  maxTokens: 8192,
} as const;

/**
 * APIキーを取得する
 * safeStorageから暗号化されたキーを取得するか、環境変数にフォールバック
 * @returns APIキー文字列
 * @throws API key not configuredエラー
 */
async function getApiKey(): Promise<string> {
  // Electron safeStorageから取得を試行
  const encrypted = store.get("anthropic_api_key");
  if (encrypted && safeStorage.isEncryptionAvailable()) {
    try {
      return safeStorage.decryptString(Buffer.from(encrypted, "base64"));
    } catch {
      // 復号に失敗した場合は環境変数にフォールバック
    }
  }

  // 環境変数フォールバック（開発時）
  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey) {
    return envKey;
  }

  throw new Error("API key not configured");
}

/**
 * Agent APIを取得する
 * @returns ModifierAgentAPI
 */
export function getAgentAPI(): ModifierAgentAPI {
  if (agentAPIInstance) {
    return agentAPIInstance;
  }

  agentAPIInstance = {
    async query(
      options: ModifierAgentQueryOptions,
    ): Promise<ModifierAgentQueryResponse> {
      if (currentStatus === "running") {
        throw new Error("Another query is already running");
      }

      currentStatus = "running";
      currentAbortController = new AbortController();

      const timeout = options.options?.timeout ?? 30000;

      try {
        // Main Process内でwindow.agentAPIは使用できないため、
        // IPCを通じてRenderer経由でAgent SDKを呼び出すか、
        // または直接Agent SDKを使用する。
        //
        // 現在はAgent SDK統合タスクが完了していないため、
        // シミュレーション実装を提供する。

        const response = await executeAgentQuery(
          options.prompt,
          options.options?.systemPrompt,
          timeout,
          currentAbortController.signal,
        );

        currentStatus = "idle";
        return response;
      } catch (error) {
        // ユーザーによるabortの場合はステータスを"idle"に保つ（abort()で設定済み）
        // タイムアウトや他のエラーの場合は"error"に設定
        if (
          error instanceof Error &&
          error.message === "Aborted" &&
          currentStatus === "idle"
        ) {
          // abort()がすでにステータスを"idle"に設定している場合はそのまま
        } else {
          currentStatus = "error";
        }
        throw error;
      } finally {
        currentAbortController = null;
      }
    },

    abort(): void {
      if (currentAbortController) {
        currentAbortController.abort();
        currentStatus = "idle";
      }
    },

    getStatus(): AgentInternalStatus {
      return currentStatus;
    },

    onMessage(callback: (message: SDKMessage) => void): () => void {
      messageListeners.add(callback);
      return () => {
        messageListeners.delete(callback);
      };
    },
  };

  return agentAPIInstance;
}

/**
 * Agent SDKでクエリを実行する
 * @param prompt ユーザープロンプト
 * @param systemPrompt システムプロンプト
 * @param timeout タイムアウト（ミリ秒）
 * @param signal AbortSignal
 */
async function executeAgentQuery(
  prompt: string,
  systemPrompt: string | undefined,
  timeout: number,
  signal: AbortSignal,
): Promise<ModifierAgentQueryResponse> {
  // タイムアウト用のAbortController
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, timeout);

  // 外部シグナルとタイムアウトをリンク
  const abortHandler = () => {
    clearTimeout(timeoutId);
    timeoutController.abort();
  };
  signal.addEventListener("abort", abortHandler);

  try {
    // APIキーを取得
    const apiKey = await getApiKey();

    // Anthropicクライアントを初期化
    const client = new Anthropic({ apiKey });

    // SDK呼び出し
    const response = await client.messages.create(
      {
        model: SDK_CONFIG.model,
        max_tokens: SDK_CONFIG.maxTokens,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        messages: [{ role: "user", content: prompt }],
      },
      { signal: timeoutController.signal },
    );

    clearTimeout(timeoutId);

    // 外部シグナルがabortされた場合
    if (signal.aborted) {
      throw new Error("Aborted");
    }

    // レスポンスからテキストコンテンツを抽出
    const textContent = response.content.find((block) => block.type === "text");
    const content =
      textContent && textContent.type === "text" ? textContent.text : "";

    const result: ModifierAgentQueryResponse = {
      content,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };

    // メッセージリスナーに通知
    const message: SDKMessage = {
      id: crypto.randomUUID(),
      type: "complete",
      content: result.content,
      timestamp: Date.now(),
      isComplete: true,
    };

    // リスナーのエラーを個別にキャッチしてログに出力
    messageListeners.forEach((listener) => {
      try {
        listener(message);
      } catch {
        // リスナーエラーは無視（他のリスナーへの通知を継続）
      }
    });

    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    // Abortエラーの処理
    // 注意: タイムアウトチェックを先に行う（両方ともAbortErrorになるため）
    if (error instanceof Error) {
      // タイムアウトの場合（内部シグナルがabortされ、外部シグナルはabortされていない）
      if (timeoutController.signal.aborted && !signal.aborted) {
        throw new Error("Request timeout");
      }
      // ユーザーによるabortの場合
      if (error.name === "AbortError" || signal.aborted) {
        throw new Error("Aborted");
      }
    }

    throw error;
  } finally {
    signal.removeEventListener("abort", abortHandler);
  }
}

/**
 * Agent APIインスタンスをリセットする（テスト用）
 */
export function resetAgentAPI(): void {
  agentAPIInstance = null;
  currentStatus = "idle";
  currentAbortController = null;
  messageListeners.clear();
}
