# コアインターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

---

## 6.1 IWorkflowExecutor インターフェース

すべての機能プラグインが実装すべきインターフェース。

### 6.1.1 プロパティ

| プロパティ   | 型        | 必須 | 説明                                              |
| ------------ | --------- | ---- | ------------------------------------------------- |
| type         | string    | 必須 | ワークフロータイプ識別子（例: YOUTUBE_SUMMARIZE） |
| displayName  | string    | 必須 | 表示名（例: YouTube動画要約）                     |
| description  | string    | 必須 | 機能説明（ユーザー向け）                          |
| inputSchema  | ZodSchema | 必須 | 入力バリデーションスキーマ                        |
| outputSchema | ZodSchema | 必須 | 出力バリデーションスキーマ                        |

### 6.1.2 メソッド

| メソッド | 戻り値  | 必須 | 説明                                                   |
| -------- | ------- | ---- | ------------------------------------------------------ |
| execute  | Promise | 必須 | メイン実行処理。入力を受け取り、処理結果を返す         |
| validate | Result  | 任意 | カスタム入力検証。スキーマ以上の検証が必要な場合に実装 |
| canRetry | boolean | 任意 | リトライ可否判定。エラーに応じてリトライすべきか判断   |
| onCancel | Promise | 任意 | キャンセル時のクリーンアップ処理                       |

### 6.1.3 ExecutionContext

Executor実行時に渡されるコンテキスト情報。

| フィールド  | 型          | 説明                                           |
| ----------- | ----------- | ---------------------------------------------- |
| workflowId  | string      | 実行中のワークフローID                         |
| userId      | string      | 実行ユーザーID                                 |
| logger      | Logger      | 構造化ロガー（ワークフローIDが自動付与される） |
| abortSignal | AbortSignal | キャンセルシグナル                             |
| retryCount  | number      | 現在のリトライ回数（0から開始）                |
| startedAt   | Date        | 実行開始時刻                                   |

### 6.1.4 execute メソッドの実装指針

**入力処理**:

- inputSchemaで定義したスキーマによる自動バリデーションが行われる
- 追加の検証が必要な場合はvalidateメソッドを実装する
- バリデーションエラーはValidationErrorとしてスローする

**メイン処理**:

- 長時間処理の場合はabortSignalを定期的にチェックする
- 進捗ログはloggerを通じて出力する
- 外部API呼び出しには適切なタイムアウトを設定する

**出力処理**:

- outputSchemaに準拠したオブジェクトを返す
- 部分的な結果を返す場合もスキーマに準拠させる

---

## 6.2 IRepository インターフェース

データアクセスの抽象化。各エンティティごとに実装する。

### 6.2.1 基本メソッド

| メソッド | 戻り値                     | 説明                                             |
| -------- | -------------------------- | ------------------------------------------------ |
| create   | Promise Entity             | エンティティ作成。IDは自動生成                   |
| findById | Promise Entity または null | ID検索。見つからない場合はnull                   |
| findMany | Promise Entity配列         | 条件検索。フィルタ、ソート、ページネーション対応 |
| update   | Promise Entity             | 更新。存在しない場合はエラー                     |
| delete   | Promise void               | 削除。ソフトデリートの場合はdeleted_atを設定     |

### 6.2.2 追加メソッド（任意）

| メソッド | 戻り値                     | 用途                               |
| -------- | -------------------------- | ---------------------------------- |
| findOne  | Promise Entity または null | 条件に合う最初の1件を取得          |
| count    | Promise number             | 条件に合う件数を取得               |
| exists   | Promise boolean            | 条件に合うレコードが存在するか確認 |
| upsert   | Promise Entity             | 存在すれば更新、なければ作成       |

### 6.2.3 トランザクション対応

| 項目         | 説明                                      |
| ------------ | ----------------------------------------- |
| 単一操作     | 自動的にトランザクション内で実行される    |
| 複数操作     | withTransactionメソッドを使用してまとめる |
| ロールバック | エラー発生時は自動的にロールバック        |

---

## 6.3 Result型

成功・失敗を明示的に表現する型。例外を使わないエラーハンドリングに使用（Railway Oriented Programming）。

### 6.3.1 構造

| バリアント | フィールド               | 説明               |
| ---------- | ------------------------ | ------------------ |
| Success    | success: true, data: T   | 成功時のデータ     |
| Failure    | success: false, error: E | 失敗時のエラー情報 |

### 6.3.2 モナド操作

