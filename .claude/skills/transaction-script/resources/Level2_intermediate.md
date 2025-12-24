# Level 2: Intermediate

## 概要

マーティン・ファウラーのPofEAAに基づくトランザクションスクリプトパターンを専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: トランザクションスクリプト vs ドメインモデル / 比較表 / パターン選択の判断 / Executorパターン / 構造 / インターフェース

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/domain-model-comparison.md`: Domain Model Comparisonリソース（把握する知識: トランザクションスクリプト vs ドメインモデル / 比較表 / パターン選択の判断）
- `resources/executor-pattern.md`: Executor Patternリソース（把握する知識: Executorパターン / 構造 / インターフェース）
- `resources/pattern-overview.md`: Pattern Overviewリソース（把握する知識: トランザクションスクリプトパターン詳解 / パターンの起源 / 構造）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Transaction Script / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-executor.mjs`: Analyze Executorスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/executor-template.md`: Executorテンプレート

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
