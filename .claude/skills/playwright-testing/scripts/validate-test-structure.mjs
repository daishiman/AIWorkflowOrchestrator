#!/usr/bin/env node

/**
 * Playwrightテスト構造検証スクリプト
 *
 * 使用法:
 *   node validate-test-structure.mjs <test-file.spec.ts>
 *
 * 検証項目:
 * - テストファイルの構文チェック
 * - describe/testブロックの構造検証
 * - セレクタ戦略の妥当性チェック
 * - 待機戦略のアンチパターン検出
 * - ベストプラクティス違反の検出
 */

import fs from 'fs';
import path from 'path';

// カラー出力
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

class TestStructureValidator {
  constructor(filePath) {
    this.filePath = filePath;
    this.content = '';
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
  }

  async validate() {
    console.log(`${colors.blue}Playwrightテスト構造検証開始: ${this.filePath}${colors.reset}\n`);

    // ファイル存在チェック
    if (!fs.existsSync(this.filePath)) {
      this.errors.push(`ファイルが見つかりません: ${this.filePath}`);
      return this.report();
    }

    // ファイル読み込み
    this.content = fs.readFileSync(this.filePath, 'utf-8');

    // 各種検証実行
    this.validateImports();
    this.validateDescribeBlocks();
    this.validateTestBlocks();
    this.validateSelectors();
    this.validateWaitingStrategies();
    this.validateAssertions();
    this.validateHooks();
    this.validateBestPractices();

    return this.report();
  }

