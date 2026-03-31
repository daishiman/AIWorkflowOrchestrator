# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 4                                     |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日 | 2026-03-31                            |
| 担当   | タスク仕様書作成エージェント          |

## 目的

Phase 2 設計書・Phase 3 レビュー（CONDITIONAL PASS）に基づき、3 層評価とフィードバックループの動作を検証するテスト仕様を作成する（TDD Red フェーズ）。Phase 3 で指摘された CON-1（`--update-snapshots` 手順明記）・CON-2（成果物の役割分担明確化）を本 Phase で対処する。

## 実行タスク

- Playwright `_electron` 統合テストの仕様定義（`apps/desktop/tests/e2e/phase11-semantic-layer.test.ts`）
- Visual regression（`toHaveScreenshot()`）のテスト仕様定義（初回ベースライン生成手順を含む）
- AI UX 評価スクリプトの単体テスト仕様定義（`.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js` のモックテスト）
- phase-11 テンプレート更新後の構造検証テスト仕様定義
- TASK-RT-05 multi_select の M11-1〜M11-4 を 3 層評価でテスト化する仕様
- 成果物の役割分担テーブル（CON-2 対処）

## 参照資料

| 資料名                        | パス                                                                                                            | 説明                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Phase 1 要件定義              | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-1-requirements.md`                          | 受入条件 AC-1〜AC-8       |
| Phase 2 設計書                | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-2-design.md`                                | 実装仕様（ステップ 1〜5） |
| Phase 3 設計レビュー          | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-3-design-review.md`                         | CONDITIONAL PASS 判定     |
| 現行 Phase 11 テンプレート    | `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md`                         | 改善ベース                |
| TASK-RT-05 Phase 11           | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/phase-11-manual-test.md` | 適用対象（M11-1〜M11-4）  |
| Playwright `_electron` API    | https://playwright.dev/docs/api/class-electron                                                                  | ElectronApp 統合 API      |
| Playwright `toHaveScreenshot` | https://playwright.dev/docs/api/class-pageassertions                                                            | 視覚的回帰 API            |

---

## CON-2 対処: 成果物の役割分担テーブル

Phase 3 CONDITIONAL 項目 CON-2 の対処として、既存成果物と新規成果物の役割分担を以下のように明確化する。

| 成果物                                      | 役割                                                           | 作成者                             | タイミング          |
| ------------------------------------------- | -------------------------------------------------------------- | ---------------------------------- | ------------------- |
| `outputs/phase-11/manual-test-checklist.md` | walkthrough チェックリスト（人手操作の確認項目を列挙）         | 人手（テスト実施者）               | Phase 11 着手時     |
| `outputs/phase-11/manual-test-result.md`    | walkthrough 結果（M11-1〜M11-4 の PASS/FAIL を記録）           | 人手（テスト実施者）               | Phase 11 実施後     |
| `outputs/phase-11/manual-test-report.md`    | walkthrough 所見（人手確認で気付いた問題・コメント）           | 人手（テスト実施者）               | Phase 11 実施後     |
| `outputs/phase-11/ai-ux-evaluation.md`      | AI UX 評価レポート（層3 の Claude API 評価結果・改善提案）     | `evaluate-ui-ux.js` スクリプト     | Phase 11 自動実行後 |
| `outputs/phase-11/screenshots/`             | スクリーンショット保存先（層2 の Visual 比較ベースライン含む） | `evaluate-ui-ux-playwright-e2e.ts` | Phase 11 自動実行後 |
| `unassigned-task/ui-ux-issue-*.md`          | HIGH 問題の未タスク化（フィードバックループの出力）            | `evaluate-ui-ux.js` スクリプト     | Phase 11 自動実行後 |

---

## 実行手順

### ステップ 1: Playwright `_electron` テスト仕様

**対象ファイル**: `apps/desktop/tests/e2e/phase11-semantic-layer.test.ts`

#### 1-1. ElectronアプリをPlaywrightで起動する設定仕様

```typescript
// apps/desktop/tests/e2e/phase11-semantic-layer.test.ts
// Playwright _electron 統合設定
import { test, expect, _electron as electron } from "@playwright/test";
import type { ElectronApplication, Page } from "@playwright/test";
import * as path from "path";

// Electron アプリの起動設定
// apps/desktop/dist/main.js を起点に起動
// NODE_ENV=test / ELECTRON_IS_TEST=1 環境変数を付与
async function launchElectronApp(): Promise<ElectronApplication> {
  const appPath = path.join(__dirname, "../../../apps/desktop");
  return await electron.launch({
    args: [path.join(appPath, "dist/main.js")],
    env: {
      ...process.env,
      NODE_ENV: "test",
      ELECTRON_IS_TEST: "1",
    },
  });
}
```

