import type { BetaMessage } from "@anthropic-ai/sdk/resources/beta/messages/messages.mjs";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ToolAnnotations,
} from "@modelcontextprotocol/sdk/types.js";
import type { ZodRawShape, ZodTypeAny } from "zod";

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

  export type PermissionMode =
    | "default"
    | "plan"
    | "acceptEdits"
    | "bypassPermissions"
    | "delegate"
    | "dontAsk";

  export type SDKAssistantMessageError =
    | "authentication_failed"
    | "billing_error"
    | "rate_limit"
    | "invalid_request"
    | "server_error"
    | "unknown"
    | "max_output_tokens";

  export type SDKPermissionDenial = {
    tool_name: string;
    tool_use_id: string;
    tool_input: Record<string, unknown>;
  };

  export type SDKUserMessage = {
    type: "user";
    content: string | Array<{ type: "text"; text: string }>;
    uuid?: string;
    session_id?: string;
  };

  export type SDKAssistantMessage = {
    type: "assistant";
    message: BetaMessage;
    parent_tool_use_id: string | null;
    error?: SDKAssistantMessageError;
    uuid: string;
    session_id: string;
  };

  export type SDKPartialAssistantMessage = {
    type: "stream_event";
    event: unknown;
    parent_tool_use_id: string | null;
    uuid: string;
    session_id: string;
  };

  export type SDKSystemMessage = {
    type: "system";
    subtype: string;
    uuid: string;
    session_id: string;
    [key: string]: unknown;
  };

  export type SDKResultSuccess = {
    type: "result";
    subtype: "success";
    duration_ms: number;
    duration_api_ms: number;
    is_error: boolean;
    num_turns: number;
    result: string;
    stop_reason: string | null;
    total_cost_usd: number;
    usage: Record<string, unknown>;
    modelUsage: Record<string, unknown>;
    permission_denials: SDKPermissionDenial[];
    structured_output?: unknown;
    fast_mode_state?: unknown;
    uuid: string;
    session_id: string;
  };

  export type SDKResultError = {
    type: "result";
    subtype:
      | "error_during_execution"
      | "error_max_turns"
      | "error_max_budget_usd"
      | "error_max_structured_output_retries";
    duration_ms: number;
    duration_api_ms: number;
    is_error: boolean;
    num_turns: number;
    stop_reason: string | null;
    total_cost_usd: number;
    usage: Record<string, unknown>;
    modelUsage: Record<string, unknown>;
    permission_denials: SDKPermissionDenial[];
    fast_mode_state?: unknown;
    uuid: string;
    session_id: string;
  };

  export type SDKResultMessage = SDKResultSuccess | SDKResultError;

  export type SDKMessage =
    | SDKAssistantMessage
    | SDKUserMessage
    | SDKPartialAssistantMessage
    | SDKResultMessage
    | SDKSystemMessage;

  export type AnyZodRawShape = ZodRawShape;

  export type InferShape<Schema extends AnyZodRawShape> = {
    [Key in keyof Schema]: Schema[Key] extends ZodTypeAny ? unknown : never;
  };

  export type SdkMcpToolDefinition<
    Schema extends AnyZodRawShape = AnyZodRawShape,
  > = {
    name: string;
    description: string;
    inputSchema: Schema;
    annotations?: ToolAnnotations;
    _meta?: Record<string, unknown>;
    handler: (
      args: Record<string, unknown>,
      extra: unknown,
    ) => Promise<CallToolResult> | CallToolResult;
  };

  export type McpSdkServerConfig = {
    type: "sdk";
    name: string;
  };

  export type McpSdkServerConfigWithInstance = McpSdkServerConfig & {
    instance: McpServer;
  };

  export type McpServerConfig =
    | McpSdkServerConfig
    | McpSdkServerConfigWithInstance;

  export type CreateSdkMcpServerOptions = {
    name: string;
    version?: string;
    tools?: Array<SdkMcpToolDefinition<unknown>>;
  };

  export type Options = {
    cwd?: string;
    sessionId?: string;
    abortController?: AbortController;
    tools?: string[] | { type: "preset"; preset: "claude_code" };
    mcpServers?: Record<string, McpServerConfig>;
    permissionMode?: PermissionMode;
    canUseTool?: (
      toolName: string,
      input: Record<string, unknown>,
      options: {
        signal: AbortSignal;
        toolUseID: string;
        suggestions?: unknown[];
        blockedPath?: string;
        decisionReason?: string;
        title?: string;
        displayName?: string;
        description?: string;
        agentID?: string;
      },
    ) => Promise<unknown>;
    allowedTools?: string[];
    disallowedTools?: string[];
    continue?: boolean;
    env?: Record<string, string | undefined>;
    model?: string;
  };

  export interface Query extends AsyncIterable<SDKMessage> {
    stream?(): AsyncIterable<SDKMessage>;
  }

  export function createSdkMcpServer(
    _options: CreateSdkMcpServerOptions,
  ): McpSdkServerConfigWithInstance;

  export function tool<Schema extends AnyZodRawShape>(
    name: string,
    description: string,
    inputSchema: Schema,
    handler: (
      args: Record<string, unknown>,
      extra: unknown,
    ) => Promise<CallToolResult> | CallToolResult,
    extras?: {
      annotations?: ToolAnnotations;
      searchHint?: string;
      alwaysLoad?: boolean;
    },
  ): SdkMcpToolDefinition<Schema>;

  export function query(_params: {
    prompt: string | AsyncIterable<SDKUserMessage>;
    options?: Options;
  }): Query;
}
