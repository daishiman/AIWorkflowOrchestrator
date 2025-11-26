#!/usr/bin/env node

/**
 * ネットワーク設定分析スクリプト
 *
 * 使用方法:
 *   node analyze-network-config.mjs <config-file>
 *
 * 機能:
 *   - ネットワーク耐性設定の妥当性検証
 *   - バックオフ設定の評価
 *   - キュー設定の確認
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// 推奨値定義
const RECOMMENDATIONS = {
  backoff: {
    baseDelay: { min: 500, max: 5000, default: 1000 },
    maxDelay: { min: 30000, max: 300000, default: 64000 },
    jitterFactor: { min: 0.1, max: 0.5, default: 0.25 }
  },
  healthCheck: {
    interval: { min: 10000, max: 300000, default: 30000 },
    timeout: { min: 3000, max: 30000, default: 5000 }
  },
  queue: {
    maxTasks: { min: 100, max: 10000, default: 1000 },
    maxAgeHours: { min: 1, max: 720, default: 168 }
  }
};

function analyzeConfig(config) {
  const issues = [];
  const recommendations = [];

  // バックオフ設定の検証
  if (config.backoff) {
    const { baseDelay, maxDelay, jitterFactor } = config.backoff;

    if (baseDelay && baseDelay < RECOMMENDATIONS.backoff.baseDelay.min) {
      issues.push({
        severity: 'warning',
        field: 'backoff.baseDelay',
        message: `基本遅延が短すぎます (${baseDelay}ms)`,
        recommendation: `最小 ${RECOMMENDATIONS.backoff.baseDelay.min}ms を推奨`
      });
    }

    if (maxDelay && maxDelay < RECOMMENDATIONS.backoff.maxDelay.min) {
      issues.push({
        severity: 'warning',
        field: 'backoff.maxDelay',
        message: `最大遅延が短すぎます (${maxDelay}ms)`,
        recommendation: `最小 ${RECOMMENDATIONS.backoff.maxDelay.min}ms を推奨`
      });
    }

    if (jitterFactor !== undefined) {
      if (jitterFactor < RECOMMENDATIONS.backoff.jitterFactor.min) {
        issues.push({
          severity: 'warning',
          field: 'backoff.jitterFactor',
          message: `ジッター係数が小さすぎます (${jitterFactor})`,
          recommendation: `最小 ${RECOMMENDATIONS.backoff.jitterFactor.min} を推奨`
        });
      }
      if (jitterFactor > RECOMMENDATIONS.backoff.jitterFactor.max) {
        issues.push({
          severity: 'warning',
          field: 'backoff.jitterFactor',
          message: `ジッター係数が大きすぎます (${jitterFactor})`,
          recommendation: `最大 ${RECOMMENDATIONS.backoff.jitterFactor.max} を推奨`
        });
      }
    }
  } else {
    recommendations.push({
      field: 'backoff',
      message: 'バックオフ設定が未定義',
      recommendation: `baseDelay: ${RECOMMENDATIONS.backoff.baseDelay.default}, maxDelay: ${RECOMMENDATIONS.backoff.maxDelay.default} を推奨`
    });
  }

  // ヘルスチェック設定の検証
  if (config.healthCheck) {
    const { interval, timeout } = config.healthCheck;

    if (interval && interval < RECOMMENDATIONS.healthCheck.interval.min) {
      issues.push({
        severity: 'warning',
        field: 'healthCheck.interval',
        message: `ヘルスチェック間隔が短すぎます (${interval}ms)`,
        recommendation: `最小 ${RECOMMENDATIONS.healthCheck.interval.min}ms を推奨`
      });
    }

    if (timeout && timeout >= interval) {
      issues.push({
        severity: 'error',
        field: 'healthCheck.timeout',
        message: `タイムアウト (${timeout}ms) がインターバル (${interval}ms) 以上です`,
        recommendation: 'タイムアウトはインターバルより短く設定してください'
      });
    }
  }

  // キュー設定の検証
  if (config.queue) {
    const { maxTasks, maxAgeHours } = config.queue;

    if (maxTasks && maxTasks > RECOMMENDATIONS.queue.maxTasks.max) {
      issues.push({
        severity: 'warning',
        field: 'queue.maxTasks',
        message: `キュー最大タスク数が多すぎます (${maxTasks})`,
        recommendation: `最大 ${RECOMMENDATIONS.queue.maxTasks.max} を推奨`
      });
    }
  }

  return { issues, recommendations };
}

function printReport(analysis, config) {
  console.log('\n📊 ネットワーク耐性設定分析レポート\n');
  console.log('='.repeat(50));

  // 設定サマリー
  console.log('\n📋 設定サマリー:\n');
  if (config.backoff) {
    console.log(`  バックオフ:`);
    console.log(`    - 基本遅延: ${config.backoff.baseDelay || 'デフォルト'}ms`);
    console.log(`    - 最大遅延: ${config.backoff.maxDelay || 'デフォルト'}ms`);
    console.log(`    - ジッター: ${config.backoff.jitterFactor || 'デフォルト'}`);
  }
  if (config.healthCheck) {
    console.log(`  ヘルスチェック:`);
    console.log(`    - 間隔: ${config.healthCheck.interval || 'デフォルト'}ms`);
    console.log(`    - タイムアウト: ${config.healthCheck.timeout || 'デフォルト'}ms`);
  }
  if (config.queue) {
    console.log(`  キュー:`);
    console.log(`    - 最大タスク数: ${config.queue.maxTasks || 'デフォルト'}`);
    console.log(`    - 最大保持時間: ${config.queue.maxAgeHours || 'デフォルト'}時間`);
  }

  if (analysis.issues.length === 0 && analysis.recommendations.length === 0) {
    console.log('\n✅ 設定に問題は見つかりませんでした\n');
    return;
  }

  if (analysis.issues.length > 0) {
    console.log('\n⚠️  検出された問題:\n');
    analysis.issues.forEach((issue, index) => {
      const icon = issue.severity === 'error' ? '🔴' : '🟡';
      console.log(`  ${index + 1}. ${icon} [${issue.field}] ${issue.message}`);
      console.log(`     → ${issue.recommendation}`);
    });
  }

  if (analysis.recommendations.length > 0) {
    console.log('\n💡 推奨事項:\n');
    analysis.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. [${rec.field}] ${rec.message}`);
      console.log(`     → ${rec.recommendation}`);
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

// メイン処理
const configPath = process.argv[2];

if (!configPath) {
  console.error('使用方法: node analyze-network-config.mjs <config-file>');
  process.exit(1);
}

const fullPath = resolve(configPath);

if (!existsSync(fullPath)) {
  console.error(`ファイルが見つかりません: ${fullPath}`);
  process.exit(1);
}

try {
  const configContent = readFileSync(fullPath, 'utf-8');
  const config = JSON.parse(configContent);
  const analysis = analyzeConfig(config);
  printReport(analysis, config);
} catch (error) {
  console.error(`設定ファイルの読み込みに失敗しました: ${error.message}`);
  process.exit(1);
}
