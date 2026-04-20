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
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

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
  const knownFlags = ["--workflow", "--phase", "--artifacts"];

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
    } else if (args[i].startsWith("--")) {
      // 未知フラグを拒否
      console.error(`エラー: 未知のオプション: ${args[i]}`);
      showUsage();
      process.exit(1);
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

// S1: index.md のPhase表のステータスを completed に更新
function updateIndexMdPhaseTable(workflowDir, phaseNum) {
  const indexPath = join(workflowDir, "index.md");
  if (!existsSync(indexPath)) {
    console.log("  ℹ️  index.md が見つかりません（スキップ）");
    return;
  }

  let content;
  try {
    content = readFileSync(indexPath, "utf-8");
  } catch {
    console.warn("⚠️  WARNING: index.md を読み取れませんでした");
    return;
  }

  // | N | ... | status | 形式の行のstatus列を completed に置換
  // Phase番号が指定のphaseNumと一致する行のみ更新
  const lines = content.split("\n");
  let changed = false;
  const updated = lines.map((line) => {
    // Phase列が数字でphaseNumと一致する行を検索
    const match = line.match(/^(\|\s*)(\d+)(\s*\|.+\|\s*)(\S+)(\s*\|?\s*)$/);
    if (match && parseInt(match[2], 10) === phaseNum) {
      changed = true;
      return `${match[1]}${match[2]}${match[3]}completed${match[5]}`;
    }
    return line;
  });

  if (!changed) {
    console.log(`  ℹ️  index.md: Phase ${phaseNum} の行が見つかりませんでした（スキップ）`);
    return;
  }

  try {
    writeFileSync(indexPath, updated.join("\n"), "utf-8");
    console.log(`  ✅ index.md の Phase ${phaseNum} ステータスを completed に更新`);
  } catch (err) {
    console.warn(`⚠️  WARNING: index.md の書き込みに失敗しました: ${err.message}`);
  }
}

// S4: phase-N-*.md frontmatterのステータスを completed に更新
function updatePhaseFrontmatter(workflowDir, phaseNum) {
  let files;
  try {
    files = readdirSync(workflowDir);
  } catch {
    console.warn(`⚠️  WARNING: ワークフローディレクトリを読み取れません: ${workflowDir}`);
    return;
  }

  const phaseFile = files.find(
    (f) => f.startsWith(`phase-${phaseNum}-`) && f.endsWith(".md"),
  );

  if (!phaseFile) {
    console.log(
      `  ℹ️  Phase ${phaseNum} の phase-N-*.md ファイルが見つかりません（スキップ）`,
    );
    return;
  }

  const filePath = join(workflowDir, phaseFile);
  let content;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    console.warn(`⚠️  WARNING: ${phaseFile} を読み取れませんでした`);
    return;
  }

  // | ステータス | xxx | の行を | ステータス | completed | に置換
  const updated = content.replace(
    /^(\|\s*ステータス\s*\|\s*)\S+(\s*\|)$/m,
    `$1completed$2`,
  );

  if (updated === content) {
    console.log(`  ℹ️  ${phaseFile}: ステータス行が見つかりませんでした（スキップ）`);
    return;
  }

  try {
    writeFileSync(filePath, updated, "utf-8");
    console.log(`  ✅ ${phaseFile} のステータスを completed に更新`);
  } catch (err) {
    console.warn(`⚠️  WARNING: ${phaseFile} の書き込みに失敗しました: ${err.message}`);
  }
}

