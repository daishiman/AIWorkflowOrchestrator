#!/usr/bin/env node
/**
 * analyze-permissions.mjs
 * エージェントのツール権限を分析するスクリプト
 *
 * 使用方法:
 *   node .claude/skills/tool-permission-management/scripts/analyze-permissions.mjs <agent_file.md>
 *
 * 出力:
 *   ツール権限の分析結果とセキュリティ評価を表示します。
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const TOOL_CATEGORIES = {
  read_only: {
    name: "読み取り専用",
    tools: -Read - Grep - Glob,
    risk: "low",
    description: "分析、レビュー、監査",
  },
  read_write: {
    name: "読み書き",
    tools: -Read - Write - Edit - Grep - MultiEdit,
    risk: "medium",
    description: "実装、生成、変換",
  },
  orchestrator: {
    name: "オーケストレーター",
    tools: -Task - Read,
    risk: "medium",
    description: "マルチエージェント調整",
  },
  full_access: {
    name: "フル権限",
    tools: -Bash - Read - Write - Edit - Task,
    risk: "high",
    description: "デプロイ、インフラ管理",
  },
};

const DANGEROUS_COMMANDS = [
  "rm -rf",
  "sudo",
  "curl | sh",
  "wget | sh",
  "chmod 777",
  "git push --force",
  "pnpm publish",
  "DROP TABLE",
  "DELETE FROM",
];

const SENSITIVE_PATHS = [
  ".env",
  "*.key",
  "*.pem",
  "*.p12",
  "credentials",
  ".git/",
  "node_modules/",
  "secrets/",
];

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = {};
  const lines = match[1].split("\n");
  let currentKey = null;
  let multilineValue = "";

  for (const line of lines) {
    if (line.match(/^\w+:/)) {
      if (currentKey && multilineValue) {
        yaml[currentKey] = multilineValue.trim();
        multilineValue = "";
      }
      const colonIndex = line.indexOf(":");
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      currentKey = key;

      if (value.startsWith("[") && value.endsWith("]")) {
        yaml[key] = value
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim());
        currentKey = null;
      } else if (value && value !== "|") {
        yaml[key] = value;
        currentKey = null;
      }
    } else if (currentKey && line.startsWith("  ")) {
      multilineValue += line.trim() + "\n";
    }
  }

  if (currentKey && multilineValue) {
    yaml[currentKey] = multilineValue.trim();
  }

  return yaml;
}

function extractTools(yaml, content) {
  let tools = [];

  // YAML から取得
  if (yaml.tools) {
    if (Array.isArray(yaml.tools)) {
      tools = yaml.tools;
    } else if (typeof yaml.tools === "string") {
      const match = yaml.tools.match(/\[([^\]]+)\]/);
      if (match) {
        tools = match[1].split(",").map((s) => s.trim());
      }
    }
  }

  return tools;
}

function categorizeTools(tools) {
  for (const [categoryId, category] of Object.entries(TOOL_CATEGORIES)) {
    const categoryTools = category.tools;
    const hasBash = tools.includes("Bash");
    const hasTask = tools.includes("Task");
    const hasWrite = tools.includes("Write") || tools.includes("Edit");

    if (hasBash && hasWrite) {
      return { id: "full_access", ...TOOL_CATEGORIES.full_access };
    }
    if (hasTask && !hasWrite) {
      return { id: "orchestrator", ...TOOL_CATEGORIES.orchestrator };
    }
    if (hasWrite) {
      return { id: "read_write", ...TOOL_CATEGORIES.read_write };
    }
  }

  return { id: "read_only", ...TOOL_CATEGORIES.read_only };
}

function analyzeSecurityMeasures(content) {
  const measures = {
    path_restriction: {
      name: "パス制限",
      found: false,
      details: [],
    },
    approval_gate: {
      name: "承認ゲート",
      found: false,
      details: [],
    },
    sensitive_protection: {
      name: "センシティブ保護",
      found: false,
      details: [],
    },
    bash_restriction: {
      name: "Bash制限",
      found: false,
      details: [],
    },
  };

  // パス制限
  if (
    content.includes("write_allowed_paths") ||
    content.includes("対象ファイルパターン")
  ) {
    measures.path_restriction.found = true;
    const patterns = content.match(/["']([^"']+)[*]?[^"']*["']/g) || [];
    measures.path_restriction.details = patterns.slice(0, 3);
  }

  // 承認ゲート
  if (content.includes("approval_required") || content.includes("承認")) {
    measures.approval_gate.found = true;
  }

  // センシティブ保護
  for (const path of SENSITIVE_PATHS) {
    if (content.includes(path)) {
      measures.sensitive_protection.found = true;
      measures.sensitive_protection.details.push(path);
    }
  }

  // Bash制限
  if (content.includes("禁止されるコマンド") || content.includes("Bash制限")) {
    measures.bash_restriction.found = true;
    for (const cmd of DANGEROUS_COMMANDS) {
      if (content.includes(cmd)) {
        measures.bash_restriction.details.push(cmd);
      }
    }
  }

  return measures;
}

function calculateSecurityScore(tools, measures, category) {
  let score = 10;

  // ツール数によるペナルティ
  if (tools.length > 5) score -= 1;
  if (tools.includes("Bash")) score -= 2;

  // セキュリティ対策によるボーナス
  if (measures.path_restriction.found) score += 1;
  if (measures.approval_gate.found) score += 1;
  if (measures.sensitive_protection.found) score += 1;
  if (measures.bash_restriction.found && tools.includes("Bash")) score += 1;

  // カテゴリによる調整
  if (category.risk === "high" && !measures.path_restriction.found) score -= 2;
  if (category.risk === "high" && !measures.approval_gate.found) score -= 1;

  return Math.max(0, Math.min(10, score));
}

function printResults(filePath, yaml, tools, category, measures) {
  const score = calculateSecurityScore(tools, measures, category);

  console.log("═══════════════════════════════════════════════════════════");
  console.log("                  ツール権限分析レポート                     ");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`ファイル: ${filePath}`);
  console.log(`エージェント名: ${yaml.name || "不明"}`);
  console.log("───────────────────────────────────────────────────────────");

  console.log(`\n【ツール構成】`);
  console.log(`  ツール: ${tools.join(", ") || "なし"}`);
  console.log(`  カテゴリ: ${category.name}`);
  console.log(`  リスクレベル: ${category.risk.toUpperCase()}`);
  console.log(`  用途: ${category.description}`);

  console.log(`\n【セキュリティ対策の検出】`);
  for (const measure of Object.values(measures)) {
    const status = measure.found ? "✅" : "❌";
    console.log(`  ${status} ${measure.name}`);
    if (measure.details.length > 0) {
      console.log(`      詳細: ${measure.details.join(", ")}`);
    }
  }

  console.log("\n───────────────────────────────────────────────────────────");
  console.log(`セキュリティスコア: ${score.toFixed(1)}/10`);

  if (score >= 8) {
    console.log("✅ 評価: セキュリティ対策は十分です");
  } else if (score >= 5) {
    console.log("⚠️  評価: 一部セキュリティ対策の追加を推奨");
  } else {
    console.log("❌ 評価: セキュリティ対策の見直しが必要です");
  }
  console.log("═══════════════════════════════════════════════════════════");

  // 推奨事項
  const recommendations = [];

  if (tools.includes("Write") || tools.includes("Edit")) {
    if (!measures.path_restriction.found) {
      recommendations.push("- write_allowed_pathsを設定してください");
    }
  }

  if (tools.includes("Bash")) {
    if (!measures.bash_restriction.found) {
      recommendations.push("- 禁止されるBashコマンドを明記してください");
    }
    if (!measures.approval_gate.found) {
      recommendations.push("- 危険な操作に承認ゲートを設定してください");
    }
  }

  if (!measures.sensitive_protection.found) {
    recommendations.push(
      "- センシティブファイル（.env, *.key等）の制限を追加してください",
    );
  }

  if (recommendations.length > 0) {
    console.log("\n推奨事項:");
    recommendations.forEach((r) => console.log(r));
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node analyze-permissions.mjs <agent_file.md>");
    process.exit(1);
  }

  const filePath = resolve(args[0]);
  let content;

  try {
    content = readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error(`エラー: ファイル "${filePath}" を読み込めません`);
    process.exit(1);
  }

  const yaml = parseYamlFrontmatter(content);
  const tools = extractTools(yaml, content);
  const category = categorizeTools(tools);
  const measures = analyzeSecurityMeasures(content);

  printResults(filePath, yaml, tools, category, measures);

  const score = calculateSecurityScore(tools, measures, category);
  process.exit(score >= 5 ? 0 : 1);
}

main();
