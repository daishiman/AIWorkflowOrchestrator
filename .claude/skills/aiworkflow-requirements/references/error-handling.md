# エラーハンドリング仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## エラー分類

### エラーカテゴリ

| カテゴリ               | エラーコード範囲 | リトライ | HTTPステータス | 例                                   |
| ---------------------- | ---------------- | -------- | -------------- | ------------------------------------ |
| Validation Error       | 1000-1999        | 不可     | 400/422        | 入力スキーマ不正、必須フィールド欠落 |
| Business Error         | 2000-2999        | 不可     | 403/404/409    | 権限不足、リソース不存在、重複作成   |
| External Service Error | 3000-3999        | 可能     | 502/503/504    | AI APIタイムアウト、レート制限       |
| Infrastructure Error   | 4000-4999        | 可能     | 500/503        | DB接続失敗、ファイルシステムエラー   |
| Internal Error         | 5000-5999        | 不可     | 500            | 実装バグ、予期しないエラー           |

### 主要エラーコード一覧

**Validation Error (1000-1999)**:

| コード   | 名称                   | 説明                              |
| -------- | ---------------------- | --------------------------------- |
| ERR_1001 | INVALID_INPUT          | 入力形式が不正                    |
| ERR_1002 | REQUIRED_FIELD_MISSING | 必須フィールドが欠落              |
| ERR_1003 | INVALID_TYPE           | 型が不正                          |
| ERR_1004 | VALUE_OUT_OF_RANGE     | 値が許容範囲外                    |
| ERR_1005 | INVALID_FORMAT         | フォーマットが不正（日付、URL等） |

**Business Error (2000-2999)**:

| コード   | 名称               | 説明                                   |
| -------- | ------------------ | -------------------------------------- |
| ERR_2001 | RESOURCE_NOT_FOUND | リソースが存在しない                   |
| ERR_2002 | PERMISSION_DENIED  | アクセス権限がない                     |
| ERR_2003 | DUPLICATE_RESOURCE | 重複するリソースが存在                 |
| ERR_2004 | INVALID_STATE      | 操作が現在の状態で不正                 |
| ERR_2005 | QUOTA_EXCEEDED     | 利用上限を超過                         |
| ERR_2006 | UNAUTHORIZED       | リソースアクセス権限なし（認可エラー） |

**External Service Error (3000-3999)**:

| コード   | 名称                         | 説明                   |
| -------- | ---------------------------- | ---------------------- |
| ERR_3001 | AI_API_ERROR                 | AI APIの呼び出しエラー |
| ERR_3002 | AI_API_TIMEOUT               | AI APIのタイムアウト   |
| ERR_3003 | AI_RATE_LIMIT                | AI APIのレート制限     |
| ERR_3004 | DISCORD_API_ERROR            | Discord APIのエラー    |
| ERR_3005 | EXTERNAL_SERVICE_UNAVAILABLE | 外部サービスが利用不可 |

**Infrastructure Error (4000-4999)**:

| コード   | 名称                       | 説明                   |
| -------- | -------------------------- | ---------------------- |
| ERR_4001 | DATABASE_ERROR             | データベースエラー     |
| ERR_4002 | DATABASE_CONNECTION_FAILED | DB接続失敗             |
| ERR_4003 | FILE_SYSTEM_ERROR          | ファイルシステムエラー |
| ERR_4004 | NETWORK_ERROR              | ネットワークエラー     |
| ERR_4005 | SYNC_CONFLICT              | 同期コンフリクト       |

**Internal Error (5000-5999)**:

| コード   | 名称                | 説明       |
| -------- | ------------------- | ---------- |
| ERR_5001 | INTERNAL_ERROR      | 内部エラー |
| ERR_5002 | NOT_IMPLEMENTED     | 未実装機能 |
| ERR_5003 | CONFIGURATION_ERROR | 設定エラー |

---

### RAG固有エラーコード

RAGパイプライン実装で使用するエラーコード。

