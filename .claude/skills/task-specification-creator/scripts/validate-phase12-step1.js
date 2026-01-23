#!/usr/bin/env node

/**
 * Phase 12 Step 1 Validation Script
 *
 * Phase 12 Task 12-2 Step 1 の必須要件が完了しているかを検証するスクリプト。
 *
 * 検証項目:
 * 1. システム仕様書に「完了タスク」セクションが追加されているか
 * 2. 関連ドキュメントセクションに実装ガイドリンクが追加されているか
 * 3. 変更履歴セクションにバージョンが追記されているか
 *
 * 使用方法:
 *   node scripts/validate-phase12-step1.js --workflow <workflow-dir> --spec <spec-file>
 *
 * 例:
 *   node scripts/validate-phase12-step1.js \
 *     --workflow docs/30-workflows/shared-type-export-03-verification \
 *     --spec .claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md
 */

import fs from "fs";
import path from "path";

// Parse command line arguments
const args = process.argv.slice(2);
let workflowDir = null;
let specFile = null;
let taskId = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--workflow" && args[i + 1]) {
    workflowDir = args[i + 1];
    i++;
  } else if (args[i] === "--spec" && args[i + 1]) {
    specFile = args[i + 1];
    i++;
  } else if (args[i] === "--task-id" && args[i + 1]) {
    taskId = args[i + 1];
    i++;
  }
}

if (!workflowDir || !specFile) {
  console.error("Usage: node validate-phase12-step1.js --workflow <workflow-dir> --spec <spec-file> [--task-id <task-id>]");
  console.error("");
  console.error("Options:");
  console.error("  --workflow <dir>   Workflow directory path");
  console.error("  --spec <file>      System specification file to validate");
  console.error("  --task-id <id>     Task ID to search for (optional)");
  process.exit(1);
}

// Resolve paths
const resolvedWorkflowDir = path.resolve(workflowDir);
const resolvedSpecFile = path.resolve(specFile);

// Validation results
const results = {
  completedTasksSection: { passed: false, details: "" },
  implementationGuideLink: { passed: false, details: "" },
  changelogEntry: { passed: false, details: "" },
};

// Check if files exist
if (!fs.existsSync(resolvedSpecFile)) {
  console.error(`Error: Specification file not found: ${resolvedSpecFile}`);
  process.exit(1);
}

// Read specification file
const specContent = fs.readFileSync(resolvedSpecFile, "utf-8");
const specLines = specContent.split("\n");

// 1. Check for "完了タスク" section
const completedTasksPatterns = [
  /^##\s*完了タスク/i,
  /^##\s*Completed Tasks/i,
  /^###\s*完了タスク/i,
];

let hasCompletedTasksSection = false;
let completedTasksSectionLine = -1;

for (let i = 0; i < specLines.length; i++) {
  for (const pattern of completedTasksPatterns) {
    if (pattern.test(specLines[i])) {
      hasCompletedTasksSection = true;
      completedTasksSectionLine = i + 1;
      break;
    }
  }
  if (hasCompletedTasksSection) break;
}

