#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

function validateSkill(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const errors = [];
  const warnings = [];

  // Check YAML frontmatter
  if (!content.startsWith('---')) {
    errors.push('Missing YAML frontmatter');
  }

  // Check required fields
  const requiredFields = ['name', 'description', 'version'];
  requiredFields.forEach(field => {
    if (!content.includes(`${field}:`)) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Check 500-line limit
  if (lines.length > 500) {
    warnings.push(`File exceeds 500 lines (${lines.length} lines)`);
  }

  // Report results
  console.log('\n' + '='.repeat(60));
  console.log('📋 Skill Validation Report');
  console.log('='.repeat(60));
  console.log(`\nFile: ${filePath}`);
  console.log(`Lines: ${lines.length}/500`);

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ All checks passed!');
  } else {
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(e => console.log(`  - ${e}`));
    }
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(w => console.log(`  - ${w}`));
    }
  }

  console.log('\n' + '='.repeat(60));
  return errors.length === 0;
}

const { values } = parseArgs({
  options: { file: { type: 'string', short: 'f' } }
});

if (!values.file) {
  console.error('Usage: node validate-skill.mjs -f <file>');
  process.exit(1);
}

process.exit(validateSkill(values.file) ? 0 : 1);
