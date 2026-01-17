#!/usr/bin/env node

/**
 * GitHub Actions キャッシュサイズ見積もりツール
 *
 * Usage:
 *   node estimate-cache-size.mjs <directory>
 *   node estimate-cache-size.mjs <directory> --limit 10
 */

import { readdir, stat } from "fs/promises";
import { join, extname } from "path";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;

const DEFAULT_LIMIT_GB = 10;
const COMPRESSION_RATIOS = {
  ".js": 0.3,
  ".ts": 0.3,
  ".jsx": 0.3,
  ".tsx": 0.3,
  ".json": 0.2,
  ".md": 0.4,
  ".txt": 0.4,
  ".html": 0.3,
  ".css": 0.3,
  ".svg": 0.3,
  ".xml": 0.3,
  ".yml": 0.4,
  ".yaml": 0.4,
  ".png": 0.95,
  ".jpg": 0.98,
  ".jpeg": 0.98,
  ".gif": 0.95,
  ".zip": 0.98,
  ".tar": 0.98,
  ".gz": 0.98,
  ".woff": 0.95,
  ".woff2": 0.95,
  ".ttf": 0.95,
  default: 0.5,
};

function showHelp() {
  console.log(`
GitHub Actions Cache Size Estimator

Usage:
  node estimate-cache-size.mjs <directory> [--limit <gb>]

Options:
  --limit <gb>  キャッシュ制限 (default: 10)
  -h, --help    このヘルプを表示

Examples:
  node estimate-cache-size.mjs ~/.pnpm
  node estimate-cache-size.mjs node_modules --limit 5
`);
}

function parseArgs(args) {
  const options = {
    directory: null,
    limitGb: DEFAULT_LIMIT_GB,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      showHelp();
      process.exit(EXIT_SUCCESS);
    }

    if (arg === "--limit") {
      const value = args[i + 1];
      if (!value || value.startsWith("--")) {
        console.error("Error: --limit requires a value");
        process.exit(EXIT_ARGS_ERROR);
      }
      const parsed = Number.parseFloat(value);
      if (Number.isNaN(parsed) || parsed <= 0) {
        console.error("Error: --limit must be a positive number");
        process.exit(EXIT_ARGS_ERROR);
      }
      options.limitGb = parsed;
      i += 1;
      continue;
    }

    if (arg.startsWith("-")) {
      console.error(`Error: Unknown option ${arg}`);
      process.exit(EXIT_ARGS_ERROR);
    }

    if (!options.directory) {
      options.directory = arg;
    } else {
      console.error("Error: multiple directories provided");
      process.exit(EXIT_ARGS_ERROR);
    }
  }

  return options;
}

class CacheSizeEstimator {
  constructor(directory, limitGb) {
    this.directory = directory;
    this.limitGb = limitGb;
    this.limitBytes = limitGb * 1024 * 1024 * 1024;
    this.totalSize = 0;
    this.totalFiles = 0;
    this.filesByExt = {};
    this.sizeByExt = {};
    this.largeFiles = [];
  }

  async analyze() {
    console.log(`Analyzing directory: ${this.directory}\n`);

    try {
      await this.scanDirectory(this.directory);
      this.printResults();
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(EXIT_ERROR);
    }
  }

