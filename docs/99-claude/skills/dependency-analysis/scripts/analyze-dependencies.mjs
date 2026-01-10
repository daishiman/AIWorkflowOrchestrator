#!/usr/bin/env node
/**
 * 依存関係分析スクリプト
 *
 * 使用方法:
 *   node analyze-dependencies.mjs <source-directory>
 *
 * 例:
 *   node analyze-dependencies.mjs src/
 */

import { readdir, readFile, stat } from "fs/promises";
import { join, relative, dirname, resolve } from "path";

// 設定
const CONFIG = {
  extensions: [".ts", ".tsx", ".js", ".jsx"],
  ignoreDirs: ["node_modules", "__tests__", ".git", "dist", "build"],
  layers: ["shared/core", "shared/infrastructure", "features", "app"],
};

class DependencyAnalyzer {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.files = new Map();
    this.graph = new Map();
    this.reverseGraph = new Map();
  }

  async analyze() {
    // 1. ファイル収集
    await this.collectFiles(this.baseDir);

    // 2. 依存関係解析
    for (const [filePath, _] of this.files) {
      await this.analyzeFile(filePath);
    }

    // 3. メトリクス計算
    return this.calculateMetrics();
  }

  async collectFiles(dir) {
    try {
      const entries = await readdir(dir);

      for (const entry of entries) {
        if (CONFIG.ignoreDirs.includes(entry) || entry.startsWith(".")) {
          continue;
        }

        const fullPath = join(dir, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          await this.collectFiles(fullPath);
        } else if (CONFIG.extensions.some((ext) => entry.endsWith(ext))) {
          this.files.set(fullPath, null);
          this.graph.set(fullPath, new Set());
          this.reverseGraph.set(fullPath, new Set());
        }
      }
    } catch (e) {
      // ディレクトリが存在しない場合はスキップ
    }
  }

  async analyzeFile(filePath) {
    const content = await readFile(filePath, "utf-8");
    const dir = dirname(filePath);

    // import文を抽出
    const importRegex =
      /import\s+(?:(?:\{[^}]*\}|[\w\s,*]+)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];

      // 相対パスの解決
      if (importPath.startsWith(".")) {
        let resolvedPath = resolve(dir, importPath);

        // 拡張子の補完
        for (const ext of CONFIG.extensions) {
          if (this.files.has(resolvedPath + ext)) {
            resolvedPath = resolvedPath + ext;
            break;
          }
          // index ファイルのチェック
          const indexPath = join(resolvedPath, "index" + ext);
          if (this.files.has(indexPath)) {
            resolvedPath = indexPath;
            break;
          }
        }

        if (this.files.has(resolvedPath)) {
          this.graph.get(filePath).add(resolvedPath);
          this.reverseGraph.get(resolvedPath).add(filePath);
        }
      }
    }
  }

  calculateMetrics() {
    const metrics = [];

    // モジュール（ディレクトリ）単位で集計
    const modules = new Map();

    for (const [filePath, _] of this.files) {
      const relativePath = relative(this.baseDir, filePath);
      const parts = relativePath.split("/");

      // レイヤーを特定
      let moduleName = parts[0];
      if (parts[0] === "shared" && parts.length > 1) {
        moduleName = `shared/${parts[1]}`;
      } else if (parts[0] === "features" && parts.length > 1) {
        moduleName = `features/${parts[1]}`;
      }

      if (!modules.has(moduleName)) {
        modules.set(moduleName, {
          files: [],
          dependencies: new Set(),
          dependents: new Set(),
        });
      }

      modules.get(moduleName).files.push(filePath);
    }

    // モジュール間の依存関係を集計
    for (const [moduleName, moduleData] of modules) {
      for (const filePath of moduleData.files) {
        const deps = this.graph.get(filePath) || new Set();
        const revDeps = this.reverseGraph.get(filePath) || new Set();

        for (const dep of deps) {
          const depRelative = relative(this.baseDir, dep);
          const depParts = depRelative.split("/");
          let depModule = depParts[0];
          if (depParts[0] === "shared" && depParts.length > 1) {
            depModule = `shared/${depParts[1]}`;
          } else if (depParts[0] === "features" && depParts.length > 1) {
            depModule = `features/${depParts[1]}`;
          }

          if (depModule !== moduleName) {
            moduleData.dependencies.add(depModule);
          }
        }

        for (const rev of revDeps) {
          const revRelative = relative(this.baseDir, rev);
          const revParts = revRelative.split("/");
          let revModule = revParts[0];
          if (revParts[0] === "shared" && revParts.length > 1) {
            revModule = `shared/${revParts[1]}`;
          } else if (revParts[0] === "features" && revParts.length > 1) {
            revModule = `features/${revParts[1]}`;
          }

          if (revModule !== moduleName) {
            moduleData.dependents.add(revModule);
          }
        }
      }
    }

    // メトリクス計算
    for (const [moduleName, moduleData] of modules) {
      const Ca = moduleData.dependents.size;
      const Ce = moduleData.dependencies.size;
      const I = Ca + Ce === 0 ? 0 : Ce / (Ca + Ce);

      metrics.push({
        module: moduleName,
        files: moduleData.files.length,
        Ca,
        Ce,
        I: I.toFixed(2),
        stability: I < 0.5 ? "安定" : "不安定",
        dependencies: Array.from(moduleData.dependencies),
        dependents: Array.from(moduleData.dependents),
      });
    }

    return metrics;
  }

  // 循環依存検出
  detectCycles() {
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    const path = [];

    const dfs = (node) => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const deps = this.graph.get(node) || new Set();
      for (const dep of deps) {
        if (!visited.has(dep)) {
          dfs(dep);
        } else if (recursionStack.has(dep)) {
          const cycleStart = path.indexOf(dep);
          const cycle = path
            .slice(cycleStart)
            .map((p) => relative(this.baseDir, p));
          cycles.push(cycle);
        }
      }

      path.pop();
      recursionStack.delete(node);
    };

    for (const [node, _] of this.graph) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }
}

