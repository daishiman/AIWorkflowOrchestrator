#!/usr/bin/env node

/**
 * GitHub Issue Manager - Issue同期スクリプト
 *
 * GitHub IssueとローカルIssueファイルを同期する。
 * ローカルファイルは docs/30-workflows/issues/ に保存される。
 *
 * Usage:
 *   node sync_issues.js                  # GitHub→ローカル同期
 *   node sync_issues.js --push           # ローカル→GitHub同期
 *   node sync_issues.js --dry-run        # 同期内容を表示（実行しない）
 */

const fs = require("fs");
const path = require("path");
const {
  execGh,
  isGhAvailable,
  isGhAuthenticated,
  extractMetadata,
  metadataToLabels,
  success,
  error,
  info,
  warn,
} = require("./utils");

const SPEC_DIR = "docs/30-workflows/unassigned-task";
const LOCAL_ISSUES_DIR = "docs/30-workflows/issues"; // レガシー（後方互換用）

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    push: false,
    dryRun: false,
    state: "open",
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--push":
        options.push = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--state":
        options.state = args[++i];
        break;
      case "--all":
        options.state = "all";
        break;
    }
  }

  return options;
}

/**
 * ローカルIssueディレクトリを初期化
 */
function ensureLocalIssuesDir() {
  const dir = path.resolve(LOCAL_ISSUES_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    info(`ディレクトリを作成: ${LOCAL_ISSUES_DIR}`);
  }
  return dir;
}

/**
 * GitHubからIssue一覧を取得
 * @param {string} state - Issue状態（open/closed/all）
 * @returns {object[]} Issue配列
 */
function fetchGitHubIssues(state = "open") {
  const fields = "number,title,body,labels,state,createdAt,updatedAt,url";
  const result = execGh([
    "issue",
    "list",
    "--state",
    state,
    "--limit",
    "1000",
    "--json",
    fields,
  ]);
  return JSON.parse(result);
}

/**
 * タスク仕様書ファイル一覧を取得（Issue番号付き）
 * @returns {object[]} 仕様書情報の配列
 */
function getSpecFiles() {
  const dir = path.resolve(SPEC_DIR);
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.match(/^task-.*\.md$/));

  return files.map((f) => {
    const filepath = path.join(dir, f);
    const content = fs.readFileSync(filepath, "utf-8");
    const metadata = extractMetadata(content);
    return {
      filename: f,
      filepath,
      content,
      metadata,
      issueNumber: metadata.issueNumber
        ? parseInt(metadata.issueNumber, 10)
        : null,
    };
  });
}

/**
 * Issue番号から仕様書ファイルを検索
 * @param {number} issueNumber - Issue番号
 * @param {object[]} specFiles - 仕様書ファイル配列
 * @returns {object|null} 仕様書情報
 */
function findSpecByIssueNumber(issueNumber, specFiles) {
  return specFiles.find((s) => s.issueNumber === issueNumber) || null;
}

/**
 * ローカルIssueファイル一覧を取得（レガシー）
 * @returns {object[]} ローカルIssue情報の配列
 */
function getLocalIssues() {
  const dir = path.resolve(LOCAL_ISSUES_DIR);
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.match(/^issue-\d+\.md$/));

  return files.map((f) => {
    const content = fs.readFileSync(path.join(dir, f), "utf-8");
    const number = parseInt(f.match(/^issue-(\d+)\.md$/)[1], 10);
    const metadata = extractMetadata(content);
    return {
      number,
      filename: f,
      content,
      metadata,
    };
  });
}

/**
 * ラベルから日本語値に変換
 */
function labelToJapanese(label, type) {
  const maps = {
    priority: { high: "高", medium: "中", low: "低" },
    scale: { large: "大規模", medium: "中規模", small: "小規模" },
    category: {
      requirements: "要件",
      improvement: "改善",
      bugfix: "バグ修正",
      refactoring: "リファクタリング",
      security: "セキュリティ",
      performance: "パフォーマンス",
    },
    status: {
      unassigned: "未実施",
      "in-progress": "進行中",
      completed: "完了",
    },
  };
  return maps[type]?.[label] || label || "-";
}

/**
 * GitHub IssueをローカルMarkdownに変換（YAML形式）
 * @param {object} issue - GitHub Issue
 * @returns {string} Markdownコンテンツ
 */
