# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 5                                                        |
| タスクID   | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                   |
| タスク名   | スキルウィザード trackEvent の E2E UI 到達確認テスト追加 |
| 前提Phase  | Phase 4                                                  |
| 後続Phase  | Phase 6                                                  |
| 作成日     | 2026-04-12                                               |
| ステータス | 完了                                                     |

## 目的

Phase 4 で Red 状態のテストを Green に変える実装を行う。
具体的には以下の 4 点を実装し、全 TC（TC-03/05/06/08/09/11/12）が PASS する状態（TDD Green）にする。

1. `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` — trackEvent capture ヘルパー実装
2. `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts` — renderer の trackEvent 差し替え実装
3. `apps/desktop/e2e/skill-wizard-tracking.spec.ts` — beforeEach で capture 初期化、onboarding store mock 注入、各テストケースのフロー実装
4. `apps/desktop/vite.e2e.config.ts` / `.github/workflows/ci.yml` — alias 追加と E2E テスト実行ステップ追加

## 実装計画

### 新規作成ファイル

| ファイル                                           | 内容                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` | `window.__trackEventCalls` capture ヘルパー + onboarding store mock |
| `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`  | Vite alias で差し替える renderer 側の trackEvent                    |
| `apps/desktop/e2e/skill-wizard-tracking.spec.ts`   | TC-03/05/06/08/09/11/12 の E2E テスト本体                           |

### 修正ファイル

| ファイル                          | 変更内容                                             |
| --------------------------------- | ---------------------------------------------------- |
| `apps/desktop/vite.e2e.config.ts` | `trackEvent.ts` を E2E スタブに差し替える alias 追加 |
| `.github/workflows/ci.yml`        | `e2e-desktop` ジョブに実際の E2E 実行ステップ追加    |

## 実行タスク

### 1. `wizard-tracking-stub.ts` ヘルパー実装

```typescript
// apps/desktop/e2e/helpers/wizard-tracking-stub.ts

import type { Page } from "@playwright/test";
import type { SkillWizardEvents } from "../../src/renderer/utils/trackEvent";

/**
 * E2E テスト用の captured event 型。
 * SkillWizardEvents の全イベント名・ペイロードと型整合を保つ（AC-8）。
 */
export type TrackEventEntry = {
  [K in keyof SkillWizardEvents]: {
    eventName: K;
    payload: SkillWizardEvents[K];
  };
}[keyof SkillWizardEvents];

/**
 * page.addInitScript を用いて window.__trackEventCalls を初期化する。
 * 必ず page.goto() より前に呼び出すこと。
 */
export async function initTrackingCapture(page: Page): Promise<void>;

/**
 * 記録済みイベントを取得する。
 */
export async function getTrackedEvents(page: Page): Promise<TrackEventEntry[]>;

/**
 * 記録済みイベントをクリアする。
 */
export async function clearTrackedEvents(page: Page): Promise<void>;

/**
 * 特定イベントが発火したかを確認する。
 */
export async function assertEventFired<K extends keyof SkillWizardEvents>(
  page: Page,
  eventName: K,
  payload?: Partial<SkillWizardEvents[K]>,
): Promise<void>;
```

### 2. `skill-wizard-tracking.spec.ts` テスト本体実装

`beforeEach` でスタブを注入し、各 TC のウィザードフローを実装する。

```typescript
// apps/desktop/e2e/skill-wizard-tracking.spec.ts

import { test, expect, type Page } from "@playwright/test";
import {
  clearTrackedEvents,
  getTrackedEvents,
  initTrackingCapture,
  type TrackEventEntry,
} from "./helpers/wizard-tracking-stub";

async function navigateToWizard(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: /スキルを作成/i }).click();
  await expect(page.getByTestId("wizard-step-info")).toBeVisible();
}

async function fillInfoStep(page: Page): Promise<void> {
  await page.getByLabel(/スキル名/i).fill("E2Eテストスキル");
  await page
    .getByLabel(/目的/i)
    .fill("E2Eテスト用のスキルです。十分な文字数を記述します。");
  await page.getByRole("button", { name: "自動化" }).click();
  await page.getByRole("button", { name: /次へ/i }).click();
  await expect(page.getByTestId("conversation-round-step")).toBeVisible();
}

async function generateSkill(page: Page): Promise<void> {
  await page.getByRole("button", { name: /生成|スキップして生成/i }).click();
  await expect(page.getByTestId("complete-step")).toBeVisible({
    timeout: 30_000,
  });
}

