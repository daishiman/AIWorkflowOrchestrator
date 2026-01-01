# Level 2: Intermediate

## 概要

問題解決を効率化するトラブルシューティングガイドの設計スキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 問題分類ガイド / 問題分類の階層 / 第1階層: 問題タイプ / 問題解決パターンの体系化 / 診断フロー設計原則 / 診断フローチャート構造

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/problem-classification.md`: Problem Classificationリソース（把握する知識: 問題分類ガイド / 問題分類の階層 / 第1階層: 問題タイプ）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 問題解決パターンの体系化 / 診断フロー設計原則 / 診断フローチャート構造）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-diagnostic-flow.mjs`: Validate Diagnostic Flowスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/diagnosis-flow-template.md`: Diagnosis Flowテンプレート
- `templates/error-explanation-template.md`: Error Explanationテンプレート

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
