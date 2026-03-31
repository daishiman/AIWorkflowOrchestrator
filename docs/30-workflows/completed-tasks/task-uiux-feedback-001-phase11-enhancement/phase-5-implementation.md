# Phase 5: 実装

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 5                                     |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日 | 2026-03-31                            |
| 担当   | タスク仕様書作成エージェント          |

## 目的

Phase 4 のテスト仕様に基づいて実装を行い、全テスト（SEM-001〜007、VIS-001〜007、API-001〜005、SAVE-001〜004、TASK-001〜004）をグリーンにする。

---

## [Feedback RT-03 対応] 実装計画: ファイルパス一覧

### 新規作成ファイル

| No. | ファイルパス                                                                            | 種別     | 対応テスト                                 |
| --- | --------------------------------------------------------------------------------------- | -------- | ------------------------------------------ |
| 1   | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts`    | 新規作成 | SEM-001〜007、VIS-001〜007                 |
| 2   | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts` | 新規作成 | VIS-001〜007（設定ファイル）               |
| 3   | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`                   | 新規作成 | API-001〜005、SAVE-001〜004、TASK-001〜004 |
| 4   | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts`    | 新規作成 | API/SAVE/TASK テスト実体                   |
| 5   | `apps/desktop/tests/e2e/phase11-semantic-layer.test.ts`                                 | 新規作成 | SEM-001〜007 テスト実体                    |

### 修正ファイル

| No. | ファイルパス                                                                                                    | 種別 | 変更内容                                     |
| --- | --------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------- |
| 6   | `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md`                         | 修正 | 3層評価セクション追加（後方互換性維持）      |
| 7   | `.claude/skills/task-specification-creator/SKILL.md`                                                            | 修正 | line 118 付近: Phase 11 説明を 3層評価に更新 |
| 8   | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/phase-11-manual-test.md` | 修正 | M11-1〜M11-4 を 3層評価シナリオに書き直す    |

---

## 実行タスク

- `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md` の 3 層評価テンプレート追加
- `.claude/skills/task-specification-creator/SKILL.md` の Phase 11 説明更新（line 118 付近）
- `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` の実装骨格作成
- `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js` の実装骨格作成
- TASK-RT-05 Phase 11（`phase-11-manual-test.md`）の 3 層評価化

## 参照資料

| 資料名                     | パス                                                                                                            | 説明                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Phase 4 テスト作成         | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-4-test-creation.md`                         | テストID・検証仕様（全テストの参照元）        |
| Phase 2 設計書             | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-2-design.md`                                | 実装コード仕様（ステップ 1〜5）               |
| Phase 3 設計レビュー       | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-3-design-review.md`                         | CONDITIONAL PASS 判定（CON-1/CON-2 対処済み） |
| 現行 Phase 11 テンプレート | `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md`                         | 更新対象（改善ベース）                        |
| TASK-RT-05 Phase 11        | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/phase-11-manual-test.md` | 更新対象（M11-1〜M11-4）                      |

---

## 実行手順

### ステップ 1: `phase-11-test-report-template.md` への 3 層評価セクション追加

**対象ファイル**: `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md`

**変更内容**: 既存セクション（機能テスト・エラーハンドリング・アクセシビリティ・スクリーンショット・仕様照合）の**後に**以下の 3 層評価セクションを追加する。既存セクションは一切変更しない（後方互換性維持）。

追加する内容:

```markdown
### 層1: Semantic 確認（アクセシビリティ構造検証）

| 確認項目                   | 期待値                                     | 結果      | 備考 |
| -------------------------- | ------------------------------------------ | --------- | ---- |
| ARIA ラベル（aria-label）  | 各インタラクティブ要素に意味のあるラベル   | PASS/FAIL |      |
| role 属性                  | checkbox/button/listbox 等が正しく付与     | PASS/FAIL |      |
| tabindex                   | 0 または -1 に設定されている               | PASS/FAIL |      |
| キーボードフォーカス移動   | Tab キーで全インタラクティブ要素を巡回可能 | PASS/FAIL |      |
| アクセシビリティツリー構造 | `page.accessibility.snapshot()` で検証     | PASS/FAIL |      |

> **検証方法**: `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` の `testSemanticLayer()` 関数で実行

---

### 層2: Visual 確認（視覚的回帰検出）

