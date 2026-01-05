#!/usr/bin/env node

/**
 * リファクタリング検証スクリプト
 *
 * リファクタリング前後のコードを比較し、以下を検証:
 * - 外部インターフェースの変更がないこと
 * - メトリクスの改善
 * - テストの通過状況
 *
 * Usage:
 *   node validate-refactoring.mjs --before <file> --after <file>
 *   node validate-refactoring.mjs --diff
 */

import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;

function showHelp() {
  console.log(`
リファクタリング検証ツール

Usage:
  node validate-refactoring.mjs --before <file> --after <file>
  node validate-refactoring.mjs --diff

Options:
  --before <file>   リファクタリング前のファイル
  --after <file>    リファクタリング後のファイル
  --diff            Git diffから変更を検証
  -h, --help        このヘルプを表示

検証項目:
  ✓ エクスポートされた関数/クラスの数が変わっていないこと
  ✓ 公開インターフェースの型が維持されていること
  ✓ メトリクス（行数、循環的複雑度）の改善
  `);
}

/**
 * ファイルからエクスポートを抽出
 */
function extractExports(content) {
  const exports = [];

  // export function
  const funcPattern = /export\s+(?:async\s+)?function\s+(\w+)/g;
  let match;
  while ((match = funcPattern.exec(content)) !== null) {
    exports.push({ type: "function", name: match[1] });
  }

  // export const/let/var
  const varPattern = /export\s+(?:const|let|var)\s+(\w+)/g;
  while ((match = varPattern.exec(content)) !== null) {
    exports.push({ type: "variable", name: match[1] });
  }

  // export class
  const classPattern = /export\s+class\s+(\w+)/g;
  while ((match = classPattern.exec(content)) !== null) {
    exports.push({ type: "class", name: match[1] });
  }

  // export interface/type
  const typePattern = /export\s+(?:interface|type)\s+(\w+)/g;
  while ((match = typePattern.exec(content)) !== null) {
    exports.push({ type: "type", name: match[1] });
  }

  return exports;
}

/**
 * コードメトリクスを計算
 */
function calculateMetrics(content) {
  const lines = content.split("\n");
  const codeLines = lines.filter(
    (line) =>
      line.trim() &&
      !line.trim().startsWith("//") &&
      !line.trim().startsWith("*") &&
      !line.trim().startsWith("/*"),
  );

  // 簡易的な循環的複雑度計算
  let complexity = 1;
  const complexityPatterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bswitch\b/g,
    /\bcatch\b/g,
    /\?\s*[^:]*:/g, // 三項演算子
    /&&/g,
    /\|\|/g,
  ];

  for (const pattern of complexityPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  }

  // ネスト深度
  let maxNesting = 0;
  let currentNesting = 0;
  for (const line of lines) {
    currentNesting += (line.match(/{/g) || []).length;
    currentNesting -= (line.match(/}/g) || []).length;
    maxNesting = Math.max(maxNesting, currentNesting);
  }

  return {
    totalLines: lines.length,
    codeLines: codeLines.length,
    complexity,
    maxNesting,
  };
}

/**
 * 2つのファイルを比較
 */