#### 1-2. ARIAロール・ラベル・tabindexの検証項目

| テストID | 検証項目                   | 期待値                                         | Playwright API                                          |
| -------- | -------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| SEM-001  | `[role="checkbox"]` の存在 | 全 option 要素に付与（count > 0）              | `page.locator('[role="checkbox"]').count()`             |
| SEM-002  | `aria-label` の非空文字    | 空文字なし（全要素でラベル確認）               | `page.evaluate()` + `getAttribute('aria-label')`        |
| SEM-003  | `tabindex` の適切な設定    | インタラクティブ要素の tabIndex が 0 または -1 | `page.evaluate()` + `HTMLElement.tabIndex`              |
| SEM-004  | キーボードフォーカス移動   | Tab キーで全インタラクティブ要素を巡回可能     | `page.keyboard.press('Tab')` + `document.activeElement` |
| SEM-005  | アクセシビリティツリー構造 | `page.accessibility.snapshot()` が null でない | `page.accessibility.snapshot()`                         |
| SEM-006  | `aria-checked` の状態反映  | チェックボックス選択後に `aria-checked="true"` | `page.locator('[aria-checked="true"]').count()`         |

#### 1-3. テストスイート構造仕様

```typescript
test.describe("TASK-RT-05 multi_select Phase 11: 層1 Semantic 確認", () => {
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

  // SEM-001: role="checkbox" の存在検証
  test('SEM-001: multi_select の各オプションに role="checkbox" が付与されている', async () => {
    // Red: 実装前は count === 0 またはエラーとなることを確認
    const checkboxCount = await page.locator('[role="checkbox"]').count();
    expect(checkboxCount).toBeGreaterThan(0);
  });

  // SEM-002: aria-label の非空検証
  test("SEM-002: インタラクティブ要素に意味のある aria-label が付与されている", async () => {
    const ariaLabels = await page.evaluate(() => {
      const elements = document.querySelectorAll("[aria-label]");
      return Array.from(elements).map((el) => el.getAttribute("aria-label"));
    });
    // 空文字・null が含まれていないことを確認
    ariaLabels.forEach((label) => {
      expect(label).toBeTruthy();
      expect(label!.length).toBeGreaterThan(0);
    });
  });

  // SEM-003: tabindex 検証
  test("SEM-003: インタラクティブ要素の tabIndex が 0 または -1 に設定されている", async () => {
    const tabIndexElements = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        'button, input, [tabindex], [role="checkbox"]',
      );
      return Array.from(elements).map((el) => ({
        tag: el.tagName,
        tabIndex: (el as HTMLElement).tabIndex,
      }));
    });
    tabIndexElements.forEach((el) => {
      expect([-1, 0]).toContain(el.tabIndex);
    });
  });

  // SEM-004: キーボードフォーカス移動
  test("SEM-004: Tab キーでフォーカスが正しく移動する", async () => {
    await page.keyboard.press("Tab");
    const focusedTag = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(focusedTag).toBeDefined();
    expect(["BUTTON", "INPUT", "DIV"]).toContain(focusedTag);
  });

  // SEM-005: アクセシビリティツリー
  test("SEM-005: アクセシビリティツリー構造が取得できる", async () => {
    const snapshot = await page.accessibility.snapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot?.children?.length).toBeGreaterThan(0);
  });
});
```

---

### ステップ 2: Visual regression テスト仕様

#### 2-1. CON-1 対処: `toHaveScreenshot()` 初回ベースライン生成手順

**Phase 3 CONDITIONAL 項目 CON-1 の対処**として、以下の手順を明記する。

```bash
# 初回実行: ベースライン画像を生成する（--update-snapshots フラグ必須）
npx playwright test apps/desktop/tests/e2e/phase11-semantic-layer.test.ts \
  --config=.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts \
  --update-snapshots

# 2回目以降: ベースラインと比較する（通常実行）
npx playwright test apps/desktop/tests/e2e/phase11-semantic-layer.test.ts \
  --config=.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts
```

**注意**: ベースライン画像は `outputs/phase-11/screenshots/` に保存される。ベースライン画像が存在しない状態で `--update-snapshots` なしに実行するとテストが失敗する。初回は必ず `--update-snapshots` を付けること。

#### 2-2. スナップショット保存先とファイル命名規則

