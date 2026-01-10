#!/usr/bin/env node
/**
 * メトリクス計測設定の検証スクリプト
 *
 * 用途:
 * - メトリクス定義の妥当性検証
 * - データソース接続確認
 * - ダッシュボード設定検証
 *
 * 使用例:
 *   node scripts/validate-metrics.mjs .claude/skills/metrics-tracking
 *   node scripts/validate-metrics.mjs --config metrics-config.json
 *   node scripts/validate-metrics.mjs --help
 *
 * 終了コード:
 *   0 - 検証成功
 *   1 - 一般的エラー
 *   2 - 引数エラー
 *   3 - ファイル不在
 *   4 - 検証失敗
 */

import fs from "fs";
import path from "path";

// 設定
const CONFIG = {
  requiredFiles: ["SKILL.md"],
  requiredDirs: ["agents", "references"],
  requiredAgents: [
    "define-metrics.md",
    "implement-collection.md",
    "analyze-improve.md",
  ],
  requiredReferences: ["basics.md", "patterns.md", "dora-framework.md"],
  skillMdMaxLines: 500,
  descriptionMaxChars: 1024,
};

// ヘルプ表示
const showHelp = () => {
  console.log(`
メトリクス計測設定検証スクリプト

使用方法:
  node validate-metrics.mjs <skill-path>
  node validate-metrics.mjs --config <config-file>
  node validate-metrics.mjs --help

オプション:
  <skill-path>      スキルディレクトリのパス
  --config <file>   設定ファイル（JSON）を指定
  --help, -h        このヘルプを表示

検証項目:
  - 必須ファイルの存在確認
  - SKILL.md の行数制限（${CONFIG.skillMdMaxLines}行以内）
  - description の文字数制限（${CONFIG.descriptionMaxChars}文字以内）
  - frontmatter の必須フィールド確認
  - agents/ のTask仕様書存在確認
  - references/ の知識ファイル存在確認

終了コード:
  0 - 検証成功
  1 - 一般的エラー
  2 - 引数エラー
  3 - ファイル不在
  4 - 検証失敗
`);
};

// ファイル存在確認
const checkFileExists = (filePath) => {
  return fs.existsSync(filePath);
};

// ディレクトリ存在確認
const checkDirExists = (dirPath) => {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
};

// SKILL.md 解析
const parseSkillMd = (content) => {
  const lines = content.split("\n");
  const lineCount = lines.length;

  // frontmatter 抽出
  let inFrontmatter = false;
  let frontmatterLines = [];
  let frontmatterEnd = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === "---") {
      if (!inFrontmatter) {
        inFrontmatter = true;
      } else {
        frontmatterEnd = i;
        break;
      }
    } else if (inFrontmatter) {
      frontmatterLines.push(line);
    }
  }

  const frontmatterText = frontmatterLines.join("\n");

  // name 抽出
  const nameMatch = frontmatterText.match(/^name:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : null;

  // description 抽出（複数行対応）
  let description = null;
  const descStartMatch = frontmatterText.match(/^description:\s*\|?\s*$/m);
  if (descStartMatch) {
    // 複数行 description
    const descStartIdx = frontmatterText.indexOf(descStartMatch[0]);
    const afterDesc = frontmatterText.slice(
      descStartIdx + descStartMatch[0].length,
    );
    const nextFieldMatch = afterDesc.match(/^[a-z-]+:/m);
    if (nextFieldMatch) {
      description = afterDesc.slice(0, nextFieldMatch.index).trim();
    } else {
      description = afterDesc.trim();
    }
  } else {
    // 単行 description
    const singleLineMatch = frontmatterText.match(/^description:\s*(.+)$/m);
    if (singleLineMatch) {
      description = singleLineMatch[1].trim();
    }
  }

  // Anchors 確認
  const hasAnchors =
    description &&
    (description.includes("Anchors:") || description.includes("• "));

  // Trigger 確認
  const hasTrigger =
    description &&
    (description.includes("Trigger:") || description.includes("Use when"));

  return {
    lineCount,
    name,
    description,
    descriptionLength: description ? description.length : 0,
    hasAnchors,
    hasTrigger,
  };
};

