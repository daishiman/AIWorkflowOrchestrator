# Level 2: Intermediate

## 概要

Reactにおける状態の持ち上げ（Lifting State Up）と状態配置戦略の専門スキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: コロケーション原則 / 核心原則 / なぜコロケーションが重要か / Context APIパターン / 使用判断基準 / Contextが適切なケース

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/colocation-principles.md`: Colocation Principlesリソース（把握する知識: コロケーション原則 / 核心原則 / なぜコロケーションが重要か）
- `resources/context-patterns.md`: Context Patternsリソース（把握する知識: Context APIパターン / 使用判断基準 / Contextが適切なケース）
- `resources/prop-drilling-solutions.md`: Prop Drilling Solutionsリソース（把握する知識: Prop Drilling解決パターン / Prop Drillingの問題 / 解決パターン）
- `resources/state-placement-guide.md`: State Placement Guideリソース（把握する知識: 状態配置判断ガイド / 判断フローチャート / 配置レベル）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: State Lifting / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-state-structure.mjs`: Analyze State Structureスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/compound-component-template.md`: Compound Componentテンプレート
- `templates/context-provider-template.md`: Context Providerテンプレート

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
