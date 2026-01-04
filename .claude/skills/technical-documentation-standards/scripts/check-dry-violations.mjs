#!/usr/bin/env node

/**
 * DRY違反検出スクリプト
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

function showHelp() {
  console.log(`
Usage: node scripts/check-dry-violations.mjs --dir <path> [options]

Options:
  --dir <path>            対象ディレクトリ（必須）
  --min-length <number>   最小フレーズ長（既定: 20）
  --min-occurrences <num> 重複回数（既定: 2）
  -h, --help              ヘルプ表示
`);
}

function getArg(args, name) {
  const index = args.indexOf(name);
  return index !== -1 ? args[index + 1] : null;
}

function getAllMarkdownFiles(dir, files = []) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory() && !entry.startsWith('.')) {
      getAllMarkdownFiles(fullPath, files);
    } else if (entry.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractPhrases(content, minLength) {
  const phrases = [];
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith('```') || line.startsWith('    ')) continue;
    if (line.startsWith('#')) continue;
    const trimmed = line.trim();
    if (trimmed.length >= minLength) {
      phrases.push(trimmed);
    }
  }
  return phrases;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const dir = getArg(args, '--dir');
  const minLengthArg = getArg(args, '--min-length');
  const minOccurrencesArg = getArg(args, '--min-occurrences');
  const minLength = minLengthArg ? Number(minLengthArg) : 20;
  const minOccurrences = minOccurrencesArg ? Number(minOccurrencesArg) : 2;

  if (!dir) {
    console.error('Error: --dir is required');
    process.exit(EXIT_ARGS_ERROR);
  }
  if (Number.isNaN(minLength) || minLength <= 0) {
    console.error('Error: --min-length must be a positive number');
    process.exit(EXIT_ARGS_ERROR);
  }
  if (Number.isNaN(minOccurrences) || minOccurrences <= 1) {
    console.error('Error: --min-occurrences must be greater than 1');
    process.exit(EXIT_ARGS_ERROR);
  }

  let files;
  try {
    files = getAllMarkdownFiles(dir);
  } catch {
    console.error(`Error: cannot read directory: ${dir}`);
    process.exit(EXIT_FILE_MISSING);
  }

  const phraseLocations = new Map();
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const phrases = extractPhrases(content, minLength);
    const relativePath = relative(dir, file);
    for (const phrase of phrases) {
      if (!phraseLocations.has(phrase)) {
        phraseLocations.set(phrase, []);
      }
      const locations = phraseLocations.get(phrase);
      if (!locations.includes(relativePath)) {
        locations.push(relativePath);
      }
    }
  }

  const duplicates = [];
  for (const [phrase, locations] of phraseLocations) {
    if (locations.length >= minOccurrences) {
      duplicates.push({ phrase, locations, count: locations.length });
    }
  }

  if (duplicates.length === 0) {
    console.log('✓ no dry violations found');
    process.exit(EXIT_SUCCESS);
  }

  duplicates.sort((a, b) => b.count - a.count);
  console.log(`Found ${duplicates.length} duplicate phrases`);
  duplicates.slice(0, 10).forEach((dup, index) => {
    console.log(`${index + 1}. ${dup.phrase.substring(0, 60)}`);
    dup.locations.forEach((loc) => console.log(`- ${loc}`));
  });

  process.exit(EXIT_VALIDATION_ERROR);
}

main().catch((err) => {
  console.error(err?.message || 'Unknown error');
  process.exit(EXIT_ERROR);
});
