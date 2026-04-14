/**
 * スキル名に関する定数
 *
 * スキル名は kebab-case（英小文字・数字・ハイフン区切り）で扱う。
 * このファイルは desktop と skill-creator の双方が参照する単一の信頼源。
 *
 * @module constants/skillName
 */

/**
 * スキル名として有効な文字列パターン。
 * - 先頭は英小文字または数字
 * - ハイフン区切りのセグメントで構成
 * - 末尾はハイフン以外
 */
export const SKILL_NAME_PATTERN: RegExp = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * スキル名の最大文字数。
 */
export const MAX_SKILL_NAME_LENGTH = 64;
