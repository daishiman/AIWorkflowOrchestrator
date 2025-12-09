# 認証Zodスキーマ設計書

## 概要

| 項目           | 内容                            |
| -------------- | ------------------------------- |
| ドキュメントID | DES-SCHEMA                      |
| 対象タスク     | T-01-2: Zodスキーマ設計         |
| 作成日         | 2025-12-09                      |
| ステータス     | 完了                            |
| 要件定義書     | spec-validation-requirements.md |

## 設計目的

認証関連の入力バリデーションを型安全かつ一元管理するため、Zodスキーマを設計する。これにより、ランタイムバリデーションと静的型チェックの両方を実現する。

## 現状のコード構造

```typescript
// packages/shared/types/auth.ts
export type OAuthProvider = "google" | "github" | "discord";

export function isValidProvider(provider: unknown): provider is OAuthProvider {
  return (
    typeof provider === "string" &&
    ["google", "github", "discord"].includes(provider)
  );
}

export function validateDisplayName(
  name: string,
): { valid: true } | { valid: false; message: string } {
  // 文字数チェックのみ
}
```

### 問題点

1. 型とバリデーション関数が分離している
2. Zodスキーマによる型推論が活用されていない
3. エラーメッセージが英語のみ
4. displayNameの文字種制限がない（XSS対策不足）

## ファイル構成

```
packages/shared/
├── schemas/
│   ├── index.ts              # エクスポート
│   ├── auth.ts               # 認証スキーマ
│   └── auth.test.ts          # テストファイル
└── types/
    └── auth.ts               # Zodから型を再エクスポート（後方互換性）
```

## スキーマ定義

### OAuthプロバイダースキーマ

````typescript
// packages/shared/schemas/auth.ts
import { z } from "zod";

/**
 * サポートするOAuthプロバイダーの定数
 */
export const VALID_PROVIDERS = ["google", "github", "discord"] as const;

/**
 * OAuthプロバイダースキーマ
 *
 * @example
 * ```typescript
 * oauthProviderSchema.parse("google"); // "google"
 * oauthProviderSchema.parse("facebook"); // ZodError
 * ```
 */
export const oauthProviderSchema = z.enum(VALID_PROVIDERS, {
  errorMap: () => ({
    message:
      "無効な認証プロバイダーです。google, github, discord のいずれかを指定してください",
  }),
});

/**
 * Zodから推論されるOAuthProvider型
 */
export type OAuthProvider = z.infer<typeof oauthProviderSchema>;
````

### displayNameスキーマ

````typescript
/**
 * displayNameの制約定数
 */
export const DISPLAY_NAME_CONSTRAINTS = {
  minLength: 1,
  maxLength: 50,
  // 許可文字: 英数字、ひらがな、カタカナ、漢字、スペース、ハイフン、アンダースコア
  pattern: /^[a-zA-Z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\s\-_]+$/,
} as const;

/**
 * displayNameエラーメッセージ
 */
export const DISPLAY_NAME_ERRORS = {
  required: "表示名は必須です",
  tooShort: "表示名を入力してください",
  tooLong: "表示名は50文字以内で入力してください",
  invalidChars:
    "使用できない文字が含まれています。英数字、日本語、スペース、ハイフン、アンダースコアのみ使用可能です",
} as const;

/**
 * displayNameスキーマ
 *
 * @example
 * ```typescript
 * displayNameSchema.parse("田中太郎"); // "田中太郎"
 * displayNameSchema.parse("<script>"); // ZodError: 使用できない文字
 * displayNameSchema.parse(""); // ZodError: 表示名は必須です
 * ```
 */
export const displayNameSchema = z
  .string({
    required_error: DISPLAY_NAME_ERRORS.required,
    invalid_type_error: DISPLAY_NAME_ERRORS.required,
  })
  .min(DISPLAY_NAME_CONSTRAINTS.minLength, {
    message: DISPLAY_NAME_ERRORS.tooShort,
  })
  .max(DISPLAY_NAME_CONSTRAINTS.maxLength, {
    message: DISPLAY_NAME_ERRORS.tooLong,
  })
  .regex(DISPLAY_NAME_CONSTRAINTS.pattern, {
    message: DISPLAY_NAME_ERRORS.invalidChars,
  });

