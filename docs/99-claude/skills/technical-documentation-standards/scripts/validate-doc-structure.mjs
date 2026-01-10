#!/usr/bin/env node

/**
 * 文書構造の簡易バリデーション
 */

import { readFileSync, statSync } from 'fs';

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

const REQUIRED_HEADINGS = [
  '## 1. 目的',
  '## 2. 背景',
  '## 3. 範囲',
  '## 4. 用語定義',
  '## 5. 要求事項',
  '## 6. 制約',
  '## 7. 受け入れ条件',
];

function showHelp() {
  console.log(`
Usage: node scripts/validate-doc-structure.mjs --file <path>

Options:
  --file <path>  検証対象のMarkdownファイル
  -h, --help     ヘルプ表示
`);
}

function getArg(args, name) {
  const index = args.indexOf(name);
  return index !== -1 ? args[index + 1] : null;
}

function assertFile(path) {
  try {
    statSync(path);
  } catch {
    console.error(`Error: file not found: ${path}`);
    process.exit(EXIT_FILE_MISSING);
  }
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

  assertFile(filePath);
  const content = readFileSync(filePath, 'utf-8');

  const missing = REQUIRED_HEADINGS.filter((heading) => !content.includes(heading));
  if (missing.length > 0) {
    console.error(`Error: missing headings: ${missing.join(', ')}`);
    process.exit(EXIT_VALIDATION_ERROR);
  }

  const hasFunctional = /FR-\d+/.test(content);
  const hasNonFunctional = /NFR-\d+/.test(content);
  if (!hasFunctional && !hasNonFunctional) {
    console.error('Error: no FR-/NFR- requirements found');
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log('✓ document structure looks valid');
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err?.message || 'Unknown error');
  process.exit(EXIT_ERROR);
});
