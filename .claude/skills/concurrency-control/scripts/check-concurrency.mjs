#!/usr/bin/env node

/**
 * GitHub Actions Concurrency Configuration Checker
 *
 * Usage:
 *   node check-concurrency.mjs <workflow-file.yml>
 *   node check-concurrency.mjs .github/workflows/*.yml
 *
 * Validates:
 *   - Concurrency configuration syntax
 *   - Group naming patterns
 *   - cancel-in-progress settings
 *   - Best practices compliance
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { parse } from "yaml";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const issues = {
  errors: [],
  warnings: [],
  info: [],
};

/**
 * Main validation function
 */
function checkConcurrency(workflowPath) {
  console.log(
    `${colors.blue}Checking concurrency configuration: ${workflowPath}${colors.reset}\n`,
  );

  let content;
  try {
    content = readFileSync(workflowPath, "utf8");
  } catch (error) {
    console.error(
      `${colors.red}Error reading file: ${error.message}${colors.reset}`,
    );
    process.exit(1);
  }

  let workflow;
  try {
    workflow = parse(content);
  } catch (error) {
    console.error(
      `${colors.red}Error parsing YAML: ${error.message}${colors.reset}`,
    );
    process.exit(1);
  }

  // Check workflow-level concurrency
  if (workflow.concurrency) {
    checkConcurrencyConfig(workflow.concurrency, "workflow-level", workflow);
  } else {
    issues.info.push("No workflow-level concurrency configuration found");
  }

  // Check job-level concurrency
  if (workflow.jobs) {
    Object.entries(workflow.jobs).forEach(([jobName, jobConfig]) => {
      if (jobConfig.concurrency) {
        checkConcurrencyConfig(
          jobConfig.concurrency,
          `job '${jobName}'`,
          workflow,
        );
      }
    });
  }

  // Report results
  reportResults();
}

/**
 * Validate concurrency configuration
 */
function checkConcurrencyConfig(config, level, workflow) {
  console.log(`${colors.cyan}Checking ${level}:${colors.reset}`);
  console.log(`  Group: ${config.group || "NOT SET"}`);
  console.log(
    `  Cancel in progress: ${config["cancel-in-progress"] ?? "NOT SET"}\n`,
  );

  // Check if group is defined
  if (!config.group) {
    issues.errors.push(`${level}: 'group' is required but not defined`);
    return;
  }

  // Check if cancel-in-progress is defined
  if (config["cancel-in-progress"] === undefined) {
    issues.warnings.push(
      `${level}: 'cancel-in-progress' is not explicitly set (defaults to false)`,
    );
  }

  // Validate group naming patterns
  validateGroupNaming(config.group, level, workflow);

  // Validate cancel-in-progress based on context
  validateCancelInProgress(config, level, workflow);

  // Check for best practices
  checkBestPractices(config, level, workflow);
}

/**
 * Validate group naming patterns
 */
function validateGroupNaming(group, level, workflow) {
  // Check for static group names (potential issue for multi-branch)
  if (typeof group === "string" && !group.includes("${{")) {
    issues.warnings.push(
      `${level}: Static group name '${group}' may cause issues with multiple branches/PRs`,
    );
    issues.info.push(
      `  Consider using dynamic group: '\${{ github.workflow }}-\${{ github.ref }}'`,
    );
  }

  // Check for common patterns
  const patterns = {
    hasWorkflow: /\$\{\{\s*github\.workflow\s*\}\}/,
    hasRef: /\$\{\{\s*github\.ref\s*\}\}/,
    hasEnvironment: /\$\{\{\s*github\.event\.deployment\.environment\s*\}\}/,
    hasPRNumber: /\$\{\{\s*github\.event\.pull_request\.number\s*\}\}/,
  };

  const matches = {
    workflow: patterns.hasWorkflow.test(group),
    ref: patterns.hasRef.test(group),
    environment: patterns.hasEnvironment.test(group),
    prNumber: patterns.hasPRNumber.test(group),
  };

  // Provide recommendations based on patterns
  if (!matches.workflow && !matches.environment) {
    issues.info.push(
      `${level}: Consider including workflow name or environment in group for better isolation`,
    );
  }

  if (matches.ref && matches.prNumber) {
    issues.warnings.push(
      `${level}: Group includes both 'github.ref' and 'pull_request.number' which may be redundant`,
    );
  }
}

/**
 * Validate cancel-in-progress settings
 */
