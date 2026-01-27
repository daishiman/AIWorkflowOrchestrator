#!/usr/bin/env node
/**
 * 見出し番号削除スクリプト
 *
 * 用途: references/配下のMarkdownファイルから番号付き見出しを削除
 * 実行: node scripts/remove-heading-numbers.js [--dry-run]
 *
 * 変換例:
 *   ## 1. 概要 → ## 概要
 *   ### 1.1 目的 → ### 目的
 *   ### 2.1.1 詳細 → ### 詳細
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REFS_DIR = join(__dirname, "..", "references");

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  dim: "\x1b[2m",
};

// 番号付き見出しのパターン
// ## 1. Title, ### 1.1 Title, ### 1.1.1 Title などにマッチ
const HEADING_NUMBER_PATTERN = /^(#{2,6})\s+(\d+\.)+\s*(\d+\.?)?\s*/gm;

function removeHeadingNumbers(content) {
  let changeCount = 0;

  const newContent = content.replace(
    HEADING_NUMBER_PATTERN,
    (match, hashes) => {
      changeCount++;
      return `${hashes} `;
    },
  );

  return { newContent, changeCount };
}

async function processFile(filePath, dryRun) {
  const content = await readFile(filePath, "utf-8");
  const { newContent, changeCount } = removeHeadingNumbers(content);

  if (changeCount === 0) {
    return { changed: false, count: 0 };
  }

  if (!dryRun) {
    await writeFile(filePath, newContent);
  }

  return { changed: true, count: changeCount };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log(`${colors.blue}見出し番号削除スクリプト${colors.reset}`);
  console.log(dryRun ? "(ドライラン - 実際の変更なし)\n" : "\n");

  const files = await readdir(REFS_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md")).sort();

  let totalChanges = 0;
  let filesChanged = 0;

  for (const file of mdFiles) {
    const filePath = join(REFS_DIR, file);
    const { changed, count } = await processFile(filePath, dryRun);

    if (changed) {
      filesChanged++;
      totalChanges += count;
      console.log(
        `${colors.green}✅${colors.reset} ${file}: ${count}件の番号を削除`,
      );
    }
  }

  console.log(
    `\n${colors.dim}─────────────────────────────────${colors.reset}`,
  );
  console.log(
    `${colors.green}完了: ${filesChanged}ファイル / ${totalChanges}件の変更${colors.reset}`,
  );

  if (dryRun) {
    console.log(
      `\n${colors.yellow}実際に変更するには --dry-run を外して実行してください${colors.reset}`,
    );
  }
}

main().catch((err) => {
  console.error("エラー:", err.message);
  process.exit(1);
});
