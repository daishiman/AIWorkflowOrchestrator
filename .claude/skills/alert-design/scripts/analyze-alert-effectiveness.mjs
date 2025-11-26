#!/usr/bin/env node
/**
 * アラート有効性分析スクリプト
 *
 * 用途: アラート発火履歴から誤検知率、対応率、MTTA/MTTRを計算
 * 使用例: node analyze-alert-effectiveness.mjs <alert-history.jsonl>
 */

import fs from 'fs';
import path from 'path';

// 分析結果の初期化
const analysis = {
  totalAlerts: 0,
  alertsByName: {},
  alertsBySeverity: { critical: 0, warning: 0, info: 0 },
  falsePositives: 0,
  actioned: 0,
  acknowledgeTimes: [],
  resolveTimes: []
};

// アラートエントリの分析
function analyzeAlertEntry(entry) {
  analysis.totalAlerts++;

  // アラート名ごとの集計
  const name = entry.alert_name || 'unknown';
  if (!analysis.alertsByName[name]) {
    analysis.alertsByName[name] = {
      count: 0,
      falsePositives: 0,
      actioned: 0,
      ackTimes: [],
      resolveTimes: []
    };
  }
  analysis.alertsByName[name].count++;

  // 重要度別集計
  const severity = entry.severity || 'info';
  if (analysis.alertsBySeverity[severity] !== undefined) {
    analysis.alertsBySeverity[severity]++;
  }

  // 誤検知
  if (entry.false_positive) {
    analysis.falsePositives++;
    analysis.alertsByName[name].falsePositives++;
  }

  // 対応したか
  if (entry.actioned) {
    analysis.actioned++;
    analysis.alertsByName[name].actioned++;
  }

  // 確認時間（MTTA）
  if (entry.acknowledge_time_seconds) {
    analysis.acknowledgeTimes.push(entry.acknowledge_time_seconds);
    analysis.alertsByName[name].ackTimes.push(entry.acknowledge_time_seconds);
  }

  // 解決時間（MTTR）
  if (entry.resolve_time_seconds) {
    analysis.resolveTimes.push(entry.resolve_time_seconds);
    analysis.alertsByName[name].resolveTimes.push(entry.resolve_time_seconds);
  }
}

// 平均計算
function average(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

// 秒を人間可読形式に変換
function humanizeSeconds(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

// サマリー計算
function calculateSummary() {
  const falsePositiveRate = (analysis.falsePositives / analysis.totalAlerts) * 100;
  const actionRate = (analysis.actioned / analysis.totalAlerts) * 100;
  const mtta = average(analysis.acknowledgeTimes);
  const mttr = average(analysis.resolveTimes);

  return {
    totalAlerts: analysis.totalAlerts,
    falsePositiveRate: falsePositiveRate.toFixed(2) + '%',
    actionRate: actionRate.toFixed(2) + '%',
    mtta: humanizeSeconds(mtta),
    mttr: humanizeSeconds(mttr),
    bySeverity: analysis.alertsBySeverity,
    byName: analysis.alertsByName
  };
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node analyze-alert-effectiveness.mjs <alert-history.jsonl>');
    process.exit(1);
  }

  const historyFilePath = path.resolve(args[0]);

  if (!fs.existsSync(historyFilePath)) {
    console.error(`Error: File not found: ${historyFilePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(historyFilePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  console.log(`\n📊 Analyzing alert effectiveness: ${historyFilePath}\n`);

  lines.forEach((line, index) => {
    try {
      const entry = JSON.parse(line);
      analyzeAlertEntry(entry);
    } catch (error) {
      console.warn(`⚠️  Line ${index + 1}: Invalid JSON`);
    }
  });

  const summary = calculateSummary();

  // サマリー出力
  console.log('='.repeat(60));
  console.log('📊 Alert Effectiveness Summary');
  console.log('='.repeat(60));
  console.log(`Total alerts: ${summary.totalAlerts}`);
  console.log(`False positive rate: ${summary.falsePositiveRate} (目標: < 5%)`);
  console.log(`Action rate: ${summary.actionRate} (目標: > 80%)`);
  console.log(`MTTA (Mean Time To Acknowledge): ${summary.mtta}`);
  console.log(`MTTR (Mean Time To Resolve): ${summary.mttr}`);
  console.log('\nBy Severity:');
  console.log(`  Critical: ${summary.bySeverity.critical}`);
  console.log(`  Warning: ${summary.bySeverity.warning}`);
  console.log(`  Info: ${summary.bySeverity.info}`);
  console.log('='.repeat(60));

  // アラート別詳細
  console.log('\n📋 Alert Details:\n');
  Object.entries(summary.byName)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([name, stats]) => {
      const fpRate = ((stats.falsePositives / stats.count) * 100).toFixed(1);
      const actionRate = ((stats.actioned / stats.count) * 100).toFixed(1);
      const mtta = humanizeSeconds(average(stats.ackTimes));
      const mttr = humanizeSeconds(average(stats.resolveTimes));

      console.log(`${name}:`);
      console.log(`  Count: ${stats.count}`);
      console.log(`  FP Rate: ${fpRate}%`);
      console.log(`  Action Rate: ${actionRate}%`);
      console.log(`  MTTA: ${mtta}`);
      console.log(`  MTTR: ${mttr}`);
      console.log('');
    });

  // 推奨事項
  console.log('💡 Recommendations:\n');

  const fpRate = parseFloat(summary.falsePositiveRate);
  if (fpRate > 5) {
    console.log(`⚠️  False positive rate (${summary.falsePositiveRate}) > 5%. Adjust thresholds or remove noisy alerts.`);
  }

  const actionRate = parseFloat(summary.actionRate);
  if (actionRate < 80) {
    console.log(`⚠️  Action rate (${summary.actionRate}) < 80%. Review alerts for actionability.`);
  }

  // アラート別の問題アラート特定
  Object.entries(summary.byName).forEach(([name, stats]) => {
    const fpRate = (stats.falsePositives / stats.count) * 100;
    const actionRate = (stats.actioned / stats.count) * 100;

    if (fpRate > 20) {
      console.log(`❌ "${name}": FP rate ${fpRate.toFixed(1)}% > 20%. Consider removing or adjusting.`);
    }

    if (actionRate < 50 && stats.count > 5) {
      console.log(`⚠️  "${name}": Action rate ${actionRate.toFixed(1)}% < 50%. Review for actionability.`);
    }
  });

  console.log('\n');
}

main();
