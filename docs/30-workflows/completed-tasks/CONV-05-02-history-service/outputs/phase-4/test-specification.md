# Phase 4: テスト仕様書

## 概要

履歴取得サービス（HistoryService）のTDD Redフェーズにおけるテスト仕様を定義する。

## テスト対象

| コンポーネント | ファイルパス                                              | 責務                     |
| -------------- | --------------------------------------------------------- | ------------------------ |
| HistoryService | `packages/shared/src/services/history/history-service.ts` | 履歴取得ビジネスロジック |

## テストファイル構成

```
packages/shared/src/services/history/
├── __tests__/
│   ├── history-service.test.ts    # メインテストファイル
│   └── mocks/
│       ├── index.ts               # モックエクスポート
│       ├── conversion-repository.mock.ts  # リポジトリモック
│       └── logger.mock.ts         # ロガーモック
└── types.ts                       # 型定義
```

## テストケース一覧

### AC-001: 履歴一覧取得（getFileHistory）

| ID        | テストケース名                   | Given                     | When                      | Then                                   |
| --------- | -------------------------------- | ------------------------- | ------------------------- | -------------------------------------- |
| AC-001-01 | ファイルの履歴一覧を取得できる   | ファイルに3件の履歴が存在 | getFileHistory呼び出し    | items.length=3, total=3, hasMore=false |
| AC-001-02 | ページネーションが正しく動作する | 10件の履歴が存在          | limit=5で取得             | items.length=5, total=10, hasMore=true |
| AC-001-03 | 日付範囲フィルタが動作する       | 3件の異なる日付の履歴     | dateFrom/dateToで絞り込み | フィルタ条件に合致する1件のみ          |
| AC-001-04 | 空の履歴の場合                   | 履歴なし                  | getFileHistory呼び出し    | items.length=0, total=0, hasMore=false |
| AC-001-05 | 履歴は新しい順でソートされる     | 3件の異なる日付の履歴     | getFileHistory呼び出し    | 最新が先頭                             |

### AC-002: バージョン詳細取得（getVersionDetail）

| ID        | テストケース名                         | Given              | When                     | Then                           |
| --------- | -------------------------------------- | ------------------ | ------------------------ | ------------------------------ |
| AC-002-01 | バージョン詳細を取得できる             | 変換IDが存在       | getVersionDetail呼び出し | 詳細情報が返される             |
| AC-002-02 | 存在しない変換IDはエラー               | 変換IDが存在しない | getVersionDetail呼び出し | エラー（Conversion not found） |
| AC-002-03 | 最新バージョンフラグが正しく設定される | 2つのバージョン    | 各バージョンを取得       | 最新のみisCurrentVersion=true  |

### AC-003: バージョン差分取得（getVersionDiff）

| ID        | テストケース名                | Given                         | When                   | Then                             |
| --------- | ----------------------------- | ----------------------------- | ---------------------- | -------------------------------- |
| AC-003-01 | サイズ変更を検出できる        | 異なるサイズの2バージョン     | getVersionDiff呼び出し | sizeChange=差分値                |
| AC-003-02 | コンテンツ変更を検出できる    | 異なるハッシュの2バージョン   | getVersionDiff呼び出し | contentChanged=true              |
| AC-003-03 | コンテンツ未変更を検出できる  | 同一ハッシュの2バージョン     | getVersionDiff呼び出し | contentChanged=false             |
| AC-003-04 | メタデータ変更を検出できる    | 異なるメタデータの2バージョン | getVersionDiff呼び出し | metadataChanges配列に変更情報    |
| AC-003-05 | 変換Aが存在しない場合はエラー | 変換Aが存在しない             | getVersionDiff呼び出し | エラー（Conversion A not found） |
| AC-003-06 | 変換Bが存在しない場合はエラー | 変換Bが存在しない             | getVersionDiff呼び出し | エラー（Conversion B not found） |

### AC-004: バージョン復元（restoreToVersion）

| ID        | テストケース名                       | Given            | When                     | Then                              |
| --------- | ------------------------------------ | ---------------- | ------------------------ | --------------------------------- |
| AC-004-01 | バージョンを復元できる               | 変換が存在する   | restoreToVersion呼び出し | 新しいバージョンが作成される      |
| AC-004-02 | 存在しない変換の復元はエラー         | 変換が存在しない | restoreToVersion呼び出し | エラー（Conversion not found）    |
| AC-004-03 | 別ファイルのバージョンを復元はエラー | 別ファイルの変換 | restoreToVersion呼び出し | エラー（does not belong to file） |
| AC-004-04 | 復元時にログが記録される             | 変換が存在する   | restoreToVersion呼び出し | ログが記録される                  |

### AC-005: 最新バージョン取得（getLatestVersion）

| ID        | テストケース名             | Given           | When                     | Then                                  |
| --------- | -------------------------- | --------------- | ------------------------ | ------------------------------------- |
| AC-005-01 | 最新バージョンを取得できる | 3つのバージョン | getLatestVersion呼び出し | 最新バージョン、isCurrentVersion=true |
| AC-005-02 | 履歴なしの場合はnull       | 履歴なし        | getLatestVersion呼び出し | null                                  |

### AC-006: バージョン数取得（getVersionCount）

| ID        | テストケース名           | Given           | When                    | Then |
| --------- | ------------------------ | --------------- | ----------------------- | ---- |
| AC-006-01 | バージョン数を取得できる | 5件のバージョン | getVersionCount呼び出し | 5    |
| AC-006-02 | 履歴なしの場合は0        | 履歴なし        | getVersionCount呼び出し | 0    |

### エッジケース

| ID     | テストケース名               | Given        | When               | Then                               |
| ------ | ---------------------------- | ------------ | ------------------ | ---------------------------------- |
| EC-001 | ページネーション境界値       | ちょうど20件 | limit=20で取得     | hasMore=false                      |
| EC-002 | オフセットが件数を超える場合 | 5件の履歴    | offset=10で取得    | items.length=0, total=5            |
| EC-003 | 同一バージョン間の差分       | 1つの変換    | 同一ID間で差分取得 | sizeChange=0, contentChanged=false |

## テスト設計原則

### 1. Given-When-Then形式

すべてのテストケースはGiven-When-Then形式で記述:

- **Given**: テスト前提条件（モックデータのセットアップ）
- **When**: テスト対象の操作
- **Then**: 期待される結果の検証

### 2. モック戦略

| モック対象           | 実装方法   | 理由                 |
| -------------------- | ---------- | -------------------- |
| ConversionRepository | 手動モック | データ操作の完全制御 |
| FileRepository       | 手動モック | 依存関係の分離       |
| IConversionLogger    | 手動モック | ログ記録の検証       |

### 3. テストダブルの種類

| 種類 | 使用箇所             | 目的                   |
| ---- | -------------------- | ---------------------- |
| Stub | ConversionRepository | テストデータの返却     |
| Spy  | IConversionLogger    | メソッド呼び出しの検証 |
| Mock | FileRepository       | 存在確認のシミュレート |

## カバレッジ目標

| 指標              | 目標値 |
| ----------------- | ------ |
| Line Coverage     | 80%+   |
| Branch Coverage   | 60%+   |
| Function Coverage | 80%+   |

## テスト実行コマンド

```bash
# テスト実行
pnpm --filter @repo/shared test -- history-service

# カバレッジ付き実行
pnpm --filter @repo/shared test:coverage -- history-service
```

## 作成日

2026-01-09

## 関連ドキュメント

- Phase 1: 要件定義書
- Phase 2: 設計書
- Phase 3: 設計レビュー結果
