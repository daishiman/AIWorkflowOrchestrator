# Phase 2: 設計

## メタ情報

| 項目   | 値                                                                      |
| ------ | ----------------------------------------------------------------------- |
| Phase  | 2                                                                       |
| 機能名 | TASK-UIUX-FEEDBACK-001: Phase 11 UI/UX 3層評価+フィードバックループ強化 |
| 作成日 | 2026-03-31                                                              |
| 担当   | 設計書作成エージェント                                                  |

## 目的

Phase 1 受入条件（AC-1〜AC-8）を満たす具体的な設計を確定する。3 層評価テンプレート・フィードバックループのデータフロー・Playwright 統合・AI 評価スクリプト・TASK-RT-05 M11 シナリオを全てステップ別に設計し、実装着手可能な仕様を提供する。

## 実行タスク

- Phase 11 テンプレート（`phase-11-test-report-template.md`）の 3 層評価構造を設計する
- フィードバックループのデータフロー（評価結果保存形式・unassigned-task 出力フォーマット）を設計する
- Playwright `_electron` 統合設定ファイル・テスト構造を設計する
- AI UX 評価スクリプト（Claude API 呼び出し・レスポンス処理）を設計する
- TASK-RT-05 Phase 11 の 3 層評価シナリオ（M11-1〜M11-4）を再定義する

## 参照資料

| 資料名                        | パス                                                                                                            | 説明                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件定義              | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-1-requirements.md`                          | 本フェーズの前提・受入条件 |
| 現行 Phase 11 テンプレート    | `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md`                         | 改善ベース                 |
| TASK-RT-05 Phase 11           | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/phase-11-manual-test.md` | 適用対象（M11-1〜M11-4）   |
| Playwright `_electron` API    | https://playwright.dev/docs/api/class-electron                                                                  | ElectronApp 統合 API       |
| Playwright `toHaveScreenshot` | https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-2                       | 視覚的回帰 API             |

---

## 実行手順

### ステップ 1: `phase-11-test-report-template.md` の 3 層評価テンプレート設計

**変更対象**: `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md`

現行テンプレートに以下の 3 セクションを追加する。既存セクション（機能テスト・エラーハンドリング・アクセシビリティ・スクリーンショット・仕様照合）は保持し、後方互換性を維持する。

#### 追加セクション設計

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

---

### ステップ 2: フィードバックループのデータフロー設計

#### データフロー図

```
Phase 11 実行
    │
    ├─ 層1: Semantic 確認（evaluate-ui-ux-playwright-e2e.ts）
    ├─ 層2: Visual 確認（toHaveScreenshot）
    └─ 層3: AI UX 評価（evaluate-ui-ux.js）
             │
             ▼
    outputs/phase-11/ai-ux-evaluation.md（評価結果記録）
             │
             ▼
    重要度 HIGH/CRITICAL の問題を検出した場合
             │
             ▼
    unassigned-task/ui-ux-issue-{{YYYYMMDD}}-{{連番}}.md（自動フォーマット）
             │
             ▼
    Phase 12: ドキュメント化（unassigned-task を台帳に登録）
             │
             ▼
    次タスクの Phase 2 設計時に ai-ux-evaluation.md を参照
             │
             ▼
    改善実装 → Phase 11 で再評価 → ループ継続
```

#### `outputs/phase-11/ai-ux-evaluation.md` の出力フォーマット

```markdown
# AI UX 評価レポート

## 評価メタ情報

| 項目                 | 値                                |
| -------------------- | --------------------------------- |
| タスク ID            | TASK-UIUX-FEEDBACK-001            |
| 評価日時             | {{YYYY-MM-DD HH:mm}}              |
| 評価対象             | multi_select UI コンポーネント    |
| スクリーンショット数 | N 枚                              |
| 使用モデル           | claude-opus-4 / claude-sonnet-4-5 |

## ユーザビリティ問題

| ID     | 問題           | 重要度 | unassigned-task    |
| ------ | -------------- | ------ | ------------------ |
| UX-001 | {{問題の説明}} | HIGH   | ui-ux-issue-001.md |

## アクセシビリティ懸念

| ID       | 懸念事項       | WCAG 基準 | 重要度 |
| -------- | -------------- | --------- | ------ |
| A11Y-001 | {{懸念の説明}} | 1.3.1     | HIGH   |

## 改善提案

| 優先度 | 提案内容     | 実装難易度   |
| ------ | ------------ | ------------ |
| 1      | {{改善提案}} | LOW/MED/HIGH |

## 次ステップ

- [ ] unassigned-task 生成（N 件）
- [ ] Phase 12 台帳登録
- [ ] 次タスク Phase 2 での参照
```

