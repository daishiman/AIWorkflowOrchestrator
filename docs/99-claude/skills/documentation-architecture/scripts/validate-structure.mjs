#!/usr/bin/env node

/**
 * Documentation Structure Validator
 * Purpose: Validate documentation structure against quality standards
 *
 * Usage: node validate-structure.mjs <directory>
 *
 * Exit codes:
 *   0 - Validation passed
 *   1 - General error
 *   2 - Argument error
 *   3 - Directory not found
 *   4 - Validation failed
 */

import * as fs from "fs";
import * as path from "path";

// ANSI color codes
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Documentation Structure Validator

Usage: node validate-structure.mjs <directory>

Options:
  -h, --help    Show this help message

Exit codes:
  0 - Validation passed
  1 - General error
  2 - Argument error
  3 - Directory not found
  4 - Validation failed

Example:
  node validate-structure.mjs .claude/skills/documentation-architecture
`);
}

/**
 * Recursively get all markdown files
 */
function getMarkdownFiles(dirPath, files = []) {
  if (!fs.existsSync(dirPath)) {
    return files;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      getMarkdownFiles(fullPath, files);
    } else if (entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Check file line count
 */
function checkLineCount(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").length;
  return { lines, valid: lines <= 500, warning: lines > 450 && lines <= 500 };
}

/**
 * Check naming convention (kebab-case)
 */
function checkNamingConvention(filePath) {
  const fileName = path.basename(filePath, ".md");
  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  // Allow SKILL, LOGS, EVALS as exceptions
  const exceptions = ["SKILL", "LOGS", "EVALS"];
  if (exceptions.includes(fileName)) {
    return { valid: true, fileName };
  }
  return { valid: kebabCaseRegex.test(fileName), fileName };
}

/**
 * Check directory depth
 */
function checkDirectoryDepth(filePath, baseDir) {
  const relativePath = path.relative(baseDir, filePath);
  const depth = relativePath.split(path.sep).length;
  return { depth, valid: depth <= 4 };
}

/**
 * Check for broken internal links
 */
function checkInternalLinks(filePath, baseDir) {
  const content = fs.readFileSync(filePath, "utf-8");
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const brokenLinks = [];

  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const linkPath = match[2];
    // Skip external links and anchors
    if (linkPath.startsWith("http") || linkPath.startsWith("#")) {
      continue;
    }

    // Skip template variables ({{...}})
    if (linkPath.includes("{{") || match[1].includes("{{")) {
      continue;
    }

    // Skip example/placeholder links in documentation
    if (
      linkPath === "./file.md" ||
      linkPath === "../file.md" ||
      linkPath.includes("example")
    ) {
      continue;
    }

    // Resolve the link path relative to the file
    const absoluteLinkPath = path.resolve(path.dirname(filePath), linkPath);
    if (!fs.existsSync(absoluteLinkPath)) {
      brokenLinks.push({ text: match[1], path: linkPath });
    }
  }

  return { valid: brokenLinks.length === 0, brokenLinks };
}

/**
 * Validate directory structure
 */
function validateStructure(targetDir) {
  const results = {
    lineCount: { passed: 0, failed: 0, warnings: 0, issues: [] },
    naming: { passed: 0, failed: 0, issues: [] },
    depth: { passed: 0, failed: 0, issues: [] },
    links: { passed: 0, failed: 0, issues: [] },
  };

  const files = getMarkdownFiles(targetDir);

  if (files.length === 0) {
    console.log(
      `${colors.yellow}Warning: No markdown files found in ${targetDir}${colors.reset}`,
    );
    return { valid: true, results };
  }

  for (const file of files) {
    const relativePath = path.relative(targetDir, file);

    // Line count check
    const lineCheck = checkLineCount(file);
    if (lineCheck.valid) {
      results.lineCount.passed++;
      if (lineCheck.warning) {
        results.lineCount.warnings++;
      }
    } else {
      results.lineCount.failed++;
      results.lineCount.issues.push({
        file: relativePath,
        lines: lineCheck.lines,
      });
    }

    // Naming convention check
    const namingCheck = checkNamingConvention(file);
    if (namingCheck.valid) {
      results.naming.passed++;
    } else {
      results.naming.failed++;
      results.naming.issues.push({
        file: relativePath,
        fileName: namingCheck.fileName,
      });
    }

    // Directory depth check
    const depthCheck = checkDirectoryDepth(file, targetDir);
    if (depthCheck.valid) {
      results.depth.passed++;
    } else {
      results.depth.failed++;
      results.depth.issues.push({
        file: relativePath,
        depth: depthCheck.depth,
      });
    }

    // Internal links check
    const linksCheck = checkInternalLinks(file, targetDir);
    if (linksCheck.valid) {
      results.links.passed++;
    } else {
      results.links.failed++;
      results.links.issues.push({
        file: relativePath,
        brokenLinks: linksCheck.brokenLinks,
      });
    }
  }

  const valid =
    results.lineCount.failed === 0 &&
    results.naming.failed === 0 &&
    results.depth.failed === 0 &&
    results.links.failed === 0;

  return { valid, results, totalFiles: files.length };
}

/**
 * Print validation results
 */
function printResults(validation) {
  const { valid, results, totalFiles } = validation;

  console.log("=== Documentation Structure Validation ===\n");
  console.log(`Total files checked: ${totalFiles}\n`);

  // Line count results
  console.log("【行数チェック (500行制限)】");
  if (results.lineCount.failed === 0) {
    console.log(
      `${colors.green}  ✓ 全ファイルが制限内${colors.reset} (警告: ${results.lineCount.warnings})`,
    );
  } else {
    console.log(
      `${colors.red}  ✗ ${results.lineCount.failed}ファイルが制限超過${colors.reset}`,
    );
    for (const issue of results.lineCount.issues) {
      console.log(`    - ${issue.file}: ${issue.lines}行`);
    }
  }

  // Naming convention results
  console.log("\n【命名規則チェック (kebab-case)】");
  if (results.naming.failed === 0) {
    console.log(`${colors.green}  ✓ 全ファイルが規則に準拠${colors.reset}`);
  } else {
    console.log(
      `${colors.red}  ✗ ${results.naming.failed}ファイルが規則違反${colors.reset}`,
    );
    for (const issue of results.naming.issues) {
      console.log(`    - ${issue.file}: "${issue.fileName}" は非準拠`);
    }
  }

  // Directory depth results
  console.log("\n【階層深度チェック (4層以下)】");
  if (results.depth.failed === 0) {
    console.log(`${colors.green}  ✓ 全ファイルが制限内${colors.reset}`);
  } else {
    console.log(
      `${colors.red}  ✗ ${results.depth.failed}ファイルが制限超過${colors.reset}`,
    );
    for (const issue of results.depth.issues) {
      console.log(`    - ${issue.file}: 深度${issue.depth}`);
    }
  }

  // Internal links results
  console.log("\n【内部リンクチェック】");
  if (results.links.failed === 0) {
    console.log(`${colors.green}  ✓ 全リンクが有効${colors.reset}`);
  } else {
    console.log(
      `${colors.red}  ✗ ${results.links.failed}ファイルにリンク切れ${colors.reset}`,
    );
    for (const issue of results.links.issues) {
      console.log(`    - ${issue.file}:`);
      for (const link of issue.brokenLinks) {
        console.log(`      - [${link.text}](${link.path})`);
      }
    }
  }

  // Summary
  console.log("\n=== 検証結果 ===");
  if (valid) {
    console.log(`${colors.green}✓ 全チェック合格${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ 一部チェック失敗${colors.reset}`);
  }

  return valid;
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  // Help option
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(0);
  }

  // Argument validation
  if (args.length === 0) {
    console.error(
      `${colors.red}Error: Directory argument required${colors.reset}`,
    );
    showHelp();
    process.exit(2);
  }

  const targetDir = args[0];

  // Directory existence check
  if (!fs.existsSync(targetDir)) {
    console.error(
      `${colors.red}Error: Directory not found: ${targetDir}${colors.reset}`,
    );
    process.exit(3);
  }

  if (!fs.statSync(targetDir).isDirectory()) {
    console.error(
      `${colors.red}Error: Not a directory: ${targetDir}${colors.reset}`,
    );
    process.exit(2);
  }

  // Run validation
  const validation = validateStructure(targetDir);
  const passed = printResults(validation);

  process.exit(passed ? 0 : 4);
}

main();
