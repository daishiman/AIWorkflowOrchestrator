# Level 2: Intermediate

## 概要

ツール権限管理とセキュリティ制御を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Tool Selection Matrix / ツールカテゴリ / 1. 読み取り専用ツール / Tool Permission Management / リソース読み取り

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/tool-selection-matrix.md`: Tool Selection Matrixリソース（把握する知識: Tool Selection Matrix / ツールカテゴリ / 1. 読み取り専用ツール）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Tool Permission Management / リソース読み取り）

### スクリプト運用
- `scripts/analyze-permissions.mjs`: Analyze Permissionsスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/permission-template.yaml`: Permissionテンプレート

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
