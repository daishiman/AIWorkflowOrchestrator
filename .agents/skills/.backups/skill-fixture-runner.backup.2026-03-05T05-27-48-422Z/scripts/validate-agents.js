#!/usr/bin/env node
/**
 * validate-agents.js
 * Validates agent specification files in agents/ directory.
 * Usage: node validate-agents.js --target <agents-directory-path>
 */
import * as fs from 'fs';
import * as path from 'path';

const EXIT_CODES = { SUCCESS: 0, ERROR: 1, ARGS_ERROR: 2, FILE_NOT_FOUND: 3, VALIDATION_FAILED: 4 };
const REQUIRED_SECTIONS = ['TASK_TITLE', 'STEPS', 'INPUTS', 'OUTPUTS'];

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

function main() {
  const target = getArg('--target');
  if (!target) {
    console.log(JSON.stringify({ valid: false, errors: ['--target argument is required'], agents: [] }));
    process.exit(EXIT_CODES.ARGS_ERROR);
  }

  const resolvedTarget = path.resolve(target);
  if (!fs.existsSync(resolvedTarget) || !fs.statSync(resolvedTarget).isDirectory()) {
    console.log(JSON.stringify({ valid: false, errors: ['Target directory does not exist'], agents: [] }));
    process.exit(EXIT_CODES.FILE_NOT_FOUND);
  }

  const errors = [];
  const agents = [];
  const files = fs.readdirSync(resolvedTarget).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    errors.push('No .md files found in agents directory');
  }

  for (const file of files) {
    const filePath = path.join(resolvedTarget, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const missingSections = [];

    for (const section of REQUIRED_SECTIONS) {
      if (!content.includes(section)) {
        missingSections.push(section);
      }
    }

    const hasRequired = missingSections.length === 0;
    if (!hasRequired) {
      errors.push(`${file}: Missing sections: ${missingSections.join(', ')}`);
    }

    agents.push({ name: file.replace('.md', ''), hasRequiredSections: hasRequired });
  }

  const valid = errors.length === 0;
  console.log(JSON.stringify({ valid, errors, agents }));
  process.exit(valid ? EXIT_CODES.SUCCESS : EXIT_CODES.VALIDATION_FAILED);
}

main();
