#!/usr/bin/env node

/**
 * GitHub Issue Manager - 新規Issue同期スクリプト
 *
 * issue_numberを持たないタスク仕様書を検出し、GitHub Issueを作成する。
 * diff-to-prワークフローやPR作成前に実行することを想定。
 *
 * Usage:
 *   node sync_new_issues.js           # issue_numberなしの仕様書にIssue作成
 *   node sync_new_issues.js --dry-run # 変更内容を確認のみ
 *   node sync_new_issues.js --check   # 未同期ファイルがあれば終了コード1を返す
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SPEC_DIR = "docs/30-workflows/unassigned-task";
const CREATE_SCRIPT = path.join(__dirname, "create_issue.js");

// 色付きログ出力
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
};

/**
 * コマンドライン引数をパース
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes("--dry-run"),
    check: args.includes("--check"),
    help: args.includes("--help") || args.includes("-h"),
  };
}

/**
 * ヘルプメッセージを表示
 */
function showHelp() {
  console.log(`
GitHub Issue Manager - 新規Issue同期スクリプト

Usage:
  node sync_new_issues.js [options]

Options:
  --dry-run   変更内容を確認のみ（実際にIssueは作成しない）
  --check     未同期ファイルがあれば終了コード1を返す
  --help, -h  このヘルプを表示

Examples:
  node sync_new_issues.js           # 新規Issue作成
  node sync_new_issues.js --dry-run # 確認のみ
  node sync_new_issues.js --check   # CI/CD用チェック
`);
}

/**
 * タスク仕様書からissue_numberを抽出
 * @param {string} content - ファイル内容
 * @returns {number|null} Issue番号またはnull
 */
function extractIssueNumber(content) {
  // YAML形式でのissue_number
  const yamlMatch = content.match(/^issue_number:\s*(\d+)/m);
  if (yamlMatch) {
    return parseInt(yamlMatch[1], 10);
  }

  // Markdownテーブル形式でのIssue番号
  const tableMatch = content.match(/\|\s*Issue\s*\|\s*#?(\d+)\s*\|/i);
  if (tableMatch) {
    return parseInt(tableMatch[1], 10);
  }

  return null;
}

/**
 * issue_numberを持たない仕様書を検出
 * @returns {string[]} ファイルパスの配列
 */
function findSpecsWithoutIssue() {
  const specDir = path.resolve(SPEC_DIR);

  if (!fs.existsSync(specDir)) {
    log.warn(`ディレクトリが見つかりません: ${SPEC_DIR}`);
    return [];
  }

  const files = fs
    .readdirSync(specDir)
    .filter((f) => f.endsWith(".md") && f.startsWith("task-"))
    .map((f) => path.join(specDir, f));

  const specsWithoutIssue = [];

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const issueNumber = extractIssueNumber(content);

      if (!issueNumber) {
        specsWithoutIssue.push(filePath);
      }
    } catch (err) {
      log.warn(`ファイル読み込みエラー: ${filePath}`);
    }
  }

  return specsWithoutIssue;
}

/**
 * 仕様書に対してIssueを作成
 * @param {string} specPath - 仕様書パス
 * @param {boolean} dryRun - ドライラン
 * @returns {boolean} 成功時true
 */
function createIssueForSpec(specPath, dryRun) {
  const relativePath = path.relative(process.cwd(), specPath);

  if (dryRun) {
    log.info(`[DRY-RUN] Issue作成予定: ${relativePath}`);
    return true;
  }

  try {
    const result = execSync(
      `node "${CREATE_SCRIPT}" --spec "${relativePath}"`,
      {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    console.log(result);
    return true;
  } catch (err) {
    log.error(`Issue作成失敗: ${relativePath}`);
    if (err.stderr) {
      console.error(err.stderr);
    }
    return false;
  }
}

/**
 * メイン処理
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  log.info("未同期のタスク仕様書を検出中...");

  const specsWithoutIssue = findSpecsWithoutIssue();

  if (specsWithoutIssue.length === 0) {
    log.success("全てのタスク仕様書がIssueに同期されています");
    process.exit(0);
  }

  log.info(`${specsWithoutIssue.length}件の未同期仕様書を検出`);

  // チェックモードの場合は未同期ファイルがあれば終了コード1
  if (options.check) {
    console.log("\n未同期の仕様書:");
    for (const spec of specsWithoutIssue) {
      console.log(`  - ${path.relative(process.cwd(), spec)}`);
    }
    log.warn(
      "未同期の仕様書があります。'node sync_new_issues.js' を実行してください。",
    );
    process.exit(1);
  }

  // Issue作成処理
  let created = 0;
  let failed = 0;

  for (const specPath of specsWithoutIssue) {
    if (createIssueForSpec(specPath, options.dryRun)) {
      created++;
    } else {
      failed++;
    }
  }

  // 結果サマリー
  console.log("");
  if (options.dryRun) {
    log.info(`[DRY-RUN] 結果: 作成予定=${created}, 失敗=${failed}`);
  } else {
    log.success(`結果: 新規作成=${created}, 失敗=${failed}`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  log.error(`エラー: ${err.message}`);
  process.exit(1);
});
