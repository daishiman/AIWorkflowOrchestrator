# Level 2: Intermediate

## 概要

ESLintルール設定とカスタマイズの専門知識。 プロジェクト品質基準に基づくルールセット選択、パーサー設定、プラグイン統合を行います。 使用タイミング:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ESLint Parser Configuration / パーサーの役割 / 主要パーサー / ESLint Plugin Integration / プラグインの役割 / 必須プラグイン
- 実務指針: ESLint設定ファイル（.eslintrc.*）を作成・更新する時 / プロジェクトに適したルールセットを選択する時 / TypeScript/JavaScript向けパーサー設定が必要な時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/parser-configuration.md`: parser-configuration の詳細ガイド（把握する知識: ESLint Parser Configuration / パーサーの役割 / 主要パーサー）
- `resources/plugin-integration.md`: plugin-integration の詳細ガイド（把握する知識: ESLint Plugin Integration / プラグインの役割 / 必須プラグイン）
- `resources/rule-selection-guide.md`: rule-selection-guide のガイド（把握する知識: ESLint Rule Selection Guide / ルール選択の判断フレームワーク / 優先度分類）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: コア概念 / 1. ESLintアーキテクチャ / 2. ルール選択の判断基準）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-config.mjs`: 設定を検証するスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/nextjs.json`: nextjs のテンプレート
- `templates/react-typescript.json`: react-typescript のテンプレート
- `templates/typescript-base.json`: typescript-base のテンプレート

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
