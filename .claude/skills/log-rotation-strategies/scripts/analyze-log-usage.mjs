#!/usr/bin/env node
/**
 * ログ使用量分析スクリプト
 *
 * ログディレクトリの使用量を分析し、ローテーション設定の推奨を提供します。
 *
 * 使用方法:
 *   node analyze-log-usage.mjs [log-directory]
 *   node analyze-log-usage.mjs --pm2
 *
 * 例:
 *   node analyze-log-usage.mjs ./logs
 *   node analyze-log-usage.mjs /var/log/myapp
 *   node analyze-log-usage.mjs --pm2
 */

import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';
import { homedir } from 'os';

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

/**
 * ファイルサイズを人間が読みやすい形式に変換
 */
function formatSize(bytes) {
  if (bytes >= GB) return `${(bytes / GB).toFixed(2)} GB`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  if (bytes >= KB) return `${(bytes / KB).toFixed(2)} KB`;
  return `${bytes} bytes`;
}

/**
 * ディレクトリ内のログファイルを分析
 */
function analyzeDirectory(dirPath) {
  const files = [];
  let totalSize = 0;
  let compressedSize = 0;
  let uncompressedSize = 0;

  try {
    const entries = readdirSync(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      let stat;

      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isFile()) {
        const ext = extname(entry).toLowerCase();
        const isLog = ext === '.log' || entry.includes('.log');
        const isCompressed = ext === '.gz' || ext === '.zip';

        if (isLog || isCompressed) {
          files.push({
            name: entry,
            size: stat.size,
            modified: stat.mtime,
            isCompressed,
          });

          totalSize += stat.size;
          if (isCompressed) {
            compressedSize += stat.size;
          } else {
            uncompressedSize += stat.size;
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory: ${error.message}`);
    process.exit(1);
  }

  return {
    files: files.sort((a, b) => b.size - a.size),
    totalSize,
    compressedSize,
    uncompressedSize,
  };
}

/**
 * PM2ログディレクトリを取得
 */
function getPM2LogPath() {
  try {
    const pm2Home = process.env.PM2_HOME || join(homedir(), '.pm2');
    return join(pm2Home, 'logs');
  } catch {
    return null;
  }
}

/**
 * PM2-logrotate設定を取得
 */
function getPM2LogrotateConfig() {
  try {
    const output = execSync('pm2 conf pm2-logrotate 2>/dev/null', {
      encoding: 'utf8',
    });

    const config = {};
    const lines = output.split('\n');

    for (const line of lines) {
      const match = line.match(/pm2-logrotate:(\w+)\s*│\s*(.+)/);
      if (match) {
        config[match[1]] = match[2].trim();
      }
    }

    return config;
  } catch {
    return null;
  }
}

/**
 * ローテーション推奨を生成
 */
function generateRecommendations(analysis) {
  const recommendations = [];

  // 総サイズに基づく推奨
  if (analysis.totalSize > GB) {
    recommendations.push({
      level: 'warning',
      message: 'ログディレクトリが1GBを超えています',
      action: 'retainの値を減らすか、max_sizeを小さくすることを検討してください',
    });
  }

  // 圧縮率に基づく推奨
  const compressionRatio = analysis.compressedSize / analysis.totalSize;
  if (compressionRatio < 0.5 && analysis.files.length > 5) {
    recommendations.push({
      level: 'info',
      message: '圧縮されていないログファイルが多数あります',
      action: 'pm2 set pm2-logrotate:compress true を実行してください',
    });
  }

  // 大きなファイルの検出
  const largeFiles = analysis.files.filter((f) => f.size > 100 * MB);
  if (largeFiles.length > 0) {
    recommendations.push({
      level: 'warning',
      message: `100MBを超えるファイルが${largeFiles.length}個あります`,
      action: 'max_sizeを小さい値に設定してください（例: 50M）',
    });
  }

  // 古いファイルの検出
  const now = Date.now();
  const oldFiles = analysis.files.filter(
    (f) => now - f.modified.getTime() > 30 * 24 * 60 * 60 * 1000
  );
  if (oldFiles.length > 0) {
    recommendations.push({
      level: 'info',
      message: `30日以上前のログファイルが${oldFiles.length}個あります`,
      action: 'retainの値を確認し、不要なファイルを削除してください',
    });
  }

  return recommendations;
}

/**
 * 結果を表示
 */
function printResults(dirPath, analysis, pm2Config) {
  console.log('\n' + '='.repeat(60));
  console.log('ログ使用量分析レポート');
  console.log('='.repeat(60));

  console.log(`\n📁 ディレクトリ: ${dirPath}`);
  console.log(`📊 総ファイル数: ${analysis.files.length}`);
  console.log(`💾 総サイズ: ${formatSize(analysis.totalSize)}`);
  console.log(`   - 非圧縮: ${formatSize(analysis.uncompressedSize)}`);
  console.log(`   - 圧縮済: ${formatSize(analysis.compressedSize)}`);

  // 上位5ファイル
  console.log('\n📈 サイズ上位ファイル:');
  const topFiles = analysis.files.slice(0, 5);
  for (const file of topFiles) {
    const age = Math.floor(
      (Date.now() - file.modified.getTime()) / (24 * 60 * 60 * 1000)
    );
    console.log(
      `   ${formatSize(file.size).padStart(10)} │ ${file.name} (${age}日前)`
    );
  }

  // PM2-logrotate設定
  if (pm2Config) {
    console.log('\n⚙️  pm2-logrotate設定:');
    console.log(`   max_size: ${pm2Config.max_size || 'N/A'}`);
    console.log(`   retain: ${pm2Config.retain || 'N/A'}`);
    console.log(`   compress: ${pm2Config.compress || 'N/A'}`);
    console.log(`   rotateInterval: ${pm2Config.rotateInterval || 'N/A'}`);
  }

  // 推奨事項
  const recommendations = generateRecommendations(analysis);
  if (recommendations.length > 0) {
    console.log('\n💡 推奨事項:');
    for (const rec of recommendations) {
      const icon = rec.level === 'warning' ? '⚠️ ' : 'ℹ️ ';
      console.log(`   ${icon}${rec.message}`);
      console.log(`      → ${rec.action}`);
    }
  } else {
    console.log('\n✅ 特に問題は見つかりませんでした');
  }

  // 推奨設定
  console.log('\n📋 推奨設定:');
  const dailyGrowth = analysis.uncompressedSize / Math.max(analysis.files.length, 1);
  const recommendedMaxSize = Math.max(10, Math.min(100, Math.ceil(dailyGrowth / MB)));
  const recommendedRetain = Math.min(30, Math.max(7, Math.ceil(500 / (dailyGrowth / MB))));

  console.log(`   pm2 set pm2-logrotate:max_size ${recommendedMaxSize}M`);
  console.log(`   pm2 set pm2-logrotate:retain ${recommendedRetain}`);
  console.log(`   pm2 set pm2-logrotate:compress true`);
  console.log(`   pm2 set pm2-logrotate:rotateInterval '0 0 * * *'`);

  console.log('\n' + '-'.repeat(60));
}

/**
 * 使用方法を表示
 */
function showUsage() {
  console.log('Usage:');
  console.log('  node analyze-log-usage.mjs [log-directory]');
  console.log('  node analyze-log-usage.mjs --pm2');
  console.log('');
  console.log('Options:');
  console.log('  --pm2      Analyze PM2 log directory');
  console.log('  --help     Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node analyze-log-usage.mjs ./logs');
  console.log('  node analyze-log-usage.mjs /var/log/myapp');
  console.log('  node analyze-log-usage.mjs --pm2');
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }

  let dirPath;
  let pm2Config = null;

  if (args.includes('--pm2')) {
    dirPath = getPM2LogPath();
    if (!dirPath) {
      console.error('Error: PM2 log directory not found');
      process.exit(1);
    }
    pm2Config = getPM2LogrotateConfig();
  } else if (args.length > 0) {
    dirPath = args[0];
  } else {
    // デフォルトは現在のディレクトリのlogsフォルダ
    dirPath = './logs';
  }

  // ディレクトリ存在確認
  try {
    const stat = statSync(dirPath);
    if (!stat.isDirectory()) {
      console.error(`Error: ${dirPath} is not a directory`);
      process.exit(1);
    }
  } catch {
    console.error(`Error: Directory not found: ${dirPath}`);
    process.exit(1);
  }

  const analysis = analyzeDirectory(dirPath);

  if (analysis.files.length === 0) {
    console.log(`\n📁 ディレクトリ: ${dirPath}`);
    console.log('ℹ️  ログファイルが見つかりませんでした');
    process.exit(0);
  }

  printResults(dirPath, analysis, pm2Config);
}

main();
