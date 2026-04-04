#!/usr/bin/env node
/**
 * Slack送信スクリプト
 * Incoming Webhookを使ってSlackにAIニュースメッセージを送信する
 *
 * 使い方:
 *   # 標準入力からJSONを受け取って送信（パイプ）
 *   node collect_news.js | node send_slack.js
 *
 *   # ファイルから読み込んで送信
 *   node send_slack.js --message-file /tmp/news.json
 *
 *   # 接続テスト
 *   node send_slack.js --test
 *
 *   # カスタムタイトル指定
 *   node send_slack.js --title "週刊AIニュース"
 *
 * 環境変数:
 *   SLACK_WEBHOOK_URL - Slack Incoming Webhook URL
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ─── Webhook URL 取得 ─────────────────────────────────────────

/**
 * Slack Webhook URLを取得する
 * 優先順位: コマンドライン引数 > 環境変数 > 設定ファイル
 */
function getWebhookUrl(argUrl) {
  if (argUrl) return argUrl;
  if (process.env.SLACK_WEBHOOK_URL) return process.env.SLACK_WEBHOOK_URL;

  // 設定ファイル
  const configPath = path.join(os.homedir(), '.aiworkflow', 'config', 'slack.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.webhook_url) return config.webhook_url;
    } catch {
      // 設定ファイル読み込みエラーはスキップ
    }
  }

  return null;
}

// ─── Slack 送信 ───────────────────────────────────────────────

/**
 * SlackにHTTPS POSTリクエストを送信
 */
function postToSlack(webhookUrl, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const urlObj = new URL(webhookUrl);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + (urlObj.search || ''),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 && data.trim() === 'ok') {
          resolve({ success: true, status: res.statusCode });
        } else {
          reject(new Error(`Slack API error: HTTP ${res.statusCode} - "${data.trim()}"`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout (15s)'));
    });

    req.write(body);
    req.end();
  });
}

// ─── メッセージフォーマット ────────────────────────────────────

/**
 * AI情報JSONをSlackメッセージ形式にフォーマット
 */
function formatAINewsMessage(newsData, customTitle) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  const title = customTitle || `🤖 AIニュース日次サマリー - ${dateStr}`;

  const newsItems = newsData.items.filter(i => i.category === 'news');
  const researchItems = newsData.items.filter(i => i.category === 'research');

  let messageText = `${title}\n\n━━━━━━━━━━━━━━━━━━━━━\n`;

  // ニュース記事
  if (newsItems.length > 0) {
    messageText += `📰 *今日のトップニュース*\n\n`;
    newsItems.slice(0, 5).forEach((item, idx) => {
      messageText += `${idx + 1}. *${item.title}*\n`;
      if (item.summary) {
        messageText += `   ${item.summary.slice(0, 100)}\n`;
      }
      if (item.score) {
        messageText += `   ⬆ ${item.score}pts`;
        if (item.comments) messageText += ` 💬 ${item.comments}`;
        messageText += '\n';
      }
      messageText += `   🔗 ${item.url}\n\n`;
    });
  }

  // 研究論文
  if (researchItems.length > 0) {
    messageText += `🔬 *注目の研究論文*\n\n`;
    researchItems.slice(0, 5).forEach(item => {
      messageText += `• *${item.title}*\n`;
      if (item.summary) {
        messageText += `  ${item.summary.slice(0, 120)}...\n`;
      }
      messageText += `  📄 ${item.url}\n\n`;
    });
  }

  if (newsItems.length === 0 && researchItems.length === 0) {
    messageText += '今日のAI関連情報は見つかりませんでした。\n';
  }

  messageText += `━━━━━━━━━━━━━━━━━━━━━\n`;
  messageText += `_収集日時: ${newsData.collected_at} | 合計 ${newsData.total} 件_`;

  // Slackペイロード（3000文字制限に対応）
  const truncated = messageText.length > 3000
    ? messageText.slice(0, 2950) + '\n..._（省略）_'
    : messageText;

  return {
    text: title,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: truncated,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '_AI Workflow Orchestrator により自動収集・送信_',
          },
        ],
      },
    ],
  };
}

/**
 * Webhook URLが未設定の場合のヘルプメッセージ
 */