/**
 * Zodから推論されるDisplayName型
 */
export type DisplayName = z.infer<typeof displayNameSchema>;
````

### avatarUrlスキーマ

````typescript
/**
 * avatarUrlエラーメッセージ
 */
export const AVATAR_URL_ERRORS = {
  invalidFormat: "無効なURL形式です",
  httpsRequired: "アバターURLはHTTPSである必要があります",
} as const;

/**
 * avatarUrlスキーマ（nullable）
 *
 * @example
 * ```typescript
 * avatarUrlSchema.parse("https://example.com/avatar.png"); // OK
 * avatarUrlSchema.parse(null); // OK
 * avatarUrlSchema.parse("http://example.com/avatar.png"); // ZodError: HTTPS必須
 * ```
 */
export const avatarUrlSchema = z
  .string()
  .url({ message: AVATAR_URL_ERRORS.invalidFormat })
  .refine((url) => url.startsWith("https://"), {
    message: AVATAR_URL_ERRORS.httpsRequired,
  })
  .nullable();

/**
 * Zodから推論されるAvatarUrl型
 */
export type AvatarUrl = z.infer<typeof avatarUrlSchema>;
````

### プロフィール更新スキーマ

````typescript
/**
 * プロフィール更新スキーマ
 *
 * @example
 * ```typescript
 * updateProfileSchema.parse({ displayName: "新しい名前" }); // OK
 * updateProfileSchema.parse({}); // OK (空のオブジェクトは許可)
 * updateProfileSchema.parse({ displayName: "<script>" }); // ZodError
 * ```
 */
export const updateProfileSchema = z.object({
  displayName: displayNameSchema.optional(),
  avatarUrl: avatarUrlSchema.optional(),
});

/**
 * Zodから推論されるUpdateProfileInput型
 */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
````

### IPC引数スキーマ

```typescript
/**
 * ログインIPC引数スキーマ
 */
export const loginArgsSchema = z.object({
  provider: oauthProviderSchema,
});

/**
 * Zodから推論されるLoginArgs型
 */
export type LoginArgs = z.infer<typeof loginArgsSchema>;

/**
 * プロフィール更新IPC引数スキーマ
 */
export const updateProfileArgsSchema = z.object({
  updates: updateProfileSchema,
});

/**
 * Zodから推論されるUpdateProfileArgs型
 */
export type UpdateProfileArgs = z.infer<typeof updateProfileArgsSchema>;

/**
 * プロバイダー連携IPC引数スキーマ
 */
export const linkProviderArgsSchema = z.object({
  provider: oauthProviderSchema,
});

/**
 * Zodから推論されるLinkProviderArgs型
 */
export type LinkProviderArgs = z.infer<typeof linkProviderArgsSchema>;
```

## ユーティリティ関数

```typescript
/**
 * Zodスキーマによるバリデーション結果型
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 安全なバリデーション実行
 * parseの例外をキャッチしてResultオブジェクトを返す
 *
 * @param schema - Zodスキーマ
 * @param data - バリデーション対象データ
 * @returns ValidationResult
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // 最初のエラーメッセージを返す
  const firstError = result.error.errors[0];
  return {
    success: false,
    error: firstError?.message ?? "バリデーションエラー",
  };
}

/**
 * OAuthプロバイダーの検証（後方互換性）
 *
 * @deprecated oauthProviderSchema.safeParse() を使用してください
 */
export function isValidProvider(provider: unknown): provider is OAuthProvider {
  return oauthProviderSchema.safeParse(provider).success;
}
```

## エクスポート構造

```typescript
// packages/shared/schemas/index.ts

// === スキーマ ===
export {
  oauthProviderSchema,
  displayNameSchema,
  avatarUrlSchema,
  updateProfileSchema,
  loginArgsSchema,
  updateProfileArgsSchema,
  linkProviderArgsSchema,
} from "./auth.js";

// === 型 ===
export type {
  OAuthProvider,
  DisplayName,
  AvatarUrl,
  UpdateProfileInput,
  LoginArgs,
  UpdateProfileArgs,
  LinkProviderArgs,
  ValidationResult,
} from "./auth.js";

// === 定数 ===
export {
  VALID_PROVIDERS,
  DISPLAY_NAME_CONSTRAINTS,
  DISPLAY_NAME_ERRORS,
  AVATAR_URL_ERRORS,
} from "./auth.js";

// === ユーティリティ ===
export { safeValidate, isValidProvider } from "./auth.js";
```

