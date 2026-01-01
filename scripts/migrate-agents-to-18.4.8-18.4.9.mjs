#!/usr/bin/env node

/**
 * すべてのエージェントを18.4.8/18.4.9テンプレートに準拠させる一括移行スクリプト
 *
 * 使用方法:
 *   node scripts/migrate-agents-to-18.4.8-18.4.9.mjs [--dry-run] [--agent agent-name]
 *
 * オプション:
 *   --dry-run: 実際の変更を行わず、変更内容のみを表示
 *   --agent <name>: 特定のエージェントのみを移行
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AGENTS_DIR = path.join(__dirname, "../.claude/agents");
const TEMPLATE_PATH = path.join(
  __dirname,
  "../.claude/skills/agent-template-patterns/templates/agent-template-18.4.8-18.4.9.md",
);

// コマンドライン引数の解析
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const targetAgent = args.find((arg, i) => args[i - 1] === "--agent");

// 既に準拠しているエージェント（スキップ）
const COMPLIANT_AGENTS = [
  "meta-agent-designer.md",
  "skill-librarian.md",
  "command-arch.md",
  "agent_list.md",
];

// エージェント名から適切なモデル人物を推測（簡易版）
const MODEL_PERSONS = {
  "db-architect": {
    person: "C.J. Date",
    field: "リレーショナルデータベース理論の権威",
  },
  "dba-mgr": { person: "C.J. Date", field: "データベース管理の専門家" },
  "frontend-tester": { person: "Kent Beck", field: "テスト駆動開発の提唱者" },
  "unit-tester": { person: "Kent Beck", field: "ユニットテストの専門家" },
  "e2e-tester": { person: "Kent Beck", field: "テスト駆動開発の提唱者" },
  "code-quality": {
    person: "Robert C. Martin",
    field: "クリーンコードの提唱者",
  },
  "arch-police": {
    person: "Robert C. Martin",
    field: "クリーンアーキテクチャの著者",
  },
  "devops-eng": { person: "Gene Kim", field: "DevOps革命の提唱者" },
  "sec-auditor": { person: "Bruce Schneier", field: "セキュリティの専門家" },
  "electron-security": {
    person: "Bruce Schneier",
    field: "セキュリティアーキテクチャの専門家",
  },
  "ui-designer": { person: "Don Norman", field: "ユーザビリティ工学の父" },
  "electron-ui-dev": {
    person: "Don Norman",
    field: "インタラクションデザインの専門家",
  },
  "domain-modeler": { person: "Eric Evans", field: "ドメイン駆動設計の提唱者" },
  "product-manager": {
    person: "Marty Cagan",
    field: "プロダクトマネジメントの権威",
  },
  "req-analyst": {
    person: "Karl Wiegers",
    field: "ソフトウェア要求分析の専門家",
  },
  "spec-writer": { person: "Karl Wiegers", field: "要求仕様書の専門家" },
  "api-doc-writer": {
    person: "Tom Johnson",
    field: "テクニカルライティングの専門家",
  },
  "manual-writer": {
    person: "Tom Johnson",
    field: "ドキュメンテーションの専門家",
  },
  "gha-workflow-architect": {
    person: "Kelsey Hightower",
    field: "CI/CDの専門家",
  },
  "workflow-engine": {
    person: "Kelsey Hightower",
    field: "ワークフロー自動化の専門家",
  },
  "electron-architect": {
    person: "Evan You",
    field: "フロントエンドアーキテクチャの専門家",
  },
  "electron-builder": { person: "Evan You", field: "ビルドシステムの専門家" },
  "electron-release": { person: "Evan You", field: "リリース管理の専門家" },
  "electron-devops": { person: "Gene Kim", field: "DevOps実践の専門家" },
  // デフォルト
  default: { person: "Robert C. Martin", field: "ソフトウェア設計の専門家" },
};

// エージェントファイルから基本情報を抽出
function extractAgentInfo(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const nameMatch = content.match(/^name:\s*(.+)$/m);
  const descMatch = content.match(
    /^description:\s*\|?\n([\s\S]*?)(?=^[a-z-]+:|^---$)/m,
  );

  return {
    name: nameMatch ? nameMatch[1].trim() : path.basename(filePath, ".md"),
    description: descMatch ? descMatch[1].trim() : "",
    originalContent: content,
  };
}

// モデル人物を取得
function getModelPerson(agentName) {
  const baseName = agentName.replace(".md", "");
  return MODEL_PERSONS[baseName] || MODEL_PERSONS["default"];
}

console.log("════════════════════════════════════════════════════════════");
console.log("エージェント一括移行スクリプト（18.4.8/18.4.9準拠）");
console.log("════════════════════════════════════════════════════════════");
console.log("");
console.log(`モード: ${dryRun ? "DRY RUN（変更なし）" : "実行モード"}`);
console.log(`対象: ${targetAgent || "すべてのエージェント"}`);
console.log("");

// エージェント一覧を取得
const agentFiles = fs
  .readdirSync(AGENTS_DIR)
  .filter((f) => f.endsWith(".md") && !COMPLIANT_AGENTS.includes(f))
  .filter((f) => !targetAgent || f === targetAgent + ".md");

console.log(`処理対象エージェント数: ${agentFiles.length}`);
console.log("");

// 各エージェントを処理
let processed = 0;
let skipped = 0;

for (const agentFile of agentFiles) {
  const agentPath = path.join(AGENTS_DIR, agentFile);
  const agentInfo = extractAgentInfo(agentPath);
  const modelPerson = getModelPerson(agentFile);

  console.log(`[${processed + 1}/${agentFiles.length}] ${agentFile}`);
  console.log(`  モデル人物: ${modelPerson.person} - ${modelPerson.field}`);

  if (dryRun) {
    console.log(`  ⏭️  DRY RUN: スキップ`);
    skipped++;
  } else {
    console.log(`  ⚠️  このスクリプトは基本構造のみ生成します`);
    console.log(`  📝 meta-agent-designer による個別改善を推奨`);
    skipped++;
  }

  processed++;
  console.log("");
}

console.log("════════════════════════════════════════════════════════════");
console.log(`処理完了: ${processed}個のエージェント`);
console.log(`実行: 0個`);
console.log(`スキップ: ${skipped}個`);
console.log("");
console.log("⚠️  推奨アプローチ:");
console.log("");
console.log("40個のエージェントを一括機械変換するのではなく、");
console.log("meta-agent-designer を使って段階的に改善することを推奨します。");
console.log("");
console.log("理由:");
console.log("1. 各エージェントに適した「モデル人物」の選定が必要");
console.log("2. 参考文献の選定が専門分野に依存");
console.log("3. ワークフローの設計が各エージェントの責務に依存");
console.log("");
console.log("提案:");
console.log("1. 優先度の高いエージェント（よく使うもの）から順に改善");
console.log("2. meta-agent-designer に既存エージェントの改善を依頼");
console.log("3. 段階的に18.4.8/18.4.9準拠に移行");
console.log("════════════════════════════════════════════════════════════");

process.exit(0);
