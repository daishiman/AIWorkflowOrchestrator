#!/usr/bin/env node

/**
 * テストカバレッジ分析スクリプト
 *
 * Usage:
 *   node analyze-coverage.mjs <directory>
 *   node analyze-coverage.mjs src/features/
 *
 * 分析内容:
 * - テストファイルの存在確認
 * - テスト/実装の比率
 * - カバレッジギャップの特定
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname, dirname, basename } from "path";

// 設定
const CONFIG = {
  sourceExtensions: [".ts", ".tsx"],
  testPatterns: [".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx"],
  testDirectories: ["__tests__", "tests", "test"],
  excludePatterns: ["node_modules", ".git", "dist", "build"],
};

// 結果格納
const results = {
  sourceFiles: [],
  testFiles: [],
  coveredFiles: [],
  uncoveredFiles: [],
};

/**
 * ファイルを再帰的に取得
 */
function getFiles(dir, files = []) {
  if (!existsSync(dir)) return files;

  const items = readdirSync(dir);

  for (const item of items) {
    if (CONFIG.excludePatterns.includes(item)) continue;

    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      getFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * テストファイルかどうかを判定
 */
function isTestFile(filePath) {
  const fileName = basename(filePath);

  // テストパターンに一致するか
  if (CONFIG.testPatterns.some((pattern) => fileName.endsWith(pattern))) {
    return true;
  }

  // テストディレクトリ内にあるか
  const dirName = basename(dirname(filePath));
  if (CONFIG.testDirectories.includes(dirName)) {
    return true;
  }

  return false;
}

/**
 * ソースファイルかどうかを判定
 */
function isSourceFile(filePath) {
  const ext = extname(filePath);
  if (!CONFIG.sourceExtensions.includes(ext)) return false;

  // テストファイルを除外
  if (isTestFile(filePath)) return false;

  return true;
}

/**
 * ソースファイルに対応するテストファイルを探す
 */
function findTestFile(sourceFile) {
  const dir = dirname(sourceFile);
  const fileName = basename(sourceFile);
  const baseName = fileName.replace(/\.(ts|tsx)$/, "");

  // 候補となるテストファイルパス
  const candidates = [];

  // 同一ディレクトリ
  for (const pattern of CONFIG.testPatterns) {
    candidates.push(join(dir, `${baseName}${pattern}`));
  }

  // __tests__ディレクトリ
  for (const testDir of CONFIG.testDirectories) {
    for (const pattern of CONFIG.testPatterns) {
      candidates.push(join(dir, testDir, `${baseName}${pattern}`));
    }
  }

  // 親ディレクトリのテストディレクトリ
  const parentDir = dirname(dir);
  for (const testDir of CONFIG.testDirectories) {
    for (const pattern of CONFIG.testPatterns) {
      candidates.push(join(parentDir, testDir, `${baseName}${pattern}`));
    }
  }

  // 存在するテストファイルを返す
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * ファイルの行数を取得
 */
function getLineCount(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    return content.split("\n").length;
  } catch {
    return 0;
  }
}

/**
 * ディレクトリを分析
 */
function analyzeDirectory(dir) {
  const files = getFiles(dir);

  for (const file of files) {
    if (isTestFile(file)) {
      results.testFiles.push(file);
    } else if (isSourceFile(file)) {
      results.sourceFiles.push(file);

      const testFile = findTestFile(file);
      if (testFile) {
        results.coveredFiles.push({ source: file, test: testFile });
      } else {
        results.uncoveredFiles.push(file);
      }
    }
  }
}

/**
 * 結果を出力
 */
function printResults() {
  console.log("\n📊 テストカバレッジ分析結果\n");
  console.log("=".repeat(60));

  // 概要
  const coverageRate =
    results.sourceFiles.length > 0
      ? (
          (results.coveredFiles.length / results.sourceFiles.length) *
          100
        ).toFixed(1)
      : 0;

  console.log(`\n📁 ソースファイル: ${results.sourceFiles.length}件`);
  console.log(`🧪 テストファイル: ${results.testFiles.length}件`);
  console.log(`✅ テストあり: ${results.coveredFiles.length}件`);
  console.log(`❌ テストなし: ${results.uncoveredFiles.length}件`);
  console.log(`📈 カバレッジ率: ${coverageRate}%`);

  // テストなしのファイル
  if (results.uncoveredFiles.length > 0) {
    console.log("\n⚠️ テストが見つからないファイル:");
    for (const file of results.uncoveredFiles.slice(0, 20)) {
      console.log(`   ${file}`);
    }
    if (results.uncoveredFiles.length > 20) {
      console.log(`   ... 他 ${results.uncoveredFiles.length - 20}件`);
    }
  }

  // テスト/実装の行数比率
  let totalSourceLines = 0;
  let totalTestLines = 0;

  for (const { source, test } of results.coveredFiles) {
    totalSourceLines += getLineCount(source);
    totalTestLines += getLineCount(test);
  }

  if (totalSourceLines > 0) {
    const ratio = (totalTestLines / totalSourceLines).toFixed(2);
    console.log(`\n📐 テスト/実装 行数比率: ${ratio}`);
    console.log(`   (推奨: 0.8〜1.2)`);
  }

  // 推奨アクション
  console.log("\n" + "=".repeat(60));
  console.log("📋 推奨アクション:");

  if (results.uncoveredFiles.length > 0) {
    console.log("  1. テストのないファイルにテストを追加");
    console.log("     優先順位: ビジネスロジック > ユーティリティ > 型定義");
  }

  if (coverageRate < 80) {
    console.log("  2. カバレッジ率を80%以上に向上");
  }

  if (totalSourceLines > 0 && totalTestLines / totalSourceLines < 0.8) {
    console.log("  3. テストコード量を増やす（エッジケース、エラーケース）");
  }

  console.log("");
}

// メイン処理
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: node analyze-coverage.mjs <directory>");
  process.exit(1);
}

const targetDir = args[0];
console.log(`🔍 ${targetDir} を分析中...`);

try {
  analyzeDirectory(targetDir);
  printResults();
} catch (error) {
  console.error(`❌ エラー: ${error.message}`);
  process.exit(1);
}
