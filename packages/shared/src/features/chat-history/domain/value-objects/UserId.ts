/**
 * ユーザーID 値オブジェクト
 *
 * ユーザーの一意識別子を表す。
 * 不変かつ値による等価性を持つ。
 *
 * @module features/chat-history/domain/value-objects/UserId
 */

import { type Result, ok, err } from "../../../../core/Result.js";
import { InvalidIdError } from "../errors/ValueObjectErrors.js";

/**
 * ユーザーID 値オブジェクト
 */
export class UserId {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  /**
   * 文字列からUserIdを作成する
   *
   * @param value ユーザーID文字列
   * @returns 成功時: UserId, 失敗時: InvalidIdError
   */
  static create(value: string): Result<UserId, InvalidIdError> {
    if (!value || value.trim() === "") {
      return err(new InvalidIdError("UserId", value ?? ""));
    }
    return ok(new UserId(value.trim()));
  }

  /**
   * 文字列から直接作成する（DBからの復元用）
   *
   * @param value ユーザーID文字列
   * @returns UserId
   */
  static fromString(value: string): UserId {
    return new UserId(value);
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
  equals(other: UserId): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列表現を返す
   */
  toString(): string {
    return this._value;
  }
}
