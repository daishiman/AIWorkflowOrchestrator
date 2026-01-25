/**
 * Chat Edit ユーティリティ
 *
 * 共通ユーティリティのエクスポート
 */
export {
  detectTraversal,
  isAllowedPath,
  validateFilePath,
} from "./PathValidator";
export type { PathValidationResult } from "./PathValidator";

export { mapReadError, mapWriteError } from "./ErrorMapper";
export type {
  FileReadErrorCode,
  FileWriteErrorCode,
  FileError,
} from "./ErrorMapper";
