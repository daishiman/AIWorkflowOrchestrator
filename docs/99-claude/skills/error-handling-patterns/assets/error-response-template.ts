/**
 * Error Response Template
 * API エラーレスポンス形式のテンプレート
 */

export interface ErrorResponse {
  success: false;
  error: {
    code: number;
    message: string;
    details?: Record<string, unknown>;
    requestId?: string;
    timestamp: string;
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// エラーレスポンス生成
export function createErrorResponse(
  code: number,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string,
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      requestId,
      timestamp: new Date().toISOString(),
    },
  };
}

// 成功レスポンス生成
export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

// ユーザー向けメッセージマッピング
export const userFriendlyMessages: Record<number, string> = {
  1000: "The provided data is invalid. Please check your input and try again.",
  1001: "Required information is missing. Please fill in all required fields.",
  2000: "You do not have permission to perform this action.",
  2001: "The requested resource was not found.",
  2002: "This resource already exists.",
  3000: "An external service is temporarily unavailable. Please try again later.",
  3001: "Request limit exceeded. Please wait a moment before trying again.",
  4000: "A database error occurred. Please try again later.",
  5000: "An unexpected error occurred. Our team has been notified.",
};

export function getUserFriendlyMessage(code: number): string {
  return userFriendlyMessages[code] ?? "An error occurred. Please try again.";
}

// HTTPステータスコードマッピング
export const errorCodeToHttpStatus: Record<number, number> = {
  1000: 400, // Bad Request
  1001: 400,
  2000: 403, // Forbidden
  2001: 404, // Not Found
  2002: 409, // Conflict
  3000: 503, // Service Unavailable
  3001: 429, // Too Many Requests
  4000: 500, // Internal Server Error
  5000: 500,
};

export function getHttpStatus(code: number): number {
  // コード範囲で判定
  if (code >= 1000 && code < 2000) return 400;
  if (code >= 2000 && code < 3000) return 403;
  if (code >= 3000 && code < 4000) return 503;
  return 500;
}
