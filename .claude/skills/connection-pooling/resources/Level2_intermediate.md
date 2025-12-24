# Level 2: Intermediate

## 概要

データベース接続管理の専門スキル。 サーバーレス環境での接続管理、Tursoの接続管理とEmbedded Replicas、 高負荷時の接続最適化を専門とします。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 接続エラーハンドリング / よくある接続エラー / 1. 認証エラー / Turso/libSQL 接続管理ガイド / 基本原則 / libSQLの接続モデル
- 実務指針: 新規プロジェクトでDB接続を設定する時 / 接続設定のサイジングを決める時 / サーバーレス環境での接続問題を解決する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/error-handling.md`: error-handling の詳細ガイド（把握する知識: 接続エラーハンドリング / よくある接続エラー / 1. 認証エラー）
- `resources/pool-sizing-guide.md`: pool-sizing-guide のガイド（把握する知識: Turso/libSQL 接続管理ガイド / 基本原則 / libSQLの接続モデル）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: データベース設計（Turso + Drizzle ORM））
- `resources/serverless-connections.md`: serverless-connections の詳細ガイド（把握する知識: サーバーレス環境での接続管理 / サーバーレスの課題 / コールドスタート問題）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Connection Pooling / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/check-connections.mjs`: connectionsを検証するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/drizzle-config-template.ts`: drizzle-config-template のテンプレート

### 成果物要件
- テンプレートの構成・必須項目を反映する

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
