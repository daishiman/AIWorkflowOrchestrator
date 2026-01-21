#!/usr/bin/env node

/**
 * GitHub Issue Manager - Issue一覧スクリプト
 *
 * ローカルIssueファイルまたはGitHub Issueを一覧表示する。
 * デフォルトはローカルファイルから検索（高速）。
 *
 * Usage:
 *   node list_issues.js                      # ローカルから一覧（デフォルト）
 *   node list_issues.js --remote             # GitHubから一覧
 *   node list_issues.js --priority high      # 優先度でフィルタ
 *   node list_issues.js --status unassigned  # ステータスでフィルタ
 *   node list_issues.js --category bugfix    # 分類でフィルタ
 *   node list_issues.js --json               # JSON形式で出力
 */

const fs = require("fs");
const path = require("path");
const {
  execGh,
  isGhAvailable,
  isGhAuthenticated,
  extractMetadata,
  labelsToMetadata,
  success,
  error,
  info,
  warn,
} = require("./utils");

const LOCAL_ISSUES_DIR = "docs/30-workflows/issues";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    remote: false,
    priority: null,
    status: null,
    category: null,
    scale: null,
    json: false,
    limit: 50,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--remote":
        options.remote = true;
        break;
      case "--priority":
        options.priority = args[++i];
        break;
      case "--status":
        options.status = args[++i];
        break;
      case "--category":
        options.category = args[++i];
        break;
      case "--scale":
        options.scale = args[++i];
        break;
      case "--json":
        options.json = true;
        break;
      case "--limit":
        options.limit = parseInt(args[++i], 10);
        break;
    }
  }

  return options;
}

/**
 * ローカルIssueファイルから一覧を取得
 * @returns {object[]} Issue情報の配列
 */
function getLocalIssues() {
  const dir = path.resolve(LOCAL_ISSUES_DIR);
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.match(/^issue-\d+\.md$/));

  return files
    .map((f) => {
      const filepath = path.join(dir, f);
      const content = fs.readFileSync(filepath, "utf-8");
      const number = parseInt(f.match(/^issue-(\d+)\.md$/)[1], 10);
      const metadata = extractMetadata(content);

      // タイトルを抽出
      const titleMatch = content.match(/^# \[#\d+\] (.+)$/m);
      const title = titleMatch ? titleMatch[1] : metadata.taskName || "-";

      return {
        number,
        title,
        priority: metadata.priority || "-",
        scale: metadata.scale || "-",
        category: metadata.category || "-",
        status: metadata.status || "-",
        targetFeature: metadata.targetFeature || "-",
        createdDate: metadata.createdDate || "-",
        dependencies: metadata.dependencies || "なし",
        source: "local",
        filepath,
      };
    })
    .sort((a, b) => b.number - a.number);
}

/**
 * GitHubからIssue一覧を取得
 * @returns {object[]} Issue情報の配列
 */
function getRemoteIssues() {
  const result = execGh([
    "issue",
    "list",
    "--state",
    "open",
    "--limit",
    "1000",
    "--json",
    "number,title,labels,createdAt",
  ]);

  const issues = JSON.parse(result);

  return issues.map((issue) => {
    const labels = issue.labels.map((l) => l.name);
    const metadata = labelsToMetadata(labels);

    return {
      number: issue.number,
      title: issue.title,
      priority: metadata.priority || "-",
      scale: metadata.scale || "-",
      category: metadata.category || "-",
      status: metadata.status || "-",
      targetFeature: "-",
      createdDate: issue.createdAt?.split("T")[0] || "-",
      dependencies: "なし",
      source: "remote",
    };
  });
}

/**
 * フィルタ条件に一致するかチェック
 * @param {object} issue - Issue情報
 * @param {object} filters - フィルタ条件
 * @returns {boolean}
 */
function matchesFilters(issue, filters) {
  if (filters.priority && issue.priority !== filters.priority) {
    // "high" → "高" のマッピング
    const priorityMap = { high: "高", medium: "中", low: "低" };
    if (issue.priority !== priorityMap[filters.priority]) {
      return false;
    }
  }

  if (filters.status && issue.status !== filters.status) {
    const statusMap = {
      unassigned: "未実施",
      "in-progress": "進行中",
      completed: "完了",
    };
    if (issue.status !== statusMap[filters.status]) {
      return false;
    }
  }

  if (filters.category && issue.category !== filters.category) {
    const categoryMap = {
      requirements: "要件",
      improvement: "改善",
      bugfix: "バグ修正",
      refactoring: "リファクタリング",
      security: "セキュリティ",
      performance: "パフォーマンス",
    };
    if (issue.category !== categoryMap[filters.category]) {
      return false;
    }
  }

  if (filters.scale && issue.scale !== filters.scale) {
    const scaleMap = { large: "大規模", medium: "中規模", small: "小規模" };
    if (issue.scale !== scaleMap[filters.scale]) {
      return false;
    }
  }

  return true;
}

/**
 * Issue一覧をテーブル形式で表示
 * @param {object[]} issues - Issue配列
 */
function printTable(issues) {
  if (issues.length === 0) {
    info("Issueが見つかりません");
    return;
  }

  // ヘッダー
  console.log(
    `| ${"#".padEnd(5)} | ${"タイトル".padEnd(40)} | ${"優先度".padEnd(6)} | ${"規模".padEnd(8)} | ${"ステータス".padEnd(10)} |`,
  );
  console.log(
    `| ${"-".repeat(5)} | ${"-".repeat(40)} | ${"-".repeat(6)} | ${"-".repeat(8)} | ${"-".repeat(10)} |`,
  );

  for (const issue of issues) {
    const num = `#${issue.number}`.padEnd(5);
    const title = issue.title.slice(0, 40).padEnd(40);
    const priority = (issue.priority || "-").padEnd(6);
    const scale = (issue.scale || "-").padEnd(8);
    const status = (issue.status || "-").padEnd(10);

    console.log(`| ${num} | ${title} | ${priority} | ${scale} | ${status} |`);
  }

  console.log("");
  info(`合計: ${issues.length}件`);
}

function main() {
  const options = parseArgs();

  let issues;

  if (options.remote) {
    // 事前チェック
    if (!isGhAvailable()) {
      error("gh CLI がインストールされていません");
      process.exit(1);
    }

    if (!isGhAuthenticated()) {
      error("gh CLI が認証されていません。`gh auth login` を実行してください");
      process.exit(1);
    }

    info("GitHubからIssue一覧を取得中...");
    issues = getRemoteIssues();
  } else {
    issues = getLocalIssues();

    if (issues.length === 0) {
      info(
        "ローカルIssueが見つかりません。`node sync_issues.js` で同期してください。",
      );
      process.exit(0);
    }
  }

  // フィルタリング
  issues = issues.filter((issue) => matchesFilters(issue, options));

  // 件数制限
  issues = issues.slice(0, options.limit);

  // 出力
  if (options.json) {
    console.log(JSON.stringify(issues, null, 2));
  } else {
    printTable(issues);
  }
}

main();
