/**
 * チャットセッション エンティティ
 *
 * ユーザーとAIアシスタント間の会話セッションを表すドメインエンティティ。
 * ビジネスルールをカプセル化し、不変条件を保証する。
 *
 * @module features/chat-history/domain/entities/ChatSession
 */

import { ChatSessionId } from "../value-objects/ChatSessionId.js";
import { ChatSessionTitle } from "../value-objects/ChatSessionTitle.js";
import { UserId } from "../value-objects/UserId.js";
import { type Result, ok, err } from "../../../../core/Result.js";
import { ChatSessionError } from "../errors/ChatSessionErrors.js";
import { InvalidTitleError } from "../errors/ValueObjectErrors.js";

/**
 * セッション作成パラメータ
 */
export interface CreateChatSessionParams {
  userId: string;
  title?: string;
}

/**
 * セッション再構築パラメータ（DBからの復元用）
 */
export interface ReconstituteChatSessionParams {
  id: string;
  userId: string;
  title: string;
  messageCount: number;
  isFavorite: boolean;
  isPinned: boolean;
  pinOrder: number | null;
  lastMessagePreview: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * チャットセッション エンティティ
 */
export class ChatSession {
  private static readonly PREVIEW_MAX_LENGTH = 100;
  private static readonly PREVIEW_ELLIPSIS = "...";

  private constructor(
    private readonly _id: ChatSessionId,
    private readonly _userId: UserId,
    private _title: ChatSessionTitle,
    private _messageCount: number,
    private _isFavorite: boolean,
    private _isPinned: boolean,
    private _pinOrder: number | null,
    private _lastMessagePreview: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ========================================
  // Factory Methods
  // ========================================

  /**
   * 新しいセッションを作成する
   *
   * @param params 作成パラメータ
   * @returns 成功時: ChatSession, 失敗時: ChatSessionError
   */
  static create(
    params: CreateChatSessionParams,
  ): Result<ChatSession, ChatSessionError> {
    // UserIdの検証
    const userIdResult = UserId.create(params.userId);
    if (!userIdResult.ok) {
      return err(
        new ChatSessionError("INVALID_USER_ID", userIdResult.error.message),
      );
    }

    // タイトルの作成（省略時はデフォルト）
    const titleResult = params.title
      ? ChatSessionTitle.create(params.title)
      : ok(ChatSessionTitle.createDefault());

    if (!titleResult.ok) {
      return err(
        new ChatSessionError("INVALID_TITLE", titleResult.error.message),
      );
    }

    const now = new Date();

    return ok(
      new ChatSession(
        ChatSessionId.generate(),
        userIdResult.value,
        titleResult.value,
        0, // messageCount
        false, // isFavorite
        false, // isPinned
        null, // pinOrder
        null, // lastMessagePreview
        now, // createdAt
        now, // updatedAt
      ),
    );
  }

  /**
   * 永続化されたデータからセッションを再構築する
   *
   * @param params 再構築パラメータ
   * @returns ChatSession
   */
  static reconstitute(params: ReconstituteChatSessionParams): ChatSession {
    return new ChatSession(
      ChatSessionId.fromString(params.id),
      UserId.fromString(params.userId),
      ChatSessionTitle.fromString(params.title),
      params.messageCount,
      params.isFavorite,
      params.isPinned,
      params.pinOrder,
      params.lastMessagePreview,
      params.createdAt,
      params.updatedAt,
    );
  }

  // ========================================
  // Business Logic
  // ========================================

  /**
   * タイトルを更新する
   *
   * @param newTitle 新しいタイトル
   * @returns 成功時: void, 失敗時: InvalidTitleError
   */
  updateTitle(newTitle: string): Result<void, InvalidTitleError> {
    const titleResult = ChatSessionTitle.create(newTitle);
    if (!titleResult.ok) {
      return err(titleResult.error);
    }

    this._title = titleResult.value;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * お気に入り状態を切り替える
   *
   * @returns 新しいお気に入り状態
   */
  toggleFavorite(): boolean {
    this._isFavorite = !this._isFavorite;
    this._updatedAt = new Date();
    return this._isFavorite;
  }

  /**
   * ピン留め状態を切り替える
   *
   * @returns 新しいピン留め状態
   */
  togglePinned(): boolean {
    this._isPinned = !this._isPinned;
    if (!this._isPinned) {
      this._pinOrder = null;
    }
    this._updatedAt = new Date();
    return this._isPinned;
  }

  /**
   * ピン留め状態を設定する
   *
   * @param isPinned ピン留め状態
   * @param pinOrder ピン留め順序（isPinned=trueの場合に使用）
   */
  setPinned(isPinned: boolean, pinOrder: number | null = null): void {
    this._isPinned = isPinned;
    this._pinOrder = isPinned ? pinOrder : null;
    this._updatedAt = new Date();
  }

  /**
   * ピン留めを解除する
   */
  unpin(): void {
    this._isPinned = false;
    this._pinOrder = null;
    this._updatedAt = new Date();
  }

  /**
   * メッセージプレビューを更新する
   *
   * @param content メッセージ内容
   */
  updatePreview(content: string): void {
    if (content.length <= ChatSession.PREVIEW_MAX_LENGTH) {
      this._lastMessagePreview = content;
    } else {
      this._lastMessagePreview =
        content.slice(
          0,
          ChatSession.PREVIEW_MAX_LENGTH - ChatSession.PREVIEW_ELLIPSIS.length,
        ) + ChatSession.PREVIEW_ELLIPSIS;
    }
    this._updatedAt = new Date();
  }

  /**
   * メッセージカウントをインクリメントする
   */
  incrementMessageCount(): void {
    this._messageCount++;
    this._updatedAt = new Date();
  }

  // ========================================
  // Getters
  // ========================================

  get id(): ChatSessionId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get title(): ChatSessionTitle {
    return this._title;
  }

  get messageCount(): number {
    return this._messageCount;
  }

  get isFavorite(): boolean {
    return this._isFavorite;
  }

  get isPinned(): boolean {
    return this._isPinned;
  }

  get pinOrder(): number | null {
    return this._pinOrder;
  }

  get lastMessagePreview(): string | null {
    return this._lastMessagePreview;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
