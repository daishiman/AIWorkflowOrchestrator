#!/usr/bin/env node

/**
 * エラーハンドリング設定チェックスクリプト
 *
 * 使用方法:
 *   node check-error-handling.mjs <app-directory>
 *
 * 例:
 *   node check-error-handling.mjs ./src/app
 */

import fs from 'fs';
import path from 'path';

class ErrorHandlingChecker {
  constructor(appDir) {
    this.appDir = path.resolve(appDir);
    this.issues = [];
    this.suggestions = [];
    this.stats = {
      totalSegments: 0,
      segmentsWithError: 0,
      segmentsWithNotFound: 0,
      segmentsWithLoading: 0,
      hasGlobalError: false,
      hasRootError: false,
      hasRootNotFound: false,
      hasRootLoading: false,
      dynamicRoutes: 0,
      dynamicRoutesWithNotFound: 0,
    };
  }

  check() {
    if (!fs.existsSync(this.appDir)) {
      console.error(`Error: Directory not found: ${this.appDir}`);
      process.exit(1);
    }

    console.log(`\n🔍 Error Handling Check: ${this.appDir}\n`);
    console.log('='.repeat(60));

    this.checkRootFiles();
    this.scanDirectory(this.appDir);
    this.analyzeResults();
    this.printStats();
    this.printIssues();
    this.printSuggestions();
  }

  checkRootFiles() {
    console.log('\n📁 Root Level Files:');
    console.log('-'.repeat(40));

    // global-error.tsx
    const globalErrorPath = path.join(this.appDir, 'global-error.tsx');
    this.stats.hasGlobalError = fs.existsSync(globalErrorPath);
    console.log(`  global-error.tsx: ${this.stats.hasGlobalError ? '✅ Found' : '❌ Missing'}`);

    if (!this.stats.hasGlobalError) {
      this.issues.push({
        type: 'warning',
        message: 'global-error.tsx が見つかりません（Root Layoutのエラーを捕捉できません）',
      });
    }

    // error.tsx
    const errorPath = path.join(this.appDir, 'error.tsx');
    this.stats.hasRootError = fs.existsSync(errorPath);
    console.log(`  error.tsx: ${this.stats.hasRootError ? '✅ Found' : '⚠️  Missing'}`);

    if (!this.stats.hasRootError) {
      this.issues.push({
        type: 'warning',
        message: 'app/error.tsx が見つかりません',
      });
    }

    // not-found.tsx
    const notFoundPath = path.join(this.appDir, 'not-found.tsx');
    this.stats.hasRootNotFound = fs.existsSync(notFoundPath);
    console.log(`  not-found.tsx: ${this.stats.hasRootNotFound ? '✅ Found' : '❌ Missing'}`);

    if (!this.stats.hasRootNotFound) {
      this.issues.push({
        type: 'error',
        message: 'app/not-found.tsx が見つかりません（404ページがデフォルトになります）',
      });
    }

    // loading.tsx
    const loadingPath = path.join(this.appDir, 'loading.tsx');
    this.stats.hasRootLoading = fs.existsSync(loadingPath);
    console.log(`  loading.tsx: ${this.stats.hasRootLoading ? '✅ Found' : '⚠️  Optional'}`);

    // error.tsxの内容チェック
    if (this.stats.hasRootError) {
      this.validateErrorFile(errorPath);
    }

    // global-error.tsxの内容チェック
    if (this.stats.hasGlobalError) {
      this.validateGlobalErrorFile(globalErrorPath);
    }
  }

  validateErrorFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // 'use client' チェック
    if (!content.includes("'use client'") && !content.includes('"use client"')) {
      this.issues.push({
        type: 'error',
        message: `${path.relative(this.appDir, filePath)}: 'use client' ディレクティブがありません`,
      });
    }

