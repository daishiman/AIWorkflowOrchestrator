/**
 * メッセージ内容 値オブジェクト
 *
 * 1〜50,000文字のメッセージ本文を表す。
 * 不変かつ値による等価性を持つ。
 *
 * @module features/chat-history/domain/value-objects/MessageContent
 */

import { type Result, ok, err } from "../../../../core/Result.js";
import { InvalidContentError } from "../errors/ValueObjectErrors.js";

/**
 * メッセージ内容 値オブジェクト
 */
export class MessageContent {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 50000;
  private static readonly PREVIEW_LENGTH = 100;
  private static readonly PREVIEW_ELLIPSIS = "...";

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  /**
   * メッセージ内容を作成する
   *
   * @param value 内容文字列
   * @returns 成功時: MessageContent, 失敗時: InvalidContentError
   */
  static create(value: string): Result<MessageContent, InvalidContentError> {
    if (!value || value.length < this.MIN_LENGTH) {
      return err(new InvalidContentError("メッセージ内容は必須です"));
    }

    if (value.length > this.MAX_LENGTH) {
      return err(
        new InvalidContentError(
          `メッセージは${this.MAX_LENGTH.toLocaleString()}文字以内にしてください`,
        ),
      );
    }

    return ok(new MessageContent(value));
  }

  /**
   * 文字列から直接作成する（DBからの復元用）
   *
   * @param value 内容文字列
   * @returns MessageContent
   */
  static fromString(value: string): MessageContent {
    return new MessageContent(value);
  }

  /**
   * 値を取得する
   */
  get value(): string {
    return this._value;
  }

  /**
   * プレビュー文字列を取得する（先頭100文字）
   */
  get preview(): string {
    if (this._value.length <= MessageContent.PREVIEW_LENGTH) {
      return this._value;
    }
    const cutLength =
      MessageContent.PREVIEW_LENGTH - MessageContent.PREVIEW_ELLIPSIS.length;
    return this._value.slice(0, cutLength) + MessageContent.PREVIEW_ELLIPSIS;
  }

  /**
   * 文字数を取得する
   */
  get length(): number {
    return this._value.length;
  }

  /**
   * 等価性を判定する
   */
  equals(other: MessageContent): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列表現を返す
   */
  toString(): string {
    return this._value;
  }
}
