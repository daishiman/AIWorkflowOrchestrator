/**
 * チャットセッションタイトル 値オブジェクト
 *
 * 1〜100文字のセッションタイトルを表す。
 * 不変かつ値による等価性を持つ。
 *
 * @module features/chat-history/domain/value-objects/ChatSessionTitle
 */

import { type Result, ok, err } from "../../../../core/Result.js";
import { InvalidTitleError } from "../errors/ValueObjectErrors.js";

/**
 * チャットセッションタイトル 値オブジェクト
 */
export class ChatSessionTitle {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 100;
  private static readonly DEFAULT_PREFIX = "新しいチャット";

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  /**
   * タイトルを作成する
   *
   * @param value タイトル文字列
   * @returns 成功時: ChatSessionTitle, 失敗時: InvalidTitleError
   */
  static create(value: string): Result<ChatSessionTitle, InvalidTitleError> {
    const trimmed = value.trim();

    if (trimmed.length < this.MIN_LENGTH) {
      return err(
        new InvalidTitleError(
          `タイトルは${this.MIN_LENGTH}文字以上必要です（現在: ${trimmed.length}文字）`,
        ),
      );
    }

    if (trimmed.length > this.MAX_LENGTH) {
      return err(
        new InvalidTitleError(
          `タイトルは${this.MAX_LENGTH}文字以内にしてください（現在: ${trimmed.length}文字）`,
        ),
      );
    }

    return ok(new ChatSessionTitle(trimmed));
  }

  /**
   * デフォルトタイトルを作成する
   *
   * @returns ChatSessionTitle（"新しいチャット YYYY-MM-DD HH:mm"形式）
   */
  static createDefault(): ChatSessionTitle {
    const now = new Date();
    const formatted = this.formatDateTime(now);
    return new ChatSessionTitle(`${this.DEFAULT_PREFIX} ${formatted}`);
  }

  /**
   * 文字列から直接作成する（DBからの復元用）
   *
   * @param value タイトル文字列
   * @returns ChatSessionTitle
   */
  static fromString(value: string): ChatSessionTitle {
    return new ChatSessionTitle(value);
  }

  /**
   * 日時をフォーマットする
   */
  private static formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  /**
   * 値を取得する
   */
  get value(): string {
    return this._value;
  }

  /**
   * 等価性を判定する
   */
  equals(other: ChatSessionTitle): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列表現を返す
   */
  toString(): string {
    return this._value;
  }
}
