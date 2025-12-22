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

## 6.1A IConverter インターフェース

> **詳細設計**: `docs/30-workflows/completed-tasks/conversion-base/requirements-interface.md`
> **実装**: `packages/shared/src/services/conversion/types.ts`

ファイル変換処理の共通インターフェース。すべてのコンバーター実装が準拠する。

### 6.1A.1 必須プロパティ

| プロパティ           | 型                  | 説明                     |
| -------------------- | ------------------- | ------------------------ |
| `id`                 | `string`            | コンバーターID（一意）   |
| `name`               | `string`            | コンバーター名（表示用） |
| `supportedMimeTypes` | `readonly string[]` | サポートMIMEタイプ       |
| `priority`           | `number`            | 優先度（高いほど優先）   |

### 6.1A.2 必須メソッド

| メソッド                        | 戻り値                                       | 説明               |
| ------------------------------- | -------------------------------------------- | ------------------ |
| `canConvert(input)`             | `boolean`                                    | 変換可能性の判定   |
| `convert(input, options?)`      | `Promise<Result<ConverterOutput, RAGError>>` | ファイル変換実行   |
| `estimateProcessingTime(input)` | `number`                                     | 推定処理時間（ms） |

### 6.1A.3 使用例

```typescript
import { globalConverterRegistry } from "@repo/shared/services/conversion";

const result = globalConverterRegistry.findConverter(input);
if (result.success) {
  const converted = await result.data.convert(input);
}
```

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

## 6.9 FileSelection API

ファイル選択機能のIPC通信インターフェース。ElectronのMain-Renderer間でファイル選択ダイアログ、メタデータ取得、パス検証を提供する。

### 6.9.1 IPCチャンネル

| チャンネル                           | 方向            | 説明                         |
| ------------------------------------ | --------------- | ---------------------------- |
| FILE_SELECTION_OPEN_DIALOG           | Renderer → Main | ファイル選択ダイアログを開く |
| FILE_SELECTION_GET_METADATA          | Renderer → Main | 単一ファイルのメタデータ取得 |
| FILE_SELECTION_GET_MULTIPLE_METADATA | Renderer → Main | 複数ファイルのメタデータ取得 |
| FILE_SELECTION_VALIDATE_PATH         | Renderer → Main | ファイルパスの存在・種別検証 |

### 6.9.2 リクエスト/レスポンス型

**OpenFileDialogRequest**:

| フィールド      | 型                 | 必須 | 説明                                              |
| --------------- | ------------------ | ---- | ------------------------------------------------- |
| filterCategory  | FileFilterCategory | 任意 | フィルターカテゴリ（all/office/text/media/image） |
| multiSelections | boolean            | 任意 | 複数選択を許可するか（デフォルト: true）          |

**GetFileMetadataRequest**:

| フィールド | 型     | 必須 | 説明                               |
| ---------- | ------ | ---- | ---------------------------------- |
| filePath   | string | 必須 | ファイルの絶対パス（1000文字以内） |

**GetMultipleFileMetadataRequest**:

| フィールド | 型       | 必須 | 説明                            |
| ---------- | -------- | ---- | ------------------------------- |
| filePaths  | string[] | 必須 | ファイルパスの配列（最大100件） |

**ValidateFilePathRequest**:

| フィールド | 型     | 必須 | 説明         |
| ---------- | ------ | ---- | ------------ |
| filePath   | string | 必須 | 検証対象パス |

### 6.9.3 セキュリティ機能

| 機能                         | 説明                                               |
| ---------------------------- | -------------------------------------------------- |
| パストラバーサル防止         | `..` を含むパスを拒否                              |
| 送信元検証（SEC-M1）         | リクエストがフォーカス中のウィンドウから来たか検証 |
| 危険拡張子フィルタ（SEC-M2） | exe, bat, cmd等の危険な拡張子をダイアログから除外  |
| レート制限                   | 同一送信者からのリクエストを1秒間に10回まで制限    |

### 6.9.4 UIコンポーネント

