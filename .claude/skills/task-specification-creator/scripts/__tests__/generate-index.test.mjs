import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const scriptPath = resolve(scriptDir, "..", "generate-index.js");
const tempDirs = [];

function makeTempDir() {
  const dir = mkdtempSync(join(tmpdir(), "generate-index-"));
  tempDirs.push(dir);
  return dir;
}

function writeWorkflowFile(root, relativePath, content) {
  const filePath = join(root, relativePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf8");
}

function createPhaseFiles(root) {
  const phaseFiles = {
    1: "phase-1-requirements.md",
    2: "phase-2-design.md",
    3: "phase-3-design-review.md",
    4: "phase-4-test-creation.md",
    5: "phase-5-implementation.md",
    6: "phase-6-test-expansion.md",
    7: "phase-7-coverage-check.md",
    8: "phase-8-refactoring.md",
    9: "phase-9-quality-assurance.md",
    10: "phase-10-final-review.md",
    11: "phase-11-manual-test.md",
    12: "phase-12-documentation.md",
    13: "phase-13-pr-creation.md",
  };

  for (const [phase, fileName] of Object.entries(phaseFiles)) {
    writeWorkflowFile(root, fileName, `# Phase ${phase}: test\n`);
  }
}

function createArrayPhases() {
  return Array.from({ length: 13 }, (_, index) => {
    const phase = index + 1;
    const status = phase <= 12 ? "completed" : "blocked";
    return {
      phase,
      status,
      artifacts: [`outputs/phase-${phase}/artifact-${phase}.md`],
    };
  });
}

function createObjectPhases() {
  return Object.fromEntries(
    createArrayPhases().map((phase) => [String(phase.phase), phase]),
  );
}

function runGenerateIndex(root) {
  return spawnSync(
    "node",
    [scriptPath, "--workflow", root, "--regenerate"],
    { encoding: "utf8" },
  );
}

test("phases が配列でも Phase 12/13 の status を正しく出力する", () => {
  const root = makeTempDir();
  createPhaseFiles(root);
  writeWorkflowFile(
    root,
    "artifacts.json",
    JSON.stringify(
      {
        taskName: "sample-array-workflow",
        createdAt: "2026-03-26",
        phases: createArrayPhases(),
      },
      null,
      2,
    ),
  );

  const result = runGenerateIndex(root);
  const indexContent = readFileSync(join(root, "index.md"), "utf8");

  assert.equal(result.status, 0, result.stderr);
  assert.match(indexContent, /\| 12 \| ドキュメント更新 \| \[phase-12-documentation\.md\]\(phase-12-documentation\.md\) \| 完了 \|/);
  assert.match(indexContent, /\| 13 \| PR作成 \| \[phase-13-pr-creation\.md\]\(phase-13-pr-creation\.md\) \| blocked \|/);
  assert.match(indexContent, /\| ステータス \| Phase 12 完了（PR未着手） \|/);
});

test("phases がオブジェクトでも従来どおり index を生成できる", () => {
  const root = makeTempDir();
  createPhaseFiles(root);
  writeWorkflowFile(
    root,
    "artifacts.json",
    JSON.stringify(
      {
        taskName: "sample-object-workflow",
        status: "completed",
        createdAt: "2026-03-26",
        phases: createObjectPhases(),
      },
      null,
      2,
    ),
  );

  const result = runGenerateIndex(root);
  const indexContent = readFileSync(join(root, "index.md"), "utf8");

  assert.equal(result.status, 0, result.stderr);
  assert.match(indexContent, /\| ステータス \| 完了 \|/);
  assert.match(indexContent, /\| 1 \| 要件定義 \| \[phase-1-requirements\.md\]\(phase-1-requirements\.md\) \| 完了 \|/);
});

test.after(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});
