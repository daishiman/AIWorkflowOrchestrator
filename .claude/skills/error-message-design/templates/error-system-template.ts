/**
 * エラーシステムテンプレート
 *
 * 型安全で国際化対応のエラーハンドリングシステムです。
 * このテンプレートをプロジェクトに合わせてカスタマイズしてください。
 *
 * @example
 * // このファイルをコピーして、プロジェクトのエラーシステムに使用
 * cp templates/error-system-template.ts src/errors/index.ts
 */

// ============================================================
// 1. エラーコード定義
// ============================================================

/** エラーカテゴリ */
type ErrorCategory = 'AUTH' | 'VAL' | 'RES' | 'SYS' | 'NET' | 'BIZ' | 'FILE' | 'RATE';

/** HTTPステータスコード */
type HttpStatus = 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502 | 503;

/** エラー定義 */
interface ErrorDefinition {
  code: string;
  category: ErrorCategory;
  httpStatus: HttpStatus;
  message: string;
  userMessage: {
    ja: string;
    en: string;
  };
  action?: {
    ja: string;
    en: string;
  };
}

/** エラーコードマップ */
const ERROR_CODES = {
  // 認証系
  AUTH_REQUIRED: {
    code: 'AUTH_001',
    category: 'AUTH' as const,
    httpStatus: 401 as const,
    message: 'Authentication required',
    userMessage: {
      ja: 'ログインが必要です',
      en: 'Please log in to continue',
    },
    action: {
      ja: 'ログインしてから再度お試しください',
      en: 'Please log in and try again',
    },
  },
  AUTH_SESSION_EXPIRED: {
    code: 'AUTH_002',
    category: 'AUTH' as const,
    httpStatus: 401 as const,
    message: 'Session expired',
    userMessage: {
      ja: 'セッションの有効期限が切れました',
      en: 'Your session has expired',
    },
    action: {
      ja: '再度ログインしてください',
      en: 'Please log in again',
    },
  },
  AUTH_FORBIDDEN: {
    code: 'AUTH_003',
    category: 'AUTH' as const,
    httpStatus: 403 as const,
    message: 'Access forbidden',
    userMessage: {
      ja: 'この操作を行う権限がありません',
      en: 'You do not have permission for this action',
    },
    action: {
      ja: '管理者にお問い合わせください',
      en: 'Please contact your administrator',
    },
  },

  // バリデーション系
  VAL_REQUIRED: {
    code: 'VAL_001',
    category: 'VAL' as const,
    httpStatus: 400 as const,
    message: 'Required field missing',
    userMessage: {
      ja: '必須項目が入力されていません',
      en: 'Required field is missing',
    },
  },
  VAL_FORMAT: {
    code: 'VAL_002',
    category: 'VAL' as const,
    httpStatus: 400 as const,
    message: 'Invalid format',
    userMessage: {
      ja: '入力形式が正しくありません',
      en: 'Invalid format',
    },
  },

  // リソース系
  RES_NOT_FOUND: {
    code: 'RES_001',
    category: 'RES' as const,
    httpStatus: 404 as const,
    message: 'Resource not found',
    userMessage: {
      ja: 'お探しのデータが見つかりません',
      en: 'The requested data was not found',
    },
    action: {
      ja: 'URLを確認するか、一覧から選択してください',
      en: 'Please check the URL or select from the list',
    },
  },
  RES_CONFLICT: {
    code: 'RES_002',
    category: 'RES' as const,
    httpStatus: 409 as const,
    message: 'Resource conflict',
    userMessage: {
      ja: 'データの競合が発生しました',
      en: 'A data conflict has occurred',
    },
    action: {
      ja: '画面を更新してからやり直してください',
      en: 'Please refresh the page and try again',
    },
  },

  // システム系
  SYS_INTERNAL: {
    code: 'SYS_001',
    category: 'SYS' as const,
    httpStatus: 500 as const,
    message: 'Internal server error',
    userMessage: {
      ja: 'システムエラーが発生しました',
      en: 'A system error has occurred',
    },
    action: {
      ja: 'しばらく待ってからもう一度お試しください',
      en: 'Please wait a moment and try again',
    },
  },

  // レート制限
  RATE_LIMITED: {
    code: 'RATE_001',
    category: 'RATE' as const,
    httpStatus: 429 as const,
    message: 'Rate limit exceeded',
    userMessage: {
      ja: 'リクエストが多すぎます',
      en: 'Too many requests',
    },
    action: {
      ja: 'しばらく待ってからお試しください',
      en: 'Please wait a moment and try again',
    },
  },
} as const;

type ErrorCodeKey = keyof typeof ERROR_CODES;

// ============================================================
// 2. エラークラス
// ============================================================

/** サポートする言語 */
type Locale = 'ja' | 'en';

/** フィールドエラー */
interface FieldError {
  field: string;
  message: string;
  code: string;
}

/** エラーオプション */
interface AppErrorOptions {
  details?: Record<string, unknown>;
  cause?: Error;
  locale?: Locale;
}

/** アプリケーションエラークラス */
class AppError extends Error {
  readonly code: string;
  readonly category: ErrorCategory;
  readonly httpStatus: HttpStatus;
  readonly userMessage: string;
  readonly action?: string;
  readonly details?: Record<string, unknown>;
  readonly locale: Locale;

