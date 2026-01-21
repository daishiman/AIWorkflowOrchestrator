#!/usr/bin/env node

/**
 * GitHub Issue Manager - Issue作成スクリプト
 *
 * タスク仕様書からGitHub Issueを作成する。
 *
 * Usage:
 *   node create_issue.js --spec docs/30-workflows/unassigned-task/task-xxx.md
 *   node create_issue.js --all
 *   node create_issue.js --spec <path> --dry-run
 */

const fs = require("fs");
const path = require("path");
const {
  execGh,
  isGhAvailable,
  isGhAuthenticated,
  extractMetadata,
  metadataToLabels,
  detectSpecFiles,
  readFile,
  success,
  error,
  info,
  warn,
} = require("./utils");

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    spec: null,
    all: false,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--spec":
        options.spec = args[++i];
        break;
      case "--all":
        options.all = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
    }
  }

  return options;
}

/**
 * 仕様書からIssueボディを生成（YAML形式）
 * @param {string} content - 仕様書内容
 * @param {object} metadata - メタ情報
 * @param {string} specPath - 仕様書パス
 * @returns {string} Issueボディ
 */
function generateIssueBody(content, metadata, specPath) {
  // 依存関係の整形
  let deps = metadata.dependencies;
  if (Array.isArray(deps)) {
    deps = deps.length > 0 ? `[${deps.join(", ")}]` : "[]";
  } else if (!deps || deps === "なし" || deps === "-") {
    deps = "[]";
  }

  // YAML形式のメタ情報を生成
  const metaYaml = `## メタ情報

\`\`\`yaml
task_id: ${metadata.taskId || "-"}
task_name: ${metadata.taskName || "-"}
category: ${metadata.category || "-"}
target_feature: ${metadata.targetFeature || "-"}
priority: ${metadata.priority || "-"}
scale: ${metadata.scale || "-"}
status: ${metadata.status || "未実施"}
source_phase: ${metadata.sourcePhase || "-"}
created_date: ${metadata.createdDate || new Date().toISOString().split("T")[0]}
dependencies: ${deps}
spec_path: ${specPath}
\`\`\`

| 項目 | 内容 |
|------|------|
| 優先度 | ${metadata.priority || "-"} |
| 規模 | ${metadata.scale || "-"} |
| ステータス | ${metadata.status || "未実施"} |

---
`;

  // 元の内容からメタ情報セクションを除去し、本文を取得
  let body = content
    .replace(/^#[^#].*\n/, "") // タイトル行を除去
    .replace(/## メタ情報[\s\S]*?(?=\n---|\n## |$)/, "") // メタ情報セクションを除去
    .replace(/```yaml[\s\S]*?```\s*/, "") // YAMLブロックを除去
    .trim();

  // 最初のセパレータを除去
  body = body.replace(/^---\s*\n/, "");

  return metaYaml + body;
}

/**
 * タスク仕様書にIssue番号を書き戻す
 * @param {string} specPath - 仕様書パス
 * @param {number} issueNumber - Issue番号
 */
function writeIssueNumberToSpec(specPath, issueNumber) {
  let content = fs.readFileSync(specPath, "utf-8");
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
    // タイトル行の後にYAMLブロックを挿入
    const titleMatch = content.match(/^(#[^#\n].*\n)/);
    if (titleMatch) {
      const yamlBlock = `
## メタ情報

\`\`\`yaml
issue_number: ${issueNumber}
\`\`\`

`;
      // タイトルの直後にYAMLブロックを挿入
      content = content.replace(/^(#[^#\n].*\n)/, `$1${yamlBlock}`);
      modified = true;
    }
  }
  // どの形式でもない場合、ファイルの先頭にYAMLブロックを追加
  else {
    const yamlBlock = `\`\`\`yaml
issue_number: ${issueNumber}
\`\`\`

`;
    // タイトル行の直後に挿入
    if (content.match(/^#[^#]/)) {
      content = content.replace(/^(#[^#\n].*\n)/, `$1\n${yamlBlock}`);
    } else {
      content = yamlBlock + content;
    }
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(specPath, content, "utf-8");
    info(`仕様書にIssue番号を書き戻し: #${issueNumber}`);
  } else {
    warn(`Issue番号の書き戻しに失敗: ${specPath}`);
  }
}

/**
 * 仕様書から既存のIssue番号を取得
 * @param {object} metadata - メタ情報
 * @returns {number|null} Issue番号
 */
function getExistingIssueNumber(metadata) {
  if (metadata.issueNumber) {
    return parseInt(metadata.issueNumber, 10);
  }
  return null;
}

/**
 * 既存のIssueを更新
 * @param {number} issueNumber - Issue番号
 * @param {string} content - 仕様書内容
 * @param {object} metadata - メタ情報
 * @param {string} specPath - 仕様書パス
 * @param {boolean} dryRun - dry-runモード
 * @returns {object|null} 更新結果
 */
function updateExistingIssue(
  issueNumber,
  content,
  metadata,
  specPath,
  dryRun = false,
) {
  const title = `[${metadata.taskId}] ${metadata.taskName}`;
  const labels = metadataToLabels(metadata);
  const body = generateIssueBody(content, metadata, specPath);

  if (dryRun) {
    info(`更新予定: #${issueNumber} - ${title}`);
    info(`ラベル: ${labels.join(", ")}`);
    return {
      number: issueNumber,
      title,
      labels,
      dryRun: true,
      action: "update",
    };
  }

  // 一時ファイルにボディを書き込み
  const tmpFile = `/tmp/issue-body-${Date.now()}.md`;
  fs.writeFileSync(tmpFile, body, "utf-8");

  try {
    // ボディを更新
    execGh([
      "issue",
      "edit",
      String(issueNumber),
      "--title",
      `"${title}"`,
      "--body-file",
      tmpFile,
    ]);

    // ラベルを設定（既存ラベルを置換）
    if (labels.length > 0) {
      // まず関連ラベルを削除
      const currentLabels = [
        "priority:high",
        "priority:medium",
        "priority:low",
        "scale:large",
        "scale:medium",
        "scale:small",
        "status:unassigned",
        "status:in-progress",
        "status:completed",
        "type:requirements",
        "type:improvement",
        "type:bugfix",
        "type:refactoring",
        "type:security",
        "type:performance",
      ];

      for (const label of currentLabels) {
        try {
          execGh([
            "issue",
            "edit",
            String(issueNumber),
            "--remove-label",
            label,
          ]);
        } catch {
          // ラベルがない場合は無視
        }
      }

      // 新しいラベルを追加
      execGh([
        "issue",
        "edit",
        String(issueNumber),
        "--add-label",
        labels.join(","),
      ]);
    }

    success(`Issue更新完了: #${issueNumber} - ${title}`);

    return {
      number: issueNumber,
      title,
      labels,
      action: "update",
    };
  } catch (e) {
    error(`Issue更新失敗: ${e.message}`);
    return null;
  } finally {
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  }
}

/**
 * Issueを作成または更新
 * @param {string} specPath - 仕様書パス
 * @param {boolean} dryRun - dry-runモード
 * @returns {object|null} 作成/更新結果
 */
function createOrUpdateIssue(specPath, dryRun = false) {
  const content = readFile(specPath);
  const metadata = extractMetadata(content);

  if (!metadata.taskId || !metadata.taskName) {
    error(`メタ情報が不足しています: ${specPath}`);
    return null;
  }

  // 既存Issue番号をチェック
  const existingNumber = getExistingIssueNumber(metadata);

  if (existingNumber) {
    // 既存Issueを更新
    info(`既存Issue検出: #${existingNumber}`);
    return updateExistingIssue(
      existingNumber,
      content,
      metadata,
      specPath,
      dryRun,
    );
  }

  // 新規作成
  const title = `[${metadata.taskId}] ${metadata.taskName}`;
  const labels = metadataToLabels(metadata);
  const body = generateIssueBody(content, metadata, specPath);

  if (dryRun) {
    info(`作成予定: ${title}`);
    info(`ラベル: ${labels.join(", ")}`);
    console.log("--- Body Preview ---");
    console.log(body.slice(0, 500) + (body.length > 500 ? "..." : ""));
    console.log("--------------------");
    return { title, labels, dryRun: true, action: "create" };
  }

  // 一時ファイルにボディを書き込み（長いボディ対応）
  const tmpFile = `/tmp/issue-body-${Date.now()}.md`;
  fs.writeFileSync(tmpFile, body, "utf-8");

  try {
    const labelArgs = labels.length > 0 ? ["--label", labels.join(",")] : [];

    const result = execGh([
      "issue",
      "create",
      "--title",
      `"${title}"`,
      "--body-file",
      tmpFile,
      ...labelArgs,
    ]);

    // Issue番号を抽出
    const issueUrl = result.trim();
    const issueNumber = issueUrl.match(/\/issues\/(\d+)/)?.[1];

    success(`Issue作成完了: #${issueNumber} - ${title}`);
    info(`URL: ${issueUrl}`);

    // 仕様書にIssue番号を書き戻す
    if (issueNumber && !dryRun) {
      writeIssueNumberToSpec(specPath, issueNumber);
    }

    return {
      number: parseInt(issueNumber, 10),
      title,
      url: issueUrl,
      labels,
      action: "create",
    };
  } catch (e) {
    error(`Issue作成失敗: ${e.message}`);
    return null;
  } finally {
    // 一時ファイルを削除
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
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

  if (!options.spec && !options.all) {
    error("--spec <path> または --all を指定してください");
    process.exit(1);
  }

  let specFiles = [];

  if (options.all) {
    specFiles = detectSpecFiles();
    if (specFiles.length === 0) {
      info("未Issue化の仕様書が見つかりません");
      process.exit(0);
    }
    info(`${specFiles.length}件の仕様書を検出しました`);
  } else {
    if (!fs.existsSync(options.spec)) {
      error(`ファイルが見つかりません: ${options.spec}`);
      process.exit(1);
    }
    specFiles = [options.spec];
  }

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const specPath of specFiles) {
    info(`処理中: ${specPath}`);
    const result = createOrUpdateIssue(specPath, options.dryRun);
    if (result) {
      if (result.action === "update") {
        updated++;
      } else {
        created++;
      }
    } else {
      failed++;
    }
    console.log("");
  }

  info(`結果: 新規作成=${created}, 更新=${updated}, 失敗=${failed}`);

  if (options.dryRun) {
    info("dry-runモードのため、実際には作成されていません");
  }
}

main();
