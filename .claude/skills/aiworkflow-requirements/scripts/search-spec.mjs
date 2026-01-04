#!/usr/bin/env node
/**
 * 仕様検索スクリプト
 *
 * 用途: references/配下のドキュメントからキーワード検索
 * 実行: node scripts/search-spec.mjs <keyword> [options]
 *
 * オプション:
 *   --context, -C <n>  前後n行を表示（デフォルト: 2）
 *   --files-only, -l   ファイル名のみ表示
 *   --count, -c        マッチ数のみ表示
 *   --help, -h         ヘルプ表示
 */

import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REFS_DIR = join(__dirname, "..", "references");

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function printHelp() {
  console.log(`
${colors.bright}仕様検索スクリプト${colors.reset}

${colors.cyan}使用方法:${colors.reset}
  node scripts/search-spec.mjs <keyword> [options]

${colors.cyan}オプション:${colors.reset}
  --context, -C <n>  前後n行を表示（デフォルト: 2）
  --files-only, -l   ファイル名のみ表示
  --count, -c        マッチ数のみ表示
  --case-sensitive   大文字小文字を区別
  --help, -h         ヘルプ表示

${colors.cyan}例:${colors.reset}
  node scripts/search-spec.mjs "認証"
  node scripts/search-spec.mjs "Turso" -C 5
  node scripts/search-spec.mjs "API" --files-only
  node scripts/search-spec.mjs "authentication" --case-sensitive
`);
}

function parseArgs(args) {
  const options = {
    keyword: null,
    context: 2,
    filesOnly: false,
    countOnly: false,
    caseSensitive: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (arg === "--context" || arg === "-C") {
      options.context = parseInt(args[++i], 10) || 2;
    } else if (arg === "--files-only" || arg === "-l") {
      options.filesOnly = true;
    } else if (arg === "--count" || arg === "-c") {
      options.countOnly = true;
    } else if (arg === "--case-sensitive") {
      options.caseSensitive = true;
    } else if (!arg.startsWith("-")) {
      options.keyword = arg;
    }
  }

  return options;
}

function highlightMatch(line, keyword, caseSensitive) {
  const flags = caseSensitive ? "g" : "gi";
  const regex = new RegExp(`(${escapeRegex(keyword)})`, flags);
  return line.replace(regex, `${colors.red}${colors.bright}$1${colors.reset}`);
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function searchInFile(filePath, keyword, options) {
  const content = await readFile(filePath, "utf-8");
  const lines = content.split("\n");
  const results = [];
  const flags = options.caseSensitive ? "" : "i";
  const regex = new RegExp(escapeRegex(keyword), flags);

  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      results.push({
        lineNum: i + 1,
        line: lines[i],
        context: {
          before: lines.slice(Math.max(0, i - options.context), i),
          after: lines.slice(i + 1, i + 1 + options.context),
        },
      });
    }
  }

  return results;
}

async function search(options) {
  const { keyword, filesOnly, countOnly, caseSensitive, context } = options;

  if (!keyword) {
    console.error(
      `${colors.red}エラー: 検索キーワードを指定してください${colors.reset}`,
    );
    console.log("使用方法: node scripts/search-spec.mjs <keyword>");
    process.exit(2);
  }

  const files = await readdir(REFS_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md")).sort();

  let totalMatches = 0;
  const fileResults = [];

  for (const file of mdFiles) {
    const filePath = join(REFS_DIR, file);
    const results = await searchInFile(filePath, keyword, options);

    if (results.length > 0) {
      totalMatches += results.length;
      fileResults.push({ file, results });
    }
  }

  // 結果出力
  if (countOnly) {
    console.log(`${totalMatches}`);
    return;
  }

  if (fileResults.length === 0) {
    console.log(
      `${colors.yellow}「${keyword}」に一致する結果はありません${colors.reset}`,
    );
    return;
  }

  console.log(
    `\n${colors.green}${colors.bright}検索結果: "${keyword}"${colors.reset} (${totalMatches}件 / ${fileResults.length}ファイル)\n`,
  );

  for (const { file, results } of fileResults) {
    console.log(
      `${colors.cyan}${colors.bright}references/${file}${colors.reset} (${results.length}件)`,
    );

    if (!filesOnly) {
      for (const { lineNum, line, context: ctx } of results) {
        console.log(
          `${colors.dim}─────────────────────────────────${colors.reset}`,
        );

        // 前のコンテキスト
        ctx.before.forEach((l, idx) => {
          const num = lineNum - ctx.before.length + idx;
          console.log(
            `${colors.dim}${num.toString().padStart(4)}│${colors.reset} ${l}`,
          );
        });

        // マッチ行
        const highlighted = highlightMatch(line, keyword, caseSensitive);
        console.log(
          `${colors.yellow}${lineNum.toString().padStart(4)}│${colors.reset} ${highlighted}`,
        );

        // 後のコンテキスト
        ctx.after.forEach((l, idx) => {
          const num = lineNum + 1 + idx;
          console.log(
            `${colors.dim}${num.toString().padStart(4)}│${colors.reset} ${l}`,
          );
        });
      }
      console.log("");
    }
  }

  // サマリー
  console.log(`${colors.dim}─────────────────────────────────${colors.reset}`);
  console.log(
    `${colors.green}合計: ${totalMatches}件 (${fileResults.length}ファイル)${colors.reset}\n`,
  );
}

// メイン実行
const args = process.argv.slice(2);
const options = parseArgs(args);
search(options).catch((err) => {
  console.error(`${colors.red}エラー:${colors.reset}`, err.message);
  process.exit(1);
});
