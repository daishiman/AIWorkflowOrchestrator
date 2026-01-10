#!/usr/bin/env node

/**
 * Retry Configuration Analyzer
 *
 * リトライ設定を分析し、推奨値との比較や潜在的な問題を検出するスクリプト
 *
 * Usage:
 *   node scripts/analyze-retry-config.mjs <config-file.json>
 *   node scripts/analyze-retry-config.mjs --inline '{"maxRetries":3,"baseDelay":1000}'
 */

import fs from "fs";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

function showHelp() {
  console.log(`
Usage:
  node scripts/analyze-retry-config.mjs <config-file.json>
  node scripts/analyze-retry-config.mjs --inline '{"retry":{"maxRetries":3}}'

Options:
  --inline <json>   JSON文字列で設定を渡す
  -h, --help        ヘルプを表示
`);
}

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

function parseArgs(args) {
  if (args.includes("-h") || args.includes("--help")) {
    return { help: true };
  }

  let mode = null;
  let value = null;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "--inline") {
      if (mode) {
        return { error: "--inline とファイルパスは同時に指定できません" };
      }
      const next = args[i + 1];
      if (!next) {
        return { error: "--inline の次にJSON文字列を指定してください" };
      }
      mode = "inline";
      value = next;
      i += 1;
      continue;
    }

    if (arg.startsWith("-")) {
      return { error: `不明なオプション: ${arg}` };
    }

    if (mode) {
      return { error: `不要な引数が指定されています: ${arg}` };
    }

    mode = "file";
    value = arg;
  }

  if (!mode) {
    return { error: "設定ファイルまたは --inline を指定してください" };
  }

  return { mode, value };
}

// 設定の分析
function analyzeConfig(config) {
  const result = new AnalysisResult();

  if (config.retry) {
    analyzeRetryConfig(config.retry, result);
  }

  if (config.circuitBreaker) {
    analyzeCircuitBreakerConfig(config.circuitBreaker, result);
  }

  if (config.timeout) {
    analyzeTimeoutConfig(config.timeout, result);
  }

  analyzeOverall(config, result);

  return result;
}

function analyzeRetryConfig(retry, result) {
  const rec = RECOMMENDED_CONFIG.retry;

  if (retry.maxRetries !== undefined) {
    if (retry.maxRetries < rec.maxRetries.min) {
      result.addWarning(
        `maxRetries (${retry.maxRetries}) は推奨最小値 (${rec.maxRetries.min}) より小さいです`,
        {
          field: "maxRetries",
          value: retry.maxRetries,
          recommended: rec.maxRetries,
        },
      );
    }
    if (retry.maxRetries > rec.maxRetries.max) {
      result.addWarning(
        `maxRetries (${retry.maxRetries}) は推奨最大値 (${rec.maxRetries.max}) より大きいです`,
        {
          field: "maxRetries",
          value: retry.maxRetries,
          recommended: rec.maxRetries,
        },
      );
    }
  }

  if (retry.baseDelay !== undefined) {
    if (retry.baseDelay < rec.baseDelay.min) {
      result.addWarning(
        `baseDelay (${retry.baseDelay}ms) は推奨最小値 (${rec.baseDelay.min}ms) より小さいです`,
        {
          field: "baseDelay",
          value: retry.baseDelay,
          recommended: rec.baseDelay,
        },
      );
    }
    if (retry.baseDelay > rec.baseDelay.max) {
      result.addWarning(
        `baseDelay (${retry.baseDelay}ms) は推奨最大値 (${rec.baseDelay.max}ms) より大きいです`,
        {
          field: "baseDelay",
          value: retry.baseDelay,
          recommended: rec.baseDelay,
        },
      );
    }
  }

  if (retry.maxDelay !== undefined && retry.baseDelay !== undefined) {
    if (retry.maxDelay < retry.baseDelay) {
      result.addError(
        `maxDelay (${retry.maxDelay}ms) は baseDelay (${retry.baseDelay}ms) より小さくできません`,
        {
          field: "maxDelay",
          value: retry.maxDelay,
          baseDelay: retry.baseDelay,
        },
      );
    }
  }

  if (retry.jitterFactor !== undefined) {
    if (retry.jitterFactor < 0 || retry.jitterFactor > 1) {
      result.addError(
        `jitterFactor (${retry.jitterFactor}) は 0-1 の範囲である必要があります`,
        { field: "jitterFactor", value: retry.jitterFactor },
      );
    }
    if (retry.jitterFactor === 0) {
      result.addSuggestion(
        "jitterFactor が 0 です。同時リトライを避けるため、ジッターの追加を推奨します",
        { field: "jitterFactor", recommended: rec.jitterFactor.default },
      );
    }
  }

  if (retry.maxRetries && retry.baseDelay && retry.maxDelay) {
    const totalWaitTime = calculateTotalWaitTime(retry);
    result.setMetric("totalMaxWaitTime", totalWaitTime);

    if (totalWaitTime > 120000) {
      result.addSuggestion(
        `総最大待機時間 (${formatDuration(totalWaitTime)}) が長いです。ユーザー体験への影響を考慮してください`,
        { totalWaitTime },
      );
    }
  }
}

