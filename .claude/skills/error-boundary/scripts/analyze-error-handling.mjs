#!/usr/bin/env node

/**
 * エラーハンドリング分析スクリプト
 *
 * 使用法:
 *   node analyze-error-handling.mjs <file.tsx>
 *   node analyze-error-handling.mjs <directory>
 *
 * 分析内容:
 *   - Error Boundaryの使用状況
 *   - try-catchの使用
 *   - エラー報告の実装
 *   - 推奨事項の提供
 */

import fs from 'fs';
import path from 'path';

const patterns = {
  // Error Boundary
  errorBoundary: {
    classComponent: /class\s+\w+\s+extends\s+(?:React\.)?Component/g,
    getDerivedStateFromError: /getDerivedStateFromError/g,
    componentDidCatch: /componentDidCatch/g,
    errorBoundaryImport: /import.*ErrorBoundary/g,
    reactErrorBoundary: /<ErrorBoundary/g,
  },

  // エラーハンドリング
  errorHandling: {
    tryCatch: /try\s*{[\s\S]*?}\s*catch/g,
    throwStatement: /throw\s+(?:new\s+)?(?:Error|TypeError|RangeError)/g,
    errorCallback: /onError\s*[=:]/g,
    catchMethod: /\.catch\s*\(/g,
  },

  // エラー報告
  errorReporting: {
    sentry: /Sentry\./g,
    bugsnag: /Bugsnag\./g,
    logError: /console\.error/g,
    reportError: /report(?:Error|Exception)/gi,
  },

  // 非同期エラー
  asyncPatterns: {
    asyncAwait: /async\s+(?:function|\([^)]*\)\s*=>|\w+\s*=)/g,
    promise: /new\s+Promise/g,
    thenCatch: /\.then\([^)]*\)\.catch/g,
  },

  // フォールバックUI
  fallbackUI: {
    fallbackProp: /fallback\s*[=:]/g,
    fallbackRender: /fallbackRender\s*[=:]/g,
    errorComponent: /Error(?:Fallback|Page|View|Display)/g,
  },
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  const results = {
    file: filePath,
    errorBoundary: {
      hasClassComponent: false,
      hasGetDerivedStateFromError: false,
      hasComponentDidCatch: false,
      hasErrorBoundaryImport: false,
      errorBoundaryUsages: 0,
    },
    errorHandling: {
      tryCatchBlocks: 0,
      throwStatements: 0,
      errorCallbacks: 0,
      promiseCatches: 0,
    },
    errorReporting: {
      hasSentry: false,
      hasBugsnag: false,
      consoleErrors: 0,
      reportCalls: 0,
    },
    asyncPatterns: {
      asyncFunctions: 0,
      promises: 0,
      properlyHandled: 0,
    },
    fallbackUI: {
      fallbackProps: 0,
      errorComponents: 0,
    },
    issues: [],
    suggestions: [],
  };

  // Error Boundary分析
  results.errorBoundary.hasClassComponent = patterns.errorBoundary.classComponent.test(content);
  results.errorBoundary.hasGetDerivedStateFromError = patterns.errorBoundary.getDerivedStateFromError.test(content);
  results.errorBoundary.hasComponentDidCatch = patterns.errorBoundary.componentDidCatch.test(content);
  results.errorBoundary.hasErrorBoundaryImport = patterns.errorBoundary.errorBoundaryImport.test(content);
  results.errorBoundary.errorBoundaryUsages = (content.match(patterns.errorBoundary.reactErrorBoundary) || []).length;

  // エラーハンドリング分析
  results.errorHandling.tryCatchBlocks = (content.match(patterns.errorHandling.tryCatch) || []).length;
  results.errorHandling.throwStatements = (content.match(patterns.errorHandling.throwStatement) || []).length;
  results.errorHandling.errorCallbacks = (content.match(patterns.errorHandling.errorCallback) || []).length;
  results.errorHandling.promiseCatches = (content.match(patterns.errorHandling.catchMethod) || []).length;

  // エラー報告分析
  results.errorReporting.hasSentry = patterns.errorReporting.sentry.test(content);
  results.errorReporting.hasBugsnag = patterns.errorReporting.bugsnag.test(content);
  results.errorReporting.consoleErrors = (content.match(patterns.errorReporting.logError) || []).length;
  results.errorReporting.reportCalls = (content.match(patterns.errorReporting.reportError) || []).length;

  // 非同期パターン分析
  results.asyncPatterns.asyncFunctions = (content.match(patterns.asyncPatterns.asyncAwait) || []).length;
  results.asyncPatterns.promises = (content.match(patterns.asyncPatterns.promise) || []).length;
  results.asyncPatterns.properlyHandled = (content.match(patterns.asyncPatterns.thenCatch) || []).length;

  // フォールバックUI分析
  results.fallbackUI.fallbackProps = (content.match(patterns.fallbackUI.fallbackProp) || []).length +
                                     (content.match(patterns.fallbackUI.fallbackRender) || []).length;
  results.fallbackUI.errorComponents = (content.match(patterns.fallbackUI.errorComponent) || []).length;

  // 問題点と提案の生成
  generateAnalysis(results, content);

  return results;
}

