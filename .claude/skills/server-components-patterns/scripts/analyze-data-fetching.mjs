#!/usr/bin/env node

/**
 * Server Components データフェッチ分析スクリプト
 *
 * 使用方法:
 *   node analyze-data-fetching.mjs <file.tsx>
 *
 * 例:
 *   node analyze-data-fetching.mjs ./src/app/page.tsx
 */

import fs from 'fs';
import path from 'path';

class DataFetchingAnalyzer {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
    this.content = '';
    this.issues = [];
    this.suggestions = [];
    this.stats = {
      fetches: 0,
      parallelFetches: 0,
      sequentialFetches: 0,
      cachedFetches: 0,
      uncachedFetches: 0,
      serverActions: 0,
      suspenseBoundaries: 0,
    };
  }

  analyze() {
    if (!fs.existsSync(this.filePath)) {
      console.error(`Error: File not found: ${this.filePath}`);
      process.exit(1);
    }

    this.content = fs.readFileSync(this.filePath, 'utf-8');

    console.log(`\n📊 Analyzing: ${this.filePath}\n`);
    console.log('='.repeat(60));

    this.checkComponentType();
    this.analyzeDataFetching();
    this.analyzeCaching();
    this.analyzeSuspense();
    this.analyzeServerActions();
    this.checkPatterns();

    this.printStats();
    this.printIssues();
    this.printSuggestions();
  }

  checkComponentType() {
    const hasUseClient = this.content.includes("'use client'") || this.content.includes('"use client"');
    const hasUseServer = this.content.includes("'use server'") || this.content.includes('"use server"');

    console.log('\n🔍 Component Type:');
    console.log('-'.repeat(40));

    if (hasUseClient) {
      console.log('  Type: Client Component');
      this.suggestions.push('Client Componentではデータフェッチを避け、Server Componentから props で渡すことを検討');
    } else if (hasUseServer) {
      console.log('  Type: Server Action file');
    } else {
      console.log('  Type: Server Component (default)');
    }
  }

  analyzeDataFetching() {
    console.log('\n📥 Data Fetching Analysis:');
    console.log('-'.repeat(40));

    // fetch呼び出しを検出
    const fetchMatches = this.content.match(/await\s+fetch\s*\(/g) || [];
    this.stats.fetches = fetchMatches.length;

    // Promise.allの検出
    const promiseAllMatches = this.content.match(/Promise\.all\s*\(\s*\[/g) || [];
    this.stats.parallelFetches = promiseAllMatches.length;

    // 連続したawaitを検出（ウォーターフォール）
    const sequentialPattern = /await\s+\w+\([^)]*\)\s*;?\s*\n\s*await\s+\w+\(/g;
    const sequentialMatches = this.content.match(sequentialPattern) || [];

    if (sequentialMatches.length > 0) {
      this.stats.sequentialFetches = sequentialMatches.length;
      this.issues.push({
        type: 'warning',
        message: `連続した await が ${sequentialMatches.length} 箇所あります（ウォーターフォール）`,
      });
    }

    // DB直接アクセスを検出
    const dbPatterns = ['db.', 'prisma.', 'drizzle.'];
    const hasDbAccess = dbPatterns.some(p => this.content.includes(p));

    console.log(`  fetch calls: ${this.stats.fetches}`);
    console.log(`  Promise.all usage: ${this.stats.parallelFetches}`);
    console.log(`  Sequential awaits: ${this.stats.sequentialFetches}`);
    console.log(`  Database access: ${hasDbAccess ? 'Yes' : 'No'}`);

    if (this.stats.fetches > 1 && this.stats.parallelFetches === 0) {
      this.suggestions.push('複数のfetchがあります。独立している場合はPromise.allで並列化を検討');
    }
  }

  analyzeCaching() {
    console.log('\n💾 Caching Analysis:');
    console.log('-'.repeat(40));

    // キャッシュオプションの検出
    const forceCache = (this.content.match(/cache:\s*['"]force-cache['"]/g) || []).length;
    const noStore = (this.content.match(/cache:\s*['"]no-store['"]/g) || []).length;
    const revalidate = (this.content.match(/next:\s*\{\s*revalidate:/g) || []).length;
    const tags = (this.content.match(/next:\s*\{\s*tags:/g) || []).length;

    // Segment config
    const dynamicExport = this.content.match(/export\s+const\s+dynamic\s*=\s*['"]([^'"]+)['"]/);
    const revalidateExport = this.content.match(/export\s+const\s+revalidate\s*=\s*(\d+|false)/);

    this.stats.cachedFetches = forceCache + revalidate;
    this.stats.uncachedFetches = noStore;

    console.log(`  force-cache: ${forceCache}`);
    console.log(`  no-store: ${noStore}`);
    console.log(`  revalidate: ${revalidate}`);
    console.log(`  tags: ${tags}`);
    console.log(`  dynamic export: ${dynamicExport ? dynamicExport[1] : 'none'}`);
    console.log(`  revalidate export: ${revalidateExport ? revalidateExport[1] : 'none'}`);

    if (this.stats.fetches > 0 && this.stats.cachedFetches === 0 && this.stats.uncachedFetches === 0) {
      this.suggestions.push('fetchにキャッシュオプションが設定されていません。明示的な設定を検討');
    }
  }

  analyzeSuspense() {
    console.log('\n⏳ Suspense Analysis:');
    console.log('-'.repeat(40));

    // Suspense使用の検出
    const suspenseMatches = this.content.match(/<Suspense/g) || [];
    this.stats.suspenseBoundaries = suspenseMatches.length;

    // loading.tsxの存在チェック（同じディレクトリ）
    const dir = path.dirname(this.filePath);
    const hasLoading = fs.existsSync(path.join(dir, 'loading.tsx')) ||
                       fs.existsSync(path.join(dir, 'loading.ts'));

    console.log(`  Suspense boundaries: ${this.stats.suspenseBoundaries}`);
    console.log(`  loading.tsx exists: ${hasLoading ? 'Yes' : 'No'}`);

    if (this.stats.fetches > 0 && this.stats.suspenseBoundaries === 0 && !hasLoading) {
      this.suggestions.push('非同期処理がありますが、Suspense境界がありません。loading.tsxまたは<Suspense>の追加を検討');
    }
  }

  analyzeServerActions() {
    console.log('\n🚀 Server Actions Analysis:');
    console.log('-'.repeat(40));

    // Server Actions の検出
    const actionMatches = this.content.match(/async\s+function\s+\w+\s*\([^)]*FormData/g) || [];
    const useServerInline = this.content.match(/'use server'\s*\n/g) || [];

    this.stats.serverActions = actionMatches.length;

    // revalidatePath/revalidateTag の使用
    const hasRevalidatePath = this.content.includes('revalidatePath');
    const hasRevalidateTag = this.content.includes('revalidateTag');

    console.log(`  Server Actions: ${this.stats.serverActions}`);
    console.log(`  revalidatePath usage: ${hasRevalidatePath ? 'Yes' : 'No'}`);
    console.log(`  revalidateTag usage: ${hasRevalidateTag ? 'Yes' : 'No'}`);

    if (this.stats.serverActions > 0 && !hasRevalidatePath && !hasRevalidateTag) {
      this.suggestions.push('Server Actionsがありますが、再検証処理がありません。revalidatePath/revalidateTagの追加を検討');
    }
  }

  checkPatterns() {
    // cache関数の使用
    const hasCacheImport = this.content.includes("from 'react'") && this.content.includes('cache');

    // unstable_cacheの使用
    const hasUnstableCache = this.content.includes('unstable_cache');

    if (!hasCacheImport && !hasUnstableCache && this.stats.fetches > 1) {
      this.suggestions.push('複数のデータ取得がある場合、Reactのcache()関数で重複排除を検討');
    }
  }

  printStats() {
    console.log('\n' + '='.repeat(60));
    console.log('📈 Summary:');
    console.log('-'.repeat(40));
    console.log(`  Total fetches: ${this.stats.fetches}`);
    console.log(`  Parallel patterns: ${this.stats.parallelFetches}`);
    console.log(`  Sequential patterns: ${this.stats.sequentialFetches}`);
    console.log(`  Suspense boundaries: ${this.stats.suspenseBoundaries}`);
    console.log(`  Server Actions: ${this.stats.serverActions}`);
  }

  printIssues() {
    console.log('\n⚠️  Issues:');
    console.log('-'.repeat(40));

    if (this.issues.length === 0) {
      console.log('  ✅ No issues found');
    } else {
      for (const issue of this.issues) {
        const icon = issue.type === 'error' ? '❌' : '⚠️';
        console.log(`  ${icon} ${issue.message}`);
      }
    }
  }

  printSuggestions() {
    console.log('\n💡 Suggestions:');
    console.log('-'.repeat(40));

    if (this.suggestions.length === 0) {
      console.log('  ✅ No suggestions');
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
  console.log('Usage: node analyze-data-fetching.mjs <file.tsx>');
  console.log('Example: node analyze-data-fetching.mjs ./src/app/page.tsx');
  process.exit(1);
}

const analyzer = new DataFetchingAnalyzer(args[0]);
analyzer.analyze();