function analyzeCircuitBreakerConfig(cb, result) {
  const rec = RECOMMENDED_CONFIG.circuitBreaker;

  if (cb.failureThreshold !== undefined) {
    if (cb.failureThreshold < rec.failureThreshold.min) {
      result.addWarning(
        `failureThreshold (${cb.failureThreshold}) は推奨最小値 (${rec.failureThreshold.min}) より小さいです。フラッピングの原因になる可能性があります`,
        {
          field: "failureThreshold",
          value: cb.failureThreshold,
          recommended: rec.failureThreshold,
        },
      );
    }
    if (cb.failureThreshold > rec.failureThreshold.max) {
      result.addWarning(
        `failureThreshold (${cb.failureThreshold}) は推奨最大値 (${rec.failureThreshold.max}) より大きいです`,
        {
          field: "failureThreshold",
          value: cb.failureThreshold,
          recommended: rec.failureThreshold,
        },
      );
    }
  }

  if (cb.successThreshold !== undefined && cb.failureThreshold !== undefined) {
    if (cb.successThreshold > cb.failureThreshold) {
      result.addWarning(
        `successThreshold (${cb.successThreshold}) が failureThreshold (${cb.failureThreshold}) より大きいです`,
        {
          successThreshold: cb.successThreshold,
          failureThreshold: cb.failureThreshold,
        },
      );
    }
  }

  if (cb.timeout !== undefined) {
    if (cb.timeout < rec.timeout.min) {
      result.addWarning(
        `サーキットブレーカー timeout (${cb.timeout}ms) が短すぎます。外部サービスの復旧時間を考慮してください`,
        { field: "timeout", value: cb.timeout, recommended: rec.timeout },
      );
    }
  }
}

function analyzeTimeoutConfig(timeout, result) {
  const rec = RECOMMENDED_CONFIG.timeout;

  if (timeout.connection !== undefined) {
    if (timeout.connection > rec.connection.max) {
      result.addWarning(
        `接続タイムアウト (${timeout.connection}ms) が長すぎます`,
        {
          field: "connection",
          value: timeout.connection,
          recommended: rec.connection,
        },
      );
    }
  }

  if (timeout.read !== undefined && timeout.connection !== undefined) {
    if (timeout.read < timeout.connection) {
      result.addWarning(
        `読み取りタイムアウト (${timeout.read}ms) が接続タイムアウト (${timeout.connection}ms) より短いです`,
        { read: timeout.read, connection: timeout.connection },
      );
    }
  }

  if (timeout.total !== undefined) {
    if (timeout.read && timeout.total < timeout.read) {
      result.addError(
        `全体タイムアウト (${timeout.total}ms) が読み取りタイムアウト (${timeout.read}ms) より短いです`,
        { total: timeout.total, read: timeout.read },
      );
    }
  }
}

