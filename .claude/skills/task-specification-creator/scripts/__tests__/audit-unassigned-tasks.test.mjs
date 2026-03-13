import { spawnSync } from "child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import assert from "node:assert/strict";
import test from "node:test";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const scriptPath = resolve(scriptDir, "..", "audit-unassigned-tasks.js");
const tempDirs = [];

function makeTempDir() {
  const dir = mkdtempSync(join(tmpdir(), "audit-unassigned-scope-"));
  tempDirs.push(dir);
  return dir;
}

function writeFile(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf8");
}

function validTaskMarkdown() {
  return `# Task

## メタ情報
## 1. なぜこのタスクが必要か（Why）
## 2. 何を達成するか（What）
## 3. どのように実行するか（How）
## 4. 実行手順
## 5. 完了条件チェックリスト
## 6. 検証方法
## 7. リスクと対策
## 8. 参照情報
## 9. 備考
`;
}

function invalidTaskMarkdown() {
  return `# invalid`;
}

function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
  });
  return result;
}

function runAudit(args, cwd) {
  const result = runCommand("node", [scriptPath, "--json", ...args], cwd);
  let payload = null;
  try {
    payload = result.stdout ? JSON.parse(result.stdout) : null;
  } catch {
    payload = null;
  }
  return { result, payload };
}

function runGit(cwd, ...args) {
  const result = runCommand("git", args, cwd);
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `git ${args.join(" ")} failed`);
  }
}

test("full mode keeps legacy fail behavior", () => {
  const root = makeTempDir();
  writeFile(join(root, "unassigned/good.md"), validTaskMarkdown());
  writeFile(join(root, "unassigned/bad.md"), invalidTaskMarkdown());
  mkdirSync(join(root, "completed"), { recursive: true });

  const { result, payload } = runAudit(
    [
      "--unassigned-dir",
      "unassigned",
      "--completed-unassigned-dir",
      "completed",
    ],
    root,
  );

  assert.equal(result.status, 1);
  assert.ok(payload);
  assert.equal(payload.scope.mode, "full");
  assert.equal(payload.totals.formatViolations, 1);
  assert.equal(payload.totals.currentViolations, 1);
  assert.equal(payload.totals.baselineViolations, 0);
});

test("target-file mode separates current and baseline violations", () => {
  const root = makeTempDir();
  writeFile(join(root, "unassigned/current-ok.md"), validTaskMarkdown());
  writeFile(join(root, "unassigned/baseline-bad.md"), invalidTaskMarkdown());
  mkdirSync(join(root, "completed"), { recursive: true });

  const { result, payload } = runAudit(
    [
      "--unassigned-dir",
      "unassigned",
      "--completed-unassigned-dir",
      "completed",
      "--target-file",
      "unassigned/current-ok.md",
    ],
    root,
  );

  assert.equal(result.status, 0);
  assert.ok(payload);
  assert.equal(payload.scope.mode, "scoped");
  assert.equal(payload.totals.formatViolations, 1);
  assert.equal(payload.totals.currentViolations, 0);
  assert.equal(payload.totals.baselineViolations, 1);
});

test("target-file mode fails when violation is in current scope", () => {
  const root = makeTempDir();
  writeFile(join(root, "unassigned/current-bad.md"), invalidTaskMarkdown());
  writeFile(join(root, "unassigned/baseline-ok.md"), validTaskMarkdown());
  mkdirSync(join(root, "completed"), { recursive: true });

  const { result, payload } = runAudit(
    [
      "--unassigned-dir",
      "unassigned",
      "--completed-unassigned-dir",
      "completed",
      "--target-file",
      "unassigned/current-bad.md",
    ],
    root,
  );

  assert.equal(result.status, 1);
  assert.ok(payload);
  assert.equal(payload.totals.currentViolations, 1);
  assert.equal(payload.totals.baselineViolations, 0);
});

test("standalone completed task spec can be scoped without overriding completed dir", () => {
  const root = makeTempDir();
  writeFile(join(root, "unassigned/baseline-ok.md"), validTaskMarkdown());
  writeFile(
    join(root, "completed/task-direct.md"),
    `| 項目 | 値 |\n| --- | --- |\n| ステータス | 未実施 |\n`,
  );
  mkdirSync(join(root, "completed/unassigned-task"), { recursive: true });

  const { result, payload } = runAudit(
    [
      "--unassigned-dir",
      "unassigned",
      "--completed-unassigned-dir",
      "completed/unassigned-task",
      "--target-file",
      "completed/task-direct.md",
    ],
    root,
  );

  assert.equal(result.status, 1);
  assert.ok(payload);
  assert.equal(payload.scope.mode, "scoped");
  assert.ok(payload.scope.currentFiles.includes("completed/task-direct.md"));
  assert.ok(payload.scope.completedStandaloneTargets.includes("completed/task-direct.md"));
  assert.equal(payload.totals.currentViolations, 1);
});

test("diff-from mode builds current scope from git diff", () => {
  const root = makeTempDir();
  writeFile(join(root, "unassigned/unchanged-baseline-bad.md"), invalidTaskMarkdown());
  writeFile(join(root, "unassigned/changed-current.md"), validTaskMarkdown());
  mkdirSync(join(root, "completed"), { recursive: true });

  runGit(root, "init");
  runGit(root, "config", "user.email", "test@example.com");
  runGit(root, "config", "user.name", "Test User");
  runGit(root, "add", ".");
  runGit(root, "commit", "-m", "base");

  writeFile(join(root, "unassigned/changed-current.md"), invalidTaskMarkdown());

  const { result, payload } = runAudit(
    [
      "--unassigned-dir",
      "unassigned",
      "--completed-unassigned-dir",
      "completed",
      "--diff-from",
      "HEAD",
    ],
    root,
  );

  assert.equal(result.status, 1);
  assert.ok(payload);
  assert.equal(payload.scope.mode, "scoped");
  assert.equal(payload.totals.formatViolations, 2);
  assert.equal(payload.totals.currentViolations, 1);
  assert.equal(payload.totals.baselineViolations, 1);
  assert.ok(payload.scope.currentFiles.includes("unassigned/changed-current.md"));
});

test("invalid target-file returns exit code 2", () => {
  const root = makeTempDir();
  mkdirSync(join(root, "unassigned"), { recursive: true });
  mkdirSync(join(root, "completed"), { recursive: true });

  const { result } = runAudit(
    [
      "--unassigned-dir",
      "unassigned",
      "--completed-unassigned-dir",
      "completed",
      "--target-file",
      "unassigned/not-found.md",
    ],
    root,
  );

  assert.equal(result.status, 2);
});

test.after(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});
