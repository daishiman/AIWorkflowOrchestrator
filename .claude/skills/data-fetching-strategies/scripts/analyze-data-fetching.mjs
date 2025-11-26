#!/usr/bin/env node

/**
 * データフェッチパターン分析スクリプト
 *
 * 使用法:
 *   node analyze-data-fetching.mjs <file.tsx>
 *   node analyze-data-fetching.mjs <directory>
 *
 * 分析内容:
 *   - 使用ライブラリの検出（SWR, React Query, fetch, axios）
 *   - キャッシュ設定の分析
 *   - エラーハンドリングパターンの検出
 *   - 楽観的更新の使用状況
 */

import fs from 'fs';
import path from 'path';

const patterns = {
  // ライブラリ検出
  libraries: {
    swr: /import\s+.*\s+from\s+['"]swr['"]/,
    swrMutation: /import\s+.*\s+from\s+['"]swr\/mutation['"]/,
    reactQuery: /import\s+.*\s+from\s+['"]@tanstack\/react-query['"]/,
    axios: /import\s+.*\s+from\s+['"]axios['"]/,
    fetch: /\bfetch\s*\(/,
  },

  // Hooks使用
  hooks: {
    useSWR: /useSWR\s*\(/g,
    useSWRMutation: /useSWRMutation\s*\(/g,
    useQuery: /useQuery\s*\(/g,
    useMutation: /useMutation\s*\(/g,
    useInfiniteQuery: /useInfiniteQuery\s*\(/g,
    useSWRInfinite: /useSWRInfinite\s*\(/g,
  },

  // キャッシュ設定
  cacheSettings: {
    staleTime: /staleTime\s*:/g,
    cacheTime: /cacheTime\s*:/g,
    gcTime: /gcTime\s*:/g,
    refreshInterval: /refreshInterval\s*:/g,
    revalidateOnFocus: /revalidateOnFocus\s*:/g,
    refetchOnWindowFocus: /refetchOnWindowFocus\s*:/g,
  },

  // エラーハンドリング
  errorHandling: {
    onError: /onError\s*:/g,
    errorBoundary: /<ErrorBoundary/g,
    tryCatch: /try\s*{[\s\S]*?catch/g,
    retry: /retry\s*:/g,
  },

  // 楽観的更新
  optimisticUpdates: {
    onMutate: /onMutate\s*:/g,
    optimisticData: /optimisticData\s*:/g,
    rollbackOnError: /rollbackOnError\s*:/g,
    setQueryData: /setQueryData\s*\(/g,
    cancelQueries: /cancelQueries\s*\(/g,
  },

  // 再検証パターン
  revalidation: {
    invalidateQueries: /invalidateQueries\s*\(/g,
    mutate: /\bmutate\s*\(/g,
    refetch: /refetch\s*\(/g,
  },
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const results = {
    file: filePath,
    libraries: {},
    hooks: {},
    cacheSettings: {},
    errorHandling: {},
    optimisticUpdates: {},
    revalidation: {},
    issues: [],
    suggestions: [],
  };

  // ライブラリ検出
  for (const [name, pattern] of Object.entries(patterns.libraries)) {
    results.libraries[name] = pattern.test(content);
  }

  // Hooks使用カウント
  for (const [name, pattern] of Object.entries(patterns.hooks)) {
    const matches = content.match(pattern);
    results.hooks[name] = matches ? matches.length : 0;
  }

  // キャッシュ設定検出
  for (const [name, pattern] of Object.entries(patterns.cacheSettings)) {
    const matches = content.match(pattern);
    results.cacheSettings[name] = matches ? matches.length : 0;
  }

  // エラーハンドリング検出
  for (const [name, pattern] of Object.entries(patterns.errorHandling)) {
    const matches = content.match(pattern);
    results.errorHandling[name] = matches ? matches.length : 0;
  }

  // 楽観的更新検出
  for (const [name, pattern] of Object.entries(patterns.optimisticUpdates)) {
    const matches = content.match(pattern);
    results.optimisticUpdates[name] = matches ? matches.length : 0;
  }

  // 再検証パターン検出
  for (const [name, pattern] of Object.entries(patterns.revalidation)) {
    const matches = content.match(pattern);
    results.revalidation[name] = matches ? matches.length : 0;
  }

  // 問題点と提案の生成
  generateAnalysis(results, content);

  return results;
}

function generateAnalysis(results, content) {
  // ライブラリ混在チェック
  if (results.libraries.swr && results.libraries.reactQuery) {
    results.issues.push({
      severity: 'warning',
      message: 'SWRとReact Queryの両方が使用されています。一つに統一することを推奨します。',
    });
  }

  // エラーハンドリングチェック
  const hasDataFetching = results.hooks.useSWR > 0 || results.hooks.useQuery > 0;
  const hasErrorHandling = results.errorHandling.onError > 0 || results.errorHandling.errorBoundary > 0;

  if (hasDataFetching && !hasErrorHandling) {
    results.issues.push({
      severity: 'warning',
      message: 'データフェッチが検出されましたが、エラーハンドリングが見つかりません。',
    });
    results.suggestions.push('onErrorコールバックまたはErrorBoundaryの追加を検討してください。');
  }

  // キャッシュ設定チェック
  if (results.libraries.reactQuery && results.cacheSettings.staleTime === 0) {
    results.suggestions.push('staleTimeの設定を検討してください。デフォルトは0（常にstale）です。');
  }

  // 楽観的更新のパターンチェック
  const hasMutation = results.hooks.useMutation > 0 || results.hooks.useSWRMutation > 0;
  const hasOptimistic = results.optimisticUpdates.onMutate > 0 || results.optimisticUpdates.optimisticData > 0;

  if (hasMutation && !hasOptimistic) {
    results.suggestions.push('ミューテーションに楽観的更新を追加するとUXが向上する可能性があります。');
  }

  // 楽観的更新のロールバックチェック
  if (results.optimisticUpdates.onMutate > 0) {
    const hasRollback = content.includes('context?.previous') || content.includes('rollbackOnError');
    if (!hasRollback) {
      results.issues.push({
        severity: 'error',
        message: '楽観的更新がありますが、ロールバック処理が見つかりません。',
      });
    }
  }

  // 無限スクロールの検出
  if (results.hooks.useInfiniteQuery > 0 || results.hooks.useSWRInfinite > 0) {
    results.suggestions.push('無限スクロールが検出されました。仮想化（react-window等）の使用を検討してください。');
  }

  // 再検証戦略チェック
  if (hasMutation && results.revalidation.invalidateQueries === 0 && results.revalidation.mutate === 0) {
    results.issues.push({
      severity: 'warning',
      message: 'ミューテーション後の再検証が見つかりません。データの整合性を確認してください。',
    });
  }
}

function formatResults(results) {
  const output = [];

  output.push(`\n📁 ${results.file}`);
  output.push('═'.repeat(50));

  // ライブラリ
  output.push('\n📦 使用ライブラリ:');
  const usedLibraries = Object.entries(results.libraries)
    .filter(([, used]) => used)
    .map(([name]) => name);
  output.push(usedLibraries.length > 0 ? `  ${usedLibraries.join(', ')}` : '  なし');

  // Hooks使用状況
  const usedHooks = Object.entries(results.hooks).filter(([, count]) => count > 0);
  if (usedHooks.length > 0) {
    output.push('\n🪝 Hooks使用状況:');
    for (const [name, count] of usedHooks) {
      output.push(`  ${name}: ${count}回`);
    }
  }

  // キャッシュ設定
  const cacheConfigs = Object.entries(results.cacheSettings).filter(([, count]) => count > 0);
  if (cacheConfigs.length > 0) {
    output.push('\n⚙️ キャッシュ設定:');
    for (const [name, count] of cacheConfigs) {
      output.push(`  ${name}: ${count}箇所`);
    }
  }

  // 楽観的更新
  const optimisticPatterns = Object.entries(results.optimisticUpdates).filter(([, count]) => count > 0);
  if (optimisticPatterns.length > 0) {
    output.push('\n✨ 楽観的更新パターン:');
    for (const [name, count] of optimisticPatterns) {
      output.push(`  ${name}: ${count}箇所`);
    }
  }

  // 問題点
  if (results.issues.length > 0) {
    output.push('\n⚠️ 問題点:');
    for (const issue of results.issues) {
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      output.push(`  ${icon} ${issue.message}`);
    }
  }

  // 提案
  if (results.suggestions.length > 0) {
    output.push('\n💡 提案:');
    for (const suggestion of results.suggestions) {
      output.push(`  • ${suggestion}`);
    }
  }

  return output.join('\n');
}

function analyzeDirectory(dirPath) {
  const results = [];
  const files = fs.readdirSync(dirPath, { recursive: true });

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isFile() && /\.(tsx?|jsx?)$/.test(file)) {
      results.push(analyzeFile(filePath));
    }
  }

  return results;
}

// メイン実行
const target = process.argv[2];

if (!target) {
  console.log('使用法: node analyze-data-fetching.mjs <file.tsx|directory>');
  process.exit(1);
}

const targetPath = path.resolve(target);

if (!fs.existsSync(targetPath)) {
  console.error(`ファイルまたはディレクトリが見つかりません: ${targetPath}`);
  process.exit(1);
}

const isDirectory = fs.statSync(targetPath).isDirectory();
const results = isDirectory ? analyzeDirectory(targetPath) : [analyzeFile(targetPath)];

// サマリー出力
console.log('\n🔍 データフェッチ分析レポート');
console.log('═'.repeat(50));

for (const result of results) {
  console.log(formatResults(result));
}

// 全体サマリー
if (results.length > 1) {
  console.log('\n📊 全体サマリー');
  console.log('═'.repeat(50));

  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const totalSuggestions = results.reduce((sum, r) => sum + r.suggestions.length, 0);

  console.log(`  分析ファイル数: ${results.length}`);
  console.log(`  問題点: ${totalIssues}件`);
  console.log(`  提案: ${totalSuggestions}件`);
}
