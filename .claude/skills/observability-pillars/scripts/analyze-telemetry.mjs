#!/usr/bin/env node
/**
 * テレメトリデータ分析スクリプト
 *
 * 用途: ログ・メトリクス・トレースの相関を分析し、統合状況を検証
 * 使用例: node analyze-telemetry.mjs <log-file.jsonl>
 */

import fs from "fs";
import path from "path";

// 分析結果の初期化
const analysis = {
  totalLogs: 0,
  logsWithTraceId: 0,
  logsWithRequestId: 0,
  uniqueTraceIds: new Set(),
  uniqueRequestIds: new Set(),
  logLevelDistribution: {},
  servicesDetected: new Set(),
  correlationCoverage: 0,
};

// ログエントリの分析
function analyzeLogEntry(entry) {
  analysis.totalLogs++;

  // Trace ID の存在確認
  if (entry.trace_id) {
    analysis.logsWithTraceId++;
    analysis.uniqueTraceIds.add(entry.trace_id);
  }

  // Request ID の存在確認
  if (entry.request_id) {
    analysis.logsWithRequestId++;
    analysis.uniqueRequestIds.add(entry.request_id);
  }

  // ログレベル分布
  const level = entry.level || "UNKNOWN";
  analysis.logLevelDistribution[level] =
    (analysis.logLevelDistribution[level] || 0) + 1;

  // サービス検出
  if (entry.service) {
    analysis.servicesDetected.add(entry.service);
  }
}

// サマリー計算
function calculateSummary() {
  // 相関ID カバレッジ
  analysis.correlationCoverage =
    (analysis.logsWithRequestId / analysis.totalLogs) * 100;

  return {
    totalLogs: analysis.totalLogs,
    correlationCoverage: analysis.correlationCoverage.toFixed(2) + "%",
    traceIdCoverage:
      ((analysis.logsWithTraceId / analysis.totalLogs) * 100).toFixed(2) + "%",
    uniqueTraceIds: analysis.uniqueTraceIds.size,
    uniqueRequestIds: analysis.uniqueRequestIds.size,
    logLevelDistribution: analysis.logLevelDistribution,
    servicesDetected: Array.from(analysis.servicesDetected),
  };
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: node analyze-telemetry.mjs <log-file.jsonl>");
    process.exit(1);
  }

  const logFilePath = path.resolve(args[0]);

  if (!fs.existsSync(logFilePath)) {
    console.error(`Error: File not found: ${logFilePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(logFilePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());

  console.log(`\n📊 Analyzing telemetry data: ${logFilePath}\n`);

  lines.forEach((line, index) => {
    try {
      const entry = JSON.parse(line);
      analyzeLogEntry(entry);
    } catch (error) {
      console.warn(`⚠️  Line ${index + 1}: Invalid JSON`);
    }
  });

  const summary = calculateSummary();

  // サマリー出力
  console.log("=".repeat(60));
  console.log("📊 Telemetry Analysis Summary:");
  console.log("=".repeat(60));
  console.log(`Total logs: ${summary.totalLogs}`);
  console.log(`Correlation ID coverage: ${summary.correlationCoverage}`);
  console.log(`Trace ID coverage: ${summary.traceIdCoverage}`);
  console.log(`Unique trace IDs: ${summary.uniqueTraceIds}`);
  console.log(`Unique request IDs: ${summary.uniqueRequestIds}`);
  console.log(`Services detected: ${summary.servicesDetected.join(", ")}`);
  console.log("\nLog Level Distribution:");
  Object.entries(summary.logLevelDistribution).forEach(([level, count]) => {
    const percentage = ((count / summary.totalLogs) * 100).toFixed(2);
    console.log(`  ${level}: ${count} (${percentage}%)`);
  });
  console.log("=".repeat(60));

  // 推奨事項
  console.log("\n💡 Recommendations:");

  if (parseFloat(summary.correlationCoverage) < 95) {
    console.log(
      "⚠️  Correlation ID coverage < 95%. Ensure all logs include request_id.",
    );
  }

  if (parseFloat(summary.traceIdCoverage) < 80 && summary.totalLogs > 100) {
    console.log(
      "⚠️  Trace ID coverage < 80%. Consider enabling distributed tracing.",
    );
  }

  if (summary.servicesDetected.length === 0) {
    console.log(
      '⚠️  No service names detected. Add "service" field to all logs.',
    );
  }

  const errorPercentage =
    ((analysis.logLevelDistribution["ERROR"] || 0) / summary.totalLogs) * 100;
  if (errorPercentage > 5) {
    console.log(
      `🚨 Error rate is ${errorPercentage.toFixed(2)}% (> 5%). Investigate error logs.`,
    );
  }

  console.log("\n");
}

main();
