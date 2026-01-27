# コンバーター インターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 変更履歴

| バージョン | 日付       | 変更内容                                           |
| ---------- | ---------- | -------------------------------------------------- |
| v1.1.0     | 2026-01-26 | コードブロックを表形式・文章に変換（ガイドライン準拠） |
| v1.0.0     | -          | 初版作成                                           |

---

## 概要

ファイル変換処理の共通インターフェース。すべてのコンバーター実装が準拠する。

> **詳細設計**: `docs/30-workflows/completed-tasks/conversion-base/requirements-interface.md`
> **実装**: `packages/shared/src/services/conversion/types.ts`

## ドキュメント構成

| ドキュメント | ファイル | 説明 |
|-------------|----------|------|
| 実装クラス詳細 | [interfaces-converter-implementations.md](./interfaces-converter-implementations.md) | 各コンバーターの使用例とメタデータ |
| 拡張ガイド | [interfaces-converter-extension.md](./interfaces-converter-extension.md) | 新規コンバーター実装パターン |

---

## IConverter インターフェース

### 必須プロパティ

| プロパティ           | 型                  | 説明                     |
| -------------------- | ------------------- | ------------------------ |
| `id`                 | `string`            | コンバーターID（一意）   |
| `name`               | `string`            | コンバーター名（表示用） |
| `supportedMimeTypes` | `readonly string[]` | サポートMIMEタイプ       |
| `priority`           | `number`            | 優先度（高いほど優先）   |

### 必須メソッド

| メソッド                        | 戻り値                                       | 説明               |
| ------------------------------- | -------------------------------------------- | ------------------ |
| `canConvert(input)`             | `boolean`                                    | 変換可能性の判定   |
| `convert(input, options?)`      | `Promise<Result<ConverterOutput, RAGError>>` | ファイル変換実行   |
| `estimateProcessingTime(input)` | `number`                                     | 推定処理時間（ms） |

### 使用手順

IConverterを使用してファイル変換を行う際の基本手順を以下に示す。

| 手順 | 操作                                         | 説明                                               |
| ---- | -------------------------------------------- | -------------------------------------------------- |
| 1    | globalConverterRegistryをインポート          | `@repo/shared/services/conversion`から取得         |
| 2    | findConverter(input)でコンバーター検索       | 入力ファイルに対応するコンバーターを自動選択       |
| 3    | result.successで検索結果を確認               | 対応コンバーターが見つかった場合trueを返す         |
| 4    | result.data.convert(input)で変換実行         | 非同期処理でResult型を返す                         |

> **モジュールパス**: `@repo/shared/services/conversion`

---

## 実装クラス一覧

| 実装クラス         | サポートMIME                                      | 優先度 | 実装状況 |
| ------------------ | ------------------------------------------------- | ------ | -------- |
| HTMLConverter      | text/html                                         | 10     | 実装済 |
| MarkdownConverter  | text/markdown, text/x-markdown                    | 10     | 実装済 |
| CodeConverter      | text/x-typescript, text/javascript, text/x-python | 10     | 実装済 |
| YAMLConverter      | application/x-yaml, text/yaml, text/x-yaml        | 10     | 実装済 |
| CSVConverter       | text/csv, text/tab-separated-values               | 5      | 実装済 |
| JSONConverter      | application/json                                  | 5      | 実装済 |
| PlainTextConverter | text/plain                                        | 0      | 未実装 |

詳細な使用例は [interfaces-converter-implementations.md](./interfaces-converter-implementations.md) を参照。

---

## IConversionLogger インターフェース

変換処理のログ記録用インターフェース。バッファリングによる効率的なDB書き込みをサポート。

> **実装**: `packages/shared/src/services/logging/types.ts`
> **詳細設計**: `docs/30-workflows/logging-service/`

### 必須メソッド

| メソッド | 戻り値 | 説明 |
| -------- | ------ | ---- |
| `info(fileId, message, metadata?)` | `void` | INFOレベルログ記録 |
| `warn(fileId, message, metadata?)` | `void` | WARNレベルログ記録 |
| `error(fileId, message, error?, metadata?)` | `void` | ERRORレベルログ記録 |
| `flush()` | `Promise<void>` | バッファを強制フラッシュ |
| `dispose()` | `void` | リソース解放 |

### 設定オプション

| オプション | 型 | デフォルト | 説明 |
| ---------- | -- | ---------- | ---- |
| `bufferSize` | `number` | 100 | バッファサイズ（件数） |
| `flushIntervalMs` | `number` | 5000 | 自動フラッシュ間隔（ミリ秒） |

### 使用手順

ConversionLoggerを使用してログを記録する際の基本手順を以下に示す。

| 手順 | 操作                                | 説明                                               |
| ---- | ----------------------------------- | -------------------------------------------------- |
| 1    | ConversionLoggerをインポート        | `@repo/shared/services/logging`から取得            |
| 2    | ConversionLoggerインスタンス生成    | repository と設定オプションを渡してインスタンス化  |
| 3    | info/warn/errorでログ記録           | fileId, message, metadata を指定してログを記録     |
| 4    | 終了時にflush()を呼び出し           | バッファに残ったログをDB書き込み（非同期）         |
| 5    | dispose()でリソース解放             | タイマー停止などのクリーンアップ処理               |

