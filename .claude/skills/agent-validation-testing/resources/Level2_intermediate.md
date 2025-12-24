# Level 2: Intermediate

## 概要

エージェントの検証とテストケース設計を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Claude Code 3層アーキテクチャ設計仕様書 / Test Case Patterns / テストケースの3つの分類 / 1. 正常系テスト（Normal Case） / Agent Validation Testing / リソース構造
- 実務指針: エージェントファイル生成後の検証時 / テストケースを作成する時 / デプロイ前の最終検証時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: Claude Code 3層アーキテクチャ設計仕様書）
- `resources/test-case-patterns.md`: Test Case Patterns（把握する知識: Test Case Patterns / テストケースの3つの分類 / 1. 正常系テスト（Normal Case））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Agent Validation Testing / リソース構造 / すべきこと）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-agent.mjs`: validate-agent.mjs
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/test-case-template.json`: "$schema": "https://json-schema.org/draft/2020-12/schema",

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
