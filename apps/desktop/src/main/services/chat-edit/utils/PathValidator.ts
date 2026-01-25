/**
 * パス検証ユーティリティ
 *
 * ファイルパスのセキュリティ検証を行う
 */
import * as path from "path";

/**
 * パス検証結果
 */
export interface PathValidationResult {
  /** 検証が通ったか */
  valid: boolean;
  /** エラーコード（検証失敗時） */
  errorCode?: string;
  /** エラーメッセージ（検証失敗時） */
  errorMessage?: string;
}

/**
 * パストラバーサル検出
 *
 * @param filePath - 検証するファイルパス
 * @returns パストラバーサルが検出された場合 true
 */
export function detectTraversal(filePath: string): boolean {
  return filePath.includes("..");
}

/**
 * パスが許可されたディレクトリ内にあるかチェック
 *
 * @param filePath - 検証するファイルパス
 * @param allowedDirs - 許可されたディレクトリのリスト
 * @returns 許可されたパスの場合 true
 */
export function isAllowedPath(
  filePath: string,
  allowedDirs: string[],
): boolean {
  const resolved = path.resolve(filePath);
  return allowedDirs.some((dir) => resolved.startsWith(path.resolve(dir)));
}

/**
 * ファイルパスの妥当性を検証
 *
 * @param filePath - 検証するファイルパス
 * @returns 検証結果
 */
export function validateFilePath(filePath: string): PathValidationResult {
  // 空またはホワイトスペースのみのパス
  if (!filePath || filePath.trim() === "") {
    return {
      valid: false,
      errorCode: "INVALID_PATH",
      errorMessage: "File path cannot be empty",
    };
  }

  // パストラバーサル検出
  if (detectTraversal(filePath)) {
    return {
      valid: false,
      errorCode: "PATH_TRAVERSAL",
      errorMessage: "Path traversal detected",
    };
  }

  return { valid: true };
}
