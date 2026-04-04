/**
 * SlackWebhookService - Slack Incoming Webhook実装
 *
 * Node.js標準の https モジュールを使用（外部依存なし）。
 * Slack Blocks Kit対応。
 */

import https from "https";
import type {
  ISlackService,
  SlackBlock,
  SlackMessage,
  SlackSendResult,
  SlackTestResult,
} from "./ISlackService";

const SLACK_MESSAGE_MAX_LENGTH = 3000;
const DEFAULT_TIMEOUT_MS = 15_000;

interface SlackWebhookPayload {
  text: string;
  blocks?: SlackBlock[];
}

/**
 * Slack Incoming Webhook にHTTP POSTリクエストを送信する
 */
function postToSlack(
  webhookUrl: string,
  payload: SlackWebhookPayload,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let url: URL;
    try {
      url = new URL(webhookUrl);
    } catch {
      reject(new Error("無効なWebhook URLです"));
      return;
    }

    if (url.protocol !== "https:") {
      reject(new Error("Webhook URLはhttpsである必要があります"));
      return;
    }

    const body = JSON.stringify(payload);
    const options: https.RequestOptions = {
      hostname: url.hostname,
      path: url.pathname + (url.search || ""),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
      timeout: timeoutMs,
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk: Buffer) => {
        data += chunk.toString();
      });
      res.on("end", () => {
        if (res.statusCode === 200 && data.trim() === "ok") {
          resolve();
        } else {
          const errorMessage = mapSlackError(res.statusCode ?? 0, data.trim());
          reject(new Error(errorMessage));
        }
      });
    });

    req.on("error", (err: Error) => {
      reject(new Error(`ネットワークエラー: ${err.message}`));
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`タイムアウト (${timeoutMs}ms)`));
    });

    req.write(body);
    req.end();
  });
}

/**
 * Slackエラーコードを日本語メッセージにマッピング
 */
function mapSlackError(statusCode: number, body: string): string {
  if (body === "invalid_payload") {
    return "ペイロードが無効です。メッセージ形式を確認してください";
  }
  if (body === "no_service" || statusCode === 403) {
    return "Webhook URLが無効または失効しています。Slackアプリの設定を確認してください";
  }
  if (body === "action_prohibited") {
    return "このチャンネルへの投稿が禁止されています";
  }
  if (body === "channel_not_found") {
    return "チャンネルが見つかりません";
  }
  if (statusCode === 429) {
    return "レート制限に達しました。しばらく待ってから再試行してください";
  }
  return `Slack APIエラー: HTTP ${statusCode} - "${body}"`;
}

/**
 * テキストメッセージをSlackペイロードに変換
 */
function buildPayload(message: SlackMessage): SlackWebhookPayload {
  const text =
    message.text.length > SLACK_MESSAGE_MAX_LENGTH
      ? message.text.slice(0, SLACK_MESSAGE_MAX_LENGTH - 50) + "\n..._（省略）_"
      : message.text;

  if (message.type === "blocks") {
    return {
      text,
      blocks: message.blocks,
    };
  }

  return { text };
}

/**
 * テスト用メッセージペイロード
 */
function buildTestPayload(): SlackWebhookPayload {
  return {
    text: "✅ AI Workflow Orchestrator - 接続テスト成功",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "✅ *接続テスト成功！*\n_AI Workflow Orchestrator_ からの接続が確認されました。",
        },
      },
    ],
  };
}

export class SlackWebhookService implements ISlackService {
  async send(
    message: SlackMessage,
    webhookUrl?: string,
  ): Promise<SlackSendResult> {
    const url = webhookUrl;
    if (!url) {
      return {
        success: false,
        error: "Webhook URLが指定されていません",
      };
    }

    const payload = buildPayload(message);

    try {
      await postToSlack(url, payload);
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err.message : "不明なエラー";
      return { success: false, error };
    }
  }

  async test(webhookUrl: string): Promise<SlackTestResult> {
    const start = Date.now();
    const payload = buildTestPayload();

    try {
      await postToSlack(webhookUrl, payload);
      return {
        success: true,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : "不明なエラー";
      return { success: false, error };
    }
  }
}
