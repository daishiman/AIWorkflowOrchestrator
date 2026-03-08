# 履歴UIデータ型・IPC通信

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [ui-ux-history-panel.md](./ui-ux-history-panel.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                           |
| ---------- | ---------- | -------------------------------------------------- |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式に変換 |
| v1.0.0     | -          | 初版作成                                           |

---

## データ型

### VersionHistoryItem

バージョン履歴の1アイテムを表すデータ構造。ファイルの特定バージョンに関する情報を保持する。

| フィールド   | 型                      | 必須     | 説明                           |
| ------------ | ----------------------- | -------- | ------------------------------ |
| conversionId | string                  | 必須     | 変換ID                         |
| fileId       | string                  | 必須     | ファイルID                     |
| version      | number                  | 必須     | バージョン番号                 |
| createdAt    | string                  | 必須     | 作成日時（ISO 8601形式）       |
| size         | number                  | 必須     | ファイルサイズ（bytes）        |
| mimeType     | string                  | 必須     | MIMEタイプ                     |
| hash         | string                  | 必須     | コンテンツハッシュ             |
| isLatest     | boolean                 | 必須     | 最新バージョンフラグ           |
| metadata     | Record<string, unknown> | オプション | メタデータ（任意のキーバリュー） |

### ConversionLog

変換処理のログエントリを表すデータ構造。

#### LogLevel（ログレベル）

ログの重要度を示す4段階の分類。

| 値    | 説明                           |
| ----- | ------------------------------ |
| info  | 情報レベル（通常の処理状況）   |
| warn  | 警告レベル（注意が必要な状況） |
| error | エラーレベル（処理失敗）       |
| debug | デバッグレベル（詳細情報）     |

#### ConversionLog フィールド

| フィールド | 型                      | 必須     | 説明                             |
| ---------- | ----------------------- | -------- | -------------------------------- |
| timestamp  | string                  | 必須     | タイムスタンプ（ISO 8601形式）   |
| level      | LogLevel                | 必須     | ログレベル（上記4種類のいずれか） |
| message    | string                  | 必須     | ログメッセージ                   |
| details    | Record<string, unknown> | オプション | 詳細情報（任意のキーバリュー）    |

### API結果型

API呼び出しの結果を統一的に表現するための型システム。成功時と失敗時で異なる構造を持つ判別共用体（Discriminated Union）パターンを採用している。

#### SuccessResult（成功結果）

API呼び出しが成功した場合の結果構造。

| フィールド | 型      | 説明                             |
| ---------- | ------- | -------------------------------- |
| success    | true    | 成功フラグ（常にtrue）           |
| data       | T       | 取得したデータ（ジェネリック型） |

#### ErrorResult（エラー結果）

API呼び出しが失敗した場合の結果構造。

| フィールド | 型    | 説明                    |
| ---------- | ----- | ----------------------- |
| success    | false | 成功フラグ（常にfalse） |
| error      | Error | エラーオブジェクト      |

#### Result（統合結果型）

SuccessResultまたはErrorResultのいずれかを表す共用体型。successフィールドの値によって型が判別される。

#### PaginatedResult（ページネーション結果）

リスト形式のデータを返す際に使用するページネーション対応の結果構造。

| フィールド | 型      | 説明                                   |
| ---------- | ------- | -------------------------------------- |
| items      | T[]     | 取得したアイテムの配列（ジェネリック型） |
| total      | number  | 全アイテム数                           |
| hasMore    | boolean | 追加データの有無                       |

---

## IPC通信

### チャンネル一覧

| チャンネル                  | 方向            | 用途               |
| --------------------------- | --------------- | ------------------ |
| `history:getFileHistory`    | Renderer → Main | 履歴一覧取得       |
| `history:getVersionDetail`  | Renderer → Main | バージョン詳細取得 |
| `history:getConversionLogs` | Renderer → Main | 変換ログ取得       |
| `history:restoreVersion`    | Renderer → Main | バージョン復元     |

### History API (window.historyAPI)

RendererプロセスからHistoryAPIを利用するためのPreload API。window.historyAPIとしてグローバルに公開される。

#### メソッド一覧

| メソッド          | 引数                                           | 戻り値                                               | 説明               |
| ----------------- | ---------------------------------------------- | ---------------------------------------------------- | ------------------ |
| getFileHistory    | fileId: string, options?: PaginationOptions    | Promise<Result<PaginatedResult<VersionHistoryItem>>> | 履歴一覧取得       |
| getVersionDetail  | conversionId: string                           | Promise<Result<VersionDetailData>>                   | バージョン詳細取得 |
| getConversionLogs | conversionId: string, options?: LogFilterOptions | Promise<Result<PaginatedResult<ConversionLog>>>      | 変換ログ取得       |
| restoreVersion    | fileId: string, conversionId: string           | Promise<Result<VersionHistoryItem>>                  | バージョン復元     |

### ページネーション設定

履歴取得時のページネーションオプション。デフォルトでは1回のリクエストで20件を取得する。

#### デフォルト値

| 設定          | 値 |
| ------------- | -- |
| DEFAULT_LIMIT | 20 |

#### PaginationOptions フィールド

| フィールド | 型     | 必須     | デフォルト | 説明           |
| ---------- | ------ | -------- | ---------- | -------------- |
| limit      | number | オプション | 20         | 取得件数       |
| offset     | number | オプション | 0          | オフセット位置 |

---

## 関連ドキュメント

- [履歴UIコンポーネント](./ui-history-components.md)
- [履歴UI設計](./ui-history-design.md)
- [履歴UI統合](./ui-history-integration.md)
