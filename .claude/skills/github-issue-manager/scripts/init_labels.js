#!/usr/bin/env node

/**
 * GitHub Issue Manager - ラベル初期化スクリプト
 *
 * リポジトリに必要なラベルを作成する。
 *
 * Usage:
 *   node init_labels.js
 *   node init_labels.js --dry-run
 */

const {
  execGh,
  isGhAvailable,
  isGhAuthenticated,
  success,
  error,
  info,
  warn,
  LABEL_MAPPING,
} = require("./utils");

// ラベル定義（名前, 色, 説明）
const LABELS = [
  // 優先度
  { name: "priority:high", color: "B60205", description: "高優先度" },
  { name: "priority:medium", color: "FBCA04", description: "中優先度" },
  { name: "priority:low", color: "0E8A16", description: "低優先度" },

  // 規模
  { name: "scale:large", color: "D93F0B", description: "大規模タスク" },
  { name: "scale:medium", color: "FEF2C0", description: "中規模タスク" },
  { name: "scale:small", color: "C2E0C6", description: "小規模タスク" },

  // 分類
  { name: "type:requirements", color: "5319E7", description: "要件" },
  { name: "type:improvement", color: "1D76DB", description: "改善" },
  { name: "type:bugfix", color: "E99695", description: "バグ修正" },
  {
    name: "type:refactoring",
    color: "BFD4F2",
    description: "リファクタリング",
  },
  { name: "type:security", color: "B60205", description: "セキュリティ" },
  { name: "type:performance", color: "F9D0C4", description: "パフォーマンス" },

  // ステータス
  { name: "status:unassigned", color: "EDEDED", description: "未実施" },
  { name: "status:in-progress", color: "FBCA04", description: "進行中" },
  { name: "status:completed", color: "0E8A16", description: "完了" },
];

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  // 事前チェック
  if (!isGhAvailable()) {
    error("gh CLI がインストールされていません");
    process.exit(1);
  }

  if (!isGhAuthenticated()) {
    error("gh CLI が認証されていません。`gh auth login` を実行してください");
    process.exit(1);
  }

  info(`ラベル初期化を${dryRun ? "（dry-run）" : ""}開始します...`);

  // 既存ラベルを取得
  let existingLabels = [];
  try {
    const result = execGh(["label", "list", "--json", "name"]);
    existingLabels = JSON.parse(result).map((l) => l.name);
  } catch (e) {
    warn("既存ラベルの取得に失敗しました。新規作成を試みます。");
  }

  let created = 0;
  let skipped = 0;

  for (const label of LABELS) {
    if (existingLabels.includes(label.name)) {
      info(`スキップ: ${label.name} (既存)`);
      skipped++;
      continue;
    }

    if (dryRun) {
      info(`作成予定: ${label.name} (${label.color}) - ${label.description}`);
      created++;
      continue;
    }

    try {
      execGh([
        "label",
        "create",
        label.name,
        "--color",
        label.color,
        "--description",
        `"${label.description}"`,
      ]);
      success(`作成: ${label.name}`);
      created++;
    } catch (e) {
      error(`失敗: ${label.name} - ${e.message}`);
    }
  }

  console.log("");
  info(`結果: 作成=${created}, スキップ=${skipped}`);

  if (dryRun) {
    info("dry-runモードのため、実際には作成されていません");
  }
}

main();
