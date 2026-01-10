#!/usr/bin/env node
/**
 * validate-plugin-structure.mjs
 *
 * プラグインディレクトリの構造を検証するスクリプト
 *
 * 使用方法:
 *   node .claude/skills/plugin-architecture/scripts/validate-plugin-structure.mjs <directory>
 *
 * 検証内容:
 *   - 必須ファイルの存在
 *   - executor.tsの構造
 *   - schema.tsの存在
 *   - テストファイルの存在
 */

import { readdirSync, existsSync, readFileSync, statSync } from "fs";
import { resolve, join, basename } from "path";

// ===== 検証ルール =====

const REQUIRED_FILES = ["executor.ts", "schema.ts"];

const RECOMMENDED_FILES = ["__tests__/executor.test.ts", "types.ts"];

const EXECUTOR_PATTERNS = {
  interfaceImplementation: /implements\s+IWorkflowExecutor/,
  typeProperty: /readonly\s+type\s*[=:]/,
  displayNameProperty: /readonly\s+displayName\s*[=:]/,
  descriptionProperty: /readonly\s+description\s*[=:]/,
  inputSchema: /readonly\s+inputSchema\s*[=:]/,
  outputSchema: /readonly\s+outputSchema\s*[=:]/,
  executeMethod: /async\s+execute\s*\([^)]*\)\s*:/,
};

// ===== 検証関数 =====

function validateDirectory(dirPath) {
  const absolutePath = resolve(process.cwd(), dirPath);

  if (!existsSync(absolutePath)) {
    console.error(`❌ ディレクトリが見つかりません: ${dirPath}`);
    process.exit(1);
  }

  if (!statSync(absolutePath).isDirectory()) {
    console.error(`❌ ディレクトリではありません: ${dirPath}`);
    process.exit(1);
  }

  const results = {
    directory: dirPath,
    name: basename(absolutePath),
    requiredFiles: [],
    recommendedFiles: [],
    executorChecks: [],
    summary: {
      total: 0,
      passed: 0,
      warnings: 0,
      failed: 0,
    },
  };

  // 必須ファイルのチェック
  for (const file of REQUIRED_FILES) {
    const filePath = join(absolutePath, file);
    const exists = existsSync(filePath);
    results.requiredFiles.push({
      file,
      exists,
      required: true,
    });

    results.summary.total++;
    if (exists) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
  }

  // 推奨ファイルのチェック
  for (const file of RECOMMENDED_FILES) {
    const filePath = join(absolutePath, file);
    const exists = existsSync(filePath);
    results.recommendedFiles.push({
      file,
      exists,
      required: false,
    });

    results.summary.total++;
    if (exists) {
      results.summary.passed++;
    } else {
      results.summary.warnings++;
    }
  }

  // executor.tsの内容チェック
  const executorPath = join(absolutePath, "executor.ts");
  if (existsSync(executorPath)) {
    const content = readFileSync(executorPath, "utf-8");

    for (const [name, pattern] of Object.entries(EXECUTOR_PATTERNS)) {
      const passed = pattern.test(content);
      results.executorChecks.push({
        name,
        passed,
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
  console.log("\n🔍 プラグイン構造検証結果");
  console.log("=".repeat(60));
  console.log(`📁 ディレクトリ: ${results.directory}`);
  console.log(`📛 プラグイン名: ${results.name}`);
  console.log("");

  // 必須ファイル
  console.log("📋 必須ファイル");
  console.log("-".repeat(40));
  for (const file of results.requiredFiles) {
    const icon = file.exists ? "✅" : "❌";
    console.log(`  ${icon} ${file.file}`);
  }

  // 推奨ファイル
  console.log("\n📋 推奨ファイル");
  console.log("-".repeat(40));
  for (const file of results.recommendedFiles) {
    const icon = file.exists ? "✅" : "⚠️";
    console.log(`  ${icon} ${file.file}`);
  }

  // Executorチェック
  if (results.executorChecks.length > 0) {
    console.log("\n📋 Executor構造チェック");
    console.log("-".repeat(40));
    for (const check of results.executorChecks) {
      const icon = check.passed ? "✅" : "❌";
      const label = formatCheckName(check.name);
      console.log(`  ${icon} ${label}`);
    }
  }

  // サマリー
  console.log("\n" + "=".repeat(60));
  console.log("📊 サマリー");
  console.log(`   合計: ${results.summary.total}`);
  console.log(`   ✅ 合格: ${results.summary.passed}`);
  console.log(`   ⚠️ 警告: ${results.summary.warnings}`);
  console.log(`   ❌ 失敗: ${results.summary.failed}`);

  const passRate = (
    (results.summary.passed / results.summary.total) *
    100
  ).toFixed(1);
  console.log(`   📈 合格率: ${passRate}%`);
  console.log("");
}

function formatCheckName(name) {
  const labels = {
    interfaceImplementation: "IWorkflowExecutorの実装",
    typeProperty: "type プロパティ",
    displayNameProperty: "displayName プロパティ",
    descriptionProperty: "description プロパティ",
    inputSchema: "inputSchema 定義",
    outputSchema: "outputSchema 定義",
    executeMethod: "execute メソッド",
  };
  return labels[name] || name;
}

// ===== メイン処理 =====

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node validate-plugin-structure.mjs <directory>");
    console.log("");
    console.log("例:");
    console.log(
      "  node validate-plugin-structure.mjs src/features/authentication",
    );
    process.exit(0);
  }

  const dirPath = args[0];
  const results = validateDirectory(dirPath);
  printResults(results);

  // 失敗がある場合は終了コード1
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

main();
