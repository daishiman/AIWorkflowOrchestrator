#!/usr/bin/env node
/**
 * analyze-collaboration.mjs
 * マルチエージェントシステムの協調パターンを分析するスクリプト
 *
 * 使用方法:
 *   node .claude/skills/multi-agent-systems/scripts/analyze-collaboration.mjs <agent_file.md>
 *
 * 出力:
 *   協調パターン、依存関係、ハンドオフ設定の分析結果を表示します。
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const COLLABORATION_PATTERNS = {
  delegation: {
    name: "委譲（Delegation）",
    indicators: ["subagent_type", "delegate", "Task tool", "ワーカー", "委譲"],
    description: "上位エージェントが下位エージェントにタスクを委譲",
  },
  chaining: {
    name: "連鎖（Chaining）",
    indicators: ["next_agent", "→", "連鎖", "sequence", "後続"],
    description: "エージェントが順次処理を引き継ぐ",
  },
  parallel: {
    name: "並行（Parallel）",
    indicators: ["parallel", "並行", "並列", "concurrent", "同時"],
    description: "複数エージェントが独立して並行実行",
  },
  feedback: {
    name: "フィードバック（Feedback）",
    indicators: ["feedback", "フィードバック", "⇄", "bidirectional", "双方向"],
    description: "後続エージェントが前段に結果をフィードバック",
  },
};

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

function detectCollaborationPatterns(content) {
  const detected = [];

  for (const [patternId, pattern] of Object.entries(COLLABORATION_PATTERNS)) {
    const matches = pattern.indicators.filter((indicator) =>
      content.toLowerCase().includes(indicator.toLowerCase()),
    );
    if (matches.length > 0) {
      detected.push({
        id: patternId,
        ...pattern,
        matchedIndicators: matches,
        confidence: Math.min(1, matches.length / 3),
      });
    }
  }

  return detected.sort((a, b) => b.confidence - a.confidence);
}

function extractDependencies(content) {
  const dependencies = {
    prerequisites: [],
    successors: [],
    parallel: [],
    subagents: [],
  };

  // 前提エージェント
  const prereqMatch = content.match(/前提[エージェント]*[:：]?\s*(.+)/gm);
  if (prereqMatch) {
    prereqMatch.forEach((m) => {
      const agents = m
        .replace(/前提[エージェント]*[:：]?\s*/, "")
        .split(/[,、]/);
      dependencies.prerequisites.push(
        ...agents.map((a) => a.trim()).filter((a) => a),
      );
    });
  }

  // 後続エージェント
  const succMatch = content.match(/後続[エージェント]*[:：]?\s*(.+)/gm);
  if (succMatch) {
    succMatch.forEach((m) => {
      const agents = m
        .replace(/後続[エージェント]*[:：]?\s*/, "")
        .split(/[,、]/);
      dependencies.successors.push(
        ...agents.map((a) => a.trim()).filter((a) => a),
      );
    });
  }

  // サブエージェント
  const subagentMatch = content.match(/subagent_type[='":\s]+['"]?(\w+)/gi);
  if (subagentMatch) {
    subagentMatch.forEach((m) => {
      const agent = m.match(/subagent_type[='":\s]+['"]?(\w+)/i);
      if (agent) dependencies.subagents.push(agent[1]);
    });
  }

  return dependencies;
}

function analyzeHandoffProtocol(content) {
  const handoff = {
    hasProtocol: false,
    elements: [],
  };

  const handoffIndicators = [
    { name: "from_agent", pattern: /from_agent/i },
    { name: "to_agent", pattern: /to_agent/i },
    { name: "status", pattern: /status.*(?:completed|partial|failed)/i },
    { name: "summary", pattern: /summary/i },
    { name: "artifacts", pattern: /artifacts/i },
    { name: "context", pattern: /context/i },
    { name: "metadata", pattern: /metadata/i },
  ];

  for (const indicator of handoffIndicators) {
    if (indicator.pattern.test(content)) {
      handoff.hasProtocol = true;
      handoff.elements.push(indicator.name);
    }
  }

  return handoff;
}

function calculateScore(patterns, dependencies, handoff) {
  let score = 5; // 基本スコア

  // パターン検出
  if (patterns.length > 0) score += 1;
  if (patterns.some((p) => p.confidence > 0.5)) score += 1;

  // 依存関係定義
  const depCount = Object.values(dependencies).flat().length;
  if (depCount > 0) score += 1;
  if (depCount >= 3) score += 1;

  // ハンドオフプロトコル
  if (handoff.hasProtocol) score += 1;
  if (handoff.elements.length >= 4) score += 1;

  return Math.min(10, score);
}

function printResults(filePath, yaml, patterns, dependencies, handoff) {
  const score = calculateScore(patterns, dependencies, handoff);

  console.log("═══════════════════════════════════════════════════════════");
  console.log("              マルチエージェント協調分析レポート              ");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`ファイル: ${filePath}`);
  console.log(`エージェント名: ${yaml.name || "不明"}`);
  console.log("───────────────────────────────────────────────────────────");

  console.log("\n【検出された協調パターン】");
  if (patterns.length === 0) {
    console.log("  協調パターンが検出されませんでした");
  } else {
    for (const pattern of patterns) {
      const confidence = Math.round(pattern.confidence * 100);
      console.log(`  ✅ ${pattern.name} (信頼度: ${confidence}%)`);
      console.log(`     説明: ${pattern.description}`);
    }
  }

  console.log("\n【依存関係】");
  const { prerequisites, successors, parallel, subagents } = dependencies;
  console.log(
    `  前提エージェント: ${prerequisites.length > 0 ? prerequisites.join(", ") : "なし"}`,
  );
  console.log(
    `  後続エージェント: ${successors.length > 0 ? successors.join(", ") : "なし"}`,
  );
  console.log(
    `  サブエージェント: ${subagents.length > 0 ? [...new Set(subagents)].join(", ") : "なし"}`,
  );

  console.log("\n【ハンドオフプロトコル】");
  if (handoff.hasProtocol) {
    console.log(`  ✅ プロトコル定義あり`);
    console.log(`  要素: ${handoff.elements.join(", ")}`);
  } else {
    console.log("  ❌ ハンドオフプロトコルが定義されていません");
  }

  console.log("\n───────────────────────────────────────────────────────────");
  console.log(`マルチエージェント設計スコア: ${score}/10`);

  if (score >= 8) {
    console.log("✅ 評価: 優れたマルチエージェント設計です");
  } else if (score >= 5) {
    console.log("⚠️  評価: 一部改善が推奨されます");
  } else {
    console.log("❌ 評価: マルチエージェント設計の強化が必要です");
  }
  console.log("═══════════════════════════════════════════════════════════");

  // 推奨事項
  const recommendations = [];

  if (patterns.length === 0) {
    recommendations.push(
      "- 協調パターン（委譲、連鎖、並行、フィードバック）を明示的に定義してください",
    );
  }

  if (!handoff.hasProtocol) {
    recommendations.push(
      "- 標準化されたハンドオフプロトコルを追加してください",
    );
  }

  if (Object.values(dependencies).flat().length === 0) {
    recommendations.push(
      "- 依存関係（前提、後続、サブエージェント）を明確に定義してください",
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
    console.log("使用方法: node analyze-collaboration.mjs <agent_file.md>");
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
  const patterns = detectCollaborationPatterns(content);
  const dependencies = extractDependencies(content);
  const handoff = analyzeHandoffProtocol(content);

  printResults(filePath, yaml, patterns, dependencies, handoff);

  const score = calculateScore(patterns, dependencies, handoff);
  process.exit(score >= 5 ? 0 : 1);
}

main();
