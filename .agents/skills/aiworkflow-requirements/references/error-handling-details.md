# エラーハンドリング仕様 / detail specification

> 親仕様書: [error-handling.md](error-handling.md)
> 役割: detail specification

## TokenRefreshScheduler リトライ戦略（TASK-AUTH-SESSION-REFRESH-001）

セッション自動リフレッシュのExponential Backoff with Jitterリトライ戦略。

### TokenRefreshScheduler リトライ設定

| 設定項目         | 値      | 説明                                        |
| ---------------- | ------- | ------------------------------------------- |
| 最大リトライ回数 | 3回     | DEFAULT_CONFIG.maxRetries                   |
| 初期待機時間     | 1000ms  | DEFAULT_CONFIG.retryBaseIntervalMs          |
| バックオフ倍率   | 2       | 指数バックオフ（1s→2s→4s）                 |
| ジッター         | 0-10%   | retryBaseIntervalMs × 0.1 × Math.random() |
| リフレッシュ閾値 | 80%     | 有効期限の80%経過時点でリフレッシュ開始     |

### TokenRefreshScheduler 待機時間計算

待機時間は以下の式で計算する: delay = retryBaseIntervalMs × 2^retryCount + random(0, retryBaseIntervalMs × 0.1)

| リトライ回数 | 基本待機時間 | ジッター後範囲 |
| ------------ | ------------ | -------------- |
| 1回目        | 1000ms       | 1000-1100ms    |
| 2回目        | 2000ms       | 2000-2100ms    |
| 3回目        | 4000ms       | 4000-4100ms    |

### TokenRefreshScheduler リトライ対象エラー

**リトライする**:

| 条件                           | 理由                           |
| ------------------------------ | ------------------------------ |
| ネットワークエラー             | 一時的な接続問題               |
| Supabase APIエラー（5xx）      | サーバー側の一時的な問題       |
| onRefresh()がnullを返した場合  | セッション情報取得に一時失敗   |

**リトライしない**:

| 条件                              | 理由                             |
| --------------------------------- | -------------------------------- |
| リフレッシュトークン期限切れ      | 再ログインが必要                 |
| 全リトライ失敗                    | onFailure()→ログアウトフロー実行 |
| _isDisposed後の呼び出し          | スケジューラー破棄済み           |

### Supabase SDK競合防止（重要）

`supabaseClient.ts`で`autoRefreshToken: false`を設定すること。Supabase SDKの自動リフレッシュとTokenRefreshSchedulerが同時に実行されると、一方が無効なトークンで実行されエラーになる。

**実装場所**: `apps/desktop/src/main/services/tokenRefreshScheduler.ts`
**関連**: [architecture-auth-security.md](architecture-auth-security.md) セッション自動リフレッシュセクション

---

## SkillExecutor 実行エラーコード（TASK-8A）

TASK-8A単体テストで検証されたSkillExecutor/PermissionResolverの実行時エラーコード。

### 実行エラー一覧

| エラーコード                | カテゴリ     | 発生条件                                       | リトライ | テスト検証 |
| --------------------------- | ------------ | ---------------------------------------------- | -------- | ---------- |
| `EXECUTION_FAILED`          | 実行エラー   | SDK query()呼び出し中の例外発生                | 不可     | SE-06      |
| `MAX_CONCURRENT_EXCEEDED`   | リソース制限 | 同時実行数が上限（5件）に到達                  | 待機後可 | SE-01      |
| `INVALID_SKILL_METADATA`    | バリデーション | SkillMetadata必須フィールド不足（anchors等）  | 不可     | SE-02      |
| `PERMISSION_DENIED`         | 権限エラー   | PreToolUseフックでツール使用が拒否された       | 不可     | SE-07      |
| `TIMEOUT`                   | タイムアウト | PermissionResolver応答待機が5分を超過          | 不可     | PR-02      |
| `ABORT`                     | キャンセル   | ユーザーまたはシステムによる実行中断           | 不可     | SE-03      |

