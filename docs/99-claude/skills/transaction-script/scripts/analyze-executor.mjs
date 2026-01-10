#!/usr/bin/env node

/**
 * Executor分析スクリプト
 *
 * Usage:
 *   node analyze-executor.mjs <directory>
 *   node analyze-executor.mjs src/features/
 *
 * 分析内容:
 * - Executor実装の検出
 * - IWorkflowExecutorインターフェースの準拠確認
 * - executeメソッドの構造分析
 * - トランザクションスクリプトパターンの適合度
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname } from "path";

// 設定
const CONFIG = {
  supportedExtensions: [".ts", ".tsx"],
  excludePatterns: [
    "node_modules",
    ".git",
    "dist",
    "build",
    "__tests__",
    "*.test.ts",
    "*.spec.ts",
  ],
  executorPattern: /class\s+(\w+)Executor/g,
  executeMethodPattern: /async\s+execute\s*\([^)]*\)/,
  maxExecuteLines: 50,
};

// 結果格納
const results = {
  files: 0,
  executors: [],
  issues: [],
  recommendations: [],
};

/**
 * ファイルを再帰的に取得
 */
function getFiles(dir, files = []) {
  if (!existsSync(dir)) {
    console.error(`ディレクトリが存在しません: ${dir}`);
    return files;
  }

  const items = readdirSync(dir);

  for (const item of items) {
    if (CONFIG.excludePatterns.some((p) => item.includes(p.replace("*", ""))))
      continue;

    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      getFiles(fullPath, files);
    } else if (CONFIG.supportedExtensions.includes(extname(item))) {
      if (!item.includes(".test.") && !item.includes(".spec.")) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Executorを分析
 */
function analyzeExecutor(content, filePath) {
  const executorMatch = content.match(/class\s+(\w+)Executor/);
  if (!executorMatch) return null;

  const executorName = executorMatch[1];
  const executor = {
    name: executorName,
    file: filePath,
    hasExecuteMethod: false,
    implementsInterface: false,
    executeLineCount: 0,
    hasValidation: false,
    hasErrorHandling: false,
    hasLogging: false,
    score: 0,
  };

  // IWorkflowExecutorの実装確認
  executor.implementsInterface = /implements\s+IWorkflowExecutor/.test(content);

  // executeメソッドの確認
  const executeMatch = content.match(
    /async\s+execute\s*\([^)]*\)\s*:\s*Promise[^{]*\{/,
  );
  if (executeMatch) {
    executor.hasExecuteMethod = true;

    // executeメソッドの行数を推定
    const startIndex = content.indexOf(executeMatch[0]);
    let braceCount = 0;
    let started = false;
    let endIndex = startIndex;

    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === "{") {
        braceCount++;
        started = true;
      } else if (content[i] === "}") {
        braceCount--;
      }
      if (started && braceCount === 0) {
        endIndex = i;
        break;
      }
    }

    const executeBody = content.substring(startIndex, endIndex);
    executor.executeLineCount = executeBody.split("\n").length;
  }

  // バリデーションの確認
  executor.hasValidation = /\.parse\(|validate|Validation|Schema/.test(content);

  // エラーハンドリングの確認
  executor.hasErrorHandling = /try\s*\{|catch\s*\(|throw\s+new/.test(content);

  // ログの確認
  executor.hasLogging = /console\.|logger\.|log\(/.test(content);

  // スコア計算
  let score = 0;
  if (executor.implementsInterface) score += 20;
  if (executor.hasExecuteMethod) score += 20;
  if (executor.hasValidation) score += 20;
  if (executor.hasErrorHandling) score += 20;
  if (executor.executeLineCount <= CONFIG.maxExecuteLines) score += 20;
  executor.score = score;

  return executor;
}

/**
 * ファイルを分析
 */
function analyzeFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  results.files++;

  const executor = analyzeExecutor(content, filePath);
  if (executor) {
    results.executors.push(executor);

    // 問題点の検出
    if (!executor.implementsInterface) {
      results.issues.push({
        file: filePath,
        issue: "IWorkflowExecutorインターフェースを実装していません",
        severity: "warning",
      });
    }

    if (!executor.hasExecuteMethod) {
      results.issues.push({
        file: filePath,
        issue: "executeメソッドが見つかりません",
        severity: "error",
      });
    }

    if (executor.executeLineCount > CONFIG.maxExecuteLines) {
      results.issues.push({
        file: filePath,
        issue: `executeメソッドが長すぎます (${executor.executeLineCount}行 > ${CONFIG.maxExecuteLines}行)`,
        severity: "warning",
      });
      results.recommendations.push({
        file: filePath,
        recommendation: "Extract Methodでサブメソッドに分割することを推奨",
      });
    }

    if (!executor.hasValidation) {
      results.issues.push({
        file: filePath,
        issue: "入力バリデーションが見つかりません",
        severity: "info",
      });
    }

    if (!executor.hasErrorHandling) {
      results.issues.push({
        file: filePath,
        issue: "エラーハンドリングが不足しています",
        severity: "warning",
      });
    }
  }
}

/**
 * 結果を出力
 */
function printResults() {
  console.log("\n📊 Executor分析結果\n");
  console.log("=".repeat(60));

  // 概要
  console.log(`\n📁 分析ファイル: ${results.files}件`);
  console.log(`📝 検出Executor: ${results.executors.length}件`);

  // Executor一覧
  if (results.executors.length > 0) {
    console.log("\n📋 Executor一覧:");
    for (const exec of results.executors) {
      const scoreEmoji =
        exec.score >= 80 ? "🟢" : exec.score >= 60 ? "🟡" : "🔴";
      console.log(
        `\n  ${scoreEmoji} ${exec.name}Executor (スコア: ${exec.score}/100)`,
      );
      console.log(`     ファイル: ${exec.file}`);
      console.log(
        `     インターフェース実装: ${exec.implementsInterface ? "✅" : "❌"}`,
      );
      console.log(
        `     executeメソッド: ${exec.hasExecuteMethod ? "✅" : "❌"}`,
      );
      console.log(`     バリデーション: ${exec.hasValidation ? "✅" : "❌"}`);
      console.log(
        `     エラーハンドリング: ${exec.hasErrorHandling ? "✅" : "❌"}`,
      );
      if (exec.executeLineCount > 0) {
        console.log(`     execute行数: ${exec.executeLineCount}行`);
      }
    }
  }

  // 問題点
  if (results.issues.length > 0) {
    console.log("\n⚠️ 検出された問題:");
    for (const issue of results.issues) {
      const icon =
        issue.severity === "error"
          ? "🔴"
          : issue.severity === "warning"
            ? "🟠"
            : "🟡";
      console.log(`  ${icon} [${issue.severity}] ${issue.file}`);
      console.log(`     ${issue.issue}`);
    }
  }

  // 推奨事項
  if (results.recommendations.length > 0) {
    console.log("\n💡 推奨事項:");
    for (const rec of results.recommendations) {
      console.log(`  📌 ${rec.file}`);
      console.log(`     ${rec.recommendation}`);
    }
  }

  // サマリー
  console.log("\n" + "=".repeat(60));
  const avgScore =
    results.executors.length > 0
      ? Math.round(
          results.executors.reduce((sum, e) => sum + e.score, 0) /
            results.executors.length,
        )
      : 0;
  const summaryEmoji = avgScore >= 80 ? "🟢" : avgScore >= 60 ? "🟡" : "🔴";
  console.log(`${summaryEmoji} 平均スコア: ${avgScore}/100`);
  console.log(`📋 問題数: ${results.issues.length}件`);
  console.log("");
}

// メイン処理
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: node analyze-executor.mjs <directory>");
  console.log("Example: node analyze-executor.mjs src/features/");
  process.exit(1);
}

const targetDir = args[0];
console.log(`🔍 ${targetDir} を分析中...`);

try {
  const files = getFiles(targetDir);
  console.log(`📁 ${files.length}ファイルを検査`);

  for (const file of files) {
    analyzeFile(file);
  }

  printResults();
} catch (error) {
  console.error(`❌ エラー: ${error.message}`);
  process.exit(1);
}
