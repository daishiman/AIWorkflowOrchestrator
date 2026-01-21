/**
 * チャットメッセージマッパー
 *
 * DBレコード ⇔ ドメインエンティティ ⇔ DTO の変換を行う。
 *
 * @module features/chat-history/infrastructure/persistence/mappers/ChatMessageMapper
 */

import { type Result, ok, err } from "../../../../../core/Result.js";
import { ChatMessage } from "../../../domain/entities/ChatMessage.js";
import type { ChatMessageDTO } from "../../../application/dto/ChatMessageDTO.js";
import { messageToDTO } from "../../../application/dto/transformers.js";
import {
  DomainError,
  BusinessRuleError,
} from "../../../../../core/errors/DomainError.js";

/**
 * DBレコード型（Drizzle推論型相当）
 * NOTE: 日付はISO 8601文字列形式（DB schemaに合わせる）
 */
export interface ChatMessageRecord {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  messageIndex: number;
  llmModel: string | null;
  llmProvider: string | null;
  llmMetadata: string | null; // JSON文字列
  timestamp: string; // ISO 8601 string
}

/**
 * チャットメッセージマッパー
 */
export class ChatMessageMapper {
  /**
   * DBレコードからドメインエンティティに変換
   *
   * @param record DBレコード
   * @returns 成功時: ChatMessage, 失敗時: DomainError
   */
  static toDomain(record: ChatMessageRecord): Result<ChatMessage, DomainError> {
    try {
      // LLMメタデータのJSONパース
      let llmMetadata: Record<string, unknown> | null = null;
      if (record.llmMetadata) {
        try {
          const parsed = JSON.parse(record.llmMetadata);
          // フラット構造から正規化された構造に変換
          llmMetadata = {
            // tokenUsageをネスト構造に変換（reconstitute用）
            tokenUsage:
              parsed.inputTokens !== undefined ||
              parsed.outputTokens !== undefined ||
              parsed.totalTokens !== undefined
                ? {
                    inputTokens: parsed.inputTokens,
                    outputTokens: parsed.outputTokens,
                    totalTokens: parsed.totalTokens,
                  }
                : null,
            responseTime: parsed.responseTime ?? null,
            temperature: parsed.temperature ?? null,
            maxTokens: parsed.maxTokens ?? null,
          };
        } catch {
          // パース失敗時はnullとして処理
          llmMetadata = null;
        }
      }

      const message = ChatMessage.reconstitute({
        id: record.id,
        sessionId: record.sessionId,
        role: record.role as "user" | "assistant",
        content: record.content,
        messageIndex: record.messageIndex,
        timestamp: new Date(record.timestamp), // ISO 8601 string → Date
        llmProvider: record.llmProvider,
        llmModel: record.llmModel,
        llmMetadata,
      });

      return ok(message);
    } catch (error) {
      return err(
        new BusinessRuleError(
          "MAPPING_ERROR",
          `メッセージのマッピングに失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`,
        ),
      );
    }
  }

  /**
   * ドメインエンティティからDBレコードに変換
   *
   * @param message ドメインエンティティ
   * @returns DBレコード
   */
  static toPersistence(message: ChatMessage): ChatMessageRecord {
    // LLMメタデータをJSON文字列化
    let llmMetadataJson: string | null = null;
    if (message.llmMetadata) {
      const metadataObj: Record<string, unknown> = {};
      if (message.llmMetadata.tokenUsage) {
        metadataObj.inputTokens = message.llmMetadata.tokenUsage.inputTokens;
        metadataObj.outputTokens = message.llmMetadata.tokenUsage.outputTokens;
        metadataObj.totalTokens = message.llmMetadata.tokenUsage.totalTokens;
      }
      if (message.llmMetadata.responseTime !== undefined) {
        metadataObj.responseTime = message.llmMetadata.responseTime;
      }
      if (message.llmMetadata.temperature !== undefined) {
        metadataObj.temperature = message.llmMetadata.temperature;
      }
      if (message.llmMetadata.maxTokens !== undefined) {
        metadataObj.maxTokens = message.llmMetadata.maxTokens;
      }
      llmMetadataJson = JSON.stringify(metadataObj);
    }

    return {
      id: message.id.value,
      sessionId: message.sessionId.value,
      role: message.role.value,
      content: message.content.value,
      messageIndex: message.messageIndex,
      llmModel: message.llmMetadata?.model ?? null,
      llmProvider: message.llmMetadata?.provider ?? null,
      llmMetadata: llmMetadataJson,
      timestamp: message.createdAt.toISOString(), // Date → ISO 8601 string
    };
  }

  /**
   * ドメインエンティティからDTOに変換
   *
   * @param message ドメインエンティティ
   * @returns ChatMessageDTO
   */
  static toDTO(message: ChatMessage): ChatMessageDTO {
    return messageToDTO(message);
  }
}