| 操作       | メソッド   | 説明                                  |
| ---------- | ---------- | ------------------------------------- |
| 生成       | ok/err     | 成功値・エラー値を生成                |
| 型ガード   | isOk/isErr | 成功・失敗を判定し、型を絞り込む      |
| 変換       | map        | 成功値に関数を適用（Functor）         |
| 合成       | flatMap    | 成功値にResult返却関数を適用（Monad） |
| エラー変換 | mapErr     | エラー値に関数を適用                  |
| 統合       | all        | 複数のResultを統合                    |

### 6.3.3 使用場面

| 場面             | 推奨                                       |
| ---------------- | ------------------------------------------ |
| バリデーション   | Result型を使用（失敗が想定される操作）     |
| ビジネスロジック | Result型を使用（エラーを呼び出し元に伝播） |
| 外部API呼び出し  | 例外をキャッチしてResult型に変換           |
| UI層             | isOk/isErrをチェックして分岐               |

**実装場所**: `packages/shared/src/types/rag/result.ts`

---

## 6.4 Logger インターフェース

構造化ログ出力のためのインターフェース。

### 6.4.1 メソッド

| メソッド | 用途                                         |
| -------- | -------------------------------------------- |
| debug    | 開発時のデバッグ情報（本番では出力されない） |
| info     | 正常な処理の記録                             |
| warn     | 注意が必要だが処理は継続可能な状況           |
| error    | エラー発生時（スタックトレース付き）         |

### 6.4.2 ログ出力項目

| 項目       | 説明                                   |
| ---------- | -------------------------------------- |
| timestamp  | ISO8601形式のタイムスタンプ            |
| level      | ログレベル（debug/info/warn/error）    |
| message    | ログメッセージ                         |
| workflowId | 関連するワークフローID（あれば）       |
| userId     | 関連するユーザーID（あれば）           |
| requestId  | リクエストID（あれば）                 |
| context    | 追加のコンテキスト情報（オブジェクト） |
| error      | エラー情報（errorレベル時）            |

### 6.4.3 ログレベル別出力

| 環境 | debug | info | warn | error |
| ---- | ----- | ---- | ---- | ----- |
| 開発 | 出力  | 出力 | 出力 | 出力  |
| 本番 | 抑制  | 出力 | 出力 | 出力  |

---

## 6.5 IAIClient インターフェース

AIプロバイダーへのアクセスを抽象化するインターフェース。

### 6.5.1 メソッド

| メソッド | 戻り値              | 説明                     |
| -------- | ------------------- | ------------------------ |
| chat     | Promise Response    | チャット形式のリクエスト |
| complete | Promise Response    | 補完形式のリクエスト     |
| stream   | AsyncIterator Chunk | ストリーミングレスポンス |

### 6.5.2 対応プロバイダー

| プロバイダー | 識別子    | 特徴                  |
| ------------ | --------- | --------------------- |
| OpenAI       | openai    | GPT-4o、GPT-4 Turbo等 |
| Anthropic    | anthropic | Claude 3.5 Sonnet等   |
| Google       | google    | Gemini 1.5 Pro等      |
| xAI          | xai       | Grok等                |

### 6.5.3 共通オプション

| オプション   | 型          | 説明                    |
| ------------ | ----------- | ----------------------- |
| model        | string      | 使用するモデル名        |
| maxTokens    | number      | 最大トークン数          |
| temperature  | number      | 応答のランダム性（0-1） |
| systemPrompt | string      | システムプロンプト      |
| abortSignal  | AbortSignal | キャンセルシグナル      |

---

## 6.6 IFileWatcher インターフェース

ファイルシステム監視のためのインターフェース（Local Agent用）。

### 6.6.1 メソッド

| メソッド | 戻り値 | 説明                   |
| -------- | ------ | ---------------------- |
| watch    | void   | 監視開始               |
| stop     | void   | 監視停止               |
| onEvent  | void   | イベントハンドラー登録 |

### 6.6.2 監視イベント

| イベント | 発火タイミング |
| -------- | -------------- |
| add      | ファイル追加時 |
| change   | ファイル変更時 |
| unlink   | ファイル削除時 |
| error    | エラー発生時   |

### 6.6.3 監視対象の設定

| 設定項目       | 説明                                    |
| -------------- | --------------------------------------- |
| path           | 監視対象ディレクトリのパス              |
| patterns       | 監視するファイルパターン（glob形式）    |
| ignorePatterns | 除外するファイルパターン                |
| debounceMs     | イベント発火の間隔（デフォルト: 300ms） |

---

## 6.7 認証・プロフィール型定義

Desktop アプリの認証機能で使用する型定義。

### 6.7.1 AuthUser

認証済みユーザーの基本情報。

