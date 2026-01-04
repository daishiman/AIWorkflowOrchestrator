#!/usr/bin/env node
/**
 * 使用記録スクリプト
 *
 * 用途:
 * - スキル使用の記録
 * - 分析結果のログ
 * - 改善実績の追跡
 *
 * 使用例:
 *   node scripts/log_usage.mjs --result success --phase "Phase 1"
 *   node scripts/log_usage.mjs --help
 *
 * 終了コード:
 *   0 - 成功
 *   1 - 一般的エラー
 *   2 - 引数エラー
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 設定
const CONFIG = {
  logFile: path.join(__dirname, "..", "LOGS.md"),
};

// ヘルプ表示
const showHelp = () => {
  console.log(`
使用記録スクリプト

使用方法:
  node log_usage.mjs --result <result> --phase <phase> [--note <note>]
  node log_usage.mjs --help

オプション:
  --result <result>  結果（success, failure, partial）
  --phase <phase>    実行フェーズ
  --note <note>      追加メモ（オプション）
  --help, -h         このヘルプを表示

例:
  node log_usage.mjs --result success --phase "Phase 1" --note "依存グラフ生成完了"
`);
};

// ログ追記
const appendLog = (result, phase, note) => {
  const timestamp = new Date().toISOString();
  const entry = `
| ${timestamp} | ${phase} | ${result} | ${note || "-"} |`;

  let content = "";
  if (fs.existsSync(CONFIG.logFile)) {
    content = fs.readFileSync(CONFIG.logFile, "utf-8");
  } else {
    content = `# Modular Architecture 使用ログ

| Timestamp | Phase | Result | Note |
| --------- | ----- | ------ | ---- |`;
  }

  content += entry;
  fs.writeFileSync(CONFIG.logFile, content);
  console.log(`✓ ログを記録しました: ${CONFIG.logFile}`);
};

// 引数パース
const parseArgs = (args) => {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--result" && args[i + 1]) {
      result.result = args[++i];
    } else if (args[i] === "--phase" && args[i + 1]) {
      result.phase = args[++i];
    } else if (args[i] === "--note" && args[i + 1]) {
      result.note = args[++i];
    }
  }
  return result;
};

// メイン処理
const main = () => {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(args.length === 0 ? 2 : 0);
  }

  const parsed = parseArgs(args);

  if (!parsed.result || !parsed.phase) {
    console.error("エラー: --result と --phase は必須です");
    process.exit(2);
  }

  const validResults = ["success", "failure", "partial"];
  if (!validResults.includes(parsed.result)) {
    console.error(`エラー: result は ${validResults.join(", ")} のいずれか`);
    process.exit(2);
  }

  appendLog(parsed.result, parsed.phase, parsed.note);
  process.exit(0);
};

main();
