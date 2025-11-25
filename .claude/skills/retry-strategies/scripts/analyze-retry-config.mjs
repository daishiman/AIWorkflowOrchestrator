#!/usr/bin/env node

/**
 * Retry Configuration Analyzer
 *
 * リトライ設定を分析し、推奨値との比較や潜在的な問題を検出するスクリプト
 *
 * Usage:
 *   node analyze-retry-config.mjs <config-file.json>
 *   node analyze-retry-config.mjs --inline '{"maxRetries":3,"baseDelay":1000}'
 */

import fs from "fs";

// 推奨設定
const RECOMMENDED_CONFIG = {
  retry: {
    maxRetries: { min: 2, max: 10, default: 3 },
    baseDelay: { min: 100, max: 5000, default: 1000 },
    maxDelay: { min: 5000, max: 300000, default: 30000 },
    jitterFactor: { min: 0.1, max: 0.5, default: 0.3 },
  },
  circuitBreaker: {
    failureThreshold: { min: 3, max: 20, default: 5 },
    successThreshold: { min: 1, max: 10, default: 3 },
    timeout: { min: 5000, max: 120000, default: 30000 },
    halfOpenMaxCalls: { min: 1, max: 10, default: 2 },
  },
  timeout: {
    connection: { min: 1000, max: 30000, default: 5000 },
    read: { min: 5000, max: 120000, default: 30000 },
    total: { min: 10000, max: 300000, default: 60000 },
  },
};

// 分析結果
class AnalysisResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
    this.metrics = {};
  }

  addError(message, details = {}) {
    this.errors.push({ message, ...details });
  }

  addWarning(message, details = {}) {
    this.warnings.push({ message, ...details });
  }

  addSuggestion(message, details = {}) {
    this.suggestions.push({ message, ...details });
  }

  setMetric(name, value) {
    this.metrics[name] = value;
  }

  get isValid() {
    return this.errors.length === 0;
  }
}

// 設定の分析
function analyzeConfig(config) {
  const result = new AnalysisResult();

  // リトライ設定の分析
  if (config.retry) {
    analyzeRetryConfig(config.retry, result);
  }

  // サーキットブレーカー設定の分析
  if (config.circuitBreaker) {
    analyzeCircuitBreakerConfig(config.circuitBreaker, result);
  }

  // タイムアウト設定の分析
  if (config.timeout) {
    analyzeTimeoutConfig(config.timeout, result);
  }

  // 総合分析
  analyzeOverall(config, result);

  return result;
}

// リトライ設定の分析
function analyzeRetryConfig(retry, result) {
  const rec = RECOMMENDED_CONFIG.retry;

  // maxRetries チェック
  if (retry.maxRetries !== undefined) {
    if (retry.maxRetries < rec.maxRetries.min) {
      result.addWarning(
        `maxRetries (${retry.maxRetries}) は推奨最小値 (${rec.maxRetries.min}) より小さいです`,
        { field: "maxRetries", value: retry.maxRetries, recommended: rec.maxRetries }
      );
    }
    if (retry.maxRetries > rec.maxRetries.max) {
      result.addWarning(
        `maxRetries (${retry.maxRetries}) は推奨最大値 (${rec.maxRetries.max}) より大きいです`,
        { field: "maxRetries", value: retry.maxRetries, recommended: rec.maxRetries }
      );
    }
  }

  // baseDelay チェック
  if (retry.baseDelay !== undefined) {
    if (retry.baseDelay < rec.baseDelay.min) {
      result.addWarning(
        `baseDelay (${retry.baseDelay}ms) は推奨最小値 (${rec.baseDelay.min}ms) より小さいです`,
        { field: "baseDelay", value: retry.baseDelay, recommended: rec.baseDelay }
      );
    }
    if (retry.baseDelay > rec.baseDelay.max) {
      result.addWarning(
        `baseDelay (${retry.baseDelay}ms) は推奨最大値 (${rec.baseDelay.max}ms) より大きいです`,
        { field: "baseDelay", value: retry.baseDelay, recommended: rec.baseDelay }
      );
    }
  }

  // maxDelay チェック
  if (retry.maxDelay !== undefined && retry.baseDelay !== undefined) {
    if (retry.maxDelay < retry.baseDelay) {
      result.addError(
        `maxDelay (${retry.maxDelay}ms) は baseDelay (${retry.baseDelay}ms) より小さくできません`,
        { field: "maxDelay", value: retry.maxDelay, baseDelay: retry.baseDelay }
      );
    }
  }

  // ジッター チェック
  if (retry.jitterFactor !== undefined) {
    if (retry.jitterFactor < 0 || retry.jitterFactor > 1) {
      result.addError(
        `jitterFactor (${retry.jitterFactor}) は 0-1 の範囲である必要があります`,
        { field: "jitterFactor", value: retry.jitterFactor }
      );
    }
    if (retry.jitterFactor === 0) {
      result.addSuggestion(
        "jitterFactor が 0 です。同時リトライを避けるため、ジッターの追加を推奨します",
        { field: "jitterFactor", recommended: rec.jitterFactor.default }
      );
    }
  }

  // 総待機時間の計算
  if (retry.maxRetries && retry.baseDelay && retry.maxDelay) {
    const totalWaitTime = calculateTotalWaitTime(retry);
    result.setMetric("totalMaxWaitTime", totalWaitTime);

    if (totalWaitTime > 120000) {
      result.addSuggestion(
        `総最大待機時間 (${formatDuration(totalWaitTime)}) が長いです。ユーザー体験への影響を考慮してください`,
        { totalWaitTime }
      );
    }
  }
}

