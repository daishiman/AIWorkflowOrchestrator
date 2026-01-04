#!/usr/bin/env node

/**
 * コンテキスト境界分析スクリプト
 *
 * Usage:
 *   node analyze-context-boundaries.mjs <directory> [--depth <n>]
 */

import { readdir, readFile, stat } from "fs/promises";
import { join, extname, basename } from "path";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;

const PATTERNS = {
  contextIndicators: [
    "domain",
    "context",
    "module",
    "bounded-context",
    "service",
    "application",
  ],
  domainPatterns: [
    /entity/i,
    /aggregate/i,
    /repository/i,
    /service/i,
    /valueobject/i,
    /event/i,
  ],
  crossContextPatterns: [
    /from\s+['"]\.\.\/\.\.\//,
    /from\s+['"]@\w+\//,
    /import.*from.*contexts\//i,
  ],
  sharedKernelPatterns: [/shared/i, /common/i, /kernel/i, /core/i],
};

function showHelp() {
  console.log(`
コンテキスト境界分析ツール

Usage:
  node analyze-context-boundaries.mjs <directory> [--depth <n>]

Options:
  --depth <n>     探索深度 (default: 4)
  -h, --help      このヘルプを表示

Examples:
  node analyze-context-boundaries.mjs src/
  node analyze-context-boundaries.mjs packages --depth 3
`);
}

function parseArgs(args) {
  const options = {
    target: null,
    maxDepth: 4,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      showHelp();
      process.exit(EXIT_SUCCESS);
    }

    if (arg === "--depth") {
      const value = args[i + 1];
      if (!value || value.startsWith("--")) {
        console.error("Error: --depth requires a value");
        process.exit(EXIT_ARGS_ERROR);
      }
      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        console.error("Error: --depth must be a positive number");
        process.exit(EXIT_ARGS_ERROR);
      }
      options.maxDepth = parsed;
      i += 1;
      continue;
    }

    if (arg.startsWith("-")) {
      console.error(`Error: Unknown option ${arg}`);
      process.exit(EXIT_ARGS_ERROR);
    }

    if (!options.target) {
      options.target = arg;
    } else {
      console.error("Error: multiple target directories provided");
      process.exit(EXIT_ARGS_ERROR);
    }
  }

  return options;
}

async function analyzeDirectory(dir, depth = 0, maxDepth = 4) {
  const result = {
    name: basename(dir),
    path: dir,
    isContextCandidate: false,
    hasDomainLayer: false,
    children: [],
    domainFiles: [],
    crossContextImports: [],
  };

  if (depth > maxDepth) {
    return result;
  }

  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") {
        continue;
      }

      const isContextCandidate = PATTERNS.contextIndicators.some((indicator) =>
        entry.name.toLowerCase().includes(indicator),
      );

      const childAnalysis = await analyzeDirectory(
        fullPath,
        depth + 1,
        maxDepth,
      );
      childAnalysis.isContextCandidate = isContextCandidate;

      result.children.push(childAnalysis);

      if (entry.name.toLowerCase() === "domain") {
        result.hasDomainLayer = true;
      }
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      if ([".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
        const isDomainFile = PATTERNS.domainPatterns.some((pattern) =>
          pattern.test(entry.name),
        );

        if (isDomainFile) {
          result.domainFiles.push({
            name: entry.name,
            path: fullPath,
          });
        }

        try {
          const content = await readFile(fullPath, "utf-8");
          const crossImports = detectCrossContextImports(content);
          if (crossImports.length > 0) {
            result.crossContextImports.push({
              file: fullPath,
              imports: crossImports,
            });
          }
        } catch {
          // ignore read errors
        }
      }
    }
  }

  return result;
}

function detectCrossContextImports(content) {
  const imports = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];

      if (importPath.startsWith("../..")) {
        imports.push({
          type: "parent_reference",
          path: importPath,
        });
      }

      if (/contexts?\//.test(importPath)) {
        imports.push({
          type: "context_reference",
          path: importPath,
        });
      }
    }
  }

  return imports;
}

function extractContextCandidates(analysis, candidates = []) {
  if (analysis.hasDomainLayer || analysis.domainFiles.length > 0) {
    candidates.push({
      name: analysis.name,
      path: analysis.path,
      reason: analysis.hasDomainLayer
        ? "ドメイン層を持つ"
        : `${analysis.domainFiles.length}個のドメインファイルを含む`,
      domainFiles: analysis.domainFiles,
      crossContextImports: analysis.crossContextImports,
    });
  }

  if (analysis.isContextCandidate && !analysis.hasDomainLayer) {
    candidates.push({
      name: analysis.name,
      path: analysis.path,
      reason: "コンテキストを示唆するディレクトリ名",
      domainFiles: analysis.domainFiles,
      crossContextImports: analysis.crossContextImports,
    });
  }

  for (const child of analysis.children) {
    extractContextCandidates(child, candidates);
  }

  return candidates;
}

