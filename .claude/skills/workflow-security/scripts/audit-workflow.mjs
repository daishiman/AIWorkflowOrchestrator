#!/usr/bin/env node

/**
 * GitHub Actions Workflow Security Audit Script
 *
 * ワークフローファイルのセキュリティリスクを検出し、レポートを生成します。
 *
 * Usage:
 *   node audit-workflow.mjs <workflow-file.yml>
 *   node audit-workflow.mjs .github/workflows/
 *
 * Checks:
 *   - GITHUB_TOKEN permissions
 *   - Action pinning (commit SHA vs tag)
 *   - pull_request_target usage
 *   - Secret exposure in PRs
 *   - Dangerous script injection patterns
 */

import fs from "fs";
import path from "path";
import yaml from "yaml";

// カラー出力
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

class WorkflowAuditor {
  constructor(filePath) {
    this.filePath = filePath;
    this.issues = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: [],
    };
  }

  async audit() {
    const content = fs.readFileSync(this.filePath, "utf8");
    let workflow;

    try {
      workflow = yaml.parse(content);
    } catch (error) {
      this.issues.critical.push({
        message: "Invalid YAML syntax",
        details: error.message,
      });
      return this.generateReport();
    }

    // セキュリティチェック実行
    this.checkPermissions(workflow);
    this.checkActionPinning(workflow);
    this.checkPullRequestTarget(workflow);
    this.checkSecretExposure(workflow);
    this.checkScriptInjection(workflow);
    this.checkEnvironmentProtection(workflow);

    return this.generateReport();
  }

  checkPermissions(workflow) {
    const workflowPerms = workflow.permissions;

    // 権限が未定義（デフォルトに依存）
    if (!workflowPerms) {
      this.issues.high.push({
        message: "No explicit permissions defined",
        details:
          "Workflow relies on repository default permissions. Set explicit permissions.",
        recommendation: 'Add "permissions: contents: read" at workflow level',
      });
    }

    // write-all 検出
    if (workflowPerms === "write-all") {
      this.issues.critical.push({
        message: "Excessive permissions: write-all",
        details: "Workflow has write access to all scopes",
        recommendation: "Use minimal permissions: specify only required scopes",
      });
    }

    // contents: write のチェック
    if (workflowPerms?.contents === "write") {
      this.issues.medium.push({
        message: "Write permission to repository contents",
        details: "Workflow can modify repository code",
        recommendation:
          "Verify if write access is necessary. Use job-level permissions if possible.",
      });
    }

    // ジョブレベル権限チェック
    const jobs = workflow.jobs || {};
    Object.entries(jobs).forEach(([jobName, job]) => {
      if (!job.permissions) {
        this.issues.medium.push({
          message: `Job "${jobName}" has no explicit permissions`,
          details: "Job inherits workflow-level permissions",
          recommendation: "Set job-level permissions for better isolation",
        });
      }
    });
  }

  checkActionPinning(workflow) {
    const actionPattern = /uses:\s+([^@\s]+)@([^\s]+)/g;
    const content = fs.readFileSync(this.filePath, "utf8");
    const matches = [...content.matchAll(actionPattern)];

    matches.forEach((match) => {
      const [, actionName, ref] = match;

      // タグ参照（v1, v2.1.0 など）
      if (/^v?\d+(\.\d+)?(\.\d+)?$/.test(ref)) {
        this.issues.high.push({
          message: `Action pinned by tag: ${actionName}@${ref}`,
          details: "Tags are mutable and can be overwritten by attackers",
          recommendation: `Pin to commit SHA: ${actionName}@<commit-sha>  # ${ref}`,
        });
      }

      // ブランチ参照（main, master など）
      if (/^(main|master|develop)$/.test(ref)) {
        this.issues.critical.push({
          message: `Action pinned by branch: ${actionName}@${ref}`,
          details:
            "Branches always point to latest commit, allowing code injection",
          recommendation: `Pin to commit SHA: ${actionName}@<commit-sha>`,
        });
      }

      // コミットSHA（推奨）
      if (/^[0-9a-f]{40}$/.test(ref)) {
        this.issues.info.push({
          message: `✅ Action properly pinned: ${actionName}@${ref}`,
        });
      }
    });
  }

  checkPullRequestTarget(workflow) {
    const onEvents = workflow.on;
    const hasPullRequestTarget =
      onEvents === "pull_request_target" ||
      (Array.isArray(onEvents) && onEvents.includes("pull_request_target")) ||
      (typeof onEvents === "object" && onEvents.pull_request_target);

    if (!hasPullRequestTarget) return;

    this.issues.high.push({
      message: "Workflow uses pull_request_target trigger",
      details:
        "This trigger has write permissions and access to secrets, even for PRs from forks",
      recommendation:
        "Ensure untrusted code is never executed. Use ref: github.base_ref for checkout.",
    });

    // checkout のチェック
    const content = fs.readFileSync(this.filePath, "utf8");
    const checkoutPattern = /uses:\s+actions\/checkout/;
    const refPattern = /ref:\s+\$\{\{\s*github\.base_ref\s*\}\}/;

    if (checkoutPattern.test(content) && !refPattern.test(content)) {
      this.issues.critical.push({
        message: "pull_request_target checks out PR code",
        details: "Untrusted code from PR is executed with write permissions",
        recommendation: 'Add "ref: ${{ github.base_ref }}" to checkout step',
      });
    }
  }

  checkSecretExposure(workflow) {
    const content = fs.readFileSync(this.filePath, "utf8");
    const secretPattern = /\$\{\{\s*secrets\.\w+\s*\}\}/g;
    const prProtection = /if:\s+github\.event_name\s*!=\s*['"]pull_request['"]/;

    const hasSecrets = secretPattern.test(content);
    const hasProtection = prProtection.test(content);

    if (hasSecrets && !hasProtection) {
      const onEvents = workflow.on;
      const runOnPR =
        onEvents === "pull_request" ||
        (Array.isArray(onEvents) && onEvents.includes("pull_request")) ||
        (typeof onEvents === "object" && onEvents.pull_request);

      if (runOnPR) {
        this.issues.critical.push({
          message: "Secrets exposed to pull_request trigger",
          details: "Secrets may be logged or exfiltrated by malicious PR",
          recommendation:
            "Add condition: if: github.event_name != 'pull_request'",
        });
      }
    }
  }

  checkScriptInjection(workflow) {
    const content = fs.readFileSync(this.filePath, "utf8");

    // 危険なコンテキスト変数の直接使用
    const dangerousPatterns = [
      {
        pattern: /\$\{\{\s*github\.event\.pull_request\.title\s*\}\}/,
        context: "github.event.pull_request.title",
      },
      {
        pattern: /\$\{\{\s*github\.event\.pull_request\.body\s*\}\}/,
        context: "github.event.pull_request.body",
      },
      {
        pattern: /\$\{\{\s*github\.event\.issue\.title\s*\}\}/,
        context: "github.event.issue.title",
      },
      {
        pattern: /\$\{\{\s*github\.event\.comment\.body\s*\}\}/,
        context: "github.event.comment.body",
      },
      {
        pattern: /\$\{\{\s*github\.head_ref\s*\}\}/,
        context: "github.head_ref",
      },
    ];

    dangerousPatterns.forEach(({ pattern, context }) => {
      if (pattern.test(content)) {
        this.issues.critical.push({
          message: `Script injection risk: ${context}`,
          details:
            "User-controlled input directly in script may allow command injection",
          recommendation: `Use environment variables instead:\n  env:\n    TITLE: \${{ ${context} }}\n  run: echo "$TITLE"`,
        });
      }
    });
  }

  checkEnvironmentProtection(workflow) {
    const jobs = workflow.jobs || {};

    Object.entries(jobs).forEach(([jobName, job]) => {
      const hasWritePerms =
        job.permissions?.contents === "write" ||
        job.permissions?.packages === "write" ||
        workflow.permissions?.contents === "write" ||
        workflow.permissions?.packages === "write";

      const hasEnvironment = job.environment;

      if (hasWritePerms && !hasEnvironment) {
        this.issues.medium.push({
          message: `Job "${jobName}" has write permissions but no environment protection`,
          details: "Production deployments should require approval",
          recommendation: "Add environment: name: production",
        });
      }
    });
  }

  generateReport() {
    const report = {
      file: this.filePath,
      summary: {
        critical: this.issues.critical.length,
        high: this.issues.high.length,
        medium: this.issues.medium.length,
        low: this.issues.low.length,
        info: this.issues.info.length,
      },
      issues: this.issues,
    };

    return report;
  }
}