function printWebhookHelp() {
  console.error('');
  console.error('エラー: Slack Webhook URLが設定されていません。');
  console.error('');
  console.error('設定方法:');
  console.error('  1. 環境変数:');
  console.error('     export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/T.../B.../xxx"');
  console.error('');
  console.error('  2. 設定ファイル (~/.aiworkflow/config/slack.json):');
  console.error('     mkdir -p ~/.aiworkflow/config');
  console.error('     echo \'{"webhook_url": "https://hooks.slack.com/..."}\' \\');
  console.error('       > ~/.aiworkflow/config/slack.json');
  console.error('     chmod 600 ~/.aiworkflow/config/slack.json');
  console.error('');
  console.error('  3. コマンドライン引数:');
  console.error('     node send_slack.js --webhook "https://hooks.slack.com/..."');
  console.error('');
  console.error('詳細: references/slack-webhook-setup.md');
}

// ─── コマンドライン引数パース ─────────────────────────────────

function parseArgs(args) {
  const opts = {
    webhookArg: null,
    messageFile: null,
    customTitle: null,
    testMode: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--webhook':    opts.webhookArg = args[++i]; break;
      case '--message-file': opts.messageFile = args[++i]; break;
      case '--title':     opts.customTitle = args[++i]; break;
      case '--test':      opts.testMode = true; break;
    }
  }

  return opts;
}

// ─── メイン実行 ───────────────────────────────────────────────

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const webhookUrl = getWebhookUrl(opts.webhookArg);

  if (!webhookUrl) {
    printWebhookHelp();
    process.exit(1);
  }

  // ─── テストモード ─────────────────────────────────────────
  if (opts.testMode) {
    console.error('接続テストを送信中...');
    const testPayload = {
      text: '✅ AI Workflow Orchestrator - 接続テスト成功！',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '✅ *接続テスト成功！*\n`ai-news-to-slack` スキルがSlackに正常に接続できました。\n\nこのメッセージが表示されていれば、Webhook URLは正しく設定されています。',
          },
        },
      ],
    };

    try {
      await postToSlack(webhookUrl, testPayload);
      console.log('✅ テストメッセージの送信成功！');
    } catch (e) {
      console.error('❌ 送信エラー:', e.message);
      process.exit(1);
    }
    return;
  }

  // ─── ニュース送信モード ───────────────────────────────────
  let rawData;

  if (opts.messageFile) {
    // ファイルから読み込む
    if (!fs.existsSync(opts.messageFile)) {
      console.error(`エラー: ファイルが見つかりません: ${opts.messageFile}`);
      process.exit(1);
    }
    rawData = fs.readFileSync(opts.messageFile, 'utf8');
  } else {
    // 標準入力から読み込む（パイプ対応）
    if (process.stdin.isTTY) {
      console.error('エラー: 標準入力またはファイルからJSONデータを渡してください。');
      console.error('例: node collect_news.js | node send_slack.js');
      process.exit(1);
    }

    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    rawData = Buffer.concat(chunks).toString('utf8');
  }

  let newsData;
  try {
    newsData = JSON.parse(rawData);
  } catch (e) {
    console.error('エラー: JSONの解析に失敗しました:', e.message);
    process.exit(1);
  }

  if (!newsData.items || !Array.isArray(newsData.items)) {
    console.error('エラー: 無効なデータ形式です。items配列が必要です。');
    process.exit(1);
  }

  const payload = formatAINewsMessage(newsData, opts.customTitle);

  console.error(`Slackに送信中... (${newsData.total}件のニュース)`);

  try {
    await postToSlack(webhookUrl, payload);
    console.log(`✅ Slackへの送信成功！ (${newsData.total}件のAIニュースを送信)`);
  } catch (e) {
    console.error('❌ 送信エラー:', e.message);

    // エラー別の対処法を表示
    if (e.message.includes('invalid_payload')) {
      console.error('対処法: メッセージが長すぎる可能性があります。--title を短くするか件数を減らしてください。');
    } else if (e.message.includes('403') || e.message.includes('no_service')) {
      console.error('対処法: Webhook URLが無効です。Slackアプリの設定を確認してください。');
    }

    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