**FileSelector コンポーネント** (`apps/desktop/src/renderer/components/organisms/FileSelector/`):

| data-testid         | 要素             | 説明                       |
| ------------------- | ---------------- | -------------------------- |
| file-selector       | コンテナ         | FileSelectorのルート要素   |
| file-drop-zone      | ドロップゾーン   | ドラッグ&ドロップエリア    |
| file-select-button  | ボタン           | ファイル選択ダイアログ起動 |
| file-filter-select  | セレクトボックス | フィルターカテゴリ選択     |
| error-message       | アラート         | エラーメッセージ表示       |
| selected-files-list | リスト           | 選択済みファイル一覧       |
| selected-file-item  | リストアイテム   | 各ファイルエントリ         |
| file-delete-button  | ボタン           | ファイル削除               |
| file-count          | テキスト         | 選択ファイル数表示         |
| loading-spinner     | スピナー         | 読み込み中表示             |

**実装場所**:

- IPC ハンドラー: `apps/desktop/src/main/ipc/fileSelectionHandlers.ts`
- Preload API: `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/types.ts`
- Zodスキーマ: `packages/shared/schemas/file-selection.schema.ts`
- UIコンポーネント: `apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.tsx`

## 6.9 RAG型定義

RAGパイプライン実装で使用する共通型定義。

**実装場所**: `packages/shared/src/types/rag/*`

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

### 6.9.4 ファイル・変換ドメイン型定義

RAGパイプラインにおけるファイル選択・変換処理の型定義とバリデーション。

**実装場所**: `packages/shared/src/types/rag/file/`

**主要型**:

- `FileEntity`: ファイルメタデータを表すエンティティ
- `ConversionEntity`: 変換処理の状態を管理するエンティティ
- `FileType`: サポートされるMIMEタイプ（16種類）
- `FileCategory`: ファイルのカテゴリ分類（text, code, document等）

#### FileEntity型

| プロパティ   | 型           | 説明                                      |
| ------------ | ------------ | ----------------------------------------- |
| id           | FileId       | ファイルの一意識別子（UUID）              |
| name         | string       | ファイル名（1-255文字）                   |
| path         | string       | ファイルパス                              |
| mimeType     | FileType     | MIMEタイプ                                |
| category     | FileCategory | カテゴリ                                  |
| size         | number       | ファイルサイズ（バイト、10MB上限）        |
| hash         | string       | SHA-256ハッシュ（64文字）                 |
| encoding     | string       | 文字エンコーディング（デフォルト: utf-8） |
| lastModified | Date         | 最終更新日時                              |
| createdAt    | Date         | 作成日時                                  |
| updatedAt    | Date         | 更新日時                                  |
| metadata     | object       | 拡張メタデータ                            |

#### サポートファイルタイプ

| カテゴリ       | MIMEタイプ例                                       | 用途                       |
| -------------- | -------------------------------------------------- | -------------------------- |
| テキスト系     | text/plain, text/markdown, text/html               | ドキュメント、Markdown     |
| コード系       | text/typescript, application/json                  | ソースコード、設定ファイル |
| ドキュメント系 | application/pdf, application/vnd.openxmlformats-\* | PDF、Office文書            |

#### バリデーション

**Zodスキーマ**: すべての型に対応するZodスキーマを提供

- 実行時型安全性を保証
- 日本語エラーメッセージ対応
- UUID形式、ファイルサイズ、ハッシュ形式等の検証

**ユーティリティ関数**:

- `getFileTypeFromExtension()`: 拡張子からMIMEタイプを推定
- `calculateFileHash()`: SHA-256ハッシュ計算（非同期）
- `formatFileSize()`: バイト数を人間可読形式に変換
- `validateFileSize()`: ファイルサイズの妥当性検証

**Result型**: Railway Oriented Programmingパターンによるエラーハンドリング

### 6.9.5 設計原則

