#!/usr/bin/env node

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
  --agent <name>              実行したエージェント名（任意）
  --notes <text>              追加のフィードバックメモ（任意）
  -h, --help                  このヘルプを表示
  `);
}

function fail(message, code) {
  console.error(message);
  process.exit(code);
}

function getArg(args, name) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
}

function ensureLogFile(path) {
  if (!existsSync(path)) {
    const header = "# Usage Logs\n\n（ログエントリはここに追記されます）\n";
    writeFileSync(path, header, "utf-8");
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const result = getArg(args, "--result");
  const phase = getArg(args, "--phase") || "unknown";
  const agent = getArg(args, "--agent") || "unknown";
  const notes = getArg(args, "--notes") || "";

  if (!result || !["success", "failure"].includes(result)) {
    fail("Error: --result は success または failure を指定してください", EXIT_ARGS_ERROR);
  }

  const timestamp = new Date().toISOString();
  const logsPath = join(SKILL_DIR, "LOGS.md");

  try {
    ensureLogFile(logsPath);
    const logsContent = readFileSync(logsPath, "utf-8");
    const logEntry = `
## [実行日時: ${timestamp}]

- 実行者: ${agent}
- Phase: ${phase}
- 結果: ${result}
- フィードバック: ${notes || "なし"}

---
`;
    const updatedLogs = logsContent.includes("（ログエントリはここに追記されます）")
      ? logsContent.replace(
          "（ログエントリはここに追記されます）",
          `${logEntry}\n（ログエントリはここに追記されます）`,
        )
      : `${logsContent.trim()}\n${logEntry}`;

    writeFileSync(logsPath, `${updatedLogs}\n`, "utf-8");
    console.log("✓ LOGS.md に記録を追記しました");
  } catch (err) {
    fail(`Error: LOGS.md の更新に失敗しました: ${err.message}`, EXIT_ERROR);
  }

  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  fail(err.message || "Unexpected error", EXIT_ERROR);
});
