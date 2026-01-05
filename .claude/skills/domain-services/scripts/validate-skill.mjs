#!/usr/bin/env node

/**
 * domain-services スキル検証スクリプト
 *
 * 18-skills.md仕様に基づいてスキル構造を検証
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = dirname(__dirname);

const errors = [];
const warnings = [];

/**
 * 必須ファイルの存在確認
 */
function checkRequiredFiles() {
  const required = ["SKILL.md", "EVALS.json", "LOGS.md"];
  const requiredDirs = ["agents", "references", "scripts", "assets"];

  for (const file of required) {
    const path = join(SKILL_DIR, file);
    if (!existsSync(path)) {
      errors.push(`必須ファイルがありません: ${file}`);
    }
  }

  for (const dir of requiredDirs) {
    const path = join(SKILL_DIR, dir);
    if (!existsSync(path) || !statSync(path).isDirectory()) {
      warnings.push(`推奨ディレクトリがありません: ${dir}/`);
    }
  }
}

/**
 * SKILL.md のフロントマター検証
 */
function checkSkillMd() {
  const skillPath = join(SKILL_DIR, "SKILL.md");
  if (!existsSync(skillPath)) return;

  const content = readFileSync(skillPath, "utf-8");
  const lines = content.split("\n");

  if (lines.length > 500) {
    errors.push(`SKILL.md が500行を超えています: ${lines.length}行`);
  }

  if (!content.startsWith("---")) {
    errors.push("SKILL.md にフロントマターがありません");
    return;
  }

  const frontmatterEnd = content.indexOf("---", 3);
  if (frontmatterEnd === -1) {
    errors.push("SKILL.md のフロントマターが閉じられていません");
    return;
  }

  const frontmatter = content.substring(3, frontmatterEnd);

  if (!frontmatter.includes("name:")) {
    errors.push("SKILL.md: name フィールドがありません");
  }
  if (!frontmatter.includes("description:")) {
    errors.push("SKILL.md: description フィールドがありません");
  }
  if (!frontmatter.includes("allowed-tools:")) {
    errors.push("SKILL.md: allowed-tools フィールドがありません");
  }
  if (!frontmatter.includes("Anchors:")) {
    warnings.push("SKILL.md: Anchors セクションがありません");
  }
  if (!frontmatter.includes("Trigger:")) {
    warnings.push("SKILL.md: Trigger セクションがありません");
  }
}

/**
 * agents/ 内のTask仕様書を検証
 */
function checkAgents() {
  const agentsDir = join(SKILL_DIR, "agents");
  if (!existsSync(agentsDir)) return;

  const agents = readdirSync(agentsDir).filter((f) => f.endsWith(".md"));

  if (agents.length === 0) {
    warnings.push("agents/ にTask仕様書がありません");
    return;
  }

  for (const agent of agents) {
    const path = join(agentsDir, agent);
    const content = readFileSync(path, "utf-8");

    const requiredSections = [
      "メタ情報",
      "プロフィール",
      "知識ベース",
      "実行仕様",
      "インターフェース",
    ];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        warnings.push(`${agent}: "${section}" セクションがありません`);
      }
    }

    if (!/^[a-z0-9-]+\.md$/.test(agent)) {
      warnings.push(`${agent}: ファイル名がkebab-caseではありません`);
    }
  }
}

/**
 * EVALS.json の構造検証
 */
function checkEvals() {
  const evalsPath = join(SKILL_DIR, "EVALS.json");
  if (!existsSync(evalsPath)) return;

  try {
    const evals = JSON.parse(readFileSync(evalsPath, "utf-8"));

    if (!evals.skill_name) {
      errors.push("EVALS.json: skill_name がありません");
    }
    if (!evals.version) {
      warnings.push("EVALS.json: version がありません");
    }
    if (!evals.metrics) {
      errors.push("EVALS.json: metrics がありません");
    }
    if (!evals.levels) {
      warnings.push("EVALS.json: levels がありません");
    }
  } catch (e) {
    errors.push(`EVALS.json: JSONパースエラー - ${e.message}`);
  }
}

// メイン処理
console.log("🔍 domain-services スキルを検証中...\n");

checkRequiredFiles();
checkSkillMd();
checkAgents();
checkEvals();

if (errors.length > 0) {
  console.log("❌ エラー:");
  errors.forEach((e) => console.log(`   - ${e}`));
}

if (warnings.length > 0) {
  console.log("\n⚠️  警告:");
  warnings.forEach((w) => console.log(`   - ${w}`));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log("✅ すべての検証に合格しました");
}

process.exit(errors.length > 0 ? 1 : 0);
