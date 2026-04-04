---
name: ai-news-to-slack
description: |
  AI関連の最新情報を自動収集し、整理してSlackに通知するスキル。
  指定したトピック（LLM、生成AI、AIツール、研究論文等）に関する情報を
  複数のソースから収集し、AIで要約・整形してSlackチャンネルに配信する。

  Anchors:
  * Slack Incoming Webhooks / 適用: Slack通知 / 目的: チームへのAI情報共有
  * HackerNews API & Arxiv RSS / 適用: AI関連情報収集 / 目的: 最新AI動向の把握

  Trigger:
  slack通知, AI情報収集, slack, ai news, ai情報, 情報収集してslackに通知, AIニュース通知, slackに送って
version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Bash
  - Agent
  - Glob
  - Grep
---

# AI情報収集 → Slack通知スキル

AI関連の最新情報を収集し、Slackチャンネルへ自動通知するスキル。

## 概要

このスキルは以下のワークフローを自動実行します：

1. **情報収集**: HackerNews・Arxiv等からAI関連情報を取得
2. **AI要約**: 収集した情報をClaudeが整理・要約・日本語化
3. **Slack通知**: フォーマットされたメッセージをSlackに投稿

## ワークフロー

| Phase | タスク | 実行パターン | 入力 | 出力 |
|-------|--------|------------|------|------|
| 1 | AI情報収集 | Sequential | トピック・日付 | ニュースJSON |
| 2 | 要約・整形 | Sequential | ニュースJSON | Slackメッセージ |
| 3 | Slack送信 | Sequential | メッセージ・Webhook URL | 送信結果 |

## Task仕様ナビ

| エージェント | ファイル | 呼び出し条件 |
|------------|---------|------------|
| 情報収集 | agents/collect-ai-news.md | AI情報収集が必要時 |
| 要約整形 | agents/summarize-and-format.md | メッセージ作成が必要時 |
| Slack送信 | agents/send-to-slack.md | Slackへの投稿時 |

## 使い方

### 基本的な使い方

```
AI情報をSlackに通知して
```

```
最新のLLM情報を収集してSlackに送って
```

```
今日のAIニュースをまとめてSlackの#ai-newsチャンネルに投稿して
```

### カスタマイズオプション

- **トピック指定**: "GPT-4o", "Claude", "画像生成AI" など特定トピックを指定可能
- **チャンネル指定**: Slack Webhook URLで送信先チャンネルを指定
- **件数指定**: "上位5件" などで取得件数を制御

## 事前設定（必須）

### Slack Webhook URLの設定

初回実行時に以下の情報が必要です：

1. **Slack Incoming Webhook URLの作成**
   - [Slack API](https://api.slack.com/apps) でアプリを作成
   - Incoming Webhooks を有効化 → チャンネルを選択 → URL取得

2. **環境変数に設定（推奨）**
   ```bash
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/T.../B.../xxx"
   ```

3. **設定ファイルに保存**
   ```bash
   mkdir -p ~/.aiworkflow/config
   echo '{"webhook_url": "https://hooks.slack.com/services/..."}' > ~/.aiworkflow/config/slack.json
   chmod 600 ~/.aiworkflow/config/slack.json
   ```

詳細は `references/slack-webhook-setup.md` を参照してください。

## 実行フロー

```
ユーザー: "AIニュースをSlackに通知して"
    ↓
1. collect_news.js → HackerNews/Arxiv からAI情報収集
    ↓
2. Claude が情報を要約・日本語化・整形
    ↓
3. send_slack.js → Slack Webhookに投稿
    ↓
完了: "✅ X件のAIニュースをSlackに送信しました"
```

## 出力フォーマット（Slackメッセージ例）

```
🤖 AIニュース日次サマリー - 2026/04/02

📰 今日のトップニュース

1. GPT-5がリリース
   OpenAIが次世代モデルを発表。推論能力が大幅向上。
   🔗 https://...

2. Anthropic Claude 4の新機能
   長文処理と画像認識が強化された新バージョン登場。
   🔗 https://...

🔬 注目の研究論文

• "Scaling Laws for Neural Language Models"
  LLMのスケーリング則に関する新知見。
  📄 arxiv.org/...

─────────────────────
収集日時: 2026-04-02 | 合計 10 件
AI Workflow Orchestrator により自動収集・送信
```

## リソース参照

| リソース | パス | 用途 |
|---------|------|------|
| Slackセットアップ | references/slack-webhook-setup.md | Webhook設定手順 |
| 収集スクリプト | scripts/collect_news.js | ニュース収集 |
| 送信スクリプト | scripts/send_slack.js | Slack投稿 |

## トラブルシューティング

| 問題 | 解決方法 |
|------|---------|
| Webhook URLが見つからない | `references/slack-webhook-setup.md` を参照 |
| 送信に失敗する | URLの形式とSlackアプリ権限を確認 |
| 情報が収集できない | ネットワーク接続を確認 |
| `invalid_payload` エラー | メッセージのJSON形式を確認 |
