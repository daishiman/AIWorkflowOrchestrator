# Level 2: Intermediate

## 概要

ユースケース駆動の要件分析スキル。ユーザーとシステムの対話を構造化し、

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: アクター識別ガイド / アクターの種類 / 1. プライマリアクター（Primary Actor） / ユースケースシナリオパターン / シナリオの種類 / 1. メインシナリオ（Main Success Scenario）

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/actor-identification.md`: Actor Identificationリソース（把握する知識: アクター識別ガイド / アクターの種類 / 1. プライマリアクター（Primary Actor））
- `resources/scenario-patterns.md`: Scenario Patternsリソース（把握する知識: ユースケースシナリオパターン / シナリオの種類 / 1. メインシナリオ（Main Success Scenario））
- `resources/use-case-relationships.md`: Use Case Relationshipsリソース（把握する知識: ユースケース関係性ガイド / 3つの関係性 / 1. 包含関係（Include））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Use Case Modeling / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト
- `scripts/validate-use-case.mjs`: Validate Use Caseスクリプト

### テンプレート運用
- `templates/use-case-template.md`: Use Caseテンプレート

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
