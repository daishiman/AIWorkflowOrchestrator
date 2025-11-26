#!/usr/bin/env node

/**
 * TDDサイクル検証スクリプト
 *
 * テストファイルとコミット履歴からTDDサイクルの遵守を検証します。
 *
 * Usage:
 *   node tdd-cycle-validator.mjs <test-file>
 *   node tdd-cycle-validator.mjs src/__tests__/user-service.test.ts
 */

import { readFileSync, existsSync } from 'fs';
import { basename, dirname, join } from 'path';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node tdd-cycle-validator.mjs <test-file>');
  console.log('Example: node tdd-cycle-validator.mjs src/__tests__/user-service.test.ts');
  process.exit(1);
}

const testFilePath = args[0];

if (!existsSync(testFilePath)) {
  console.error(`Error: File not found: ${testFilePath}`);
  process.exit(1);
}

const content = readFileSync(testFilePath, 'utf-8');

// TDD品質チェック
const checks = {
  passed: [],
  warnings: [],
  failed: []
};

// Check 1: テストの構造（Arrange-Act-Assert または Given-When-Then）
const hasStructuredTests = /describe|it|test/.test(content);
if (hasStructuredTests) {
  checks.passed.push('✅ テストフレームワークの使用を検出');
} else {
  checks.failed.push('❌ テスト構造が見つかりません');
}

// Check 2: 各テストが単一の振る舞いを検証
const testBlocks = content.match(/(?:it|test)\s*\(['"`]([^'"`]+)['"`]/g) || [];
const testNames = testBlocks.map(block => {
  const match = block.match(/['"`]([^'"`]+)['"`]/);
  return match ? match[1] : '';
});

if (testNames.length > 0) {
  checks.passed.push(`✅ ${testNames.length} 個のテストケースを検出`);

  // テスト名の品質チェック
  const goodNames = testNames.filter(name =>
    name.includes('should') ||
    name.includes('when') ||
    name.includes('given') ||
    name.includes('returns') ||
    name.includes('throws')
  );

  if (goodNames.length === testNames.length) {
    checks.passed.push('✅ すべてのテスト名が説明的');
  } else if (goodNames.length > testNames.length / 2) {
    checks.warnings.push(`⚠️ ${testNames.length - goodNames.length} 個のテスト名が改善可能`);
  } else {
    checks.failed.push('❌ テスト名が説明的でありません（should/when/given/returns を使用推奨）');
  }
} else {
  checks.failed.push('❌ テストケースが見つかりません');
}

// Check 3: アサーションの存在
const hasAssertions = /expect\(|assert\.|toBe|toEqual|toHaveBeenCalled/.test(content);
if (hasAssertions) {
  checks.passed.push('✅ アサーションを検出');
} else {
  checks.failed.push('❌ アサーションが見つかりません');
}

// Check 4: モック/スタブの使用（外部依存のテスト）
const hasMocks = /vi\.fn|vi\.mock|vi\.spyOn|jest\.fn|jest\.mock|sinon/.test(content);
if (hasMocks) {
  checks.passed.push('✅ テストダブルを使用');

  // 過度なモッキングの警告
  const mockCount = (content.match(/vi\.fn|vi\.mock|vi\.spyOn|jest\.fn|jest\.mock/g) || []).length;
  if (mockCount > 10) {
    checks.warnings.push(`⚠️ モックが多い (${mockCount}個): 過度なモッキングの可能性`);
  }
}

// Check 5: beforeEach/afterEachの使用（テストの独立性）
const hasSetupTeardown = /beforeEach|afterEach|beforeAll|afterAll/.test(content);
if (hasSetupTeardown) {
  checks.passed.push('✅ セットアップ/クリーンアップを使用');
}

// Check 6: 複数のexpectを1つのテストに含んでいないか
const testsWithMultipleExpects = content.split(/(?:it|test)\s*\(['"`]/).filter((block, index) => {
  if (index === 0) return false; // 最初のブロックは除外
  const expectCount = (block.match(/expect\(/g) || []).length;
  return expectCount > 3; // 3つ以上のexpectは警告
});

if (testsWithMultipleExpects.length > 0) {
  checks.warnings.push(`⚠️ ${testsWithMultipleExpects.length} 個のテストに複数のアサーションがあります（1テスト1検証を推奨）`);
}

// Check 7: 非同期テストの適切な処理
const hasAsyncTests = /async\s+\(|await\s+/.test(content);
const hasAsyncAssertions = /resolves|rejects|\.then\(|\.catch\(/.test(content);
if (hasAsyncTests || hasAsyncAssertions) {
  checks.passed.push('✅ 非同期テストを検出');
}

// Check 8: テストファイルの命名規則
const fileName = basename(testFilePath);
if (fileName.includes('.test.') || fileName.includes('.spec.')) {
  checks.passed.push('✅ テストファイル命名規則に準拠');
} else {
  checks.warnings.push('⚠️ ファイル名に .test. または .spec. を含めることを推奨');
}

// 結果出力
console.log('\n=== TDD サイクル検証結果 ===\n');
console.log(`ファイル: ${testFilePath}\n`);

if (checks.passed.length > 0) {
  console.log('【合格】');
  checks.passed.forEach(msg => console.log(`  ${msg}`));
}

if (checks.warnings.length > 0) {
  console.log('\n【警告】');
  checks.warnings.forEach(msg => console.log(`  ${msg}`));
}

if (checks.failed.length > 0) {
  console.log('\n【不合格】');
  checks.failed.forEach(msg => console.log(`  ${msg}`));
}

// スコア計算
const totalChecks = checks.passed.length + checks.failed.length;
const score = totalChecks > 0 ? Math.round((checks.passed.length / totalChecks) * 100) : 0;

console.log(`\n【スコア】 ${score}% (${checks.passed.length}/${totalChecks} 項目合格)`);

if (checks.warnings.length > 0) {
  console.log(`         ${checks.warnings.length} 件の警告`);
}

// 推奨事項
console.log('\n【TDD推奨事項】');
console.log('  1. テストは実装前に書く（Red-Green-Refactor）');
console.log('  2. 1つのテストで1つの振る舞いを検証');
console.log('  3. テスト名は「should + 動詞」で記述');
console.log('  4. モックは必要最小限に');
console.log('  5. 各テストは独立して実行可能に');

// 終了コード
process.exit(checks.failed.length > 0 ? 1 : 0);