function issueToMarkdown(issue) {
  const labels = issue.labels.map((l) => l.name);

  // ボディからメタ情報を抽出（存在する場合）
  let body = issue.body || "";

  // 既存のメタ情報がない場合はラベルから生成
  const hasYamlMeta = body.includes("```yaml");
  const hasTableMeta = body.includes("## メタ情報");

  if (!hasYamlMeta && !hasTableMeta) {
    // ラベルからメタ情報を生成
    const priorityLabel = labels
      .find((l) => l.startsWith("priority:"))
      ?.replace("priority:", "");
    const scaleLabel = labels
      .find((l) => l.startsWith("scale:"))
      ?.replace("scale:", "");
    const categoryLabel = labels
      .find((l) => l.startsWith("type:"))
      ?.replace("type:", "");
    const statusLabel = labels
      .find((l) => l.startsWith("status:"))
      ?.replace("status:", "");

    const priority = labelToJapanese(priorityLabel, "priority");
    const scale = labelToJapanese(scaleLabel, "scale");
    const category = labelToJapanese(categoryLabel, "category");
    const status = labelToJapanese(statusLabel, "status");

    const metaYaml = `## メタ情報

\`\`\`yaml
issue_number: ${issue.number}
title: ${issue.title}
state: ${issue.state}
priority: ${priority}
scale: ${scale}
category: ${category}
status: ${status}
created_date: ${issue.createdAt?.split("T")[0] || ""}
updated_date: ${issue.updatedAt?.split("T")[0] || ""}
url: ${issue.url}
dependencies: []
\`\`\`

| 項目 | 内容 |
|------|------|
| 優先度 | ${priority} |
| 規模 | ${scale} |
| ステータス | ${status} |

---

`;

    body = metaYaml + body;
  }

  return `# [#${issue.number}] ${issue.title}

${body}
`;
}

/**
 * 仕様書ファイルのステータスをGitHub Issueから更新
 * @param {string} filepath - 仕様書ファイルパス
 * @param {object} ghIssue - GitHub Issue
 */
function updateSpecFromGitHubIssue(filepath, ghIssue) {
  let content = fs.readFileSync(filepath, "utf-8");
  const labels = ghIssue.labels.map((l) => l.name);

  // ステータスをラベルから取得
  const statusLabel = labels.find((l) => l.startsWith("status:"));
  if (statusLabel) {
    const status = labelToJapanese(
      statusLabel.replace("status:", ""),
      "status",
    );
    content = content.replace(/^(status:\s*).+$/m, `$1${status}`);
  }

  // 優先度をラベルから取得
  const priorityLabel = labels.find((l) => l.startsWith("priority:"));
  if (priorityLabel) {
    const priority = labelToJapanese(
      priorityLabel.replace("priority:", ""),
      "priority",
    );
    content = content.replace(/^(priority:\s*).+$/m, `$1${priority}`);
  }

  // 規模をラベルから取得
  const scaleLabel = labels.find((l) => l.startsWith("scale:"));
  if (scaleLabel) {
    const scale = labelToJapanese(scaleLabel.replace("scale:", ""), "scale");
    content = content.replace(/^(scale:\s*).+$/m, `$1${scale}`);
  }

  fs.writeFileSync(filepath, content, "utf-8");
}

/**
 * GitHub→ローカル同期（仕様書ファイル優先）
 * @param {object} options - オプション
 */