| テストケース | 撮影ファイル                         | 比較ベースライン                  | diff 結果 | 備考 |
| ------------ | ------------------------------------ | --------------------------------- | --------- | ---- |
| TC-VIS-001   | `screenshots/TC-VIS-001-current.png` | `screenshots/TC-VIS-001-base.png` | PASS/FAIL |      |

> **検証方法**: `expect(page).toHaveScreenshot('TC-VIS-001.png', { maxDiffPixels: 50 })`
> **命名ルール**: `TC-VIS-{連番}-{状態名}.png`（例: `TC-VIS-001-checkbox-selected.png`）
> **初回実行**: `npx playwright test --update-snapshots` でベースライン画像を生成する

---

### 層3: AI UX 評価（問題発見）

| 評価項目             | 評価結果ファイル                       | 重要度       |
| -------------------- | -------------------------------------- | ------------ |
| ユーザビリティ問題   | `outputs/phase-11/ai-ux-evaluation.md` | HIGH/MED/LOW |
| アクセシビリティ懸念 | `outputs/phase-11/ai-ux-evaluation.md` | HIGH/MED/LOW |
| 改善提案             | `outputs/phase-11/ai-ux-evaluation.md` | HIGH/MED/LOW |

> **実行方法**: `npx ts-node .claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js --screenshot outputs/phase-11/screenshots/*.png`
> **出力先**: `outputs/phase-11/ai-ux-evaluation.md`

---

### 3 層評価サマリー

| 層              | 結果      | 検出問題数 | unassigned-task 生成数 |
| --------------- | --------- | ---------- | ---------------------- |
| 層1: Semantic   | PASS/FAIL | 0          | 0                      |
| 層2: Visual     | PASS/FAIL | 0          | 0                      |
| 層3: AI UX 評価 | PASS/FAIL | 0          | 0                      |
| **総合**        | PASS/FAIL | **0**      | **0**                  |
```

**後方互換性の確認**: 既存セクション（`### 機能テスト（正常系）`、`### エラーハンドリングテスト（異常系）`、`### アクセシビリティテスト`、`### スクリーンショットエビデンス`、`### 仕様照合結果サマリー`）は変更しない。非 UI task は 3 層評価セクションを省略しても仕様書として成立する。

---

### ステップ 2: SKILL.md の Phase 11 説明更新

**対象ファイル**: `.claude/skills/task-specification-creator/SKILL.md`
**変更箇所**: line 118 付近（Phase 11 の説明文）

**変更前イメージ（現行）**:

```
Phase 11: 手動テスト（docs navigation と UI evidence を人手で確認する）
```

**変更後**:

```
Phase 11: 3層評価テスト（Semantic確認・Visual回帰検出・AI UX評価）
  - 層1 Semantic: Playwright _electron による ARIA ロール・tabindex・キーボードナビゲーション構造検証
  - 層2 Visual: toHaveScreenshot() による before/after ピクセル差分検出
  - 層3 AI UX: evaluate-ui-ux.js による Claude API スクリーンショット評価・改善提案生成
  - フィードバックループ: HIGH 問題を unassigned-task/ui-ux-issue-*.md として自動生成
  - 後方互換: 既存の walkthrough シナリオ（manual-test-checklist.md 等）は維持
```

**注意**: SKILL.md の実際の line 118 付近のコンテキストを読んでから編集し、前後の構造を維持すること。

---

### ステップ 3: `evaluate-ui-ux-playwright-e2e.ts` の実装骨格

**新規作成**: `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts`

Phase 2 設計書のコード仕様に基づき以下の構造で実装する:

