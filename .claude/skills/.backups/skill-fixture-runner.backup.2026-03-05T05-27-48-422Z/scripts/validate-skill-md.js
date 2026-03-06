#!/usr/bin/env node
/**
 * validate-skill-md.js
 * Validates a SKILL.md file format.
 * Usage: node validate-skill-md.js --target <skill.md-path>
 */
import * as fs from 'fs';
import * as path from 'path';

const EXIT_CODES = { SUCCESS: 0, ERROR: 1, ARGS_ERROR: 2, FILE_NOT_FOUND: 3, VALIDATION_FAILED: 4 };

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const raw = match[1];
  const result = {};
  const lines = raw.split(/\r?\n/);
  let currentKey = '';
  let currentArray = null;

  for (const line of lines) {
    if (line.match(/^\s*-\s+/)) {
      if (currentArray !== null) {
        currentArray.push(line.replace(/^\s*-\s+/, '').trim());
      }
      continue;
    }
    if (currentArray !== null) {
      result[currentKey] = currentArray;
      currentArray = null;
    }
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      if (value === '' || value === '|') {
        currentKey = key;
        currentArray = [];
      } else {
        result[key] = value;
      }
    }
  }
  if (currentArray !== null) {
    result[currentKey] = currentArray;
  }
  return result;
}

function main() {
  const target = getArg('--target');
  if (!target) {
    console.log(JSON.stringify({ valid: false, errors: ['--target argument is required'], frontmatter: null, body: { headings: [] } }));
    process.exit(EXIT_CODES.ARGS_ERROR);
  }

  const resolvedTarget = path.resolve(target);
  if (!fs.existsSync(resolvedTarget)) {
    console.log(JSON.stringify({ valid: false, errors: ['File does not exist'], frontmatter: null, body: { headings: [] } }));
    process.exit(EXIT_CODES.FILE_NOT_FOUND);
  }

  const content = fs.readFileSync(resolvedTarget, 'utf-8');
  const errors = [];

  // Parse frontmatter
  const fm = parseFrontmatter(content);
  if (!fm) {
    errors.push('Failed to parse YAML frontmatter');
    console.log(JSON.stringify({ valid: false, errors, frontmatter: null, body: { headings: [] } }));
    process.exit(EXIT_CODES.VALIDATION_FAILED);
  }

  // Check required fields
  if (!fm.name) errors.push('Missing required field: name');
  if (!fm.description && !(fm.description === '' && fm['description'])) {
    // Check if description exists at all
    if (!content.match(/^description:/m) && !content.match(/^description:\s/m)) {
      errors.push('Missing required field: description');
    }
  }

  // Validate name format (kebab-case)
  if (fm.name && !/^[a-z][a-z0-9-]*[a-z0-9]$/.test(fm.name) && fm.name.length > 1) {
    errors.push(`name field is not in kebab-case: ${fm.name}`);
  }

  // Check allowed-tools is array
  if (fm['allowed-tools'] && !Array.isArray(fm['allowed-tools'])) {
    errors.push('allowed-tools must be an array');
  }

  // Extract headings from body
  const bodyMatch = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)/);
  const body = bodyMatch ? bodyMatch[1] : '';
  const headings = [];
  const headingMatches = body.matchAll(/^(#{1,6})\s+(.+)/gm);
  for (const m of headingMatches) {
    headings.push(m[2].trim());
  }

  const valid = errors.length === 0;
  console.log(JSON.stringify({ valid, errors, frontmatter: fm, body: { headings } }));
  process.exit(valid ? EXIT_CODES.SUCCESS : EXIT_CODES.VALIDATION_FAILED);
}

main();