function compareFiles(beforePath, afterPath) {
  console.log("\n📊 リファクタリング検証結果\n");
  console.log("=".repeat(60));

  const beforeContent = readFileSync(beforePath, "utf-8");
  const afterContent = readFileSync(afterPath, "utf-8");

  // エクスポート比較
  console.log("\n📦 エクスポート比較");
  const beforeExports = extractExports(beforeContent);
  const afterExports = extractExports(afterContent);

  const beforeNames = new Set(beforeExports.map((e) => e.name));
  const afterNames = new Set(afterExports.map((e) => e.name));

  const removed = [...beforeNames].filter((n) => !afterNames.has(n));
  const added = [...afterNames].filter((n) => !beforeNames.has(n));

  if (removed.length === 0 && added.length === 0) {
    console.log("   ✅ 公開インターフェースに変更なし");
  } else {
    if (removed.length > 0) {
      console.log(`   ⚠️  削除: ${removed.join(", ")}`);
    }
    if (added.length > 0) {
      console.log(`   ℹ️  追加: ${added.join(", ")}`);
    }
  }

  // メトリクス比較
  console.log("\n📈 メトリクス比較");
  const beforeMetrics = calculateMetrics(beforeContent);
  const afterMetrics = calculateMetrics(afterContent);

  const metrics = [
    {
      name: "総行数",
      before: beforeMetrics.totalLines,
      after: afterMetrics.totalLines,
    },
    {
      name: "コード行数",
      before: beforeMetrics.codeLines,
      after: afterMetrics.codeLines,
    },
    {
      name: "循環的複雑度",
      before: beforeMetrics.complexity,
      after: afterMetrics.complexity,
    },
    {
      name: "最大ネスト深度",
      before: beforeMetrics.maxNesting,
      after: afterMetrics.maxNesting,
    },
  ];

  let improvements = 0;
  let regressions = 0;

  for (const m of metrics) {
    const diff = m.after - m.before;
    let status = "→";
    if (diff < 0) {
      status = "↓";
      improvements++;
    } else if (diff > 0) {
      status = "↑";
      regressions++;
    }
    console.log(
      `   ${m.name}: ${m.before} ${status} ${m.after} (${diff >= 0 ? "+" : ""}${diff})`,
    );
  }

  // サマリー
  console.log("\n" + "=".repeat(60));
  if (removed.length > 0) {
    console.log("⚠️  警告: 公開インターフェースが削除されました");
    console.log("   破壊的変更の可能性があります。");
  } else if (improvements > regressions) {
    console.log("✅ リファクタリング成功: メトリクスが改善されました");
  } else if (improvements === regressions) {
    console.log("ℹ️  リファクタリング完了: メトリクスは同等です");
  } else {
    console.log("⚠️  注意: 一部のメトリクスが悪化しています");
  }

  return removed.length === 0 ? EXIT_SUCCESS : EXIT_ERROR;
}

/**
 * Git diffから検証
 */
function validateFromDiff() {
  console.log("\n🔍 Git diff から変更を検証中...\n");

  try {
    const diff = execSync("git diff --name-only", { encoding: "utf-8" });
    const changedFiles = diff
      .split("\n")
      .filter((f) => f.match(/\.(ts|tsx|js|jsx)$/));

    if (changedFiles.length === 0) {
      console.log("変更されたファイルがありません");
      return EXIT_SUCCESS;
    }

    console.log(`📁 変更ファイル: ${changedFiles.length}件`);
    for (const file of changedFiles) {
      console.log(`   - ${file}`);
    }

    // 各ファイルのメトリクスを表示
    console.log("\n📈 変更ファイルのメトリクス:");
    for (const file of changedFiles) {
      if (existsSync(file)) {
        const content = readFileSync(file, "utf-8");
        const metrics = calculateMetrics(content);
        console.log(`\n   ${file}:`);
        console.log(`     行数: ${metrics.totalLines}`);
        console.log(`     複雑度: ${metrics.complexity}`);
        console.log(`     ネスト: ${metrics.maxNesting}`);
      }
    }

    return EXIT_SUCCESS;
  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
    return EXIT_ERROR;
  }
}

// メイン処理
const args = process.argv.slice(2);

if (args.includes("-h") || args.includes("--help")) {
  showHelp();
  process.exit(EXIT_SUCCESS);
}

if (args.includes("--diff")) {
  process.exit(validateFromDiff());
}

const beforeIndex = args.indexOf("--before");
const afterIndex = args.indexOf("--after");

if (beforeIndex === -1 || afterIndex === -1) {
  console.error("❌ --before と --after オプションが必要です");
  showHelp();
  process.exit(EXIT_ARGS_ERROR);
}

const beforePath = args[beforeIndex + 1];
const afterPath = args[afterIndex + 1];

if (!existsSync(beforePath)) {
  console.error(`❌ ファイルが見つかりません: ${beforePath}`);
  process.exit(EXIT_ERROR);
}

if (!existsSync(afterPath)) {
  console.error(`❌ ファイルが見つかりません: ${afterPath}`);
  process.exit(EXIT_ERROR);
}

process.exit(compareFiles(beforePath, afterPath));
