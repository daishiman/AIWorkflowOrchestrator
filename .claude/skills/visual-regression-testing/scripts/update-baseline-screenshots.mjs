#!/usr/bin/env node

/**
 * ベースラインスクリーンショット更新スクリプト
 *
 * 視覚的回帰テストのベースライン画像を選択的に更新します。
 *
 * 使用法:
 *   node update-baseline-screenshots.mjs [options]
 *
 * オプション:
 *   --test-file <file>     特定のテストファイルのみ更新
 *   --pattern <pattern>    ファイル名パターンで更新対象を指定
 *   --interactive          対話モードで差分を確認しながら更新
 *   --dry-run              実際には更新せず、対象ファイルのみ表示
 *   --backup               更新前にバックアップを作成
 *
 * 例:
 *   node update-baseline-screenshots.mjs --interactive
 *   node update-baseline-screenshots.mjs --test-file tests/visual/homepage.spec.ts
 *   node update-baseline-screenshots.mjs --pattern "homepage-*.png"
 *   node update-baseline-screenshots.mjs --dry-run --backup
 */

import { execSync } from 'child_process';
import { readdirSync, copyFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { resolve, join, relative } from 'path';
import { createInterface } from 'readline';

class BaselineUpdater {
  constructor(options = {}) {
    this.testFile = options.testFile || null;
    this.pattern = options.pattern || null;
    this.interactive = options.interactive || false;
    this.dryRun = options.dryRun || false;
    this.backup = options.backup || false;

    this.baselineDir = 'playwright/screenshots';
    this.actualDir = 'tests-results';
    this.backupDir = 'playwright/screenshots-backup';
  }

  /**
   * メイン処理
   */
  async run() {
    console.log('🔍 Baseline Screenshot Updater\n');

    // ステップ1: テストを実行して差分を生成
    console.log('Step 1: Running visual regression tests...\n');
    this.runTests();

    // ステップ2: 差分画像を検出
    console.log('\nStep 2: Detecting screenshot diffs...\n');
    const diffs = this.detectDiffs();

    if (diffs.length === 0) {
      console.log('✅ No screenshot diffs found. All tests passed!\n');
      return 0;
    }

    console.log(`Found ${diffs.length} screenshot diff(s):\n`);
    diffs.forEach((diff, index) => {
      console.log(`  ${index + 1}. ${diff.name}`);
      console.log(`     Baseline: ${diff.baseline}`);
      console.log(`     Actual:   ${diff.actual}`);
      console.log('');
    });

    if (this.dryRun) {
      console.log('--dry-run mode: No files will be updated.\n');
      return 0;
    }

    // ステップ3: バックアップ作成（必要に応じて）
    if (this.backup) {
      console.log('Step 3: Creating backup...\n');
      this.createBackup(diffs);
    }

    // ステップ4: ベースライン更新
    if (this.interactive) {
      console.log('Step 4: Updating baselines interactively...\n');
      await this.updateInteractively(diffs);
    } else {
      console.log('Step 4: Updating baselines...\n');
      this.updateAll(diffs);
    }

    console.log('\n✅ Baseline update complete!\n');
    return 0;
  }

  /**
   * Playwrightテストを実行
   */
  runTests() {
    let command = 'pnpm playwright test';

    if (this.testFile) {
      command += ` ${this.testFile}`;
    } else {
      command += ' --grep @visual'; // @visualタグのテストのみ
    }

    try {
      execSync(command, {
        stdio: 'inherit',
        encoding: 'utf-8',
      });
    } catch (error) {
      // テスト失敗は想定内（差分があるため）
      console.log('\n⚠️  Some tests failed (expected when there are diffs)');
    }
  }

  /**
   * 差分画像を検出
   */
  detectDiffs() {
    const diffs = [];

    if (!existsSync(this.actualDir)) {
      return diffs;
    }

    const findDiffs = (dir) => {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          findDiffs(fullPath);
        } else if (entry.name.endsWith('-actual.png')) {
          // -actual.pngファイルが見つかった場合、差分がある
          const baseName = entry.name.replace('-actual.png', '.png');

          // パターンフィルタリング
          if (this.pattern && !baseName.includes(this.pattern)) {
            continue;
          }

          const actualPath = fullPath;
          const baselinePath = join(this.baselineDir, baseName);

          diffs.push({
            name: baseName,
            actual: actualPath,
            baseline: baselinePath,
            diff: fullPath.replace('-actual.png', '-diff.png'),
          });
        }
      }
    };

    findDiffs(this.actualDir);

    return diffs;
  }

  /**
   * バックアップを作成
   */
  createBackup(diffs) {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(this.backupDir, timestamp);
    mkdirSync(backupPath, { recursive: true });

    for (const diff of diffs) {
      if (existsSync(diff.baseline)) {
        const backupFile = join(backupPath, diff.name);
        copyFileSync(diff.baseline, backupFile);
        console.log(`  Backed up: ${diff.name}`);
      }
    }

    console.log(`\n✅ Backup created: ${backupPath}\n`);
  }

  /**
   * すべてのベースラインを更新
   */
  updateAll(diffs) {
    for (const diff of diffs) {
      if (existsSync(diff.actual)) {
        copyFileSync(diff.actual, diff.baseline);
        console.log(`  ✅ Updated: ${diff.name}`);
      }
    }

    console.log(`\nUpdated ${diffs.length} baseline(s).`);
  }

  /**
   * 対話的にベースラインを更新
   */
  async updateInteractively(diffs) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let updatedCount = 0;

    for (let i = 0; i < diffs.length; i++) {
      const diff = diffs[i];

      console.log(`\n[${i + 1}/${diffs.length}] ${diff.name}`);
      console.log(`  Baseline: ${diff.baseline}`);
      console.log(`  Actual:   ${diff.actual}`);
      console.log(`  Diff:     ${diff.diff}`);

      // 差分画像を開く（オプション）
      if (existsSync(diff.diff)) {
        console.log('\n  To view the diff image, run:');
        console.log(`  open "${diff.diff}"\n`);
      }

      const answer = await this.question(
        rl,
        '  Update this baseline? (y/n/q to quit): '
      );

      if (answer.toLowerCase() === 'q') {
        console.log('\n⚠️  Quit. Remaining baselines not updated.');
        break;
      }

      if (answer.toLowerCase() === 'y') {
        copyFileSync(diff.actual, diff.baseline);
        console.log('  ✅ Updated');
        updatedCount++;
      } else {
        console.log('  ⏭️  Skipped');
      }
    }

    rl.close();

    console.log(`\nUpdated ${updatedCount}/${diffs.length} baseline(s).`);
  }

  /**
   * ユーザー入力を取得
   */
  question(rl, query) {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  }
}

