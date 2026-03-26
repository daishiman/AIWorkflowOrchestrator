/**
 * @file LLM IPC Handlers
 * @description LLMプロバイダー操作用IPCハンドラー
 * @feature chat-multi-llm-switching
 */

import { randomUUID } from "crypto";
import { ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { LLMAdapterFactory } from "../adapters/llm/LLMAdapterFactory";
import { SecureStorage } from "../services/secureStorage";
import { setSelectedLLMConfig } from "../ipc/llmConfigProvider";
import {
  LLMProviderIdSchema,
  PROVIDER_CONFIGS,
  inferProviderId,
  type LLMProvider,
  type LLMProviderId,
  type LLMChatRequestInput,
  type LLMChatResponse,
  type HealthCheckResult,
  type LLMError,
  type LLMErrorCode,
} from "@repo/shared/types/llm/schemas";

/**
 * アクティブなストリームセッションを管理
 * key: requestId, value: AbortController
 */
const activeStreams = new Map<string, AbortController>();

/**
 * LLM IPCハンドラーを登録
 */
export function registerLLMHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.LLM_GET_PROVIDERS, handleGetProviders);
  ipcMain.handle(
    IPC_CHANNELS.LLM_SET_SELECTED_CONFIG,
    (
      _event: IpcMainInvokeEvent,
      params: { providerId: LLMProviderId; modelId: string },
    ) => handleSetSelectedConfig(params),
  );
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
  ipcMain.handle(
    IPC_CHANNELS.LLM_STREAM_CANCEL,
    (_event: IpcMainInvokeEvent, params: { requestId: string }) =>
      handleStreamCancel(params),
  );
}

export function handleSetSelectedConfig(params: {
  providerId: LLMProviderId;
  modelId: string;
}): { success: boolean; error?: string } {
  const { providerId, modelId } = params;

  if (!isValidProviderId(providerId)) {
    return {
      success: false,
      error: `Invalid provider ID: ${String(providerId)}`,
    };
  }

  if (typeof modelId !== "string" || modelId.trim().length === 0) {
    return { success: false, error: "Model ID is required" };
  }

  setSelectedLLMConfig({
    providerId,
    modelId: modelId.trim(),
  });

  return { success: true };
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
      models: [...config.models],
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
      status: "disconnected",
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
    if (
      typeof request.modelId !== "string" ||
      request.modelId === "" ||
      request.modelId.trim() === ""
    ) {
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
 * ストリーミングチャットレスポンス型
 */
export interface StreamChatResponse {
  requestId: string;
}

/**
 * ストリーミングチャット
 */
export async function handleStreamChat(
  event: IpcMainInvokeEvent,
  request: LLMChatRequestInput,
): Promise<StreamChatResponse> {
  // Generate unique request ID
  const requestId = randomUUID();

  // Create AbortController for cancellation
  const abortController = new AbortController();
  activeStreams.set(requestId, abortController);

  // Helper to safely send events (check isDestroyed)
  const safeSend = (channel: string, data?: unknown) => {
    if (!event.sender.isDestroyed()) {
      if (data !== undefined) {
        event.sender.send(channel, data);
      } else {
        event.sender.send(channel);
      }
    }
  };

  try {
    // Validate request
    if (!request.messages || request.messages.length === 0) {
      safeSend(IPC_CHANNELS.LLM_STREAM_ERROR, {
        code: "VALIDATION_ERROR",
        message: "Messages cannot be empty",
        retryable: false,
      });
      return { requestId };
    }

    // P62: modelId 必須検証（DEFAULT_CONFIG fallback 禁止）
    if (
      typeof request.modelId !== "string" ||
      request.modelId.trim().length === 0
    ) {
      safeSend(IPC_CHANNELS.LLM_STREAM_ERROR, {
        code: "VALIDATION_ERROR",
        message:
          "Model ID is required. Please select a model in Settings before sending a message.",
        retryable: false,
      });
      return { requestId };
    }

    // Check for API key
    const providerId = request.providerId ?? inferProviderId(request.modelId);

    if (!providerId) {
      safeSend(IPC_CHANNELS.LLM_STREAM_ERROR, {
        code: "MODEL_NOT_FOUND",
        message: "Cannot determine provider",
        retryable: false,
      });
      return { requestId };
    }

    const apiKey = await SecureStorage.getApiKey(providerId);
    if (!apiKey) {
      safeSend(IPC_CHANNELS.LLM_STREAM_ERROR, {
        code: "API_KEY_MISSING",
        message: `API key is not configured for ${providerId}. Please set your API key in Settings > AI Provider.`,
        retryable: false,
      });
      return { requestId };
    }

    // Get adapter and stream chat with abort signal
    const adapter = await LLMAdapterFactory.getAdapter(providerId);
    const stream = adapter.streamChat(request, abortController.signal);

    for await (const chunk of stream) {
      // Check if cancelled
      if (abortController.signal.aborted) {
        break;
      }
      safeSend(IPC_CHANNELS.LLM_STREAM_CHUNK, chunk);
    }

    // Send end event if not aborted
    if (!abortController.signal.aborted) {
      safeSend(IPC_CHANNELS.LLM_STREAM_END);
    }
  } catch (error) {
    // Don't send error if it was an abort
    if (abortController.signal.aborted) {
      return { requestId };
    }

    const llmError = isLLMError(error)
      ? error
      : createLLMError(
          "NETWORK_ERROR",
          error instanceof Error ? error.message : "Stream error",
          true,
        );

    safeSend(IPC_CHANNELS.LLM_STREAM_ERROR, llmError);
  } finally {
    // Clean up the active stream
    activeStreams.delete(requestId);
  }

  return { requestId };
}

/**
 * ストリームキャンセル
 */
export function handleStreamCancel(params: { requestId: string }): {
  success: boolean;
} {
  const { requestId } = params;
  const controller = activeStreams.get(requestId);

  if (controller) {
    controller.abort();
    activeStreams.delete(requestId);
    return { success: true };
  }

  return { success: false };
}

// Helper functions

function isValidProviderId(id: unknown): id is LLMProviderId {
  return LLMProviderIdSchema.safeParse(id).success;
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
