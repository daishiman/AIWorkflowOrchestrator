#!/usr/bin/env node
/**
 * ワークスペース依存関係分析スクリプト
 *
 * モノレポ内のパッケージ間依存関係を分析し、
 * 影響範囲や潜在的な問題を特定します。
 *
 * 使用方法:
 *   node analyze-workspace-deps.mjs [options]
 *
 * オプション:
 *   --package <name>  特定パッケージの影響分析
 *   --graph           依存グラフを出力
 *   --cycles          循環依存をチェック
 *   --json            JSON形式で出力
 */

import { execSync } from "child_process";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

// ANSI カラーコード
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    package: null,
    graph: false,
    cycles: false,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--package":
      case "-p":
        options.package = args[++i];
        break;
      case "--graph":
      case "-g":
        options.graph = true;
        break;
      case "--cycles":
      case "-c":
        options.cycles = true;
        break;
      case "--json":
      case "-j":
        options.json = true;
        break;
      case "--help":
      case "-h":
        showHelp();
        process.exit(0);
    }
  }

  return options;
}

function showHelp() {
  console.log(`
ワークスペース依存関係分析

使用方法:
  node analyze-workspace-deps.mjs [options]

オプション:
  -p, --package <name>  特定パッケージの影響分析
  -g, --graph           依存グラフを出力
  -c, --cycles          循環依存をチェック
  -j, --json            JSON形式で出力
  -h, --help            ヘルプを表示

例:
  node analyze-workspace-deps.mjs --graph
  node analyze-workspace-deps.mjs --package @app/core
  node analyze-workspace-deps.mjs --cycles
`);
}

function getWorkspacePackages() {
  const packages = [];
  const workspaceDirs = ["packages", "apps", "tools", "libs"];

  for (const dir of workspaceDirs) {
    if (!existsSync(dir)) continue;

    const subdirs = readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const subdir of subdirs) {
      const pkgPath = join(dir, subdir, "package.json");
      if (existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
          packages.push({
            name: pkg.name,
            version: pkg.version,
            path: join(dir, subdir),
            dependencies: pkg.dependencies || {},
            devDependencies: pkg.devDependencies || {},
            peerDependencies: pkg.peerDependencies || {},
          });
        } catch {
          // パース失敗は無視
        }
      }
    }
  }

  return packages;
}

function buildDependencyGraph(packages) {
  const graph = {};
  const packageNames = new Set(packages.map((p) => p.name));

  for (const pkg of packages) {
    const internalDeps = [];
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };

    for (const dep of Object.keys(allDeps)) {
      if (packageNames.has(dep)) {
        internalDeps.push(dep);
      }
    }

    graph[pkg.name] = {
      path: pkg.path,
      version: pkg.version,
      dependencies: internalDeps,
      dependents: [], // 後で埋める
    };
  }

  // 被依存関係を構築
  for (const [name, data] of Object.entries(graph)) {
    for (const dep of data.dependencies) {
      if (graph[dep]) {
        graph[dep].dependents.push(name);
      }
    }
  }

  return graph;
}

function findCycles(graph) {
  const cycles = [];
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(node, path) {
    visited.add(node);
    recursionStack.add(node);

    const deps = graph[node]?.dependencies || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        dfs(dep, [...path, dep]);
      } else if (recursionStack.has(dep)) {
        // 循環を検出
        const cycleStart = path.indexOf(dep);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), dep]);
        } else {
          cycles.push([...path, dep]);
        }
      }
    }

    recursionStack.delete(node);
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      dfs(node, [node]);
    }
  }

  return cycles;
}

function getTransitiveDependents(graph, packageName, visited = new Set()) {
  if (visited.has(packageName)) return [];
  visited.add(packageName);

  const dependents = graph[packageName]?.dependents || [];
  const transitive = [];

  for (const dep of dependents) {
    transitive.push(dep);
    transitive.push(...getTransitiveDependents(graph, dep, visited));
  }

  return [...new Set(transitive)];
}

function getTransitiveDependencies(graph, packageName, visited = new Set()) {
  if (visited.has(packageName)) return [];
  visited.add(packageName);

  const dependencies = graph[packageName]?.dependencies || [];
  const transitive = [];

  for (const dep of dependencies) {
    transitive.push(dep);
    transitive.push(...getTransitiveDependencies(graph, dep, visited));
  }

  return [...new Set(transitive)];
}

function analyzePackage(graph, packageName) {
  if (!graph[packageName]) {
    return { error: `パッケージ "${packageName}" が見つかりません` };
  }

  const data = graph[packageName];
  const directDependents = data.dependents;
  const transitiveDependents = getTransitiveDependents(graph, packageName);
  const directDependencies = data.dependencies;
  const transitiveDependencies = getTransitiveDependencies(graph, packageName);

  return {
    package: packageName,
    path: data.path,
    version: data.version,
    directDependencies,
    transitiveDependencies: transitiveDependencies.filter(
      (d) => !directDependencies.includes(d),
    ),
    directDependents,
    transitiveDependents: transitiveDependents.filter(
      (d) => !directDependents.includes(d),
    ),
    impactScore: transitiveDependents.length + 1,
  };
}

