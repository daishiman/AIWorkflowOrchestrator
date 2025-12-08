/**
 * IPC入力検証ユーティリティ
 * セキュリティ向上のための入力検証を提供
 */

import { app } from "electron";
import * as path from "path";

// 許可されたベースパス
export const getAllowedBasePaths = (): string[] => [
  app.getPath("documents"),
  app.getPath("userData"),
  app.getPath("home"),
];

/**
 * パスの検証
 * - ディレクトリトラバーサル攻撃を防止
 * - 許可されたパス内にあることを確認
 */
export function validatePath(filePath: string): {
  valid: boolean;
  error?: string;
} {
  if (!filePath || typeof filePath !== "string") {
    return { valid: false, error: "Invalid path: must be a non-empty string" };
  }

  // パスの正規化
  const normalizedPath = path.normalize(filePath);

  // ディレクトリトラバーサルの検出
  if (normalizedPath.includes("..")) {
    return {
      valid: false,
      error: "Invalid path: directory traversal not allowed",
    };
  }

  // 許可されたパス内にあるか確認
  const allowedPaths = getAllowedBasePaths();
  const isAllowed = allowedPaths.some((basePath) =>
    normalizedPath.startsWith(basePath),
  );

  if (!isAllowed) {
    return { valid: false, error: "Access denied: path is not allowed" };
  }

  return { valid: true };
}

/**
 * 文字列の検証
 */
export function validateString(
  value: unknown,
  options?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  },
): { valid: boolean; error?: string } {
  if (typeof value !== "string") {
    return { valid: false, error: "Value must be a string" };
  }

  if (options?.minLength !== undefined && value.length < options.minLength) {
    return {
      valid: false,
      error: `String must be at least ${options.minLength} characters`,
    };
  }

  if (options?.maxLength !== undefined && value.length > options.maxLength) {
    return {
      valid: false,
      error: `String must be at most ${options.maxLength} characters`,
    };
  }

  if (options?.pattern && !options.pattern.test(value)) {
    return { valid: false, error: "String does not match required pattern" };
  }

  return { valid: true };
}

/**
 * 数値の検証
 */
export function validateNumber(
  value: unknown,
  options?: {
    min?: number;
    max?: number;
    integer?: boolean;
  },
): { valid: boolean; error?: string } {
  if (typeof value !== "number" || isNaN(value)) {
    return { valid: false, error: "Value must be a number" };
  }

  if (options?.integer && !Number.isInteger(value)) {
    return { valid: false, error: "Value must be an integer" };
  }

  if (options?.min !== undefined && value < options.min) {
    return { valid: false, error: `Value must be at least ${options.min}` };
  }

  if (options?.max !== undefined && value > options.max) {
    return { valid: false, error: `Value must be at most ${options.max}` };
  }

  return { valid: true };
}

/**
 * オブジェクトの検証
 */
export function validateObject(value: unknown): {
  valid: boolean;
  error?: string;
} {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return { valid: false, error: "Value must be an object" };
  }
  return { valid: true };
}

/**
 * ストアキーの検証（インジェクション防止）
 */
export function validateStoreKey(key: unknown): {
  valid: boolean;
  error?: string;
} {
  const stringValidation = validateString(key, {
    minLength: 1,
    maxLength: 256,
    pattern: /^[a-zA-Z0-9_.-]+$/,
  });

  if (!stringValidation.valid) {
    return {
      valid: false,
      error:
        "Store key must be alphanumeric with underscores, dots, or hyphens",
    };
  }

  return { valid: true };
}

/**
 * エンコーディングの検証
 */
const ALLOWED_ENCODINGS = [
  "utf-8",
  "utf8",
  "ascii",
  "latin1",
  "base64",
  "hex",
] as const;

export function validateEncoding(encoding: unknown): {
  valid: boolean;
  error?: string;
  value?: BufferEncoding;
} {
  if (encoding === undefined) {
    return { valid: true, value: "utf-8" };
  }

  if (typeof encoding !== "string") {
    return { valid: false, error: "Encoding must be a string" };
  }

  const normalizedEncoding = encoding.toLowerCase();
  if (
    !ALLOWED_ENCODINGS.includes(
      normalizedEncoding as (typeof ALLOWED_ENCODINGS)[number],
    )
  ) {
    return {
      valid: false,
      error: `Encoding must be one of: ${ALLOWED_ENCODINGS.join(", ")}`,
    };
  }

  return { valid: true, value: normalizedEncoding as BufferEncoding };
}

/**
 * 検証エラーレスポンスを作成
 */
export function createValidationErrorResponse(error: string): {
  success: false;
  error: string;
} {
  return {
    success: false,
    error: `Validation error: ${error}`,
  };
}
