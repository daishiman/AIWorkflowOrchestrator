#!/usr/bin/env node

/**
 * Instruction Clarity Analyzer
 *
 * 指示文の曖昧性を自動検出し、5C原則での診断を行う
 *
 * Usage:
 *   node scripts/analyze-instruction.mjs --input <file> [--output <report.json>]
 *   node scripts/analyze-instruction.mjs --text "指示文をここに入力"
 *
 * Options:
 *   --input    分析対象のファイルパス
 *   --text     分析対象のテキスト（直接入力）
 *   --output   レポート出力先（デフォルト: stdout）
 *   --format   出力形式: json | text（デフォルト: text）
 *   --help     ヘルプを表示
 *
 * Exit codes:
 *   0 - 分析完了（問題なし or 軽微）
 *   1 - 分析完了（重大な曖昧性あり）
 *   2 - 実行エラー
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// 曖昧表現パターン
const VAGUE_PATTERNS = [
  // 副詞系
  {
    pattern: /適切に/g,
    severity: "HIGH",
    suggestion: "具体的な条件・基準を明記",
  },
  {
    pattern: /よろしく/g,
    severity: "HIGH",
    suggestion: "具体的なアクションを列挙",
  },
  {
    pattern: /なるべく/g,
    severity: "MEDIUM",
    suggestion: "必須/推奨/任意を明確に",
  },
  {
    pattern: /できるだけ/g,
    severity: "MEDIUM",
    suggestion: "具体的な基準を指定",
  },
  {
    pattern: /しっかり/g,
    severity: "MEDIUM",
    suggestion: "具体的な品質基準を示す",
  },
  {
    pattern: /ちゃんと/g,
    severity: "MEDIUM",
    suggestion: "具体的な品質基準を示す",
  },
  {
    pattern: /きちんと/g,
    severity: "MEDIUM",
    suggestion: "具体的な品質基準を示す",
  },

  // 条件系
  {
    pattern: /必要に応じて/g,
    severity: "HIGH",
    suggestion: "条件を明示（if/else）",
  },
  {
    pattern: /場合によっては/g,
    severity: "HIGH",
    suggestion: "具体的な条件を列挙",
  },
  {
    pattern: /状況に応じて/g,
    severity: "HIGH",
    suggestion: "具体的な条件を列挙",
  },
  { pattern: /適宜/g, severity: "HIGH", suggestion: "判断基準を明確化" },

  // 程度系
  { pattern: /大量の/g, severity: "MEDIUM", suggestion: "具体的な数値を示す" },
  { pattern: /多くの/g, severity: "LOW", suggestion: "可能なら数値化" },
  { pattern: /少量の/g, severity: "MEDIUM", suggestion: "具体的な数値を示す" },
  { pattern: /高速に/g, severity: "MEDIUM", suggestion: "具体的な時間を指定" },
  { pattern: /速く/g, severity: "MEDIUM", suggestion: "具体的な時間を指定" },
  { pattern: /遅く/g, severity: "MEDIUM", suggestion: "具体的な時間を指定" },

  // 時間系
  { pattern: /できるだけ早く/g, severity: "HIGH", suggestion: "期限を明記" },
  { pattern: /なるべく早く/g, severity: "HIGH", suggestion: "期限を明記" },
  { pattern: /後で/g, severity: "MEDIUM", suggestion: "具体的な時期を指定" },
  {
    pattern: /そのうち/g,
    severity: "MEDIUM",
    suggestion: "具体的な時期を指定",
  },

  // 範囲系
  { pattern: /など/g, severity: "LOW", suggestion: "完全なリストを検討" },
  { pattern: /等/g, severity: "LOW", suggestion: "完全なリストを検討" },
  { pattern: /その他/g, severity: "MEDIUM", suggestion: "具体的に列挙" },

  // 動詞系
  {
    pattern: /処理する/g,
    severity: "MEDIUM",
    suggestion: "具体的な操作を明記",
  },
  {
    pattern: /対応する/g,
    severity: "MEDIUM",
    suggestion: "具体的なアクションを示す",
  },
  { pattern: /確認する/g, severity: "LOW", suggestion: "確認方法を明記" },
  {
    pattern: /チェックする/g,
    severity: "LOW",
    suggestion: "チェック項目を列挙",
  },

  // 英語系
  {
    pattern: /appropriately/gi,
    severity: "HIGH",
    suggestion: "Specify concrete criteria",
  },
  {
    pattern: /properly/gi,
    severity: "HIGH",
    suggestion: "Define what 'proper' means",
  },
  {
    pattern: /as needed/gi,
    severity: "HIGH",
    suggestion: "Specify conditions",
  },
  {
    pattern: /if necessary/gi,
    severity: "HIGH",
    suggestion: "List specific conditions",
  },
  { pattern: /ASAP/gi, severity: "HIGH", suggestion: "Specify deadline" },
  {
    pattern: /handle/gi,
    severity: "MEDIUM",
    suggestion: "Specify concrete actions",
  },
];

// 5C原則チェック
const FIVE_C_CHECKS = {
  clear: {
    name: "Clear（明瞭）",
    checks: [
      {
        test: (text) => text.split("。").some((s) => s.length > 100),
        issue: "一文が長すぎる（100文字超）",
      },
      {
        test: (text) => /^[^。]+$/.test(text) && text.length > 200,
        issue: "文が区切られていない",
      },
    ],
  },
  concise: {
    name: "Concise（簡潔）",
    checks: [
      {
        test: (text) => /(同じ|同様|同一).{0,10}繰り返し/.test(text),
        issue: "冗長な表現がある",
      },
    ],
  },
  complete: {
    name: "Complete（完全）",
    checks: [
      {
        test: (text) => text.length > 100 && !/前提|条件|要件/.test(text),
        issue: "前提条件の記載がない可能性",
      },
      {
        test: (text) => text.length > 100 && !/成功|完了|基準|検証/.test(text),
        issue: "成功基準の記載がない可能性",
      },
    ],
  },
  concrete: {
    name: "Concrete（具体的）",
    checks: [], // 曖昧表現パターンでカバー
  },
  correct: {
    name: "Correct（正確）",
    checks: [
      {
        test: (text) => /git save/.test(text),
        issue: "'git save' は存在しないコマンド",
      },
    ],
  },
};

// 引数パーサー
function parseArgs(args) {
  const parsed = {
    input: null,
    text: null,
    output: null,
    format: "text",
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--input":
        parsed.input = args[++i];
        break;
      case "--text":
        parsed.text = args[++i];
        break;
      case "--output":
        parsed.output = args[++i];
        break;
      case "--format":
        parsed.format = args[++i];
        break;
      case "--help":
        parsed.help = true;
        break;
    }
  }

  return parsed;
}

// 曖昧表現を分析
function analyzeVagueness(text) {
  const findings = [];

  for (const { pattern, severity, suggestion } of VAGUE_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);

    while ((match = regex.exec(text)) !== null) {
      const lineNumber = text.substring(0, match.index).split("\n").length;
      findings.push({
        type: "vague_expression",
        expression: match[0],
        line: lineNumber,
        position: match.index,
        severity,
        suggestion,
      });
    }
  }

  return findings;
}

// 5C原則で分析
function analyzeFiveC(text) {
  const findings = [];

  for (const [category, { name, checks }] of Object.entries(FIVE_C_CHECKS)) {
    for (const { test, issue } of checks) {
      if (test(text)) {
        findings.push({
          type: "five_c_violation",
          category,
          categoryName: name,
          issue,
          severity: "MEDIUM",
        });
      }
    }
  }

  return findings;
}

// レポート生成（テキスト形式）
function toText(findings, stats) {
  let output = "=== 指示明瞭化分析レポート ===\n\n";

  output += `## 統計\n`;
  output += `- 検出数: ${findings.length}件\n`;
  output += `- HIGH: ${stats.high}件\n`;
  output += `- MEDIUM: ${stats.medium}件\n`;
  output += `- LOW: ${stats.low}件\n\n`;

  if (findings.length === 0) {
    output += "曖昧な表現は検出されませんでした。\n";
    return output;
  }

  output += `## 曖昧表現\n\n`;

  const vague = findings.filter((f) => f.type === "vague_expression");
  for (const f of vague) {
    output += `[${f.severity}] "${f.expression}" (行${f.line})\n`;
    output += `  → ${f.suggestion}\n\n`;
  }

  const fiveC = findings.filter((f) => f.type === "five_c_violation");
  if (fiveC.length > 0) {
    output += `## 5C原則違反\n\n`;
    for (const f of fiveC) {
      output += `[${f.severity}] ${f.categoryName}: ${f.issue}\n\n`;
    }
  }

  return output;
}

// メイン処理
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(`
Instruction Clarity Analyzer

Usage:
  node scripts/analyze-instruction.mjs --input <file> [options]
  node scripts/analyze-instruction.mjs --text "instruction text" [options]

Options:
  --input    File path to analyze
  --text     Text to analyze (direct input)
  --output   Output file path (default: stdout)
  --format   Output format: json | text (default: text)
  --help     Show this help message

Exit codes:
  0 - No critical issues found
  1 - Critical vagueness detected
  2 - Execution error
    `);
    process.exit(0);
  }

  let text;
  try {
    if (args.input) {
      text = readFileSync(args.input, "utf-8");
    } else if (args.text) {
      text = args.text;
    } else {
      console.error("Error: --input or --text is required");
      process.exit(2);
    }
  } catch (error) {
    console.error(`Error reading input: ${error.message}`);
    process.exit(2);
  }

  const vagueFindings = analyzeVagueness(text);
  const fiveCFindings = analyzeFiveC(text);
  const allFindings = [...vagueFindings, ...fiveCFindings];

  const stats = {
    high: allFindings.filter((f) => f.severity === "HIGH").length,
    medium: allFindings.filter((f) => f.severity === "MEDIUM").length,
    low: allFindings.filter((f) => f.severity === "LOW").length,
  };

  let output;
  if (args.format === "json") {
    output = JSON.stringify({ findings: allFindings, stats }, null, 2);
  } else {
    output = toText(allFindings, stats);
  }

  if (args.output) {
    writeFileSync(args.output, output);
    console.log(`Report written to ${args.output}`);
  } else {
    console.log(output);
  }

  process.exit(stats.high > 0 ? 1 : 0);
}

main();
