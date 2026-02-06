# Phase 1 成果物: スコープ定義

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 1                             |
| 機能名   | auth-session-refresh          |
| タスクID | TASK-AUTH-SESSION-REFRESH-001 |
| 作成日   | 2026-02-06                    |
| 文書種別 | スコープ定義書                |

---

## 1. スコープ内（実装対象）

### 1.1 新規作成

| 対象                                | ファイルパス（予定）                                                     | 説明                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| TokenRefreshSchedulerクラス         | `apps/desktop/src/main/services/tokenRefreshScheduler.ts`                | Main Processで動作するスケジューラー。setTimeout、リトライ、排他制御 |
| TokenRefreshSchedulerユニットテスト | `apps/desktop/src/main/services/__tests__/tokenRefreshScheduler.test.ts` | スケジューラーの全メソッド・エッジケーステスト                       |

### 1.2 既存ファイルの修正

| 対象                 | ファイルパス                                               | 修正内容                                                              |
| -------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| authHandlers.ts      | `apps/desktop/src/main/ipc/authHandlers.ts`                | スケジューラー初期化・連携。ログイン成功時のstart、ログアウト時のstop |
| supabaseClient.ts    | `apps/desktop/src/main/infrastructure/supabaseClient.ts`   | `autoRefreshToken: true` → `autoRefreshToken: false`設定変更          |
| authSlice.ts         | `apps/desktop/src/renderer/store/slices/authSlice.ts`      | isRefreshing状態追加、AUTH_STATE_CHANGED連携の改善                    |
| authHandlers.test.ts | `apps/desktop/src/main/ipc/__tests__/authHandlers.test.ts` | スケジューラー連携のテスト追加                                        |

### 1.3 機能サマリ

1. **TokenRefreshScheduler実装**（Main Process）
   - setTimeoutベースのスケジューリング
   - コールバックDIパターン（onRefresh, onFailure, onSuccess）
   - 指数バックオフリトライ（最大3回、1s→2s→4s + ジッター0〜500ms）
   - 排他制御（`_isRefreshing`フラグ）
   - dispose()によるクリーンアップ（タイマークリア + コールバック参照解放）

2. **authHandlers.ts統合**（IPC - リフレッシュハンドラー改善）
   - ログイン成功時にスケジューラー開始（`expires_at * 1000`でミリ秒変換）
   - ログアウト時にスケジューラー停止
   - `app.on('before-quit')`でdispose()呼び出し
   - onRefreshコールバック: `supabase.auth.refreshSession()` + SecureStorage更新 + AUTH_STATE_CHANGED通知

3. **authSlice修正**（Renderer Process - 自動リフレッシュ連携）
   - isRefreshing状態の追加
   - sessionExpiresAtのAUTH_STATE_CHANGEDイベントによる更新

4. **supabaseClient.ts設定変更**
   - `autoRefreshToken: true` → `autoRefreshToken: false`に変更
   - カスタムスケジューラーとの競合防止

5. **リフレッシュ失敗時のフォールバック処理**
   - 全リトライ失敗 → onFailure → スケジューラー停止 → clearTokens → signOut → AUTH_STATE_CHANGED(null) → clearAuth → ログイン画面遷移

6. **ユニットテスト追加**
   - TokenRefreshSchedulerの全パブリックメソッド（start, stop, reset, dispose, isRunning, isRefreshing）
   - リトライロジック（成功、部分成功、全失敗）
   - エッジケース（expiresAtが過去の値、二重start、dispose後の操作、排他制御）

---

## 2. スコープ外（実装対象外）

| 対象                                           | 理由                                                           | 別タスクID         |
| ---------------------------------------------- | -------------------------------------------------------------- | ------------------ |
| PKCE実装（DEBT-SEC-002）                       | セキュリティ負債として別途管理。Implicit Flowの現行方式を維持  | DEBT-SEC-002       |
| オフライントークンキャッシュ                   | ネットワーク接続管理は別の機能範囲。オフライン時は許容         | 別タスク（未定義） |
| マルチウィンドウサポート                       | 現行アプリはシングルウィンドウ設計。マルチウィンドウ対応は別途 | 別タスク（未定義） |
| トークンローテーション                         | Supabase SDK側で管理される機能であり、本タスクの範囲外         | -                  |
| ログイン履歴記録                               | 監査ログ機能として別タスクで対応                               | AUDIT-001          |
| State parameter検証（DEBT-SEC-001）            | セキュリティ負債として別途管理                                 | DEBT-SEC-001       |
| ユーザー通知UI（リフレッシュ失敗時のモーダル） | ログアウト通知のUI実装は別タスク（現状はログイン画面遷移のみ） | 別タスク（未定義） |

