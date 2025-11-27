#!/usr/bin/env node

/**
 * GitHub Actions Log Analyzer
 *
 * ワークフローログを分析し、エラーパターン、警告、パフォーマンス問題を検出します。
 *
 * 使用方法:
 *   node analyze-logs.mjs <log-file>
 *   node analyze-logs.mjs workflow.log
 *
 * 機能:
 *   - エラーパターンの検出と分類
 *   - 警告メッセージの抽出
 *   - ステップ実行時間の分析
 *   - リソース使用量の追跡
 *   - トラブルシューティング提案
 */

import fs from 'fs';
import path from 'path';

// ANSI色コード
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
};

// エラーパターン定義
const errorPatterns = {
  permission: {
    patterns: [
      /permission denied/i,
      /403 forbidden/i,
      /not authorized/i,
      /resource not accessible by integration/i,
    ],
    severity: 'high',
    category: 'Permission',
    solution: 'Check GITHUB_TOKEN permissions and repository settings',
  },
  cache: {
    patterns: [
      /cache not found/i,
      /cache miss/i,
      /unable to reserve cache/i,
    ],
    severity: 'medium',
    category: 'Cache',
    solution: 'Review cache key configuration and restore-keys',
  },
  timeout: {
    patterns: [
      /timeout/i,
      /exceeded the maximum execution time/i,
      /operation timed out/i,
    ],
    severity: 'high',
    category: 'Timeout',
    solution: 'Increase timeout-minutes or optimize slow operations',
  },
  network: {
    patterns: [
      /network error/i,
      /connection refused/i,
      /could not resolve host/i,
      /failed to connect/i,
    ],
    severity: 'medium',
    category: 'Network',
    solution: 'Check network connectivity and DNS configuration',
  },
  dependency: {
    patterns: [
      /npm err!/i,
      /pip install error/i,
      /no matching distribution found/i,
      /404 not found.*registry/i,
    ],
    severity: 'high',
    category: 'Dependency',
    solution: 'Verify package versions and registry configuration',
  },
  disk: {
    patterns: [
      /no space left on device/i,
      /disk quota exceeded/i,
    ],
    severity: 'high',
    category: 'Disk Space',
    solution: 'Clean up workspace or use larger runner',
  },
  memory: {
    patterns: [
      /out of memory/i,
      /heap out of memory/i,
      /cannot allocate memory/i,
    ],
    severity: 'high',
    category: 'Memory',
    solution: 'Increase NODE_OPTIONS heap size or use larger runner',
  },
  artifact: {
    patterns: [
      /unable to upload artifact/i,
      /artifact not found/i,
      /failed to download artifact/i,
    ],
    severity: 'medium',
    category: 'Artifact',
    solution: 'Check artifact paths and size limits',
  },
  secret: {
    patterns: [
      /secret.*not defined/i,
      /secret.*not found/i,
    ],
    severity: 'high',
    category: 'Secret',
    solution: 'Configure required secrets in repository settings',
  },
};

// 警告パターン
const warningPatterns = [
  /::warning::/i,
  /warn:/i,
  /warning:/i,
  /deprecated/i,
];

// ステップタイミングパターン
const stepTimingPattern = /##\[group\]Run (.+)|Elapsed time: ([\d.]+) ms/;

/**
 * ログファイルを読み込む
 */
function readLogFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`${colors.red}Error: Could not read file: ${filePath}${colors.reset}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * エラーを検出して分類
 */
function detectErrors(logContent) {
  const errors = [];
  const lines = logContent.split('\n');

  lines.forEach((line, index) => {
    for (const [type, config] of Object.entries(errorPatterns)) {
      for (const pattern of config.patterns) {
        if (pattern.test(line)) {
          errors.push({
            type,
            category: config.category,
            severity: config.severity,
            solution: config.solution,
            line: index + 1,
            content: line.trim(),
          });
          break;
        }
      }
    }
  });

  return errors;
}

/**
 * 警告を検出
 */
function detectWarnings(logContent) {
  const warnings = [];
  const lines = logContent.split('\n');

  lines.forEach((line, index) => {
    for (const pattern of warningPatterns) {
      if (pattern.test(line)) {
        warnings.push({
          line: index + 1,
          content: line.trim(),
        });
        break;
      }
    }
  });

  return warnings;
}

/**
 * ステップ実行時間を分析
 */
function analyzeStepTiming(logContent) {
  const steps = [];
  const lines = logContent.split('\n');
  let currentStep = null;

  lines.forEach((line) => {
    const match = line.match(/##\[group\]Run (.+)/);
    if (match) {
      if (currentStep) {
        steps.push(currentStep);
      }
      currentStep = {
        name: match[1],
        startLine: line,
      };
    }

    const timeMatch = line.match(/Elapsed time: ([\d.]+) ms/);
    if (timeMatch && currentStep) {
      currentStep.duration = parseFloat(timeMatch[1]);
    }
  });

  if (currentStep) {
    steps.push(currentStep);
  }

  return steps.filter(s => s.duration).sort((a, b) => b.duration - a.duration);
}

/**
 * リソース使用量を抽出
 */
function extractResourceUsage(logContent) {
  const resources = {
    memory: [],
    disk: [],
  };

  const memoryPattern = /MemTotal:\s+([\d]+)\s+kB|MemFree:\s+([\d]+)\s+kB/g;
  const diskPattern = /Filesystem.*\n.*\s+(\d+)%/g;

  let match;
  while ((match = memoryPattern.exec(logContent)) !== null) {
    if (match[1]) {
      resources.memory.push({
        type: 'total',
        value: parseInt(match[1]) / 1024 / 1024, // GB
      });
    }
    if (match[2]) {
      resources.memory.push({
        type: 'free',
        value: parseInt(match[2]) / 1024 / 1024, // GB
      });
    }
  }

  while ((match = diskPattern.exec(logContent)) !== null) {
    resources.disk.push({
      usage: parseInt(match[1]),
    });
  }

  return resources;
}

/**
 * レポートを生成
 */
function generateReport(logFile, errors, warnings, steps, resources) {
  console.log(`\n${colors.bold}${colors.cyan}=== GitHub Actions Log Analysis ===${colors.reset}\n`);
  console.log(`${colors.blue}Log file:${colors.reset} ${logFile}\n`);

  // エラーサマリー
  console.log(`${colors.bold}${colors.red}Errors Found: ${errors.length}${colors.reset}`);
  if (errors.length > 0) {
    const grouped = errors.reduce((acc, err) => {
      if (!acc[err.category]) {
        acc[err.category] = [];
      }
      acc[err.category].push(err);
      return acc;
    }, {});

    for (const [category, errs] of Object.entries(grouped)) {
      console.log(`\n${colors.yellow}Category: ${category} (${errs.length})${colors.reset}`);
      errs.slice(0, 3).forEach((err) => {
        console.log(`  ${colors.red}Line ${err.line}:${colors.reset} ${err.content.substring(0, 100)}...`);
        console.log(`  ${colors.green}Solution:${colors.reset} ${err.solution}`);
      });
      if (errs.length > 3) {
        console.log(`  ${colors.cyan}... and ${errs.length - 3} more${colors.reset}`);
      }
    }
  }

  // 警告サマリー
  console.log(`\n${colors.bold}${colors.yellow}Warnings Found: ${warnings.length}${colors.reset}`);
  if (warnings.length > 0) {
    warnings.slice(0, 5).forEach((warn) => {
      console.log(`  ${colors.yellow}Line ${warn.line}:${colors.reset} ${warn.content.substring(0, 100)}...`);
    });
    if (warnings.length > 5) {
      console.log(`  ${colors.cyan}... and ${warnings.length - 5} more${colors.reset}`);
    }
  }

  // ステップタイミング
  console.log(`\n${colors.bold}${colors.magenta}Top 5 Slowest Steps:${colors.reset}`);
  if (steps.length > 0) {
    steps.slice(0, 5).forEach((step, index) => {
      const seconds = (step.duration / 1000).toFixed(2);
      console.log(`  ${index + 1}. ${step.name} - ${colors.cyan}${seconds}s${colors.reset}`);
    });
  } else {
    console.log(`  ${colors.cyan}No timing information found${colors.reset}`);
  }

  // リソース使用量
  console.log(`\n${colors.bold}${colors.blue}Resource Usage:${colors.reset}`);
  if (resources.memory.length > 0) {
    const totalMem = resources.memory.find(m => m.type === 'total');
    const freeMem = resources.memory.find(m => m.type === 'free');
    if (totalMem && freeMem) {
      const usedPercent = ((totalMem.value - freeMem.value) / totalMem.value * 100).toFixed(1);
      console.log(`  Memory: ${usedPercent}% used (${(totalMem.value - freeMem.value).toFixed(2)}GB / ${totalMem.value.toFixed(2)}GB)`);
    }
  }
  if (resources.disk.length > 0) {
    const maxDiskUsage = Math.max(...resources.disk.map(d => d.usage));
    console.log(`  Disk: ${maxDiskUsage}% used (max observed)`);
  }

  // 推奨事項
  console.log(`\n${colors.bold}${colors.green}Recommendations:${colors.reset}`);
  const recommendations = [];

  if (errors.some(e => e.category === 'Permission')) {
    recommendations.push('- Review GITHUB_TOKEN permissions in workflow or repository settings');
  }
  if (errors.some(e => e.category === 'Cache')) {
    recommendations.push('- Verify cache key patterns and restore-keys configuration');
  }
  if (errors.some(e => e.category === 'Timeout')) {
    recommendations.push('- Consider increasing timeout-minutes or optimizing long-running steps');
  }
  if (steps.length > 0 && steps[0].duration > 600000) { // > 10 minutes
    recommendations.push('- Consider parallelizing or splitting long-running steps');
  }
  if (resources.disk.some(d => d.usage > 80)) {
    recommendations.push('- Clean up workspace or use actions/cache to reduce disk usage');
  }

  if (recommendations.length > 0) {
    recommendations.forEach(rec => console.log(`  ${rec}`));
  } else {
    console.log(`  ${colors.green}No major issues detected!${colors.reset}`);
  }

  console.log(`\n${colors.bold}${colors.cyan}=== End of Report ===${colors.reset}\n`);
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
${colors.bold}GitHub Actions Log Analyzer${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node analyze-logs.mjs <log-file>

${colors.cyan}Example:${colors.reset}
  node analyze-logs.mjs workflow.log
  gh run view <run-id> --log > workflow.log && node analyze-logs.mjs workflow.log

${colors.cyan}Features:${colors.reset}
  - Detects and categorizes errors
  - Extracts warnings
  - Analyzes step execution times
  - Tracks resource usage
  - Provides troubleshooting recommendations
    `);
    process.exit(0);
  }

  const logFile = args[0];

  if (!fs.existsSync(logFile)) {
    console.error(`${colors.red}Error: File not found: ${logFile}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.cyan}Analyzing log file: ${logFile}${colors.reset}`);

  const logContent = readLogFile(logFile);
  const errors = detectErrors(logContent);
  const warnings = detectWarnings(logContent);
  const steps = analyzeStepTiming(logContent);
  const resources = extractResourceUsage(logContent);

  generateReport(logFile, errors, warnings, steps, resources);
}

main();
