#!/usr/bin/env node

/**
 * GitHub Issue Manager - Issue更新スクリプト
 *
 * ローカルIssueファイルとGitHub Issueを更新する。
 *
 * Usage:
 *   node update_issue.js --number 123 --status in-progress
 *   node update_issue.js --number 123 --priority high
 *   node update_issue.js --number 123 --close
 */

const fs = require("fs");
const path = require("path");
const {
  execGh,
  isGhAvailable,
  isGhAuthenticated,
  extractMetadata,
  metadataToLabels,
  LABEL_MAPPING,
  success,
  error,
  info,
  warn,
} = require("./utils");

const LOCAL_ISSUES_DIR = "docs/30-workflows/issues";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    number: null,
    status: null,
    priority: null,
    scale: null,
    close: false,
    reopen: false,
    localOnly: false,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--number":
      case "-n":
        options.number = parseInt(args[++i], 10);
        break;
      case "--status":
        options.status = args[++i];
        break;
      case "--priority":
        options.priority = args[++i];
        break;
      case "--scale":
        options.scale = args[++i];
        break;
      case "--close":
        options.close = true;
        break;
      case "--reopen":
        options.reopen = true;
        break;
      case "--local-only":
        options.localOnly = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
    }
  }

  return options;
}

/**
 * ステータス値を正規化
 */
function normalizeStatus(status) {
  const map = {
    unassigned: "未実施",
    "in-progress": "進行中",
    completed: "完了",
  };
  return map[status] || status;
}

/**
 * 優先度値を正規化
 */
function normalizePriority(priority) {
  const map = {
    high: "高",
    medium: "中",
    low: "低",
  };
  return map[priority] || priority;
}

/**
 * 規模値を正規化
 */
function normalizeScale(scale) {
  const map = {
    large: "大規模",
    medium: "中規模",
    small: "小規模",
  };
  return map[scale] || scale;
}

/**
 * ローカルIssueファイルを更新（YAML + テーブル両対応）
 */
function updateLocalIssue(number, updates) {
  const filepath = path.join(
    path.resolve(LOCAL_ISSUES_DIR),
    `issue-${number}.md`,
  );

  if (!fs.existsSync(filepath)) {
    warn(`ローカルファイルが見つかりません: ${filepath}`);
    return false;
  }

  let content = fs.readFileSync(filepath, "utf-8");
  const hasYaml = content.includes("```yaml");

  // YAMLブロックの更新
  if (hasYaml) {
    if (updates.status) {
      content = content.replace(
        /^(status:\s*).+$/m,
        `$1${normalizeStatus(updates.status)}`,
      );
    }
    if (updates.priority) {
      content = content.replace(
        /^(priority:\s*).+$/m,
        `$1${normalizePriority(updates.priority)}`,
      );
    }
    if (updates.scale) {
      content = content.replace(
        /^(scale:\s*).+$/m,
        `$1${normalizeScale(updates.scale)}`,
      );
    }
  }

  // Markdownテーブルの更新（YAML有無に関わらず実行）
  if (updates.status) {
    content = content.replace(
      /(\|\s*ステータス\s*\|\s*)[^|]+(\s*\|)/,
      `$1${normalizeStatus(updates.status)}$2`,
    );
  }
  if (updates.priority) {
    content = content.replace(
      /(\|\s*優先度\s*\|\s*)[^|]+(\s*\|)/,
      `$1${normalizePriority(updates.priority)}$2`,
    );
  }
  if (updates.scale) {
    content = content.replace(
      /(\|\s*規模\s*\|\s*)[^|]+(\s*\|)/,
      `$1${normalizeScale(updates.scale)}$2`,
    );
  }

  // 更新日の更新
  const today = new Date().toISOString().split("T")[0];
  if (hasYaml) {
    content = content.replace(/^(updated_date:\s*).+$/m, `$1${today}`);
  }
  content = content.replace(
    /(\|\s*更新日\s*\|\s*)[^|]+(\s*\|)/,
    `$1${today}$2`,
  );

  fs.writeFileSync(filepath, content, "utf-8");
  return true;
}

/**
 * GitHub Issueのラベルを更新
 */
