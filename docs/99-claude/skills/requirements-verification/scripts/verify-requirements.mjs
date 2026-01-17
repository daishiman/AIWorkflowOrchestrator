#!/usr/bin/env node

import { readFileSync, statSync } from "fs";
import { resolve } from "path";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

const AMBIGUOUS_PATTERNS = [
  /高速|速い|遅い|適切|十分|良い|悪い|使いやすい|分かりやすい/g,
  /など|等|その他|いくつか|主な/g,
  /場合によって|必要に応じて|状況次第|適宜|可能であれば/g,
];

function showHelp() {
  console.log(`
Usage: node verify-requirements.mjs <file> [options]

Options:
  --min-quality <0-100>  Minimum quality score to pass
  --json                 Output JSON report
  -h, --help             Show this help message
  `);
}

function fail(message, code) {
  console.error(message);
  process.exit(code);
}

function parseArgs(args) {
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const filePath = args.find((arg) => !arg.startsWith("-"));
  if (!filePath) {
    fail("Usage: node verify-requirements.mjs <file>", EXIT_ARGS_ERROR);
  }

  const minQualityIndex = args.indexOf("--min-quality");
  let minQuality = null;
  if (minQualityIndex !== -1) {
    const value = args[minQualityIndex + 1];
    if (!value || value.startsWith("-")) {
      fail("Missing value for --min-quality", EXIT_ARGS_ERROR);
    }
    minQuality = Number.parseInt(value, 10);
    if (Number.isNaN(minQuality) || minQuality < 0 || minQuality > 100) {
      fail("--min-quality must be between 0 and 100", EXIT_ARGS_ERROR);
    }
  }

  return {
    filePath,
    minQuality,
    json: args.includes("--json"),
  };
}

function readFile(path) {
  try {
    statSync(path);
  } catch {
    fail(`File not found: ${path}`, EXIT_FILE_MISSING);
  }
  return readFileSync(path, "utf-8");
}

function analyze(content) {
  const lines = content.split("\n");
  const requirementIdPattern = /\b(FR|NFR)-\d{2,4}\b/g;
  let total = 0;
  let withId = 0;
  let withAcceptance = 0;
  let ambiguousCount = 0;

  const ambiguousLines = [];

  lines.forEach((line, index) => {
    const ids = line.match(requirementIdPattern);
    if (ids) {
      total += ids.length;
      withId += ids.length;
    }

    if (
      /\bGiven\b/i.test(line) &&
      /\bWhen\b/i.test(line) &&
      /\bThen\b/i.test(line)
    ) {
      withAcceptance += 1;
    }

    for (const pattern of AMBIGUOUS_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        ambiguousCount += match.length;
        ambiguousLines.push({
          line: index + 1,
          text: line.trim(),
          keyword: match[0],
        });
        break;
      }
    }
  });

  const lineCount = lines.length || 1;
  const clarity = Math.max(
    0,
    Math.round((1 - ambiguousCount / lineCount) * 100),
  );
  const completeness =
    total > 0 ? Math.round((withAcceptance / total) * 100) : 0;
  const consistency = 100;
  const verifiability =
    total > 0 ? Math.round((withAcceptance / total) * 100) : 0;
  const quality = Math.round(
    (clarity + completeness + consistency + verifiability) / 4,
  );

  return {
    metrics: {
      total,
      withId,
      withAcceptance,
      ambiguousCount,
      quality,
    },
    clarity,
    completeness,
    consistency,
    verifiability,
    ambiguousLines,
  };
}

function outputText(result) {
  console.log("=".repeat(72));
  console.log("要件検証レポート");
  console.log("=".repeat(72));
  console.log(`\n総要件数: ${result.metrics.total}`);
  console.log(`ID付き要件: ${result.metrics.withId}/${result.metrics.total}`);
  console.log(
    `受け入れ基準あり: ${result.metrics.withAcceptance}/${result.metrics.total}`,
  );
  console.log("\n品質メトリクス:");
  console.log(`  明確性: ${result.clarity}%`);
  console.log(`  完全性: ${result.completeness}%`);
  console.log(`  一貫性: ${result.consistency}%`);
  console.log(`  検証可能性: ${result.verifiability}%`);
  console.log(`\n総合品質スコア: ${result.metrics.quality}%`);

  if (result.ambiguousLines.length > 0) {
    console.log(`\n曖昧な表現（${result.ambiguousLines.length}件）:`);
    result.ambiguousLines.slice(0, 5).forEach((item) => {
      console.log(`  行${item.line}: 「${item.keyword}」 → ${item.text}`);
    });
  }
}

function main() {
  const { filePath, minQuality, json } = parseArgs(process.argv.slice(2));
  const resolvedPath = resolve(filePath);
  const content = readFile(resolvedPath);
  const result = analyze(content);

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    outputText(result);
  }

  if (minQuality !== null && result.metrics.quality < minQuality) {
    fail(
      `Quality score ${result.metrics.quality}% is below ${minQuality}%`,
      EXIT_VALIDATION_ERROR,
    );
  }

  process.exit(EXIT_SUCCESS);
}

try {
  main();
} catch (error) {
  fail(error.message || "Unexpected error", EXIT_ERROR);
}
