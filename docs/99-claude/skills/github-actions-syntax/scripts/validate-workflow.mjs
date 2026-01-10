#!/usr/bin/env node

/**
 * GitHub Actions Workflow Validator
 *
 * Basic YAML syntax and schema validation for GitHub Actions workflow files.
 *
 * Usage:
 *   node validate-workflow.mjs <workflow-file.yml>
 *
 * Exit codes:
 *   0 - Validation successful
 *   1 - Validation failed (errors found)
 *   2 - File not found or invalid arguments
 */

import { readFileSync } from "fs";
import { basename, resolve } from "path";
import { parse as parseYaml } from "yaml";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Validation rules and schema
const schema = {
  required: ["on", "jobs"],
  optional: ["name", "permissions", "env", "defaults", "concurrency"],

  validEvents: [
    "push",
    "pull_request",
    "workflow_dispatch",
    "schedule",
    "workflow_call",
    "release",
    "issues",
    "issue_comment",
    "repository_dispatch",
    "workflow_run",
    "check_run",
    "check_suite",
    "create",
    "delete",
    "deployment",
    "deployment_status",
    "fork",
    "gollum",
    "label",
    "milestone",
    "page_build",
    "project",
    "project_card",
    "project_column",
    "public",
    "registry_package",
    "status",
    "watch",
  ],

  validRunners: [
    "ubuntu-latest",
    "ubuntu-22.04",
    "ubuntu-20.04",
    "windows-latest",
    "windows-2022",
    "windows-2019",
    "macos-latest",
    "macos-13",
    "macos-12",
  ],

  validShells: ["bash", "pwsh", "python", "sh", "cmd", "powershell"],

  validPermissionScopes: [
    "actions",
    "checks",
    "contents",
    "deployments",
    "discussions",
    "id-token",
    "issues",
    "packages",
    "pages",
    "pull-requests",
    "repository-projects",
    "security-events",
    "statuses",
  ],

  validPermissionLevels: ["read", "write", "none"],
};

class WorkflowValidator {
  constructor(filePath) {
    this.filePath = filePath;
    this.errors = [];
    this.warnings = [];
    this.workflow = null;
  }