---

## 3. 影響範囲

### 3.1 直接影響

| コンポーネント    | 影響度 | 説明                                                                    |
| ----------------- | ------ | ----------------------------------------------------------------------- |
| authHandlers.ts   | 高     | スケジューラー初期化・連携ロジックの追加。ログイン/ログアウトフロー変更 |
| supabaseClient.ts | 中     | autoRefreshToken設定の変更。既存のSDK動作に影響                         |
| authSlice.ts      | 低     | isRefreshing/lastRefreshAt状態追加のみ。既存ロジックの変更は最小限      |

### 3.2 間接影響

| コンポーネント             | 影響度 | 説明                                                               |
| -------------------------- | ------ | ------------------------------------------------------------------ |
| preload/channels.ts        | なし   | 既存の`auth:refresh`チャネルを使用。新規チャネル不要               |
| secureStorage.ts           | なし   | 既存のstoreRefreshToken/getRefreshToken APIを使用。変更なし        |
| AUTH_STATE_CHANGEDリスナー | 低     | 既存リスナーがリフレッシュ成功時の新セッションも受信するようになる |

### 3.3 リスク

| リスク                                     | 確率 | 影響 | 軽減策                                                        |
| ------------------------------------------ | ---- | ---- | ------------------------------------------------------------- |
| autoRefreshToken無効化による既存動作の変化 | 中   | 高   | カスタムスケジューラーが同等以上の機能を提供する              |
| 二重リフレッシュ（移行期間中）             | 低   | 中   | `_isRefreshing`フラグによる排他制御                           |
| タイマーのメモリリーク                     | 低   | 中   | dispose()メソッドとbefore-quitフックで確実にクリーンアップ    |
| 単位変換の誤り（秒/ミリ秒）                | 中   | 高   | 変換処理をauthHandlers.tsに一箇所集約し、ユニットテストで検証 |
| リグレッション（既存テスト失敗）           | 低   | 高   | 既存テストを全て実行し、PASS確認後にマージ                    |

---

## 4. 前提条件

1. Supabase SDK (`@supabase/supabase-js`) の`refreshSession()`メソッドが正常に動作すること
2. SecureStorage（`electron.safeStorage`）が利用可能であること
3. `auth:refresh` IPCチャネルが既存のチャネルホワイトリスト（`preload/channels.ts`）に登録済みであること
4. Electronの`app.on('before-quit')`イベントが正常に発火すること
5. OAuth認証（ログイン機能復旧プロジェクト T-02-1〜T-09-1）が完了していること

---

## 5. 依存関係

| 依存先               | 種類       | 説明                                                |
| -------------------- | ---------- | --------------------------------------------------- |
| Supabase Auth API    | 外部       | `refreshSession()`によるトークンリフレッシュ        |
| electron.safeStorage | ランタイム | Refresh Tokenの暗号化保存                           |
| authHandlers.ts      | 内部       | 既存のauth:login/auth:logout/auth:refreshハンドラー |
| authSlice.ts         | 内部       | 既存のauthState管理（sessionExpiresAt等）           |
| IPC channels.ts      | 内部       | チャネルホワイトリスト（auth:refresh登録済み）      |
| secureStorage.ts     | 内部       | storeRefreshToken/getRefreshToken/clearTokens API   |

---

## 6. 成果物一覧

| Phase | 成果物                   | ファイルパス                                                             |
| ----- | ------------------------ | ------------------------------------------------------------------------ |
| 4-5   | TokenRefreshScheduler    | `apps/desktop/src/main/services/tokenRefreshScheduler.ts`                |
| 4-6   | スケジューラーテスト     | `apps/desktop/src/main/services/__tests__/tokenRefreshScheduler.test.ts` |
| 5     | authHandlers.ts修正      | `apps/desktop/src/main/ipc/authHandlers.ts`                              |
| 5     | supabaseClient.ts修正    | `apps/desktop/src/main/infrastructure/supabaseClient.ts`                 |
| 5     | authSlice.ts修正         | `apps/desktop/src/renderer/store/slices/authSlice.ts`                    |
| 6     | authHandlers.test.ts追加 | `apps/desktop/src/main/ipc/__tests__/authHandlers.test.ts`               |
