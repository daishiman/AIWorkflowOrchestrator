/**
 * スキーマモジュール
 *
 * Zodスキーマと関連する型・ユーティリティをエクスポート。
 */

// === スキーマ ===
export {
  oauthProviderSchema,
  displayNameSchema,
  avatarUrlSchema,
  updateProfileSchema,
  loginArgsSchema,
  updateProfileArgsSchema,
  linkProviderArgsSchema,
} from "./auth.js";

// === 型 ===
export type {
  OAuthProvider,
  DisplayName,
  AvatarUrl,
  UpdateProfileInput,
  LoginArgs,
  UpdateProfileArgs,
  LinkProviderArgs,
  ValidationResult,
} from "./auth.js";

// === 定数 ===
export {
  VALID_PROVIDERS,
  DISPLAY_NAME_CONSTRAINTS,
  DISPLAY_NAME_ERRORS,
  AVATAR_URL_ERRORS,
} from "./auth.js";

// === ユーティリティ ===
export { safeValidate, isValidProvider } from "./auth.js";
