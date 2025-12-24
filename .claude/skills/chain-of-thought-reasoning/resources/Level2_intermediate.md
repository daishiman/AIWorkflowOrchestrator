# Level 2: Intermediate

## 概要

Chain-of-Thought（思考の連鎖）推論パターンを提供するスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Chain-of-Thought 基礎理論 / 理論的背景 / CoTの定義 / CoTプロンプティング技法 / Zero-Shot CoT技法 / 基本トリガーフレーズ
- 実務指針: 複雑な推論が必要な時 / 回答の根拠を明示したい時 / 多段階の論理的思考が必要な時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/cot-fundamentals.md`: Chain-of-Thought 基礎理論（把握する知識: Chain-of-Thought 基礎理論 / 理論的背景 / CoTの定義）
- `resources/prompting-techniques.md`: CoTプロンプティング技法（把握する知識: CoTプロンプティング技法 / Zero-Shot CoT技法 / 基本トリガーフレーズ）
- `resources/reasoning-patterns.md`: 演繹・帰納・類推・仮説検証・分割統治・逆問題・比較分析の7つの推論パターンと適用場面（把握する知識: 推論パターン集 / 演繹推論パターン / 基本形式）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Chain-of-Thought Reasoning / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/cot-prompt-templates.md`: CoTプロンプトテンプレート
- `templates/self-consistency-template.md`: Self-Consistencyテンプレート

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
