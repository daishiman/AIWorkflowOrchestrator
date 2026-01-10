#!/usr/bin/env node

/**
 * カバレッジ分析・チェックスクリプト
 *
 * テストカバレッジを分析し、閾値チェックと改善提案を行います。
 *
 * Usage:
 *   node coverage-analyzer.mjs [--threshold <n>] [--coverage-dir <path>]
 *   node coverage-analyzer.mjs --threshold 80
 *   node coverage-analyzer.mjs --analyze-file coverage/coverage-summary.json
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const args = process.argv.slice(2);

// 引数パース
const parseArgs = () => {
  const result = {
    threshold: 80,
    coverageDir: "./coverage",
    analyzeFile: null,
    runCoverage: true,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--threshold" && args[i + 1]) {
      result.threshold = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === "--coverage-dir" && args[i + 1]) {
      result.coverageDir = args[i + 1];
      i++;
    } else if (args[i] === "--analyze-file" && args[i + 1]) {
      result.analyzeFile = args[i + 1];
      result.runCoverage = false;
      i++;
    } else if (args[i] === "--help") {
      console.log("カバレッジ分析ツール\n");
      console.log("Usage:");
      console.log("  node coverage-analyzer.mjs [options]");
      console.log("\nOptions:");
      console.log("  --threshold <n>       カバレッジ閾値 (デフォルト: 80)");
      console.log(
        "  --coverage-dir <path> カバレッジディレクトリ (デフォルト: ./coverage)",
      );
      console.log("  --analyze-file <path> 既存のcoverage-summary.jsonを分析");
      console.log("  --help                ヘルプを表示");
      process.exit(0);
    }
  }

  return result;
};

const options = parseArgs();

// カバレッジ実行（必要な場合）
if (options.runCoverage) {
  console.log("カバレッジを実行中...\n");
  try {
    execSync("npx vitest run --coverage --coverage.reporter=json", {
      stdio: "inherit",
    });
  } catch (error) {
    console.error("カバレッジ実行エラー:", error.message);
    process.exit(1);
  }
}

// カバレッジファイルのパス
const coverageFile =
  options.analyzeFile || join(options.coverageDir, "coverage-summary.json");

if (!existsSync(coverageFile)) {
  console.error(`❌ カバレッジファイルが見つかりません: ${coverageFile}`);
  console.log("\n以下を試してください:");
  console.log("  1. npx vitest run --coverage --coverage.reporter=json");
  console.log('  2. vitest.config.ts で coverage.reporter に "json" を追加');
  process.exit(1);
}

// カバレッジデータ読み込み
const coverageData = JSON.parse(readFileSync(coverageFile, "utf-8"));
const total = coverageData.total;

const results = {
  passed: [],
  failed: [],
  warnings: [],
  metrics: {},
};

// メトリクス抽出
const metrics = ["lines", "branches", "functions", "statements"];

metrics.forEach((metric) => {
  const data = total[metric];
  results.metrics[metric] = {
    total: data.total,
    covered: data.covered,
    skipped: data.skipped,
    pct: data.pct,
  };
});

// 閾値チェック
console.log("\n=== カバレッジ分析結果 ===\n");
console.log(`閾値: ${options.threshold}%\n`);

console.log("【メトリクス】");
metrics.forEach((metric) => {
  const m = results.metrics[metric];
  const status = m.pct >= options.threshold ? "✅" : "❌";
  const metricName = metric.charAt(0).toUpperCase() + metric.slice(1);

  console.log(
    `  ${status} ${metricName.padEnd(12)} ${m.pct.toFixed(2)}% (${m.covered}/${m.total})`,
  );

  if (m.pct >= options.threshold) {
    results.passed.push(`${metricName}: ${m.pct.toFixed(2)}%`);
  } else {
    results.failed.push(
      `${metricName}: ${m.pct.toFixed(2)}% < ${options.threshold}%`,
    );
  }
});

// ファイル別分析
console.log("\n【ファイル別カバレッジ】");
const fileEntries = Object.entries(coverageData)
  .filter(([key]) => key !== "total")
  .map(([file, data]) => ({
    file,
    lines: data.lines.pct,
    branches: data.branches.pct,
    functions: data.functions.pct,
    statements: data.statements.pct,
  }))
  .sort((a, b) => a.lines - b.lines);

// 低カバレッジファイルを表示
const lowCoverageFiles = fileEntries.filter((f) => f.lines < options.threshold);
if (lowCoverageFiles.length > 0) {
  console.log("\n  ⚠️ 低カバレッジファイル:");
  lowCoverageFiles.slice(0, 10).forEach((f) => {
    const shortPath = f.file.length > 50 ? "..." + f.file.slice(-47) : f.file;
    console.log(`    ${f.lines.toFixed(1)}% - ${shortPath}`);
  });

  if (lowCoverageFiles.length > 10) {
    console.log(`    ... 他 ${lowCoverageFiles.length - 10} ファイル`);
  }

  results.warnings.push(`${lowCoverageFiles.length}ファイルが閾値未満`);
}

// 高カバレッジファイル
const highCoverageFiles = fileEntries.filter((f) => f.lines >= 90);
if (highCoverageFiles.length > 0) {
  console.log("\n  ✅ 高カバレッジファイル (90%以上):");
  highCoverageFiles.slice(0, 5).forEach((f) => {
    const shortPath = f.file.length > 50 ? "..." + f.file.slice(-47) : f.file;
    console.log(`    ${f.lines.toFixed(1)}% - ${shortPath}`);
  });
}

// 改善提案
console.log("\n【改善提案】");

if (results.metrics.branches.pct < results.metrics.lines.pct - 10) {
  console.log("  💡 ブランチカバレッジが低い → 条件分岐のテストを追加");
  results.warnings.push("ブランチカバレッジが相対的に低い");
}

if (results.metrics.functions.pct < results.metrics.lines.pct - 10) {
  console.log("  💡 関数カバレッジが低い → 未テストの関数を確認");
  results.warnings.push("関数カバレッジが相対的に低い");
}

if (lowCoverageFiles.length > 0) {
  console.log("  💡 低カバレッジファイルから優先的にテストを追加");
}

// 総合スコア
const avgCoverage =
  metrics.reduce((sum, m) => sum + results.metrics[m].pct, 0) / metrics.length;
console.log(`\n【総合スコア】 ${avgCoverage.toFixed(2)}%`);

// 結果サマリ
const allPassed = results.failed.length === 0;

if (allPassed) {
  console.log("\n✅ すべてのカバレッジが閾値を満たしています");
} else {
  console.log("\n❌ 以下のカバレッジが閾値を下回っています:");
  results.failed.forEach((f) => console.log(`  - ${f}`));
}

// 推奨設定
console.log("\n【推奨 vitest.config.ts 設定】");
console.log(`coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  thresholds: {
    lines: ${options.threshold},
    branches: ${options.threshold},
    functions: ${options.threshold},
    statements: ${options.threshold}
  }
}`);

process.exit(allPassed ? 0 : 1);
