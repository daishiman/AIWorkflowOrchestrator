import { type Result, ok, err } from "../../../../core/Result.js";
import { ChatMessage } from "../../domain/entities/ChatMessage.js";
import type { IChatSessionRepository } from "../../domain/repositories/IChatSessionRepository.js";
import type { IChatMessageRepository } from "../../domain/repositories/IChatMessageRepository.js";
import { ChatSessionId } from "../../domain/value-objects/ChatSessionId.js";
import type {
  AddUserMessageInput,
  AddUserMessageOutput,
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
 * ユーザーメッセージ追加Use Case
 */
export class AddUserMessageUseCase {
  constructor(
    private readonly sessionRepository: IChatSessionRepository,
    private readonly messageRepository: IChatMessageRepository,
  ) {}

  /**
   * ユーザーメッセージを追加する
   */
  async execute(
    input: AddUserMessageInput,
  ): Promise<Result<AddUserMessageOutput, ChatHistoryUseCaseError>> {
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
    const messageResult = ChatMessage.createUserMessage({
      sessionId: input.sessionId,
      content: input.content,
      messageIndex: messageCount,
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
