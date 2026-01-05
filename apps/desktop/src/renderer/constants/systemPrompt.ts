/**
 * システムプロンプト機能の共通定数
 */

// 文字数制限
export const SYSTEM_PROMPT_MAX_LENGTH = 4000;
export const TEMPLATE_NAME_MAX_LENGTH = 50;

// UIサイズ定数
export const TEXTAREA_MIN_HEIGHT = 120; // px
export const TEXTAREA_MAX_HEIGHT = 300; // px
export const TAB_INDENT_SPACES = 2;

// エラーメッセージ
export const ERROR_MESSAGES = {
  TEMPLATE_NAME_REQUIRED: "テンプレート名を入力してください",
  TEMPLATE_NAME_TOO_LONG: `テンプレート名は${TEMPLATE_NAME_MAX_LENGTH}文字以内で入力してください`,
  CONTENT_TOO_LONG: `コンテンツは${SYSTEM_PROMPT_MAX_LENGTH}文字以内で入力してください`,
  TEMPLATE_NAME_DUPLICATE: "同じ名前のテンプレートが既に存在します",
  TEMPLATE_NOT_FOUND: "テンプレートが見つかりません",
  PRESET_NOT_EDITABLE: "プリセットテンプレートは編集できません",
  PRESET_NOT_DELETABLE: "プリセットテンプレートは削除できません",
  PERSIST_FAILED: "テンプレートの保存に失敗しました",
} as const;
