# Level 2: Intermediate

## 概要

エージェントペルソナ設計を専門とするスキル。実在する専門家の思想をエージェントに移植します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Expert Modeling Guide / Expert Modeling vs Role-Based Design / Expert Modeling（推奨） / Agent Persona Design / すべきこと / 避けるべきこと

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/expert-modeling-guide.md`: 専門家モデリングガイド（把握する知識: Expert Modeling Guide / Expert Modeling vs Role-Based Design / Expert Modeling（推奨））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Agent Persona Design / すべきこと / 避けるべきこと）

### スクリプト運用
- `scripts/analyze-persona.mjs`: ペルソナ分析スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動レベルアップスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/persona-template.md`: ペルソナ設計テンプレート

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