| 分類             | 命名パターン                 | 保存先                          | 例                                 |
| ---------------- | ---------------------------- | ------------------------------- | ---------------------------------- |
| M11-1 表示確認   | `M11-1-{状態名}.png`         | `outputs/phase-11/screenshots/` | `M11-1-multi-select-display.png`   |
| M11-2 選択状態   | `M11-2-{状態名}.png`         | `outputs/phase-11/screenshots/` | `M11-2-checkbox-selected.png`      |
| M11-3 切り替え後 | `M11-3-{状態名}.png`         | `outputs/phase-11/screenshots/` | `M11-3-kind-switched.png`          |
| M11-4 各 kind    | `M11-4-kind-{kind名}.png`    | `outputs/phase-11/screenshots/` | `M11-4-kind-single_select.png`     |
| 汎用 Visual      | `TC-VIS-{連番}-{状態名}.png` | `outputs/phase-11/screenshots/` | `TC-VIS-001-checkbox-selected.png` |

#### 2-3. Visual regression テストケース仕様

| テストID | シナリオ                  | `toHaveScreenshot()` 引数          | 許容差              |
| -------- | ------------------------- | ---------------------------------- | ------------------- |
| VIS-001  | M11-1: multi_select 表示  | `'M11-1-multi-select-display.png'` | `maxDiffPixels: 50` |
| VIS-002  | M11-2: 2件選択後          | `'M11-2-checkbox-selected.png'`    | `maxDiffPixels: 50` |
| VIS-003  | M11-3: kind 切り替え後    | `'M11-3-kind-switched.png'`        | `maxDiffPixels: 50` |
| VIS-004  | M11-4: single_select 表示 | `'M11-4-kind-single_select.png'`   | `maxDiffPixels: 50` |
| VIS-005  | M11-4: free_text 表示     | `'M11-4-kind-free_text.png'`       | `maxDiffPixels: 50` |
| VIS-006  | M11-4: secret 表示        | `'M11-4-kind-secret.png'`          | `maxDiffPixels: 50` |
| VIS-007  | M11-4: confirm 表示       | `'M11-4-kind-confirm.png'`         | `maxDiffPixels: 50` |

```typescript
test.describe("TASK-RT-05 multi_select Phase 11: 層2 Visual 確認", () => {
  // VIS-001: M11-1 multi_select 表示
  test("VIS-001: multi_select 表示がベースラインと一致する", async ({
    page,
  }) => {
    await expect(page).toHaveScreenshot("M11-1-multi-select-display.png", {
      maxDiffPixels: 50,
      animations: "disabled",
    });
  });

  // VIS-002: M11-2 2件選択後
  test("VIS-002: 2件選択後の状態がベースラインと一致する", async ({ page }) => {
    const checkboxes = await page.locator('[role="checkbox"]').all();
    await checkboxes[0].click();
    await checkboxes[1].click();
    await expect(page).toHaveScreenshot("M11-2-checkbox-selected.png", {
      maxDiffPixels: 50,
      animations: "disabled",
    });
  });
});
```

---

### ステップ 3: AI UX評価スクリプト単体テスト仕様

**対象ファイル**: `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js` のモックテスト

#### 3-1. モックテスト設計

```typescript
// .claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";

// Anthropic SDK をモック
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}));

// fs モジュールをモック
vi.mock("fs");
```

#### 3-2. Claude APIレスポンス処理のテスト

| テストID | テスト内容                           | モック設定                           | 期待値                                   |
| -------- | ------------------------------------ | ------------------------------------ | ---------------------------------------- |
| API-001  | 正常なJSONレスポンスのパース         | Claude API が正常な JSON を返す      | `UXEvaluationResult` オブジェクトが返る  |
| API-002  | コードブロック付きJSONのパース       | ` ```json ... ``` ` 形式のレスポンス | コードブロック除去後に正常パース         |
| API-003  | APIエラー時の例外処理                | `messages.create()` が例外を投げる   | エラーがそのまま伝播する                 |
| API-004  | 不正JSONレスポンスの処理             | `content[0].type !== 'text'`         | `Error('Unexpected response type')`      |
| API-005  | スクリーンショット base64 エンコード | 有効な PNG ファイル                  | base64 文字列が返る（先頭がPNGヘッダー） |

