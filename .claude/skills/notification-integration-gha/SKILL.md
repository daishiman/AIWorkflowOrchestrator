---
name: notification-integration-gha
description: |
  GitHub Actions notification integration skill for Slack, Discord, MS Teams, and Email. Automates build/deployment status notifications with customizable success/failure messages and interactive elements.

  Anchors:
  • The Pragmatic Programmer (Andrew Hunt, David Thomas) / 適用: Automation and feedback loops / 目的: Establish rapid feedback through automated notifications
  • GitHub Actions best practices / 適用: Workflow design and secret management / 目的: Secure and maintainable notification setup

  Trigger:
  Use when setting up notifications, configuring webhooks, adding Slack/Discord/Teams/Email alerts to workflows, troubleshooting notification failures, or implementing status reporting.
  Keywords: slack notification, discord webhook, teams alert, github actions notify, workflow status, deployment notification, build alert
version: 1.1.0
last_updated: 2025-12-31
tags:
  - github-actions
  - notifications
  - slack
  - discord
  - teams
  - automation
---

# GitHub Actions Notification Integration Skill

## 概要

このスキルは GitHub Actions のワークフローに通知機能を統合する専門知識を提供します。Slack、Discord、MS Teams、Email への自動通知設定を、セキュアで保守性の高い方法で実装します。

基礎から始める場合は `references/Level1_basics.md` を、実務での実装は `references/Level2_intermediate.md` を参照してください。

## Task仕様（ナビゲーション）

以下のTaskファイルを必要に応じて起動してください：

| Task                   | ファイル                  | 使用タイミング               |
| ---------------------- | ------------------------- | ---------------------------- |
| Slack統合              | `agents/setup-slack.md`   | Slackへの通知を設定する際    |
| Discord統合            | `agents/setup-discord.md` | Discordへの通知を設定する際  |
| MS Teams統合           | `agents/setup-teams.md`   | MS Teamsへの通知を設定する際 |
| トラブルシューティング | `agents/troubleshoot.md`  | 通知が機能しない場合         |

## ワークフロー

### Phase 1: 要件定義と選択

**目的**: 通知要件を明確にし、適切な通知サービスと統合方法を選択する

**判断ポイント**:

- 通知先プラットフォーム（Slack/Discord/Teams/Email）
- 通知タイミング（成功時/失敗時/両方）
- メッセージ内容（シンプル/詳細/インタラクティブ）

**Task選択**:

- Slack統合: `agents/setup-slack.md` を使用
- Discord統合: `agents/setup-discord.md` を使用
- MS Teams統合: `agents/setup-teams.md` を使用
- 複数サービス統合: 各Taskを組み合わせて実行

**参照リソース**:

- 基礎理解: `references/Level1_basics.md`
- サービス別詳細: `references/slack-integration.md`, `references/discord-teams.md`

### Phase 2: 実装

**目的**: Webhook/トークン設定とワークフロー定義を行う

**実装手順**:

1. GitHub Secretsの設定（Webhook URL、Bot Token等）
2. ワークフロー定義（`assets/notification-workflow.yaml` を参照）
3. メッセージフォーマット調整

**Task実行**:

- 選択したTaskファイル（`agents/*.md`）の実行仕様に従って実装
- Taskは独立した作業窓として実行し、成果物をメインに返す

**参照リソース**:

- 実務ガイド: `references/Level2_intermediate.md`
- テンプレート: `assets/notification-workflow.yaml`

### Phase 3: テストと検証

**目的**: 通知が正しく動作することを確認する

**検証手順**:

1. Webhook URLの有効性確認: `scripts/test-webhook.mjs` を実行
2. テストワークフロー実行
3. 通知受信確認

**トラブルシューティング**:

- 通知失敗時: `agents/troubleshoot.md` のTaskを起動
- 高度な問題: `references/Level3_advanced.md` を参照

### Phase 4: 記録

**目的**: 実行結果を記録し、継続的改善に活用する

**記録方法**:

```bash
node scripts/log_usage.mjs --result success --phase "Phase2" --notes "Slack通知を実装"
```

## ベストプラクティス

### すべきこと

- Secretsを安全に管理（環境変数やリポジトリシークレットを使用）
- メッセージに必要な情報を含める（リポジトリ、ブランチ、コミット、作者）
- 成功と失敗で異なるメッセージを送信
- Webhook URLをテストしてから本番適用
- `references/Level1_basics.md` で基礎を確認
- `references/Level2_intermediate.md` で実装パターンを学習

### 避けるべきこと

- Webhook URLやトークンをハードコード
- すべての通知を同じチャネルに送信
- エラー情報なしで失敗通知を送る
- テスト不十分のまま本番適用
- アンチパターンを確認せずに実装

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/notification-integration-gha/references/Level1_basics.md
cat .claude/skills/notification-integration-gha/references/Level2_intermediate.md
cat .claude/skills/notification-integration-gha/references/Level3_advanced.md
cat .claude/skills/notification-integration-gha/references/Level4_expert.md
cat .claude/skills/notification-integration-gha/references/discord-teams.md
cat .claude/skills/notification-integration-gha/references/legacy-skill.md
cat .claude/skills/notification-integration-gha/references/slack-integration.md
```

### スクリプト実行

```bash
node .claude/skills/notification-integration-gha/scripts/log_usage.mjs --help
node .claude/skills/notification-integration-gha/scripts/test-webhook.mjs --help
node .claude/skills/notification-integration-gha/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/notification-integration-gha/assets/notification-workflow.yaml
```

## リソース参照パス

### references/ (知識の外部化)

- `references/Level1_basics.md`: 基礎概念と前提知識
- `references/Level2_intermediate.md`: 実務パターンと実装ガイド
- `references/Level3_advanced.md`: 高度な設定とカスタマイズ
- `references/Level4_expert.md`: エキスパート向けトピック
- `references/slack-integration.md`: Slack統合詳細
- `references/discord-teams.md`: Discord・MS Teams統合詳細

### scripts/ (決定論的処理)

- `scripts/log_usage.mjs`: 使用記録と自動評価
- `scripts/test-webhook.mjs`: Webhook URL動作確認
- `scripts/validate-skill.mjs`: スキル構造検証

### assets/ (出力素材)

- `assets/notification-workflow.yaml`: ワークフロー実装例

## 変更履歴

| Version | Date       | Changes                                                                                  |
| ------- | ---------- | ---------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | Updated to 18-skills.md spec: new description format, Task navigation, agents/ structure |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                              |
