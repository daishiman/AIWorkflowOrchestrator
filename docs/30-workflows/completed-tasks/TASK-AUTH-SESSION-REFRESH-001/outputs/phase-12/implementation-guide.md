# Phase 12 成果物: 実装ガイド

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 12                            |
| 機能名   | auth-session-refresh          |
| タスクID | TASK-AUTH-SESSION-REFRESH-001 |
| 作成日   | 2026-02-06                    |
| 文書種別 | 実装ガイド                    |

---

# Part 1: 概念的説明（中学生でもわかる版）

## なぜ自動リフレッシュが必要なの？

### 図書館の貸出カードで考えてみよう

想像してみてください。あなたは図書館で本を読んでいます。図書館には「入館証」があって、入り口でもらいます。でも、この入館証には**有効期限**があります（例えば1時間）。

有効期限が切れると、図書館の人が来て「すみません、入館証の期限が切れたので、もう一度受付で手続きしてください」と言います。読書の途中で中断されるのは嫌ですよね？

**自動リフレッシュ**は、入館証の期限が切れる**5分前**に、図書館の人が**自動的に**新しい入館証を持ってきてくれる仕組みです。あなたは何もしなくても、ずっと本を読み続けられます。

### アプリでは何が起きているの？

1. **ログイン** = 図書館の入館証をもらうこと
2. **セッション** = 入館証そのもの（有効期限つき）
3. **リフレッシュ** = 期限が切れる前に新しい入館証をもらうこと
4. **ログアウト** = 入館証を返すこと

### 失敗したらどうなるの？

新しい入館証をもらいに行ったけど、受付が閉まっていたら？そんなときは：

1. **1秒待って、もう一度行ってみる**（1回目のリトライ）
2. **2秒待って、もう一度行ってみる**（2回目のリトライ）
3. **4秒待って、もう一度行ってみる**（3回目のリトライ）

3回行ってもダメだったら、「ごめんなさい、もう一度受付で手続きしてください」と言われます。つまり、もう一度ログインが必要になります。

待ち時間が1秒→2秒→4秒と**倍々に増える**のは、受付が混んでいるときに何度もすぐに行くと余計に混むからです。少しずつ間隔を空けて行くことで、受付の負担を減らしています。

### セキュリティも大事

入館証（トークン）は大事な情報なので、アプリの「裏側」（Main Process）だけで管理します。画面に表示する部分（Renderer）には「いつまで有効か」という時間だけを教えます。入館証そのものは見せません。

---

# Part 2: 技術的詳細（開発者向け）

## 1. アーキテクチャ概要

```
┌──────────────────────────────────────────────────┐
│                  Main Process                     │
│                                                   │
│  ┌─────────────────────┐  ┌────────────────────┐ │
│  │ TokenRefreshScheduler│  │  authHandlers.ts   │ │
│  │                     │  │                    │ │
│  │  setTimeout-based   │──│  onRefresh()       │ │
│  │  指数バックオフ     │  │  onFailure()       │ │
│  │  排他制御           │  │  onSuccess()       │ │
│  └─────────────────────┘  └────────┬───────────┘ │
│                                     │             │
│  ┌─────────────────────┐           │             │
│  │  SecureStorage      │           │             │
│  │  暗号化トークン保存 │◄──────────┘             │
│  └─────────────────────┘                         │
│                     │                             │
│          webContents.send()                       │
│          AUTH_STATE_CHANGED                        │
│          { user, expiresAt }                      │
└─────────────────────┼────────────────────────────┘
                      │
          ┌───────────▼──────────────┐
          │    Renderer Process      │
          │                          │
          │  authSlice (Zustand)     │
          │  - sessionExpiresAt      │
          │  - isRefreshing          │
          └──────────────────────────┘
```

## 2. TokenRefreshScheduler クラス

### 2.1 インターフェース定義

