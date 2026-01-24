/**
 * Manual test script for SkillScanner real environment testing
 *
 * Usage:
 *   npx ts-node --esm apps/desktop/src/main/services/skill/__manual-tests__/scan-real-skills.ts
 */
import { SkillScanner } from "../SkillScanner";

async function main() {
  console.log("=== SkillScanner Manual Test ===\n");

  // Performance measurement
  const iterations = 5;
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const scanner = new SkillScanner();
    const start = Date.now();
    const skills = await scanner.scanAll();
    const duration = Date.now() - start;
    times.push(duration);

    if (i === 0) {
      console.log(`Found ${skills.length} skills:\n`);

      // Group by readonly flag
      const aiworkflowSkills = skills.filter((s) => !s.readonly);
      const claudeSkills = skills.filter((s) => s.readonly);

      console.log(`\n--- aiworkflow skills (readonly: false) ---`);
      aiworkflowSkills.forEach((skill) => {
        console.log(`\n- ${skill.name}`);
        console.log(`  path: ${skill.path}`);
        console.log(`  description: ${skill.description.substring(0, 80)}...`);
        console.log(`  agents: ${skill.agents.length}`);
        console.log(`  references: ${skill.references.length}`);
        console.log(`  scripts: ${skill.scripts.length}`);
        console.log(`  assets: ${skill.assets.length}`);
        console.log(`  schemas: ${skill.schemas.length}`);
        console.log(`  indexes: ${skill.indexes.length}`);
        console.log(`  otherFiles: ${skill.otherFiles.length}`);
        if (skill.allowedTools) {
          console.log(`  allowedTools: ${skill.allowedTools.join(", ")}`);
        }
      });

      console.log(`\n--- claude skills (readonly: true) ---`);
      claudeSkills.forEach((skill) => {
        console.log(`\n- ${skill.name}`);
        console.log(`  path: ${skill.path}`);
        console.log(`  description: ${skill.description.substring(0, 80)}...`);
      });
    }
  }

  // Performance summary
  console.log("\n\n=== Performance Results ===");
  console.log(`Iterations: ${iterations}`);
  console.log(`Times: ${times.join("ms, ")}ms`);
  console.log(
    `Average: ${Math.round(times.reduce((a, b) => a + b, 0) / times.length)}ms`,
  );
  console.log(`Min: ${Math.min(...times)}ms`);
  console.log(`Max: ${Math.max(...times)}ms`);

  // Memory usage
  const used = process.memoryUsage();
  console.log("\n=== Memory Usage ===");
  console.log(`RSS: ${Math.round(used.rss / 1024 / 1024)}MB`);
  console.log(`Heap Used: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);
  console.log(`Heap Total: ${Math.round(used.heapTotal / 1024 / 1024)}MB`);
}

main().catch(console.error);
