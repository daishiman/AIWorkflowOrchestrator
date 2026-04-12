# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 4                                                        |
| タスクID   | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                   |
| タスク名   | スキルウィザード trackEvent の E2E UI 到達確認テスト追加 |
| 前提Phase  | Phase 3                                                  |
| 後続Phase  | Phase 5                                                  |
| 作成日     | 2026-04-12                                               |
| ステータス | 完了                                                     |

## 目的

TDD Red フェーズとして、`skill-wizard-tracking.spec.ts` に AC-1〜AC-7 に対応するE2Eテストを先に作成する。
ヘルパーファイル（`wizard-tracking-stub.ts`）は未実装の状態でテストを記述し、全件失敗（Red）することを確認する。
これにより Phase 5 の実装目標を明確化する。

## Private Method テスト方針

本タスクは Playwright E2E テストであり、ブラウザ経由で UI を操作する。
Renderer 内部の private/module-private な関数（例: `trackEvent` の内部実装）へは直接アクセスしない。
`page.addInitScript` で `window.__trackEventCalls` を初期化し、`trackEvent.e2e-stub.ts` が `window.__trackEventCalls` に記録した内容を検証する。**UI 操作（ボタンクリック・ステップ遷移）経由でイベント到達を確認する public API テスト**を採用する。

## 事前確認: 既存ユーティリティ重複検出

```bash
# trackEvent 関連の既存テスト・スタブの重複確認
grep -rn "trackEvent\|__trackEvent\|wizard-tracking-stub" \
  apps/desktop/e2e/ apps/desktop/src/renderer/

# E2E ディレクトリの現状確認
ls apps/desktop/e2e/
ls apps/desktop/e2e/helpers/
```

## テストマトリクス（TC番号 → テスト名対応表）

| TC番号 | AC番号 | テスト名（describe/it）                                                         | 対象 UI 操作                                               | 期待イベント                                            | TDD Red 状態 |
| ------ | ------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- | ------------ |
| TC-03  | AC-1   | `InfoStep → ConversationRoundStep 遷移後にトラッキングが到達可能な状態になる`   | 「次へ」ボタンクリック                                     | ステップ遷移の UI 到達確認                              | FAIL（Red）  |
| TC-05  | AC-2   | `👍 ボタン押下で skill_skeleton_quality_feedback(satisfied=true) が発火する`    | `complete-step-feedback-satisfied`                         | `skill_skeleton_quality_feedback { satisfied: true }`   | FAIL（Red）  |
| TC-06  | AC-3   | `👎 ボタン押下で skill_skeleton_quality_feedback(satisfied=false) が発火する`   | `complete-step-feedback-unsatisfied`                       | `skill_skeleton_quality_feedback { satisfied: false }`  | FAIL（Red）  |
| TC-08  | AC-4   | `execute クリックで skill_wizard_next_action(execute) が発火する`               | `complete-step-action-execute`                             | `skill_wizard_next_action { action: "execute" }`        | FAIL（Red）  |
| TC-09  | AC-5   | `open_editor クリックで skill_wizard_next_action(open_editor) が発火する`       | `complete-step-action-open-editor`                         | `skill_wizard_next_action { action: "open_editor" }`    | FAIL（Red）  |
| TC-11  | AC-6   | `create_another クリックで skill_wizard_next_action(create_another) が発火する` | `complete-step-action-create-another`                      | `skill_wizard_next_action { action: "create_another" }` | FAIL（Red）  |
| TC-12  | AC-7   | `「もう一度作成」後 InfoStep に戻ること確認`                                    | `complete-step-action-create-another` クリック後の画面遷移 | `wizard-step-info` が表示される                         | FAIL（Red）  |

## 実行タスク

### 0. 事前確認【必須】

```bash
# 既存のtrackEventスタブや重複実装がないか確認
grep -rn "__trackEvent\|trackEventStub\|wizard-tracking-stub" \
  apps/desktop/e2e/

# 既存 E2E スペックで trackEvent を扱っているものがないか確認
grep -rn "trackEvent\|skill_wizard" apps/desktop/e2e/
```

### 1. テストファイルのスケルトン作成

作成先: `apps/desktop/e2e/skill-wizard-tracking.spec.ts`

