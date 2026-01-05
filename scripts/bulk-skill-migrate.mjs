#!/usr/bin/env node

/**
 * 18-skills.md仕様への一括移行スクリプト
 * - resources/ → references/
 * - templates/ → assets/
 * - CHANGELOG.md削除
 */

import { readdir } from "fs/promises";
import { rename, unlink, access } from "fs/promises";
import { join } from "path";
import { constants } from "fs";

const SKILLS_DIR = ".claude/skills";

const SKILLS_TO_MIGRATE = [
  "upgrade-strategies",
  "use-case-modeling",
  "user-centric-writing",
  "user-story-mapping",
  "value-object-patterns",
  "vector-search-alternatives",
  "version-control-for-docs",
  "visual-regression-testing",
  "vitest-advanced",
  "web-performance",
  "websocket-patterns",
  "workflow-security",
  "workflow-templates",
  "zero-trust-security",
  "zod-validation",
];

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function migrateSkill(skillName) {
  const skillPath = join(SKILLS_DIR, skillName);
  console.log(`\n=== ${skillName} ===`);

  // CHANGELOG.md削除
  const changelogPath = join(skillPath, "CHANGELOG.md");
  if (await exists(changelogPath)) {
    await unlink(changelogPath);
    console.log("  ✓ Deleted CHANGELOG.md");
  }

  // resources/ → references/
  const resourcesPath = join(skillPath, "resources");
  const referencesPath = join(skillPath, "references");
  if (await exists(resourcesPath)) {
    await rename(resourcesPath, referencesPath);
    console.log("  ✓ Renamed resources/ → references/");
  }

  // templates/ → assets/
  const templatesPath = join(skillPath, "templates");
  const assetsPath = join(skillPath, "assets");
  if (await exists(templatesPath)) {
    await rename(templatesPath, assetsPath);
    console.log("  ✓ Renamed templates/ → assets/");
  }

  console.log(`  ✓ ${skillName} migration completed`);
}

async function main() {
  console.log("Starting bulk skill migration...\n");

  for (const skill of SKILLS_TO_MIGRATE) {
    try {
      await migrateSkill(skill);
    } catch (error) {
      console.error(`  ✗ Error migrating ${skill}:`, error.message);
    }
  }

  console.log("\n✓ All migrations completed");
}

main().catch(console.error);
