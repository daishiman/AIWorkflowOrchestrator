# Slack統合詳細ガイド

GitHub ActionsからSlackへの通知統合の詳細手順とベストプラクティス。

## 統合方法の選択

### 1. Slack Incoming Webhook（簡単・推奨初心者向け）

**メリット**:

- 設定が簡単（Webhook URL 1つだけ）
- 追加の認証不要
- シンプルなメッセージ送信

**デメリット**:

- 単一チャネルのみ
- インタラクティブ機能制限
- メッセージ更新不可

**設定手順**:

1. Slack Workspace → Apps → "Incoming Webhooks"を追加
2. 通知先チャネル選択
3. Webhook URL取得（`https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`）
4. GitHub Secrets → `SLACK_WEBHOOK_URL`に保存

**ワークフロー例**:

```yaml
name: Slack Webhook Notification

on: [push, pull_request]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Slack notification
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{
              "text": "GitHub Actions Workflow Completed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*${{ github.workflow }}* - `${{ job.status }}`"
                  }
                },
                {
                  "type": "section",
                  "fields": [
                    {"type": "mrkdwn", "text": "*Repository:*\n${{ github.repository }}"},
                    {"type": "mrkdwn", "text": "*Branch:*\n${{ github.ref_name }}"},
                    {"type": "mrkdwn", "text": "*Commit:*\n`${{ github.sha }}`"},
                    {"type": "mrkdwn", "text": "*Author:*\n${{ github.actor }}"}
                  ]
                },
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": {"type": "plain_text", "text": "View Workflow"},
                      "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                    }
                  ]
                }
              ]
            }'
```

---

### 2. Slack GitHub Action（公式・推奨本番環境）

**メリット**:

- 複数チャネル対応
- メッセージ更新可能（デプロイ進行状況等）
- インタラクティブ機能（ボタン・選択肢）
- エラーハンドリング充実

**デメリット**:

- Slack App作成が必要
- Bot Tokenの管理

**設定手順**:

1. Slack App作成（https://api.slack.com/apps）
2. Permissions → Bot Token Scopes追加:
   - `chat:write` (メッセージ送信)
   - `chat:write.public` (未参加チャネルへ送信)
3. Install to Workspace → Bot Token取得（`xoxb-...`）
4. GitHub Secrets → `SLACK_BOT_TOKEN`に保存
5. チャネルIDを取得（Slackで右クリック → "Copy link" → 末尾の`C...`）

**ワークフロー例**:

```yaml
name: Slack Bot Notification

on: [push]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Post to Slack channel
        id: slack
        uses: slackapi/slack-github-action@v1.24.0
        with:
          channel-id: "C1234567890"
          slack-message: |
            *Deployment Status*: ${{ job.status }}
            *Repository*: ${{ github.repository }}
            *Branch*: ${{ github.ref_name }}
            *Commit*: `${{ github.sha }}`
            *Author*: ${{ github.actor }}
            <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Workflow>
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}

      - name: Update Slack message
        if: success()
        uses: slackapi/slack-github-action@v1.24.0
        with:
          channel-id: "C1234567890"
          update-ts: ${{ steps.slack.outputs.ts }}
          slack-message: |
            ✅ *Deployment Completed Successfully*
            *Repository*: ${{ github.repository }}
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

---

## メッセージフォーマット

### Block Kit（推奨・リッチUI）

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🚀 Deployment Notification"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Status*: ✅ Success\n*Environment*: Production"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Repository:*\nmy-org/my-repo" },
        { "type": "mrkdwn", "text": "*Branch:*\nmain" },
        { "type": "mrkdwn", "text": "*Commit:*\n`abc123`" },
        { "type": "mrkdwn", "text": "*Author:*\njohn.doe" }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Triggered by GitHub Actions at 2025-11-27 10:30:00 UTC"
        }
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "View Logs" },
          "url": "https://github.com/my-org/my-repo/actions/runs/123456",
          "style": "primary"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "View Deployment" },
          "url": "https://my-app.com"
        }
      ]
    }
  ]
}
```

### メンション機能

```yaml
- name: Alert on failure
  if: failure()
  run: |
    curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{
        "text": "<!here> Deployment Failed!",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "❌ *Deployment Failed* <!here>\n\nImmediate attention required!"
            }
          }
        ]
      }'
```

**メンション構文**:

- `<!here>`: オンラインメンバー全員
- `<!channel>`: チャネルメンバー全員
- `<@U1234567890>`: 特定ユーザー（User IDで指定）
- `<!subteam^S1234567890>`: ユーザーグループ

---

## 条件付き通知パターン

### 1. 成功時・失敗時で異なるチャネル

```yaml
- name: Notify success
  if: success()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "C_SUCCESS_CHANNEL"
    slack-message: "✅ Deployment succeeded!"
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}

- name: Notify failure
  if: failure()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "C_ALERT_CHANNEL"
    slack-message: "❌ Deployment failed! @here"
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

### 2. ブランチ別通知

```yaml
- name: Notify production deployment
  if: github.ref == 'refs/heads/main'
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "C_PRODUCTION_CHANNEL"
    slack-message: "🚀 Production deployment started"
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}

