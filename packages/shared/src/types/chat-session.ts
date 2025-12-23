/**
 * チャットセッション型定義
 *
 * @see docs/30-workflows/chat-history-persistence/metadata-specification.md
 */

/**
 * チャットセッション
 *
 * ユーザーとAIアシスタント間の一連の会話の最上位エンティティ。
 * 1つのセッションは複数のメッセージを含む。
 */
export interface ChatSession {
  /**
   * セッション一意識別子（UUID v4）
   */
  id: string;

  /**
   * ユーザーID
   */
  userId: string;

  /**
   * セッションタイトル（3〜100文字）
   */
  title: string;

  /**
   * 作成日時（ISO 8601形式、UTC）
   */
  createdAt: string;

  /**
   * 最終更新日時（ISO 8601形式、UTC）
   */
  updatedAt: string;

  /**
   * セッション内のメッセージ総数
   */
  messageCount: number;

  /**
   * お気に入りフラグ
   */
  isFavorite: boolean;

  /**
   * ピン留めフラグ
   */
  isPinned: boolean;

  /**
   * ピン留め時の表示順序（1〜10）
   */
  pinOrder: number | null;

  /**
   * 最終メッセージのプレビュー（最大50文字）
   */
  lastMessagePreview: string | null;

  /**
   * 拡張メタデータ
   */
  metadata: Record<string, unknown>;

  /**
   * 削除日時（ソフトデリート用）
   */
  deletedAt: string | null;
}

/**
 * チャットセッション作成用型（IDなし）
 */
export type CreateChatSession = Omit<ChatSession, "id">;

/**
 * チャットセッション更新用型（部分的）
 */
export type UpdateChatSession = Partial<Omit<ChatSession, "id" | "createdAt">>;

/**
 * チャットセッション検索クエリ
 */
export interface ChatSessionSearchQuery {
  /**
   * ユーザーID（必須）
   */
  userId: string;

  /**
   * キーワード検索（タイトル・プレビュー対象）
   */
  query?: string;

  /**
   * お気に入りフィルター
   */
  isFavorite?: boolean;

  /**
   * ピン留めフィルター
   */
  isPinned?: boolean;

  /**
   * 取得件数制限
   */
  limit?: number;

  /**
   * オフセット（ページネーション）
   */
  offset?: number;
}
