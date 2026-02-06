# Phase 2 成果物: アーキテクチャ設計書

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 2                             |
| 機能名   | auth-session-refresh          |
| タスクID | TASK-AUTH-SESSION-REFRESH-001 |
| 作成日   | 2026-02-06                    |
| 文書種別 | アーキテクチャ設計書          |

---

## 1. アーキテクチャ概要

### 1.1 設計方針: Main Process完結型

TokenRefreshSchedulerをMain Processに配置し、リフレッシュ処理を全てMain Process内で完結させる。

**採用理由**:

1. **セキュリティ**: リフレッシュ処理中にトークンがIPC境界を越えない。アクセストークン・リフレッシュトークンはMain Processのメモリ内のみで保持される
2. **効率性**: Supabase SDK呼び出しをMain Processから直接実行でき、不要なIPC往復を排除
3. **信頼性**: Renderer Process停止時もリフレッシュが継続可能
4. **一貫性**: トークン操作（取得・更新・保存・削除）が全てMain Process内で完結

### 1.2 コンポーネント配置

```
Main Process
├── services/
│   └── tokenRefreshScheduler.ts    [新規] スケジューラー本体
├── ipc/
│   └── authHandlers.ts             [修正] スケジューラー統合
└── infrastructure/
    ├── supabaseClient.ts           [修正] autoRefreshToken: false
    └── secureStorage.ts            [既存] Refresh Token暗号化保存

Renderer Process
└── store/slices/
    └── authSlice.ts                [修正] isRefreshing状態追加
```

### 1.3 データフロー全体図

```
ログイン成功
  → authHandlers: expires_at(秒) * 1000 = expiresAt(ミリ秒)
  → TokenRefreshScheduler.start(expiresAt, callbacks)
  → setTimeout(refresh, expiresAt - 5min - now)

55分経過（有効期限5分前）
  → _executeRefresh()
  → _isRefreshing = true
  → callbacks.onRefresh()
    → supabase.auth.refreshSession()
    → storeRefreshToken(newToken) → SecureStorage
  → _isRefreshing = false
  → callbacks.onSuccess(newExpiresAt)
  → reset(newExpiresAt) → 次回タイマー設定
  → AUTH_STATE_CHANGED → Renderer: authSlice更新
```

---

## 2. TokenRefreshSchedulerクラス設計

### 2.1 クラス構造

```typescript
// apps/desktop/src/main/services/tokenRefreshScheduler.ts

class TokenRefreshScheduler {
  // === 設定 ===
  private readonly _config: TokenRefreshSchedulerConfig;

  // === 状態 ===
  private _timerId: ReturnType<typeof setTimeout> | null;
  private _callbacks: TokenRefreshCallbacks | null;
  private _isRefreshing: boolean;
  private _currentExpiresAt: number | null;
  private _disposed: boolean;

  // === ライフサイクル ===
  constructor(config?: Partial<TokenRefreshSchedulerConfig>);
  start(expiresAt: number, callbacks: TokenRefreshCallbacks): void;
  stop(): void;
  reset(newExpiresAt: number): void;
  dispose(): void;

  // === 状態アクセサ ===
  isRunning(): boolean;
  isRefreshing(): boolean;

  // === 内部メソッド ===
  private _scheduleRefresh(expiresAt: number): void;
  private _executeRefresh(): Promise<void>;
  private _retryRefresh(retryCount: number): Promise<void>;
  private _calculateDelay(expiresAt: number): number;
  private _calculateRetryDelay(retryCount: number): number;
  private _clearTimer(): void;
}
```

### 2.2 設計判断

