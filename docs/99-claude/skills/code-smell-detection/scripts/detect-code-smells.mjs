#!/usr/bin/env node
/**
 * コードスメル検出スクリプト
 *
 * 使用方法:
 *   node detect-code-smells.mjs <source-directory>
 *
 * 例:
 *   node detect-code-smells.mjs src/
 */

import { readdir, readFile, stat } from "fs/promises";
import { join, relative } from "path";

// 検出閾値
const THRESHOLDS = {
  longMethod: 20, // 行数
  longClass: 300, // 行数
  manyParameters: 4, // パラメータ数
  deepNesting: 3, // ネスト深さ
  longChain: 3, // メソッドチェーンの長さ
  manyMethods: 15, // クラス内のメソッド数
  manyFields: 10, // クラス内のフィールド数
};

async function findTsFiles(dir) {
  const files = [];

  async function scan(currentDir) {
    try {
      const entries = await readdir(currentDir);

      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          if (
            !entry.startsWith(".") &&
            entry !== "node_modules" &&
            entry !== "__tests__" &&
            entry !== "dist"
          ) {
            await scan(fullPath);
          }
        } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
          files.push(fullPath);
        }
      }
    } catch (e) {
      // ディレクトリが存在しない場合はスキップ
    }
  }

  await scan(dir);
  return files;
}

function detectLongMethods(content, filePath) {
  const smells = [];
  const methodRegex =
    /(?:async\s+)?(?:function\s+(\w+)|(\w+)\s*(?:=|:)\s*(?:async\s*)?\([^)]*\)\s*(?:=>|{))/g;

  let match;
  const lines = content.split("\n");

  while ((match = methodRegex.exec(content)) !== null) {
    const methodName = match[1] || match[2] || "anonymous";
    const startIndex = match.index;
    const startLine = content.substring(0, startIndex).split("\n").length;

    // メソッド本体の行数をカウント（簡易版）
    let braceCount = 0;
    let methodLines = 0;
    let started = false;

    for (let i = startLine - 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("{")) {
        braceCount += (line.match(/{/g) || []).length;
        started = true;
      }
      if (line.includes("}")) {
        braceCount -= (line.match(/}/g) || []).length;
      }
      if (started) {
        methodLines++;
      }
      if (started && braceCount === 0) {
        break;
      }
    }

    if (methodLines > THRESHOLDS.longMethod) {
      smells.push({
        type: "long_method",
        name: methodName,
        line: startLine,
        metric: `${methodLines}行`,
        severity: methodLines > THRESHOLDS.longMethod * 2 ? "high" : "medium",
      });
    }
  }

  return smells;
}

function detectManyParameters(content, filePath) {
  const smells = [];
  const funcRegex = /(?:function\s+(\w+)|(\w+)\s*(?:=|:))\s*\(([^)]*)\)/g;

  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    const funcName = match[1] || match[2] || "anonymous";
    const params = match[3];
    const paramCount = params.split(",").filter((p) => p.trim()).length;

    if (paramCount >= THRESHOLDS.manyParameters) {
      const line = content.substring(0, match.index).split("\n").length;
      smells.push({
        type: "many_parameters",
        name: funcName,
        line,
        metric: `${paramCount}個のパラメータ`,
        severity:
          paramCount > THRESHOLDS.manyParameters * 2 ? "high" : "medium",
      });
    }
  }

  return smells;
}

function detectDeepNesting(content, filePath) {
  const smells = [];
  const lines = content.split("\n");
  let maxNesting = 0;
  let maxNestingLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = line.search(/\S/);
    if (indent === -1) continue;

    // 2スペースまたは1タブを1レベルとカウント
    const nestLevel = Math.floor(indent / 2);

    if (nestLevel > maxNesting) {
      maxNesting = nestLevel;
      maxNestingLine = i + 1;
    }
  }

  if (maxNesting > THRESHOLDS.deepNesting) {
    smells.push({
      type: "deep_nesting",
      name: "file",
      line: maxNestingLine,
      metric: `深さ${maxNesting}`,
      severity: maxNesting > THRESHOLDS.deepNesting * 2 ? "high" : "medium",
    });
  }

  return smells;
}

function detectLongChains(content, filePath) {
  const smells = [];
  const chainRegex = /(\w+(?:\.\w+\([^)]*\)){3,})/g;

  let match;
  while ((match = chainRegex.exec(content)) !== null) {
    const chain = match[1];
    const chainLength = (chain.match(/\./g) || []).length;
    const line = content.substring(0, match.index).split("\n").length;

    smells.push({
      type: "long_chain",
      name: chain.substring(0, 50) + "...",
      line,
      metric: `${chainLength}段のチェーン`,
      severity: chainLength > THRESHOLDS.longChain * 2 ? "high" : "medium",
    });
  }

  return smells;
}

