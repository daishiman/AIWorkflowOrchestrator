#!/usr/bin/env node

/**
 * GitHub Issue Manager - 最適Issue選択スクリプト
 *
 * スコアリングに基づいて最適なIssueを選択・推奨する。
 * デフォルトはローカルファイルから検索（高速）。
 *
 * Usage:
 *   node select_issue.js                     # 最適Issue上位5件を表示
 *   node select_issue.js --category bugfix   # カテゴリ絞り込み
 *   node select_issue.js --top 10            # 上位10件を表示
 *   node select_issue.js --json              # JSON形式で出力
 *   node select_issue.js --remote            # GitHubから取得
 */

const fs = require("fs");
const path = require("path");
const {
  execGh,
  isGhAvailable,
  isGhAuthenticated,
  extractMetadata,
  labelsToMetadata,
  calculateScore,
  parseDependencies,
  success,
  error,
  info,
  warn,
  SCORE_WEIGHTS,
} = require("./utils");

const LOCAL_ISSUES_DIR = "docs/30-workflows/issues";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    remote: false,
    category: null,
    priority: null,
    scale: null,
    top: 5,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--remote":
        options.remote = true;
        break;
      case "--category":
        options.category = args[++i];
        break;
      case "--priority":
        options.priority = args[++i];
        break;
      case "--scale":
        options.scale = args[++i];
        break;
      case "--top":
        options.top = parseInt(args[++i], 10);
        break;
      case "--json":
        options.json = true;
        break;
    }
  }

  return options;
}

/**
 * ローカルIssueファイルから詳細情報を取得
 * @returns {object[]} Issue情報の配列
 */
function getLocalIssuesWithDetails() {
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
        metadata,
        filepath,
        source: "local",
      };
    })
    .filter((issue) => {
      // 未実施または進行中のIssueのみ
      const status = issue.metadata.status;
      return !status || status === "未実施" || status === "進行中";
    });
}

/**
 * GitHubからIssue詳細を取得
 * @returns {object[]} Issue情報の配列
 */
function getRemoteIssuesWithDetails() {
  const result = execGh([
    "issue",
    "list",
    "--state",
    "open",
    "--limit",
    "1000",
    "--json",
    "number,title,body,labels,createdAt",
  ]);

  const issues = JSON.parse(result);

  return issues.map((issue) => {
    const labels = issue.labels.map((l) => l.name);
    let metadata = labelsToMetadata(labels);

    // ボディからもメタ情報を抽出
    if (issue.body) {
      const bodyMetadata = extractMetadata(issue.body);
      metadata = { ...metadata, ...bodyMetadata };
    }

    // 作成日を追加
    if (!metadata.createdDate && issue.createdAt) {
      metadata.createdDate = issue.createdAt.split("T")[0];
    }

    return {
      number: issue.number,
      title: issue.title,
      metadata,
      source: "remote",
    };
  });
}

/**
 * 完了済みIssue番号のセットを取得
 * @param {object[]} allIssues - 全Issue
 * @returns {Set<number>}
 */
function getCompletedIssues(allIssues) {
  const completed = new Set();

  for (const issue of allIssues) {
    if (issue.metadata.status === "完了") {
      completed.add(issue.number);
    }
  }

  // リモートから閉じられたIssueも取得（オプション）
  try {
    const result = execGh([
      "issue",
      "list",
      "--state",
      "closed",
      "--limit",
      "500",
      "--json",
      "number",
    ]);
    const closedIssues = JSON.parse(result);
    for (const issue of closedIssues) {
      completed.add(issue.number);
    }
  } catch {
    // 取得失敗しても続行
  }

  return completed;
}

/**
 * フィルタ条件に一致するかチェック
 */
function matchesFilters(issue, filters) {
  const metadata = issue.metadata;

  if (filters.category) {
    const categoryMap = {
      requirements: "要件",
      improvement: "改善",
      bugfix: "バグ修正",
      refactoring: "リファクタリング",
      security: "セキュリティ",
      performance: "パフォーマンス",
    };
    const expected = categoryMap[filters.category] || filters.category;
    if (metadata.category !== expected) {
      return false;
    }
  }

  if (filters.priority) {
    const priorityMap = { high: "高", medium: "中", low: "低" };
    const expected = priorityMap[filters.priority] || filters.priority;
    if (metadata.priority !== expected) {
      return false;
    }
  }

  if (filters.scale) {
    const scaleMap = { large: "大規模", medium: "中規模", small: "小規模" };
    const expected = scaleMap[filters.scale] || filters.scale;
    if (metadata.scale !== expected) {
      return false;
    }
  }

  return true;
}

