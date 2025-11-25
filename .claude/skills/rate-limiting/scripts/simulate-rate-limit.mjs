#!/usr/bin/env node

/**
 * Rate Limit Simulation Tool
 *
 * レート制限アルゴリズムの動作をシミュレートし、
 * 設定値の妥当性を検証するスクリプト
 *
 * Usage:
 *   node simulate-rate-limit.mjs --algorithm token-bucket --capacity 100 --rate 10
 *   node simulate-rate-limit.mjs --algorithm sliding-window --window 60000 --limit 100
 */

// ============================================
// アルゴリズム実装
// ============================================

class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  consume(tokens = 1) {
    this.refill();
    if (this.tokens < tokens) {
      return false;
    }
    this.tokens -= tokens;
    return true;
  }

  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }

  getTokens() {
    this.refill();
    return this.tokens;
  }
}

class SlidingWindowLog {
  constructor(windowMs, limit) {
    this.windowMs = windowMs;
    this.limit = limit;
    this.timestamps = [];
  }

  allow() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    this.timestamps = this.timestamps.filter((ts) => ts > windowStart);

    if (this.timestamps.length >= this.limit) {
      return false;
    }

    this.timestamps.push(now);
    return true;
  }

  getCount() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    return this.timestamps.filter((ts) => ts > windowStart).length;
  }
}

class FixedWindow {
  constructor(windowMs, limit) {
    this.windowMs = windowMs;
    this.limit = limit;
    this.count = 0;
    this.windowStart = Date.now();
  }

  allow() {
    const now = Date.now();
    if (now - this.windowStart >= this.windowMs) {
      this.windowStart = now;
      this.count = 0;
    }

    if (this.count >= this.limit) {
      return false;
    }

    this.count++;
    return true;
  }

  getCount() {
    return this.count;
  }
}

// ============================================
// シミュレーション
// ============================================

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateTraffic(limiter, config) {
  const { duration, requestPattern, name } = config;
  const startTime = Date.now();
  const results = {
    total: 0,
    allowed: 0,
    rejected: 0,
    timeline: [],
  };

  console.log(`\nSimulating ${name}...`);
  console.log(`Duration: ${duration}ms`);
  console.log(`Pattern: ${requestPattern.type}`);
  console.log("-".repeat(50));

  while (Date.now() - startTime < duration) {
    const elapsed = Date.now() - startTime;

    // リクエスト数を計算
    let requests = 1;
    if (requestPattern.type === "burst") {
      requests = requestPattern.burstSize;
    } else if (requestPattern.type === "variable") {
      requests = Math.floor(Math.random() * requestPattern.maxBatch) + 1;
    }

    for (let i = 0; i < requests; i++) {
      results.total++;
      const allowed = limiter.consume ? limiter.consume() : limiter.allow();
      if (allowed) {
        results.allowed++;
      } else {
        results.rejected++;
      }
    }

    results.timeline.push({
      time: elapsed,
      total: results.total,
      allowed: results.allowed,
      rejected: results.rejected,
    });

    // 次のリクエストまで待機
    const interval = requestPattern.intervalMs || 100;
    await sleep(interval);
  }

  return results;
}

function printResults(results, config) {
  console.log("\n" + "=".repeat(50));
  console.log("Simulation Results");
  console.log("=".repeat(50));

  console.log(`\nTotal Requests: ${results.total}`);
  console.log(`Allowed: ${results.allowed} (${((results.allowed / results.total) * 100).toFixed(1)}%)`);
  console.log(`Rejected: ${results.rejected} (${((results.rejected / results.total) * 100).toFixed(1)}%)`);

  // スループット
  const throughput = (results.allowed / config.duration) * 1000;
  console.log(`\nEffective Throughput: ${throughput.toFixed(1)} req/sec`);

  // 時系列グラフ（簡易）
  console.log("\nTimeline (simplified):");
  const samples = 10;
  const step = Math.floor(results.timeline.length / samples);
  for (let i = 0; i < results.timeline.length; i += step) {
    const point = results.timeline[i];
    const bar = "█".repeat(Math.floor((point.allowed / results.total) * 50));
    console.log(`  ${String(point.time).padStart(6)}ms: ${bar} ${point.allowed}`);
  }

  console.log("\n" + "-".repeat(50));
}

// ============================================
// メイン処理
// ============================================

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    algorithm: "token-bucket",
    capacity: 100,
    rate: 10,
    window: 60000,
    limit: 100,
    duration: 10000,
    pattern: "steady",
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, "");
    const value = args[i + 1];

    switch (key) {
      case "algorithm":
        config.algorithm = value;
        break;
      case "capacity":
        config.capacity = parseInt(value, 10);
        break;
      case "rate":
        config.rate = parseFloat(value);
        break;
      case "window":
        config.window = parseInt(value, 10);
        break;
      case "limit":
        config.limit = parseInt(value, 10);
        break;
      case "duration":
        config.duration = parseInt(value, 10);
        break;
      case "pattern":
        config.pattern = value;
        break;
    }
  }

  return config;
}

function createLimiter(config) {
  switch (config.algorithm) {
    case "token-bucket":
      return new TokenBucket(config.capacity, config.rate);
    case "sliding-window":
      return new SlidingWindowLog(config.window, config.limit);
    case "fixed-window":
      return new FixedWindow(config.window, config.limit);
    default:
      throw new Error(`Unknown algorithm: ${config.algorithm}`);
  }
}

function createRequestPattern(config) {
  switch (config.pattern) {
    case "steady":
      return { type: "steady", intervalMs: 100 };
    case "burst":
      return { type: "burst", burstSize: 10, intervalMs: 1000 };
    case "variable":
      return { type: "variable", maxBatch: 5, intervalMs: 200 };
    default:
      return { type: "steady", intervalMs: 100 };
  }
}

async function main() {
  const config = parseArgs();

  console.log("Rate Limit Simulation");
  console.log("=".repeat(50));
  console.log(`Algorithm: ${config.algorithm}`);

  if (config.algorithm === "token-bucket") {
    console.log(`Capacity: ${config.capacity}`);
    console.log(`Refill Rate: ${config.rate} tokens/sec`);
  } else {
    console.log(`Window: ${config.window}ms`);
    console.log(`Limit: ${config.limit}`);
  }

  const limiter = createLimiter(config);
  const requestPattern = createRequestPattern(config);

  const results = await simulateTraffic(limiter, {
    duration: config.duration,
    requestPattern,
    name: config.algorithm,
  });

  printResults(results, { duration: config.duration });

  // 推奨事項
  console.log("\nRecommendations:");
  const rejectionRate = results.rejected / results.total;

  if (rejectionRate > 0.3) {
    console.log("⚠️  High rejection rate. Consider increasing limits.");
  } else if (rejectionRate < 0.01) {
    console.log("ℹ️  Very low rejection rate. Limits may be too generous.");
  } else {
    console.log("✅ Rejection rate is within normal range.");
  }

  if (config.algorithm === "token-bucket" && config.rate < 1) {
    console.log("⚠️  Low refill rate may cause long wait times.");
  }
}

main().catch(console.error);
