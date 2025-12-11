# YAML Front Matterの活用

## 概要

YAML Front Matterは、Markdownファイルの先頭に配置するメタデータブロックです。ドキュメントの管理、検索、自動処理に活用されます。

## 基本構文

```yaml
---
title: ドキュメントタイトル
version: 1.0.0
author: @username
created: 2025-01-15
updated: 2025-01-20
status: draft
---
```

## 必須フィールド

| フィールド | 型     | 説明                     |
| :--------- | :----- | :----------------------- |
| `title`    | string | ドキュメントのタイトル   |
| `version`  | string | セマンティックバージョン |
| `author`   | string | 作成者                   |
| `created`  | date   | 作成日（YYYY-MM-DD）     |
| `status`   | enum   | draft, review, approved  |

## 推奨フィールド

| フィールド  | 型    | 説明             |
| :---------- | :---- | :--------------- |
| `updated`   | date  | 最終更新日       |
| `reviewers` | array | レビュアー一覧   |
| `tags`      | array | 分類タグ         |
| `related`   | array | 関連ドキュメント |

## ステータス定義

| ステータス   | 説明               |
| :----------- | :----------------- |
| `draft`      | 作成中、未レビュー |
| `review`     | レビュー中         |
| `approved`   | 承認済み、公開可能 |
| `deprecated` | 非推奨、更新予定   |

## 仕様書用テンプレート

```yaml
---
title: ワークフロー実行API仕様
version: 1.0.0
author: @spec-writer
created: 2025-01-15
updated: 2025-01-20
status: review
reviewers:
  - @architect
  - @implementer
tags:
  - api
  - workflow
related:
  - ../common/authentication.md
  - ../data-models/workflow-entity.md
---
```

## 活用例

### 自動目次生成

Front Matterの`title`から自動的にサイト目次を生成

### ステータスフィルタリング

`status: approved`のドキュメントのみを公開

### バージョン管理

`version`フィールドで変更履歴を追跡

## ベストプラクティス

- 日付はISO 8601形式（YYYY-MM-DD）
- ステータスは事前定義された値のみ使用
- 関連ドキュメントは相対パスで指定