```typescript
/**
 * @file skill-wizard-tracking.spec.ts
 * @description スキルウィザード trackEvent の E2E UI 到達確認テスト（UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001）
 *
 * AC-1: InfoStep → ConversationRoundStep 遷移の E2E 確認（TC-03相当）
 * AC-2: 👍 ボタン → skill_skeleton_quality_feedback(satisfied=true) 発火確認（TC-05相当）
 * AC-3: 👎 ボタン → skill_skeleton_quality_feedback(satisfied=false) 発火確認（TC-06相当）
 * AC-4: execute クリック → skill_wizard_next_action(execute) 発火確認（TC-08相当）
 * AC-5: open_editor クリック → skill_wizard_next_action(open_editor) 発火確認（TC-09相当）
 * AC-6: create_another クリック → skill_wizard_next_action(create_another) 発火確認（TC-11相当）
 * AC-7: 「もう一度作成」後 InfoStep に戻ること確認（TC-12相当）
 */

import { test, expect, type Page } from "@playwright/test";
import {
  clearTrackedEvents,
  getTrackedEvents,
  initTrackingCapture,
  type TrackEventEntry,
} from "./helpers/wizard-tracking-stub";

// Phase 4（Red）: helpers/wizard-tracking-stub.ts は未実装のためインポート失敗を期待

async function navigateToWizard(page: Page): Promise<void> {
  // TODO Phase 5 で実装: ウィザード開始画面へのナビゲーション
  await page.goto("/");
  await page.getByRole("button", { name: /スキルを作成/i }).click();
}

async function fillInfoStep(page: Page): Promise<void> {
  // TODO Phase 5 で実装: InfoStep のフォーム入力
  await page.getByLabel(/スキル名/i).fill("E2Eテストスキル");
  await page
    .getByLabel(/目的/i)
    .fill("E2Eテスト用のスキルです。十分な文字数を記述します。");
  await page.getByRole("button", { name: "自動化" }).click();
  await page.getByRole("button", { name: /次へ/i }).click();
}

async function generateSkill(page: Page): Promise<void> {
  // TODO Phase 5 で実装: ConversationRoundStep で生成ボタン押下
  await page.getByRole("button", { name: /生成/i }).click();
}

test.describe("スキルウィザード trackEvent E2E UI 到達確認", () => {
  test.beforeEach(async ({ page }) => {
    // TODO Phase 5 で実装: wizard-tracking-stub.ts の capture 初期化
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
    // trackEvent スタブが注入済みで UI が到達できることを確認
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
    await expect(page.getByTestId("complete-step")).toBeVisible();

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
    await expect(page.getByTestId("complete-step")).toBeVisible();

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
    await expect(page.getByTestId("complete-step")).toBeVisible();

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
    await expect(page.getByTestId("complete-step")).toBeVisible();

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
    await expect(page.getByTestId("complete-step")).toBeVisible();

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
    await expect(page.getByTestId("complete-step")).toBeVisible();

    await page.getByTestId("complete-step-action-create-another").click();

    await expect(page.getByTestId("wizard-step-info")).toBeVisible();
  });
});
```

### 2. Red 確認コマンド（実装前に全件失敗することを確認）

```bash
# Phase 4 Red 確認（helpers/wizard-tracking-stub.ts 未実装のため全件失敗を期待）
pnpm --filter @repo/desktop test:e2e -- --grep "スキルウィザード trackEvent E2E UI 到達確認"

# 期待: インポートエラーまたは全テスト FAIL
# Error: Cannot find module './helpers/wizard-tracking-stub'
```

### 3. 型整合確認（AC-8 対応）

スタブの型が `trackEvent.ts` の `SkillWizardEvents` と整合していることを確認する。
Phase 4 時点では型定義のみ確認し、実装は Phase 5 で行う。

```bash
# 型定義の確認
cat apps/desktop/src/renderer/utils/trackEvent.ts
```

`SkillWizardEvents` の全イベント名・ペイロード型を確認し、`wizard-tracking-stub.ts` の設計に反映する。

## 参照資料

| 資料名                 | パス                                                                                       | 用途                               |
| ---------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------- |
| 単体テスト（tracking） | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.tracking.test.tsx` | TC番号・testid・期待イベントの参照 |
| trackEvent 型定義      | `apps/desktop/src/renderer/utils/trackEvent.ts`                                            | `SkillWizardEvents` 型定義確認     |
| 既存 E2E ヘルパー      | `apps/desktop/e2e/helpers/electron-app.ts`                                                 | E2E ヘルパーパターン参照           |
| Vite E2E 設定          | `apps/desktop/vite.e2e.config.ts`                                                          | E2E alias 設定確認                 |
| 既存 E2E スペック      | `apps/desktop/e2e/ipc-skill-import.spec.ts`                                                | E2E テストパターン参照             |

## 統合テスト連携

| 判定項目          | 基準                                             | 結果 |
| ----------------- | ------------------------------------------------ | ---- |
| Red 確認（全件）  | TC-03/05/06/08/09/11/12 が全て FAIL であること   | PASS |
| 型整合確認        | `SkillWizardEvents` の型と AC-8 の整合を確認済み | PASS |
| 既存 E2E への影響 | 既存 E2E スペックが PASS のまま                  | PASS |

## 成果物

| 成果物                    | パス                                      | 説明                                       |
| ------------------------- | ----------------------------------------- | ------------------------------------------ |
| E2E テストスペック（Red） | `outputs/phase-4/e2e-spec-red.md`         | Red 状態のテストスケルトンと失敗ログ       |
| テストマトリクス          | `outputs/phase-4/test-matrix.md`          | TC番号 → AC番号 → テスト名の対応表         |
| 型整合確認ログ            | `outputs/phase-4/type-alignment-check.md` | `SkillWizardEvents` と AC-8 の整合確認記録 |

## 完了条件

- [x] 事前確認: 既存の trackEvent スタブ・重複実装がないことを確認済み
- [x] private method テスト方針（E2E = public API 経由のみ）を明記済み
- [x] テストマトリクス（TC-03/05/06/08/09/11/12 の AC番号対応）が定義済み
- [x] `skill-wizard-tracking.spec.ts` のスケルトンが作成済み
- [x] Red 確認（`wizard-tracking-stub.ts` 未実装による全件失敗）を確認済み
- [x] `SkillWizardEvents` 型と AC-8 の型整合を確認済み
- [x] 既存 E2E テストへの悪影響なし
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 事前確認（重複・副作用チェック）
2. private method テスト方針の明記
3. テストマトリクス定義（TC-03/05/06/08/09/11/12）
4. `skill-wizard-tracking.spec.ts` スケルトン作成
5. Red 確認（全件 FAIL）
6. 型整合確認（AC-8）
7. 完了条件の判定

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

Phase 5: 実装
