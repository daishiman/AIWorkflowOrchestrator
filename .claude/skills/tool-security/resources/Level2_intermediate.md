# Level 2: Intermediate

## 概要

MCPツールとAPI統合におけるセキュリティ設計の専門知識。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: API Key 管理ガイド / 1. 安全な保存方法 / シークレットマネージャー（推奨） / 入力検証ガイド / 1. 検証の原則 / 信頼境界

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/api-key-management.md`: Api Key Managementリソース（把握する知識: API Key 管理ガイド / 1. 安全な保存方法 / シークレットマネージャー（推奨））
- `resources/input-validation-guide.md`: Input Validation Guideリソース（把握する知識: 入力検証ガイド / 1. 検証の原則 / 信頼境界）
- `resources/permission-patterns.md`: Permission Patternsリソース（把握する知識: 権限設計パターンガイド / 1. 最小権限の原則 / 概念）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: セキュリティレイヤーモデル / 1. API Key 管理 / 保存場所の優先順位）

### スクリプト運用
- `scripts/check-env-vars.mjs`: Check Env Varsスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-security-config.mjs`: Validate Security Configスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/audit-log-schema.json`: Audit Log Schemaテンプレート
- `templates/security-config-template.json`: Security Configテンプレート

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
