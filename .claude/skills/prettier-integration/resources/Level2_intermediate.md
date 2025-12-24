# Level 2: Intermediate

## 概要

ESLintとPrettierの統合とフォーマット自動化の専門知識。 責務分離、競合解決、エディタ統合、保存時自動実行を設計します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Prettier Automation Strategies / 自動化レベル / Level 1: エディタ統合 / Prettier-ESLint Conflict Resolution / 競合の原因 / 競合するルール領域
- 実務指針: ESLintとPrettierを統合する時 / フォーマットルールの競合を解決する時 / エディタでの保存時自動フォーマットを設定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/automation-strategies.md`: Prettier Automation Strategies（把握する知識: Prettier Automation Strategies / 自動化レベル / Level 1: エディタ統合）
- `resources/conflict-resolution.md`: Prettier-ESLint Conflict Resolution（把握する知識: Prettier-ESLint Conflict Resolution / 競合の原因 / 競合するルール領域）
- `resources/editor-integration.md`: Prettier Editor Integration（把握する知識: Prettier Editor Integration / VSCode統合 / 拡張機能インストール）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 責務分離の原則 / ESLint 役割 / Prettier 役割）

### スクリプト運用
- `scripts/format-check.mjs`: Prettierフォーマット検証スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/prettierrc-base.json`: prettierrc-base設定ファイル
- `templates/vscode-settings.json`: vscode-settings設定ファイル

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
