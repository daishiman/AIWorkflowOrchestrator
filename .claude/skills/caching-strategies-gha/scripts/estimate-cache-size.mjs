#!/usr/bin/env node

/**
 * GitHub Actions キャッシュサイズ見積もりツール
 *
 * Usage:
 *   node estimate-cache-size.mjs <directory>
 *   node estimate-cache-size.mjs ~/.npm
 *   node estimate-cache-size.mjs node_modules
 *
 * Features:
 * - ディレクトリサイズの計算
 * - 圧縮後のサイズ見積もり（gzip圧縮率を考慮）
 * - ファイルタイプ別の内訳
 * - GitHub Actions 10GB制限との比較
 */

import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { createReadStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

// GitHub Actions のキャッシュ制限
const CACHE_LIMIT_GB = 10;
const CACHE_LIMIT_BYTES = CACHE_LIMIT_GB * 1024 * 1024 * 1024;

// ファイルタイプ別の平均圧縮率（経験則）
const COMPRESSION_RATIOS = {
  '.js': 0.3,
  '.ts': 0.3,
  '.jsx': 0.3,
  '.tsx': 0.3,
  '.json': 0.2,
  '.md': 0.4,
  '.txt': 0.4,
  '.html': 0.3,
  '.css': 0.3,
  '.svg': 0.3,
  '.xml': 0.3,
  '.yml': 0.4,
  '.yaml': 0.4,
  // バイナリファイル（圧縮済み）
  '.png': 0.95,
  '.jpg': 0.98,
  '.jpeg': 0.98,
  '.gif': 0.95,
  '.zip': 0.98,
  '.tar': 0.98,
  '.gz': 0.98,
  '.woff': 0.95,
  '.woff2': 0.95,
  '.ttf': 0.95,
  // デフォルト
  default: 0.5,
};

class CacheSizeEstimator {
  constructor(directory) {
    this.directory = directory;
    this.totalSize = 0;
    this.totalFiles = 0;
    this.filesByExt = {};
    this.sizeByExt = {};
    this.largeFiles = [];
  }

  async analyze() {
    console.log(`🔍 Analyzing directory: ${this.directory}\n`);

    try {
      await this.scanDirectory(this.directory);
      this.printResults();
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  async scanDirectory(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      console.error(`⚠️  Cannot read directory: ${dir}`);
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // node_modules/.cache などのキャッシュディレクトリをスキップ
        if (entry.name === '.git' || entry.name === '.DS_Store') {
          continue;
        }
        await this.scanDirectory(fullPath);
      } else if (entry.isFile()) {
        await this.processFile(fullPath);
      }
    }
  }

  async processFile(filePath) {
    try {
      const stats = await stat(filePath);
      const size = stats.size;
      const ext = extname(filePath).toLowerCase();

      this.totalSize += size;
      this.totalFiles++;

      // 拡張子別の集計
      this.filesByExt[ext] = (this.filesByExt[ext] || 0) + 1;
      this.sizeByExt[ext] = (this.sizeByExt[ext] || 0) + size;

      // 大きなファイルを記録（>10MB）
      if (size > 10 * 1024 * 1024) {
        this.largeFiles.push({
          path: filePath,
          size: size,
          ext: ext,
        });
      }
    } catch (error) {
      // ファイル読み取りエラーは無視
    }
  }

  estimateCompressedSize() {
    let compressedSize = 0;

    for (const [ext, size] of Object.entries(this.sizeByExt)) {
      const ratio = COMPRESSION_RATIOS[ext] || COMPRESSION_RATIOS.default;
      compressedSize += size * ratio;
    }

    return compressedSize;
  }

  printResults() {
    console.log('📊 Cache Size Analysis\n');
    console.log('═'.repeat(60));

    // 基本情報
    console.log(`\n📁 Directory: ${this.directory}`);
    console.log(`📄 Total files: ${this.totalFiles.toLocaleString()}`);
    console.log(`💾 Total size: ${this.formatBytes(this.totalSize)}`);

    // 圧縮後のサイズ見積もり
    const compressedSize = this.estimateCompressedSize();
    const compressionRatio = ((1 - compressedSize / this.totalSize) * 100).toFixed(1);

    console.log(`\n🗜️  Estimated compressed size: ${this.formatBytes(compressedSize)}`);
    console.log(`   Compression ratio: ${compressionRatio}%`);

    // GitHub Actions 制限との比較
    const percentOfLimit = ((compressedSize / CACHE_LIMIT_BYTES) * 100).toFixed(1);
    console.log(`\n📏 GitHub Actions Cache Limit`);
    console.log(`   Limit: ${CACHE_LIMIT_GB}GB`);
    console.log(`   Usage: ${percentOfLimit}% of limit`);

    if (compressedSize > CACHE_LIMIT_BYTES) {
      console.log(`   ⚠️  WARNING: Exceeds cache limit by ${this.formatBytes(compressedSize - CACHE_LIMIT_BYTES)}`);
    } else if (percentOfLimit > 80) {
      console.log(`   ⚠️  WARNING: Approaching cache limit (>${percentOfLimit}%)`);
    } else {
      console.log(`   ✅ Within cache limit`);
    }

    // ファイルタイプ別の内訳（上位10件）
    console.log(`\n📋 Top File Types by Size\n`);
    console.log('─'.repeat(60));
    console.log(` ${'Ext'.padEnd(10)} ${'Count'.padStart(8)}  ${'Size'.padStart(12)}  ${'%'.padStart(6)}`);
    console.log('─'.repeat(60));

    const sortedExts = Object.entries(this.sizeByExt)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    for (const [ext, size] of sortedExts) {
      const count = this.filesByExt[ext];
      const percent = ((size / this.totalSize) * 100).toFixed(1);
      const extLabel = ext || '(no ext)';

      console.log(
        ` ${extLabel.padEnd(10)} ${count.toString().padStart(8)}  ${this.formatBytes(size).padStart(12)}  ${percent.padStart(5)}%`
      );
    }

    // 大きなファイル
    if (this.largeFiles.length > 0) {
      console.log(`\n⚠️  Large Files (>10MB)\n`);
      console.log('─'.repeat(60));

      this.largeFiles
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .forEach(file => {
          const relativePath = file.path.replace(this.directory, '.');
          console.log(`   ${this.formatBytes(file.size).padStart(10)}  ${relativePath}`);
        });
    }

    // 推奨事項
    console.log(`\n💡 Recommendations\n`);
    console.log('─'.repeat(60));

    if (compressedSize > CACHE_LIMIT_BYTES) {
      console.log('   • Split cache into multiple smaller caches');
      console.log('   • Exclude unnecessary files or directories');
      console.log('   • Consider using cache-from/cache-to for Docker builds');
    } else if (percentOfLimit > 80) {
      console.log('   • Monitor cache size growth');
      console.log('   • Review if all cached files are necessary');
    }

    if (this.largeFiles.length > 0) {
      console.log('   • Review large files - can they be excluded?');
      console.log('   • Consider separate caches for large binaries');
    }

    const textExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.css'];
    const textSize = textExtensions.reduce((sum, ext) => sum + (this.sizeByExt[ext] || 0), 0);
    const textPercent = (textSize / this.totalSize) * 100;

    if (textPercent > 50) {
      console.log('   • High percentage of text files - good compression expected');
    }

    console.log('\n' + '═'.repeat(60) + '\n');
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);

    return `${value.toFixed(2)} ${units[i]}`;
  }
}

// メイン処理
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
GitHub Actions Cache Size Estimator

Usage:
  node estimate-cache-size.mjs <directory>

Examples:
  node estimate-cache-size.mjs ~/.npm
  node estimate-cache-size.mjs node_modules
  node estimate-cache-size.mjs target/
  node estimate-cache-size.mjs .next/cache

This tool analyzes directory size and estimates compressed size
to help you stay within GitHub Actions 10GB cache limit.
    `);
    process.exit(1);
  }

  const directory = args[0];
  const estimator = new CacheSizeEstimator(directory);
  await estimator.analyze();
}

main().catch(error => {
  console.error(`❌ Fatal error: ${error.message}`);
  process.exit(1);
});
