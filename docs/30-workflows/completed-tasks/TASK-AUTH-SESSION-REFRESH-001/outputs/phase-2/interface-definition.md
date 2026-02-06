# Phase 2 成果物: インターフェース定義

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 2                             |
| 機能名   | auth-session-refresh          |
| タスクID | TASK-AUTH-SESSION-REFRESH-001 |
| 作成日   | 2026-02-06                    |
| 文書種別 | インターフェース定義書        |

---

## 1. TokenRefreshScheduler インターフェース

### 1.1 設定型

```typescript
/**
 * TokenRefreshSchedulerの設定
 * 全フィールドにデフォルト値があるため、Partial<>で渡す
 */
interface TokenRefreshSchedulerConfig {
  /**
   * リフレッシュ開始オフセット（ミリ秒）
   * 有効期限のこの時間前にリフレッシュを開始する
   * @default 300000 (5分)
   */
  refreshBeforeExpiryMs: number;

  /**
   * リトライ最大回数
   * リフレッシュ失敗時にこの回数までリトライする
   * @default 3
   */
  maxRetries: number;

  /**
   * リトライ初期間隔（ミリ秒）
   * 指数バックオフの基準値。retryBaseIntervalMs * 2^retryCount で増加
   * @default 1000 (1秒)
   */
  retryBaseIntervalMs: number;
}
```

### 1.2 コールバック型

```typescript
/**
 * TokenRefreshSchedulerのコールバック定義
 * 依存性注入パターンでリフレッシュ処理の具体的な実装を外部から注入する
 */
interface TokenRefreshCallbacks {
  /**
   * リフレッシュ実行コールバック
   * Supabase refreshSession()の呼び出しを含む
   * @returns 成功時: 新しいexpiresAt（ミリ秒）、失敗時: null
   * @throws ネットワークエラー、APIエラー
   */
  onRefresh: () => Promise<number | null>;

  /**
   * リフレッシュ失敗コールバック（リトライ全失敗後に呼ばれる）
   * ログアウト処理を実行する
   * @param error 最後のエラー情報
   */
  onFailure: (error: Error) => void;

  /**
   * リフレッシュ成功コールバック（オプション）
   * ログ出力や状態更新に使用
   * @param newExpiresAt 新しい有効期限（ミリ秒）
   */
  onSuccess?: (newExpiresAt: number) => void;
}
```

### 1.3 クラスインターフェース

````typescript
/**
 * セッション自動リフレッシュスケジューラー
 *
 * Main Processで動作し、Access Tokenの有効期限前に
 * 自動的にリフレッシュを実行するスケジューラー。
 *
 * 特徴:
 * - setTimeoutベースのスケジューリング（1回限りタイマー）
 * - コールバックDIパターンによるテスタビリティ確保
 * - 指数バックオフ + ジッターによるリトライ
 * - _isRefreshingフラグによる排他制御
 *
 * @example
 * ```typescript
 * const scheduler = new TokenRefreshScheduler({
 *   refreshBeforeExpiryMs: 300_000, // 5分前
 *   maxRetries: 3,
 *   retryBaseIntervalMs: 1_000,     // 1秒
 * });
 *
 * scheduler.start(expiresAtMs, {
 *   onRefresh: async () => {
 *     const result = await supabase.auth.refreshSession();
 *     if (result.data.session) {
 *       return result.data.session.expires_at * 1000;
 *     }
 *     return null;
 *   },
 *   onFailure: (error) => {
 *     // ログアウト処理
 *   },
 *   onSuccess: (newExpiresAt) => {
 *     console.log('Refreshed:', newExpiresAt);
 *   },
 * });
 * ```
 */
class TokenRefreshScheduler {
  /**
   * リフレッシュ処理中フラグ（排他制御用）
   * trueの間は新たなリフレッシュリクエストを無視する
   */
  private _isRefreshing: boolean;

  /**
   * コンストラクタ
   * @param config 設定値（省略時はデフォルト値を使用）
   */
  constructor(config?: Partial<TokenRefreshSchedulerConfig>);

  /**
   * スケジューラーを開始する
   *
   * 既に稼働中の場合はstop()してから再開始する。
   * expiresAtはミリ秒単位のUnixタイムスタンプ。
   * Supabaseのexpires_atは秒単位のため、呼び出し側で `expires_at * 1000` に変換すること。
   *
   * @param expiresAt Access Tokenの有効期限（ミリ秒単位のUnixタイムスタンプ）
   * @param callbacks リフレッシュ処理のコールバック
   */
  start(expiresAt: number, callbacks: TokenRefreshCallbacks): void;

