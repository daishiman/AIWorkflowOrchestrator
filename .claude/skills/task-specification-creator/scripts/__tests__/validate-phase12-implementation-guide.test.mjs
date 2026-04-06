import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
const changelogTemplatePath = resolve(
  scriptDir,
  "..",
  "..",
  "assets",
  "documentation-changelog-template.md",
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

### 今回作ったもの

| 項目 | 内容 |
| --- | --- |
| validator | Part-aware extraction と usage block 検出 |

### 何をしたか

active と completed を分けて同期します。

## Part 2: 開発者向け詳細

## 1. アーキテクチャ概要

### 1.1 ファイル構成

packages/sample/src/
├── guide.ts
└── index.ts

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

### 設定項目と定数一覧

| 項目 | 値 |
| --- | --- |
| --workflow | 対象workflow |
| GUIDE_TIMEOUT_MS | 250 |

### テスト構成

| テスト対象 | 件数 |
| --- | --- |
| validator | 9 |
`,
  );

  const result = runValidator(root);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 0);
  assert.equal(payload.ok, true);
  assert.equal(payload.errors.length, 0);
});

test("Part 2 の番号付き小節の後に使用例があっても PASS", () => {
  const root = makeTempDir();
  writeGuide(
    root,
    `## Part 1: 中学生向け説明

### なぜ必要か

名簿の数合わせが必要です。

### 日常生活での例え

たとえば本棚のイメージです。

### 今回作ったもの

| 項目 | 内容 |
| --- | --- |
| validator | Part-aware extraction と usage block 検出 |

### 何をしたか

集計方法を直しました。

## Part 2: 開発者向け詳細

## 1. アーキテクチャ概要

### 1.1 ファイル構成

\`\`\`ts
type AppGuide = {
  id: string;
};
\`\`\`

## 2. スキーマ詳細

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

### 設定項目と定数一覧

説明あり。

### テスト構成

説明あり。
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

### 今回作ったもの

| 項目 | 内容 |
| --- | --- |
| validator | Part-aware extraction と usage block 検出 |

### 何をしたか

集計方法を直しました。

## Part 2: 開発者向け詳細

### APIシグネチャ

\`\`\`ts
const validateLedger = (): boolean => true;
\`\`\`

### エラーハンドリング

\`\`\`bash
node validate.js --workflow docs/30-workflows/sample
\`\`\`

説明あり。

### エッジケース

説明あり。

### 設定項目と定数一覧

説明あり。

### 今回作ったもの

説明あり。

### テスト構成

説明あり。
`,
  );

  const result = runValidator(root);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 1);
  assert.equal(payload.ok, false);
  assert.match(payload.errors.join("\n"), /TypeScript の型定義/);
});

test("Part 2 に使用例が無ければ FAIL", () => {
  const root = makeTempDir();
  writeGuide(
    root,
    [
      "## Part 1: 中学生向け説明",
      "",
      "### なぜ必要か",
      "",
      "名簿の数合わせが必要です。",
      "",
      "### 日常生活での例え",
      "",
      "たとえば教室の名簿です。",
      "",
      "### 何をしたか",
      "",
      "集計方法を直しました。",
      "",
      "## Part 2: 開発者向け詳細",
      "",
      "## 1. アーキテクチャ概要",
      "",
      "### 型定義",
      "",
      "GuideResult 型: ok フィールドを持つ（コードブロックなし）。",
      "",
      "### APIシグネチャ",
      "",
      "validatePhase12 関数: GuideResult を返す（コードブロックなし）。",
      "",
      "### 使用例",
      "",
      "コマンドラインから実行する（コードブロックなし）。",
      "",
      "### エラーハンドリング",
      "",
      "```bash",
      "node validate.js --workflow docs/30-workflows/sample",
      "```",
      "",
      "説明あり。",
      "",
      "### エッジケース",
      "",
      "説明あり。",
      "",
      "### 設定項目と定数一覧",
      "",
      "説明あり。",
      "",
      "### 今回作ったもの",
      "",
      "説明あり。",
      "",
      "### テスト構成",
      "",
      "説明あり。",
    ].join("\n"),
  );

  const result = runValidator(root);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 1);
  assert.equal(payload.ok, false);
  assert.match(payload.errors.join("\n"), /使用例/);
});

