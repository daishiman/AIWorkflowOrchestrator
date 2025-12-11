#!/usr/bin/env node

/**
 * check-circular-deps.mjs
 * エージェント間の循環依存を検出するスクリプト
 *
 * Usage: node check-circular-deps.mjs <agent_file.md>
 *
 * 検出項目:
 *   1. 直接循環（A → B → A）
 *   2. 間接循環（A → B → C → A）
 *   3. 自己参照（A → A）
 */

import * as fs from "fs";
import * as path from "path";

// ANSI color codes
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

/**
 * ファイルから依存関係を抽出
 */
function extractDependencies(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const deps = [];

  // Task(), Skill(), Agent()呼び出しから依存先を抽出
  const depPattern = /(?:Task|Skill|Agent)\(([^)]+)\)/g;
  let match;

  while ((match = depPattern.exec(content)) !== null) {
    const dep = match[1].trim();
    if (dep.endsWith(".md")) {
      // ファイルパスからエージェント名を抽出
      deps.push(path.basename(dep, ".md"));
    }
  }

  return deps;
}

/**
 * エージェント名を取得
 */
function getAgentName(content, filePath) {
  const nameMatch = content.match(/^name:\s*(.+)$/m);
  return nameMatch ? nameMatch[1].trim() : path.basename(filePath, ".md");
}

/**
 * 循環依存を検出する再帰関数
 */
function detectCycles(agentName, rootAgent, visited, currentPath, cycles) {
  // 最大深度チェック
  if (currentPath.length > 20) {
    return;
  }

  currentPath.push(agentName);

  // エージェントファイルを探す
  const possiblePaths = [`.claude/agents/${agentName}.md`, agentName];

  let agentFile = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      agentFile = p;
      break;
    }
  }

  if (!agentFile) {
    currentPath.pop();
    return;
  }

  const deps = extractDependencies(agentFile);

  for (const dep of deps) {
    // 自己参照チェック
    if (dep === agentName) {
      cycles.push([...currentPath, dep]);
      continue;
    }

    // ルートエージェントへの循環チェック
    if (dep === rootAgent) {
      cycles.push([...currentPath, dep]);
      continue;
    }

    // パス内の循環チェック
    if (currentPath.includes(dep)) {
      cycles.push([...currentPath, dep]);
      continue;
    }

    // 未訪問ノードを再帰的にチェック
    if (!visited.has(dep)) {
      visited.add(dep);
      detectCycles(dep, rootAgent, visited, currentPath, cycles);
      visited.delete(dep);
    }
  }

  currentPath.pop();
}

/**
 * 依存関係グラフを表示
 */
function displayDependencyGraph(agentName, deps) {
  console.log("");
  console.log("📋 [3/3] 依存関係グラフ...");
  console.log(agentName);

  for (const dep of deps) {
    console.log(`  └─→ ${dep}`);

    // 依存先の依存（深度2）
    const depFile = `.claude/agents/${dep}.md`;
    if (fs.existsSync(depFile)) {
      const subDeps = extractDependencies(depFile);
      for (const subDep of subDeps) {
        console.log(`      └─→ ${subDep}`);
      }
    }
  }
}

/**
 * メイン検証関数
 */
function checkCircularDependencies(agentFile) {
  console.log("=== 循環依存検出 ===");
  console.log(`対象ファイル: ${agentFile}`);
  console.log("");

  if (!fs.existsSync(agentFile)) {
    console.log(
      `${colors.red}エラー: ファイルが見つかりません: ${agentFile}${colors.reset}`,
    );
    return false;
  }

  const content = fs.readFileSync(agentFile, "utf-8");
  const agentName = getAgentName(content, agentFile);

  console.log(`エージェント名: ${agentName}`);
  console.log("");

  // 依存関係の抽出
  console.log("📊 [1/3] 依存関係の抽出...");
  const deps = extractDependencies(agentFile);

  if (deps.length === 0) {
    console.log(
      `${colors.green}  ✓ 依存関係なし（スタンドアロン）${colors.reset}`,
    );
    console.log("");
    console.log("=== 検証結果サマリー ===");
    console.log(
      `${colors.green}✓ 循環依存は検出されませんでした${colors.reset}`,
    );
    return true;
  }

  console.log("依存先:");
  for (const dep of deps) {
    console.log(`  - ${dep}`);
  }

  // 循環依存のチェック
  console.log("");
  console.log("🔍 [2/3] 循環依存のチェック...");

  const visited = new Set([agentName]);
  const cycles = [];

  detectCycles(agentName, agentName, visited, [], cycles);

  let errors = cycles.length;

  if (cycles.length > 0) {
    for (const cycle of cycles) {
      if (cycle[0] === cycle[cycle.length - 1]) {
        console.log(
          `${colors.red}  ✗ 自己参照検出: ${cycle.join(" → ")}${colors.reset}`,
        );
      } else {
        console.log(
          `${colors.red}  ✗ 循環依存検出: ${cycle.join(" → ")}${colors.reset}`,
        );
      }
    }
  } else {
    console.log(`${colors.green}  ✓ 循環依存なし${colors.reset}`);
  }

  // 依存関係グラフ表示
  displayDependencyGraph(agentName, deps);

  // 結果サマリー
  console.log("");
  console.log("=== 検証結果サマリー ===");
  console.log(`エラー: ${colors.red}${errors}${colors.reset}`);

  if (errors === 0) {
    console.log(
      `\n${colors.green}✓ 循環依存は検出されませんでした${colors.reset}`,
    );
    return true;
  } else {
    console.log(
      `\n${colors.red}✗ 循環依存が検出されました。修正が必要です${colors.reset}`,
    );
    console.log("");
    console.log("推奨される解決策:");
    console.log("  1. 依存の削減: 不要な依存を削除");
    console.log("  2. 依存の反転: 依存方向を逆転");
    console.log("  3. 中間層の導入: 仲介エージェントを追加");
    return false;
  }
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用法: node check-circular-deps.mjs <agent_file.md>");
    console.log("");
    console.log("例:");
    console.log(
      "  node check-circular-deps.mjs .claude/agents/skill-librarian.md",
    );
    process.exit(1);
  }

  const success = checkCircularDependencies(args[0]);
  process.exit(success ? 0 : 1);
}

main();
