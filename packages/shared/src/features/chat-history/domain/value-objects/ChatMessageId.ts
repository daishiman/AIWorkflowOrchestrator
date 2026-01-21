/**
 * チャットメッセージID 値オブジェクト
 *
 * UUID v4形式のメッセージ一意識別子を表す。
 * 不変かつ値による等価性を持つ。
 *
 * @module features/chat-history/domain/value-objects/ChatMessageId
 */

import { randomUUID } from "crypto";
import { type Result, ok, err } from "../../../../core/Result.js";
import { InvalidIdError } from "../errors/ValueObjectErrors.js";

/**
 * チャットメッセージID 値オブジェクト
 */
export class ChatMessageId {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  /**
   * 文字列からChatMessageIdを作成する
   *
   * @param value UUID文字列
   * @returns 成功時: ChatMessageId, 失敗時: InvalidIdError
   */
  static create(value: string): Result<ChatMessageId, InvalidIdError> {
    if (!value || !this.UUID_REGEX.test(value)) {
      return err(new InvalidIdError("ChatMessageId", value ?? ""));
    }
    return ok(new ChatMessageId(value));
  }

  /**
   * 新しいChatMessageIdを生成する
   *
   * @returns ChatMessageId
   */
  static generate(): ChatMessageId {
    return new ChatMessageId(randomUUID());
  }

  /**
   * 文字列から直接作成する（DBからの復元用）
   *
   * @param value UUID文字列
   * @returns ChatMessageId
   */
  static fromString(value: string): ChatMessageId {
    return new ChatMessageId(value);
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
  equals(other: ChatMessageId): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列表現を返す
   */
  toString(): string {
    return this._value;
  }
}
