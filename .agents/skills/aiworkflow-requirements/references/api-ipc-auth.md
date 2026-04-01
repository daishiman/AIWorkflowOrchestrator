# Desktop IPC API（認証・プロフィール）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [api-endpoints.md](./api-endpoints.md)

---

## 認証 IPC チャネル

Electron Desktop アプリでは、IPC 通信で認証機能を提供する。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/authHandlers.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload公開: `apps/desktop/src/preload/index.ts`

### チャンネル一覧

| チャネル            | 用途                 | Request                       | Response                           | 実装箇所                                  | セキュリティ       |
| ------------------- | -------------------- | ----------------------------- | ---------------------------------- | ----------------------------------------- | ------------------ |
| `auth:login`        | OAuth ログイン開始   | `{ provider: OAuthProvider }` | `IPCResponse<void>`                | `authHandlers.ts`（registerAuthHandlers） | withValidation適用 |
| `auth:logout`       | ログアウト           | なし                          | `IPCResponse<void>`                | `authHandlers.ts`（registerAuthHandlers） | withValidation適用 |
| `auth:get-session`  | セッション取得       | なし                          | `IPCResponse<AuthSession>`         | `authHandlers.ts`（registerAuthHandlers） | withValidation適用 |
| `auth:refresh`      | トークンリフレッシュ | なし                          | `IPCResponse<AuthSession>`         | `authHandlers.ts`（registerAuthHandlers） | withValidation適用 |
| `auth:check-online` | オンライン状態確認   | なし                          | `IPCResponse<{ online: boolean }>` | `authHandlers.ts`（registerAuthHandlers） | withValidation適用 |

### auth:login の応答セマンティクス（TASK-FIX-AUTH-IPC-001）

`auth:login` は **fire-and-forget** パターンで動作する。

| 項目            | 詳細                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| 応答タイミング  | プロバイダー検証後、OAuth フロー開始と同時に即時返却                                                   |
| 成功レスポンス  | `{ success: true }` — OAuth 完了を待たない                                                             |
| 失敗レスポンス  | `{ success: false, error: { code: AUTH_ERROR_CODES.INVALID_PROVIDER, ... } }` — バリデーション失敗のみ |
| 完了通知        | `AUTH_STATE_CHANGED`（`auth:state-changed`）イベントで `AuthFlowOrchestrator` が送信                   |
| timeout 制約    | `CHANNEL_TIMEOUTS["auth:login"] = 500ms`（`preload/ipc-utils.ts`）                                     |
| preload surface | 変更なし — `IPCResponse<void>` の型契約は維持                                                          |

**理由**: OAuth フローは外部ブラウザ認証を含み完了まで数秒〜数十秒かかる。500ms の channel timeout と共存するには、handler は「開始受付」だけを担い、完了通知は `AuthFlowOrchestrator` の `AUTH_STATE_CHANGED` に委譲する必要がある。

**注意**: `authHandlers.ts` 側では `AUTH_STATE_CHANGED` を重複送信しない。通知責務は `AuthFlowOrchestrator` に固定する。

---

### AUTH IPC登録一元化戦略（UT-IPC-AUTH-HANDLE-DUPLICATE-001）

`AUTH_*` 5チャネルは、`authHandlers.ts` 内で共通登録ヘルパー経由に統一し、登録式の重複を排除する。
非Supabase環境（fallback）も `ipc/index.ts` 側で宣言的登録へ統一し、同一チャネル群の追跡性を維持する。

| 項目         | 方針                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| 対象チャネル | `auth:login`, `auth:logout`, `auth:get-session`, `auth:refresh`, `auth:check-online` |
| 契約互換     | チャネル名・引数・戻り値・エラーコードを不変維持                                     |
| セキュリティ | 通常経路の `withValidation` を維持                                                   |
| 監査性       | `rg -n \"ipcMain\\.handle\\(\\s*IPC_CHANNELS\\.AUTH_\"` が0件であることを確認        |

#### AUTH IPC登録一元化 クイック解決ガイド（テンプレート準拠）

##### 概要

| 項目     | 内容                                                                      |
| -------- | ------------------------------------------------------------------------- |
| 目的     | AUTH 5チャネルの重複登録式を排除し、通常/fallbackの契約整合を同時に満たす |
| 前提条件 | `authHandlers.ts` と `ipc/index.ts` の両方を編集対象に含める              |
| 所要時間 | 約20〜30分（コード修正 + 検証 + 仕様同期）                                |

