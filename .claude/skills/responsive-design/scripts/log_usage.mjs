#!/usr/bin/env node
/**
 * responsive-design スキル使用記録スクリプト
 *
 * 用途: スキル実行結果をLOGS.mdに記録
 * 使用例: node scripts/log_usage.mjs --result success --phase "Phase 3" --notes "検証完了"
 */

import { appendFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");
const LOGS_PATH = join(SKILL_DIR, "LOGS.md");

// ヘルプ表示
function showHelp() {
  console.log(`
responsive-design スキル使用記録スクリプト

使用方法:
  node scripts/log_usage.mjs --result <success|failure|partial> [options]

必須オプション:
  --result <value>    実行結果 (success|failure|partial)

任意オプション:
  --phase <value>     実行フェーズ (例: "Phase 1", "Phase 2", "Phase 3")
  --agent <value>     使用エージェント (例: "analyze-context", "implement-design")
  --notes <value>     補足メモ
  -h, --help          このヘルプを表示

例:
  node scripts/log_usage.mjs --result success --phase "Phase 3" --notes "全ブレークポイントで検証完了"
  node scripts/log_usage.mjs --result partial --agent "implement-design" --notes "タブレット対応のみ完了"
`);
}

// 引数パース
function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-h" || arg === "--help") {
      result.help = true;
    } else if (arg === "--result" && args[i + 1]) {
      result.result = args[++i];
    } else if (arg === "--phase" && args[i + 1]) {
      result.phase = args[++i];
    } else if (arg === "--agent" && args[i + 1]) {
      result.agent = args[++i];
    } else if (arg === "--notes" && args[i + 1]) {
      result.notes = args[++i];
    }
  }
  return result;
}

// LOGS.md 初期化
function initLogsFile() {
  const header = `# responsive-design 実行ログ

このファイルはスキルの実行記録を保持します。

## 記録フォーマット

| 日時 | 結果 | フェーズ | エージェント | 備考 |
| ---- | ---- | -------- | ------------ | ---- |
`;
  writeFileSync(LOGS_PATH, header, "utf-8");
}

// ログエントリ追加
function appendLog(entry) {
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
  const line = `| ${timestamp} | ${entry.result} | ${entry.phase || "-"} | ${entry.agent || "-"} | ${entry.notes || "-"} |\n`;

  if (!existsSync(LOGS_PATH)) {
    initLogsFile();
  }

  appendFileSync(LOGS_PATH, line, "utf-8");
}

// メイン処理
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // 必須引数チェック
  if (!args.result) {
    console.error("エラー: --result は必須です");
    console.error("ヘルプを表示: node scripts/log_usage.mjs --help");
    process.exit(2);
  }

  // result値検証
  const validResults = ["success", "failure", "partial"];
  if (!validResults.includes(args.result)) {
    console.error(
      `エラー: --result は ${validResults.join("|")} のいずれかを指定してください`,
    );
    process.exit(2);
  }

  try {
    appendLog(args);
    console.log(`✅ ログを記録しました: ${LOGS_PATH}`);
    process.exit(0);
  } catch (error) {
    console.error(`エラー: ログの記録に失敗しました - ${error.message}`);
    process.exit(1);
  }
}

main();