- name: Notify staging deployment
  if: github.ref == 'refs/heads/develop'
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "C_STAGING_CHANNEL"
    slack-message: "🧪 Staging deployment started"
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

### 3. スレッド返信（進行状況更新）

```yaml
- name: Initial notification
  id: slack_init
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "C1234567890"
    slack-message: "🔄 Deployment started..."
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}

- name: Build step
  run: pnpm run build

- name: Update thread
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "C1234567890"
    slack-message: "✅ Build completed"
    thread-ts: ${{ steps.slack_init.outputs.ts }}
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}

- name: Deploy step
  run: pnpm run deploy

- name: Final update
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "C1234567890"
    slack-message: "🎉 Deployment completed!"
    thread-ts: ${{ steps.slack_init.outputs.ts }}
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

---

## エラーハンドリング

### 1. 通知失敗でもワークフロー継続

```yaml
- name: Slack notification
  continue-on-error: true
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "C1234567890"
    slack-message: "Deployment completed"
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

### 2. リトライロジック

```yaml
- name: Slack notification with retry
  uses: nick-fields/retry@v2
  with:
    timeout_minutes: 2
    max_attempts: 3
    retry_wait_seconds: 10
    command: |
      curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
        -H "Content-Type: application/json" \
        -d '{"text": "Deployment notification"}'
```

### 3. フォールバック通知

```yaml
- name: Primary Slack notification
  id: slack_primary
  continue-on-error: true
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "C_PRIMARY"
    slack-message: "Deployment status"
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}

- name: Fallback notification
  if: steps.slack_primary.outcome == 'failure'
  run: |
    curl -X POST "${{ secrets.SLACK_WEBHOOK_FALLBACK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{"text": "Primary notification failed - Deployment status"}'
```

---

## セキュリティベストプラクティス

### 1. Secrets管理

```yaml
# ❌ 悪い例：ハードコード
- name: Bad practice
  run: |
    curl -X POST "https://hooks.slack.com/services/T00/B00/XXX" \
      -d '{"text": "notification"}'

# ✅ 良い例：Secrets使用
- name: Good practice
  run: |
    curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
      -d '{"text": "notification"}'
```

### 2. URL検証

```yaml
- name: Validate webhook URL
  run: |
    if [[ ! "${{ secrets.SLACK_WEBHOOK_URL }}" =~ ^https://hooks.slack.com/services/ ]]; then
      echo "Invalid Slack webhook URL format"
      exit 1
    fi
```

### 3. センシティブ情報のマスキング

```yaml
- name: Send notification (masked)
  run: |
    # センシティブ情報をマスク
    echo "::add-mask::${{ secrets.DATABASE_PASSWORD }}"

    curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{
        "text": "Deployment completed",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Database connection: [MASKED]"
            }
          }
        ]
      }'
```

---

## パフォーマンス最適化

### 1. 並列通知

```yaml
- name: Send notifications
  run: |
    # 複数チャネルへ並列送信
    curl -X POST "${{ secrets.SLACK_WEBHOOK_GENERAL }}" -d '{"text": "notification"}' &
    curl -X POST "${{ secrets.SLACK_WEBHOOK_DEVOPS }}" -d '{"text": "notification"}' &
    wait
```

### 2. バッチ通知

```yaml
- name: Batch notifications
  run: |
    # 複数のイベントをまとめて通知
    EVENTS=$(cat << EOF
    {
      "blocks": [
        {"type": "section", "text": {"type": "mrkdwn", "text": "Build: ✅"}},
        {"type": "section", "text": {"type": "mrkdwn", "text": "Tests: ✅"}},
        {"type": "section", "text": {"type": "mrkdwn", "text": "Deploy: ✅"}}
      ]
    }
    EOF
    )

    curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d "$EVENTS"
```

---

## トラブルシューティング

### チャネルIDの取得方法

1. Slackでチャネルを開く
2. チャネル名を右クリック → "Copy link"
3. URL末尾の`C...`がチャネルID（例: `https://app.slack.com/client/T123/C456789` → `C456789`）

### Bot Token権限不足エラー

```
Error: not_in_channel
```

**解決策**:

- Bot TokenにBot Token Scopes `chat:write.public`を追加
- または、Botを事前にチャネルに招待（`/invite @bot-name`）

### Webhook URL無効エラー

```
Error: Invalid webhook URL
```

**解決策**:

- Webhook URLが`https://hooks.slack.com/services/`で始まるか確認
- Incoming Webhookが有効化されているか確認
- Secretsに正しく保存されているか確認

---

## 参考リンク

- [Slack API - Block Kit Builder](https://api.slack.com/block-kit/building)
- [Slack GitHub Action](https://github.com/slackapi/slack-github-action)
- [Incoming Webhooks](https://api.slack.com/messaging/webhooks)
