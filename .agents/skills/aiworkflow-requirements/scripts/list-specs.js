#!/usr/bin/env node
/**
 * 仕様一覧スクリプト
 *
 * 用途: references/配下のドキュメント一覧と統計を表示
 * 実行: node scripts/list-specs.js [options]
 *
 * オプション:
 *   --stats, -s     統計情報を表示
 *   --topics, -t    トピック別に表示
 *   --help, -h      ヘルプ表示
 */

import { readdir, readFile, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REFS_DIR = join(__dirname, "..", "references");

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// トピックマッピング（prefix-based）
const TOPIC_MAP = {
  "概要・品質": [
    "overview.md",
    "master-design.md",
    "quality-requirements.md",
    "glossary.md",
  ],
  アーキテクチャ: [
    "architecture-monorepo.md",
    "architecture-patterns.md",
    "architecture-file-conversion.md",
    "architecture-database.md",
    "architecture-rag.md",
    "architecture-auth-security.md",
    "directory-structure.md",
  ],
  インターフェース: [
    "interfaces-workflow.md",
    "interfaces-converter.md",
    "interfaces-core.md",
    "interfaces-auth.md",
    "interfaces-rag.md",
    "interfaces-llm.md",
  ],
  API設計: ["api-core.md", "api-endpoints.md", "api-internal.md"],
  データベース: [
    "database-architecture.md",
    "database-implementation.md",
    "database-operations.md",
  ],
  "UI/UX": [
    "ui-ux-design-system.md",
    "ui-ux-components.md",
    "ui-ux-forms.md",
    "ui-ux-panels.md",
    "ui-ux-advanced.md",
  ],
  セキュリティ: [
    "security-principles.md",
    "security-implementation.md",
    "security-operations.md",
  ],
  技術スタック: [
    "technology-core.md",
    "technology-backend.md",
    "technology-devops.md",
  ],
  "Claude Code": [
    "claude-code-overview.md",
    "claude-code-skills-overview.md",
    "claude-code-skills-structure.md",
    "claude-code-skills-process.md",
    "claude-code-agents.md",
    "claude-code-commands.md",
  ],
  その他: [
    "deployment.md",
    "environment-variables.md",
    "error-handling.md",
    "local-agent.md",
    "discord-bot.md",
    "plugin-development.md",
    "task-workflow.md",
  ],
};

function printHelp() {
  console.log(`
${colors.bright}仕様一覧スクリプト${colors.reset}

${colors.cyan}使用方法:${colors.reset}
  node scripts/list-specs.js [options]

${colors.cyan}オプション:${colors.reset}
  --stats, -s     統計情報を表示
  --topics, -t    トピック別に表示
  --help, -h      ヘルプ表示
`);
}

async function getFileStats(filePath) {
  const content = await readFile(filePath, "utf-8");
  const lines = content.split("\n");
  const fileStat = await stat(filePath);

  // 見出しを抽出
  const headings = lines
    .filter((l) => l.startsWith("## "))
    .map((l) => l.replace(/^## /, ""))
    .slice(0, 5);

  return {
    lines: lines.length,
    size: fileStat.size,
    headings,
  };
}

async function listSpecs(options) {
  const files = await readdir(REFS_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md")).sort();

  if (options.topics) {
    // トピック別表示
    console.log(`\n${colors.bright}トピック別仕様一覧${colors.reset}\n`);

    for (const [topic, refFiles] of Object.entries(TOPIC_MAP)) {
      console.log(`${colors.cyan}${colors.bright}【${topic}】${colors.reset}`);
      for (const file of refFiles) {
        if (mdFiles.includes(file)) {
          const stats = await getFileStats(join(REFS_DIR, file));
          console.log(
            `  ${colors.green}references/${file}${colors.reset} (${stats.lines}行)`,
          );
        }
      }
      console.log("");
    }
    return;
  }

  // 通常の一覧表示
  console.log(`\n${colors.bright}仕様ファイル一覧${colors.reset}\n`);

  let totalLines = 0;
  let totalSize = 0;

  for (const file of mdFiles) {
    const stats = await getFileStats(join(REFS_DIR, file));
    totalLines += stats.lines;
    totalSize += stats.size;

    console.log(`${colors.green}references/${file}${colors.reset}`);
    console.log(
      `  ${colors.dim}${stats.lines}行 | ${(stats.size / 1024).toFixed(1)}KB${colors.reset}`,
    );

    if (options.stats && stats.headings.length > 0) {
      console.log(
        `  ${colors.dim}主要セクション: ${stats.headings.join(", ")}${colors.reset}`,
      );
    }
  }

  // サマリー
  console.log(
    `\n${colors.dim}─────────────────────────────────${colors.reset}`,
  );
  console.log(
    `${colors.bright}合計: ${mdFiles.length}ファイル | ${totalLines}行 | ${(totalSize / 1024).toFixed(1)}KB${colors.reset}\n`,
  );
}

// 引数パース
const args = process.argv.slice(2);
const options = {
  stats: args.includes("--stats") || args.includes("-s"),
  topics: args.includes("--topics") || args.includes("-t"),
};

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

listSpecs(options).catch((err) => {
  console.error("エラー:", err.message);
  process.exit(1);
});
