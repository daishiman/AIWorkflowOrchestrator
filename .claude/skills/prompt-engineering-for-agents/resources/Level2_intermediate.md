# Level 2: Intermediate

## 概要

エージェント向けプロンプトエンジニアリングを専門とするスキル。 System Prompt設計、Few-Shot Examples、Role Prompting技術により、 高品質なエージェント動作を実現します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 技術スタック仕様書 / ============================================================================= / System Prompt Patterns / System Promptの構造 / 推奨7セクション構造 / Prompt Engineering for Agents
- 実務指針: System Promptを設計する時 / エージェントの動作を最適化する時 / 具体例を追加する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 技術スタック仕様書 / =============================================================================）
- `resources/system-prompt-patterns.md`: System Prompt Patterns（把握する知識: System Prompt Patterns / System Promptの構造 / 推奨7セクション構造）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Prompt Engineering for Agents / 例 / 例1: [シナリオ]）

### スクリプト運用
- `scripts/analyze-prompt.mjs`: analyze-prompt.mjs
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/prompt-template.md`: プロンプト設計テンプレート

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
