#!/usr/bin/env node

/**
 * Knowledge Validation Script
 * Purpose: Validate knowledge documents against quality standards
 *
 * Usage: node validate-knowledge.mjs <file.md> [file2.md ...]
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function printSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function printError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function printWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

/**
 * Check metadata fields in knowledge document
 */
function checkMetadata(content) {
  console.log('Checking metadata...');
  let errors = 0;

  const requiredMetadata = [
    { field: '## メタデータ', message: 'Missing metadata section' },
    { field: '作成日:', message: 'Missing creation date' },
    { field: '最終更新:', message: 'Missing last updated date' },
    { field: 'バージョン:', message: 'Missing version' }
  ];

  for (const { field, message } of requiredMetadata) {
    if (!content.includes(field)) {
      printError(message);
      errors++;
    }
  }

  if (errors === 0) {
    printSuccess('Metadata complete');
  }

  return { errors, warnings: 0 };
}

/**
 * Check for required sections
 */
function checkRequiredSections(content) {
  console.log('Checking required sections...');
  let errors = 0;

  const requiredSections = [
    '概要',
    'いつ使うか',
    '前提条件',
    'ワークフロー',
    'ベストプラクティス',
    'トラブルシューティング',
    '変更履歴'
  ];

  for (const section of requiredSections) {
    if (!content.includes(`## ${section}`)) {
      printError(`Missing required section: ${section}`);
      errors++;
    }
  }

  if (errors === 0) {
    printSuccess('All required sections present');
  }

  return { errors, warnings: 0 };
}

/**
 * Check file size (500 line limit)
 */
function checkFileSize(content, filePath) {
  console.log('Checking file size...');
  const lines = content.split('\n').length;
  const maxLines = 500;

  if (lines > maxLines) {
    printError(`File exceeds ${maxLines} lines (current: ${lines} lines)`);
    printWarning('Consider splitting into resources');
    return { errors: 1, warnings: 1 };
  }

  printSuccess(`File size OK (${lines} lines)`);
  return { errors: 0, warnings: 0 };
}

/**
 * Check for placeholder content
 */
function checkPlaceholders(content) {
  console.log('Checking for placeholder content...');
  let warnings = 0;

  const placeholders = [
    { pattern: /\[.*?\]/g, name: 'Bracket placeholders' },
    { pattern: /YYYY-MM-DD/g, name: 'Date placeholder' },
    { pattern: /TODO/gi, name: 'TODO marker' },
    { pattern: /TBD/gi, name: 'TBD marker' }
  ];

  for (const { pattern, name } of placeholders) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      printWarning(`Found ${name}: ${matches.length} occurrence(s)`);
      warnings++;
    }
  }

  if (warnings === 0) {
    printSuccess('No placeholders found');
  }

  return { errors: 0, warnings };
}

/**
 * Check for stale content (6 months threshold)
 */
function checkStaleness(content) {
  console.log('Checking staleness...');
  const maxAgeDays = 180;

  const dateMatch = content.match(/最終更新:\s*(\d{4}-\d{2}-\d{2})/);
  if (!dateMatch) {
    printWarning('Last updated date not found or invalid format');
    return { errors: 0, warnings: 1 };
  }

  const lastUpdated = new Date(dateMatch[1]);
  const now = new Date();
  const ageDays = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));

  if (ageDays > maxAgeDays) {
    printWarning(`Content is ${ageDays} days old (> ${maxAgeDays} days) - consider reviewing`);
    return { errors: 0, warnings: 1 };
  }

  printSuccess(`Content is fresh (${ageDays} days old)`);
  return { errors: 0, warnings: 0 };
}

/**
 * Validate a single knowledge file
 */
function validateKnowledgeFile(filePath) {
  console.log('===========================================');
  console.log(`Validating: ${filePath}`);
  console.log('===========================================');

  if (!fs.existsSync(filePath)) {
    printError(`File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  let totalErrors = 0;
  let totalWarnings = 0;

  const checks = [
    checkMetadata(content),
    checkRequiredSections(content),
    checkFileSize(content, filePath),
    checkPlaceholders(content),
    checkStaleness(content)
  ];

  for (const result of checks) {
    totalErrors += result.errors;
    totalWarnings += result.warnings;
  }

  console.log('');
  if (totalErrors === 0) {
    printSuccess(`Validation passed for ${path.basename(filePath)}`);
    if (totalWarnings > 0) {
      printWarning(`${totalWarnings} warning(s) - please review`);
    }
    return true;
  } else {
    printError(`Validation failed with ${totalErrors} error(s) for ${path.basename(filePath)}`);
    return false;
  }
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node validate-knowledge.mjs <knowledge-file.md> [<file2.md> ...]');
    console.log('');
    console.log('Example:');
    console.log('  node validate-knowledge.mjs ./resources/seci-model-details.md');
    process.exit(1);
  }

  let failed = 0;

  for (const file of args) {
    const success = validateKnowledgeFile(file);
    if (!success) {
      failed++;
    }
    console.log('');
  }

  if (failed === 0) {
    console.log(`${colors.green}All validations passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${failed} file(s) failed validation${colors.reset}`);
    process.exit(1);
  }
}

main();
