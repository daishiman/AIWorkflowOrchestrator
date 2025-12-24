#!/usr/bin/env node

/**
 * スキル構造検証スクリプト
 *
 * 必須ファイル、行数制約、EVALS.json の構造を確認します。
 */

import { readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, '..');

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

function showHelp() {
  console.log(`
Usage: node scripts/validate-skill.mjs [options]

Options:
  -h, --help    Show this help message
  `);
}

function getLineCount(path) {
  const content = readFileSync(path, 'utf-8');
  return content.split('
').length;
}

function assertExists(path, label) {
  try {
    statSync(path);
  } catch (err) {
    console.error(`Missing: ${label} (${path})`);
    process.exit(EXIT_FILE_MISSING);
  }
}

function validateLineLimit(path, limit) {
  const count = getLineCount(path);
  if (count > limit) {
    console.error(`Line limit exceeded: ${path} (${count}/${limit})`);
    process.exit(EXIT_VALIDATION_ERROR);
  }
}

function validateEvals(path) {
  try {
    const data = JSON.parse(readFileSync(path, 'utf-8'));
    const required = ['skill_name', 'current_level', 'levels', 'metrics'];
    for (const key of required) {
      if (!(key in data)) {
        throw new Error(`EVALS.json missing ${key}`);
      }
    }
    for (const lvl of ['1', '2', '3', '4']) {
      if (!(lvl in data.levels)) {
        throw new Error(`EVALS.json missing levels.${lvl}`);
      }
    }
    const metrics = ['total_usage_count', 'success_count', 'failure_count', 'average_satisfaction', 'last_evaluated'];
    for (const key of metrics) {
      if (!(key in data.metrics)) {
        throw new Error(`EVALS.json metrics missing ${key}`);
      }
    }
  } catch (err) {
    console.error(`EVALS.json validation error: ${err.message}`);
    process.exit(EXIT_VALIDATION_ERROR);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const requiredFiles = [
    'SKILL.md',
    'EVALS.json',
    'CHANGELOG.md',
    'LOGS.md',
    'scripts/log_usage.mjs',
    'scripts/validate-skill.mjs',
    'resources/Level1_basics.md',
    'resources/Level2_intermediate.md',
    'resources/Level3_advanced.md',
    'resources/Level4_expert.md',
  ];

  for (const file of requiredFiles) {
    assertExists(join(SKILL_DIR, file), file);
  }

  validateLineLimit(join(SKILL_DIR, 'SKILL.md'), 500);
  validateLineLimit(join(SKILL_DIR, 'resources/Level1_basics.md'), 200);
  validateLineLimit(join(SKILL_DIR, 'resources/Level2_intermediate.md'), 300);
  validateLineLimit(join(SKILL_DIR, 'resources/Level3_advanced.md'), 400);
  validateLineLimit(join(SKILL_DIR, 'resources/Level4_expert.md'), 500);

  validateEvals(join(SKILL_DIR, 'EVALS.json'));

  console.log('✓ Skill structure validated');
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
