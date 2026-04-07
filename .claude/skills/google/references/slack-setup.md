# Slack セットアップガイド

Slack への通知には **Incoming Webhook（推奨）** または **Bot Token** のいずれかを使用します。

---

## 方式A: Incoming Webhook（推奨・シンプル）

### 1. Slack App の作成

1. [Slack API](https://api.slack.com/apps) にアクセス
2. **Create New App** → **From scratch**
3. App 名: `Calendar Notifier`、ワークスペースを選択 → **Create App**

### 2. Incoming Webhook の有効化

```
Incoming Webhooks → Activate Incoming Webhooks → On
  → Add New Webhook to Workspace
  → チャンネルを選択（例: #daily-schedule）
  → Allow
```

**Webhook URL** をコピー（`https://hooks.slack.com/services/xxx/yyy/zzz`）

### 3. 環境変数の設定

```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/xxx/yyy/zzz"
```

---

## 方式B: Bot Token（複数チャンネルへの送信・高機能向け）

### 1. Slack App の作成

上記と同様に App を作成します。

### 2. Bot Token スコープの追加

```
OAuth & Permissions → Scopes → Bot Token Scopes → Add an OAuth Scope
  → chat:write を追加
```

### 3. アプリのインストール

```
OAuth & Permissions → Install to Workspace → Allow
```

**Bot User OAuth Token**（`xoxb-...`）をコピー

### 4. チャンネル ID の確認

Slack でチャンネルを右クリック → **チャンネル詳細を表示** → 最下部に **チャンネル ID**（`Cxxxxxxxxxx`）

Bot をチャンネルに招待:
```
/invite @Calendar Notifier
```

### 5. 環境変数の設定

```bash
export SLACK_BOT_TOKEN="xoxb-your-bot-token"
export SLACK_CHANNEL_ID="C0XXXXXXXXX"
```

---

## 定期実行（cron での自動化）

```bash
# crontab -e で設定
# 毎朝 8:00 に実行
0 8 * * 1-5 cd /path/to/AIWorkflowOrchestrator && node .claude/skills/google/scripts/daily_schedule.js >> /tmp/calendar-slack.log 2>&1
```

### GitHub Actions での自動化

```yaml
# .github/workflows/daily-schedule.yml
name: Daily Schedule to Slack

on:
  schedule:
    - cron: "0 23 * * 0-4"  # JST 8:00 (月〜金)
  workflow_dispatch:

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
          cache-dependency-path: ".claude/skills/google/pnpm-lock.yaml"
      - name: Install dependencies
        run: pnpm --filter @skills/google install
      - name: Send schedule to Slack
        working-directory: .claude/skills/google
        run: node scripts/daily_schedule.js
        env:
          GOOGLE_SERVICE_ACCOUNT_JSON: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_JSON }}
          GOOGLE_CALENDAR_ID: ${{ secrets.GOOGLE_CALENDAR_ID }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## トラブルシューティング

| エラー | 原因 | 対処 |
|---|---|---|
| `invalid_auth` | Webhook URL / Token が無効 | 再発行して更新 |
| `channel_not_found` | チャンネル ID が違う | 正しいチャンネル ID を確認 |
| `not_in_channel` | Bot がチャンネルにいない | `/invite @Bot名` で招待 |
| `missing_scope` | 権限が不足 | `chat:write` スコープを追加・再インストール |
