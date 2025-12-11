#!/usr/bin/env node
/**
 * プロセスヘルスチェックスクリプト
 *
 * 使用方法:
 *   node .claude/skills/process-lifecycle-management/scripts/check-process-health.mjs <pid>
 *   node .claude/skills/process-lifecycle-management/scripts/check-process-health.mjs --pm2 <app-name>
 *
 * 例:
 *   node check-process-health.mjs 12345
 *   node check-process-health.mjs --pm2 my-app
 */

import { execSync } from "child_process";

// 閾値定義
const THRESHOLDS = {
  memoryPercent: 80, // メモリ使用率 (%)
  cpuPercent: 90, // CPU使用率 (%)
  restarts: 5, // 許容再起動回数
  uptimeMinutes: 5, // 最小稼働時間 (分)
};

/**
 * プロセス情報を取得
 */
function getProcessInfo(pid) {
  try {
    // psコマンドでプロセス情報取得
    const result = execSync(
      `ps -p ${pid} -o pid,ppid,%cpu,%mem,rss,vsz,etime,comm`,
      { encoding: "utf8" },
    ).trim();

    const lines = result.split("\n");
    if (lines.length < 2) {
      return null;
    }

    const values = lines[1].trim().split(/\s+/);
    return {
      pid: parseInt(values[0]),
      ppid: parseInt(values[1]),
      cpuPercent: parseFloat(values[2]),
      memPercent: parseFloat(values[3]),
      rss: parseInt(values[4]) * 1024, // KB to bytes
      vsz: parseInt(values[5]) * 1024,
      elapsed: values[6],
      command: values.slice(7).join(" "),
    };
  } catch (error) {
    return null;
  }
}

/**
 * 経過時間を分に変換
 */
function parseElapsedTime(elapsed) {
  // 形式: [[DD-]HH:]MM:SS
  const parts = elapsed.split(/[-:]/);
  let minutes = 0;

  if (parts.length === 4) {
    // DD-HH:MM:SS
    minutes += parseInt(parts[0]) * 24 * 60;
    minutes += parseInt(parts[1]) * 60;
    minutes += parseInt(parts[2]);
  } else if (parts.length === 3) {
    // HH:MM:SS
    minutes += parseInt(parts[0]) * 60;
    minutes += parseInt(parts[1]);
  } else if (parts.length === 2) {
    // MM:SS
    minutes += parseInt(parts[0]);
  }

  return minutes;
}

/**
 * PM2アプリ情報を取得
 */
function getPM2Info(appName) {
  try {
    const result = execSync(`pm2 jlist`, { encoding: "utf8" });

    const apps = JSON.parse(result);
    const app = apps.find((a) => a.name === appName);

    if (!app) {
      return null;
    }

    return {
      name: app.name,
      pid: app.pid,
      status: app.pm2_env.status,
      restarts: app.pm2_env.restart_time,
      uptime: app.pm2_env.pm_uptime,
      memory: app.monit?.memory || 0,
      cpu: app.monit?.cpu || 0,
      instances: app.pm2_env.instances,
    };
  } catch (error) {
    console.error("PM2 info error:", error.message);
    return null;
  }
}

/**
 * ヘルスステータスを判定
 */
