/**
 * メッセージロール 値オブジェクト
 *
 * メッセージの発信者種別を表す列挙的な値オブジェクト。
 * 不変かつ値による等価性を持つ。
 *
 * @module features/chat-history/domain/value-objects/MessageRole
 */

/**
 * メッセージロール 値オブジェクト
 */
export class MessageRole {
  private static readonly _User = new MessageRole("user");
  private static readonly _Assistant = new MessageRole("assistant");

  private constructor(private readonly _value: "user" | "assistant") {
    Object.freeze(this);
  }

  /**
   * ユーザーロールを取得する
   */
  static get User(): MessageRole {
    return this._User;
  }

  /**
   * アシスタントロールを取得する
   */
  static get Assistant(): MessageRole {
    return this._Assistant;
  }

  /**
   * 文字列からMessageRoleを作成する
   *
   * @param value ロール文字列
   * @returns MessageRole
   * @throws 不正な値の場合
   */
  static fromString(value: string): MessageRole {
    if (value === "user") return this._User;
    if (value === "assistant") return this._Assistant;
    throw new Error(`Invalid message role: ${value}`);
  }

  /**
   * 値を取得する
   */
  get value(): "user" | "assistant" {
    return this._value;
  }

  /**
   * ユーザーメッセージかどうか
   */
  get isUser(): boolean {
    return this._value === "user";
  }

  /**
   * アシスタントメッセージかどうか
   */
  get isAssistant(): boolean {
    return this._value === "assistant";
  }

  /**
   * 等価性を判定する
   */
  equals(other: MessageRole): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列表現を返す
   */
  toString(): string {
    return this._value;
  }
}
