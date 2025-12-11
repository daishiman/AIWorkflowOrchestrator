#!/usr/bin/env node
/**
 * 非機能要件カバレッジチェックスクリプト
 *
 * 非機能要件の網羅性を検証し、見落としがちなカテゴリを特定します。
 *
 * 使用方法:
 *   node check-nfr-coverage.mjs <非機能要件.md>
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// 非機能要件カテゴリ定義
const NFR_CATEGORIES = {
  performance: {
    name: "パフォーマンス",
    patterns: [/パフォーマンス|性能|応答時間|スループット|レイテンシ/gi],
    importance: "high",
    subcategories: ["応答時間", "スループット", "リソース使用率"],
  },
  scalability: {
    name: "スケーラビリティ",
    patterns: [/スケーラビリティ|拡張性|同時接続|負荷/gi],
    importance: "high",
    subcategories: [
      "水平スケーリング",
      "垂直スケーリング",
      "データスケーリング",
    ],
  },
  security: {
    name: "セキュリティ",
    patterns: [/セキュリティ|認証|認可|暗号化|監査/gi],
    importance: "critical",
    subcategories: ["認証", "認可", "暗号化", "監査ログ"],
  },
  availability: {
    name: "可用性",
    patterns: [/可用性|稼働率|SLA|ダウンタイム|障害復旧|RTO|RPO/gi],
    importance: "critical",
    subcategories: ["稼働率", "障害復旧", "バックアップ"],
  },
  reliability: {
    name: "信頼性",
    patterns: [/信頼性|耐障害|フェイルオーバー|整合性/gi],
    importance: "high",
    subcategories: ["耐障害性", "データ整合性", "エラー処理"],
  },
  maintainability: {
    name: "保守性",
    patterns: [/保守性|テスト|カバレッジ|デプロイ|ログ/gi],
    importance: "medium",
    subcategories: ["コード品質", "テスト", "デプロイ", "ログ"],
  },
  usability: {
    name: "ユーザビリティ",
    patterns: [/ユーザビリティ|使いやすさ|アクセシビリティ|WCAG/gi],
    importance: "medium",
    subcategories: ["アクセシビリティ", "レスポンシブ", "学習容易性"],
  },
  compatibility: {
    name: "互換性",
    patterns: [/互換性|ブラウザ|デバイス|API|後方互換/gi],
    importance: "medium",
    subcategories: ["ブラウザ互換性", "API互換性", "デバイス互換性"],
  },
};

// 測定可能性チェックパターン
const MEASURABLE_PATTERNS = [
  /\d+\s*(ms|秒|分|時間|%|パーセント|件|ユーザー|リクエスト)/gi,
  /以内|以上|以下|未満|超過/gi,
  /99\.\d+%|100%/gi,
];

// 曖昧表現パターン
const VAGUE_PATTERNS = [
  /高速|速い|遅い/g,
  /安全|セキュア/g,
  /十分|適切|良好/g,
  /高い|低い/g,
];

/**
 * 非機能要件カバレッジを検証
 */
function checkNfrCoverage(content, filePath) {
  const issues = [];
  const coverage = {};
  const lines = content.split("\n");

  console.log("\n📋 非機能要件カバレッジレポート");
  console.log("=".repeat(50));
  console.log(`ファイル: ${filePath}\n`);

  // 1. カテゴリカバレッジチェック
  console.log("📊 カテゴリカバレッジチェック...");
  for (const [key, category] of Object.entries(NFR_CATEGORIES)) {
    let found = false;
    let measurable = false;
    const matches = [];

    for (const pattern of category.patterns) {
      const categoryMatches = content.match(pattern);
      if (categoryMatches) {
        found = true;
        matches.push(...categoryMatches);
      }
    }

    // 測定可能性チェック
    if (found) {
      for (const pattern of MEASURABLE_PATTERNS) {
        if (pattern.test(content)) {
          measurable = true;
          break;
        }
      }
    }

    coverage[key] = {
      name: category.name,
      found,
      measurable,
      importance: category.importance,
      matches: [...new Set(matches)],
    };

    if (!found && category.importance === "critical") {
      issues.push({
        type: "coverage",
        severity: "error",
        message: `重要カテゴリ「${category.name}」が定義されていません`,
      });
    } else if (!found && category.importance === "high") {
      issues.push({
        type: "coverage",
        severity: "warning",
        message: `推奨カテゴリ「${category.name}」が定義されていません`,
      });
    } else if (!found) {
      issues.push({
        type: "coverage",
        severity: "info",
        message: `オプションカテゴリ「${category.name}」が定義されていません`,
      });
    } else if (!measurable) {
      issues.push({
        type: "measurability",
        severity: "warning",
        message: `「${category.name}」に測定可能な目標値がありません`,
      });
    }
  }

  // 2. 曖昧表現チェック
  console.log("🔍 曖昧表現チェック...");
  let lineNum = 0;
  for (const line of lines) {
    lineNum++;
    for (const pattern of VAGUE_PATTERNS) {
      const matches = line.match(pattern);
      if (matches) {
        for (const match of matches) {
          // 数値と一緒に使われている場合はOK
          if (!/\d/.test(line)) {
            issues.push({
              type: "vague",
              severity: "warning",
              line: lineNum,
              match,
              message: "曖昧な表現: 具体的な数値に変換してください",
            });
          }
        }
      }
    }
  }

  // 3. NFR ID形式チェック
  console.log("🏷️  NFR IDチェック...");
  const nfrIds = content.match(/NFR-\d{3}/g) || [];
  const uniqueIds = [...new Set(nfrIds)];

  if (nfrIds.length !== uniqueIds.length) {
    const duplicates = nfrIds.filter(
      (id, index) => nfrIds.indexOf(id) !== index,
    );
    for (const dup of [...new Set(duplicates)]) {
      issues.push({
        type: "id",
        severity: "error",
        message: `重複するNFR ID: ${dup}`,
      });
    }
  }

  // 4. 重要度設定チェック
  console.log("⚡ 重要度設定チェック...");
  if (!/Critical|High|Medium|Low|重要度/gi.test(content)) {
    issues.push({
      type: "priority",
      severity: "warning",
      message: "非機能要件に重要度が設定されていません",
    });
  }

  // 5. 測定方法チェック
  console.log("📏 測定方法チェック...");
  if (!/測定方法|測定|計測|モニタリング|監視/gi.test(content)) {
    issues.push({
      type: "measurement",
      severity: "warning",
      message: "測定方法が定義されていません",
    });
  }

  return {
    issues,
    coverage,
    stats: {
      lines: lines.length,
      nfrCount: uniqueIds.length,
    },
  };
}

