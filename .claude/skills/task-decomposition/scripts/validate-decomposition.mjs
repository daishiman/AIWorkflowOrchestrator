#!/usr/bin/env node

/**
 * タスク分解計画の簡易バリデーション
 *
 * 必須セクションと最小タスク数をチェックする。
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
  '## スコープ',
  '## 前提・制約',
  '## 分解タスク',
  '## 依存関係と順序',
  '## リスクと対策',
  '## 検証項目',
];

function showHelp() {
  console.log(`
Usage: node scripts/validate-decomposition.mjs --file <path> [--min-tasks <number>]

Options:
  --file <path>       検証対象のMarkdownファイル
  --min-tasks <num>   最小タスク数（既定: 3）
  -h, --help          ヘルプ表示
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

function countTasks(sectionLines) {
  return sectionLines.filter((line) => /^\|\s*T-/.test(line) || /^-\s/.test(line)).length;
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
  const minTasksArg = getArg(args, '--min-tasks');
  const minTasks = minTasksArg ? Number(minTasksArg) : 3;

  if (!filePath) {
    console.error('Error: --file is required');
    process.exit(EXIT_ARGS_ERROR);
  }

  if (Number.isNaN(minTasks) || minTasks <= 0) {
    console.error('Error: --min-tasks must be a positive number');
    process.exit(EXIT_ARGS_ERROR);
  }

  const resolvedPath = resolve(SKILL_DIR, filePath);
  assertFile(resolvedPath);

  const content = readFileSync(resolvedPath, 'utf-8');
  const lines = content.split(/\r?\n/);

  const missingHeadings = REQUIRED_HEADINGS.filter(
    (heading) => !content.includes(heading),
  );

  if (missingHeadings.length > 0) {
    console.error(`Error: missing headings: ${missingHeadings.join(', ')}`);
    process.exit(EXIT_VALIDATION_ERROR);
  }

  const taskSection = extractSection(lines, '## 分解タスク');
  const taskCount = countTasks(taskSection);

  if (taskCount < minTasks) {
    console.error(`Error: task count is ${taskCount}, expected >= ${minTasks}`);
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log('✓ decomposition plan looks valid');
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err?.message || 'Unknown error');
  process.exit(EXIT_ERROR);
});
