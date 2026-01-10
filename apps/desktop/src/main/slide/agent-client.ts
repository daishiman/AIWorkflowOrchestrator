/**
 * Agent SDK Client - Claude Agent SDKとの連携
 * @module main/slide/agent-client
 *
 * Main Process内でAgent SDKを使用するためのクライアント。
 * Electron preload経由ではなく、直接IPCハンドラーを使用する。
 */

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
 * 収集したメッセージ内容（Agent SDK統合時に使用予定）
 */
const _collectedContent = "";

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
      // Note: _collectedContent はAgent SDK統合時にストリーミング応答収集に使用

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
        currentStatus = "error";
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
  return new Promise((resolve, reject) => {
    // タイムアウト処理
    const timeoutId = setTimeout(() => {
      reject(new Error("Request timeout"));
    }, timeout);

    // Abort処理
    signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new Error("Aborted"));
    });

    // TODO: Agent SDK統合後に実際のAPI呼び出しを実装
    // 現在はシミュレーション実装
    //
    // 実際の実装では以下のようになる:
    // const client = new Anthropic({ apiKey: getApiKey() });
    // const response = await client.messages.create({
    //   model: "claude-sonnet-4-20250514",
    //   max_tokens: 8192,
    //   system: systemPrompt,
    //   messages: [{ role: "user", content: prompt }],
    // });

    // シミュレーション: 1秒後に応答
    setTimeout(() => {
      clearTimeout(timeoutId);

      if (signal.aborted) {
        reject(new Error("Aborted"));
        return;
      }

      // シミュレーションレスポンス
      // 実際のAgent SDKからは適切なJSON形式で返ってくる
      const simulatedResponse: ModifierAgentQueryResponse = {
        content: JSON.stringify({
          changes: [],
        }),
        usage: {
          inputTokens: 100,
          outputTokens: 50,
        },
      };

      // メッセージリスナーに通知
      const message: SDKMessage = {
        id: crypto.randomUUID(),
        type: "complete",
        content: simulatedResponse.content,
        timestamp: Date.now(),
        isComplete: true,
      };

      messageListeners.forEach((listener) => listener(message));

      resolve(simulatedResponse);
    }, 1000);
  });
}

/**
 * Agent APIインスタンスをリセットする（テスト用）
 */
export function resetAgentAPI(): void {
  agentAPIInstance = null;
  currentStatus = "idle";
  currentAbortController = null;
  messageListeners.clear();
  // Note: _collectedContent のリセットはAgent SDK統合時に追加
}
