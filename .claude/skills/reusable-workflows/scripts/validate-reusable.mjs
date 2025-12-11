#!/usr/bin/env node

/**
 * Reusable Workflow Validator
 *
 * 再利用可能ワークフローの構文と構造を検証するスクリプト。
 *
 * Usage:
 *   node validate-reusable.mjs <workflow.yml>
 *   node validate-reusable.mjs .github/workflows/*.yml
 */

import { readFile } from "fs/promises";
import { parse } from "yaml";
import { basename } from "path";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const { red, green, yellow, blue, cyan, reset } = colors;

/**
 * Validation rules for reusable workflows
 */
const validationRules = {
  hasWorkflowCall(workflow) {
    const on = workflow.on;
    if (!on) return { valid: false, error: 'Missing "on" trigger' };

    const hasCall =
      on === "workflow_call" ||
      (typeof on === "object" && "workflow_call" in on);

    return hasCall
      ? { valid: true }
      : { valid: false, error: 'Missing "workflow_call" event' };
  },

  validateInputs(workflow) {
    const errors = [];
    const warnings = [];
    const inputs = workflow.on?.workflow_call?.inputs || {};

    Object.entries(inputs).forEach(([name, config]) => {
      // Check input name format
      if (!/^[a-z0-9_-]+$/.test(name)) {
        errors.push(
          `Invalid input name "${name}": must be lowercase with hyphens/underscores`,
        );
      }

      // Check required properties
      if (!config.type) {
        errors.push(`Input "${name}": missing required "type" property`);
      } else if (!["string", "boolean", "number"].includes(config.type)) {
        errors.push(
          `Input "${name}": invalid type "${config.type}" (must be string, boolean, or number)`,
        );
      }

      // Check required + default conflict
      if (config.required === true && config.default !== undefined) {
        errors.push(
          `Input "${name}": cannot have both "required: true" and "default"`,
        );
      }

      // Check for description
      if (!config.description) {
        warnings.push(`Input "${name}": missing description`);
      }
    });

    return { errors, warnings, count: Object.keys(inputs).length };
  },

  validateOutputs(workflow) {
    const errors = [];
    const warnings = [];
    const outputs = workflow.on?.workflow_call?.outputs || {};

    Object.entries(outputs).forEach(([name, config]) => {
      // Check output name format
      if (!/^[a-z0-9_-]+$/.test(name)) {
        errors.push(
          `Invalid output name "${name}": must be lowercase with hyphens/underscores`,
        );
      }

      // Check required properties
      if (!config.value) {
        errors.push(`Output "${name}": missing required "value" property`);
      } else if (!config.value.includes("jobs.")) {
        warnings.push(
          `Output "${name}": value should reference job outputs (jobs.<job-id>.outputs.<output>)`,
        );
      }

      // Check for description
      if (!config.description) {
        warnings.push(`Output "${name}": missing description`);
      }
    });

    return { errors, warnings, count: Object.keys(outputs).length };
  },

  validateSecrets(workflow) {
    const errors = [];
    const warnings = [];
    const secrets = workflow.on?.workflow_call?.secrets || {};

    Object.entries(secrets).forEach(([name, config]) => {
      // Check secret name format (should be UPPER_CASE)
      if (!/^[A-Z0-9_]+$/.test(name)) {
        warnings.push(
          `Secret "${name}": should be UPPER_CASE with underscores`,
        );
      }

      // Check for description
      if (!config.description) {
        warnings.push(`Secret "${name}": missing description`);
      }
    });

    return { errors, warnings, count: Object.keys(secrets).length };
  },

  validateJobs(workflow) {
    const errors = [];
    const warnings = [];
    const jobs = workflow.jobs || {};

    if (Object.keys(jobs).length === 0) {
      errors.push("No jobs defined in workflow");
      return { errors, warnings, count: 0 };
    }

    Object.entries(jobs).forEach(([jobId, job]) => {
      // Check if job uses workflow_call (shouldn't)
      if (job.uses) {
        warnings.push(
          `Job "${jobId}": reusable workflows shouldn't call other workflows (creates nesting)`,
        );
      }

      // Check for runs-on
      if (!job["runs-on"] && !job.uses) {
        errors.push(`Job "${jobId}": missing "runs-on" property`);
      }

      // Check outputs reference
      const outputs = workflow.on?.workflow_call?.outputs || {};
      Object.entries(outputs).forEach(([outputName, outputConfig]) => {
        if (outputConfig.value?.includes(`jobs.${jobId}.outputs.`)) {
          // Check if job defines this output
          if (!job.outputs) {
            warnings.push(
              `Job "${jobId}": referenced in output "${outputName}" but has no outputs defined`,
            );
          }
        }
      });
    });

    return { errors, warnings, count: Object.keys(jobs).length };
  },

  checkLimits(workflow) {
    const errors = [];
    const inputs = Object.keys(workflow.on?.workflow_call?.inputs || {}).length;
    const outputs = Object.keys(
      workflow.on?.workflow_call?.outputs || {},
    ).length;
    const secrets = Object.keys(
      workflow.on?.workflow_call?.secrets || {},
    ).length;

    if (inputs > 10) {
      errors.push(`Too many inputs: ${inputs} (maximum: 10)`);
    }
    if (outputs > 50) {
      errors.push(`Too many outputs: ${outputs} (maximum: 50)`);
    }
    if (secrets > 100) {
      errors.push(`Too many secrets: ${secrets} (maximum: 100)`);
    }

    return { errors };
  },

  checkBestPractices(workflow) {
    const warnings = [];

    // Check for name
    if (!workflow.name) {
      warnings.push("Missing workflow name");
    }

    // Check for timeout-minutes
    const jobs = workflow.jobs || {};
    Object.entries(jobs).forEach(([jobId, job]) => {
      if (!job["timeout-minutes"] && !job.uses) {
        warnings.push(
          `Job "${jobId}": consider adding timeout-minutes to prevent hanging`,
        );
      }
    });

    // Check for input usage
    const inputs = workflow.on?.workflow_call?.inputs || {};
    const workflowStr = JSON.stringify(workflow);
    Object.keys(inputs).forEach((inputName) => {
      if (!workflowStr.includes(`inputs.${inputName}`)) {
        warnings.push(`Input "${inputName}": defined but never used`);
      }
    });

    return { warnings };
  },
};

