#!/usr/bin/env node
/**
 * validate-schemas.js
 * Validates JSON Schema files in schemas/ directory.
 * Usage: node validate-schemas.js --target <schemas-directory-path>
 */
import * as fs from 'fs';
import * as path from 'path';

const EXIT_CODES = { SUCCESS: 0, ERROR: 1, ARGS_ERROR: 2, FILE_NOT_FOUND: 3, VALIDATION_FAILED: 4 };

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

function main() {
  const target = getArg('--target');
  if (!target) {
    console.log(JSON.stringify({ valid: false, errors: ['--target argument is required'], schemas: [] }));
    process.exit(EXIT_CODES.ARGS_ERROR);
  }

  const resolvedTarget = path.resolve(target);
  if (!fs.existsSync(resolvedTarget) || !fs.statSync(resolvedTarget).isDirectory()) {
    console.log(JSON.stringify({ valid: false, errors: ['Target directory does not exist'], schemas: [] }));
    process.exit(EXIT_CODES.FILE_NOT_FOUND);
  }

  const errors = [];
  const schemas = [];
  const files = fs.readdirSync(resolvedTarget).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    errors.push('No .json files found in schemas directory');
  }

  for (const file of files) {
    const filePath = path.join(resolvedTarget, file);
    let isValid = true;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const schema = JSON.parse(content);

      if (!schema.$schema) {
        errors.push(`${file}: Missing $schema property`);
        isValid = false;
      }
      if (!schema.type) {
        errors.push(`${file}: Missing type property`);
        isValid = false;
      }
    } catch (err) {
      errors.push(`${file}: Invalid JSON - ${err.message}`);
      isValid = false;
    }

    schemas.push({ name: file.replace('.json', ''), isValidJsonSchema: isValid });
  }

  const valid = errors.length === 0;
  console.log(JSON.stringify({ valid, errors, schemas }));
  process.exit(valid ? EXIT_CODES.SUCCESS : EXIT_CODES.VALIDATION_FAILED);
}

main();