### SkillExecutionError 構造

| フィールド | 型     | 必須 | 説明                         |
| ---------- | ------ | ---- | ---------------------------- |
| code       | string | 必須 | 上記エラーコードのいずれか   |
| message    | string | 必須 | エラーの詳細メッセージ       |
| details    | object | 任意 | 追加のコンテキスト情報       |

### エラー発生フローと対処

| シナリオ                 | エラーコード              | 対処方法                                           |
| ------------------------ | ------------------------- | -------------------------------------------------- |
| スキル実行時のSDKエラー  | `EXECUTION_FAILED`        | エラーメッセージをUIに表示、ログ出力               |
| 同時実行数超過           | `MAX_CONCURRENT_EXCEEDED` | 既存実行の完了を待機、またはabort後に再実行        |
| 不正なスキル定義         | `INVALID_SKILL_METADATA`  | SKILL.mdのフォーマットを確認・修正                 |
| ツール使用権限なし       | `PERMISSION_DENIED`       | ユーザーに権限承認を促す                           |
| 権限応答タイムアウト     | `TIMEOUT`                 | 再実行（5分以内に応答が必要）                      |
| ユーザーによる中断       | `ABORT`                   | 正常終了として処理、activeExecutionsから削除        |

**実装場所**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`
**テスト検証**: `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts` (52テスト)、`PermissionResolver.test.ts` (43テスト)

---

## OAuthエラーコードマッピング（TASK-FIX-GOOGLE-LOGIN-001）

OAuth認証コールバックで発生するエラーコードを日本語メッセージにマッピング。

**対象ファイル**: `apps/desktop/src/main/auth/oauth-error-handler.ts`

### OAuthエラーコード一覧

| OAuthエラー               | AUTH_ERROR_CODE                         | 日本語メッセージ                     |
| ------------------------- | --------------------------------------- | ------------------------------------ |
| access_denied             | auth/oauth-access-denied                | 認証がキャンセルされました           |
| server_error              | auth/oauth-server-error                 | 認証サーバーでエラーが発生しました   |
| temporarily_unavailable   | auth/oauth-temporarily-unavailable      | 認証サーバーが一時的に利用できません |
| invalid_request           | auth/oauth-invalid-request              | 認証リクエストが不正です             |
| unauthorized_client       | auth/oauth-unauthorized-client          | 認証クライアントが許可されていません |
| unsupported_response_type | auth/oauth-unsupported-response-type    | サポートされていない認証タイプです   |
| invalid_scope             | auth/oauth-invalid-scope                | 無効な認証スコープです               |
| (その他)                  | auth/oauth-unknown-error                | 認証に失敗しました                   |

### エラーパース関数

**parseOAuthError(url: string): OAuthError | null**

| 処理                 | 説明                                           |
| -------------------- | ---------------------------------------------- |
| URLハッシュ抽出      | URL中の `#` 以降をURLSearchParamsでパース      |
| errorパラメータ検出  | `error` パラメータが存在するかチェック         |
| 戻り値               | `{ error, errorDescription }` または `null`    |

**mapOAuthErrorToMessage(errorCode: string): MappedError**

| 処理                 | 説明                                           |
| -------------------- | ---------------------------------------------- |
| テーブルルックアップ | OAUTH_ERROR_MESSAGESテーブルから対応を検索     |
| フォールバック       | 未知のエラーコードは `OAUTH_UNKNOWN_ERROR` に  |
| 戻り値               | `{ code, message }` 形式のMappedErrorオブジェクト |

**実装場所**: `apps/desktop/src/main/auth/oauth-error-handler.ts`
**テスト**: `apps/desktop/src/main/__tests__/auth-callback.test.ts`

---

## AuthMode IPC エラー envelope（TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001）

auth-mode の invoke チャネルは `IPCResponse<T>` を共通 envelope とし、Renderer に資格情報本体を返さず、状態とガイダンスだけを返す。

