#!/usr/bin/env node

/**
 * GitHub Actions Secret Usage Checker
 *
 * Analyzes workflow files for secret usage patterns and security issues.
 *
 * Usage:
 *   node check-secret-usage.mjs <workflow-file.yml>
 *   node check-secret-usage.mjs .github/workflows/
 *
 * Checks:
 * - Secret references in workflow files
 * - Insecure secret usage patterns
 * - Missing OIDC permissions
 * - Pull request secret exposure risks
 * - Secret logging attempts
 */

import fs from "fs/promises";
import path from "path";
import yaml from "yaml";

class SecretUsageChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.info = [];
    this.secretReferences = new Set();
  }

  /**
   * Check a workflow file for secret usage
   */
  async checkFile(filePath) {
    console.log(`\n🔍 Checking: ${filePath}`);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const workflow = yaml.parse(content);

      this.analyzeWorkflow(workflow, filePath);
      this.analyzeRawContent(content, filePath);
    } catch (error) {
      console.error(`❌ Error reading ${filePath}: ${error.message}`);
    }
  }

  /**
   * Analyze parsed workflow structure
   */
  analyzeWorkflow(workflow, filePath) {
    if (!workflow) return;

    // Check permissions
    this.checkPermissions(workflow, filePath);

    // Check triggers for PR risks
    this.checkTriggers(workflow, filePath);

    // Check jobs
    if (workflow.jobs) {
      Object.entries(workflow.jobs).forEach(([jobName, job]) => {
        this.checkJob(jobName, job, filePath);
      });
    }
  }

  /**
   * Check workflow permissions
   */
  checkPermissions(workflow, filePath) {
    const hasIdToken =
      workflow.permissions?.["id-token"] === "write" ||
      Object.values(workflow.jobs || {}).some(
        (job) => job.permissions?.["id-token"] === "write",
      );

    if (hasIdToken) {
      this.info.push({
        file: filePath,
        message: "✅ OIDC enabled (id-token: write)",
        type: "oidc",
      });
    }

    // Check for overly permissive settings
    if (workflow.permissions === "write-all") {
      this.warnings.push({
        file: filePath,
        message: "⚠️  Overly permissive: permissions: write-all",
        type: "permissions",
        recommendation: "Use minimal required permissions",
      });
    }
  }

  /**
   * Check workflow triggers for security risks
   */
  checkTriggers(workflow, filePath) {
    const triggers = workflow.on || workflow.true || [];
    const triggerArray = Array.isArray(triggers) ? triggers : [triggers];
    const triggerTypes =
      typeof triggers === "object" ? Object.keys(triggers) : triggerArray;

    // Check for pull_request with secrets
    if (triggerTypes.includes("pull_request")) {
      const hasSecrets = this.workflowUsesSecrets(workflow);
      if (hasSecrets) {
        this.issues.push({
          file: filePath,
          message: "🚨 SECURITY RISK: pull_request trigger with secrets",
          type: "security",
          recommendation:
            "Use pull_request_target or remove secrets from PR workflows",
          severity: "high",
        });
      }
    }

    // Check for pull_request_target (info)
    if (triggerTypes.includes("pull_request_target")) {
      this.warnings.push({
        file: filePath,
        message:
          "⚠️  Using pull_request_target - ensure proper secret protection",
        type: "security",
        recommendation:
          "Verify that secrets are only accessible with proper conditions",
      });
    }
  }

  /**
   * Check if workflow uses secrets
   */
  workflowUsesSecrets(workflow) {
    const workflowStr = JSON.stringify(workflow);
    return /\$\{\{\s*secrets\./i.test(workflowStr);
  }

  /**
   * Check individual job
   */
  checkJob(jobName, job, filePath) {
    if (!job) return;

    // Check environment usage
    if (job.environment) {
      this.info.push({
        file: filePath,
        job: jobName,
        message: `✅ Using protected environment: ${typeof job.environment === "string" ? job.environment : job.environment.name}`,
        type: "environment",
      });
    }

    // Check steps
    if (job.steps) {
      job.steps.forEach((step, index) => {
        this.checkStep(jobName, step, index, filePath);
      });
    }
  }

  /**
   * Check individual step
   */
  checkStep(jobName, step, stepIndex, filePath) {
    if (!step) return;

    const stepStr = JSON.stringify(step);

    // Check for secret logging attempts
    if (step.run) {
      this.checkSecretLogging(jobName, step, stepIndex, filePath);
    }

    // Extract secret references
    const secretMatches = stepStr.matchAll(
      /\$\{\{\s*secrets\.([A-Z_][A-Z0-9_]*)\s*\}\}/gi,
    );
    for (const match of secretMatches) {
      this.secretReferences.add(match[1]);
    }

    // Check for OIDC action usage
    if (step.uses) {
      this.checkOIDCActions(jobName, step, stepIndex, filePath);
    }
  }

  /**
   * Check for secret logging attempts
   */
  checkSecretLogging(jobName, step, stepIndex, filePath) {
    const run = step.run.toLowerCase();
    const hasSecretRef = /\$\{\{\s*secrets\./i.test(step.run);

    // Check for dangerous patterns
    const dangerousPatterns = [
      { pattern: /echo.*\$\{\{\s*secrets\./i, message: "Direct secret echo" },
      {
        pattern: /console\.log.*\$\{\{\s*secrets\./i,
        message: "Console.log of secret",
      },
      {
        pattern: /print.*\$\{\{\s*secrets\./i,
        message: "Print statement with secret",
      },
      {
        pattern: /cat.*\$\{\{\s*secrets\./i,
        message: "Cat command with secret",
      },
    ];

    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(step.run)) {
        this.issues.push({
          file: filePath,
          job: jobName,
          step: stepIndex,
          message: `🚨 SECRET LEAK RISK: ${message}`,
          type: "secret-leak",
          code: step.run.trim().split("\n")[0],
          recommendation:
            "Use secrets only in env variables, never in output commands",
          severity: "critical",
        });
      }
    }

    // Check for printenv/set without proper filtering
    if (
      (run.includes("printenv") ||
        run.includes("env") ||
        run.includes("set")) &&
      hasSecretRef
    ) {
      this.warnings.push({
        file: filePath,
        job: jobName,
        step: stepIndex,
        message: "⚠️  Environment variable dump with secrets present",
        type: "secret-leak",
        recommendation:
          "Avoid printing all environment variables when secrets are in use",
      });
    }
  }

  /**
   * Check for OIDC action usage
   */
  checkOIDCActions(jobName, step, stepIndex, filePath) {
    const oidcActions = {
      "aws-actions/configure-aws-credentials": "AWS",
      "google-github-actions/auth": "GCP",
      "azure/login": "Azure",
      "hashicorp/vault-action": "Vault",
    };

    for (const [action, provider] of Object.entries(oidcActions)) {
      if (step.uses.startsWith(action)) {
        this.info.push({
          file: filePath,
          job: jobName,
          step: stepIndex,
          message: `✅ Using OIDC authentication: ${provider}`,
          type: "oidc",
          action: step.uses,
        });
      }
    }
  }

  /**
   * Analyze raw content for patterns
   */
  analyzeRawContent(content, filePath) {
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Check for hardcoded secrets (basic patterns)
      const hardcodedPatterns = [
        { pattern: /password\s*[:=]\s*['"][^'"]+['"]/i, name: "password" },
        { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i, name: "API key" },
        { pattern: /secret\s*[:=]\s*['"][^'"]+['"]/i, name: "secret" },
        { pattern: /token\s*[:=]\s*['"][^'"]+['"]/i, name: "token" },
      ];

      for (const { pattern, name } of hardcodedPatterns) {
        if (pattern.test(line) && !line.includes("secrets.")) {
          this.issues.push({
            file: filePath,
            line: lineNum,
            message: `🚨 POTENTIAL HARDCODED ${name.toUpperCase()}`,
            type: "hardcoded-secret",
            code: line.trim(),
            recommendation:
              "Use GitHub Secrets instead of hardcoding credentials",
            severity: "critical",
          });
        }
      }

      // Check for base64 encoding of secrets (potential masking bypass)
      if (/base64.*\$\{\{\s*secrets\./i.test(line)) {
        this.warnings.push({
          file: filePath,
          line: lineNum,
          message: "⚠️  Base64 encoding of secret may bypass GitHub masking",
          type: "masking-bypass",
          code: line.trim(),
          recommendation: "Add ::add-mask:: for encoded values",
        });
      }
    });
  }

  /**
   * Print report
   */
  printReport() {
    console.log("\n" + "=".repeat(80));
    console.log("📊 SECRET USAGE ANALYSIS REPORT");
    console.log("=".repeat(80));

    // Critical issues
    if (this.issues.length > 0) {
      console.log("\n🚨 CRITICAL ISSUES:");
      this.issues.forEach((issue) => {
        console.log(`\n  File: ${issue.file}`);
        if (issue.job) console.log(`  Job: ${issue.job}`);
        if (issue.step !== undefined) console.log(`  Step: ${issue.step}`);
        if (issue.line) console.log(`  Line: ${issue.line}`);
        console.log(`  ${issue.message}`);
        if (issue.code) console.log(`  Code: ${issue.code}`);
        console.log(`  ➜ ${issue.recommendation}`);
      });
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS:");
      this.warnings.forEach((warning) => {
        console.log(`\n  File: ${warning.file}`);
        if (warning.job) console.log(`  Job: ${warning.job}`);
        if (warning.step !== undefined) console.log(`  Step: ${warning.step}`);
        if (warning.line) console.log(`  Line: ${warning.line}`);
        console.log(`  ${warning.message}`);
        if (warning.recommendation)
          console.log(`  ➜ ${warning.recommendation}`);
      });
    }

    // Info
    if (this.info.length > 0) {
      console.log("\n✅ POSITIVE FINDINGS:");
      this.info.forEach((info) => {
        console.log(`  ${info.message} (${info.file})`);
      });
    }

    // Secret references summary
    if (this.secretReferences.size > 0) {
      console.log("\n🔑 SECRET REFERENCES FOUND:");
      Array.from(this.secretReferences)
        .sort()
        .forEach((secret) => {
          console.log(`  - secrets.${secret}`);
        });
    }

    // Summary
    console.log("\n" + "=".repeat(80));
    console.log("📈 SUMMARY:");
    console.log(`  Critical Issues: ${this.issues.length}`);
    console.log(`  Warnings: ${this.warnings.length}`);
    console.log(`  Positive Findings: ${this.info.length}`);
    console.log(`  Unique Secrets Referenced: ${this.secretReferences.size}`);
    console.log("=".repeat(80) + "\n");

    // Exit code
    return this.issues.length > 0 ? 1 : 0;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      "Usage: node check-secret-usage.mjs <workflow-file.yml> [...]",
    );
    console.error("   or: node check-secret-usage.mjs <workflow-directory>");
    process.exit(1);
  }

  const checker = new SecretUsageChecker();

  for (const arg of args) {
    try {
      const stat = await fs.stat(arg);

      if (stat.isDirectory()) {
        // Process all .yml and .yaml files in directory
        const files = await fs.readdir(arg);
        const workflowFiles = files.filter(
          (f) => f.endsWith(".yml") || f.endsWith(".yaml"),
        );

        for (const file of workflowFiles) {
          await checker.checkFile(path.join(arg, file));
        }
      } else {
        // Process single file
        await checker.checkFile(arg);
      }
    } catch (error) {
      console.error(`❌ Error processing ${arg}: ${error.message}`);
    }
  }

  const exitCode = checker.printReport();
  process.exit(exitCode);
}

main();