// 検証実行
const validate = (skillPath) => {
  const results = {
    passed: [],
    failed: [],
  };

  console.log(`\n🔍 メトリクス追跡スキル検証: ${skillPath}\n`);
  console.log("=".repeat(50));

  // 1. スキルディレクトリ確認
  if (!checkDirExists(skillPath)) {
    console.error(`❌ スキルディレクトリが見つかりません: ${skillPath}`);
    process.exit(3);
  }
  results.passed.push("スキルディレクトリ存在");

  // 2. 必須ファイル確認
  for (const file of CONFIG.requiredFiles) {
    const filePath = path.join(skillPath, file);
    if (checkFileExists(filePath)) {
      results.passed.push(`${file} 存在`);
    } else {
      results.failed.push(`${file} が見つかりません`);
    }
  }

  // 3. 必須ディレクトリ確認
  for (const dir of CONFIG.requiredDirs) {
    const dirPath = path.join(skillPath, dir);
    if (checkDirExists(dirPath)) {
      results.passed.push(`${dir}/ 存在`);
    } else {
      results.failed.push(`${dir}/ が見つかりません`);
    }
  }

  // 4. SKILL.md 検証
  const skillMdPath = path.join(skillPath, "SKILL.md");
  if (checkFileExists(skillMdPath)) {
    const content = fs.readFileSync(skillMdPath, "utf-8");
    const parsed = parseSkillMd(content);

    // 行数制限
    if (parsed.lineCount <= CONFIG.skillMdMaxLines) {
      results.passed.push(
        `SKILL.md 行数: ${parsed.lineCount}/${CONFIG.skillMdMaxLines}`,
      );
    } else {
      results.failed.push(
        `SKILL.md 行数超過: ${parsed.lineCount}/${CONFIG.skillMdMaxLines}`,
      );
    }

    // name 確認
    if (parsed.name) {
      if (/^[a-z0-9-]+$/.test(parsed.name)) {
        results.passed.push(`name: ${parsed.name} (ハイフンケース)`);
      } else {
        results.failed.push(`name: ${parsed.name} (ハイフンケース違反)`);
      }
    } else {
      results.failed.push("name フィールドが見つかりません");
    }

    // description 文字数
    if (parsed.descriptionLength <= CONFIG.descriptionMaxChars) {
      results.passed.push(
        `description 文字数: ${parsed.descriptionLength}/${CONFIG.descriptionMaxChars}`,
      );
    } else {
      results.failed.push(
        `description 文字数超過: ${parsed.descriptionLength}/${CONFIG.descriptionMaxChars}`,
      );
    }

    // Anchors 確認
    if (parsed.hasAnchors) {
      results.passed.push("Anchors 記載あり");
    } else {
      results.failed.push("Anchors 記載なし");
    }

    // Trigger 確認
    if (parsed.hasTrigger) {
      results.passed.push("Trigger 記載あり");
    } else {
      results.failed.push("Trigger 記載なし");
    }
  }

  // 5. agents/ ファイル確認
  const agentsDir = path.join(skillPath, "agents");
  if (checkDirExists(agentsDir)) {
    for (const agent of CONFIG.requiredAgents) {
      const agentPath = path.join(agentsDir, agent);
      if (checkFileExists(agentPath)) {
        results.passed.push(`agents/${agent} 存在`);
      } else {
        results.failed.push(`agents/${agent} が見つかりません`);
      }
    }
  }

  // 6. references/ ファイル確認
  const referencesDir = path.join(skillPath, "references");
  if (checkDirExists(referencesDir)) {
    for (const ref of CONFIG.requiredReferences) {
      const refPath = path.join(referencesDir, ref);
      if (checkFileExists(refPath)) {
        results.passed.push(`references/${ref} 存在`);
      } else {
        results.failed.push(`references/${ref} が見つかりません`);
      }
    }
  }

  // 結果表示
  console.log("\n✅ 合格項目:");
  results.passed.forEach((item) => console.log(`   ✓ ${item}`));

  if (results.failed.length > 0) {
    console.log("\n❌ 不合格項目:");
    results.failed.forEach((item) => console.log(`   ✗ ${item}`));
  }

  console.log("\n" + "=".repeat(50));
  console.log(
    `結果: ${results.passed.length} 合格 / ${results.failed.length} 不合格`,
  );

  if (results.failed.length > 0) {
    console.log("\n⚠️  検証失敗");
    process.exit(4);
  } else {
    console.log("\n🎉 検証成功");
    process.exit(0);
  }
};

// メイン処理
const main = () => {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(args.length === 0 ? 2 : 0);
  }

  if (args[0] === "--config") {
    if (args.length < 2) {
      console.error("エラー: 設定ファイルを指定してください");
      process.exit(2);
    }
    console.log("設定ファイルモードは現在未実装です");
    process.exit(1);
  }

  const skillPath = args[0];
  validate(skillPath);
};

main();
