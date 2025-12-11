# 多言語対応エラーハンドリング（i18n）

## 概要

国際化（i18n）対応のエラーメッセージシステムの設計方法を解説します。
プレースホルダー、複数形、文化的配慮を含む包括的なアプローチを提供します。

## 基本的な翻訳構造

### メッセージファイル構造

```
locales/
├── ja/
│   └── errors.json
├── en/
│   └── errors.json
├── zh/
│   └── errors.json
└── ko/
    └── errors.json
```

### JSONメッセージ形式

```json
// locales/ja/errors.json
{
  "validation": {
    "required": "{field}は必須です",
    "email": "有効なメールアドレスを入力してください",
    "minLength": "{field}は{min}文字以上で入力してください",
    "maxLength": "{field}は{max}文字以内で入力してください",
    "pattern": "{field}の形式が正しくありません"
  },
  "auth": {
    "loginRequired": "ログインが必要です",
    "sessionExpired": "セッションの有効期限が切れました",
    "invalidCredentials": "メールアドレスまたはパスワードが正しくありません"
  },
  "system": {
    "serverError": "サーバーエラーが発生しました",
    "maintenance": "ただいまメンテナンス中です"
  }
}
```

```json
// locales/en/errors.json
{
  "validation": {
    "required": "{field} is required",
    "email": "Please enter a valid email address",
    "minLength": "{field} must be at least {min} characters",
    "maxLength": "{field} must be no more than {max} characters",
    "pattern": "{field} format is invalid"
  },
  "auth": {
    "loginRequired": "Please log in to continue",
    "sessionExpired": "Your session has expired",
    "invalidCredentials": "Invalid email or password"
  },
  "system": {
    "serverError": "A server error occurred",
    "maintenance": "Service is under maintenance"
  }
}
```

## i18nライブラリの活用

### i18next（推奨）

```typescript
import i18next from "i18next";

// 初期化
await i18next.init({
  lng: "ja",
  fallbackLng: "en",
  resources: {
    ja: {
      errors: require("./locales/ja/errors.json"),
    },
    en: {
      errors: require("./locales/en/errors.json"),
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

// 使用例
function translateError(key: string, params?: Record<string, unknown>): string {
  return i18next.t(`errors:${key}`, params);
}

// 例
translateError("validation.required", { field: "メールアドレス" });
// 日本語: "メールアドレスは必須です"
// 英語: "Email address is required"
```

### フィールド名の翻訳

```typescript
// フィールド名も翻訳する
const fieldLabels = {
  ja: {
    email: "メールアドレス",
    password: "パスワード",
    username: "ユーザー名",
    phone: "電話番号",
  },
  en: {
    email: "Email",
    password: "Password",
    username: "Username",
    phone: "Phone number",
  },
};

function getFieldLabel(field: string, locale: string): string {
  return fieldLabels[locale]?.[field] || field;
}

function translateValidationError(
  key: string,
  field: string,
  locale: string,
  params?: Record<string, unknown>,
): string {
  const fieldLabel = getFieldLabel(field, locale);
  return i18next.t(`errors:validation.${key}`, {
    lng: locale,
    field: fieldLabel,
    ...params,
  });
}
```

## 複数形の処理

### ICU MessageFormat

```typescript
import { createIntl, createIntlCache } from "@formatjs/intl";

const cache = createIntlCache();

const messages = {
  ja: {
    filesSelected: "{count}個のファイルが選択されています",
    itemsRemaining: "残り{count}件",
  },
  en: {
    filesSelected: "{count, plural, one {# file} other {# files}} selected",
    itemsRemaining: "{count, plural, one {# item} other {# items}} remaining",
  },
};

function createFormatter(locale: string) {
  return createIntl(
    {
      locale,
      messages: messages[locale],
    },
    cache,
  );
}

// 使用例
const intl = createFormatter("en");
intl.formatMessage({ id: "filesSelected" }, { count: 1 });
// "1 file selected"
intl.formatMessage({ id: "filesSelected" }, { count: 5 });
// "5 files selected"
```

### 日本語での数量表現

```typescript
// 日本語は複数形が少ないが、助数詞に注意
const jaCounters = {
  file: "個",
  person: "人",
  item: "件",
  page: "ページ",
  minute: "分",
};

function formatCount(count: number, type: keyof typeof jaCounters): string {
  const counter = jaCounters[type];
  return `${count}${counter}`;
}
```

## 文化的配慮

### 日付・時刻のフォーマット

