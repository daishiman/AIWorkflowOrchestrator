# Level 2: Intermediate

## 概要

SQLiteにおけるインデックス設計戦略の専門知識。 B-Treeインデックス、部分インデックス、式インデックス、カバリングインデックスの特性と選択基準を提供。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: SQLite インデックス最適化技法 / 内部構造 / サポートする演算子 / データベース設計（Turso + Drizzle ORM） / インデックスタイプ選択ガイド / B-Tree（SQLiteの唯一のインデックスタイプ）
- 実務指針: 新規テーブルのインデックス設計時 / クエリパフォーマンス問題の調査時 / インデックス追加・削除の判断時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/index-types-comparison.md`: index-types-comparison の詳細ガイド（把握する知識: SQLite インデックス最適化技法 / 内部構造 / サポートする演算子）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: データベース設計（Turso + Drizzle ORM））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: インデックスタイプ選択ガイド / B-Tree（SQLiteの唯一のインデックスタイプ） / 式インデックス（Expression Indexes））

### スクリプト運用
- `scripts/analyze-indexes.mjs`: indexesを分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/index-design-checklist.md`: index-design-checklist のチェックリスト

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
