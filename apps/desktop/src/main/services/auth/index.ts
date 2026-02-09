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
  // AuthMode 型
  AuthMode,
  AuthStatus,
  AuthModeChangeEvent,
  AuthModeChangeListener,
  AuthModeStoreSchema,
  AuthModeValidationResult,
  AuthModeStatusError,
  IAuthModeService,
  ISubscriptionAuthProvider,
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
  // AuthMode 定数
  DEFAULT_AUTH_MODE,
  VALID_AUTH_MODES,
  AUTH_MODE_STORE_NAME,
  AUTH_MODE_ERROR_CODES,
} from "./types";

// サービスエクスポート
export {
  AuthKeyService,
  createAuthKeyStorage,
  clearAuthKeyStore,
  resetAuthKeyStore,
} from "./AuthKeyService";

// AuthModeService エクスポート
export {
  AuthModeService,
  StubSubscriptionAuthProvider,
  createAuthModeService,
  clearAuthModeStore,
  resetAuthModeStore,
} from "./AuthModeService";
