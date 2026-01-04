#!/usr/bin/env node

/**
 * TDDサイクル検証スクリプト
 *
 * テストファイルの構造を解析し、TDDの基本品質をチェックする。
 */

import { readFileSync, existsSync } from 'fs';
import { basename } from 'path';

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

function showHelp() {
  console.log(`
Usage: node scripts/tdd-cycle-validator.mjs --file <path>

Options:
  --file <path>  検証対象のテストファイル
  -h, --help     ヘルプ表示
`);
}

function getArg(args, name) {
  const index = args.indexOf(name);
  return index !== -1 ? args[index + 1] : null;
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(EXIT_VALIDATION_ERROR);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const filePath = getArg(args, '--file');
  if (!filePath) {
    console.error('Error: --file is required');
    process.exit(EXIT_ARGS_ERROR);
  }

  if (!existsSync(filePath)) {
    console.error(`Error: file not found: ${filePath}`);
    process.exit(EXIT_FILE_MISSING);
  }

  const content = readFileSync(filePath, 'utf-8');
  const warnings = [];

  const hasTests = /describe|it|test/.test(content);
  if (!hasTests) {
    fail('test blocks not found');
  }

  const testBlocks = content.match(/(?:it|test)\s*\(['"`][^'"`]+['"`]/g) || [];
  if (testBlocks.length === 0) {
    fail('no test cases found');
  }

  const testNames = testBlocks.map((block) => {
    const match = block.match(/['"`]([^'"`]+)['"`]/);
    return match ? match[1] : '';
  });

  const goodNames = testNames.filter(
    (name) => /should|when|given|returns|throws/.test(name),
  );
  if (goodNames.length < Math.ceil(testNames.length / 2)) {
    warnings.push('test names are not descriptive enough');
  }

  const hasAssertions = /expect\(|assert\.|toBe|toEqual|toHaveBeenCalled/.test(content);
  if (!hasAssertions) {
    fail('assertions not found');
  }

  const hasMocks = /vi\.fn|vi\.mock|vi\.spyOn|jest\.fn|jest\.mock|sinon/.test(
    content,
  );
  if (hasMocks) {
    const mockCount = (
      content.match(/vi\.fn|vi\.mock|vi\.spyOn|jest\.fn|jest\.mock/g) || []
    ).length;
    if (mockCount > 10) {
      warnings.push('too many mocks detected');
    }
  }

  const fileName = basename(filePath);
  if (!fileName.includes('.test.') && !fileName.includes('.spec.')) {
    warnings.push('file name should include .test. or .spec.');
  }

  console.log('✓ tdd cycle validation passed');
  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err?.message || 'Unknown error');
  process.exit(EXIT_ERROR);
});
