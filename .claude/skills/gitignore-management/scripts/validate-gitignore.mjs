#!/usr/bin/env node
/**
 * .gitignore Validation Script
 * .gitignoreファイルの完全性を検証します
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

// 必須パターンの定義
const REQUIRED_PATTERNS = [
  // 環境変数
  { pattern: '.env', category: '環境変数' },
  { pattern: '.env.local', category: '環境変数' },
  { pattern: '!.env.example', category: '環境変数（例外）' },

  // Secret ファイル
  { pattern: '*.key', category: 'Secret ファイル' },
  { pattern: '*.pem', category: 'Secret ファイル' },
  { pattern: 'secrets/', category: 'Secret ディレクトリ' },

  // Node.js
  { pattern: 'node_modules/', category: 'ビルド成果物' },

  // Logs
  { pattern: '*.log', category: 'ログ' },
  { pattern: '/tmp/', category: '一時ファイル' },
];

// 推奨パターン
const RECOMMENDED_PATTERNS = [
  { pattern: '.aws/', category: 'Cloud Provider' },
  { pattern: 'gcp-credentials.json', category: 'Cloud Provider' },
  { pattern: '.railway/', category: 'Platform' },
  { pattern: '.DS_Store', category: 'OS' },
];

async function validateGitignore() {
  console.log('🔍 .gitignore Validation');
  console.log('========================\n');

  const gitignorePath = path.join(PROJECT_ROOT, '.gitignore');

  // .gitignoreファイルの存在確認
  try {
    await fs.access(gitignorePath);
  } catch (error) {
    console.error('❌ .gitignore not found at project root');
    console.error(`   Expected: ${gitignorePath}`);
    process.exit(1);
  }

  // .gitignoreファイル読み込み
  const content = await fs.readFile(gitignorePath, 'utf8');
  const lines = content.split('\n');

  console.log(`✅ .gitignore found: ${gitignorePath}`);
  console.log(`   Total lines: ${lines.length}\n`);

  // 必須パターンチェック
  console.log('📋 Checking required patterns...\n');

  const missing = [];
  const found = [];

  for (const { pattern, category } of REQUIRED_PATTERNS) {
    // コメントと空行を除外して検索
    const isFound = lines.some(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('#') && trimmed === pattern;
    });

    if (isFound) {
      console.log(`  ✅ ${pattern.padEnd(30)} [${category}]`);
      found.push(pattern);
    } else {
      console.log(`  ❌ ${pattern.padEnd(30)} [${category}] - MISSING`);
      missing.push({ pattern, category });
    }
  }

  console.log('');

  // 推奨パターンチェック
  console.log('💡 Checking recommended patterns...\n');

  const missingRecommended = [];

  for (const { pattern, category } of RECOMMENDED_PATTERNS) {
    const isFound = lines.some(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('#') && trimmed.includes(pattern);
    });

    if (isFound) {
      console.log(`  ✅ ${pattern.padEnd(30)} [${category}]`);
    } else {
      console.log(`  ⚠️  ${pattern.padEnd(30)} [${category}] - RECOMMENDED`);
      missingRecommended.push({ pattern, category });
    }
  }

  console.log('');

  // 結果サマリー
  console.log('═══════════════════════════════════════');
  console.log('  Validation Results');
  console.log('═══════════════════════════════════════\n');

  console.log(`Required patterns:`);
  console.log(`  Found: ${found.length}/${REQUIRED_PATTERNS.length}`);
  console.log(`  Missing: ${missing.length}\n`);

  console.log(`Recommended patterns:`);
  console.log(`  Missing: ${missingRecommended.length}/${RECOMMENDED_PATTERNS.length}\n`);

  // 失敗判定
  if (missing.length > 0) {
    console.error('❌ VALIDATION FAILED\n');
    console.error('Missing required patterns:');
    for (const { pattern, category } of missing) {
      console.error(`  - ${pattern} [${category}]`);
    }
    console.error('\nPlease add these patterns to .gitignore');
    process.exit(1);
  }

  // 推奨パターン警告
  if (missingRecommended.length > 0) {
    console.log('⚠️  WARNING: Missing recommended patterns\n');
    for (const { pattern, category } of missingRecommended) {
      console.log(`  - ${pattern} [${category}]`);
    }
    console.log('\nConsider adding these patterns for better security\n');
  }

  console.log('✅ VALIDATION PASSED\n');
  console.log('All required patterns are present in .gitignore');
}

// 実行
validateGitignore().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