function updateGitHubLabels(number, updates) {
  const labelsToAdd = [];
  const labelsToRemove = [];

  if (updates.status) {
    const newLabel = LABEL_MAPPING.status[normalizeStatus(updates.status)];
    if (newLabel) {
      labelsToAdd.push(newLabel);
      // 他のステータスラベルを削除
      Object.values(LABEL_MAPPING.status).forEach((l) => {
        if (l !== newLabel) labelsToRemove.push(l);
      });
    }
  }

  if (updates.priority) {
    const newLabel =
      LABEL_MAPPING.priority[normalizePriority(updates.priority)];
    if (newLabel) {
      labelsToAdd.push(newLabel);
      // 他の優先度ラベルを削除
      Object.values(LABEL_MAPPING.priority).forEach((l) => {
        if (l !== newLabel) labelsToRemove.push(l);
      });
    }
  }

  if (updates.scale) {
    const newLabel = LABEL_MAPPING.scale[normalizeScale(updates.scale)];
    if (newLabel) {
      labelsToAdd.push(newLabel);
      // 他の規模ラベルを削除
      Object.values(LABEL_MAPPING.scale).forEach((l) => {
        if (l !== newLabel) labelsToRemove.push(l);
      });
    }
  }

  // ラベル追加
  if (labelsToAdd.length > 0) {
    execGh([
      "issue",
      "edit",
      String(number),
      "--add-label",
      labelsToAdd.join(","),
    ]);
  }

  // ラベル削除
  if (labelsToRemove.length > 0) {
    try {
      execGh([
        "issue",
        "edit",
        String(number),
        "--remove-label",
        labelsToRemove.join(","),
      ]);
    } catch {
      // ラベルが存在しない場合はエラーを無視
    }
  }
}

function main() {
  const options = parseArgs();

  if (!options.number) {
    error("--number <issue番号> を指定してください");
    process.exit(1);
  }

  const hasUpdates =
    options.status ||
    options.priority ||
    options.scale ||
    options.close ||
    options.reopen;

  if (!hasUpdates) {
    error(
      "更新内容を指定してください（--status, --priority, --scale, --close, --reopen）",
    );
    process.exit(1);
  }

  // gh CLIチェック（ローカルのみでない場合）
  if (!options.localOnly) {
    if (!isGhAvailable()) {
      error("gh CLI がインストールされていません");
      process.exit(1);
    }

    if (!isGhAuthenticated()) {
      error("gh CLI が認証されていません。`gh auth login` を実行してください");
      process.exit(1);
    }
  }

  info(`Issue #${options.number} を更新中...`);

  // 更新内容を構築
  const updates = {};
  if (options.status) updates.status = options.status;
  if (options.priority) updates.priority = options.priority;
  if (options.scale) updates.scale = options.scale;

  if (options.dryRun) {
    info("更新予定:");
    if (updates.status)
      info(`  ステータス: ${normalizeStatus(updates.status)}`);
    if (updates.priority)
      info(`  優先度: ${normalizePriority(updates.priority)}`);
    if (updates.scale) info(`  規模: ${normalizeScale(updates.scale)}`);
    if (options.close) info("  → クローズ");
    if (options.reopen) info("  → 再オープン");
    return;
  }

  // ローカルファイル更新
  const localUpdated = updateLocalIssue(options.number, updates);
  if (localUpdated) {
    success(`ローカルファイル更新完了: issue-${options.number}.md`);
  }

  // GitHub更新（ローカルのみでない場合）
  if (!options.localOnly) {
    try {
      // ラベル更新
      if (Object.keys(updates).length > 0) {
        updateGitHubLabels(options.number, updates);
        success("GitHubラベル更新完了");
      }

      // クローズ/再オープン
      if (options.close) {
        execGh(["issue", "close", String(options.number)]);
        success("Issue をクローズしました");
      }

      if (options.reopen) {
        execGh(["issue", "reopen", String(options.number)]);
        success("Issue を再オープンしました");
      }
    } catch (e) {
      error(`GitHub更新失敗: ${e.message}`);
    }
  }

  console.log("");
  success(`Issue #${options.number} の更新が完了しました`);
}

main();
