/**
 * 日付フォーマッター
 *
 * チャット履歴の日付表示とタイトル生成を統一的に処理する。
 */

/**
 * 日付フォーマッター
 */
export class DateFormatter {
  /**
   * ISO 8601文字列を "YYYY-MM-DD HH:mm:ss" 形式にフォーマットする
   *
   * @param isoString ISO 8601形式の日付文字列
   * @returns フォーマット済み日付文字列
   */
  static formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Dateオブジェクトから "YYYY-MM-DD HH:mm:ss" 形式にフォーマットする
   *
   * @param date Dateオブジェクト
   * @returns フォーマット済み日付文字列
   */
  static formatDateTimeFromDate(date: Date): string {
    return this.formatDateTime(date.toISOString());
  }

  /**
   * デフォルトセッションタイトルを生成する
   *
   * @param date タイトル生成基準日時
   * @returns "新しいチャット YYYY-MM-DD HH:mm" 形式のタイトル
   */
  static generateDefaultTitle(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `新しいチャット ${year}-${month}-${day} ${hours}:${minutes}`;
  }

  /**
   * 2桁ゼロパディングのヘルパーメソッド
   *
   * @param num パディング対象の数値
   * @returns 2桁の文字列
   */
  private static padZero(num: number): string {
    return String(num).padStart(2, "0");
  }
}
