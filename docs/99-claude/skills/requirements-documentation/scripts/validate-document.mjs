#!/usr/bin/env node

/**
 * 要件ドキュメント検証スクリプト
 *
 * 要件定義書の構造、品質メトリクスを検証します。
 *
 * 検証項目:
 * - 必須セクションの存在
 * - 要件ID体系の整合性
 * - 受入基準の形式
 * - 禁止表現のチェック
 */

import { readFileSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_VALIDATION_ERROR = 3;

// 禁止表現リスト
const FORBIDDEN_TERMS = [
  "適切に",
  "速く",
  "使いやすい",
  "十分な",
  "必要に応じて",
  "など",
  "適宜",
  "できるだけ",
  "なるべく",
];

// 必須セクション（IEEE 830準拠）
const REQUIRED_SECTIONS = [
  { pattern: /^#+ .*概要|^#+ .*目的|^#+ .*Introduction/im, name: "概要/目的" },
  { pattern: /^#+ .*スコープ|^#+ .*Scope/im, name: "スコープ" },
  { pattern: /^#+ .*機能要件|^#+ .*Functional/im, name: "機能要件" },
  { pattern: /^#+ .*用語|^#+ .*Glossary|^#+ .*定義/im, name: "用語集" },
];

function showHelp() {
  console.log(`
要件ドキュメント検証スクリプト

Usage: node validate-document.mjs [document-path] [options]

Arguments:
  document-path    検証対象のMarkdownファイルパス（必須）

Options:
  --strict         厳格モード（警告もエラーとして扱う）
  --json           JSON形式で出力
  -h, --help       このヘルプを表示

Examples:
  node validate-document.mjs ./docs/requirements.md
  node validate-document.mjs ./docs/requirements.md --strict
  node validate-document.mjs ./docs/requirements.md --json
  `);
}

function validateDocument(content, filePath) {
  const results = {
    file: filePath,
    valid: true,
    errors: [],
    warnings: [],
    metrics: {
      completeness: 0,
      consistency: 0,
      verifiability: 0,
      totalScore: 0,
    },
  };

  // 1. 必須セクションチェック
  let sectionCount = 0;
  for (const section of REQUIRED_SECTIONS) {
    if (section.pattern.test(content)) {
      sectionCount++;
    } else {
      results.warnings.push(
        `必須セクション「${section.name}」が見つかりません`,
      );
    }
  }
  results.metrics.completeness = Math.round(
    (sectionCount / REQUIRED_SECTIONS.length) * 100,
  );

  // 2. 要件IDチェック
  const frPattern = /FR-\d{3}/g;
  const nfrPattern = /NFR-\d{3}/g;
  const frMatches = content.match(frPattern) || [];
  const nfrMatches = content.match(nfrPattern) || [];

  if (frMatches.length === 0 && nfrMatches.length === 0) {
    results.warnings.push("要件ID（FR-XXX, NFR-XXX）が見つかりません");
  }

  // ID重複チェック
  const allIds = [...frMatches, ...nfrMatches];
  const uniqueIds = [...new Set(allIds)];
  if (allIds.length !== uniqueIds.length) {
    results.errors.push("重複した要件IDが存在します");
  }

  // 3. 受入基準チェック（Given-When-Then形式）
  const gwtPattern =
    /\*\*Given\*\*|\*\*When\*\*|\*\*Then\*\*|Given:|When:|Then:/gi;
  const gwtMatches = content.match(gwtPattern) || [];

  if (frMatches.length > 0 && gwtMatches.length === 0) {
    results.warnings.push(
      "機能要件があるが、Given-When-Then形式の受入基準が見つかりません",
    );
  }

  // 4. 禁止表現チェック
  const foundForbidden = [];
  for (const term of FORBIDDEN_TERMS) {
    if (content.includes(term)) {
      foundForbidden.push(term);
    }
  }
  if (foundForbidden.length > 0) {
    results.warnings.push(
      `曖昧な表現が見つかりました: ${foundForbidden.join(", ")}`,
    );
  }
  results.metrics.verifiability = Math.round(
    ((FORBIDDEN_TERMS.length - foundForbidden.length) /
      FORBIDDEN_TERMS.length) *
      100,
  );

  // 5. 一貫性チェック（用語の統一など）
  // 簡易チェック: 見出しのフォーマット統一
  const headings = content.match(/^#+\s+.+$/gm) || [];
  const hasNumberedHeadings = headings.some((h) => /^#+\s+\d+\./.test(h));
  const hasUnnumberedHeadings = headings.some((h) => /^#+\s+[^\d]/.test(h));

  if (hasNumberedHeadings && hasUnnumberedHeadings) {
    results.warnings.push("見出しのナンバリング形式が統一されていません");
  }
  results.metrics.consistency =
    hasNumberedHeadings !== hasUnnumberedHeadings ? 100 : 70;

  // 総合スコア計算
  results.metrics.totalScore = Math.round(
    results.metrics.completeness * 0.3 +
      results.metrics.consistency * 0.25 +
      results.metrics.verifiability * 0.25 +
      20, // 追跡可能性の基礎点（IDが存在すれば加点済み）
  );

  // エラーがあれば無効
  if (results.errors.length > 0) {
    results.valid = false;
  }

  return results;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const strictMode = args.includes("--strict");
  const jsonOutput = args.includes("--json");
  const filePath = args.find((arg) => !arg.startsWith("-"));

  if (!filePath) {
    console.error("Error: ドキュメントパスを指定してください");
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  const resolvedPath = resolve(filePath);

  if (!existsSync(resolvedPath)) {
    console.error(`Error: ファイルが見つかりません: ${resolvedPath}`);
    process.exit(EXIT_ARGS_ERROR);
  }

  try {
    const content = readFileSync(resolvedPath, "utf-8");
    const results = validateDocument(content, resolvedPath);

    // 厳格モードでは警告もエラー扱い
    if (strictMode && results.warnings.length > 0) {
      results.valid = false;
      results.errors.push(...results.warnings);
      results.warnings = [];
    }

    if (jsonOutput) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log("\n=== 要件ドキュメント検証結果 ===\n");
      console.log(`ファイル: ${results.file}`);
      console.log(`ステータス: ${results.valid ? "✅ 合格" : "❌ 不合格"}`);
      console.log(`\n--- 品質メトリクス ---`);
      console.log(`完全性:     ${results.metrics.completeness}/100`);
      console.log(`一貫性:     ${results.metrics.consistency}/100`);
      console.log(`検証可能性: ${results.metrics.verifiability}/100`);
      console.log(`総合スコア: ${results.metrics.totalScore}/100`);

      if (results.errors.length > 0) {
        console.log(`\n--- エラー (${results.errors.length}件) ---`);
        results.errors.forEach((e) => console.log(`  ❌ ${e}`));
      }

      if (results.warnings.length > 0) {
        console.log(`\n--- 警告 (${results.warnings.length}件) ---`);
        results.warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
      }

      console.log("");
    }

    process.exit(results.valid ? EXIT_SUCCESS : EXIT_VALIDATION_ERROR);
  } catch (err) {
    console.error(`Error: ファイルの読み込みに失敗しました: ${err.message}`);
    process.exit(EXIT_ERROR);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
