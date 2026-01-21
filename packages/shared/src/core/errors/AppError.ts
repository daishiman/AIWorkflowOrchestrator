/**
 * アプリケーションエラーの基底クラス
 *
 * 全てのカスタムエラーはこのクラスを継承する。
 * エラーコード、ステータスコード、JSON変換機能を提供。
 *
 * @module core/errors/AppError
 */
export abstract class AppError extends Error {
  /**
   * エラーコード（識別用）
   */
  abstract readonly code: string;

  /**
   * HTTPステータスコード相当の数値
   */
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // ES6クラスでのError継承の問題を解決
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * JSONシリアライズ用
   *
   * @returns エラー情報を含むオブジェクト
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}
