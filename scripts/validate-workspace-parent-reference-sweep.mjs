#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const FILE_CHECKS = [
  {
    file: "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md",
    type: "path-drift",
    requiredStrings: [
      "../../../completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/index.md",
      "../../../completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md",
      "../../../completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/index.md",
    ],
    forbiddenStrings: [
      "./task-058b-ui-04a-workspace-layout-filebrowser.md",
      "./task-059a-ui-04b-workspace-chat-panel.md",
      "./task-059b-ui-04c-workspace-preview-quicksearch.md",
    ],
  },
  {
    file: "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-000-master-index.md",
    type: "path-drift",
    requiredStrings: [
      "../completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md",
      "../completed-task/task-059a-ui-04b-workspace-chat-panel.md",
      "../completed-task/task-059b-ui-04c-workspace-preview-quicksearch.md",
    ],
    forbiddenStrings: [
      "35. `task-058b-ui-04a-workspace-layout-filebrowser.md`",
      "39. `task-059a-ui-04b-workspace-chat-panel.md`",
      "40. `task-059b-ui-04c-workspace-preview-quicksearch.md`",
    ],
  },
  {
    file: "docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md",
    type: "status-drift",
    requiredStrings: [
      "../../../completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/index.md",
    ],
    forbiddenRegexes: [/\|\s*ステータス\s*\|\s*未着手\s*\|/],
  },
  {
    file: "docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-059a-ui-04b-workspace-chat-panel.md",
    type: "status-drift",
    requiredStrings: [
      "../../../completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md",
    ],
    forbiddenRegexes: [/\|\s*ステータス\s*\|\s*未着手\s*\|/],
  },
  {
    file: "docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-059b-ui-04c-workspace-preview-quicksearch.md",
    type: "status-drift",
    requiredStrings: [
      "../../../completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/index.md",
    ],
    forbiddenRegexes: [/\|\s*ステータス\s*\|\s*未着手\s*\|/],
  },
  {
    file: "docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-090-tasks-index-legacy.md",
    type: "status-drift",
    requiredStrings: [
      "| TASK-UI-04A-WORKSPACE-LAYOUT      | [ワークスペースレイアウト・FileBrowser](./task-058b-ui-04a-workspace-layout-filebrowser.md) | UI-00, UI-01, UI-02        | large  | completed  |",
      "| TASK-UI-04B-WORKSPACE-CHAT        | [ワークスペースChatPanel](./task-059a-ui-04b-workspace-chat-panel.md)                       | UI-00, UI-01, UI-04A       | medium | completed  |",
      "| TASK-UI-04C-WORKSPACE-PREVIEW     | [ワークスペースPreview・QuickSearch](./task-059b-ui-04c-workspace-preview-quicksearch.md)   | UI-00, UI-01, UI-04A       | medium | completed  |",
    ],
    forbiddenRegexes: [
      /\|\s*TASK-UI-04A-WORKSPACE-LAYOUT\s*\|.*\|\s*pending\s*\|/,
      /\|\s*TASK-UI-04B-WORKSPACE-CHAT\s*\|.*\|\s*pending\s*\|/,
      /\|\s*TASK-UI-04C-WORKSPACE-PREVIEW\s*\|.*\|\s*pending\s*\|/,
    ],
  },
  {
    file: ".claude/skills/aiworkflow-requirements/references/task-workflow.md",
    type: "path-drift",
    requiredStrings: [
      "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/outputs/",
    ],
    forbiddenStrings: [
      "docs/30-workflows/task-059a-ui-04b-workspace-chat-panel/outputs/",
    ],
  },
  {
    file: ".claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md",
    type: "path-drift",
    requiredStrings: [
      "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/",
    ],
    forbiddenStrings: [
      "docs/30-workflows/task-059a-ui-04b-workspace-chat-panel/",
    ],
  },
  {
    file: ".claude/skills/aiworkflow-requirements/references/interfaces-llm.md",
    type: "path-drift",
    requiredStrings: [
      "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/outputs/phase-11/screenshots/",
    ],
    forbiddenStrings: [
      "docs/30-workflows/task-059a-ui-04b-workspace-chat-panel/outputs/phase-11/screenshots/",
    ],
  },
  {
    file: ".claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md",
    type: "path-drift",
    requiredStrings: [
      "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/outputs/phase-6/integration-test.md",
    ],
    forbiddenStrings: [
      "docs/30-workflows/task-059a-ui-04b-workspace-chat-panel/outputs/phase-6/integration-test.md",
    ],
  },
  {
    file: "apps/desktop/scripts/capture-task-058b-workspace-layout-phase11.mjs",
    type: "path-drift",
    requiredStrings: [
      "docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser",
    ],
    forbiddenStrings: [
      "docs/30-workflows/task-058b-ui-04a-workspace-layout-filebrowser",
    ],
  },
];

