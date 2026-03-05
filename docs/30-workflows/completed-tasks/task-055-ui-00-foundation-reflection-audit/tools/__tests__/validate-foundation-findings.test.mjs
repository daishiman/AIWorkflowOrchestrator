import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  runValidation,
  validateCanonicalLink,
  validateTask5BScope,
  validateUxExamples,
} from "../validate-foundation-findings.mjs";

const tempDirs = [];

function makeTempDir() {
  const dir = mkdtempSync(join(tmpdir(), "validate-foundation-findings-"));
  tempDirs.push(dir);
  return dir;
}

function seedFixture(repoRoot) {
  const tokensPath = join(
    repoRoot,
    "docs/30-workflows/skill-import-agent-system/tasks/completed-task",
  );
  const taskSeqPath = join(
    repoRoot,
    "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence",
  );
  const completedTokensPath = join(
    repoRoot,
    "docs/30-workflows/completed-tasks/TASK-UI-00-TOKENS",
  );
  mkdirSync(tokensPath, { recursive: true });
  mkdirSync(taskSeqPath, { recursive: true });
  mkdirSync(completedTokensPath, { recursive: true });

  writeFileSync(
    join(tokensPath, "00-1-design-tokens.md"),
    `# TASK-UI-00-TOKENS（参照互換ファイル）

## 正本

- \`docs/30-workflows/completed-tasks/TASK-UI-00-TOKENS/index.md\`
`,
    "utf8",
  );
  writeFileSync(join(completedTokensPath, "index.md"), "# TOKENS\n", "utf8");

  writeFileSync(
    join(taskSeqPath, "task-059a-ui-04b-workspace-chat-panel.md"),
    `# TASK-059A

### 11.1 UX言語の具体例（Task 5D）

| Before（旧） | After（新） | 適用箇所 |
| --- | --- | --- |
| エージェント | AIアシスタント | header |
| スキル | ツール | label |
| プロンプトを入力 | 何でも聞いてみよう... | placeholder |
`,
    "utf8",
  );

  writeFileSync(
    join(taskSeqPath, "task-061-ui-09-onboarding-wizard.md"),
    `# TASK-061

### Task 5B（error/offline）適用境界

| 観点 | 判定 | 理由 |
| --- | --- | --- |
| onboarding本編の文言/導線 | 対象 | UX言語統一 |
| offlineリカバリ導線 | 対象外 | 別タスク責務 |
`,
    "utf8",
  );
}

test("validateCanonicalLink: 自己参照をFAILで返す", () => {
  const repoRoot = "/tmp/repo";
  const filePath =
    "/tmp/repo/docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-1-design-tokens.md";
  const markdown = `## 正本\n\n- \`docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-1-design-tokens.md\``;
  const result = validateCanonicalLink(filePath, markdown, repoRoot);
  assert.equal(result.status, "FAIL");
});

test("validateUxExamples / validateTask5BScope: 要件を満たせばPASS", () => {
  const ux = `### 11.1 UX言語の具体例（Task 5D）\n\n| Before | After | 適用箇所 |\n| --- | --- | --- |\n| A | B | x |\n| C | D | y |\n| E | F | z |\n`;
  const scope = `### Task 5B（error/offline）適用境界\n\n対象\n対象外`;
  assert.equal(
    validateUxExamples("/tmp/repo/docs/a.md", ux, "/tmp/repo").status,
    "PASS",
  );
  assert.equal(
    validateTask5BScope("/tmp/repo/docs/b.md", scope, "/tmp/repo").status,
    "PASS",
  );
});

test("runValidation: 3チェックをPASSできる", () => {
  const repoRoot = makeTempDir();
  seedFixture(repoRoot);
  const result = runValidation({ repoRoot });
  assert.equal(result.checks.length, 3);
  assert.equal(result.pass, true);
});

test("CLI: --repo-root 指定でレポート出力し正常終了する", () => {
  const repoRoot = makeTempDir();
  seedFixture(repoRoot);
  const outPath = join(repoRoot, "result.json");
  const scriptPath = resolve(
    "docs/30-workflows/completed-tasks/task-055-ui-00-foundation-reflection-audit/tools/validate-foundation-findings.mjs",
  );
  const result = spawnSync(
    "node",
    [scriptPath, "--repo-root", repoRoot, "--output", outPath],
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