| 判断項目            | 選択                    | 理由                                                                     |
| ------------------- | ----------------------- | ------------------------------------------------------------------------ |
| タイマー方式        | setTimeout              | 各リフレッシュ後にreset()で新タイマーを設定するため、setIntervalは不適切 |
| 依存性注入          | コールバックDI          | テスト時にモック注入が容易。スケジューラーがSupabase SDKに直接依存しない |
| リトライ方式        | 指数バックオフ+ジッター | 一時的なネットワークエラーに対応。ジッターで同時リトライの衝突を回避     |
| 排他制御            | \_isRefreshingフラグ    | 二重リフレッシュを防止。Promise完了時にフラグリセット                    |
| 単位                | ミリ秒統一              | スケジューラー内部は全てミリ秒。秒→ミリ秒変換は呼び出し側の責務          |
| expiresAtが過去の値 | 即座にリフレッシュ      | delay=0でsetTimeout(callback, 0)を実行                                   |

### 2.3 デフォルト設定値

```typescript
const DEFAULT_CONFIG: TokenRefreshSchedulerConfig = {
  refreshBeforeExpiryMs: 300_000, // 5分（300秒）
  maxRetries: 3,
  retryBaseIntervalMs: 1_000, // 1秒
};
```

### 2.4 メソッド動作仕様

#### start(expiresAt, callbacks)

1. `_disposed`が`true`の場合は何もしない（ログ出力のみ）
2. 既に稼働中の場合は`stop()`を呼び出してから再開始する
3. コールバックを`_callbacks`に保存する
4. `_scheduleRefresh(expiresAt)`を呼び出す

#### stop()

1. `_clearTimer()`でタイマーをクリアする
2. `_currentExpiresAt`を`null`に設定する
3. 稼働中でない場合は何もしない（エラーを発生させない）

#### reset(newExpiresAt)

1. `_disposed`が`true`の場合は何もしない
2. `_callbacks`が`null`の場合は何もしない（未start状態）
3. `_clearTimer()`で現在のタイマーをクリアする
4. `_currentExpiresAt`を`newExpiresAt`に更新する
5. `_scheduleRefresh(newExpiresAt)`を呼び出す

#### dispose()

1. `stop()`を呼び出す
2. `_callbacks`を`null`に設定してGC対象にする
3. `_disposed = true`に設定する
4. dispose後のstart/reset呼び出しは無視する

#### \_scheduleRefresh(expiresAt)

1. `delay = expiresAt - _config.refreshBeforeExpiryMs - Date.now()`を計算する
2. `delay < 0`の場合は`delay = 0`に設定する（即座にリフレッシュ）
3. `setTimeout(_executeRefresh, delay)`でタイマーを設定する
4. ログ出力: `[TokenRefreshScheduler] Started. Refresh in {delay}ms`

#### \_executeRefresh()

1. `_isRefreshing`が`true`の場合はリターン（排他制御。ログ出力: warn）
2. `_isRefreshing = true`に設定する
3. `_callbacks.onRefresh()`を呼び出す
4. 成功時（戻り値がnumber）:
   - `_isRefreshing = false`に設定する
   - `_callbacks.onSuccess?.(newExpiresAt)`を呼び出す
   - `reset(newExpiresAt)`を実行する
5. 失敗時（戻り値がnullまたは例外）:
   - `_retryRefresh(0)`を呼び出す

#### \_retryRefresh(retryCount)

1. `retryCount >= _config.maxRetries`の場合:
   - `_isRefreshing = false`に設定する
   - `_callbacks.onFailure(error)`を呼び出す
   - `stop()`する
2. リトライ遅延を計算する: `_calculateRetryDelay(retryCount)`
3. `setTimeout`で遅延後に`_callbacks.onRefresh()`を再実行する
4. 成功時: `_isRefreshing = false` → `onSuccess` → `reset(newExpiresAt)`
5. 失敗時: `_retryRefresh(retryCount + 1)`を呼び出す

#### \_calculateRetryDelay(retryCount)

```
delay = retryBaseIntervalMs * (2 ** retryCount) + Math.random() * 500
```

| リトライ回数 | ベース遅延 | ジッター範囲 | 合計遅延範囲   |
| ------------ | ---------- | ------------ | -------------- |
| 0（1回目）   | 1,000ms    | 0〜500ms     | 1,000〜1,500ms |
| 1（2回目）   | 2,000ms    | 0〜500ms     | 2,000〜2,500ms |
| 2（3回目）   | 4,000ms    | 0〜500ms     | 4,000〜4,500ms |