const REQUIRED_PATHS = [
  "docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/index.md",
  "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md",
  "docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/index.md",
  "docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md",
  "docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-059a-ui-04b-workspace-chat-panel.md",
  "docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-059b-ui-04c-workspace-preview-quicksearch.md",
];

const MIRROR_PAIRS = [
  {
    canonical: ".claude/skills/aiworkflow-requirements",
    mirror: ".agents/skills/aiworkflow-requirements",
  },
];

function parseArgs(argv) {
  const options = {
    json: false,
    root: process.cwd(),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--json") {
      options.json = true;
    } else if (token === "--root" && argv[i + 1]) {
      options.root = resolve(argv[i + 1]);
      i += 1;
    }
  }

  return options;
}

function readContent(root, relativePath, findings, type) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    findings.push({
      type,
      file: relativePath,
      message: "target file is missing",
      expected: "existing file",
      actual: "missing",
    });
    return null;
  }

  return readFileSync(filePath, "utf8");
}

function ensureRequiredPaths(root, findings) {
  for (const relativePath of REQUIRED_PATHS) {
    if (!existsSync(join(root, relativePath))) {
      findings.push({
        type: "path-drift",
        file: relativePath,
        message: "expected referenced path is missing",
        expected: "existing path",
        actual: "missing",
      });
    }
  }
}

function runFileChecks(root, findings) {
  for (const check of FILE_CHECKS) {
    const content = readContent(root, check.file, findings, check.type);
    if (content === null) {
      continue;
    }

    for (const expected of check.requiredStrings ?? []) {
      if (!content.includes(expected)) {
        findings.push({
          type: check.type,
          file: check.file,
          message: "required reference is missing",
          expected,
          actual: "missing",
        });
      }
    }

    for (const forbidden of check.forbiddenStrings ?? []) {
      if (content.includes(forbidden)) {
        findings.push({
          type: check.type,
          file: check.file,
          message: "forbidden stale reference remains",
          expected: "stale reference removed",
          actual: forbidden,
        });
      }
    }

    for (const regex of check.forbiddenRegexes ?? []) {
      const match = content.match(regex);
      if (match) {
        findings.push({
          type: check.type,
          file: check.file,
          message: "forbidden status or pattern remains",
          expected: "pattern removed",
          actual: match[0],
        });
      }
    }
  }
}

function runMirrorChecks(root, findings) {
  for (const pair of MIRROR_PAIRS) {
    const canonicalPath = join(root, pair.canonical);
    const mirrorPath = join(root, pair.mirror);

    if (!existsSync(canonicalPath) || !existsSync(mirrorPath)) {
      findings.push({
        type: "mirror-drift",
        file: `${pair.canonical} <-> ${pair.mirror}`,
        message: "mirror directories are missing",
        expected: "both directories exist",
        actual: `${existsSync(canonicalPath)} / ${existsSync(mirrorPath)}`,
      });
      continue;
    }

    const result = spawnSync("diff", ["-qr", canonicalPath, mirrorPath], {
      encoding: "utf8",
    });

    if (result.error) {
      findings.push({
        type: "mirror-drift",
        file: `${pair.canonical} <-> ${pair.mirror}`,
        message: "diff command failed",
        expected: "diff -qr exits 0",
        actual: result.error.message,
      });
      continue;
    }

    if (result.status !== 0) {
      const lines = `${result.stdout}\n${result.stderr}`
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      for (const line of lines.length > 0 ? lines : [`diff exited with status ${result.status}`]) {
        findings.push({
          type: "mirror-drift",
          file: `${pair.canonical} <-> ${pair.mirror}`,
          message: "mirror directories differ",
          expected: "no diff",
          actual: line,
        });
      }
    }
  }
}

function summarize(findings) {
  const summary = {
    "path-drift": 0,
    "status-drift": 0,
    "mirror-drift": 0,
  };

  for (const finding of findings) {
    summary[finding.type] += 1;
  }

  return summary;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const findings = [];

  ensureRequiredPaths(options.root, findings);
  runFileChecks(options.root, findings);
  runMirrorChecks(options.root, findings);

  const summary = summarize(findings);
  const payload = {
    ok: findings.length === 0,
    root: options.root,
    summary,
    findings,
  };

  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log("[validate-workspace-parent-reference-sweep]");
    console.log(`path-drift: ${summary["path-drift"]}`);
    console.log(`status-drift: ${summary["status-drift"]}`);
    console.log(`mirror-drift: ${summary["mirror-drift"]}`);
    console.log(payload.ok ? "SWEEP_OK" : "SWEEP_FAIL");
    if (!payload.ok) {
      for (const finding of findings) {
        console.log(
          `- ${finding.type} ${finding.file}: ${finding.message} (expected=${finding.expected}, actual=${finding.actual})`,
        );
      }
    }
  }

  process.exit(payload.ok ? 0 : 1);
}

main();
