# Slack Incoming Webhook セットアップガイド

## ステップ1: Slack Appの作成

1. [Slack API](https://api.slack.com/apps) にアクセス（Slackにログイン済みであること）
2. 「**Create New App**」をクリック
3. 「**From scratch**」を選択
4. **App Name**: `AI News Bot`（任意）を入力
5. 通知を送りたいSlack **ワークスペース**を選択
6. 「Create App」をクリック

## ステップ2: Incoming Webhooksの有効化

1. 作成したアプリの設定ページ（左メニュー）を開く
2. 「**Incoming Webhooks**」をクリック
3. 「**Activate Incoming Webhooks**」を **On** に切り替え
4. ページ下部の「**Add New Webhook to Workspace**」をクリック
5. 通知を送るチャンネルを選択（例: `#ai-news` を新規作成して選択）
6. 「**許可する**」をクリック

## ステップ3: Webhook URLの取得

「Incoming Webhooks」ページに戻ると、以下の形式のURLが表示されます：

```
https://hooks.slack.com/services/<WORKSPACE_ID>/<BOT_ID>/<TOKEN>
```

**このURLをコピー**してください（他人に共有しないこと）。

## ステップ4: URLの設定

### 方法1: 環境変数（推奨・最も簡単）

```bash
# .bashrc または .zshrc に追加
echo 'export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"' >> ~/.zshrc

# 設定を即座に反映
source ~/.zshrc

# 確認
echo $SLACK_WEBHOOK_URL
```

### 方法2: 設定ファイル

```bash
# ディレクトリを作成
mkdir -p ~/.aiworkflow/config

# 設定ファイルを作成
cat > ~/.aiworkflow/config/slack.json << 'EOF'
{
  "webhook_url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
  "default_channel": "#ai-news",
  "username": "AI News Bot",
  "icon_emoji": ":robot_face:"
}
EOF

# セキュリティのためパーミッションを制限
chmod 600 ~/.aiworkflow/config/slack.json
```

## ステップ5: 動作確認

### 接続テスト

```bash
# 環境変数が設定されている場合
node scripts/send_slack.js --test

# URLを直接指定する場合
node scripts/send_slack.js --webhook "https://hooks.slack.com/..." --test
```

Slackに「✅ AI Workflow Orchestrator - 接続テスト成功！」というメッセージが届けば成功です。

### フルテスト（情報収集 → 送信）

```bash
node scripts/collect_news.js | node scripts/send_slack.js
```

## よくある質問 (FAQ)

### Q: 特定のチャンネルに送りたい

A: Webhook URLはチャンネルに紐づいています。別チャンネルに送る場合は、そのチャンネル用の新しいWebhookを作成して、対応するURLを使ってください。

### Q: DMやプライベートチャンネルに送れるか

A: はい。Webhook作成時にプライベートチャンネルやDMを選択できます。

### Q: Webhookが機能しなくなった

A: 以下を確認してください：
1. [Slack API](https://api.slack.com/apps) でアプリが正常にインストールされているか
2. Incoming Webhooksが「On」になっているか
3. URLをコピー時に余分な空白が含まれていないか
4. Slackアプリが削除・無効化されていないか

### Q: 複数のチャンネルに同時に送りたい

A: 複数のWebhook URLを作成し、スクリプトを複数回実行してください：

```bash
NEWS=$(node scripts/collect_news.js)
echo "$NEWS" | node scripts/send_slack.js --webhook "$SLACK_WEBHOOK_URL_CHANNEL1"
echo "$NEWS" | node scripts/send_slack.js --webhook "$SLACK_WEBHOOK_URL_CHANNEL2"
```

## セキュリティ注意事項

- **Webhook URLは秘密情報**として扱うこと
- GitリポジトリにURLを**コミットしない**
- `~/.aiworkflow/config/slack.json` は `chmod 600` で保護する
- URLが漏洩した場合は、Slack APIサイトでWebhookを再生成する

## スケジュール実行（自動化）

毎朝9時に自動実行する場合（macOS/Linux）：

```bash
# crontabを編集
crontab -e

# 以下を追加（毎朝9時に実行）
0 9 * * * SLACK_WEBHOOK_URL="your-url" node /path/to/collect_news.js | node /path/to/send_slack.js
```