### 基本構造

| フィールド | 型 | 必須 | 説明 |
| ---------- | --- | ---- | ---- |
| `success` | boolean | 必須 | 成功時 `true`、失敗時 `false` |
| `data` | `T` | 任意 | `get/status/validate` の payload |
| `error` | `IPCError` | 任意 | 失敗時の公開エラー |

### `IPCError`

| フィールド | 型 | 必須 | 説明 |
| ---------- | --- | ---- | ---- |
| `code` | `AuthModeErrorCode` | 必須 | `auth-mode/*` 名前空間の公開エラーコード |
| `message` | string | 必須 | UI に表示可能な要約メッセージ |
| `guidance` | string | 任意 | 次に取るべき行動 |

### `AuthModeStatus`

| フィールド | 型 | 必須 | 説明 |
| ---------- | --- | ---- | ---- |
| `mode` | `AuthMode` | 必須 | `subscription` または `api-key` |
| `isValid` | boolean | 必須 | 現在 mode で実行可能か |
| `hasCredentials` | boolean | 必須 | 資格情報の存在有無 |
| `message` | string | 必須 | 成功/失敗の表示文言 |
| `errorCode` | `AuthModeErrorCode` | 任意 | 失敗時の分類 |
| `guidance` | string | 任意 | 追加案内 |
| `lastCheckedAt` | number | 必須 | 検証実行時刻（Unix ms） |

### 標準エラーコード

| コード | 代表的な guidance |
| ------ | ----------------- |
| `auth-mode/invalid-sender` | なし（内部拒否） |
| `auth-mode/invalid-mode` | 有効な認証方式を選択する |
| `auth-mode/no-api-key` | 設定画面で API キーを入力する |
| `auth-mode/no-subscription-token` | Claude Code CLI でログインする |
| `auth-mode/storage-failed` | 再試行する |
| `auth-mode/storage-read-failed` | 再起動後に再試行する |
| `auth-mode/unknown-error` | 時間を置いて再試行する |

### 返却パターン

| シナリオ | 返却 |
| -------- | ---- |
| `auth-mode:get` 成功 | `{ success: true, data: { mode } }` |
| `auth-mode:status` 成功 | `{ success: true, data: AuthModeStatus }` |
| `auth-mode:validate` 失敗 | `{ success: false, error: { code, message, guidance? } }` |
| sender 検証失敗 | `{ success: false, error: { code: "auth-mode/invalid-sender", message: "Invalid request sender" } }` |

### 実装上のルール

| ルール | 理由 |
| ------ | ---- |
| Main / Preload / Renderer で同じ `AuthModeErrorCode` を使う | 層ごとの独自 union による契約ドリフトを防ぐ |
| `status` と `validate` は同じ `AuthModeStatus` を返す | 画面側の分岐を最小化する |
| 実行時例外は `sanitizeErrorMessage()` を通す | token / key / `sk-ant-*` の露出防止 |

---

## 認証フォールバックパターン（AUTH-UI-001）

認証プロフィール操作におけるフォールバック処理パターン。

### user_profilesテーブル不在時フォールバック

Supabaseの`user_profiles`テーブルが存在しない場合、`user_metadata`にフォールバックする処理パターン。

**対象ファイル**: `apps/desktop/src/main/ipc/profileHandlers.ts:66-85`

**検出関数**: `isUserProfilesTableError(error)`

| エラーパターン | 検出対象 | 説明 |
| -------------- | -------- | ---- |
| 文字列パターン | `schema cache`, `does not exist`, `user_profiles`, `column "user_profiles"` | エラーメッセージの部分一致 |
| エラーコード   | `PGRST200`, `PGRST116`, `42P01`, `42703` | PostgreSQL/PostgRESTエラーコード |

**処理フロー**:

