#!/usr/bin/env node

/**
 * コンテキスト境界分析スクリプト
 *
 * コードベースのディレクトリ構造を分析し、
 * 境界付けられたコンテキストの候補を特定します。
 *
 * 使用方法:
 *   node analyze-context-boundaries.mjs <directory>
 *
 * 例:
 *   node analyze-context-boundaries.mjs src/
 */

import { readdir, readFile, stat } from "fs/promises";
import { join, extname, dirname, basename } from "path";

// 分析対象のパターン
const PATTERNS = {
  // コンテキストを示唆するディレクトリ名
  contextIndicators: [
    "domain",
    "context",
    "module",
    "bounded-context",
    "service",
    "application",
  ],

  // ドメイン層のファイルパターン
  domainPatterns: [
    /entity/i,
    /aggregate/i,
    /repository/i,
    /service/i,
    /valueobject/i,
    /event/i,
  ],

  // コンテキスト間の依存を示唆するパターン
  crossContextPatterns: [
    /from\s+['"]\.\.\/\.\.\//, // 親の親への参照
    /from\s+['"]@\w+\//, // スコープパッケージ参照
    /import.*from.*contexts\//i, // contexts からのインポート
  ],

  // 共有カーネルの候補
  sharedKernelPatterns: [/shared/i, /common/i, /kernel/i, /core/i],
};

/**
 * ディレクトリ構造を分析
 */
async function analyzeDirectory(dir, depth = 0, maxDepth = 4) {
  const result = {
    name: basename(dir),
    path: dir,
    isContextCandidate: false,
    hasdomainLayer: false,
    children: [],
    domainFiles: [],
    crossContextImports: [],
  };

  if (depth > maxDepth) {
    return result;
  }

  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // 除外ディレクトリ
      if (entry.name.startsWith(".") || entry.name === "node_modules") {
        continue;
      }

      // コンテキスト候補かチェック
      const isContextCandidate = PATTERNS.contextIndicators.some((indicator) =>
        entry.name.toLowerCase().includes(indicator),
      );

      const childAnalysis = await analyzeDirectory(
        fullPath,
        depth + 1,
        maxDepth,
      );
      childAnalysis.isContextCandidate = isContextCandidate;

      result.children.push(childAnalysis);

      // domainディレクトリの存在をチェック
      if (entry.name.toLowerCase() === "domain") {
        result.hasdomainLayer = true;
      }
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      if ([".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
        // ドメインファイルかチェック
        const isDomainFile = PATTERNS.domainPatterns.some((pattern) =>
          pattern.test(entry.name),
        );

        if (isDomainFile) {
          result.domainFiles.push({
            name: entry.name,
            path: fullPath,
          });
        }

        // コンテキスト間参照をチェック
        try {
          const content = await readFile(fullPath, "utf-8");
          const crossImports = detectCrossContextImports(content, fullPath);
          if (crossImports.length > 0) {
            result.crossContextImports.push({
              file: fullPath,
              imports: crossImports,
            });
          }
        } catch {
          // ファイル読み込みエラーは無視
        }
      }
    }
  }

  return result;
}

/**
 * コンテキスト間のインポートを検出
 */
function detectCrossContextImports(content, filePath) {
  const imports = [];
  const lines = content.split("\n");

  for (const line of lines) {
    // インポート文を検出
    const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];

      // 相対パスで親ディレクトリを超える参照
      if (importPath.startsWith("../..")) {
        imports.push({
          type: "parent_reference",
          path: importPath,
        });
      }

      // 他のコンテキストへの参照
      if (/contexts?\//.test(importPath)) {
        imports.push({
          type: "context_reference",
          path: importPath,
        });
      }
    }
  }

  return imports;
}

/**
 * コンテキスト候補を抽出
 */
function extractContextCandidates(analysis, candidates = []) {
  // ドメイン層を持つディレクトリ
  if (analysis.hasdomainLayer || analysis.domainFiles.length > 0) {
    candidates.push({
      name: analysis.name,
      path: analysis.path,
      reason: analysis.hasdomainLayer
        ? "ドメイン層を持つ"
        : `${analysis.domainFiles.length}個のドメインファイルを含む`,
      domainFiles: analysis.domainFiles,
      crossContextImports: analysis.crossContextImports,
    });
  }

  // コンテキスト候補ディレクトリ
  if (analysis.isContextCandidate && !analysis.hasdomainLayer) {
    candidates.push({
      name: analysis.name,
      path: analysis.path,
      reason: "コンテキストを示唆するディレクトリ名",
      domainFiles: analysis.domainFiles,
      crossContextImports: analysis.crossContextImports,
    });
  }

  // 子ディレクトリを再帰的に処理
  for (const child of analysis.children) {
    extractContextCandidates(child, candidates);
  }

  return candidates;
}