---

## 3. supabaseClient設定変更

### 3.1 変更内容

```typescript
// apps/desktop/src/main/infrastructure/supabaseClient.ts

// 変更前
const supabase = createClient(url, key, {
  auth: { autoRefreshToken: true },
});

// 変更後
const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false },
});
```

### 3.2 変更理由

- `autoRefreshToken: true`はSupabase SDKがAPI呼び出し時にトークン期限切れを検出してリフレッシュを行う
- カスタムTokenRefreshSchedulerは能動的に期限前リフレッシュを行う
- 両方が有効だと同時リフレッシュが発生し、競合状態（race condition）になる可能性がある
- カスタムスケジューラーが5分前にリフレッシュを行うため、SDKの自動リフレッシュは不要になる

---

## 4. authHandlers.ts統合設計

### 4.1 スケジューラーインスタンス管理

```typescript
// apps/desktop/src/main/ipc/authHandlers.ts

// モジュールスコープでシングルトンインスタンスを保持
let tokenRefreshScheduler: TokenRefreshScheduler | null = null;

function getScheduler(): TokenRefreshScheduler {
  if (!tokenRefreshScheduler) {
    tokenRefreshScheduler = new TokenRefreshScheduler();
  }
  return tokenRefreshScheduler;
}
```

### 4.2 ログイン成功時の統合

```
auth:loginハンドラー
  ├── Supabase signInWithOAuth() 実行
  ├── session取得成功
  ├── SecureStorage にRefresh Token保存
  ├── expires_at（秒）→ expiresAt（ミリ秒）変換: expires_at * 1000
  ├── getScheduler().start(expiresAt, {
  │     onRefresh: async () => {
  │       const result = await supabase.auth.refreshSession();
  │       if (result.data.session) {
  │         // SecureStorage更新
  │         await storeRefreshToken(result.data.session.refresh_token);
  │         // AUTH_STATE_CHANGED送信
  │         webContents.send('AUTH_STATE_CHANGED', {
  │           expiresAt: result.data.session.expires_at * 1000,
  │           user: result.data.session.user,
  │         });
  │         return result.data.session.expires_at * 1000;
  │       }
  │       return null;
  │     },
  │     onFailure: (error) => {
  │       // ログアウト処理
  │       clearTokens();
  │       supabase.auth.signOut();
  │       webContents.send('AUTH_STATE_CHANGED', null);
  │     },
  │     onSuccess: (newExpiresAt) => {
  │       console.log('[TokenRefreshScheduler] Refresh successful.');
  │     }
  │   })
  └── Renderer にsessionExpiresAtを返す
```

### 4.3 ログアウト時の統合

```
auth:logoutハンドラー
  ├── getScheduler().stop()         // スケジューラー停止
  ├── Supabase signOut() 実行
  ├── SecureStorage clearTokens()
  └── Renderer にログアウト完了を通知
```

### 4.4 アプリ終了時のクリーンアップ

```typescript
// authHandlers.ts 初期化関数内
app.on("before-quit", () => {
  getScheduler().dispose();
  tokenRefreshScheduler = null;
});
```

---

## 5. authSlice統合設計

### 5.1 追加状態

```typescript
// 既存のAuthSlice型に追加
interface AuthSliceAdditions {
  /** リフレッシュ処理中フラグ（UIでのステータス表示用） */
  isRefreshing: boolean;
  /** 最終リフレッシュ成功日時（デバッグ用） */
  lastRefreshAt: number | null;
}
```

### 5.2 状態更新フロー

