#!/usr/bin/env node

/**
 * TDDセッション計画の簡易バリデーション
 */

import { readFileSync, statSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = resolve(__dirname, '..');

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

const REQUIRED_HEADINGS = [
  '## 目的',
  '## テスト候補',
  '## Red-Green-Refactorログ',
  '## 振り返り',
];

function showHelp() {
  console.log(`
Usage: node scripts/validate-tdd-plan.mjs --file <path>

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

function extractSection(lines, heading) {
  const startIndex = lines.findIndex((line) => line.trim() === heading);
  if (startIndex === -1) return [];
  const nextIndex = lines.findIndex(
    (line, idx) => idx > startIndex && line.startsWith('## '),
  );
  const endIndex = nextIndex === -1 ? lines.length : nextIndex;
  return lines.slice(startIndex + 1, endIndex);
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

  const resolvedPath = resolve(SKILL_DIR, filePath);
  assertFile(resolvedPath);

  const content = readFileSync(resolvedPath, 'utf-8');
  const lines = content.split(/\r?\n/);

  const missing = REQUIRED_HEADINGS.filter((heading) => !content.includes(heading));
  if (missing.length > 0) {
    console.error(`Error: missing headings: ${missing.join(', ')}`);
    process.exit(EXIT_VALIDATION_ERROR);
  }

  const candidates = extractSection(lines, '## テスト候補');
  const caseCount = candidates.filter((line) => /^\|\s*TC-/.test(line)).length;
  if (caseCount === 0) {
    console.error('Error: no test cases found in テスト候補');
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log('✓ tdd plan looks valid');
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err?.message || 'Unknown error');
  process.exit(EXIT_ERROR);
});
