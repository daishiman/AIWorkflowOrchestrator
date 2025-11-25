#!/usr/bin/env node

/**
 * バンドル分析スクリプト
 *
 * 使用方法:
 *   node analyze-bundle.mjs <build-output-dir>
 *
 * 例:
 *   node analyze-bundle.mjs .next
 */

import fs from 'fs';
import path from 'path';

class BundleAnalyzer {
  constructor(buildDir) {
    this.buildDir = path.resolve(buildDir);
    this.chunks = [];
    this.totalSize = 0;
    this.issues = [];
    this.suggestions = [];
  }

  analyze() {
    if (!fs.existsSync(this.buildDir)) {
      console.error(`Error: Build directory not found: ${this.buildDir}`);
      console.log('Run `npm run build` first to generate the build output.');
      process.exit(1);
    }

    console.log(`\n📦 Bundle Analysis: ${this.buildDir}\n`);
    console.log('='.repeat(60));

    this.analyzeServerChunks();
    this.analyzeStaticChunks();
    this.analyzePages();
    this.printSummary();
    this.printIssues();
    this.printSuggestions();
  }

  analyzeServerChunks() {
    const serverDir = path.join(this.buildDir, 'server');
    if (!fs.existsSync(serverDir)) return;

    console.log('\n📁 Server Chunks:');
    console.log('-'.repeat(40));

    const chunks = this.getJSFiles(serverDir);
    let serverTotal = 0;

    const sortedChunks = chunks
      .map((file) => ({
        name: path.relative(serverDir, file),
        size: fs.statSync(file).size,
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    for (const chunk of sortedChunks) {
      serverTotal += chunk.size;
      console.log(`  ${this.formatSize(chunk.size).padStart(10)} ${chunk.name}`);
    }

    console.log(`  ${'─'.repeat(38)}`);
    console.log(`  ${this.formatSize(serverTotal).padStart(10)} Total (top 10)`);
  }

  analyzeStaticChunks() {
    const staticDir = path.join(this.buildDir, 'static', 'chunks');
    if (!fs.existsSync(staticDir)) return;

    console.log('\n📁 Static Chunks (Client):');
    console.log('-'.repeat(40));

    const chunks = this.getJSFiles(staticDir);
    let clientTotal = 0;

    const sortedChunks = chunks
      .map((file) => ({
        name: path.relative(staticDir, file),
        size: fs.statSync(file).size,
      }))
      .sort((a, b) => b.size - a.size);

    // 大きなチャンクを警告
    for (const chunk of sortedChunks) {
      clientTotal += chunk.size;
      this.totalSize += chunk.size;

      const sizeStr = this.formatSize(chunk.size).padStart(10);
      let indicator = '';

      if (chunk.size > 500 * 1024) {
        indicator = ' ❌ Very Large';
        this.issues.push({
          type: 'error',
          message: `${chunk.name} (${this.formatSize(chunk.size)}) が非常に大きい`,
        });
      } else if (chunk.size > 200 * 1024) {
        indicator = ' ⚠️  Large';
        this.issues.push({
          type: 'warning',
          message: `${chunk.name} (${this.formatSize(chunk.size)}) が大きい`,
        });
      } else if (chunk.size > 100 * 1024) {
        indicator = ' 📊';
      }

      console.log(`  ${sizeStr} ${chunk.name}${indicator}`);
      this.chunks.push(chunk);
    }

    console.log(`  ${'─'.repeat(38)}`);
    console.log(`  ${this.formatSize(clientTotal).padStart(10)} Total Client JS`);
  }

  analyzePages() {
    const pagesManifest = path.join(this.buildDir, 'server', 'pages-manifest.json');
    const appPathsManifest = path.join(this.buildDir, 'server', 'app-paths-manifest.json');

    let pageCount = 0;

    if (fs.existsSync(pagesManifest)) {
      const manifest = JSON.parse(fs.readFileSync(pagesManifest, 'utf-8'));
      pageCount += Object.keys(manifest).length;
    }

    if (fs.existsSync(appPathsManifest)) {
      const manifest = JSON.parse(fs.readFileSync(appPathsManifest, 'utf-8'));
      pageCount += Object.keys(manifest).length;
    }

    console.log(`\n📄 Pages: ${pageCount}`);
  }

  getJSFiles(dir) {
    const files = [];

    const walk = (currentDir) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.name.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    };

    walk(dir);
    return files;
  }

  formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log('-'.repeat(40));
    console.log(`  Total Client JS: ${this.formatSize(this.totalSize)}`);
    console.log(`  Chunks: ${this.chunks.length}`);

    // サイズ分布
    const large = this.chunks.filter((c) => c.size > 200 * 1024).length;
    const medium = this.chunks.filter((c) => c.size > 100 * 1024 && c.size <= 200 * 1024).length;
    const small = this.chunks.filter((c) => c.size <= 100 * 1024).length;

    console.log(`\n  Size Distribution:`);
    console.log(`    >200KB: ${large} chunks`);
    console.log(`    100-200KB: ${medium} chunks`);
    console.log(`    <100KB: ${small} chunks`);

    // スコア計算
    const score = this.calculateScore();
    console.log(`\n  📈 Bundle Score: ${score}/100`);
  }

  calculateScore() {
    let score = 100;

    // 大きなチャンクのペナルティ
    for (const chunk of this.chunks) {
      if (chunk.size > 500 * 1024) score -= 20;
      else if (chunk.size > 200 * 1024) score -= 10;
      else if (chunk.size > 100 * 1024) score -= 5;
    }

    // 合計サイズのペナルティ
    if (this.totalSize > 1024 * 1024) score -= 20;
    else if (this.totalSize > 500 * 1024) score -= 10;

    return Math.max(0, score);
  }

  printIssues() {
    console.log('\n⚠️  Issues:');
    console.log('-'.repeat(40));

    if (this.issues.length === 0) {
      console.log('  ✅ No issues found');
    } else {
      const errors = this.issues.filter((i) => i.type === 'error');
      const warnings = this.issues.filter((i) => i.type === 'warning');

      for (const error of errors) {
        console.log(`  ❌ ${error.message}`);
      }
      for (const warning of warnings) {
        console.log(`  ⚠️  ${warning.message}`);
      }
    }
  }

  printSuggestions() {
    console.log('\n💡 Suggestions:');
    console.log('-'.repeat(40));

    // チャンクサイズに基づく提案
    const largeChunks = this.chunks.filter((c) => c.size > 200 * 1024);
    if (largeChunks.length > 0) {
      this.suggestions.push('大きなチャンクをdynamic importで分割することを検討');
    }

    // 合計サイズに基づく提案
    if (this.totalSize > 500 * 1024) {
      this.suggestions.push('Tree Shakingが効いているか確認（lodash-es、date-fns等を使用）');
      this.suggestions.push('不要なサードパーティライブラリを削除');
    }

    // node_modulesチャンクの提案
    const vendorChunks = this.chunks.filter((c) => c.name.includes('node_modules'));
    if (vendorChunks.some((c) => c.size > 200 * 1024)) {
      this.suggestions.push('大きなnode_modulesライブラリを動的インポートに変更');
    }

    // 一般的な提案
    this.suggestions.push('@next/bundle-analyzerで詳細分析を実行');
    this.suggestions.push('Server Componentsを活用してクライアントバンドルを削減');

    for (const suggestion of this.suggestions) {
      console.log(`  → ${suggestion}`);
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node analyze-bundle.mjs <build-output-dir>');
  console.log('Example: node analyze-bundle.mjs .next');
  process.exit(1);
}

const analyzer = new BundleAnalyzer(args[0]);
analyzer.analyze();