```
Main Process                              Renderer Process
    |                                         |
  リフレッシュ成功                            |
    |--- AUTH_STATE_CHANGED(newSession) --->   |
    |                                    authSlice:
    |                                      sessionExpiresAt = newExpiresAt
    |                                      lastRefreshAt = Date.now()
    |                                         |
  リフレッシュ失敗→ログアウト                 |
    |--- AUTH_STATE_CHANGED(null) -------->   |
    |                                    authSlice:
    |                                      clearAuth()
```

### 5.3 設計上の注意点

- スケジューラーはMain Process側のみ。Renderer側はスケジューラーを直接操作しない
- authSlice側の`isRefreshing`フラグはMainからのイベントで間接的に更新される
- 既存の`onAuthStateChanged`リスナーと競合しない（同じAUTH_STATE_CHANGEDイベントを活用）
- `clearAuth()`呼び出し時にMain Process側でスケジューラーstop()が連動する

---

## 6. エラーハンドリング設計

### 6.1 エラーケース別対応

| エラーケース               | カテゴリ                | リトライ | 対応                                         |
| -------------------------- | ----------------------- | -------- | -------------------------------------------- |
| ネットワーク接続エラー     | External Service (3000) | 可能     | 最大3回リトライ（指数バックオフ + ジッター） |
| Supabase APIタイムアウト   | External Service (3000) | 可能     | 最大3回リトライ（指数バックオフ + ジッター） |
| Supabase APIレート制限     | External Service (3000) | 可能     | 最大3回リトライ（指数バックオフ + ジッター） |
| Refresh Token期限切れ      | Business Error (2000)   | 不可     | 即座にonFailure → ログアウト                 |
| Refresh Token無効          | Business Error (2000)   | 不可     | 即座にonFailure → ログアウト                 |
| タイマー設定エラー         | Internal Error (5000)   | 不可     | console.error + スケジューラー停止           |
| expiresAtが過去の値        | Validation (1000)       | -        | 即座にリフレッシュ実行（delay = 0）          |
| 二重リフレッシュリクエスト | -                       | -        | \_isRefreshingフラグで無視                   |
| dispose後の操作            | -                       | -        | 何もしない（エラーを発生させない）           |

### 6.2 リフレッシュ失敗時のフォールバックフロー

```
リフレッシュ失敗
  ├── リトライ対象エラー?
  │   ├── Yes → リトライ（最大3回）
  │   │         ├── 成功 → 正常フロー（reset）
  │   │         └── 全失敗 → onFailure
  │   └── No → 即座にonFailure
  │
  onFailure:
    ├── _isRefreshing = false
    ├── スケジューラー停止（stop()）
    ├── SecureStorage clearTokens()
    ├── supabase.auth.signOut()
    ├── AUTH_STATE_CHANGED(null) → Renderer
    └── Renderer: clearAuth() → ログイン画面遷移
```

### 6.3 ログ出力設計

| タイミング           | ログレベル | メッセージ例                                                             |
| -------------------- | ---------- | ------------------------------------------------------------------------ |
| スケジューラー開始   | info       | `[TokenRefreshScheduler] Started. Refresh in {delay}ms`                  |
| リフレッシュ実行開始 | info       | `[TokenRefreshScheduler] Executing refresh...`                           |
| リフレッシュ成功     | info       | `[TokenRefreshScheduler] Refresh successful. New expiresAt: {timestamp}` |
| リフレッシュ失敗     | warn       | `[TokenRefreshScheduler] Refresh failed (attempt {n}/{max}): {message}`  |
| リトライ開始         | info       | `[TokenRefreshScheduler] Retrying in {delay}ms...`                       |
| 全リトライ失敗       | error      | `[TokenRefreshScheduler] All retries failed. Triggering logout.`         |
| スケジューラー停止   | info       | `[TokenRefreshScheduler] Stopped.`                                       |
| 排他制御スキップ     | warn       | `[TokenRefreshScheduler] Refresh already in progress. Skipping.`         |
| dispose実行          | info       | `[TokenRefreshScheduler] Disposed.`                                      |

**注意**: ログにトークン文字列（Access Token、Refresh Token）は含めない。expiresAtタイムスタンプのみ出力する。
