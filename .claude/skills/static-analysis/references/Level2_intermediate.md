# Level 2: Intermediate

## 概要

静的解析メトリクスと品質指標の専門知識。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Code Smells Detection / コード臭（Code Smells）とは / 主要なCode Smells / Code Complexity Metrics / 循環的複雑度（Cyclomatic Complexity） / 定義

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/code-smells.md`: Code Smellsリソース（把握する知識: Code Smells Detection / コード臭（Code Smells）とは / 主要なCode Smells）
- `resources/complexity-metrics.md`: Complexity Metricsリソース（把握する知識: Code Complexity Metrics / 循環的複雑度（Cyclomatic Complexity） / 定義）
- `resources/threshold-guidelines.md`: Threshold Guidelinesリソース（把握する知識: Complexity Threshold Guidelines / 閾値設定の原則 / 2. コードベース特性）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: メトリクス種別 / 1. 複雑度指標 / 2. 規模指標）

### スクリプト運用
- `scripts/analyze-complexity.mjs`: Analyze Complexityスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/basic-metrics.json`: Basic Metricsテンプレート
- `templates/strict-metrics.json`: Strict Metricsテンプレート

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
