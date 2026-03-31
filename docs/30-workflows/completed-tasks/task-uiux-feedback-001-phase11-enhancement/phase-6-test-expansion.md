# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 6                                     |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日 | 2026-03-31                            |
| 担当   | タスク仕様書作成エージェント          |

## 目的

fail path・エッジケース・アクセシビリティ回帰テストを追加し、3層評価（Semantic / Visual / AI UX）の堅牢性を高める。Phase 4で構築したテストスイートを拡充し、異常系・境界値・WCAG違反の早期検出を可能にする。

## 実行タスク

- Layer 1（Semantic）のエッジケーステスト追加
- Layer 2（Visual）の fail path テスト追加
- Layer 3（AI UX 評価）のエラーハンドリングテスト追加
- フィードバックループのエッジケーステスト追加
- アクセシビリティ回帰テスト（WCAG 基準）

## 参照資料

| 資料名                          | パス                                                                                      | 説明                             |
| ------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件定義                | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-1-requirements.md`    | 受入条件 AC-1〜AC-8              |
| Phase 2 設計書                  | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-2-design.md`          | Playwright・AI評価スクリプト仕様 |
| Phase 3 設計レビュー            | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-3-design-review.md`   | レビュー指摘・改善方針           |
| Playwright `_electron` API      | https://playwright.dev/docs/api/class-electron                                            | ElectronApp 統合 API             |
| Playwright `toHaveScreenshot()` | https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-2 | 視覚的回帰 API                   |
| WCAG 2.1 基準                   | https://www.w3.org/TR/WCAG21/                                                             | アクセシビリティ基準             |

---

## 実行手順

### ステップ 1: Semantic 層のエッジケーステスト

**対象ファイル**: `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts`

#### 1-1. ARIA ラベルが欠如している場合の検出

`aria-label` または `aria-labelledby` を持たないインタラクティブ要素を検出し、テスト失敗として記録する。

```typescript
test("Edge: ARIA ラベル欠如要素の検出", async ({ page }) => {
  // aria-label・aria-labelledby・aria-describedby が全て無い要素を探す
  const unlabeledInteractives = await page.evaluate(() => {
    const selectors =
      'button, input, [role="checkbox"], [role="listbox"], [role="option"]';
    const elements = document.querySelectorAll(selectors);
    return Array.from(elements)
      .filter(
        (el) =>
          !el.getAttribute("aria-label") &&
          !el.getAttribute("aria-labelledby") &&
          !el.getAttribute("aria-describedby") &&
          !(el as HTMLElement).innerText?.trim(),
      )
      .map((el) => ({
        tag: el.tagName,
        role: el.getAttribute("role"),
        id: el.id,
      }));
  });

  // 検出した場合はレポートに記録し、0件であることをアサート
  if (unlabeledInteractives.length > 0) {
    console.warn(
      "[EDGE] ARIA ラベル欠如要素:",
      JSON.stringify(unlabeledInteractives, null, 2),
    );
  }
  expect(unlabeledInteractives).toHaveLength(0);
});
```

**期待動作**: 欠如要素が 0 件であること。検出した場合は `outputs/phase-6/edge-case-result.md` に記録する。

#### 1-2. フォーカストラップ（focus trap）ケースの検出

モーダル・ダイアログが存在する場合、フォーカスがモーダル外に抜け出せないことを確認する。また、意図せずフォーカスが閉じ込められていないかを検証する。

```typescript
test("Edge: フォーカストラップの検出", async ({ page }) => {
  // 連続 Tab で到達できないインタラクティブ要素を検出
  const maxTabCount = 50;
  const reachedElements: string[] = [];

  for (let i = 0; i < maxTabCount; i++) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el
        ? `${el.tagName}#${el.id}[role=${el.getAttribute("role")}]`
        : "none";
    });
    if (reachedElements.includes(focused)) break; // ループ検出 = トラップ
    reachedElements.push(focused);
  }

  // body または html に戻ることなく同一要素に戻った場合はトラップ疑い
  const trapDetected = reachedElements.length < 3;
  expect(trapDetected).toBe(false);
});
```

#### 1-3. キーボードのみでのチェックボックス操作テスト

マウスを一切使わずに、Tab → Space でチェックボックスをオン/オフできることを検証する。

```typescript
test("Edge: キーボードのみでのチェックボックス操作", async ({ page }) => {
  // フォーカスを最初のチェックボックスに移動
  await page.keyboard.press("Tab");

  // チェックボックスにフォーカスが当たるまで Tab を押す（最大 20 回）
  for (let i = 0; i < 20; i++) {
    const role = await page.evaluate(() =>
      document.activeElement?.getAttribute("role"),
    );
    if (role === "checkbox") break;
    await page.keyboard.press("Tab");
  }

  // Space で ON
  await page.keyboard.press("Space");
  const checkedAfterSpace = await page.evaluate(() =>
    document.activeElement?.getAttribute("aria-checked"),
  );
  expect(checkedAfterSpace).toBe("true");

  // Space で OFF
  await page.keyboard.press("Space");
  const checkedAfterUnspace = await page.evaluate(() =>
    document.activeElement?.getAttribute("aria-checked"),
  );
  expect(checkedAfterUnspace).toBe("false");
});
```

---

### ステップ 2: Visual 層の fail path テスト

**対象ファイル**: `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts`

#### 2-1. スナップショット差分が閾値を超えた場合の扱い

`threshold: 0.1`（ピクセル差率 10%）を超えた場合にテストが FAIL し、差分情報がレポートに記録されることを確認する。

```typescript
test("Visual fail path: 差分閾値超過の検出", async ({ page }) => {
  // threshold: 0.1 = 全ピクセルの10%以上が異なれば FAIL
  await expect(page).toHaveScreenshot("visual-regression-check.png", {
    threshold: 0.1,
    maxDiffPixels: 100,
    animations: "disabled",
  });
});
```

**運用方針**:

- 初回実行時はベースライン画像を生成する（`--update-snapshots` フラグ）
- 差分が閾値超過の場合は `outputs/phase-6/edge-case-result.md` に差分率を記録する
- CI 環境では差分 PNG を artifacts として保存する

#### 2-2. `toHaveScreenshot({ threshold: 0.1 })` の設定

`evaluate-ui-ux-playwright.config.ts` に閾値設定を追加する。

```typescript
// evaluate-ui-ux-playwright.config.ts への追加
export default defineConfig({
  // ... 既存設定 ...
  expect: {
    toHaveScreenshot: {
      threshold: 0.1, // ピクセル差率の許容上限（10%）
      maxDiffPixels: 100, // 絶対ピクセル数の許容上限
      animations: "disabled",
    },
  },
});
```

#### 2-3. ダークモード / ライトモードそれぞれのスナップショット

```typescript
test.describe("Visual: カラーモード別スナップショット", () => {
  test("ライトモードのスナップショット", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page).toHaveScreenshot("multi-select-light.png", {
      threshold: 0.1,
      animations: "disabled",
    });
  });

  test("ダークモードのスナップショット", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page).toHaveScreenshot("multi-select-dark.png", {
      threshold: 0.1,
      animations: "disabled",
    });
  });
});
```

---

### ステップ 3: AI UX 評価のエラーハンドリングテスト

**対象ファイル**: `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`

#### 3-1. Claude API がタイムアウトした場合（フォールバック処理）

API コール時にタイムアウトが発生した場合、空の評価結果を返しつつ、エラーログを記録するフォールバック処理を検証する。

```typescript
test("Error: Claude API タイムアウト時のフォールバック", async () => {
  // AbortController でタイムアウトをシミュレート
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 100); // 100ms でタイムアウト

  const fallbackResult = await evaluateUIWithClaude(
    ["outputs/phase-11/screenshots/M11-1-multi-select-display.png"],
    "test-context",
    { signal: controller.signal },
  ).catch((err) => {
    // タイムアウト時は空の評価結果を返す（フォールバック）
    if (err.name === "AbortError") {
      return {
        usabilityIssues: [],
        accessibilityConcerns: [],
        improvements: [],
        _fallback: true,
        _reason: "timeout",
      };
    }
    throw err;
  });

  expect(fallbackResult).toHaveProperty("_fallback", true);
  expect(fallbackResult.usabilityIssues).toHaveLength(0);
});
```

**フォールバック仕様**:

- タイムアウト時は空の `UXEvaluationResult` を返す
- `_fallback: true` フラグを付与して後続処理が識別できるようにする
- エラーログに `[FALLBACK] Claude API timeout` を記録する
- unassigned-task 生成はスキップする（空配列を返す）

#### 3-2. 評価結果が空の場合の処理

Claude API が空文字またはパース不能なレスポンスを返した場合、例外を投げずにデフォルト値を返すことを検証する。

```typescript
test("Error: 空レスポンス時のデフォルト値返却", async () => {
  // 空レスポンスのモック
  const emptyResponse = "";
  const result = parseEvaluationResponse(emptyResponse);

  // デフォルト値（空配列）が返ること
  expect(result).toEqual({
    usabilityIssues: [],
    accessibilityConcerns: [],
    improvements: [],
  });
});

