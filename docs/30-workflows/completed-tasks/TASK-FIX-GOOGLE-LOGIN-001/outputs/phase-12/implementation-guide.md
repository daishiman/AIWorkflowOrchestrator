# Phase 12: 実装ガイド

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-FIX-GOOGLE-LOGIN-001 |
| Phase      | 12                        |
| 作成日     | 2026-02-05                |
| ステータス | 完了                      |

---

## 概要

このドキュメントは、Googleログイン機能の修正内容と、将来の開発者への実装ガイドを提供します。

---

## 問題と解決策サマリー

### Problem 1: OAuth認証コールバックのerrorパラメータ未検出

**症状**: ユーザーがGoogleログインをキャンセルした際、アプリが無応答になる。

**原因**: `handleAuthCallback` 関数が OAuth の `error` パラメータをチェックしていなかった。

**解決策**: `parseOAuthError` 関数を作成し、コールバックURL のエラーパラメータを検出。

```typescript
// apps/desktop/src/main/auth/oauth-error-handler.ts
export function parseOAuthError(url: string): OAuthError | null {
  const hashParams = new URLSearchParams(url.substring(hashIndex + 1));
  const error = hashParams.get("error");
  if (!error) return null;
  return { error, errorDescription: hashParams.get("error_description") };
}
```

### Problem 2: Supabase設定検証の不整合

**症状**: Supabase 未設定時のエラーメッセージが一貫しない。

**原因**: `AUTH_NOT_CONFIGURED` エラーコードが未定義。

**解決策**: `AUTH_ERROR_CODES` に定数を追加。

```typescript
// packages/shared/types/auth.ts
export const AUTH_ERROR_CODES = {
  // ...既存コード
  AUTH_NOT_CONFIGURED: "auth/not-configured",
  // ...OAuthエラーコード
} as const;
```

### Problem 3: セッション管理の不備

**症状**: リフレッシュトークンの期限情報が Renderer に送信されない。

**原因**: `AuthSession` 型に `refreshTokenExpiresAt` フィールドがない。

**解決策**: 型を拡張し、計算関数を追加。

```typescript
// packages/shared/types/auth.ts
export interface AuthSession {
  // ...既存フィールド
  refreshTokenExpiresAt?: number;
}

// apps/desktop/src/main/auth/oauth-error-handler.ts
export function calculateRefreshTokenExpiry(sessionCreatedAt: number): number {
  return sessionCreatedAt + 604800; // 7日間
}
```

### Problem 4: 認証状態リスナーの不安定性

**症状**: `initializeAuth` が複数回呼ばれると、リスナーが重複登録される。

**原因**: リスナー登録状態を追跡するフラグがない。

**解決策**: モジュールスコープのフラグと `waitForSession` 関数を追加。

```typescript
// apps/desktop/src/renderer/store/slices/authSlice.ts
let authListenerRegistered = false;

// initializeAuth 内
if (window.electronAPI.auth.onAuthStateChanged && !authListenerRegistered) {
  authListenerRegistered = true;
  // ...リスナー登録
}
```

---

## API リファレンス

### parseOAuthError

```typescript
function parseOAuthError(url: string): OAuthError | null;
```

OAuth コールバック URL からエラーパラメータを抽出します。

**パラメータ**:

- `url`: OAuth コールバック URL

**戻り値**:

- `OAuthError`: エラー情報（エラーがある場合）
- `null`: エラーがない場合

### mapOAuthErrorToMessage

```typescript
function mapOAuthErrorToMessage(errorCode: string): MappedError;
```

OAuth エラーコードを日本語メッセージにマッピングします。

**パラメータ**:

- `errorCode`: OAuth エラーコード（例: "access_denied"）

**戻り値**:

- `MappedError`: `{ code: string, message: string }`

### calculateRefreshTokenExpiry

```typescript
function calculateRefreshTokenExpiry(sessionCreatedAt: number): number;
```

リフレッシュトークンの有効期限を計算します。

**パラメータ**:

- `sessionCreatedAt`: セッション作成時刻（Unix timestamp in seconds）

**戻り値**:

- 有効期限（Unix timestamp in seconds）

### waitForSession

```typescript
function waitForSession(
  pollInterval?: number,
  timeout?: number,
): Promise<unknown | null>;
```

セッション取得をポーリングベースで待機します。

**パラメータ**:

- `pollInterval`: ポーリング間隔（デフォルト: 100ms）
- `timeout`: 最大待機時間（デフォルト: 5000ms）

**戻り値**:

- セッションデータ、またはタイムアウト時は `null`

---

## 新しいエラーコード

| コード                            | 値                                     | 説明                           |
| --------------------------------- | -------------------------------------- | ------------------------------ |
| `AUTH_NOT_CONFIGURED`             | `auth/not-configured`                  | Supabase が設定されていない    |
| `OAUTH_ACCESS_DENIED`             | `auth/oauth-access-denied`             | ユーザーが認証をキャンセル     |
| `OAUTH_SERVER_ERROR`              | `auth/oauth-server-error`              | 認証サーバーエラー             |
| `OAUTH_TEMPORARILY_UNAVAILABLE`   | `auth/oauth-temporarily-unavailable`   | 認証サーバー一時利用不可       |
| `OAUTH_INVALID_REQUEST`           | `auth/oauth-invalid-request`           | 認証リクエストが不正           |
| `OAUTH_UNAUTHORIZED_CLIENT`       | `auth/oauth-unauthorized-client`       | クライアントが許可されていない |
| `OAUTH_UNSUPPORTED_RESPONSE_TYPE` | `auth/oauth-unsupported-response-type` | サポートされていない認証タイプ |
| `OAUTH_INVALID_SCOPE`             | `auth/oauth-invalid-scope`             | 無効な認証スコープ             |
| `OAUTH_UNKNOWN_ERROR`             | `auth/oauth-unknown-error`             | 未知の認証エラー               |

---

## 変更ファイル一覧

| ファイル                                              | 変更内容                |
| ----------------------------------------------------- | ----------------------- |
| `packages/shared/types/auth.ts`                       | 型・定数の追加          |
| `apps/desktop/src/main/auth/oauth-error-handler.ts`   | 新規作成                |
| `apps/desktop/src/main/index.ts`                      | handleAuthCallback 修正 |
| `apps/desktop/src/renderer/store/slices/authSlice.ts` | リスナー管理改善        |

---

## テストファイル一覧

| ファイル                                                                      | テスト内容               |
| ----------------------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/main/__tests__/auth-callback.test.ts`                       | OAuth エラーハンドリング |
| `apps/desktop/src/main/__tests__/auth-callback.edge-cases.test.ts`            | エッジケーステスト       |
| `apps/desktop/src/main/__tests__/auth-flow.integration.test.ts`               | 統合テスト               |
| `packages/shared/types/__tests__/auth.test.ts`                                | 型・定数テスト           |
| `apps/desktop/src/renderer/store/slices/__tests__/authSlice.listener.test.ts` | リスナーテスト           |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-02-05 | 1.0.0      | 初版作成 |