````typescript
describe("evaluateUIWithClaude", () => {
  // API-001: 正常レスポンスのパース
  it("API-001: 正常な JSON レスポンスを UXEvaluationResult にパースできる", async () => {
    const mockResponse = {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            usabilityIssues: [
              { id: "UX-001", description: "test", severity: "HIGH" },
            ],
            accessibilityConcerns: [],
            improvements: [],
          }),
        },
      ],
    };
    // モック設定後に evaluateUIWithClaude を呼び出し
    // Red: 実装前は関数が存在しないのでエラー
    const result = await evaluateUIWithClaude(["test.png"]);
    expect(result.usabilityIssues).toHaveLength(1);
    expect(result.usabilityIssues[0].severity).toBe("HIGH");
  });

  // API-002: コードブロック付きJSONのパース
  it("API-002: コードブロック付き JSON を正常にパースできる", async () => {
    const mockText =
      '```json\n{"usabilityIssues":[],"accessibilityConcerns":[],"improvements":[]}\n```';
    // コードブロック除去ロジックの動作確認
    const cleaned = mockText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    expect(parsed.usabilityIssues).toEqual([]);
  });
});
````

#### 3-3. `saveEvaluationReport()` のテスト

| テストID | テスト内容                         | 期待値                                              |
| -------- | ---------------------------------- | --------------------------------------------------- |
| SAVE-001 | Markdown ファイルが生成される      | `fs.writeFileSync` が呼ばれる                       |
| SAVE-002 | 出力ディレクトリが自動作成される   | `fs.mkdirSync` が `{ recursive: true }` で呼ばれる  |
| SAVE-003 | usabilityIssues テーブルが含まれる | 生成 Markdown に `## ユーザビリティ問題` が含まれる |
| SAVE-004 | タスク ID がレポートに含まれる     | 引数の `taskId` がレポート内に含まれる              |

#### 3-4. `generateUnassignedTasks()` のテスト

| テストID | テスト内容                                     | 期待値                                       |
| -------- | ---------------------------------------------- | -------------------------------------------- |
| TASK-001 | HIGH 問題のみ unassigned-task が生成される     | HIGH × 2 件の場合、ファイルが 2 件生成される |
| TASK-002 | MEDIUM/LOW 問題は unassigned-task を生成しない | MEDIUM × 1 件の場合、ファイルが 0 件         |
| TASK-003 | ファイル命名が命名規則に従う                   | `ui-ux-issue-YYYYMMDD-001.md` 形式           |
| TASK-004 | 問題 0 件の場合は空配列を返す                  | `generatedFiles = []`                        |

---

### ステップ 4: フィードバックループのテスト仕様

#### 4-1. unassigned-task ファイル生成の検証

```typescript
describe("generateUnassignedTasks", () => {
  // TASK-001: HIGH 問題のファイル生成
  it("TASK-001: HIGH 重要度の usabilityIssues から unassigned-task が生成される", async () => {
    const mockResult: UXEvaluationResult = {
      usabilityIssues: [
        { id: "UX-001", description: "ボタンが小さすぎる", severity: "HIGH" },
        { id: "UX-002", description: "色コントラスト不足", severity: "HIGH" },
      ],
      accessibilityConcerns: [],
      improvements: [],
    };

    const files = await generateUnassignedTasks(
      mockResult,
      "/tmp/unassigned",
      "TASK-TEST-001",
    );
    // Red: 実装前はエラー
    expect(files).toHaveLength(2);
    expect(files[0]).toMatch(/ui-ux-issue-\d{8}-001\.md$/);
  });

  // TASK-004: 問題 0 件の場合
  it("TASK-004: 問題 0 件の場合は空配列を返す", async () => {
    const emptyResult: UXEvaluationResult = {
      usabilityIssues: [],
      accessibilityConcerns: [],
      improvements: [],
    };
    const files = await generateUnassignedTasks(
      emptyResult,
      "/tmp/unassigned",
      "TASK-TEST-001",
    );
    expect(files).toHaveLength(0);
  });
});
```

#### 4-2. `ai-ux-evaluation.md` 出力形式の検証

出力されるMarkdownが以下のセクションを含むことを検証する:

| 検証項目                     | 期待する文字列            |
| ---------------------------- | ------------------------- |
| 評価メタ情報テーブル         | `## 評価メタ情報`         |
| ユーザビリティ問題テーブル   | `## ユーザビリティ問題`   |
| アクセシビリティ懸念テーブル | `## アクセシビリティ懸念` |
| 改善提案テーブル             | `## 改善提案`             |
| 次ステップセクション         | `## 次ステップ`           |
| タスク ID の記載             | 引数で渡した `taskId`     |
| 日時の記載                   | `YYYY-MM-DD` 形式         |

---

### ステップ 5: TASK-RT-05 M11-1〜M11-4 の 3 層評価テスト化仕様