#### `unassigned-task/ui-ux-issue-{{ID}}.md` の出力フォーマット

```markdown
# UI/UX 改善タスク: {{問題タイトル}}

## メタ情報

| 項目      | 値                                       |
| --------- | ---------------------------------------- |
| タスク ID | ui-ux-issue-{{YYYYMMDD}}-{{連番}}        |
| 発見元    | TASK-UIUX-FEEDBACK-001 Phase 11          |
| 発見日    | {{YYYY-MM-DD}}                           |
| 重要度    | HIGH/MED/LOW                             |
| 層        | 層1: Semantic / 層2: Visual / 層3: AI UX |

## 問題の説明

{{AI UX 評価または Semantic/Visual 確認で発見した問題の詳細}}

## 再現手順

1. {{ステップ 1}}
2. {{ステップ 2}}

## 期待動作

{{本来あるべき動作}}

## 受入条件

- [ ] {{具体的な受入条件}}

## 参照

- 発見元: `outputs/phase-11/ai-ux-evaluation.md`
- スクリーンショット: `outputs/phase-11/screenshots/{{ファイル名}}`
```

---

### ステップ 3: Playwright `_electron` 統合設計

**新規作成対象**: `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts`

#### 設定ファイル設計

Playwright の `_electron` 統合は既存の `playwright.config.ts` とは分離した専用設定で管理する。

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

#### `evaluate-ui-ux-playwright-e2e.ts` の設計（テスト構造）

```typescript
// .claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts
import { test, expect, _electron as electron } from "@playwright/test";
import type { ElectronApplication, Page } from "@playwright/test";
import * as path from "path";

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
export async function testSemanticLayer(
  page: Page,
  targetSelector: string,
): Promise<SemanticTestResult> {
  // ARIA ラベル検証
  const ariaLabels = await page.evaluate(() => {
    const elements = document.querySelectorAll("[aria-label]");
    return Array.from(elements).map((el) => ({
      tag: el.tagName,
      label: el.getAttribute("aria-label"),
      role: el.getAttribute("role"),
    }));
  });

  // アクセシビリティツリー取得
  const snapshot = await page.accessibility.snapshot();

  // tabindex 検証
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

  // キーボードフォーカス移動テスト
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
export async function testVisualLayer(
  page: Page,
  testCaseId: string,
): Promise<void> {
  // ピクセル比較による視覚的回帰検出
  // maxDiffPixels: 許容ピクセル差（デフォルト 50）
  await expect(page).toHaveScreenshot(`${testCaseId}.png`, {
    maxDiffPixels: 50,
    animations: "disabled",
  });
}

// ===== TASK-RT-05 M11-1〜M11-4 テスト =====
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

  // M11-1: multi_select request 表示
  test("M11-1: multi_select request を開く - 3層評価", async () => {
    // 層1: Semantic
    await page.goto("/workflow"); // アプリ内パス（実装に合わせて調整）
    const semanticResult = await testSemanticLayer(page, '[role="checkbox"]');
    expect(semanticResult.ariaLabels.length).toBeGreaterThan(0);

    // 層2: Visual
    await testVisualLayer(page, "M11-1-multi-select-display");

    // 層3: AI UX 評価は evaluate-ui-ux.js で別途実行
  });

  // M11-2: 2件選択して送信
  test("M11-2: 2件選択して送信する - 3層評価", async () => {
    // checkboxを2件クリック
    const checkboxes = await page.locator('[role="checkbox"]').all();
    await checkboxes[0].click();
    await checkboxes[1].click();

    // 層2: Visual（選択状態）
    await testVisualLayer(page, "M11-2-checkbox-selected");

    // 送信
    await page.click('[data-testid="submit-button"]');

    // payload 検証
    const lastPayload = await page.evaluate(
      () => (window as Record<string, unknown>).__lastSubmitPayload__,
    );
    expect(
      Array.isArray(
        (lastPayload as Record<string, unknown> | null)?.selectedOptionIds,
      ),
    ).toBe(true);
  });

  // M11-3: kind 切り替え
  test("M11-3: kind を切り替える - 3層評価", async () => {
    // kind 切り替え操作
    await page.click('[data-testid="kind-switch"]');

    // 層1: Semantic（切り替え後）
    const semanticResult = await testSemanticLayer(page, '[role="checkbox"]');

    // 前の選択 state が残っていないことを確認
    const checkedBoxes = await page
      .locator('[role="checkbox"][aria-checked="true"]')
      .count();
    expect(checkedBoxes).toBe(0);

    // 層2: Visual（切り替え後）
    await testVisualLayer(page, "M11-3-kind-switched");
  });

  // M11-4: 既存 4 kind の確認
  test("M11-4: 既存 4 kind を順に確認する - 3層評価", async () => {
    const kinds = ["single_select", "free_text", "secret", "confirm"];

    for (const kind of kinds) {
      await page.click(`[data-testid="kind-${kind}"]`);

      // 層2: Visual（各 kind の表示）
      await testVisualLayer(page, `M11-4-kind-${kind}`);
    }
  });
});

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
```

