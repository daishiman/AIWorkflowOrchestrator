#!/usr/bin/env node

/**
 * セキュリティ設定検証スクリプト
 *
 * ファイル監視システムのセキュリティ実装を検証します。
 *
 * 使用例:
 *   node scripts/validate-security.mjs --file secure-watcher.ts
 *   node scripts/validate-security.mjs --all
 *
 * 終了コード:
 *   0: 成功
 *   1: 一般エラー
 *   2: 引数エラー
 *   3: ファイル不在
 *   4: 検証失敗
 */

import { readFileSync, existsSync } from "fs";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

function showHelp() {
  console.log(`
セキュリティ設定検証スクリプト

Usage:
  node scripts/validate-security.mjs [options] <file>

Options:
  --file         セキュアウォッチャー実装を検証
  --all          すべてのセキュリティファイルを検証
  -h, --help     このヘルプを表示

Security Checks:
  - パス検証関数の存在
  - シンボリックリンク検出ロジック
  - 権限管理パターン
  - Fail-Safe デフォルト
  - 監査ログ実装

Examples:
  node scripts/validate-security.mjs --file assets/secure-watcher.ts
  node scripts/validate-security.mjs --all
  `);
}

// セキュリティパターン
const SECURITY_PATTERNS = {
  pathValidation: {
    name: "パス検証",
    patterns: [/path\.resolve/, /startsWith/, /normalize/],
    required: true,
  },
  symlinkCheck: {
    name: "シンボリックリンク検出",
    patterns: [/lstat/, /isSymbolicLink/, /followSymlinks.*false/],
    required: true,
  },
  failSafe: {
    name: "Fail-Safe デフォルト",
    patterns: [/return\s+false/, /return\s+null/, /throw\s+new\s+Error/],
    required: true,
  },
  auditLog: {
    name: "監査ログ",
    patterns: [
      /console\.(log|warn|error)/,
      /logger\.(info|warn|error)/,
      /audit/i,
    ],
    required: false,
  },
  dangerousPatterns: {
    name: "危険なパターン検出",
    patterns: [/\.\.\//, /%2e/i, /DANGEROUS_PATTERNS/],
    required: false,
  },
};

// 危険な実装パターン（これがあると警告）
const ANTI_PATTERNS = [
  {
    pattern: /followSymlinks.*true/i,
    message: "followSymlinks: true は危険です",
  },
  { pattern: /eval\s*\(/, message: "eval() は使用しないでください" },
  { pattern: /exec\s*\(.*\$/, message: "ユーザー入力を含むexec()は危険です" },
];

function validateSecurityFile(content, fileName) {
  const errors = [];
  const warnings = [];
  const passed = [];

  // セキュリティパターンのチェック
  for (const [key, check] of Object.entries(SECURITY_PATTERNS)) {
    const found = check.patterns.some((pattern) => pattern.test(content));

    if (found) {
      passed.push(`✓ ${check.name}`);
    } else if (check.required) {
      errors.push(`${check.name} が実装されていません`);
    } else {
      warnings.push(`${check.name} の実装を推奨します`);
    }
  }

  // アンチパターンのチェック
  for (const antiPattern of ANTI_PATTERNS) {
    if (antiPattern.pattern.test(content)) {
      errors.push(antiPattern.message);
    }
  }

  return { errors, warnings, passed, fileName };
}

function printResults(results) {
  console.log(`\n=== ${results.fileName} ===\n`);

  if (results.passed.length > 0) {
    console.log("パスした項目:");
    results.passed.forEach((p) => console.log(`  ${p}`));
  }

  if (results.warnings.length > 0) {
    console.log("\n⚠ 警告:");
    results.warnings.forEach((w) => console.log(`  - ${w}`));
  }

  if (results.errors.length > 0) {
    console.log("\n✗ エラー:");
    results.errors.forEach((e) => console.log(`  - ${e}`));
  }

  const status = results.errors.length === 0 ? "✓ 検証成功" : "✗ 検証失敗";
  console.log(
    `\n結果: ${status} (${results.passed.length}パス, ${results.errors.length}エラー, ${results.warnings.length}警告)`,
  );

  return results.errors.length === 0;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  if (args.length === 0) {
    console.error("Error: オプションまたはファイルパスを指定してください");
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  let allPassed = true;

  if (args.includes("--all")) {
    const defaultFiles = ["assets/secure-watcher.ts"];

    for (const file of defaultFiles) {
      if (existsSync(file)) {
        const content = readFileSync(file, "utf-8");
        const results = validateSecurityFile(content, file);
        if (!printResults(results)) {
          allPassed = false;
        }
      } else {
        console.log(`⚠ ${file}: ファイルが見つかりません（スキップ）`);
      }
    }
  } else {
    const filePath = args.find((a) => !a.startsWith("-"));
    if (!filePath) {
      console.error("Error: ファイルパスを指定してください");
      process.exit(EXIT_ARGS_ERROR);
    }

    if (!existsSync(filePath)) {
      console.error(`Error: ファイルが見つかりません: ${filePath}`);
      process.exit(EXIT_FILE_MISSING);
    }

    const content = readFileSync(filePath, "utf-8");
    const results = validateSecurityFile(content, filePath);
    allPassed = printResults(results);
  }

  process.exit(allPassed ? EXIT_SUCCESS : EXIT_VALIDATION_ERROR);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
