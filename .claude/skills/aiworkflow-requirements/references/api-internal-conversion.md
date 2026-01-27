# 内部サービスAPI（RAG変換システム）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 変更履歴

| バージョン | 日付       | 変更内容                                           |
| ---------- | ---------- | -------------------------------------------------- |
| v6.30.0    | 2026-01-26 | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |

---

## ConversionService API

RAG Conversion Systemは、HTTPエンドポイントとしてではなく、TypeScriptの内部サービスクラスとして実装されています。

**利用場所**: `packages/shared/src/services/conversion/`

**主要クラス**:

| クラス              | 責務                                       |
| ------------------- | ------------------------------------------ |
| `ConversionService` | 変換処理の統括、タイムアウト・同時実行制御 |
| `ConverterRegistry` | 利用可能なコンバーターの管理と選択         |
| `BaseConverter`     | 共通変換処理の抽象基底クラス               |

### メソッド

#### convert()

**メソッドシグネチャ**:

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| 戻り値型 | Promise\<Result\<ConverterOutput, RAGError\>\>（非同期） |

**パラメータ（input）**:

| プロパティ | 型                  | 必須 | 説明               |
| ---------- | ------------------- | ---- | ------------------ |
| fileId     | Branded型（string） | ✓    | ファイルID         |
| content    | string \| Buffer    | ✓    | ファイルコンテンツ |
| mimeType   | string              | ✓    | MIMEタイプ         |
| filePath   | string              | -    | ファイルパス       |

**パラメータ（options）**:

| プロパティ       | 型     | 必須 | デフォルト  | 説明             |
| ---------------- | ------ | ---- | ----------- | ---------------- |
| maxContentLength | number | -    | 100,000文字 | 最大コンテンツ長 |
| timeout          | number | -    | 60,000ms    | タイムアウト時間 |

**機能**:

- 単一ファイルを変換
- 同時実行数チェック（デフォルト: 最大5件）
- タイムアウト管理（デフォルト: 60秒）
- 自動コンバーター選択

**戻り値**:

| 状態   | 形式                                 |
| ------ | ------------------------------------ |
| 成功時 | success: true, data: ConverterOutput |
| 失敗時 | success: false, error: RAGError      |

#### convertBatch()

**メソッドシグネチャ**:

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| パラメータ | inputs: ConverterInput[], options?: ConverterOptions |
| 戻り値型   | Promise\<BatchConversionResult[]\>（非同期）         |

**機能**:

- 複数ファイルを一括変換
- チャンク単位で処理（同時実行数制限）
- Promise.allSettled()で一部失敗を許容

**戻り値**:

- 各ファイルの変換結果（成功/失敗）の配列

#### canConvert()

**メソッドシグネチャ**:

| 項目       | 内容                  |
| ---------- | --------------------- |
| パラメータ | input: ConverterInput |
| 戻り値型   | boolean（同期）       |

**機能**:

- 変換可能性を事前確認
- コンバーター検索のみ（変換は実行しない）

#### getSupportedMimeTypes()

**メソッドシグネチャ**:

| 項目       | 内容             |
| ---------- | ---------------- |
| パラメータ | なし             |
| 戻り値型   | string[]（同期） |

**機能**:

- サポートしているMIMEタイプ一覧を取得

### 使用パターン

**パターン1: グローバルインスタンス使用**

globalConversionServiceをインポートして使用する方法。アプリケーション全体で共有されるシングルトンインスタンスを利用する。

| ステップ | 操作                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 1        | @repo/shared/services/conversionからglobalConversionServiceをインポート |
| 2        | service.convert(input)を呼び出し                                       |
| 3        | Result型で結果を受け取り                                               |

**パターン2: カスタム設定インスタンス**

createConversionService関数でカスタム設定のインスタンスを作成する方法。

