# Phase 2 成果物: シーケンス図

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 2                             |
| 機能名   | auth-session-refresh          |
| タスクID | TASK-AUTH-SESSION-REFRESH-001 |
| 作成日   | 2026-02-06                    |
| 文書種別 | シーケンス図                  |

---

## 1. 全体フロー概要

```
ログイン → スケジューラー開始 → (55分経過) → 自動リフレッシュ → セッション更新
→ スケジューラーリセット → (55分経過) → 自動リフレッシュ → ... (繰り返し)
```

---

## 2. ログイン成功 → スケジューラー開始

```
Renderer              Main Process             Supabase          SecureStorage
  |                       |                       |                   |
  |--- auth:login ------->|                       |                   |
  |                       |--- signInWithOAuth -->|                   |
  |                       |<-- session(expires_at)|                   |
  |                       |                       |                   |
  |                       |--- storeRefreshToken ---------------------->|
  |                       |<-- OK ----------------------------------------|
  |                       |                       |                   |
  |                       | [expires_at(秒) * 1000 → expiresAt(ミリ秒)]  |
  |                       |                       |                   |
  |                       | TokenRefreshScheduler.start(expiresAt, {     |
  |                       |   onRefresh, onFailure, onSuccess            |
  |                       | })                                           |
  |                       |                       |                   |
  |                       | [setTimeout(refresh, expiresAt - 5min - now)] |
  |                       |                       |                   |
  |<-- IPCResponse -------|                       |                   |
  |   { expiresAt, user } |                       |                   |
  |                       |                       |                   |
  | authSlice:            |                       |                   |
  |  sessionExpiresAt     |                       |                   |
  |  = expiresAt          |                       |                   |
```

**ポイント**:

- `expires_at`（秒）→ `expiresAt`（ミリ秒）変換は`authHandlers.ts`内で実施
- スケジューラーはMain Processのモジュールスコープでシングルトンとして管理
- Rendererに返すレスポンスにはトークン文字列を含めない

---

## 3. 自動リフレッシュ（正常系）

```
Renderer              Main Process             Supabase          SecureStorage
  |                       |                       |                   |
  |               [55分経過: タイマー発火]         |                   |
  |                       |                       |                   |
  |                       | _isRefreshing = true   |                   |
  |                       |                       |                   |
  |                       |--- refreshSession --->|                   |
  |                       |<-- newSession --------|                   |
  |                       |   { access_token,     |                   |
  |                       |     refresh_token,    |                   |
  |                       |     expires_at }      |                   |
  |                       |                       |                   |
  |                       |--- storeRefreshToken(new) ----------------->|
  |                       |<-- OK ----------------------------------------|
  |                       |                       |                   |
  |                       | _isRefreshing = false  |                   |
  |                       |                       |                   |
  |                       | onSuccess(newExpiresAt)|                   |
  |                       |                       |                   |
  |                       | reset(newExpiresAt)    |                   |
  |                       | [新タイマー設定:      |                   |
  |                       |  setTimeout(refresh,  |                   |
  |                       |  newExpiresAt-5min-now)]                  |
  |                       |                       |                   |
  |<-- AUTH_STATE_CHANGED |                       |                   |
  |   { expiresAt, user } |                       |                   |
  |                       |                       |                   |
  | authSlice:            |                       |                   |
  |  sessionExpiresAt     |                       |                   |
  |  = newExpiresAt       |                       |                   |
  |  lastRefreshAt        |                       |                   |
  |  = Date.now()         |                       |                   |
```

**ポイント**:

- リフレッシュ処理は全てMain Process内で完結
- `_isRefreshing`フラグで排他制御
- 成功後に`reset()`で次回タイマーを再設定
- `AUTH_STATE_CHANGED`でRendererに通知（トークン文字列は含まない）

---

## 4. リフレッシュ失敗 → リトライ → 成功

