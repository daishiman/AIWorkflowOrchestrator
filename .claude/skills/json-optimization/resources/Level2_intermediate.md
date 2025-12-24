# Level 2: Intermediate

## 概要

SQLiteのJSON1拡張を活用した柔軟なデータ構造設計とパフォーマンス最適化。 式インデックス、JSON関数の効率的使用、スキーマ検証の統合を提供。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 1. 抽出関数 / json_extract() / 2. 型検査関数 / JSON 使用の判断基準 / JSON が適切なケース / JSON を避けるべきケース
- 実務指針: 半構造化データの格納設計時 / JSON検索パフォーマンスの最適化時 / スキーマが動的に変化する属性の設計時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/json-functions-reference.md`: json_extract/json_type/json_valid関数とインデックス活用（把握する知識: 1. 抽出関数 / json_extract() / 2. 型検査関数）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: JSON 使用の判断基準 / JSON が適切なケース / JSON を避けるべきケース）

### スクリプト運用
- `scripts/analyze-json-usage.mjs`: JSON使用状況分析とリレーショナル分離推奨の自動判定
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/json-schema-design.md`: JSON構造設計テンプレート（式インデックス/CHECK制約/Zodスキーマ統合）

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
