#!/usr/bin/env node

/**
 * domain-modeling スキル使用ログ記録スクリプト
 *
 * 使用方法:
 *   node log_usage.mjs <action> [options]
 *
 * アクション:
 *   record   - 使用実績を記録
 *   feedback - フィードバックを記録
 *   stats    - 統計情報を表示
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = dirname(__dirname);
const LOGS_PATH = join(SKILL_DIR, "LOGS.md");
const EVALS_PATH = join(SKILL_DIR, "EVALS.json");

/**
 * 使用実績を記録
 */
function recordUsage(taskName, success, notes = "") {
  const timestamp = new Date().toISOString();

  const logEntry = `
## ${timestamp}

- **Task**: ${taskName}
- **結果**: ${success ? "✅ 成功" : "❌ 失敗"}
- **備考**: ${notes || "なし"}
`;

  let logsContent = "";
  if (existsSync(LOGS_PATH)) {
    logsContent = readFileSync(LOGS_PATH, "utf-8");
  }
  writeFileSync(LOGS_PATH, logsContent + logEntry);

  if (existsSync(EVALS_PATH)) {
    const evals = JSON.parse(readFileSync(EVALS_PATH, "utf-8"));
    evals.metrics.total_usage_count++;
    if (success) {
      evals.metrics.success_count++;
    } else {
      evals.metrics.failure_count++;
    }
    evals.metrics.last_evaluated = timestamp;

    if (evals.task_metrics && evals.task_metrics[taskName]) {
      evals.task_metrics[taskName].uses++;
      if (success) {
        evals.task_metrics[taskName].successes++;
      } else {
        evals.task_metrics[taskName].failures++;
      }
    }

    writeFileSync(EVALS_PATH, JSON.stringify(evals, null, 2) + "\n");
  }

  console.log(`✅ 使用実績を記録しました: ${taskName}`);
}

/**
 * フィードバックを記録
 */
function recordFeedback(type, message) {
  const timestamp = new Date().toISOString();

  const feedbackEntry = `
## フィードバック: ${timestamp}

- **種別**: ${type}
- **内容**: ${message}
`;

  let logsContent = "";
  if (existsSync(LOGS_PATH)) {
    logsContent = readFileSync(LOGS_PATH, "utf-8");
  }
  writeFileSync(LOGS_PATH, logsContent + feedbackEntry);

  if (existsSync(EVALS_PATH)) {
    const evals = JSON.parse(readFileSync(EVALS_PATH, "utf-8"));
    if (evals.feedback_summary) {
      if (type === "positive") evals.feedback_summary.positive_count++;
      else if (type === "negative") evals.feedback_summary.negative_count++;
      else evals.feedback_summary.neutral_count++;

      evals.feedback_summary.recent_feedback.unshift({
        type,
        message,
        timestamp,
      });
      evals.feedback_summary.recent_feedback =
        evals.feedback_summary.recent_feedback.slice(0, 10);
    }
    writeFileSync(EVALS_PATH, JSON.stringify(evals, null, 2) + "\n");
  }

  console.log(`✅ フィードバックを記録しました: ${type}`);
}

/**
 * 統計情報を表示
 */
function showStats() {
  if (!existsSync(EVALS_PATH)) {
    console.log("❌ EVALS.json が見つかりません");
    return;
  }

  const evals = JSON.parse(readFileSync(EVALS_PATH, "utf-8"));
  const successRate =
    evals.metrics.total_usage_count > 0
      ? (
          (evals.metrics.success_count / evals.metrics.total_usage_count) *
          100
        ).toFixed(1)
      : 0;

  console.log(`
📊 domain-modeling スキル統計

現在レベル: ${evals.current_level}
総使用回数: ${evals.metrics.total_usage_count}
成功回数: ${evals.metrics.success_count}
失敗回数: ${evals.metrics.failure_count}
成功率: ${successRate}%
最終評価: ${evals.metrics.last_evaluated || "未評価"}

Task別統計:
${Object.entries(evals.task_metrics || {})
  .map(
    ([name, m]) =>
      `  - ${name}: ${m.uses}回 (成功: ${m.successes}, 失敗: ${m.failures})`,
  )
  .join("\n")}
`);
}

// メイン処理
const args = process.argv.slice(2);
const action = args[0];

switch (action) {
  case "record":
    recordUsage(args[1] || "unknown", args[2] === "true", args[3] || "");
    break;
  case "feedback":
    recordFeedback(args[1] || "neutral", args[2] || "");
    break;
  case "stats":
    showStats();
    break;
  default:
    console.log(`
使用方法:
  node log_usage.mjs record <task_name> <success:true|false> [notes]
  node log_usage.mjs feedback <positive|negative|neutral> <message>
  node log_usage.mjs stats
`);
}
