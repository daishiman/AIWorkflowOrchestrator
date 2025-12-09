/**
 * 認証関連Zodスキーマ
 *
 * 認証・プロフィール関連の入力バリデーションを型安全かつ一元管理するモジュール。
 * ランタイムバリデーションとTypeScript型推論を統合して提供する。
 *
 * @example
 * ```typescript
 * import { oauthProviderSchema, displayNameSchema } from "@repo/shared/schemas";
 *
 * // バリデーション
 * const result = oauthProviderSchema.safeParse("google");
 * if (result.success) {
 *   console.log(result.data); // "google"
 * }
 * ```
 */

import { z } from "zod";

// ============================================================================
// OAuthプロバイダー
// ============================================================================

/**
 * サポートするOAuthプロバイダーの定数
 */
export const VALID_PROVIDERS = ["google", "github", "discord"] as const;

/**
 * OAuthプロバイダーエラーメッセージ
 */
export const OAUTH_PROVIDER_ERRORS = {
  invalid: `無効な認証プロバイダーです。${VALID_PROVIDERS.join(", ")} のいずれかを指定してください`,
} as const;

/**
 * OAuthプロバイダースキーマ
 *
 * @example
 * ```typescript
 * oauthProviderSchema.parse("google"); // "google"
 * oauthProviderSchema.parse("facebook"); // ZodError
 * ```
 */
export const oauthProviderSchema = z.enum(VALID_PROVIDERS, {
  error: OAUTH_PROVIDER_ERRORS.invalid,
});

/**
 * Zodから推論されるOAuthProvider型
 */
export type OAuthProvider = z.infer<typeof oauthProviderSchema>;

// ============================================================================
// displayName
// ============================================================================

/**
 * displayNameの制約定数
 */
export const DISPLAY_NAME_CONSTRAINTS = {
  minLength: 1,
  maxLength: 50,
  /**
   * 許可文字パターン
   * - 英数字 (a-zA-Z0-9)
   * - ひらがな (\u3040-\u309f)
   * - カタカナ (\u30a0-\u30ff)
   * - 漢字 (\u4e00-\u9faf)
   * - スペース、ハイフン、アンダースコア (\s\-_)
   *
   * XSS/SQLインジェクション対策として、特殊記号は禁止
   */
  pattern: /^[a-zA-Z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\s\-_]+$/,
} as const;

/**
 * displayNameエラーメッセージ
 */
export const DISPLAY_NAME_ERRORS = {
  required: "表示名は必須です",
  tooShort: "表示名を入力してください",
  tooLong: "表示名は50文字以内で入力してください",
  invalidChars:
    "使用できない文字が含まれています。英数字、日本語、スペース、ハイフン、アンダースコアのみ使用可能です",
} as const;

/**
 * displayNameスキーマ
 *
 * XSS/SQLインジェクション対策として、許可する文字を制限。
 * 日本語（ひらがな、カタカナ、漢字）をサポート。
 *
 * @example
 * ```typescript
 * displayNameSchema.parse("田中太郎"); // "田中太郎"
 * displayNameSchema.parse("<script>"); // ZodError: 使用できない文字
 * displayNameSchema.parse(""); // ZodError: 表示名は必須です
 * ```
 */
export const displayNameSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? DISPLAY_NAME_ERRORS.required
        : DISPLAY_NAME_ERRORS.required,
  })
  .min(DISPLAY_NAME_CONSTRAINTS.minLength, {
    error: DISPLAY_NAME_ERRORS.tooShort,
  })
  .max(DISPLAY_NAME_CONSTRAINTS.maxLength, {
    error: DISPLAY_NAME_ERRORS.tooLong,
  })
  .regex(DISPLAY_NAME_CONSTRAINTS.pattern, {
    error: DISPLAY_NAME_ERRORS.invalidChars,
  });

/**
 * Zodから推論されるDisplayName型
 */
export type DisplayName = z.infer<typeof displayNameSchema>;

