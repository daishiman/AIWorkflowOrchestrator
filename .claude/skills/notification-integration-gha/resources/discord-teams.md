# Discord・MS Teams統合ガイド

GitHub ActionsからDiscordとMicrosoft Teamsへの通知統合パターン。

## Discord統合

### Webhook URL取得

1. Discordでチャネルを開く → 設定（⚙️）
2. 「連携サービス」→「ウェブフック」→「新しいウェブフック」
3. Webhook名・アバター設定
4. 「ウェブフックURLをコピー」（`https://discord.com/api/webhooks/...`）
5. GitHub Secrets → `DISCORD_WEBHOOK_URL`に保存

---

### 基本的な通知

```yaml
name: Discord Notification

on: [push, pull_request]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Discord notification
        run: |
          curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{
              "content": "**GitHub Actions Notification**",
              "embeds": [{
                "title": "${{ github.workflow }}",
                "description": "Workflow execution completed",
                "color": 3066993,
                "fields": [
                  {"name": "Repository", "value": "${{ github.repository }}", "inline": true},
                  {"name": "Branch", "value": "${{ github.ref_name }}", "inline": true},
                  {"name": "Commit", "value": "`${{ github.sha }}`", "inline": false},
                  {"name": "Author", "value": "${{ github.actor }}", "inline": true},
                  {"name": "Status", "value": "${{ job.status }}", "inline": true}
                ],
                "timestamp": "${{ github.event.head_commit.timestamp }}"
              }]
            }'
```

---

### リッチEmbed（色・サムネイル・フッター）

```yaml
- name: Rich Discord embed
  run: |
    # 色コード: 緑=3066993, 赤=15158332, オレンジ=16098851
    COLOR=${{ job.status == 'success' && 3066993 || 15158332 }}

    curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d "{
        \"embeds\": [{
          \"title\": \"🚀 Deployment Notification\",
          \"description\": \"Production deployment completed\",
          \"color\": $COLOR,
          \"fields\": [
            {\"name\": \"Environment\", \"value\": \"Production\", \"inline\": true},
            {\"name\": \"Status\", \"value\": \"${{ job.status }}\", \"inline\": true},
            {\"name\": \"Repository\", \"value\": \"[${{ github.repository }}](${{ github.server_url }}/${{ github.repository }})\", \"inline\": false}
          ],
          \"thumbnail\": {
            \"url\": \"${{ github.event.sender.avatar_url }}\"
          },
          \"footer\": {
            \"text\": \"GitHub Actions\",
            \"icon_url\": \"https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png\"
          },
          \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
        }]
      }"
```

---

### 条件付き通知（成功・失敗で異なるメッセージ）

```yaml
- name: Discord notification (conditional)
  if: always()
  run: |
    if [ "${{ job.status }}" == "success" ]; then
      EMOJI="✅"
      COLOR=3066993
      MESSAGE="Deployment succeeded!"
    else
      EMOJI="❌"
      COLOR=15158332
      MESSAGE="Deployment failed! @everyone"
    fi

    curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d "{
        \"content\": \"$EMOJI **$MESSAGE**\",
        \"embeds\": [{
          \"title\": \"${{ github.workflow }}\",
          \"color\": $COLOR,
          \"fields\": [
            {\"name\": \"Status\", \"value\": \"${{ job.status }}\", \"inline\": true},
            {\"name\": \"Branch\", \"value\": \"${{ github.ref_name }}\", \"inline\": true}
          ]
        }]
      }"
```

---

### メンション機能

```yaml
- name: Alert with mentions
  if: failure()
  run: |
    curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{
        "content": "@everyone Deployment Failed!",
        "embeds": [{
          "title": "❌ Critical Failure",
          "description": "Immediate attention required",
          "color": 15158332
        }]
      }'
```

**メンション構文**:
- `@everyone`: 全員（権限必要）
- `@here`: オンラインメンバー
- `<@USER_ID>`: 特定ユーザー（例: `<@123456789012345678>`）
- `<@&ROLE_ID>`: 特定ロール（例: `<@&987654321098765432>`）

---

### ボタン付きメッセージ（コンポーネント）

```yaml
- name: Discord with buttons
  run: |
    curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{
        "content": "Deployment completed",
        "embeds": [{
          "title": "🚀 Production Deployment",
          "color": 3066993
        }],
        "components": [{
          "type": 1,
          "components": [
            {
              "type": 2,
              "style": 5,
              "label": "View Logs",
              "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            },
            {
              "type": 2,
              "style": 5,
              "label": "View App",
              "url": "https://my-app.com"
            }
          ]
        }]
      }'
```