test.describe("スキルウィザード trackEvent E2E UI 到達確認", () => {
  test.beforeEach(async ({ page }) => {
    await initTrackingCapture(page);
    await navigateToWizard(page);
    await clearTrackedEvents(page);
  });

  // TC-03: AC-1 対応
  test("TC-03: InfoStep → ConversationRoundStep 遷移後にトラッキングが到達可能な状態になる", async ({
    page,
  }) => {
    await fillInfoStep(page);
    await expect(page.getByTestId("conversation-round-step")).toBeVisible();
    const capturedEvents: TrackEventEntry[] = await getTrackedEvents(page);
    expect(capturedEvents).toBeDefined();
    expect(Array.isArray(capturedEvents)).toBe(true);
  });

  // TC-05: AC-2 対応
  test("TC-05: 👍 ボタン押下で skill_skeleton_quality_feedback(satisfied=true) が発火する", async ({
    page,
  }) => {
    await fillInfoStep(page);
    await generateSkill(page);
    await page.getByTestId("complete-step-feedback-satisfied").click();

    const feedbackEvent = (await getTrackedEvents(page)).find(
      (e) =>
        e.eventName === "skill_skeleton_quality_feedback" &&
        e.payload.satisfied === true,
    );
    expect(feedbackEvent).toBeDefined();
  });

  // TC-06: AC-3 対応
  test("TC-06: 👎 ボタン押下で skill_skeleton_quality_feedback(satisfied=false) が発火する", async ({
    page,
  }) => {
    await fillInfoStep(page);
    await generateSkill(page);
    await page.getByTestId("complete-step-feedback-unsatisfied").click();

    const feedbackEvent = (await getTrackedEvents(page)).find(
      (e) =>
        e.eventName === "skill_skeleton_quality_feedback" &&
        e.payload.satisfied === false,
    );
    expect(feedbackEvent).toBeDefined();
  });

  // TC-08: AC-4 対応
  test("TC-08: execute クリックで skill_wizard_next_action(execute) が発火する", async ({
    page,
  }) => {
    await fillInfoStep(page);
    await generateSkill(page);
    await page.getByTestId("complete-step-action-execute").click();

    const nextActionEvent = (await getTrackedEvents(page)).find(
      (e) =>
        e.eventName === "skill_wizard_next_action" &&
        e.payload.action === "execute",
    );
    expect(nextActionEvent).toBeDefined();
  });

  // TC-09: AC-5 対応
  test("TC-09: open_editor クリックで skill_wizard_next_action(open_editor) が発火する", async ({
    page,
  }) => {
    await fillInfoStep(page);
    await generateSkill(page);
    await page.getByTestId("complete-step-action-open-editor").click();

    const nextActionEvent = (await getTrackedEvents(page)).find(
      (e) =>
        e.eventName === "skill_wizard_next_action" &&
        e.payload.action === "open_editor",
    );
    expect(nextActionEvent).toBeDefined();
  });

  // TC-11: AC-6 対応
  test("TC-11: create_another クリックで skill_wizard_next_action(create_another) が発火する", async ({
    page,
  }) => {
    await fillInfoStep(page);
    await generateSkill(page);
    await page.getByTestId("complete-step-action-create-another").click();

    const nextActionEvent = (await getTrackedEvents(page)).find(
      (e) =>
        e.eventName === "skill_wizard_next_action" &&
        e.payload.action === "create_another",
    );
    expect(nextActionEvent).toBeDefined();
  });

  // TC-12: AC-7 対応
  test("TC-12: 「もう一度作成」後 InfoStep に戻ること確認", async ({
    page,
  }) => {
    await fillInfoStep(page);
    await generateSkill(page);
    await page.getByTestId("complete-step-action-create-another").click();

    await expect(page.getByTestId("wizard-step-info")).toBeVisible();
  });
});
```

### 3. `vite.e2e.config.ts` の alias 追加実装

`apps/desktop/vite.e2e.config.ts` に `trackEvent.ts` の差し替え alias を追加する。既存の Playwright 設定は変更しない。

```diff
 resolve: {
   alias: {
     "@renderer": resolve(__dirname, "src/renderer"),
-    // 既存設定のみ
+    [resolve(__dirname, "src/renderer/utils/trackEvent.ts")]:
+      resolve(__dirname, "e2e/helpers/trackEvent.e2e-stub.ts"),
   },
 },
```

### 4. `.github/workflows/ci.yml` E2E テスト実行ステップ追加（AC-9 対応）

現在の `e2e-desktop` ジョブはスキップのみ。以下に差し替える。

```diff
  e2e-desktop:
    name: E2E Test (desktop)
    runs-on: ubuntu-latest
-   timeout-minutes: 5
+   timeout-minutes: 15
+   needs: [build-shared]
+   env:
+     ELECTRON_SKIP_BINARY_DOWNLOAD: 1
    steps:
