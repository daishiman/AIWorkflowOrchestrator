# Level 2: Intermediate

## 概要

GitHub Actions通知統合スキル - Slack、Discord、MS Teams、Email等への自動通知設定。 以下の場合に自動発動:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Discord・MS Teams統合ガイド / Discord統合 / Webhook URL取得 / 統合方法の選択 / 1. Slack Incoming Webhook（簡単・推奨初心者向け） / 2. Slack GitHub Action（公式・推奨本番環境）

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/discord-teams.md`: Discord・MS Teams統合ガイド（把握する知識: Discord・MS Teams統合ガイド / Discord統合 / Webhook URL取得）
- `resources/slack-integration.md`: Slack統合詳細ガイド（把握する知識: 統合方法の選択 / 1. Slack Incoming Webhook（簡単・推奨初心者向け） / 2. Slack GitHub Action（公式・推奨本番環境））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Discord・MS Teams統合パターン / テンプレート活用 / スクリプト実行）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/test-webhook.mjs`: Slack/Discord/TeamsのWebhook URLに対するメッセージ送信テストスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/notification-workflow.yaml`: Slack/Discord/Teams/Emailへの成功・失敗通知を含むGitHub Actionsワークフロー実例集

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
