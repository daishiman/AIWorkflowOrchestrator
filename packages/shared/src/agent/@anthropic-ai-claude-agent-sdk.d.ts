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
}
