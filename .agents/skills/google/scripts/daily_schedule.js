#!/usr/bin/env node
/**
 * Google Calendar → Slack 予定通知 メインスクリプト
 *
 * 使用方法:
 *   node daily_schedule.js                         # 今日の予定を Slack に送信
 *   node daily_schedule.js --dry-run               # プレビューのみ（送信しない）
 *   node daily_schedule.js --date 2026-04-10       # 特定日の予定を取得
 *   node daily_schedule.js --calendar primary      # カレンダー ID を上書き
 *   node daily_schedule.js --max-results 30        # 取得件数上限を指定
 */

import { fetchTodayEvents } from "./fetch_calendar.js";
import { formatScheduleMessage, postToSlack } from "./post_to_slack.js";

// ============================================================
// CLI 引数パース
// ============================================================
const args = process.argv.slice(2);

function getArg(flag) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  const prefixed = args.find((a) => a.startsWith(`${flag}=`));
  if (prefixed) return prefixed.split("=").slice(1).join("=");
  return null;
}

const isDryRun = args.includes("--dry-run");
const dateArg = getArg("--date");
const calendarArg = getArg("--calendar");
const maxResultsArg = getArg("--max-results");

// ============================================================
// 設定バリデーション
// ============================================================
function validateConfig(calendarId) {
  const errors = [];

  // Google 認証
  const hasServiceAccountFile = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasServiceAccountJson = !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const hasOAuth =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN;

  if (!hasServiceAccountFile && !hasServiceAccountJson && !hasOAuth) {
    errors.push(
      "Google 認証情報が設定されていません。\n" +
        "  → GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_SERVICE_ACCOUNT_JSON,\n" +
        "     または GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + GOOGLE_REFRESH_TOKEN"
    );
  }

  // カレンダー ID
  if (!calendarId) {
    errors.push(
      "GOOGLE_CALENDAR_ID が設定されていません。\n" +
        "  → 例: export GOOGLE_CALENDAR_ID=primary"
    );
  }

  // Slack 設定（dry-run 時は不要）
  if (!isDryRun) {
    const hasWebhook = !!process.env.SLACK_WEBHOOK_URL;
    const hasBotToken =
      process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID;

    if (!hasWebhook && !hasBotToken) {
      errors.push(
        "Slack 設定が見つかりません。\n" +
          "  → SLACK_WEBHOOK_URL または SLACK_BOT_TOKEN + SLACK_CHANNEL_ID"
      );
    }
  }

  if (errors.length > 0) {
    console.error("❌ 設定エラー:\n");
    errors.forEach((e) => console.error(`  • ${e}\n`));
    console.error(
      "セットアップガイド:\n" +
        "  references/google-calendar-setup.md\n" +
        "  references/slack-setup.md"
    );
    process.exit(1);
  }
}

// ============================================================
// メイン処理
// ============================================================
async function main() {
  const calendarId = calendarArg ?? process.env.GOOGLE_CALENDAR_ID ?? "";
  const maxResults = maxResultsArg ? parseInt(maxResultsArg, 10) : 50;

  // 対象日付
  const targetDate = dateArg ? new Date(dateArg) : new Date();
  if (isNaN(targetDate.getTime())) {
    console.error(`❌ 日付のフォーマットが不正です: ${dateArg}`);
    console.error("  例: --date 2026-04-10");
    process.exit(1);
  }

  validateConfig(calendarId);

  const dateLabel = targetDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  console.log(`\n📅 Google Calendar → Slack 予定通知`);
  console.log(`   対象日  : ${dateLabel}`);
  console.log(`   カレンダー: ${calendarId}`);
  if (isDryRun) console.log(`   モード   : ドライラン（Slack 送信なし）`);
  console.log("");

  // ----- Phase 1: カレンダー取得 -----
  console.log("🔍 カレンダーを取得中...");
  const events = await fetchTodayEvents(calendarId, targetDate, maxResults);
  console.log(`✅ ${events.length} 件のイベントを取得しました`);

  if (events.length > 0) {
    console.log("");
    events.forEach((ev, i) => {
      if (ev.isAllDay) {
        console.log(`  ${i + 1}. [終日] ${ev.title}`);
      } else {
        const s = new Date(ev.start).toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const e = new Date(ev.end).toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        });
        console.log(`  ${i + 1}. ${s}〜${e}  ${ev.title}`);
      }
    });
    console.log("");
  }

  // ----- Phase 2: メッセージ生成 -----
  const message = formatScheduleMessage(events, targetDate);

  // ----- Phase 3: Slack 送信 or プレビュー -----
  if (isDryRun) {
    console.log("─────────────────── Slack メッセージプレビュー ───────────────────");
    console.log(message.text);
    console.log("──────────────────────────────────────────────────────────────────");
    console.log("\n（--dry-run モードのため Slack への送信はスキップされました）\n");
  } else {
    console.log("📤 Slack に送信中...");
    await postToSlack(message);
    console.log("✅ Slack への送信が完了しました\n");
  }
}

main().catch((err) => {
  console.error("\n❌ 予期しないエラーが発生しました:");
  console.error(err.message);
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
});
