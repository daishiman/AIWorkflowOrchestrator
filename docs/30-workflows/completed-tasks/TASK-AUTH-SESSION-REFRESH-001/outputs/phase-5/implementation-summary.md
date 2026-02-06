# Phase 5 成果物: 実装サマリー

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 5                             |
| 機能名   | auth-session-refresh          |
| タスクID | TASK-AUTH-SESSION-REFRESH-001 |
| 作成日   | 2026-02-06                    |
| 文書種別 | 実装サマリー                  |

---

## 1. 実装概要

Phase 4で作成したテスト（Red状態）を全て通すための最小限の実装を行い、Green状態を達成した。

### 1.1 変更ファイル一覧

| ファイル                 | パス                                                      | 変更種別 | 説明                            |
| ------------------------ | --------------------------------------------------------- | -------- | ------------------------------- |
| tokenRefreshScheduler.ts | `apps/desktop/src/main/services/tokenRefreshScheduler.ts` | 新規作成 | スケジューラー本体の実装        |
| authHandlers.ts          | `apps/desktop/src/main/ipc/authHandlers.ts`               | 修正     | スケジューラー統合              |
| supabaseClient.ts        | `apps/desktop/src/main/infrastructure/supabaseClient.ts`  | 修正     | autoRefreshToken: false設定     |
| authSlice.ts             | `apps/desktop/src/renderer/store/slices/authSlice.ts`     | 修正     | isRefreshing状態追加            |
| auth.ts                  | `packages/shared/types/auth.ts`                           | 修正     | AuthStateにsessionExpiresAt追加 |

---

## 2. TokenRefreshScheduler（新規作成）

### 2.1 ファイルパス

`apps/desktop/src/main/services/tokenRefreshScheduler.ts`

### 2.2 実装内容

#### クラス構造

```
TokenRefreshScheduler
├── constructor(config?: Partial<TokenRefreshSchedulerConfig>)
├── start(expiresAt: number, callbacks: TokenRefreshCallbacks): void
├── stop(): void
├── reset(newExpiresAt: number): void
├── dispose(): void
├── isRunning(): boolean
├── isRefreshing(): boolean
├── private _scheduleRefresh(expiresAt: number): void
├── private _executeRefresh(): Promise<void>
├── private _retryRefresh(retryCount: number): Promise<void>
├── private _calculateDelay(expiresAt: number): number
├── private _calculateRetryDelay(retryCount: number): number
└── private _clearTimer(): void
```

#### 設計パターン

| パターン               | 適用箇所                                                 | 目的                                 |
| ---------------------- | -------------------------------------------------------- | ------------------------------------ |
| コールバックDI         | `TokenRefreshCallbacks`（onRefresh/onFailure/onSuccess） | テスタビリティ確保                   |
| 指数バックオフリトライ | `_retryRefresh()` / `_calculateRetryDelay()`             | 一時的ネットワーク障害への耐性       |
| 排他制御               | `_isRefreshing`フラグ                                    | 二重リフレッシュ防止                 |
| setTimeout             | `_scheduleRefresh()`                                     | 1回限りのタイマー（reset()で再設定） |

#### デフォルト設定（DEFAULT_CONFIG）

```typescript
const DEFAULT_CONFIG: TokenRefreshSchedulerConfig = {
  refreshBeforeExpiryMs: 300_000, // 5分（300秒）
  maxRetries: 3,
  retryBaseIntervalMs: 1_000, // 1秒
};
```

#### 排他制御の仕組み

1. `_executeRefresh()`の先頭で`_isRefreshing`をチェック
2. `true`の場合はリフレッシュをスキップ（warn ログ出力）
3. リフレッシュ開始時に`_isRefreshing = true`に設定
4. リフレッシュ完了時（成功/失敗/全リトライ失敗）に`_isRefreshing = false`にリセット

#### リトライ遅延計算

```
delay = retryBaseIntervalMs * (2 ** retryCount) + Math.random() * 500
```

| リトライ回数 | ベース遅延 | ジッター範囲 | 合計遅延範囲   |
| ------------ | ---------- | ------------ | -------------- |
| 0（1回目）   | 1,000ms    | 0〜500ms     | 1,000〜1,500ms |
| 1（2回目）   | 2,000ms    | 0〜500ms     | 2,000〜2,500ms |
| 2（3回目）   | 4,000ms    | 0〜500ms     | 4,000〜4,500ms |

#### ログ出力

| タイミング           | ログレベル | メッセージ                                                               |
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

---

## 3. authHandlers.ts（修正）

### 3.1 変更内容

