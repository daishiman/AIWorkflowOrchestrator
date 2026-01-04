#!/usr/bin/env node

/**
 * スキル使用記録スクリプト
 *
 * 実行結果を LOGS.md に追記します。
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parseArgs } from "node:util";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");
const LOGS_PATH = join(SKILL_DIR, "LOGS.md");

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
  --notes <text>              追加メモ（任意）
  -h, --help                  このヘルプを表示
  `);
}

function ensureLogFile() {
  if (!existsSync(LOGS_PATH)) {
    const header = "# risk-management usage logs\n\n";
    writeFileSync(LOGS_PATH, header, "utf-8");
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      result: { type: "string" },
      phase: { type: "string" },
      agent: { type: "string" },
      notes: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const result = values.result;
  const phase = values.phase || "unknown";
  const agent = values.agent || "unknown";
  const notes = values.notes || "";

  if (!result || !["success", "failure"].includes(result)) {
    console.error("Error: --result は success または failure を指定してください");
    process.exit(EXIT_ARGS_ERROR);
  }

  const timestamp = new Date().toISOString();
  const logEntry = `\n## [${timestamp}]\n\n- 実行者: ${agent}\n- Phase: ${phase}\n- 結果: ${result}\n- フィードバック: ${notes || "なし"}\n`;

  try {
    ensureLogFile();
    const content = readFileSync(LOGS_PATH, "utf-8");
    writeFileSync(LOGS_PATH, content + logEntry, "utf-8");
    console.log("✓ LOGS.md に記録を追記しました");
  } catch (err) {
    console.error(`Error: LOGS.md の更新に失敗しました: ${err.message}`);
    process.exit(EXIT_ERROR);
  }

  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