  // Log helpers
  log(message, color = "reset") {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  error(message, location = null) {
    const locStr = location ? ` [${location}]` : "";
    this.errors.push(`${message}${locStr}`);
  }

  warn(message, location = null) {
    const locStr = location ? ` [${location}]` : "";
    this.warnings.push(`${message}${locStr}`);
  }

  // Parse YAML file
  parseWorkflow() {
    try {
      const content = readFileSync(this.filePath, "utf8");
      this.workflow = parseYaml(content);
      return true;
    } catch (err) {
      if (err.code === "ENOENT") {
        this.error(`File not found: ${this.filePath}`);
      } else if (err.name === "YAMLParseError") {
        this.error(`YAML parsing error: ${err.message}`);
      } else {
        this.error(`Error reading file: ${err.message}`);
      }
      return false;
    }
  }

  // Validate workflow structure
  validateStructure() {
    // Check required top-level keys
    for (const key of schema.required) {
      if (!this.workflow[key]) {
        this.error(`Missing required top-level key: '${key}'`);
      }
    }

    // Check for unknown top-level keys
    const validKeys = [...schema.required, ...schema.optional];
    for (const key of Object.keys(this.workflow)) {
      if (!validKeys.includes(key)) {
        this.warn(`Unknown top-level key: '${key}'`);
      }
    }
  }

  // Validate event triggers
  validateEvents() {
    const { on: events } = this.workflow;
    if (!events) return;

    const eventList = Array.isArray(events)
      ? events
      : typeof events === "string"
        ? [events]
        : Object.keys(events);

    for (const event of eventList) {
      if (!schema.validEvents.includes(event)) {
        this.warn(`Unknown event trigger: '${event}'`, "on");
      }
    }

    // Validate event configurations
    if (typeof events === "object" && !Array.isArray(events)) {
      this.validateEventConfigs(events);
    }
  }

  validateEventConfigs(events) {
    // Validate push/pull_request filters
    for (const [event, config] of Object.entries(events)) {
      if (!config || typeof config !== "object") continue;

      if (event === "push" || event === "pull_request") {
        this.validateBranchFilters(config, event);
        this.validatePathFilters(config, event);
      }

      if (event === "workflow_dispatch") {
        this.validateWorkflowInputs(config, event);
      }

      if (event === "schedule") {
        this.validateSchedule(config, event);
      }
    }
  }

  validateBranchFilters(config, event) {
    if (config.branches && config["branches-ignore"]) {
      this.warn(
        `Both 'branches' and 'branches-ignore' specified. Only one should be used.`,
        `on.${event}`,
      );
    }
  }

  validatePathFilters(config, event) {
    if (config.paths && config["paths-ignore"]) {
      this.warn(
        `Both 'paths' and 'paths-ignore' specified. Only one should be used.`,
        `on.${event}`,
      );
    }
  }

  validateWorkflowInputs(config, event) {
    if (!config.inputs) return;

    const validTypes = ["string", "choice", "boolean", "environment"];
    for (const [name, input] of Object.entries(config.inputs)) {
      if (input.type && !validTypes.includes(input.type)) {
        this.error(
          `Invalid input type '${input.type}' for input '${name}'. Must be one of: ${validTypes.join(", ")}`,
          `on.${event}.inputs.${name}`,
        );
      }

      if (input.type === "choice" && !input.options) {
        this.error(
          `Input '${name}' has type 'choice' but no 'options' specified`,
          `on.${event}.inputs.${name}`,
        );
      }
    }
  }

  validateSchedule(config, event) {
    if (!Array.isArray(config)) {
      this.error(`'schedule' must be an array`, `on.${event}`);
      return;
    }

    for (const [index, schedule] of config.entries()) {
      if (!schedule.cron) {
        this.error(
          `Schedule entry ${index} missing 'cron' field`,
          `on.${event}[${index}]`,
        );
      } else {
        this.validateCron(schedule.cron, `on.${event}[${index}].cron`);
      }
    }
  }

  validateCron(cronExpr, location) {
    const parts = cronExpr.trim().split(/\s+/);
    if (parts.length !== 5) {
      this.error(
        `Invalid cron expression '${cronExpr}'. Must have 5 fields (minute hour day month weekday)`,
        location,
      );
    }
  }

  // Validate jobs
  validateJobs() {
    const { jobs } = this.workflow;
    if (!jobs || typeof jobs !== "object") {
      this.error(`'jobs' must be an object`);
      return;
    }

    if (Object.keys(jobs).length === 0) {
      this.error(`At least one job must be defined`);
      return;
    }

    for (const [jobId, job] of Object.entries(jobs)) {
      this.validateJob(jobId, job);
    }

    // Validate job dependencies
    this.validateJobDependencies(jobs);
  }

  validateJob(jobId, job) {
    if (!job || typeof job !== "object") {
      this.error(`Job '${jobId}' must be an object`);
      return;
    }

    // Check for runs-on (required for non-reusable workflows)
    if (!job["runs-on"] && !job.uses) {
      this.error(
        `Job '${jobId}' missing required 'runs-on' field`,
        `jobs.${jobId}`,
      );
    }

    // Validate runs-on
    if (job["runs-on"]) {
      this.validateRunsOn(job["runs-on"], `jobs.${jobId}`);
    }

    // Validate steps
    if (job.steps) {
      this.validateSteps(job.steps, jobId);
    } else if (!job.uses) {
      this.warn(`Job '${jobId}' has no steps defined`, `jobs.${jobId}`);
    }

    // Validate permissions
    if (job.permissions) {
      this.validatePermissions(job.permissions, `jobs.${jobId}`);
    }

    // Validate strategy
    if (job.strategy) {
      this.validateStrategy(job.strategy, jobId);
    }

    // Validate environment
    if (job.environment) {
      this.validateEnvironment(job.environment, `jobs.${jobId}`);
    }

    // Validate timeout
    if (job["timeout-minutes"] !== undefined) {
      if (
        typeof job["timeout-minutes"] !== "number" ||
        job["timeout-minutes"] <= 0
      ) {
        this.error(
          `'timeout-minutes' must be a positive number`,
          `jobs.${jobId}`,
        );
      } else if (job["timeout-minutes"] > 360) {
        this.warn(
          `'timeout-minutes' is ${job["timeout-minutes"]} (maximum is 360)`,
          `jobs.${jobId}`,
        );
      }
    }
  }

  validateRunsOn(runsOn, location) {
    const runners = Array.isArray(runsOn) ? runsOn : [runsOn];

    for (const runner of runners) {
      // Skip validation for matrix expressions
      if (typeof runner === "string" && runner.includes("${{")) {
        continue;
      }

      // Check if it's a known GitHub-hosted runner
      if (
        typeof runner === "string" &&
        !schema.validRunners.includes(runner) &&
        !runner.startsWith("self-hosted")
      ) {
        this.warn(
          `Unknown runner: '${runner}'. Consider using a standard GitHub-hosted runner.`,
          location,
        );
      }
    }
  }

  validateSteps(steps, jobId) {
    if (!Array.isArray(steps)) {
      this.error(`Steps must be an array`, `jobs.${jobId}.steps`);
      return;
    }

    if (steps.length === 0) {
      this.warn(`Job '${jobId}' has empty steps array`, `jobs.${jobId}.steps`);
    }

    for (const [index, step] of steps.entries()) {
      this.validateStep(step, jobId, index);
    }
  }

  validateStep(step, jobId, index) {
    const location = `jobs.${jobId}.steps[${index}]`;

    if (!step || typeof step !== "object") {
      this.error(`Step must be an object`, location);
      return;
    }

    // Step must have either 'uses' or 'run'
    if (!step.uses && !step.run) {
      this.error(`Step must have either 'uses' or 'run'`, location);
    }

    // Step should not have both 'uses' and 'run'
    if (step.uses && step.run) {
      this.error(`Step cannot have both 'uses' and 'run'`, location);
    }

    // Validate shell
    if (step.shell && !schema.validShells.includes(step.shell)) {
      this.warn(
        `Unknown shell: '${step.shell}'. Valid shells: ${schema.validShells.join(", ")}`,
        location,
      );
    }

    // Validate timeout
    if (step["timeout-minutes"] !== undefined) {
      if (
        typeof step["timeout-minutes"] !== "number" ||
        step["timeout-minutes"] <= 0
      ) {
        this.error(`'timeout-minutes' must be a positive number`, location);
      }
    }

    // Warn if step has no name
    if (!step.name) {
      this.warn(`Step has no 'name' field`, location);
    }
  }

  validatePermissions(permissions, location) {
    if (typeof permissions === "string") {
      if (!["read-all", "write-all"].includes(permissions)) {
        this.error(
          `Invalid permissions value: '${permissions}'. Must be 'read-all', 'write-all', or an object`,
          location,
        );
      }
      return;
    }

    if (typeof permissions !== "object") {
      this.error(`Permissions must be an object or string`, location);
      return;
    }

    for (const [scope, level] of Object.entries(permissions)) {
      if (!schema.validPermissionScopes.includes(scope)) {
        this.warn(
          `Unknown permission scope: '${scope}'`,
          `${location}.permissions`,
        );
      }

      if (!schema.validPermissionLevels.includes(level)) {
        this.error(
          `Invalid permission level '${level}' for scope '${scope}'. Must be: ${schema.validPermissionLevels.join(", ")}`,
          `${location}.permissions`,
        );
      }
    }
  }

  validateStrategy(strategy, jobId) {
    const location = `jobs.${jobId}.strategy`;

    if (!strategy.matrix) {
      this.warn(`Strategy defined but no 'matrix' specified`, location);
      return;
    }

    const matrix = strategy.matrix;

    // Check for empty matrix
    if (Object.keys(matrix).length === 0) {
      this.error(`Matrix is empty`, `${location}.matrix`);
    }

    // Validate max-parallel
    if (strategy["max-parallel"] !== undefined) {
      if (
        typeof strategy["max-parallel"] !== "number" ||
        strategy["max-parallel"] <= 0
      ) {
        this.error(`'max-parallel' must be a positive number`, location);
      }
    }

    // Check for include/exclude without proper matrix
    if (
      (matrix.include || matrix.exclude) &&
      Object.keys(matrix).length === 1
    ) {
      this.warn(
        `Matrix has only 'include' or 'exclude' but no base dimensions`,
        `${location}.matrix`,
      );
    }
  }

  validateEnvironment(environment, location) {
    if (typeof environment === "string") {
      // Simple environment name
      return;
    }

    if (typeof environment === "object") {
      if (!environment.name) {
        this.error(`Environment object must have 'name' field`, location);
      }
    } else {
      this.error(`Environment must be a string or object`, location);
    }
  }

  validateJobDependencies(jobs) {
    const jobIds = Object.keys(jobs);

    for (const [jobId, job] of Object.entries(jobs)) {
      if (!job.needs) continue;

      const dependencies = Array.isArray(job.needs) ? job.needs : [job.needs];

      for (const dep of dependencies) {
        if (!jobIds.includes(dep)) {
          this.error(
            `Job '${jobId}' depends on unknown job '${dep}'`,
            `jobs.${jobId}.needs`,
          );
        }
      }

      // Detect circular dependencies (basic check)
      this.detectCircularDependency(jobId, job.needs, jobs, [jobId]);
    }
  }

  detectCircularDependency(jobId, needs, jobs, visited) {
    const dependencies = Array.isArray(needs) ? needs : [needs];

    for (const dep of dependencies) {
      if (visited.includes(dep)) {
        this.error(
          `Circular dependency detected: ${visited.join(" -> ")} -> ${dep}`,
          `jobs.${jobId}.needs`,
        );
        return;
      }

      if (jobs[dep]?.needs) {
        this.detectCircularDependency(dep, jobs[dep].needs, jobs, [
          ...visited,
          dep,
        ]);
      }
    }
  }

  // Validate global permissions
  validateGlobalPermissions() {
    if (this.workflow.permissions) {
      this.validatePermissions(this.workflow.permissions, "permissions");
    }
  }

  // Run all validations
  validate() {
    this.log(`\nValidating workflow: ${basename(this.filePath)}`, "cyan");
    this.log("━".repeat(60), "cyan");

    if (!this.parseWorkflow()) {
      this.printResults();
      return false;
    }

    this.validateStructure();
    this.validateEvents();
    this.validateGlobalPermissions();
    this.validateJobs();

    this.printResults();
    return this.errors.length === 0;
  }

  // Print validation results
  printResults() {
    console.log();

    if (this.errors.length > 0) {
      this.log("❌ Errors:", "red");
      for (const error of this.errors) {
        this.log(`  • ${error}`, "red");
      }
      console.log();
    }

    if (this.warnings.length > 0) {
      this.log("⚠️  Warnings:", "yellow");
      for (const warning of this.warnings) {
        this.log(`  • ${warning}`, "yellow");
      }
      console.log();
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log("✅ Validation successful! No issues found.", "green");
    } else {
      const summary = [
        this.errors.length > 0 ? `${this.errors.length} error(s)` : null,
        this.warnings.length > 0 ? `${this.warnings.length} warning(s)` : null,
      ]
        .filter(Boolean)
        .join(", ");

      if (this.errors.length > 0) {
        this.log(`❌ Validation failed: ${summary}`, "red");
      } else {
        this.log(`✅ Validation passed with ${summary}`, "yellow");
      }
    }

    console.log();
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: node validate-workflow.mjs <workflow-file.yml>");
    process.exit(2);
  }

  const filePath = resolve(args[0]);
  const validator = new WorkflowValidator(filePath);
  const isValid = validator.validate();

  process.exit(isValid ? 0 : 1);
}

main();
