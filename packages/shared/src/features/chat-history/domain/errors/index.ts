/**
 * チャット履歴機能のエラー型集約
 *
 * @module features/chat-history/domain/errors
 */

export {
  InvalidIdError,
  InvalidTitleError,
  InvalidContentError,
  InvalidLLMMetadataError,
} from "./ValueObjectErrors.js";

export {
  ChatSessionError,
  InvalidSessionTitleError,
  MaxPinnedSessionsError,
  SessionArchivedError,
} from "./ChatSessionErrors.js";

export {
  ChatMessageError,
  InvalidMessageContentError,
  MissingLLMMetadataError,
} from "./ChatMessageErrors.js";