  constructor(errorKey: ErrorCodeKey, options: AppErrorOptions = {}) {
    const def = ERROR_CODES[errorKey];
    const locale = options.locale || 'ja';

    super(def.message);

    this.name = 'AppError';
    this.code = def.code;
    this.category = def.category;
    this.httpStatus = def.httpStatus;
    this.userMessage = def.userMessage[locale];
    this.action = def.action?.[locale];
    this.details = options.details;
    this.locale = locale;
    this.cause = options.cause;

    Error.captureStackTrace(this, this.constructor);
  }

  /** RFC 7807 Problem Details形式に変換 */
  toProblemDetails(baseUrl: string, instance?: string): ProblemDetails {
    return {
      type: `${baseUrl}/errors/${this.code.toLowerCase()}`,
      title: this.userMessage,
      status: this.httpStatus,
      detail: this.action,
      instance,
      code: this.code,
      timestamp: new Date().toISOString(),
    };
  }

  /** JSON形式に変換 */
  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.userMessage,
      action: this.action,
      details: this.details,
    };
  }
}

/** RFC 7807 Problem Details */
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code?: string;
  timestamp?: string;
  errors?: FieldError[];
}

// ============================================================
// 3. バリデーションエラー
// ============================================================

/** バリデーションエラークラス */
class ValidationError extends AppError {
  readonly fieldErrors: FieldError[];

  constructor(fieldErrors: FieldError[], options: AppErrorOptions = {}) {
    super('VAL_FORMAT', options);
    this.fieldErrors = fieldErrors;
  }

  /** Zodエラーから変換 */
  static fromZodError(zodError: { errors: Array<{ path: (string | number)[]; message: string; code: string }> }, locale: Locale = 'ja'): ValidationError {
    const fieldErrors = zodError.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: `VAL_${err.code.toUpperCase()}`,
    }));
    return new ValidationError(fieldErrors, { locale });
  }

  toProblemDetails(baseUrl: string, instance?: string): ProblemDetails {
    return {
      ...super.toProblemDetails(baseUrl, instance),
      errors: this.fieldErrors,
    };
  }
}

// ============================================================
// 4. エラーファクトリ
// ============================================================

/** エラーファクトリ */
const createError = {
  /** 認証エラー */
  authRequired: (options?: AppErrorOptions) => new AppError('AUTH_REQUIRED', options),
  sessionExpired: (options?: AppErrorOptions) => new AppError('AUTH_SESSION_EXPIRED', options),
  forbidden: (options?: AppErrorOptions) => new AppError('AUTH_FORBIDDEN', options),

  /** バリデーションエラー */
  validation: (fieldErrors: FieldError[], options?: AppErrorOptions) =>
    new ValidationError(fieldErrors, options),
  required: (field: string, options?: AppErrorOptions) =>
    new AppError('VAL_REQUIRED', { ...options, details: { field } }),

  /** リソースエラー */
  notFound: (resource: string, options?: AppErrorOptions) =>
    new AppError('RES_NOT_FOUND', { ...options, details: { resource } }),
  conflict: (options?: AppErrorOptions) => new AppError('RES_CONFLICT', options),

  /** システムエラー */
  internal: (cause?: Error, options?: AppErrorOptions) =>
    new AppError('SYS_INTERNAL', { ...options, cause }),

  /** レート制限 */
  rateLimited: (options?: AppErrorOptions) => new AppError('RATE_LIMITED', options),
};

// ============================================================
// 5. Express.jsエラーハンドラー
// ============================================================

/**
 * Express.js用エラーハンドラーミドルウェア
 *
 * @example
 * app.use(errorHandler({ baseUrl: 'https://api.example.com' }));
 */
function createErrorHandler(config: { baseUrl: string; defaultLocale?: Locale }) {
  return function errorHandler(
    err: Error,
    req: { originalUrl: string; headers: { 'accept-language'?: string } },
    res: { status: (code: number) => { type: (type: string) => { json: (body: unknown) => void } } },
    next: () => void
  ): void {
    // ロケール検出
    const locale = detectLocale(req.headers['accept-language'], config.defaultLocale || 'ja');

    // AppErrorの場合
    if (err instanceof AppError) {
      res
        .status(err.httpStatus)
        .type('application/problem+json')
        .json(err.toProblemDetails(config.baseUrl, req.originalUrl));
      return;
    }

    // 予期しないエラー
    console.error('Unexpected error:', err);
    const internalError = createError.internal(err, { locale });
    res
      .status(500)
      .type('application/problem+json')
      .json(internalError.toProblemDetails(config.baseUrl, req.originalUrl));
  };
}

/** ロケール検出 */
function detectLocale(acceptLanguage: string | undefined, defaultLocale: Locale): Locale {
  if (!acceptLanguage) return defaultLocale;

  const supported: Locale[] = ['ja', 'en'];
  const preferred = acceptLanguage
    .split(',')
    .map((lang) => lang.split(';')[0].trim().split('-')[0] as Locale);

  return preferred.find((lang) => supported.includes(lang)) || defaultLocale;
}

// ============================================================
// エクスポート
// ============================================================

export {
  AppError,
  ValidationError,
  createError,
  createErrorHandler,
  ERROR_CODES,
  type ErrorCodeKey,
  type ErrorCategory,
  type HttpStatus,
  type Locale,
  type FieldError,
  type ProblemDetails,
};
