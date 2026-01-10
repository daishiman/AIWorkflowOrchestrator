#!/usr/bin/env node
/**
 * Document structure analyzer.
 *
 * Exit codes:
 *   0: success
 *   1: general error
 *   2: argument error
 *   3: file not found
 */

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "fs";
import { join, extname, resolve } from "path";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_NOT_FOUND = 3;

const TOPIC_PATTERNS = {
  concept: /^#\s+(.*とは|.*について|.*の概要|what is|overview|introduction)/i,
  task: /^#\s+(.*する|.*方法|.*手順|how to|configure|install|setup|create)/i,
  reference: /^#\s+(.*リファレンス|.*一覧|.*仕様|reference|api|specification)/i,
};

function showHelp() {
  console.log(`
Document Structure Analyzer

Usage:
  node analyze-structure.mjs --input <directory> [--output <report.json>]

Options:
  --input <path>   Target directory (required)
  --output <path>  Write JSON report to file (optional)
  -h, --help       Show this help
`);
}

function getArg(args, name) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
}

function requireArg(value, name) {
  if (!value) {
    console.error(`Error: ${name} is required`);
    process.exit(EXIT_ARGS_ERROR);
  }
}

function analyzeFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const result = {
    path: filePath,
    topicType: "unknown",
    headings: [],
    maxDepth: 0,
    wordCount: 0,
    hasMetadata: false,
    includes: [],
    links: [],
  };

  if (content.startsWith("---")) {
    result.hasMetadata = true;
  }

  const firstHeading = lines.find((line) => line.startsWith("# "));
  if (firstHeading) {
    for (const [type, pattern] of Object.entries(TOPIC_PATTERNS)) {
      if (pattern.test(firstHeading)) {
        result.topicType = type;
        break;
      }
    }
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      result.headings.push({ level, text: headingMatch[2] });
      result.maxDepth = Math.max(result.maxDepth, level);
    }
  }

  const includeMatches = content.matchAll(
    /\{\{(?:include|snippet|conref):([^}]+)\}\}/g,
  );
  for (const match of includeMatches) {
    result.includes.push(match[1]);
  }

  const linkMatches = content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  for (const match of linkMatches) {
    if (match[2].endsWith(".md")) {
      result.links.push(match[2]);
    }
  }

  result.wordCount = content
    .replace(/[#`*_\[\]()]/g, "")
    .split(/\s+/)
    .filter((word) => word).length;

  return result;
}

function analyzeDirectory(dir) {
  const results = [];

  function walk(currentDir) {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (
        stat.isDirectory() &&
        !entry.startsWith(".") &&
        entry !== "node_modules"
      ) {
        walk(fullPath);
      } else if (stat.isFile() && extname(entry) === ".md") {
        results.push(analyzeFile(fullPath));
      }
    }
  }

  walk(dir);
  return results;
}

function generateReport(results) {
  const report = {
    summary: {
      totalFiles: results.length,
      byTopicType: {},
      avgWordCount: 0,
      avgMaxDepth: 0,
      withMetadata: 0,
      totalIncludes: 0,
      totalLinks: 0,
    },
    issues: [],
    recommendations: [],
  };

  let totalWords = 0;
  let totalDepth = 0;

  for (const result of results) {
    report.summary.byTopicType[result.topicType] =
      (report.summary.byTopicType[result.topicType] || 0) + 1;

    totalWords += result.wordCount;
    totalDepth += result.maxDepth;

    if (result.hasMetadata) report.summary.withMetadata++;

    report.summary.totalIncludes += result.includes.length;
    report.summary.totalLinks += result.links.length;

    if (result.maxDepth > 4) {
      report.issues.push({
        file: result.path,
        issue: "見出し階層が深すぎます (推奨: 4レベルまで)",
        severity: "warning",
      });
    }

    if (result.wordCount > 2000) {
      report.issues.push({
        file: result.path,
        issue: "長文化しています (分割を検討)",
        severity: "info",
      });
    }

    if (!result.hasMetadata) {
      report.issues.push({
        file: result.path,
        issue: "YAMLメタデータがありません",
        severity: "info",
      });
    }

    if (result.topicType === "unknown") {
      report.issues.push({
        file: result.path,
        issue: "トピック種別が判定できません",
        severity: "warning",
      });
    }
  }

  report.summary.avgWordCount = results.length
    ? Math.round(totalWords / results.length)
    : 0;
  report.summary.avgMaxDepth = results.length
    ? (totalDepth / results.length).toFixed(1)
    : "0.0";

  const unknownRatio = results.length
    ? (report.summary.byTopicType.unknown || 0) / results.length
    : 0;
  if (unknownRatio > 0.3) {
    report.recommendations.push(
      "トピック種別が不明なファイルが多いです。命名規則を見直してください。",
    );
  }

  const metadataRatio = results.length
    ? report.summary.withMetadata / results.length
    : 0;
  if (metadataRatio < 0.5) {
    report.recommendations.push(
      "YAMLメタデータを追加すると検索性と管理性が向上します。",
    );
  }

  if (report.summary.totalIncludes === 0) {
    report.recommendations.push(
      "コンテンツ再利用が検出されませんでした。共通コンテンツの抽出を検討してください。",
    );
  }

  return report;
}

function printReport(report) {
  console.log("=== サマリー ===");
  console.log(`総ファイル数: ${report.summary.totalFiles}`);
  console.log(`平均単語数: ${report.summary.avgWordCount}`);
  console.log(`平均見出し深度: ${report.summary.avgMaxDepth}`);
  console.log(
    `メタデータあり: ${report.summary.withMetadata} (${report.summary.totalFiles === 0 ? 0 : Math.round((report.summary.withMetadata / report.summary.totalFiles) * 100)}%)`,
  );
  console.log(`インクルード数: ${report.summary.totalIncludes}`);
  console.log(`内部リンク数: ${report.summary.totalLinks}`);

  console.log("\n=== トピック種別 ===");
  for (const [type, count] of Object.entries(report.summary.byTopicType)) {
    const percent = report.summary.totalFiles
      ? Math.round((count / report.summary.totalFiles) * 100)
      : 0;
    console.log(`  ${type}: ${count} (${percent}%)`);
  }

  if (report.issues.length > 0) {
    console.log("\n=== 指摘事項 ===");
    report.issues.slice(0, 10).forEach((issue) => {
      console.log(`- ${issue.file}: ${issue.issue}`);
    });
  }

  if (report.recommendations.length > 0) {
    console.log("\n=== 推奨事項 ===");
    report.recommendations.forEach((rec) => console.log(`- ${rec}`));
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const inputArg = getArg(args, "--input");
  const outputArg = getArg(args, "--output");

  requireArg(inputArg, "--input");

  const inputPath = resolve(process.cwd(), inputArg);
  if (!existsSync(inputPath)) {
    console.error(`Error: path not found: ${inputPath}`);
    process.exit(EXIT_FILE_NOT_FOUND);
  }

  const stats = statSync(inputPath);
  if (!stats.isDirectory()) {
    console.error("Error: --input must be a directory");
    process.exit(EXIT_ARGS_ERROR);
  }

  const results = analyzeDirectory(inputPath);
  const report = generateReport(results);

  printReport(report);

  if (outputArg) {
    const outputPath = resolve(process.cwd(), outputArg);
    writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`\nReport written to ${outputPath}`);
  }

  process.exit(EXIT_SUCCESS);
}

try {
  main();
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
}