| カテゴリ     | エラーコード               | 説明                       |
| ------------ | -------------------------- | -------------------------- |
| ファイル     | FILE_NOT_FOUND             | ファイルが見つからない     |
| ファイル     | FILE_READ_ERROR            | ファイル読み込みエラー     |
| ファイル     | FILE_WRITE_ERROR           | ファイル書き込みエラー     |
| ファイル     | UNSUPPORTED_FILE_TYPE      | 非対応ファイル形式         |
| 変換         | CONVERSION_FAILED          | 変換処理失敗               |
| 変換         | CONVERTER_NOT_FOUND        | コンバーターが見つからない |
| **変換**     | **TIMEOUT**                | **変換処理タイムアウト**   |
| **変換**     | **RESOURCE_EXHAUSTED**     | **同時実行数超過**         |
| データベース | DB_CONNECTION_ERROR        | DB接続エラー               |
| データベース | DB_QUERY_ERROR             | クエリ実行エラー           |
| データベース | DB_TRANSACTION_ERROR       | トランザクションエラー     |
| データベース | RECORD_NOT_FOUND           | レコードが見つからない     |
| 埋め込み     | EMBEDDING_GENERATION_ERROR | 埋め込み生成エラー         |
| 埋め込み     | EMBEDDING_PROVIDER_ERROR   | プロバイダーエラー         |
| 検索         | SEARCH_ERROR               | 検索処理エラー             |
| 検索         | QUERY_PARSE_ERROR          | クエリ解析エラー           |
| グラフ       | ENTITY_EXTRACTION_ERROR    | エンティティ抽出エラー     |
| グラフ       | RELATION_EXTRACTION_ERROR  | 関係抽出エラー             |
| グラフ       | COMMUNITY_DETECTION_ERROR  | コミュニティ検出エラー     |
| 汎用         | VALIDATION_ERROR           | バリデーションエラー       |

**実装場所**: `packages/shared/src/types/rag/errors.ts`

#### RAG変換システムのエラーコード詳細

**ConversionService層のエラー**:

| エラーコード          | 発生タイミング                     | リトライ       | 対処方法                                     |
| --------------------- | ---------------------------------- | -------------- | -------------------------------------------- |
| `RESOURCE_EXHAUSTED`  | 同時実行数が最大値（5件）に到達    | 可能（待機後） | 処理中のタスク完了を待つ                     |
| `TIMEOUT`             | 変換処理が60秒以内に完了しない     | 条件付き       | タイムアウト時間を延長、またはファイルを分割 |
| `CONVERTER_NOT_FOUND` | 対応コンバーターが登録されていない | 不可           | コンバーター実装またはMIMEタイプ確認         |

**個別Converter層のエラー**:

| エラーコード        | 発生タイミング | 例                                   | 対処方法           |
| ------------------- | -------------- | ------------------------------------ | ------------------ |
| `VALIDATION_FAILED` | 入力検証失敗   | MIMEタイプ不一致、最大ネスト深度超過 | 入力データを修正   |
| `CONVERSION_FAILED` | 変換処理失敗   | YAML構文エラー、正規表現マッチ失敗   | ファイル内容を修正 |

**エラーコンテキスト情報**:

すべてのRAGエラーは以下のコンテキスト情報を含む。

| フィールド           | 型     | 必須 | 説明                                        |
| -------------------- | ------ | ---- | ------------------------------------------- |
| converterId          | string | 任意 | エラー発生元コンバーターID                  |
| fileId               | string | 任意 | 処理対象ファイルID                          |
| mimeType             | string | 任意 | ファイルのMIMEタイプ                        |
| filePath             | string | 任意 | ファイルパス                                |
| maxDepth             | number | 任意 | YAMLコンバーターのネスト深度                |
| timeout              | number | 任意 | タイムアウト時間（ミリ秒）                  |
| currentConversions   | number | 任意 | RESOURCE_EXHAUSTED発生時の現在の同時実行数 |

**エラー生成パターン**:

エラーはcreateRAGError関数を使用して生成する。第1引数にエラーコード、第2引数にメッセージ、第3引数にコンテキスト情報、第4引数（任意）に原因となったエラーを指定する。

