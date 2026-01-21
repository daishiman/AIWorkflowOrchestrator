/**
 * チャットメッセージ リポジトリインターフェース
 *
 * Domain層に配置し、依存性逆転の原則に従う。
 * 実装はInfrastructure層で提供される。
 *
 * @module features/chat-history/domain/repositories/IChatMessageRepository
 */

import type { ChatMessage } from "../entities/ChatMessage.js";
import type { ChatMessageId } from "../value-objects/ChatMessageId.js";
import type { ChatSessionId } from "../value-objects/ChatSessionId.js";

/**
 * チャットメッセージ リポジトリインターフェース
 */
export interface IChatMessageRepository {
  /**
   * IDでメッセージを取得する
   *
   * @param id メッセージID
   * @returns メッセージ（存在しない場合はnull）
   */
  findById(id: ChatMessageId): Promise<ChatMessage | null>;

  /**
   * セッションIDでメッセージ一覧を取得する
   *
   * @param sessionId セッションID
   * @param limit 取得件数
   * @param offset オフセット
   * @returns メッセージ一覧（messageIndex順）
   */
  findBySessionId(
    sessionId: ChatSessionId,
    limit?: number,
    offset?: number,
  ): Promise<ChatMessage[]>;

  /**
   * セッション内の最新メッセージを取得する
   *
   * @param sessionId セッションID
   * @returns 最新メッセージ（存在しない場合はnull）
   */
  findLatestBySessionId(sessionId: ChatSessionId): Promise<ChatMessage | null>;

  /**
   * セッション内のメッセージ数を取得する
   *
   * @param sessionId セッションID
   * @returns メッセージ数
   */
  countBySessionId(sessionId: ChatSessionId): Promise<number>;

  /**
   * メッセージを保存する（作成または更新）
   *
   * @param message メッセージ
   */
  save(message: ChatMessage): Promise<void>;

  /**
   * 複数のメッセージを一括保存する
   *
   * @param messages メッセージ配列
   */
  saveMany(messages: ChatMessage[]): Promise<void>;

  /**
   * メッセージを削除する
   *
   * @param id メッセージID
   */
  delete(id: ChatMessageId): Promise<void>;

  /**
   * セッションの全メッセージを削除する
   *
   * @param sessionId セッションID
   */
  deleteBySessionId(sessionId: ChatSessionId): Promise<void>;
}