### types/auth.ts の後方互換性

```typescript
// packages/shared/types/auth.ts

// スキーマから型を再エクスポート（後方互換性維持）
export type { OAuthProvider } from "../schemas/auth.js";
export { isValidProvider, VALID_PROVIDERS } from "../schemas/auth.js";

// 既存の型定義は維持（AuthUser, AuthSession等）
export interface AuthUser {
  // ... 既存定義
}
```

## 使用例

### Renderer Process (React)

```typescript
// apps/desktop/src/renderer/components/ProfileForm.tsx
import { displayNameSchema, safeValidate } from "@repo/shared/schemas";
import { useState } from "react";

export function ProfileForm() {
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const result = safeValidate(displayNameSchema, displayName);

    if (!result.success) {
      setError(result.error ?? null);
      return;
    }

    // IPC呼び出し
    window.electronAPI.profile.update({
      updates: { displayName: result.data },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={displayName}
        onChange={(e) => {
          setDisplayName(e.target.value);
          setError(null);
        }}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">更新</button>
    </form>
  );
}
```

### Main Process (IPC Handler)

```typescript
// apps/desktop/src/main/ipc/profileHandlers.ts
import { updateProfileArgsSchema, safeValidate } from "@repo/shared/schemas";
import { PROFILE_ERROR_CODES, type IPCResponse } from "@repo/shared/types";

ipcMain.handle(
  IPC_CHANNELS.PROFILE_UPDATE,
  async (event, args): Promise<IPCResponse<UserProfile>> => {
    // 二重バリデーション
    const validation = safeValidate(updateProfileArgsSchema, args);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: PROFILE_ERROR_CODES.VALIDATION_FAILED,
          message: validation.error ?? "バリデーションエラー",
        },
      };
    }

    // バリデーション通過後の処理
    const { updates } = validation.data;
    // ...
  },
);
```

## テスト戦略

### テストケース

| テストID | シナリオ                                     | 期待結果                  |
| -------- | -------------------------------------------- | ------------------------- |
| SCH-T01  | 有効なOAuthプロバイダー（google）            | バリデーション通過        |
| SCH-T02  | 有効なOAuthプロバイダー（github）            | バリデーション通過        |
| SCH-T03  | 有効なOAuthプロバイダー（discord）           | バリデーション通過        |
| SCH-T04  | 無効なOAuthプロバイダー（facebook）          | ZodError発生              |
| SCH-T05  | 有効なdisplayName（英字）                    | バリデーション通過        |
| SCH-T06  | 有効なdisplayName（日本語）                  | バリデーション通過        |
| SCH-T07  | 有効なdisplayName（混在）                    | バリデーション通過        |
| SCH-T08  | 空のdisplayName                              | `表示名は必須です` エラー |
| SCH-T09  | 51文字以上のdisplayName                      | `50文字以内で` エラー     |
| SCH-T10  | 特殊文字を含むdisplayName（`<script>`）      | `使用できない文字` エラー |
| SCH-T11  | 特殊文字を含むdisplayName（`'; DROP TABLE`） | `使用できない文字` エラー |
| SCH-T12  | HTTPS avatarUrl                              | バリデーション通過        |
| SCH-T13  | HTTP avatarUrl                               | `HTTPS必須` エラー        |
| SCH-T14  | null avatarUrl                               | バリデーション通過        |
| SCH-T15  | 不正形式のavatarUrl                          | `無効なURL形式` エラー    |

### テストコード例