```typescript
import { format, formatDistanceToNow } from "date-fns";
import { ja, enUS, zhCN } from "date-fns/locale";

const locales = { ja, en: enUS, zh: zhCN };

function formatDate(date: Date, locale: string, formatStr: string): string {
  return format(date, formatStr, { locale: locales[locale] });
}

// エラーメッセージでの使用
const errorMessages = {
  ja: {
    sessionExpired: "セッションの有効期限が切れました（{time}に期限切れ）",
    maintenanceUntil: "{endTime}までメンテナンス中です",
  },
  en: {
    sessionExpired: "Your session has expired (expired {time})",
    maintenanceUntil: "Under maintenance until {endTime}",
  },
};

function formatSessionExpiredError(expiredAt: Date, locale: string): string {
  const time = formatDistanceToNow(expiredAt, {
    locale: locales[locale],
    addSuffix: true,
  });
  // 日本語: "5分前"
  // 英語: "5 minutes ago"
  return errorMessages[locale].sessionExpired.replace("{time}", time);
}
```

### 敬語レベル（日本語）

```typescript
// 日本語の敬語レベル
type PolitenessLevel = "casual" | "polite" | "honorific";

const jaMessages: Record<PolitenessLevel, Record<string, string>> = {
  casual: {
    loginRequired: "ログインしてね",
    error: "エラーだよ",
  },
  polite: {
    loginRequired: "ログインしてください",
    error: "エラーが発生しました",
  },
  honorific: {
    loginRequired: "ログインをお願いいたします",
    error: "エラーが発生いたしました",
  },
};

// ビジネス向けはhonorific、一般向けはpolite
function getJapaneseMessage(
  key: string,
  level: PolitenessLevel = "polite",
): string {
  return jaMessages[level][key] || jaMessages["polite"][key];
}
```

## エラーコンポーネント

### React i18n対応エラー表示

```tsx
import { useTranslation } from "react-i18next";

interface ErrorMessageProps {
  errorKey: string;
  params?: Record<string, unknown>;
  className?: string;
}

function ErrorMessage({ errorKey, params, className }: ErrorMessageProps) {
  const { t } = useTranslation("errors");

  return (
    <div className={className} role="alert">
      {t(errorKey, params)}
    </div>
  );
}

// フィールドエラー用
interface FieldErrorProps {
  field: string;
  errorKey: string;
  params?: Record<string, unknown>;
}

function FieldError({ field, errorKey, params }: FieldErrorProps) {
  const { t } = useTranslation(["errors", "fields"]);

  const fieldLabel = t(`fields:${field}`);

  return (
    <span className="field-error" role="alert" aria-live="polite">
      {t(`errors:validation.${errorKey}`, { field: fieldLabel, ...params })}
    </span>
  );
}
```

### 言語切り替え時の即時反映

```tsx
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function useErrorMessages() {
  const { t, i18n } = useTranslation("errors");

  // 言語変更時にエラーメッセージを再評価
  useEffect(() => {
    // コンポーネントの再レンダリングをトリガー
  }, [i18n.language]);

  return {
    translate: (key: string, params?: Record<string, unknown>) =>
      t(key, params),
    currentLanguage: i18n.language,
  };
}
```

## バックエンドでのi18n

### Express.js with i18next

```typescript
import express from "express";
import i18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";

await i18next.init({
  preload: ["ja", "en"],
  fallbackLng: "en",
  resources: {
    // リソース設定
  },
});

const app = express();
app.use(i18nextMiddleware.handle(i18next));

// エラーハンドラー
app.use(
  (
    err: AppError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const t = req.t; // i18nextミドルウェアが追加

    res.status(err.httpStatus).json({
      code: err.code,
      message: t(`errors:${err.code}`),
      action: err.action ? t(`errors:actions.${err.code}`) : undefined,
    });
  },
);
```

### Accept-Languageヘッダーの処理

```typescript
function detectLanguage(acceptLanguage: string | undefined): string {
  if (!acceptLanguage) return "en";

  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, priority] = lang.trim().split(";q=");
      return {
        code: code.split("-")[0], // ja-JP → ja
        priority: priority ? parseFloat(priority) : 1.0,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  const supportedLanguages = ["ja", "en", "zh", "ko"];
  const detected = languages.find((l) => supportedLanguages.includes(l.code));

  return detected?.code || "en";
}
```

## テスト

```typescript
import { describe, it, expect } from "vitest";

describe("i18n error messages", () => {
  it("should translate validation errors in Japanese", () => {
    const message = translateError(
      "validation.required",
      { field: "メールアドレス" },
      "ja",
    );
    expect(message).toBe("メールアドレスは必須です");
  });

  it("should translate validation errors in English", () => {
    const message = translateError(
      "validation.required",
      { field: "Email" },
      "en",
    );
    expect(message).toBe("Email is required");
  });

  it("should fall back to English for unsupported languages", () => {
    const message = translateError(
      "validation.required",
      { field: "Email" },
      "fr",
    );
    expect(message).toBe("Email is required");
  });
});
```

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
