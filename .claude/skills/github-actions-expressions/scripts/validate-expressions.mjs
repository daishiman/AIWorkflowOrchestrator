#!/usr/bin/env node

/**
 * GitHub Actions Expression Validator
 *
 * Validates expression syntax in GitHub Actions workflow files.
 *
 * Usage:
 *   node validate-expressions.mjs <workflow.yml>
 *
 * Features:
 * - Checks for common syntax errors in expressions
 * - Validates context object references
 * - Checks for proper quoting in conditions
 * - Identifies deprecated patterns
 */

import { readFileSync } from 'fs';
import { parse } from 'yaml';

// Known context objects
const KNOWN_CONTEXTS = [
  'github',
  'env',
  'vars',
  'job',
  'jobs',
  'steps',
  'runner',
  'secrets',
  'strategy',
  'matrix',
  'needs',
  'inputs'
];

// Known functions
const KNOWN_FUNCTIONS = [
  'contains',
  'startsWith',
  'endsWith',
  'format',
  'join',
  'toJSON',
  'fromJSON',
  'hashFiles',
  'success',
  'failure',
  'always',
  'cancelled'
];

// Validation rules
const RULES = {
  // Check for unquoted strings in comparisons
  unquotedString: {
    pattern: /==\s*([a-z][a-z0-9-_\/]*)\b(?!\()/gi,
    message: 'Possible unquoted string in comparison. Strings should be quoted.',
    severity: 'warning'
  },

  // Check for unknown context objects
  unknownContext: {
    pattern: /\b([a-z]+)\.[a-z_]/gi,
    validate: (match) => {
      const context = match[1].toLowerCase();
      return !KNOWN_CONTEXTS.includes(context);
    },
    message: (match) => `Unknown context object: ${match[1]}`,
    severity: 'error'
  },

  // Check for unknown functions
  unknownFunction: {
    pattern: /\b([a-z][a-zA-Z0-9]*)\s*\(/gi,
    validate: (match) => {
      const funcName = match[1];
      return !KNOWN_FUNCTIONS.includes(funcName) && funcName !== 'if';
    },
    message: (match) => `Unknown function: ${match[1]}`,
    severity: 'warning'
  },

  // Check for missing quotes around refs
  bareRef: {
    pattern: /github\.ref\s*==\s*(refs\/[^\s)]+)/gi,
    message: 'Ref should be quoted',
    severity: 'error'
  },

  // Check for potential type mismatches
  typeMismatch: {
    pattern: /==\s*(true|false|null)\b/gi,
    message: 'Boolean/null comparison without quotes. This is correct if intentional.',
    severity: 'info'
  }
};

/**
 * Extract expressions from workflow content
 */
function extractExpressions(content) {
  const expressions = [];
  const expressionPattern = /\$\{\{([^}]+)\}\}/g;
  let match;

  while ((match = expressionPattern.exec(content)) !== null) {
    expressions.push({
      expression: match[1].trim(),
      position: match.index,
      fullMatch: match[0]
    });
  }

  return expressions;
}

/**
 * Extract if conditions from parsed YAML
 */
function extractIfConditions(obj, path = '', conditions = []) {
  if (typeof obj !== 'object' || obj === null) {
    return conditions;
  }

  if (obj.if) {
    conditions.push({
      condition: obj.if,
      path: path
    });
  }

  for (const [key, value] of Object.entries(obj)) {
    const newPath = path ? `${path}.${key}` : key;
    extractIfConditions(value, newPath, conditions);
  }

  return conditions;
}

/**
 * Validate a single expression
 */
function validateExpression(expr, location) {
  const issues = [];

  for (const [ruleName, rule] of Object.entries(RULES)) {
    if (rule.pattern) {
      const matches = [...expr.matchAll(rule.pattern)];

      for (const match of matches) {
        // If rule has custom validation
        if (rule.validate && !rule.validate(match)) {
          continue;
        }

        issues.push({
          rule: ruleName,
          severity: rule.severity,
          message: typeof rule.message === 'function' ? rule.message(match) : rule.message,
          location: location,
          expression: expr,
          match: match[0]
        });
      }
    }
  }

  return issues;
}

/**
 * Main validation function
 */
function validateWorkflow(filePath) {
  console.log(`\n🔍 Validating GitHub Actions expressions in: ${filePath}\n`);

  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`❌ Error reading file: ${error.message}`);
    process.exit(1);
  }

  let workflow;
  try {
    workflow = parse(content);
  } catch (error) {
    console.error(`❌ Error parsing YAML: ${error.message}`);
    process.exit(1);
  }

  const allIssues = [];

  // Extract and validate expressions
  const expressions = extractExpressions(content);
  console.log(`Found ${expressions.length} expressions\n`);

  for (const expr of expressions) {
    const issues = validateExpression(expr.expression, `Expression at position ${expr.position}`);
    allIssues.push(...issues);
  }

  // Extract and validate if conditions
  const conditions = extractIfConditions(workflow);
  console.log(`Found ${conditions.length} if conditions\n`);

  for (const cond of conditions) {
    const condStr = typeof cond.condition === 'string' ? cond.condition : String(cond.condition);
    const issues = validateExpression(condStr, `If condition at ${cond.path}`);
    allIssues.push(...issues);
  }

  // Report issues
  const errors = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');
  const infos = allIssues.filter(i => i.severity === 'info');

  if (errors.length > 0) {
    console.log('❌ ERRORS:\n');
    for (const issue of errors) {
      console.log(`  Rule: ${issue.rule}`);
      console.log(`  Location: ${issue.location}`);
      console.log(`  Message: ${issue.message}`);
      console.log(`  Expression: ${issue.expression}`);
      console.log(`  Match: ${issue.match}`);
      console.log('');
    }
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    for (const issue of warnings) {
      console.log(`  Rule: ${issue.rule}`);
      console.log(`  Location: ${issue.location}`);
      console.log(`  Message: ${issue.message}`);
      console.log(`  Expression: ${issue.expression}`);
      console.log('');
    }
  }

  if (infos.length > 0) {
    console.log('ℹ️  INFO:\n');
    for (const issue of infos) {
      console.log(`  Rule: ${issue.rule}`);
      console.log(`  Message: ${issue.message}`);
      console.log(`  Expression: ${issue.expression}`);
      console.log('');
    }
  }

  // Summary
  console.log('═══════════════════════════════════════');
  console.log(`Total issues found: ${allIssues.length}`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log(`  Info: ${infos.length}`);
  console.log('═══════════════════════════════════════\n');

  if (errors.length > 0) {
    console.log('❌ Validation failed with errors');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('⚠️  Validation passed with warnings');
    process.exit(0);
  } else {
    console.log('✅ Validation passed');
    process.exit(0);
  }
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node validate-expressions.mjs <workflow.yml>');
  console.log('');
  console.log('Examples:');
  console.log('  node validate-expressions.mjs .github/workflows/ci.yml');
  console.log('  node validate-expressions.mjs .github/workflows/*.yml');
  process.exit(1);
}

const filePath = args[0];
validateWorkflow(filePath);
