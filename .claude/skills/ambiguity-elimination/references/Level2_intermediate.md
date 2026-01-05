# Level 2: Intermediate

## 概要

曖昧性検出と除去スキル。定性的・不明確な表現を具体的・測定可能な要件に変換します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 曖昧性パターンガイド / パターン1: 量的曖昧性（Quantitative Ambiguity） / パフォーマンス要件の明確化 / 曖昧性パターン検出・除去ガイド / 5つの曖昧性パターン / Ambiguity Elimination
- 実務指針: 要件に「速い」「多い」「適切に」などの曖昧な表現がある時 / 定量化が必要な非機能要件の記述時 / 「など」「等」で範囲が不明確な時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/ambiguity-patterns-guide.md`: ambiguity-patterns-guide のパターン集（把握する知識: 曖昧性パターンガイド / パターン1: 量的曖昧性（Quantitative Ambiguity） / パフォーマンス要件の明確化）
- `resources/ambiguity-patterns.md`: 5つの曖昧性パターンの詳細な検出・除去手法と実践例（300行超）（把握する知識: 曖昧性パターン検出・除去ガイド / 5つの曖昧性パターン / パターン1: 量的曖昧性（Quantitative Ambiguity））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Ambiguity Elimination / 曖昧性の5つのパターン / パターン1: 量的曖昧性（Quantitative Ambiguity））

### スクリプト運用
- `scripts/detect-ambiguity.mjs`: 要件ドキュメントから曖昧性を自動検出するNode.jsスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/clarification-checklist.md`: 曖昧性を明確化するための体系的な質問チェックリスト
- `templates/clarification-template.md`: clarification-template のテンプレート

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
