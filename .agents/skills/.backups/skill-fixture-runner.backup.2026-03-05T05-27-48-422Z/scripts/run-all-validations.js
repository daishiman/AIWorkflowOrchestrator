#!/usr/bin/env node
/**
 * run-all-validations.js
 * Runs all validation scripts and aggregates results.
 * Usage: node run-all-validations.js --target <skill-directory-path> [--verbose]
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXIT_CODES = { SUCCESS: 0, ERROR: 1, ARGS_ERROR: 2, FILE_NOT_FOUND: 3, VALIDATION_FAILED: 4 };

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

function hasArg(name) {
  return process.argv.includes(name);
}

function runScript(scriptPath, args) {
  try {
    const output = execSync(`node ${scriptPath} ${args}`, { encoding: 'utf-8', timeout: 30000 });
    return JSON.parse(output.trim());
  } catch (err) {
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout.trim());
      } catch {
        // fall through
      }
    }
    return { valid: false, errors: [`Script execution failed: ${err.message}`] };
  }
}

function main() {
  const target = getArg('--target');
  const verbose = hasArg('--verbose');

  if (!target) {
    console.log(JSON.stringify({ overall: false, results: [{ script: 'args', valid: false, errors: ['--target argument is required'] }] }));
    process.exit(EXIT_CODES.ARGS_ERROR);
  }

  const resolvedTarget = path.resolve(target);
  if (!fs.existsSync(resolvedTarget)) {
    console.log(JSON.stringify({ overall: false, results: [{ script: 'target', valid: false, errors: ['Target directory does not exist'] }] }));
    process.exit(EXIT_CODES.FILE_NOT_FOUND);
  }

  const results = [];

  // 1. Validate structure
  const structureResult = runScript(path.join(__dirname, 'validate-skill-structure.js'), `--target ${resolvedTarget}`);
  results.push({ script: 'validate-skill-structure.js', valid: structureResult.valid, errors: structureResult.errors || [] });

  // 2. Validate SKILL.md
  const skillMdPath = path.join(resolvedTarget, 'SKILL.md');
  if (fs.existsSync(skillMdPath)) {
    const mdResult = runScript(path.join(__dirname, 'validate-skill-md.js'), `--target ${skillMdPath}`);
    results.push({ script: 'validate-skill-md.js', valid: mdResult.valid, errors: mdResult.errors || [] });
  }

  // 3. Validate agents (if directory exists)
  const agentsDir = path.join(resolvedTarget, 'agents');
  if (fs.existsSync(agentsDir) && fs.statSync(agentsDir).isDirectory()) {
    const agentsResult = runScript(path.join(__dirname, 'validate-agents.js'), `--target ${agentsDir}`);
    results.push({ script: 'validate-agents.js', valid: agentsResult.valid, errors: agentsResult.errors || [] });
  }

  // 4. Validate schemas (if directory exists)
  const schemasDir = path.join(resolvedTarget, 'schemas');
  if (fs.existsSync(schemasDir) && fs.statSync(schemasDir).isDirectory()) {
    const schemasResult = runScript(path.join(__dirname, 'validate-schemas.js'), `--target ${schemasDir}`);
    results.push({ script: 'validate-schemas.js', valid: schemasResult.valid, errors: schemasResult.errors || [] });
  }

  const overall = results.every(r => r.valid);
  console.log(JSON.stringify({ overall, results }));
  process.exit(overall ? EXIT_CODES.SUCCESS : EXIT_CODES.VALIDATION_FAILED);
}

main();
