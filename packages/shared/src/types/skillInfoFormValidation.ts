import type { SkillInfoFormData } from "./skillCreator";

/**
 * フィールド単位のバリデーション結果型
 * NOTE: 既存の ValidationResult（slideSettings.ts）との名称衝突を回避するため専用名を使用
 */
export interface SkillInfoFieldValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * バリデーション入力境界
 * category は本タスクの検証対象外のため Pick で除外
 */
export type SkillInfoValidationInput = Pick<
  SkillInfoFormData,
  "skillName" | "purpose"
>;

/**
 * フォーム全体のバリデーション結果
 */
export interface SkillInfoFormValidationResult {
  skillName?: string;
  purpose?: string;
  isValid: boolean;
}

/**
 * 文字数制限定数
 */
export const SKILL_INFO_VALIDATION_LIMITS = {
  skillName: {
    maxLength: 100,
  },
  purpose: {
    minLength: 10,
    maxLength: 500,
  },
} as const;

/**
 * エラーメッセージ定数（日本語）
 */
export const SKILL_INFO_VALIDATION_MESSAGES = {
  skillName: {
    required: "スキル名を入力してください",
    maxLength: "スキル名は100文字以内で入力してください",
  },
  purpose: {
    minLength: "目的は10文字以上で入力してください",
    maxLength: "目的は500文字以内で入力してください",
  },
} as const;

/**
 * skillName バリデーション関数
 * - undefined / null は valid（任意フィールドのため）
 * - trim後に空文字列 → invalid
 * - trim後に100文字超 → invalid
 */
export function validateSkillName(
  skillName: string | undefined | null,
): SkillInfoFieldValidationResult {
  if (skillName === undefined || skillName === null) {
    return { valid: true };
  }

  const trimmed = skillName.trim();

  if (trimmed === "") {
    return {
      valid: false,
      error: SKILL_INFO_VALIDATION_MESSAGES.skillName.required,
    };
  }

  if (trimmed.length > SKILL_INFO_VALIDATION_LIMITS.skillName.maxLength) {
    return {
      valid: false,
      error: SKILL_INFO_VALIDATION_MESSAGES.skillName.maxLength,
    };
  }

  return { valid: true };
}

/**
 * purpose バリデーション関数
 * - 10文字未満 → invalid
 * - 500文字超 → invalid
 */
export function validatePurpose(
  purpose: string,
): SkillInfoFieldValidationResult {
  const trimmed = purpose.trim();

  if (trimmed.length < SKILL_INFO_VALIDATION_LIMITS.purpose.minLength) {
    return {
      valid: false,
      error: SKILL_INFO_VALIDATION_MESSAGES.purpose.minLength,
    };
  }

  if (trimmed.length > SKILL_INFO_VALIDATION_LIMITS.purpose.maxLength) {
    return {
      valid: false,
      error: SKILL_INFO_VALIDATION_MESSAGES.purpose.maxLength,
    };
  }

  return { valid: true };
}

/**
 * フォーム全体バリデーション関数
 * 各フィールドを個別にバリデーション。全 valid → isValid: true
 */
export function validateSkillInfoForm(
  values: SkillInfoValidationInput,
): SkillInfoFormValidationResult {
  const skillNameResult = validateSkillName(values.skillName);
  const purposeResult = validatePurpose(values.purpose);

  const isValid = skillNameResult.valid && purposeResult.valid;

  return {
    isValid,
    skillName: skillNameResult.valid ? undefined : skillNameResult.error,
    purpose: purposeResult.valid ? undefined : purposeResult.error,
  };
}