function syncFromGitHub(options) {
  const { dryRun, state } = options;
  info(`GitHub→ローカル同期を${dryRun ? "（dry-run）" : ""}開始します...`);

  const githubIssues = fetchGitHubIssues(state);
  const specFiles = getSpecFiles();
  const dir = ensureLocalIssuesDir(); // レガシー用

  let specUpdated = 0;
  let legacyCreated = 0;
  let skipped = 0;

  for (const ghIssue of githubIssues) {
    // 仕様書ファイルを検索
    const spec = findSpecByIssueNumber(ghIssue.number, specFiles);

    if (spec) {
      // 仕様書ファイルが存在 → ステータス同期
      const ghUpdated = new Date(ghIssue.updatedAt);
      const localStat = fs.statSync(spec.filepath);

      if (ghUpdated > localStat.mtime) {
        if (dryRun) {
          info(`仕様書更新予定: ${spec.filename} (Issue #${ghIssue.number})`);
        } else {
          updateSpecFromGitHubIssue(spec.filepath, ghIssue);
          success(`仕様書更新: ${spec.filename}`);
        }
        specUpdated++;
      } else {
        skipped++;
      }
    } else {
      // 仕様書なし → レガシーディレクトリに保存
      const filename = `issue-${ghIssue.number}.md`;
      const filepath = path.join(dir, filename);

      if (!fs.existsSync(filepath)) {
        const content = issueToMarkdown(ghIssue);
        if (dryRun) {
          info(`レガシー作成予定: ${filename} - ${ghIssue.title}`);
        } else {
          fs.writeFileSync(filepath, content, "utf-8");
          success(`レガシー作成: ${filename}`);
        }
        legacyCreated++;
      } else {
        skipped++;
      }
    }
  }

  console.log("");
  info(
    `結果: 仕様書更新=${specUpdated}, レガシー作成=${legacyCreated}, スキップ=${skipped}`,
  );
  info(`GitHub Issue数: ${githubIssues.length}`);
  info(`リンク済み仕様書: ${specFiles.filter((s) => s.issueNumber).length}件`);

  if (dryRun) {
    info("dry-runモードのため、実際には変更されていません");
  }
}

/**
 * ローカル→GitHub同期（仕様書ファイル優先）
 * @param {object} options - オプション
 */
function syncToGitHub(options) {
  const { dryRun } = options;
  info(`ローカル→GitHub同期を${dryRun ? "（dry-run）" : ""}開始します...`);

  const specFiles = getSpecFiles();
  const githubIssues = fetchGitHubIssues("all");
  const ghMap = new Map(githubIssues.map((i) => [i.number, i]));

  let updated = 0;
  let skipped = 0;
  let notLinked = 0;

  for (const spec of specFiles) {
    if (!spec.issueNumber) {
      notLinked++;
      continue;
    }

    const gh = ghMap.get(spec.issueNumber);
    if (!gh) {
      warn(`GitHub上に存在しません: #${spec.issueNumber} (${spec.filename})`);
      continue;
    }

    // ラベル差分をチェック
    const localLabels = metadataToLabels(spec.metadata);
    const ghLabels = gh.labels.map((l) => l.name);

    const labelsToAdd = localLabels.filter((l) => !ghLabels.includes(l));
    const labelsToRemove = ghLabels
      .filter(
        (l) =>
          l.startsWith("priority:") ||
          l.startsWith("scale:") ||
          l.startsWith("type:") ||
          l.startsWith("status:"),
      )
      .filter((l) => !localLabels.includes(l));

    if (labelsToAdd.length > 0 || labelsToRemove.length > 0) {
      if (dryRun) {
        info(`更新予定: #${spec.issueNumber} (${spec.filename})`);
        if (labelsToAdd.length > 0) info(`  追加: ${labelsToAdd.join(", ")}`);
        if (labelsToRemove.length > 0)
          info(`  削除: ${labelsToRemove.join(", ")}`);
      } else {
        try {
          // ラベル追加
          if (labelsToAdd.length > 0) {
            execGh([
              "issue",
              "edit",
              String(spec.issueNumber),
              "--add-label",
              labelsToAdd.join(","),
            ]);
          }
          // ラベル削除
          if (labelsToRemove.length > 0) {
            execGh([
              "issue",
              "edit",
              String(spec.issueNumber),
              "--remove-label",
              labelsToRemove.join(","),
            ]);
          }
          success(`更新: #${spec.issueNumber} (${spec.filename})`);
        } catch (e) {
          error(`失敗: #${spec.issueNumber} - ${e.message}`);
        }
      }
      updated++;
    } else {
      skipped++;
    }
  }

  console.log("");
  info(`結果: 更新=${updated}, スキップ=${skipped}, 未リンク=${notLinked}`);

  if (notLinked > 0) {
    info(`ヒント: 未リンクの仕様書はcreate_issue.jsでIssueを作成してください`);
  }

  if (dryRun) {
    info("dry-runモードのため、実際には変更されていません");
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

  if (options.push) {
    syncToGitHub(options);
  } else {
    syncFromGitHub(options);
  }
}

main();
