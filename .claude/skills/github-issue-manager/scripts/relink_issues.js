#!/usr/bin/env node

/**
 * GitHub Issue Manager - Issue再リンクスクリプト
 *
 * 既存のGitHub Issueとタスク仕様書を再リンクする。
 * タイトルのタスクIDを基に仕様書を検索し、issue_numberを書き戻す。
 *
 * Usage:
 *   node relink_issues.js                # 全Issueを再リンク
 *   node relink_issues.js --dry-run      # 変更内容を表示（実行しない）
 */

const fs = require("fs");
const path = require("path");
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

const SPEC_DIR = "docs/30-workflows/unassigned-task";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
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
 * 仕様書ファイル一覧を取得
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
      taskId: metadata.taskId,
      taskName: metadata.taskName,
      issueNumber: metadata.issueNumber
        ? parseInt(metadata.issueNumber, 10)
        : null,
    };
  });
}

/**
 * IssueタイトルからタスクIDを抽出
 * @param {string} title - Issueタイトル
 * @returns {string|null} タスクID
 */
function extractTaskIdFromTitle(title) {
  // パターン: [TASK-ID] タスク名
  const match = title.match(/^\[([^\]]+)\]/);
  return match ? match[1] : null;
}

/**
 * タスクIDで仕様書を検索
 * @param {string} taskId - タスクID
 * @param {object[]} specFiles - 仕様書ファイル配列
 * @returns {object|null} 仕様書情報
 */
function findSpecByTaskId(taskId, specFiles) {
  return specFiles.find((s) => s.taskId === taskId) || null;
}

/**
 * タスク名で仕様書を検索（部分一致）
 * @param {string} title - Issueタイトル
 * @param {object[]} specFiles - 仕様書ファイル配列
 * @returns {object|null} 仕様書情報
 */
function findSpecByTaskName(title, specFiles) {
  // タイトルから[タスクID]を除去
  const cleanTitle = title.replace(/^\[[^\]]+\]\s*/, "").trim();

  for (const spec of specFiles) {
    if (!spec.taskName) continue;

    // 完全一致
    if (spec.taskName === cleanTitle) {
      return spec;
    }

    // タスク名がタイトルに含まれる
    if (cleanTitle.includes(spec.taskName)) {
      return spec;
    }

    // タイトルがタスク名に含まれる
    if (spec.taskName.includes(cleanTitle)) {
      return spec;
    }
  }

  return null;
}

/**
 * 仕様書にIssue番号を書き込む
 * @param {string} filepath - 仕様書パス
 * @param {number} issueNumber - Issue番号
 * @param {boolean} dryRun - dry-runモード
 */
function writeIssueNumberToSpec(filepath, issueNumber, dryRun = false) {
  let content = fs.readFileSync(filepath, "utf-8");
  let modified = false;

  // 既にissue_numberがあれば更新
  if (content.includes("issue_number:")) {
    content = content.replace(/^(issue_number:\s*).+$/m, `$1${issueNumber}`);
    modified = true;
  }
  // YAMLブロックがあればその中に追加
  else if (content.includes("```yaml")) {
    content = content.replace(
      /(```yaml\n)/,
      `$1issue_number: ${issueNumber}\n`,
    );
    modified = true;
  }
  // Markdownテーブル形式の場合、YAMLブロックを挿入
  else if (content.includes("## メタ情報")) {
    const yamlBlock = `
## メタ情報

\`\`\`yaml
issue_number: ${issueNumber}
\`\`\`

`;
    content = content.replace(/^(#[^#\n].*\n)/, `$1${yamlBlock}`);
    modified = true;
  }
  // どの形式でもない場合、ファイルの先頭にYAMLブロックを追加
  else {
    const yamlBlock = `\`\`\`yaml
issue_number: ${issueNumber}
\`\`\`

`;
    if (content.match(/^#[^#]/)) {
      content = content.replace(/^(#[^#\n].*\n)/, `$1\n${yamlBlock}`);
    } else {
      content = yamlBlock + content;
    }
    modified = true;
  }

  if (modified) {
    if (dryRun) {
      info(`書き込み予定: ${filepath} <- #${issueNumber}`);
    } else {
      fs.writeFileSync(filepath, content, "utf-8");
      success(`書き込み完了: ${filepath} <- #${issueNumber}`);
    }
  }

  return modified;
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

  info("仕様書ファイルを取得中...");
  const specFiles = getSpecFiles();
  info(`${specFiles.length}件の仕様書ファイルを取得しました`);

  // 既にリンク済みの仕様書
  const linkedSpecs = specFiles.filter((s) => s.issueNumber !== null);
  info(`リンク済み: ${linkedSpecs.length}件`);

  // 未リンクの仕様書
  const unlinkedSpecs = specFiles.filter((s) => s.issueNumber === null);
  info(`未リンク: ${unlinkedSpecs.length}件`);

  console.log("");

  let linked = 0;
  let notFound = 0;
  let alreadyLinked = 0;

  for (const issue of issues) {
    const taskId = extractTaskIdFromTitle(issue.title);

    // タスクIDで検索
    let spec = null;
    if (taskId) {
      spec = findSpecByTaskId(taskId, unlinkedSpecs);
    }

    // タスク名で検索
    if (!spec) {
      spec = findSpecByTaskName(issue.title, unlinkedSpecs);
    }

    if (spec) {
      if (spec.issueNumber === issue.number) {
        alreadyLinked++;
        continue;
      }

      info(`マッチ: Issue #${issue.number} -> ${spec.filename}`);
      writeIssueNumberToSpec(spec.filepath, issue.number, options.dryRun);
      linked++;

      // リンク済みリストから除去（次のイテレーションで再マッチしないように）
      const idx = unlinkedSpecs.indexOf(spec);
      if (idx > -1) {
        unlinkedSpecs.splice(idx, 1);
      }
    } else {
      if (taskId) {
        warn(`未マッチ: Issue #${issue.number} [${taskId}] ${issue.title}`);
      }
      notFound++;
    }
  }

  console.log("");
  info(
    `結果: リンク済み=${linked}, 未マッチ=${notFound}, 既存リンク=${alreadyLinked}`,
  );

  if (unlinkedSpecs.length > 0) {
    console.log("");
    info(`未リンクの仕様書 (${unlinkedSpecs.length}件):`);
    for (const spec of unlinkedSpecs.slice(0, 10)) {
      info(`  - ${spec.filename} (${spec.taskId || "タスクIDなし"})`);
    }
    if (unlinkedSpecs.length > 10) {
      info(`  ... 他 ${unlinkedSpecs.length - 10}件`);
    }
  }

  if (options.dryRun) {
    console.log("");
    info("dry-runモードのため、実際には変更されていません");
  }
}

main();
