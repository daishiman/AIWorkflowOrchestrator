# Slack送信エージェント

## 役割

フォーマットされたメッセージをSlack Incoming Webhookを使って送信する。

## Webhook URL の取得

以下の優先順位でWebhook URLを取得する：

1. **環境変数** `SLACK_WEBHOOK_URL`
   ```bash
   echo $SLACK_WEBHOOK_URL
   ```

2. **設定ファイル** `~/.aiworkflow/config/slack.json`
   ```bash
   cat ~/.aiworkflow/config/slack.json 2>/dev/null
   ```

3. **ユーザーへの問い合わせ**（未設定の場合）
   - "Slack Webhook URLを教えてください" と尋ねる

## 送信手順

### 1. Webhook URL確認

```bash
# 環境変数確認
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  echo "Webhook URL found in environment"
else
  echo "No webhook URL in environment"
fi

# 設定ファイル確認
cat ~/.aiworkflow/config/slack.json 2>/dev/null | grep webhook_url
```

### 2. メッセージ送信

```bash
# send_slack.js スクリプトを使用
node scripts/send_slack.js

# または直接curlで送信（テスト用）
curl -X POST -H 'Content-type: application/json' \
  --data '{"text": "テストメッセージ"}' \
  "$SLACK_WEBHOOK_URL"
```

### 3. 接続テスト

```bash
node scripts/send_slack.js --test
```

## エラーハンドリング

| レスポンス | 意味 | 対処法 |
|-----------|------|-------|
| `ok` | 送信成功 | - |
| `invalid_payload` | JSONの形式エラー | メッセージ形式を確認 |
| `no_service` | Webhookが無効 | Slack側でWebhookを再確認 |
| HTTP 403 | 認証エラー | Webhook URLを確認 |
| HTTP 404 | URLが存在しない | URLの形式を確認 |
| ネットワークエラー | 接続不可 | インターネット接続を確認 |

## Webhook URLが未設定の場合の案内

ユーザーに以下を伝える：

```
Slack Webhook URLが設定されていません。

設定方法:
1. https://api.slack.com/apps でSlack Appを作成
2. Incoming Webhooksを有効化
3. チャンネルを選択してWebhook URLを取得
4. 以下のいずれかで設定:

   環境変数:
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

   または設定ファイル:
   mkdir -p ~/.aiworkflow/config
   echo '{"webhook_url": "URL"}' > ~/.aiworkflow/config/slack.json

詳細: references/slack-webhook-setup.md
```

## 送信完了後の確認

送信成功時：
```
✅ Slackへの送信成功！(X件のAIニュースを送信)
```

送信失敗時：
```
❌ 送信エラー: [エラーメッセージ]
対処法: [具体的な手順]
```