// ============================================================================
// avatarUrl
// ============================================================================

/**
 * avatarUrlエラーメッセージ
 */
export const AVATAR_URL_ERRORS = {
  invalidFormat: "無効なURL形式です",
  httpsRequired: "アバターURLはHTTPSである必要があります",
} as const;

/**
 * avatarUrlスキーマ（nullable）
 *
 * セキュリティ上、HTTPSのみ許可。
 * null値は許可（アバター未設定の場合）。
 *
 * @example
 * ```typescript
 * avatarUrlSchema.parse("https://example.com/avatar.png"); // OK
 * avatarUrlSchema.parse(null); // OK
 * avatarUrlSchema.parse("http://example.com/avatar.png"); // ZodError: HTTPS必須
 * ```
 */
export const avatarUrlSchema = z
  .string()
  .url({ error: AVATAR_URL_ERRORS.invalidFormat })
  .refine((url) => url.startsWith("https://"), {
    error: AVATAR_URL_ERRORS.httpsRequired,
  })
  .nullable();

/**
 * Zodから推論されるAvatarUrl型
 */
export type AvatarUrl = z.infer<typeof avatarUrlSchema>;

// ============================================================================
// プロフィール更新
// ============================================================================

/**
 * プロフィール更新スキーマ
 *
 * 部分更新をサポート（全フィールドがオプショナル）。
 *
 * @example
 * ```typescript
 * updateProfileSchema.parse({ displayName: "新しい名前" }); // OK
 * updateProfileSchema.parse({}); // OK (空のオブジェクトは許可)
 * updateProfileSchema.parse({ displayName: "<script>" }); // ZodError
 * ```
 */
export const updateProfileSchema = z.object({
  displayName: displayNameSchema.optional(),
  avatarUrl: avatarUrlSchema.optional(),
});

/**
 * Zodから推論されるUpdateProfileInput型
 */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============================================================================
// IPC引数スキーマ
// ============================================================================

/**
 * ログインIPC引数スキーマ
 */
export const loginArgsSchema = z.object({
  provider: oauthProviderSchema,
});

/**
 * Zodから推論されるLoginArgs型
 */
export type LoginArgs = z.infer<typeof loginArgsSchema>;

/**
 * プロフィール更新IPC引数スキーマ
 */
export const updateProfileArgsSchema = z.object({
  updates: updateProfileSchema,
});

/**
 * Zodから推論されるUpdateProfileArgs型
 */
export type UpdateProfileArgs = z.infer<typeof updateProfileArgsSchema>;

/**
 * プロバイダー連携IPC引数スキーマ
 */
export const linkProviderArgsSchema = z.object({
  provider: oauthProviderSchema,
});

/**
 * Zodから推論されるLinkProviderArgs型
 */
export type LinkProviderArgs = z.infer<typeof linkProviderArgsSchema>;

// ============================================================================
// ユーティリティ
// ============================================================================

/**
 * Zodスキーマによるバリデーション結果型
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 安全なバリデーション実行
 *
 * parseの例外をキャッチしてResultオブジェクトを返す。
 * UIでのエラー表示に便利。
 *
 * @param schema - Zodスキーマ
 * @param data - バリデーション対象データ
 * @returns ValidationResult
 *
 * @example
 * ```typescript
 * const result = safeValidate(displayNameSchema, "田中太郎");
 * if (result.success) {
 *   console.log(result.data); // "田中太郎"
 * } else {
 *   console.log(result.error); // エラーメッセージ
 * }
 * ```
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // 最初のエラーメッセージを返す
  const firstError = result.error.issues[0];
  return {
    success: false,
    error: firstError?.message ?? "バリデーションエラー",
  };
}

/**
 * OAuthプロバイダーの検証（後方互換性）
 *
 * @deprecated oauthProviderSchema.safeParse() を使用してください
 */
export function isValidProvider(provider: unknown): provider is OAuthProvider {
  return oauthProviderSchema.safeParse(provider).success;
}
