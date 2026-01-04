#!/usr/bin/env node
/**
 * validate-skill-selection.mjs - スキル選定の検証スクリプト
 *
 * 使用方法:
 *   node scripts/validate-skill-selection.mjs <workflow-dir> [--skills-dir <path>]
 *
 * 例:
 *   node scripts/validate-skill-selection.mjs docs/30-workflows/chat-llm-switching
 *   node scripts/validate-skill-selection.mjs docs/30-workflows/chat-llm-switching --skills-dir .claude/skills
 *
 * 検証項目:
 *   - 選定されたスキルが .claude/skills/ に存在するか
 *   - スキル選定理由が記載されているか
 *   - 各Phaseで使用されているスキルの統計
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

// デフォルト設定
const DEFAULT_SKILLS_DIR = ".claude/skills";

class SkillSelectionValidator {
  constructor(workflowDir, skillsDir) {
    this.workflowDir = workflowDir;
    this.skillsDir = skillsDir;
    this.errors = [];
    this.warnings = [];
    this.passes = [];
    this.skillUsage = new Map(); // skill -> [phases]
    this.availableSkills = new Set();
  }

  validate() {
    console.log(`\nスキル選定を検証中: ${this.workflowDir}\n`);
    console.log(`スキルディレクトリ: ${this.skillsDir}\n`);

    // ディレクトリ存在確認
    if (!existsSync(this.workflowDir)) {
      this.errors.push(
        `ワークフローディレクトリが存在しません: ${this.workflowDir}`,
      );
      return this.report();
    }

    // 利用可能スキル一覧を取得
    this.loadAvailableSkills();

    // 各Phaseファイルからスキル選定を抽出・検証
    const phaseFiles = readdirSync(this.workflowDir).filter(
      (f) => f.startsWith("phase-") && f.endsWith(".md"),
    );

    for (const file of phaseFiles) {
      this.validatePhaseSkills(file);
    }

    // スキル使用統計を生成
    this.generateUsageStats();

    return this.report();
  }

  loadAvailableSkills() {
    if (!existsSync(this.skillsDir)) {
      this.warnings.push(`スキルディレクトリが存在しません: ${this.skillsDir}`);
      return;
    }

    const entries = readdirSync(this.skillsDir);
    for (const entry of entries) {
      const skillPath = join(this.skillsDir, entry);
      const skillMdPath = join(skillPath, "SKILL.md");

      if (statSync(skillPath).isDirectory() && existsSync(skillMdPath)) {
        this.availableSkills.add(entry);
      }
    }

    console.log(`利用可能スキル: ${this.availableSkills.size}個\n`);
  }

  validatePhaseSkills(file) {
    const filePath = join(this.workflowDir, file);
    const content = readFileSync(filePath, "utf-8");

    // Phase番号を抽出
    const phaseMatch = file.match(/phase-(-?\d+)-/);
    const phaseNum = phaseMatch ? phaseMatch[1] : "?";

    // 使用スキルセクションを抽出
    const skillSectionMatch = content.match(
      /^##\s+使用スキル[\s\S]*?(?=^##\s|\z)/m,
    );

    if (!skillSectionMatch) {
      this.warnings.push(`Phase ${phaseNum}: 使用スキルセクションがありません`);
      return;
    }

    const skillSection = skillSectionMatch[0];

    // スキル名を抽出 (形式: `skill-name`: 理由)
    const skillPattern = /`([a-z][a-z0-9-]*)`(?::\s*(.*))?/g;
    const skills = [...skillSection.matchAll(skillPattern)];

    if (skills.length === 0) {
      // Phase 11 (PR作成) はスキル不使用が許容される
      if (phaseNum === "11") {
        this.passes.push(`Phase ${phaseNum}: スキル不使用（直接実行Phase）`);
      } else {
        this.warnings.push(`Phase ${phaseNum}: スキルが選定されていません`);
      }
      return;
    }

    for (const [, skillName, reason] of skills) {
      // スキル存在確認
      if (!this.availableSkills.has(skillName)) {
        this.errors.push(
          `Phase ${phaseNum}: スキル「${skillName}」は .claude/skills/ に存在しません`,
        );
      } else {
        // 使用統計に追加
        if (!this.skillUsage.has(skillName)) {
          this.skillUsage.set(skillName, []);
        }
        this.skillUsage.get(skillName).push(phaseNum);
      }

      // 選定理由確認
      if (!reason || reason.trim().length === 0) {
        this.warnings.push(
          `Phase ${phaseNum}: スキル「${skillName}」の選定理由がありません`,
        );
      } else if (reason.trim().length < 5) {
        this.warnings.push(
          `Phase ${phaseNum}: スキル「${skillName}」の選定理由が短すぎます`,
        );
      }
    }

    this.passes.push(`Phase ${phaseNum}: ${skills.length}個のスキルを検証完了`);
  }

  generateUsageStats() {
    console.log("=".repeat(60));
    console.log("スキル使用統計");
    console.log("=".repeat(60));

    if (this.skillUsage.size === 0) {
      console.log("\n使用されているスキルはありません。\n");
      return;
    }

    console.log("\n| スキル名 | 使用Phase |\n| -------- | --------- |");

    const sortedSkills = [...this.skillUsage.entries()].sort(
      (a, b) => b[1].length - a[1].length,
    );

    for (const [skill, phases] of sortedSkills) {
      console.log(`| ${skill} | ${phases.join(", ")} |`);
    }

    console.log(
      `\n合計: ${this.skillUsage.size}種類のスキルが使用されています。\n`,
    );
  }

  report() {
    console.log("=".repeat(60));
    console.log("検証結果");
    console.log("=".repeat(60));

    if (this.errors.length > 0) {
      console.log("\n❌ エラー:");
      this.errors.forEach((e) => console.log(`  - ${e}`));
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  警告:");
      this.warnings.forEach((w) => console.log(`  - ${w}`));
    }

    if (this.passes.length > 0) {
      console.log("\n✅ パス:");
      this.passes.forEach((p) => console.log(`  - ${p}`));
    }

    console.log("\n" + "-".repeat(60));
    console.log(
      `結果: ${this.errors.length === 0 ? "✓ 検証成功" : "✗ 検証失敗"} ` +
        `(${this.passes.length}項目パス, ${this.errors.length}エラー, ${this.warnings.length}警告)`,
    );

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      passes: this.passes,
      skillUsage: Object.fromEntries(this.skillUsage),
    };
  }
}

// 引数パース
function parseArgs(args) {
  const result = { workflowDir: null, skillsDir: DEFAULT_SKILLS_DIR };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--skills-dir" && args[i + 1]) {
      result.skillsDir = args[i + 1];
      i++;
    } else if (!args[i].startsWith("--")) {
      result.workflowDir = args[i];
    }
  }

  return result;
}

// メイン処理
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.workflowDir) {
    console.error(
      "Usage: node validate-skill-selection.mjs <workflow-dir> [--skills-dir <path>]",
    );
    console.error(
      "Example: node validate-skill-selection.mjs docs/30-workflows/chat-llm-switching",
    );
    process.exit(1);
  }

  const validator = new SkillSelectionValidator(
    args.workflowDir,
    args.skillsDir,
  );
  const result = validator.validate();

  process.exit(result.success ? 0 : 1);
}

main();