function generateAnalysis(results, content) {
  // Error Boundaryの不足
  const hasComponents = content.includes('function') || content.includes('const');
  if (hasComponents && results.errorBoundary.errorBoundaryUsages === 0 && !results.errorBoundary.hasErrorBoundaryImport) {
    results.issues.push({
      severity: 'warning',
      message: 'Error Boundaryが使用されていません',
    });
    results.suggestions.push('コンポーネントツリーにError Boundaryを追加することを検討してください');
  }

  // 非同期エラーの未処理
  const totalAsync = results.asyncPatterns.asyncFunctions + results.asyncPatterns.promises;
  const totalCatches = results.errorHandling.tryCatchBlocks + results.errorHandling.promiseCatches;

  if (totalAsync > 0 && totalCatches === 0) {
    results.issues.push({
      severity: 'warning',
      message: '非同期処理がありますが、エラーハンドリングが見つかりません',
    });
    results.suggestions.push('async/awaitにはtry-catch、Promiseには.catch()を使用してください');
  }

  // エラー報告の不足
  const hasErrorHandling = results.errorHandling.tryCatchBlocks > 0 || results.errorBoundary.hasComponentDidCatch;
  const hasErrorReporting = results.errorReporting.hasSentry || results.errorReporting.hasBugsnag ||
                           results.errorReporting.reportCalls > 0;

  if (hasErrorHandling && !hasErrorReporting && results.errorReporting.consoleErrors === 0) {
    results.issues.push({
      severity: 'info',
      message: 'エラーハンドリングがありますが、エラー報告が見つかりません',
    });
    results.suggestions.push('本番環境ではSentryやBugsnagなどのエラー報告サービスの使用を検討してください');
  }

  // console.errorの多用
  if (results.errorReporting.consoleErrors > 3) {
    results.suggestions.push('console.errorの代わりに、構造化されたエラー報告を使用することを検討してください');
  }

  // フォールバックUIの不足
  if (results.errorBoundary.errorBoundaryUsages > 0 && results.fallbackUI.fallbackProps === 0) {
    results.issues.push({
      severity: 'warning',
      message: 'Error Boundaryにフォールバックプロップが設定されていない可能性があります',
    });
  }

  // componentDidCatchのみの使用
  if (results.errorBoundary.hasComponentDidCatch && !results.errorBoundary.hasGetDerivedStateFromError) {
    results.suggestions.push('componentDidCatchと共にgetDerivedStateFromErrorを使用することを推奨します');
  }
}

function formatResults(results) {
  const output = [];

  output.push(`\n📁 ${results.file}`);
  output.push('═'.repeat(60));

  // Error Boundary
  output.push('\n🛡️ Error Boundary:');
  output.push(`  使用回数: ${results.errorBoundary.errorBoundaryUsages}`);
  output.push(`  カスタムBoundary: ${results.errorBoundary.hasGetDerivedStateFromError ? '✅' : '❌'}`);
  output.push(`  componentDidCatch: ${results.errorBoundary.hasComponentDidCatch ? '✅' : '❌'}`);

  // エラーハンドリング
  output.push('\n🔧 エラーハンドリング:');
  output.push(`  try-catch: ${results.errorHandling.tryCatchBlocks}箇所`);
  output.push(`  .catch(): ${results.errorHandling.promiseCatches}箇所`);
  output.push(`  throw: ${results.errorHandling.throwStatements}箇所`);
  output.push(`  onError: ${results.errorHandling.errorCallbacks}箇所`);

  // エラー報告
  output.push('\n📊 エラー報告:');
  output.push(`  Sentry: ${results.errorReporting.hasSentry ? '✅' : '❌'}`);
  output.push(`  Bugsnag: ${results.errorReporting.hasBugsnag ? '✅' : '❌'}`);
  output.push(`  console.error: ${results.errorReporting.consoleErrors}箇所`);
  output.push(`  カスタム報告: ${results.errorReporting.reportCalls}箇所`);

  // 非同期パターン
  if (results.asyncPatterns.asyncFunctions > 0 || results.asyncPatterns.promises > 0) {
    output.push('\n⏳ 非同期処理:');
    output.push(`  async関数: ${results.asyncPatterns.asyncFunctions}`);
    output.push(`  Promise: ${results.asyncPatterns.promises}`);
  }

  // フォールバックUI
  if (results.fallbackUI.fallbackProps > 0 || results.fallbackUI.errorComponents > 0) {
    output.push('\n🎨 フォールバックUI:');
    output.push(`  fallbackプロップ: ${results.fallbackUI.fallbackProps}`);
    output.push(`  Errorコンポーネント: ${results.fallbackUI.errorComponents}`);
  }

  // 問題点
  if (results.issues.length > 0) {
    output.push('\n⚠️ 問題点:');
    for (const issue of results.issues) {
      const icon = issue.severity === 'warning' ? '⚠️' :
                   issue.severity === 'error' ? '❌' : 'ℹ️';
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
  console.log('使用法: node analyze-error-handling.mjs <file.tsx|directory>');
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
console.log('\n🔍 エラーハンドリング分析レポート');
console.log('═'.repeat(60));

for (const result of results) {
  console.log(formatResults(result));
}

// 全体サマリー
if (results.length > 1) {
  console.log('\n📈 全体サマリー');
  console.log('═'.repeat(60));

  const totalBoundaries = results.reduce((sum, r) => sum + r.errorBoundary.errorBoundaryUsages, 0);
  const totalTryCatch = results.reduce((sum, r) => sum + r.errorHandling.tryCatchBlocks, 0);
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const hasReporting = results.some(r => r.errorReporting.hasSentry || r.errorReporting.hasBugsnag);

  console.log(`  分析ファイル数: ${results.length}`);
  console.log(`  Error Boundary使用: ${totalBoundaries}箇所`);
  console.log(`  try-catch: ${totalTryCatch}箇所`);
  console.log(`  エラー報告サービス: ${hasReporting ? '✅ 統合済み' : '❌ 未統合'}`);
  console.log(`  問題点: ${totalIssues}件`);
}
