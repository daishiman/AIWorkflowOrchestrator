#!/usr/bin/env node

/**
 * GitHub Issue Manager - Issue完了スクリプト
 *
 * 指定されたIssueを完了（クローズ）する。
 *
 * Usage:
 *   node close_issue.js --number 123
 *   node close_issue.js --spec docs/30-workflows/unassigned-task/task-xxx.md
 *   node close_issue.js --number 123 --dry-run
 */

const fs = require("fs");
const {
  execGh,
  isGhAvailable,
  isGhAuthenticated,
  extractMetadata,
  readFile,
  success,
  error,
  info,
  warn,
} = require("./utils");

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    number: null,
    spec: null,
    dryRun: false,
    reason: "タスク仕様書が削除されたため",
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--number":
      case "-n":
        options.number = parseInt(args[++i], 10);
        break;
      case "--spec":
        options.spec = args[++i];
        break;
      case "--reason":
        options.reason = args[++i];
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
    }
  }

  return options;
}

/**
 * 仕様書ファイルからIssue番号を取得
 * @param {string} specPath - 仕様書パス
 * @returns {number|null} Issue番号
 */
function getIssueNumberFromSpec(specPath) {
  if (!fs.existsSync(specPath)) {
    warn(`ファイルが存在しません: ${specPath}`);
    return null;
  }

  const content = readFile(specPath);
  const metadata = extractMetadata(content);

  if (metadata.issueNumber) {
    return parseInt(metadata.issueNumber, 10);
  }

  return null;
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
    info(`理由: ${reason}`);
    return true;
  }

  try {
    // まずIssueが存在し、オープン状態か確認
    const issueJson = execGh([
      "issue",
      "view",
      String(issueNumber),
      "--json",
      "state,title",
    ]);
    const issue = JSON.parse(issueJson);

    if (issue.state === "CLOSED") {
      info(`Issue #${issueNumber} は既にクローズされています`);
      return true;
    }

    // コメントを追加してクローズ理由を記録
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

    success(`Issue #${issueNumber} をクローズしました: ${issue.title}`);
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

  let issueNumber = options.number;

  // 仕様書からIssue番号を取得
  if (!issueNumber && options.spec) {
    issueNumber = getIssueNumberFromSpec(options.spec);
    if (!issueNumber) {
      error(`仕様書からIssue番号を取得できませんでした: ${options.spec}`);
      process.exit(1);
    }
    info(`仕様書からIssue番号を取得: #${issueNumber}`);
  }

  if (!issueNumber) {
    error("--number または --spec を指定してください");
    process.exit(1);
  }

  const result = closeIssue(issueNumber, options.reason, options.dryRun);

  if (options.dryRun) {
    info("dry-runモードのため、実際にはクローズされていません");
  }

  process.exit(result ? 0 : 1);
}

main();
