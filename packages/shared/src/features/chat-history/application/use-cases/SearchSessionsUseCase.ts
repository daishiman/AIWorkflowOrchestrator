import { type Result, ok, err } from "../../../../core/Result.js";
import type { IChatSessionRepository } from "../../domain/repositories/IChatSessionRepository.js";
import { UserId } from "../../domain/value-objects/UserId.js";
import type {
  SearchSessionsInput,
  SearchSessionsOutput,
} from "../dto/ChatSessionDTO.js";
import { sessionToDTO } from "../dto/transformers.js";
import {
  InvalidUserIdError,
  RepositoryError,
} from "../errors/UseCaseErrors.js";
import type { ChatHistoryUseCaseError } from "../errors/UseCaseErrors.js";

/**
 * セッション検索Use Case
 */
export class SearchSessionsUseCase {
  constructor(private readonly sessionRepository: IChatSessionRepository) {}

  /**
   * セッションを検索する
   */
  async execute(
    input: SearchSessionsInput,
  ): Promise<Result<SearchSessionsOutput, ChatHistoryUseCaseError>> {
    // 1. ユーザーIDのバリデーション
    const userIdResult = UserId.create(input.userId);
    if (!userIdResult.ok) {
      return err(new InvalidUserIdError(input.userId));
    }
    const userId = userIdResult.value;

    // 2. 検索実行
    try {
      const sessions = await this.sessionRepository.search({
        userId,
        keyword: input.keyword,
        isFavorite: input.isFavorite,
        isPinned: input.isPinned,
        limit: input.limit ?? 50,
        offset: input.offset ?? 0,
      });

      // 3. DTOに変換して返却
      return ok({
        sessions: sessions.map((session) => sessionToDTO(session)),
        total: sessions.length, // TODO: 実際の総件数を返す場合はリポジトリを拡張
      });
    } catch (error) {
      return err(
        new RepositoryError(
          "セッションの検索に失敗しました",
          error instanceof Error ? error : undefined,
        ),
      );
    }
  }
}
