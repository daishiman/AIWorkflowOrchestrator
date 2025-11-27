---
name: notification-integration-gha
description: |
  GitHub Actions通知統合スキル - Slack、Discord、MS Teams、Email等への自動通知設定。
  以下の場合に自動発動:
  - 「通知」「notification」「alert」「Slack」「Discord」「Teams」キーワード検出時
  - ワークフロー成功/失敗時の通知設定が必要な時
  - チーム連携のための通知チャネル構築時
  - CI/CD結果を外部サービスに送信する時
  - Webhook統合やメッセージフォーマット設計時

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/notification-integration-gha/resources/discord-teams.md`: Discord・MS Teams統合ガイド
  - `.claude/skills/notification-integration-gha/resources/slack-integration.md`: Slack統合詳細ガイド
  - `.claude/skills/notification-integration-gha/scripts/test-webhook.mjs`: Slack/Discord/TeamsのWebhook URLに対するメッセージ送信テストスクリプト
  - `.claude/skills/notification-integration-gha/templates/notification-workflow.yaml`: Slack/Discord/Teams/Emailへの成功・失敗通知を含むGitHub Actionsワークフロー実例集

version: 1.0.0
category: github-actions
triggers:
  - 通知設定やアラート構築が必要な時
  - Slack/Discord/Teamsへのワークフロー結果送信
  - Webhook統合やメッセージカスタマイズ
dependencies: []
related_skills:
  - .claude/skills/github-actions-syntax/SKILL.md
  - .claude/skills/secrets-management-gha/SKILL.md
  - .claude/skills/conditional-execution-gha/SKILL.md
---

# GitHub Actions Notification Integration Skill

GitHub Actions から Slack、Discord、MS Teams、Email 等への通知統合を提供するスキル。

## ディレクトリ構造

```
notification-integration-gha/
├── SKILL.md                          # このファイル（コマンドリファレンス・概要）
├── resources/
│   ├── slack-integration.md          # Slack Webhook・Actions・フォーマット詳細
│   └── discord-teams.md              # Discord・MS Teams統合パターン
├── templates/
│   └── notification-workflow.yaml    # 通知ワークフロー実例集
└── scripts/
    └── test-webhook.mjs              # Webhook動作テストスクリプト
```

## コマンドリファレンス

### リソース参照（詳細知識）

```bash
# Slack統合詳細（Webhook URL、actions、メッセージフォーマット）
cat .claude/skills/notification-integration-gha/resources/slack-integration.md

# Discord・MS Teams統合パターン
cat .claude/skills/notification-integration-gha/resources/discord-teams.md
```

### テンプレート活用

```bash
# 通知ワークフロー実例（Slack/Discord/Teams/Email）
cat .claude/skills/notification-integration-gha/templates/notification-workflow.yaml
```

### スクリプト実行

```bash
# Webhook動作テスト（Slack/Discord）
node .claude/skills/notification-integration-gha/scripts/test-webhook.mjs <webhook-url> <message>
```

## 通知統合パターン

### 1. Slack 通知（公式 Action 使用）

```yaml
- name: Slack Notification
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "C1234567890"
    slack-message: |
      *${{ github.workflow }}* - ${{ job.status }}
      Repository: ${{ github.repository }}
      Commit: ${{ github.sha }}
      Author: ${{ github.actor }}
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

### 2. Discord 通知（Webhook）

```yaml
- name: Discord Notification
  if: always()
  run: |
    curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{
        "content": "**Workflow Status**: ${{ job.status }}",
        "embeds": [{
          "title": "${{ github.workflow }}",
          "description": "Repository: ${{ github.repository }}",
          "color": ${{ job.status == 'success' && 3066993 || 15158332 }}
        }]
      }'
```

### 3. MS Teams 通知（Webhook Connector）

```yaml
- name: MS Teams Notification
  if: failure()
  run: |
    curl -X POST "${{ secrets.TEAMS_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{
        "@type": "MessageCard",
        "themeColor": "FF0000",
        "summary": "Workflow Failed",
        "sections": [{
          "activityTitle": "${{ github.workflow }} Failed",
          "facts": [
            {"name": "Repository", "value": "${{ github.repository }}"},
            {"name": "Branch", "value": "${{ github.ref }}"},
            {"name": "Commit", "value": "${{ github.sha }}"}
          ]
        }]
      }'
```

### 4. 条件付き通知（成功時・失敗時）

```yaml
- name: Notify on Success
  if: success()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "success-channel"
    slack-message: "✅ Deployment succeeded!"
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}

- name: Notify on Failure
  if: failure()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "alert-channel"
    slack-message: "❌ Deployment failed! @here"
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

## 通知設計のベストプラクティス

### セキュリティ

- **Webhook URL は Secrets 管理**: `${{ secrets.WEBHOOK_URL }}`
- **トークンは暗号化保存**: GitHub Secrets で管理
- **公開リポジトリでの露出防止**: ハードコード禁止

### メッセージ設計

- **視認性**: 絵文字・色・フォーマットで状態を明示
- **コンテキスト**: リポジトリ名・ブランチ・コミット SHA・実行者情報
- **アクション可能**: ログ URL・PR URL・デプロイ URL をリンク

### 条件制御

- **if: always()**: 成功・失敗問わず通知
- **if: failure()**: 失敗時のみアラート
- **if: success()**: 成功時のみ通知

### リトライとエラーハンドリング

- **continue-on-error: true**: 通知失敗でもワークフロー継続
- **timeout-minutes**: 長時間ハングアップ防止

## 関連スキル

通知統合と併用すると効果的なスキル:

| スキル名                      | パス                                                | 概要                               |
| ----------------------------- | --------------------------------------------------- | ---------------------------------- |
| **github-actions-syntax**     | `.claude/skills/github-actions-syntax/SKILL.md`     | ワークフロー構文・式・コンテキスト |
| **secrets-management-gha**    | `.claude/skills/secrets-management-gha/SKILL.md`    | Webhook URL・トークンの安全な管理  |
| **conditional-execution-gha** | `.claude/skills/conditional-execution-gha/SKILL.md` | 条件付き通知（成功/失敗時）        |

## 使用上の注意

### このスキルが提供すること

- Slack/Discord/Teams/Email 統合パターン
- Webhook 設定とメッセージフォーマット
- 条件付き通知（成功/失敗時）
- セキュリティベストプラクティス

### このスキルが提供しないこと

- 通知サービス側のアカウント設定（Slack App 作成等）
- 複雑なメッセージテンプレート言語（Liquid/Handlebars 等）
- カスタムボット実装（Node.js/Python 等）

### 推奨される使用フロー

1. **通知チャネル決定**: Slack/Discord/Teams/Email
2. **Webhook URL 取得**: 各サービスで設定
3. **GitHub Secrets に保存**: `SLACK_WEBHOOK_URL`等
4. **テンプレート適用**: `templates/notification-workflow.yaml`参照
5. **メッセージカスタマイズ**: プロジェクト固有情報追加
6. **テスト実行**: `scripts/test-webhook.mjs`で動作確認

---

**詳細な統合手順とメッセージフォーマットは、resources ディレクトリ内のファイルを参照してください。**
