# Phase 5 成果物: 実装レポート（TDD: Green）

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 5                             |
| 機能名   | auth-session-refresh          |
| タスクID | TASK-AUTH-SESSION-REFRESH-001 |
| 作成日   | 2026-02-06                    |
| 文書種別 | 実装レポート                  |

---

## 1. 実装概要

Phase 4 で作成した26テストケースを全てGreen（成功）にするために、以下のファイルを新規作成・変更した。

### 1.1 新規作成ファイル

| ファイル                                                  | 内容                               |
| --------------------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/main/services/tokenRefreshScheduler.ts` | TokenRefreshScheduler クラスの実装 |

### 1.2 変更ファイル

| ファイル                                                 | 変更内容                                             |
| -------------------------------------------------------- | ---------------------------------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.ts`              | スケジューラーの統合（start/stop/dispose関数の追加） |
| `apps/desktop/src/main/infrastructure/supabaseClient.ts` | `autoRefreshToken: true` → `false` への変更          |
| `apps/desktop/src/renderer/store/slices/authSlice.ts`    | `isRefreshing: boolean` フィールドの追加             |
| `packages/shared/types/auth.ts`                          | `sessionExpiresAt?: number` フィールドの追加         |

---

## 2. 型定義

### 2.1 TokenRefreshSchedulerConfig インターフェース

| プロパティ              | 型       | デフォルト値 | 説明                                     |
| ----------------------- | -------- | ------------ | ---------------------------------------- |
| `refreshBeforeExpiryMs` | `number` | `300000`     | 有効期限の何ミリ秒前にリフレッシュするか |
| `maxRetries`            | `number` | `3`          | リフレッシュ失敗時の最大リトライ回数     |
| `retryBaseIntervalMs`   | `number` | `1000`       | リトライの基準間隔（ミリ秒）             |
| `jitterMaxMs`           | `number` | `500`        | リトライ間隔に加算するジッターの最大値   |

### 2.2 TokenRefreshCallbacks インターフェース

| コールバック | シグネチャ                             | 説明                                     |
| ------------ | -------------------------------------- | ---------------------------------------- |
| `onRefresh`  | `() => Promise<{ expiresAt: number }>` | リフレッシュ実行（Supabase API呼び出し） |
| `onSuccess`  | `(expiresAt: number) => void`          | リフレッシュ成功時の後処理               |
| `onFailure`  | `(error: Error) => void`               | 全リトライ失敗後の処理                   |

### 2.3 DEFAULT_CONFIG 定数

| 定数名                  | 値       | 説明                           |
| ----------------------- | -------- | ------------------------------ |
| `refreshBeforeExpiryMs` | `300000` | 5分前（300秒 = 300,000ミリ秒） |
| `maxRetries`            | `3`      | 最大3回リトライ                |
| `retryBaseIntervalMs`   | `1000`   | 1秒（1,000ミリ秒）             |
| `jitterMaxMs`           | `500`    | 0〜500ミリ秒のランダム遅延     |

---

## 3. TokenRefreshScheduler クラス設計

### 3.1 パブリックメソッド

| メソッド       | シグネチャ                    | 説明                                                      |
| -------------- | ----------------------------- | --------------------------------------------------------- |
| `constructor`  | `(config?, callbacks)`        | 設定とコールバックを受け取りインスタンス生成              |
| `start`        | `(expiresAt: number) => void` | 指定された有効期限に基づきリフレッシュタイマーを開始      |
| `stop`         | `() => void`                  | タイマーを停止し、リフレッシュ予約をキャンセル            |
| `reset`        | `(expiresAt: number) => void` | 新しい有効期限でタイマーをリセット・再スケジュール        |
| `dispose`      | `() => void`                  | 全リソースを解放（タイマークリア + コールバック参照解放） |
| `isRunning`    | `() => boolean`               | スケジューラーが実行中かどうかを返す                      |
| `isRefreshing` | `() => boolean`               | 現在リフレッシュ処理中かどうかを返す                      |

### 3.2 内部メソッド

| メソッド           | 説明                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| `_scheduleRefresh` | `expiresAt - refreshBeforeExpiryMs - Date.now()` で遅延計算、`setTimeout` 設定     |
| `_executeRefresh`  | `_isRefreshing` フラグで排他制御、`onRefresh()` コールバック呼び出し               |
| `_retryRefresh`    | 指数バックオフ（`retryBaseIntervalMs * 2^retryCount`）+ ジッター（0〜jitterMaxMs） |
| `_clearTimer`      | `clearTimeout()` でタイマーをクリア、`_timerId = null`                             |

### 3.3 内部状態

| 状態変数            | 型                            | 説明                                  |
| ------------------- | ----------------------------- | ------------------------------------- | ------------------------------------- |
| `_timerId`          | `NodeJS.Timeout               | null`                                 | 現在のタイマーID                      |
| `_isRunning`        | `boolean`                     | スケジューラー実行状態                |
| `_isRefreshing`     | `boolean`                     | リフレッシュ処理中フラグ（排他制御）  |
| `_disposed`         | `boolean`                     | dispose済みフラグ（以降の操作を無視） |
| `_currentExpiresAt` | `number                       | null`                                 | 現在スケジュール中の有効期限          |
| `_callbacks`        | `TokenRefreshCallbacks        | null`                                 | コールバック参照（dispose時にnull化） |
| `_config`           | `TokenRefreshSchedulerConfig` | 設定（不変）                          |

