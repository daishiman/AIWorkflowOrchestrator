#!/usr/bin/env node

/**
 * WebSocket設定分析スクリプト
 *
 * 使用方法:
 *   node analyze-websocket-config.mjs [設定ファイルパス]
 *
 * 分析内容:
 *   - 再接続設定の妥当性
 *   - ハートビート設定の妥当性
 *   - キュー設定の妥当性
 *   - 推奨事項の提示
 */

import { readFileSync, existsSync } from "fs";

// ============================================================
// 推奨値
// ============================================================

const RECOMMENDED = {
  // 再接続
  maxRetries: { min: 5, max: 20, default: 10 },
  baseDelay: { min: 500, max: 5000, default: 1000 },
  maxDelay: { min: 10000, max: 60000, default: 30000 },
  connectionTimeout: { min: 5000, max: 30000, default: 10000 },

  // ハートビート
  heartbeatInterval: { min: 15000, max: 60000, default: 30000 },
  heartbeatTimeout: { min: 5000, max: 15000, default: 10000 },
  maxMissedHeartbeats: { min: 2, max: 5, default: 3 },

  // キュー
  queueMaxSize: { min: 100, max: 10000, default: 1000 },
  queueMaxAge: { min: 60000, max: 600000, default: 300000 },
};

// ============================================================
// 分析関数
// ============================================================

function analyzeConfig(config) {
  const results = {
    errors: [],
    warnings: [],
    info: [],
    score: 100,
  };

  // 必須フィールドチェック
  if (!config.url) {
    results.errors.push("❌ url が設定されていません");
    results.score -= 30;
  }

  // 再接続設定
  analyzeRange(results, config, "maxRetries", RECOMMENDED.maxRetries);
  analyzeRange(results, config, "baseDelay", RECOMMENDED.baseDelay);
  analyzeRange(results, config, "maxDelay", RECOMMENDED.maxDelay);
  analyzeRange(
    results,
    config,
    "connectionTimeout",
    RECOMMENDED.connectionTimeout,
  );

  // baseDelay < maxDelay チェック
  if (
    config.baseDelay &&
    config.maxDelay &&
    config.baseDelay >= config.maxDelay
  ) {
    results.errors.push(
      "❌ baseDelay は maxDelay より小さくする必要があります",
    );
    results.score -= 15;
  }

  // ハートビート設定
  analyzeRange(
    results,
    config,
    "heartbeatInterval",
    RECOMMENDED.heartbeatInterval,
  );
  analyzeRange(
    results,
    config,
    "heartbeatTimeout",
    RECOMMENDED.heartbeatTimeout,
  );
  analyzeRange(
    results,
    config,
    "maxMissedHeartbeats",
    RECOMMENDED.maxMissedHeartbeats,
  );

  // heartbeatTimeout < heartbeatInterval チェック
  if (
    config.heartbeatInterval &&
    config.heartbeatTimeout &&
    config.heartbeatTimeout >= config.heartbeatInterval
  ) {
    results.warnings.push(
      "⚠️ heartbeatTimeout は heartbeatInterval より小さくすることを推奨します",
    );
    results.score -= 5;
  }

  // キュー設定
  analyzeRange(results, config, "queueMaxSize", RECOMMENDED.queueMaxSize);
  analyzeRange(results, config, "queueMaxAge", RECOMMENDED.queueMaxAge);

  // プロキシ対策チェック
  if (config.heartbeatInterval && config.heartbeatInterval > 30000) {
    results.warnings.push(
      "⚠️ heartbeatInterval が 30秒を超えています。プロキシによる切断に注意してください",
    );
  }

  // autoReconnect チェック
  if (config.autoReconnect === false) {
    results.info.push("ℹ️ autoReconnect が無効です。手動での再接続が必要です");
  }

  return results;
}

