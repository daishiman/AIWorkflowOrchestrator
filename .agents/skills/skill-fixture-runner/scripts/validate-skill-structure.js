#!/usr/bin/env node
/**
 * validate-skill-structure.js
 * Validates the directory structure of a skill.
 * Usage: node validate-skill-structure.js --target <skill-directory-path>
 */
import * as fs from 'fs';
import * as path from 'path';

const EXIT_CODES = { SUCCESS: 0, ERROR: 1, ARGS_ERROR: 2, FILE_NOT_FOUND: 3, VALIDATION_FAILED: 4 };
const KNOWN_DIRS = ['agents', 'references', 'scripts', 'assets', 'schemas'];
const FORBIDDEN_FILES = ['README.md', 'readme.md', 'index.md', 'INDEX.md'];

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

function main() {
  const target = getArg('--target');
  if (!target) {
    console.log(JSON.stringify({ valid: false, errors: ['--target argument is required'] }));
    process.exit(EXIT_CODES.ARGS_ERROR);
  }

  const resolvedTarget = path.resolve(target);
  const errors = [];
  const directories = [];
  const files = [];

  // Check target exists
  if (!fs.existsSync(resolvedTarget) || !fs.statSync(resolvedTarget).isDirectory()) {
    console.log(JSON.stringify({ valid: false, errors: ['Target directory does not exist'], structure: { directories: [], files: [] } }));
    process.exit(EXIT_CODES.FILE_NOT_FOUND);
  }

  // Check SKILL.md exists
  const skillMdPath = path.join(resolvedTarget, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    errors.push('SKILL.md not found in target directory');
  } else {
    files.push('SKILL.md');
  }

  // Check for forbidden files
  const entries = fs.readdirSync(resolvedTarget);
  for (const entry of entries) {
    if (FORBIDDEN_FILES.includes(entry)) {
      errors.push(`Forbidden file found: ${entry}`);
    }
  }

  // Detect known directories
  for (const dir of KNOWN_DIRS) {
    const dirPath = path.join(resolvedTarget, dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      directories.push(dir);
      // List files in directory
      const dirFiles = fs.readdirSync(dirPath);
      for (const f of dirFiles) {
        files.push(`${dir}/${f}`);
      }
    }
  }

  // Check kebab-case naming for files
  for (const f of files) {
    const basename = path.basename(f, path.extname(f));
    if (basename !== 'SKILL' && basename !== 'EVALS' && basename !== basename.toLowerCase()) {
      errors.push(`File not in kebab-case: ${f}`);
    }
  }

  const valid = errors.length === 0;
  console.log(JSON.stringify({ valid, errors, structure: { directories, files } }));
  process.exit(valid ? EXIT_CODES.SUCCESS : EXIT_CODES.VALIDATION_FAILED);
}

main();
