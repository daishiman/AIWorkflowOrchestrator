#!/usr/bin/env node

/**
 * マイグレーション安全性チェックスクリプト
 *
 * 使用方法:
 *   node check-migration-safety.mjs <migration-file>
 *
 * 検出内容:
 *   - 破壊的変更（DROP TABLE, DROP COLUMN）
 *   - 危険な型変更
 *   - NOT NULL追加（デフォルトなし）
 *   - 大規模テーブルへの変更リスク
 */

import fs from "fs";
import path from "path";

// 危険度レベル
const RISK_LEVELS = {
  CRITICAL: "🔴 CRITICAL",
  HIGH: "🟠 HIGH",
  MEDIUM: "🟡 MEDIUM",
  LOW: "🟢 LOW",
  INFO: "🔵 INFO",
};

// 検出パターン
const PATTERNS = {
  // 破壊的変更
  dropTable: {
    regex: /DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?["']?(\w+)["']?/gi,
    risk: "CRITICAL",
    message: (match) => `テーブル削除: ${match[1]}`,
    recommendation: "バックアップを作成し、段階的に削除してください",
  },

  dropColumn: {
    regex:
      /ALTER\s+TABLE\s+["']?(\w+)["']?\s+DROP\s+COLUMN\s+(?:IF\s+EXISTS\s+)?["']?(\w+)["']?/gi,
    risk: "CRITICAL",
    message: (match) => `カラム削除: ${match[1]}.${match[2]}`,
    recommendation: "アプリケーションの使用停止を確認し、バックアップを作成してください",
  },

  // 型変更
  alterType: {
    regex:
      /ALTER\s+TABLE\s+["']?(\w+)["']?\s+ALTER\s+COLUMN\s+["']?(\w+)["']?\s+(?:SET\s+DATA\s+)?TYPE\s+(\w+)/gi,
    risk: "HIGH",
    message: (match) => `型変更: ${match[1]}.${match[2]} -> ${match[3]}`,
    recommendation: "データ変換の可否を確認し、テストを実行してください",
  },

  // NOT NULL追加
  setNotNull: {
    regex:
      /ALTER\s+TABLE\s+["']?(\w+)["']?\s+ALTER\s+COLUMN\s+["']?(\w+)["']?\s+SET\s+NOT\s+NULL/gi,
    risk: "HIGH",
    message: (match) => `NOT NULL追加: ${match[1]}.${match[2]}`,
    recommendation: "既存のNULL値を事前に更新してください",
  },

  // 外部キー追加
  addForeignKey: {
    regex:
      /ADD\s+(?:CONSTRAINT\s+["']?\w+["']?\s+)?FOREIGN\s+KEY\s*\(["']?(\w+)["']?\)\s+REFERENCES\s+["']?(\w+)["']?/gi,
    risk: "MEDIUM",
    message: (match) => `外部キー追加: ${match[1]} -> ${match[2]}`,
    recommendation: "データ整合性を事前に確認してください",
  },

  // 一意制約追加
  addUnique: {
    regex: /ADD\s+CONSTRAINT\s+["']?\w+["']?\s+UNIQUE\s*\(([^)]+)\)/gi,
    risk: "MEDIUM",
    message: (match) => `一意制約追加: ${match[1]}`,
    recommendation: "重複データがないことを確認してください",
  },

  // インデックス作成（CONCURRENTLY なし）
  createIndex: {
    regex: /CREATE\s+INDEX\s+(?!CONCURRENTLY)["']?(\w+)["']?\s+ON\s+["']?(\w+)["']?/gi,
    risk: "MEDIUM",
    message: (match) => `インデックス作成: ${match[1]} on ${match[2]}`,
    recommendation:
      "大規模テーブルの場合、CONCURRENTLY オプションを検討してください",
  },

  // CONCURRENTLY インデックス
  createIndexConcurrently: {
    regex: /CREATE\s+INDEX\s+CONCURRENTLY\s+["']?(\w+)["']?/gi,
    risk: "LOW",
    message: (match) => `並列インデックス作成: ${match[1]}`,
    recommendation: "トランザクション外で実行してください",
  },

  // CASCADE
  cascade: {
    regex: /CASCADE/gi,
    risk: "HIGH",
    message: () => "CASCADE オプション使用",
    recommendation: "意図しない連鎖削除がないか確認してください",
  },

  // TRUNCATE
  truncate: {
    regex: /TRUNCATE\s+(?:TABLE\s+)?["']?(\w+)["']?/gi,
    risk: "CRITICAL",
    message: (match) => `テーブルTRUNCATE: ${match[1]}`,
    recommendation: "すべてのデータが削除されます。バックアップを確認してください",
  },

  // データ更新
  updateAll: {
    regex: /UPDATE\s+["']?(\w+)["']?\s+SET\s+(?!.*WHERE)/gi,
    risk: "HIGH",
    message: (match) => `全件UPDATE: ${match[1]}`,
    recommendation: "WHERE句がありません。意図的か確認してください",
  },

  // テーブル作成（情報）
  createTable: {
    regex: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?/gi,
    risk: "INFO",
    message: (match) => `テーブル作成: ${match[1]}`,
    recommendation: null,
  },

  // カラム追加（情報）
  addColumn: {
    regex:
      /ALTER\s+TABLE\s+["']?(\w+)["']?\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?/gi,
    risk: "INFO",
    message: (match) => `カラム追加: ${match[1]}.${match[2]}`,
    recommendation: null,
  },
};

/**
 * マイグレーションファイルを分析
 */
function analyzeMigration(content, filename) {
  const findings = [];

  for (const [patternName, config] of Object.entries(PATTERNS)) {
    const regex = new RegExp(config.regex.source, config.regex.flags);
    let match;

    while ((match = regex.exec(content)) !== null) {
      findings.push({
        pattern: patternName,
        risk: config.risk,
        riskLevel: RISK_LEVELS[config.risk],
        message: config.message(match),
        recommendation: config.recommendation,
        line: getLineNumber(content, match.index),
        matched: match[0],
      });
    }
  }

  // 追加の分析
  findings.push(...analyzeAdditionalRisks(content));

  // リスクでソート
  const riskOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
  findings.sort((a, b) => riskOrder.indexOf(a.risk) - riskOrder.indexOf(b.risk));

  return findings;
}

/**
 * 追加のリスク分析
 */
function analyzeAdditionalRisks(content) {
  const findings = [];

  // BEGIN/COMMITがない場合
  if (
    !content.includes("BEGIN") &&
    !content.includes("COMMIT") &&
    (content.includes("UPDATE") ||
      content.includes("DELETE") ||
      content.includes("INSERT"))
  ) {
    findings.push({
      pattern: "noTransaction",
      risk: "MEDIUM",
      riskLevel: RISK_LEVELS.MEDIUM,
      message: "明示的なトランザクションがありません",
      recommendation: "データ変更操作はトランザクション内で実行することを推奨",
      line: null,
      matched: null,
    });
  }

  // 複数のDROP操作
  const dropCount = (content.match(/DROP/gi) || []).length;
  if (dropCount > 3) {
    findings.push({
      pattern: "multipleDrops",
      risk: "HIGH",
      riskLevel: RISK_LEVELS.HIGH,
      message: `複数のDROP操作 (${dropCount}件)`,
      recommendation: "複数の破壊的変更は分割して実行することを推奨",
      line: null,
      matched: null,
    });
  }

  return findings;
}

/**
 * 行番号を取得
 */
function getLineNumber(content, index) {
  const lines = content.substring(0, index).split("\n");
  return lines.length;
}

/**
 * サマリーを計算
 */
function calculateSummary(findings) {
  const summary = {
    total: findings.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    safe: true,
    needsReview: false,
  };

  for (const finding of findings) {
    switch (finding.risk) {
      case "CRITICAL":
        summary.critical++;
        summary.safe = false;
        summary.needsReview = true;
        break;
      case "HIGH":
        summary.high++;
        summary.safe = false;
        summary.needsReview = true;
        break;
      case "MEDIUM":
        summary.medium++;
        summary.needsReview = true;
        break;
      case "LOW":
        summary.low++;
        break;
      case "INFO":
        summary.info++;
        break;
    }
  }

  return summary;
}

/**
 * レポートを出力
 */
function printReport(filename, findings, summary) {
  console.log("\n" + "=".repeat(60));
  console.log("マイグレーション安全性チェックレポート");
  console.log("=".repeat(60));
  console.log(`ファイル: ${filename}`);
  console.log(`実行時刻: ${new Date().toISOString()}`);

  // サマリー
  console.log("\n📊 サマリー");
  console.log("-".repeat(40));
  console.log(`  検出項目: ${summary.total}件`);
  console.log(`    ${RISK_LEVELS.CRITICAL}: ${summary.critical}件`);
  console.log(`    ${RISK_LEVELS.HIGH}: ${summary.high}件`);
  console.log(`    ${RISK_LEVELS.MEDIUM}: ${summary.medium}件`);
  console.log(`    ${RISK_LEVELS.LOW}: ${summary.low}件`);
  console.log(`    ${RISK_LEVELS.INFO}: ${summary.info}件`);

  // 判定結果
  console.log("\n📋 判定結果");
  console.log("-".repeat(40));
  if (summary.safe) {
    console.log("  ✅ 安全: 破壊的変更は検出されませんでした");
  } else {
    console.log("  ⚠️  注意: 破壊的変更が検出されました");
  }
  if (summary.needsReview) {
    console.log("  👀 レビュー必要: 適用前に確認が必要です");
  }

  // 詳細
  if (findings.length > 0) {
    console.log("\n📝 詳細");
    console.log("-".repeat(40));

    for (const finding of findings) {
      console.log(`\n${finding.riskLevel} ${finding.message}`);
      if (finding.line) {
        console.log(`   行: ${finding.line}`);
      }
      if (finding.matched) {
        console.log(`   SQL: ${finding.matched.substring(0, 80)}...`);
      }
      if (finding.recommendation) {
        console.log(`   💡 ${finding.recommendation}`);
      }
    }
  }

  // 推奨事項
  if (summary.needsReview) {
    console.log("\n\n🔒 適用前チェックリスト");
    console.log("-".repeat(40));
    console.log("  [ ] バックアップを作成しましたか？");
    console.log("  [ ] ステージング環境でテストしましたか？");
    console.log("  [ ] ロールバック手順を準備しましたか？");
    console.log("  [ ] 影響を受けるアプリケーションを確認しましたか？");
    if (summary.critical > 0 || summary.high > 0) {
      console.log("  [ ] メンテナンスウィンドウを確保しましたか？");
    }
  }

  console.log("\n" + "=".repeat(60));
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node check-migration-safety.mjs <migration-file>");
    console.log("");
    console.log("オプション:");
    console.log("  --json    JSON形式で出力");
    console.log("  --strict  MEDIUM以上でエラー終了");
    process.exit(1);
  }

  const filename = args[0];
  const jsonOutput = args.includes("--json");
  const strictMode = args.includes("--strict");

  if (!fs.existsSync(filename)) {
    console.error(`エラー: ファイルが存在しません: ${filename}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filename, "utf-8");
  const findings = analyzeMigration(content, filename);
  const summary = calculateSummary(findings);

  if (jsonOutput) {
    console.log(JSON.stringify({ filename, findings, summary }, null, 2));
  } else {
    printReport(filename, findings, summary);
  }

  // 終了コード
  if (summary.critical > 0) {
    process.exit(2);
  }
  if (summary.high > 0) {
    process.exit(1);
  }
  if (strictMode && summary.medium > 0) {
    process.exit(1);
  }
}

main();