```typescript
// ファイル: apps/desktop/src/main/services/tokenRefreshScheduler.ts

export interface TokenRefreshSchedulerConfig {
  /** リフレッシュ開始オフセット（ミリ秒）。デフォルト: 300000（5分） */
  refreshBeforeExpiryMs: number;
  /** リトライ最大回数。デフォルト: 3 */
  maxRetries: number;
  /** リトライ初期間隔（ミリ秒）。デフォルト: 1000（1秒） */
  retryBaseIntervalMs: number;
}

export interface TokenRefreshCallbacks {
  /** リフレッシュ実行。成功時に新しいexpiresAt（ミリ秒）を返す */
  onRefresh: () => Promise<number | null>;
  /** 全リトライ失敗後のコールバック */
  onFailure: (error: Error) => void;
  /** リフレッシュ成功後のコールバック（オプション） */
  onSuccess?: (newExpiresAt: number) => void;
}
```

### 2.2 デフォルト設定

```typescript
export const DEFAULT_CONFIG: TokenRefreshSchedulerConfig = {
  refreshBeforeExpiryMs: 300_000, // 5分
  maxRetries: 3,
  retryBaseIntervalMs: 1_000, // 1秒
};
```

### 2.3 公開API

| メソッド                                         | 戻り値  | 説明                                    |
| ------------------------------------------------ | ------- | --------------------------------------- |
| `constructor(config?: Partial<Config>)`          | -       | カスタム設定でインスタンス生成          |
| `start(expiresAt: number, callbacks: Callbacks)` | void    | スケジューラー開始（expiresAtはミリ秒） |
| `stop()`                                         | void    | スケジューラー停止（タイマークリア）    |
| `reset(newExpiresAt: number)`                    | void    | 新しいexpiresAtでタイマー再設定         |
| `isRunning()`                                    | boolean | タイマーが設定されているか              |
| `isRefreshing()`                                 | boolean | リフレッシュ処理実行中か（排他制御）    |
| `dispose()`                                      | void    | 全リソース解放（アプリ終了時）          |

### 2.4 内部動作フロー

1. `start(expiresAt, callbacks)` → `scheduleRefresh(expiresAt)` → `setTimeout(delay)`
2. タイマー発火 → `executeRefresh(retryCount=0)`
3. 成功時: `onSuccess(newExpiresAt)` → `reset(newExpiresAt)` → 新タイマー設定
4. 失敗時 (retryCount < maxRetries): 指数バックオフ → `executeRefresh(retryCount+1)`
5. 全リトライ失敗: `onFailure(error)` → ログアウトフロー

### 2.5 リトライ戦略

```
遅延 = retryBaseIntervalMs × 2^retryCount + random(0, retryBaseIntervalMs × 0.1)

リトライ1: 1000ms × 2^0 + jitter = ~1000ms
リトライ2: 1000ms × 2^1 + jitter = ~2000ms
リトライ3: 1000ms × 2^2 + jitter = ~4000ms
```

## 3. authHandlers.ts 統合

### 3.1 スケジューラー管理関数

```typescript
// モジュールスコープのインスタンス管理
let tokenRefreshScheduler: TokenRefreshScheduler | null = null;

// テスト用
export function getTokenRefreshScheduler(): TokenRefreshScheduler | null;

// スケジューラー開始（ログイン成功・セッション復元時）
function startTokenRefreshScheduler(
  expiresAtSeconds: number, // Supabaseはseconds単位
  supabase: SupabaseClient,
  secureStorage: SecureStorage,
  mainWindow: BrowserWindow,
): void;

// スケジューラー停止（ログアウト時）
function stopTokenRefreshScheduler(): void;

// スケジューラー破棄（アプリ終了時）
export function disposeTokenRefreshScheduler(): void;
```

### 3.2 コールバック実装

| コールバック | 処理内容                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| `onRefresh`  | `secureStorage.getRefreshToken()` → `supabase.auth.refreshSession()` → 新トークン保存 → `AUTH_STATE_CHANGED`送信 |
| `onFailure`  | `secureStorage.clearTokens()` → `AUTH_STATE_CHANGED({ authenticated: false })` 送信                              |
| `onSuccess`  | ログ出力（次回有効期限のISO文字列）                                                                              |

