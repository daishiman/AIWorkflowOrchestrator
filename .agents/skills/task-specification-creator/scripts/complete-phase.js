#!/usr/bin/env node
/**
 * complete-phase.mjs - Phase完了処理スクリプト
 *
 * Phase完了時に以下を実行:
 * 1. 成果物をartifacts.jsonに登録
 * 2. 依存関係のある後続PhaseのMDファイルを更新
 *
 * 使用方法:
 *   node scripts/complete-phase.mjs --workflow <path> --phase <N> --artifacts "<path>:<desc>,..."
 *
 * 例:
 *   node scripts/complete-phase.mjs \
 *     --workflow docs/30-workflows/chat-llm-switching \
 *     --phase 1 \
 *     --artifacts "outputs/phase-1/requirements-definition.md:要件定義書,outputs/phase-1/acceptance-criteria.md:受け入れ基準"
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";

// Phase依存関係マップ (Phase 0〜13)
// Phase 0は条件付き（外部SDK調査が必要な場合のみ）
const PHASE_DEPENDENCIES = {
  0: [], // 外部SDK調査（条件付き）- 依存なし
  1: [], // 要件定義 - Phase 0がある場合は["0"]になる可能性あり
  2: ["1"], // 設計 ← 要件定義
  3: ["1", "2"], // 設計レビュー ← 要件定義, 設計
  4: ["1", "2", "3"], // テスト作成 ← 要件定義, 設計, レビュー
  5: ["4"], // 実装 ← テスト作成
  6: ["4", "5"], // テスト拡充 ← テスト作成, 実装
  7: ["6"], // テストカバレッジ確認 ← テスト拡充
  8: ["5", "7"], // リファクタリング ← 実装, カバレッジ確認
  9: ["5", "8"], // 品質保証 ← 実装, リファクタリング
  10: ["1", "2", "5", "7", "8", "9"], // 最終レビュー ← 要件, 設計, 実装, カバレッジ, リファクタ, 品質
  11: ["10"], // 手動テスト ← 最終レビュー
  12: ["1", "2", "5", "8", "9", "10", "11"], // ドキュメント更新 ← 要件, 設計, 実装, リファクタ, 品質, レビュー, 手動テスト
  13: ["10", "11", "12"], // PR作成 ← レビュー, 手動テスト, ドキュメント
};

// 後続Phase（このPhaseに依存するPhase）を取得
function getDependentPhases(phaseNum) {
  const dependents = [];
  for (const [phase, deps] of Object.entries(PHASE_DEPENDENCIES)) {
    if (deps.includes(String(phaseNum))) {
      dependents.push(phase);
    }
  }
  return dependents;
}

// 引数パース
function parseArgs(args) {
  const result = { workflow: null, phase: null, artifacts: [] };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--workflow" && args[i + 1]) {
      result.workflow = args[i + 1];
      i++;
    } else if (args[i] === "--phase" && args[i + 1]) {
      result.phase = args[i + 1];
      i++;
    } else if (args[i] === "--artifacts" && args[i + 1]) {
      // "path:desc,path:desc" 形式をパース
      const artifactStr = args[i + 1];
      result.artifacts = artifactStr.split(",").map((item) => {
        const [path, description] = item.split(":");
        return { path: path.trim(), description: description?.trim() || path };
      });
      i++;
    }
  }

  return result;
}

// outputs/phase-N/ ディレクトリの存在と中身を検証（WARNING のみ、処理は続行）
function validatePhaseOutputs(workflowDir, phaseNum) {
  const outputsDir = join(workflowDir, `outputs/phase-${phaseNum}`);

  if (!existsSync(outputsDir)) {
    console.warn(
      `⚠️  WARNING: outputs ディレクトリが見つかりません: outputs/phase-${phaseNum}/`,
    );
    return;
  }

  let entries;
  try {
    entries = readdirSync(outputsDir);
  } catch {
    console.warn(
      `⚠️  WARNING: outputs/phase-${phaseNum}/ の読み取りに失敗しました`,
    );
    return;
  }

  if (entries.length === 0) {
    console.warn(`⚠️  WARNING: outputs/phase-${phaseNum}/ が空です`);
  } else {
    console.log(
      `✅ outputs/phase-${phaseNum}/ に成果物 ${entries.length} 件を確認`,
    );
  }
}

// artifacts.json を読み込みまたは初期化
function loadArtifacts(workflowDir) {
  const artifactsPath = join(workflowDir, "artifacts.json");

  if (existsSync(artifactsPath)) {
    return JSON.parse(readFileSync(artifactsPath, "utf-8"));
  }

  // 初期化
  return {
    feature: workflowDir.split("/").pop(),
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    phases: {},
    dependencies: PHASE_DEPENDENCIES,
  };
}

// artifacts.json を保存
function saveArtifacts(workflowDir, artifacts) {
  const artifactsPath = join(workflowDir, "artifacts.json");
  artifacts.lastUpdated = new Date().toISOString();
  writeFileSync(artifactsPath, JSON.stringify(artifacts, null, 2), "utf-8");
  console.log(`✅ artifacts.json を更新: ${artifactsPath}`);
}

// Phase成果物を登録
function registerPhaseArtifacts(artifacts, phaseNum, phaseArtifacts) {
  artifacts.phases[phaseNum] = {
    status: "completed",
    completedAt: new Date().toISOString(),
    artifacts: phaseArtifacts.map((a) => ({
      type: "document",
      path: a.path,
      description: a.description,
    })),
  };
}

// 後続Phaseの参照資料セクションを更新
function updateDependentPhases(workflowDir, phaseNum, phaseArtifacts) {
  const dependentPhases = getDependentPhases(phaseNum);

  if (dependentPhases.length === 0) {
    console.log(`ℹ️  Phase ${phaseNum} に依存する後続Phaseはありません`);
    return;
  }

  console.log(`\n📝 依存する後続Phaseを更新: ${dependentPhases.join(", ")}\n`);

  for (const depPhase of dependentPhases) {
    updatePhaseReferences(workflowDir, depPhase, phaseNum, phaseArtifacts);
  }
}

// 特定のPhaseファイルの参照資料セクションを更新
function updatePhaseReferences(
  workflowDir,
  targetPhase,
  sourcePhase,
  artifacts,
) {
  // Phase MDファイルを検索（トップレベルでimport済み）
  const files = readdirSync(workflowDir);
  const phaseFile = files.find(
    (f) => f.startsWith(`phase-${targetPhase}-`) && f.endsWith(".md"),
  );

  if (!phaseFile) {
    console.log(
      `  ⚠️  Phase ${targetPhase} のファイルが見つかりません（まだ生成されていない可能性）`,
    );
    return;
  }

  const filePath = join(workflowDir, phaseFile);
  let content = readFileSync(filePath, "utf-8");

  // 参照資料セクションを検索
  const refSectionRegex = /^## 参照資料[\s\S]*?(?=^## |\z)/m;
  const refSectionMatch = content.match(refSectionRegex);

  if (!refSectionMatch) {
    console.log(`  ⚠️  Phase ${targetPhase}: 参照資料セクションがありません`);
    return;
  }

  // 新しい参照行を生成
  const newRefLines = artifacts.map(
    (a) => `| ${a.description} | \`${a.path}\` | Phase ${sourcePhase} 成果物 |`,
  );

  // 既存セクションを取得
  let refSection = refSectionMatch[0];

  // テーブルがあるか確認
  if (!refSection.includes("| 参照資料") && !refSection.includes("| ----")) {
    // テーブルヘッダーを追加
    refSection =
      `## 参照資料\n\n| 参照資料 | パス | 説明 |\n| -------- | ---- | ---- |\n` +
      newRefLines.join("\n") +
      "\n\n";
  } else {
    // 既存テーブルに追記（重複チェック）
    for (const line of newRefLines) {
      const pathMatch = line.match(/`([^`]+)`/);
      if (pathMatch && !refSection.includes(pathMatch[1])) {
        // テーブルの最後の行の後に追加
        const tableEndRegex = /(\| .+ \| .+ \| .+ \|)\n(?!\|)/;
        if (tableEndRegex.test(refSection)) {
          refSection = refSection.replace(tableEndRegex, `$1\n${line}\n`);
        } else {
          // テーブルの終わりが見つからない場合は末尾に追加
          refSection = refSection.trimEnd() + "\n" + line + "\n\n";
        }
      }
    }
  }

  // コンテンツを更新
  content = content.replace(refSectionRegex, refSection);
  writeFileSync(filePath, content, "utf-8");

  console.log(`  ✅ Phase ${targetPhase} (${phaseFile}) を更新`);
}

// メイン処理
function main() {
  const args = parseArgs(process.argv.slice(2));

  // 引数検証
  if (!args.workflow) {
    console.error("Error: --workflow is required");
    showUsage();
    process.exit(1);
  }

  if (args.phase === null) {
    console.error("Error: --phase is required");
    showUsage();
    process.exit(1);
  }

  if (args.artifacts.length === 0) {
    console.error("Error: --artifacts is required");
    showUsage();
    process.exit(1);
  }

  // ワークフローディレクトリ確認
  if (!existsSync(args.workflow)) {
    console.error(`Error: Workflow directory not found: ${args.workflow}`);
    process.exit(1);
  }

  console.log(`\n🚀 Phase ${args.phase} 完了処理を開始\n`);
  console.log(`ワークフロー: ${args.workflow}`);
  console.log(`成果物: ${args.artifacts.length}個\n`);

  // 成果物一覧を表示
  console.log("登録する成果物:");
  for (const artifact of args.artifacts) {
    console.log(`  - ${artifact.path}: ${artifact.description}`);
  }
  console.log("");

  // outputs ディレクトリの存在を検証（WARNING のみ、処理は続行）
  validatePhaseOutputs(args.workflow, args.phase);

  // artifacts.json を更新
  const artifacts = loadArtifacts(args.workflow);
  registerPhaseArtifacts(artifacts, args.phase, args.artifacts);
  saveArtifacts(args.workflow, artifacts);

  // 依存Phaseを更新
  updateDependentPhases(args.workflow, args.phase, args.artifacts);

  console.log(`\n✅ Phase ${args.phase} 完了処理が完了しました\n`);
}

function showUsage() {
  console.error(`
Usage: node complete-phase.mjs --workflow <path> --phase <N> --artifacts "<path>:<desc>,..."

Example:
  node complete-phase.mjs \\
    --workflow docs/30-workflows/chat-llm-switching \\
    --phase 1 \\
    --artifacts "outputs/phase-1/requirements.md:要件定義書,outputs/phase-1/criteria.md:受け入れ基準"
`);
}

main();
