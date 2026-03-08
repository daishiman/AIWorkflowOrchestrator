#!/usr/bin/env node
/**
 * detect-unassigned-tasks.mjs - 未完了タスク検出スクリプト
 *
 * コードベースからTODO/FIXME/HACK/XXXコメントを検出し、
 * 未完了タスク候補としてレポートする。
 *
 * 使用方法:
 *   node scripts/detect-unassigned-tasks.mjs --scan <dir> [--output <file>]
 *
 * 例:
 *   node scripts/detect-unassigned-tasks.mjs \
 *     --scan packages/shared/src \
 *     --output .tmp/unassigned-candidates.json
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from "fs";
import { join, extname, relative, dirname } from "path";

// 検出対象パターン
const COMMENT_PATTERNS = [
  { pattern: /\/\/\s*TODO:?\s*(.+)/gi, type: "TODO" },
  { pattern: /\/\/\s*FIXME:?\s*(.+)/gi, type: "FIXME" },
  { pattern: /\/\/\s*HACK:?\s*(.+)/gi, type: "HACK" },
  { pattern: /\/\/\s*XXX:?\s*(.+)/gi, type: "XXX" },
  { pattern: /\/\*\s*TODO:?\s*(.+?)\*\//gi, type: "TODO" },
  { pattern: /\/\*\s*FIXME:?\s*(.+?)\*\//gi, type: "FIXME" },
  { pattern: /#\s*TODO:?\s*(.+)/gi, type: "TODO" },
  { pattern: /#\s*FIXME:?\s*(.+)/gi, type: "FIXME" },
  { pattern: /<!--\s*TODO:?\s*(.+?)-->/gi, type: "TODO" },
  { pattern: /<!--\s*FIXME:?\s*(.+?)-->/gi, type: "FIXME" },
];

// 対象ファイル拡張子
const TARGET_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".py",
  ".sh",
  ".bash",
  ".md",
  ".html",
  ".css",
  ".scss",
  ".vue",
  ".svelte",
];

// 除外ディレクトリ
const EXCLUDE_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".turbo",
  "coverage",
  "__pycache__",
];

// 引数パース
function parseArgs(args) {
  const result = { scan: null, output: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--scan" && args[i + 1]) {
      result.scan = args[i + 1];
      i++;
    } else if (args[i] === "--output" && args[i + 1]) {
      result.output = args[i + 1];
      i++;
    }
  }

  return result;
}

// ファイル一覧を再帰的に取得
function getFiles(dir, baseDir = dir) {
  const files = [];

  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry)) {
        files.push(...getFiles(fullPath, baseDir));
      }
    } else if (stat.isFile()) {
      const ext = extname(entry).toLowerCase();
      if (TARGET_EXTENSIONS.includes(ext)) {
        files.push({
          path: fullPath,
          relativePath: relative(baseDir, fullPath),
        });
      }
    }
  }

  return files;
}

// ファイルからコメントを検出
function detectComments(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const findings = [];

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    for (const { pattern, type } of COMMENT_PATTERNS) {
      // パターンをリセット（globalフラグのため）
      pattern.lastIndex = 0;
      let match;

      while ((match = pattern.exec(line)) !== null) {
        findings.push({
          type,
          content: match[1].trim(),
          line: lineNum + 1,
          column: match.index + 1,
        });
      }
    }
  }

  return findings;
}

// 優先度を推測
function inferPriority(type, content) {
  const lowerContent = content.toLowerCase();

  // 高優先度キーワード
  if (
    lowerContent.includes("security") ||
    lowerContent.includes("urgent") ||
    lowerContent.includes("critical") ||
    lowerContent.includes("important") ||
    lowerContent.includes("セキュリティ") ||
    lowerContent.includes("緊急")
  ) {
    return "high";
  }

  // FIXMEは通常中優先度以上
  if (type === "FIXME" || type === "XXX") {
    return "medium";
  }

  // HACKは低優先度
  if (type === "HACK") {
    return "low";
  }

  return "medium";
}

// カテゴリを推測
function inferCategory(type, content) {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes("security") || lowerContent.includes("セキュリティ")) {
    return "sec";
  }
  if (lowerContent.includes("performance") || lowerContent.includes("パフォーマンス") || lowerContent.includes("perf")) {
    return "perf";
  }
  if (type === "FIXME" || lowerContent.includes("bug") || lowerContent.includes("バグ")) {
    return "bug";
  }
  if (type === "HACK" || lowerContent.includes("refactor") || lowerContent.includes("リファクタ")) {
    return "ref";
  }

  return "imp"; // デフォルトは改善
}

// メイン処理
function main() {
  const args = parseArgs(process.argv.slice(2));

  // 引数検証
  if (!args.scan) {
    console.error("Error: --scan is required");
    showUsage();
    process.exit(1);
  }

  console.log(`\n🔍 未完了タスク候補を検出中\n`);
  console.log(`スキャン対象: ${args.scan}`);
  if (args.output) {
    console.log(`出力先: ${args.output}`);
  }
  console.log("");

  // ファイル一覧取得
  const files = getFiles(args.scan);
  console.log(`対象ファイル数: ${files.length}\n`);

  // 検出結果
  const results = [];
  let totalFindings = 0;

  for (const file of files) {
    const findings = detectComments(file.path);

    if (findings.length > 0) {
      totalFindings += findings.length;

      for (const finding of findings) {
        results.push({
          file: file.relativePath,
          line: finding.line,
          type: finding.type,
          content: finding.content,
          priority: inferPriority(finding.type, finding.content),
          category: inferCategory(finding.type, finding.content),
        });
      }
    }
  }

  // 結果表示
  console.log("=".repeat(60));
  console.log("検出結果");
  console.log("=".repeat(60));

  if (results.length === 0) {
    console.log("\n✅ 未完了タスク候補は検出されませんでした\n");
  } else {
    // タイプ別集計
    const byType = {};
    for (const r of results) {
      byType[r.type] = (byType[r.type] || 0) + 1;
    }

    console.log(`\n検出数: ${totalFindings}件`);
    console.log(`内訳: ${Object.entries(byType).map(([k, v]) => `${k}: ${v}`).join(", ")}\n`);

    // 優先度別集計
    const byPriority = { high: 0, medium: 0, low: 0 };
    for (const r of results) {
      byPriority[r.priority]++;
    }
    console.log(`優先度: 高=${byPriority.high}, 中=${byPriority.medium}, 低=${byPriority.low}\n`);

    // 上位10件を表示
    console.log("検出内容（上位10件）:");
    const sorted = results.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    for (const r of sorted.slice(0, 10)) {
      console.log(`  [${r.priority.toUpperCase()}] ${r.type} - ${r.file}:${r.line}`);
      console.log(`    ${r.content.substring(0, 80)}${r.content.length > 80 ? "..." : ""}`);
    }

    if (results.length > 10) {
      console.log(`\n  ... 他 ${results.length - 10} 件`);
    }
  }

  // ファイル出力
  if (args.output) {
    const outputDir = dirname(args.output);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const output = {
      scannedAt: new Date().toISOString(),
      scanDir: args.scan,
      totalFiles: files.length,
      totalFindings: totalFindings,
      findings: results,
    };

    writeFileSync(args.output, JSON.stringify(output, null, 2), "utf-8");
    console.log(`\n✅ 結果を出力: ${args.output}`);
  }

  console.log("");
}

function showUsage() {
  console.error(`
Usage: node detect-unassigned-tasks.mjs --scan <dir> [--output <file>]

Options:
  --scan    スキャン対象ディレクトリ
  --output  結果出力ファイルパス（JSON）

Example:
  node detect-unassigned-tasks.mjs \\
    --scan packages/shared/src \\
    --output .tmp/unassigned-candidates.json
`);
}

main();