```
Renderer              Main Process             Supabase
  |                       |                       |
  |               [タイマー発火]                   |
  |                       |                       |
  |                       | _isRefreshing = true   |
  |                       |--- refreshSession --->|
  |                       |<-- ERROR (network) ---|
  |                       |                       |
  |                       | [リトライ 1/3]        |
  |                       | [1000ms + jitter 待機] |
  |                       |--- refreshSession --->|
  |                       |<-- ERROR (timeout) ---|
  |                       |                       |
  |                       | [リトライ 2/3]        |
  |                       | [2000ms + jitter 待機] |
  |                       |--- refreshSession --->|
  |                       |<-- newSession --------|  << 成功
  |                       |                       |
  |                       | _isRefreshing = false  |
  |                       | onSuccess(newExpiresAt)|
  |                       | reset(newExpiresAt)    |
  |                       |                       |
  |<-- AUTH_STATE_CHANGED |                       |
  |   { expiresAt, user } |                       |
```

**ポイント**:

- 2回目のリトライで成功した場合、3回目のリトライは実行されない
- リトライ間隔: 1s → 2s（指数バックオフ + ジッター0〜500ms）
- 成功後は正常フロー（reset + AUTH_STATE_CHANGED）に合流

---

## 5. リフレッシュ失敗 → リトライ全失敗 → ログアウト

```
Renderer              Main Process             Supabase          SecureStorage
  |                       |                       |                   |
  |               [タイマー発火]                   |                   |
  |                       |                       |                   |
  |                       | _isRefreshing = true   |                   |
  |                       |--- refreshSession --->|                   |
  |                       |<-- ERROR -------------|                   |
  |                       |                       |                   |
  |                       | [リトライ 1/3: 1s + jitter]               |
  |                       |--- refreshSession --->|                   |
  |                       |<-- ERROR -------------|                   |
  |                       |                       |                   |
  |                       | [リトライ 2/3: 2s + jitter]               |
  |                       |--- refreshSession --->|                   |
  |                       |<-- ERROR -------------|                   |
  |                       |                       |                   |
  |                       | [リトライ 3/3: 4s + jitter]               |
  |                       |--- refreshSession --->|                   |
  |                       |<-- ERROR -------------|                   |
  |                       |                       |                   |
  |                       | [全リトライ失敗]       |                   |
  |                       | _isRefreshing = false  |                   |
  |                       |                       |                   |
  |                       | onFailure(error)       |                   |
  |                       |   ├── stop()           |                   |
  |                       |   ├── clearTokens() ---------------------->|
  |                       |   └── signOut() ------>|                   |
  |                       |                       |                   |
  |<-- AUTH_STATE_CHANGED(null)                   |                   |
  |                       |                       |                   |
  | authSlice:            |                       |                   |
  |  clearAuth()          |                       |                   |
  |  → ログイン画面遷移   |                       |                   |
```

**ポイント**:

- 3回のリトライ（1s→2s→4s + ジッター）の後、全て失敗
- `onFailure`コールバックがログアウト処理を実行
- SecureStorageからトークンをクリアし、Supabase signOutを実行
- `AUTH_STATE_CHANGED(null)`でRendererにログアウトを通知
- Renderer側で`clearAuth()`が呼ばれ、ログイン画面に遷移

---

## 6. Refresh Token期限切れ → 即時ログアウト（リトライなし）

```
Renderer              Main Process             Supabase          SecureStorage
  |                       |                       |                   |
  |               [タイマー発火]                   |                   |
  |                       |                       |                   |
  |                       | _isRefreshing = true   |                   |
  |                       |--- refreshSession --->|                   |
  |                       |<-- ERROR:             |                   |
  |                       |  "refresh_token_not   |                   |
  |                       |   _found" (400)       |                   |
  |                       |                       |                   |
  |                       | [リトライ不要と判定]   |                   |
  |                       | _isRefreshing = false  |                   |
  |                       |                       |                   |
  |                       | onFailure(error)       |                   |
  |                       |   ├── stop()           |                   |
  |                       |   ├── clearTokens() ---------------------->|
  |                       |   └── signOut() ------>|                   |
  |                       |                       |                   |
  |<-- AUTH_STATE_CHANGED(null)                   |                   |
  |                       |                       |                   |
  | authSlice:            |                       |                   |
  |  clearAuth()          |                       |                   |
  |  → ログイン画面遷移   |                       |                   |
```

