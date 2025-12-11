#!/usr/bin/env node
/**
 * トレース分析スクリプト
 *
 * 用途: トレースデータからボトルネックとクリティカルパスを分析
 * 使用例: node analyze-trace.mjs <trace.json>
 */

import fs from "fs";
import path from "path";

// スパンツリーの構築
function buildSpanTree(spans) {
  const spanMap = new Map();
  const rootSpans = [];

  // スパンをマップに格納
  spans.forEach((span) => {
    spanMap.set(span.spanId, {
      ...span,
      children: [],
    });
  });

  // 親子関係を構築
  spans.forEach((span) => {
    const spanNode = spanMap.get(span.spanId);

    if (span.parentSpanId) {
      const parent = spanMap.get(span.parentSpanId);
      if (parent) {
        parent.children.push(spanNode);
      }
    } else {
      rootSpans.push(spanNode);
    }
  });

  return rootSpans;
}

// クリティカルパスの特定
function findCriticalPath(span, path = []) {
  path.push(span);

  if (span.children.length === 0) {
    return path;
  }

  // 最も時間がかかった子スパンを追跡
  const slowestChild = span.children.reduce((slowest, child) =>
    child.duration > slowest.duration ? child : slowest,
  );

  return findCriticalPath(slowestChild, path);
}

// スパンツリーの表示
function printSpanTree(span, indent = 0) {
  const prefix = "  ".repeat(indent);
  const duration = span.duration.toFixed(2);
  const percentage = ((span.duration / rootDuration) * 100).toFixed(1);

  console.log(`${prefix}├─ ${span.name} (${duration}ms, ${percentage}%)`);

  if (span.attributes) {
    Object.entries(span.attributes).forEach(([key, value]) => {
      console.log(`${prefix}│  ${key}: ${value}`);
    });
  }

  span.children.forEach((child) => printSpanTree(child, indent + 1));
}

let rootDuration = 0;

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: node analyze-trace.mjs <trace.json>");
    console.error("\nTrace JSON format:");
    console.error("{");
    console.error('  "traceId": "...",');
    console.error('  "spans": [');
    console.error(
      '    { "spanId": "...", "parentSpanId": "...", "name": "...", "duration": 123, ... }',
    );
    console.error("  ]");
    console.error("}");
    process.exit(1);
  }

  const traceFilePath = path.resolve(args[0]);

  if (!fs.existsSync(traceFilePath)) {
    console.error(`Error: File not found: ${traceFilePath}`);
    process.exit(1);
  }

  const traceData = JSON.parse(fs.readFileSync(traceFilePath, "utf-8"));
  const { traceId, spans } = traceData;

  if (!spans || spans.length === 0) {
    console.error("Error: No spans found in trace data");
    process.exit(1);
  }

  console.log(`\n📊 Analyzing Trace: ${traceId}\n`);

  // スパンツリー構築
  const spanTree = buildSpanTree(spans);

  if (spanTree.length === 0) {
    console.error("Error: Could not build span tree");
    process.exit(1);
  }

  const rootSpan = spanTree[0];
  rootDuration = rootSpan.duration;

  // トレース概要
  console.log("=".repeat(60));
  console.log("Trace Summary:");
  console.log("=".repeat(60));
  console.log(`Trace ID: ${traceId}`);
  console.log(`Total Duration: ${rootDuration.toFixed(2)}ms`);
  console.log(`Total Spans: ${spans.length}`);
  console.log("");

  // スパンツリー表示
  console.log("Span Tree:");
  console.log("");
  printSpanTree(rootSpan);
  console.log("");

  // クリティカルパス分析
  console.log("=".repeat(60));
  console.log("Critical Path Analysis:");
  console.log("=".repeat(60));

  const criticalPath = findCriticalPath(rootSpan);
  console.log("\nCritical Path (最も時間がかかった経路):");
  criticalPath.forEach((span, index) => {
    const duration = span.duration.toFixed(2);
    const percentage = ((span.duration / rootDuration) * 100).toFixed(1);
    console.log(
      `  ${index + 1}. ${span.name} - ${duration}ms (${percentage}%)`,
    );
  });

  // ボトルネック特定
  const bottleneck = criticalPath.reduce((slowest, span) =>
    span.duration > slowest.duration ? span : slowest,
  );

  console.log(`\n🎯 Bottleneck: ${bottleneck.name}`);
  console.log(`   Duration: ${bottleneck.duration.toFixed(2)}ms`);
  console.log(
    `   Impact: ${((bottleneck.duration / rootDuration) * 100).toFixed(1)}% of total`,
  );

  // 推奨事項
  console.log("\n💡 Recommendations:");

  if (bottleneck.duration / rootDuration > 0.5) {
    console.log(
      `⚠️  "${bottleneck.name}" accounts for >50% of total duration. Optimize this span.`,
    );
  }

  // 遅いスパンを特定
  const slowSpans = spans
    .filter((span) => span.duration > 100)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);

  if (slowSpans.length > 0) {
    console.log("\n🐌 Slowest Spans:");
    slowSpans.forEach((span, index) => {
      console.log(
        `  ${index + 1}. ${span.name} - ${span.duration.toFixed(2)}ms`,
      );
    });
  }

  console.log("\n");
}

main();
