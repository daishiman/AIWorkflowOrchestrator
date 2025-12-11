#!/usr/bin/env node

/**
 * コードスメル検出スクリプト
 *
 * Usage:
 *   node detect-code-smells.mjs <directory>
 *   node detect-code-smells.mjs src/features/
 *
 * 検出するスメル:
 * - Long Method (30行超)
 * - Long Parameter List (4パラメータ超)
 * - Complex Conditional (ネスト3段階超)
 * - Magic Number (意味不明な数値リテラル)
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

// 設定
const CONFIG = {
  maxMethodLines: 30,
  maxParameters: 4,
  maxNestingDepth: 3,
  supportedExtensions: [".ts", ".tsx", ".js", ".jsx"],
};

// 結果格納
const results = {
  longMethods: [],
  longParameterLists: [],
  complexConditionals: [],
  magicNumbers: [],
};

/**
 * ファイルを再帰的に取得
 */
function getFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!item.startsWith(".") && item !== "node_modules") {
        getFiles(fullPath, files);
      }
    } else if (CONFIG.supportedExtensions.includes(extname(item))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 関数/メソッドの行数を検出
 */
function detectLongMethods(content, filePath) {
  // 簡易的な関数検出（function, =>、メソッド定義）
  const functionPattern =
    /(?:function\s+\w+|(?:async\s+)?(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|(?:async\s+)?\w+\s*\([^)]*\)\s*\{)/g;

  let match;
  const lines = content.split("\n");

  while ((match = functionPattern.exec(content)) !== null) {
    const startLine = content.substring(0, match.index).split("\n").length;
    let braceCount = 0;
    let started = false;
    let endLine = startLine;

    for (let i = startLine - 1; i < lines.length; i++) {
      const line = lines[i];
      for (const char of line) {
        if (char === "{") {
          braceCount++;
          started = true;
        } else if (char === "}") {
          braceCount--;
        }
      }
      if (started && braceCount === 0) {
        endLine = i + 1;
        break;
      }
    }

    const methodLines = endLine - startLine + 1;
    if (methodLines > CONFIG.maxMethodLines) {
      results.longMethods.push({
        file: filePath,
        line: startLine,
        lineCount: methodLines,
        threshold: CONFIG.maxMethodLines,
      });
    }
  }
}

/**
 * パラメータ数を検出
 */
function detectLongParameterLists(content, filePath) {
  // 関数シグネチャからパラメータを抽出
  const functionPattern = /(?:function\s+\w+|(?:async\s+)?\w+)\s*\(([^)]*)\)/g;

  let match;
  while ((match = functionPattern.exec(content)) !== null) {
    const params = match[1].trim();
    if (params) {
      // カンマで分割してパラメータ数をカウント
      const paramCount = params.split(",").filter((p) => p.trim()).length;
      if (paramCount > CONFIG.maxParameters) {
        const line = content.substring(0, match.index).split("\n").length;
        results.longParameterLists.push({
          file: filePath,
          line,
          paramCount,
          threshold: CONFIG.maxParameters,
        });
      }
    }
  }
}

/**
 * 複雑な条件式（深いネスト）を検出
 */
function detectComplexConditionals(content, filePath) {
  const lines = content.split("\n");
  let currentNesting = 0;
  let maxNesting = 0;
  let maxNestingLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ネストを増やすパターン
    if (/\b(if|for|while|switch|try)\b.*\{/.test(line)) {
      currentNesting++;
      if (currentNesting > maxNesting) {
        maxNesting = currentNesting;
        maxNestingLine = i + 1;
      }
    }

    // ネストを減らすパターン（閉じ括弧のみの行）
    if (/^\s*\}\s*(else|catch|finally)?/.test(line)) {
      currentNesting = Math.max(0, currentNesting - 1);
    }
  }

  if (maxNesting > CONFIG.maxNestingDepth) {
    results.complexConditionals.push({
      file: filePath,
      line: maxNestingLine,
      nestingDepth: maxNesting,
      threshold: CONFIG.maxNestingDepth,
    });
  }
}

/**
 * マジックナンバーを検出
 */