**ポイント**:

- Refresh Token期限切れはBusiness Error（2000系）であり、リトライ不可
- 即座に`onFailure`を呼び出し、ログアウト処理を実行
- リトライを行っても成功しないため、無駄な待機を回避

---

## 7. ログアウト → スケジューラー停止

```
Renderer              Main Process
  |                       |
  |--- auth:logout ------>|
  |                       |
  |                       | TokenRefreshScheduler.stop()
  |                       |   └── clearTimeout()
  |                       |       _timerId = null
  |                       |       _currentExpiresAt = null
  |                       |
  |                       | supabase.auth.signOut()
  |                       | SecureStorage.clearTokens()
  |                       |
  |<-- IPCResponse -------|
  |   { success: true }   |
  |                       |
  | authSlice:            |
  |  clearAuth()          |
```

**ポイント**:

- ログアウト時にスケジューラーを停止してからSupabase signOutを実行
- タイマーが確実にクリアされ、ログアウト後にリフレッシュが発火しない

---

## 8. アプリ終了 → クリーンアップ

```
Electron App              Main Process
  |                           |
  | [ユーザーがアプリ終了]     |
  |--- before-quit ---------> |
  |                           |
  |                           | TokenRefreshScheduler.dispose()
  |                           |   ├── stop()
  |                           |   │   └── clearTimeout()
  |                           |   └── _callbacks = null
  |                           |       _timerId = null
  |                           |       _disposed = true
  |                           |
  |                           | tokenRefreshScheduler = null
  |                           |
  | [アプリ終了]              |
```

**ポイント**:

- `dispose()`でタイマークリアとコールバック参照解放を実行
- `_disposed = true`により、dispose後の操作は全て無視される
- モジュールスコープの参照も`null`に設定してGC対象にする

---

## 9. expiresAtが過去の値の場合

```
Renderer              Main Process
  |                       |
  |--- auth:login ------->|
  |                       |
  |                       | [セッション復元: expiresAtが過去の値]
  |                       |
  |                       | delay = expiresAt - 5min - now
  |                       | delay = -120000 (負の値)
  |                       | delay = Math.max(0, delay) → 0
  |                       |
  |                       | setTimeout(refresh, 0)
  |                       |   → 即座にリフレッシュ実行
  |                       |
  |                       | (以降、正常系と同じフロー)
```

**ポイント**:

- expiresAtが既に過去（または残り5分未満）の場合、delayが負になる
- `Math.max(0, delay)`で0に補正し、`setTimeout(callback, 0)`で即座にリフレッシュ
- セッション復元時（アプリ再起動後など）に発生する可能性がある

---

## 10. 排他制御（二重リフレッシュ防止）

```
Main Process
  |
  | [タイマー発火]
  | _isRefreshing = true
  | onRefresh() 実行中...
  |
  | [何らかの理由で再度リフレッシュ要求]
  | _isRefreshing == true を検出
  | → リクエストを無視（ログ出力のみ: warn）
  |   "[TokenRefreshScheduler] Refresh already in progress. Skipping."
  |
  | onRefresh() 完了
  | _isRefreshing = false
  |
  | [以降、正常にリフレッシュ受付可能]
```

**ポイント**:

- `_isRefreshing`フラグが`true`の間は新規リフレッシュを受け付けない
- エラーは発生させず、warnログのみ出力する
- フラグはリフレッシュ完了（成功/失敗/リトライ全失敗）時に`false`にリセットされる