test("documentation changelog テンプレートに 5 必須フィールドがある", () => {
  const template = readFileSync(changelogTemplatePath, "utf8");

  assert.ok(template.includes("| 変更者"));
  assert.ok(template.includes("| 関連 Issue / PR"));
  assert.ok(template.includes("| validator 実行結果"));
  assert.ok(template.includes("| current / baseline"));
  assert.ok(template.includes("| artifacts 同期結果"));
  assert.ok(
    template.includes("メタ情報テーブルの 5 必須フィールドが全て記録されているか"),
  );
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

### 設定項目と定数一覧

説明あり。
`,
  );

  const result = runValidator(root);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 1);
  assert.equal(payload.ok, false);
  assert.match(payload.errors.join("\n"), /なぜ必要か/);
});

// TC-NEW-01: fenced code block 内の ## Part 3 を Part 境界と誤認しないこと
test("Part 2 内の code fence に Part 3 があっても PASS (TC-NEW-01)", () => {
  const root = makeTempDir();
  writeGuide(
    root,
    `## Part 1: 中学生向け説明

### なぜ必要か

名簿の数合わせが必要です。

### 日常生活での例え

たとえば本棚のイメージです。

### 今回作ったもの

| 項目 | 内容 |
| --- | --- |
| validator | Part-aware extraction と usage block 検出 |

### 何をしたか

集計方法を直しました。

## Part 2: 開発者向け詳細

### 型定義

\`\`\`ts
interface GuideResult {
  ok: boolean;
}
\`\`\`

\`\`\`md
## Part 3
\`\`\`

### APIシグネチャ

\`\`\`ts
const validatePhase12 = (): GuideResult => ({ ok: true });
\`\`\`

### 使用例

\`\`\`bash
node validate-phase12-implementation-guide.js --workflow docs/30-workflows/sample
\`\`\`

### エラーハンドリング

説明あり。

### エッジケース

説明あり。

### 設定項目と定数一覧

説明あり。

### 今回作ったもの

説明あり。

### テスト構成

説明あり。
`,
  );

  const result = runValidator(root);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 0, `errors: ${payload.errors.join(", ")}`);
  assert.equal(payload.ok, true);
  assert.equal(payload.errors.length, 0);
});

// TC-06: ### 使用例 直下の code block がなければ FAIL
// 以前の validator は Part 2 内の別場所に code block があれば通してしまうため、directness を確認する
test("Part 2 の使用例が直下 code block なしなら FAIL (TC-06)", () => {
  const root = makeTempDir();
  writeGuide(
    root,
    `## Part 1: 中学生向け説明

### なぜ必要か

名簿の数合わせが必要です。

### 日常生活での例え

たとえば本棚のイメージです。

### 今回作ったもの

| 項目 | 内容 |
| --- | --- |
| validator | Part-aware extraction と usage block 検出 |

### 何をしたか

集計方法を直しました。

## Part 2: 開発者向け詳細

### 型定義

GuideResult 型: ok フィールドを持つ（コードブロックなし）。

### APIシグネチャ

validatePhase12 関数: GuideResult を返す（コードブロックなし）。

### 使用例

コマンドラインから実行する（コードブロックなし）。

### エラーハンドリング

説明あり。

### エッジケース

説明あり。

### 設定項目と定数一覧

説明あり。
`,
  );

  const result = runValidator(root);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 1);
  assert.equal(payload.ok, false);
  assert.match(payload.errors.join("\n"), /使用例/);
});

// TC-07: Part 3 が存在する場合でも Part 2 の内容が正しく抽出される
test("Part 3 が続いても Part 2 の使用例が正しく検出される (TC-07)", () => {
  const root = makeTempDir();
  writeGuide(
    root,
    `## Part 1: 中学生向け説明

### なぜ必要か

名簿の数合わせが必要です。

### 日常生活での例え

たとえば本棚のイメージです。

### 今回作ったもの

| 項目 | 内容 |
| --- | --- |
| validator | Part-aware extraction と usage block 検出 |

### 何をしたか

集計方法を直しました。

## Part 2: 開発者向け詳細

### 型定義

\`\`\`ts
interface GuideResult {
  ok: boolean;
}
\`\`\`

### APIシグネチャ

\`\`\`ts
const validatePhase12 = (): GuideResult => ({ ok: true });
\`\`\`

### 使用例

\`\`\`bash
node validate.js --workflow docs/30-workflows/sample
\`\`\`

### エラーハンドリング

説明あり。

### エッジケース

説明あり。

### 設定項目と定数一覧

説明あり。

### 今回作ったもの

説明あり。

### テスト構成

説明あり。

## Part 3: 追加情報

このセクションは Part 2 の後に続く。
`,
  );

  const result = runValidator(root);
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 0, `errors: ${payload.errors.join(", ")}`);
  assert.equal(payload.ok, true);
  assert.equal(payload.errors.length, 0);
});

test.after(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});
