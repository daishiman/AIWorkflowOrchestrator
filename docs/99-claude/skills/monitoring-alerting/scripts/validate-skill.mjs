#!/usr/bin/env node
/**
 * スキル構造検証スクリプト (18-skills.md仕様準拠)
 *
 * 検証項目:
 * - SKILL.md: frontmatter (name, description with Anchors/Trigger, allowed-tools)
 * - agents/: 1つ以上のエージェント定義
 * - references/: 1つ以上のリファレンス
 * - scripts/: スクリプトディレクトリ
 *
 * 終了コード:
 *   0 - 検証成功
 *   1 - 一般的エラー
 *   3 - ファイル不在
 *   4 - 検証失敗
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_DIR = path.join(__dirname, "..");

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

// ヘルプ表示
const showHelp = () => {
  console.log(`
スキル構造検証スクリプト (18-skills.md仕様準拠)

使用方法:
  node scripts/validate-skill.mjs [options]

オプション:
  -h, --help    このヘルプを表示
  -v, --verbose 詳細出力
`);
};

// 検証結果
const results = {
  passed: [],
  failed: [],
};

const pass = (msg) => results.passed.push(msg);
const fail = (msg) => results.failed.push(msg);

// SKILL.md検証
const validateSkillMd = () => {
  const skillPath = path.join(SKILL_DIR, "SKILL.md");

  if (!fs.existsSync(skillPath)) {
    fail("SKILL.md が存在しない");
    return false;
  }
  pass("SKILL.md が存在する");

  const content = fs.readFileSync(skillPath, "utf-8");

  // frontmatter抽出
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    fail("frontmatterが見つからない");
    return false;
  }
  pass("frontmatterが存在する");

  const fm = fmMatch[1];

  // name チェック
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  if (!nameMatch) {
    fail("name フィールドがない");
  } else {
    const name = nameMatch[1].trim();
    if (/^[a-z][a-z0-9-]*$/.test(name)) {
      pass(`name: ${name} (hyphen-case)✓`);
    } else {
      fail(`name: ${name} はhyphen-caseでない`);
    }
  }

  // description チェック
  if (!fm.includes("description:")) {
    fail("description フィールドがない");
  } else {
    pass("description フィールドがある");

    // Anchors チェック
    if (content.includes("Anchors:") && content.includes("•")) {
      pass("Anchors が正しい形式（•使用）");
    } else {
      fail("Anchors がない、または形式が不正（•を使用すること）");
    }

    // Trigger チェック
    if (content.includes("Trigger:")) {
      // 英語キーワードがあるか確認
      const triggerMatch = content.match(/Trigger:\s*\n\s*(.+)/);
      if (triggerMatch) {
        const triggerLine = triggerMatch[1];
        if (/[a-zA-Z]/.test(triggerLine)) {
          pass("Trigger が存在し英語を含む");
        } else {
          fail("Trigger は英語で記述すること");
        }
      }
    } else {
      fail("Trigger がない");
    }
  }

  // allowed-tools チェック
  if (fm.includes("allowed-tools:")) {
    // PascalCaseチェック
    const toolsSection = fm.match(/allowed-tools:\s*\n((?:\s+-\s+.+\n?)+)/);
    if (toolsSection) {
      const tools = toolsSection[1].match(/-\s+(\w+)/g) || [];
      const hasPascalCase = tools.every((t) => /[A-Z]/.test(t));
      if (hasPascalCase) {
        pass("allowed-tools がPascalCase形式");
      } else {
        fail("allowed-tools はPascalCase形式であること");
      }
    }
  } else {
    fail("allowed-tools フィールドがない");
  }

  return true;
};

// ディレクトリ検証
const validateDirectories = () => {
  const dirs = ["agents", "references", "scripts"];

  for (const dir of dirs) {
    const dirPath = path.join(SKILL_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fail(`${dir}/ ディレクトリがない`);
      continue;
    }

    const files = fs.readdirSync(dirPath).filter((f) => !f.startsWith("."));
    if (files.length > 0) {
      pass(`${dir}/ に${files.length}ファイル存在`);
    } else {
      fail(`${dir}/ が空`);
    }
  }

  // assets/はオプション
  const assetsPath = path.join(SKILL_DIR, "assets");
  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath).filter((f) => !f.startsWith("."));
    pass(`assets/ に${files.length}ファイル存在（オプション）`);
  }
};

// エージェント検証
const validateAgents = () => {
  const agentsDir = path.join(SKILL_DIR, "agents");
  if (!fs.existsSync(agentsDir)) return;

  const agents = fs.readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
  for (const agent of agents) {
    const content = fs.readFileSync(path.join(agentsDir, agent), "utf-8");

    // 必須セクションチェック
    const requiredSections = [
      "メタ情報",
      "プロフィール",
      "知識ベース",
      "実行仕様",
    ];
    let hasSections = true;
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        hasSections = false;
        fail(`agents/${agent}: ${section}セクションがない`);
      }
    }
    if (hasSections) {
      pass(`agents/${agent}: 必須セクション完備`);
    }
  }
};

// メイン処理
const main = () => {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const verbose = args.includes("-v") || args.includes("--verbose");

  console.log("\n🔍 monitoring-alerting スキル検証\n");
  console.log("=".repeat(50));

  validateSkillMd();
  validateDirectories();
  validateAgents();

  console.log("\n" + "=".repeat(50));

  // 結果表示
  console.log(`\n✓ 成功: ${results.passed.length}件`);
  if (verbose) {
    results.passed.forEach((p) => console.log(`   ✓ ${p}`));
  }

  if (results.failed.length > 0) {
    console.log(`\n✗ 失敗: ${results.failed.length}件`);
    results.failed.forEach((f) => console.log(`   ✗ ${f}`));
    console.log("\n⚠️  検証失敗");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log("\n🎉 検証成功: すべてのチェックをパス");
  process.exit(EXIT_SUCCESS);
};

main();
