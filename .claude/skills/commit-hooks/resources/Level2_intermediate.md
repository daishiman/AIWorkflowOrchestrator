# Level 2: Intermediate

## 概要

Git commit hooksとプレコミット品質ゲートの専門知識。 Husky、lint-staged統合による自動lint/format実行を設計します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Husky Configuration Guide / Huskyとは / セットアップ / lint-staged Patterns / 基本パターン / パターン1: ESLint + Prettier
- 実務指針: コミット時の自動品質チェックを設定する時 / Husky、lint-stagedを導入する時 / ステージングファイルのみを処理する設定を行う時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/husky-configuration.md`: Huskyによるコミットフック設定（把握する知識: Husky Configuration Guide / Huskyとは / セットアップ）
- `resources/lint-staged-patterns.md`: lint-stagedパターンと設定例（把握する知識: lint-staged Patterns / 基本パターン / パターン1: ESLint + Prettier）
- `resources/performance-optimization.md`: コミットフックのパフォーマンス最適化（把握する知識: Commit Hooks Performance Optimization / パフォーマンス問題 / 遅いコミットフックの影響）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Husky設定 / 1. インストールと初期化 / 2. フックファイル作成）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/test-hooks.mjs`: コミットフックテストスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/lint-staged-advanced.js`: 高度なlint-staged設定
- `templates/pre-commit-basic.sh`: 基本的なpre-commitフックシェルスクリプト

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