function analyzeRange(results, config, key, range) {
  const value = config[key];

  if (value === undefined) {
    results.info.push(
      `ℹ️ ${key} が未設定です。デフォルト値 ${range.default} が使用されます`,
    );
    return;
  }

  if (value < range.min) {
    results.warnings.push(
      `⚠️ ${key} (${value}) が推奨最小値 ${range.min} より小さいです`,
    );
    results.score -= 5;
  } else if (value > range.max) {
    results.warnings.push(
      `⚠️ ${key} (${value}) が推奨最大値 ${range.max} より大きいです`,
    );
    results.score -= 5;
  }
}

// ============================================================
// レポート出力
// ============================================================

function printReport(config, results) {
  console.log("\n" + "=".repeat(60));
  console.log("📊 WebSocket設定分析レポート");
  console.log("=".repeat(60) + "\n");

  // 設定サマリー
  console.log("📋 設定サマリー:");
  console.log(`   URL: ${config.url || "(未設定)"}`);
  console.log(
    `   自動再接続: ${config.autoReconnect !== false ? "有効" : "無効"}`,
  );
  console.log(
    `   最大リトライ: ${config.maxRetries || RECOMMENDED.maxRetries.default}`,
  );
  console.log(
    `   ハートビート間隔: ${config.heartbeatInterval || RECOMMENDED.heartbeatInterval.default}ms`,
  );
  console.log(
    `   キュー最大サイズ: ${config.queueMaxSize || RECOMMENDED.queueMaxSize.default}`,
  );
  console.log("");

  // エラー
  if (results.errors.length > 0) {
    console.log("🔴 エラー:");
    results.errors.forEach((e) => console.log(`   ${e}`));
    console.log("");
  }

  // 警告
  if (results.warnings.length > 0) {
    console.log("🟡 警告:");
    results.warnings.forEach((w) => console.log(`   ${w}`));
    console.log("");
  }

  // 情報
  if (results.info.length > 0) {
    console.log("🔵 情報:");
    results.info.forEach((i) => console.log(`   ${i}`));
    console.log("");
  }

  // スコア
  const scoreColor =
    results.score >= 80 ? "🟢" : results.score >= 60 ? "🟡" : "🔴";
  console.log("=".repeat(60));
  console.log(`${scoreColor} 総合スコア: ${Math.max(0, results.score)}/100`);
  console.log("=".repeat(60) + "\n");

  // 推奨事項
  if (results.score < 100) {
    console.log("💡 推奨事項:");

    if (results.errors.length > 0) {
      console.log("   1. エラーを修正してください");
    }

    if (results.warnings.length > 0) {
      console.log("   2. 警告の設定値を見直してください");
    }

    console.log(
      "   3. 本番環境ではハートビート間隔を30秒以下に設定してください",
    );
    console.log("   4. キューサイズはメモリ使用量を考慮して設定してください");
    console.log("");
  }
}

// ============================================================
// メイン
// ============================================================

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // サンプル設定で分析
    console.log(
      "📝 設定ファイルが指定されていないため、サンプル設定を分析します",
    );

    const sampleConfig = {
      url: "wss://example.com/ws",
      maxRetries: 10,
      baseDelay: 1000,
      maxDelay: 30000,
      connectionTimeout: 10000,
      heartbeatInterval: 30000,
      heartbeatTimeout: 10000,
      maxMissedHeartbeats: 3,
      queueMaxSize: 1000,
      queueMaxAge: 300000,
      autoReconnect: true,
    };

    const results = analyzeConfig(sampleConfig);
    printReport(sampleConfig, results);
    return;
  }

  const configPath = args[0];

  if (!existsSync(configPath)) {
    console.error(`❌ ファイルが見つかりません: ${configPath}`);
    process.exit(1);
  }

  try {
    const content = readFileSync(configPath, "utf-8");
    const config = JSON.parse(content);

    const results = analyzeConfig(config);
    printReport(config, results);

    // エラーがあれば終了コード1
    if (results.errors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ 設定ファイルの読み込みエラー: ${error.message}`);
    process.exit(1);
  }
}

main();
