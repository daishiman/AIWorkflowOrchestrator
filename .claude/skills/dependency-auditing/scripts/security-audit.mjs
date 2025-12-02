#!/usr/bin/env node

/**
 * セキュリティ監査スクリプト
 *
 * 使用方法:
 *   node security-audit.mjs [options]
 *
 * オプション:
 *   --fix     : 自動修正を試行
 *   --json    : JSON形式で出力
 *   --level   : 最小重大度レベル (low, moderate, high, critical)
 *   --prod    : 本番依存のみをスキャン
 *
 * 例:
 *   node security-audit.mjs --json
 *   node security-audit.mjs --level high --prod
 *   node security-audit.mjs --fix
 */

import { execSync, spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// コマンドライン引数のパース
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    fix: args.includes('--fix'),
    json: args.includes('--json'),
    level: args.find((arg, i) => args[i - 1] === '--level') || 'low',
    prod: args.includes('--prod'),
    help: args.includes('--help') || args.includes('-h')
  };
}

// ヘルプメッセージの表示
function showHelp() {
  console.log(`
セキュリティ監査スクリプト

使用方法:
  node security-audit.mjs [options]

オプション:
  --fix       自動修正を試行
  --json      JSON形式で出力
  --level     最小重大度レベル (low, moderate, high, critical)
  --prod      本番依存のみをスキャン
  --help, -h  このヘルプを表示

例:
  node security-audit.mjs --json
  node security-audit.mjs --level high --prod
  node security-audit.mjs --fix
`);
}

// パッケージマネージャーの検出
function detectPackageManager() {
  if (existsSync('pnpm-lock.yaml')) {
    return 'pnpm';
  } else if (existsSync('yarn.lock')) {
    return 'yarn';
  } else if (existsSync('package-lock.json')) {
    return 'pnpm';
  }
  return 'pnpm'; // デフォルト
}

// 監査コマンドの構築
function buildAuditCommand(pm, options) {
  const commands = {
    pnpm: ['pnpm', 'audit'],
    yarn: ['yarn', 'audit'],
    pnpm: ['pnpm', 'audit']
  };

  const cmd = commands[pm];

  if (options.json) {
    cmd.push('--json');
  }

  if (options.prod) {
    if (pm === 'pnpm') {
      cmd.push('--prod');
    } else if (pm === 'pnpm') {
      cmd.push('--production');
    }
  }

  if (options.level !== 'low') {
    if (pm === 'pnpm' || pm === 'pnpm') {
      cmd.push(`--audit-level=${options.level}`);
    } else if (pm === 'yarn') {
      cmd.push(`--level=${options.level}`);
    }
  }

  return cmd;
}

// 監査結果のパース
function parseAuditResult(output, pm) {
  try {
    const result = JSON.parse(output);

    if (pm === 'pnpm' || pm === 'pnpm') {
      return {
        vulnerabilities: result.metadata?.vulnerabilities || {},
        advisories: result.advisories || {},
        total: result.metadata?.totalDependencies || 0
      };
    } else if (pm === 'yarn') {
      // Yarn の出力形式に対応
      return {
        vulnerabilities: result.data?.vulnerabilities || {},
        advisories: {},
        total: result.data?.totalDependencies || 0
      };
    }
  } catch (e) {
    return null;
  }
}

// 重大度の色付け
function colorize(severity) {
  const colors = {
    critical: '\x1b[31m', // 赤
    high: '\x1b[33m',     // 黄
    moderate: '\x1b[36m', // シアン
    low: '\x1b[37m',      // 白
    info: '\x1b[90m'      // グレー
  };
  const reset = '\x1b[0m';
  return `${colors[severity] || ''}${severity}${reset}`;
}

// サマリーの表示
function displaySummary(result) {
  console.log('\n========================================');
  console.log('セキュリティ監査サマリー');
  console.log('========================================\n');

  const vuln = result.vulnerabilities;
  const total = (vuln.critical || 0) + (vuln.high || 0) +
                (vuln.moderate || 0) + (vuln.low || 0);

  console.log(`総依存関係数: ${result.total}`);
  console.log(`脆弱性総数: ${total}\n`);

  console.log('重大度別:');
  console.log(`  ${colorize('critical')} Critical: ${vuln.critical || 0}`);
  console.log(`  ${colorize('high')} High: ${vuln.high || 0}`);
  console.log(`  ${colorize('moderate')} Moderate: ${vuln.moderate || 0}`);
  console.log(`  ${colorize('low')} Low: ${vuln.low || 0}`);

  // リスク評価
  console.log('\nリスク評価:');
  if (vuln.critical > 0) {
    console.log('  🔴 即座の対応が必要です');
  } else if (vuln.high > 0) {
    console.log('  🟠 早急な対応を推奨します');
  } else if (vuln.moderate > 0) {
    console.log('  🟡 計画的な対応を推奨します');
  } else if (vuln.low > 0) {
    console.log('  🟢 次回リリースでの対応を検討してください');
  } else {
    console.log('  ✅ 脆弱性は検出されませんでした');
  }

  return total;
}

