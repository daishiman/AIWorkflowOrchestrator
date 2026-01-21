#!/usr/bin/env node

/**
 * GitHub Issue Manager - 孤立Issue検出・クローズスクリプト
 *
 * 仕様書ファイルが削除されたが、GitHub Issueが残っている「孤立Issue」を検出し、
 * オプションでクローズする。
 *
 * Usage:
 *   node cleanup_orphaned.js                # 孤立Issueを検出（確認のみ）
 *   node cleanup_orphaned.js --close        # 孤立Issueをクローズ
 *   node cleanup_orphaned.js --dry-run      # 変更内容を表示（実行しない）
 */

const fs = require("fs");
const path = require("path");
const {
  execGh,
  isGhAvailable,
  isGhAuthenticated,
  success,
  error,
  info,
  warn,
} = require("./utils");

const SPEC_DIR = "docs/30-workflows/unassigned-task";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    close: false,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--close":
        options.close = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
    }
  }

  return options;
}

/**
 * GitHubからIssue一覧を取得
 * @returns {object[]} Issue配列
 */
function fetchGitHubIssues() {
  const fields = "number,title,body,state,url";
  const result = execGh([
    "issue",
    "list",
    "--state",
    "open",
    "--limit",
    "500",
    "--json",
    fields,
  ]);
  return JSON.parse(result);
}

/**
 * Issueボディからspec_pathを抽出
 * @param {string} body - Issueボディ
 * @returns {string|null} spec_path
 */
function extractSpecPath(body) {
  if (!body) return null;

  // YAML形式: spec_path: path/to/file.md
  const yamlMatch = body.match(/spec_path:\s*([^\n]+)/);
  if (yamlMatch) {
    return yamlMatch[1].trim();
  }

  return null;
}

/**
 * 仕様書ファイルが存在するか確認
 * @param {string} specPath - 仕様書パス
 * @returns {boolean} 存在する場合true
 */
function specFileExists(specPath) {
  if (!specPath) return false;

  // 絶対パスに変換
  const fullPath = path.resolve(specPath);
  return fs.existsSync(fullPath);
}

/**
 * Issueをクローズする
 * @param {number} issueNumber - Issue番号
 * @param {string} reason - クローズ理由
 * @param {boolean} dryRun - dry-runモード
 * @returns {boolean} 成功/失敗
 */
function closeIssue(issueNumber, reason, dryRun = false) {
  if (dryRun) {
    info(`クローズ予定: #${issueNumber}`);
    return true;
  }

  try {
    // コメントを追加
    execGh([
      "issue",
      "comment",
      String(issueNumber),
      "--body",
      `🤖 自動クローズ: ${reason}`,
    ]);

    // status:completedラベルを追加
    try {
      execGh([
        "issue",
        "edit",
        String(issueNumber),
        "--remove-label",
        "status:unassigned,status:in-progress",
      ]);
    } catch {
      // ラベルがない場合は無視
    }

    try {
      execGh([
        "issue",
        "edit",
        String(issueNumber),
        "--add-label",
        "status:completed",
      ]);
    } catch {
      // ラベル追加失敗は無視
    }

    // Issueをクローズ
    execGh(["issue", "close", String(issueNumber)]);

    success(`Issue #${issueNumber} をクローズしました`);
    return true;
  } catch (e) {
    error(`Issue #${issueNumber} のクローズに失敗: ${e.message}`);
    return false;
  }
}

function main() {
  const options = parseArgs();

  // 事前チェック
  if (!isGhAvailable()) {
    error("gh CLI がインストールされていません");
    process.exit(1);
  }

  if (!isGhAuthenticated()) {
    error("gh CLI が認証されていません。`gh auth login` を実行してください");
    process.exit(1);
  }

  info("GitHub Issueを取得中...");
  const issues = fetchGitHubIssues();
  info(`${issues.length}件のオープンIssueを取得しました`);

  // 孤立Issueを検出
  const orphanedIssues = [];

  for (const issue of issues) {
    const specPath = extractSpecPath(issue.body);

    if (specPath && !specFileExists(specPath)) {
      orphanedIssues.push({
        number: issue.number,
        title: issue.title,
        specPath,
        url: issue.url,
      });
    }
  }

  if (orphanedIssues.length === 0) {
    info("孤立Issueは見つかりませんでした");
    process.exit(0);
  }

  console.log("");
  warn(`${orphanedIssues.length}件の孤立Issueを検出しました:`);
  console.log("");

  for (const issue of orphanedIssues) {
    info(`#${issue.number}: ${issue.title}`);
    info(`  spec_path: ${issue.specPath} (削除済み)`);
  }

  console.log("");

  if (options.close) {
    info("孤立Issueをクローズします...");
    console.log("");

    let closed = 0;
    let failed = 0;

    for (const issue of orphanedIssues) {
      const reason = `対応する仕様書ファイル (${issue.specPath}) が削除されました`;
      if (closeIssue(issue.number, reason, options.dryRun)) {
        closed++;
      } else {
        failed++;
      }
    }

    console.log("");
    info(`結果: クローズ=${closed}, 失敗=${failed}`);

    if (options.dryRun) {
      info("dry-runモードのため、実際にはクローズされていません");
    }
  } else {
    info("クローズするには --close オプションを追加してください:");
    info("  node cleanup_orphaned.js --close");
  }
}

main();
