# Level 2: Intermediate

## 概要

構造化ログシステム設計の専門スキル。JSON形式ログ、ログレベル階層、

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ログレベル使用ガイド / ログレベル階層 / DEBUG / ログスキーマ設計ガイド / 基本スキーマ構造 / 必須フィールド（全ログ共通）

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/log-level-guide.md`: Log Level Guideリソース（把握する知識: ログレベル使用ガイド / ログレベル階層 / DEBUG）
- `resources/log-schema-design.md`: Log Schema Designリソース（把握する知識: ログスキーマ設計ガイド / 基本スキーマ構造 / 必須フィールド（全ログ共通））
- `resources/pii-masking-patterns.md`: Pii Masking Patternsリソース（把握する知識: PIIマスキングパターン / PII（個人識別情報）の定義 / 高リスクPII）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: コアインターフェース仕様 / エラーハンドリング仕様）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Structured Logging - 構造化ロギング設計 / 核心概念 / 1. 構造化ログの本質）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-log-format.mjs`: Validate Log Formatスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/log-format-examples.json`: Log Format Examplesテンプレート
- `templates/logger-template.ts`: Loggerテンプレート

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
