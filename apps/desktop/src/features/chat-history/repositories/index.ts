/**
 * Chat History リポジトリファクトリー
 *
 * DrizzleリポジトリをChatHistoryProviderに注入するためのファクトリーモジュール。
 * シングルトンパターンでリポジトリインスタンスを管理する。
 *
 * @module features/chat-history/repositories
 */

import {
  DrizzleChatSessionRepository,
  DrizzleChatMessageRepository,
  type IChatSessionRepository,
  type IChatMessageRepository,
} from "@repo/shared";

/**
 * リポジトリのコレクション型
 */
export interface ChatHistoryRepositories {
  sessionRepository: IChatSessionRepository;
  messageRepository: IChatMessageRepository;
}

// シングルトンインスタンス
let repositories: ChatHistoryRepositories | null = null;

/**
 * Chat Historyリポジトリを作成する
 *
 * DrizzleDBインスタンスを受け取り、リポジトリを生成してシングルトンとして保持する。
 * 既に初期化済みの場合は、既存のインスタンスを返す。
 *
 * @param db - Drizzle ORMのデータベースインスタンス
 * @returns セッションリポジトリとメッセージリポジトリのオブジェクト
 */
export function createChatHistoryRepositories(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
): ChatHistoryRepositories {
  if (repositories) {
    return repositories;
  }

  repositories = {
    sessionRepository: new DrizzleChatSessionRepository(db),
    messageRepository: new DrizzleChatMessageRepository(db),
  };

  return repositories;
}

/**
 * 初期化済みのリポジトリを取得する
 *
 * createChatHistoryRepositoriesで初期化されたリポジトリを返す。
 * 初期化されていない場合はエラーをスローする。
 *
 * @returns セッションリポジトリとメッセージリポジトリのオブジェクト
 * @throws Error リポジトリが初期化されていない場合
 */
export function getChatHistoryRepositories(): ChatHistoryRepositories {
  if (!repositories) {
    throw new Error("Chat history repositories not initialized");
  }
  return repositories;
}

/**
 * リポジトリが初期化済みかどうかを確認する
 *
 * @returns 初期化済みの場合true
 */
export function isRepositoriesInitialized(): boolean {
  return repositories !== null;
}

/**
 * リポジトリをリセットする（テスト用）
 *
 * シングルトンインスタンスをnullに戻す。
 * 主にテスト間の状態リセットに使用する。
 */
export function resetRepositories(): void {
  repositories = null;
}
