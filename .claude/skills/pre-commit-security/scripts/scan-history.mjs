#!/usr/bin/env node
/**
 * Git履歴スキャンスクリプト
 * リポジトリの履歴全体をスキャンして既存のシークレット漏洩を検出する
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../../../..");

// コマンドライン引数解析
const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const reportPath =
  args.find((arg) => arg.startsWith("--report="))?.split("=")[1] ||
  "leak-report.json";
const logOpts =
  args.find((arg) => arg.startsWith("--log-opts="))?.split("=")[1] || "--all";

console.log("🔍 Git History Scanner");
console.log("======================");
console.log(`Repository: ${PROJECT_ROOT}`);
console.log(`Log Options: ${logOpts}`);
console.log(`Report Path: ${reportPath}`);
console.log(`Verbose: ${verbose}\n`);

async function checkToolAvailability() {
  console.log("🔧 Checking tool availability...\n");

  const tools = {
    "git-secrets": "git-secrets",
    gitleaks: "gitleaks",
  };

  const available = {};

  for (const [name, cmd] of Object.entries(tools)) {
    try {
      await execAsync(`command -v ${cmd}`);
      console.log(`  ✅ ${name} is available`);
      available[name] = true;
    } catch {
      console.log(`  ⚠️  ${name} is not available`);
      available[name] = false;
    }
  }

  console.log("");
  return available;
}

async function scanWithGitSecrets() {
  console.log("📦 Scanning with git-secrets...\n");

  try {
    const { stdout, stderr } = await execAsync(
      `cd "${PROJECT_ROOT}" && git secrets --scan-history`,
    );

    console.log("✅ No secrets found in Git history");
    if (verbose && stdout) {
      console.log("\nOutput:");
      console.log(stdout);
    }

    return { success: true, leaks: [] };
  } catch (error) {
    console.log("❌ Secrets detected in Git history!");

    if (error.stdout) {
      console.log("\n🚨 Detected secrets:");
      console.log(error.stdout);
    }

    if (error.stderr) {
      console.log("\nDetails:");
      console.log(error.stderr);
    }

    // 簡易的な結果パース
    const leaks = [];
    if (error.stdout) {
      const lines = error.stdout.split("\n");
      for (const line of lines) {
        if (line.trim()) {
          leaks.push({
            line: line.trim(),
            tool: "git-secrets",
          });
        }
      }
    }

    return { success: false, leaks };
  }
}

async function scanWithGitleaks() {
  console.log("📦 Scanning with gitleaks...\n");

  try {
    const cmd = `cd "${PROJECT_ROOT}" && gitleaks detect --verbose --log-opts="${logOpts}" --report-format json --report-path "${reportPath}"`;

    if (verbose) {
      console.log(`Command: ${cmd}\n`);
    }

    const { stdout } = await execAsync(cmd);

    console.log("✅ No secrets found in Git history");
    if (verbose && stdout) {
      console.log("\nOutput:");
      console.log(stdout);
    }

    return { success: true, leaks: [] };
  } catch (error) {
    console.log("❌ Secrets detected in Git history!");

    // レポートファイル読み取り
    try {
      const reportFullPath = path.resolve(PROJECT_ROOT, reportPath);
      const reportContent = await fs.readFile(reportFullPath, "utf8");
      const report = JSON.parse(reportContent);

      console.log(`\n🚨 Detected ${report.length || 0} secret(s):\n`);

      for (const leak of report) {
        console.log(`  File: ${leak.File || leak.file}`);
        console.log(`  Line: ${leak.StartLine || leak.line || "N/A"}`);
        console.log(`  Rule: ${leak.RuleID || leak.rule || "N/A"}`);
        console.log(
          `  Description: ${leak.Description || leak.description || "N/A"}`,
        );
        console.log(`  Commit: ${leak.Commit || leak.commit || "N/A"}`);
        console.log(`  Author: ${leak.Author || leak.author || "N/A"}`);
        console.log(`  Date: ${leak.Date || leak.date || "N/A"}`);
        console.log("");
      }

      return { success: false, leaks: report };
    } catch (readError) {
      console.error(`\n⚠️  Could not read report file: ${readError.message}`);

      if (error.stdout) {
        console.log("\nStdout:");
        console.log(error.stdout);
      }

      if (error.stderr) {
        console.log("\nStderr:");
        console.log(error.stderr);
      }

      return { success: false, leaks: [] };
    }
  }
}

async function generateActionPlan(leaks) {
  console.log("\n\n📋 Action Plan");
  console.log("==============\n");

  if (leaks.length === 0) {
    console.log("No leaks detected. No action required.");
    return;
  }

  console.log("⚠️  Immediate actions required:\n");

  console.log("1. Rotate exposed secrets");
  console.log("   - Invalidate all detected secrets immediately");
  console.log("   - Generate new secrets");
  console.log("   - Update production systems\n");

  console.log("2. Investigate impact");
  console.log("   - Check access logs for unauthorized usage");
  console.log("   - Determine if secrets were exposed publicly");
  console.log("   - Assess potential data breach\n");

  console.log("3. Clean Git history");
  console.log("   - Option A: BFG Repo-Cleaner");
  console.log("     $ brew install bfg");
  console.log("     $ bfg --delete-files credentials.json your-repo.git");
  console.log("     $ git push --force\n");

  console.log("   - Option B: git filter-repo");
  console.log("     $ pip install git-filter-repo");
  console.log("     $ git filter-repo --path-match secrets/ --invert-paths");
  console.log("     $ git push --force\n");

  console.log("4. Team coordination");
  console.log("   - Notify all team members before force push");
  console.log("   - Ensure everyone re-clones the repository");
  console.log("   - Update CI/CD pipelines\n");

  console.log("5. Document incident");
  console.log("   - Create incident report");
  console.log("   - Record timeline of exposure");
  console.log("   - Document remediation steps\n");

  console.log("6. Prevent future leaks");
  console.log("   - Ensure pre-commit hooks are installed");
  console.log("   - Add CI/CD scanning");
  console.log("   - Review access control policies\n");

  console.log("⚠️  WARNING: Do NOT commit or push until secrets are rotated!");
}

async function main() {
  try {
    const available = await checkToolAvailability();

    let scanResult = null;

    // gitleaksを優先（より詳細なレポート）
    if (available.gitleaks) {
      scanResult = await scanWithGitleaks();
    } else if (available["git-secrets"]) {
      scanResult = await scanWithGitSecrets();
    } else {
      console.error(
        "\n❌ No scanning tool available. Please install git-secrets or gitleaks.",
      );
      console.error("\nInstallation:");
      console.error("  macOS:  brew install git-secrets");
      console.error("          brew install gitleaks");
      console.error("  Linux:  See https://github.com/awslabs/git-secrets");
      console.error("          See https://github.com/zricethezav/gitleaks");
      process.exit(1);
    }

    // アクションプラン生成
    if (scanResult) {
      await generateActionPlan(scanResult.leaks);
    }

    // 終了コード
    if (scanResult && !scanResult.success) {
      console.log("\n❌ Scan completed with findings");
      process.exit(1);
    } else {
      console.log("\n✅ Scan completed successfully");
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Scan failed:", error.message);
    if (verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
