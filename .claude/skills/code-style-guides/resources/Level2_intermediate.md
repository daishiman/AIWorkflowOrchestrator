# Level 2: Intermediate

## 概要

業界標準コードスタイルガイドの選択と適用の専門知識。 Airbnb、Google、Standard等のスタイルガイド適用とカスタマイズを行います。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Style Guide Customization Patterns / カスタマイズの原則 / 1. ベース継承 + オーバーライド / Style Guide Migration Strategies / 移行の必要性 / 移行が必要なケース
- 実務指針: プロジェクトのスタイルガイドを選択する時 / 既存コードパターンに基づいてスタイルを決定する時 / チーム規約とスタイルガイドを整合させる時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/customization-patterns.md`: スタイルガイドのカスタマイズパターン（把握する知識: Style Guide Customization Patterns / カスタマイズの原則 / 1. ベース継承 + オーバーライド）
- `resources/migration-strategies.md`: スタイルガイド移行戦略（把握する知識: Style Guide Migration Strategies / 移行の必要性 / 移行が必要なケース）
- `resources/style-guide-comparison.md`: 主要スタイルガイド(Airbnb、Google、Standard)の比較（把握する知識: Code Style Guide Comparison / 主要3スタイルガイド比較 / 1. Airbnb JavaScript Style Guide）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 主要スタイルガイド / 1. Airbnb JavaScript Style Guide / 2. Google JavaScript Style Guide）

### スクリプト運用
- `scripts/detect-style.mjs`: プロジェクトのコードスタイル自動検出スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/airbnb-base.json`: Airbnbスタイルベース設定
- `templates/google.json`: Googleスタイル設定
- `templates/standard.json`: Standardスタイル設定

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
