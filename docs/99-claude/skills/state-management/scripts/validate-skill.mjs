#!/usr/bin/env node

import { existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillDir = join(__dirname, "..");

const requiredFiles = ["SKILL.md"];
const requiredDirs = ["agents", "assets", "references", "scripts"];

const errors = [];

for (const file of requiredFiles) {
  if (!existsSync(join(skillDir, file))) {
    errors.push(`missing file: ${file}`);
  }
}

for (const dir of requiredDirs) {
  const fullPath = join(skillDir, dir);
  if (!existsSync(fullPath)) {
    errors.push(`missing dir: ${dir}`);
    continue;
  }
  const files = readdirSync(fullPath).filter((entry) => !entry.startsWith("."));
  if (files.length === 0) {
    errors.push(`empty dir: ${dir}`);
  }
}

if (errors.length > 0) {
  console.error("Skill validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Skill validation passed.");
