# Discord 通知

## 概要

Discordは、開発チームのコミュニケーションとアラート通知に適したプラットフォームです。
このドキュメントでは、Discord Webhookを使用した通知の実装方法を説明します。

## Webhook 設定

### Webhook URL の取得

```
1. Discord サーバーで通知チャンネルを選択
2. 設定（歯車アイコン）→ 連携サービス
3. Webhook → 新しいWebhook
4. Webhook URLをコピー
```

### 環境変数設定

```bash
# .env.local
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy
DISCORD_ALERT_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/zzz
```

## メッセージフォーマット

### 基本構造

```typescript
interface DiscordMessage {
  content?: string;           // 通常のテキスト
  embeds?: DiscordEmbed[];    // リッチなメッセージ
  username?: string;          // 表示名の上書き
  avatar_url?: string;        // アバターの上書き
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;             // 16進数カラーコード
  timestamp?: string;         // ISO 8601
  footer?: { text: string };
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
}
```

### カラーコード

| 色 | 用途 | コード |
|----|------|--------|
| 赤 | P1/Critical | 15158332 (0xE74C3C) |
| オレンジ | P2/High | 15105570 (0xE67E22) |
| 黄色 | P3/Warning | 16776960 (0xFFFF00) |
| 緑 | Success/Resolved | 5763719 (0x57F287) |
| 青 | Info | 3447003 (0x3498DB) |

## 通知テンプレート

### デプロイ通知

```typescript
async function notifyDeployment(data: {
  service: string;
  version: string;
  environment: string;
  status: 'started' | 'success' | 'failed';
  url?: string;
}) {
  const statusConfig = {
    started: { emoji: '🚀', color: 3447003, text: 'デプロイ開始' },
    success: { emoji: '✅', color: 5763719, text: 'デプロイ成功' },
    failed: { emoji: '❌', color: 15158332, text: 'デプロイ失敗' },
  };

  const config = statusConfig[data.status];

  await sendDiscordMessage({
    embeds: [{
      title: `${config.emoji} ${config.text}`,
      color: config.color,
      fields: [
        { name: 'サービス', value: data.service, inline: true },
        { name: 'バージョン', value: data.version, inline: true },
        { name: '環境', value: data.environment, inline: true },
        ...(data.url ? [{ name: 'URL', value: data.url, inline: false }] : []),
      ],
      timestamp: new Date().toISOString(),
    }],
  });
}
```

### アラート通知

```typescript
async function notifyAlert(data: {
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  title: string;
  description: string;
  service: string;
  environment: string;
  runbookUrl?: string;
}) {
  const severityConfig = {
    P1: { emoji: '🚨', color: 15158332, label: 'Critical' },
    P2: { emoji: '🔴', color: 15105570, label: 'High' },
    P3: { emoji: '🟡', color: 16776960, label: 'Medium' },
    P4: { emoji: '🔵', color: 3447003, label: 'Low' },
  };

  const config = severityConfig[data.severity];

  await sendDiscordMessage({
    embeds: [{
      title: `${config.emoji} [${data.severity}] ${data.title}`,
      description: data.description,
      color: config.color,
      fields: [
        { name: 'サービス', value: data.service, inline: true },
        { name: '環境', value: data.environment, inline: true },
        { name: '重大度', value: config.label, inline: true },
        ...(data.runbookUrl
          ? [{ name: '対応手順', value: `[Runbook](${data.runbookUrl})`, inline: false }]
          : []),
      ],
      timestamp: new Date().toISOString(),
    }],
  });
}
```

### 解決通知

```typescript
async function notifyResolved(data: {
  title: string;
  description: string;
  duration: string;
  service: string;
}) {
  await sendDiscordMessage({
    embeds: [{
      title: `✅ 解決: ${data.title}`,
      description: data.description,
      color: 5763719,
      fields: [
        { name: 'サービス', value: data.service, inline: true },
        { name: '解決までの時間', value: data.duration, inline: true },
      ],
      timestamp: new Date().toISOString(),
    }],
  });
}
```

