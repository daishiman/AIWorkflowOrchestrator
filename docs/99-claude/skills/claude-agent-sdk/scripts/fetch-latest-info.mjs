#!/usr/bin/env node

/**
 * fetch-latest-info.mjs
 *
 * Claude Agent SDK の最新情報を取得するスクリプト。
 * 公式ドキュメント、GitHub、npm から最新情報を収集し、更新が必要な箇所を報告する。
 *
 * Usage:
 *   node fetch-latest-info.mjs [options]
 *
 * Options:
 *   --category <type>  取得カテゴリ (docs|github|npm|all) デフォルト: all
 *   --output <path>    出力先ファイル デフォルト: stdout
 *   --json             JSON形式で出力
 *   -h, --help         ヘルプを表示
 */

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

// ===== 定数定義 =====

const OFFICIAL_URLS = {
  docs: {
    overview: "https://platform.claude.com/docs/en/agent-sdk/overview",
    quickstart: "https://platform.claude.com/docs/en/agent-sdk/quickstart",
    typescript: "https://platform.claude.com/docs/en/agent-sdk/typescript",
    typescriptV2:
      "https://platform.claude.com/docs/en/agent-sdk/typescript-v2-preview",
    hooks: "https://platform.claude.com/docs/en/agent-sdk/hooks",
    permissions: "https://platform.claude.com/docs/en/agent-sdk/permissions",
    mcp: "https://platform.claude.com/docs/en/agent-sdk/mcp",
    streaming:
      "https://platform.claude.com/docs/en/agent-sdk/streaming-vs-single-mode",
    secureDeployment:
      "https://platform.claude.com/docs/en/agent-sdk/secure-deployment",
    hosting: "https://platform.claude.com/docs/en/agent-sdk/hosting",
  },
  github: {
    typescriptSdk: "https://github.com/anthropics/claude-agent-sdk-typescript",
    pythonSdk: "https://github.com/anthropics/claude-agent-sdk-python",
    demos: "https://github.com/anthropics/claude-agent-sdk-demos",
    changelog:
      "https://github.com/anthropics/claude-agent-sdk-typescript/blob/main/CHANGELOG.md",
  },
  npm: {
    package: "https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk",
    registry:
      "https://registry.npmjs.org/@anthropic-ai/claude-agent-sdk/latest",
  },
};

// ===== ヘルパー関数 =====

function parseArgs(args) {
  const result = {
    category: "all",
    output: null,
    json: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-h" || arg === "--help") {
      result.help = true;
    } else if (arg === "--category" && args[i + 1]) {
      result.category = args[++i];
    } else if (arg === "--output" && args[i + 1]) {
      result.output = args[++i];
    } else if (arg === "--json") {
      result.json = true;
    }
  }

  return result;
}

function showHelp() {
  console.log(`
fetch-latest-info.mjs - Claude Agent SDK 最新情報取得

Usage:
  node fetch-latest-info.mjs [options]

Options:
  --category <type>  取得カテゴリ
                     docs   - 公式ドキュメントURL一覧
                     github - GitHubリポジトリ情報
                     npm    - npmパッケージ情報
                     all    - すべて (デフォルト)

  --output <path>    出力先ファイル (デフォルト: stdout)
  --json             JSON形式で出力
  -h, --help         このヘルプを表示

Examples:
  # 全情報を取得
  node fetch-latest-info.mjs

  # npmパッケージ情報のみ
  node fetch-latest-info.mjs --category npm

  # JSON形式でファイル出力
  node fetch-latest-info.mjs --json --output latest-info.json

調査優先順位:
  高: CHANGELOG (破壊的変更の早期検知)
  高: TypeScript V2 Preview (次期API仕様)
  中: Hooks ドキュメント (新規フックイベント)
  中: Secure Deployment (セキュリティ更新)
  低: Demos リポジトリ (実装パターン参考)
`);
}

async function fetchNpmInfo() {
  const info = {
    name: "@anthropic-ai/claude-agent-sdk",
    latestVersion: null,
    publishedDate: null,
    error: null,
  };

  try {
    const result = execSync(
      "npm view @anthropic-ai/claude-agent-sdk version 2>/dev/null",
      { encoding: "utf-8" },
    ).trim();
    info.latestVersion = result;

    const timeResult = execSync(
      "npm view @anthropic-ai/claude-agent-sdk time --json 2>/dev/null",
      { encoding: "utf-8" },
    );
    const times = JSON.parse(timeResult);
    info.publishedDate = times[result];
  } catch (error) {
    info.error = "npm info fetch failed: " + error.message;
  }

  return info;
}

function getDocsUrls() {
  return Object.entries(OFFICIAL_URLS.docs).map(([key, url]) => ({
    name: key,
    url,
    category: "docs",
  }));
}

function getGithubUrls() {
  return Object.entries(OFFICIAL_URLS.github).map(([key, url]) => ({
    name: key,
    url,
    category: "github",
  }));
}

// ===== メイン処理 =====

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  const result = {
    fetchedAt: new Date().toISOString(),
    category: args.category,
    data: {},
  };

  // カテゴリに応じてデータを収集
  if (args.category === "all" || args.category === "docs") {
    result.data.docs = getDocsUrls();
  }

  if (args.category === "all" || args.category === "github") {
    result.data.github = getGithubUrls();
  }

  if (args.category === "all" || args.category === "npm") {
    result.data.npm = await fetchNpmInfo();
  }

  // 出力
  if (args.json) {
    const output = JSON.stringify(result, null, 2);
    if (args.output) {
      writeFileSync(args.output, output);
      console.log(`✓ 出力完了: ${args.output}`);
    } else {
      console.log(output);
    }
  } else {
    // テキスト形式で出力
    console.log("=".repeat(60));
    console.log("Claude Agent SDK 最新情報");
    console.log(`取得日時: ${result.fetchedAt}`);
    console.log("=".repeat(60));

    if (result.data.npm) {
      console.log("\n## npm パッケージ情報\n");
      if (result.data.npm.error) {
        console.log(`  エラー: ${result.data.npm.error}`);
      } else {
        console.log(`  パッケージ: ${result.data.npm.name}`);
        console.log(`  最新バージョン: ${result.data.npm.latestVersion}`);
        console.log(`  公開日: ${result.data.npm.publishedDate}`);
      }
    }

    if (result.data.docs) {
      console.log("\n## 公式ドキュメントURL\n");
      result.data.docs.forEach(({ name, url }) => {
        console.log(`  - ${name}: ${url}`);
      });
    }

    if (result.data.github) {
      console.log("\n## GitHub リポジトリURL\n");
      result.data.github.forEach(({ name, url }) => {
        console.log(`  - ${name}: ${url}`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("調査推奨事項:");
    console.log("  1. CHANGELOG を確認し破壊的変更を検知");
    console.log("  2. TypeScript V2 Preview で次期API仕様を把握");
    console.log("  3. Hooks ドキュメントで新規イベントを確認");
    console.log("=".repeat(60));

    if (args.output) {
      // テキスト形式でファイル出力
      const lines = [];
      lines.push("Claude Agent SDK 最新情報");
      lines.push(`取得日時: ${result.fetchedAt}`);
      if (result.data.npm && !result.data.npm.error) {
        lines.push(`\n最新バージョン: ${result.data.npm.latestVersion}`);
        lines.push(`公開日: ${result.data.npm.publishedDate}`);
      }
      writeFileSync(args.output, lines.join("\n"));
      console.log(`\n✓ 出力完了: ${args.output}`);
    }
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