| 変更箇所                | 変更内容                                                                      |
| ----------------------- | ----------------------------------------------------------------------------- |
| モジュールスコープ      | `tokenRefreshScheduler`シングルトンインスタンスの保持                         |
| `auth:login`ハンドラー  | ログイン成功後に`scheduler.start(expiresAt, callbacks)`呼び出しを追加         |
| `auth:logout`ハンドラー | ログアウト時に`scheduler.stop()`呼び出しを追加                                |
| `app.on('before-quit')` | アプリ終了時に`scheduler.dispose()`呼び出しを追加                             |
| onRefreshコールバック   | `supabase.auth.refreshSession()` + SecureStorage更新 + AUTH_STATE_CHANGED通知 |
| onFailureコールバック   | `clearTokens()` + `supabase.auth.signOut()` + `AUTH_STATE_CHANGED(null)` 通知 |

### 3.2 スケジューラーインスタンス管理

```
モジュールスコープ
└── let tokenRefreshScheduler: TokenRefreshScheduler | null = null;
    ├── getScheduler(): 遅延初期化でシングルトンインスタンスを取得
    ├── auth:login成功時: getScheduler().start(expires_at * 1000, callbacks)
    ├── auth:logout時: getScheduler().stop()
    └── before-quit時: getScheduler().dispose(); tokenRefreshScheduler = null;
```

### 3.3 単位変換

- Supabaseの`expires_at`（秒単位のUnixタイムスタンプ）を`* 1000`でミリ秒に変換
- 変換はauthHandlers.ts内の1箇所に集約
- スケジューラー内部では単位変換を行わない（ミリ秒前提）

---

## 4. supabaseClient.ts（修正）

### 4.1 変更内容

| 変更箇所           | 変更前 | 変更後  |
| ------------------ | ------ | ------- |
| `autoRefreshToken` | `true` | `false` |

### 4.2 変更理由

- `autoRefreshToken: true`はSupabase SDKがAPI呼び出し時にトークン期限切れを検出してリフレッシュを実行する
- カスタムTokenRefreshSchedulerは能動的に有効期限5分前にリフレッシュを実行する
- 両方が有効だと同時リフレッシュが発生し、競合状態（race condition）になる
- カスタムスケジューラーのみがリフレッシュを管理するように変更した

---

## 5. authSlice.ts（修正）

### 5.1 追加状態

| フィールド      | 型               | 初期値  | 説明                                   |
| --------------- | ---------------- | ------- | -------------------------------------- |
| `isRefreshing`  | `boolean`        | `false` | リフレッシュ処理中フラグ（UI表示用）   |
| `lastRefreshAt` | `number \| null` | `null`  | 最終リフレッシュ成功日時（デバッグ用） |

### 5.2 状態更新フロー

1. **リフレッシュ成功時**: AUTH_STATE_CHANGEDイベント受信 → `sessionExpiresAt`更新、`lastRefreshAt`更新
2. **リフレッシュ失敗時**: AUTH_STATE_CHANGED(null)受信 → `clearAuth()`実行（全状態リセット）
3. **clearAuth()時**: isRefreshing=false、lastRefreshAt=null にリセット

### 5.3 設計上の注意点

- スケジューラーはMain Process側のみで管理。Renderer側はスケジューラーを直接操作しない
- `isRefreshing`はMainからのイベントで間接的に更新される
- 既存の`onAuthStateChanged`リスナーと競合しない（同じAUTH_STATE_CHANGEDイベントを活用）

---

## 6. packages/shared/types/auth.ts（修正）

### 6.1 追加フィールド

| 型名        | 追加フィールド     | 型               | 説明                                       |
| ----------- | ------------------ | ---------------- | ------------------------------------------ |
| `AuthState` | `sessionExpiresAt` | `number \| null` | セッション有効期限（ミリ秒タイムスタンプ） |

---

## 7. TDD Green状態の確認

### 7.1 テスト実行結果

```bash
pnpm --filter @repo/desktop test:run tokenRefreshScheduler.test.ts
# 結果: 26 passed（Green状態）
```

### 7.2 テスト結果サマリー

| カテゴリ      | 件数   | 結果       |
| ------------- | ------ | ---------- |
| 基本動作      | 4      | PASS       |
| タイミング    | 3      | PASS       |
| 成功          | 2      | PASS       |
| リトライ      | 4      | PASS       |
| reset/dispose | 3      | PASS       |
| エッジケース  | 8      | PASS       |
| カスタム設定  | 2      | PASS       |
| **合計**      | **26** | **全PASS** |

---

## 8. 既存テストへの影響

| テストファイル       | 結果 | 備考                                          |
| -------------------- | ---- | --------------------------------------------- |
| authHandlers.test.ts | PASS | スケジューラー連携の追加テストはPhase 6で実施 |
| authSlice.test.ts    | PASS | isRefreshing状態の追加テストはPhase 6で実施   |
| 全テスト（desktop）  | PASS | リグレッションなし                            |
