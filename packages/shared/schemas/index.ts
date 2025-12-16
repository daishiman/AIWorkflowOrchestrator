/**
 * スキーマモジュール
 *
 * Zodスキーマと関連する型・ユーティリティをエクスポート。
 */

// === 認証スキーマ ===
export {
  oauthProviderSchema,
  displayNameSchema,
  avatarUrlSchema,
  updateProfileSchema,
  loginArgsSchema,
  updateProfileArgsSchema,
  linkProviderArgsSchema,
} from "./auth.js";

// === 認証型 ===
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

// === 認証定数 ===
export {
  VALID_PROVIDERS,
  DISPLAY_NAME_CONSTRAINTS,
  DISPLAY_NAME_ERRORS,
  AVATAR_URL_ERRORS,
} from "./auth.js";

// === 認証ユーティリティ ===
export { safeValidate, isValidProvider } from "./auth.js";

// === ファイル選択スキーマ ===
export {
  // 基本スキーマ
  fileExtensionSchema,
  filePathSchema,
  mimeTypeSchema,
  fileFilterCategorySchema,
  dialogFileFilterSchema,
  // ファイル情報
  selectedFileSchema,
  // IPC通信スキーマ
  openFileDialogRequestSchema,
  openFileDialogResponseSchema,
  getFileMetadataRequestSchema,
  getFileMetadataResponseSchema,
  getMultipleFileMetadataRequestSchema,
  getMultipleFileMetadataResponseSchema,
  validateFilePathRequestSchema,
  validateFilePathResponseSchema,
  // 状態管理スキーマ
  fileSelectionStateSchema,
  // エラーメッセージ定数
  FILE_EXTENSION_ERRORS,
  FILE_PATH_ERRORS,
  MIME_TYPE_ERRORS,
  DIALOG_FILE_FILTER_ERRORS,
  SELECTED_FILE_ERRORS,
  OPEN_FILE_DIALOG_ERRORS,
  GET_MULTIPLE_FILE_METADATA_ERRORS,
} from "./file-selection.schema.js";

// === ファイル選択型 ===
export type {
  FileExtension,
  FilePath,
  MimeType,
  FileFilterCategory,
  DialogFileFilter,
  SelectedFile,
  OpenFileDialogRequest,
  OpenFileDialogResponse,
  GetFileMetadataRequest,
  GetFileMetadataResponse,
  GetMultipleFileMetadataRequest,
  GetMultipleFileMetadataResponse,
  ValidateFilePathRequest,
  ValidateFilePathResponse,
  FileSelectionState,
} from "./file-selection.schema.js";