// outputs/artifacts.json を更新（失敗時はthrowしてrollback対象とする）
function saveOutputsArtifacts(workflowDir, phaseNum) {
  const outputsDir = join(workflowDir, "outputs");
  const outputsArtifactsPath = join(outputsDir, "artifacts.json");

  if (!existsSync(outputsDir)) {
    try {
      mkdirSync(outputsDir, { recursive: true });
    } catch {
      // ignore
    }
  }

  let outputsArtifacts = { phases: {} };
  if (existsSync(outputsArtifactsPath)) {
    try {
      outputsArtifacts = JSON.parse(readFileSync(outputsArtifactsPath, "utf-8"));
      if (!outputsArtifacts.phases) {
        outputsArtifacts.phases = {};
      }
    } catch {
      outputsArtifacts = { phases: {} };
    }
  }

  outputsArtifacts.phases[phaseNum] = {
    ...(outputsArtifacts.phases[phaseNum] || {}),
    status: "completed",
    completedAt: new Date().toISOString(),
  };

  // 失敗時はthrow（呼び出し元でrollbackする）
  writeFileSync(outputsArtifactsPath, JSON.stringify(outputsArtifacts, null, 2), "utf-8");
  console.log(`✅ outputs/artifacts.json を更新: ${outputsArtifactsPath}`);
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

  // Phase番号の存在確認: phase-N-*.md が存在しない場合はエラー
  const phaseNum = parseInt(args.phase, 10);
  const files = readdirSync(args.workflow);
  const phaseFileExists = files.some(
    (f) => f.startsWith(`phase-${phaseNum}-`) && f.endsWith(".md"),
  );

  if (!phaseFileExists) {
    // outputs/phase-N/ ディレクトリも存在しない場合はエラー
    const outputsPhaseDir = join(args.workflow, `outputs/phase-${phaseNum}`);
    if (!existsSync(outputsPhaseDir)) {
      console.error(`Error: Phase ${phaseNum} のファイルが見つかりません`);
      process.exit(1);
    }
  }

  // 事前 parity check: 既存のdriftがある場合はエラー
  const validatorPath = join(dirname(__filename), "validate-closeout-parity.js");
  if (existsSync(validatorPath)) {
    const preCheck = spawnSync("node", [validatorPath, "--workflow", args.workflow], {
      encoding: "utf-8",
    });
    if (preCheck.status === 1) {
      // PARITY_DRIFT: 既存のdriftがあるため完了処理を拒否
      console.error(`Error: 完了処理を実行する前に parity drift が検出されました。`);
      console.error(preCheck.stdout);
      console.error("parity drift を修正してから完了処理を実行してください。");
      process.exit(1);
    }
    // exit 2 (MISSING_SOURCE) や exit 3 (INVALID_STATUS_VALUE) は警告のみで続行
    if (preCheck.status === 2) {
      console.warn("⚠️  WARNING: parity check に必要なソースファイルが欠損しています（続行）");
    }
    if (preCheck.status === 3) {
      console.warn("⚠️  WARNING: parity check で無効なステータス値を検出しました（続行）");
    }
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

  // artifacts.json を更新（S2: root artifacts.json）
  const artifacts = loadArtifacts(args.workflow);
  // rollback用に変更前の内容を保存
  const artifactsPath = join(args.workflow, "artifacts.json");
  const rootJsonBefore = existsSync(artifactsPath)
    ? readFileSync(artifactsPath, "utf-8")
    : null;

  registerPhaseArtifacts(artifacts, args.phase, args.artifacts);
  saveArtifacts(args.workflow, artifacts);

  // outputs/artifacts.json を更新 (S3): 失敗時はrollback
  try {
    saveOutputsArtifacts(args.workflow, args.phase);
  } catch (err) {
    console.error(`Error: outputs/artifacts.json の書き込みに失敗しました: ${err.message}`);
    // root artifacts.json をロールバック
    if (rootJsonBefore !== null) {
      try {
        writeFileSync(artifactsPath, rootJsonBefore, "utf-8");
        console.error("root artifacts.json をロールバックしました");
      } catch {
        console.error("root artifacts.json のロールバックにも失敗しました");
      }
    } else {
      // 元々なかった場合はファイルを削除する必要があるが、ここではエラーのみ
      console.error("root artifacts.json は元々存在しなかったため、ロールバックをスキップします");
    }
    process.exit(1);
  }

  // S1: index.md Phase表のステータスを更新
  console.log("\n📝 index.md のPhase表ステータスを更新:");
  updateIndexMdPhaseTable(args.workflow, phaseNum);

  // S4: phase-N-*.md frontmatterのステータスを更新
  console.log("\n📝 Phase MDファイルのステータスを更新:");
  updatePhaseFrontmatter(args.workflow, phaseNum);

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
