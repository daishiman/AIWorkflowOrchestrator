import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const scriptPath = resolve(
  scriptDir,
  "..",
  "validate-phase12-implementation-guide.js",
);
const tempDirs = [];

function makeTempDir() {
  const dir = mkdtempSync(join(tmpdir(), "phase12-guide-"));
  tempDirs.push(dir);
  return dir;
}

function writeFile(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf8");
}

function writeGuide(root, content) {
  writeFile(
    join(root, "outputs", "phase-12", "implementation-guide.md"),
    content,
  );
}

function runValidator(root) {
  return spawnSync(
    "node",
    [scriptPath, "--workflow", root, "--json"],
    { encoding: "utf8" },
  );
}

test("必須要件を満たすガイドは PASS", () => {
  const root = makeTempDir();
  writeGuide(
    root,
    `# guide

## Part 1: 中学生向け説明

### なぜ必要か

教室の名簿で今いる人と卒業した人を同じ列で数えるとずれるので必要です。

### 日常生活での例え

たとえば本棚の貸出表を毎日そろえるイメージです。

### 何をしたか

active と completed を分けて同期します。

## Part 2: 開発者向け詳細

### 型定義

\`\`\`ts
type LedgerSyncReport = {
  ok: boolean;
  activeIds: string[];
};

interface UseSkillAnalysisReturn {
  isAnalyzing: boolean;
}
\`\`\`

### APIシグネチャ

\`\`\`ts
const useSkillAnalysis = (skillName: string): UseSkillAnalysisReturn => {
  return { isAnalyzing: false };
};
\`\`\`

### 使用例

\`\`\`bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/sample --json
\`\`\`

### エラーハンドリング

guide ファイル欠落時は error を返します。

### エッジケース

completed 集合だけが更新された場合も再計算します。

### 設定と定数

| 項目 | 値 |
| --- | --- |
| --workflow | 対象workflow |
| GUIDE_TIMEOUT_MS | 250 |
`,
  );

  const result = runValidator(root);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 0);
  assert.equal(payload.ok, true);
  assert.equal(payload.errors.length, 0);
});

test("Part 2 の型定義が無ければ FAIL", () => {
  const root = makeTempDir();
  writeGuide(
    root,
    `## Part 1: 中学生向け説明

### なぜ必要か

名簿の数合わせが必要です。

### 日常生活での例え

たとえば本棚のイメージです。

### 何をしたか

集計方法を直しました。

## Part 2: 開発者向け詳細

### APIシグネチャ

\`\`\`ts
const validateLedger = (): boolean => true;
\`\`\`

### 使用例

\`\`\`bash
node validate.js --workflow docs/30-workflows/sample
\`\`\`

### エラーハンドリング

説明あり。

### エッジケース

説明あり。

### 設定と定数

説明あり。
`,
  );

  const result = runValidator(root);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 1);
  assert.equal(payload.ok, false);
  assert.match(payload.errors.join("\n"), /TypeScript の型定義/);
});

test("Part 1 が理由先行でなければ FAIL", () => {
  const root = makeTempDir();
  writeGuide(
    root,
    `## Part 1: 中学生向け説明

### 何をしたか

台帳を同期しました。

### 日常生活での例え

たとえば教室の名簿です。

### なぜ必要か

ずれを防ぐためです。

## Part 2: 開発者向け詳細

### 型定義

\`\`\`ts
interface GuideResult {
  ok: boolean;
}
\`\`\`

### APIシグネチャ

\`\`\`ts
const validatePhase12ImplementationGuide = (workflow: string): GuideResult => ({ ok: true });
\`\`\`

### 使用例

\`\`\`bash
node validate.js --workflow docs/30-workflows/sample
\`\`\`

### エラーハンドリング

説明あり。

### エッジケース

説明あり。

### 設定と定数

説明あり。
`,
  );

  const result = runValidator(root);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 1);
  assert.equal(payload.ok, false);
  assert.match(payload.errors.join("\n"), /なぜ必要か/);
});

test.after(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});
