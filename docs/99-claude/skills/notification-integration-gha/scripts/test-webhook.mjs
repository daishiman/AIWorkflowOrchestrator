#!/usr/bin/env node

/**
 * GitHub Actions Webhook Tester
 *
 * Slack、Discord、MS TeamsのWebhook URLをテストし、動作確認を行うスクリプト
 *
 * Usage:
 *   node test-webhook.mjs <webhook-url> [message]
 *   node test-webhook.mjs --slack <webhook-url> [message]
 *   node test-webhook.mjs --discord <webhook-url> [message]
 *   node test-webhook.mjs --teams <webhook-url> [message]
 *
 * Examples:
 *   node test-webhook.mjs https://hooks.slack.com/services/T00/B00/XXX "Test message"
 *   node test-webhook.mjs --discord https://discord.com/api/webhooks/... "Test message"
 *   node test-webhook.mjs --teams https://outlook.office.com/webhook/... "Test message"
 */

import https from "https";
import { URL } from "url";

// デフォルトメッセージ
const DEFAULT_MESSAGE = "🧪 GitHub Actions Webhook Test";

// Webhook種別を自動検出
function detectWebhookType(url) {
  if (url.includes("hooks.slack.com")) return "slack";
  if (url.includes("discord.com")) return "discord";
  if (url.includes("webhook.office.com") || url.includes("outlook.office.com"))
    return "teams";
  return "unknown";
}

// Slack用ペイロード生成
function createSlackPayload(message) {
  return {
    text: message,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${message}*`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: "*Script:*\ntest-webhook.mjs" },
          { type: "mrkdwn", text: "*Timestamp:*\n" + new Date().toISOString() },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "✅ Webhook is working correctly!",
          },
        ],
      },
    ],
  };
}

// Discord用ペイロード生成
function createDiscordPayload(message) {
  return {
    content: message,
    embeds: [
      {
        title: "🧪 Webhook Test",
        description: "This is a test message from test-webhook.mjs",
        color: 3066993, // 緑色
        fields: [
          { name: "Script", value: "test-webhook.mjs", inline: true },
          { name: "Status", value: "✅ Working", inline: true },
          { name: "Timestamp", value: new Date().toISOString(), inline: false },
        ],
        footer: {
          text: "GitHub Actions Webhook Tester",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

// MS Teams用ペイロード生成
function createTeamsPayload(message) {
  return {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    summary: "Webhook Test",
    themeColor: "0078D4",
    title: "🧪 Webhook Test",
    sections: [
      {
        activityTitle: message,
        activitySubtitle: "test-webhook.mjs",
        facts: [
          { name: "Status", value: "✅ Working" },
          { name: "Timestamp", value: new Date().toISOString() },
        ],
        markdown: true,
      },
    ],
  };
}

// Webhookにリクエスト送信
function sendWebhook(url, payload) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const payloadString = JSON.stringify(payload);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payloadString),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, body: data });
        } else {
          reject(
            new Error(`Request failed with status ${res.statusCode}: ${data}`),
          );
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(payloadString);
    req.end();
  });
}

// URL検証
function validateWebhookUrl(url, expectedType) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:") {
      throw new Error("Webhook URL must use HTTPS protocol");
    }

    const detectedType = detectWebhookType(url);

    if (expectedType && expectedType !== detectedType) {
      throw new Error(
        `URL appears to be ${detectedType} webhook, but ${expectedType} was specified`,
      );
    }

    return detectedType;
  } catch (error) {
    throw new Error(`Invalid webhook URL: ${error.message}`);
  }
}

// メイン処理
async function main() {
  const args = process.argv.slice(2);

  // 引数解析
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
GitHub Actions Webhook Tester

Usage:
  node test-webhook.mjs <webhook-url> [message]
  node test-webhook.mjs --slack <webhook-url> [message]
  node test-webhook.mjs --discord <webhook-url> [message]
  node test-webhook.mjs --teams <webhook-url> [message]

Options:
  --slack     Force Slack webhook format
  --discord   Force Discord webhook format
  --teams     Force MS Teams webhook format
  --help, -h  Show this help message

Examples:
  node test-webhook.mjs https://hooks.slack.com/services/T00/B00/XXX "Test message"
  node test-webhook.mjs --discord https://discord.com/api/webhooks/... "Test message"
  node test-webhook.mjs --teams https://outlook.office.com/webhook/... "Test message"
    `);
    process.exit(0);
  }

  let webhookType = null;
  let webhookUrl = null;
  let message = DEFAULT_MESSAGE;

  // 引数処理
  if (args[0].startsWith("--")) {
    webhookType = args[0].replace("--", "");
    webhookUrl = args[1];
    message = args[2] || DEFAULT_MESSAGE;
  } else {
    webhookUrl = args[0];
    message = args[1] || DEFAULT_MESSAGE;
  }

  if (!webhookUrl) {
    console.error("❌ Error: Webhook URL is required");
    process.exit(1);
  }

  try {
    console.log("🔍 Validating webhook URL...");
    const detectedType = validateWebhookUrl(webhookUrl, webhookType);

    if (!webhookType) {
      webhookType = detectedType;
    }

    console.log(`✅ Detected webhook type: ${webhookType}`);
    console.log(`📤 Sending test message: "${message}"\n`);

    // ペイロード生成
    let payload;
    switch (webhookType) {
      case "slack":
        payload = createSlackPayload(message);
        break;
      case "discord":
        payload = createDiscordPayload(message);
        break;
      case "teams":
        payload = createTeamsPayload(message);
        break;
      default:
        throw new Error(
          `Unsupported webhook type: ${webhookType}. Supported types: slack, discord, teams`,
        );
    }

    // リクエスト送信
    console.log("⏳ Sending request...");
    const startTime = Date.now();
    const response = await sendWebhook(webhookUrl, payload);
    const duration = Date.now() - startTime;

    console.log(`\n✅ Success! Message sent to ${webhookType} webhook`);
    console.log(`📊 Response status: ${response.statusCode}`);
    console.log(`⏱️  Response time: ${duration}ms`);

    if (response.body) {
      console.log(`📄 Response body: ${response.body}`);
    }

    console.log("\n✨ Webhook is working correctly!");
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);

    if (error.message.includes("ENOTFOUND")) {
      console.error("💡 Tip: Check if the webhook URL hostname is correct");
    } else if (error.message.includes("status 404")) {
      console.error(
        "💡 Tip: Webhook URL may be expired or deleted. Create a new webhook.",
      );
    } else if (error.message.includes("status 400")) {
      console.error(
        "💡 Tip: Payload format may be incorrect. Check webhook type specification.",
      );
    } else if (
      error.message.includes("status 401") ||
      error.message.includes("status 403")
    ) {
      console.error(
        "💡 Tip: Webhook URL may be invalid or missing required authentication.",
      );
    } else if (error.message.includes("status 429")) {
      console.error(
        "💡 Tip: Rate limit exceeded. Wait a moment and try again.",
      );
    }

    process.exit(1);
  }
}

// スクリプト実行
main();