### 3.3 単位変換の注意点

Supabaseの`expires_at`は**秒**単位、TokenRefreshSchedulerは**ミリ秒**単位で動作する。

```typescript
// 秒→ミリ秒変換
const expiresAtMs = expiresAtSeconds * 1000;
tokenRefreshScheduler.start(expiresAtMs, callbacks);

// onRefreshの戻り値もミリ秒
return newExpiresAt * 1000;
```

## 4. Renderer側の変更

### 4.1 authSlice 追加フィールド

```typescript
// AuthSlice インターフェースに追加
isRefreshing: boolean; // リフレッシュ処理中フラグ

// 初期状態
isRefreshing: false;

// clearAuth()でリセット
isRefreshing: false;
```

### 4.2 AUTH_STATE_CHANGED イベント

```typescript
// Main → Renderer への通知ペイロード
{
  authenticated: true,
  user: AuthUser,
  expiresAt: number,  // seconds (Unixタイムスタンプ)
}
```

`hasExpiresAt()` 型ガードで `expiresAt` フィールドの存在を確認し、`sessionExpiresAt` にマッピングする。

## 5. supabaseClient.ts の変更

```typescript
// 変更箇所
auth: {
  autoRefreshToken: false,  // true → false に変更
  // カスタムスケジューラー（TokenRefreshScheduler）で管理するため
  // Supabase SDKの自動リフレッシュと競合しないようにする
}
```

## 6. セキュリティ設計

| 項目             | 実装                                                  |
| ---------------- | ----------------------------------------------------- |
| トークン保存     | `electron.safeStorage.encryptString()` で暗号化       |
| Renderer非露出   | `AUTH_STATE_CHANGED`に`expiresAt`のみ（トークンなし） |
| IPC保護          | `withValidation()` で送信元ウィンドウ検証             |
| エラーサニタイズ | `sanitizeErrorMessage()` でパスワード/トークン除去    |
| 排他制御         | `_isRefreshing` フラグで二重リフレッシュ防止          |
| リソース解放     | `dispose()` でタイマー+コールバック参照をクリア       |

## 7. 設定可能なパラメータ一覧

| パラメータ              | デフォルト値 | 単位 | 説明                                     |
| ----------------------- | ------------ | ---- | ---------------------------------------- |
| `refreshBeforeExpiryMs` | 300,000      | ms   | 有効期限の何ミリ秒前にリフレッシュ開始   |
| `maxRetries`            | 3            | 回   | リフレッシュ失敗時の最大リトライ回数     |
| `retryBaseIntervalMs`   | 1,000        | ms   | リトライ初期間隔（指数バックオフの基底） |

## 8. テスト設計パターン

### 8.1 vi.useFakeTimers + flushPromises パターン

```typescript
// タイマーベースのコードをテストする際の重要パターン
vi.useFakeTimers();

// flushPromises: microtaskキューを消化（タイマーは進めない）
async function flushPromises(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
}

// 使い分け:
// - タイマーを進める: vi.advanceTimersByTime(ms)
// - Promiseを解決する: await flushPromises()
// - 両方: vi.advanceTimersByTime(ms) → await flushPromises()
```

**注意**: `vi.runAllTimersAsync()` はリフレッシュ成功後に新タイマーが設定されるため無限ループになる。`flushPromises()` を使うこと。

### 8.2 モックファクトリパターン

```typescript
function createMockCallbacks(): TokenRefreshCallbacks {
  return {
    onRefresh: vi.fn().mockResolvedValue(newExpiresAt),
    onFailure: vi.fn(),
    onSuccess: vi.fn(),
  };
}

function createTestConfig(): Partial<TokenRefreshSchedulerConfig> {
  return {
    refreshBeforeExpiryMs: 1_000,
    maxRetries: 3,
    retryBaseIntervalMs: 100,
  };
}
```
