import { type Result, ok, err } from "../../../../core/Result.js";
import type { IChatSessionRepository } from "../../domain/repositories/IChatSessionRepository.js";
import { ChatSessionId } from "../../domain/value-objects/ChatSessionId.js";
import type {
  TogglePinnedInput,
  TogglePinnedOutput,
} from "../dto/ChatSessionDTO.js";
import { sessionToDTO } from "../dto/transformers.js";
import {
  SessionNotFoundError,
  InvalidSessionIdError,
  MaxPinnedSessionsError,
  RepositoryError,
} from "../errors/UseCaseErrors.js";
import type { ChatHistoryUseCaseError } from "../errors/UseCaseErrors.js";

/** ピン留めセッションの上限 (BR-SESSION-002) */
const MAX_PINNED_SESSIONS = 10;

/**
 * ピン留めトグルUse Case
 */
export class TogglePinnedUseCase {
  constructor(private readonly sessionRepository: IChatSessionRepository) {}

  /**
   * セッションのピン留め状態を切り替える
   */
  async execute(
    input: TogglePinnedInput,
  ): Promise<Result<TogglePinnedOutput, ChatHistoryUseCaseError>> {
    // 1. セッションIDのバリデーション
    const sessionIdResult = ChatSessionId.create(input.sessionId);
    if (!sessionIdResult.ok) {
      return err(new InvalidSessionIdError(input.sessionId));
    }
    const sessionId = sessionIdResult.value;

    // 2. セッションの取得
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      return err(new SessionNotFoundError(input.sessionId));
    }

    // 3. ピン留めする場合は上限チェック (BR-SESSION-002)
    if (!session.isPinned) {
      try {
        const pinnedCount = await this.sessionRepository.countPinned(
          session.userId,
        );
        if (pinnedCount >= MAX_PINNED_SESSIONS) {
          return err(
            new MaxPinnedSessionsError(pinnedCount, MAX_PINNED_SESSIONS),
          );
        }
      } catch (error) {
        return err(
          new RepositoryError(
            "ピン留め数の確認に失敗しました",
            error instanceof Error ? error : undefined,
          ),
        );
      }
    }

    // 4. ピン留め状態をトグル
    const newIsPinned = session.togglePinned();

    // 5. 保存
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

    // 6. DTOに変換して返却
    return ok({
      session: sessionToDTO(session),
      isPinned: newIsPinned,
    });
  }
}