// CLI処理
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    testFile: null,
    pattern: null,
    interactive: false,
    dryRun: false,
    backup: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--test-file':
        options.testFile = args[++i];
        break;
      case '--pattern':
        options.pattern = args[++i];
        break;
      case '--interactive':
        options.interactive = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--backup':
        options.backup = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
      default:
        console.error(`Unknown option: ${args[i]}`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
ベースラインスクリーンショット更新スクリプト

使用法:
  node update-baseline-screenshots.mjs [options]

オプション:
  --test-file <file>     特定のテストファイルのみ更新
  --pattern <pattern>    ファイル名パターンで更新対象を指定
  --interactive          対話モードで差分を確認しながら更新
  --dry-run              実際には更新せず、対象ファイルのみ表示
  --backup               更新前にバックアップを作成
  --help                 このヘルプを表示

例:
  node update-baseline-screenshots.mjs --interactive
  node update-baseline-screenshots.mjs --test-file tests/visual/homepage.spec.ts
  node update-baseline-screenshots.mjs --pattern "homepage-*.png"
  node update-baseline-screenshots.mjs --dry-run --backup

推奨ワークフロー:
  1. まず --dry-run で対象ファイルを確認
  2. --backup でバックアップを作成
  3. --interactive で差分を確認しながら更新
  4. git diff でベースラインの変更を確認
  5. git commit でコミット
  `);
}

async function main() {
  try {
    const options = parseArgs();
    const updater = new BaselineUpdater(options);
    const exitCode = await updater.run();
    process.exit(exitCode);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// スクリプトとして実行された場合のみmainを実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { BaselineUpdater };