function validateCancelInProgress(config, level, workflow) {
  const cancelInProgress = config["cancel-in-progress"];

  // Check deployment-related workflows
  const isDeployment =
    workflow.name?.toLowerCase().includes("deploy") ||
    workflow.name?.toLowerCase().includes("release") ||
    level.includes("production");

  if (isDeployment && cancelInProgress === true) {
    issues.warnings.push(
      `${level}: Deployment workflow has 'cancel-in-progress: true' which may cause incomplete deployments`,
    );
    issues.info.push(
      `  Consider 'cancel-in-progress: false' for production deployments to ensure sequential execution`,
    );
  }

  // Check test/build workflows
  const isCICD =
    workflow.name?.toLowerCase().includes("ci") ||
    workflow.name?.toLowerCase().includes("test") ||
    workflow.name?.toLowerCase().includes("build");

  if (isCICD && cancelInProgress === false) {
    issues.info.push(
      `${level}: CI/CD workflow has 'cancel-in-progress: false'. Consider 'true' to save resources on PR updates`,
    );
  }
}

/**
 * Check best practices
 */
function checkBestPractices(config, level, workflow) {
  const group = config.group;

  // Check for overly broad groups
  if (group === "${{ github.workflow }}") {
    issues.warnings.push(
      `${level}: Group only uses workflow name, which may block all executions of this workflow`,
    );
    issues.info.push(
      `  Consider adding branch/ref to allow parallel execution: '\${{ github.workflow }}-\${{ github.ref }}'`,
    );
  }

  // Check for conditional cancel-in-progress
  const hasConditional = typeof config["cancel-in-progress"] === "string";

  if (hasConditional) {
    issues.info.push(
      `${level}: Using conditional 'cancel-in-progress' - ensure logic is correct for all scenarios`,
    );

    // Check for common patterns
    if (
      config["cancel-in-progress"].includes("!= 'production'") ||
      config["cancel-in-progress"].includes("!= 'main'")
    ) {
      issues.info.push(
        `  Good practice: Protecting production/main branch from cancellation`,
      );
    }
  }

  // Check for environment-specific configurations
  if (workflow.jobs) {
    const hasEnvironments = Object.values(workflow.jobs).some(
      (job) => job.environment,
    );

    if (hasEnvironments && !group.includes("environment")) {
      issues.info.push(
        `${level}: Workflow uses environments but group doesn't include environment name. Consider adding it.`,
      );
    }
  }
}

/**
 * Report validation results
 */
function reportResults() {
  console.log(`${colors.cyan}${"=".repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}Validation Results${colors.reset}`);
  console.log(`${colors.cyan}${"=".repeat(60)}${colors.reset}\n`);

  if (issues.errors.length > 0) {
    console.log(
      `${colors.red}Errors (${issues.errors.length}):${colors.reset}`,
    );
    issues.errors.forEach((error) => {
      console.log(`  ${colors.red}✗${colors.reset} ${error}`);
    });
    console.log();
  }

  if (issues.warnings.length > 0) {
    console.log(
      `${colors.yellow}Warnings (${issues.warnings.length}):${colors.reset}`,
    );
    issues.warnings.forEach((warning) => {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${warning}`);
    });
    console.log();
  }

  if (issues.info.length > 0) {
    console.log(`${colors.blue}Info (${issues.info.length}):${colors.reset}`);
    issues.info.forEach((info) => {
      console.log(`  ${colors.blue}ℹ${colors.reset} ${info}`);
    });
    console.log();
  }

  // Summary
  if (issues.errors.length === 0 && issues.warnings.length === 0) {
    console.log(
      `${colors.green}✓ Concurrency configuration looks good!${colors.reset}\n`,
    );
    process.exit(0);
  } else if (issues.errors.length > 0) {
    console.log(
      `${colors.red}✗ Please fix errors before proceeding${colors.reset}\n`,
    );
    process.exit(1);
  } else {
    console.log(
      `${colors.yellow}⚠ Review warnings and consider improvements${colors.reset}\n`,
    );
    process.exit(0);
  }
}

/**
 * Display usage information
 */
function showUsage() {
  console.log(`
${colors.cyan}GitHub Actions Concurrency Configuration Checker${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node check-concurrency.mjs <workflow-file.yml>

${colors.yellow}Examples:${colors.reset}
  node check-concurrency.mjs .github/workflows/deploy.yml
  node check-concurrency.mjs .github/workflows/*.yml

${colors.yellow}What it checks:${colors.reset}
  • Concurrency configuration syntax
  • Group naming patterns
  • cancel-in-progress settings
  • Best practices compliance
  • Environment-specific recommendations

${colors.yellow}Exit codes:${colors.reset}
  0 - No errors (warnings are acceptable)
  1 - Errors found (must be fixed)
`);
}

// Main execution
if (process.argv.length < 3) {
  showUsage();
  process.exit(1);
}

const workflowPath = resolve(process.argv[2]);
checkConcurrency(workflowPath);
