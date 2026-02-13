/**
 * Type declarations for @anthropic-ai/claude-agent-sdk
 * This is a stub for the hypothetical Claude Agent SDK
 */

declare module "@anthropic-ai/claude-agent-sdk" {
  export interface SDKConfig {
    apiKey: string;
  }

  export interface QueryOptions {
    prompt: string;
    sessionId?: string;
    systemPrompt?: string;
  }

  export interface QueryMessage {
    id: string;
    type: "text" | "tool_use" | "tool_result" | "error" | "complete";
    content: string;
    timestamp: number;
    isComplete: boolean;
  }

  export interface QueryResult {
    id: string;
    messages?: QueryMessage[];
  }

  export default class ClaudeSDK {
    constructor(config: SDKConfig);
    query(
      options: QueryOptions,
      onMessage?: (message: QueryMessage) => void,
    ): Promise<QueryResult>;
    abort(): void;
  }

  // === 追加: query() 名前付きエクスポート関連 (TASK-9B-I-SDK-FORMAL-INTEGRATION) ===

  /** query() に渡す Options */
  export interface QueryFunctionOptions {
    /** 使用可能ツール */
    tools?: string[];
    /** 権限モード */
    permissionMode?: "auto" | "ask" | "deny" | "default";
    /** AbortSignal */
    signal?: AbortSignal;
    /** API Key（直接指定） */
    apiKey?: string;
    /** タイムアウト（ミリ秒） */
    timeout?: number;
    /** Hooks */
    hooks?: Record<string, unknown>;
    /** Permissions */
    permissions?: Record<string, unknown>;
  }

  /** query() の引数 */
  export interface QueryFunctionArgs {
    prompt: string;
    options?: QueryFunctionOptions;
  }

  /** query() が返す Conversation オブジェクト */
  export interface QueryConversation {
    /** ストリーミングメッセージを取得する */
    stream(): AsyncIterable<unknown>;
  }

  /** query() 名前付きエクスポート関数 */
  export function query(args: QueryFunctionArgs): QueryConversation;
}
