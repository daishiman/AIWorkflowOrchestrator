#!/usr/bin/env node

/**
 * スキル使用記録スクリプト
 *
 * 使用ログを LOGS.md に記録し、EVALS.json があればメトリクスを更新する。
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;

function showHelp() {
  console.log(`
Usage: node scripts/log_usage.mjs [options]

Options:
  --result <success|failure>  実行結果（必須）
  --phase <name>              実行したPhase名（任意）
  --agent <name>              実行したエージェント名（任意）
  --notes <text>              追加のフィードバックメモ（任意）
  -h, --help                  このヘルプを表示
`);
}

function ensureLogsFile(logsPath) {
  if (existsSync(logsPath)) {
    return readFileSync(logsPath, "utf-8");
  }

  const today = new Date().toISOString().split("T")[0];
  const initial = `# 使用ログ: retry-strategies\n\n## 概要\n\nこのファイルはスキルの使用履歴とフィードバックを記録します。\n\n## 記録形式\n\n\`\`\`\n## YYYY-MM-DD HH:MM\n- **結果**: success | failure\n- **Phase**: Phase X\n- **エージェント**: agent-name\n- **ノート**: 追加メモ\n\`\`\`\n\n## 使用履歴\n\n<!-- LOGS -->\n\n---\n\n_最終更新: ${today}_\n`;

  writeFileSync(logsPath, initial, "utf-8");
  return initial;
}

function updateLastUpdated(content, date) {
  if (content.includes("_最終更新:")) {
    return content.replace(/_最終更新: .*_/m, `_最終更新: ${date}_`);
  }
  return `${content}\n_最終更新: ${date}_\n`;
}

function appendLog(content, entry) {
  if (content.includes("<!-- LOGS -->")) {
    return content.replace("<!-- LOGS -->", `${entry}\n\n<!-- LOGS -->`);
  }
  return `${content}\n${entry}\n`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const getArg = (name) => {
    const index = args.indexOf(name);
    return index !== -1 && args[index + 1] ? args[index + 1] : null;
  };

  const result = getArg("--result");
  const phase = getArg("--phase") || "unknown";
  const agent = getArg("--agent") || "unknown";
  const notes = getArg("--notes") || "";

  if (!result || !["success", "failure"].includes(result)) {
    console.error("Error: --result は success または failure を指定してください");
    process.exit(EXIT_ARGS_ERROR);
  }

  const timestamp = new Date();
  const date = timestamp.toISOString().split("T")[0];
  const timeLabel = timestamp.toISOString().replace("T", " ").slice(0, 16);

  const logsPath = join(SKILL_DIR, "LOGS.md");
  const logsContent = ensureLogsFile(logsPath);

  const logEntry = `## ${timeLabel}\n- **結果**: ${result}\n- **Phase**: ${phase}\n- **エージェント**: ${agent}\n- **ノート**: ${notes || "なし"}`;

  try {
    let updatedLogs = appendLog(logsContent, logEntry);
    updatedLogs = updateLastUpdated(updatedLogs, date);
    writeFileSync(logsPath, updatedLogs, "utf-8");
    console.log("✓ LOGS.md に記録を追記しました");
  } catch (error) {
    console.error(`Error: LOGS.md の更新に失敗しました: ${error.message}`);
    process.exit(EXIT_ERROR);
  }

  const evalsPath = join(SKILL_DIR, "EVALS.json");
  if (existsSync(evalsPath)) {
    try {
      const evalsData = JSON.parse(readFileSync(evalsPath, "utf-8"));

      if (evalsData.metrics) {
        evalsData.metrics.total_usage_count =
          (evalsData.metrics.total_usage_count || 0) + 1;
        if (result === "success") {
          evalsData.metrics.success_count =
            (evalsData.metrics.success_count || 0) + 1;
        } else {
          evalsData.metrics.failure_count =
            (evalsData.metrics.failure_count || 0) + 1;
        }
        evalsData.metrics.last_evaluated = timestamp.toISOString();
      }

      writeFileSync(evalsPath, JSON.stringify(evalsData, null, 2), "utf-8");
      console.log("✓ EVALS.json を更新しました");
    } catch (error) {
      console.error(`Error: EVALS.json の処理に失敗しました: ${error.message}`);
      process.exit(EXIT_ERROR);
    }
  } else {
    console.log("ℹ️  EVALS.json が見つからないため更新をスキップしました");
  }

  process.exit(EXIT_SUCCESS);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(EXIT_ERROR);
});