| ステップ | 処理内容 | 成功時 | 失敗時 |
| -------- | -------- | ------ | ------ |
| 1 | `user_profiles`テーブルから取得/更新を試行 | 処理完了 | ステップ2へ |
| 2 | `isUserProfilesTableError()`でエラー判定 | フォールバック実行 | エラーをスロー |
| 3 | `user_metadata`から取得/へ更新 | 処理完了 | エラーをスロー |

**ログ出力**:

フォールバック実行時は警告ログを出力する。

| ログレベル | タイミング | メッセージ例 |
| ---------- | ---------- | ------------ |
| warn | フォールバック実行時 | `user_profiles table not available, falling back to user_metadata` |

**実装コンテキスト**:

このフォールバック処理は、プロジェクト初期段階で`user_profiles`テーブルが未作成の環境や、
スキーマ変更によるマイグレーション未実行環境でもアプリケーションが正常動作することを保証する。

**テスト**: `profileHandlers.test.ts`（環境問題によりUT-AUTH-001で修正予定）

---

## サーキットブレーカー（将来対応）

### 状態

| 状態      | 説明                                   |
| --------- | -------------------------------------- |
| Closed    | 正常稼働、リクエストを通す             |
| Open      | 障害状態、リクエストを即座に失敗させる |
| Half-Open | 回復テスト中、一部リクエストを通す     |

### 設定

| 設定項目     | 値   | 説明                           |
| ------------ | ---- | ------------------------------ |
| 失敗閾値     | 5回  | 連続5回失敗で回路オープン      |
| タイムアウト | 30秒 | リクエストタイムアウト         |
| 復旧待機     | 60秒 | オープン状態の維持時間         |
| 成功閾値     | 3回  | Half-Openで3回成功したらClosed |

### 適用対象

| サービス    | 理由                           |
| ----------- | ------------------------------ |
| AI API      | レート制限、一時的な障害が多い |
| Discord API | 外部サービスへの依存           |

---

## エラーレスポンス形式

### 基本構造

| フィールド | 型      | 必須 | 説明                   |
| ---------- | ------- | ---- | ---------------------- |
| success    | boolean | 必須 | 常にfalse              |
| error      | object  | 必須 | エラー詳細オブジェクト |
| request_id | string  | 必須 | リクエスト追跡ID       |

### errorオブジェクト

| フィールド  | 型      | 必須 | 説明                                  |
| ----------- | ------- | ---- | ------------------------------------- |
| code        | string  | 必須 | エラーコード（例: ERR_3001）          |
| message     | string  | 必須 | ユーザー向けエラーメッセージ          |
| details     | object  | 任意 | デバッグ用の詳細情報                  |
| retryable   | boolean | 必須 | リトライ可能かどうか                  |
| retry_after | number  | 任意 | リトライまでの待機秒数（429エラー時） |

### detailsオブジェクト（任意）

| フィールド | 型     | 説明                         |
| ---------- | ------ | ---------------------------- |
| field      | string | エラーが発生したフィールド名 |
| expected   | string | 期待される値/形式            |
| received   | string | 実際に受け取った値           |
| hint       | string | 修正のヒント                 |

---

## エラーログ出力

### ログ出力項目

| 項目        | 説明                                 |
| ----------- | ------------------------------------ |
| timestamp   | ISO8601形式のタイムスタンプ          |
| level       | error                                |
| error_code  | エラーコード                         |
| message     | エラーメッセージ                     |
| request_id  | リクエストID                         |
| workflow_id | ワークフローID（あれば）             |
| user_id     | ユーザーID（あれば）                 |
| stack_trace | スタックトレース（Internal Error時） |
| context     | 追加のコンテキスト情報               |

### ログ出力レベル別

| エラー種別             | ログレベル | スタックトレース |
| ---------------------- | ---------- | ---------------- |
| Validation Error       | warn       | 出力しない       |
| Business Error         | warn       | 出力しない       |
| External Service Error | error      | 出力する         |
| Infrastructure Error   | error      | 出力する         |
| Internal Error         | error      | 出力する         |