/**
 * 共有カーネル候補を検出
 */
function detectSharedKernelCandidates(analysis, candidates = []) {
  const isSharedCandidate = PATTERNS.sharedKernelPatterns.some((pattern) =>
    pattern.test(analysis.name),
  );

  if (isSharedCandidate && analysis.domainFiles.length > 0) {
    candidates.push({
      name: analysis.name,
      path: analysis.path,
      domainFiles: analysis.domainFiles,
    });
  }

  for (const child of analysis.children) {
    detectSharedKernelCandidates(child, candidates);
  }

  return candidates;
}

/**
 * コンテキスト間の依存関係を分析
 */
function analyzeContextDependencies(candidates) {
  const dependencies = [];

  for (const candidate of candidates) {
    for (const importInfo of candidate.crossContextImports) {
      for (const imp of importInfo.imports) {
        dependencies.push({
          from: candidate.name,
          fromFile: importInfo.file,
          to: imp.path,
          type: imp.type,
        });
      }
    }
  }

  return dependencies;
}

/**
 * レポート生成
 */
function generateReport(candidates, sharedCandidates, dependencies) {
  const report = [];

  report.push("# コンテキスト境界分析レポート\n");
  report.push(`生成日時: ${new Date().toISOString()}\n`);

  // サマリー
  report.push("\n## サマリー\n");
  report.push(`- コンテキスト候補: ${candidates.length}件`);
  report.push(`- 共有カーネル候補: ${sharedCandidates.length}件`);
  report.push(`- コンテキスト間参照: ${dependencies.length}件\n`);

  // コンテキスト候補
  if (candidates.length > 0) {
    report.push("\n## コンテキスト候補\n");
    for (const candidate of candidates) {
      report.push(`### ${candidate.name}`);
      report.push(`- パス: ${candidate.path}`);
      report.push(`- 理由: ${candidate.reason}`);
      if (candidate.domainFiles.length > 0) {
        report.push(`- ドメインファイル:`);
        for (const file of candidate.domainFiles.slice(0, 5)) {
          report.push(`  - ${file.name}`);
        }
        if (candidate.domainFiles.length > 5) {
          report.push(`  - ... 他 ${candidate.domainFiles.length - 5}件`);
        }
      }
      report.push("");
    }
  }

  // 共有カーネル候補
  if (sharedCandidates.length > 0) {
    report.push("\n## 共有カーネル候補\n");
    report.push(
      "これらのディレクトリは複数のコンテキストで共有される可能性があります。\n",
    );
    for (const candidate of sharedCandidates) {
      report.push(`### ${candidate.name}`);
      report.push(`- パス: ${candidate.path}`);
      report.push(`- ドメインファイル数: ${candidate.domainFiles.length}`);
      report.push("");
    }
  }

  // コンテキスト間の依存
  if (dependencies.length > 0) {
    report.push("\n## コンテキスト間の参照\n");
    report.push("以下の参照はコンテキスト境界を越えている可能性があります。\n");
    report.push("腐敗防止層（ACL）の導入を検討してください。\n");

    for (const dep of dependencies) {
      report.push(`- **${dep.from}** → ${dep.to}`);
      report.push(`  - ファイル: ${dep.fromFile}`);
      report.push(`  - 種類: ${dep.type}`);
    }
  }

  // 推奨アクション
  report.push("\n## 推奨アクション\n");
  report.push("1. コンテキスト候補ごとにユビキタス言語を定義");
  report.push("2. コンテキスト間の参照を腐敗防止層で整理");
  report.push("3. 共有カーネルの範囲を最小限に");
  report.push("4. コンテキストマップを作成して可視化");

  return report.join("\n");
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node analyze-context-boundaries.mjs <directory>");
    console.log("");
    console.log("例:");
    console.log("  node analyze-context-boundaries.mjs src/");
    process.exit(1);
  }

  const targetDir = args[0];

  // ディレクトリ存在確認
  try {
    const stats = await stat(targetDir);
    if (!stats.isDirectory()) {
      console.error(`エラー: ${targetDir} はディレクトリではありません`);
      process.exit(1);
    }
  } catch {
    console.error(`エラー: ディレクトリが見つかりません: ${targetDir}`);
    process.exit(1);
  }

  console.log(`分析対象: ${targetDir}`);
  console.log("ディレクトリ構造を分析中...");

  // 分析実行
  const analysis = await analyzeDirectory(targetDir);

  // 候補抽出
  const candidates = extractContextCandidates(analysis);
  const sharedCandidates = detectSharedKernelCandidates(analysis);
  const dependencies = analyzeContextDependencies(candidates);

  // レポート生成
  const report = generateReport(candidates, sharedCandidates, dependencies);
  console.log("\n" + report);
}

main().catch((error) => {
  console.error("エラー:", error.message);
  process.exit(1);
});
