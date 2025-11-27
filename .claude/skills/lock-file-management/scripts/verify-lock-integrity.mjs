#!/usr/bin/env node

/**
 * ロックファイル整合性検証スクリプト
 *
 * 使用方法:
 *   node verify-lock-integrity.mjs [options]
 *
 * オプション:
 *   --verbose   : 詳細出力
 *   --fix       : 問題を自動修正
 *   --json      : JSON形式で出力
 *
 * 例:
 *   node verify-lock-integrity.mjs
 *   node verify-lock-integrity.mjs --verbose
 *   node verify-lock-integrity.mjs --fix
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

// コマンドライン引数のパース
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    verbose: args.includes('--verbose') || args.includes('-v'),
    fix: args.includes('--fix'),
    json: args.includes('--json'),
    help: args.includes('--help') || args.includes('-h')
  };
}

// ヘルプメッセージの表示
function showHelp() {
  console.log(`
ロックファイル整合性検証スクリプト

使用方法:
  node verify-lock-integrity.mjs [options]

オプション:
  --verbose, -v   詳細出力
  --fix           問題を自動修正
  --json          JSON形式で出力
  --help, -h      このヘルプを表示

例:
  node verify-lock-integrity.mjs
  node verify-lock-integrity.mjs --verbose
  node verify-lock-integrity.mjs --fix
`);
}

// パッケージマネージャーの検出
function detectPackageManager() {
  if (existsSync('pnpm-lock.yaml')) {
    return { name: 'pnpm', lockfile: 'pnpm-lock.yaml' };
  } else if (existsSync('yarn.lock')) {
    return { name: 'yarn', lockfile: 'yarn.lock' };
  } else if (existsSync('package-lock.json')) {
    return { name: 'npm', lockfile: 'package-lock.json' };
  }
  return null;
}

// package.jsonの読み込み
function readPackageJson() {
  if (!existsSync('package.json')) {
    return null;
  }
  return JSON.parse(readFileSync('package.json', 'utf8'));
}

// ロックファイルの基本情報を取得
function getLockfileInfo(pm) {
  const stats = statSync(pm.lockfile);
  const content = readFileSync(pm.lockfile, 'utf8');

  let version = 'unknown';
  let packageCount = 0;

  if (pm.name === 'pnpm') {
    const versionMatch = content.match(/lockfileVersion:\s*['"]?([^'"\n]+)/);
    version = versionMatch?.[1] || 'unknown';
    // packages セクションのエントリ数をカウント
    const packagesMatch = content.match(/^packages:/m);
    if (packagesMatch) {
      packageCount = (content.match(/^\s{2}[^\s]/gm) || []).length;
    }
  } else if (pm.name === 'npm') {
    const lock = JSON.parse(content);
    version = String(lock.lockfileVersion || 'unknown');
    packageCount = Object.keys(lock.packages || lock.dependencies || {}).length;
  } else if (pm.name === 'yarn') {
    const versionMatch = content.match(/# yarn lockfile v(\d+)/);
    version = versionMatch?.[1] || '1';
    packageCount = (content.match(/^"[^"]+@[^"]+":$/gm) || []).length;
  }

  return {
    version,
    size: stats.size,
    modified: stats.mtime,
    packageCount
  };
}

// ロックファイルとpackage.jsonの同期チェック
function checkSync(pm) {
  const commands = {
    pnpm: 'pnpm install --frozen-lockfile --dry-run 2>&1',
    npm: 'npm ci --dry-run 2>&1',
    yarn: 'yarn install --immutable --check-cache 2>&1'
  };

  try {
    execSync(commands[pm.name], { stdio: 'pipe' });
    return { inSync: true, error: null };
  } catch (error) {
    return { inSync: false, error: error.stderr?.toString() || error.message };
  }
}

// 危険なバージョン指定をチェック
function checkDangerousVersions(pkg) {
  const issues = [];
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.optionalDependencies
  };

  Object.entries(allDeps).forEach(([name, version]) => {
    if (version === '*') {
      issues.push({
        package: name,
        severity: 'error',
        message: 'Wildcard version (*) is dangerous'
      });
    } else if (version === 'latest') {
      issues.push({
        package: name,
        severity: 'error',
        message: '"latest" tag is dangerous'
      });
    } else if (version.startsWith('>') && !version.includes('<')) {
      issues.push({
        package: name,
        severity: 'warning',
        message: 'Open-ended version range without upper bound'
      });
    } else if (version.startsWith('file:') || version.startsWith('link:')) {
      issues.push({
        package: name,
        severity: 'info',
        message: 'Local file dependency'
      });
    }
  });

  return issues;
}

// 重複依存のチェック（pnpmのみ）
function checkDuplicates(pm) {
  if (pm.name !== 'pnpm') {
    return { hasDuplicates: false, output: 'Not supported for this package manager' };
  }

  try {
    execSync('pnpm dedupe --check', { stdio: 'pipe' });
    return { hasDuplicates: false, output: null };
  } catch (error) {
    return { hasDuplicates: true, output: error.stdout?.toString() };
  }
}

// 自動修正
function autoFix(pm) {
  console.log('\n修正を実行中...\n');

  try {
    // ロックファイルを再生成
    const installCommand = {
      pnpm: 'pnpm install',
      npm: 'npm install',
      yarn: 'yarn install'
    };

    execSync(installCommand[pm.name], { stdio: 'inherit' });

    // 重複を解消（pnpmのみ）
    if (pm.name === 'pnpm') {
      try {
        execSync('pnpm dedupe', { stdio: 'inherit' });
      } catch (e) {
        // dedupe が失敗しても継続
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// レポートの生成
function generateReport(pm, lockInfo, syncStatus, versionIssues, duplicates) {
  return {
    timestamp: new Date().toISOString(),
    packageManager: {
      name: pm.name,
      lockfile: pm.lockfile
    },
    lockfileInfo: lockInfo,
    syncStatus: {
      inSync: syncStatus.inSync,
      error: syncStatus.error
    },
    versionIssues: {
      count: versionIssues.length,
      issues: versionIssues
    },
    duplicates: {
      hasDuplicates: duplicates.hasDuplicates
    },
    summary: {
      status: syncStatus.inSync && versionIssues.filter(i => i.severity === 'error').length === 0
        ? 'healthy'
        : 'issues_found',
      errorCount: versionIssues.filter(i => i.severity === 'error').length,
      warningCount: versionIssues.filter(i => i.severity === 'warning').length
    }
  };
}

// コンソール出力
function printReport(report, verbose) {
  console.log('\n========================================');
  console.log('ロックファイル整合性レポート');
  console.log('========================================\n');

  console.log(`パッケージマネージャー: ${report.packageManager.name}`);
  console.log(`ロックファイル: ${report.packageManager.lockfile}`);
  console.log(`ロックファイルバージョン: ${report.lockfileInfo.version}`);
  console.log(`パッケージ数: ${report.lockfileInfo.packageCount}`);
  console.log(`最終更新: ${report.lockfileInfo.modified}`);
  console.log('');

  // 同期状態
  console.log('同期状態:');
  if (report.syncStatus.inSync) {
    console.log('  ✅ package.json と同期済み');
  } else {
    console.log('  ❌ 同期していません');
    if (verbose && report.syncStatus.error) {
      console.log(`  エラー: ${report.syncStatus.error}`);
    }
  }
  console.log('');

  // バージョン問題
  if (report.versionIssues.count > 0) {
    console.log('バージョン指定の問題:');
    report.versionIssues.issues.forEach(issue => {
      const icon = issue.severity === 'error' ? '❌' :
                   issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`  ${icon} ${issue.package}: ${issue.message}`);
    });
    console.log('');
  }

  // 重複
  if (report.duplicates.hasDuplicates) {
    console.log('⚠️  重複した依存関係があります');
    console.log('   pnpm dedupe を実行して解消してください');
    console.log('');
  }

  // サマリー
  console.log('========================================');
  console.log('サマリー');
  console.log('========================================\n');

  const statusIcon = report.summary.status === 'healthy' ? '✅' : '⚠️';
  console.log(`ステータス: ${statusIcon} ${report.summary.status}`);
  console.log(`エラー: ${report.summary.errorCount}`);
  console.log(`警告: ${report.summary.warningCount}`);

  if (report.summary.status !== 'healthy') {
    console.log('\n推奨アクション:');
    if (!report.syncStatus.inSync) {
      console.log('  1. pnpm install を実行してロックファイルを同期');
    }
    if (report.summary.errorCount > 0) {
      console.log('  2. 危険なバージョン指定を修正');
    }
    if (report.duplicates.hasDuplicates) {
      console.log('  3. pnpm dedupe を実行して重複を解消');
    }
  }

  console.log('\n');
}

// メイン処理
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // パッケージマネージャーの検出
  const pm = detectPackageManager();
  if (!pm) {
    console.error('エラー: ロックファイルが見つかりません');
    process.exit(1);
  }

  // package.jsonの読み込み
  const pkg = readPackageJson();
  if (!pkg) {
    console.error('エラー: package.json が見つかりません');
    process.exit(1);
  }

  // 各種チェックの実行
  const lockInfo = getLockfileInfo(pm);
  const syncStatus = checkSync(pm);
  const versionIssues = checkDangerousVersions(pkg);
  const duplicates = checkDuplicates(pm);

  // レポートの生成
  const report = generateReport(pm, lockInfo, syncStatus, versionIssues, duplicates);

  // 出力
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report, options.verbose);
  }

  // 自動修正
  if (options.fix && report.summary.status !== 'healthy') {
    const fixResult = autoFix(pm);
    if (fixResult.success) {
      console.log('✅ 修正が完了しました');
      console.log('   変更内容を確認し、テストを実行してください');
    } else {
      console.log('❌ 修正に失敗しました');
      console.log(`   エラー: ${fixResult.error}`);
    }
  }

  // 終了コード
  process.exit(report.summary.errorCount > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
