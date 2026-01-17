#!/usr/bin/env node

/**
 * スキル実行記録スクリプト
 *
 * Stepごとの実行ログをLOGS.mdへ追記します。
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
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
  --phase <name>              実行したStep/Phase名（任意）
  --notes <text>              追加メモ（任意）
  -h, --help                  このヘルプを表示
  `);
}

function ensureLogsFile(path) {
  if (existsSync(path)) {
    return;
  }
  const header = "# 実行ログ\n\n（ログエントリはここに追記されます）\n";
  writeFileSync(path, header, "utf-8");
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
  const notes = getArg("--notes") || "";

  if (!result || !["success", "failure"].includes(result)) {
    console.error(
      "Error: --result は success または failure を指定してください",
    );
    process.exit(EXIT_ARGS_ERROR);
  }

  const timestamp = new Date().toISOString();
  const logsPath = join(SKILL_DIR, "LOGS.md");

  try {
    ensureLogsFile(logsPath);
    const logsContent = readFileSync(logsPath, "utf-8");
    const entry = `\n## [実行日時: ${timestamp}]\n\n- Phase: ${phase}\n- 結果: ${result}\n- メモ: ${notes || "なし"}\n\n---\n`;
    const updatedLogs = logsContent.replace(
      "（ログエントリはここに追記されます）",
      `${entry}\n（ログエントリはここに追記されます）`,
    );
    writeFileSync(logsPath, updatedLogs, "utf-8");
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