    // reset関数の使用チェック
    if (!content.includes('reset')) {
      this.issues.push({
        type: 'warning',
        message: `${path.relative(this.appDir, filePath)}: reset関数が使用されていません`,
      });
    }
  }

  validateGlobalErrorFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // 'use client' チェック
    if (!content.includes("'use client'") && !content.includes('"use client"')) {
      this.issues.push({
        type: 'error',
        message: `global-error.tsx: 'use client' ディレクティブがありません`,
      });
    }

    // html/body タグチェック
    if (!content.includes('<html') || !content.includes('<body')) {
      this.issues.push({
        type: 'error',
        message: 'global-error.tsx: <html>と<body>タグが必要です',
      });
    }
  }

  scanDirectory(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // このディレクトリがルートセグメントか
    const hasPage = entries.some((e) => e.name === 'page.tsx' || e.name === 'page.ts');

    if (hasPage) {
      this.stats.totalSegments++;

      const segmentInfo = {
        path: relativePath || '/',
        hasError: false,
        hasNotFound: false,
        hasLoading: false,
        isDynamic: relativePath.includes('['),
      };

      // 各ファイルの存在チェック
      if (entries.some((e) => e.name === 'error.tsx' || e.name === 'error.ts')) {
        segmentInfo.hasError = true;
        this.stats.segmentsWithError++;

        // error.tsxの内容検証
        const errorPath = path.join(dir, 'error.tsx');
        if (fs.existsSync(errorPath)) {
          this.validateErrorFile(errorPath);
        }
      }

      if (entries.some((e) => e.name === 'not-found.tsx' || e.name === 'not-found.ts')) {
        segmentInfo.hasNotFound = true;
        this.stats.segmentsWithNotFound++;
      }

      if (entries.some((e) => e.name === 'loading.tsx' || e.name === 'loading.ts')) {
        segmentInfo.hasLoading = true;
        this.stats.segmentsWithLoading++;
      }

      // 動的ルートのチェック
      if (segmentInfo.isDynamic) {
        this.stats.dynamicRoutes++;

        // 動的ルートでnotFound()が使用されているかチェック
        const pagePath = path.join(dir, 'page.tsx');
        if (fs.existsSync(pagePath)) {
          const pageContent = fs.readFileSync(pagePath, 'utf-8');
          if (pageContent.includes('notFound()') || pageContent.includes('notFound(')) {
            this.stats.dynamicRoutesWithNotFound++;
          } else {
            this.suggestions.push(
              `${relativePath}: 動的ルートで notFound() の使用を検討してください`
            );
          }
        }
      }

      // 出力
      console.log(`\n📄 ${segmentInfo.path}`);
      console.log(`  error.tsx: ${segmentInfo.hasError ? '✅' : '—'}`);
      console.log(`  not-found.tsx: ${segmentInfo.hasNotFound ? '✅' : '—'}`);
      console.log(`  loading.tsx: ${segmentInfo.hasLoading ? '✅' : '—'}`);
      if (segmentInfo.isDynamic) {
        console.log(`  [Dynamic Route]`);
      }
    }

    // サブディレクトリを再帰的にチェック
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        const subPath = path.join(relativePath, entry.name);
        this.scanDirectory(path.join(dir, entry.name), subPath);
      }
    }
  }

  analyzeResults() {
    // カバレッジ分析
    const errorCoverage = this.stats.totalSegments > 0
      ? (this.stats.segmentsWithError / this.stats.totalSegments) * 100
      : 0;

    if (errorCoverage < 50 && this.stats.totalSegments > 3) {
      this.suggestions.push('error.tsx のカバレッジが低いです。重要なルートには個別のerror.tsxを検討してください');
    }

    // 動的ルートの分析
    if (this.stats.dynamicRoutes > 0 && this.stats.dynamicRoutesWithNotFound < this.stats.dynamicRoutes) {
      this.suggestions.push(
        `${this.stats.dynamicRoutes - this.stats.dynamicRoutesWithNotFound}/${this.stats.dynamicRoutes} の動的ルートで notFound() が使用されていません`
      );
    }

    // loadingの提案
    if (this.stats.segmentsWithLoading === 0 && this.stats.totalSegments > 0) {
      this.suggestions.push('loading.tsx がありません。データフェッチを行うページには追加を検討してください');
    }
  }

  printStats() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log('-'.repeat(40));
    console.log(`  Total Segments: ${this.stats.totalSegments}`);
    console.log(`  With error.tsx: ${this.stats.segmentsWithError} (${this.percentage(this.stats.segmentsWithError, this.stats.totalSegments)}%)`);
    console.log(`  With not-found.tsx: ${this.stats.segmentsWithNotFound}`);
    console.log(`  With loading.tsx: ${this.stats.segmentsWithLoading}`);
    console.log(`  Dynamic Routes: ${this.stats.dynamicRoutes}`);
    console.log(`  Dynamic with notFound(): ${this.stats.dynamicRoutesWithNotFound}`);

    // スコア計算
    const score = this.calculateScore();
    console.log(`\n  📈 Error Handling Score: ${score}/100`);
  }

  calculateScore() {
    let score = 0;

    // global-error.tsx (20点)
    if (this.stats.hasGlobalError) score += 20;

    // app/error.tsx (20点)
    if (this.stats.hasRootError) score += 20;

    // app/not-found.tsx (20点)
    if (this.stats.hasRootNotFound) score += 20;

    // error.tsxカバレッジ (20点)
    if (this.stats.totalSegments > 0) {
      score += Math.round((this.stats.segmentsWithError / this.stats.totalSegments) * 20);
    } else {
      score += 20;
    }

    // 動的ルートでのnotFound()使用 (20点)
    if (this.stats.dynamicRoutes > 0) {
      score += Math.round((this.stats.dynamicRoutesWithNotFound / this.stats.dynamicRoutes) * 20);
    } else {
      score += 20;
    }

    return score;
  }

  percentage(part, total) {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
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

    if (this.suggestions.length === 0) {
      console.log('  ✅ No additional suggestions');
    } else {
      for (const suggestion of this.suggestions) {
        console.log(`  → ${suggestion}`);
      }
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node check-error-handling.mjs <app-directory>');
  console.log('Example: node check-error-handling.mjs ./src/app');
  process.exit(1);
}

const checker = new ErrorHandlingChecker(args[0]);
checker.check();
