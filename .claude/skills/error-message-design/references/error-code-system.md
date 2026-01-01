# エラーコード体系

## 概要

一貫性のあるエラーコード体系の設計方法を解説します。
適切なコード体系により、エラーの分類、追跡、ドキュメント化が容易になります。

## コード体系の設計原則

### 階層構造

```
[カテゴリ]_[サブカテゴリ]_[番号]

例:
- AUTH_SESSION_001 : 認証 > セッション > エラー番号001
- VAL_EMAIL_001    : バリデーション > メール > エラー番号001
- SYS_DB_001       : システム > データベース > エラー番号001
```

### カテゴリ一覧

| コード | カテゴリ       | 説明                       |
| ------ | -------------- | -------------------------- |
| AUTH   | 認証・認可     | ログイン、セッション、権限 |
| VAL    | バリデーション | 入力検証、形式チェック     |
| RES    | リソース       | CRUD操作、存在確認         |
| SYS    | システム       | サーバー、DB、外部サービス |
| NET    | ネットワーク   | 通信、タイムアウト         |
| BIZ    | ビジネス       | 業務ロジック固有           |
| FILE   | ファイル       | アップロード、形式         |
| RATE   | レート制限     | API制限、スロットリング    |

## 実装パターン

### 基本的なエラーコード定義

```typescript
// エラーコードの型定義
type ErrorCategory =
  | "AUTH"
  | "VAL"
  | "RES"
  | "SYS"
  | "NET"
  | "BIZ"
  | "FILE"
  | "RATE";

interface ErrorDefinition {
  code: string;
  category: ErrorCategory;
  message: string;
  httpStatus: number;
  userMessage: string;
  action?: string;
}

// エラーコード定義
const ERROR_CODES = {
  // 認証系
  AUTH_REQUIRED: {
    code: "AUTH_001",
    category: "AUTH",
    message: "Authentication required",
    httpStatus: 401,
    userMessage: "ログインが必要です",
    action: "ログインしてからもう一度お試しください",
  },
  AUTH_SESSION_EXPIRED: {
    code: "AUTH_002",
    category: "AUTH",
    message: "Session expired",
    httpStatus: 401,
    userMessage: "セッションの有効期限が切れました",
    action: "再度ログインしてください",
  },
  AUTH_FORBIDDEN: {
    code: "AUTH_003",
    category: "AUTH",
    message: "Access forbidden",
    httpStatus: 403,
    userMessage: "この操作を行う権限がありません",
    action: "管理者にお問い合わせください",
  },

  // バリデーション系
  VAL_REQUIRED: {
    code: "VAL_001",
    category: "VAL",
    message: "Required field missing",
    httpStatus: 400,
    userMessage: "必須項目が入力されていません",
  },
  VAL_FORMAT: {
    code: "VAL_002",
    category: "VAL",
    message: "Invalid format",
    httpStatus: 400,
    userMessage: "入力形式が正しくありません",
  },
  VAL_RANGE: {
    code: "VAL_003",
    category: "VAL",
    message: "Value out of range",
    httpStatus: 400,
    userMessage: "値が許容範囲外です",
  },

  // リソース系
  RES_NOT_FOUND: {
    code: "RES_001",
    category: "RES",
    message: "Resource not found",
    httpStatus: 404,
    userMessage: "お探しのデータが見つかりません",
    action: "URLを確認するか、一覧から選択してください",
  },
  RES_ALREADY_EXISTS: {
    code: "RES_002",
    category: "RES",
    message: "Resource already exists",
    httpStatus: 409,
    userMessage: "同じデータが既に存在します",
    action: "別の値を入力してください",
  },
  RES_IN_USE: {
    code: "RES_003",
    category: "RES",
    message: "Resource in use",
    httpStatus: 409,
    userMessage: "このデータは使用中のため削除できません",
    action: "関連するデータを先に削除してください",
  },

  // システム系
  SYS_INTERNAL: {
    code: "SYS_001",
    category: "SYS",
    message: "Internal server error",
    httpStatus: 500,
    userMessage: "システムエラーが発生しました",
    action: "しばらく待ってからもう一度お試しください",
  },
  SYS_DB_ERROR: {
    code: "SYS_002",
    category: "SYS",
    message: "Database error",
    httpStatus: 500,
    userMessage: "データベースエラーが発生しました",
    action: "しばらく待ってからもう一度お試しください",
  },
  SYS_MAINTENANCE: {
    code: "SYS_003",
    category: "SYS",
    message: "Service under maintenance",
    httpStatus: 503,
    userMessage: "ただいまメンテナンス中です",
    action: "メンテナンス終了後にアクセスしてください",
  },
} as const;

type ErrorCodeKey = keyof typeof ERROR_CODES;
```

### エラークラスの実装

