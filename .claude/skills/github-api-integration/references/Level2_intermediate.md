# Level 2: Intermediate

## 概要

GitHub API を GitHub Actions 内で活用するための統合スキル。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: GitHub GraphQL API in Actions / 目次 / GraphQL基礎 / GitHub REST API in Actions / 認証 (Authentication) / GitHub API Integration in Actions
- 実務指針: ワークフローからGitHub APIを呼び出す時 / gh CLIやcurlでGitHub操作を自動化する時 / IssueやPull Requestを自動作成・更新する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/graphql-api.md`: graphql-api の詳細ガイド（把握する知識: GitHub GraphQL API in Actions / 目次 / GraphQL基礎）
- `resources/rest-api.md`: rest-api の詳細ガイド（把握する知識: GitHub REST API in Actions / 目次 / 認証 (Authentication)）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: GitHub API Integration in Actions / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/api-helper.mjs`: apihelperを処理するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/api-workflow.yaml`: api-workflow のテンプレート

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
