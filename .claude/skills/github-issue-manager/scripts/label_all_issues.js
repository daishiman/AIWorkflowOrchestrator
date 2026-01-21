#!/usr/bin/env node
/**
 * label_all_issues.js - 全Issueにメタ情報からラベルを付与
 *
 * 使用方法:
 *   node scripts/label_all_issues.js           # 全Issueにラベル付与
 *   node scripts/label_all_issues.js --dry-run # 変更内容を確認のみ
 *   node scripts/label_all_issues.js --force   # 既存ラベルを上書き
 */

const {
  execGh,
  isGhAuthenticated,
  LABEL_MAPPING,
  success,
  error,
  info,
  warn,
} = require("./utils");

// ================================
// Issueボディからメタ情報を抽出
// ================================

/**
 * Issueボディ（Markdownテーブル）からメタ情報を抽出
 * @param {string} body - Issueボディ
 * @returns {object} メタ情報オブジェクト
 */
function extractMetadataFromIssueBody(body) {
  const metadata = {};

  if (!body) return metadata;

  // テーブル行を解析
  const tablePattern = /\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/g;
  let match;

  while ((match = tablePattern.exec(body)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();

    // ヘッダー行をスキップ
    if (key === "項目" || key.includes("-") || key === "Key") continue;

    // キー名を正規化
    const normalizedKey = normalizeKey(key);
    if (normalizedKey) {
      metadata[normalizedKey] = value;
    }
  }

  return metadata;
}

/**
 * キー名を正規化
 * @param {string} key - 元のキー名
 * @returns {string|null} 正規化されたキー名
 */
function normalizeKey(key) {
  const keyMap = {
    タスクID: "taskId",
    タスク名: "taskName",
    分類: "category",
    対象機能: "targetFeature",
    優先度: "priority",
    見積もり規模: "scale",
    ステータス: "status",
    発見元: "sourcePhase",
    発見日: "createdDate",
    依存タスク: "dependencies",
    仕様書: "specPath",
    // 英語キーもサポート
    Priority: "priority",
    Scale: "scale",
    Category: "category",
    Status: "status",
  };

  return keyMap[key] || null;
}

/**
 * メタ情報からラベル配列を生成
 * @param {object} metadata - メタ情報オブジェクト
 * @returns {string[]} ラベル配列
 */
function metadataToLabels(metadata) {
  const labels = [];

  if (metadata.priority && LABEL_MAPPING.priority[metadata.priority]) {
    labels.push(LABEL_MAPPING.priority[metadata.priority]);
  }

  if (metadata.scale && LABEL_MAPPING.scale[metadata.scale]) {
    labels.push(LABEL_MAPPING.scale[metadata.scale]);
  }

  if (metadata.category && LABEL_MAPPING.category[metadata.category]) {
    labels.push(LABEL_MAPPING.category[metadata.category]);
  }

  if (metadata.status && LABEL_MAPPING.status[metadata.status]) {
    labels.push(LABEL_MAPPING.status[metadata.status]);
  }

  return labels;
}

// ================================
// メイン処理
// ================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");

  console.log("🏷️  GitHub Issue ラベル一括付与\n");

  // 認証チェック
  if (!isGhAuthenticated()) {
    error("gh CLIが認証されていません。`gh auth login`を実行してください。");
    process.exit(1);
  }

  // オープン中のIssueを取得
  info("オープン中のIssueを取得中...\n");
  let issues;
  try {
    issues = JSON.parse(
      execGh([
        "issue",
        "list",
        "--state",
        "open",
        "--limit",
        "500",
        "--json",
        "number,title,body,labels",
      ]),
    );
  } catch (e) {
    error(`Issue取得失敗: ${e.message}`);
    process.exit(1);
  }

  info(`取得したIssue: ${issues.length}件\n`);

  if (issues.length === 0) {
    warn("オープン中のIssueがありません。");
    process.exit(0);
  }

  // 各Issueにラベル付与
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const issue of issues) {
    const { number, title, body, labels } = issue;
    const existingLabels = labels.map((l) => l.name);

    // メタ情報を抽出
    const metadata = extractMetadataFromIssueBody(body);
    const newLabels = metadataToLabels(metadata);

    if (newLabels.length === 0) {
      warn(`#${number}: メタ情報からラベル抽出不可（スキップ）`);
      skipped++;
      continue;
    }

    // 既にラベルがある場合
    const hasTypeLabels = existingLabels.some(
      (l) =>
        l.startsWith("priority:") ||
        l.startsWith("scale:") ||
        l.startsWith("type:") ||
        l.startsWith("status:"),
    );

    if (hasTypeLabels && !force) {
      info(`#${number}: 既にラベルあり（スキップ）`);
      skipped++;
      continue;
    }

    // ラベル付与
    console.log(`📝 #${number} ${title.slice(0, 50)}`);
    console.log(`   メタ: priority=${metadata.priority || "-"}, scale=${metadata.scale || "-"}, category=${metadata.category || "-"}`);
    console.log(`   ラベル: ${newLabels.join(", ")}`);

    if (dryRun) {
      console.log("   [dry-run] 実際には更新しません\n");
      updated++;
      continue;
    }

    try {
      // 既存のtype/priority/scale/statusラベルを削除（forceの場合）
      if (force && hasTypeLabels) {
        const toRemove = existingLabels.filter(
          (l) =>
            l.startsWith("priority:") ||
            l.startsWith("scale:") ||
            l.startsWith("type:") ||
            l.startsWith("status:"),
        );
        for (const label of toRemove) {
          try {
            execGh([
              "issue",
              "edit",
              number.toString(),
              "--remove-label",
              label,
            ]);
          } catch {
            // ラベル削除失敗は無視
          }
        }
      }

      // ラベル追加
      execGh([
        "issue",
        "edit",
        number.toString(),
        "--add-label",
        newLabels.join(","),
      ]);
      success(`#${number} ラベル付与完了\n`);
      updated++;
    } catch (e) {
      error(`#${number} ラベル付与失敗: ${e.message}\n`);
      errors++;
    }
  }

  // サマリー
  console.log("\n📊 結果サマリー:");
  console.log(`   更新: ${updated}件`);
  console.log(`   スキップ: ${skipped}件`);
  console.log(`   エラー: ${errors}件`);

  if (dryRun) {
    console.log("\n[dry-run モード] 実際の変更は行われませんでした。");
    console.log("実行するには --dry-run を外してください。");
  }
}

main().catch((e) => {
  error(e.message);
  process.exit(1);
});