  /**
   * スケジューラーを停止する
   *
   * タイマーをクリアし、監視を停止する。
   * 未稼働状態で呼び出してもエラーは発生しない。
   */
  stop(): void;

  /**
   * 新しいexpiresAtでスケジューラーをリセットする
   *
   * 現在のタイマーをクリアし、新しいexpiresAtに基づいてタイマーを再設定する。
   * リフレッシュ成功後の再スケジュールに使用する。
   * 未稼働状態で呼び出してもエラーは発生しない。
   *
   * @param newExpiresAt 新しい有効期限（ミリ秒単位のUnixタイムスタンプ）
   */
  reset(newExpiresAt: number): void;

  /**
   * スケジューラーの稼働状態を取得する
   * @returns タイマーが設定されている場合はtrue
   */
  isRunning(): boolean;

  /**
   * リフレッシュ処理中かどうかを取得する
   * @returns リフレッシュ処理実行中の場合はtrue
   */
  isRefreshing(): boolean;

  /**
   * クリーンアップ（アプリ終了時に呼び出す）
   *
   * stop()を実行し、コールバック参照を解放する。
   * dispose()後のstart/reset呼び出しは無視される。
   */
  dispose(): void;
}
````

---

## 2. authSlice 追加インターフェース

### 2.1 追加状態型

```typescript
/**
 * authSliceに追加する状態フィールド
 */
interface AuthSliceRefreshState {
  /** リフレッシュ処理中フラグ（UI表示用） */
  isRefreshing: boolean;

  /** 最終リフレッシュ成功日時（ミリ秒タイムスタンプ、デバッグ用） */
  lastRefreshAt: number | null;
}
```

### 2.2 追加初期状態

```typescript
const initialAuthRefreshState: AuthSliceRefreshState = {
  isRefreshing: false,
  lastRefreshAt: null,
};
```

---

## 3. IPC インターフェース

### 3.1 既存チャネル（変更なし）

| チャネル名           | 方向          | リクエスト型 | レスポンス型               |
| -------------------- | ------------- | ------------ | -------------------------- |
| `auth:refresh`       | Renderer→Main | なし         | `IPCResponse<AuthSession>` |
| `auth:login`         | Renderer→Main | LoginParams  | `IPCResponse<AuthSession>` |
| `auth:logout`        | Renderer→Main | なし         | `IPCResponse<void>`        |
| `AUTH_STATE_CHANGED` | Main→Renderer | -            | `AuthSession \| null`      |

### 3.2 IPCResponse型（既存）

```typescript
interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: number;
}
```

### 3.3 AuthSession型（既存）

```typescript
interface AuthSession {
  accessToken: string; // Main Process内のみ使用
  refreshToken: string; // Main Process内のみ使用
  expiresAt: number; // Rendererにも送信（ミリ秒タイムスタンプ）
  user: AuthUser;
}
```

**注意**: Rendererに送信するAuthSessionからはaccessTokenとrefreshTokenを除外する。sessionExpiresAt（数値）とuser情報のみを送信する。

---

## 4. 統合ポイント契約

### 4.1 Main Process内部

| 呼び出し元            | 呼び出し先            | 契約                                                   |
| --------------------- | --------------------- | ------------------------------------------------------ |
| authHandlers          | TokenRefreshScheduler | `start(expiresAt, callbacks)` / `stop()` / `dispose()` |
| TokenRefreshScheduler | supabase.auth         | `refreshSession()` → `{ data: { session } }`           |
| TokenRefreshScheduler | secureStorage         | `storeRefreshToken(token)` → `void`                    |
| authHandlers          | secureStorage         | `getRefreshToken()` → `string \| null`                 |

### 4.2 Main → Renderer

| イベント           | ペイロード            | 用途                     |
| ------------------ | --------------------- | ------------------------ |
| AUTH_STATE_CHANGED | `{ expiresAt, user }` | リフレッシュ成功時の更新 |
| AUTH_STATE_CHANGED | `null`                | ログアウト通知           |

### 4.3 型安全性の保証

- `expiresAt`は常にミリ秒単位のUnixタイムスタンプ（`number`型）
- Supabaseの`expires_at`（秒単位）からの変換は`authHandlers.ts`内の1箇所で実施
- スケジューラー内部では単位変換を行わない（ミリ秒前提）
- `TokenRefreshCallbacks.onRefresh()`の戻り値は`number`（ミリ秒）または`null`（失敗）