function analyzeOverall(config, result) {
  if (config.retry && config.circuitBreaker) {
    const totalWaitTime = calculateTotalWaitTime(config.retry);
    const cbTimeout =
      config.circuitBreaker.timeout ||
      RECOMMENDED_CONFIG.circuitBreaker.timeout.default;

    if (totalWaitTime > cbTimeout) {
      result.addSuggestion(
        `リトライの総待機時間 (${formatDuration(totalWaitTime)}) がサーキットブレーカーの timeout (${formatDuration(cbTimeout)}) より長いです`,
        { totalWaitTime, cbTimeout },
      );
    }
  }

  if (config.retry && config.timeout) {
    const totalTimeout =
      config.timeout.total || RECOMMENDED_CONFIG.timeout.total.default;
    const maxRetries =
      config.retry.maxRetries || RECOMMENDED_CONFIG.retry.maxRetries.default;
    const perRequestTimeout = totalTimeout / maxRetries;

    result.setMetric("perRequestTimeout", perRequestTimeout);

    if (perRequestTimeout < 5000) {
      result.addWarning(
        `リクエストあたりのタイムアウト (${formatDuration(perRequestTimeout)}) が短すぎる可能性があります`,
        { perRequestTimeout, totalTimeout, maxRetries },
      );
    }
  }
}

function calculateTotalWaitTime(retry) {
  const maxRetries = retry.maxRetries || 3;
  const baseDelay = retry.baseDelay || 1000;
  const maxDelay = retry.maxDelay || 30000;
  const jitterFactor = retry.jitterFactor || 0.3;

  let total = 0;
  for (let i = 0; i < maxRetries; i += 1) {
    const delay = Math.min(baseDelay * Math.pow(2, i), maxDelay);
    const maxJitter = delay * jitterFactor;
    total += delay + maxJitter;
  }

  return total;
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}秒`;
  return `${(ms / 60000).toFixed(1)}分`;
}

function printReport(result) {
  console.log("\n" + "=".repeat(60));
  console.log("Retry Configuration Analysis Report");
  console.log("=".repeat(60));

  if (Object.keys(result.metrics).length > 0) {
    console.log("\n📊 Metrics:");
    for (const [key, value] of Object.entries(result.metrics)) {
      console.log(
        `  ${key}: ${typeof value === "number" ? formatDuration(value) : value}`,
      );
    }
  }

  if (result.errors.length > 0) {
    console.log("\n❌ Errors:");
    result.errors.forEach((e) => {
      console.log(`  ${e.message}`);
    });
  }

  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    result.warnings.forEach((w) => {
      console.log(`  ${w.message}`);
    });
  }

  if (result.suggestions.length > 0) {
    console.log("\nℹ️  Suggestions:");
    result.suggestions.forEach((s) => {
      console.log(`  ${s.message}`);
    });
  }

  console.log("\n" + "-".repeat(60));
  if (result.isValid) {
    console.log("✅ Configuration is valid");
  } else {
    console.log("❌ Configuration has errors");
  }
  console.log("-".repeat(60) + "\n");

  return result.isValid;
}

function loadConfig(mode, value) {
  if (mode === "inline") {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error("Error: --inline のJSON文字列が不正です");
      process.exit(EXIT_ARGS_ERROR);
    }
  }

  if (!fs.existsSync(value)) {
    console.error(`Error: ファイルが見つかりません: ${value}`);
    process.exit(EXIT_FILE_MISSING);
  }

  try {
    return JSON.parse(fs.readFileSync(value, "utf-8"));
  } catch (error) {
    console.error(`Error: JSONの解析に失敗しました: ${error.message}`);
    process.exit(EXIT_ARGS_ERROR);
  }

  return null;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  if (args.error) {
    console.error(`Error: ${args.error}`);
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  const config = loadConfig(args.mode, args.value);
  const result = analyzeConfig(config);
  const isValid = printReport(result);

  process.exit(isValid ? EXIT_SUCCESS : EXIT_VALIDATION_ERROR);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(EXIT_ERROR);
}
