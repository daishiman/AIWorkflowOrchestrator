# Phase 4: テストケース一覧

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-FIX-GOOGLE-LOGIN-001 |
| Phase      | 4                         |
| 作成日     | 2026-02-04                |
| ステータス | 完了                      |

---

## 1. Auth Callbackエラーハンドリングテスト

**ファイル**: `apps/desktop/src/main/__tests__/auth-callback.test.ts`

### TC-001: errorパラメータ検出

| ID     | TC-001-1                                                  |
| ------ | --------------------------------------------------------- |
| 対象   | parseOAuthError関数                                       |
| 入力   | `aiworkflow://auth/callback#error=access_denied`          |
| 期待値 | `{ error: "access_denied", errorDescription: undefined }` |

| ID     | TC-001-2                                                                            |
| ------ | ----------------------------------------------------------------------------------- |
| 対象   | parseOAuthError関数                                                                 |
| 入力   | `aiworkflow://auth/callback#error=access_denied&error_description=User%20cancelled` |
| 期待値 | `{ error: "access_denied", errorDescription: "User cancelled" }`                    |

| ID     | TC-001-3                                      |
| ------ | --------------------------------------------- |
| 対象   | parseOAuthError関数                           |
| 入力   | `aiworkflow://auth/callback#access_token=xxx` |
| 期待値 | `null`（エラーなし）                          |

### TC-002: エラーメッセージマッピング

| ID     | TC-002-1                                                                      |
| ------ | ----------------------------------------------------------------------------- |
| 対象   | mapOAuthErrorToMessage関数                                                    |
| 入力   | `"access_denied"`                                                             |
| 期待値 | `{ code: "auth/oauth-access-denied", message: "認証がキャンセルされました" }` |

| ID     | TC-002-2                                                              |
| ------ | --------------------------------------------------------------------- |
| 対象   | mapOAuthErrorToMessage関数                                            |
| 入力   | `"unknown_error"`                                                     |
| 期待値 | `{ code: "auth/oauth-unknown-error", message: "認証に失敗しました" }` |

### TC-003: AUTH_STATE_CHANGEDエラー通知

| ID     | TC-003-1                                                                                 |
| ------ | ---------------------------------------------------------------------------------------- |
| 対象   | handleAuthCallback関数                                                                   |
| 入力   | URL with `error=access_denied`                                                           |
| 期待値 | `webContents.send`が`{ authenticated: false, error: "...", errorCode: "..." }`で呼ばれる |

---

## 2. Supabase設定検証テスト

**ファイル**: `packages/shared/types/__tests__/auth.test.ts`

### TC-004: AUTH_NOT_CONFIGUREDエラーコード

| ID     | TC-004-1                               |
| ------ | -------------------------------------- |
| 対象   | AUTH_ERROR_CODES                       |
| 入力   | `AUTH_ERROR_CODES.AUTH_NOT_CONFIGURED` |
| 期待値 | `"auth/not-configured"`                |

### TC-005: OAuthエラーコード追加

| ID     | TC-005-1                               |
| ------ | -------------------------------------- |
| 対象   | AUTH_ERROR_CODES                       |
| 入力   | `AUTH_ERROR_CODES.OAUTH_ACCESS_DENIED` |
| 期待値 | `"auth/oauth-access-denied"`           |

---

## 3. セッション管理テスト

**ファイル**: `apps/desktop/src/main/ipc/__tests__/authHandlers.test.ts`

### TC-006: AuthSession型拡張

| ID     | TC-006-1                                  |
| ------ | ----------------------------------------- |
| 対象   | AuthSession型                             |
| 確認   | refreshTokenExpiresAtフィールドが存在する |
| 期待値 | TypeScript型チェック通過                  |

### TC-007: リフレッシュトークン期限計算

| ID     | TC-007-1                             |
| ------ | ------------------------------------ |
| 対象   | calculateRefreshTokenExpiry関数      |
| 入力   | セッション作成時刻（Unix timestamp） |
| 期待値 | 入力 + 604800（7日）                 |

---

## 4. 認証状態リスナーテスト

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/authSlice.test.ts`

### TC-008: 二重登録防止

| ID     | TC-008-1                              |
| ------ | ------------------------------------- |
| 対象   | initializeAuth関数                    |
| 操作   | initializeAuth()を2回連続呼び出し     |
| 期待値 | onAuthStateChangedが1回だけ登録される |

| ID     | TC-008-2                                |
| ------ | --------------------------------------- |
| 対象   | clearAuth関数                           |
| 操作   | clearAuth()呼び出し後にinitializeAuth() |
| 期待値 | リスナーが再登録される                  |

### TC-009: 動的タイムアウト

| ID     | TC-009-1                        |
| ------ | ------------------------------- |
| 対象   | waitForSession関数              |
| 操作   | getSessionが即座に成功を返す    |
| 期待値 | 500ms未満でセッションが返される |

| ID     | TC-009-2                       |
| ------ | ------------------------------ |
| 対象   | waitForSession関数             |
| 操作   | getSessionが5秒以上応答しない  |
| 期待値 | nullが返される（タイムアウト） |

### TC-010: エラー状態更新

| ID     | TC-010-1                                                   |
| ------ | ---------------------------------------------------------- |
| 対象   | onAuthStateChangedハンドラー                               |
| 入力   | `{ authenticated: false, error: "...", errorCode: "..." }` |
| 期待値 | authError状態がエラーメッセージで更新される                |

---

## 5. 統合テスト

**ファイル**: `apps/desktop/src/main/__tests__/auth-flow.integration.test.ts`

### TC-011: OAuth認証失敗フロー

| ID       | TC-011-1                                            |
| -------- | --------------------------------------------------- |
| シナリオ | ユーザーがGoogle認証をキャンセル                    |
| 期待値   | Rendererにエラー通知が送られ、authErrorが設定される |

### TC-012: Supabase未設定フロー

| ID       | TC-012-1                               |
| -------- | -------------------------------------- |
| シナリオ | Supabase環境変数が未設定でログイン試行 |
| 期待値   | AUTH_NOT_CONFIGUREDエラーが返される    |

---

## テストケースサマリー

| カテゴリ         | テストケース数 | ステータス |
| ---------------- | -------------- | ---------- |
| Auth Callback    | 6              | 作成済み   |
| Supabase設定検証 | 2              | 作成済み   |
| セッション管理   | 2              | 作成済み   |
| 認証状態リスナー | 5              | 作成済み   |
| 統合テスト       | 2              | 作成済み   |
| **合計**         | **17**         | -          |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-02-04 | 1.0.0      | 初版作成 |