M11-1〜M11-4 を 3 層評価（Semantic/Visual/AI UX）でテスト化する仕様。Phase 5 実装時の参照テーブルとして機能する。

| シナリオ | 層           | テストID     | 検証内容                               | 自動化方法                                            |
| -------- | ------------ | ------------ | -------------------------------------- | ----------------------------------------------------- |
| M11-1    | 層1 Semantic | SEM-001      | `role="checkbox"` が全 option に付与   | `page.locator('[role="checkbox"]').count()`           |
| M11-1    | 層1 Semantic | SEM-002      | `aria-label` が非空文字                | `page.evaluate()`                                     |
| M11-1    | 層2 Visual   | VIS-001      | 表示がベースラインと一致               | `toHaveScreenshot('M11-1-...')`                       |
| M11-1    | 層3 AI UX    | AI-001       | HIGH 問題なし（スクリプト実行）        | `evaluate-ui-ux.js`                                   |
| M11-2    | 層1 Semantic | SEM-006      | 選択後 `aria-checked="true"` 付与      | `page.locator('[aria-checked="true"]').count()`       |
| M11-2    | 層2 Visual   | VIS-002      | 選択状態がベースラインと一致           | `toHaveScreenshot('M11-2-...')`                       |
| M11-2    | 層2 Visual   | PAY-001      | `selectedOptionIds` payload の型検証   | `window.__lastSubmitPayload__`                        |
| M11-3    | 層1 Semantic | SEM-007      | 切り替え後 `aria-checked` が全て false | `page.locator('[aria-checked="true"]').count() === 0` |
| M11-3    | 層2 Visual   | VIS-003      | 切り替え後がベースラインと一致         | `toHaveScreenshot('M11-3-...')`                       |
| M11-4    | 層2 Visual   | VIS-004〜007 | 各 kind の表示がベースラインと一致     | `toHaveScreenshot('M11-4-kind-{kind}')`               |

---

## 統合テスト連携

| 連携先          | 連携内容                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 5 実装    | 本 Phase のテスト仕様（SEM-001〜007、VIS-001〜007、API-001〜005、SAVE-001〜004、TASK-001〜004）を参照して実装を進める。全テストをグリーンにすることが Phase 5 の完了条件 |
| Phase 6 拡充    | 層1/層2 の fail ケース（ARIA 欠落・視覚回帰）を Phase 6 で edge case テストに追加する                                                                                    |
| Phase 12 docs   | `outputs/phase-11/ai-ux-evaluation.md` を Phase 12 ドキュメントに組み込む                                                                                                |
| unassigned-task | HIGH 問題検出時は `generateUnassignedTasks()` で自動生成し、Phase 12 台帳に登録する                                                                                      |

---

## 成果物テーブル

| 成果物名                       | パス                                                                                                 | 説明                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| テスト作成仕様書（本ファイル） | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-4-test-creation.md`              | Phase 4 成果物                             |
| テスト仕様書                   | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-4/test-specification.md` | テストID・検証内容・期待値の一覧           |
| Red テスト結果                 | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-4/red-test-result.md`    | 実装前のテスト失敗ログ（TDD Red フェーズ） |

---

## 完了条件チェックリスト

- [ ] CON-1 対処: `toHaveScreenshot()` 初回ベースライン生成手順（`--update-snapshots`）が仕様書に明記されている
- [ ] CON-2 対処: 成果物の役割分担テーブル（`manual-test-*.md` vs `ai-ux-evaluation.md`）が明記されている
- [ ] ステップ 1: Playwright `_electron` テスト仕様（SEM-001〜007）が定義されている
- [ ] ステップ 1: `electron.launch()` 設定（`NODE_ENV=test`、`ELECTRON_IS_TEST=1`）が仕様書に記載されている
- [ ] ステップ 2: Visual regression テストケース（VIS-001〜007）が定義されている
- [ ] ステップ 2: スナップショット保存先とファイル命名規則が定義されている
- [ ] ステップ 3: AI 評価スクリプトのモックテスト仕様（API-001〜005、SAVE-001〜004、TASK-001〜004）が定義されている
- [ ] ステップ 4: `generateUnassignedTasks()` のテスト仕様が定義されている
- [ ] ステップ 4: `ai-ux-evaluation.md` 出力形式の検証項目が定義されている
- [ ] ステップ 5: M11-1〜M11-4 の 3 層評価テスト化仕様テーブルが定義されている
- [ ] Phase 5 実装時の参照テスト一覧が「統合テスト連携」セクションに記載されている
- [ ] **本Phase内の全タスクを100%実行完了**