| シナリオ         | エラーコード       | メッセージ例                                | コンテキスト例                                                      |
| ---------------- | ------------------ | ------------------------------------------- | ------------------------------------------------------------------- |
| 同時実行数超過   | RESOURCE_EXHAUSTED | Maximum concurrent conversions reached: 5   | currentConversions: 5, maxConcurrentConversions: 5                  |
| YAML変換失敗     | CONVERSION_FAILED  | YAML conversion failed: Invalid syntax...   | converterId: yaml-converter, fileId, mimeType, filePath, cause設定  |
| タイムアウト発生 | TIMEOUT            | Conversion timeout after 60000ms            | converterId: code-converter, fileId, timeout: 60000                 |

---

## 認可エラー（UnauthorizedError）

OWASP A01:2021 Broken Access Control 対策として実装された認可エラー。

**実装ファイル**: `packages/shared/src/features/chat-history/errors.ts`

### 定数定義

| 定数名                     | 値                                                                  | 説明                       |
| -------------------------- | ------------------------------------------------------------------- | -------------------------- |
| UNAUTHORIZED_ERROR_MESSAGE | Access denied: You do not have permission to access this resource   | デフォルトエラーメッセージ |
| RESOURCE_TYPE.SESSION      | session                                                             | リソースタイプ定数         |

### UnauthorizedErrorクラス

Errorクラスを継承した認可エラークラス。

**読み取り専用プロパティ**:

| プロパティ   | 型     | 値           | 説明                   |
| ------------ | ------ | ------------ | ---------------------- |
| name         | string | UnauthorizedError | エラー名          |
| code         | string | UNAUTHORIZED | エラーコード           |
| statusCode   | number | 403          | HTTPステータスコード   |
| resourceType | string | -            | リソースタイプ（任意） |
| resourceId   | string | -            | リソースID（任意）     |

**コンストラクタ引数**:

| 引数         | 型     | デフォルト値               | 説明                |
| ------------ | ------ | -------------------------- | ------------------- |
| message      | string | UNAUTHORIZED_ERROR_MESSAGE | エラーメッセージ    |
| resourceType | string | undefined                  | リソースタイプ      |
| resourceId   | string | undefined                  | リソースID          |

### 型ガード関数

isUnauthorizedError関数は、エラーオブジェクトがUnauthorizedErrorかどうかを判定する。

**判定条件**（すべて満たす必要あり）:
- Errorインスタンスである
- nameプロパティが "UnauthorizedError" である
- codeプロパティが存在し、値が "UNAUTHORIZED" である

### 使用パターン

**セッション所有者検証の処理フロー**:

1. sessionIdを指定してセッションをリポジトリから取得
2. セッションが存在しない、または所有者が一致しない場合はUnauthorizedErrorをスロー
3. 検証成功時はセッションオブジェクトを返却

**重要**: セッションが存在しない場合と認可失敗の場合で同一のエラーメッセージを返すことで、リソースの存在有無を外部から判別できないようにする（情報漏洩防止）。

### セキュリティ原則

| 原則         | 実装                                             |
| ------------ | ------------------------------------------------ |
| Fail-Secure  | 検証失敗時は必ずエラーをスロー                   |
| 情報漏洩防止 | 存在チェックと認可チェックで同一エラーメッセージ |
| 最小権限     | リソースへのアクセスは所有者のみ                 |
| 一貫性       | 全メソッドで同じ検証パターンを使用               |

---

## リトライ戦略

### 基本設定

| 設定項目         | 値      | 説明                         |
| ---------------- | ------- | ---------------------------- |
| 最大リトライ回数 | 3回     | MAX_RETRY_COUNT              |
| 初期待機時間     | 1000ms  | 指数バックオフの基準値       |
| バックオフ係数   | 2       | 待機時間の増加率             |
| 最大待機時間     | 30000ms | 待機時間の上限               |
| ジッター         | ±20%    | 同時リトライ回避のランダム化 |

### 待機時間計算

| リトライ回数 | 基本待機時間 | ジッター後範囲 |
| ------------ | ------------ | -------------- |
| 1回目        | 1000ms       | 800-1200ms     |
| 2回目        | 2000ms       | 1600-2400ms    |
| 3回目        | 4000ms       | 3200-4800ms    |