function detectSharedKernelCandidates(analysis, candidates = []) {
  const isSharedCandidate = PATTERNS.sharedKernelPatterns.some((pattern) =>
    pattern.test(analysis.name),
  );

  if (isSharedCandidate && analysis.domainFiles.length > 0) {
    candidates.push({
      name: analysis.name,
      path: analysis.path,
      domainFiles: analysis.domainFiles,
    });
  }

  for (const child of analysis.children) {
    detectSharedKernelCandidates(child, candidates);
  }

  return candidates;
}

function analyzeContextDependencies(candidates) {
  const dependencies = [];

  for (const candidate of candidates) {
    for (const importInfo of candidate.crossContextImports) {
      for (const imp of importInfo.imports) {
        dependencies.push({
          from: candidate.name,
          fromFile: importInfo.file,
          to: imp.path,
          type: imp.type,
        });
      }
    }
  }

  return dependencies;
}

function generateReport(candidates, sharedCandidates, dependencies) {
  const report = [];

  report.push("# コンテキスト境界分析レポート\n");
  report.push(`生成日時: ${new Date().toISOString()}\n`);

  report.push("\n## サマリー\n");
  report.push(`- コンテキスト候補: ${candidates.length}件`);
  report.push(`- 共有カーネル候補: ${sharedCandidates.length}件`);
  report.push(`- コンテキスト間参照: ${dependencies.length}件\n`);

  if (candidates.length > 0) {
    report.push("\n## コンテキスト候補\n");
    for (const candidate of candidates) {
      report.push(`### ${candidate.name}`);
      report.push(`- パス: ${candidate.path}`);
      report.push(`- 理由: ${candidate.reason}`);
      if (candidate.domainFiles.length > 0) {
        report.push("- ドメインファイル:");
        for (const file of candidate.domainFiles.slice(0, 5)) {
          report.push(`  - ${file.name}`);
        }
        if (candidate.domainFiles.length > 5) {
          report.push(`  - ... 他 ${candidate.domainFiles.length - 5}件`);
        }
      }
      report.push("");
    }
  }

  if (sharedCandidates.length > 0) {
    report.push("\n## 共有カーネル候補\n");
    report.push("共有範囲は最小限にしてください。\n");
    for (const candidate of sharedCandidates) {
      report.push(`### ${candidate.name}`);
      report.push(`- パス: ${candidate.path}`);
      report.push(`- ドメインファイル数: ${candidate.domainFiles.length}`);
      report.push("");
    }
  }

  if (dependencies.length > 0) {
    report.push("\n## コンテキスト間の参照\n");
    report.push("境界を越える参照はACLの導入を検討してください。\n");

    for (const dep of dependencies) {
      report.push(`- **${dep.from}** → ${dep.to}`);
      report.push(`  - ファイル: ${dep.fromFile}`);
      report.push(`  - 種類: ${dep.type}`);
    }
  }

  report.push("\n## 推奨アクション\n");
  report.push("1. コンテキストごとにユビキタス言語を定義");
  report.push("2. 境界を越える参照にACLを検討");
  report.push("3. 共有カーネルの範囲を最小限に");
  report.push("4. コンテキストマップで可視化");

  return report.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options.target) {
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  try {
    const stats = await stat(options.target);
    if (!stats.isDirectory()) {
      console.error(`Error: ${options.target} はディレクトリではありません`);
      process.exit(EXIT_ARGS_ERROR);
    }
  } catch {
    console.error(`Error: ディレクトリが見つかりません: ${options.target}`);
    process.exit(EXIT_ARGS_ERROR);
  }

  console.log(`分析対象: ${options.target}`);
  console.log("ディレクトリ構造を分析中...");

  const analysis = await analyzeDirectory(
    options.target,
    0,
    options.maxDepth,
  );

  const candidates = extractContextCandidates(analysis);
  const sharedCandidates = detectSharedKernelCandidates(analysis);
  const dependencies = analyzeContextDependencies(candidates);

  const report = generateReport(candidates, sharedCandidates, dependencies);
  console.log("\n" + report);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(EXIT_ERROR);
});
