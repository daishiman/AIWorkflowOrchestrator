#!/usr/bin/env node
/**
 * validate_example.mjs
 * 使用例の構造を検証するスクリプト
 *
 * 使用方法:
 *   node scripts/validate_example.mjs <example-file-path>
 *
 * 例:
 *   node scripts/validate_example.mjs examples/api-example.md
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// 検証項目
const CHECKS = {
  structure: [
    { name: "概要セクション", pattern: /^#+\s*(概要|Overview)/m },
    { name: "前提条件セクション", pattern: /^#+\s*(前提条件|Prerequisites)/m },
    {
      name: "インストールセクション",
      pattern: /^#+\s*(インストール|Install)/m,
    },
    { name: "コードブロック", pattern: /```[\s\S]*?```/ },
    { name: "出力セクション", pattern: /^#+\s*(出力|Output|期待される出力)/m },
  ],
  quality: [
    { name: "バージョン明記", pattern: /(\d+\.\d+|\^|~)/ },
    { name: "エラーハンドリング", pattern: /(try|catch|error|Error|except)/ },
  ],
};

function validateExample(filePath) {
  const absolutePath = resolve(filePath);

  if (!existsSync(absolutePath)) {
    console.error(`❌ ファイルが見つかりません: ${absolutePath}`);
    process.exit(1);
  }

  const content = readFileSync(absolutePath, "utf-8");
  const results = {
    passed: [],
    failed: [],
    warnings: [],
  };

  console.log(`\n検証中: ${filePath}\n`);
  console.log("─".repeat(50));

  // 構造チェック
  console.log("\n📋 構造チェック:");
  for (const check of CHECKS.structure) {
    if (check.pattern.test(content)) {
      results.passed.push(check.name);
      console.log(`  ✓ ${check.name}`);
    } else {
      results.failed.push(check.name);
      console.log(`  ✗ ${check.name}`);
    }
  }

  // 品質チェック
  console.log("\n📋 品質チェック:");
  for (const check of CHECKS.quality) {
    if (check.pattern.test(content)) {
      results.passed.push(check.name);
      console.log(`  ✓ ${check.name}`);
    } else {
      results.warnings.push(check.name);
      console.log(`  ⚠ ${check.name} (推奨)`);
    }
  }

  // 結果サマリー
  console.log("\n" + "─".repeat(50));
  console.log("\n📊 結果サマリー:");
  console.log(`  合格: ${results.passed.length}`);
  console.log(`  不合格: ${results.failed.length}`);
  console.log(`  警告: ${results.warnings.length}`);

  const isValid = results.failed.length === 0;
  console.log(`\n${isValid ? "✅ 検証成功" : "❌ 検証失敗"}\n`);

  return isValid ? 0 : 1;
}

// メイン処理
const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(`
使用方法: node scripts/validate_example.mjs <example-file-path>

オプション:
  --help, -h    このヘルプを表示

例:
  node scripts/validate_example.mjs examples/api-example.md
  node scripts/validate_example.mjs ./my-example.md
`);
  process.exit(0);
}

process.exit(validateExample(args[0]));
