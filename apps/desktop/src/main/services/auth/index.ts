/**
 * 認証キー管理サービス モジュール
 *
 * @module auth
 */

// 型エクスポート
export type {
  IAuthKeyService,
  IAuthKeyStorage,
  AuthKeyError,
  AuthKeyErrorCodeString,
  AuthKeyServiceResult,
  AuthKeyValidationResult,
  AuthKeySetRequest,
  AuthKeySetResponse,
  AuthKeyExistsResponse,
  AuthKeyValidateRequest,
  AuthKeyValidateResponse,
  AuthKeyDeleteResponse,
  AuthKeyStoreSchema,
  AuthKeyStorageConfig,
} from "./types";

// 定数エクスポート
export {
  AUTH_KEY_ERROR_CODES,
  AUTH_KEY_STORE_NAME,
  ENCRYPTED_AUTH_KEY,
  ENV_ANTHROPIC_API_KEY,
  MAX_KEY_LENGTH,
  MIN_KEY_LENGTH,
  ANTHROPIC_API_KEY_PREFIX_PATTERN,
} from "./types";

// サービスエクスポート
export {
  AuthKeyService,
  createAuthKeyStorage,
  clearAuthKeyStore,
  resetAuthKeyStore,
} from "./AuthKeyService";
