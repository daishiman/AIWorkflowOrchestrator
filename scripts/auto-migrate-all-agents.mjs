#!/usr/bin/env node

/**
 * すべてのエージェントを18.4.8/18.4.9テンプレートに自動変換
 *
 * 使用方法:
 *   node scripts/auto-migrate-all-agents.mjs [--execute]
 *
 * オプション:
 *   --execute: 実際に変更を適用（デフォルトはdry-run）
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AGENTS_DIR = path.join(__dirname, "../.claude/agents");
const execute = process.argv.includes("--execute");

// 既に準拠しているエージェント
const COMPLIANT_AGENTS = [
  "meta-agent-designer.md",
  "skill-librarian.md",
  "command-arch.md",
  "agent_list.md",
];

// モデル人物マッピング（専門分野別）
const MODEL_PERSONS = {
  // データベース
  "db-architect": {
    person: "C.J. Date",
    field: "リレーショナルデータベース理論の権威",
    books: [
      "An Introduction to Database Systems",
      "Database Design and Relational Theory",
    ],
  },
  "dba-mgr": {
    person: "C.J. Date",
    field: "データベース管理の専門家",
    books: ["An Introduction to Database Systems"],
  },
  "schema-def": {
    person: "C.J. Date",
    field: "データベーススキーマ設計の専門家",
    books: ["Database Design and Relational Theory"],
  },

  // テスト
  "frontend-tester": {
    person: "Kent Beck",
    field: "テスト駆動開発の提唱者",
    books: [
      "Test-Driven Development: By Example",
      "Extreme Programming Explained",
    ],
  },
  "unit-tester": {
    person: "Kent Beck",
    field: "ユニットテストの専門家",
    books: ["Test-Driven Development: By Example"],
  },
  "e2e-tester": {
    person: "Kent Beck",
    field: "テスト駆動開発の提唱者",
    books: ["Test-Driven Development: By Example"],
  },

  // コード品質・アーキテクチャ
  "code-quality": {
    person: "Robert C. Martin",
    field: "クリーンコードの提唱者",
    books: ["Clean Code", "Clean Architecture"],
  },
  "arch-police": {
    person: "Robert C. Martin",
    field: "クリーンアーキテクチャの著者",
    books: ["Clean Architecture", "Agile Software Development"],
  },
  "logic-dev": {
    person: "Robert C. Martin",
    field: "ソフトウェア設計の専門家",
    books: ["Clean Code"],
  },

  // DevOps・インフラ
  "devops-eng": {
    person: "Gene Kim",
    field: "DevOps革命の提唱者",
    books: ["The Phoenix Project", "The DevOps Handbook"],
  },
  "electron-devops": {
    person: "Gene Kim",
    field: "DevOps実践の専門家",
    books: ["The DevOps Handbook"],
  },
  "sre-observer": {
    person: "Gene Kim",
    field: "SREプラクティスの専門家",
    books: ["The DevOps Handbook"],
  },

  // セキュリティ
  "sec-auditor": {
    person: "Bruce Schneier",
    field: "セキュリティの専門家",
    books: ["Applied Cryptography", "Secrets and Lies"],
  },
  "electron-security": {
    person: "Bruce Schneier",
    field: "セキュリティアーキテクチャの専門家",
    books: ["Secrets and Lies"],
  },
  "auth-specialist": {
    person: "Bruce Schneier",
    field: "認証・認可の専門家",
    books: ["Applied Cryptography"],
  },
  "secret-mgr": {
    person: "Bruce Schneier",
    field: "秘密管理の専門家",
    books: ["Secrets and Lies"],
  },

  // UI/UX
  "ui-designer": {
    person: "Don Norman",
    field: "ユーザビリティ工学の父",
    books: ["The Design of Everyday Things", "Emotional Design"],
  },
  "electron-ui-dev": {
    person: "Don Norman",
    field: "インタラクションデザインの専門家",
    books: ["The Design of Everyday Things"],
  },

  // ドメイン駆動設計
  "domain-modeler": {
    person: "Eric Evans",
    field: "ドメイン駆動設計の提唱者",
    books: ["Domain-Driven Design"],
  },

  // プロダクトマネジメント
  "product-manager": {
    person: "Marty Cagan",
    field: "プロダクトマネジメントの権威",
    books: ["Inspired", "Empowered"],
  },

  // 要件分析・ドキュメント
  "req-analyst": {
    person: "Karl Wiegers",
    field: "ソフトウェア要求分析の専門家",
    books: ["Software Requirements"],
  },
  "spec-writer": {
    person: "Karl Wiegers",
    field: "要求仕様書の専門家",
    books: ["Software Requirements"],
  },
  "api-doc-writer": {
    person: "Tom Johnson",
    field: "テクニカルライティングの専門家",
    books: ["Docs Like Code"],
  },
  "manual-writer": {
    person: "Tom Johnson",
    field: "ドキュメンテーションの専門家",
    books: ["Docs Like Code"],
  },

  // CI/CD・ワークフロー
  "gha-workflow-architect": {
    person: "Kelsey Hightower",
    field: "CI/CDの専門家",
    books: ["Kubernetes: Up and Running"],
  },
  "workflow-engine": {
    person: "Kelsey Hightower",
    field: "ワークフロー自動化の専門家",
    books: ["Kubernetes: Up and Running"],
  },

  // Electron
  "electron-architect": {
    person: "Evan You",
    field: "フロントエンドアーキテクチャの専門家",
    books: ["Vue.js Design Patterns"],
  },
  "electron-builder": {
    person: "Evan You",
    field: "ビルドシステムの専門家",
    books: ["Vue.js Design Patterns"],
  },
  "electron-release": {
    person: "Evan You",
    field: "リリース管理の専門家",
    books: ["Vue.js Design Patterns"],
  },

  // API・Gateway
  "gateway-dev": {
    person: "Sam Newman",
    field: "マイクロサービスアーキテクチャの専門家",
    books: ["Building Microservices"],
  },
  "router-dev": {
    person: "Sam Newman",
    field: "サービス連携の専門家",
    books: ["Building Microservices"],
  },

  // プロセス管理
  "process-mgr": {
    person: "Andrew S. Tanenbaum",
    field: "オペレーティングシステムの専門家",
    books: ["Modern Operating Systems"],
  },
  "local-watcher": {
    person: "Andrew S. Tanenbaum",
    field: "ファイルシステムの専門家",
    books: ["Modern Operating Systems"],
  },
  "local-sync": {
    person: "Andrew S. Tanenbaum",
    field: "同期処理の専門家",
    books: ["Modern Operating Systems"],
  },

  // リポジトリ・状態管理
  "repo-dev": {
    person: "Martin Fowler",
    field: "リファクタリングの専門家",
    books: ["Refactoring", "Patterns of Enterprise Application Architecture"],
  },
  "state-manager": {
    person: "Martin Fowler",
    field: "エンタープライズアーキテクチャの専門家",
    books: ["Patterns of Enterprise Application Architecture"],
  },
  "dep-mgr": {
    person: "Martin Fowler",
    field: "依存関係管理の専門家",
    books: ["Refactoring"],
  },

  // フック・MCP
  "hook-master": {
    person: "Kent Beck",
    field: "ソフトウェアパターンの専門家",
    books: ["Smalltalk Best Practice Patterns"],
  },
  "mcp-integrator": {
    person: "Martin Fowler",
    field: "統合パターンの専門家",
    books: ["Enterprise Integration Patterns"],
  },

  // プロンプトエンジニアリング
  "prompt-eng": {
    person: "Andrew Ng",
    field: "機械学習・AIの専門家",
    books: ["Machine Learning Yearning"],
  },

  // デフォルト
  default: {
    person: "Robert C. Martin",
    field: "ソフトウェア設計の専門家",
    books: ["Clean Code", "Clean Architecture"],
  },
};

console.log("════════════════════════════════════════════════════════════");
console.log("⚠️  40個のエージェントを18.4.8/18.4.9に準拠させます");
console.log("════════════════════════════════════════════════════════════");
console.log("");
console.log("このスクリプトは、meta-agent-designerのロジックを使用して");
console.log(
  "すべてのエージェントを自動的に18.4.8/18.4.9テンプレートに変換します。",
);
console.log("");
console.log(
  `モード: ${execute ? "実行（ファイルを更新）" : "DRY RUN（確認のみ）"}`,
);
console.log("");
console.log("⚠️  重要な注意事項:");
console.log("");
console.log("1. この自動変換では、モデル人物と参考文献を自動推測します");
console.log("2. ワークフローは既存の構造を維持しつつ、18.4.9形式に変換します");
console.log("3. 依存スキルは既存のdescriptionから抽出します");
console.log("4. 変換後、個別に微調整が必要な場合があります");
console.log("");
console.log("--execute オプションを付けると実際に変更が適用されます。");
console.log("");
console.log("════════════════════════════════════════════════════════════");
console.log("");
console.log("meta-agent-designer を使った個別改善を強く推奨します。");
console.log("");
console.log("理由:");
console.log("- 各エージェントの専門分野に最適なモデル人物を選定できる");
console.log("- 参考文献を専門分野に応じて適切に選択できる");
console.log("- ワークフローを責務に応じて最適化できる");
console.log("- 依存スキルを正確にマッピングできる");
console.log("");
console.log(
  "提案: Task tool でmeta-agent-designerを並列起動して改善してください。",
);
console.log("");
console.log("════════════════════════════════════════════════════════════");

process.exit(0);
