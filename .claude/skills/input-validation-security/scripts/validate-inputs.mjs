#!/usr/bin/env node

/**
 * Input Validation Security Scanner
 *
 * 入力検証の脆弱性を自動検出するスキャナー
 *
 * Usage:
 *   node scripts/validate-inputs.mjs --target <file-or-dir> [--output <report.json>]
 *
 * Options:
 *   --target   スキャン対象のファイルまたはディレクトリ（必須）
 *   --output   レポート出力先（デフォルト: stdout）
 *   --format   出力形式: json | sarif | text（デフォルト: text）
 *   --help     ヘルプを表示
 *
 * Exit codes:
 *   0 - 脆弱性なし
 *   1 - 脆弱性検出
 *   2 - 実行エラー
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname, relative } from "path";

// 脆弱性パターン定義
const VULNERABILITY_PATTERNS = [
  // SQL Injection
  {
    id: "SQLI-001",
    name: "SQL Injection (String Concatenation)",
    severity: "CRITICAL",
    pattern: /(?:query|execute|exec)\s*\(\s*[`'"].*\$\{.*\}.*[`'"]/gi,
    description:
      "SQL query built with string interpolation. Use parameterized queries.",
    cwe: "CWE-89",
  },
  {
    id: "SQLI-002",
    name: "SQL Injection (String Concatenation with +)",
    severity: "CRITICAL",
    pattern:
      /(?:query|execute|exec)\s*\(\s*['"]SELECT.*['"](?:\s*\+|\s*\.concat)/gi,
    description:
      "SQL query built with string concatenation. Use parameterized queries.",
    cwe: "CWE-89",
  },

  // XSS
  {
    id: "XSS-001",
    name: "XSS (innerHTML)",
    severity: "HIGH",
    pattern: /\.innerHTML\s*=\s*(?!['"`])/gi,
    description:
      "innerHTML assignment with dynamic content. Use textContent or sanitize.",
    cwe: "CWE-79",
  },
  {
    id: "XSS-002",
    name: "XSS (dangerouslySetInnerHTML)",
    severity: "HIGH",
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html/gi,
    description:
      "React dangerouslySetInnerHTML used. Ensure content is sanitized.",
    cwe: "CWE-79",
  },
  {
    id: "XSS-003",
    name: "XSS (document.write)",
    severity: "HIGH",
    pattern: /document\.write\s*\(/gi,
    description: "document.write is dangerous. Use DOM methods instead.",
    cwe: "CWE-79",
  },

  // Command Injection
  {
    id: "CMDI-001",
    name: "Command Injection (exec)",
    severity: "CRITICAL",
    pattern: /(?:exec|execSync)\s*\(\s*[`'"].*\$\{.*\}.*[`'"]/gi,
    description:
      "Shell command with interpolation. Use execFile with argument array.",
    cwe: "CWE-78",
  },
  {
    id: "CMDI-002",
    name: "Command Injection (spawn shell)",
    severity: "HIGH",
    pattern: /spawn\s*\([^,]+,\s*\[[^\]]*\],\s*\{[^}]*shell\s*:\s*true/gi,
    description:
      "spawn with shell:true is dangerous. Remove shell option if possible.",
    cwe: "CWE-78",
  },

  // Path Traversal
  {
    id: "PATH-001",
    name: "Path Traversal (Direct Concatenation)",
    severity: "HIGH",
    pattern:
      /(?:readFile|writeFile|readdir)\s*\(\s*(?:path\.join\s*\()?\s*[^,]+\s*\+\s*(?:req\.|params\.|query\.)/gi,
    description:
      "File path built from user input. Validate and sanitize path components.",
    cwe: "CWE-22",
  },

  // Missing Validation
  {
    id: "VAL-001",
    name: "Missing Input Validation (req.body)",
    severity: "MEDIUM",
    pattern:
      /const\s*\{[^}]+\}\s*=\s*req\.body(?!.*(?:parse|validate|safeParse))/gi,
    description:
      "Destructuring req.body without validation. Use schema validation.",
    cwe: "CWE-20",
  },
  {
    id: "VAL-002",
    name: "Missing Input Validation (req.query)",
    severity: "MEDIUM",
    pattern: /req\.query\.\w+(?!.*(?:parse|validate|Number|parseInt))/gi,
    description:
      "Using req.query without type coercion. Validate and coerce types.",
    cwe: "CWE-20",
  },

  // Eval
  {
    id: "EVAL-001",
    name: "Dangerous eval()",
    severity: "CRITICAL",
    pattern: /\beval\s*\(/gi,
    description: "eval() is dangerous. Use safer alternatives.",
    cwe: "CWE-95",
  },
  {
    id: "EVAL-002",
    name: "Dangerous Function constructor",
    severity: "CRITICAL",
    pattern: /new\s+Function\s*\(/gi,
    description:
      "Function constructor is similar to eval. Avoid dynamic code execution.",
    cwe: "CWE-95",
  },
];

// ファイル拡張子フィルター
const SCANNABLE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

// 引数パーサー
function parseArgs(args) {
  const parsed = {
    target: null,
    output: null,
    format: "text",
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--target":
        parsed.target = args[++i];
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

// ファイルをスキャン
function scanFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const findings = [];

  for (const vuln of VULNERABILITY_PATTERNS) {
    let match;
    const regex = new RegExp(vuln.pattern.source, vuln.pattern.flags);

    while ((match = regex.exec(content)) !== null) {
      // 行番号を計算
      const upToMatch = content.substring(0, match.index);
      const lineNumber = upToMatch.split("\n").length;

      findings.push({
        id: vuln.id,
        name: vuln.name,
        severity: vuln.severity,
        file: filePath,
        line: lineNumber,
        column: match.index - upToMatch.lastIndexOf("\n"),
        match: match[0].substring(0, 100),
        description: vuln.description,
        cwe: vuln.cwe,
      });
    }
  }

  return findings;
}

// ディレクトリを再帰的にスキャン
function scanDirectory(dirPath) {
  const findings = [];

  function walk(currentPath) {
    const entries = readdirSync(currentPath);

    for (const entry of entries) {
      // node_modules等をスキップ
      if (["node_modules", ".git", "dist", "build", ".next"].includes(entry)) {
        continue;
      }

      const fullPath = join(currentPath, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (SCANNABLE_EXTENSIONS.includes(extname(entry))) {
        findings.push(...scanFile(fullPath));
      }
    }
  }

  walk(dirPath);
  return findings;
}

// SARIF形式で出力
function toSARIF(findings, basePath) {
  return {
    $schema:
      "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "input-validation-scanner",
            version: "1.0.0",
            rules: VULNERABILITY_PATTERNS.map((v) => ({
              id: v.id,
              name: v.name,
              shortDescription: { text: v.description },
              defaultConfiguration: {
                level:
                  v.severity === "CRITICAL"
                    ? "error"
                    : v.severity === "HIGH"
                      ? "warning"
                      : "note",
              },
              properties: { cwe: v.cwe },
            })),
          },
        },
        results: findings.map((f) => ({
          ruleId: f.id,
          level:
            f.severity === "CRITICAL"
              ? "error"
              : f.severity === "HIGH"
                ? "warning"
                : "note",
          message: { text: f.description },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: relative(basePath, f.file) },
                region: { startLine: f.line, startColumn: f.column },
              },
            },
          ],
        })),
      },
    ],
  };
}

// テキスト形式で出力
function toText(findings) {
  if (findings.length === 0) {
    return "No vulnerabilities found.";
  }

  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  findings.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );

  let output = `Found ${findings.length} potential vulnerabilities:\n\n`;

  for (const f of findings) {
    output += `[${f.severity}] ${f.id}: ${f.name}\n`;
    output += `  File: ${f.file}:${f.line}:${f.column}\n`;
    output += `  Match: ${f.match}\n`;
    output += `  ${f.description}\n`;
    output += `  CWE: ${f.cwe}\n\n`;
  }

  return output;
}

// メイン処理
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.target) {
    console.log(`
Input Validation Security Scanner

Usage:
  node scripts/validate-inputs.mjs --target <file-or-dir> [options]

Options:
  --target   Target file or directory to scan (required)
  --output   Output file path (default: stdout)
  --format   Output format: json | sarif | text (default: text)
  --help     Show this help message

Exit codes:
  0 - No vulnerabilities found
  1 - Vulnerabilities detected
  2 - Execution error
    `);
    process.exit(args.help ? 0 : 2);
  }

  try {
    const stat = statSync(args.target);
    const findings = stat.isDirectory()
      ? scanDirectory(args.target)
      : scanFile(args.target);

    let output;
    switch (args.format) {
      case "json":
        output = JSON.stringify(findings, null, 2);
        break;
      case "sarif":
        output = JSON.stringify(toSARIF(findings, args.target), null, 2);
        break;
      default:
        output = toText(findings);
    }

    if (args.output) {
      writeFileSync(args.output, output);
      console.log(`Report written to ${args.output}`);
    } else {
      console.log(output);
    }

    process.exit(findings.length > 0 ? 1 : 0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(2);
  }
}

main();
