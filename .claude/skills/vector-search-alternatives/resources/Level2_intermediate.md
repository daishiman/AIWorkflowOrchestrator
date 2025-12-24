# Level 2: Intermediate

## 概要

SQLiteベースプロジェクト向けのベクトル検索実装の代替戦略スキル。 pgvectorの代わりに、外部ベクトルDB、SQLite VSS拡張、 アプリケーションレベル検索など複数のアプローチを提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ベクトルインデックス戦略 / インデックスタイプの比較 / 選択ガイド / RAG実装パターン / RAGアーキテクチャ / 基本フロー
- 実務指針: SQLiteプロジェクトでベクトル検索を実装する時 / RAGシステムを構築する時 / ベクトルDB選定を行う時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/index-strategies.md`: index-strategies の詳細ガイド（把握する知識: ベクトルインデックス戦略 / インデックスタイプの比較 / 選択ガイド）
- `resources/rag-patterns.md`: rag-patterns のパターン集（把握する知識: RAG実装パターン / RAGアーキテクチャ / 基本フロー）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: アーキテクチャ設計）
- `resources/vector-basics.md`: vector-basics の詳細ガイド（把握する知識: ベクトル検索の基礎 / pgvectorとは / セットアップ）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Vector Search Alternatives for SQLite Projects / ⚠️ 重要な変更 / 代替アプローチ一覧）

### スクリプト運用
- `scripts/benchmark-vector-search.mjs`: benchmarkvectorsearchを処理するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/vector-schema-template.ts`: vector-schema-template のテンプレート

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