| フィールド   | 型             | 説明                    |
| ------------ | -------------- | ----------------------- |
| id           | string         | ユーザーID              |
| email        | string \| null | メールアドレス          |
| displayName  | string \| null | 表示名                  |
| avatarUrl    | string \| null | アバターURL             |
| createdAt    | string         | 作成日時（ISO8601）     |
| lastSignInAt | string         | 最終ログイン（ISO8601） |

### 6.7.2 UserProfile

ユーザープロフィール詳細情報。

| フィールド  | 型                              | 説明                |
| ----------- | ------------------------------- | ------------------- |
| id          | string                          | ユーザーID          |
| displayName | string                          | 表示名              |
| email       | string                          | メールアドレス      |
| avatarUrl   | string \| null                  | アバターURL         |
| plan        | "free" \| "pro" \| "enterprise" | プラン種別          |
| createdAt   | string                          | 作成日時（ISO8601） |
| updatedAt   | string                          | 更新日時（ISO8601） |

### 6.7.3 ExtendedUserProfile

ユーザープロフィール拡張情報（通知設定等を含む）。

| フィールド           | 型                   | 説明                       |
| -------------------- | -------------------- | -------------------------- |
| id                   | string               | ユーザーID                 |
| displayName          | string               | 表示名                     |
| email                | string               | メールアドレス             |
| avatarUrl            | string \| null       | アバターURL                |
| plan                 | string               | プラン種別                 |
| createdAt            | string               | 作成日時（ISO8601）        |
| updatedAt            | string               | 更新日時（ISO8601）        |
| timezone             | string               | タイムゾーン（IANA形式）   |
| locale               | string               | ロケール（ja, en等）       |
| notificationSettings | NotificationSettings | 通知設定                   |
| preferences          | object               | ユーザー設定（将来拡張用） |

### 6.7.4 NotificationSettings

通知設定オブジェクト。

| フィールド       | 型      | 説明                       |
| ---------------- | ------- | -------------------------- |
| email            | boolean | メール通知を受け取る       |
| desktop          | boolean | デスクトップ通知を表示     |
| sound            | boolean | 通知時に音を鳴らす         |
| workflowComplete | boolean | ワークフロー完了時に通知   |
| workflowError    | boolean | ワークフローエラー時に通知 |

**デフォルト値**: すべて `true`

### 6.7.5 OAuthProvider

対応する OAuth プロバイダー。

| 値      | 説明          |
| ------- | ------------- |
| google  | Google OAuth  |
| github  | GitHub OAuth  |
| discord | Discord OAuth |

### 6.7.6 LinkedProvider

連携済みプロバイダー情報。

| フィールド | 型             | 説明                 |
| ---------- | -------------- | -------------------- |
| id         | string         | Identity ID          |
| provider   | string         | プロバイダー名       |
| email      | string \| null | プロバイダーのメール |
| name       | string \| null | プロバイダーの名前   |
| avatarUrl  | string \| null | アバターURL          |
| linkedAt   | string         | 連携日時（ISO8601）  |

### 6.7.7 AuthGuardState

認証ガードの状態を表す Discriminated Union。

| status          | 追加フィールド | 説明     |
| --------------- | -------------- | -------- |
| checking        | -              | 確認中   |
| authenticated   | user: AuthUser | 認証済み |
| unauthenticated | -              | 未認証   |

### 6.7.8 AuthErrorCode

認証エラーコード。

| コード                | 説明                   |
| --------------------- | ---------------------- |
| NETWORK_ERROR         | ネットワーク接続エラー |
| AUTH_FAILED           | 認証失敗               |
| TIMEOUT               | タイムアウト           |
| SESSION_EXPIRED       | セッション期限切れ     |
| PROVIDER_ERROR        | プロバイダーエラー     |
| PROFILE_UPDATE_FAILED | プロフィール更新失敗   |
| LINK_PROVIDER_FAILED  | アカウント連携失敗     |
| DATABASE_ERROR        | データベースエラー     |
| UNKNOWN               | 未分類エラー           |

**実装場所**: `packages/shared/types/auth.ts`, `apps/desktop/src/renderer/components/AuthGuard/types.ts`

---

## 6.8 ワークスペース型定義

Desktop アプリの複数フォルダ管理機能で使用する型定義。

### 6.8.1 Workspace

ワークスペースの状態を表す型。

| フィールド         | 型             | 説明                       |
| ------------------ | -------------- | -------------------------- |
| id                 | WorkspaceId    | ワークスペースID（固定値） |
| folders            | FolderEntry[]  | 登録フォルダ一覧           |
| lastSelectedFileId | FileId \| null | 最後に選択したファイルID   |
| createdAt          | Date           | 作成日時                   |
| updatedAt          | Date           | 更新日時                   |