function detectLargeClasses(content, filePath) {
  const smells = [];
  const classRegex = /class\s+(\w+)/g;

  let match;
  const lines = content.split("\n");

  while ((match = classRegex.exec(content)) !== null) {
    const className = match[1];
    const startIndex = match.index;
    const startLine = content.substring(0, startIndex).split("\n").length;

    // クラス本体の行数をカウント
    let braceCount = 0;
    let classLines = 0;
    let started = false;
    let methodCount = 0;
    let fieldCount = 0;

    for (let i = startLine - 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("{")) {
        braceCount += (line.match(/{/g) || []).length;
        started = true;
      }
      if (line.includes("}")) {
        braceCount -= (line.match(/}/g) || []).length;
      }
      if (started) {
        classLines++;

        // メソッドカウント（簡易版）
        if (
          /^\s*(async\s+)?(?:public|private|protected)?\s*\w+\s*\(/.test(line)
        ) {
          methodCount++;
        }
        // フィールドカウント（簡易版）
        if (
          /^\s*(?:public|private|protected|readonly)?\s*\w+\s*[:=]/.test(line)
        ) {
          fieldCount++;
        }
      }
      if (started && braceCount === 0) {
        break;
      }
    }

    if (classLines > THRESHOLDS.longClass) {
      smells.push({
        type: "large_class",
        name: className,
        line: startLine,
        metric: `${classLines}行, ${methodCount}メソッド, ${fieldCount}フィールド`,
        severity: "high",
      });
    } else if (methodCount > THRESHOLDS.manyMethods) {
      smells.push({
        type: "too_many_methods",
        name: className,
        line: startLine,
        metric: `${methodCount}メソッド`,
        severity: "medium",
      });
    }
  }

  return smells;
}

function detectDeadCode(content, filePath) {
  const smells = [];

  // コメントアウトされたコード
  const commentedCode =
    /\/\/\s*(function|class|const|let|var|if|for|while|return)\s+\w+/g;
  let match;

  while ((match = commentedCode.exec(content)) !== null) {
    const line = content.substring(0, match.index).split("\n").length;
    smells.push({
      type: "commented_code",
      name: match[0].substring(0, 30),
      line,
      metric: "コメントアウトされたコード",
      severity: "low",
    });
  }

  // 到達不能コード（returnの後）
  const unreachable = /return\s+[^;]+;\s*\n\s*(?!})\S/g;
  while ((match = unreachable.exec(content)) !== null) {
    const line = content.substring(0, match.index).split("\n").length;
    smells.push({
      type: "unreachable_code",
      name: "return後のコード",
      line,
      metric: "到達不能コード",
      severity: "medium",
    });
  }

  return smells;
}

async function analyzeFile(filePath, baseDir) {
  const content = await readFile(filePath, "utf-8");
  const relativePath = relative(baseDir, filePath);
  const lines = content.split("\n").length;

  const allSmells = [
    ...detectLongMethods(content, relativePath),
    ...detectManyParameters(content, relativePath),
    ...detectDeepNesting(content, relativePath),
    ...detectLongChains(content, relativePath),
    ...detectLargeClasses(content, relativePath),
    ...detectDeadCode(content, relativePath),
  ];

  return {
    file: relativePath,
    lines,
    smells: allSmells,
  };
}

async function main() {
  const targetDir = process.argv[2] || "src";

  console.log("\n🔍 コードスメル検出");
  console.log(`📁 対象ディレクトリ: ${targetDir}\n`);

  const files = await findTsFiles(targetDir);
  console.log(`📄 検出ファイル数: ${files.length}\n`);

  const results = [];
  let totalSmells = 0;

  for (const file of files) {
    const result = await analyzeFile(file, targetDir);
    if (result.smells.length > 0) {
      results.push(result);
      totalSmells += result.smells.length;
    }
  }

  if (totalSmells === 0) {
    console.log("✅ コードスメルは検出されませんでした\n");
    process.exit(0);
  }

  // サマリー
  console.log(`❌ ${totalSmells} 件のコードスメルが検出されました\n`);

  // スメル種類別カウント
  const byType = {};
  for (const result of results) {
    for (const smell of result.smells) {
      if (!byType[smell.type]) byType[smell.type] = 0;
      byType[smell.type]++;
    }
  }

  console.log("## スメル種類別サマリー\n");
  const typeNames = {
    long_method: "長いメソッド",
    many_parameters: "多すぎるパラメータ",
    deep_nesting: "深いネスト",
    long_chain: "長いメソッドチェーン",
    large_class: "大きなクラス",
    too_many_methods: "メソッドが多すぎるクラス",
    commented_code: "コメントアウトされたコード",
    unreachable_code: "到達不能コード",
  };

  for (const [type, count] of Object.entries(byType)) {
    console.log(`- ${typeNames[type] || type}: ${count}件`);
  }

  // 詳細レポート
  console.log("\n## 詳細レポート\n");

  for (const result of results) {
    console.log(`### ${result.file} (${result.lines}行)`);

    // 深刻度でソート
    const sortedSmells = result.smells.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.severity] - order[b.severity];
    });

    for (const smell of sortedSmells) {
      const icon =
        smell.severity === "high"
          ? "🔴"
          : smell.severity === "medium"
            ? "🟡"
            : "🟢";
      console.log(
        `  ${icon} L${smell.line}: ${typeNames[smell.type] || smell.type}`,
      );
      console.log(`     ${smell.name}: ${smell.metric}`);
    }
    console.log("");
  }

  // 高深刻度があれば非ゼロで終了
  const hasHighSeverity = results.some((r) =>
    r.smells.some((s) => s.severity === "high"),
  );
  process.exit(hasHighSeverity ? 1 : 0);
}

main().catch(console.error);
