# バリデーションインターフェース設計

## タスク: UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001

## 型定義・関数シグネチャ

```typescript
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
  skillName?: string; // エラーメッセージ（エラーなし時は undefined）
  purpose?: string; // エラーメッセージ（エラーなし時は undefined）
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
): SkillInfoFieldValidationResult;

/**
 * purpose バリデーション関数
 * - 10文字未満 → invalid
 * - 500文字超 → invalid
 */
export function validatePurpose(
  purpose: string,
): SkillInfoFieldValidationResult;

/**
 * フォーム全体バリデーション関数
 */
export function validateSkillInfoForm(
  values: SkillInfoValidationInput,
): SkillInfoFormValidationResult;
```

## バリデーションロジック詳細

| 関数                    | 入力                          | バリデーションルール                                                                            |
| ----------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `validateSkillName`     | `string \| undefined \| null` | undefined/null → valid。trim後に空文字 → invalid。trim後101文字以上 → invalid                   |
| `validatePurpose`       | `string`                      | trim後9文字以下 → invalid（minLength）。trim後501文字以上 → invalid（maxLength）                |
| `validateSkillInfoForm` | `SkillInfoValidationInput`    | 各フィールドを個別バリデーション。全valid → `isValid: true`。エラーフィールドのみメッセージ返却 |
