/**
 * チャットメッセージ型定義
 *
 * @see docs/30-workflows/chat-history-persistence/metadata-specification.md
 */

import type { LlmMetadata } from "./llm-metadata.js";

/**
 * メッセージロール
 */
export type MessageRole = "user" | "assistant";

/**
 * 添付ファイル
 */
export interface Attachment {
  /**
   * 添付ファイル一意識別子（UUID v4）
   */
  id: string;

  /**
   * ファイル名（拡張子含む）
   */
  fileName: string;

  /**
   * ストレージ内の相対パス
   */
  filePath: string;

  /**
   * MIMEタイプ
   */
  mimeType: string;

  /**
   * ファイルサイズ（バイト）
   */
  fileSize: number;

  /**
   * アップロード日時（ISO 8601形式）
   */
  uploadedAt: string;

  /**
   * サムネイル画像パス（画像ファイルのみ）
   */
  thumbnailPath?: string;
}

/**
 * チャットメッセージ
 *
 * セッション内の個別の発言（ユーザーまたはアシスタント）を表す。
 */
export interface ChatMessage {
  /**
   * メッセージ一意識別子（UUID v4）
   */
  id: string;

  /**
   * 親セッションID
   */
  sessionId: string;

  /**
   * メッセージロール
   */
  role: MessageRole;

  /**
   * メッセージ本文（1〜100,000文字）
   */
  content: string;

  /**
   * セッション内の順序（0から連番）
   */
  messageIndex: number;

  /**
   * メッセージ送信日時（ISO 8601形式、UTC）
   */
  timestamp: string;

  /**
   * LLMプロバイダー名（アシスタント応答のみ）
   */
  llmProvider: string | null;

  /**
   * LLMモデル名（アシスタント応答のみ）
   */
  llmModel: string | null;

  /**
   * LLMメタデータ（アシスタント応答のみ）
   */
  llmMetadata: LlmMetadata | null;

  /**
   * 添付ファイル情報
   */
  attachments: Attachment[];

  /**
   * システムプロンプト（将来対応）
   */
  systemPrompt: string | null;

  /**
   * 拡張メタデータ
   */
  metadata: Record<string, unknown>;
}

/**
 * チャットメッセージ作成用型（IDなし）
 */
export type CreateChatMessage = Omit<ChatMessage, "id">;

/**
 * チャットメッセージ更新用型（部分的）
 */
export type UpdateChatMessage = Partial<
  Omit<ChatMessage, "id" | "sessionId" | "messageIndex" | "timestamp">
>;

/**
 * メッセージ取得オプション
 */
export interface FindMessagesOptions {
  /**
   * 取得件数制限
   */
  limit?: number;

  /**
   * オフセット（ページネーション）
   */
  offset?: number;
}