```typescript
class AppError extends Error {
  readonly code: string;
  readonly category: ErrorCategory;
  readonly httpStatus: number;
  readonly userMessage: string;
  readonly action?: string;
  readonly details?: Record<string, unknown>;

  constructor(
    errorKey: ErrorCodeKey,
    options?: {
      details?: Record<string, unknown>;
      cause?: Error;
    },
  ) {
    const def = ERROR_CODES[errorKey];
    super(def.message);

    this.name = "AppError";
    this.code = def.code;
    this.category = def.category;
    this.httpStatus = def.httpStatus;
    this.userMessage = def.userMessage;
    this.action = def.action;
    this.details = options?.details;
    this.cause = options?.cause;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.userMessage,
      action: this.action,
      details: this.details,
    };
  }
}

// 使用例
throw new AppError("AUTH_SESSION_EXPIRED");
throw new AppError("VAL_REQUIRED", {
  details: { field: "email" },
});
```

### バリデーションエラーの拡張

```typescript
interface FieldError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

class ValidationError extends AppError {
  readonly fieldErrors: FieldError[];

  constructor(fieldErrors: FieldError[]) {
    super("VAL_FORMAT", {
      details: { errors: fieldErrors },
    });
    this.fieldErrors = fieldErrors;
  }

  static fromZodError(zodError: z.ZodError): ValidationError {
    const fieldErrors = zodError.errors.map((err) => ({
      field: err.path.join("."),
      code: `VAL_${err.code.toUpperCase()}`,
      message: err.message,
    }));
    return new ValidationError(fieldErrors);
  }
}
```

## HTTPステータスコードマッピング

```typescript
const STATUS_CODE_MAP: Record<ErrorCategory, number> = {
  AUTH: 401,
  VAL: 400,
  RES: 404,
  SYS: 500,
  NET: 503,
  BIZ: 422,
  FILE: 400,
  RATE: 429,
};

// より詳細なマッピング
const HTTP_STATUS = {
  // 4xx クライアントエラー
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
  429: "Too Many Requests",

  // 5xx サーバーエラー
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
} as const;
```

## エラーコードの管理

### エラーコードレジストリ

```typescript
class ErrorCodeRegistry {
  private static codes = new Map<string, ErrorDefinition>();

  static register(definition: ErrorDefinition): void {
    if (this.codes.has(definition.code)) {
      throw new Error(`Duplicate error code: ${definition.code}`);
    }
    this.codes.set(definition.code, definition);
  }

  static get(code: string): ErrorDefinition | undefined {
    return this.codes.get(code);
  }

  static getByCategory(category: ErrorCategory): ErrorDefinition[] {
    return Array.from(this.codes.values()).filter(
      (def) => def.category === category,
    );
  }

  static exportAll(): ErrorDefinition[] {
    return Array.from(this.codes.values());
  }
}

// 初期化
Object.values(ERROR_CODES).forEach((def) => {
  ErrorCodeRegistry.register(def);
});
```

### エラーコードドキュメント生成

```typescript
function generateErrorDocumentation(): string {
  const errors = ErrorCodeRegistry.exportAll();
  const grouped = errors.reduce(
    (acc, err) => {
      if (!acc[err.category]) acc[err.category] = [];
      acc[err.category].push(err);
      return acc;
    },
    {} as Record<ErrorCategory, ErrorDefinition[]>,
  );

  let doc = "# エラーコード一覧\n\n";

  for (const [category, defs] of Object.entries(grouped)) {
    doc += `## ${category}\n\n`;
    doc +=
      "| コード | HTTPステータス | メッセージ | ユーザー向けメッセージ |\n";
    doc += "|--------|--------------|----------|--------------------|\n";

    for (const def of defs) {
      doc += `| ${def.code} | ${def.httpStatus} | ${def.message} | ${def.userMessage} |\n`;
    }

    doc += "\n";
  }

  return doc;
}
```

## ベストプラクティス

### 1. コードの一意性を保証

```typescript
// ✅ 重複チェック付きの登録
function registerErrorCode(def: ErrorDefinition): void {
  if (ErrorCodeRegistry.get(def.code)) {
    throw new Error(`Error code ${def.code} is already registered`);
  }
  ErrorCodeRegistry.register(def);
}
```

### 2. 追跡可能なコード

```typescript
// ✅ ログにエラーコードを含める
function logError(error: AppError, requestId: string): void {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      errorCode: error.code,
      category: error.category,
      message: error.message,
      details: error.details,
      stack: error.stack,
    }),
  );
}
```

### 3. バージョン管理

```typescript
// エラーコードにバージョンを含める（大規模システム向け）
const ERROR_CODE_V2 = {
  AUTH_001_V2: {
    // 新しいバージョンのエラー定義
  },
} as const;
```

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
