#!/usr/bin/env node

/**
 * フレーキーテスト検出スクリプト
 *
 * テストを複数回連続実行し、不安定なテスト（フレーキーテスト）を検出します。
 *
 * 使用法:
 *   node detect-flaky-tests.mjs [options]
 *
 * オプション:
 *   --iterations <number>  実行回数（デフォルト: 10）
 *   --test-file <file>     特定のテストファイルのみ実行
 *   --workers <number>     並列ワーカー数（デフォルト: 4）
 *   --output <file>        結果を保存するファイル（JSON形式）
 *   --threshold <number>   フレーキーと判定する失敗率（0.0-1.0、デフォルト: 0.1）
 *
 * 例:
 *   node detect-flaky-tests.mjs --iterations 20 --workers 4
 *   node detect-flaky-tests.mjs --test-file tests/auth.spec.ts --iterations 50
 *   node detect-flaky-tests.mjs --output flaky-report.json --threshold 0.05
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

class FlakyTestDetector {
  constructor(options = {}) {
    this.iterations = options.iterations || 10;
    this.testFile = options.testFile || null;
    this.workers = options.workers || 4;
    this.outputFile = options.outputFile || null;
    this.threshold = options.threshold || 0.1;
    this.results = new Map();
  }

  /**
   * Playwrightテストを実行
   */
  runTests() {
    const command = this.buildCommand();
    console.log(`Running: ${command}`);

    try {
      const output = execSync(command, {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      return { success: true, output };
    } catch (error) {
      // テスト失敗はエラーとして扱われるが、これは正常な挙動
      return { success: false, output: error.stdout || error.message };
    }
  }

  /**
   * Playwrightコマンドを構築
   */
  buildCommand() {
    let command = 'pnpm playwright test';

    if (this.testFile) {
      command += ` ${this.testFile}`;
    }

    command += ` --workers=${this.workers}`;
    command += ' --reporter=json';

    return command;
  }

  /**
   * テスト結果をパース
   */
  parseResults(output) {
    try {
      // Playwrightのjsonレポートをパース
      const lines = output.split('\n');
      const jsonLine = lines.find((line) => line.trim().startsWith('{'));

      if (!jsonLine) {
        console.warn('No JSON output found, parsing text output instead');
        return this.parseTextOutput(output);
      }

      const report = JSON.parse(jsonLine);

      const testResults = [];
      for (const suite of report.suites || []) {
        for (const spec of suite.specs || []) {
          for (const test of spec.tests || []) {
            testResults.push({
              title: spec.title,
              file: spec.file,
              status: test.status, // passed, failed, skipped, timedOut
              duration: test.results?.[0]?.duration || 0,
              error: test.results?.[0]?.error?.message || null,
            });
          }
        }
      }

      return testResults;
    } catch (error) {
      console.error('Failed to parse JSON output:', error.message);
      return this.parseTextOutput(output);
    }
  }

  /**
   * テキスト出力をパース（フォールバック）
   */
  parseTextOutput(output) {
    const testResults = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // 例: "✓ test name (123ms)"
      if (line.includes('✓') || line.includes('✗')) {
        const status = line.includes('✓') ? 'passed' : 'failed';
        const title = line.replace(/^[✓✗]\s+/, '').replace(/\s+\(\d+ms\)$/, '');
        testResults.push({
          title,
          file: 'unknown',
          status,
          duration: 0,
          error: null,
        });
      }
    }

    return testResults;
  }

  /**
   * テスト結果を集計
   */
  aggregateResults(testResults) {
    for (const test of testResults) {
      const key = `${test.file}::${test.title}`;

      if (!this.results.has(key)) {
        this.results.set(key, {
          file: test.file,
          title: test.title,
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          timedOut: 0,
          durations: [],
          errors: [],
        });
      }

      const stats = this.results.get(key);
      stats.total++;

      switch (test.status) {
        case 'passed':
          stats.passed++;
          break;
        case 'failed':
          stats.failed++;
          if (test.error) stats.errors.push(test.error);
          break;
        case 'skipped':
          stats.skipped++;
          break;
        case 'timedOut':
          stats.timedOut++;
          break;
      }

      if (test.duration > 0) {
        stats.durations.push(test.duration);
      }
    }
  }

  /**
   * フレーキーテストを検出
   */
  detectFlakyTests() {
    const flakyTests = [];

    for (const [key, stats] of this.results.entries()) {
      const failureRate = stats.failed / stats.total;

      if (failureRate > 0 && failureRate < 1 && failureRate >= this.threshold) {
        // 一部失敗、一部成功 = フレーキー
        flakyTests.push({
          ...stats,
          failureRate,
          avgDuration:
            stats.durations.length > 0
              ? stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length
              : 0,
        });
      }
    }

    // 失敗率の高い順にソート
    flakyTests.sort((a, b) => b.failureRate - a.failureRate);

    return flakyTests;
  }

  /**
   * 結果をコンソールに表示
   */
  printResults(flakyTests) {
    console.log('\n' + '='.repeat(80));
    console.log(`Flaky Test Detection Report (${this.iterations} iterations)`);
    console.log('='.repeat(80) + '\n');

    if (flakyTests.length === 0) {
      console.log('✅ No flaky tests detected!');
      console.log(`All tests passed consistently across ${this.iterations} runs.\n`);
      return;
    }

    console.log(`⚠️  Found ${flakyTests.length} potentially flaky test(s):\n`);

    for (const test of flakyTests) {
      console.log(`❌ ${test.title}`);
      console.log(`   File: ${test.file}`);
      console.log(
        `   Failure Rate: ${(test.failureRate * 100).toFixed(1)}% (${test.failed}/${test.total})`
      );
      console.log(`   Avg Duration: ${Math.round(test.avgDuration)}ms`);

      if (test.errors.length > 0) {
        console.log(`   Common Errors:`);
        // エラーメッセージの頻度を集計
        const errorCounts = {};
        for (const error of test.errors) {
          const key = error.split('\n')[0]; // 最初の行のみ
          errorCounts[key] = (errorCounts[key] || 0) + 1;
        }

        const sortedErrors = Object.entries(errorCounts).sort((a, b) => b[1] - a[1]);
        for (const [error, count] of sortedErrors.slice(0, 3)) {
          console.log(`     - (${count}x) ${error}`);
        }
      }

      console.log('');
    }

    console.log('='.repeat(80) + '\n');
  }

  /**
   * 結果をJSONファイルに保存
   */
  saveResults(flakyTests) {
    if (!this.outputFile) return;

    const report = {
      timestamp: new Date().toISOString(),
      iterations: this.iterations,
      workers: this.workers,
      threshold: this.threshold,
      flakyTestsCount: flakyTests.length,
      flakyTests: flakyTests.map((test) => ({
        file: test.file,
        title: test.title,
        total: test.total,
        passed: test.passed,
        failed: test.failed,
        failureRate: test.failureRate,
        avgDuration: test.avgDuration,
        errors: test.errors,
      })),
      allTests: Array.from(this.results.values()).map((test) => ({
        file: test.file,
        title: test.title,
        total: test.total,
        passed: test.passed,
        failed: test.failed,
        failureRate: test.failed / test.total,
      })),
    };

    const outputPath = resolve(process.cwd(), this.outputFile);
    writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`📄 Report saved to: ${outputPath}\n`);
  }

  /**
   * フレーキーテスト検出を実行
   */
  async run() {
    console.log('Starting flaky test detection...\n');
    console.log(`Iterations: ${this.iterations}`);
    console.log(`Workers: ${this.workers}`);
    console.log(`Threshold: ${(this.threshold * 100).toFixed(1)}%`);
    if (this.testFile) {
      console.log(`Test File: ${this.testFile}`);
    }
    console.log('');

    for (let i = 1; i <= this.iterations; i++) {
      process.stdout.write(`\rRunning iteration ${i}/${this.iterations}...`);

      const { success, output } = this.runTests();
      const testResults = this.parseResults(output);
      this.aggregateResults(testResults);
    }

    console.log('\n\nAnalyzing results...\n');

    const flakyTests = this.detectFlakyTests();
    this.printResults(flakyTests);
    this.saveResults(flakyTests);

    // 終了コード: フレーキーテストがある場合は1
    return flakyTests.length > 0 ? 1 : 0;
  }
}

