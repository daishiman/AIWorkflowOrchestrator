import { type Result, ok, err } from "../../../../core/Result.js";
import { ChatSession } from "../../domain/entities/ChatSession.js";
import type { IChatSessionRepository } from "../../domain/repositories/IChatSessionRepository.js";
import type {
  CreateChatSessionInput,
  CreateChatSessionOutput,
} from "../dto/ChatSessionDTO.js";
import { sessionToDTO } from "../dto/transformers.js";
import {
  InvalidUserIdError,
  InvalidTitleError,
  RepositoryError,
} from "../errors/UseCaseErrors.js";
import type { ChatHistoryUseCaseError } from "../errors/UseCaseErrors.js";

/**
 * チャットセッション作成Use Case
 */
export class CreateChatSessionUseCase {
  constructor(private readonly sessionRepository: IChatSessionRepository) {}

  /**
   * 新しいチャットセッションを作成する
   */
  async execute(
    input: CreateChatSessionInput,
  ): Promise<Result<CreateChatSessionOutput, ChatHistoryUseCaseError>> {
    // 1. ドメインエンティティを作成
    const sessionResult = ChatSession.create({
      userId: input.userId,
      title: input.title,
    });

    // バリデーションエラーをUse Caseエラーに変換
    if (!sessionResult.ok) {
      const error = sessionResult.error;
      if (error.code === "INVALID_USER_ID") {
        return err(new InvalidUserIdError(input.userId));
      }
      if (error.code === "INVALID_TITLE") {
        return err(new InvalidTitleError(error.message));
      }
      return err(new RepositoryError(error.message));
    }

    const session = sessionResult.value;

    // 2. リポジトリに保存
    try {
      await this.sessionRepository.save(session);
    } catch (error) {
      return err(
        new RepositoryError(
          "セッションの保存に失敗しました",
          error instanceof Error ? error : undefined,
        ),
      );
    }

    // 3. DTOに変換して返却
    return ok({
      session: sessionToDTO(session),
    });
  }
}