  async scanDirectory(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      console.error(`Warning: cannot read directory: ${dir}`);
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === ".git" || entry.name === ".DS_Store") {
          continue;
        }
        await this.scanDirectory(fullPath);
      } else if (entry.isFile()) {
        await this.processFile(fullPath);
      }
    }
  }

  async processFile(filePath) {
    try {
      const stats = await stat(filePath);
      const size = stats.size;
      const ext = extname(filePath).toLowerCase();

      this.totalSize += size;
      this.totalFiles += 1;

      this.filesByExt[ext] = (this.filesByExt[ext] || 0) + 1;
      this.sizeByExt[ext] = (this.sizeByExt[ext] || 0) + size;

      if (size > 10 * 1024 * 1024) {
        this.largeFiles.push({
          path: filePath,
          size,
          ext,
        });
      }
    } catch {
      // ignore file errors
    }
  }

  estimateCompressedSize() {
    let compressedSize = 0;

    for (const [ext, size] of Object.entries(this.sizeByExt)) {
      const ratio = COMPRESSION_RATIOS[ext] || COMPRESSION_RATIOS.default;
      compressedSize += size * ratio;
    }

    return compressedSize;
  }

  printResults() {
    console.log("Cache Size Analysis\n");
    console.log("=".repeat(60));

    console.log(`\nDirectory: ${this.directory}`);
    console.log(`Total files: ${this.totalFiles.toLocaleString()}`);
    console.log(`Total size: ${this.formatBytes(this.totalSize)}`);

    const compressedSize = this.estimateCompressedSize();
    const compressionRatio = (
      (1 - compressedSize / this.totalSize) *
      100
    ).toFixed(1);

    console.log(
      `\nEstimated compressed size: ${this.formatBytes(compressedSize)}`,
    );
    console.log(`Compression ratio: ${compressionRatio}%`);

    const percentOfLimit = ((compressedSize / this.limitBytes) * 100).toFixed(
      1,
    );
    console.log(`\nCache limit: ${this.limitGb}GB`);
    console.log(`Usage: ${percentOfLimit}% of limit`);

    if (compressedSize > this.limitBytes) {
      console.log(
        `Warning: exceeds limit by ${this.formatBytes(compressedSize - this.limitBytes)}`,
      );
    } else if (percentOfLimit > 80) {
      console.log(`Warning: approaching limit (${percentOfLimit}%)`);
    } else {
      console.log("Within cache limit");
    }

    console.log(`\nTop File Types by Size\n`);
    console.log("-".repeat(60));
    console.log(
      ` ${"Ext".padEnd(10)} ${"Count".padStart(8)}  ${"Size".padStart(12)}  ${"%".padStart(6)}`,
    );
    console.log("-".repeat(60));

    const sortedExts = Object.entries(this.sizeByExt)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    for (const [ext, size] of sortedExts) {
      const count = this.filesByExt[ext];
      const percent = ((size / this.totalSize) * 100).toFixed(1);
      const extLabel = ext || "(no ext)";

      console.log(
        ` ${extLabel.padEnd(10)} ${count.toString().padStart(8)}  ${this.formatBytes(size).padStart(12)}  ${percent.padStart(5)}%`,
      );
    }

    if (this.largeFiles.length > 0) {
      console.log(`\nLarge Files (>10MB)\n`);
      console.log("-".repeat(60));

      this.largeFiles
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .forEach((file) => {
          const relativePath = file.path.replace(this.directory, ".");
          console.log(
            `   ${this.formatBytes(file.size).padStart(10)}  ${relativePath}`,
          );
        });
    }

    console.log(`\nRecommendations\n`);
    console.log("-".repeat(60));

    if (compressedSize > this.limitBytes) {
      console.log("  • Split cache into multiple smaller caches");
      console.log("  • Exclude unnecessary files or directories");
      console.log("  • Consider docker cache-to/cache-from");
    } else if (percentOfLimit > 80) {
      console.log("  • Monitor cache size growth");
      console.log("  • Review if all cached files are necessary");
    }

    if (this.largeFiles.length > 0) {
      console.log("  • Review large files for exclusion");
    }

    const textExtensions = [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".json",
      ".md",
      ".css",
    ];
    const textSize = textExtensions.reduce(
      (sum, ext) => sum + (this.sizeByExt[ext] || 0),
      0,
    );
    const textPercent = (textSize / this.totalSize) * 100;

    if (textPercent > 50) {
      console.log(
        "  • High percentage of text files - good compression expected",
      );
    }

    console.log("\n" + "=".repeat(60) + "\n");
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);

    return `${value.toFixed(2)} ${units[i]}`;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  const options = parseArgs(args);
  if (!options.directory) {
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  const estimator = new CacheSizeEstimator(options.directory, options.limitGb);
  await estimator.analyze();
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(EXIT_ERROR);
});
