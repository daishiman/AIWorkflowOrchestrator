# APIエラーレスポンス

## 概要

RESTful APIにおけるエラーレスポンスの設計パターンを解説します。
RFC 7807準拠のフォーマットから、バリデーションエラー、認証エラーまで網羅します。

## RFC 7807 Problem Details

### 基本フォーマット

```typescript
interface ProblemDetails {
  type: string;        // エラータイプを識別するURI
  title: string;       // 人間が読める短いタイトル
  status: number;      // HTTPステータスコード
  detail?: string;     // より詳細な説明
  instance?: string;   // この特定のエラー発生を識別するURI
}
```

### 実装例

```typescript
// 基本的なProblemDetailsレスポンス
const notFoundError = {
  type: 'https://api.example.com/errors/not-found',
  title: 'Resource Not Found',
  status: 404,
  detail: 'The requested user with ID 123 was not found',
  instance: '/users/123',
};

// 拡張フィールド付き
interface ExtendedProblemDetails extends ProblemDetails {
  code?: string;              // アプリケーション固有のエラーコード
  errors?: ValidationError[]; // フィールド別エラー
  timestamp?: string;         // エラー発生時刻
  traceId?: string;          // リクエスト追跡ID
}

const validationError: ExtendedProblemDetails = {
  type: 'https://api.example.com/errors/validation',
  title: 'Validation Failed',
  status: 400,
  detail: 'The request body contains invalid fields',
  code: 'VAL_001',
  timestamp: new Date().toISOString(),
  traceId: 'abc-123-def',
  errors: [
    { field: 'email', message: 'Invalid email format', code: 'VAL_EMAIL' },
    { field: 'age', message: 'Must be a positive number', code: 'VAL_POSITIVE' },
  ],
};
```

## HTTPステータスコード

### クライアントエラー（4xx）

```typescript
const CLIENT_ERRORS = {
  // 400 Bad Request - 不正なリクエスト
  badRequest: {
    status: 400,
    type: 'bad-request',
    title: 'Bad Request',
    detail: 'The request could not be understood',
  },

  // 401 Unauthorized - 認証が必要
  unauthorized: {
    status: 401,
    type: 'unauthorized',
    title: 'Unauthorized',
    detail: 'Authentication is required',
  },

  // 403 Forbidden - アクセス禁止
  forbidden: {
    status: 403,
    type: 'forbidden',
    title: 'Forbidden',
    detail: 'You do not have permission to access this resource',
  },

  // 404 Not Found - リソースが存在しない
  notFound: {
    status: 404,
    type: 'not-found',
    title: 'Not Found',
    detail: 'The requested resource was not found',
  },

  // 409 Conflict - 競合
  conflict: {
    status: 409,
    type: 'conflict',
    title: 'Conflict',
    detail: 'The request conflicts with the current state',
  },

  // 422 Unprocessable Entity - 処理できないエンティティ
  unprocessableEntity: {
    status: 422,
    type: 'unprocessable-entity',
    title: 'Unprocessable Entity',
    detail: 'The request was well-formed but semantically incorrect',
  },

  // 429 Too Many Requests - レート制限
  tooManyRequests: {
    status: 429,
    type: 'too-many-requests',
    title: 'Too Many Requests',
    detail: 'Rate limit exceeded',
  },
};
```

### サーバーエラー（5xx）

```typescript
const SERVER_ERRORS = {
  // 500 Internal Server Error
  internalError: {
    status: 500,
    type: 'internal-error',
    title: 'Internal Server Error',
    detail: 'An unexpected error occurred',
  },

  // 502 Bad Gateway
  badGateway: {
    status: 502,
    type: 'bad-gateway',
    title: 'Bad Gateway',
    detail: 'Invalid response from upstream server',
  },

  // 503 Service Unavailable
  serviceUnavailable: {
    status: 503,
    type: 'service-unavailable',
    title: 'Service Unavailable',
    detail: 'The service is temporarily unavailable',
  },
};
```

## エラーレスポンスの実装

### Express.js

```typescript
import { Request, Response, NextFunction } from 'express';

// エラークラス
class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public detail: string,
    public errors?: ValidationError[]
  ) {
    super(detail);
    this.name = 'ApiError';
  }

  toResponse(req: Request): ExtendedProblemDetails {
    return {
      type: `${req.protocol}://${req.get('host')}/errors/${this.code.toLowerCase()}`,
      title: this.getTitle(),
      status: this.status,
      detail: this.detail,
      code: this.code,
      instance: req.originalUrl,
      timestamp: new Date().toISOString(),
      errors: this.errors,
    };
  }

  private getTitle(): string {
    const titles: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Validation Error',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
    };
    return titles[this.status] || 'Error';
  }
}