> **モジュールパス**: `@repo/shared/services/logging`

#### ログ記録メソッドの使用パターン

| メソッド | 用途例                    | 引数パターン                              |
| -------- | ------------------------- | ----------------------------------------- |
| info     | 変換開始、完了通知        | (fileId, message, metadata)               |
| warn     | 処理時間超過、リトライ    | (fileId, message, metadata)               |
| error    | 変換失敗、例外発生        | (fileId, message, error, metadata)        |

### ILogRepository インターフェース

ログ永続化用リポジトリインターフェース（DIP適用）。

| メソッド | 戻り値 | 説明 |
| -------- | ------ | ---- |
| `bulkInsert(entries)` | `Promise<void>` | バッチインサート |

> **実装予定**: CONV-05-02 (LogRepository実装タスク)

---

## IHistoryService インターフェース

ファイル変換履歴のバージョン管理用サービスインターフェース。履歴一覧取得、バージョン間差分比較、過去バージョンへの復元機能を提供。

> **実装**: `packages/shared/src/services/history/`
> **型定義**: `packages/shared/src/services/history/types.ts`

### 必須メソッド

| メソッド | 戻り値 | 説明 |
| -------- | ------ | ---- |
| `getFileHistory(fileId, options?)` | `Promise<Result<PaginatedResult<VersionHistoryItem>, Error>>` | 履歴一覧取得（ページネーション対応） |
| `getVersionDetail(conversionId)` | `Promise<Result<VersionHistoryItem, Error>>` | 特定バージョン詳細取得 |
| `getVersionDiff(idA, idB)` | `Promise<Result<VersionDiff, Error>>` | バージョン間差分取得 |
| `restoreToVersion(fileId, conversionId)` | `Promise<Result<VersionHistoryItem, Error>>` | 過去バージョンへ復元 |
| `getLatestVersion(fileId)` | `Promise<Result<VersionHistoryItem | null, Error>>` | 最新バージョン取得 |
| `getVersionCount(fileId)` | `Promise<Result<number, Error>>` | バージョン数取得 |

### 使用手順

HistoryServiceを使用して履歴管理を行う際の基本手順を以下に示す。

| 手順 | 操作                                | 説明                                               |
| ---- | ----------------------------------- | -------------------------------------------------- |
| 1    | createHistoryServiceをインポート    | `@repo/shared/services/history`から取得            |
| 2    | createHistoryServiceでインスタンス生成 | repository と logger を渡してサービス作成       |
| 3    | getFileHistory で履歴一覧取得       | paginationオプションでページネーション制御可能     |
| 4    | restoreToVersion でバージョン復元   | fileId と conversionId を指定して復元実行          |

> **モジュールパス**: `@repo/shared/services/history`

#### 主要操作パターン

| 操作             | メソッド                          | 必須引数                           |
| ---------------- | --------------------------------- | ---------------------------------- |
| 履歴一覧取得     | getFileHistory(fileId, options?)  | fileId（paginationはオプション）   |
| バージョン復元   | restoreToVersion(fileId, convId)  | fileId, conversionId               |
| 最新バージョン   | getLatestVersion(fileId)          | fileId                             |
| バージョン差分   | getVersionDiff(idA, idB)          | 比較対象の2つのconversionId        |

### 関連型定義

| 型 | 説明 |
| -- | ---- |
| `VersionHistoryItem` | バージョン履歴の1件分（conversionId, fileId, version, createdAt等） |
| `VersionDiff` | バージョン間差分（sizeChange, metadataChanges, contentChanged） |
| `HistoryOptions` | フィルタ・ページネーションオプション |
| `PaginatedResult<T>` | ページネーション結果（items, total, hasMore） |

---

## ConversionRepository インターフェース

変換履歴の永続化用リポジトリインターフェース（DIP適用）。

> **実装**: `packages/shared/src/services/history/types.ts`

### 必須メソッド

| メソッド | 戻り値 | 説明 |
| -------- | ------ | ---- |
| `findByFileId(fileId, options?)` | `Promise<Result<Conversion[], Error>>` | ファイル単位で履歴取得 |
| `findById(conversionId)` | `Promise<Result<Conversion | null, Error>>` | ID指定で取得 |
| `create(data)` | `Promise<Result<Conversion, Error>>` | 新規作成 |
| `countByFileId(fileId)` | `Promise<Result<number, Error>>` | 件数カウント |

---

## 関連ドキュメント

- [内部API仕様（ConversionService）](./api-internal-conversion.md)
- [コアインターフェース仕様](./interfaces-core.md)
- [エラーハンドリング仕様](./error-handling.md)
- [ファイル変換アーキテクチャ](./architecture-file-conversion.md)
