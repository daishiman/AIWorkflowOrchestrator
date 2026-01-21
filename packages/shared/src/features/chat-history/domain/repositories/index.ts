/**
 * リポジトリインターフェースの集約エクスポート
 *
 * @module features/chat-history/domain/repositories
 */

export type {
  IChatSessionRepository,
  ChatSessionSearchCriteria,
} from "./IChatSessionRepository.js";

export type { IChatMessageRepository } from "./IChatMessageRepository.js";