##### 実行ステップ

| Step | 目的         | 場所                                   | 操作手順                                                                                      | 期待結果                   | 確認方法                                                                                                                                          |
| ---- | ------------ | -------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- | ------- | ----------------------------------------- |
| 1    | 対象範囲固定 | `apps/desktop/src/main/ipc/`           | AUTH 5チャネル（login/logout/get-session/refresh/check-online）を通常経路とfallback経路で列挙 | 対象漏れがない             | `rg -n "AUTH\_(LOGIN                                                                                                                              | LOGOUT | GET_SESSION | REFRESH | CHECK_ONLINE)" apps/desktop/src/main/ipc` |
| 2    | 登録一元化   | `authHandlers.ts`, `index.ts`          | 通常経路は共通ヘルパー経由、fallbackは配列 + ループ登録へ統一                                 | 直書き重複が消える         | `rg -n "ipcMain\\.handle\\(\\s*IPC_CHANNELS\\.AUTH_" apps/desktop/src/main/ipc/authHandlers.ts apps/desktop/src/main/ipc/index.ts` が0件          |
| 3    | 回帰確認     | `apps/desktop/src/main/ipc/__tests__/` | fallback経路を含む重複登録防止テストを追加/更新                                               | 既存契約を壊さずテスト通過 | `pnpm test -- ipc-double-registration.test.ts`                                                                                                    |
| 4    | 仕様同期     | `references/` + `task-workflow.md`     | 実装内容、完了記録、苦戦箇所を同一ターンで更新                                                | 実装・仕様・台帳が一致     | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --workflow docs/30-workflows/ut-ipc-auth-handle-duplicate-001` |

##### トラブルシューティング（今回の苦戦箇所）

| 問題                                 | 原因                                                | 解決方法                                                                                        |
| ------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 通常経路だけ直しても監査ノイズが残る | fallback側の同型重複を未統合                        | Step 1で通常/fallbackを同時列挙し、Step 2を両経路同時適用                                       |
| 全体監査FAILを今回差分FAILと誤認する | baseline監査とcurrent監査の判定軸混在               | `audit-unassigned-tasks.js`（baseline）と `detect-unassigned-tasks --scan`（current）を分離記録 |
| 完了移管後に参照が古いまま残る       | `unassigned-task/` と `completed-tasks/` の同期漏れ | Phase 12でリンク更新後に `verify-unassigned-links.js` を必ず再実行                              |

---

## プロフィール IPC チャネル

| チャネル                       | 用途                     | Request                                                   | Response                             |
| ------------------------------ | ------------------------ | --------------------------------------------------------- | ------------------------------------ |
| `profile:get`                  | プロフィール取得         | なし                                                      | `IPCResponse<UserProfile>`           |
| `profile:update`               | プロフィール更新         | `{ updates: ProfileUpdateFields }`                        | `IPCResponse<UserProfile>`           |
| `profile:delete`               | プロフィール削除         | `{ confirmEmail: string }`                                | `IPCResponse<void>`                  |
| `profile:get-providers`        | 連携プロバイダー一覧     | なし                                                      | `IPCResponse<LinkedProvider[]>`      |
| `profile:link-provider`        | 新規プロバイダー連携     | `{ provider: OAuthProvider }`                             | `IPCResponse<LinkedProvider>`        |
| `profile:unlink-provider`      | プロバイダー連携解除     | `{ provider: OAuthProvider }`                             | `IPCResponse<void>`                  |
| `profile:update-timezone`      | タイムゾーン更新         | `{ timezone: Timezone }`                                  | `IPCResponse<ExtendedUserProfile>`   |
| `profile:update-locale`        | ロケール更新             | `{ locale: Locale }`                                      | `IPCResponse<ExtendedUserProfile>`   |
| `profile:update-notifications` | 通知設定更新             | `{ notificationSettings: Partial<NotificationSettings> }` | `IPCResponse<ExtendedUserProfile>`   |
| `profile:export`               | プロフィールエクスポート | なし                                                      | `IPCResponse<ProfileExportResponse>` |
| `profile:import`               | プロフィールインポート   | `{ filePath: string }`                                    | `IPCResponse<ProfileImportResponse>` |

## アバター IPC チャネル

| チャネル              | 用途              | Request                       | Response                             |
| --------------------- | ----------------- | ----------------------------- | ------------------------------------ |
| `avatar:upload`       | 画像アップロード  | なし                          | `IPCResponse<{ avatarUrl: string }>` |
| `avatar:use-provider` | Provider 画像採用 | `{ provider: OAuthProvider }` | `IPCResponse<{ avatarUrl: string }>` |
| `avatar:remove`       | アバター削除      | なし                          | `IPCResponse<void>`                  |

## Supabase 未設定時の fallback 契約

`ipc/index.ts` は Supabase 未設定時に AUTH だけでなく Profile / Avatar も fallback で応答させる。目的は Renderer 側の `No handler registered` 例外を防ぎ、`success: false` の error envelope に正規化すること。

| ドメイン | 対象チャネル数 | 登録方式                                              | 期待レスポンス                                                                       |
| -------- | -------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Auth     | 5              | fallback 配列を `for...of` で `ipcMain.handle()` 登録 | `AUTH_ERROR_CODES.AUTH_NOT_CONFIGURED` (`auth/not-configured`) または成功系 fallback |
| Profile  | 11             | `registerProfileFallbackHandlers()` で宣言的登録      | `{ success: false, error: { code: PROFILE_ERROR_CODES.NOT_CONFIGURED, message } }`   |
| Avatar   | 3              | `registerAvatarFallbackHandlers()` で宣言的登録       | `{ success: false, error: { code: AVATAR_ERROR_CODES.NOT_CONFIGURED, message } }`    |

**レビュー観点**:

- `channels.ts` に定義された件数と fallback 配列の件数が一致していること
- shared error code 定義を使い、生文字列の `*_NOT_CONFIGURED` を増やさないこと
- `createNotConfiguredResponse()` / `registerFallbackHandlers()` で fallback 実装の重複を抑えていること
- 通常経路と fallback 経路が if/else で排他になっていること
- Renderer / Preload が `success: false` を UI 分岐できること

---

## イベントチャネル（Main → Renderer）

| チャネル             | 用途             | Payload                                                                               |
| -------------------- | ---------------- | ------------------------------------------------------------------------------------- |
| `auth:state-changed` | 認証状態変更通知 | `{ authenticated: boolean; tokens?: AuthTokens; error?: string; errorCode?: string }` |

**Payload詳細（TASK-FIX-GOOGLE-LOGIN-001で拡張）**:

| フィールド    | 型                      | 説明                                       |
| ------------- | ----------------------- | ------------------------------------------ |
| authenticated | boolean                 | 認証状態                                   |
| tokens        | AuthTokens \| undefined | 認証トークン情報                           |
| expiresAt     | number \| undefined     | セッション有効期限（UNIXタイムスタンプ秒） |
| error         | string \| undefined     | エラーメッセージ（日本語）                 |
| errorCode     | string \| undefined     | エラーコード（AUTH_ERROR_CODES値）         |

**既知のerrorCode値**:

| errorCode              | 発生条件                                        | 追加タスク                 |
| ---------------------- | ----------------------------------------------- | -------------------------- |
| CSRF_VALIDATION_FAILED | state parameter欠落・不正形式・期限切れ・不一致 | DEBT-SEC-001（2026-02-06） |
| AUTH_CALLBACK_ERROR    | OAuthコールバックでerrorパラメータ検出          | TASK-FIX-GOOGLE-LOGIN-001  |
| TOKEN_EXCHANGE_FAILED  | トークン交換失敗                                | TASK-FIX-GOOGLE-LOGIN-001  |
| SESSION_NOT_FOUND      | セッション取得失敗                              | TASK-FIX-GOOGLE-LOGIN-001  |

---

## 型定義

### OAuthProvider

対応するOAuth認証プロバイダーの列挙型。許可値は「google」「github」「discord」の3種類。

### AuthSession

認証セッション情報を表すインターフェース。

| フィールド            | 型                  | 説明                                   |
| --------------------- | ------------------- | -------------------------------------- |
| user                  | AuthUser            | 認証済みユーザー情報                   |
| accessToken           | string              | アクセストークン                       |
| refreshToken          | string              | リフレッシュトークン                   |
| expiresAt             | number              | トークン有効期限（UNIXタイムスタンプ） |
| isOffline             | boolean             | オフラインモードフラグ                 |
| refreshTokenExpiresAt | number \| undefined | リフレッシュトークン有効期限（7日後）  |

### UserProfile

ユーザープロフィール情報を表すインターフェース。

| フィールド  | 型                            | 説明               |
| ----------- | ----------------------------- | ------------------ |
| id          | string                        | ユーザー一意識別子 |
| displayName | string                        | 表示名             |
| email       | string                        | メールアドレス     |
| avatarUrl   | string または null            | アバター画像URL    |
| plan        | "free" / "pro" / "enterprise" | 契約プラン         |
| createdAt   | string                        | アカウント作成日時 |
| updatedAt   | string                        | 最終更新日時       |

### LinkedProvider

連携済みプロバイダー情報を表すインターフェース。

| フィールド  | 型                 | 説明                       |
| ----------- | ------------------ | -------------------------- |
| provider    | OAuthProvider      | プロバイダー種別           |
| providerId  | string             | プロバイダー側のユーザーID |
| email       | string または null | プロバイダーのメール       |
| displayName | string または null | プロバイダーの表示名       |
| avatarUrl   | string または null | プロバイダーのアバターURL  |
| linkedAt    | string             | 連携日時                   |

### IPCResponse

IPC通信の共通レスポンス型。ジェネリクス型Tでデータ型を指定。

| フィールド | 型                                              | 説明                     |
| ---------- | ----------------------------------------------- | ------------------------ |
| success    | boolean                                         | 処理成功フラグ           |
| data       | T（オプション）                                 | 成功時のレスポンスデータ |
| error      | { code: string; message: string }（オプション） | エラー情報               |

---

## 認証状態管理

### 状態遷移

| 遷移元          | 遷移先          | トリガー条件       |
| --------------- | --------------- | ------------------ |
| checking        | authenticated   | セッション復元成功 |
| checking        | unauthenticated | セッションなし     |
| unauthenticated | authenticated   | ログイン成功       |
| authenticated   | unauthenticated | ログアウト         |

### 状態とUI表示の対応

| 状態            | AuthGuard表示内容 | 説明                   |
| --------------- | ----------------- | ---------------------- |
| checking        | LoadingScreen     | セッション確認中       |
| authenticated   | children          | 認証済み（メインUI）   |
| unauthenticated | AuthView          | 未認証（ログイン画面） |

### 実装コンポーネント

| コンポーネント | ファイル                                     | 責務                   |
| -------------- | -------------------------------------------- | ---------------------- |
| AuthGuard      | `components/AuthGuard/index.tsx`             | 認証状態による表示制御 |
| useAuthState   | `components/AuthGuard/hooks/useAuthState.ts` | 認証状態取得フック     |
| getAuthState   | `components/AuthGuard/utils/getAuthState.ts` | 状態判定純粋関数       |
| LoadingScreen  | `components/AuthGuard/LoadingScreen.tsx`     | ローディング画面       |
| AuthView       | `views/AuthView/index.tsx`                   | ログイン画面           |

---

## IPCセキュリティ実装

### withValidationラッパー

すべての認証関連IPCハンドラーは`withValidation`でラップされ、以下を検証:

1. webContentsに対応するBrowserWindowの存在確認
2. DevToolsからの呼び出し検出・拒否
3. 許可されたウィンドウリストとの照合

**実装ファイル**: `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`

### チャンネルホワイトリスト

認証関連チャンネルは`apps/desktop/src/preload/channels.ts`で明示的に許可リストに登録される。

**許可リスト構成（ALLOWED_CHANNELS）**:

| 種別   | 用途                     | 登録チャンネル                                                                |
| ------ | ------------------------ | ----------------------------------------------------------------------------- |
| invoke | Renderer→Main 呼び出し用 | auth:login, auth:logout, auth:get-session, auth:refresh, auth:check-online 等 |
| on     | Main→Renderer イベント用 | auth:state-changed 等                                                         |

このホワイトリストに登録されていないチャンネルへのアクセスはPreloadスクリプトでブロックされる。

---

## セッション自動リフレッシュ（TASK-AUTH-SESSION-REFRESH-001）

### TokenRefreshScheduler

Main Process上で動作するセッション自動リフレッシュスケジューラー。

**実装ファイル**: `apps/desktop/src/main/services/tokenRefreshScheduler.ts`

| 項目                   | 値                                                    |
| ---------------------- | ----------------------------------------------------- |
| スケジューリング方式   | setTimeout再帰（setInterval不使用）                   |
| リフレッシュタイミング | 有効期限の80%経過時点                                 |
| リトライ戦略           | 指数バックオフ + Jitter（1s→2s→4s + ランダム0-500ms） |
| 最大リトライ回数       | 3回                                                   |
| 排他制御               | `_isRefreshing` mutexフラグ                           |
| 依存性注入             | Callback DIパターン（onRefresh, onFailure）           |

#### デフォルト設定

| 設定項目              | デフォルト値 | 説明                      |
| --------------------- | ------------ | ------------------------- |
| refreshThresholdRatio | 0.8          | 有効期限の何%で更新するか |
| minRefreshInterval    | 60000 (1分)  | 最小リフレッシュ間隔      |
| maxRetries            | 3            | 最大リトライ回数          |
| retryBaseDelay        | 1000 (1秒)   | リトライ基本待機時間      |
| maxJitter             | 500 (0.5秒)  | 最大ジッター              |

#### authHandlers.ts統合

| 連携ポイント       | 処理内容                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| ログイン成功時     | `startTokenRefreshScheduler()` でスケジューラー開始                                            |
| ログアウト時       | `stopTokenRefreshScheduler()` でスケジューラー停止                                             |
| リフレッシュ成功時 | `supabase.auth.refreshSession()` → トークン再保存 → `AUTH_STATE_CHANGED` 送信（expiresAt含む） |
| リフレッシュ失敗時 | トークンクリア → `AUTH_STATE_CHANGED` 送信（unauthenticated）                                  |

#### Supabase設定変更

| 設定               | 変更前 | 変更後  | 理由                            |
| ------------------ | ------ | ------- | ------------------------------- |
| `autoRefreshToken` | `true` | `false` | SDK内蔵リフレッシュとの競合防止 |

### テスト

| 指標                | 値     |
| ------------------- | ------ |
| テストケース数      | 26     |
| Statements Coverage | 96.15% |
| Branch Coverage     | 93.10% |
| Function Coverage   | 100%   |
| Line Coverage       | 96.15% |

---

## 関連ドキュメント

- [APIエンドポイント概要](./api-endpoints.md)
- [Agent Dashboard IPC](./api-ipc-agent.md)
- [システムIPC・プロバイダーAPI](./api-ipc-system.md)
- [セッション自動リフレッシュ実装ガイド](../../../docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001/outputs/phase-12/implementation-guide.md)
- [AUTH IPC登録一元化 実装ガイド](../../../docs/30-workflows/ut-ipc-auth-handle-duplicate-001/outputs/phase-12/implementation-guide.md)

---

## 完了タスク

### タスク: TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 Profile/Avatar fallback ハンドラ追加（2026-03-08完了）

| 項目       | 内容                                                                                                                                                                                                                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001                                                                                                                                                                                                                                                                                           |
| 完了日     | 2026-03-08                                                                                                                                                                                                                                                                                                                              |
| ステータス | **完了**                                                                                                                                                                                                                                                                                                                                |
| 変更概要   | Supabase 未設定時に Profile 11チャネル・Avatar 3チャネルの fallback ハンドラを `registerProfileFallbackHandlers()` / `registerAvatarFallbackHandlers()` で宣言的に登録。`PROFILE_ERROR_CODES.NOT_CONFIGURED` / `AVATAR_ERROR_CODES.NOT_CONFIGURED` を共有エラーコードとして定義し、Renderer への `No handler registered` 例外露出を防止 |
| 契約影響   | なし（新規 fallback 経路追加のみ、既存通常経路は不変）                                                                                                                                                                                                                                                                                  |

---

### 実装内容（要点）

- Auth fallback と同じ構造で、Profile 11チャネル / Avatar 3チャネルを `ReadonlyArray` + ループ登録へ統一した
- fallback 応答は `{ success: false, error: { code, message } }` に固定し、Preload / Renderer 側の既存 envelope 契約を崩していない
- `registerAllIpcHandlers()` では通常経路と fallback 経路を if/else 排他にし、二重登録と runtime drift を防いだ

### 苦戦箇所（再利用形式）

| 項目     | 内容                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| 課題     | Auth fallback だけ整っていても、Profile / Avatar が未登録だと Renderer 側で `No handler registered` が再発する |
| 再発条件 | `channels.ts` にチャネルが存在するのに、`ipc/index.ts` の fallback 追加が Auth のみで止まる                    |
| 対処     | `channels.ts` の定義数を正本にして fallback 配列を宣言的に列挙し、件数一致をテストで固定する                   |
| 教訓     | IPC handler の追加は実装単体ではなく、`channels.ts` / 登録関数 / テスト件数の三点突合で閉じる                  |

| 項目     | 内容                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 課題     | transport `message` を UI 文言として直接使うと、fallback 自体は成功しても画面に英語 message が露出する                           |
| 再発条件 | Renderer が `error.code` を保持せず `error.message` だけを banner 表示する                                                       |
| 対処     | transport では `code + message` を維持し、UI は `error.code` を正本に localized message を決定する。未実装分は未タスクへ分離する |
| 教訓     | IPC 契約の `message` は transport default であり、最終 UI 文言の正本ではない                                                     |

| 項目     | 内容                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| 課題     | App shell 経由の Phase 11 再現は初期化ノイズで不安定になりやすく、対象 contract の確認が難しい |
| 再発条件 | 画面検証で全体ナビゲーションを毎回通し、対象 view の状態注入を持たない                         |
| 対処     | 本番コンポーネント / Store / 公開 contract を保った専用 harness route で対象 view を直描画する |
| 教訓     | 画面契約の検証は「最短導線で同一 contract を再現する harness」を優先する                       |

### 同種課題の5分解決カード

| 課題パターン            | 最短手順                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------- |
| fallback 追加漏れの確認 | `channels.ts` の件数を数え、`register*FallbackHandlers()` の配列件数と一致させる       |
| runtime 例外の封じ込み  | `registerAllIpcHandlers()` を通常 / fallback の if/else 排他にする                     |
| UI message の責務分離   | `error.code` で localized message、`error.message` は fallback 文言に限定する          |
| 画面証跡の安定化        | App shell ではなく対象 view 専用 harness で screenshot を取り、Phase 11 証跡へ固定する |

---

### タスク: UT-IPC-AUTH-HANDLE-DUPLICATE-001 AUTH IPC handle重複式の登録一元化（2026-02-25完了）

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| タスクID   | UT-IPC-AUTH-HANDLE-DUPLICATE-001                       |
| 完了日     | 2026-02-25                                             |
| ステータス | **完了**                                               |
| 変更概要   | AUTH 5チャネル登録を宣言的に一元化し、重複登録式を排除 |
| 契約影響   | なし（引数/戻り値/エラー形式不変）                     |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                                                                                                             |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v1.7.0     | 2026-03-08 | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001: Profile 11ch / Avatar 3ch の fallback ハンドラ仕様と完了タスクセクションを追加。Supabase 未設定時の fallback 契約テーブルに詳細を追記 |
| v1.6.0     | 2026-02-25 | UT-IPC-AUTH-HANDLE-DUPLICATE-001 の再利用性強化: AUTH IPC登録一元化のクイック解決ガイド（目的/前提/ステップ/検証/トラブルシューティング）を追加                                      |
| v1.5.0     | 2026-02-25 | チャンネル一覧の実装箇所表記を行番号依存から関数依存へ更新（`registerAuthHandlers` 基準）。ドキュメント追従性を改善                                                                  |
| v1.4.0     | 2026-02-25 | UT-IPC-AUTH-HANDLE-DUPLICATE-001: AUTH IPC登録一元化戦略と完了タスクを追記。関連ドキュメントに実装ガイドを追加                                                                       |
| v1.3.1     | 2026-02-06 | DEBT-SEC-001: CSRF_VALIDATION_FAILEDエラーコード追記、既知のerrorCode値テーブル追加                                                                                                  |
| v1.3.0     | 2026-02-06 | TASK-AUTH-SESSION-REFRESH-001: TokenRefreshScheduler統合セクション追加、auth:state-changedにexpiresAt追加、autoRefreshToken:false設定変更                                            |
| v1.2.0     | 2026-02-05 | TASK-FIX-GOOGLE-LOGIN-001: AuthSessionにrefreshTokenExpiresAt追加、auth:state-changedにerror/errorCode追加                                                                           |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式・文章に変換                                                                                                                           |
| v1.0.0     | -          | 初版作成                                                                                                                                                                             |
