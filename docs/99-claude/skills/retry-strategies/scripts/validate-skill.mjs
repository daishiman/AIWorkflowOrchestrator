#!/usr/bin/env node

/**
 * スキル構造検証スクリプト
 *
 * retry-strategies スキルの必須ファイルと基本ルールを検証する。
 */

import { readFileSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

const REQUIRED_FILES = [
  "SKILL.md",
  "agents/assess-failure-profile.md",
  "agents/design-retry-policy.md",
  "agents/validate-rollout.md",
  "references/Level1_basics.md",
  "references/Level2_intermediate.md",
  "references/Level3_advanced.md",
  "references/Level4_expert.md",
  "references/exponential-backoff.md",
  "references/circuit-breaker.md",
  "references/bulkhead-pattern.md",
  "references/timeout-strategies.md",
  "assets/circuit-breaker-template.ts",
  "assets/retry-wrapper-template.ts",
  "scripts/analyze-retry-config.mjs",
  "scripts/log_usage.mjs",
  "scripts/validate-skill.mjs",
];

const REQUIRED_LINKS = [
  "agents/assess-failure-profile.md",
  "agents/design-retry-policy.md",
  "agents/validate-rollout.md",
  "references/Level1_basics.md",
  "references/Level2_intermediate.md",
  "references/Level3_advanced.md",
  "references/Level4_expert.md",
  "references/exponential-backoff.md",
  "references/circuit-breaker.md",
  "references/bulkhead-pattern.md",
  "references/timeout-strategies.md",
  "assets/circuit-breaker-template.ts",
  "assets/retry-wrapper-template.ts",
  "scripts/analyze-retry-config.mjs",
  "scripts/validate-skill.mjs",
  "scripts/log_usage.mjs",
];

function showHelp() {
  console.log(`
Usage: node scripts/validate-skill.mjs [options]

Options:
  --path <dir>   対象スキルディレクトリ（省略時は現在のスクリプト位置）
  -h, --help     ヘルプを表示
`);
}

function assertExists(path, label) {
  try {
    statSync(path);
  } catch (error) {
    console.error(`Missing: ${label} (${path})`);
    process.exit(EXIT_FILE_MISSING);
  }
}

function getLineCount(path) {
  const content = readFileSync(path, "utf-8");
  return content.split(/\r?\n/).length;
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

function extractDescription(frontmatter) {
  const lines = frontmatter.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith("description:"));
  if (start === -1) {
    return null;
  }
  const descLines = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^[a-zA-Z0-9_-]+:/.test(line)) {
      break;
    }
    descLines.push(line);
  }
  return descLines.join("\n").trim();
}

function validateSkill(skillDir) {
  for (const file of REQUIRED_FILES) {
    assertExists(join(skillDir, file), file);
  }

  const skillPath = join(skillDir, "SKILL.md");
  const skillContent = readFileSync(skillPath, "utf-8");

  const lineCount = getLineCount(skillPath);
  if (lineCount > 500) {
    console.error(`Line limit exceeded: SKILL.md (${lineCount}/500)`);
    process.exit(EXIT_VALIDATION_ERROR);
  }

  const frontmatter = extractFrontmatter(skillContent);
  if (!frontmatter) {
    console.error("Frontmatter not found in SKILL.md");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  if (!/^name:\s*retry-strategies\s*$/m.test(frontmatter)) {
    console.error("Invalid or missing name in frontmatter");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  if (!frontmatter.includes("Anchors:")) {
    console.error("Anchors not found in description");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  if (!frontmatter.includes("Trigger:")) {
    console.error("Trigger not found in description");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  if (!/Use when /m.test(frontmatter)) {
    console.error("Trigger must include 'Use when' statement");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  const anchorMatches = frontmatter.match(/^\s*•\s+/gm) || [];
  if (anchorMatches.length < 1 || anchorMatches.length > 5) {
    console.error("Anchors must be between 1 and 5 items");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  const description = extractDescription(frontmatter);
  if (!description) {
    console.error("Description block not found in frontmatter");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  if (description.length > 1024) {
    console.error(
      `Description exceeds 1024 characters (${description.length})`,
    );
    process.exit(EXIT_VALIDATION_ERROR);
  }

  if (/[\[\]]/.test(description)) {
    console.error("Description contains forbidden square brackets");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  const missingLinks = REQUIRED_LINKS.filter(
    (link) => !skillContent.includes(link),
  );
  if (missingLinks.length > 0) {
    console.error(`Missing references in SKILL.md: ${missingLinks.join(", ")}`);
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log("✓ retry-strategies skill structure validated");
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const pathIndex = args.indexOf("--path");
  if (pathIndex !== -1) {
    if (!args[pathIndex + 1]) {
      console.error("Error: --path requires a directory path");
      process.exit(EXIT_ARGS_ERROR);
    }
  }

  const skillDir =
    pathIndex !== -1 ? args[pathIndex + 1] : join(__dirname, "..");

  try {
    validateSkill(skillDir);
    process.exit(EXIT_SUCCESS);
  } catch (error) {
    console.error(error.message);
    process.exit(EXIT_ERROR);
  }
}

main();
