#!/usr/bin/env node

/**
 * スキル使用記録スクリプト
 *
 * スキルの使用実績をLOGS.mdに記録します。
 * 各Phase完了時に呼び出すことを推奨します。
 *
 * 使用方法:
 *   node log_usage.mjs --result <success|failure> [options]
 *
 * オプション:
 *   --result <success|failure>  実行結果（必須）
 *   --phase <name>              実行したPhase名
 *   --notes <text>              追加のフィードバックメモ
 *   -h, --help                  ヘルプを表示
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
Usage: node log_usage.mjs [options]

Options:
  --result <success|failure>  実行結果（必須）
  --phase <name>              実行したPhase名（任意）
  --notes <text>              追加のフィードバックメモ（任意）
  -h, --help                  このヘルプを表示

Example:
  node log_usage.mjs --result success --phase "Phase 4: 実装" --notes "Workflow Repositoryを実装完了"
  `);
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  // 引数解析
  const getArg = (name) => {
    const index = args.indexOf(name);
    return index !== -1 && args[index + 1] ? args[index + 1] : null;
  };

  const result = getArg("--result");
  const phase = getArg("--phase") || "不明";
  const notes = getArg("--notes") || "";

  if (!result || !["success", "failure"].includes(result)) {
    console.error(
      "Error: --result は success または failure を指定してください",
    );
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  const timestamp = new Date().toISOString();
  const resultEmoji = result === "success" ? "✅" : "❌";

  // LOGS.md に追記
  const logsPath = join(SKILL_DIR, "LOGS.md");

  if (!existsSync(logsPath)) {
    console.error(`Error: LOGS.md が見つかりません: ${logsPath}`);
    process.exit(EXIT_ERROR);
  }

  const logEntry = `
## ${resultEmoji} [${timestamp}]

- Phase: ${phase}
- 結果: ${result}
- フィードバック: ${notes || "なし"}

---
`;

  try {
    const logsContent = readFileSync(logsPath, "utf-8");
    const updatedLogs = logsContent.replace(
      "（ログエントリはここに追記されます）",
      `${logEntry}\n（ログエントリはここに追記されます）`,
    );
    writeFileSync(logsPath, updatedLogs, "utf-8");
    console.log(`✓ LOGS.md に記録を追記しました`);
    console.log(`  - 日時: ${timestamp}`);
    console.log(`  - Phase: ${phase}`);
    console.log(`  - 結果: ${result}`);
  } catch (err) {
    console.error(`Error: LOGS.md の更新に失敗しました: ${err.message}`);
    process.exit(EXIT_ERROR);
  }

  process.exit(EXIT_SUCCESS);
}

main();