| 原則           | 説明                                                 |
| -------------- | ---------------------------------------------------- |
| 型安全性       | Branded TypesによるID型の厳格化                      |
| DRY原則        | 共有定数の一元管理                                   |
| 不変性         | readonly修飾子による値の変更防止                     |
| バリデーション | Zodスキーマによるランタイムバリデーション            |
| テスト容易性   | 純粋関数による高いテスタビリティ（96.50%カバレッジ） |

**参照**: `docs/30-workflows/completed-tasks/file-conversion-schemas/` - 詳細な設計・実装ドキュメント

### 6.9.6 チャンク・埋め込み型定義

RAGパイプラインにおけるテキストチャンク分割と埋め込みベクトル生成の型定義とバリデーション。

**実装場所**: `packages/shared/src/types/rag/chunk/`

**主要型**:

- `ChunkEntity`: 分割されたテキストチャンクのエンティティ
- `EmbeddingEntity`: 埋め込みベクトルのエンティティ
- `ChunkingStrategy`: チャンク分割戦略（7種類）
- `EmbeddingProvider`: 埋め込み生成プロバイダー（4種類）

#### ChunkEntity型

分割されたテキストチャンクを表すエンティティ。

| プロパティ        | 型               | 説明                                    |
| ----------------- | ---------------- | --------------------------------------- |
| id                | ChunkId          | チャンクの一意識別子（UUID）            |
| fileId            | FileId           | 親ファイルのID                          |
| content           | string           | チャンクの本文（10-10000文字）          |
| contextualContent | string \| null   | 文脈情報付きコンテンツ（RAG精度向上用） |
| position          | ChunkPosition    | チャンクの位置情報                      |
| strategy          | ChunkingStrategy | 使用した分割戦略                        |
| tokenCount        | number           | 推定トークン数                          |
| hash              | string           | SHA-256ハッシュ（重複検出用、64文字）   |
| metadata          | object           | 拡張メタデータ                          |
| createdAt         | Date             | 作成日時（Timestamped継承）             |
| updatedAt         | Date             | 更新日時（Timestamped継承）             |

**継承**: `Timestamped`, `WithMetadata`（CONV-03-01基礎型）

#### EmbeddingEntity型

埋め込みベクトルを表すエンティティ。

| プロパティ | 型                | 説明                                       |
| ---------- | ----------------- | ------------------------------------------ |
| id         | EmbeddingId       | 埋め込みの一意識別子（UUID）               |
| chunkId    | ChunkId           | 関連チャンクのID                           |
| vector     | Float32Array      | 埋め込みベクトル（64-4096次元）            |
| provider   | EmbeddingProvider | 埋め込みプロバイダー                       |
| modelId    | string            | 使用モデルID（例: text-embedding-3-small） |
| dimensions | number            | ベクトルの次元数（64-4096）                |
| metadata   | object            | 拡張メタデータ                             |
| createdAt  | Date              | 作成日時（Timestamped継承）                |
| updatedAt  | Date              | 更新日時（Timestamped継承）                |

**継承**: `Timestamped`, `WithMetadata`（CONV-03-01基礎型）

#### チャンキング戦略

テキスト分割の方法を定義する列挙型。

| 戦略            | 説明                                     |
| --------------- | ---------------------------------------- |
| fixed_size      | 固定トークン数で分割（単純、予測可能）   |
| semantic        | 意味的まとまりで分割（AI活用、高品質）   |
| recursive       | 再帰的分割（バランス重視、デフォルト）   |
| sentence        | 文単位で分割（文脈保持）                 |
| paragraph       | 段落単位で分割（長文向け）               |
| markdown_header | Markdownヘッダー階層で分割（構造化文書） |
| code_block      | コードブロック単位で分割（プログラム）   |

#### 埋め込みプロバイダー

埋め込みベクトル生成サービスの列挙型。

| プロバイダー | 説明                                    |
| ------------ | --------------------------------------- |
| openai       | OpenAI Embeddings（text-embedding-3等） |
| cohere       | Cohere Embeddings（embed-english-v3等） |
| voyage       | Voyage AI（voyage-2等）                 |
| local        | ローカルモデル（all-MiniLM-L6-v2等）    |

