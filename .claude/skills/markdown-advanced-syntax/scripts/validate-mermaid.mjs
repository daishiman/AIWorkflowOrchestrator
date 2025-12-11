#!/usr/bin/env node
/**
 * Mermaid構文検証スクリプト
 *
 * 使用方法:
 *   node validate-mermaid.mjs <file.md>
 *
 * 機能:
 *   - Markdownファイル内のMermaidブロックを抽出
 *   - 基本的な構文エラーをチェック
 *   - エラー箇所と修正提案を出力
 */

import { readFileSync } from "fs";
import { basename } from "path";

const MERMAID_BLOCK_REGEX = /```mermaid\n([\s\S]*?)```/g;

const DIAGRAM_TYPES = [
  "flowchart",
  "sequenceDiagram",
  "classDiagram",
  "stateDiagram",
  "stateDiagram-v2",
  "erDiagram",
  "gantt",
  "pie",
  "gitGraph",
];

function extractMermaidBlocks(content) {
  const blocks = [];
  let match;
  let blockIndex = 0;

  while ((match = MERMAID_BLOCK_REGEX.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split("\n").length;
    blocks.push({
      index: blockIndex++,
      content: match[1].trim(),
      lineNumber,
      raw: match[0],
    });
  }

  return blocks;
}

function validateBlock(block) {
  const errors = [];
  const lines = block.content.split("\n");

  // 図タイプのチェック
  const firstLine = lines[0]?.trim() || "";
  const hasDiagramType = DIAGRAM_TYPES.some((type) =>
    firstLine.startsWith(type),
  );

  if (!hasDiagramType) {
    errors.push({
      type: "error",
      message: `図タイプが不明です。最初の行は ${DIAGRAM_TYPES.join(", ")} のいずれかで始める必要があります`,
      line: 1,
    });
  }

  // 基本的な構文チェック
  lines.forEach((line, index) => {
    // 未閉じの括弧チェック
    const openBrackets = (line.match(/\[/g) || []).length;
    const closeBrackets = (line.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push({
        type: "warning",
        message: "角括弧 [] の数が一致しません",
        line: index + 1,
      });
    }

    // 未閉じの中括弧チェック
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push({
        type: "warning",
        message: "中括弧 {} の数が一致しません",
        line: index + 1,
      });
    }
  });

  // ノード数のチェック（推奨）
  const nodeMatches = block.content.match(/\w+\s*[\[\(\{]/g) || [];
  if (nodeMatches.length > 30) {
    errors.push({
      type: "warning",
      message: `ノード数が ${nodeMatches.length} 個です。30個以下を推奨します`,
      line: null,
    });
  }

  return errors;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node validate-mermaid.mjs <file.md>");
    process.exit(1);
  }

  const filePath = args[0];
  let content;

  try {
    content = readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error(`ファイルを読み込めません: ${filePath}`);
    process.exit(1);
  }

  const blocks = extractMermaidBlocks(content);

  console.log(`\n📊 Mermaid検証結果: ${basename(filePath)}`);
  console.log(`${"=".repeat(50)}\n`);
  console.log(`検出されたMermaidブロック: ${blocks.length}個\n`);

  let totalErrors = 0;
  let totalWarnings = 0;

  blocks.forEach((block) => {
    const errors = validateBlock(block);
    const blockErrors = errors.filter((e) => e.type === "error").length;
    const blockWarnings = errors.filter((e) => e.type === "warning").length;

    totalErrors += blockErrors;
    totalWarnings += blockWarnings;

    const status = blockErrors > 0 ? "❌" : blockWarnings > 0 ? "⚠️" : "✅";
    console.log(
      `${status} ブロック ${block.index + 1} (行 ${block.lineNumber})`,
    );

    if (errors.length > 0) {
      errors.forEach((error) => {
        const icon = error.type === "error" ? "  ❌" : "  ⚠️";
        const lineInfo = error.line ? `行${error.line}: ` : "";
        console.log(`${icon} ${lineInfo}${error.message}`);
      });
    }
    console.log("");
  });

  console.log(`${"=".repeat(50)}`);
  console.log(`合計: エラー ${totalErrors}件, 警告 ${totalWarnings}件`);

  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
