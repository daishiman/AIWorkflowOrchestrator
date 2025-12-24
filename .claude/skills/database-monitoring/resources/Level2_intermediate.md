# Level 2: Intermediate

## 概要

Database Reliability Engineeringに基づくデータベース監視と可観測性の専門スキル。 SQLite/Turso統計情報、スロークエリログ、接続数監視、 ディスク使用量、レプリケーション遅延などの運用メトリクスを提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: アラート設計戦略 / アラート設計原則 / 1. アクション可能性 / 健全性メトリクスと閾値設計 / 主要監視メトリクス / 接続数メトリクス
- 実務指針: 本番DBの健全性を監視する時 / パフォーマンス劣化を検知する時 / アラート設定を構築する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/alerting-strategies.md`: alerting-strategies の詳細ガイド（把握する知識: アラート設計戦略 / アラート設計原則 / 1. アクション可能性）
- `resources/health-metrics.md`: health-metrics の詳細ガイド（把握する知識: 健全性メトリクスと閾値設計 / 主要監視メトリクス / 接続数メトリクス）
- `resources/slow-query-logging.md`: slow-query-logging の詳細ガイド（把握する知識: スロークエリログ設定と分析 / SQLite/Turso スロークエリログ設定 / アプリケーションレベルでのログ設定）
- `resources/sqlite-statistics.md`: sqlite-statistics の詳細ガイド（把握する知識: SQLite/Turso 統計情報ガイド / PRAGMA database_list / 基本クエリ）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 監視設計の原則 / Turso 固有の考慮事項 / 監視設定時）

### スクリプト運用
- `scripts/connection-stats.mjs`: connectionstatsを処理するスクリプト
- `scripts/health-check.mjs`: ヘルスを検証するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/alert-rules-template.md`: alert-rules-template のテンプレート
- `templates/monitoring-dashboard-template.md`: monitoring-dashboard-template のテンプレート

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