// CLI処理
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    iterations: 10,
    testFile: null,
    workers: 4,
    outputFile: null,
    threshold: 0.1,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--iterations':
        options.iterations = parseInt(args[++i], 10);
        break;
      case '--test-file':
        options.testFile = args[++i];
        break;
      case '--workers':
        options.workers = parseInt(args[++i], 10);
        break;
      case '--output':
        options.outputFile = args[++i];
        break;
      case '--threshold':
        options.threshold = parseFloat(args[++i]);
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
フレーキーテスト検出スクリプト

使用法:
  node detect-flaky-tests.mjs [options]

オプション:
  --iterations <number>  実行回数（デフォルト: 10）
  --test-file <file>     特定のテストファイルのみ実行
  --workers <number>     並列ワーカー数（デフォルト: 4）
  --output <file>        結果を保存するファイル（JSON形式）
  --threshold <number>   フレーキーと判定する失敗率（0.0-1.0、デフォルト: 0.1）
  --help                 このヘルプを表示

例:
  node detect-flaky-tests.mjs --iterations 20 --workers 4
  node detect-flaky-tests.mjs --test-file tests/auth.spec.ts --iterations 50
  node detect-flaky-tests.mjs --output flaky-report.json --threshold 0.05
  `);
}

async function main() {
  try {
    const options = parseArgs();
    const detector = new FlakyTestDetector(options);
    const exitCode = await detector.run();
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

export { FlakyTestDetector };
