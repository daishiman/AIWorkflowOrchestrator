# Level 2: Intermediate

## 概要

Gitを活用したドキュメントのバージョン管理と変更履歴管理の専門スキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ブランチ戦略 / 推奨ブランチモデル / GitHub Flow（推奨） / Changelog生成 / Changelog形式 / Keep a Changelog形式

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/branch-strategy.md`: Branch Strategyリソース（把握する知識: ブランチ戦略 / 推奨ブランチモデル / GitHub Flow（推奨））
- `resources/changelog-generation.md`: Changelog Generationリソース（把握する知識: Changelog生成 / Changelog形式 / Keep a Changelog形式）
- `resources/commit-conventions.md`: Commit Conventionsリソース（把握する知識: コミット規約 / コミットメッセージ形式 / 基本構造）
- `resources/git-diff-guide.md`: Git Diff Guideリソース（把握する知識: Git Diff ガイド / 基本コマンド / 変更の確認）
- `resources/review-workflow.md`: Review Workflowリソース（把握する知識: レビューフロー / 内容 / 構造）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Version Control for Docs / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/generate-changelog.mjs`: Generate Changelogスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/changelog-template.md`: Changelogテンプレート
- `templates/pr-template.md`: ドキュメント変更用PRテンプレート（変更種類・チェックリスト・レビュー観点付き）

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
