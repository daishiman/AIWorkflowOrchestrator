# Level 2: Intermediate

## 概要

コードスメル（悪臭）とアーキテクチャアンチパターンの検出を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: アーキテクチャ・アンチパターン / 1. Big Ball of Mud（泥だんご） / 説明 / クラス関連のコードスメル / 1. God Class（神クラス） / メソッド関連のコードスメル
- 実務指針: コードレビューで品質問題を検出する時 / リファクタリング対象を特定する時 / 技術的負債を可視化する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/architecture-antipatterns.md`: アーキテクチャ・アンチパターン（把握する知識: アーキテクチャ・アンチパターン / 1. Big Ball of Mud（泥だんご） / 説明）
- `resources/class-smells.md`: クラス関連のコードスメル（把握する知識: クラス関連のコードスメル / 1. God Class（神クラス） / 説明）
- `resources/method-smells.md`: メソッド関連のコードスメル（把握する知識: メソッド関連のコードスメル / 1. Long Method（長いメソッド） / 説明）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Code Smell Detection / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/detect-code-smells.mjs`: コードスメル検出スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/code-smell-report.md`: コードスメル検出レポート

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
