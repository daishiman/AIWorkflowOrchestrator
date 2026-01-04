#!/usr/bin/env node
/**
 * 依存関係検証スクリプト
 *
 * 用途:
 * - モジュール間の循環依存を検出
 * - レイヤー規律の違反を検出
 * - 依存関係グラフを生成
 *
 * 使用例:
 *   node scripts/validate-dependencies.mjs src/
 *   node scripts/validate-dependencies.mjs --layer-check src/
 *   node scripts/validate-dependencies.mjs --help
 *
 * 終了コード:
 *   0 - 検証成功
 *   1 - 一般的エラー
 *   2 - 引数エラー
 *   3 - ファイル不在
 *   4 - 検証失敗（循環依存またはレイヤー違反検出）
 */

import fs from "fs";
import path from "path";

// 設定
const CONFIG = {
  // レイヤー定義（上から下への依存のみ許可）
  layers: ["presentation", "application", "domain", "infrastructure"],
  // 許可される依存（特殊ケース）
  allowedDependencies: [
    { from: "infrastructure", to: "domain" }, // インターフェース実装
  ],
  // ファイル拡張子
  extensions: [".ts", ".tsx", ".js", ".jsx"],
};

// ヘルプ表示
const showHelp = () => {
  console.log(`
依存関係検証スクリプト

使用方法:
  node validate-dependencies.mjs <source-path>
  node validate-dependencies.mjs --layer-check <source-path>
  node validate-dependencies.mjs --help

オプション:
  <source-path>   検証対象のソースディレクトリ
  --layer-check   レイヤー規律の検証を実行
  --graph         依存関係グラフを出力
  --help, -h      このヘルプを表示

検証項目:
  - 循環依存の検出
  - レイヤー規律違反の検出
  - 禁止された依存パターンの検出

終了コード:
  0 - 検証成功（問題なし）
  1 - 一般的エラー
  2 - 引数エラー
  3 - ファイル/ディレクトリ不在
  4 - 検証失敗（問題検出）
`);
};

// ファイルからimport文を抽出
const extractImports = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const imports = [];

    // import文を抽出
    const importRegex = /import\s+(?:[\w{}\s*,]+\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    // require文を抽出
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  } catch (error) {
    console.error(`ファイル読み取りエラー: ${filePath}`);
    return [];
  }
};

// ディレクトリを再帰的に走査
const walkDirectory = (dir, files = []) => {
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      walkDirectory(fullPath, files);
    } else if (
      entry.isFile() &&
      CONFIG.extensions.includes(path.extname(entry.name))
    ) {
      files.push(fullPath);
    }
  }
  return files;
};

// モジュールからレイヤーを判定
const getLayerFromPath = (filePath) => {
  for (const layer of CONFIG.layers) {
    if (filePath.includes(`/${layer}/`) || filePath.includes(`\\${layer}\\`)) {
      return layer;
    }
  }
  return null;
};

// 依存グラフを構築
const buildDependencyGraph = (sourcePath) => {
  const graph = new Map();
  const files = walkDirectory(sourcePath);

  for (const file of files) {
    const imports = extractImports(file);
    const relativePath = path.relative(sourcePath, file);
    graph.set(relativePath, {
      imports: imports,
      layer: getLayerFromPath(file),
    });
  }

  return graph;
};

// 循環依存を検出
const detectCycles = (graph) => {
  const cycles = [];
  const visited = new Set();
  const recursionStack = new Set();
  const path = [];

  const dfs = (node) => {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const deps = graph.get(node)?.imports || [];
    for (const dep of deps) {
      // 相対パスの場合のみチェック
      if (dep.startsWith(".")) {
        const resolvedDep = path.resolve(path.dirname(node), dep);
        if (recursionStack.has(resolvedDep)) {
          cycles.push([...path, resolvedDep]);
        } else if (!visited.has(resolvedDep)) {
          dfs(resolvedDep);
        }
      }
    }

    path.pop();
    recursionStack.delete(node);
  };

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return cycles;
};

// レイヤー規律違反を検出
const detectLayerViolations = (graph) => {
  const violations = [];

  for (const [file, data] of graph.entries()) {
    const fromLayer = data.layer;
    if (!fromLayer) continue;

    const fromIndex = CONFIG.layers.indexOf(fromLayer);

    for (const dep of data.imports) {
      if (!dep.startsWith(".")) continue;

      const toLayer = getLayerFromPath(dep);
      if (!toLayer) continue;

      const toIndex = CONFIG.layers.indexOf(toLayer);

      // 下から上への依存はNG（ただし許可リストは除く）
      if (toIndex < fromIndex) {
        const isAllowed = CONFIG.allowedDependencies.some(
          (rule) => rule.from === fromLayer && rule.to === toLayer,
        );

        if (!isAllowed) {
          violations.push({
            file: file,
            from: fromLayer,
            to: toLayer,
            dependency: dep,
          });
        }
      }
    }
  }

  return violations;
};

// 検証実行
const validate = (sourcePath, options = {}) => {
  console.log(`\n🔍 依存関係検証: ${sourcePath}\n`);
  console.log("=".repeat(50));

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ ディレクトリが見つかりません: ${sourcePath}`);
    process.exit(3);
  }

  const graph = buildDependencyGraph(sourcePath);
  let hasErrors = false;

  // 循環依存チェック
  console.log("\n📦 循環依存チェック...");
  const cycles = detectCycles(graph);
  if (cycles.length > 0) {
    console.log(`\n❌ 循環依存を検出: ${cycles.length}件`);
    cycles.forEach((cycle, i) => {
      console.log(`   ${i + 1}. ${cycle.join(" → ")}`);
    });
    hasErrors = true;
  } else {
    console.log("   ✓ 循環依存なし");
  }

  // レイヤー規律チェック
  if (options.layerCheck) {
    console.log("\n📐 レイヤー規律チェック...");
    const violations = detectLayerViolations(graph);
    if (violations.length > 0) {
      console.log(`\n❌ レイヤー違反を検出: ${violations.length}件`);
      violations.forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.file}: ${v.from} → ${v.to}`);
        console.log(`      依存: ${v.dependency}`);
      });
      hasErrors = true;
    } else {
      console.log("   ✓ レイヤー規律違反なし");
    }
  }

  // グラフ出力
  if (options.graph) {
    console.log("\n📊 依存関係グラフ:");
    for (const [file, data] of graph.entries()) {
      if (data.imports.length > 0) {
        console.log(`   ${file}`);
        data.imports.forEach((imp) => console.log(`      → ${imp}`));
      }
    }
  }

  console.log("\n" + "=".repeat(50));

  if (hasErrors) {
    console.log("\n⚠️  検証失敗: 問題が検出されました");
    process.exit(4);
  } else {
    console.log("\n🎉 検証成功: 問題なし");
    process.exit(0);
  }
};

// メイン処理
const main = () => {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(args.length === 0 ? 2 : 0);
  }

  const options = {
    layerCheck: args.includes("--layer-check"),
    graph: args.includes("--graph"),
  };

  const sourcePath = args.filter((a) => !a.startsWith("--"))[0];

  if (!sourcePath) {
    console.error("エラー: ソースパスを指定してください");
    process.exit(2);
  }

  validate(sourcePath, options);
};

main();
