/**
 * チャットセッション リポジトリインターフェース
 *
 * Domain層に配置し、依存性逆転の原則に従う。
 * 実装はInfrastructure層で提供される。
 *
 * @module features/chat-history/domain/repositories/IChatSessionRepository
 */

import type { ChatSession } from "../entities/ChatSession.js";
import type { ChatSessionId } from "../value-objects/ChatSessionId.js";
import type { UserId } from "../value-objects/UserId.js";

/**
 * セッション検索条件
 */
export interface ChatSessionSearchCriteria {
  userId: UserId;
  keyword?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * チャットセッション リポジトリインターフェース
 */
export interface IChatSessionRepository {
  /**
   * IDでセッションを取得する
   *
   * @param id セッションID
   * @returns セッション（存在しない場合はnull）
   */
  findById(id: ChatSessionId): Promise<ChatSession | null>;

  /**
   * ユーザーIDでセッション一覧を取得する
   *
   * @param userId ユーザーID
   * @param limit 取得件数
   * @param offset オフセット
   * @returns セッション一覧
   */
  findByUserId(
    userId: UserId,
    limit?: number,
    offset?: number,
  ): Promise<ChatSession[]>;

  /**
   * ピン留めセッション一覧を取得する
   *
   * @param userId ユーザーID
   * @returns ピン留めセッション一覧（pinOrder順）
   */
  findPinned(userId: UserId): Promise<ChatSession[]>;

  /**
   * 検索条件でセッションを検索する
   *
   * @param criteria 検索条件
   * @returns マッチしたセッション一覧
   */
  search(criteria: ChatSessionSearchCriteria): Promise<ChatSession[]>;

  /**
   * セッションを保存する（作成または更新）
   *
   * @param session セッション
   */
  save(session: ChatSession): Promise<void>;

  /**
   * セッションを削除する
   *
   * @param id セッションID
   */
  delete(id: ChatSessionId): Promise<void>;

  /**
   * セッションが存在するか確認する
   *
   * @param id セッションID
   * @returns 存在する場合true
   */
  exists(id: ChatSessionId): Promise<boolean>;

  /**
   * ピン留めセッション数をカウントする
   *
   * @param userId ユーザーID
   * @returns ピン留めセッション数
   */
  countPinned(userId: UserId): Promise<number>;
}
