import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  AIChatRequest,
  AIChatResponse,
  AICheckConnectionResponse,
  AIIndexRequest,
  AIIndexResponse,
} from "../../preload/types";
import { LLMAdapterFactory } from "../adapters/llm/LLMAdapterFactory";
import { buildMessages } from "../utils/buildMessages";
import { getSelectedLLMConfig } from "./llmConfigProvider";
import type { LLMError } from "@repo/shared/types/llm/schemas";

// Mock conversation storage
const conversations = new Map<string, string[]>();

// Generate unique conversation ID
function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * LLMエラーをユーザー向けメッセージに変換
 */
function convertLLMErrorToMessage(error: LLMError): string {
  const errorMessages: Record<string, string> = {
    API_KEY_MISSING:
      "APIキーが設定されていません。設定画面でAPIキーを登録してください。",
    API_KEY_INVALID: "APIキーが無効です。正しいAPIキーを設定してください。",
    NETWORK_ERROR: "ネットワークエラーが発生しました。接続を確認してください。",
    TIMEOUT: "リクエストがタイムアウトしました。再度お試しください。",
    RATE_LIMIT:
      "レート制限に達しました。しばらく待ってから再度お試しください。",
    CONTEXT_LENGTH_EXCEEDED:
      "メッセージが長すぎます。短くして再度お試しください。",
    CONTENT_FILTER: "コンテンツフィルターによりブロックされました。",
    MODEL_NOT_FOUND: "指定されたモデルが見つかりません。",
    SERVICE_UNAVAILABLE:
      "サービスが一時的に利用できません。しばらく待ってから再度お試しください。",
    UNKNOWN: "エラーが発生しました。",
  };

  return errorMessages[error.code] ?? error.message;
}

/**
 * エラーがLLMErrorかどうかを判定
 */
function isLLMError(error: unknown): error is LLMError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "retryable" in error
  );
}

export function registerAIHandlers(): void {
  // Chat with AI
  ipcMain.handle(
    IPC_CHANNELS.AI_CHAT,
    async (_event, request: AIChatRequest): Promise<AIChatResponse> => {
      try {
        const conversationId =
          request.conversationId || generateConversationId();

        // Store message in conversation
        if (!conversations.has(conversationId)) {
          conversations.set(conversationId, []);
        }
        conversations.get(conversationId)?.push(request.message);

        // Get selected LLM configuration
        const llmConfig = await getSelectedLLMConfig();
        if (!llmConfig) {
          return {
            success: false,
            error:
              "LLMプロバイダーが選択されていません。設定画面でプロバイダーを選択してください。",
          };
        }

        // Build messages with system prompt
        const messages = buildMessages(request.message, request.systemPrompt);

        // Get adapter for selected provider
        const adapter = await LLMAdapterFactory.getAdapter(
          llmConfig.providerId,
        );

        // Send chat request to LLM
        const response = await adapter.sendChat({
          messages,
          modelId: llmConfig.modelId,
          providerId: llmConfig.providerId,
        });

        return {
          success: true,
          data: {
            message: response.content,
            conversationId,
            ragSources: request.ragEnabled ? [] : undefined,
          },
        };
      } catch (error) {
        // Handle LLM-specific errors
        if (isLLMError(error)) {
          return {
            success: false,
            error: convertLLMErrorToMessage(error),
          };
        }

        // Handle generic errors (including API key not found)
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
  );

  // Check AI/RAG connection
  ipcMain.handle(
    IPC_CHANNELS.AI_CHECK_CONNECTION,
    async (): Promise<AICheckConnectionResponse> => {
      try {
        // TODO: Replace with actual connection check
        return {
          success: true,
          data: {
            status: "connected",
            indexedDocuments: 892,
            lastSyncTime: new Date(),
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Index documents for RAG
  ipcMain.handle(
    IPC_CHANNELS.AI_INDEX,
    async (_event, request: AIIndexRequest): Promise<AIIndexResponse> => {
      try {
        // TODO: Replace with actual indexing logic
        console.log(
          `Indexing folder: ${request.folderPath}, recursive: ${request.recursive}`,
        );

        // Simulate indexing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
          success: true,
          data: {
            indexedCount: 15,
            skippedCount: 3,
            errors: [],
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );
}
