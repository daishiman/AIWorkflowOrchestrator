/**
 * Slack 投稿・メッセージフォーマット
 *
 * - formatScheduleMessage(): CalendarEvent 配列 → Slack Block Kit ペイロード
 * - postToSlack():            Slack Incoming Webhook または Bot API へ POST
 */

/** 曜日文字列 */
const DAY_OF_WEEK = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * 時刻文字列をフォーマットする（HH:MM 形式）
 * @param {string}  isoString - ISO 8601 日時文字列
 * @returns {string}
 */
function formatTime(isoString) {
  const date = new Date(isoString);
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * 説明文を Slack 表示用に短縮する
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function truncate(text, maxLength = 120) {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "…" : text;
}

/**
 * CalendarEvent 配列を Slack メッセージペイロードに変換する
 *
 * @param {import('./fetch_calendar.js').CalendarEvent[]} events
 * @param {Date} targetDate
 * @returns {{ text: string, blocks: object[] }}
 */
export function formatScheduleMessage(events, targetDate = new Date()) {
  const y = targetDate.getFullYear();
  const m = (targetDate.getMonth() + 1).toString().padStart(2, "0");
  const d = targetDate.getDate().toString().padStart(2, "0");
  const dow = DAY_OF_WEEK[targetDate.getDay()];
  const dateLabel = `${y}/${m}/${d}(${dow})`;
  const generatedAt = new Date().toLocaleString("ja-JP");

  // ========== 予定なし ==========
  if (events.length === 0) {
    return {
      text: `📅 *${dateLabel} の予定*\n本日の予定はありません 🎉`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `📅 ${dateLabel} の予定`,
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "本日の予定はありません 🎉",
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Google Calendar から自動取得 | ${generatedAt}`,
            },
          ],
        },
      ],
    };
  }

  // ========== 予定あり ==========
  const eventBlocks = events.map((event) => {
    let timeStr;
    if (event.isAllDay) {
      timeStr = "📌 終日";
    } else {
      const startT = formatTime(event.start);
      const endT = formatTime(event.end);
      timeStr = `🕐 *${startT}〜${endT}*`;
    }

    // メインテキスト
    let text = `${timeStr}  *${event.title}*`;

    // 場所
    if (event.location) {
      text += `\n📍 ${event.location}`;
    }

    // 説明（短縮）
    const desc = truncate(event.description);
    if (desc) {
      text += `\n💬 ${desc}`;
    }

    // リンク（Meet / カレンダー詳細）
    const links = [];
    if (event.hangoutLink) {
      links.push(`<${event.hangoutLink}|🎥 Google Meet>`);
    }
    if (event.htmlLink) {
      links.push(`<${event.htmlLink}|📋 詳細>`);
    }
    if (links.length > 0) {
      text += `\n${links.join("  |  ")}`;
    }

    return {
      type: "section",
      text: { type: "mrkdwn", text },
    };
  });

  // フォールバック用プレーンテキスト
  const plainLines = events.map((event) => {
    if (event.isAllDay) return `• [終日] ${event.title}`;
    const s = formatTime(event.start);
    const e = formatTime(event.end);
    return `• ${s}〜${e}  ${event.title}`;
  });
  const fallbackText = `📅 ${dateLabel} の予定 (${events.length}件)\n${plainLines.join("\n")}`;

  return {
    text: fallbackText,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `📅 ${dateLabel} の予定 (${events.length}件)`,
          emoji: true,
        },
      },
      { type: "divider" },
      ...eventBlocks,
      { type: "divider" },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Google Calendar から自動取得 | ${generatedAt}`,
          },
        ],
      },
    ],
  };
}

/**
 * Slack にメッセージを投稿する
 *
 * 優先順位:
 * 1. SLACK_WEBHOOK_URL（Incoming Webhook）
 * 2. SLACK_BOT_TOKEN + SLACK_CHANNEL_ID（Bot API）
 *
 * @param {{ text: string, blocks: object[] }} message
 * @returns {Promise<void>}
 */
export async function postToSlack(message) {
  // --- Incoming Webhook ---
  if (process.env.SLACK_WEBHOOK_URL) {
    const res = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message.text, blocks: message.blocks }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Slack Webhook エラー (HTTP ${res.status}): ${body}`);
    }
    return;
  }

  // --- Bot API (chat.postMessage) ---
  if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID) {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel: process.env.SLACK_CHANNEL_ID,
        text: message.text,
        blocks: message.blocks,
      }),
    });

    if (!res.ok) {
      throw new Error(`Slack Bot API エラー (HTTP ${res.status})`);
    }

    const data = await res.json();
    if (!data.ok) {
      throw new Error(`Slack API エラー: ${data.error}`);
    }
    return;
  }

  throw new Error(
    "Slack 設定が見つかりません。\n" +
      "SLACK_WEBHOOK_URL または SLACK_BOT_TOKEN + SLACK_CHANNEL_ID を設定してください。"
  );
}
