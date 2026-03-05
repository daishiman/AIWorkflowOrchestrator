#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ALLOWED_JUDGEMENTS = new Set(["反映済み", "要追記", "対象外"]);

function parseArgs(argv) {
  const args = {
    matrix: null,
    findings: null,
    output: null,
    json: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--matrix") {
      args.matrix = argv[i + 1];
      i += 1;
    } else if (arg === "--findings") {
      args.findings = argv[i + 1];
      i += 1;
    } else if (arg === "--output") {
      args.output = argv[i + 1];
      i += 1;
    } else if (arg === "--json") {
      args.json = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!args.matrix || !args.findings) {
    throw new Error("--matrix and --findings are required");
  }

  return args;
}

function parseMarkdownTable(markdown) {
  const lines = markdown.split(/\r?\n/);
  const rows = [];
  let started = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const isTableLine = trimmed.startsWith("|") && trimmed.endsWith("|");

    if (!isTableLine) {
      if (started && rows.length > 0) {
        break;
      }
      continue;
    }
    started = true;

    const cells = trimmed
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());

    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) {
      continue;
    }

    rows.push(cells);
  }

  if (rows.length < 2) {
    return { header: [], data: [] };
  }

  return {
    header: rows[0],
    data: rows.slice(1),
  };
}

function findColumnIndex(header, patterns) {
  return header.findIndex((col) => patterns.some((p) => p.test(col)));
}

function summarizeMatrix(markdown) {
  const table = parseMarkdownTable(markdown);
  const judgementIdx = findColumnIndex(table.header, [/^judgement$/i, /^判定$/]);
  const evidenceIdx = findColumnIndex(table.header, [/target_evidence/i, /^証跡$/]);

  if (judgementIdx < 0) {
    throw new Error("Matrix table does not contain judgement column");
  }

  const summary = {
    total: 0,
    reflected: 0,
    needsFollowup: 0,
    outOfScope: 0,
    invalidJudgement: 0,
    missingEvidence: 0,
  };

  for (const row of table.data) {
    if (row.length === 0) continue;
    const judgement = (row[judgementIdx] || "").trim();
    const evidence = evidenceIdx >= 0 ? (row[evidenceIdx] || "").trim() : "";

    if (!judgement) continue;

    summary.total += 1;

    if (!ALLOWED_JUDGEMENTS.has(judgement)) {
      summary.invalidJudgement += 1;
    } else if (judgement === "反映済み") {
      summary.reflected += 1;
    } else if (judgement === "要追記") {
      summary.needsFollowup += 1;
    } else if (judgement === "対象外") {
      summary.outOfScope += 1;
    }

    if (!evidence || evidence === "-") {
      summary.missingEvidence += 1;
    }
  }

  summary.coverageRate = summary.total === 0 ? 0 : Number(((summary.reflected / summary.total) * 100).toFixed(2));

  return summary;
}

function summarizeFindings(markdown) {
  const table = parseMarkdownTable(markdown);
  const severityIdx = findColumnIndex(table.header, [/severity/i, /^重要度$/]);
  const statusIdx = findColumnIndex(table.header, [/status/i, /^状態$/]);

  const summary = {
    total: 0,
    open: 0,
    bySeverity: {
      high: 0,
      medium: 0,
      low: 0,
      other: 0,
    },
  };

  for (const row of table.data) {
    if (row.length === 0) continue;
    const severity = String(
      severityIdx >= 0 ? (row[severityIdx] ?? "") : "",
    ).toLowerCase();
    const status = String(
      statusIdx >= 0 ? (row[statusIdx] ?? "") : "",
    ).toLowerCase();

    summary.total += 1;

    if (status.includes("open") || status.includes("未") || status.includes("要対応")) {
      summary.open += 1;
    }

    if (severity.includes("high") || severity.includes("高")) {
      summary.bySeverity.high += 1;
    } else if (severity.includes("medium") || severity.includes("中")) {
      summary.bySeverity.medium += 1;
    } else if (severity.includes("low") || severity.includes("低")) {
      summary.bySeverity.low += 1;
    } else {
      summary.bySeverity.other += 1;
    }
  }

  return summary;
}

function runAudit({ matrix, findings }) {
  const matrixContent = fs.readFileSync(matrix, "utf8");
  const findingsContent = fs.readFileSync(findings, "utf8");

  const matrixSummary = summarizeMatrix(matrixContent);
  const findingsSummary = summarizeFindings(findingsContent);

  return {
    generatedAt: new Date().toISOString(),
    matrixPath: matrix,
    findingsPath: findings,
    matrixSummary,
    findingsSummary,
    pass:
      matrixSummary.invalidJudgement === 0 &&
      matrixSummary.missingEvidence === 0,
  };
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv);
  } catch (error) {
    console.error(`[traceability-audit] ${error.message}`);
    process.exit(2);
  }

  const matrixPath = path.resolve(args.matrix);
  const findingsPath = path.resolve(args.findings);

  if (!fs.existsSync(matrixPath)) {
    console.error(`[traceability-audit] Matrix file not found: ${matrixPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(findingsPath)) {
    console.error(`[traceability-audit] Findings file not found: ${findingsPath}`);
    process.exit(1);
  }

  const report = runAudit({ matrix: matrixPath, findings: findingsPath });

  if (args.output) {
    const outputPath = path.resolve(args.output);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  if (args.json || !args.output) {
    console.log(JSON.stringify(report, null, 2));
  }

  process.exit(report.pass ? 0 : 1);
}

const isEntryPoint =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isEntryPoint) {
  main();
}

export {
  parseMarkdownTable,
  summarizeMatrix,
  summarizeFindings,
  runAudit,
};
