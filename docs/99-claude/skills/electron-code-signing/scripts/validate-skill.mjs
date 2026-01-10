#!/usr/bin/env node

/**
 * electron-code-signing スキル構造検証スクリプト
 */

import { existsSync, readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(__dirname, "..");

const checks = [];
let errors = 0;
let warnings = 0;

function check(name, condition, severity = "error") {
  const status = condition ? "✓" : severity === "error" ? "✗" : "⚠";
  checks.push({ name, passed: condition, severity });
  if (!condition) {
    if (severity === "error") errors++;
    else warnings++;
  }
  console.log(`${status} ${name}`);
}

function main() {
  console.log("=== electron-code-signing スキル構造検証 ===\n");

  check("SKILL.md exists", existsSync(join(SKILL_ROOT, "SKILL.md")));

  if (existsSync(join(SKILL_ROOT, "SKILL.md"))) {
    const content = readFileSync(join(SKILL_ROOT, "SKILL.md"), "utf-8");
    check("SKILL.md has frontmatter", content.startsWith("---"));
    check("SKILL.md has name field", content.includes("name:"));
    check("SKILL.md has description field", content.includes("description:"));
    check("SKILL.md has Anchors", content.includes("Anchors:"));
    check("SKILL.md has Trigger", content.includes("Trigger:"));
    check("SKILL.md has allowed-tools", content.includes("allowed-tools:"));
    check("Trigger is in English", /Trigger:\s*\n\s*Use when/i.test(content));
  }

  check("agents/ directory exists", existsSync(join(SKILL_ROOT, "agents")));
  check(
    "references/ directory exists",
    existsSync(join(SKILL_ROOT, "references")),
  );
  check("scripts/ directory exists", existsSync(join(SKILL_ROOT, "scripts")));
  check("assets/ directory exists", existsSync(join(SKILL_ROOT, "assets")));

  if (existsSync(join(SKILL_ROOT, "agents"))) {
    const agents = readdirSync(join(SKILL_ROOT, "agents")).filter((f) =>
      f.endsWith(".md"),
    );
    check("Has at least one agent", agents.length > 0);

    for (const agent of agents) {
      const agentContent = readFileSync(
        join(SKILL_ROOT, "agents", agent),
        "utf-8",
      );
      check(
        `${agent} has Task仕様書 format`,
        agentContent.includes("## 1. メタ情報") ||
          agentContent.includes("# Task仕様書") ||
          agentContent.includes("## メタ情報"),
        "warning",
      );
    }
  }

  if (existsSync(join(SKILL_ROOT, "references"))) {
    const refs = readdirSync(join(SKILL_ROOT, "references")).filter((f) =>
      f.endsWith(".md"),
    );
    check("Has at least one reference", refs.length > 0);

    const hasLevelFiles = refs.some((f) => /^Level\d/.test(f));
    check("No Level1-4 files (deprecated)", !hasLevelFiles);
  }

  if (existsSync(join(SKILL_ROOT, "scripts"))) {
    const scripts = readdirSync(join(SKILL_ROOT, "scripts"));
    check("Has log_usage.mjs", scripts.includes("log_usage.mjs"));
    check("Has validate-skill.mjs", scripts.includes("validate-skill.mjs"));
  }

  console.log("\n=== 検証結果 ===");
  console.log(
    `Passed: ${checks.filter((c) => c.passed).length}/${checks.length}`,
  );
  console.log(`Errors: ${errors}`);
  console.log(`Warnings: ${warnings}`);

  process.exit(errors > 0 ? 1 : 0);
}

main();
