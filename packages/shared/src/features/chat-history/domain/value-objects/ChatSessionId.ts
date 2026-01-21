/**
 * チャットセッションID 値オブジェクト
 *
 * UUID v4形式のセッション一意識別子を表す。
 * 不変かつ値による等価性を持つ。
 *
 * @module features/chat-history/domain/value-objects/ChatSessionId
 */

import { randomUUID } from "crypto";
import { type Result, ok, err } from "../../../../core/Result.js";
import { InvalidIdError } from "../errors/ValueObjectErrors.js";

/**
 * チャットセッションID 値オブジェクト
 */
export class ChatSessionId {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  /**
   * 文字列からChatSessionIdを作成する
   *
   * @param value UUID文字列
   * @returns 成功時: ChatSessionId, 失敗時: InvalidIdError
   */
  static create(value: string): Result<ChatSessionId, InvalidIdError> {
    if (!value || !this.UUID_REGEX.test(value)) {
      return err(new InvalidIdError("ChatSessionId", value ?? ""));
    }
    return ok(new ChatSessionId(value));
  }

  /**
   * 新しいChatSessionIdを生成する
   *
   * @returns ChatSessionId
   */
  static generate(): ChatSessionId {
    return new ChatSessionId(randomUUID());
  }

  /**
   * 文字列から直接作成する（DBからの復元用）
   * 検証なしで作成するため、内部使用のみ
   *
   * @param value UUID文字列
   * @returns ChatSessionId
   */
  static fromString(value: string): ChatSessionId {
    return new ChatSessionId(value);
  }

  /**
   * 値を取得する
   */
  get value(): string {
    return this._value;
  }

  /**
   * 等価性を判定する
   *
   * @param other 比較対象
   * @returns 等価な場合true
   */
  equals(other: ChatSessionId): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列表現を返す
   */
  toString(): string {
    return this._value;
  }
}
