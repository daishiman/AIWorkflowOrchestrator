/**
 * チャット履歴サービス
 *
 * チャットセッションとメッセージの管理、検索、エクスポート機能を提供する。
 *
 * @see docs/30-workflows/chat-history-persistence/requirements-functional.md
 */

import { randomUUID } from "crypto";
import type { ChatSessionRepository } from "../../repositories/chat-session-repository.js";
import type { ChatMessageRepository } from "../../repositories/chat-message-repository.js";
import type {
  ChatSession,
  ChatSessionSearchQuery,
  UpdateChatSession,
} from "../../types/chat-session.js";
import type { ChatMessage } from "../../types/chat-message.js";
import type { LlmMetadata } from "../../types/llm-metadata.js";
import { DateFormatter } from "./date-formatter.js";
import { PREVIEW_MAX_LENGTH, PREVIEW_ELLIPSIS } from "./constants.js";

/**
 * セッション作成オプション
 */
export interface CreateSessionOptions {
  title?: string;
}

/**
 * エクスポートオプション
 */
export interface ExportOptions {
  includeMetadata?: boolean;
  messageIds?: string[];
}

/**
 * チャット履歴サービス
 *
 * ビジネスロジック層として、リポジトリを統合し、
 * セッション管理、メッセージ保存、検索、エクスポート機能を提供する。
 */
export class ChatHistoryService {
  constructor(
    private sessionRepository: ChatSessionRepository,
    private messageRepository: ChatMessageRepository,
  ) {}

  /**
   * 新しいセッションを作成する（FR-001）
   *
   * @param userId ユーザーID
   * @param options 作成オプション
   * @returns 作成されたセッション
   */
  async createSession(
    userId: string,
    options?: CreateSessionOptions,
  ): Promise<ChatSession> {
    const now = new Date();
    const id = randomUUID();

    const title = options?.title ?? DateFormatter.generateDefaultTitle(now);

    const session: ChatSession = {
      id,
      userId,
      title,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      messageCount: 0,
      isFavorite: false,
      isPinned: false,
      pinOrder: null,
      lastMessagePreview: null,
      metadata: {},
      deletedAt: null,
    };

    await this.sessionRepository.save(session);

    return session;
  }

  /**
   * IDでセッションを取得する
   *
   * @param id セッションID
   * @returns セッション（存在しない場合はnull）
   */
  async getSession(id: string): Promise<ChatSession | null> {
    return this.sessionRepository.findById(id);
  }

  /**
   * ユーザーのセッション一覧を取得する（FR-002）
   *
   * @param userId ユーザーID
   * @returns セッション一覧（作成日時の降順）
   */
  async listSessions(userId: string): Promise<ChatSession[]> {
    return this.sessionRepository.findByUserId(userId);
  }

  /**
   * セッションを削除する（FR-003）
   *
   * ソフトデリート(論理削除)ではCASCADE DELETEが動作しないため、
   * メッセージを先に削除してからセッションを削除する。
   *
   * @param id セッションID
   * @returns 削除成功の場合true
   */
  async deleteSession(id: string): Promise<boolean> {
    // セッションに関連するメッセージを全て削除
    const messages = await this.messageRepository.findBySessionId(id);
    for (const message of messages) {
      await this.messageRepository.delete(message.id);
    }

    // セッションを論理削除
    return this.sessionRepository.delete(id);
  }

  /**
   * セッションを更新する（FR-013, FR-014）
   *
   * @param id セッションID
   * @param data 更新データ
   * @returns 更新成功の場合true
   */
  async updateSession(id: string, data: UpdateChatSession): Promise<boolean> {
    return this.sessionRepository.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * ユーザーメッセージを追加する（FR-004）
   *
   * @param sessionId セッションID
   * @param content メッセージ内容
   * @returns 作成されたメッセージ
   */
  async addUserMessage(
    sessionId: string,
    content: string,
  ): Promise<ChatMessage> {
    const message = await this.createMessage(sessionId, "user", content);

    await this.updateSessionAfterMessage(sessionId, content);

    return message;
  }

  /**
   * アシスタントメッセージを追加する（FR-005, FR-006）
   *
   * @param sessionId セッションID
   * @param content メッセージ内容
   * @param llmMetadata LLMメタデータ
   * @returns 作成されたメッセージ
   */
  async addAssistantMessage(
    sessionId: string,
    content: string,
    llmMetadata: LlmMetadata,
  ): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      id,
      sessionId,
      role: "assistant",
      content,
      messageIndex: -1, // 自動採番
      timestamp: new Date().toISOString(),
      llmProvider: llmMetadata.provider,
      llmModel: llmMetadata.model,
      llmMetadata,
      attachments: [],
      systemPrompt: null,
      metadata: {},
    };

    await this.messageRepository.save(message);
    await this.updateSessionAfterMessage(sessionId, content);