---

## Microsoft Teams統合

### Webhook URL取得

1. Teamsでチャネルを開く → 「...」メニュー → 「コネクタ」
2. 「受信Webhook」を検索 → 「構成」
3. Webhook名・アイコン設定 → 「作成」
4. Webhook URLをコピー（`https://outlook.office.com/webhook/...`）
5. GitHub Secrets → `TEAMS_WEBHOOK_URL`に保存

---

### 基本的な通知（MessageCard形式）

```yaml
name: Teams Notification

on: [push, pull_request]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Teams notification
        run: |
          curl -X POST "${{ secrets.TEAMS_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{
              "@type": "MessageCard",
              "@context": "https://schema.org/extensions",
              "summary": "GitHub Actions Notification",
              "themeColor": "0078D4",
              "title": "${{ github.workflow }}",
              "sections": [{
                "activityTitle": "Workflow Execution",
                "activitySubtitle": "${{ github.repository }}",
                "facts": [
                  {"name": "Status", "value": "${{ job.status }}"},
                  {"name": "Branch", "value": "${{ github.ref_name }}"},
                  {"name": "Commit", "value": "${{ github.sha }}"},
                  {"name": "Author", "value": "${{ github.actor }}"}
                ],
                "markdown": true
              }],
              "potentialAction": [{
                "@type": "OpenUri",
                "name": "View Workflow",
                "targets": [{
                  "os": "default",
                  "uri": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                }]
              }]
            }'
```

---

### 条件付きテーマカラー

```yaml
- name: Teams notification with color
  if: always()
  run: |
    # 成功=緑(0078D4), 失敗=赤(FF0000), 警告=黄(FFB900)
    if [ "${{ job.status }}" == "success" ]; then
      COLOR="0078D4"
      TITLE="✅ Deployment Succeeded"
    else
      COLOR="FF0000"
      TITLE="❌ Deployment Failed"
    fi

    curl -X POST "${{ secrets.TEAMS_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d "{
        \"@type\": \"MessageCard\",
        \"themeColor\": \"$COLOR\",
        \"title\": \"$TITLE\",
        \"sections\": [{
          \"facts\": [
            {\"name\": \"Repository\", \"value\": \"${{ github.repository }}\"},
            {\"name\": \"Branch\", \"value\": \"${{ github.ref_name }}\"}
          ]
        }]
      }"
```

---

### Adaptive Cards（推奨・リッチUI）

```yaml
- name: Teams Adaptive Card
  run: |
    curl -X POST "${{ secrets.TEAMS_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "message",
        "attachments": [{
          "contentType": "application/vnd.microsoft.card.adaptive",
          "content": {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.4",
            "body": [
              {
                "type": "TextBlock",
                "text": "🚀 Deployment Notification",
                "weight": "Bolder",
                "size": "Large"
              },
              {
                "type": "FactSet",
                "facts": [
                  {"title": "Repository", "value": "${{ github.repository }}"},
                  {"title": "Branch", "value": "${{ github.ref_name }}"},
                  {"title": "Status", "value": "${{ job.status }}"},
                  {"title": "Author", "value": "${{ github.actor }}"}
                ]
              }
            ],
            "actions": [
              {
                "type": "Action.OpenUrl",
                "title": "View Logs",
                "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
              },
              {
                "type": "Action.OpenUrl",
                "title": "View Repository",
                "url": "${{ github.server_url }}/${{ github.repository }}"
              }
            ]
          }
        }]
      }'
```

---

### 複数セクション・画像付き

```yaml
- name: Rich Teams card
  run: |
    curl -X POST "${{ secrets.TEAMS_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{
        "@type": "MessageCard",
        "themeColor": "0078D4",
        "summary": "Deployment Summary",
        "sections": [
          {
            "activityTitle": "**Production Deployment**",
            "activitySubtitle": "${{ github.repository }}",
            "activityImage": "${{ github.event.sender.avatar_url }}"
          },
          {
            "title": "Deployment Details",
            "facts": [
              {"name": "Environment", "value": "Production"},
              {"name": "Version", "value": "v1.2.3"},
              {"name": "Status", "value": "${{ job.status }}"}
            ]
          },
          {
            "title": "Git Information",
            "facts": [
              {"name": "Branch", "value": "${{ github.ref_name }}"},
              {"name": "Commit", "value": "${{ github.sha }}"},
              {"name": "Author", "value": "${{ github.actor }}"}
            ]
          }
        ],
        "potentialAction": [
          {
            "@type": "OpenUri",
            "name": "View Workflow",
            "targets": [{"os": "default", "uri": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"}]
          },
          {
            "@type": "OpenUri",
            "name": "View Deployment",
            "targets": [{"os": "default", "uri": "https://my-app.com"}]
          }
        ]
      }'
```

