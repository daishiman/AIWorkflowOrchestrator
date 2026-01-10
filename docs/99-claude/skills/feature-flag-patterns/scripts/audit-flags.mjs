#!/usr/bin/env node
/**
 * audit-flags.mjs
 * 機能フラグの監査スクリプト
 *
 * 使用方法:
 *   node scripts/audit-flags.mjs <path>
 *
 * 例:
 *   node scripts/audit-flags.mjs src/flags/
 */

import { readdirSync, readFileSync } from "fs";
import { resolve, join } from "path";

const FLAG_PATTERNS = [
  /isEnabled\(['"]([^'"]+)['"]\)/g,
  /featureFlag\(['"]([^'"]+)['"]\)/g,
  /getFlag\(['"]([^'"]+)['"]\)/g,
  /FEATURE_([A-Z_]+)/g,
  /feature-([a-z-]+)/g,
];

function findFlags(content) {
  const flags = new Set();
  for (const pattern of FLAG_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      flags.add(match[1] || match[0]);
    }
  }
  return Array.from(flags);
}

function scanDirectory(dir) {
  const results = [];
  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = join(dir, file.name);
    if (file.isDirectory() && !file.name.startsWith(".")) {
      results.push(...scanDirectory(fullPath));
    } else if (
      file.isFile() &&
      (file.name.endsWith(".ts") ||
        file.name.endsWith(".js") ||
        file.name.endsWith(".tsx") ||
        file.name.endsWith(".jsx"))
    ) {
      const content = readFileSync(fullPath, "utf-8");
      const flags = findFlags(content);
      if (flags.length > 0) {
        results.push({ file: fullPath, flags });
      }
    }
  }
  return results;
}

function auditFlags(path) {
  console.log(`\n機能フラグ監査: ${path}\n`);
  console.log("─".repeat(50));

  const results = scanDirectory(resolve(path));
  const allFlags = new Map();

  for (const result of results) {
    for (const flag of result.flags) {
      if (!allFlags.has(flag)) {
        allFlags.set(flag, []);
      }
      allFlags.get(flag).push(result.file);
    }
  }

  console.log(`\n📊 発見されたフラグ: ${allFlags.size}件\n`);

  for (const [flag, files] of allFlags) {
    console.log(`  🏷️ ${flag}`);
    console.log(`     使用箇所: ${files.length}ファイル`);
  }

  console.log("\n" + "─".repeat(50));
  console.log("✅ 監査完了\n");
}

// メイン処理
const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(`
使用方法: node scripts/audit-flags.mjs <path>

オプション:
  --help, -h    このヘルプを表示

例:
  node scripts/audit-flags.mjs src/
  node scripts/audit-flags.mjs ./features/
`);
  process.exit(0);
}

auditFlags(args[0]);