### 機密情報の除外

以下の情報はログに出力しない:

- APIキー、トークン
- パスワード
- 個人を特定できる情報（メールアドレス等）
- リクエストボディの全文（サニタイズした要約のみ）

---

## ユーザー向けエラーメッセージ

### メッセージの原則

| 原則           | 説明                                   |
| -------------- | -------------------------------------- |
| 具体性         | 何が問題かを明確に伝える               |
| アクション可能 | ユーザーが次に何をすべきか示す         |
| 非技術的       | 専門用語を避け、分かりやすい言葉を使う |
| セキュア       | 内部実装の詳細を露出しない             |

### メッセージ例

| エラーコード | 技術的メッセージ      | ユーザー向けメッセージ                                                 |
| ------------ | --------------------- | ---------------------------------------------------------------------- |
| ERR_1001     | Zod validation failed | 入力内容に誤りがあります。もう一度確認してください。                   |
| ERR_2001     | Resource not found    | 指定されたデータが見つかりませんでした。                               |
| ERR_3002     | AI API timeout        | AI処理に時間がかかっています。しばらくしてから再度お試しください。     |
| ERR_4002     | DB connection failed  | 一時的な問題が発生しました。しばらくしてから再度お試しください。       |
| ERR_5001     | Unexpected error      | 予期しないエラーが発生しました。問題が続く場合はお問い合わせください。 |

---

## エラーハンドリングの実装指針

### レイヤー別の責務

| レイヤー           | 責務                                             |
| ------------------ | ------------------------------------------------ |
| API層              | HTTPステータスコードの決定、レスポンス形式の統一 |
| アプリケーション層 | ビジネスエラーのスロー、リトライ判定             |
| インフラ層         | 外部サービスエラーのキャッチと変換               |
| ドメイン層         | ドメイン固有のエラー定義                         |

### Renderer 境界防御パターン（Preload Response Shape Guard）

**適用条件**: Renderer コンポーネントが `window.electronAPI` 経由で IPC レスポンスを受け取る場合

**防御レイヤー**:

| レイヤー | チェック内容 | 失敗時の動作 |
| --- | --- | --- |
| 1 | `window.electronAPI?.namespace` 存在確認 | console.warn + fallback state |
| 2 | `namespace?.targetMethod` メソッド存在確認 | console.warn + fallback state |
| 3 | `result?.success && result?.data` shape 検証 | エラーメッセージ表示 |
| 4 | `Array.isArray(result.data.items)` iterable ガード | 空配列フォールバック |

**背景**: contextBridge の structured clone 制約により、Preload スクリプトの部分的な初期化失敗が発生すると、API の一部が undefined になる。TypeScript の型定義は存在を保証するが、実行時の shape 崩壊は検出できない。non-null assertion (!) は型チェックを通過させるだけで実行時保護にならないため、必ず実行時型検証を行う。

**実装例**: `ApiKeysSection/index.tsx:loadProviders`、`AuthKeySection`
**参照タスク**: 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001
**関連Pitfall**: P48（non-null assertion による安全性偽装）、P19（型キャストによる実行時検証バイパス）

---

### エラー変換の原則

| 原則         | 説明                                                   |
| ------------ | ------------------------------------------------------ |
| 早期キャッチ | エラーは発生した場所に近いところでキャッチする         |
| 適切な変換   | 低レベルのエラーを上位レイヤーのエラーに変換する       |
| 情報保持     | 原因となったエラーの情報は保持する（cause プロパティ） |
| ログ出力     | 変換時にログを出力し、追跡可能にする                   |

### グローバルエラーハンドラー

| 対象              | 処理                                |
| ----------------- | ----------------------------------- |
| 未キャッチ例外    | Internal Error として処理、ログ出力 |
| Promise rejection | 同上                                |
| API Route エラー  | 適切なHTTPステータスで返却          |

---

