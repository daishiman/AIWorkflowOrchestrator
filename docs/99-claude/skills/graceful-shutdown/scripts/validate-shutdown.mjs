#!/usr/bin/env node
/**
 * validate-shutdown.mjs - シャットダウン実装検証スクリプト
 *
 * 18-skills.md §3.4.2 準拠
 *
 * Usage:
 *   node scripts/validate-shutdown.mjs <file-path>
 *
 * Arguments:
 *   <file-path>  検証対象のシャットダウンハンドラーファイル [必須]
 *   -h, --help   ヘルプを表示
 *
 * Exit Codes:
 *   0 - 検証成功
 *   1 - 検証失敗
 *   2 - 引数エラー
 *
 * 検証項目:
 *   - SIGTERM/SIGINTハンドラーの存在
 *   - べき等性フラグの実装
 *   - タイムアウト処理の存在
 *   - process.exit()の適切な使用
 */

import fs from "fs/promises";
import path from "path";

function showHelp() {
  console.log(`
validate-shutdown.mjs - シャットダウン実装検証

Usage:
  node scripts/validate-shutdown.mjs <file-path>

Arguments:
  <file-path>  検証対象のファイルパス [必須]
  -h, --help   このヘルプを表示

検証項目:
  1. SIGTERM/SIGINTハンドラーの登録
  2. べき等性フラグ（isShuttingDown等）
  3. タイムアウト処理
  4. エラーハンドリング
  5. process.exit()の使用

Examples:
  node scripts/validate-shutdown.mjs src/shutdown-handler.ts
  node scripts/validate-shutdown.mjs ./app/server.js
  `);
}

const CHECKS = [
  {
    name: "SIGTERM ハンドラー",
    pattern: /process\.on\s*\(\s*['"]SIGTERM['"]/,
    required: true,
    message: "SIGTERM シグナルハンドラーが登録されていません",
  },
  {
    name: "SIGINT ハンドラー",
    pattern: /process\.on\s*\(\s*['"]SIGINT['"]/,
    required: true,
    message: "SIGINT シグナルハンドラーが登録されていません",
  },
  {
    name: "べき等性フラグ",
    pattern: /isShutting(Down)?|shutting\s*=|shuttingDown/i,
    required: true,
    message: "べき等性を保証するフラグ（isShuttingDown等）が見つかりません",
  },
  {
    name: "タイムアウト処理",
    pattern: /setTimeout|timeout|TIMEOUT|withTimeout/i,
    required: true,
    message: "タイムアウト処理が実装されていません",
  },
  {
    name: "process.exit() 使用",
    pattern: /process\.exit\s*\(/,
    required: true,
    message: "process.exit() が呼び出されていません",
  },
  {
    name: "エラーハンドリング",
    pattern: /try\s*\{|catch\s*\(|\.catch\s*\(/,
    required: true,
    message: "エラーハンドリング（try-catch）が見つかりません",
  },
  {
    name: "async/await 使用",
    pattern: /async\s+function|await\s+/,
    required: false,
    message: "async/await による非同期処理が推奨されます",
  },
  {
    name: "ログ出力",
    pattern: /console\.(log|info|warn|error)|logger\./,
    required: false,
    message: "シャットダウン時のログ出力が推奨されます",
  },
];

async function validateFile(filePath) {
  let content;
  try {
    content = await fs.readFile(filePath, "utf-8");
  } catch (error) {
    console.error(`❌ ファイルを読み込めません: ${filePath}`);
    console.error(`   ${error.message}`);
    return false;
  }

  console.log(`\n🔍 検証中: ${filePath}\n`);
  console.log("─".repeat(60));

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  for (const check of CHECKS) {
    const matches = check.pattern.test(content);
    const status = matches ? "✓" : check.required ? "✗" : "⚠";
    const label = matches ? "OK" : check.required ? "FAIL" : "WARN";

    if (matches) {
      passed++;
      console.log(`  ${status} [${label}] ${check.name}`);
    } else if (check.required) {
      failed++;
      console.log(`  ${status} [${label}] ${check.name}`);
      console.log(`         → ${check.message}`);
    } else {
      warnings++;
      console.log(`  ${status} [${label}] ${check.name}`);
      console.log(`         → ${check.message}`);
    }
  }

  console.log("─".repeat(60));
  console.log(
    `\n結果: ${passed} passed, ${failed} failed, ${warnings} warnings\n`,
  );

  if (failed === 0) {
    console.log("✓ 検証成功: シャットダウン実装は要件を満たしています");
    return true;
  } else {
    console.log("✗ 検証失敗: 上記の問題を修正してください");
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(0);
  }

  if (args.length === 0) {
    console.error("エラー: 検証対象のファイルパスを指定してください");
    showHelp();
    process.exit(2);
  }

  const filePath = args[0];
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  const isValid = await validateFile(absolutePath);
  process.exit(isValid ? 0 : 1);
}

main();
