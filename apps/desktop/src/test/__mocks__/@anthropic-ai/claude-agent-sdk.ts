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