function printGraph(graph, asJson) {
  if (asJson) {
    console.log(JSON.stringify(graph, null, 2));
    return;
  }

  log("\n========================================", "cyan");
  log("ワークスペース依存グラフ", "cyan");
  log("========================================\n", "cyan");

  for (const [name, data] of Object.entries(graph)) {
    log(`📦 ${name}`, "blue");
    log(`   パス: ${data.path}`, "gray");
    log(`   バージョン: ${data.version}`, "gray");

    if (data.dependencies.length > 0) {
      log(`   依存: ${data.dependencies.join(", ")}`, "yellow");
    }

    if (data.dependents.length > 0) {
      log(`   被依存: ${data.dependents.join(", ")}`, "green");
    }

    console.log();
  }
}

function printCycles(cycles, asJson) {
  if (asJson) {
    console.log(JSON.stringify({ cycles }, null, 2));
    return;
  }

  log("\n========================================", "cyan");
  log("循環依存チェック", "cyan");
  log("========================================\n", "cyan");

  if (cycles.length === 0) {
    log("✅ 循環依存は検出されませんでした", "green");
  } else {
    log(`❌ ${cycles.length} 件の循環依存を検出しました\n`, "red");

    cycles.forEach((cycle, index) => {
      log(`${index + 1}. ${cycle.join(" → ")}`, "red");
    });
  }
}

function printPackageAnalysis(analysis, asJson) {
  if (asJson) {
    console.log(JSON.stringify(analysis, null, 2));
    return;
  }

  if (analysis.error) {
    log(`\n❌ ${analysis.error}`, "red");
    return;
  }

  log("\n========================================", "cyan");
  log(`影響分析: ${analysis.package}`, "cyan");
  log("========================================\n", "cyan");

  log(`📦 パッケージ: ${analysis.package}`, "blue");
  log(`   パス: ${analysis.path}`, "gray");
  log(`   バージョン: ${analysis.version}`, "gray");
  log(`   影響スコア: ${analysis.impactScore}`, "yellow");

  console.log();

  log("依存関係:", "green");
  if (analysis.directDependencies.length > 0) {
    log(`  直接: ${analysis.directDependencies.join(", ")}`, "gray");
  } else {
    log("  直接: なし", "gray");
  }

  if (analysis.transitiveDependencies.length > 0) {
    log(`  間接: ${analysis.transitiveDependencies.join(", ")}`, "gray");
  }

  console.log();

  log("被依存関係（このパッケージに依存するパッケージ）:", "yellow");
  if (analysis.directDependents.length > 0) {
    log(`  直接: ${analysis.directDependents.join(", ")}`, "gray");
  } else {
    log("  直接: なし", "gray");
  }

  if (analysis.transitiveDependents.length > 0) {
    log(`  間接: ${analysis.transitiveDependents.join(", ")}`, "gray");
  }

  console.log();

  log("推奨テストコマンド:", "cyan");
  log(`  pnpm --filter "...${analysis.package}" run test`, "gray");
  log(`  pnpm --filter "...${analysis.package}" run build`, "gray");
}

function printSummary(graph, asJson) {
  const stats = {
    totalPackages: Object.keys(graph).length,
    packages: Object.entries(graph).map(([name, data]) => ({
      name,
      dependencies: data.dependencies.length,
      dependents: data.dependents.length,
      impactScore: getTransitiveDependents(graph, name).length + 1,
    })),
  };

  stats.packages.sort((a, b) => b.impactScore - a.impactScore);

  if (asJson) {
    console.log(JSON.stringify(stats, null, 2));
    return;
  }

  log("\n========================================", "cyan");
  log("ワークスペース概要", "cyan");
  log("========================================\n", "cyan");

  log(`総パッケージ数: ${stats.totalPackages}`, "blue");
  console.log();

  log("影響度ランキング（高い順）:", "yellow");
  stats.packages.forEach((pkg, index) => {
    const bar = "█".repeat(Math.min(pkg.impactScore, 20));
    log(
      `  ${index + 1}. ${pkg.name.padEnd(30)} ${bar} (${pkg.impactScore})`,
      "gray",
    );
  });
}

// メイン実行
function main() {
  const options = parseArgs();

  log("\n🔍 ワークスペース依存関係分析を開始...", "cyan");

  const packages = getWorkspacePackages();

  if (packages.length === 0) {
    log("\n⚠️  ワークスペースパッケージが見つかりません。", "yellow");
    log(
      "   packages/、apps/、tools/、libs/ ディレクトリを確認してください。",
      "gray",
    );
    process.exit(1);
  }

  const graph = buildDependencyGraph(packages);

  if (options.cycles) {
    const cycles = findCycles(graph);
    printCycles(cycles, options.json);
  } else if (options.graph) {
    printGraph(graph, options.json);
  } else if (options.package) {
    const analysis = analyzePackage(graph, options.package);
    printPackageAnalysis(analysis, options.json);
  } else {
    printSummary(graph, options.json);
  }
}

main();
