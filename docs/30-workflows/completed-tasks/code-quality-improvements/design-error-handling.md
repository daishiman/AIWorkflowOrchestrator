# T-01-3: エラーハンドリング設計書

## メタ情報

| 項目             | 内容                   |
| ---------------- | ---------------------- |
| タスクID         | T-01-3                 |
| タスク名         | エラーハンドリング設計 |
| 分類             | コード品質改善         |
| 対象機能         | 認証関連のエラー処理   |
| 優先度           | 必須                   |
| ステータス       | 完了                   |
| 作成日           | 2025-12-09             |
| 作成エージェント | @logic-dev             |

---

## 1. 設計概要

### 1.1 目的

Phase 0で定義された要件（T-00-3）に基づき、エラーハンドリングの詳細設計を行う。

### 1.2 設計方針

1. **統一されたエラー処理**: 共通ヘルパー関数で一貫性を確保
2. **ユーザーフレンドリー**: 日本語メッセージでユーザーに分かりやすく
3. **型安全**: `unknown`型を適切に処理
4. **拡張性**: 新しいエラー種別の追加が容易な構造

---

## 2. エラー種別設計

### 2.1 エラーコード定義

```typescript
/**
 * 認証関連のエラーコード
 *
 * 各コードの意味:
 * - `NETWORK_ERROR`: ネットワーク接続の問題
 * - `AUTH_FAILED`: 認証処理の失敗
 * - `TIMEOUT`: リクエストのタイムアウト
 * - `SESSION_EXPIRED`: セッション有効期限切れ
 * - `PROVIDER_ERROR`: OAuth プロバイダーとの通信エラー
 * - `PROFILE_UPDATE_FAILED`: プロフィール更新の失敗
 * - `LINK_PROVIDER_FAILED`: アカウント連携の失敗
 * - `UNKNOWN`: 未分類のエラー
 */
export type AuthErrorCode =
  | "NETWORK_ERROR"
  | "AUTH_FAILED"
  | "TIMEOUT"
  | "SESSION_EXPIRED"
  | "PROVIDER_ERROR"
  | "PROFILE_UPDATE_FAILED"
  | "LINK_PROVIDER_FAILED"
  | "UNKNOWN";
```

### 2.2 エラーメッセージマッピング

```typescript
/**
 * エラーコードから日本語メッセージへのマッピング
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  NETWORK_ERROR: "ネットワーク接続を確認してください",
  AUTH_FAILED: "認証に失敗しました。再度ログインしてください",
  TIMEOUT: "接続がタイムアウトしました。再試行してください",
  SESSION_EXPIRED: "セッションの有効期限が切れました。再度ログインしてください",
  PROVIDER_ERROR: "認証プロバイダーとの接続に失敗しました",
  PROFILE_UPDATE_FAILED: "プロフィールの更新に失敗しました",
  LINK_PROVIDER_FAILED: "アカウント連携に失敗しました",
  UNKNOWN: "予期しないエラーが発生しました",
};
```

### 2.3 エラー検出パターン

| エラーコード    | 検出パターン（message.toLowerCase()）              |
| --------------- | -------------------------------------------------- |
| NETWORK_ERROR   | `network`, `fetch`, `connection`, `offline`        |
| AUTH_FAILED     | `unauthorized`, `401`, `authentication`, `invalid` |
| TIMEOUT         | `timeout`, `etimedout`                             |
| SESSION_EXPIRED | `expired`, `session`                               |
| PROVIDER_ERROR  | `provider`, `oauth`                                |

---

## 3. ヘルパー関数設計

### 3.1 エラーコード判定関数

````typescript
/**
 * エラーメッセージからエラーコードを判定する
 *
 * @param message - エラーメッセージ（小文字化済み）
 * @returns 判定されたAuthErrorCode
 *
 * @example
 * ```typescript
 * const code = detectErrorCode("network failure");
 * // code: "NETWORK_ERROR"
 * ```
 */
const detectErrorCode = (message: string): AuthErrorCode => {
  const lowerMessage = message.toLowerCase();

  // ネットワークエラー
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("connection") ||
    lowerMessage.includes("offline")
  ) {
    return "NETWORK_ERROR";
  }

  // 認証エラー
  if (
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("401") ||
    lowerMessage.includes("authentication") ||
    lowerMessage.includes("invalid")
  ) {
    return "AUTH_FAILED";
  }

  // タイムアウト
  if (lowerMessage.includes("timeout") || lowerMessage.includes("etimedout")) {
    return "TIMEOUT";
  }

  // セッション期限切れ
  if (lowerMessage.includes("expired") || lowerMessage.includes("session")) {
    return "SESSION_EXPIRED";
  }

  // プロバイダーエラー
  if (lowerMessage.includes("provider") || lowerMessage.includes("oauth")) {
    return "PROVIDER_ERROR";
  }

  // デフォルト
  return "UNKNOWN";
};
````

### 3.2 メインヘルパー関数