```typescript
// packages/shared/schemas/auth.test.ts
import { describe, it, expect } from "vitest";
import {
  oauthProviderSchema,
  displayNameSchema,
  avatarUrlSchema,
  updateProfileSchema,
  loginArgsSchema,
  safeValidate,
  DISPLAY_NAME_ERRORS,
} from "./auth";

describe("oauthProviderSchema", () => {
  it.each(["google", "github", "discord"])(
    "有効なプロバイダー: %s",
    (provider) => {
      expect(oauthProviderSchema.safeParse(provider).success).toBe(true);
    },
  );

  it.each(["facebook", "twitter", "apple", "", null, undefined])(
    "無効なプロバイダー: %s",
    (provider) => {
      expect(oauthProviderSchema.safeParse(provider).success).toBe(false);
    },
  );

  it("エラーメッセージが日本語である", () => {
    const result = oauthProviderSchema.safeParse("invalid");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain(
        "無効な認証プロバイダー",
      );
    }
  });
});

describe("displayNameSchema", () => {
  describe("有効なケース", () => {
    it.each([
      "John",
      "田中太郎",
      "user_123",
      "Test-User",
      "ユーザー テスト",
      "A",
      "a".repeat(50),
    ])("有効なdisplayName: %s", (name) => {
      expect(displayNameSchema.safeParse(name).success).toBe(true);
    });
  });

  describe("無効なケース", () => {
    it("空文字列", () => {
      const result = displayNameSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("51文字以上", () => {
      const result = displayNameSchema.safeParse("a".repeat(51));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe(
          DISPLAY_NAME_ERRORS.tooLong,
        );
      }
    });

    it.each([
      ["<script>alert('xss')</script>", "XSSタグ"],
      ["'; DROP TABLE users;--", "SQLインジェクション"],
      ["test@example.com", "@記号"],
      ["user!name", "!記号"],
      ["test{name}", "波括弧"],
    ])("特殊文字を含む: %s (%s)", (name) => {
      const result = displayNameSchema.safeParse(name);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe(
          DISPLAY_NAME_ERRORS.invalidChars,
        );
      }
    });
  });
});

describe("avatarUrlSchema", () => {
  it("HTTPSのURLは許可", () => {
    const result = avatarUrlSchema.safeParse("https://example.com/avatar.png");
    expect(result.success).toBe(true);
  });

  it("nullは許可", () => {
    const result = avatarUrlSchema.safeParse(null);
    expect(result.success).toBe(true);
  });

  it("HTTPは拒否", () => {
    const result = avatarUrlSchema.safeParse("http://example.com/avatar.png");
    expect(result.success).toBe(false);
  });

  it("不正なURL形式は拒否", () => {
    const result = avatarUrlSchema.safeParse("not-a-url");
    expect(result.success).toBe(false);
  });
});

describe("safeValidate", () => {
  it("成功時はdataを返す", () => {
    const result = safeValidate(displayNameSchema, "Valid Name");
    expect(result.success).toBe(true);
    expect(result.data).toBe("Valid Name");
  });

  it("失敗時はerrorを返す", () => {
    const result = safeValidate(displayNameSchema, "");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

## セキュリティ考慮事項

### XSS対策

| 入力                         | 処理                        |
| ---------------------------- | --------------------------- |
| `<script>` タグ              | displayNameのパターンで拒否 |
| `javascript:` プロトコル     | avatarUrlのHTTPS要件で拒否  |
| HTMLエンティティ（`&lt;`等） | displayNameのパターンで拒否 |

### SQLインジェクション対策

| 入力                 | 処理                        |
| -------------------- | --------------------------- |
| シングルクォート `'` | displayNameのパターンで拒否 |
| セミコロン `;`       | displayNameのパターンで拒否 |
| コメント `--`        | displayNameのパターンで拒否 |

### ReDoS対策

- 使用する正規表現は単純な文字クラスのみ
- バックトラッキングが発生しないパターンを採用
- `^` と `$` アンカーで全体マッチ

## 完了条件

- [x] スキーマファイル構成が定義されている
- [x] 各スキーマの定義が記述されている
- [x] 型エクスポートが設計されている
- [x] エラーメッセージのカスタマイズが設計されている

## 関連ドキュメント

- `docs/30-workflows/login-only-auth/spec-validation-requirements.md` - バリデーション要件定義
- `packages/shared/types/auth.ts` - 既存の型定義
- [Zod Documentation](https://zod.dev/)