async function main() {
  const targetDir = process.argv[2] || "src";

  console.log("\n📊 依存関係分析");
  console.log(`📁 対象ディレクトリ: ${targetDir}\n`);

  const analyzer = new DependencyAnalyzer(targetDir);
  const metrics = await analyzer.analyze();

  // メトリクス表示
  console.log("## モジュール安定度メトリクス\n");
  console.log(
    "| モジュール | ファイル数 | Ca(入力) | Ce(出力) | I(不安定度) | 評価 |",
  );
  console.log(
    "|-----------|-----------|---------|---------|------------|------|",
  );

  for (const m of metrics.sort((a, b) => parseFloat(a.I) - parseFloat(b.I))) {
    console.log(
      `| ${m.module} | ${m.files} | ${m.Ca} | ${m.Ce} | ${m.I} | ${m.stability} |`,
    );
  }

  // 依存関係詳細
  console.log("\n## 依存関係詳細\n");
  for (const m of metrics) {
    if (m.dependencies.length > 0 || m.dependents.length > 0) {
      console.log(`### ${m.module}`);
      if (m.dependencies.length > 0) {
        console.log(`  依存先: ${m.dependencies.join(", ")}`);
      }
      if (m.dependents.length > 0) {
        console.log(`  依存元: ${m.dependents.join(", ")}`);
      }
      console.log("");
    }
  }

  // 循環依存検出
  const cycles = analyzer.detectCycles();
  if (cycles.length > 0) {
    console.log("\n## ⚠️ 循環依存検出\n");
    for (let i = 0; i < cycles.length; i++) {
      console.log(`${i + 1}) ${cycles[i].join(" → ")} → ${cycles[i][0]}`);
    }
  } else {
    console.log("\n✅ 循環依存は検出されませんでした");
  }

  console.log("\n");
}

main().catch(console.error);
