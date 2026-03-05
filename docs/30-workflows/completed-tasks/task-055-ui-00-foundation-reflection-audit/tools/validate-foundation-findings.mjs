#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");
const REQUIRED_5D_ROWS = 3;

const TARGETS = {
  tokensCompat:
    "docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-1-design-tokens.md",
  workspaceChat:
    "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-059a-ui-04b-workspace-chat-panel.md",
  onboarding:
    "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-061-ui-09-onboarding-wizard.md",
};

function parseArgs(argv) {
  const args = {
    repoRoot: DEFAULT_REPO_ROOT,
    output: null,
    json: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--repo-root") {
      args.repoRoot = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === "--output") {
      args.output = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === "--json") {
      args.json = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return args;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSection(markdown, headingLevel, title) {
  const lines = markdown.split(/\r?\n/);
  const heading = `${"#".repeat(headingLevel)} ${title}`.trim();
  const nextHeadingPrefix = `${"#".repeat(headingLevel)} `;

  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() === heading) {
      start = i;
      break;
    }
  }

  if (start < 0) {
    return "";
  }

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith(nextHeadingPrefix)) {
      end = i;
      break;
    }
  }

  return lines.slice(start, end).join("\n");
}

function parseMarkdownTable(sectionText) {
  const lines = sectionText.split(/\r?\n/);
  const rows = [];
  let started = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const isTableLine = trimmed.startsWith("|") && trimmed.endsWith("|");
    if (!isTableLine) {
      if (started && rows.length > 0) break;
      continue;
    }
    started = true;
    const cells = trimmed
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
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

function extractCanonicalLinks(markdown) {
  const section = extractSection(markdown, 2, "正本");
  if (!section) return [];
  const links = [];
  const regex = /^-\s+`([^`]+)`/gm;
  for (const match of section.matchAll(regex)) {
    links.push(match[1].trim());
  }
  return links;
}

function normalizePath(text) {
  return text.replace(/\\/g, "/");
}

function validateCanonicalLink(filePath, markdown, repoRoot) {
  const links = extractCanonicalLinks(markdown);
  if (links.length === 0) {
    return {
      id: "FND-055-001",
      status: "FAIL",
      detail: "正本セクションのリンクが見つかりません",
      target: normalizePath(path.relative(repoRoot, filePath)),
    };
  }

  const selfPath = normalizePath(path.relative(repoRoot, filePath));
  const firstLink = normalizePath(links[0]);
  const resolved = path.resolve(repoRoot, firstLink);
  const resolvedRel = normalizePath(path.relative(repoRoot, resolved));
  const isSelf = selfPath === resolvedRel;
  const exists = fs.existsSync(resolved);

  if (isSelf) {
    return {
      id: "FND-055-001",
      status: "FAIL",
      detail: `正本リンクが自己参照です: ${firstLink}`,
      target: selfPath,
    };
  }

  if (!exists) {
    return {
      id: "FND-055-001",
      status: "FAIL",
      detail: `正本リンク先が存在しません: ${firstLink}`,
      target: selfPath,
    };
  }

  return {
    id: "FND-055-001",
    status: "PASS",
    detail: `正本リンクは実在パスを参照: ${firstLink}`,
    target: selfPath,
  };
}

function validateUxExamples(filePath, markdown, repoRoot) {
  const section = extractSection(markdown, 3, "11.1 UX言語の具体例（Task 5D）");
  if (!section) {
    return {
      id: "FND-055-002",
      status: "FAIL",
      detail: "Task 5D の具体例セクションが見つかりません",
      target: normalizePath(path.relative(repoRoot, filePath)),
    };
  }

  const table = parseMarkdownTable(section);
  const hasHeader =
    table.header.some((cell) => cell.includes("Before")) &&
    table.header.some((cell) => cell.includes("After"));
  const hasEnoughRows = table.data.length >= REQUIRED_5D_ROWS;

  if (!hasHeader || !hasEnoughRows) {
    return {
      id: "FND-055-002",
      status: "FAIL",
      detail: `具体例テーブル要件不足: header=${hasHeader}, rows=${table.data.length}`,
      target: normalizePath(path.relative(repoRoot, filePath)),
    };
  }

  return {
    id: "FND-055-002",
    status: "PASS",
    detail: `Task 5D 具体例テーブルを確認: rows=${table.data.length}`,
    target: normalizePath(path.relative(repoRoot, filePath)),
  };
}

function validateTask5BScope(filePath, markdown, repoRoot) {
  const section = extractSection(markdown, 3, "Task 5B（error/offline）適用境界");
  if (!section) {
    return {
      id: "FND-055-003",
      status: "FAIL",
      detail: "Task 5B 適用境界セクションが見つかりません",
      target: normalizePath(path.relative(repoRoot, filePath)),
    };
  }

  const hasInScope = section.includes("対象");
  const hasOutScope = section.includes("対象外");

  if (!hasInScope || !hasOutScope) {
    return {
      id: "FND-055-003",
      status: "FAIL",
      detail: "対象/対象外の判定情報が不足しています",
      target: normalizePath(path.relative(repoRoot, filePath)),
    };
  }

  return {
    id: "FND-055-003",
    status: "PASS",
    detail: "Task 5B の適用境界（対象/対象外）を確認",
    target: normalizePath(path.relative(repoRoot, filePath)),
  };
}

function readText(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function runValidation({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const tokensPath = path.resolve(repoRoot, TARGETS.tokensCompat);
  const chatPath = path.resolve(repoRoot, TARGETS.workspaceChat);
  const onboardingPath = path.resolve(repoRoot, TARGETS.onboarding);

  const tokens = readText(tokensPath);
  const chat = readText(chatPath);
  const onboarding = readText(onboardingPath);

  const checks = [
    validateCanonicalLink(tokensPath, tokens, repoRoot),
    validateUxExamples(chatPath, chat, repoRoot),
    validateTask5BScope(onboardingPath, onboarding, repoRoot),
  ];

  const pass = checks.every((check) => check.status === "PASS");

  return {
    generatedAt: new Date().toISOString(),
    repoRoot: normalizePath(repoRoot),
    checks,
    pass,
  };
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv);
  } catch (error) {
    console.error(`[validate-foundation-findings] ${error.message}`);
    process.exit(2);
  }

  let report;
  try {
    report = runValidation({ repoRoot: args.repoRoot });
  } catch (error) {
    console.error(`[validate-foundation-findings] ${error.message}`);
    process.exit(1);
  }

  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true });
    fs.writeFileSync(args.output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
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
  extractCanonicalLinks,
  extractSection,
  parseMarkdownTable,
  parseArgs,
  runValidation,
  validateCanonicalLink,
  validateTask5BScope,
  validateUxExamples,
};