if (hasCompletedTasksSection) {
  results.completedTasksSection.passed = true;
  results.completedTasksSection.details = `Found at line ${completedTasksSectionLine}`;

  // If task ID provided, check if it's listed
  if (taskId) {
    const taskIdRegex = new RegExp(taskId, "i");
    let taskFound = false;
    for (let i = completedTasksSectionLine; i < specLines.length; i++) {
      if (specLines[i].match(/^##/)) break; // Stop at next section
      if (taskIdRegex.test(specLines[i])) {
        taskFound = true;
        break;
      }
    }
    if (!taskFound) {
      results.completedTasksSection.passed = false;
      results.completedTasksSection.details = `Section exists but task ${taskId} not found`;
    }
  }
} else {
  results.completedTasksSection.details = "Section not found";
}

// 2. Check for implementation guide link in "関連ドキュメント" section
const relatedDocsPatterns = [
  /^##\s*関連ドキュメント/i,
  /^##\s*Related Documents/i,
  /^###\s*関連ドキュメント/i,
  /^###\s*実装ガイド/i,
];

let hasRelatedDocsSection = false;
let hasImplementationGuideLink = false;

for (let i = 0; i < specLines.length; i++) {
  for (const pattern of relatedDocsPatterns) {
    if (pattern.test(specLines[i])) {
      hasRelatedDocsSection = true;
      // Look for implementation guide link in the following lines
      for (let j = i + 1; j < Math.min(i + 30, specLines.length); j++) {
        if (specLines[j].match(/^##[^#]/)) break; // Stop at next major section
        if (
          specLines[j].includes("implementation-guide") ||
          specLines[j].includes("実装ガイド")
        ) {
          hasImplementationGuideLink = true;
          results.implementationGuideLink.details = `Found at line ${j + 1}`;
          break;
        }
      }
      break;
    }
  }
  if (hasRelatedDocsSection) break;
}

if (hasImplementationGuideLink) {
  results.implementationGuideLink.passed = true;
} else if (hasRelatedDocsSection) {
  results.implementationGuideLink.details = "Related docs section exists but implementation guide link not found";
} else {
  results.implementationGuideLink.details = "Related docs section not found";
}

// 3. Check for changelog entry
const changelogPatterns = [
  /^##\s*変更履歴/i,
  /^##\s*Changelog/i,
  /^##\s*Change History/i,
];

let hasChangelogSection = false;
let hasRecentEntry = false;
const today = new Date();
const recentDatePatterns = [
  new RegExp(`${today.getFullYear()}-\\d{2}-\\d{2}`),
  new RegExp(`${today.getFullYear() - 1}-\\d{2}-\\d{2}`), // Also check last year
];

for (let i = 0; i < specLines.length; i++) {
  for (const pattern of changelogPatterns) {
    if (pattern.test(specLines[i])) {
      hasChangelogSection = true;
      // Look for recent date entry in the following lines
      for (let j = i + 1; j < Math.min(i + 20, specLines.length); j++) {
        if (specLines[j].match(/^##[^#]/)) break;
        for (const datePattern of recentDatePatterns) {
          if (datePattern.test(specLines[j])) {
            hasRecentEntry = true;
            results.changelogEntry.details = `Found recent entry at line ${j + 1}`;
            break;
          }
        }
        if (hasRecentEntry) break;
      }
      break;
    }
  }
  if (hasChangelogSection) break;
}

if (hasRecentEntry) {
  results.changelogEntry.passed = true;
} else if (hasChangelogSection) {
  results.changelogEntry.details = "Changelog section exists but no recent entry found";
} else {
  results.changelogEntry.details = "Changelog section not found";
}

// Output results
console.log("=".repeat(60));
console.log("Phase 12 Step 1 Validation Results");
console.log("=".repeat(60));
console.log(`Workflow: ${workflowDir}`);
console.log(`Spec File: ${specFile}`);
if (taskId) console.log(`Task ID: ${taskId}`);
console.log("-".repeat(60));

const checkMark = "✅";
const crossMark = "❌";

console.log("\n## Validation Items\n");

console.log(`${results.completedTasksSection.passed ? checkMark : crossMark} 完了タスクセクション`);
console.log(`   ${results.completedTasksSection.details}`);

console.log(`\n${results.implementationGuideLink.passed ? checkMark : crossMark} 実装ガイドリンク`);
console.log(`   ${results.implementationGuideLink.details}`);

console.log(`\n${results.changelogEntry.passed ? checkMark : crossMark} 変更履歴エントリ`);
console.log(`   ${results.changelogEntry.details}`);

// Overall result
const allPassed = Object.values(results).every((r) => r.passed);
console.log("\n" + "=".repeat(60));

if (allPassed) {
  console.log(`${checkMark} Phase 12 Step 1: PASS - All mandatory items completed`);
  process.exit(0);
} else {
  console.log(`${crossMark} Phase 12 Step 1: FAIL - Some mandatory items are missing`);
  console.log("\nRequired actions:");
  if (!results.completedTasksSection.passed) {
    console.log("  - Add '## 完了タスク' section with task completion record");
  }
  if (!results.implementationGuideLink.passed) {
    console.log("  - Add implementation guide link to '関連ドキュメント' section");
  }
  if (!results.changelogEntry.passed) {
    console.log("  - Add version entry to '変更履歴' section");
  }
  process.exit(1);
}
