# 入力バリデーション要件定義書

## 概要

| 項目           | 内容                               |
| -------------- | ---------------------------------- |
| ドキュメントID | SEC-VAL                            |
| 対象タスク     | T-00-2: 入力バリデーション要件定義 |
| 作成日         | 2025-12-09                         |
| ステータス     | 完了                               |

## 目的

認証関連の入力値バリデーション要件を明文化し、Zodスキーマによる体系的なバリデーションを実装するための仕様を定義する。これにより、不正入力によるセキュリティリスク（インジェクション攻撃、バッファオーバーフロー等）を軽減する。

## 現状分析

### 既存実装の確認

現在の認証関連バリデーションは以下のファイルに分散：

**`@repo/shared/types/auth.ts`**

```typescript
export const VALID_PROVIDERS = ["google", "github", "discord"] as const;

export function isValidProvider(provider: string): provider is OAuthProvider {
  return VALID_PROVIDERS.includes(provider as OAuthProvider);
}
```

**`apps/desktop/src/main/ipc/authHandlers.ts`**

```typescript
// プロバイダーバリデーション
if (!isValidProvider(provider)) {
  return {
    success: false,
    error: {
      code: AUTH_ERROR_CODES.INVALID_PROVIDER,
      message: `Invalid provider: ${provider}. Must be one of: google, github, discord`,
    },
  };
}
```

### 問題点

| ID      | 問題                                          | リスク                                  |
| ------- | --------------------------------------------- | --------------------------------------- |
| VAL-P01 | displayName入力のバリデーションがない         | 悪意のある文字列（XSS、SQLi）が通過可能 |
| VAL-P02 | Zodスキーマによる型安全なバリデーションがない | 実行時エラーの検出が遅延                |
| VAL-P03 | IPC引数の体系的なバリデーションがない         | 不正な引数によるエラー                  |
| VAL-P04 | エラーメッセージが日本語化されていない        | ユーザー体験の低下                      |

## 機能要件

### 必須要件

| ID         | 要件                               | 優先度 | 根拠                             |
| ---------- | ---------------------------------- | ------ | -------------------------------- |
| SEC-VAL-01 | OAuthプロバイダーのZodスキーマ定義 | 必須   | 型安全な列挙型検証               |
| SEC-VAL-02 | displayNameのZodスキーマ定義       | 必須   | 文字数制限、許可文字制限         |
| SEC-VAL-03 | updateProfileのZodスキーマ定義     | 必須   | プロファイル更新入力の検証       |
| SEC-VAL-04 | 日本語エラーメッセージの定義       | 必須   | ユーザーフレンドリーなエラー表示 |

### 推奨要件

| ID         | 要件                                 | 優先度 | 根拠                         |
| ---------- | ------------------------------------ | ------ | ---------------------------- |
| SEC-VAL-05 | Main Process側での二重バリデーション | 推奨   | 深層防御（Defense in Depth） |
| SEC-VAL-06 | バリデーションエラーのログ出力       | 推奨   | 不正入力の検出・監視         |

## スキーマ仕様

### OAuthプロバイダースキーマ

| 項目             | 仕様                                      |
| ---------------- | ----------------------------------------- |
| スキーマ名       | `oauthProviderSchema`                     |
| 型               | `z.enum(["google", "github", "discord"])` |
| 許可値           | `google`, `github`, `discord`             |
| エラーメッセージ | `無効な認証プロバイダーです`              |

### displayNameスキーマ

