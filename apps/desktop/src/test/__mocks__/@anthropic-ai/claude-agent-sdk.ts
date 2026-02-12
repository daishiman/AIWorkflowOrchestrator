/**
 * Mock for @anthropic-ai/claude-agent-sdk
 * This mock is used by vitest to resolve the hypothetical SDK
 */

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
  constructor(_config: SDKConfig) {}

  query(
    _options: QueryOptions,
    _onMessage?: (message: QueryMessage) => void,
  ): Promise<QueryResult> {
    return Promise.resolve({ id: "mock-response-id" });
  }

  abort(): void {}
}

// === 追加: query() 名前付きエクスポート (TASK-9B-I-SDK-FORMAL-INTEGRATION) ===
// SkillExecutor が使用する query() 関数 API のモック
// query() は AsyncIterable（AsyncGenerator互換）を直接返す

export function query(_args: {
  prompt: string;
  options?: Record<string, unknown>;
}): AsyncIterable<unknown> {
  return {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          return { done: true, value: undefined };
        },
      };
    },
  };
}
