/**
 * システムプロンプトテンプレートのバリデーションユーティリティ
 */

import {
  TEMPLATE_NAME_MAX_LENGTH,
  SYSTEM_PROMPT_MAX_LENGTH,
  ERROR_MESSAGES,
} from "../constants/systemPrompt";

/**
 * テンプレート名をバリデーションする
 * @param name - テンプレート名
 * @returns トリム済みの名前
 * @throws エラーメッセージ
 */
export function validateTemplateName(name: string): string {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error(ERROR_MESSAGES.TEMPLATE_NAME_REQUIRED);
  }

  if (trimmedName.length > TEMPLATE_NAME_MAX_LENGTH) {
    throw new Error(ERROR_MESSAGES.TEMPLATE_NAME_TOO_LONG);
  }

  return trimmedName;
}

/**
 * テンプレートコンテンツをバリデーションする
 * @param content - コンテンツ
 * @throws エラーメッセージ
 */
export function validateTemplateContent(content: string): void {
  if (content.length > SYSTEM_PROMPT_MAX_LENGTH) {
    throw new Error(ERROR_MESSAGES.CONTENT_TOO_LONG);
  }
}

/**
 * テンプレート名とコンテンツを同時にバリデーションする
 * @param name - テンプレート名
 * @param content - コンテンツ
 * @returns トリム済みの名前
 * @throws エラーメッセージ
 */
export function validateTemplateData(
  name: string,
  content: string,
): { trimmedName: string } {
  const trimmedName = validateTemplateName(name);
  validateTemplateContent(content);
  return { trimmedName };
}