#### デフォルト設定

**チャンキング設定**: `defaultChunkingConfig`

| 設定項目           | デフォルト値 | 説明                       |
| ------------------ | ------------ | -------------------------- |
| strategy           | recursive    | 再帰的分割（バランス重視） |
| targetSize         | 512          | 目標トークン数             |
| minSize            | 100          | 最小トークン数             |
| maxSize            | 1024         | 最大トークン数             |
| overlapSize        | 50           | 重複トークン数             |
| preserveBoundaries | true         | 文・段落境界の保持         |
| includeContext     | true         | 文脈情報の付加             |

**埋め込みモデル設定**: `defaultEmbeddingModelConfigs`

| プロバイダー | モデルID               | 次元数 | 最大トークン | バッチサイズ |
| ------------ | ---------------------- | ------ | ------------ | ------------ |
| openai       | text-embedding-3-small | 1536   | 8191         | 100          |
| cohere       | embed-english-v3.0     | 1024   | 512          | 96           |
| voyage       | voyage-2               | 1024   | 4000         | 100          |
| local        | all-MiniLM-L6-v2       | 384    | 256          | 32           |

#### ベクトル演算ユーティリティ

**ベクトル演算**: 埋め込みベクトルの数学的操作

| 関数              | 説明                                |
| ----------------- | ----------------------------------- |
| normalizeVector   | L2正規化（単位ベクトル化）          |
| cosineSimilarity  | コサイン類似度計算（-1から1の範囲） |
| euclideanDistance | ユークリッド距離計算                |
| dotProduct        | 内積計算                            |
| vectorMagnitude   | ベクトルの大きさ（L2ノルム）計算    |

**変換ユーティリティ**: ベクトルのシリアライゼーション

| 関数               | 説明                                 |
| ------------------ | ------------------------------------ |
| vectorToBase64     | Float32ArrayをBase64文字列に変換     |
| base64ToVector     | Base64文字列をFloat32Arrayに復元     |
| estimateTokenCount | テキストのトークン数推定（日英対応） |

**バリデーション**: すべての型に対応するZodスキーマを提供し、実行時型安全性を保証。

**参照**: `docs/30-workflows/completed-tasks/rag-chunk-embedding/` - 詳細な設計・実装ドキュメント

### 6.9.7 Knowledge Graph型定義

GraphRAGにおけるKnowledge Graph構造の型定義。Entity-Relation-Communityモデルに基づく。

**実装場所**: `packages/shared/src/types/rag/graph/`

#### 主要Entity型

| 型名            | 役割       | 説明                                  |
| --------------- | ---------- | ------------------------------------- |
| EntityEntity    | ノード     | Knowledge Graphの頂点（エンティティ） |
| RelationEntity  | エッジ     | Knowledge Graphの辺（関係性）         |
| CommunityEntity | クラスター | 意味的に関連するエンティティ群        |

#### EntityEntity型（ノード）

| プロパティ     | 型                   | 説明                         |
| -------------- | -------------------- | ---------------------------- |
| id             | EntityId             | エンティティID（UUID）       |
| name           | string               | エンティティ名               |
| normalizedName | string               | 正規化名                     |
| type           | EntityType           | エンティティタイプ（52種類） |
| embedding      | Float32Array \| null | ベクトル埋め込み             |
| importance     | number               | 重要度スコア（0.0〜1.0）     |

**エンティティタイプ**: 52種類を10カテゴリに分類（人物・組織、場所・時間、ビジネス・経営、技術全般、コード・ソフトウェア、抽象概念、ドキュメント構造、ドキュメント要素、メディア、その他）

#### RelationEntity型（エッジ）

| プロパティ | 型                 | 説明                   |
| ---------- | ------------------ | ---------------------- |
| id         | RelationId         | 関係ID（UUID）         |
| sourceId   | EntityId           | 始点エンティティID     |
| targetId   | EntityId           | 終点エンティティID     |
| type       | RelationType       | 関係タイプ（23種類）   |
| weight     | number             | 関係の強さ（0.0〜1.0） |
| evidence   | RelationEvidence[] | 証拠（必須1件以上）    |