function detectMagicNumbers(content, filePath) {
  const lines = content.split("\n");

  // 除外パターン
  const excludePatterns = [
    /^\s*\/\//, // コメント
    /^\s*\*/, // ブロックコメント
    /['"`].*\d+.*['"`]/, // 文字列内
    /\b(0|1|-1)\b/, // 0, 1, -1は許容
    /\bport\b/i, // ポート番号
    /\b(width|height|size|index|length)\b/i, // 一般的なプロパティ
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 除外パターンに該当する場合はスキップ
    if (excludePatterns.some((pattern) => pattern.test(line))) {
      continue;
    }

    // 数値リテラルを検出（2桁以上）
    const magicNumberPattern = /\b(\d{2,})\b/g;
    let match;

    while ((match = magicNumberPattern.exec(line)) !== null) {
      const num = parseInt(match[1], 10);
      // 一般的な値は除外（10, 100, 1000など）
      if (![10, 100, 1000, 60, 24, 365].includes(num)) {
        results.magicNumbers.push({
          file: filePath,
          line: i + 1,
          number: match[1],
        });
      }
    }
  }
}

/**
 * ファイルを分析
 */
function analyzeFile(filePath) {
  const content = readFileSync(filePath, "utf-8");

  detectLongMethods(content, filePath);
  detectLongParameterLists(content, filePath);
  detectComplexConditionals(content, filePath);
  detectMagicNumbers(content, filePath);
}

/**
 * 結果を出力
 */
function printResults() {
  console.log("\n📊 コードスメル検出結果\n");
  console.log("=".repeat(60));

  // Long Methods
  console.log(
    `\n🔴 Long Method (${CONFIG.maxMethodLines}行超): ${results.longMethods.length}件`,
  );
  for (const item of results.longMethods.slice(0, 10)) {
    console.log(`   ${item.file}:${item.line} - ${item.lineCount}行`);
  }
  if (results.longMethods.length > 10) {
    console.log(`   ... 他 ${results.longMethods.length - 10}件`);
  }

  // Long Parameter Lists
  console.log(
    `\n🟠 Long Parameter List (${CONFIG.maxParameters}パラメータ超): ${results.longParameterLists.length}件`,
  );
  for (const item of results.longParameterLists.slice(0, 10)) {
    console.log(`   ${item.file}:${item.line} - ${item.paramCount}パラメータ`);
  }
  if (results.longParameterLists.length > 10) {
    console.log(`   ... 他 ${results.longParameterLists.length - 10}件`);
  }

  // Complex Conditionals
  console.log(
    `\n🟡 Complex Conditional (ネスト${CONFIG.maxNestingDepth}段階超): ${results.complexConditionals.length}件`,
  );
  for (const item of results.complexConditionals.slice(0, 10)) {
    console.log(
      `   ${item.file}:${item.line} - ネスト${item.nestingDepth}段階`,
    );
  }
  if (results.complexConditionals.length > 10) {
    console.log(`   ... 他 ${results.complexConditionals.length - 10}件`);
  }

  // Magic Numbers
  console.log(`\n🟢 Magic Number: ${results.magicNumbers.length}件`);
  for (const item of results.magicNumbers.slice(0, 10)) {
    console.log(`   ${item.file}:${item.line} - ${item.number}`);
  }
  if (results.magicNumbers.length > 10) {
    console.log(`   ... 他 ${results.magicNumbers.length - 10}件`);
  }

  // サマリー
  const total =
    results.longMethods.length +
    results.longParameterLists.length +
    results.complexConditionals.length +
    results.magicNumbers.length;

  console.log("\n" + "=".repeat(60));
  console.log(`📈 合計: ${total}件のコードスメルを検出`);

  if (total === 0) {
    console.log("✅ コードスメルは検出されませんでした");
  } else {
    console.log("\n推奨アクション:");
    if (results.longMethods.length > 0) {
      console.log("  - Extract Methodでメソッドを分割");
    }
    if (results.longParameterLists.length > 0) {
      console.log("  - Introduce Parameter Objectでパラメータをオブジェクト化");
    }
    if (results.complexConditionals.length > 0) {
      console.log("  - Decompose Conditionalで条件式を分解");
    }
    if (results.magicNumbers.length > 0) {
      console.log("  - Replace Magic Number with Symbolic Constantで定数化");
    }
  }
}

// メイン処理
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: node detect-code-smells.mjs <directory>");
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
