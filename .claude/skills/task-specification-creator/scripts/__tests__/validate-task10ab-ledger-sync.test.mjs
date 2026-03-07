import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const scriptPath = resolve(scriptDir, "..", "validate-task10ab-ledger-sync.js");
const tempDirs = [];

function makeTempDir() {
  const dir = mkdtempSync(join(tmpdir(), "task10ab-ledger-sync-"));
  tempDirs.push(dir);
  return dir;
}

function writeFile(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf8");
}

function createFixture(root) {
  writeFile(
    join(root, "task-workflow.md"),
    `## 残課題（未タスク）

| タスクID | タスク名 | 優先度 | 発見元 | タスク仕様書 |
| --- | --- | --- | --- | --- |
| ~~UT-TASK-10A-B-001~~ | ~~done~~ | ~~中~~ | src | \`completed/001.md\` |
| UT-TASK-10A-B-002 | props \`skill\` vs \`skillName\` | 中 | src | \`active/002.md\` |
| ~~UT-TASK-10A-B-008~~ | ~~done~~ | ~~中~~ | src | \`completed/008.md\` |
| UT-TASK-10A-B-009 | active | 中 | src | \`active/009.md\` |
`,
  );

  writeFile(
    join(root, "ui.md"),
    `## SkillAnalysisView UI（TASK-10A-B / completed）

### 関連未タスク（active set）

| 未タスクID | 概要 | タスク仕様書 |
| --- | --- | --- |
| UT-TASK-10A-B-002 | props \`skill\` vs \`skillName\` | \`active/002.md\` |
| UT-TASK-10A-B-009 | active | \`active/009.md\` |

### 完了済み派生タスク

| タスクID | 状態 | タスク仕様書 |
| --- | --- | --- |
| UT-TASK-10A-B-001 | 完了 | \`completed/001.md\` |
| UT-TASK-10A-B-008 | 完了 | \`completed/008.md\` |
`,
  );

  writeFile(
    join(root, "detection.md"),
    `## 現行 active set（2026-03-06 同期結果）

| 未タスクID | 概要 | 指示書 |
| --- | --- | --- |
| UT-TASK-10A-B-002 | props \`skill\` vs \`skillName\` | \`active/002.md\` |
| UT-TASK-10A-B-009 | active | \`active/009.md\` |

## 完了済み派生タスク（2026-03-06 時点）

| タスクID | 状態 | 指示書 |
| --- | --- | --- |
| UT-TASK-10A-B-001 | 完了 | \`completed/001.md\` |
| UT-TASK-10A-B-008 | 完了 | \`completed/008.md\` |
`,
  );

  writeFile(join(root, "active/002.md"), "# active");
  writeFile(join(root, "active/009.md"), "# active");
  writeFile(join(root, "completed/001.md"), "# completed");
  writeFile(join(root, "completed/008.md"), "# completed");
}

function runValidator(root) {
  return spawnSync(
    "node",
    [
      scriptPath,
      "--json",
      "--task-workflow",
      "task-workflow.md",
      "--ui-spec",
      "ui.md",
      "--detection",
      "detection.md",
    ],
    { cwd: root, encoding: "utf8" },
  );
}

test("一致していれば PASS", () => {
  const root = makeTempDir();
  createFixture(root);

  const result = runValidator(root);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 0);
  assert.equal(payload.ok, true);
  assert.deepEqual(payload.activeIds, ["UT-TASK-10A-B-002", "UT-TASK-10A-B-009"]);
  assert.deepEqual(payload.completedIds, ["UT-TASK-10A-B-001", "UT-TASK-10A-B-008"]);
});

test("active set がずれていれば FAIL", () => {
  const root = makeTempDir();
  createFixture(root);
  writeFile(
    join(root, "ui.md"),
    `## SkillAnalysisView UI（TASK-10A-B / completed）

### 関連未タスク（active set）

| 未タスクID | 概要 | タスク仕様書 |
| --- | --- | --- |
| UT-TASK-10A-B-002 | active | \`active/002.md\` |

### 完了済み派生タスク

| タスクID | 状態 | タスク仕様書 |
| --- | --- | --- |
| UT-TASK-10A-B-001 | 完了 | \`completed/001.md\` |
| UT-TASK-10A-B-008 | 完了 | \`completed/008.md\` |
`,
  );

  const result = runValidator(root);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 1);
  assert.equal(payload.ok, false);
  assert.match(payload.errors[0], /active set/);
});

test("参照先ファイルが無ければ FAIL", () => {
  const root = makeTempDir();
  createFixture(root);
  rmSync(join(root, "completed/008.md"));

  const result = runValidator(root);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 1);
  assert.equal(payload.ok, false);
  assert.deepEqual(payload.missingPaths, ["completed/008.md"]);
});

test.after(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});