**関係タイプ**: 23種類を6カテゴリに分類（汎用関係、時間的関係、技術的関係、階層関係、参照関係、人物関係）

**制約**: Self-loop禁止（`sourceId !== targetId`）

#### CommunityEntity型（クラスター）

| プロパティ      | 型                  | 説明                       |
| --------------- | ------------------- | -------------------------- |
| id              | CommunityId         | コミュニティID（UUID）     |
| level           | number              | 階層レベル（0=ルート）     |
| parentId        | CommunityId \| null | 親コミュニティID           |
| memberEntityIds | EntityId[]          | メンバーエンティティID配列 |
| memberCount     | number              | メンバー数                 |
| summary         | string              | コミュニティ要約           |

**階層制約**: level 0は`parentId === null`

#### ユーティリティ関数

| 関数                      | 説明                         |
| ------------------------- | ---------------------------- |
| normalizeEntityName       | エンティティ名の正規化       |
| calculateEntityImportance | 簡易PageRankによる重要度計算 |
| getInverseRelationType    | 関係の逆関係取得             |
| generateCommunityName     | コミュニティ名の自動生成     |
| calculateGraphDensity     | グラフ密度計算               |

**バリデーション**: Zodスキーマによるランタイムバリデーション（カスタム制約含む）

**テストカバレッジ**: 99.2%（230テストケース）

**詳細参照**: `docs/00-requirements/05-architecture.md` セクション5.6

### 6.9.8 検索クエリ・結果型定義

HybridRAG検索エンジンのクエリ・結果インターフェース。Keyword検索・Semantic検索・Graph検索を統合し、RRF（Reciprocal Rank Fusion）とCRAGによる高精度な検索を実現。

**実装場所**: `packages/shared/src/types/rag/search/`

#### 主要型

**SearchQuery**: ハイブリッド検索のクエリ型

| プロパティ | 型            | 説明                                     |
| ---------- | ------------- | ---------------------------------------- |
| text       | string        | 検索テキスト（1-1000文字）               |
| type       | QueryType     | クエリタイプ（local/global/hybrid等）    |
| embedding  | Float32Array  | 埋め込みベクトル（Semantic検索用）       |
| filters    | SearchFilters | 検索フィルター（ファイルID、日付範囲等） |
| options    | SearchOptions | 検索オプション（limit、戦略、重み等）    |

**SearchResult**: 統合検索結果

| プロパティ     | 型                    | 説明                                 |
| -------------- | --------------------- | ------------------------------------ |
| query          | SearchQuery           | 実行されたクエリ                     |
| results        | SearchResultItem[]    | 検索結果アイテム配列                 |
| totalCount     | number                | 総結果数                             |
| processingTime | number                | 処理時間（ミリ秒）                   |
| strategies     | SearchStrategyMetrics | 各戦略のメトリクス（実行時間、件数） |

**SearchResultItem**: 個別検索結果

| プロパティ | 型                  | 説明                                                 |
| ---------- | ------------------- | ---------------------------------------------------- |
| id         | string              | 結果アイテムID                                       |
| type       | SearchResultType    | 結果タイプ（chunk/entity/community）                 |
| score      | number              | 総合スコア（0.0-1.0）                                |
| relevance  | RelevanceScore      | 詳細スコア（keyword/semantic/graph/rerank）          |
| content    | SearchResultContent | コンテンツ（本文、要約、前後コンテキスト）           |
| highlights | Highlight[]         | ハイライト情報（マッチ箇所のオフセット）             |
| sources    | SearchResultSources | ソース情報（チャンクID、ファイルID、エンティティID） |

#### 列挙型

| 型名             | 値                                  | 用途                       |
| ---------------- | ----------------------------------- | -------------------------- |
| QueryType        | local, global, relationship, hybrid | ユーザーの検索意図分類     |
| SearchStrategy   | keyword, semantic, graph, hybrid    | 検索アルゴリズム識別       |
| SearchResultType | chunk, entity, community            | 検索結果アイテムの種類識別 |