```typescript
// .claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts
import { test, expect, _electron as electron } from "@playwright/test";
import type { ElectronApplication, Page } from "@playwright/test";
import * as path from "path";

// 型定義
interface SemanticTestResult {
  ariaLabels: Array<{ tag: string; label: string | null; role: string | null }>;
  accessibilitySnapshot: unknown;
  tabIndexElements: Array<{
    tag: string;
    tabIndex: number;
    role: string | null;
  }>;
  keyboardFocus: string | undefined;
}

// Electron アプリの起動
async function launchElectronApp(): Promise<ElectronApplication> {
  const appPath = path.join(__dirname, "../../apps/desktop");
  return await electron.launch({
    args: [path.join(appPath, "dist/main.js")],
    env: {
      ...process.env,
      NODE_ENV: "test",
      ELECTRON_IS_TEST: "1",
    },
  });
}

// ===== 層1: Semantic 確認 =====
// 対応テスト: SEM-001〜006
export async function testSemanticLayer(
  page: Page,
  targetSelector: string,
): Promise<SemanticTestResult> {
  const ariaLabels = await page.evaluate(() => {
    const elements = document.querySelectorAll("[aria-label]");
    return Array.from(elements).map((el) => ({
      tag: el.tagName,
      label: el.getAttribute("aria-label"),
      role: el.getAttribute("role"),
    }));
  });

  const snapshot = await page.accessibility.snapshot();

  const tabIndexElements = await page.evaluate(() => {
    const interactive = document.querySelectorAll(
      'button, input, [tabindex], [role="checkbox"]',
    );
    return Array.from(interactive).map((el) => ({
      tag: el.tagName,
      tabIndex: (el as HTMLElement).tabIndex,
      role: el.getAttribute("role"),
    }));
  });

  await page.keyboard.press("Tab");
  const focusedElement = await page.evaluate(
    () => document.activeElement?.tagName,
  );

  return {
    ariaLabels,
    accessibilitySnapshot: snapshot,
    tabIndexElements,
    keyboardFocus: focusedElement,
  };
}

// ===== 層2: Visual 確認 =====
// 対応テスト: VIS-001〜007
// CON-1 対応: 初回実行時は --update-snapshots フラグで実行すること
export async function testVisualLayer(
  page: Page,
  testCaseId: string,
): Promise<void> {
  await expect(page).toHaveScreenshot(`${testCaseId}.png`, {
    maxDiffPixels: 50,
    animations: "disabled",
  });
}

// ===== TASK-RT-05 M11-1〜M11-4 テストスイート =====
test.describe("TASK-RT-05 multi_select Phase 11: 3層評価", () => {
  let app: ElectronApplication;
  let page: Page;

  test.beforeAll(async () => {
    app = await launchElectronApp();
    page = await app.firstWindow();
    await page.waitForLoadState("domcontentloaded");
  });

  test.afterAll(async () => {
    await app.close();
  });

  // M11-1: multi_select request 表示（層1 + 層2）
  test("M11-1: multi_select request を開く - 3層評価", async () => {
    await page.goto("/workflow");
    // 層1: SEM-001
    const semanticResult = await testSemanticLayer(page, '[role="checkbox"]');
    expect(semanticResult.ariaLabels.length).toBeGreaterThan(0);
    // 層2: VIS-001
    await testVisualLayer(page, "M11-1-multi-select-display");
    // 層3: evaluate-ui-ux.js で別途実行
  });

  // M11-2: 2件選択して送信（層1 + 層2 + payload 検証）
  test("M11-2: 2件選択して送信する - 3層評価", async () => {
    const checkboxes = await page.locator('[role="checkbox"]').all();
    await checkboxes[0].click();
    await checkboxes[1].click();
    // 層1: SEM-006（aria-checked の状態反映）
    const checkedCount = await page
      .locator('[role="checkbox"][aria-checked="true"]')
      .count();
    expect(checkedCount).toBe(2);
    // 層2: VIS-002
    await testVisualLayer(page, "M11-2-checkbox-selected");
    // payload 検証（PAY-001）
    await page.click('[data-testid="submit-button"]');
    const lastPayload = await page.evaluate(
      () => (window as Record<string, unknown>).__lastSubmitPayload__,
    );
    expect(
      Array.isArray(
        (lastPayload as Record<string, unknown> | null)?.selectedOptionIds,
      ),
    ).toBe(true);
  });

  // M11-3: kind 切り替え（層1 + 層2）
  test("M11-3: kind を切り替える - 3層評価", async () => {
    await page.click('[data-testid="kind-switch"]');
    // 層1: SEM-007（切り替え後 aria-checked が全て false）
    const checkedBoxes = await page
      .locator('[role="checkbox"][aria-checked="true"]')
      .count();
    expect(checkedBoxes).toBe(0);
    // 層2: VIS-003
    await testVisualLayer(page, "M11-3-kind-switched");
  });

  // M11-4: 既存 4 kind の確認（層2）
  test("M11-4: 既存 4 kind を順に確認する - 3層評価", async () => {
    const kinds = ["single_select", "free_text", "secret", "confirm"];
    for (const kind of kinds) {
      await page.click(`[data-testid="kind-${kind}"]`);
      // 層2: VIS-004〜007
      await testVisualLayer(page, `M11-4-kind-${kind}`);
    }
  });
});
```

**専用設定ファイル** (`.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts`):

