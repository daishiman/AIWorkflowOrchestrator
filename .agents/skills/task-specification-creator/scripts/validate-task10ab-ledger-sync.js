#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";

const DEFAULTS = {
  taskWorkflow:
    ".claude/skills/aiworkflow-requirements/references/task-workflow.md",
  uiSpec:
    ".claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md",
  detection:
    "docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-12/unassigned-task-detection.md",
};

function parseArgs(argv) {
  const args = {
    ...DEFAULTS,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--json") {
      args.json = true;
    } else if (token === "--task-workflow" && argv[i + 1]) {
      args.taskWorkflow = argv[i + 1];
      i += 1;
    } else if (token === "--ui-spec" && argv[i + 1]) {
      args.uiSpec = argv[i + 1];
      i += 1;
    } else if (token === "--detection" && argv[i + 1]) {
      args.detection = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function readContent(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`file not found: ${filePath}`);
  }
  return readFileSync(filePath, "utf8");
}

function extractSection(content, headingRegex) {
  const start = content.search(headingRegex);
  if (start === -1) return null;

  const rest = content.slice(start);
  const nextHeading = rest.slice(1).search(/\n##\s+/);
  if (nextHeading === -1) return rest;
  return rest.slice(0, nextHeading + 1);
}

function extractSubsection(content, headingRegex) {
  const start = content.search(headingRegex);
  if (start === -1) return null;

  const rest = content.slice(start);
  const nextHeading = rest.slice(1).search(/\n###\s+|\n##\s+/);
  if (nextHeading === -1) return rest;
  return rest.slice(0, nextHeading + 1);
}

function extractPathFromLine(line) {
  const codeSpans = [...line.matchAll(/`([^`]+)`/g)].map((match) => match[1]);

  for (let i = codeSpans.length - 1; i >= 0; i -= 1) {
    const candidate = codeSpans[i];
    if (
      candidate.startsWith("docs/") ||
      candidate.startsWith(".claude/") ||
      candidate.includes("/") ||
      candidate.endsWith(".md")
    ) {
      return candidate;
    }
  }

  return null;
}

function parseTableIds(section) {
  const ids = [];
  const paths = [];

  for (const line of section.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    if (line.includes("---")) continue;

    const idMatch = line.match(/UT-TASK-10A-B-\d{3}/);
    if (!idMatch) continue;

    ids.push(idMatch[0]);
    const path = extractPathFromLine(line);
    if (path) paths.push(path);
  }

  return { ids, paths };
}

function parseTaskWorkflow(content) {
  const section = extractSection(content, /^## 残課題（未タスク）/m);
  if (!section) {
    throw new Error("task-workflow の残課題セクションが見つかりません");
  }

  const activeIds = [];
  const completedIds = [];
  const paths = [];

  for (const line of section.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    if (line.includes("---")) continue;

    const idMatch = line.match(/UT-TASK-10A-B-\d{3}/);
    if (!idMatch) continue;

    const id = idMatch[0];
    if (line.includes("~~UT-TASK-10A-B-")) {
      completedIds.push(id);
    } else {
      activeIds.push(id);
    }

    const path = extractPathFromLine(line);
    if (path) paths.push(path);
  }

  return { activeIds, completedIds, paths };
}

function parseUiSpec(content) {
  const section = extractSection(content, /^## SkillAnalysisView UI（TASK-10A-B \/ completed）/m);
  if (!section) {
    throw new Error("ui-ux-feature-components の SkillAnalysisView セクションが見つかりません");
  }

  const activeSection = extractSubsection(section, /^### 関連未タスク（active set）/m);
  const completedSection = extractSubsection(section, /^### 完了済み派生タスク/m);
  if (!activeSection || !completedSection) {
    throw new Error("ui-ux-feature-components の active/completed テーブルが不足しています");
  }

  return {
    active: parseTableIds(activeSection),
    completed: parseTableIds(completedSection),
  };
}

function parseDetection(content) {
  const activeSection = extractSection(content, /^## 現行 active set（/m);
  const completedSection = extractSection(content, /^## 完了済み派生タスク（/m);
  if (!activeSection || !completedSection) {
    throw new Error("unassigned-task-detection の active/completed テーブルが不足しています");
  }

  return {
    active: parseTableIds(activeSection),
    completed: parseTableIds(completedSection),
  };
}

function compareSets(label, left, right, errors) {
  const lhs = [...left].sort().join(",");
  const rhs = [...right].sort().join(",");
  if (lhs !== rhs) {
    errors.push(`${label} mismatch: ${lhs} !== ${rhs}`);
  }
}

function missingPaths(paths) {
  return paths.filter((filePath) => !existsSync(filePath));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const errors = [];

  try {
    const taskWorkflow = parseTaskWorkflow(readContent(args.taskWorkflow));
    const uiSpec = parseUiSpec(readContent(args.uiSpec));
    const detection = parseDetection(readContent(args.detection));

    compareSets(
      "active set (task-workflow vs ui-ux-feature-components)",
      taskWorkflow.activeIds,
      uiSpec.active.ids,
      errors,
    );
    compareSets(
      "active set (task-workflow vs detection)",
      taskWorkflow.activeIds,
      detection.active.ids,
      errors,
    );
    compareSets(
      "completed set (task-workflow vs ui-ux-feature-components)",
      taskWorkflow.completedIds,
      uiSpec.completed.ids,
      errors,
    );
    compareSets(
      "completed set (task-workflow vs detection)",
      taskWorkflow.completedIds,
      detection.completed.ids,
      errors,
    );

    const missing = [
      ...missingPaths(taskWorkflow.paths),
      ...missingPaths(uiSpec.active.paths),
      ...missingPaths(uiSpec.completed.paths),
      ...missingPaths(detection.active.paths),
      ...missingPaths(detection.completed.paths),
    ];

    const payload = {
      ok: errors.length === 0 && missing.length === 0,
      activeIds: [...taskWorkflow.activeIds].sort(),
      completedIds: [...taskWorkflow.completedIds].sort(),
      missingPaths: [...new Set(missing)].sort(),
      errors,
    };

    if (args.json) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.log("[validate-task10ab-ledger-sync]");
      console.log(`activeIds: ${payload.activeIds.join(", ")}`);
      console.log(`completedIds: ${payload.completedIds.join(", ")}`);
      console.log(`missingPaths: ${payload.missingPaths.length}`);
      console.log(`errors: ${payload.errors.length}`);
      if (payload.ok) {
        console.log("LEDGER_SYNC_OK");
      }
    }

    process.exit(payload.ok ? 0 : 1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (args.json) {
      console.log(
        JSON.stringify(
          { ok: false, activeIds: [], completedIds: [], missingPaths: [], errors: [message] },
          null,
          2,
        ),
      );
    } else {
      console.error(`[validate-task10ab-ledger-sync] ${message}`);
    }
    process.exit(1);
  }
}

main();