// アドバイザリーの表示
function displayAdvisories(advisories) {
  const entries = Object.entries(advisories);
  if (entries.length === 0) return;

  console.log('\n========================================');
  console.log('検出された脆弱性の詳細');
  console.log('========================================\n');

  entries.forEach(([id, advisory]) => {
    console.log(`--- ${advisory.module_name} ---`);
    console.log(`  ID: ${id}`);
    console.log(`  重大度: ${colorize(advisory.severity)}`);
    console.log(`  タイトル: ${advisory.title}`);
    console.log(`  パッチ版: ${advisory.patched_versions || '不明'}`);
    console.log(`  詳細: ${advisory.url || 'N/A'}`);
    console.log('');
  });
}

// 自動修正の実行
function runAutoFix(pm) {
  console.log('\n========================================');
  console.log('自動修正を実行中...');
  console.log('========================================\n');

  const fixCommands = {
    pnpm: 'pnpm audit --fix',
    pnpm: 'pnpm audit fix',
    yarn: 'yarn audit fix'
  };

  try {
    const output = execSync(fixCommands[pm], {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(output);
    console.log('✅ 自動修正が完了しました');
    console.log('📝 変更内容を確認し、テストを実行してください');
  } catch (error) {
    console.log('⚠️  自動修正中にエラーが発生しました:');
    console.log(error.stdout || error.message);
    console.log('\n手動での対応が必要な場合があります');
  }
}

// 推奨アクションの表示
function displayRecommendations(result) {
  const vuln = result.vulnerabilities;

  console.log('\n========================================');
  console.log('推奨アクション');
  console.log('========================================\n');

  if (vuln.critical > 0 || vuln.high > 0) {
    console.log('1. 以下のコマンドで詳細を確認:');
    console.log('   pnpm audit');
    console.log('');
    console.log('2. 自動修正を試行:');
    console.log('   pnpm audit --fix');
    console.log('');
    console.log('3. 手動対応が必要な場合:');
    console.log('   - CHANGELOGを確認');
    console.log('   - 影響範囲を調査');
    console.log('   - テスト環境で検証');
  } else if (vuln.moderate > 0 || vuln.low > 0) {
    console.log('1. 定期的な依存関係更新を推奨');
    console.log('   pnpm update');
    console.log('');
    console.log('2. 次回リリースで対応を検討');
  } else {
    console.log('✅ 特別なアクションは不要です');
    console.log('   定期的な監査を継続してください');
  }
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
  console.log(`検出されたパッケージマネージャー: ${pm}`);

  // package.jsonの存在確認
  if (!existsSync('package.json')) {
    console.error('エラー: package.json が見つかりません');
    process.exit(1);
  }

  // 監査コマンドの構築と実行
  const cmd = buildAuditCommand(pm, { ...options, json: true });
  console.log(`実行コマンド: ${cmd.join(' ')}`);

  let output;
  try {
    output = execSync(cmd.join(' '), {
      encoding: 'utf8',
      stdio: 'pipe'
    });
  } catch (error) {
    // audit コマンドは脆弱性があると非ゼロで終了するため、
    // stdout を取得する
    output = error.stdout || '';
  }

  // JSON出力モード
  if (options.json && !options.fix) {
    console.log(output);
    process.exit(0);
  }

  // 結果のパース
  const result = parseAuditResult(output, pm);

  if (!result) {
    console.log('監査結果のパースに失敗しました');
    console.log('生の出力:');
    console.log(output);
    process.exit(1);
  }

  // サマリーの表示
  const totalVulnerabilities = displaySummary(result);

  // アドバイザリーの表示
  displayAdvisories(result.advisories);

  // 自動修正
  if (options.fix && totalVulnerabilities > 0) {
    runAutoFix(pm);
  }

  // 推奨アクション
  displayRecommendations(result);

  console.log('\n========================================');
  console.log('監査完了');
  console.log('========================================\n');

  // 終了コード
  if (result.vulnerabilities.critical > 0) {
    process.exit(2);
  } else if (result.vulnerabilities.high > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