```typescript
// .claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  timeout: 60000,
  use: {
    screenshot: "on",
    trace: "on-first-retry",
  },
  snapshotDir: "outputs/phase-11/screenshots",
  snapshotPathTemplate: "{snapshotDir}/{testName}/{arg}{ext}",
});
```

---

### ステップ 4: `evaluate-ui-ux.js` の実装骨格

**新規作成**: `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`

Phase 2 設計書のコード仕様に基づき以下の構造で実装する:

````typescript
// .claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

const client = new Anthropic();

// 型定義
export interface UXEvaluationResult {
  usabilityIssues: UXIssue[];
  accessibilityConcerns: A11yConcern[];
  improvements: Improvement[];
}

export interface UXIssue {
  id: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

export interface A11yConcern {
  id: string;
  concern: string;
  wcagCriteria: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

export interface Improvement {
  priority: number;
  suggestion: string;
  effort: "LOW" | "MEDIUM" | "HIGH";
}

// スクリーンショットを base64 エンコード
export function encodeScreenshot(imagePath: string): string {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString("base64");
}

// Claude API でスクリーンショットを評価
// 対応テスト: API-001〜005
export async function evaluateUIWithClaude(
  screenshotPaths: string[],
  taskContext: string = "AIWorkflowOrchestrator multi_select UI コンポーネント",
): Promise<UXEvaluationResult> {
  const imageContents = screenshotPaths.map((p) => ({
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: "image/png" as const,
      data: encodeScreenshot(p),
    },
  }));

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          ...imageContents,
          {
            type: "text",
            text: `このUIのスクリーンショットを評価してください。対象: ${taskContext}

以下の観点で評価し、JSON形式で出力してください：
1. ユーザビリティ問題（usabilityIssues）
2. アクセシビリティ懸念（accessibilityConcerns）
3. 改善提案（improvements）

出力フォーマット:
{
  "usabilityIssues": [{"id": "UX-001", "description": "...", "severity": "HIGH|MEDIUM|LOW"}],
  "accessibilityConcerns": [{"id": "A11Y-001", "concern": "...", "wcagCriteria": "1.x.x", "severity": "HIGH|MEDIUM|LOW"}],
  "improvements": [{"priority": 1, "suggestion": "...", "effort": "LOW|MEDIUM|HIGH"}]
}`,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  // JSON パース（コードブロック除去）
  const jsonText = content.text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(jsonText) as UXEvaluationResult;
}

// 評価結果を Markdown に変換して保存
// 対応テスト: SAVE-001〜004
export async function saveEvaluationReport(
  result: UXEvaluationResult,
  outputPath: string,
  taskId: string,
): Promise<void> {
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");

  const markdown = `# AI UX 評価レポート

## 評価メタ情報

| 項目         | 値              |
| ------------ | --------------- |
| タスク ID    | ${taskId}       |
| 評価日時     | ${now}          |
| 使用モデル   | claude-opus-4-5 |

## ユーザビリティ問題

| ID      | 問題             | 重要度 |
| ------- | ---------------- | ------ |
${result.usabilityIssues.map((i) => `| ${i.id} | ${i.description} | ${i.severity} |`).join("\n")}

## アクセシビリティ懸念

| ID       | 懸念事項         | WCAG 基準          | 重要度 |
| -------- | ---------------- | ------------------ | ------ |
${result.accessibilityConcerns.map((c) => `| ${c.id} | ${c.concern} | ${c.wcagCriteria} | ${c.severity} |`).join("\n")}

## 改善提案

| 優先度 | 提案内容         | 実装難易度 |
| ------ | ---------------- | ---------- |
${result.improvements.map((i) => `| ${i.priority} | ${i.suggestion} | ${i.effort} |`).join("\n")}

## 次ステップ

- [ ] HIGH 重要度の問題を unassigned-task として生成する
- [ ] Phase 12 台帳に登録する
- [ ] 次タスク Phase 2 でこのレポートを参照する
`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, markdown, "utf-8");
  console.log(`AI UX 評価レポートを保存: ${outputPath}`);
}

// unassigned-task を自動生成
// 対応テスト: TASK-001〜004
export async function generateUnassignedTasks(
  result: UXEvaluationResult,
  outputDir: string,
  taskId: string,
): Promise<string[]> {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const generatedFiles: string[] = [];

  const highPriorityIssues = [
    ...result.usabilityIssues.filter((i) => i.severity === "HIGH"),
    ...result.accessibilityConcerns.filter((c) => c.severity === "HIGH"),
  ];

  highPriorityIssues.forEach((issue, index) => {
    const issueId = `ui-ux-issue-${date}-${String(index + 1).padStart(3, "0")}`;
    const isA11y = "wcagCriteria" in issue;
    const outputPath = path.join(outputDir, `${issueId}.md`);

    const issueTitle = isA11y
      ? (issue as A11yConcern).concern
      : (issue as UXIssue).description;
    const issueLayer = isA11y ? "層1: Semantic" : "層3: AI UX";
    const wcagNote = isA11y
      ? `\nWCAG 基準: ${(issue as A11yConcern).wcagCriteria}`
      : "";

    const content = `# UI/UX 改善タスク: ${issueTitle}

## メタ情報

| 項目       | 値                                           |
| ---------- | -------------------------------------------- |
| タスク ID  | ${issueId}                                   |
| 発見元     | ${taskId} Phase 11                           |
| 発見日     | ${new Date().toISOString().slice(0, 10)}     |
| 重要度     | HIGH                                         |
| 層         | ${issueLayer}                                |

## 問題の説明

${issueTitle}${wcagNote}

## 受入条件

- [ ] 問題が解消され、再評価で PASS になること

## 参照

- 発見元: \`outputs/phase-11/ai-ux-evaluation.md\`
`;

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content, "utf-8");
    generatedFiles.push(outputPath);
    console.log(`unassigned-task 生成: ${outputPath}`);
  });

