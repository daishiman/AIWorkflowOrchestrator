#!/usr/bin/env node
/**
 * 環境変数・依存パッケージのセットアップ確認スクリプト
 *
 * 使用方法:
 *   node .claude/skills/google/scripts/setup_check.js
 */

import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(__dirname, "..");

// ============================================================
// チェック定義
// ============================================================
const checks = [
  // ---- Node.js バージョン ----
  {
    name: "Node.js バージョン",
    check: () => {
      const [major] = process.versions.node.split(".").map(Number);
      return major >= 18;
    },
    message: () => `現在: Node.js ${process.versions.node}（必要: >=18）`,
    fix: "Node.js 18 以上をインストールしてください: https://nodejs.org/",
  },
  // ---- googleapis インストール済み ----
  {
    name: "googleapis パッケージ",
    check: () => existsSync(join(SKILL_ROOT, "node_modules", "googleapis")),
    message: () => "node_modules/googleapis が見つかりません",
    fix: `cd ${SKILL_ROOT} && pnpm install`,
  },
  // ---- Google 認証情報 ----
  {
    name: "Google 認証情報",
    check: () => {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      }
      if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return true;
      return !!(
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_REFRESH_TOKEN
      );
    },
    message: () => {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return `ファイルが存在しません: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`;
      }
      return "Google 認証環境変数が設定されていません";
    },
    fix:
      "references/google-calendar-setup.md を参照してサービスアカウントまたは OAuth を設定してください",
  },
  // ---- カレンダー ID ----
  {
    name: "GOOGLE_CALENDAR_ID",
    check: () => !!process.env.GOOGLE_CALENDAR_ID,
    message: () => "GOOGLE_CALENDAR_ID が設定されていません",
    fix: "export GOOGLE_CALENDAR_ID=primary  # または実際のカレンダー ID",
  },
  // ---- Slack 設定 ----
  {
    name: "Slack 設定",
    check: () => {
      const hasWebhook = !!process.env.SLACK_WEBHOOK_URL;
      const hasBotToken =
        !!process.env.SLACK_BOT_TOKEN && !!process.env.SLACK_CHANNEL_ID;
      return hasWebhook || hasBotToken;
    },
    message: () => "SLACK_WEBHOOK_URL または SLACK_BOT_TOKEN が設定されていません",
    fix: "references/slack-setup.md を参照して Webhook URL または Bot Token を設定してください",
  },
];

// ============================================================
// チェック実行
// ============================================================
let allPassed = true;
const results = [];

for (const item of checks) {
  let passed = false;
  let errMsg = "";
  try {
    passed = item.check();
  } catch (e) {
    passed = false;
    errMsg = e.message;
  }
  results.push({ ...item, passed, errMsg });
  if (!passed) allPassed = false;
}

// ============================================================
// 結果表示
// ============================================================
console.log("\n🔍 Google Calendar → Slack スキル セットアップチェック\n");

for (const r of results) {
  const icon = r.passed ? "✅" : "❌";
  console.log(`${icon} ${r.name}`);
  if (!r.passed) {
    const detail = r.errMsg || r.message();
    console.log(`   問題: ${detail}`);
    console.log(`   対処: ${r.fix}`);
    console.log("");
  }
}

// ---- 現在の設定サマリー ----
console.log("\n─── 現在の設定 ───────────────────────────────");
const authMethod = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? `サービスアカウント (ファイル): ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`
  : process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    ? "サービスアカウント (JSON Base64)"
    : process.env.GOOGLE_CLIENT_ID
      ? "OAuth 2.0"
      : "（未設定）";
console.log(`Google 認証 : ${authMethod}`);
console.log(`カレンダー ID: ${process.env.GOOGLE_CALENDAR_ID || "（未設定）"}`);
const slackMethod = process.env.SLACK_WEBHOOK_URL
  ? "Incoming Webhook"
  : process.env.SLACK_BOT_TOKEN
    ? `Bot Token (Channel: ${process.env.SLACK_CHANNEL_ID || "未設定"})`
    : "（未設定）";
console.log(`Slack 設定  : ${slackMethod}`);
console.log("──────────────────────────────────────────────\n");

if (allPassed) {
  console.log("🎉 すべてのチェックが通過しました！\n");
  console.log("実行コマンド:");
  console.log("  node .claude/skills/google/scripts/daily_schedule.js --dry-run");
  console.log("  node .claude/skills/google/scripts/daily_schedule.js\n");
  process.exit(0);
} else {
  console.log("⚠️  設定に問題があります。上記の対処方法を参照してください。\n");
  process.exit(1);
}
