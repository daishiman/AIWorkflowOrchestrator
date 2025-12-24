# Level 2: Intermediate

## 概要

AIからの構造化出力設計を専門とするスキル。JSON Schema、Zod、

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Function Calling 設計ガイド / 基本構造 / 関数定義 / JSON Schema 設計パターン / 基本パターン / 1. シンプルオブジェクト

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/function-calling-guide.md`: Function Calling Guideリソース（把握する知識: Function Calling 設計ガイド / 基本構造 / 関数定義）
- `resources/json-schema-patterns.md`: Json Schema Patternsリソース（把握する知識: JSON Schema 設計パターン / 基本パターン / 1. シンプルオブジェクト）
- `resources/zod-integration.md`: Zod Integrationリソース（把握する知識: Zod 統合ガイド / 基本パターン / シンプルなスキーマ）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Structured Output Design / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-schema.mjs`: Validate Schemaスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/json-schema-template.json`: Json Schemaテンプレート
- `templates/zod-schema-template.ts`: Zod Schemaテンプレート

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
