#!/usr/bin/env node

/**
 * スキル使用記録スクリプト
 *
 * 要件トリアージスキルの使用実績を記録する。
 * Phase 3完了後に呼び出すことを想定。
 */

import { appendFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");
const LOGS_DIR = join(SKILL_DIR, ".logs");

const EXIT_SUCCESS = 0;
const EXIT_ARGS_ERROR = 2;

function showHelp() {
  console.log(`
Usage: node scripts/log_usage.mjs [options]

Options:
  --result <success|failure>  実行結果（必須）
  --phase <name>              実行したPhase名（任意）
  --requirements <count>      トリアージした要件数（任意）
  --notes <text>              追加のメモ（任意）
  -h, --help                  このヘルプを表示

Examples:
  node scripts/log_usage.mjs --result success --phase "Phase 3" --requirements 15
  node scripts/log_usage.mjs --result failure --notes "ステークホルダー合意が得られなかった"
  `);
}

function main() {
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
  const requirements = getArg("--requirements") || "unknown";
  const notes = getArg("--notes") || "";

  if (!result || !["success", "failure"].includes(result)) {
    console.error(
      "Error: --result は success または failure を指定してください",
    );
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  const timestamp = new Date().toISOString();
  const date = timestamp.split("T")[0];

  // ログディレクトリを作成
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }

  // 日付別のログファイルに追記
  const logPath = join(LOGS_DIR, `${date}.log`);
  const logEntry = JSON.stringify({
    timestamp,
    result,
    phase,
    requirements,
    notes,
  });

  appendFileSync(logPath, logEntry + "\n", "utf-8");

  console.log(`✓ 使用記録を保存しました: ${logPath}`);
  console.log(`  結果: ${result}`);
  console.log(`  Phase: ${phase}`);
  console.log(`  要件数: ${requirements}`);
  if (notes) {
    console.log(`  メモ: ${notes}`);
  }

  process.exit(EXIT_SUCCESS);
}

main();
