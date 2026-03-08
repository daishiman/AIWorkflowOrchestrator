import { spawnSync } from "child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import assert from "node:assert/strict";
import test from "node:test";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const scriptPath = resolve(
  scriptDir,
  "..",
  "validate-phase11-screenshot-coverage.js",
);
const tempDirs = [];

function makeTempDir() {
  const dir = mkdtempSync(join(tmpdir(), "phase11-ss-coverage-"));
  tempDirs.push(dir);
  return dir;
}

function writeFile(filePath, content = "") {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf8");
}

function makeWorkflowSkeleton(rootDir) {
  const workflowDir = join(rootDir, "workflow");
  writeFile(
    join(workflowDir, "phase-11-manual-test.md"),
    `# Phase 11: 手動テスト検証

## テストケース

| テストケース | 名称 | 判定 |
| --- | --- | --- |
| TC-01 | 初期表示 | PASS |
| TC-02 | エラー表示 | PASS |
`,
  );
  writeFile(
    join(workflowDir, "outputs/phase-11/manual-test-result.md"),
    `# 手動テスト結果

## テスト結果サマリー

| テストケース | 名称 | 結果 | 証跡 |
| --- | --- | --- | --- |
| TC-01 | 初期表示 | PASS | \`screenshots/TC-01.png\` |
| TC-02 | エラー表示 | PASS | \`screenshots/TC-02.png\` |
`,
  );
  writeFile(join(workflowDir, "outputs/phase-11/screenshots/TC-01.png"));
  writeFile(join(workflowDir, "outputs/phase-11/screenshots/TC-02.png"));
  return workflowDir;
}

function runValidator(args, cwd) {
  const result = spawnSync("node", [scriptPath, "--json", ...args], {
    cwd,
    encoding: "utf8",
  });

  let payload = null;
  try {
    payload = result.stdout ? JSON.parse(result.stdout) : null;
  } catch {
    payload = null;
  }

  return { result, payload };
}

test("TC-SC-001: 全TCに証跡があり、参照ファイルも実在する場合はPASS", () => {
  const root = makeTempDir();
  const workflow = makeWorkflowSkeleton(root);

  const { result, payload } = runValidator(["--workflow", workflow], root);

  assert.equal(result.status, 0);
  assert.ok(payload);
  assert.equal(payload.errors.length, 0);
  assert.equal(payload.coveredTestCases, 2);
});

test("TC-SC-002: TC行に証跡画像がない場合はFAIL", () => {
  const root = makeTempDir();
  const workflow = makeWorkflowSkeleton(root);

  writeFile(
    join(workflow, "outputs/phase-11/manual-test-result.md"),
    `# 手動テスト結果

## テスト結果サマリー

| テストケース | 名称 | 結果 | 証跡 |
| --- | --- | --- | --- |
| TC-01 | 初期表示 | PASS | \`screenshots/TC-01.png\` |
| TC-02 | エラー表示 | PASS | N/A |
`,
  );

  const { result, payload } = runValidator(["--workflow", workflow], root);

  assert.equal(result.status, 1);
  assert.ok(payload);
  assert.ok(
    payload.errors.some((message) =>
      message.includes("TC-02: 証跡列にスクリーンショット（.png）参照がありません"),
    ),
  );
});

test("TC-SC-003: 参照されたスクリーンショットが存在しない場合はFAIL", () => {
  const root = makeTempDir();
  const workflow = makeWorkflowSkeleton(root);

  writeFile(
    join(workflow, "outputs/phase-11/manual-test-result.md"),
    `# 手動テスト結果

## テスト結果サマリー

| テストケース | 名称 | 結果 | 証跡 |
| --- | --- | --- | --- |
| TC-01 | 初期表示 | PASS | \`screenshots/TC-01.png\` |
| TC-02 | エラー表示 | PASS | \`screenshots/TC-99.png\` |
`,
  );

  const { result, payload } = runValidator(["--workflow", workflow], root);

  assert.equal(result.status, 1);
  assert.ok(payload);
  assert.ok(
    payload.errors.some((message) =>
      message.includes("TC-02: 参照ファイルが存在しません (TC-99.png)"),
    ),
  );
});

test("TC-SC-004: 非視覚TCを明示許可した場合はPASS", () => {
  const root = makeTempDir();
  const workflow = makeWorkflowSkeleton(root);

  writeFile(
    join(workflow, "outputs/phase-11/manual-test-result.md"),
    `# 手動テスト結果

## テスト結果サマリー

| テストケース | 名称 | 結果 | 証跡 |
| --- | --- | --- | --- |
| TC-01 | 初期表示 | PASS | \`screenshots/TC-01.png\` |
| TC-02 | エラー表示 | PASS | N/A |
`,
  );

  const { result, payload } = runValidator(
    ["--workflow", workflow, "--allow-non-visual-tc", "TC-02"],
    root,
  );

  assert.equal(result.status, 0);
  assert.ok(payload);
  assert.equal(payload.errors.length, 0);
  assert.ok(
    payload.warnings.some((message) =>
      message.includes("TC-02: 非視覚TCとして証跡画像なしを許容しました"),
    ),
  );
});

test.after(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});