function evaluateHealth(info, isPM2 = false) {
  const issues = [];
  const warnings = [];

  if (isPM2) {
    // PM2固有のチェック
    if (info.status !== "online") {
      issues.push(`Status is ${info.status}, not online`);
    }

    if (info.restarts > THRESHOLDS.restarts) {
      warnings.push(`High restart count: ${info.restarts}`);
    }

    const uptimeMs = Date.now() - info.uptime;
    const uptimeMinutes = uptimeMs / 1000 / 60;
    if (uptimeMinutes < THRESHOLDS.uptimeMinutes && info.restarts > 0) {
      warnings.push(`Recently restarted (${Math.round(uptimeMinutes)}min ago)`);
    }

    // メモリ (PM2はバイト単位)
    const memMB = info.memory / 1024 / 1024;
    if (memMB > 500) {
      // 500MB以上
      warnings.push(`High memory usage: ${memMB.toFixed(1)}MB`);
    }

    if (info.cpu > THRESHOLDS.cpuPercent) {
      issues.push(`High CPU usage: ${info.cpu}%`);
    }
  } else {
    // 通常プロセスのチェック
    if (info.memPercent > THRESHOLDS.memoryPercent) {
      issues.push(`High memory usage: ${info.memPercent}%`);
    }

    if (info.cpuPercent > THRESHOLDS.cpuPercent) {
      warnings.push(`High CPU usage: ${info.cpuPercent}%`);
    }

    const uptimeMinutes = parseElapsedTime(info.elapsed);
    if (uptimeMinutes < THRESHOLDS.uptimeMinutes) {
      warnings.push(`Short uptime: ${info.elapsed}`);
    }
  }

  return {
    status:
      issues.length > 0
        ? "unhealthy"
        : warnings.length > 0
          ? "warning"
          : "healthy",
    issues,
    warnings,
  };
}

/**
 * 結果を出力
 */
function printResults(info, health, isPM2) {
  console.log("\n" + "=".repeat(50));
  console.log("Process Health Check Results");
  console.log("=".repeat(50) + "\n");

  // プロセス情報
  console.log("📋 Process Information:");
  if (isPM2) {
    console.log(`   Name:      ${info.name}`);
    console.log(`   PID:       ${info.pid}`);
    console.log(`   Status:    ${info.status}`);
    console.log(`   Restarts:  ${info.restarts}`);
    console.log(`   Memory:    ${(info.memory / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   CPU:       ${info.cpu}%`);
    console.log(`   Uptime:    ${formatUptime(Date.now() - info.uptime)}`);
  } else {
    console.log(`   PID:       ${info.pid}`);
    console.log(`   PPID:      ${info.ppid}`);
    console.log(`   Command:   ${info.command}`);
    console.log(`   CPU:       ${info.cpuPercent}%`);
    console.log(`   Memory:    ${info.memPercent}%`);
    console.log(`   RSS:       ${(info.rss / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Elapsed:   ${info.elapsed}`);
  }

  console.log();

  // ヘルスステータス
  const statusIcon =
    health.status === "healthy"
      ? "✅"
      : health.status === "warning"
        ? "⚠️"
        : "❌";
  console.log(`${statusIcon} Health Status: ${health.status.toUpperCase()}`);

  if (health.issues.length > 0) {
    console.log("\n❌ Issues:");
    health.issues.forEach((issue) => console.log(`   • ${issue}`));
  }

  if (health.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    health.warnings.forEach((warning) => console.log(`   • ${warning}`));
  }

  console.log("\n" + "-".repeat(50));
}

/**
 * 稼働時間をフォーマット
 */
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return `${minutes}m ${seconds % 60}s`;
  }
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage:");
    console.log("  node check-process-health.mjs <pid>");
    console.log("  node check-process-health.mjs --pm2 <app-name>");
    process.exit(1);
  }

  let info;
  let isPM2 = false;

  if (args[0] === "--pm2") {
    if (args.length < 2) {
      console.error("Error: App name required with --pm2 flag");
      process.exit(1);
    }
    isPM2 = true;
    info = getPM2Info(args[1]);
    if (!info) {
      console.error(`Error: PM2 app '${args[1]}' not found`);
      process.exit(1);
    }
  } else {
    const pid = parseInt(args[0]);
    if (isNaN(pid)) {
      console.error("Error: Invalid PID");
      process.exit(1);
    }
    info = getProcessInfo(pid);
    if (!info) {
      console.error(`Error: Process ${pid} not found`);
      process.exit(1);
    }
  }

  const health = evaluateHealth(info, isPM2);
  printResults(info, health, isPM2);

  // 終了コード
  process.exit(
    health.status === "healthy" ? 0 : health.status === "warning" ? 0 : 1,
  );
}

main();
