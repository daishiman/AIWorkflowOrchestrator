# Level 2: Intermediate

## 概要

Vlad MihaltseaとMarkus Winandの教えに基づくクエリ最適化を専門とするスキル。 N+1問題の回避、フェッチ戦略の選択、実行計画分析、インデックス活用などの データベースパフォーマンス最適化手法を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 実行計画分析手法 / 実行計画とは / SQLite: EXPLAIN QUERY PLAN / EXPLAIN QUERY PLAN 完全ガイド / 基本構文 / 使用例
- 実務指針: クエリパフォーマンスが低下している時 / N+1問題を検出・解消する時 / 複雑なJOINクエリを最適化する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/execution-plan-analysis.md`: EXPLAIN QUERY PLANの読み方、スキャン方法、JOIN方法、問題パターン検出（把握する知識: 実行計画分析手法 / 実行計画とは / SQLite: EXPLAIN QUERY PLAN）
- `resources/explain-analyze-guide.md`: EXPLAIN QUERY PLAN 完全ガイド（把握する知識: EXPLAIN QUERY PLAN 完全ガイド / 基本構文 / 使用例）
- `resources/fetch-strategies.md`: Eager/Lazy/明示的フェッチの使い分けとSELECT句最適化手法（把握する知識: フェッチ戦略ガイド / フェッチ戦略の種類 / 1. Eager Loading（即時読み込み））
- `resources/index-strategies.md`: インデックス設計戦略（把握する知識: インデックス設計戦略 / インデックスの基本 / インデックスとは）
- `resources/n-plus-one-patterns.md`: N+1問題パターンと解決策（把握する知識: N+1問題パターンと解決策 / N+1問題とは / 検出パターン）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: アーキテクチャ設計 / データベース設計（Turso + Drizzle ORM））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Query Optimization / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/detect-n-plus-one.mjs`: N+1問題検出スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/optimization-checklist.md`: クエリ最適化チェックリスト
- `templates/query-optimization-checklist.md`: クエリ最適化チェックリスト

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