### リトライ対象判定

**リトライする（retryable: true）**:

| 条件               | 理由                     |
| ------------------ | ------------------------ |
| HTTP 429           | レート制限は一時的       |
| HTTP 500-503       | サーバー側の一時的な問題 |
| ネットワークエラー | 一時的な接続問題         |
| タイムアウト       | 一時的な遅延             |

**リトライしない（retryable: false）**:

| 条件                 | 理由                     |
| -------------------- | ------------------------ |
| HTTP 400-403         | クライアント側の問題     |
| HTTP 404             | リソースが存在しない     |
| バリデーションエラー | 入力を修正する必要がある |
| ビジネスエラー       | ロジック上の問題         |

---

## SkillExecutor リトライ戦略（TASK-SKILL-RETRY-001）

SkillExecutor固有のExponential Backoff with Jitterリトライ戦略。

### SkillExecutor リトライ設定

| 設定項目         | 値      | 説明                                    |
| ---------------- | ------- | --------------------------------------- |
| 最大リトライ回数 | 3回     | DEFAULT_RETRY_CONFIG.maxRetries         |
| 初期待機時間     | 1000ms  | DEFAULT_RETRY_CONFIG.baseDelayMs        |
| バックオフ倍率   | 2       | DEFAULT_RETRY_CONFIG.backoffMultiplier  |
| 最大待機時間     | 30000ms | DEFAULT_RETRY_CONFIG.maxDelayMs         |
| ジッター         | ±20%    | DEFAULT_RETRY_CONFIG.jitterFactor: 0.2  |

### SkillExecutor リトライ対象エラー

| エラー種別                   | 条件                       | errorType      |
| ---------------------------- | -------------------------- | -------------- |
| ネットワークエラー           | ECONNRESET, ETIMEDOUT等    | `network`      |
| API レート制限               | HTTP 429                   | `rate_limit`   |
| サーバーエラー               | HTTP 500-599               | `server_error` |
| タイムアウト                 | TimeoutError / code TIMEOUT| `timeout`      |

### Retry-After ヘッダー対応

HTTP 429エラーの`Retry-After`ヘッダー（秒単位の数値）をパースし、ミリ秒に変換して使用する。`calculateBackoffDelay()`はRetry-After値を優先し、`baseDelayMs`以上`maxDelayMs`以下の範囲にクランプする。極端に大きいRetry-After値（例: 86400秒=24時間）は`maxDelayMs`（30秒）で制限される。

### リトライ通知

リトライ発生時にIPCチャネル`skill:stream`経由で`retry`タイプのストリーミングメッセージを送信し、Renderer Processに通知する。

### abort連携

リトライ待機中（sleep中）にAbortSignalが発火した場合、即座に待機を中断しAbortErrorをスローする。

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

## 関連ドキュメント

- [コアインターフェース仕様](./06-core-interfaces.md)
- [REST API 設計原則](./08-api-design.md)
- [非機能要件](./02-non-functional-requirements.md)
- [セキュリティガイドライン](./17-security-guidelines.md)

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                             |
| ---------- | ---------- | -------------------------------------------------------------------- |
| 2026-02-05 | v1.5.0     | TASK-FIX-GOOGLE-LOGIN-001: OAuthエラーコードマッピングセクション追加（9エラーコード、parseOAuthError、mapOAuthErrorToMessage関数仕様） |
| 2026-02-04 | v1.4.0     | AUTH-UI-001: 認証フォールバックパターン（user_profilesテーブル不在時）追加 |
| 2026-02-02 | v1.3.0     | TASK-8A: SkillExecutor実行エラーコード6種の正式仕様追加（EXECUTION_FAILED, MAX_CONCURRENT_EXCEEDED, INVALID_SKILL_METADATA, PERMISSION_DENIED, TIMEOUT, ABORT） |
| 2026-01-31 | v1.2.0     | TASK-SKILL-RETRY-001: SkillExecutorリトライ戦略セクション追加        |
| 2026-01-26 | v1.1.0     | 仕様ガイドライン準拠: コード例を表形式・文章に変換                   |