---

### ステップ 4: AI UX 評価スクリプト設計

**新規作成対象**: `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`

````typescript
// .claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

const client = new Anthropic();

interface UXEvaluationResult {
  usabilityIssues: UXIssue[];
  accessibilityConcerns: A11yConcern[];
  improvements: Improvement[];
}

interface UXIssue {
  id: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

interface A11yConcern {
  id: string;
  concern: string;
  wcagCriteria: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

interface Improvement {
  priority: number;
  suggestion: string;
  effort: "LOW" | "MEDIUM" | "HIGH";
}

// スクリーンショットを base64 エンコード
function encodeScreenshot(imagePath: string): string {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString("base64");
}

// Claude API でスクリーンショットを評価
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
            text: `
このUIのスクリーンショットを評価してください。対象: ${taskContext}

以下の観点で評価し、JSON形式で出力してください：

1. ユーザビリティ問題（usabilityIssues）
   - 操作しにくい箇所
   - 視認性の低い要素
   - 直感的でない操作フロー

2. アクセシビリティ懸念（accessibilityConcerns）
   - WCAG 2.1 に違反している可能性のある箇所
   - スクリーンリーダー対応の問題
   - キーボードナビゲーションの問題

3. 改善提案（improvements）
   - 優先度順で最大5件

出力フォーマット:
{
  "usabilityIssues": [
    {"id": "UX-001", "description": "...", "severity": "HIGH|MEDIUM|LOW"}
  ],
  "accessibilityConcerns": [
    {"id": "A11Y-001", "concern": "...", "wcagCriteria": "1.x.x", "severity": "HIGH|MEDIUM|LOW"}
  ],
  "improvements": [
    {"priority": 1, "suggestion": "...", "effort": "LOW|MEDIUM|HIGH"}
  ]
}
`,
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
export async function saveEvaluationReport(
  result: UXEvaluationResult,
  outputPath: string,
  taskId: string,
): Promise<void> {
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");

  const markdown = `# AI UX 評価レポート

## 評価メタ情報

| 項目             | 値                               |
| ---------------- | -------------------------------- |
| タスク ID        | ${taskId}                        |
| 評価日時         | ${now}                           |
| 使用モデル       | claude-opus-4-5                  |

## ユーザビリティ問題

| ID      | 問題                              | 重要度 |
| ------- | --------------------------------- | ------ |
${result.usabilityIssues.map((i) => `| ${i.id} | ${i.description} | ${i.severity} |`).join("\n")}

## アクセシビリティ懸念

| ID       | 懸念事項                          | WCAG 基準 | 重要度 |
| -------- | --------------------------------- | --------- | ------ |
${result.accessibilityConcerns.map((c) => `| ${c.id} | ${c.concern} | ${c.wcagCriteria} | ${c.severity} |`).join("\n")}

## 改善提案

| 優先度 | 提案内容                          | 実装難易度 |
| ------ | --------------------------------- | ---------- |
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

    const content = `# UI/UX 改善タスク: ${isA11y ? (issue as A11yConcern).concern : (issue as UXIssue).description}

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスク ID  | ${issueId}                          |
| 発見元     | ${taskId} Phase 11                  |
| 発見日     | ${new Date().toISOString().slice(0, 10)} |
| 重要度     | HIGH                                |
| 層         | ${isA11y ? "層1: Semantic" : "層3: AI UX"} |

## 問題の説明

${isA11y ? (issue as A11yConcern).concern : (issue as UXIssue).description}
${isA11y ? `\nWCAG 基準: ${(issue as A11yConcern).wcagCriteria}` : ""}

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

### ステップ 5: TASK-RT-05 Phase 11 用の 3 層評価シナリオ設計（M11-1〜M11-4 再定義）

**変更対象**: `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/phase-11-manual-test.md`

現行の walkthrough シナリオテーブルを以下の 3 層評価シナリオに拡張する。

#### M11-1: multi_select request 表示（3 層評価）

| 層           | 確認項目                           | 期待結果                          | 自動化            |
| ------------ | ---------------------------------- | --------------------------------- | ----------------- |
| 層1 Semantic | checkbox に `role="checkbox"` 付与 | 全 option に role 付与            | Playwright        |
| 層1 Semantic | `aria-label` が意味のある文字列    | 空文字なし                        | Playwright        |
| 層2 Visual   | スクリーンショット比較             | ベースラインと一致（diff ≤ 50px） | toHaveScreenshot  |
| 層3 AI UX    | AI によるユーザビリティ評価        | HIGH 問題なし                     | evaluate-ui-ux.js |

#### M11-2: 2件選択して送信（3 層評価）

| 層           | 確認項目                              | 期待結果               | 自動化            |
| ------------ | ------------------------------------- | ---------------------- | ----------------- |
| 層1 Semantic | 選択状態の `aria-checked="true"` 付与 | 選択した 2 件に付与    | Playwright        |
| 層2 Visual   | 選択後スクリーンショット              | ベースラインと一致     | toHaveScreenshot  |
| 層3 AI UX    | 選択状態の視認性評価                  | 選択済みが明確に分かる | evaluate-ui-ux.js |

#### M11-3: kind 切り替え（3 層評価）

| 層           | 確認項目                       | 期待結果                       | 自動化            |
| ------------ | ------------------------------ | ------------------------------ | ----------------- |
| 層1 Semantic | 切り替え後の ARIA 状態リセット | `aria-checked` が全て false    | Playwright        |
| 層2 Visual   | 切り替え後スクリーンショット   | 前 kind の UI 要素が消えている | toHaveScreenshot  |
| 層3 AI UX    | kind 切り替えの直感性評価      | HIGH 問題なし                  | evaluate-ui-ux.js |

#### M11-4: 既存 4 kind 確認（3 層評価）

| 種別          | 層         | 確認項目               | 期待結果           | 自動化           |
| ------------- | ---------- | ---------------------- | ------------------ | ---------------- |
| single_select | 層2 Visual | スクリーンショット比較 | ベースラインと一致 | toHaveScreenshot |
| free_text     | 層2 Visual | スクリーンショット比較 | ベースラインと一致 | toHaveScreenshot |
| secret        | 層2 Visual | スクリーンショット比較 | ベースラインと一致 | toHaveScreenshot |
| confirm       | 層2 Visual | スクリーンショット比較 | ベースラインと一致 | toHaveScreenshot |

---

## 統合テスト連携

| 連携先          | 連携内容                                                                          |
| --------------- | --------------------------------------------------------------------------------- |
| Phase 4 テスト  | `evaluate-ui-ux-playwright-e2e.ts` のテストスイートを Phase 4 で作成              |
| Phase 6 拡充    | 層1/層2 の fail ケース（ARIA 欠落・視覚回帰）を Phase 6 で edge case テストに追加 |
| Phase 12 docs   | `outputs/phase-11/ai-ux-evaluation.md` を Phase 12 ドキュメントに組み込む         |
| unassigned-task | `generateUnassignedTasks()` 関数で自動生成、Phase 12 台帳に登録                   |

## 成果物

| 成果物名                      | パス                                                                                                              | 説明                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 設計書（本ファイル）          | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-2-design.md`                                  | Phase 2 成果物               |
| 3 層評価テンプレート設計      | ステップ 1 内（`.claude/skills/task-specification-creator/references/phase-11-test-report-template.md` への適用） | テンプレート更新仕様         |
| フィードバックループ設計      | ステップ 2 内（データフロー図・出力フォーマット）                                                                 | ループ仕様                   |
| Playwright 統合スクリプト設計 | ステップ 3 内（`.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts`）             | E2E 自動化仕様               |
| AI UX 評価スクリプト設計      | ステップ 4 内（`.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`）                            | Claude API 呼び出し仕様      |
| M11 3 層評価シナリオ          | ステップ 5 内（M11-1〜M11-4 再定義）                                                                              | TASK-RT-05 Phase 11 完了仕様 |

## 完了条件チェックリスト

- [ ] 3 層評価テンプレートの追加セクション設計が完了している（ステップ 1）
- [ ] フィードバックループのデータフロー図が設計されている（ステップ 2）
- [ ] `outputs/phase-11/ai-ux-evaluation.md` の出力フォーマットが定義されている（ステップ 2）
- [ ] `unassigned-task/ui-ux-issue-{{ID}}.md` の出力フォーマットが定義されている（ステップ 2）
- [ ] `evaluate-ui-ux-playwright-e2e.ts` の設計（設定・テスト構造・M11 シナリオ）が完了している（ステップ 3）
- [ ] `evaluate-ui-ux.js` の設計（Claude API 呼び出し・レスポンス処理・unassigned-task 生成）が完了している（ステップ 4）
- [ ] TASK-RT-05 M11-1〜M11-4 の 3 層評価シナリオが再定義されている（ステップ 5）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**
