import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  summarizeMatrix,
  summarizeFindings,
} from "../traceability-audit.mjs";

const tempDirs = [];

function makeTempDir() {
  const dir = mkdtempSync(join(tmpdir(), "traceability-audit-"));
  tempDirs.push(dir);
  return dir;
}

test("summarizeMatrix: 判定件数とカバレッジ率を計算できる", () => {
  const matrix = `| audit_id | judgement | target_evidence |\n| --- | --- | --- |\n| A-01 | 反映済み | file.md:10 |\n| A-02 | 要追記 | file.md:20 |\n| A-03 | 対象外 | file.md:30 |\n`;

  const result = summarizeMatrix(matrix);
  assert.equal(result.total, 3);
  assert.equal(result.reflected, 1);
  assert.equal(result.needsFollowup, 1);
  assert.equal(result.outOfScope, 1);
  assert.equal(result.invalidJudgement, 0);
  assert.equal(result.missingEvidence, 0);
  assert.equal(result.coverageRate, 33.33);
});

test("summarizeFindings: 重要度とopen件数を計算できる", () => {
  const findings = `| ID | 重要度 | 状態 |\n| --- | --- | --- |\n| F-01 | high | open |\n| F-02 | medium | closed |\n| F-03 | low | 未対応 |\n`;

  const result = summarizeFindings(findings);
  assert.equal(result.total, 3);
  assert.equal(result.open, 2);
  assert.equal(result.bySeverity.high, 1);
  assert.equal(result.bySeverity.medium, 1);
  assert.equal(result.bySeverity.low, 1);
});

test("CLI: レポートファイルを出力し、正常終了する", () => {
  const dir = makeTempDir();
  const matrixPath = join(dir, "reflection-matrix.md");
  const findingsPath = join(dir, "finding-log.md");
  const outputPath = join(dir, "result.json");

  writeFileSync(
    matrixPath,
    `| audit_id | judgement | target_evidence |\n| --- | --- | --- |\n| A-01 | 反映済み | file.md:10 |\n`,
    "utf8",
  );
  writeFileSync(
    findingsPath,
    `| ID | 重要度 | 状態 |\n| --- | --- | --- |\n| F-01 | low | closed |\n`,
    "utf8",
  );

  const scriptPath = resolve(
    "docs/30-workflows/completed-tasks/task-055-ui-00-foundation-reflection-audit/tools/traceability-audit.mjs",
  );

  const result = spawnSync(
    "node",
    [
      scriptPath,
      "--matrix",
      matrixPath,
      "--findings",
      findingsPath,
      "--output",
      outputPath,
    ],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
});

test.after(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});
