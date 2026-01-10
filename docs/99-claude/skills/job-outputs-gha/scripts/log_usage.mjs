#!/usr/bin/env node

/**
 * スキル使用ログ記録スクリプト
 * job-outputs-gha スキル用
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = dirname(__dirname);
const LOGS_FILE = join(SKILL_DIR, "LOGS.md");

function parseArgs(args) {
  const parsed = { result: null, phase: null, notes: null, help: false };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--result":
        parsed.result = args[++i];
        break;
      case "--phase":
        parsed.phase = args[++i];
        break;
      case "--notes":
        parsed.notes = args[++i];
        break;
      case "--help":
        parsed.help = true;
        break;
    }
  }
  return parsed;
}

function showHelp() {
  console.log(`
使用方法: node scripts/log_usage.mjs [オプション]

オプション:
  --result <success|failure>  実行結果
  --phase <phase-name>        実行フェーズ名
  --notes <text>              追加メモ（任意）
  --help                      このヘルプを表示

例:
  node scripts/log_usage.mjs --result success --phase "Phase 1" --notes "outputs定義完了"
`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (!args.result || !args.phase) {
    console.error("エラー: --result と --phase は必須です");
    showHelp();
    process.exit(1);
  }

  let content = existsSync(LOGS_FILE)
    ? readFileSync(LOGS_FILE, "utf-8")
    : "# 使用ログ\n\n";

  const entry = `
### ${new Date().toISOString()}
- フェーズ: ${args.phase}
- 結果: ${args.result}
- メモ: ${args.notes || "なし"}
`;

  content += entry;
  writeFileSync(LOGS_FILE, content);
  console.log(`ログ記録完了: ${args.result} (フェーズ: "${args.phase}")`);
}

main();
