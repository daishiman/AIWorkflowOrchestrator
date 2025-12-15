/**
 * validateRegex - 正規表現パターン検証
 *
 * 検索・置換サービスで共通使用
 */

/**
 * 正規表現パターンを検証
 * @throws Error 無効なパターンの場合
 */
export function validateRegex(pattern: string): void {
  try {
    new RegExp(pattern);
  } catch {
    throw new Error(`Invalid regex pattern: ${pattern}`);
  }
}