// レポート出力
function printReport(report) {
  console.log(colors.bold(`\n📄 Workflow: ${report.file}\n`));

  const { summary } = report;
  const totalIssues =
    summary.critical + summary.high + summary.medium + summary.low;

  console.log(colors.bold("Summary:"));
  console.log(`  ${colors.red(`🔴 Critical: ${summary.critical}`)}`);
  console.log(`  ${colors.red(`🟠 High: ${summary.high}`)}`);
  console.log(`  ${colors.yellow(`🟡 Medium: ${summary.medium}`)}`);
  console.log(`  ${colors.blue(`🔵 Low: ${summary.low}`)}`);
  console.log(`  ${colors.green(`ℹ️  Info: ${summary.info}`)}`);

  if (totalIssues === 0) {
    console.log(colors.green("\n✅ No security issues found!\n"));
    return;
  }

  // 詳細出力
  ["critical", "high", "medium", "low", "info"].forEach((severity) => {
    const issues = report.issues[severity];
    if (issues.length === 0) return;

    const icon = {
      critical: "🔴",
      high: "🟠",
      medium: "🟡",
      low: "🔵",
      info: "ℹ️",
    }[severity];

    console.log(colors.bold(`\n${icon} ${severity.toUpperCase()} Issues:\n`));

    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.message}`);
      if (issue.details) {
        console.log(`     Details: ${issue.details}`);
      }
      if (issue.recommendation) {
        console.log(colors.green(`     💡 Fix: ${issue.recommendation}`));
      }
      console.log("");
    });
  });

  console.log("");
}

// JSON レポート出力
function saveJsonReport(reports, outputPath) {
  const summary = {
    total_files: reports.length,
    total_critical: reports.reduce((sum, r) => sum + r.summary.critical, 0),
    total_high: reports.reduce((sum, r) => sum + r.summary.high, 0),
    total_medium: reports.reduce((sum, r) => sum + r.summary.medium, 0),
    total_low: reports.reduce((sum, r) => sum + r.summary.low, 0),
    files: reports,
  };

  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  console.log(colors.green(`\n📊 JSON report saved to: ${outputPath}\n`));
}

// メイン実行
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      "Usage: node audit-workflow.mjs <workflow-file.yml|directory>",
    );
    process.exit(1);
  }

  const targetPath = args[0];
  const stat = fs.statSync(targetPath);
  const files = [];

  if (stat.isDirectory()) {
    // ディレクトリ内のすべての .yml/.yaml ファイル
    const walkDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      entries.forEach((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (/\.(yml|yaml)$/.test(entry.name)) {
          files.push(fullPath);
        }
      });
    };
    walkDir(targetPath);
  } else {
    files.push(targetPath);
  }

  if (files.length === 0) {
    console.error("No workflow files found");
    process.exit(1);
  }

  const reports = [];

  for (const file of files) {
    const auditor = new WorkflowAuditor(file);
    const report = await auditor.audit();
    reports.push(report);
    printReport(report);
  }

  // JSON レポート出力（複数ファイルの場合）
  if (files.length > 1) {
    saveJsonReport(reports, "workflow-audit-report.json");
  }

  // 終了コード（Critical/High がある場合は失敗）
  const hasCriticalIssues = reports.some(
    (r) => r.summary.critical > 0 || r.summary.high > 0,
  );
  process.exit(hasCriticalIssues ? 1 : 0);
}

main().catch((error) => {
  console.error(colors.red(`Error: ${error.message}`));
  process.exit(1);
});
