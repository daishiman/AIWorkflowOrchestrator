#!/usr/bin/env node

/**
 * スキル使用ログ
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = resolve(__dirname, '..');

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;

function showHelp() {
  console.log(`
Usage: node scripts/log_usage.mjs --result <success|failure> [options]

Options:
  --result <success|failure>  実行結果（必須）
  --phase <name>              実行したPhase名
  --artifact <path>           参照した成果物のパス
  --notes <text>              メモ
  -h, --help                  ヘルプ表示
`);
}

function getArg(args, name) {
  const index = args.indexOf(name);
  return index !== -1 ? args[index + 1] : null;
}

function ensureLogsFile(path) {
  if (!existsSync(path)) {
    writeFileSync(path, '# 実行ログ\n\n', 'utf-8');
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const result = getArg(args, '--result');
  const phase = getArg(args, '--phase') || 'unknown';
  const artifact = getArg(args, '--artifact') || 'n/a';
  const notes = getArg(args, '--notes') || '';

  if (!result || !['success', 'failure'].includes(result)) {
    console.error('Error: --result must be success or failure');
    process.exit(EXIT_ARGS_ERROR);
  }

  const logsPath = resolve(SKILL_DIR, 'LOGS.md');
  ensureLogsFile(logsPath);

  const timestamp = new Date().toISOString();
  const entry = [
    '## 実行記録',
    `- 日時: ${timestamp}`,
    `- Phase: ${phase}`,
    `- 結果: ${result}`,
    `- 成果物: ${artifact}`,
    `- メモ: ${notes || 'なし'}`,
    '',
  ].join('\n');

  try {
    const content = readFileSync(logsPath, 'utf-8');
    writeFileSync(logsPath, `${entry}\n${content}`, 'utf-8');
    console.log('✓ log appended');
    process.exit(EXIT_SUCCESS);
  } catch (err) {
    console.error(`Error: failed to update LOGS.md: ${err.message}`);
    process.exit(EXIT_ERROR);
  }
}

main().catch((err) => {
  console.error(err?.message || 'Unknown error');
  process.exit(EXIT_ERROR);
});