/**
 * Validate a single workflow file
 */
async function validateWorkflow(filePath) {
  console.log(`\n${blue}Validating:${reset} ${cyan}${filePath}${reset}\n`);

  try {
    const content = await readFile(filePath, "utf-8");
    const workflow = parse(content);

    let totalErrors = 0;
    let totalWarnings = 0;

    // Run all validation rules
    const results = {
      workflowCall: validationRules.hasWorkflowCall(workflow),
      inputs: validationRules.validateInputs(workflow),
      outputs: validationRules.validateOutputs(workflow),
      secrets: validationRules.validateSecrets(workflow),
      jobs: validationRules.validateJobs(workflow),
      limits: validationRules.checkLimits(workflow),
      bestPractices: validationRules.checkBestPractices(workflow),
    };

    // Display results
    console.log(`${cyan}Structure:${reset}`);
    console.log(
      `  ${results.workflowCall.valid ? green + "✓" : red + "✗"} workflow_call event${reset}`,
    );
    console.log(`  ${cyan}Inputs:${reset} ${results.inputs.count}`);
    console.log(`  ${cyan}Outputs:${reset} ${results.outputs.count}`);
    console.log(`  ${cyan}Secrets:${reset} ${results.secrets.count}`);
    console.log(`  ${cyan}Jobs:${reset} ${results.jobs.count}`);

    // Collect all errors and warnings
    const allErrors = [
      ...(results.workflowCall.error ? [results.workflowCall.error] : []),
      ...results.inputs.errors,
      ...results.outputs.errors,
      ...results.secrets.errors,
      ...results.jobs.errors,
      ...results.limits.errors,
    ];

    const allWarnings = [
      ...results.inputs.warnings,
      ...results.outputs.warnings,
      ...results.secrets.warnings,
      ...results.jobs.warnings,
      ...results.bestPractices.warnings,
    ];

    // Display errors
    if (allErrors.length > 0) {
      console.log(`\n${red}Errors:${reset}`);
      allErrors.forEach((error) => console.log(`  ${red}✗${reset} ${error}`));
      totalErrors += allErrors.length;
    }

    // Display warnings
    if (allWarnings.length > 0) {
      console.log(`\n${yellow}Warnings:${reset}`);
      allWarnings.forEach((warning) =>
        console.log(`  ${yellow}⚠${reset} ${warning}`),
      );
      totalWarnings += allWarnings.length;
    }

    // Summary
    if (totalErrors === 0 && totalWarnings === 0) {
      console.log(`\n${green}✓ No issues found${reset}`);
    } else {
      console.log(
        `\n${cyan}Summary:${reset} ${red}${totalErrors} error(s)${reset}, ${yellow}${totalWarnings} warning(s)${reset}`,
      );
    }

    return { errors: totalErrors, warnings: totalWarnings };
  } catch (error) {
    console.error(`${red}Failed to parse workflow:${reset} ${error.message}`);
    return { errors: 1, warnings: 0 };
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`${cyan}Reusable Workflow Validator${reset}\n`);
    console.log("Usage:");
    console.log("  node validate-reusable.mjs <workflow.yml>");
    console.log("  node validate-reusable.mjs .github/workflows/*.yml");
    console.log("\nExamples:");
    console.log(
      "  node validate-reusable.mjs .github/workflows/reusable-build.yml",
    );
    console.log(
      "  node validate-reusable.mjs .github/workflows/reusable-*.yml",
    );
    process.exit(1);
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  let filesProcessed = 0;

  for (const file of args) {
    const result = await validateWorkflow(file);
    totalErrors += result.errors;
    totalWarnings += result.warnings;
    filesProcessed++;
  }

  // Final summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(`${cyan}Total:${reset} ${filesProcessed} file(s) processed`);
  console.log(
    `${cyan}Result:${reset} ${red}${totalErrors} error(s)${reset}, ${yellow}${totalWarnings} warning(s)${reset}`,
  );
  console.log("=".repeat(60));

  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