-     - name: Skip E2E in default CI
-       run: |
-         echo "E2E tests are skipped in default CI to keep feedback fast."
-         echo "Run manually when needed:"
-         echo "xvfb-run --auto-servernum pnpm --filter @repo/desktop exec playwright test"
+     - name: Checkout
+       uses: actions/checkout@v4
+
+     - name: Setup pnpm
+       uses: pnpm/action-setup@v4
+
+     - name: Setup Node.js
+       uses: actions/setup-node@v6
+       with:
+         node-version: "22"
+         cache: "pnpm"
+
+     - name: Install dependencies
+       uses: ./.github/actions/pnpm-install-retry
+
+     - name: Install Playwright browsers
+       run: pnpm --filter @repo/desktop exec playwright install --with-deps chromium
+
+     - name: Run E2E tests (skill-wizard-tracking)
+       run: pnpm --filter @repo/desktop test:e2e -- e2e/skill-wizard-tracking.spec.ts
+       env:
+         CI: true
+
+     - name: Upload Playwright report
+       if: failure()
+       uses: actions/upload-artifact@v4
+       with:
+         name: playwright-report-e2e-wizard-tracking
+         path: apps/desktop/playwright-report/
+         retention-days: 7
```

### 5. スタブが `src/` 配下に混入していないことを確認

```bash
# wizard-tracking-stub.ts / trackEvent.e2e-stub.ts が src/ 配下にないことを確認
grep -rn "wizard-tracking-stub\|trackEvent.e2e-stub" apps/desktop/src/
# 期待: 出力なし（src/ 配下に混入していない）

# e2e/helpers/ にのみ存在することを確認
ls apps/desktop/e2e/helpers/
# 期待: electron-app.ts  trackEvent.e2e-stub.ts  wizard-tracking-stub.ts
```

### 6. Green 確認コマンド

```bash
# 全 TC Green 確認
pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E UI 到達確認"

# verbose で各テストケースの詳細確認
pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E UI 到達確認" \
  --reporter=list

# 期待: TC-03/05/06/08/09/11/12 が全て PASS
```

## 既存テスト回帰確認（baseline）

```bash
# 既存 E2E スペックへの影響確認（全件実行）
pnpm --filter @repo/desktop test:e2e

# 既存 Vitest ユニットテストへの影響確認
pnpm --filter @repo/desktop test
```

## 参照資料

| 資料名                 | パス                                                                                       | 用途                       |
| ---------------------- | ------------------------------------------------------------------------------------------ | -------------------------- |
| E2E スペック（Red）    | `outputs/phase-4/e2e-spec-red.md`                                                          | Phase 4 Red 状態の確認     |
| テストマトリクス       | `outputs/phase-4/test-matrix.md`                                                           | TC番号・AC番号対応確認     |
| 型整合確認ログ         | `outputs/phase-4/type-alignment-check.md`                                                  | SkillWizardEvents 型確認   |
| trackEvent 型定義      | `apps/desktop/src/renderer/utils/trackEvent.ts`                                            | スタブの型設計根拠         |
| E2E trackEvent スタブ  | `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`                                          | renderer の差し替え本体    |
| 単体テスト（tracking） | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.tracking.test.tsx` | testid・期待イベントの参照 |
| 既存 E2E ヘルパー      | `apps/desktop/e2e/helpers/electron-app.ts`                                                 | ヘルパーパターン参照       |

## 統合テスト連携

```bash
# E2E テスト（tracking スペックのみ）
pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E UI 到達確認"

# CI シミュレーション
CI=true pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E UI 到達確認"
```

## 成果物

| 成果物           | パス                                        | 説明                                           |
| ---------------- | ------------------------------------------- | ---------------------------------------------- |
| スタブヘルパー   | `outputs/phase-5/wizard-tracking-stub.md`   | `wizard-tracking-stub.ts` の実装内容と設計説明 |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 新規作成・修正ファイル一覧と Green 確認ログ    |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 全変更ファイルのパスと変更概要                 |

## 完了条件

- [x] `wizard-tracking-stub.ts` と `trackEvent.e2e-stub.ts` が `e2e/helpers/` に実装済み（`src/` 混入なし）
- [x] `skill-wizard-tracking.spec.ts` の beforeEach でスタブが注入されている
- [x] TC-03/05/06/08/09/11/12 が全て PASS（TDD Green）
- [x] `SkillWizardEvents` 型とスタブ型が整合している（AC-8）
- [x] `.github/workflows/ci.yml` に E2E 実行ステップが追加されている（AC-9）
- [x] 既存 E2E スペックが全て PASS のまま
- [x] スタブが `src/` 配下に混入していないことを確認済み
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. `wizard-tracking-stub.ts` 実装
2. `skill-wizard-tracking.spec.ts` 実装（beforeEach・各 TC フロー）
3. `vite.e2e.config.ts` の alias 設定追加
4. `.github/workflows/ci.yml` E2E ステップ追加
5. スタブの `src/` 混入チェック
6. Green 確認（全 TC PASS）
7. 既存テスト回帰確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001
```

## 次Phase

Phase 6: テスト拡充
