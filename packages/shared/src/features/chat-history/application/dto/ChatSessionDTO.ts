/**
 * チャットセッションDTO
 * Application層とPresentation層間のデータ転送用
 */
export interface ChatSessionDTO {
  /** セッションID (UUID) */
  id: string;
  /** ユーザーID */
  userId: string;
  /** セッションタイトル */
  title: string;
  /** 最後のメッセージプレビュー */
  lastMessagePreview: string | null;
  /** メッセージ数 */
  messageCount: number;
  /** お気に入りフラグ */
  isFavorite: boolean;
  /** ピン留めフラグ */
  isPinned: boolean;
  /** 作成日時 (ISO 8601) */
  createdAt: string;
  /** 更新日時 (ISO 8601) */
  updatedAt: string;
}

/**
 * セッション作成入力DTO
 */
export interface CreateChatSessionInput {
  userId: string;
  title?: string;
}

/**
 * セッション作成出力DTO
 */
export interface CreateChatSessionOutput {
  session: ChatSessionDTO;
}

/**
 * セッション検索入力DTO
 */
export interface SearchSessionsInput {
  userId: string;
  keyword?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * セッション検索出力DTO
 */
export interface SearchSessionsOutput {
  sessions: ChatSessionDTO[];
  total: number;
}

/**
 * セッション更新入力DTO
 */
export interface UpdateSessionInput {
  sessionId: string;
  title?: string;
}

/**
 * セッション更新出力DTO
 */
export interface UpdateSessionOutput {
  session: ChatSessionDTO;
}

/**
 * ピン留めトグル入力DTO
 */
export interface TogglePinnedInput {
  sessionId: string;
}

/**
 * ピン留めトグル出力DTO
 */
export interface TogglePinnedOutput {
  session: ChatSessionDTO;
  isPinned: boolean;
}

/**
 * お気に入りトグル入力DTO
 */
export interface ToggleFavoriteInput {
  sessionId: string;
}

/**
 * お気に入りトグル出力DTO
 */
export interface ToggleFavoriteOutput {
  session: ChatSessionDTO;
  isFavorite: boolean;
}

/**
 * セッション削除入力DTO
 */
export interface DeleteSessionInput {
  sessionId: string;
}
