# エラーハンドリング仕様 / core specification

> 親仕様書: [error-handling.md](error-handling.md)
> 役割: core specification

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
| ERR_4006 | DB_NOT_AVAILABLE           | 会話履歴DB利用不可（conversation チャンネル Graceful Degradation フォールバック） |

**Internal Error (5000-5999)**:

| コード   | 名称                | 説明       |
| -------- | ------------------- | ---------- |
| ERR_5001 | INTERNAL_ERROR      | 内部エラー |
| ERR_5002 | NOT_IMPLEMENTED     | 未実装機能 |
| ERR_5003 | CONFIGURATION_ERROR | 設定エラー |

---

### Auth / Profile / Avatar の fallback エラーコード

Supabase 未設定環境では、IPC ハンドラー未登録による例外を直接出さず、Main Process 側で fallback error envelope を返す。

| コード | 発生条件 | 返却レイヤー | 期待される UI 対応 |
| ------ | -------- | ------------ | ------------------ |
| `AUTH_ERROR_CODES.AUTH_NOT_CONFIGURED` (`auth/not-configured`) | `auth:login` / `auth:logout` / `auth:refresh` などを Supabase 未設定で呼ぶ | Main IPC fallback | 認証設定が必要であることを表示する |
| `PROFILE_ERROR_CODES.NOT_CONFIGURED` (`profile/not-configured`) | `profile:*` を Supabase 未設定で呼ぶ | Main IPC fallback | Profile 画面でクラッシュせず設定不足を表示する |
| `AVATAR_ERROR_CODES.NOT_CONFIGURED` (`avatar/not-configured`) | `avatar:*` を Supabase 未設定で呼ぶ | Main IPC fallback | Avatar 操作 UI で未設定状態を表示する |

**error envelope**:

```ts
type FallbackErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};
```

**注意**:

- stack trace や内部パスは返さない
- `No handler registered` のような Electron 生例外を Renderer へ露出しない
- `ipc-contract-checklist.md` の fallback 経路監査と合わせて確認する
- `error.message` は transport の既定文言であり、Renderer UI は `error.code` を正本として localized message を決定する。直接表示で十分でない場合は `UT-IMP-PROFILE-AVATAR-FALLBACK-ERROR-LOCALIZATION-001` を参照する

---

### AI Chat Renderer error surface（2026-03-20 再監査）

`AIChatResponse.error` は ChatView 系では `string` transport として扱う。current runtime では canonical error code と raw message string が混在しうる。

| パターン | Renderer 側の扱い | 例 |
| --- | --- | --- |
| canonical error code | UI 辞書で user-facing message へ変換 | `API_KEY_MISSING`, `NETWORK_ERROR`, `MODEL_NOT_FOUND` |
| raw message string | そのまま alert banner に表示 | `APIキーが設定されていません。設定画面からAPIキーを入力してください。` |
| 非 string / 空文字 | `UNKNOWN_ERROR` に正規化 | object payload, `""` |

**標準ルール**:

- Main が code を返せる経路は canonical error code を優先する。
- legacy / provider-specific 経路で raw message string を返すことは許容する。
- Renderer は `error` を直接信頼せず、code 判定と raw message fallback を分けて扱う。
- この契約は `llm-ipc-types.md` と同時に更新する。

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

## 外部ストレージ取得フォールバックパターン（TASK-FIX-4-2）

> **実装完了**: 2026-02-07（TASK-FIX-4-2）
> **参照**: [arch-electron-services.md](./arch-electron-services.md) SkillImportManager永続化実装詳細

electron-storeなどの外部ストレージから取得したデータは型保証がないため、実行時バリデーションとフォールバックが必要。

### フォールバックマトリクス

| ケース | 入力値例 | 対応 | ログレベル |
|--------|----------|------|------------|
| null/undefined | `null`, `undefined` | 空配列を返す | なし |
| 非配列値 | `"string"`, `123`, `{}` | 空配列を返す | WARN |
| 混合配列 | `["a", 123, "b"]` | 非string要素をフィルタリング | WARN |
| 正常配列 | `["skill-1", "skill-2"]` | そのまま返す | なし |

### 実装パターン

**バリデーション関数の設計**:

| 設計原則 | 詳細 |
|----------|------|
| 戻り値型 | `unknown` → バリデーション後の具体型 |
| null合体 | `value == null` で null/undefined を一括処理 |
| 配列検証 | `Array.isArray(value)` で配列かどうかを判定 |
| 要素フィルタ | `filter()` + 型ガードで型安全な要素抽出 |

**警告ログの出力条件**:

| 条件 | ログ内容 |
|------|----------|
| 非配列値 | `Stored value is not an array, returning empty array` |
| 混合配列 | `Filtered out non-string elements from stored array` |

### セキュリティ考慮事項

| 考慮事項 | 対策 |
|----------|------|
| 型アサーション禁止 | `as` キャストではなくバリデーション関数を使用 |
| 信頼できないデータ | 外部ストレージの値は常に `unknown` として扱う |
| フェイルセーフ | 不正なデータは安全なデフォルト値（空配列）にフォールバック |

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

### Workspace preview エラー分類（TASK-UI-04C）

| ケース | 分類 | retryable | UI 応答 |
| --- | --- | --- | --- |
| `file:read` timeout | Infrastructure Error | true | loading を解除し、最大3回 retry 後に fatal preview error を表示 |
| `file:read` read failure | Infrastructure Error | true | retry 後に error surface へ落とす |
| JSON/YAML parse failure | Internal Error だが recoverable | false | alert banner を表示し、`SourceView` fallback を継続表示 |
| iframe / preview renderer crash | Internal Error だが recoverable | false | `PreviewErrorBoundary` で reset 導線を表示 |
| query no-match | Error ではない | false | empty result を返し、候補を表示しない |

**設計ルール**:

- transport failure と parse failure を同じ fatal surface に集約しない
- retry は transport 系だけに限定し、parse 系には適用しない
- preview / inspector 系の loading は timeout か success のどちらかで必ず解除する

#### 関連未タスク

| タスクID | 目的 | タスク仕様書 |
| --- | --- | --- |
| UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 | preview/search 系の transport / parse / crash / no-match 分類を共通 error taxonomy として再利用可能にする | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-workspace-preview-search-resilience-guard-001.md` |

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