    // 保存後のメッセージを再取得して正しいmessageIndexを返す
    const saved = await this.messageRepository.findById(id);
    return saved ?? message;
  }

  /**
   * セッションのメッセージ一覧を取得する
   *
   * @param sessionId セッションID
   * @returns メッセージ一覧（message_indexの昇順）
   */
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.messageRepository.findBySessionId(sessionId);
  }

  /**
   * セッションを検索する（FR-007, FR-014）
   *
   * @param userId ユーザーID
   * @param query 検索クエリ
   * @returns 検索結果
   */
  async searchSessions(
    userId: string,
    query: Omit<ChatSessionSearchQuery, "userId">,
  ): Promise<ChatSession[]> {
    return this.sessionRepository.search({
      userId,
      ...query,
    });
  }

  /**
   * セッションをMarkdown形式でエクスポートする（FR-010）
   *
   * @param sessionId セッションID
   * @param options エクスポートオプション
   * @returns Markdown文字列
   */
  async exportToMarkdown(
    sessionId: string,
    options?: ExportOptions,
  ): Promise<string> {
    const session = await this.validateSession(sessionId);
    const messages = await this.messageRepository.findBySessionId(sessionId);
    const includeMetadata = options?.includeMetadata ?? false;

    const lines: string[] = [];

    // ヘッダーセクション
    lines.push(...this.buildMarkdownHeader(session, messages, includeMetadata));

    // メッセージセクション
    lines.push(...this.buildMarkdownMessages(messages, includeMetadata));

    return lines.join("\n");
  }

  /**
   * セッションをJSON形式でエクスポートする（FR-011）
   *
   * @param sessionId セッションID
   * @param options エクスポートオプション
   * @returns JSON文字列
   */
  async exportToJson(
    sessionId: string,
    _options?: ExportOptions,
  ): Promise<string> {
    const session = await this.validateSession(sessionId);
    const messages = await this.messageRepository.findBySessionId(sessionId);

    const exportData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      session: {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messageCount,
      },
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        llmProvider: m.llmProvider,
        llmModel: m.llmModel,
        llmMetadata: m.llmMetadata,
      })),
    };

    return JSON.stringify(exportData, null, 2);
  }

  // ========================================
  // プライベートメソッド
  // ========================================

  /**
   * セッションの存在を検証する
   *
   * @param sessionId セッションID
   * @returns セッション
   * @throws セッションが見つからない場合
   */
  private async validateSession(sessionId: string): Promise<ChatSession> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new Error("セッションが見つかりません");
    }
    return session;
  }

  /**
   * Markdownヘッダーセクションを構築する
   *
   * @param session セッション
   * @param messages メッセージ一覧
   * @param includeMetadata メタデータを含めるか
   * @returns ヘッダー行の配列
   */
  private buildMarkdownHeader(
    session: ChatSession,
    messages: ChatMessage[],
    includeMetadata: boolean,
  ): string[] {
    const lines: string[] = [];

    lines.push(`# ${session.title}`);
    lines.push("");
    lines.push(
      `**作成日**: ${DateFormatter.formatDateTime(session.createdAt)}`,
    );
    lines.push(`**メッセージ数**: ${messages.length}件`);

    if (includeMetadata) {
      const totalTokens = this.calculateTotalTokens(messages);
      if (totalTokens > 0) {
        lines.push(`**総トークン数**: ${totalTokens.toLocaleString()}`);
      }
    }

    lines.push("");
    lines.push("---");
    lines.push("");

    return lines;
  }

  /**
   * Markdownメッセージセクションを構築する
   *
   * @param messages メッセージ一覧
   * @param includeMetadata メタデータを含めるか
   * @returns メッセージ行の配列
   */
  private buildMarkdownMessages(
    messages: ChatMessage[],
    includeMetadata: boolean,
  ): string[] {
    const lines: string[] = [];

    for (const message of messages) {
      const roleLabel = message.role === "user" ? "ユーザー" : "アシスタント";
      const timestamp = DateFormatter.formatDateTime(message.timestamp);

      lines.push(`## ${roleLabel} (${timestamp})`);
      lines.push("");

      if (
        includeMetadata &&
        message.role === "assistant" &&
        message.llmMetadata
      ) {
        lines.push(`**モデル**: ${message.llmProvider}/${message.llmModel}`);
        const tokenUsage = message.llmMetadata.tokenUsage;
        if (tokenUsage) {
          lines.push(
            `**トークン**: 入力: ${tokenUsage.inputTokens}, 出力: ${tokenUsage.outputTokens}`,
          );
        }
        lines.push("");
      }

      lines.push(message.content);
      lines.push("");
      lines.push("---");
      lines.push("");
    }

    return lines;
  }

  /**
   * メッセージを作成する
   */
  private async createMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string,
  ): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      id,
      sessionId,
      role,
      content,
      messageIndex: -1, // 自動採番
      timestamp: new Date().toISOString(),
      llmProvider: null,
      llmModel: null,
      llmMetadata: null,
      attachments: [],
      systemPrompt: null,
      metadata: {},
    };

    await this.messageRepository.save(message);

    // 保存後のメッセージを再取得して正しいmessageIndexを返す
    const saved = await this.messageRepository.findById(id);
    if (saved) {
      return saved;
    }

    return message;
  }

  /**
   * メッセージ追加後にセッションを更新する
   */
  private async updateSessionAfterMessage(
    sessionId: string,
    content: string,
  ): Promise<void> {
    const messageCount = await this.messageRepository.count(sessionId);
    const preview = this.truncatePreview(content);

    await this.sessionRepository.update(sessionId, {
      messageCount,
      lastMessagePreview: preview,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * プレビュー用に文字列を切り詰める
   */
  private truncatePreview(
    text: string,
    maxLength: number = PREVIEW_MAX_LENGTH,
  ): string {
    if (text.length <= maxLength) {
      return text;
    }
    const ellipsisLength = PREVIEW_ELLIPSIS.length;
    return text.slice(0, maxLength - ellipsisLength) + PREVIEW_ELLIPSIS;
  }

  /**
   * 総トークン数を計算する
   */
  private calculateTotalTokens(messages: ChatMessage[]): number {
    return messages.reduce((total, message) => {
      const tokenUsage = message.llmMetadata?.tokenUsage;
      if (tokenUsage) {
        return (
          total + (tokenUsage.inputTokens || 0) + (tokenUsage.outputTokens || 0)
        );
      }
      return total;
    }, 0);
  }
}
