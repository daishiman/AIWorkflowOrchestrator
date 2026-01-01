# Level 2: Intermediate

## 概要

GitHub Actionsワークフロー実行時のデバッグとトラブルシューティング。 **自動発動条件**:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: GitHub Actions デバッグログ有効化ガイド / 1. デバッグログの種類 / 1.1 ACTIONS_STEP_DEBUG / 1. コンテキスト検査コマンド / 1.1 GitHub コンテキスト / 1.2 Job コンテキスト

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/debug-logging.md`: debug-logging の詳細ガイド（把握する知識: GitHub Actions デバッグログ有効化ガイド / 1. デバッグログの種類 / 1.1 ACTIONS_STEP_DEBUG）
- `resources/diagnostic-commands.md`: diagnostic-commands の詳細ガイド（把握する知識: 1. コンテキスト検査コマンド / 1.1 GitHub コンテキスト / 1.2 Job コンテキスト）
- `resources/troubleshooting-guide.md`: troubleshooting-guide のガイド（把握する知識: GitHub Actions トラブルシューティングガイド / 1. 権限エラー (Permission Denied) / 1.1 GITHUB_TOKEN 権限不足）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 一般的なエラーのトラブルシューティング / テンプレートとスクリプト / クイックリファレンス）

### スクリプト運用
- `scripts/analyze-logs.mjs`: ログを分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/debug-workflow.yaml`: debug-workflow のテンプレート

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
