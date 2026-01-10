# Level 2: Intermediate

## 概要

SQLiteクエリパフォーマンス最適化の専門スキル。 EXPLAIN QUERY PLAN分析、インデックス戦略、クエリリライト、 実行計画の読み解きを通じて、データベースパフォーマンスを向上させます。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: EXPLAIN QUERY PLANガイド / 基本構文 / オプション一覧 / インデックス戦略ガイド / インデックスの基本 / B-treeインデックス（SQLiteの唯一のインデックス）
- 実務指針: クエリが遅いと報告された時 / インデックスを追加すべきか判断する時 / 実行計画を分析する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/explain-analyze-guide.md`: EXPLAIN QUERY PLANガイド（把握する知識: EXPLAIN QUERY PLANガイド / 基本構文 / オプション一覧）
- `resources/index-strategies.md`: インデックス戦略ガイド（把握する知識: インデックス戦略ガイド / インデックスの基本 / B-treeインデックス（SQLiteの唯一のインデックス））
- `resources/monitoring-queries.md`: パフォーマンス監視クエリ集（把握する知識: パフォーマンス監視クエリ集 (SQLite) / データベース情報 / 基本情報）
- `resources/query-patterns.md`: クエリパターン最適化ガイド（把握する知識: クエリパターン最適化ガイド / N+1問題 / 問題パターン）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: データベース設計（Turso + Drizzle ORM））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Query Performance Tuning / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-slow-queries.mjs`: 遅いクエリ分析スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/performance-report-template.md`: パフォーマンスレポート

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