  return generatedFiles;
}

// CLI エントリポイント
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const screenshotIndex = args.indexOf("--screenshot");
  const outputIndex = args.indexOf("--output");
  const taskIndex = args.indexOf("--task-id");

  if (screenshotIndex === -1) {
    console.error(
      "Usage: ts-node evaluate-ui-ux.js --screenshot <path> [--output <dir>] [--task-id <id>]",
    );
    process.exit(1);
  }

  const screenshotPath = args[screenshotIndex + 1];
  const outputDir =
    outputIndex !== -1 ? args[outputIndex + 1] : "outputs/phase-11";
  const taskId =
    taskIndex !== -1 ? args[taskIndex + 1] : "TASK-UIUX-FEEDBACK-001";

  const screenshotPaths = screenshotPath.includes("*")
    ? require("glob").sync(screenshotPath)
    : [screenshotPath];

  console.log(`評価対象: ${screenshotPaths.length} 枚のスクリーンショット`);

  const result = await evaluateUIWithClaude(screenshotPaths);
  await saveEvaluationReport(
    result,
    path.join(outputDir, "ai-ux-evaluation.md"),
    taskId,
  );
  const generatedFiles = await generateUnassignedTasks(
    result,
    "unassigned-task",
    taskId,
  );

  console.log(
    `\n評価完了: ${generatedFiles.length} 件の unassigned-task を生成`,
  );
}

main().catch(console.error);
````

---

### ステップ 5: TASK-RT-05 Phase 11 の更新

**対象ファイル**: `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/phase-11-manual-test.md`

**変更内容**: M11-1〜M11-4 の walkthrough シナリオテーブルを 3 層評価シナリオに書き直す。

更新後の「ウォークスルーシナリオ」セクション:

```markdown
### 3層評価シナリオ

#### M11-1: multi_select request 表示（3層評価）

| 層           | 確認項目                           | 期待結果                          | 自動化方法        |
| ------------ | ---------------------------------- | --------------------------------- | ----------------- |
| 層1 Semantic | checkbox に `role="checkbox"` 付与 | 全 option に role 付与            | Playwright        |
| 層1 Semantic | `aria-label` が意味のある文字列    | 空文字なし                        | Playwright        |
| 層2 Visual   | スクリーンショット比較             | ベースラインと一致（diff ≤ 50px） | toHaveScreenshot  |
| 層3 AI UX    | AI によるユーザビリティ評価        | HIGH 問題なし                     | evaluate-ui-ux.js |

#### M11-2: 2件選択して送信（3層評価）

| 層           | 確認項目                              | 期待結果               | 自動化方法        |
| ------------ | ------------------------------------- | ---------------------- | ----------------- |
| 層1 Semantic | 選択状態の `aria-checked="true"` 付与 | 選択した 2 件に付与    | Playwright        |
| 層2 Visual   | 選択後スクリーンショット              | ベースラインと一致     | toHaveScreenshot  |
| 層3 AI UX    | 選択状態の視認性評価                  | 選択済みが明確に分かる | evaluate-ui-ux.js |

#### M11-3: kind 切り替え（3層評価）

| 層           | 確認項目                       | 期待結果                       | 自動化方法        |
| ------------ | ------------------------------ | ------------------------------ | ----------------- |
| 層1 Semantic | 切り替え後の ARIA 状態リセット | `aria-checked` が全て false    | Playwright        |
| 層2 Visual   | 切り替え後スクリーンショット   | 前 kind の UI 要素が消えている | toHaveScreenshot  |
| 層3 AI UX    | kind 切り替えの直感性評価      | HIGH 問題なし                  | evaluate-ui-ux.js |

#### M11-4: 既存 4 kind 確認（3層評価）

| 種別          | 層         | 確認項目               | 期待結果           | 自動化方法       |
| ------------- | ---------- | ---------------------- | ------------------ | ---------------- |
| single_select | 層2 Visual | スクリーンショット比較 | ベースラインと一致 | toHaveScreenshot |
| free_text     | 層2 Visual | スクリーンショット比較 | ベースラインと一致 | toHaveScreenshot |
| secret        | 層2 Visual | スクリーンショット比較 | ベースラインと一致 | toHaveScreenshot |
| confirm       | 層2 Visual | スクリーンショット比較 | ベースラインと一致 | toHaveScreenshot |
```

