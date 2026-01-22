/**
 * Chat History リポジトリファクトリー
 *
 * Note: DrizzleリポジトリはNode.js専用のため、Renderer側では使用できない。
 * Chat History機能はIPC経由でMain Processと連携する形で後続タスクで実装予定。
 * See: UT-009 (Chat History Additional Use Cases)
 *
 * @module features/chat-history/repositories
 */

import type {
  IChatSessionRepository,
  IChatMessageRepository,
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
 * Chat Historyリポジトリを設定する
 *
 * Main Processから初期化されたリポジトリを受け取り、シングルトンとして保持する。
 * Renderer側ではIPC経由でMain Processからリポジトリを受け取る形で使用する。
 *
 * Note: 現在の実装では未使用。UT-009でIPC連携を実装予定。
 *
 * @param repos - セッションリポジトリとメッセージリポジトリのオブジェクト
 */
export function setChatHistoryRepositories(
  repos: ChatHistoryRepositories,
): void {
  repositories = repos;
}

/**
 * 初期化済みのリポジトリを取得する
 *
 * setChatHistoryRepositoriesで設定されたリポジトリを返す。
 * 設定されていない場合はエラーをスローする。
 *
 * @returns セッションリポジトリとメッセージリポジトリのオブジェクト
 * @throws Error リポジトリが設定されていない場合
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