// サーキットブレーカー設定の分析
function analyzeCircuitBreakerConfig(cb, result) {
  const rec = RECOMMENDED_CONFIG.circuitBreaker;

  // failureThreshold チェック
  if (cb.failureThreshold !== undefined) {
    if (cb.failureThreshold < rec.failureThreshold.min) {
      result.addWarning(
        `failureThreshold (${cb.failureThreshold}) は推奨最小値 (${rec.failureThreshold.min}) より小さいです。フラッピングの原因になる可能性があります`,
        { field: "failureThreshold", value: cb.failureThreshold, recommended: rec.failureThreshold }
      );
    }
  }

  // successThreshold チェック
  if (cb.successThreshold !== undefined && cb.failureThreshold !== undefined) {
    if (cb.successThreshold > cb.failureThreshold) {
      result.addWarning(
        `successThreshold (${cb.successThreshold}) が failureThreshold (${cb.failureThreshold}) より大きいです`,
        { successThreshold: cb.successThreshold, failureThreshold: cb.failureThreshold }
      );
    }
  }

  // timeout チェック
  if (cb.timeout !== undefined) {
    if (cb.timeout < rec.timeout.min) {
      result.addWarning(
        `サーキットブレーカー timeout (${cb.timeout}ms) が短すぎます。外部サービスの復旧時間を考慮してください`,
        { field: "timeout", value: cb.timeout, recommended: rec.timeout }
      );
    }
  }
}

// タイムアウト設定の分析
function analyzeTimeoutConfig(timeout, result) {
  const rec = RECOMMENDED_CONFIG.timeout;

  // connection タイムアウト
  if (timeout.connection !== undefined) {
    if (timeout.connection > rec.connection.max) {
      result.addWarning(
        `接続タイムアウト (${timeout.connection}ms) が長すぎます`,
        { field: "connection", value: timeout.connection, recommended: rec.connection }
      );
    }
  }

  // read タイムアウト
  if (timeout.read !== undefined && timeout.connection !== undefined) {
    if (timeout.read < timeout.connection) {
      result.addWarning(
        `読み取りタイムアウト (${timeout.read}ms) が接続タイムアウト (${timeout.connection}ms) より短いです`,
        { read: timeout.read, connection: timeout.connection }
      );
    }
  }

  // total タイムアウト
  if (timeout.total !== undefined) {
    if (timeout.read && timeout.total < timeout.read) {
      result.addError(
        `全体タイムアウト (${timeout.total}ms) が読み取りタイムアウト (${timeout.read}ms) より短いです`,
        { total: timeout.total, read: timeout.read }
      );
    }
  }
}

