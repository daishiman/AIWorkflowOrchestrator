/**
 * Error Handler Template
 * カスタムエラーハンドラー実装のテンプレート
 */

// エラータイプの定義
export enum ErrorCategory {
  VALIDATION = "VALIDATION",
  BUSINESS = "BUSINESS",
  EXTERNAL = "EXTERNAL",
  INFRASTRUCTURE = "INFRASTRUCTURE",
  INTERNAL = "INTERNAL",
}

// ベースエラークラス
export class AppError extends Error {
  constructor(
    public readonly code: number,
    public readonly category: ErrorCategory,
    public readonly message: string,
    public readonly cause?: Error,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }

  isRetryable(): boolean {
    return (
      this.category === ErrorCategory.EXTERNAL ||
      this.category === ErrorCategory.INFRASTRUCTURE
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      category: this.category,
      message: this.message,
      context: this.context,
    };
  }
}

// 具体的なエラークラス
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(1000, ErrorCategory.VALIDATION, message, undefined, context);
    this.name = "ValidationError";
  }
}

export class BusinessError extends AppError {
  constructor(
    code: number,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(code, ErrorCategory.BUSINESS, message, undefined, context);
    this.name = "BusinessError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    message: string,
    cause?: Error,
    context?: Record<string, unknown>,
  ) {
    super(3000, ErrorCategory.EXTERNAL, message, cause, context);
    this.name = "ExternalServiceError";
  }
}

// エラーハンドラー
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      5000,
      ErrorCategory.INTERNAL,
      "An unexpected error occurred",
      error,
    );
  }

  return new AppError(
    5001,
    ErrorCategory.INTERNAL,
    "An unknown error occurred",
  );
}

// 使用例
// try {
//   await someOperation();
// } catch (error) {
//   const appError = handleError(error);
//   logger.error(appError);
//   if (appError.isRetryable()) {
//     await retry(() => someOperation());
//   }
// }
