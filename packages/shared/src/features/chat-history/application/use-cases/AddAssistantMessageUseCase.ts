import { type Result, ok, err } from "../../../../core/Result.js";
import { ChatMessage } from "../../domain/entities/ChatMessage.js";
import type { IChatSessionRepository } from "../../domain/repositories/IChatSessionRepository.js";
import type { IChatMessageRepository } from "../../domain/repositories/IChatMessageRepository.js";
import { ChatSessionId } from "../../domain/value-objects/ChatSessionId.js";
import type {
  AddAssistantMessageInput,
  AddAssistantMessageOutput,
} from "../dto/ChatMessageDTO.js";
import { messageToDTO } from "../dto/transformers.js";
import {
  SessionNotFoundError,
  InvalidSessionIdError,
  InvalidContentError,
  RepositoryError,
} from "../errors/UseCaseErrors.js";
import type { ChatHistoryUseCaseError } from "../errors/UseCaseErrors.js";

/**
 * アシスタントメッセージ追加Use Case
 */
export class AddAssistantMessageUseCase {
  constructor(
    private readonly sessionRepository: IChatSessionRepository,
    private readonly messageRepository: IChatMessageRepository,
  ) {}

  /**
   * アシスタントメッセージを追加する
   */
  async execute(
    input: AddAssistantMessageInput,
  ): Promise<Result<AddAssistantMessageOutput, ChatHistoryUseCaseError>> {
    // 1. セッションIDのバリデーション
    const sessionIdResult = ChatSessionId.create(input.sessionId);
    if (!sessionIdResult.ok) {
      return err(new InvalidSessionIdError(input.sessionId));
    }
    const sessionId = sessionIdResult.value;

    // 2. セッションの存在確認
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      return err(new SessionNotFoundError(input.sessionId));
    }

    // 3. 次のメッセージインデックスを取得
    const messageCount =
      await this.messageRepository.countBySessionId(sessionId);

    // 4. メッセージエンティティを作成
    const messageResult = ChatMessage.createAssistantMessage({
      sessionId: input.sessionId,
      content: input.content,
      messageIndex: messageCount,
      llmModel: input.llmModel,
      llmProvider: input.llmProvider,
      llmMetadata: input.llmMetadata
        ? {
            tokenUsage: input.llmMetadata.inputTokens
              ? {
                  inputTokens: input.llmMetadata.inputTokens,
                  outputTokens: input.llmMetadata.outputTokens ?? 0,
                  totalTokens: input.llmMetadata.totalTokens ?? 0,
                }
              : undefined,
            responseTime: input.llmMetadata.responseTime,
            temperature: input.llmMetadata.temperature,
            maxTokens: input.llmMetadata.maxTokens,
          }
        : undefined,
    });

    if (!messageResult.ok) {
      const error = messageResult.error;
      if (error.code === "INVALID_CONTENT") {
        return err(new InvalidContentError(error.message));
      }
      return err(new RepositoryError(error.message));
    }

    const message = messageResult.value;

    // 5. メッセージを保存
    try {
      await this.messageRepository.save(message);
    } catch (error) {
      return err(
        new RepositoryError(
          "メッセージの保存に失敗しました",
          error instanceof Error ? error : undefined,
        ),
      );
    }

    // 6. セッションを更新
    session.updatePreview(input.content);
    session.incrementMessageCount();

    try {
      await this.sessionRepository.save(session);
    } catch (error) {
      return err(
        new RepositoryError(
          "セッションの更新に失敗しました",
          error instanceof Error ? error : undefined,
        ),
      );
    }

    // 7. DTOに変換して返却
    return ok({
      message: messageToDTO(message),
      updatedSession: {
        lastMessagePreview: session.lastMessagePreview ?? "",
        messageCount: session.messageCount,
        updatedAt: session.updatedAt.toISOString(),
      },
    });
  }
}
