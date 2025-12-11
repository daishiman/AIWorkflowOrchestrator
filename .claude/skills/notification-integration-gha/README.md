# Notification Integration GHA Skill

GitHub ActionsからSlack、Discord、MS Teams、Email等への通知統合を提供するスキル。

## ディレクトリ構造

```
notification-integration-gha/
├── SKILL.md (204行)                      # メインスキル定義・コマンドリファレンス
├── README.md                             # このファイル
├── resources/
│   ├── slack-integration.md (492行)      # Slack統合詳細（Webhook/Bot Token/Block Kit）
│   └── discord-teams.md (553行)          # Discord/Teams/Email統合パターン
├── templates/
│   └── notification-workflow.yaml (492行) # 8種類の実例ワークフロー
└── scripts/
    └── test-webhook.mjs (286行)          # Webhook動作テストスクリプト
```

## クイックスタート

### 1. Slack通知（最も簡単）

```yaml
- name: Slack Notification
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "C1234567890"
    slack-message: "Deployment completed!"
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

### 2. Discord通知（Webhook）

```yaml
- name: Discord Notification
  run: |
    curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{"content": "Deployment completed!"}'
```

### 3. MS Teams通知（MessageCard）

```yaml
- name: Teams Notification
  run: |
    curl -X POST "${{ secrets.TEAMS_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{"@type": "MessageCard", "text": "Deployment completed!"}'
```

## 主要機能

### 通知パターン

- ✅ 成功時・失敗時通知
- 🔄 進行状況更新（スレッド型）
- 🌿 ブランチ別・環境別通知
- 🔁 リトライとフォールバック
- 📊 定期レポート（cron）

### サポートサービス

- **Slack**: Incoming Webhook / Bot Token / Block Kit
- **Discord**: Webhook / Embeds / Buttons
- **MS Teams**: Incoming Webhook / MessageCard / Adaptive Cards
- **Email**: SendGrid / AWS SES

### セキュリティ

- Webhook URLはGitHub Secretsで管理
- URL検証・マスキング
- エラーハンドリング

## 使用方法

### コマンドリファレンス参照

```bash
# メインスキル定義
cat .claude/skills/notification-integration-gha/SKILL.md

# Slack統合詳細
cat .claude/skills/notification-integration-gha/resources/slack-integration.md

# Discord/Teams統合
cat .claude/skills/notification-integration-gha/resources/discord-teams.md

# 実例ワークフロー
cat .claude/skills/notification-integration-gha/templates/notification-workflow.yaml
```

### Webhookテスト

```bash
# Slack
node .claude/skills/notification-integration-gha/scripts/test-webhook.mjs \
  --slack "$SLACK_WEBHOOK_URL" "Test message"

# Discord
node .claude/skills/notification-integration-gha/scripts/test-webhook.mjs \
  --discord "$DISCORD_WEBHOOK_URL" "Test message"

# Teams
node .claude/skills/notification-integration-gha/scripts/test-webhook.mjs \
  --teams "$TEAMS_WEBHOOK_URL" "Test message"

# 自動検出
node .claude/skills/notification-integration-gha/scripts/test-webhook.mjs \
  "$WEBHOOK_URL" "Test message"
```

## 実例ワークフローテンプレート

`templates/notification-workflow.yaml`には8種類の実例が含まれています:

1. **Slack通知（公式Action）**: Bot Token使用、成功/失敗別通知
2. **Discord通知（Webhook）**: Embed形式、条件付きカラー
3. **MS Teams通知（Adaptive Card）**: リッチUI、定期レポート
4. **複数サービス統合**: Slack + Discord + Teams並列通知
5. **スレッド型通知**: 進行状況を同一スレッドで更新
6. **条件付き通知**: ブランチ別・環境別・PR別
7. **エラーハンドリング**: リトライ・フォールバック
8. **Email通知**: SendGrid使用、HTML形式

## トラブルシューティング

### Slack: not_in_channel

**原因**: BotがチャネルにいないまたはBot Token権限不足

**解決策**:

- Bot Token Scopeに`chat:write.public`を追加
- または`/invite @bot-name`でBotを招待

### Discord: 429 Too Many Requests

**原因**: レート制限（5リクエスト/2秒）

**解決策**:

```yaml
- name: Rate-limited notification
  run: |
    for i in {1..3}; do
      curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" -d '{"content": "msg"}'
      sleep 0.5
    done
```

### Teams: 400 Bad Request

**原因**: JSON構文エラー

**解決策**:

```bash
# JSON検証してから送信
echo "$PAYLOAD" | jq empty
curl -X POST "$TEAMS_WEBHOOK_URL" -d "$PAYLOAD"
```

## 関連スキル

- `.claude/skills/github-actions-syntax/SKILL.md` - ワークフロー構文
- `.claude/skills/secrets-management-gha/SKILL.md` - Webhook URL管理
- `.claude/skills/conditional-execution-gha/SKILL.md` - 条件付き実行

## ライセンス

このスキルはプロジェクトのライセンスに従います。

## 参考リンク

- [Slack API - Block Kit](https://api.slack.com/block-kit)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [MS Teams Webhooks](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/)
- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
