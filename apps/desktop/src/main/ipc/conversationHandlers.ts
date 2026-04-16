/**
 * Conversation IPC Handlers
 *
 * Handles conversation operations between renderer and main process.
 *
 * @module @repo/desktop/main/ipc/conversationHandlers
 */
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { ConversationRepository } from "../repositories/conversationRepository";
import type {
  ConversationListRequest,
  ConversationGetRequest,
  ConversationCreateRequest,
  ConversationUpdateRequest,
  ConversationDeleteRequest,
  ConversationAddMessageRequest,
  ConversationSearchRequest,
  ConversationListResponse,
  ConversationGetResponse,
  ConversationCreateResponse,
  ConversationUpdateResponse,
  ConversationDeleteResponse,
  ConversationAddMessageResponse,
  ConversationSearchResponse,
} from "../../shared/types/conversation";

/**
 * Creates a success response
 */
function success<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

/**
 * Creates an error response
 */
function error(
  code: string,
  message: string,
): {
  success: false;
  error: { code: string; message: string };
} {
  return { success: false, error: { code, message } };
}

/**
 * Normalizes an error to a standard format
 */
function normalizeError(err: unknown): { code: string; message: string } {
  if (err instanceof Error) {
    const message = err.message.toLowerCase();
    if (message.includes("not found")) {
      return { code: "NOT_FOUND", message: err.message };
    }
    return { code: "DB_ERROR", message: err.message };
  }
  return { code: "UNKNOWN_ERROR", message: String(err) || "Unknown error" };
}

/**
 * Creates a validation error response
 */
function validationError(message: string): {
  success: false;
  error: { code: string; message: string };
} {
  return { success: false, error: { code: "VALIDATION_ERROR", message } };
}

/**
 * Registers conversation IPC handlers
 *
 * @param repository - The conversation repository instance
 */
export function registerConversationHandlers(
  repository: ConversationRepository,
): void {
  // conversation:list
  ipcMain.handle(
    IPC_CHANNELS.CONVERSATION_LIST,
    async (
      _event,
      request: ConversationListRequest,
    ): Promise<ConversationListResponse> => {
      try {
        // Validate required fields
        if (!request.userId || request.userId.trim() === "") {
          return validationError("userId is required");
        }
        const result = repository.listConversations(request.userId, {
          limit: request.limit,
          offset: request.offset,
          includeDeleted: request.includeDeleted,
        });
        return success(result);
      } catch (err) {
        const normalized = normalizeError(err);
        return error(normalized.code, normalized.message);
      }
    },
  );

  // conversation:get
  ipcMain.handle(
    IPC_CHANNELS.CONVERSATION_GET,
    async (
      _event,
      request: ConversationGetRequest,
    ): Promise<ConversationGetResponse> => {
      try {
        // Validate required fields
        if (!request.id || request.id.trim() === "") {
          return validationError("id is required");
        }
        const result = repository.getConversation(request.id);
        return success(result);
      } catch (err) {
        const normalized = normalizeError(err);
        return error(normalized.code, normalized.message);
      }
    },
  );

  // conversation:create
  ipcMain.handle(
    IPC_CHANNELS.CONVERSATION_CREATE,
    async (
      _event,
      request: ConversationCreateRequest,
    ): Promise<ConversationCreateResponse> => {
      try {
        // Validate required fields
        if (!request.title || request.title.trim() === "") {
          return validationError("title is required");
        }
        const result = repository.createConversation({
          userId: request.userId,
          title: request.title,
          firstMessage: request.firstMessage,
        });
        return success(result);
      } catch (err) {
        const normalized = normalizeError(err);
        return error(normalized.code, normalized.message);
      }
    },
  );

  // conversation:update
  ipcMain.handle(
    IPC_CHANNELS.CONVERSATION_UPDATE,
    async (
      _event,
      request: ConversationUpdateRequest,
    ): Promise<ConversationUpdateResponse> => {
      try {
        // Validate required fields
        if (!request.id || request.id.trim() === "") {
          return validationError("id is required");
        }
        const result = repository.updateConversation(request.id, request.data);
        return success(result);
      } catch (err) {
        const normalized = normalizeError(err);
        return error(normalized.code, normalized.message);
      }
    },
  );

  // conversation:delete
  ipcMain.handle(
    IPC_CHANNELS.CONVERSATION_DELETE,
    async (
      _event,
      request: ConversationDeleteRequest,
    ): Promise<ConversationDeleteResponse> => {
      try {
        // Validate required fields
        if (!request.id || request.id.trim() === "") {
          return validationError("id is required");
        }
        repository.deleteConversation(request.id);
        return success({ deleted: true });
      } catch (err) {
        const normalized = normalizeError(err);
        return error(normalized.code, normalized.message);
      }
    },
  );

  // conversation:addMessage
  ipcMain.handle(
    IPC_CHANNELS.CONVERSATION_ADD_MESSAGE,
    async (
      _event,
      request: ConversationAddMessageRequest,
    ): Promise<ConversationAddMessageResponse> => {
      try {
        // Validate required fields
        if (!request.sessionId || request.sessionId.trim() === "") {
          return validationError("sessionId is required");
        }
        if (
          !request.message?.content ||
          request.message.content.trim() === ""
        ) {
          return validationError("message content is required");
        }
        const result = repository.addMessage(
          request.sessionId,
          request.message,
        );
        return success(result);
      } catch (err) {
        const normalized = normalizeError(err);
        return error(normalized.code, normalized.message);
      }
    },
  );

  // conversation:search
  ipcMain.handle(
    IPC_CHANNELS.CONVERSATION_SEARCH,
    async (
      _event,
      request: ConversationSearchRequest,
    ): Promise<ConversationSearchResponse> => {
      try {
        // Validate required fields (P42: 3-stage validation)
        if (!request.userId || request.userId.trim() === "") {
          return validationError("userId is required");
        }
        if (!request.query || request.query.trim() === "") {
          return validationError("query is required");
        }
        const result = repository.searchConversations(
          request.userId,
          request.query,
        );
        return success(result);
      } catch (err) {
        const normalized = normalizeError(err);
        return error(normalized.code, normalized.message);
      }
    },
  );
}

/**
 * Chat Export IPC Handlers (UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 Rule-2 fix)
 * 将来の実装タスク: UT-FIX-IPC-MAIN-HANDLER-IMPL-001
 */
export function registerChatExportHandlers(): void {
  // chat:exportSession - セッション履歴エクスポート
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EXPORT_SESSION,
    async (
      _event,
      _request: { sessionId: string; format?: "markdown" | "json" },
    ) => {
      return { success: true, data: null };
    },
  );

  // chat:previewExport - エクスポートプレビュー情報取得
  ipcMain.handle(
    IPC_CHANNELS.CHAT_PREVIEW_EXPORT,
    async (_event, _request: { sessionId: string }) => {
      return { success: true, data: { messageCount: 0, estimatedSize: 0 } };
    },
  );
}
