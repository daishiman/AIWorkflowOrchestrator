#!/usr/bin/env node
/**
 * generate-documentation-changelog.js
 *
 * Phase 12 Task 3: documentation-changelog.md の自動生成スクリプト
 *
 * 使用方法:
 *   node generate-documentation-changelog.js --workflow docs/30-workflows/{{FEATURE_NAME}}
 *
 * 機能:
 *   1. artifacts.json から作成されたドキュメント一覧を抽出
 *   2. git diff から変更されたソースコード一覧を抽出
 *   3. documentation-changelog.md のテンプレートを生成
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join, basename, dirname } from "path";

const args = process.argv.slice(2);
let workflowPath = "";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--workflow" && args[i + 1]) {
    workflowPath = args[i + 1];
    break;
  }
}

if (!workflowPath) {
  console.error("Usage: node generate-documentation-changelog.js --workflow <path>");
  console.error("Example: node generate-documentation-changelog.js --workflow docs/30-workflows/my-feature");
  process.exit(1);
}

// artifacts.json の読み込み
const artifactsPath = join(workflowPath, "artifacts.json");
let artifacts = { phases: {}, metadata: {} };

if (existsSync(artifactsPath)) {
  try {
    artifacts = JSON.parse(readFileSync(artifactsPath, "utf-8"));
  } catch (e) {
    console.warn("Warning: Could not parse artifacts.json:", e.message);
  }
}

// ワークフロー名の抽出
const workflowName = basename(workflowPath);
const today = new Date().toISOString().split("T")[0];

// ドキュメント一覧の収集
const documents = [];

// outputs/ 配下のファイルを収集
for (const [phase, data] of Object.entries(artifacts.phases || {})) {
  if (data.artifacts) {
    for (const artifact of data.artifacts) {
      // artifacts は文字列配列またはオブジェクト配列の両方に対応
      const artifactPath = typeof artifact === "string" ? artifact : artifact.path;
      const artifactName =
        typeof artifact === "string" ? basename(artifact) : artifact.description || basename(artifact.path);

      if (artifactPath) {
        documents.push({
          name: artifactName,
          path: artifactPath,
          phase: phase,
        });
      }
    }
  }
}

// git diff でソースコード変更を取得
let sourceChanges = [];
try {
  const gitDiff = execSync("git diff --name-status HEAD~10", { encoding: "utf-8" });
  const lines = gitDiff.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    const [status, filePath] = line.split("\t");
    if (!filePath) continue;

    // ドキュメント以外のファイル（ソースコード）を抽出
    if (
      (filePath.startsWith("apps/") || filePath.startsWith("packages/")) &&
      !filePath.includes("/outputs/") &&
      !filePath.endsWith(".md")
    ) {
      const statusMap = { M: "修正", A: "追加", D: "削除" };
      sourceChanges.push({
        file: filePath,
        status: statusMap[status] || status,
      });
    }
  }
} catch (e) {
  console.warn("Warning: Could not get git diff:", e.message);
}

// Markdown 生成
const markdown = `# Phase 12 ドキュメント更新履歴

## メタ情報

| 項目     | 内容              |
| -------- | ----------------- |
| 作成日時 | ${today}          |
| タスクID | ${artifacts.metadata?.taskId || "TBD"} |

---

## 1. 作成したドキュメント一覧

### ワークフロー成果物

| ドキュメント | パス | 概要 |
| ------------ | ---- | ---- |
${
  documents.length > 0
    ? documents.map((d) => `| ${d.name} | \`${d.path}\` | Phase ${d.phase} 成果物 |`).join("\n")
    : "| （なし） | - | - |"
}

---

## 2. 更新したドキュメント一覧

### システム仕様

<!-- 以下を手動で記入してください -->
<!-- 更新した場合: 更新内容を記載 -->
<!-- 更新しなかった場合: 「更新なし」と記載し、判断根拠を追記 -->

**更新内容または判断根拠をここに記載**

---

## 3. ソースコード変更一覧

| ファイル | 変更種別 | 変更概要 |
| -------- | -------- | -------- |
${
  sourceChanges.length > 0
    ? sourceChanges.map((c) => `| \`${c.file}\` | ${c.status} | <!-- 概要を記入 --> |`).join("\n")
    : "| （なし） | - | - |"
}

---

## 4. 変更サマリー

| カテゴリ           | 作成数 | 更新数 |
| ------------------ | ------ | ------ |
| ワークフロー成果物 | ${documents.length} | 0 |
| システム仕様書     | 0 | <!-- 手動で記入 --> |
| ソースコード       | 0 | ${sourceChanges.filter((c) => c.status === "修正").length} |
| テストコード       | 0 | <!-- 手動で記入 --> |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | ${today}   | 初版作成 |
`;

// 出力
const outputPath = join(workflowPath, "outputs", "phase-12", "documentation-changelog.md");
const outputDir = dirname(outputPath);

// outputs/phase-12 ディレクトリが存在しない場合は作成
if (!existsSync(outputDir)) {
  execSync(`mkdir -p "${outputDir}"`);
}

writeFileSync(outputPath, markdown, "utf-8");
console.log(`✅ Generated: ${outputPath}`);
console.log("");
console.log("⚠️ 以下のセクションは手動で記入が必要です:");
console.log("  - セクション2: システム仕様の更新内容または判断根拠");
console.log("  - セクション3: ソースコード変更の概要");
console.log("  - セクション4: テストコードの更新数");