---

## Email通知（GitHub Actions標準機能）

### Repository設定での有効化

1. GitHub Repository → Settings → Notifications
2. "Email notifications"を有効化
3. 通知を受け取りたいメールアドレス設定

**制限事項**:
- ワークフロー単位での制御不可
- カスタムメッセージ不可
- リポジトリ全体の通知設定

---

### SendGrid使用（カスタムEmail）

```yaml
- name: Send email via SendGrid
  run: |
    curl -X POST "https://api.sendgrid.com/v3/mail/send" \
      -H "Authorization: Bearer ${{ secrets.SENDGRID_API_KEY }}" \
      -H "Content-Type: application/json" \
      -d '{
        "personalizations": [{
          "to": [{"email": "team@example.com"}]
        }],
        "from": {"email": "noreply@example.com"},
        "subject": "GitHub Actions: ${{ github.workflow }} - ${{ job.status }}",
        "content": [{
          "type": "text/html",
          "value": "<h2>Workflow Notification</h2><p><strong>Status:</strong> ${{ job.status }}</p><p><strong>Repository:</strong> ${{ github.repository }}</p>"
        }]
      }'
```

---

### AWS SES使用

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1

- name: Send email via SES
  run: |
    aws ses send-email \
      --from "noreply@example.com" \
      --destination "ToAddresses=team@example.com" \
      --message "Subject={Data='GitHub Actions: ${{ github.workflow }}',Charset=utf8},Body={Html={Data='<h2>Status: ${{ job.status }}</h2>',Charset=utf8}}"
```

---

## 複数サービス統合パターン

### 並列通知（Slack + Discord + Teams）

```yaml
- name: Multi-service notifications
  if: always()
  run: |
    # Slack
    curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{"text": "Workflow: ${{ job.status }}"}' &

    # Discord
    curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{"content": "Workflow: ${{ job.status }}"}' &

    # Teams
    curl -X POST "${{ secrets.TEAMS_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{"@type": "MessageCard", "text": "Workflow: ${{ job.status }}"}' &

    wait
```

---

### フォールバック通知

```yaml
- name: Primary notification (Slack)
  id: slack_notify
  continue-on-error: true
  run: |
    curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{"text": "notification"}'

- name: Fallback notification (Discord)
  if: steps.slack_notify.outcome == 'failure'
  run: |
    curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{"content": "Primary notification failed - Fallback message"}'
```

---

## トラブルシューティング

### Discord: 429 Too Many Requests

**原因**: レート制限（5リクエスト/2秒、30リクエスト/分）

**解決策**:
```yaml
- name: Rate-limited Discord notification
  run: |
    for i in {1..3}; do
      curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
        -H "Content-Type: application/json" \
        -d "{\"content\": \"Message $i\"}"
      sleep 0.5  # 500ms待機
    done
```

---

### Teams: 400 Bad Request

**原因**: JSON構文エラー、必須フィールド欠落

**解決策**:
```yaml
- name: Validate JSON before sending
  run: |
    PAYLOAD='{
      "@type": "MessageCard",
      "themeColor": "0078D4",
      "text": "Valid message"
    }'

    # JSON検証
    echo "$PAYLOAD" | jq empty

    # 送信
    curl -X POST "${{ secrets.TEAMS_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d "$PAYLOAD"
```

---

### Webhook URL無効

**検証スクリプト**:
```yaml
- name: Validate webhook URLs
  run: |
    # Discord
    if [[ ! "${{ secrets.DISCORD_WEBHOOK_URL }}" =~ ^https://discord.com/api/webhooks/ ]]; then
      echo "Invalid Discord webhook URL"
      exit 1
    fi

    # Teams
    if [[ ! "${{ secrets.TEAMS_WEBHOOK_URL }}" =~ ^https://.*webhook.office.com/ ]]; then
      echo "Invalid Teams webhook URL"
      exit 1
    fi
```

---

## 参考リンク

### Discord
- [Discord Webhooks Guide](https://discord.com/developers/docs/resources/webhook)
- [Discord Embed Builder](https://discohook.org/)

### Microsoft Teams
- [Teams Incoming Webhooks](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)
- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
- [MessageCard Reference](https://learn.microsoft.com/en-us/outlook/actionable-messages/message-card-reference)