### 6.8.2 FolderEntry

登録フォルダのエントリ。

| フィールド    | 型            | 説明                 |
| ------------- | ------------- | -------------------- |
| id            | FolderId      | フォルダID（UUID）   |
| path          | FolderPath    | 絶対パス             |
| displayName   | string        | 表示名（フォルダ名） |
| isExpanded    | boolean       | 展開状態             |
| expandedPaths | Set\<string\> | 展開サブフォルダパス |
| addedAt       | Date          | 追加日時             |

### 6.8.3 Branded Types

型安全性を高めるためのブランド型。

| 型名        | ベース型 | 説明                                |
| ----------- | -------- | ----------------------------------- |
| WorkspaceId | string   | ワークスペースID（"default"固定）   |
| FolderId    | string   | フォルダID（UUID形式）              |
| FolderPath  | string   | フォルダパス（絶対パス、"/"で開始） |
| FileId      | string   | ファイルID（UUID形式）              |
| FilePath    | string   | ファイルパス（絶対パス、"/"で開始） |

### 6.8.4 セキュリティ制約

| 制約             | 実装                               |
| ---------------- | ---------------------------------- |
| パストラバーサル | ".." を含むパスは拒否              |
| 絶対パス         | "/" で開始しないパスは拒否         |
| パス正規化       | 連続スラッシュ・末尾スラッシュ除去 |
| ファイルサイズ   | 10MB 上限                          |

**実装場所**: `apps/desktop/src/renderer/store/types/workspace.ts`, `apps/desktop/src/main/ipc/validation.ts`

---

## 6.9 RAG型定義

RAGパイプライン実装で使用する共通型定義。

### 6.9.1 Branded Types

型安全なID管理のための名目的型付け。

| 型名         | 説明                                   |
| ------------ | -------------------------------------- |
| FileId       | ファイルを一意に識別するID             |
| ChunkId      | チャンク（分割テキスト）を一意に識別   |
| ConversionId | 変換プロセスを一意に識別               |
| EntityId     | エンティティ（知識グラフノード）を識別 |
| RelationId   | 関係（知識グラフエッジ）を識別         |
| CommunityId  | コミュニティ（クラスタ）を識別         |
| EmbeddingId  | 埋め込みベクトルを識別                 |

**機能**:

- `create*()` - 既存文字列をID型に変換
- `generate*()` - UUID v4形式の新規ID生成

### 6.9.2 RAGエラー型

統一されたエラーハンドリング。

| エラーコード               | カテゴリ     | 説明                   |
| -------------------------- | ------------ | ---------------------- |
| FILE_NOT_FOUND             | ファイル     | ファイルが見つからない |
| FILE_READ_ERROR            | ファイル     | ファイル読み込みエラー |
| CONVERSION_FAILED          | 変換         | 変換処理失敗           |
| DB_CONNECTION_ERROR        | データベース | DB接続エラー           |
| DB_QUERY_ERROR             | データベース | クエリ実行エラー       |
| EMBEDDING_GENERATION_ERROR | 埋め込み     | 埋め込み生成エラー     |
| SEARCH_ERROR               | 検索         | 検索処理エラー         |
| ENTITY_EXTRACTION_ERROR    | グラフ       | エンティティ抽出エラー |
| RELATION_EXTRACTION_ERROR  | グラフ       | 関係抽出エラー         |
| COMMUNITY_DETECTION_ERROR  | グラフ       | コミュニティ検出エラー |

**ファクトリ関数**: `createRAGError(code, message, context?, cause?)`

### 6.9.3 共通インターフェース

**Repository パターン**:

- DIP（依存性逆転原則）準拠のデータアクセス抽象化
- `findById`, `findAll`, `create`, `update`, `delete`

**Strategy パターン**:

- `Converter<TInput, TOutput>` - ファイル変換の抽象化
- `SearchStrategy<TQuery, TResult>` - 検索アルゴリズムの抽象化

**ミックスイン**:

- `Timestamped` - 作成日時・更新日時
- `WithMetadata` - 任意のメタデータ
- `PaginationParams` / `PaginatedResult` - ページネーション

**実装場所**: `packages/shared/src/types/rag/*`

---

## 関連ドキュメント

- [アーキテクチャ設計](./05-architecture.md)
- [エラーハンドリング仕様](./07-error-handling.md)
- [プラグイン開発手順](./11-plugin-development.md)
- [ローカルエージェント仕様](./09-local-agent.md)
- [セキュリティガイドライン](./17-security-guidelines.md)
