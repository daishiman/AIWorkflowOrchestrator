/**
 * エラーマッピングユーティリティ
 *
 * システムエラーをアプリケーションエラーに変換
 */

/**
 * ファイル読み取りエラーコード
 */
export type FileReadErrorCode =
  | "FILE_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "TOO_LARGE"
  | "READ_ERROR";

/**
 * ファイル書き込みエラーコード
 */
export type FileWriteErrorCode =
  | "INVALID_PATH"
  | "PERMISSION_DENIED"
  | "WRITE_ERROR";

/**
 * ファイルエラー情報
 */
export interface FileError {
  code: FileReadErrorCode | FileWriteErrorCode;
  message: string;
}

/**
 * Node.js ファイルシステムエラーの型
 */
interface NodeFsError extends Error {
  code?: string;
}

/**
 * ファイル読み取りエラーをマッピング
 *
 * @param error - Node.js エラーオブジェクト
 * @param filePath - エラーが発生したファイルパス
 * @returns マッピングされたエラー情報
 */
export function mapReadError(error: unknown, filePath: string): FileError {
  const nodeError = error as NodeFsError;

  if (nodeError.code === "ENOENT") {
    return {
      code: "FILE_NOT_FOUND",
      message: `ファイルが見つかりません: ${filePath}`,
    };
  }

  if (nodeError.code === "EACCES") {
    return {
      code: "PERMISSION_DENIED",
      message: `ファイルへのアクセス権限がありません: ${filePath}`,
    };
  }

  return {
    code: "READ_ERROR",
    message: nodeError.message || "Unknown error",
  };
}

/**
 * ファイル書き込みエラーをマッピング
 *
 * @param error - Node.js エラーオブジェクト
 * @param filePath - エラーが発生したファイルパス
 * @returns マッピングされたエラー情報
 */
export function mapWriteError(error: unknown, filePath: string): FileError {
  const nodeError = error as NodeFsError;

  if (nodeError.code === "EACCES") {
    return {
      code: "PERMISSION_DENIED",
      message: `ファイルへの書き込み権限がありません: ${filePath}`,
    };
  }

  return {
    code: "WRITE_ERROR",
    message: nodeError.message || "Unknown error",
  };
}
