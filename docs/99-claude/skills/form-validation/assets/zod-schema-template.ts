import { z } from "zod";

/**
 * フォームバリデーションスキーマテンプレート
 *
 * このテンプレートは、Zodを使用した型安全なバリデーションスキーマの定義例を提供します。
 */

// ========================================
// カスタムバリデーター関数
// ========================================

/**
 * パスワード強度検証
 * 要件: 8文字以上、英大文字・小文字・数字を各1文字以上含む
 */
const passwordStrength = (val: string) => {
  const hasUppercase = /[A-Z]/.test(val);
  const hasLowercase = /[a-z]/.test(val);
  const hasNumber = /[0-9]/.test(val);
  return hasUppercase && hasLowercase && hasNumber;
};

/**
 * 日付範囲検証（未来日付のみ許可等）
 */
const isFutureDate = (date: Date) => {
  return date > new Date();
};

// ========================================
// 共通バリデーションスキーマ
// ========================================

/**
 * メールアドレス検証
 */
export const emailSchema = z
  .string()
  .min(1, { message: "メールアドレスは必須です" })
  .email({ message: "メールアドレスの形式が正しくありません" });

/**
 * パスワード検証
 */
export const passwordSchema = z
  .string()
  .min(8, { message: "パスワードは8文字以上で入力してください" })
  .max(100, { message: "パスワードは100文字以内で入力してください" })
  .refine(passwordStrength, {
    message:
      "パスワードは英大文字、小文字、数字を各1文字以上含む必要があります",
  });

/**
 * 電話番号検証（日本国内形式）
 */
export const phoneNumberSchema = z.string().regex(/^0\d{9,10}$/, {
  message: "電話番号の形式が正しくありません（例: 09012345678）",
});

// ========================================
// フォームスキーマ定義
// ========================================

/**
 * ユーザー登録フォームスキーマ
 */
export const userRegistrationSchema = z
  .object({
    // 基本情報
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: z.string(),

    // 個人情報
    firstName: z
      .string()
      .min(1, { message: "名は必須です" })
      .max(50, { message: "名は50文字以内で入力してください" }),
    lastName: z
      .string()
      .min(1, { message: "姓は必須です" })
      .max(50, { message: "姓は50文字以内で入力してください" }),

    // 任意項目
    phoneNumber: phoneNumberSchema.optional(),
    birthDate: z
      .date()
      .max(new Date(), { message: "生年月日は過去の日付を入力してください" })
      .optional(),

    // 利用規約同意
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "利用規約に同意する必要があります",
    }),
  })
  // パスワード確認の一致検証
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "パスワードが一致しません",
    path: ["passwordConfirmation"],
  });

// ========================================
// 型定義のエクスポート
// ========================================

/**
 * スキーマから型を推論
 */
export type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;

// ========================================
// 使用例
// ========================================

/**
 * バリデーション実行例
 */
export function validateUserRegistration(data: unknown): {
  success: boolean;
  data?: UserRegistrationFormData;
  errors?: z.ZodError;
} {
  const result = userRegistrationSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: result.error,
  };
}

/**
 * エラーメッセージの整形例
 */
export function formatValidationErrors(error: z.ZodError): Array<{
  field: string;
  message: string;
}> {
  return error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
}