/**
 * 結果を表示
 */
function displayResults(result) {
  const { issues, coverage, stats } = result;

  // カバレッジマトリクス表示
  console.log("\n" + "=".repeat(50));
  console.log("📊 カテゴリカバレッジマトリクス");
  console.log("=".repeat(50));
  console.log("| カテゴリ | 重要度 | 定義 | 測定可能 |");
  console.log("|---------|--------|------|---------|");

  let coveredCount = 0;
  let measurableCount = 0;

  for (const [key, cat] of Object.entries(coverage)) {
    const definedIcon = cat.found ? "✅" : "❌";
    const measurableIcon = cat.measurable ? "✅" : "❌";
    const importanceLabel =
      cat.importance === "critical"
        ? "🔴 Critical"
        : cat.importance === "high"
          ? "🟡 High"
          : "🟢 Medium";

    console.log(
      `| ${cat.name} | ${importanceLabel} | ${definedIcon} | ${measurableIcon} |`,
    );

    if (cat.found) coveredCount++;
    if (cat.measurable) measurableCount++;
  }

  const totalCategories = Object.keys(coverage).length;
  const coverageRate = Math.round((coveredCount / totalCategories) * 100);
  const measurableRate = Math.round((measurableCount / totalCategories) * 100);

  console.log("\n" + "=".repeat(50));
  console.log("📊 検証結果サマリー");
  console.log("=".repeat(50));
  console.log(`総行数: ${stats.lines}`);
  console.log(`NFR数: ${stats.nfrCount}`);
  console.log(
    `カテゴリカバレッジ: ${coveredCount}/${totalCategories} (${coverageRate}%)`,
  );
  console.log(
    `測定可能率: ${measurableCount}/${totalCategories} (${measurableRate}%)`,
  );
  console.log(`検出された問題: ${issues.length}`);

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const infos = issues.filter((i) => i.severity === "info");

  console.log(`  - エラー: ${errors.length}`);
  console.log(`  - 警告: ${warnings.length}`);
  console.log(`  - 情報: ${infos.length}`);

  if (issues.length > 0) {
    console.log("\n" + "=".repeat(50));
    console.log("📝 詳細");
    console.log("=".repeat(50));

    // エラーと警告のみ表示
    for (const issue of [...errors, ...warnings]) {
      const icon = issue.severity === "error" ? "❌" : "⚠️";
      if (issue.line) {
        const matchInfo = issue.match ? ` "${issue.match}"` : "";
        console.log(
          `${icon} [${issue.severity.toUpperCase()}] 行${issue.line}:${matchInfo} ${issue.message}`,
        );
      } else {
        console.log(
          `${icon} [${issue.severity.toUpperCase()}] ${issue.message}`,
        );
      }
    }
  }

  // スコア計算
  const coverageScore = coverageRate * 0.4;
  const measurableScore = measurableRate * 0.3;
  const errorPenalty = errors.length * 5;
  const warningPenalty = warnings.length * 2;
  const score = Math.max(
    0,
    Math.min(
      100,
      coverageScore + measurableScore + 30 - errorPenalty - warningPenalty,
    ),
  );

  console.log("\n" + "=".repeat(50));
  console.log(`📈 NFRカバレッジスコア: ${Math.round(score)}/100`);

  if (score >= 80) {
    console.log("✅ 良好: 非機能要件は十分にカバーされています");
  } else if (score >= 60) {
    console.log("⚠️  要改善: 不足しているカテゴリを追加してください");
  } else {
    console.log("❌ 不十分: 重要な非機能要件カテゴリが不足しています");
  }
  console.log("=".repeat(50) + "\n");

  return errors.length === 0 ? 0 : 1;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node check-nfr-coverage.mjs <非機能要件.md>");
    console.log("\n例:");
    console.log("  node check-nfr-coverage.mjs ./docs/nfr/requirements.md");
    process.exit(1);
  }

  const filePath = resolve(args[0]);

  if (!existsSync(filePath)) {
    console.error(`エラー: ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const result = checkNfrCoverage(content, filePath);
    const exitCode = displayResults(result);
    process.exit(exitCode);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