---

## 4. リフレッシュフロー

### 4.1 正常フロー

```
start(expiresAt)
  → _scheduleRefresh(expiresAt)
    → setTimeout(callback, delay)  [delay = expiresAt - refreshBeforeExpiryMs - Date.now()]
      → _executeRefresh()
        → _isRefreshing = true
        → onRefresh()  [Supabase refreshSession()]
        → onSuccess(newExpiresAt)
        → _isRefreshing = false
        → reset(newExpiresAt)  [次回リフレッシュを再スケジュール]
```

### 4.2 リトライフロー

```
_executeRefresh()
  → onRefresh() throws Error
  → _retryRefresh(retryCount=0)
    → setTimeout(retry, 1000 + jitter)  [1回目リトライ]
      → onRefresh() throws Error
      → _retryRefresh(retryCount=1)
        → setTimeout(retry, 2000 + jitter)  [2回目リトライ]
          → onRefresh() throws Error
          → _retryRefresh(retryCount=2)
            → setTimeout(retry, 4000 + jitter)  [3回目リトライ]
              → onRefresh() throws Error
              → retryCount >= maxRetries
              → onFailure(error)
              → stop()
```

### 4.3 リトライ間隔テーブル

| リトライ回数 | ベース遅延             | ジッター範囲 | 合計遅延範囲   |
| ------------ | ---------------------- | ------------ | -------------- |
| 0（1回目）   | 1,000ms (`1000 * 2^0`) | 0〜500ms     | 1,000〜1,500ms |
| 1（2回目）   | 2,000ms (`1000 * 2^1`) | 0〜500ms     | 2,000〜2,500ms |
| 2（3回目）   | 4,000ms (`1000 * 2^2`) | 0〜500ms     | 4,000〜4,500ms |

---

## 5. authHandlers.ts 統合

### 5.1 追加された関数

| 関数名                         | 説明                                                             |
| ------------------------------ | ---------------------------------------------------------------- |
| `startTokenRefreshScheduler`   | スケジューラーインスタンスを生成し `start(expiresAt)` を呼び出す |
| `stopTokenRefreshScheduler`    | スケジューラーの `stop()` を呼び出し、タイマーを停止             |
| `disposeTokenRefreshScheduler` | スケジューラーの `dispose()` を呼び出し、全リソースを解放        |

### 5.2 統合ポイント

| トリガー                 | 呼び出し                         | 説明                               |
| ------------------------ | -------------------------------- | ---------------------------------- |
| `processAuthCallback`    | `startTokenRefreshScheduler()`   | ログイン成功後にスケジューラー開始 |
| `auth:logout` ハンドラー | `stopTokenRefreshScheduler()`    | ログアウト時にスケジューラー停止   |
| `app.on('before-quit')`  | `disposeTokenRefreshScheduler()` | アプリ終了時にリソース解放         |

---

## 6. supabaseClient.ts 変更

| 設定               | 変更前 | 変更後  | 理由                                                  |
| ------------------ | ------ | ------- | ----------------------------------------------------- |
| `autoRefreshToken` | `true` | `false` | カスタムスケジューラーとのSDK自動リフレッシュ競合防止 |

---

## 7. authSlice.ts / auth.ts 変更

### 7.1 authSlice.ts

| 追加フィールド | 型        | 初期値  | 説明                         |
| -------------- | --------- | ------- | ---------------------------- |
| `isRefreshing` | `boolean` | `false` | リフレッシュ処理中の状態表示 |

### 7.2 packages/shared/types/auth.ts

| 追加フィールド     | 型                    | 説明                                 |
| ------------------ | --------------------- | ------------------------------------ |
| `sessionExpiresAt` | `number \| undefined` | セッション有効期限（ミリ秒UnixTime） |

---

## 8. TDD Green 確認

| 項目           | 結果                   |
| -------------- | ---------------------- |
| テストケース数 | 26                     |
| Green（成功）  | 26/26                  |
| Red（失敗）    | 0                      |
| 実行時間       | Phase 4 → Phase 5 完了 |

**Phase 5 完了条件**: 全26テストがGreen（成功）であることを確認済み。

---

## 9. 参照資料

| 資料名               | パス                                      |
| -------------------- | ----------------------------------------- |
| テスト作成レポート   | `outputs/phase-4/test-creation-report.md` |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`  |
| インターフェース定義 | `outputs/phase-2/interface-definition.md` |
| 設計レビュー結果     | `outputs/phase-3/design-review-result.md` |

---

## 次のステップ

**Phase 6: テスト拡充** へ進行する。

カバレッジ不足の箇所を特定し、追加テストを作成する。
