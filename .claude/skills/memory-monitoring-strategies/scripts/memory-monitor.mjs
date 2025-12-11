#!/usr/bin/env node
/**
 * メモリ監視スクリプト
 *
 * プロセスのメモリ使用量を監視し、リーク兆候を検出します。
 *
 * 使用方法:
 *   node memory-monitor.mjs <pid>
 *   node memory-monitor.mjs --pm2 <app-name>
 *   node memory-monitor.mjs --self
 *
 * 例:
 *   node memory-monitor.mjs 12345
 *   node memory-monitor.mjs --pm2 my-app
 *   node memory-monitor.mjs --self --interval 5000
 */

import { execSync } from "child_process";

const MB = 1024 * 1024;
const SAMPLE_INTERVAL = parseInt(process.env.INTERVAL) || 10000;
const SAMPLE_COUNT = 10;

/**
 * プロセスのメモリ情報を取得（macOS/Linux）
 */
function getProcessMemory(pid) {
  try {
    // psコマンドでRSSを取得（KB単位）
    const result = execSync(`ps -o rss= -p ${pid}`, {
      encoding: "utf8",
    }).trim();
    const rssKB = parseInt(result);

    if (isNaN(rssKB)) {
      return null;
    }

    return {
      rss: rssKB * 1024, // バイトに変換
      timestamp: Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * PM2アプリのメモリ情報を取得
 */
function getPM2Memory(appName) {
  try {
    const result = execSync(`pm2 jlist`, { encoding: "utf8" });
    const apps = JSON.parse(result);
    const app = apps.find((a) => a.name === appName);

    if (!app) {
      return null;
    }

    return {
      rss: app.monit?.memory || 0,
      cpu: app.monit?.cpu || 0,
      pid: app.pid,
      status: app.pm2_env?.status,
      restarts: app.pm2_env?.restart_time || 0,
      timestamp: Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * サイズをフォーマット
 */
function formatSize(bytes) {
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(2)} KB`;
}

/**
 * リーク分析
 */
function analyzeForLeaks(samples) {
  if (samples.length < 3) {
    return { isLeak: false, message: "Not enough samples" };
  }

  // 単調増加チェック
  let increasingCount = 0;
  for (let i = 1; i < samples.length; i++) {
    if (samples[i].rss > samples[i - 1].rss) {
      increasingCount++;
    }
  }

  const increasingRatio = increasingCount / (samples.length - 1);

  // 増加量計算
  const firstSample = samples[0];
  const lastSample = samples[samples.length - 1];
  const totalGrowth = lastSample.rss - firstSample.rss;
  const elapsedMinutes = (lastSample.timestamp - firstSample.timestamp) / 60000;
  const growthPerMinute = totalGrowth / elapsedMinutes;

  // リーク判定
  const isLeak = increasingRatio > 0.7 && growthPerMinute > MB; // 70%以上増加傾向 & 1MB/分以上

  return {
    isLeak,
    increasingRatio: (increasingRatio * 100).toFixed(1),
    totalGrowth: formatSize(totalGrowth),
    growthPerMinute: formatSize(growthPerMinute),
    elapsedMinutes: elapsedMinutes.toFixed(1),
  };
}

/**
 * 監視を開始
 */
async function startMonitoring(target, options = {}) {
  console.log("\n" + "=".repeat(60));
  console.log("Memory Monitor");
  console.log("=".repeat(60));

  const { isPM2, interval = SAMPLE_INTERVAL } = options;
  const samples = [];

  console.log(`\n📋 Configuration:`);
  console.log(`   Target: ${isPM2 ? `PM2 app "${target}"` : `PID ${target}`}`);
  console.log(`   Interval: ${interval}ms`);
  console.log(`   Press Ctrl+C to stop\n`);

  console.log("-".repeat(60));
  console.log(
    "Time".padEnd(12) +
      "RSS".padStart(12) +
      "Change".padStart(12) +
      "Status".padStart(15),
  );
  console.log("-".repeat(60));

  let lastRss = 0;

  const monitor = async () => {
    const info = isPM2 ? getPM2Memory(target) : getProcessMemory(target);

    if (!info) {
      console.log(`\n❌ Process not found or not accessible`);
      process.exit(1);
    }

    samples.push(info);
    if (samples.length > SAMPLE_COUNT) {
      samples.shift();
    }

    // 変化量
    const change = lastRss > 0 ? info.rss - lastRss : 0;
    const changeStr =
      change === 0
        ? "-"
        : change > 0
          ? `+${formatSize(change)}`
          : formatSize(change);

    // ステータス
    let status = "✅ OK";
    if (isPM2 && info.status !== "online") {
      status = `⚠️ ${info.status}`;
    }

    // 出力
    const time = new Date().toTimeString().slice(0, 8);
    console.log(
      time.padEnd(12) +
        formatSize(info.rss).padStart(12) +
        changeStr.padStart(12) +
        status.padStart(15),
    );

    lastRss = info.rss;

    // リーク分析
    if (samples.length >= 5) {
      const analysis = analyzeForLeaks(samples);
      if (analysis.isLeak) {
        console.log(`\n🚨 POTENTIAL MEMORY LEAK DETECTED`);
        console.log(
          `   Growth: ${analysis.totalGrowth} over ${analysis.elapsedMinutes} minutes`,
        );
        console.log(`   Rate: ${analysis.growthPerMinute}/min`);
        console.log(`   Increasing trend: ${analysis.increasingRatio}%\n`);
      }
    }
  };

  // 初回実行
  await monitor();

  // 定期実行
  const timerId = setInterval(monitor, interval);

  // 終了ハンドラ
  process.on("SIGINT", () => {
    clearInterval(timerId);
    console.log("\n" + "-".repeat(60));

    // 最終レポート
    if (samples.length >= 3) {
      const analysis = analyzeForLeaks(samples);
      console.log("\n📊 Final Analysis:");
      console.log(`   Total samples: ${samples.length}`);
      console.log(`   Monitoring duration: ${analysis.elapsedMinutes} minutes`);
      console.log(`   Total growth: ${analysis.totalGrowth}`);
      console.log(`   Growth rate: ${analysis.growthPerMinute}/min`);
      console.log(`   Increasing trend: ${analysis.increasingRatio}%`);

      if (analysis.isLeak) {
        console.log("\n⚠️  Warning: Potential memory leak detected");
        console.log("   Consider taking heap snapshots for detailed analysis");
      } else {
        console.log("\n✅ No obvious memory leak detected");
      }
    }

    console.log("\n");
    process.exit(0);
  });
}

/**
 * 使用方法を表示
 */
function showUsage() {
  console.log("Usage:");
  console.log("  node memory-monitor.mjs <pid>");
  console.log("  node memory-monitor.mjs --pm2 <app-name>");
  console.log("  node memory-monitor.mjs --self");
  console.log("");
  console.log("Options:");
  console.log("  --pm2 <app-name>    Monitor PM2 application");
  console.log("  --self              Monitor this script (for testing)");
  console.log("  --interval <ms>     Sampling interval (default: 10000)");
  console.log("  --help              Show this help message");
  console.log("");
  console.log("Examples:");
  console.log("  node memory-monitor.mjs 12345");
  console.log("  node memory-monitor.mjs --pm2 my-app");
  console.log("  node memory-monitor.mjs --pm2 my-app --interval 5000");
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    showUsage();
    process.exit(0);
  }

  let target;
  let isPM2 = false;
  let interval = SAMPLE_INTERVAL;

  // 引数解析
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--pm2") {
      isPM2 = true;
      target = args[++i];
    } else if (args[i] === "--self") {
      target = process.pid;
    } else if (args[i] === "--interval") {
      interval = parseInt(args[++i]) || SAMPLE_INTERVAL;
    } else if (!target && !args[i].startsWith("--")) {
      target = args[i];
    }
  }

  if (!target) {
    console.error("Error: PID or app name required");
    showUsage();
    process.exit(1);
  }

  // PIDの検証（PM2でない場合）
  if (!isPM2) {
    const pid = parseInt(target);
    if (isNaN(pid)) {
      console.error("Error: Invalid PID");
      process.exit(1);
    }
    target = pid;
  }

  startMonitoring(target, { isPM2, interval });
}

main();
