#!/usr/bin/env node

/**
 * GitHub Actions Workflow Validator
 *
 * Usage:
 *   node validate-workflow.mjs <workflow-file.yml>
 *   node validate-workflow.mjs .github/workflows/*.yml
 */

import { readFileSync, existsSync } from 'fs';
import { parse } from 'yaml';
import { basename } from 'path';

// Validation rules
const RULES = {
  // Required fields
  requiredTopLevel: ['name', 'on', 'jobs'],

  // Recommended practices
  recommendations: {
    usesFrozenLockfile: {
      pattern: /--frozen-lockfile|--ci|npm ci/,
      message: 'Consider using --frozen-lockfile (pnpm) or npm ci for reproducible installs',
    },
    usesCache: {
      pattern: /actions\/cache|cache:/,
      message: 'Consider adding caching for faster builds',
    },
    hasTimeout: {
      pattern: /timeout-minutes/,
      message: 'Consider adding timeout-minutes to prevent stuck jobs',
    },
  },

  // Security checks
  security: {
    noSecretsInRun: {
      pattern: /\$\{\{\s*secrets\.[^}]+\}\}/,
      inRunCommand: true,
      message: 'Avoid echoing secrets directly in run commands',
    },
    pinnedActions: {
      pattern: /@v\d+(\.\d+)*$|@[a-f0-9]{40}$/,
      message: 'Consider pinning action versions for security',
    },
  },
};

class WorkflowValidator {
  constructor(filePath) {
    this.filePath = filePath;
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  validate() {
    if (!existsSync(this.filePath)) {
      this.errors.push(`File not found: ${this.filePath}`);
      return this.getResults();
    }

    const content = readFileSync(this.filePath, 'utf-8');

    // Parse YAML
    let workflow;
    try {
      workflow = parse(content);
    } catch (e) {
      this.errors.push(`YAML parse error: ${e.message}`);
      return this.getResults();
    }

    // Run validations
    this.validateStructure(workflow);
    this.validateJobs(workflow);
    this.validateSecurity(content, workflow);
    this.checkRecommendations(content);

    return this.getResults();
  }

  validateStructure(workflow) {
    // Check required top-level fields
    for (const field of RULES.requiredTopLevel) {
      if (!workflow[field]) {
        this.errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate 'on' triggers
    if (workflow.on) {
      const triggers = typeof workflow.on === 'string'
        ? [workflow.on]
        : Array.isArray(workflow.on)
          ? workflow.on
          : Object.keys(workflow.on);

      const validTriggers = [
        'push', 'pull_request', 'pull_request_target',
        'workflow_dispatch', 'workflow_call', 'schedule',
        'release', 'issue_comment', 'issues',
        'create', 'delete', 'fork', 'watch',
      ];

      for (const trigger of triggers) {
        if (!validTriggers.includes(trigger)) {
          this.warnings.push(`Unknown trigger: ${trigger}`);
        }
      }
    }
  }

  validateJobs(workflow) {
    if (!workflow.jobs) return;

    for (const [jobName, job] of Object.entries(workflow.jobs)) {
      // Check runs-on
      if (!job['runs-on']) {
        this.errors.push(`Job '${jobName}' missing 'runs-on'`);
      }

      // Check steps
      if (!job.steps || job.steps.length === 0) {
        this.errors.push(`Job '${jobName}' has no steps`);
        continue;
      }

      // Validate each step
      for (let i = 0; i < job.steps.length; i++) {
        const step = job.steps[i];
        const stepRef = `Job '${jobName}' step ${i + 1}`;

        // Each step must have 'uses' or 'run'
        if (!step.uses && !step.run) {
          this.errors.push(`${stepRef}: Must have 'uses' or 'run'`);
        }

        // Check action version pinning
        if (step.uses) {
          if (!RULES.security.pinnedActions.pattern.test(step.uses)) {
            this.warnings.push(`${stepRef}: Action '${step.uses}' should be pinned to a version`);
          }
        }
      }

      // Check needs references
      if (job.needs) {
        const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
        for (const dep of needs) {
          if (!workflow.jobs[dep]) {
            this.errors.push(`Job '${jobName}' depends on unknown job '${dep}'`);
          }
        }
      }
    }
  }

  validateSecurity(content, workflow) {
    // Check for secrets in echo/run commands
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for potential secret exposure
      if (line.includes('echo') && /\$\{\{\s*secrets\./.test(line)) {
        this.warnings.push(`Line ${i + 1}: Potential secret exposure in echo command`);
      }
    }

    // Check permissions
    if (workflow.permissions === 'write-all') {
      this.warnings.push('Using broad "write-all" permissions - consider restricting');
    }
  }

  checkRecommendations(content) {
    // Check for frozen lockfile
    if (!RULES.recommendations.usesFrozenLockfile.pattern.test(content)) {
      if (content.includes('pnpm install') || content.includes('npm install')) {
        this.info.push(RULES.recommendations.usesFrozenLockfile.message);
      }
    }

    // Check for caching
    if (!RULES.recommendations.usesCache.pattern.test(content)) {
      this.info.push(RULES.recommendations.usesCache.message);
    }

    // Check for timeout
    if (!RULES.recommendations.hasTimeout.pattern.test(content)) {
      this.info.push(RULES.recommendations.hasTimeout.message);
    }
  }

  getResults() {
    return {
      file: this.filePath,
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
    };
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node validate-workflow.mjs <workflow-file.yml> [...]');
    console.log('');
    console.log('Examples:');
    console.log('  node validate-workflow.mjs .github/workflows/ci.yml');
    console.log('  node validate-workflow.mjs .github/workflows/*.yml');
    process.exit(1);
  }

  let hasErrors = false;

  for (const filePath of args) {
    const validator = new WorkflowValidator(filePath);
    const results = validator.validate();

    console.log(`\n📄 ${basename(filePath)}`);
    console.log('─'.repeat(50));

    if (results.valid) {
      console.log('✅ Valid workflow');
    } else {
      hasErrors = true;
      console.log('❌ Invalid workflow');
    }

    if (results.errors.length > 0) {
      console.log('\n🔴 Errors:');
      results.errors.forEach(e => console.log(`   • ${e}`));
    }

    if (results.warnings.length > 0) {
      console.log('\n🟡 Warnings:');
      results.warnings.forEach(w => console.log(`   • ${w}`));
    }

    if (results.info.length > 0) {
      console.log('\n💡 Recommendations:');
      results.info.forEach(i => console.log(`   • ${i}`));
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(hasErrors ? '❌ Validation failed' : '✅ All workflows valid');

  process.exit(hasErrors ? 1 : 0);
}

main();