| 設定項目                 | 説明                     | カスタム例 |
| ------------------------ | ------------------------ | ---------- |
| customRegistry           | カスタムコンバーター登録 | -          |
| defaultTimeout           | タイムアウト時間         | 30000ms    |
| maxConcurrentConversions | 最大同時実行数           | 10件       |

### エラーハンドリング

**エラーコード**:

| コード                | 説明               | 原因                                   |
| --------------------- | ------------------ | -------------------------------------- |
| `RESOURCE_EXHAUSTED`  | 同時実行数超過     | 最大同時実行数に到達                   |
| `TIMEOUT`             | タイムアウト       | 変換処理が指定時間内に完了しなかった   |
| `CONVERTER_NOT_FOUND` | コンバーター未検出 | 対応するコンバーターが登録されていない |
| `CONVERSION_FAILED`   | 変換失敗           | 個別コンバーターでのエラー             |

**Result型パターンの使用方法**:

Result型はsuccessプロパティで成功/失敗を判定する。成功時はdata、失敗時はerrorプロパティにアクセスする。

| 判定条件                | 処理内容                                                         |
| ----------------------- | ---------------------------------------------------------------- |
| result.success が true  | result.dataからconvertedContent, extractedMetadataを取得         |
| result.success が false | result.errorからcode, message, contextを取得してエラー処理       |

### 性能特性

| 指標                       | 値     |
| -------------------------- | ------ |
| デフォルトタイムアウト     | 60秒   |
| 最大同時実行数             | 5件    |
| サポートMIMEタイプ         | 18種類 |
| 平均変換時間（小ファイル） | 3-50ms |
| 平均変換時間（Markdown）   | 400ms  |

---

## HistoryService API

変換履歴のバージョン管理サービス。履歴一覧取得、バージョン間差分比較、過去バージョンへの復元機能を提供。

**利用場所**: `packages/shared/src/services/history/`

**主要クラス**:

| クラス           | 責務                               |
| ---------------- | ---------------------------------- |
| `HistoryService` | 履歴取得・差分比較・復元処理の統括 |

### メソッド

#### getFileHistory()

**メソッドシグネチャ**:

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| パラメータ | fileId: string, options?: HistoryOptions                                    |
| 戻り値型   | Promise\<Result\<PaginatedResult\<VersionHistoryItem\>, Error\>\>（非同期） |

**機能**:

- ファイル単位のバージョン履歴一覧取得
- ページネーション対応（limit/offset）
- 結果は作成日時の降順（最新が先頭）

**パラメータ**:

- `fileId`: ファイルID
- `options.pagination.limit`: 取得件数（デフォルト: 10）
- `options.pagination.offset`: オフセット（デフォルト: 0）

**戻り値**:

- 成功: `{ success: true, data: { items, total, hasMore } }`
- 失敗: `{ success: false, error: Error }`

#### getVersionDetail()

**メソッドシグネチャ**:

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| パラメータ | conversionId: string                                     |
| 戻り値型   | Promise\<Result\<VersionHistoryItem, Error\>\>（非同期） |

**機能**:

- 特定バージョンの詳細情報取得
- 変換ステータス、ハッシュ値、サイズ等を含む

**エラーコード**:

- `Conversion not found`: 指定IDの変換履歴が存在しない

#### getVersionDiff()

**メソッドシグネチャ**:

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| パラメータ | conversionIdA: string, conversionIdB: string         |
| 戻り値型   | Promise\<Result\<VersionDiff, Error\>\>（非同期）    |

**機能**:

- 2つのバージョン間の差分を比較
- サイズ変更、メタデータ変更、コンテンツ変更を検出

**戻り値（VersionDiff型）**:

| プロパティ      | 型       | 説明                     |
| --------------- | -------- | ------------------------ |
| sizeChange      | number   | バイト単位の差分         |
| metadataChanges | string[] | 変更されたメタデータキー |
| contentChanged  | boolean  | 出力ハッシュの差異有無   |

#### restoreToVersion()

