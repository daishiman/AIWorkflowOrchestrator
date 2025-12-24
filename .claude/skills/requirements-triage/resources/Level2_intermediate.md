# Level 2: Intermediate

## 概要

要求のトリアージと優先順位付けスキル。MoSCoW分類、リスク評価、実現可能性評価により、 実装すべき要件を決定します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Must have（必須） / 定義 / 判断基準 / MoSCoW分類フレームワーク / MoSCoWとは / 4つのカテゴリー
- 実務指針: プロジェクト開始時の要求整理 / 複数の要望がある場合の優先順位決定 / リソース制約下での実装範囲の確定

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/moscow-framework-guide.md`: moscow-framework-guide のガイド（把握する知識: Must have（必須） / 定義 / 判断基準）
- `resources/moscow-framework.md`: MoSCoW分類の詳細ガイド（Must/Should/Could/Won't）とバランスガイドライン（把握する知識: MoSCoW分類フレームワーク / MoSCoWとは / 4つのカテゴリー）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Requirements Triage / トリアージの評価軸 / 1. ビジネス価値（Business Value））

### スクリプト運用
- `scripts/calculate-priority.mjs`: 優先度スコアを自動計算しMoSCoW分類を行うNode.jsスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/triage-matrix.md`: 要件評価マトリクステンプレート（ビジネス価値、実現可能性、リスク、コスト）

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
