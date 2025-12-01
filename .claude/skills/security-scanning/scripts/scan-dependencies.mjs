#!/usr/bin/env node

/**
 * 依存関係脆弱性スキャンスクリプト
 *
 * pnpm/pnpm auditを実行し、結果を解析してレポートを出力します。
 *
 * 使用方法:
 *   node scan-dependencies.mjs
 *   node scan-dependencies.mjs --severity high
 *   node scan-dependencies.mjs --json
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const args = process.argv.slice(2);

function parseArgs() {
  const options = {
    severity: 'moderate', // low, moderate, high, critical
    json: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--severity' || arg === '-s') {
      options.severity = args[++i] || 'moderate';
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function printUsage() {
  console.log(`
依存関係脆弱性スキャン

使用方法:
  node scan-dependencies.mjs [オプション]

オプション:
  --severity, -s <level>  重大度フィルター (low, moderate, high, critical)
                          デフォルト: moderate
  --json                  JSON形式で出力
  --help, -h              このヘルプを表示

例:
  node scan-dependencies.mjs
  node scan-dependencies.mjs --severity high
  node scan-dependencies.mjs --json > report.json
`);
}

function detectPackageManager() {
  if (existsSync('pnpm-lock.yaml')) {
    return 'pnpm';
  }
  if (existsSync('yarn.lock')) {
    return 'yarn';
  }
  if (existsSync('package-lock.json')) {
    return 'pnpm';
  }
  return null;
}

function runAudit(packageManager, severity, jsonOutput) {
  const commands = {
    pnpm: `pnpm audit --audit-level=${severity}${jsonOutput ? ' --json' : ''}`,
    pnpm: `pnpm audit --audit-level=${severity}${jsonOutput ? ' --json' : ''}`,
    yarn: `yarn audit --level ${severity}${jsonOutput ? ' --json' : ''}`,
  };

  const command = commands[packageManager];
  if (!command) {
    throw new Error(`Unsupported package manager: ${packageManager}`);
  }

  try {
    const output = execSync(command, { encoding: 'utf-8' });
    return { success: true, output, exitCode: 0 };
  } catch (error) {
    // audit は脆弱性があると非0で終了するため、出力は取得できる
    return {
      success: false,
      output: error.stdout || error.message,
      exitCode: error.status || 1,
    };
  }
}

function parseAuditOutput(output, packageManager) {
  try {
    const data = JSON.parse(output);

    if (packageManager === 'pnpm' || packageManager === 'pnpm') {
      return {
        vulnerabilities: data.metadata?.vulnerabilities || {},
        advisories: data.advisories || {},
        total:
          Object.values(data.metadata?.vulnerabilities || {}).reduce(
            (a, b) => a + b,
            0
          ) || 0,
      };
    }

    return data;
  } catch {
    return null;
  }
}

function formatSeverity(severity) {
  const colors = {
    critical: '\x1b[31m', // 赤
    high: '\x1b[91m', // 明るい赤
    moderate: '\x1b[33m', // 黄
    low: '\x1b[36m', // シアン
  };
  const reset = '\x1b[0m';
  return `${colors[severity] || ''}${severity.toUpperCase()}${reset}`;
}

function printSummary(result, packageManager) {
  console.log('\n' + '═'.repeat(60));
  console.log('📋 依存関係セキュリティ監査レポート');
  console.log('═'.repeat(60));

  console.log(`\nパッケージマネージャー: ${packageManager}`);

  if (result.parsed) {
    const vulns = result.parsed.vulnerabilities;
    console.log('\n脆弱性サマリー:');
    console.log('─'.repeat(40));

    const levels = ['critical', 'high', 'moderate', 'low'];
    let totalFound = 0;

    for (const level of levels) {
      const count = vulns[level] || 0;
      totalFound += count;
      const status = count > 0 ? '⚠️' : '✅';
      console.log(`  ${status} ${formatSeverity(level)}: ${count}`);
    }

    console.log('─'.repeat(40));
    console.log(`  合計: ${totalFound} 件の脆弱性`);

    if (totalFound === 0) {
      console.log('\n✅ 脆弱性は検出されませんでした！');
    } else {
      console.log('\n⚠️  脆弱性が検出されました。対応を検討してください。');
      console.log('\n推奨アクション:');
      console.log('  1. pnpm audit --fix  # 自動修正を試行');
      console.log('  2. pnpm update       # 依存関係を更新');
      console.log('  3. 手動で影響を確認し、必要に応じてパッケージを更新');
    }
  } else {
    console.log('\n' + result.output);
  }

  console.log('\n' + '═'.repeat(60) + '\n');
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    printUsage();
    process.exit(0);
  }

  // パッケージマネージャーを検出
  const packageManager = detectPackageManager();
  if (!packageManager) {
    console.error('❌ パッケージマネージャーを検出できませんでした。');
    console.error(
      '   pnpm-lock.yaml, yarn.lock, または package-lock.json が必要です。'
    );
    process.exit(1);
  }

  console.log(`🔍 ${packageManager} を使用して依存関係をスキャン中...`);
  console.log(`   重大度フィルター: ${options.severity}`);

  // 監査実行
  const result = runAudit(packageManager, options.severity, true);

  // JSON出力モード
  if (options.json) {
    console.log(result.output);
    process.exit(result.exitCode);
  }

  // 結果をパース
  result.parsed = parseAuditOutput(result.output, packageManager);

  // サマリー表示
  printSummary(result, packageManager);

  // 終了コード
  process.exit(result.exitCode);
}

main().catch((error) => {
  console.error('❌ エラーが発生しました:', error.message);
  process.exit(1);
});