**メソッドシグネチャ**:

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| パラメータ | fileId: string, conversionId: string                     |
| 戻り値型   | Promise\<Result\<VersionHistoryItem, Error\>\>（非同期） |

**機能**:

- 過去バージョンの状態に復元
- 新規変換レコードとして作成（非破壊的）
- 入力ハッシュ、出力ハッシュ、サイズ情報をコピー

#### getLatestVersion()

**メソッドシグネチャ**:

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| パラメータ | fileId: string                                                    |
| 戻り値型   | Promise\<Result\<VersionHistoryItem \| null, Error\>\>（非同期）  |

**機能**:

- ファイルの最新変換結果を取得
- 存在しない場合は `null` を返す

#### getVersionCount()

**メソッドシグネチャ**:

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| パラメータ | fileId: string                              |
| 戻り値型   | Promise\<Result\<number, Error\>\>（非同期）|

**機能**:

- ファイルの総バージョン数をカウント

### 使用パターン

**パターン1: ファクトリ関数使用**

createHistoryService関数でサービスインスタンスを作成する。依存性（repository, logger）を注入して初期化する。

| ステップ | 操作                                                         |
| -------- | ------------------------------------------------------------ |
| 1        | @repo/shared/services/historyからcreateHistoryServiceをインポート |
| 2        | createHistoryService(repository, logger)でインスタンス作成   |
| 3        | service.getFileHistory(fileId)等のメソッドを呼び出し         |

**パターン2: Result型パターン**

Result型はsuccessプロパティで成功/失敗を判定する。差分比較の場合、成功時はsizeChange, metadataChanges, contentChangedを取得できる。

| 判定条件                | 処理内容                                     |
| ----------------------- | -------------------------------------------- |
| result.success が true  | result.dataから差分情報を取得                |
| result.success が false | result.error.messageでエラーメッセージを取得 |

### エラーハンドリング

**エラーメッセージ**:

| メッセージ                           | 説明                             |
| ------------------------------------ | -------------------------------- |
| `Conversion not found`               | 指定IDの変換履歴が存在しない     |
| `Source conversion not found`        | 差分比較の元バージョンが存在しない |
| `Target conversion not found`        | 差分比較の先バージョンが存在しない |
| `Cannot restore: conversion not found` | 復元対象のバージョンが存在しない |

### 性能特性

| 指標                 | 値       |
| -------------------- | -------- |
| テストカバレッジ     | 100%     |
| テスト数             | 41ケース |
| 平均レスポンス時間   | < 50ms   |

### 関連ドキュメント

