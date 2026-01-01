#!/usr/bin/env node
import fs from "fs/promises";
import { existsSync } from "fs";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;

function showHelp() {
  console.log(`
Backlog analyzer

Usage:
  node analyze-backlog.mjs <backlog-file>

Options:
  -h, --help    Show this help message
  `);
}

async function analyzeBacklog(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");

  const stats = {
    total: 0,
    byPriority: { High: 0, Medium: 0, Low: 0 },
    bySize: { S: 0, M: 0, L: 0, XL: 0 },
    estimated: 0,
    withAcceptanceCriteria: 0,
  };

  let currentStory = null;

  lines.forEach((line) => {
    if (line.match(/^##\s+US-\d+/)) {
      stats.total++;
      currentStory = { hasAC: false, hasEstimate: false };
    }
    if (line.includes("優先度:")) {
      const priority = line.match(/(High|Medium|Low)/)?.[1];
      if (priority) stats.byPriority[priority]++;
    }
    if (line.includes("見積もり:")) {
      stats.estimated++;
      const size = line.match(/([SMLX]+)/)?.[1];
      if (size) stats.bySize[size]++;
    }
    if (
      line.includes("Given") &&
      line.includes("When") &&
      line.includes("Then")
    ) {
      stats.withAcceptanceCriteria++;
    }
  });

  return stats;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  if (args.length !== 1 || args[0].startsWith("-")) {
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  const filePath = args[0];
  if (!existsSync(filePath)) {
    console.error("Error: backlog file not found");
    process.exit(EXIT_FILE_MISSING);
  }

  const stats = await analyzeBacklog(filePath);

  console.log("=".repeat(60));
  console.log("バックログ分析レポート");
  console.log("=".repeat(60));
  console.log(`\n総ストーリー数: ${stats.total}`);
  console.log(`\n優先度別:`);
  console.log(`  High: ${stats.byPriority.High}`);
  console.log(`  Medium: ${stats.byPriority.Medium}`);
  console.log(`  Low: ${stats.byPriority.Low}`);
  console.log(`\nサイズ別:`);
  Object.entries(stats.bySize).forEach(([size, count]) => {
    if (count > 0) console.log(`  ${size}: ${count}`);
  });
  const estimatedRate =
    stats.total === 0 ? 0 : Math.round((stats.estimated / stats.total) * 100);
  const acRate =
    stats.total === 0
      ? 0
      : Math.round((stats.withAcceptanceCriteria / stats.total) * 100);

  console.log(
    `\n見積もり済み: ${stats.estimated}/${stats.total} (${estimatedRate}%)`,
  );
  console.log(
    `受け入れ基準あり: ${stats.withAcceptanceCriteria}/${stats.total} (${acRate}%)`,
  );

  const readiness =
    stats.total === 0
      ? 0
      : Math.round(
          (stats.estimated / stats.total) * 0.5 +
            (stats.withAcceptanceCriteria / stats.total) * 0.5,
        ) * 100;
  console.log(`\n総合健全性: ${readiness}%`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(EXIT_ERROR);
});