## 実装

### 基本的な送信関数

```typescript
async function sendDiscordMessage(message: DiscordMessage): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL is not set');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to send Discord message:', error);
    // 通知失敗でアプリケーションを止めない
  }
}
```

### リトライ付き送信

```typescript
async function sendDiscordMessageWithRetry(
  message: DiscordMessage,
  maxRetries = 3
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL is not set');
    return;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        return;
      }

      // レート制限の場合は待機
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
        await sleep(waitTime);
        continue;
      }

      throw new Error(`Discord API error: ${response.status}`);
    } catch (error) {
      if (attempt === maxRetries) {
        console.error('Failed to send Discord message after retries:', error);
      } else {
        await sleep(1000 * attempt); // Exponential backoff
      }
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

## GitHub Actions での使用

### デプロイ通知

```yaml
name: Deploy with Notification

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Notify Start
        run: |
          curl -X POST ${{ secrets.DISCORD_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{
              "embeds": [{
                "title": "🚀 デプロイ開始",
                "color": 3447003,
                "fields": [
                  {"name": "リポジトリ", "value": "${{ github.repository }}", "inline": true},
                  {"name": "ブランチ", "value": "${{ github.ref_name }}", "inline": true},
                  {"name": "コミット", "value": "${{ github.sha }}", "inline": false}
                ]
              }]
            }'

      - name: Deploy
        id: deploy
        run: |
          # デプロイ処理

      - name: Notify Success
        if: success()
        run: |
          curl -X POST ${{ secrets.DISCORD_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{
              "embeds": [{
                "title": "✅ デプロイ成功",
                "color": 5763719,
                "fields": [
                  {"name": "リポジトリ", "value": "${{ github.repository }}", "inline": true},
                  {"name": "環境", "value": "production", "inline": true}
                ]
              }]
            }'

      - name: Notify Failure
        if: failure()
        run: |
          curl -X POST ${{ secrets.DISCORD_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{
              "embeds": [{
                "title": "❌ デプロイ失敗",
                "color": 15158332,
                "fields": [
                  {"name": "リポジトリ", "value": "${{ github.repository }}", "inline": true},
                  {"name": "ワークフロー", "value": "${{ github.workflow }}", "inline": true},
                  {"name": "詳細", "value": "[ログを確認](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})", "inline": false}
                ]
              }]
            }'
```

## レート制限

### Discord の制限

- **通常の制限**: 30リクエスト/分/Webhook
- **バースト制限**: 5リクエスト/2秒

### 対策

```typescript
class RateLimitedNotifier {
  private queue: DiscordMessage[] = [];
  private isProcessing = false;
  private readonly minInterval = 500; // 500ms between messages

  async send(message: DiscordMessage): Promise<void> {
    this.queue.push(message);
    await this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const message = this.queue.shift()!;
      await sendDiscordMessage(message);
      await sleep(this.minInterval);
    }

    this.isProcessing = false;
  }
}
```

## ベストプラクティス

### すべきこと

1. **適切な重大度表示**
   - カラーコードで視覚的に区別
   - 絵文字で直感的に

2. **必要な情報を含める**
   - サービス名
   - 環境
   - 対応手順リンク

3. **レート制限対策**
   - キューイング
   - リトライ

### 避けるべきこと

1. **過度な通知**
   - ❌ すべてのログを通知
   - ✅ 重要なイベントのみ

2. **機密情報の露出**
   - ❌ 認証情報を含める
   - ❌ 詳細なスタックトレース

3. **メンション乱用**
   - ❌ 常に @everyone
   - ✅ 重大度に応じたメンション

## トラブルシューティング

### 通知が届かない

**確認事項**:
1. Webhook URLが正しいか
2. チャンネルが存在するか
3. Webhookが有効か

### レート制限エラー

**対策**:
1. 送信間隔を空ける
2. キューイングを実装
3. 重要度でフィルタリング

### メッセージが表示されない

**確認事項**:
1. JSONフォーマットが正しいか
2. フィールド値が空でないか
3. 色コードが有効か
