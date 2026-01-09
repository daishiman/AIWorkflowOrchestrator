/**
 * @file LLM IPC Handlers
 * @description LLMプロバイダー操作用IPCハンドラー
 * @feature chat-multi-llm-switching
 */

import { ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { LLMAdapterFactory } from "../adapters/llm/LLMAdapterFactory";
import { SecureStorage } from "../services/secureStorage";
import type {
  LLMProvider,
  LLMProviderId,
  LLMChatRequestInput,
  LLMChatResponse,
  HealthCheckResult,
  LLMError,
  LLMErrorCode,
} from "@repo/shared/types/llm/schemas";

/**
 * プロバイダー設定（静的定義）
 */
const PROVIDER_CONFIGS: Array<{
  id: LLMProviderId;
  name: string;
  models: Array<{
    id: string;
    name: string;
    contextWindow: number;
    isDefault: boolean;
  }>;
}> = [
  {
    id: "openai",
    name: "OpenAI",
    models: [
      { id: "gpt-4o", name: "GPT-4o", contextWindow: 128000, isDefault: true },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o mini",
        contextWindow: 128000,
        isDefault: false,
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        contextWindow: 128000,
        isDefault: false,
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        contextWindow: 200000,
        isDefault: true,
      },
      {
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
        contextWindow: 200000,
        isDefault: false,
      },
      {
        id: "claude-3-haiku-20240307",
        name: "Claude 3 Haiku",
        contextWindow: 200000,
        isDefault: false,
      },
    ],
  },
  {
    id: "google",
    name: "Google",
    models: [
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        contextWindow: 2097152,
        isDefault: true,
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        contextWindow: 1048576,
        isDefault: false,
      },
    ],
  },
  {
    id: "xai",
    name: "xAI",
    models: [
      {
        id: "grok-beta",
        name: "Grok Beta",
        contextWindow: 131072,
        isDefault: true,
      },
    ],
  },
];

/**
 * LLM IPCハンドラーを登録
 */
export function registerLLMHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.LLM_GET_PROVIDERS, handleGetProviders);
  ipcMain.handle(
    IPC_CHANNELS.LLM_CHECK_HEALTH,
    (_event: IpcMainInvokeEvent, params: { providerId: LLMProviderId }) =>
      handleCheckHealth(params),
  );
  ipcMain.handle(
    IPC_CHANNELS.LLM_SEND_CHAT,
    (_event: IpcMainInvokeEvent, request: LLMChatRequestInput) =>
      handleSendChat(request),
  );
  ipcMain.handle(IPC_CHANNELS.LLM_STREAM_CHAT, handleStreamChat);
}

/**
 * プロバイダー一覧取得
 */
export async function handleGetProviders(): Promise<LLMProvider[]> {
  const providers: LLMProvider[] = [];

  for (const config of PROVIDER_CONFIGS) {
    const apiKey = await SecureStorage.getApiKey(config.id);
    const isAvailable = apiKey !== null && apiKey.length > 0;

    providers.push({
      id: config.id,
      name: config.name,
      isAvailable,
      models: config.models,
    });
  }

  return providers;
}

/**
 * ヘルスチェック
 */
export async function handleCheckHealth(params: {
  providerId: LLMProviderId;
}): Promise<HealthCheckResult> {
  const { providerId } = params;

  // Validate providerId
  if (!isValidProviderId(providerId)) {
    throw createLLMError("UNKNOWN", `Invalid provider ID: ${providerId}`);
  }

  try {
    const adapter = await LLMAdapterFactory.getAdapter(providerId);
    const result = await adapter.checkHealth();
    return result;
  } catch (error) {
    return {
      status: "error",
      providerId,
      errorMessage: isLLMError(error)
        ? error.code
        : error instanceof Error
          ? `NETWORK_ERROR: ${error.message}`
          : "NETWORK_ERROR",
      checkedAt: new Date(),
    };
  }
}

/**
 * チャット送信（非ストリーミング）
 */
export async function handleSendChat(
  request: LLMChatRequestInput,
): Promise<LLMChatResponse> {
  try {
    // Validate request
    if (!request.messages || request.messages.length === 0) {
      throw createLLMError("UNKNOWN", "Messages cannot be empty");
    }
    if (!request.modelId) {
      throw createLLMError("UNKNOWN", "Model ID is required");
    }

    // Get provider ID from request or infer from model
    const providerId = request.providerId ?? inferProviderId(request.modelId);

    if (!providerId) {
      throw createLLMError("MODEL_NOT_FOUND", "Cannot determine provider");
    }

    // Get adapter and send chat
    const adapter = await LLMAdapterFactory.getAdapter(providerId);
    const response = await adapter.sendChat(request);

    return {
      success: true,
      data: {
        message: response.content,
        modelId: response.model,
        providerId,
        usage: response.usage,
        finishReason: response.finishReason as
          | "stop"
          | "length"
          | "content_filter"
          | "tool_calls"
          | undefined,
      },
    };
  } catch (error) {
    if (isLLMError(error)) {
      return { success: false, error };
    }

    return {
      success: false,
      error: createLLMError(
        "UNKNOWN",
        error instanceof Error ? error.message : "Unknown error",
      ),
    };
  }
}

/**
 * ストリーミングチャット
 */
export async function handleStreamChat(
  event: IpcMainInvokeEvent,
  request: LLMChatRequestInput,
): Promise<void> {
  try {
    // Get provider ID from request or infer from model
    const providerId = request.providerId ?? inferProviderId(request.modelId);

    if (!providerId) {
      event.sender.send(IPC_CHANNELS.LLM_STREAM_ERROR, {
        code: "MODEL_NOT_FOUND",
        message: "Cannot determine provider",
        retryable: false,
      });
      return;
    }

    // Get adapter and stream chat
    const adapter = await LLMAdapterFactory.getAdapter(providerId);
    const stream = adapter.streamChat(request);

    for await (const chunk of stream) {
      event.sender.send(IPC_CHANNELS.LLM_STREAM_CHUNK, chunk);
    }

    event.sender.send(IPC_CHANNELS.LLM_STREAM_END);
  } catch (error) {
    const llmError = isLLMError(error)
      ? error
      : createLLMError(
          "NETWORK_ERROR",
          error instanceof Error ? error.message : "Stream error",
          true,
        );

    event.sender.send(IPC_CHANNELS.LLM_STREAM_ERROR, llmError);
  }
}

// Helper functions

function isValidProviderId(id: unknown): id is LLMProviderId {
  return (
    typeof id === "string" &&
    ["openai", "anthropic", "google", "xai"].includes(id)
  );
}

function inferProviderId(modelId: string): LLMProviderId | null {
  if (modelId.startsWith("gpt-")) return "openai";
  if (modelId.startsWith("claude-")) return "anthropic";
  if (modelId.startsWith("gemini-")) return "google";
  if (modelId.startsWith("grok-")) return "xai";
  return null;
}

function createLLMError(
  code: LLMErrorCode,
  message: string,
  retryable = false,
  retryAfter?: number,
): LLMError {
  return {
    code,
    message,
    retryable,
    ...(retryAfter !== undefined && { retryAfter }),
  };
}

function isLLMError(error: unknown): error is LLMError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "retryable" in error
  );
}