test("Error: 不正な JSON レスポンス時のデフォルト値返却", async () => {
  const invalidJson = "これはJSONではありません";
  const result = parseEvaluationResponse(invalidJson);

  expect(result).toEqual({
    usabilityIssues: [],
    accessibilityConcerns: [],
    improvements: [],
  });
});
```

#### 3-3. unassigned-task 生成の冪等性（重複生成しない）

同一の評価結果に対して `generateUnassignedTasks()` を 2 回呼び出した場合に、ファイルが重複生成されないことを検証する。

```typescript
test("Idempotency: unassigned-task の重複生成防止", async () => {
  const mockResult: UXEvaluationResult = {
    usabilityIssues: [
      { id: "UX-001", description: "テスト問題", severity: "HIGH" },
    ],
    accessibilityConcerns: [],
    improvements: [],
  };
  const outputDir = "outputs/phase-6/idempotency-test";
  const taskId = "TASK-UIUX-FEEDBACK-001";

  // 1回目の生成
  const firstRun = await generateUnassignedTasks(mockResult, outputDir, taskId);
  // 2回目の生成（同一引数）
  const secondRun = await generateUnassignedTasks(
    mockResult,
    outputDir,
    taskId,
  );

  // 生成ファイル数は同じ（上書きのみ、追加生成なし）
  expect(firstRun.length).toBe(secondRun.length);

  // ファイル内容が同一（タイムスタンプ以外）
  const firstContent = fs.readFileSync(firstRun[0], "utf-8");
  const secondContent = fs.readFileSync(secondRun[0], "utf-8");
  expect(firstContent).toBe(secondContent);

  // クリーンアップ
  fs.rmSync(outputDir, { recursive: true, force: true });
});
```

**冪等性の実装要件**:

- ファイル名は `ui-ux-issue-{{YYYYMMDD}}-{{連番}}` 形式（日付が同じなら同じファイル名）
- 既存ファイルが存在する場合は上書きする（`fs.writeFileSync` はデフォルトで上書き）
- 新規ファイルが増殖しないことが条件

---

### ステップ 4: フィードバックループの回帰テスト

#### 4-1. 改善前後の評価結果が正しく比較されることの検証

前回評価で HIGH として記録された問題が、改善後の次回評価で PASS（問題なし）になることを確認する。

```typescript
test("Regression: 改善済み問題が次回評価で反映される", async () => {
  // 前回評価のモック（ARIA ラベル欠如が HIGH で記録されている）
  const previousEvalPath = "outputs/phase-11/ai-ux-evaluation.md";
  const previousIssueId = "A11Y-001";

  // 現在の評価結果（ARIA ラベルが修正済み = アクセシビリティ懸念なし）
  const currentResult: UXEvaluationResult = {
    usabilityIssues: [],
    accessibilityConcerns: [], // 前回 HIGH だった問題が解消
    improvements: [],
  };

  // 前回評価ファイルを読み込み、解消済み問題を照合
  const resolvedIssues = await compareWithPreviousEvaluation(
    previousEvalPath,
    currentResult,
  );

  expect(resolvedIssues).toContain(previousIssueId);
});
```

#### 4-2. unassigned-task ファイルの形式検証

`generateUnassignedTasks()` が生成するファイルが必須フィールドを全て含むことを検証する。

```typescript
test("Format: unassigned-task ファイルの形式検証", async () => {
  const generatedPath = "outputs/phase-6/test-unassigned-task.md";
  const requiredSections = [
    "## メタ情報",
    "## 問題の説明",
    "## 受入条件",
    "## 参照",
    "| タスク ID",
    "| 発見元",
    "| 発見日",
    "| 重要度",
    "| 層",
  ];

  const content = fs.readFileSync(generatedPath, "utf-8");
  for (const section of requiredSections) {
    expect(content).toContain(section);
  }
});
```

---

## 統合テスト連携

| 連携先         | 連携内容                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------ |
| Phase 4 テスト | Phase 4 で作成した `evaluate-ui-ux-playwright-e2e.ts` にエッジケーステストを追記する形で拡充     |
| Phase 7 確認   | Phase 6 で追加したテストケースを Phase 7 のカバレッジマトリクスに反映し、AC カバー率を再集計する |
| Phase 11 実行  | 拡充したテストスイートを Phase 11 の 3 層評価として実行し、edge case の pass/fail を記録する     |
| Phase 12 docs  | `outputs/phase-6/edge-case-result.md` を Phase 12 ドキュメントに組み込み、回帰リスクを可視化する |

---

## 成果物

| 成果物名                       | パス                                                                                     | 説明                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------- |
| テスト拡充仕様書（本ファイル） | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-6-test-expansion.md` | Phase 6 成果物（本ファイル）           |
| エッジケーステスト結果         | `outputs/phase-6/edge-case-result.md`                                                    | エッジケーステストの実行結果・検出項目 |
| 拡充テストケース一覧           | `outputs/phase-6/expanded-test-cases.md`                                                 | 追加した全テストケースの一覧と対応層   |

---

## 完了条件チェックリスト

- [ ] Layer 1 Semantic のエッジケーステスト（ARIA 欠如・focus trap・キーボード操作）が追加されている
- [ ] Layer 2 Visual の fail path テスト（差分閾値超過・ダーク/ライトモード）が追加されている
- [ ] Layer 3 AI UX のエラーハンドリングテスト（タイムアウト・空レスポンス・冪等性）が追加されている
- [ ] フィードバックループの回帰テスト（改善反映確認・ファイル形式検証）が追加されている
- [ ] アクセシビリティ回帰テスト（WCAG 2.1 基準）が網羅されている
- [ ] `outputs/phase-6/edge-case-result.md` が生成されている
- [ ] `outputs/phase-6/expanded-test-cases.md` が生成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**