````typescript
/**
 * 認証エラーを日本語メッセージに変換する
 *
 * @param error - キャッチされたエラー（unknown型）
 * @param fallbackCode - Errorインスタンスでない場合のフォールバックコード
 * @returns ユーザー向け日本語エラーメッセージ
 *
 * @example
 * ```typescript
 * try {
 *   await login(provider);
 * } catch (error) {
 *   const message = handleAuthError(error);
 *   // message: "ネットワーク接続を確認してください"
 * }
 * ```
 */
export const handleAuthError = (
  error: unknown,
  fallbackCode: AuthErrorCode = "UNKNOWN",
): string => {
  // Errorインスタンスでない場合
  if (!(error instanceof Error)) {
    console.warn("[AuthError] Non-Error object caught:", error);
    return AUTH_ERROR_MESSAGES[fallbackCode];
  }

  // エラーコードを判定
  const errorCode = detectErrorCode(error.message);

  // ログ出力（デバッグ用）
  console.error(`[AuthError] ${errorCode}:`, error.message);

  // 日本語メッセージを返す
  return AUTH_ERROR_MESSAGES[errorCode];
};
````

### 3.3 コンテキスト付きエラーハンドラー

````typescript
/**
 * 特定のコンテキスト用エラーハンドラーを生成する
 *
 * @param context - エラーのコンテキスト（関数名等）
 * @param defaultCode - デフォルトのエラーコード
 * @returns handleAuthError関数のラッパー
 *
 * @example
 * ```typescript
 * const handleProfileError = createContextHandler("updateProfile", "PROFILE_UPDATE_FAILED");
 *
 * try {
 *   await updateProfile(data);
 * } catch (error) {
 *   const message = handleProfileError(error);
 * }
 * ```
 */
export const createContextHandler = (
  context: string,
  defaultCode: AuthErrorCode,
) => {
  return (error: unknown): string => {
    console.error(`[${context}] Error:`, error);
    return handleAuthError(error, defaultCode);
  };
};
````

---

## 4. authSlice適用設計

### 4.1 login関数

```typescript
// Before
set({
  isLoading: false,
  authError: error instanceof Error ? error.message : "ログインに失敗しました",
});

// After
set({
  isLoading: false,
  authError: handleAuthError(error),
});
```

### 4.2 logout関数

```typescript
// Before
console.error("[AuthSlice] Logout error:", error);
get().clearAuth();
// ユーザーへのエラー表示なし

// After
console.error("[AuthSlice] Logout error:", error);
set({ authError: handleAuthError(error) });
get().clearAuth();
```

### 4.3 initializeAuth関数

```typescript
// Before
set({
  isLoading: false,
  authError:
    error instanceof Error ? error.message : "認証の初期化に失敗しました",
});

// After
set({
  isLoading: false,
  authError: handleAuthError(error),
});
```

### 4.4 updateProfile関数

```typescript
// Before
set({
  isLoading: false,
  authError:
    error instanceof Error ? error.message : "プロフィールの更新に失敗しました",
});

// After
const handleProfileError = createContextHandler(
  "updateProfile",
  "PROFILE_UPDATE_FAILED",
);
set({
  isLoading: false,
  authError: handleProfileError(error),
});
```

### 4.5 linkProvider関数

```typescript
// Before
set({
  isLoading: false,
  authError:
    error instanceof Error ? error.message : "アカウント連携に失敗しました",
});

// After
const handleLinkError = createContextHandler(
  "linkProvider",
  "LINK_PROVIDER_FAILED",
);
set({
  isLoading: false,
  authError: handleLinkError(error),
});
```

---

## 5. ファイル構成

### 5.1 新規ファイル

```
apps/desktop/src/renderer/store/slices/
├── authSlice.ts                 # 既存（修正）
└── authSlice/
    └── errorHandler.ts          # 新規作成
```

### 5.2 errorHandler.ts の内容

```typescript
// apps/desktop/src/renderer/store/slices/authSlice/errorHandler.ts

/**
 * 認証関連のエラーハンドリングユーティリティ
 *
 * @module authSlice/errorHandler
 */

export type AuthErrorCode = ...;
export const AUTH_ERROR_MESSAGES = ...;
const detectErrorCode = ...;
export const handleAuthError = ...;
export const createContextHandler = ...;
```

### 5.3 エクスポート

```typescript
// authSlice.ts
import {
  handleAuthError,
  createContextHandler,
} from "./authSlice/errorHandler";
```

---

## 6. 完了条件

- [x] エラーコード体系が設計されている
- [x] エラーメッセージマッピングが定義されている
- [x] handleAuthError関数が設計されている
- [x] 5つの対象関数への適用方法が設計されている
- [x] ファイル構成が定義されている

---

## 7. 関連ドキュメント

- 要件定義: `docs/30-workflows/code-quality-improvements/requirements-error-handling.md`
- 型定義設計: `docs/30-workflows/code-quality-improvements/design-type-definitions.md`
- テスト設計: Phase 2で作成予定