// 総合分析
function analyzeOverall(config, result) {
  // リトライとサーキットブレーカーの整合性
  if (config.retry && config.circuitBreaker) {
    const totalWaitTime = calculateTotalWaitTime(config.retry);
    const cbTimeout = config.circuitBreaker.timeout || RECOMMENDED_CONFIG.circuitBreaker.timeout.default;

    if (totalWaitTime > cbTimeout) {
      result.addSuggestion(
        `リトライの総待機時間 (${formatDuration(totalWaitTime)}) がサーキットブレーカーの timeout (${formatDuration(cbTimeout)}) より長いです`,
        { totalWaitTime, cbTimeout }
      );
    }
  }

  // リトライとタイムアウトの整合性
  if (config.retry && config.timeout) {
    const totalTimeout = config.timeout.total || RECOMMENDED_CONFIG.timeout.total.default;
    const maxRetries = config.retry.maxRetries || RECOMMENDED_CONFIG.retry.maxRetries.default;
    const perRequestTimeout = totalTimeout / maxRetries;

    result.setMetric("perRequestTimeout", perRequestTimeout);

    if (perRequestTimeout < 5000) {
      result.addWarning(
        `リクエストあたりのタイムアウト (${formatDuration(perRequestTimeout)}) が短すぎる可能性があります`,
        { perRequestTimeout, totalTimeout, maxRetries }
      );
    }
  }
}

// 総待機時間の計算
function calculateTotalWaitTime(retry) {
  const maxRetries = retry.maxRetries || 3;
  const baseDelay = retry.baseDelay || 1000;
  const maxDelay = retry.maxDelay || 30000;
  const jitterFactor = retry.jitterFactor || 0.3;

  let total = 0;
  for (let i = 0; i < maxRetries; i++) {
    const delay = Math.min(baseDelay * Math.pow(2, i), maxDelay);
    const maxJitter = delay * jitterFactor;
    total += delay + maxJitter;
  }

  return total;
}

// 時間のフォーマット
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}秒`;
  return `${(ms / 60000).toFixed(1)}分`;
}

// レポート出力
function printReport(result) {
  console.log("\n" + "=".repeat(60));
  console.log("Retry Configuration Analysis Report");
  console.log("=".repeat(60));

  // メトリクス
  if (Object.keys(result.metrics).length > 0) {
    console.log("\n📊 Metrics:");
    for (const [key, value] of Object.entries(result.metrics)) {
      console.log(`  ${key}: ${typeof value === "number" ? formatDuration(value) : value}`);
    }
  }

  // エラー
  if (result.errors.length > 0) {
    console.log("\n❌ Errors:");
    result.errors.forEach((e) => {
      console.log(`  ${e.message}`);
    });
  }

  // 警告
  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    result.warnings.forEach((w) => {
      console.log(`  ${w.message}`);
    });
  }

  // 提案
  if (result.suggestions.length > 0) {
    console.log("\nℹ️  Suggestions:");
    result.suggestions.forEach((s) => {
      console.log(`  ${s.message}`);
    });
  }

  // 結果
  console.log("\n" + "-".repeat(60));
  if (result.isValid) {
    console.log("✅ Configuration is valid");
  } else {
    console.log("❌ Configuration has errors");
  }
  console.log("-".repeat(60) + "\n");

  return result.isValid;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage:");
    console.log("  node analyze-retry-config.mjs <config-file.json>");
    console.log('  node analyze-retry-config.mjs --inline \'{"retry":{"maxRetries":3}}\'');
    process.exit(1);
  }

  let config;

  if (args[0] === "--inline") {
    if (!args[1]) {
      console.error("Error: --inline requires a JSON string");
      process.exit(1);
    }
    try {
      config = JSON.parse(args[1]);
    } catch (e) {
      console.error("Error: Invalid JSON string");
      process.exit(1);
    }
  } else {
    const filePath = args[0];
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }
    try {
      config = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      console.error(`Error: Failed to parse JSON file: ${e.message}`);
      process.exit(1);
    }
  }

  const result = analyzeConfig(config);
  const isValid = printReport(result);

  process.exit(isValid ? 0 : 1);
}

main();
