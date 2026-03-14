/**
 * Chat Edit サービス用型定義
 * Renderer側の型定義を再エクスポート
 */
export type {
  TextSelection,
  DiffHunk,
  DiffHunkType,
  FileContext,
  EditCommand,
  EditCommandType,
  EditCommandOptions,
  GeneratedResult,
  GeneratedResultStatus,
  FileReadResult,
  FileReadError,
  FileWriteResult,
  FileWriteError,
  FileWriteOptions,
  FileContextInput,
  SendWithContextRequest,
  SendWithContextResponse,
  SendError,
  SendOptions,
  HandoffGuidance,
} from "../../../renderer/features/workspace-chat-edit/types";

export {
  MAX_FILE_CONTEXTS,
  MAX_FILE_SIZE,
  MAX_CONTEXT_SIZE,
} from "../../../renderer/features/workspace-chat-edit/types";
