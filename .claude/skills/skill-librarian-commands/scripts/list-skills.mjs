#!/usr/bin/env node

import { readdirSync } from "node:fs";
import { join } from "node:path";

const skillsDir = ".claude/skills";
const skills = readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

console.log("\n📚 Available Skills:\n");
skills.forEach((skill, i) => {
  const path = join(skillsDir, skill, "SKILL.md");
  console.log(`${i + 1}. ${skill}`);
  console.log(`   Path: ${path}\n`);
});

console.log(`Total: ${skills.length} skills\n`);