  validateImports() {
    // 必須インポートチェック
    if (!this.content.includes("from '@playwright/test'")) {
      this.errors.push("@playwright/testからのインポートが見つかりません");
    }

    // test, expectのインポート確認
    const importMatch = this.content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@playwright\/test['"]/);
    if (importMatch) {
      const imports = importMatch[1].split(',').map(s => s.trim());
      if (!imports.includes('test')) {
        this.warnings.push("'test'がインポートされていません");
      }
      if (!imports.includes('expect')) {
        this.warnings.push("'expect'がインポートされていません");
      }
    }
  }

  validateDescribeBlocks() {
    // describe blockの検出
    const describeBlocks = this.content.match(/test\.describe\(['"](.*?)['"],/g);
    if (!describeBlocks || describeBlocks.length === 0) {
      this.warnings.push("test.describeブロックが見つかりません（テストを整理することを推奨）");
    }

    // describe名の品質チェック
    if (describeBlocks) {
      describeBlocks.forEach(block => {
        const name = block.match(/test\.describe\(['"](.*?)['"]/)[1];
        if (name.length < 3) {
          this.warnings.push(`describeブロック名が短すぎます: "${name}"`);
        }
      });
    }
  }

  validateTestBlocks() {
    // testブロックの検出
    const testBlocks = this.content.match(/test\(['"](.*?)['"],/g);
    if (!testBlocks || testBlocks.length === 0) {
      this.errors.push("testブロックが見つかりません");
      return;
    }

    // test名の品質チェック
    testBlocks.forEach(block => {
      const name = block.match(/test\(['"](.*?)['"]/)[1];

      // 短すぎる名前
      if (name.length < 5) {
        this.warnings.push(`テスト名が短すぎます: "${name}"`);
      }

      // 動詞で始まるかチェック（推奨）
      const goodVerbs = ['should', 'displays', 'shows', 'validates', 'creates', 'updates', 'deletes'];
      const startsWithVerb = goodVerbs.some(verb => name.toLowerCase().startsWith(verb));
      if (!startsWithVerb) {
        this.suggestions.push(`テスト名は動詞で始めることを推奨: "${name}"`);
      }
    });
  }

  validateSelectors() {
    const lines = this.content.split('\n');

    lines.forEach((line, index) => {
      // CSSセレクタの使用検出
      const cssSelectors = [
        /locator\(['"]\.[a-zA-Z-_]+/,  // .classname
        /locator\(['"]#[a-zA-Z-_]+/,   // #id
        /locator\(['"]\w+\.[a-zA-Z-_]/ // tag.class
      ];

      cssSelectors.forEach(regex => {
        if (regex.test(line)) {
          this.warnings.push(
            `行${index + 1}: CSSセレクタの使用を避け、getByRole/getByTestId等を使用してください\n  → ${line.trim()}`
          );
        }
      });

      // data-testidの推奨パターンチェック
      if (line.includes('getByTestId')) {
        const match = line.match(/getByTestId\(['"](.*?)['"]/);
        if (match) {
          const testId = match[1];
          // kebab-case推奨
          if (!/^[a-z]+(-[a-z]+)*$/.test(testId)) {
            this.suggestions.push(
              `行${index + 1}: data-testidはkebab-caseを推奨: "${testId}"`
            );
          }
        }
      }
    });
  }

  validateWaitingStrategies() {
    const lines = this.content.split('\n');

    lines.forEach((line, index) => {
      // waitForTimeout検出（アンチパターン）
      if (line.includes('waitForTimeout')) {
        this.errors.push(
          `行${index + 1}: waitForTimeout()は使用禁止。条件ベースの待機を使用してください\n  → ${line.trim()}`
        );
      }

      // 過度なnetworkidle使用
      if (line.includes("waitForLoadState('networkidle')")) {
        this.warnings.push(
          `行${index + 1}: networkidleは必要な場合のみ使用してください（遅い）\n  → ${line.trim()}`
        );
      }

      // sleep検出
      if (line.includes('sleep') || line.includes('setTimeout')) {
        this.errors.push(
          `行${index + 1}: sleep/setTimeoutは使用禁止\n  → ${line.trim()}`
        );
      }
    });
  }

  validateAssertions() {
    const lines = this.content.split('\n');

    lines.forEach((line, index) => {
      // expect使用チェック
      if (line.includes('expect(')) {
        // toBeVisible等の明示的アサーション推奨
        const hasExplicitAssertion = [
          'toBeVisible',
          'toBeHidden',
          'toHaveText',
          'toHaveValue',
          'toBeEnabled',
          'toBeDisabled',
          'toHaveURL',
          'toHaveCount'
        ].some(assertion => line.includes(assertion));

        if (!hasExplicitAssertion && line.includes('expect(page')) {
          this.suggestions.push(
            `行${index + 1}: 明示的なアサーションを使用することを推奨\n  → ${line.trim()}`
          );
        }
      }
    });

    // テストブロック内にexpectがあるかチェック
    const testBlockMatches = this.content.matchAll(/test\(['"].*?['"],\s*async\s*\(\{[^}]*\}\)\s*=>\s*\{([\s\S]*?)\n\}\);/g);
    for (const match of testBlockMatches) {
      const testBody = match[1];
      if (!testBody.includes('expect(')) {
        this.warnings.push("テストブロックにアサーションが見つかりません");
      }
    }
  }

  validateHooks() {
    // beforeEach/afterEachの使用推奨
    const hasBeforeEach = this.content.includes('beforeEach');
    const hasAfterEach = this.content.includes('afterEach');

    if (!hasBeforeEach && this.content.split('test(').length > 2) {
      this.suggestions.push(
        "複数のテストがある場合、beforeEachフックでセットアップを共通化することを推奨"
      );
    }

    if (hasBeforeEach && !hasAfterEach) {
      this.suggestions.push(
        "beforeEachがある場合、afterEachでクリーンアップすることを推奨"
      );
    }
  }

  validateBestPractices() {
    // Page Object Modelの使用推奨（大規模テスト向け）
    const testCount = (this.content.match(/test\(/g) || []).length;
    if (testCount > 5 && !this.content.includes('class') && !this.content.includes('Page')) {
      this.suggestions.push(
        "テスト数が多い場合、Page Object Modelの使用を検討してください"
      );
    }

    // タイムアウト設定の確認
    if (!this.content.includes('timeout')) {
      this.suggestions.push(
        "カスタムタイムアウトの設定を検討してください（playwright.config.tsまたはtest.setTimeout()）"
      );
    }

    // 並列実行の考慮
    if (!this.content.includes('fullyParallel') && testCount > 3) {
      this.suggestions.push(
        "test.describe.configure({ mode: 'parallel' })で並列実行を検討してください"
      );
    }
  }

  report() {
    console.log('='.repeat(60));
    console.log('検証結果');
    console.log('='.repeat(60));

    // エラー表示
    if (this.errors.length > 0) {
      console.log(`\n${colors.red}❌ エラー (${this.errors.length}件):${colors.reset}`);
      this.errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err}`);
      });
    }

    // 警告表示
    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}⚠️  警告 (${this.warnings.length}件):${colors.reset}`);
      this.warnings.forEach((warn, i) => {
        console.log(`${i + 1}. ${warn}`);
      });
    }

    // 提案表示
    if (this.suggestions.length > 0) {
      console.log(`\n${colors.blue}💡 提案 (${this.suggestions.length}件):${colors.reset}`);
      this.suggestions.forEach((sug, i) => {
        console.log(`${i + 1}. ${sug}`);
      });
    }

    // サマリー
    console.log('\n' + '='.repeat(60));
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(`${colors.green}✅ 検証成功！ 重大な問題は見つかりませんでした。${colors.reset}`);
      return 0;
    } else if (this.errors.length > 0) {
      console.log(`${colors.red}❌ 検証失敗: ${this.errors.length}件のエラーがあります${colors.reset}`);
      return 1;
    } else {
      console.log(`${colors.yellow}⚠️  検証完了: ${this.warnings.length}件の警告があります${colors.reset}`);
      return 0;
    }
  }
}

// メイン実行
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('使用法: node validate-test-structure.mjs <test-file.spec.ts>');
  process.exit(1);
}

const validator = new TestStructureValidator(args[0]);
validator.validate().then(exitCode => {
  process.exit(exitCode);
});
