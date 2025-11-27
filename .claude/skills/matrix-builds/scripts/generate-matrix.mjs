#!/usr/bin/env node

/**
 * GitHub Actions マトリックス設定ジェネレーター
 *
 * Usage:
 *   node generate-matrix.mjs --os "ubuntu,windows,macos" --node "18,20,22"
 *   node generate-matrix.mjs --preset monorepo
 *   node generate-matrix.mjs --custom matrix-config.json
 */

import { readFileSync, existsSync } from 'fs';
import { parseArgs } from 'util';

// ═══════════════════════════════════════════════════════════════
// プリセット設定
// ═══════════════════════════════════════════════════════════════

const PRESETS = {
  basic: {
    os: ['ubuntu-latest', 'windows-latest', 'macos-latest'],
    node: [18, 20, 22]
  },

  minimal: {
    os: ['ubuntu-latest'],
    node: [20]
  },

  'cross-platform': {
    os: ['ubuntu-latest', 'windows-latest', 'macos-latest'],
    node: [20],
    include: [
      { os: 'macos-14', node: 20, arch: 'arm64' }
    ]
  },

  monorepo: {
    os: ['ubuntu-latest', 'windows-latest'],
    node: [18, 20, 22],
    package: ['api', 'web', 'cli', 'sdk']
  },

  browser: {
    os: ['ubuntu-latest'],
    node: [20],
    browser: ['chrome', 'firefox', 'edge'],
    include: [
      { os: 'macos-latest', node: 20, browser: 'safari' }
    ]
  },

  database: {
    db: [
      { type: 'postgres', version: '14', port: 5432 },
      { type: 'postgres', version: '15', port: 5433 },
      { type: 'postgres', version: '16', port: 5434 },
      { type: 'mysql', version: '8.0', port: 3306 },
      { type: 'mysql', version: '8.3', port: 3307 }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════
// コマンドライン引数パース
// ═══════════════════════════════════════════════════════════════

function parseArguments() {
  try {
    const { values } = parseArgs({
      options: {
        os: { type: 'string' },
        node: { type: 'string' },
        browser: { type: 'string' },
        package: { type: 'string' },
        preset: { type: 'string' },
        custom: { type: 'string' },
        'fail-fast': { type: 'boolean', default: false },
        'max-parallel': { type: 'string' },
        include: { type: 'string' },
        exclude: { type: 'string' },
        help: { type: 'boolean' }
      }
    });

    if (values.help) {
      showHelp();
      process.exit(0);
    }

    return values;
  } catch (error) {
    console.error('Error parsing arguments:', error.message);
    showHelp();
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════
// マトリックス生成
// ═══════════════════════════════════════════════════════════════

function generateMatrix(args) {
  let matrix = {};

  // プリセット使用
  if (args.preset) {
    if (!PRESETS[args.preset]) {
      throw new Error(`Unknown preset: ${args.preset}. Available: ${Object.keys(PRESETS).join(', ')}`);
    }
    matrix = { ...PRESETS[args.preset] };
  }
  // カスタムファイル使用
  else if (args.custom) {
    if (!existsSync(args.custom)) {
      throw new Error(`Custom file not found: ${args.custom}`);
    }
    const content = readFileSync(args.custom, 'utf8');
    matrix = JSON.parse(content);
  }
  // 個別オプション
  else {
    if (args.os) {
      matrix.os = args.os.split(',').map(s => s.trim());
    }
    if (args.node) {
      matrix.node = args.node.split(',').map(v => {
        const num = parseInt(v.trim(), 10);
        return isNaN(num) ? v.trim() : num;
      });
    }
    if (args.browser) {
      matrix.browser = args.browser.split(',').map(s => s.trim());
    }
    if (args.package) {
      matrix.package = args.package.split(',').map(s => s.trim());
    }
  }

  // include追加
  if (args.include) {
    try {
      matrix.include = JSON.parse(args.include);
    } catch (error) {
      throw new Error(`Invalid JSON for include: ${error.message}`);
    }
  }

  // exclude追加
  if (args.exclude) {
    try {
      matrix.exclude = JSON.parse(args.exclude);
    } catch (error) {
      throw new Error(`Invalid JSON for exclude: ${error.message}`);
    }
  }

  return matrix;
}

// ═══════════════════════════════════════════════════════════════
// ワークフロー生成
// ═══════════════════════════════════════════════════════════════

function generateWorkflow(matrix, args) {
  const workflow = {
    strategy: {
      matrix
    }
  };

  // fail-fast設定
  if (args['fail-fast'] !== undefined) {
    workflow.strategy['fail-fast'] = args['fail-fast'];
  }

  // max-parallel設定
  if (args['max-parallel']) {
    workflow.strategy['max-parallel'] = parseInt(args['max-parallel'], 10);
  }

  return workflow;
}

// ═══════════════════════════════════════════════════════════════
// マトリックス統計
// ═══════════════════════════════════════════════════════════════

function calculateStats(matrix) {
  const dimensions = Object.keys(matrix).filter(k => !['include', 'exclude'].includes(k));

  // 基本ジョブ数
  let jobCount = 1;
  dimensions.forEach(dim => {
    if (Array.isArray(matrix[dim])) {
      jobCount *= matrix[dim].length;
    }
  });

  // exclude分を減算
  if (matrix.exclude && Array.isArray(matrix.exclude)) {
    jobCount -= matrix.exclude.length;
  }

  // includeで追加される組み合わせ
  if (matrix.include && Array.isArray(matrix.include)) {
    // includeが既存組み合わせにプロパティ追加するだけか、新規組み合わせか判定
    const newCombinations = matrix.include.filter(inc => {
      // すべてのdimensionが含まれているかチェック
      return dimensions.every(dim => inc.hasOwnProperty(dim));
    });
    jobCount += newCombinations.length;
  }

  return {
    dimensions: dimensions.length,
    dimensionNames: dimensions,
    baseJobs: jobCount,
    excluded: matrix.exclude?.length || 0,
    included: matrix.include?.length || 0,
    totalJobs: jobCount
  };
}

// ═══════════════════════════════════════════════════════════════
// ヘルプ表示
// ═══════════════════════════════════════════════════════════════

function showHelp() {
  console.log(`
GitHub Actions Matrix Generator

Usage:
  node generate-matrix.mjs [options]

Options:
  --os <list>           Comma-separated OS list (e.g., "ubuntu-latest,windows-latest")
  --node <list>         Comma-separated Node.js versions (e.g., "18,20,22")
  --browser <list>      Comma-separated browser list
  --package <list>      Comma-separated package list (for monorepo)
  --preset <name>       Use preset configuration
  --custom <file>       Load custom matrix from JSON file
  --fail-fast <bool>    Enable/disable fail-fast (default: false)
  --max-parallel <num>  Maximum parallel jobs
  --include <json>      Add include configurations (JSON array)
  --exclude <json>      Add exclude configurations (JSON array)
  --help                Show this help

Presets:
  basic               Multi-OS + Multi-Node (9 jobs)
  minimal             Single OS + Single Node (1 job)
  cross-platform      Cross-platform with ARM64 (4 jobs)
  monorepo            Monorepo with multiple packages (24 jobs)
  browser             Browser testing matrix (4 jobs)
  database            Database versions matrix (5 jobs)

Examples:
  # カスタムマトリックス
  node generate-matrix.mjs --os "ubuntu-latest,windows-latest" --node "18,20,22"

  # プリセット使用
  node generate-matrix.mjs --preset monorepo

  # include/exclude使用
  node generate-matrix.mjs --preset basic --exclude '[{"os":"windows-latest","node":18}]'

  # 並列度制限
  node generate-matrix.mjs --preset browser --max-parallel 2 --fail-fast false

  # カスタムファイル
  node generate-matrix.mjs --custom ./matrix-config.json
`);
}

// ═══════════════════════════════════════════════════════════════
// メイン処理
// ═══════════════════════════════════════════════════════════════

function main() {
  try {
    const args = parseArguments();

    // マトリックス生成
    const matrix = generateMatrix(args);

    if (Object.keys(matrix).length === 0) {
      console.error('Error: No matrix configuration provided. Use --preset, --custom, or individual options.');
      showHelp();
      process.exit(1);
    }

    // ワークフロー生成
    const workflow = generateWorkflow(matrix, args);

    // 統計情報
    const stats = calculateStats(matrix);

    // JSON出力（GitHub Actions用）
    console.log(JSON.stringify(matrix));

    // 統計情報（stderr経由でGitHub Actions Summaryへ）
    console.error('\n=== Matrix Statistics ===');
    console.error(`Dimensions: ${stats.dimensions} (${stats.dimensionNames.join(', ')})`);
    console.error(`Total Jobs: ${stats.totalJobs}`);
    if (stats.excluded > 0) console.error(`Excluded: ${stats.excluded}`);
    if (stats.included > 0) console.error(`Included: ${stats.included}`);
    if (args['max-parallel']) console.error(`Max Parallel: ${args['max-parallel']}`);
    console.error('=========================\n');

    // ワークフロー例（stderr経由）
    console.error('Example workflow usage:');
    console.error('```yaml');
    console.error('jobs:');
    console.error('  generate-matrix:');
    console.error('    runs-on: ubuntu-latest');
    console.error('    outputs:');
    console.error('      matrix: ${{ steps.set-matrix.outputs.matrix }}');
    console.error('    steps:');
    console.error('      - id: set-matrix');
    console.error('        run: |');
    console.error(`          MATRIX=$(node generate-matrix.mjs ${process.argv.slice(2).join(' ')})`);
    console.error('          echo "matrix=$MATRIX" >> $GITHUB_OUTPUT');
    console.error('');
    console.error('  test:');
    console.error('    needs: generate-matrix');
    console.error('    strategy:');
    console.error('      matrix: ${{ fromJSON(needs.generate-matrix.outputs.matrix) }}');
    console.error('```');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════
// 実行
// ═══════════════════════════════════════════════════════════════

main();