- [IHistoryService インターフェース](./interfaces-converter.md#ihistoryservice-インターフェース)
- [ConversionRepository インターフェース](./interfaces-converter.md#conversionrepository-インターフェース)
- [ファイル変換アーキテクチャ](./architecture-file-conversion.md)

---

## Electron HistoryService API

Electron MainプロセスのHistoryServiceは、shared HistoryServiceとIPCを橋渡しするアダプター層。

**実装場所**: `apps/desktop/src/main/services/HistoryService.ts`
**統合日**: 2026-01-12（history-service-db-integration）

### アーキテクチャ

**データフロー**:

Renderer → IPC → Electron HistoryService → shared HistoryService → DB

並行して、Electron HistoryServiceはLogRepositoryを経由してlogsテーブルにもアクセスする。

| レイヤー                | 責務                                       |
| ----------------------- | ------------------------------------------ |
| Renderer                | UI操作、API呼び出し                        |
| IPC                     | プロセス間通信                             |
| Electron HistoryService | アダプター、型変換、エラーローカライズ     |
| shared HistoryService   | ビジネスロジック                           |
| DB                      | データ永続化                               |
| LogRepository           | ログデータアクセス                         |

### IPCチャンネル

#### history:getFileHistory

**呼び出し方法**: window.historyAPI.getFileHistory(fileId, options)

**パラメータ**:

| パラメータ     | 型     | 必須 | デフォルト |
| -------------- | ------ | ---- | ---------- |
| fileId         | string | ✓    | -          |
| options.limit  | number | -    | 20         |
| options.offset | number | -    | 0          |

**戻り値型**: Promise\<Result\<PaginatedResult\<VersionHistoryItem\>, Error\>\>

#### history:getVersionDetail

**呼び出し方法**: window.historyAPI.getVersionDetail(conversionId)

**パラメータ**:

| パラメータ   | 型     | 必須 | 説明       |
| ------------ | ------ | ---- | ---------- |
| conversionId | string | ✓    | 変換履歴ID |

**戻り値型**: Promise\<Result\<VersionDetailData, Error\>\>

VersionDetailDataはバージョン情報とログ一覧を統合した型。

#### history:getConversionLogs

**呼び出し方法**: window.historyAPI.getConversionLogs(conversionId, options)

**パラメータ**:

| パラメータ     | 型     | 必須 | デフォルト |
| -------------- | ------ | ---- | ---------- |
| conversionId   | string | ✓    | -          |
| options.limit  | number | -    | 50         |
| options.offset | number | -    | 0          |
| options.level  | string | -    | undefined  |

**戻り値型**: Promise\<Result\<PaginatedResult\<ConversionLog\>, Error\>\>

#### history:restoreVersion

**呼び出し方法**: window.historyAPI.restoreVersion(fileId, conversionId)

**パラメータ**:

| パラメータ   | 型     | 必須 | 説明       |
| ------------ | ------ | ---- | ---------- |
| fileId       | string | ✓    | ファイルID |
| conversionId | string | ✓    | 変換履歴ID |

**戻り値型**: Promise\<Result\<VersionHistoryItem, Error\>\>

### 型変換（shared → Renderer）

| shared型 | Renderer型 | 変換 |
|----------|------------|------|
| `sizeBytes` | `size` | フィールド名変更 |
| `contentHash` | `hash` | フィールド名変更 |
| `isCurrentVersion` | `isLatest` | フィールド名変更 |
| `createdAt: Date` | `createdAt: string` | ISO 8601形式 |

### エラーメッセージ（日本語ローカライズ）

| 内部エラー | ユーザー向けメッセージ |
|-----------|---------------------|
| `Conversion not found` | 「指定されたバージョンが見つかりません」 |
| `does not belong to file` | 「このファイルには復元できません」 |
| `database` / `DB` | 「データベース接続に問題があります」 |
| その他 | 「予期しないエラーが発生しました」 |

### 使用パターン

**パターン1: DI使用（推奨）**

createHistoryServiceWithDI関数で依存性注入によるインスタンス作成を行う。

| 依存性               | 説明                           |
| -------------------- | ------------------------------ |
| sharedHistoryService | shared層のHistoryService       |
| logRepository        | ログデータアクセス用リポジトリ |
| logger               | ログ出力用インスタンス         |

**パターン2: IPCハンドラー登録**

ipcMain.handleでIPCチャンネルとサービスメソッドを紐付ける。

| IPCチャンネル            | 対応メソッド                    |
| ------------------------ | ------------------------------- |
| history:getFileHistory   | historyService.getFileHistory   |
| history:getVersionDetail | historyService.getVersionDetail |
| history:getConversionLogs| historyService.getConversionLogs|
| history:restoreVersion   | historyService.restoreVersion   |

### 性能特性

| 指標 | 目標 | 実績 |
|------|------|------|
| getFileHistory | <200ms | 達成 |
| getVersionDetail | <100ms | 達成 |
| getConversionLogs | <200ms | 達成 |
| restoreVersion | <500ms | 達成 |

### 品質メトリクス

| 指標 | 実績 |
|------|------|
| Line Coverage | 92.16% |
| Branch Coverage | 100% |
| Function Coverage | 91.66% |
| 統合テスト数 | 31ケース |