| 項目       | 仕様                                                                 |
| ---------- | -------------------------------------------------------------------- |
| スキーマ名 | `displayNameSchema`                                                  |
| 型         | `z.string()`                                                         |
| 最小文字数 | 1文字                                                                |
| 最大文字数 | 50文字                                                               |
| 許可文字   | 英数字（a-z, A-Z, 0-9）、ひらがな、カタカナ、漢字、スペース          |
| 禁止文字   | 特殊文字（`<`, `>`, `&`, `"`, `'`, `/`, `\`, `{`, `}`, `[`, `]` 等） |
| 正規表現   | `/^[a-zA-Z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\s]+$/`          |

### displayNameエラーメッセージ

| 条件       | エラーメッセージ                       |
| ---------- | -------------------------------------- |
| 空文字     | `表示名は必須です`                     |
| 文字数超過 | `表示名は50文字以内で入力してください` |
| 不正文字   | `使用できない文字が含まれています`     |

### updateProfileスキーマ

| 項目       | 仕様                           |
| ---------- | ------------------------------ |
| スキーマ名 | `updateProfileSchema`          |
| フィールド | `displayName` (optional)       |
| 検証       | `displayNameSchema.optional()` |

### IPC引数スキーマ

#### loginArgsSchema

| 項目       | 仕様                            |
| ---------- | ------------------------------- |
| スキーマ名 | `loginArgsSchema`               |
| フィールド | `provider: oauthProviderSchema` |

#### updateProfileArgsSchema

| 項目       | 仕様                           |
| ---------- | ------------------------------ |
| スキーマ名 | `updateProfileArgsSchema`      |
| フィールド | `updates: updateProfileSchema` |

#### linkProviderArgsSchema

| 項目       | 仕様                            |
| ---------- | ------------------------------- |
| スキーマ名 | `linkProviderArgsSchema`        |
| フィールド | `provider: oauthProviderSchema` |

## 型エクスポート仕様

```typescript
// Zodスキーマから推論される型
export type OAuthProvider = z.infer<typeof oauthProviderSchema>;
export type DisplayName = z.infer<typeof displayNameSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type LoginArgs = z.infer<typeof loginArgsSchema>;
export type UpdateProfileArgs = z.infer<typeof updateProfileArgsSchema>;
export type LinkProviderArgs = z.infer<typeof linkProviderArgsSchema>;
```

## バリデーションフロー

### Renderer Process（フロントエンド）

1. ユーザー入力を受け取る
2. Zodスキーマで即時バリデーション
3. バリデーションエラーがあれば UI にエラー表示
4. バリデーション通過後、IPC 経由で Main Process へ送信

### Main Process（バックエンド）

1. IPC経由で引数を受け取る
2. Zodスキーマで再度バリデーション（二重チェック）
3. バリデーションエラーがあれば IPCResponse でエラー返却
4. バリデーション通過後、Supabase API を呼び出し

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   User Input    │ ──── │ Renderer Process │ ──── │  Main Process   │
│                 │      │ (Zod Validation) │      │ (Zod Validation)│
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                │                         │
                                ▼                         ▼
                         エラー → UI表示           エラー → IPC返却
                         成功 → IPC送信            成功 → API呼び出し
```

## テスト要件

### 機能テスト

| テストID | シナリオ                                     | 期待結果                  |
| -------- | -------------------------------------------- | ------------------------- |
| VAL-T01  | 有効なOAuthプロバイダー（google）            | バリデーション通過        |
| VAL-T02  | 有効なOAuthプロバイダー（github）            | バリデーション通過        |
| VAL-T03  | 有効なOAuthプロバイダー（discord）           | バリデーション通過        |
| VAL-T04  | 無効なOAuthプロバイダー（facebook）          | ZodError発生              |
| VAL-T05  | 有効なdisplayName（英字）                    | バリデーション通過        |
| VAL-T06  | 有効なdisplayName（日本語）                  | バリデーション通過        |
| VAL-T07  | 有効なdisplayName（混在）                    | バリデーション通過        |
| VAL-T08  | 空のdisplayName                              | `表示名は必須です` エラー |
| VAL-T09  | 51文字以上のdisplayName                      | `50文字以内で` エラー     |
| VAL-T10  | 特殊文字を含むdisplayName（`<script>`）      | `使用できない文字` エラー |
| VAL-T11  | 特殊文字を含むdisplayName（`'; DROP TABLE`） | `使用できない文字` エラー |

### 境界値テスト

| テストID | シナリオ            | 期待結果           |
| -------- | ------------------- | ------------------ |
| VAL-B01  | 1文字のdisplayName  | バリデーション通過 |
| VAL-B02  | 50文字のdisplayName | バリデーション通過 |
| VAL-B03  | 51文字のdisplayName | エラー             |

## セキュリティ考慮事項

### XSS対策

- `displayName` に `<script>` タグ等のHTML要素を禁止
- 正規表現で許可文字を制限

### SQLインジェクション対策

- シングルクォート、セミコロン等のSQL構文を禁止
- Supabase側でもパラメータ化クエリを使用（二重防御）

### ReDoS対策

- 正規表現はシンプルな文字クラスのみ使用
- バックトラッキングが発生しないパターンを採用

## 完了条件

- [x] OAuthプロバイダーのバリデーション要件が定義されている
- [x] displayNameのバリデーション要件（文字数、許可文字）が定義されている
- [x] IPC引数のバリデーション要件が定義されている
- [x] エラーメッセージ形式が定義されている
- [x] テスト要件が定義されている

## 関連ドキュメント

- `packages/shared/src/types/auth.ts`
- `apps/desktop/src/main/ipc/authHandlers.ts`
- `apps/desktop/src/main/ipc/profileHandlers.ts`
- [Zod Documentation](https://zod.dev/)