#### 検索設定型

**SearchWeights**: 検索戦略の重み（合計1.0に制約）

| プロパティ | 型     | 説明                    |
| ---------- | ------ | ----------------------- |
| keyword    | number | Keyword検索重み（0-1）  |
| semantic   | number | Semantic検索重み（0-1） |
| graph      | number | Graph検索重み（0-1）    |

**SearchOptions**: 検索オプション

| プロパティ        | 型               | 説明                           |
| ----------------- | ---------------- | ------------------------------ |
| limit             | number           | 最大取得件数（1-100）          |
| offset            | number           | オフセット（ページネーション） |
| includeMetadata   | boolean          | メタデータを含む               |
| includeHighlights | boolean          | ハイライトを含む               |
| rerankEnabled     | boolean          | リランキング有効化             |
| cragEnabled       | boolean          | CRAG評価有効化                 |
| strategies        | SearchStrategy[] | 使用する検索戦略               |
| weights           | SearchWeights    | 各戦略の重み                   |

**CRAGScore**: CRAG（Corrective RAG）評価スコア

| プロパティ     | 型                                      | 説明                                  |
| -------------- | --------------------------------------- | ------------------------------------- |
| relevance      | "correct" \| "incorrect" \| "ambiguous" | 関連性評価                            |
| confidence     | number                                  | 信頼度（0.0-1.0）                     |
| needsWebSearch | boolean                                 | Web検索が必要か                       |
| refinedQuery   | string \| null                          | 改良されたクエリ（ambiguous時に生成） |

#### バリデーション

**Zodスキーマ**: 全25型に対応するZodスキーマを提供

- 実行時型安全性を保証
- カスタムrefineバリデーション（searchWeights合計1.0、日付範囲、ハイライトオフセット等）
- 日本語エラーメッセージ対応

**デフォルト値**:

- `DEFAULT_SEARCH_OPTIONS`: limit=20, weights={keyword:0.35, semantic:0.35, graph:0.3}
- `DEFAULT_RRF_CONFIG`: k=60, normalizeScores=true
- `DEFAULT_RERANK_CONFIG`: model="cross-encoder/ms-marco-MiniLM-L-6-v2", topK=50

#### ユーティリティ関数

| 関数               | 説明                                                        |
| ------------------ | ----------------------------------------------------------- |
| calculateRRFScore  | 複数戦略のランキングをRRFアルゴリズムで統合                 |
| normalizeScores    | スコア配列をMin-Max正規化                                   |
| deduplicateResults | 重複結果を4種の戦略で排除（max_score/sum_score/first/last） |
| expandQuery        | クエリ拡張（同義語・関連語追加）                            |
| calculateCRAGScore | CRAG評価スコア計算（correct/incorrect/ambiguous判定）       |
| mergeSearchResults | 複数ソースの検索結果をマージ・重複排除                      |
| sortByRelevance    | 関連度でソート（昇順/降順、タイブレーカー対応）             |
| filterByThreshold  | 閾値でフィルタリング                                        |

#### 型ガード

| 関数              | 説明                                  |
| ----------------- | ------------------------------------- |
| isChunkResult     | SearchResultItemがChunk結果か判定     |
| isEntityResult    | SearchResultItemがEntity結果か判定    |
| isCommunityResult | SearchResultItemがCommunity結果か判定 |

**テスト品質**: 123テストケース、96.93%カバレッジ達成（types, schemas, utils, type-inference, zod-validation）

**参照**: `docs/30-workflows/completed-tasks/rag-search-system/` - 詳細な設計・実装ドキュメント

---

## 関連ドキュメント

- [アーキテクチャ設計](./05-architecture.md)
- [エラーハンドリング仕様](./07-error-handling.md)
- [プラグイン開発手順](./11-plugin-development.md)
- [ローカルエージェント仕様](./09-local-agent.md)
- [セキュリティガイドライン](./17-security-guidelines.md)