**成果物テーブルの追加項目** (既存の成果物テーブルに追記):

| 成果物                  | パス                                   | 説明                                      |
| ----------------------- | -------------------------------------- | ----------------------------------------- |
| AI UX 評価レポート      | `outputs/phase-11/ai-ux-evaluation.md` | 層3 評価結果（evaluate-ui-ux.js が生成）  |
| Visual スナップショット | `outputs/phase-11/screenshots/`        | 層2 ベースライン画像（Playwright が生成） |

---

## 統合テスト連携

| 連携先             | 連携内容                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 4 テスト     | SEM-001〜007、VIS-001〜007、API-001〜005、SAVE-001〜004、TASK-001〜004 の全テストがグリーンになることを確認。テストが失敗する場合は実装を修正する |
| Phase 6 拡充       | 3 層評価の fail ケース（ARIA 欠落、視覚回帰、UX 問題）を Phase 6 で edge case テストに追加する                                                    |
| Phase 12 docs      | `outputs/phase-11/ai-ux-evaluation.md` を Phase 12 ドキュメントに組み込む                                                                         |
| unassigned-task    | `generateUnassignedTasks()` で HIGH 問題を自動生成、Phase 12 台帳に登録                                                                           |
| GitHub Issue #1755 | M11-1〜M11-4 のシナリオが 3 層評価で自動化可能になり、PENDING 状態を解消する                                                                      |

---

## 成果物テーブル

| 成果物名                 | パス                                                                                                     | 説明                         |
| ------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 実装仕様書（本ファイル） | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-5-implementation.md`                 | Phase 5 成果物               |
| 変更ファイル一覧         | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-5/changed-files.md`          | 新規作成・修正ファイルの一覧 |
| 実装サマリー             | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-5/implementation-summary.md` | 実装完了後のサマリー         |

---

## 完了条件チェックリスト

- [ ] ステップ 1: `phase-11-test-report-template.md` に 3 層評価セクション（層1/層2/層3/3層評価サマリー）が追加されている
- [ ] ステップ 1: 既存セクション（機能テスト・エラーハンドリング等）が変更されていない（後方互換性維持）
- [ ] ステップ 2: `SKILL.md` line 118 付近の Phase 11 説明が「3 層評価（semantic/visual/AI UX）」に更新されている
- [ ] ステップ 3: `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` が作成されている（`testSemanticLayer()`・`testVisualLayer()`・M11-1〜M11-4 テストスイート含む）
- [ ] ステップ 3: `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts` が作成されている
- [ ] ステップ 4: `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js` が作成されている（`evaluateUIWithClaude()`・`saveEvaluationReport()`・`generateUnassignedTasks()`・CLI エントリポイント含む）
- [ ] ステップ 5: TASK-RT-05 の `phase-11-manual-test.md` の M11-1〜M11-4 が 3 層評価シナリオテーブルに書き直されている
- [ ] Phase 4 テスト仕様（SEM-001〜007、VIS-001〜007、API-001〜005）が全て実装によってグリーンになる見込みがある
- [ ] `outputs/phase-5/changed-files.md` が作成されている
- [ ] `outputs/phase-5/implementation-summary.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**
