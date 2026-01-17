#!/usr/bin/env node
/**
 * init-artifacts.mjs - artifacts.json初期化スクリプト
 *
 * 新規ワークフロー開始時にartifacts.jsonを初期化する。
 * Schema: schemas/artifact-definition.json
 *
 * 使用方法:
 *   node scripts/init-artifacts.mjs --feature <name> --output <dir> [--type <type>]
 *
 * 例:
 *   node scripts/init-artifacts.mjs \
 *     --feature chat-llm-switching \
 *     --output docs/30-workflows/chat-llm-switching \
 *     --type feat
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// Phase依存関係マップ
const PHASE_DEPENDENCIES = {
  2: ["1"],
  3: ["2"],
  4: ["3"],
  5: ["4"],
  6: ["5"],
  7: ["6"],
  8: ["7"],
  9: ["8"],
  10: ["9"],
  11: ["10"],
  12: ["11"],
  13: ["12"],
};

// 引数パース
function parseArgs(args) {
  const result = { feature: null, output: null, type: "feat" };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--feature" && args[i + 1]) {
      result.feature = args[i + 1];
      i++;
    } else if (args[i] === "--output" && args[i + 1]) {
      result.output = args[i + 1];
      i++;
    } else if (args[i] === "--type" && args[i + 1]) {
      result.type = args[i + 1];
      i++;
    }
  }

  return result;
}

// artifacts.json生成
function generateArtifacts(featureName, taskType) {
  const now = new Date().toISOString();

  const artifacts = {
    feature: featureName,
    created: now,
    lastUpdated: now,
    status: "in_progress",
    phases: {},
    dependencies: PHASE_DEPENDENCIES,
    metadata: {
      taskType: taskType,
      estimatedPhases: 13,
      actualPhases: 0,
    },
  };

  // Phase 1-13を初期化
  for (let i = 1; i <= 13; i++) {
    artifacts.phases[String(i)] = {
      status: "pending",
      artifacts: [],
    };
  }

  return artifacts;
}

// ディレクトリ構造作成
function createDirectoryStructure(outputDir) {
  // メインディレクトリ
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log(`✅ ディレクトリ作成: ${outputDir}`);
  }

  // outputs/ディレクトリ
  const outputsDir = join(outputDir, "outputs");
  if (!existsSync(outputsDir)) {
    mkdirSync(outputsDir, { recursive: true });
    console.log(`✅ ディレクトリ作成: ${outputsDir}`);
  }

  // Phase別サブディレクトリ (outputs/phase-1 〜 outputs/phase-13)
  for (let i = 1; i <= 13; i++) {
    const phaseDir = join(outputsDir, `phase-${i}`);
    if (!existsSync(phaseDir)) {
      mkdirSync(phaseDir, { recursive: true });
    }
  }
  console.log(`✅ Phase別ディレクトリ作成: outputs/phase-1 〜 phase-13`);
}

// メイン処理
function main() {
  const args = parseArgs(process.argv.slice(2));

  // 引数検証
  if (!args.feature) {
    console.error("Error: --feature is required");
    showUsage();
    process.exit(1);
  }

  if (!args.output) {
    console.error("Error: --output is required");
    showUsage();
    process.exit(1);
  }

  console.log(`\n🚀 artifacts.json 初期化を開始\n`);
  console.log(`Feature: ${args.feature}`);
  console.log(`出力先: ${args.output}`);
  console.log(`タイプ: ${args.type}\n`);

  // ディレクトリ構造作成
  createDirectoryStructure(args.output);

  // artifacts.json生成
  const artifacts = generateArtifacts(args.feature, args.type);
  const artifactsPath = join(args.output, "artifacts.json");
  writeFileSync(artifactsPath, JSON.stringify(artifacts, null, 2), "utf-8");
  console.log(`✅ artifacts.json 作成: ${artifactsPath}`);

  console.log(`\n✅ 初期化が完了しました\n`);

  // 次のステップを案内
  console.log("次のステップ:");
  console.log(`  1. Phase 1の仕様書を読んでタスクを実行`);
  console.log(`  2. 完了したら complete-phase.mjs で成果物を登録`);
  console.log(`     node scripts/complete-phase.mjs --workflow ${args.output} --phase 1 --artifacts "..."`);
}

function showUsage() {
  console.error(`
Usage: node init-artifacts.mjs --feature <name> --output <dir> [--type <type>]

Options:
  --feature  機能名（ケバブケース）
  --output   出力ディレクトリパス
  --type     タスクタイプ (feat|fix|refactor|docs|test|chore) [default: feat]

Example:
  node init-artifacts.mjs \\
    --feature chat-llm-switching \\
    --output docs/30-workflows/chat-llm-switching \\
    --type feat
`);
}

main();
