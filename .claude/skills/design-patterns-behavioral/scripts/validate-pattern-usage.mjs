#!/usr/bin/env node
/**
 * validate-pattern-usage.mjs
 *
 * 行動パターンの使用を検証するスクリプト
 *
 * 使用方法:
 *   node .claude/skills/design-patterns-behavioral/scripts/validate-pattern-usage.mjs <file.ts>
 *
 * 検証内容:
 *   - Strategyパターンの構造検証
 *   - Template Methodパターンの構造検証
 *   - インターフェース設計の検証
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ===== 検証ルール =====

const VALIDATION_RULES = {
  strategy: {
    name: "Strategy Pattern",
    checks: [
      {
        name: "インターフェース定義",
        pattern: /interface\s+I\w*(?:Strategy|Executor)\s*[<{]/,
        message: "Strategyインターフェースが定義されているか確認",
      },
      {
        name: "executeメソッド",
        pattern: /execute\s*\([^)]*\)\s*:\s*Promise/,
        message: "executeメソッドがPromiseを返すか確認",
      },
      {
        name: "型パラメータ",
        pattern: /<\s*T\w*\s*(?:,\s*T\w*\s*)*>/,
        message: "ジェネリクスによる型安全性の確認",
      },
    ],
  },
  templateMethod: {
    name: "Template Method Pattern",
    checks: [
      {
        name: "抽象クラス",
        pattern: /abstract\s+class\s+\w+/,
        message: "抽象クラスが定義されているか確認",
      },
      {
        name: "抽象メソッド",
        pattern: /protected\s+abstract\s+\w+/,
        message: "抽象メソッドが定義されているか確認",
      },
      {
        name: "フックメソッド",
        pattern: /protected\s+(?:async\s+)?(?:before|after|on)\w+/,
        message: "フックメソッドが定義されているか確認",
      },
    ],
  },
  general: {
    name: "一般的な設計原則",
    checks: [
      {
        name: "readonly プロパティ",
        pattern: /readonly\s+\w+\s*:/,
        message: "不変プロパティが適切に定義されているか確認",
      },
      {
        name: "private メンバー",
        pattern: /private\s+(?:readonly\s+)?(?:readonly\s+)?\w+/,
        message: "カプセル化が適切に行われているか確認",
      },
    ],
  },
};

// ===== 検証関数 =====

function validateFile(filePath) {
  const absolutePath = resolve(process.cwd(), filePath);

  if (!existsSync(absolutePath)) {
    console.error(`❌ ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(absolutePath, "utf-8");
  const results = {
    file: filePath,
    patterns: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  };

  // 各パターンの検証
  for (const [patternKey, patternConfig] of Object.entries(VALIDATION_RULES)) {
    results.patterns[patternKey] = {
      name: patternConfig.name,
      checks: [],
    };

    for (const check of patternConfig.checks) {
      const passed = check.pattern.test(content);
      results.patterns[patternKey].checks.push({
        name: check.name,
        passed,
        message: check.message,
      });

      results.summary.total++;
      if (passed) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
      }
    }
  }

  return results;
}

function printResults(results) {
  console.log("\n🔍 パターン使用検証結果");
  console.log("=".repeat(60));
  console.log(`📁 ファイル: ${results.file}`);
  console.log("");

  for (const [, pattern] of Object.entries(results.patterns)) {
    console.log(`\n📋 ${pattern.name}`);
    console.log("-".repeat(40));

    for (const check of pattern.checks) {
      const icon = check.passed ? "✅" : "⚠️";
      console.log(`  ${icon} ${check.name}`);
      if (!check.passed) {
        console.log(`     💡 ${check.message}`);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 サマリー");
  console.log(`   合計: ${results.summary.total}`);
  console.log(`   ✅ 合格: ${results.summary.passed}`);
  console.log(`   ⚠️ 要確認: ${results.summary.failed}`);

  const passRate = (
    (results.summary.passed / results.summary.total) *
    100
  ).toFixed(1);
  console.log(`   📈 合格率: ${passRate}%`);
  console.log("");
}

// ===== メイン処理 =====

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node validate-pattern-usage.mjs <file.ts>");
    console.log("");
    console.log("例:");
    console.log("  node validate-pattern-usage.mjs src/features/registry.ts");
    process.exit(0);
  }

  const filePath = args[0];
  const results = validateFile(filePath);
  printResults(results);

  // 合格率が50%未満の場合は終了コード1
  const passRate = results.summary.passed / results.summary.total;
  process.exit(passRate >= 0.5 ? 0 : 1);
}

main();