/**
 * スコア結果をテーブル形式で表示
 * @param {object[]} scoredIssues - スコア付きIssue配列
 */
function printScoredTable(scoredIssues) {
  if (scoredIssues.length === 0) {
    info("該当するIssueが見つかりません");
    return;
  }

  console.log("\n📊 **最適Issue選択結果**\n");

  // ヘッダー
  console.log(
    `| ${"順位".padEnd(4)} | ${"#".padEnd(5)} | ${"タイトル".padEnd(35)} | ${"スコア".padEnd(6)} | ${"優先度".padEnd(4)} | ${"規模".padEnd(6)} | ${"依存".padEnd(4)} |`,
  );
  console.log(
    `| ${"-".repeat(4)} | ${"-".repeat(5)} | ${"-".repeat(35)} | ${"-".repeat(6)} | ${"-".repeat(4)} | ${"-".repeat(6)} | ${"-".repeat(4)} |`,
  );

  scoredIssues.forEach((item, index) => {
    const rank = `${index + 1}`.padEnd(4);
    const num = `#${item.issue.number}`.padEnd(5);
    const title = item.issue.title.slice(0, 35).padEnd(35);
    const score = `${item.score}`.padEnd(6);
    const priority = (item.issue.metadata.priority || "-").padEnd(4);
    const scale = (item.issue.metadata.scale || "-").padEnd(6);
    const deps = item.dependenciesMet ? "✓" : "✗";

    console.log(
      `| ${rank} | ${num} | ${title} | ${score} | ${priority} | ${scale} | ${deps.padEnd(4)} |`,
    );
  });

  console.log("");

  // 推奨理由
  const top = scoredIssues[0];
  console.log(`\n🎯 **推奨: #${top.issue.number} ${top.issue.title}**\n`);
  console.log("推奨理由:");
  console.log(`  - スコア: ${top.score}点 (最高スコア)`);

  if (top.issue.metadata.priority === "高") {
    console.log("  - 高優先度タスク");
  }

  if (
    top.issue.metadata.scale === "小規模" ||
    top.issue.metadata.scale === "中規模"
  ) {
    console.log(`  - ${top.issue.metadata.scale}で着手しやすい`);
  }

  if (top.dependenciesMet) {
    console.log("  - 依存関係がすべて満足");
  }

  console.log("");
}

function main() {
  const options = parseArgs();

  let issues;

  if (options.remote) {
    if (!isGhAvailable()) {
      error("gh CLI がインストールされていません");
      process.exit(1);
    }

    if (!isGhAuthenticated()) {
      error("gh CLI が認証されていません。`gh auth login` を実行してください");
      process.exit(1);
    }

    info("GitHubからIssueを取得中...");
    issues = getRemoteIssuesWithDetails();
  } else {
    issues = getLocalIssuesWithDetails();

    if (issues.length === 0) {
      info(
        "ローカルIssueが見つかりません。`node sync_issues.js` で同期してください。",
      );
      process.exit(0);
    }
  }

  // フィルタリング
  issues = issues.filter((issue) => matchesFilters(issue, options));

  if (issues.length === 0) {
    info("フィルタ条件に一致するIssueが見つかりません");
    process.exit(0);
  }

  // 完了済みIssueを取得
  const completedIssues = getCompletedIssues(issues);

  // スコアリング
  const scoredIssues = issues
    .map((issue) => {
      const dependencies = parseDependencies(issue.metadata.dependencies);
      const dependenciesMet =
        dependencies.length === 0 ||
        dependencies.every((dep) => completedIssues.has(dep));

      return {
        issue,
        score: calculateScore(issue, issue.metadata, completedIssues),
        dependenciesMet,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, options.top);

  // 出力
  if (options.json) {
    console.log(JSON.stringify(scoredIssues, null, 2));
  } else {
    printScoredTable(scoredIssues);
  }
}

main();