// エラーハンドラーミドルウェア
function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // ログ出力
  console.error({
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .type('application/problem+json')
      .json(err.toResponse(req));
  }

  // 予期しないエラー
  return res
    .status(500)
    .type('application/problem+json')
    .json({
      type: `${req.protocol}://${req.get('host')}/errors/internal`,
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
      instance: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
}
```

### バリデーションエラー

```typescript
import { z } from 'zod';

// Zodエラーを変換
function fromZodError(error: z.ZodError): ApiError {
  const errors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: `VAL_${err.code.toUpperCase()}`,
  }));

  return new ApiError(
    400,
    'VALIDATION_ERROR',
    'One or more fields have validation errors',
    errors
  );
}

// 使用例
app.post('/users', async (req, res, next) => {
  try {
    const data = UserCreateSchema.parse(req.body);
    // ...
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(fromZodError(err));
    }
    next(err);
  }
});
```

## 認証・認可エラー

```typescript
// 認証エラー
class AuthenticationError extends ApiError {
  constructor(detail = 'Authentication required') {
    super(401, 'AUTH_REQUIRED', detail);
  }
}

// トークン期限切れ
class TokenExpiredError extends ApiError {
  constructor() {
    super(401, 'TOKEN_EXPIRED', 'Access token has expired');
  }
}

// 権限不足
class ForbiddenError extends ApiError {
  constructor(resource: string) {
    super(403, 'FORBIDDEN', `You do not have permission to access ${resource}`);
  }
}

// 認証ミドルウェア
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return next(new AuthenticationError());
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new TokenExpiredError());
    }
    return next(new AuthenticationError('Invalid token'));
  }
}
```

## レート制限エラー

```typescript
interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

class RateLimitError extends ApiError {
  constructor(public rateLimitInfo: RateLimitInfo) {
    super(429, 'RATE_LIMITED', 'Too many requests');
  }

  toResponse(req: Request): ExtendedProblemDetails {
    return {
      ...super.toResponse(req),
      retryAfter: Math.ceil((this.rateLimitInfo.reset.getTime() - Date.now()) / 1000),
      rateLimit: {
        limit: this.rateLimitInfo.limit,
        remaining: this.rateLimitInfo.remaining,
        reset: this.rateLimitInfo.reset.toISOString(),
      },
    };
  }
}

// レスポンスヘッダーにも設定
function setRateLimitHeaders(res: Response, info: RateLimitInfo) {
  res.setHeader('X-RateLimit-Limit', info.limit);
  res.setHeader('X-RateLimit-Remaining', info.remaining);
  res.setHeader('X-RateLimit-Reset', info.reset.toISOString());
}
```

## 環境別のエラー詳細度

```typescript
// 開発環境ではスタックトレースを含める
function formatError(err: Error, req: Request): ExtendedProblemDetails {
  const base: ExtendedProblemDetails = {
    type: 'https://api.example.com/errors/internal',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
    instance: req.originalUrl,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    return {
      ...base,
      detail: err.message,
      stack: err.stack?.split('\n'),
      cause: err.cause,
    };
  }

  return base;
}
```

## クライアント側のエラーハンドリング

```typescript
// APIクライアント
class ApiClient {
  async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json() as ExtendedProblemDetails;
      throw new ApiResponseError(error);
    }

    return response.json();
  }
}

class ApiResponseError extends Error {
  constructor(public problem: ExtendedProblemDetails) {
    super(problem.detail || problem.title);
    this.name = 'ApiResponseError';
  }

  get status(): number {
    return this.problem.status;
  }

  get code(): string | undefined {
    return this.problem.code;
  }

  get validationErrors(): ValidationError[] | undefined {
    return this.problem.errors;
  }

  isValidationError(): boolean {
    return this.status === 400 && !!this.problem.errors;
  }

  isAuthError(): boolean {
    return this.status === 401;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }
}

// 使用例
try {
  await apiClient.request('/users', { method: 'POST', body });
} catch (err) {
  if (err instanceof ApiResponseError) {
    if (err.isValidationError()) {
      // フィールドエラーを表示
      err.validationErrors?.forEach((e) => {
        setFieldError(e.field, e.message);
      });
    } else if (err.isAuthError()) {
      // ログインページへリダイレクト
      router.push('/login');
    } else {
      // 一般的なエラー表示
      showToast({ type: 'error', message: err.message });
    }
  }
}
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
