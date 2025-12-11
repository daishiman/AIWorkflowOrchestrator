#!/usr/bin/env node

/**
 * アップロード設定分析スクリプト
 *
 * 使用方法:
 *   node analyze-upload-config.mjs <config-file>
 *
 * 機能:
 *   - アップロード設定の妥当性検証
 *   - チャンクサイズの推奨値提案
 *   - タイムアウト設定の評価
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// 推奨値定義
const RECOMMENDATIONS = {
  chunkSize: {
    min: 1 * 1024 * 1024, // 1MB
    max: 50 * 1024 * 1024, // 50MB
    default: 5 * 1024 * 1024, // 5MB
  },
  timeout: {
    base: 30000, // 30秒
    perMB: 5000, // 5秒/MB
    max: 600000, // 10分
  },
  maxRetries: {
    min: 1,
    max: 10,
    default: 5,
  },
};

function analyzeConfig(config) {
  const issues = [];
  const recommendations = [];

  // チャンクサイズの検証
  if (config.chunkSize) {
    if (config.chunkSize < RECOMMENDATIONS.chunkSize.min) {
      issues.push({
        severity: "warning",
        field: "chunkSize",
        message: `チャンクサイズが小さすぎます (${formatBytes(config.chunkSize)})`,
        recommendation: `最小 ${formatBytes(RECOMMENDATIONS.chunkSize.min)} を推奨`,
      });
    }
    if (config.chunkSize > RECOMMENDATIONS.chunkSize.max) {
      issues.push({
        severity: "warning",
        field: "chunkSize",
        message: `チャンクサイズが大きすぎます (${formatBytes(config.chunkSize)})`,
        recommendation: `最大 ${formatBytes(RECOMMENDATIONS.chunkSize.max)} を推奨`,
      });
    }
  } else {
    recommendations.push({
      field: "chunkSize",
      message: `チャンクサイズが未設定`,
      recommendation: `${formatBytes(RECOMMENDATIONS.chunkSize.default)} を推奨`,
    });
  }

  // タイムアウトの検証
  if (config.timeout) {
    if (config.timeout < RECOMMENDATIONS.timeout.base) {
      issues.push({
        severity: "error",
        field: "timeout",
        message: `タイムアウトが短すぎます (${config.timeout}ms)`,
        recommendation: `最小 ${RECOMMENDATIONS.timeout.base}ms を推奨`,
      });
    }
  }

  // リトライ回数の検証
  if (config.maxRetries !== undefined) {
    if (config.maxRetries < RECOMMENDATIONS.maxRetries.min) {
      issues.push({
        severity: "warning",
        field: "maxRetries",
        message: `リトライ回数が少なすぎます (${config.maxRetries})`,
        recommendation: `最小 ${RECOMMENDATIONS.maxRetries.min} 回を推奨`,
      });
    }
    if (config.maxRetries > RECOMMENDATIONS.maxRetries.max) {
      issues.push({
        severity: "warning",
        field: "maxRetries",
        message: `リトライ回数が多すぎます (${config.maxRetries})`,
        recommendation: `最大 ${RECOMMENDATIONS.maxRetries.max} 回を推奨`,
      });
    }
  }

  return { issues, recommendations };
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  }
  return `${bytes}B`;
}

function printReport(analysis) {
  console.log("\n📊 アップロード設定分析レポート\n");
  console.log("=".repeat(50));

  if (analysis.issues.length === 0 && analysis.recommendations.length === 0) {
    console.log("\n✅ 設定に問題は見つかりませんでした\n");
    return;
  }

  if (analysis.issues.length > 0) {
    console.log("\n⚠️  検出された問題:\n");
    analysis.issues.forEach((issue, index) => {
      const icon = issue.severity === "error" ? "🔴" : "🟡";
      console.log(`  ${index + 1}. ${icon} [${issue.field}] ${issue.message}`);
      console.log(`     → ${issue.recommendation}`);
    });
  }

  if (analysis.recommendations.length > 0) {
    console.log("\n💡 推奨事項:\n");
    analysis.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. [${rec.field}] ${rec.message}`);
      console.log(`     → ${rec.recommendation}`);
    });
  }

  console.log("\n" + "=".repeat(50) + "\n");
}

// メイン処理
const configPath = process.argv[2];

if (!configPath) {
  console.error("使用方法: node analyze-upload-config.mjs <config-file>");
  process.exit(1);
}

const fullPath = resolve(configPath);

if (!existsSync(fullPath)) {
  console.error(`ファイルが見つかりません: ${fullPath}`);
  process.exit(1);
}

try {
  const configContent = readFileSync(fullPath, "utf-8");
  const config = JSON.parse(configContent);
  const analysis = analyzeConfig(config);
  printReport(analysis);
} catch (error) {
  console.error(`設定ファイルの読み込みに失敗しました: ${error.message}`);
  process.exit(1);
}
