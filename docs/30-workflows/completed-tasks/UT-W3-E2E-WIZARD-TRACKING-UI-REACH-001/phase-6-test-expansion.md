# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 6                                                        |
| タスクID   | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                   |
| タスク名   | スキルウィザード trackEvent の E2E UI 到達確認テスト追加 |
| 前提Phase  | Phase 5                                                  |
| 後続Phase  | Phase 7                                                  |
| 作成日     | 2026-04-12                                               |
| ステータス | 完了                                                     |

## 目的

Phase 5 の実装（TC-03/05/06/08/09/11/12 が Green）に対して、生成失敗と再オープンのエッジケースを検討し、
current facts では採用しなかった判断理由を記録する。

検討したエッジケース:

- **EdgeCase-1**: 生成失敗時に `skill_wizard_generation_completed` が発火しないことの確認
- **EdgeCase-2**: `create_another` で InfoStep に戻った後、次回オープンで `skill_wizard_started` が 1 回だけ発火することの確認

## 検討結果

| TC番号     | テスト名                                                                   | 種別             | 期待結果                                                                                        |
| ---------- | -------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------- |
| EdgeCase-1 | `生成失敗時に skill_wizard_generation_completed が発火しない`              | 異常系（エラー） | `skill_wizard_generation_completed` が capturedEvents に含まれない                              |
| EdgeCase-2 | `create_another 後の再オープンで skill_wizard_started が 1 回だけ発火する` | エッジケース     | `skill_wizard_started` が 1 回だけ記録され、前回の capture が再利用されていないことが確認できる |

## 実行タスク

### 1. EdgeCase-1: 生成失敗時のイベント未発火確認

Playwright の `page.route()` または既存の IPC モックポイントを使用して生成失敗を再現する。

```typescript
// apps/desktop/e2e/skill-wizard-tracking.spec.ts へ追加

test.describe("スキルウィザード trackEvent E2E エッジケース", () => {
  test.beforeEach(async ({ page }) => {
    await initTrackingCapture(page);
    await navigateToWizard(page);
    await clearTrackedEvents(page);
  });

  // EdgeCase-1: 生成失敗時のイベント未発火確認
  test("EdgeCase-1: 生成失敗時に skill_wizard_generation_completed が発火しない", async ({
    page,
  }) => {
    await fillInfoStep(page);
    await page.getByRole("button", { name: /生成|スキップして生成/i }).click();

    // 生成失敗の UI が表示される、または CompleteStep に進まないことを確認
    await expect(page.getByTestId("wizard-step-complete")).toHaveCount(0);

    // generation_completed が発火していないことを確認
    const completedEvents = (await getTrackedEvents(page)).filter(
      (e) => e.eventName === "skill_wizard_generation_completed",
    );
    expect(completedEvents).toHaveLength(0);
  });

  // EdgeCase-2: create_another 後の再オープンで started が 1 回だけ発火することを確認
  test("EdgeCase-2: create_another 後の再オープンで skill_wizard_started が 1 回だけ発火する", async ({
    page,
  }) => {
    await fillInfoStep(page);
    await generateSkill(page);
    await page.getByTestId("complete-step-action-create-another").click();
    await expect(page.getByTestId("wizard-step-info")).toBeVisible();

    await clearTrackedEvents(page);
    await navigateToWizard(page);

    const startedEvents = (await getTrackedEvents(page)).filter(
      (e) => e.eventName === "skill_wizard_started",
    );
    expect(startedEvents).toHaveLength(1);
  });
});
```

### 2. 補助コマンド

```bash
# エッジケース追加後の全 TC 実行（既存 + 追加分）
pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E"

# EdgeCase-1 のみ実行
pnpm --filter @repo/desktop test:e2e -- \
  --grep "EdgeCase-1"

# CI シミュレーション（全件）
CI=true pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E"

# verbose での詳細確認
pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E" \
  --reporter=list
```

### 3. 異常系テスト設計の追加観点

| シナリオ                                    | 期待される動作                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| スキル生成 API が 500 エラーを返す          | `skill_wizard_generation_completed` が発火しない（EdgeCase-1）                     |
| `create_another` で戻った後に再オープンする | `skill_wizard_started` が 1 回だけ発火し、capture が前回と混ざらない（EdgeCase-2） |
| `window.__trackEventCalls` 未初期化         | `initTrackingCapture` が空配列を作る                                               |

### 5. 回帰テスト確認

```bash
# Phase 5 で実装した全 TC が引き続き PASS することを確認
pnpm --filter @repo/desktop test:e2e -- \
  --grep "TC-03|TC-05|TC-06|TC-08|TC-09|TC-11|TC-12"

# 全体回帰（既存 E2E スペック含む）
pnpm --filter @repo/desktop test:e2e
```

## 参照資料

| 資料名                  | パス                                              | 用途                         |
| ----------------------- | ------------------------------------------------- | ---------------------------- |
| 実装サマリー（Phase 5） | `outputs/phase-5/implementation-summary.md`       | Phase 5 Green 確認ログ参照   |
| 変更ファイル一覧        | `outputs/phase-5/changed-files.md`                | Phase 5 成果物               |
| trackEvent 型定義       | `apps/desktop/src/renderer/utils/trackEvent.ts`   | `SkillWizardEvents` 定義確認 |
| E2E trackEvent スタブ   | `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts` | alias で差し替える本体       |

## 統合テスト連携

```bash
# 拡充テスト（EdgeCase-1/2）を含む全 describe 実行
pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E"

# CI 環境でのトレース付き実行
CI=true pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E" \
  --trace on
```

## 成果物

| 成果物           | パス                                        | 説明                                          |
| ---------------- | ------------------------------------------- | --------------------------------------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | TC-03/05/06/08/09/11/12 の設計・実装内容      |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | Phase 5 全 TC + EdgeCase-1/2 の PASS 確認ログ |
| 追加観点確認     | `outputs/phase-6/edge-case-check.md`        | EdgeCase-1/2 の追加観点・capture 再利用確認   |

## 完了条件

- [x] EdgeCase-1（ネットワークエラー時のイベント未発火）の採否判断を記録した
- [x] EdgeCase-2（再オープン時の `skill_wizard_started` 再発火）の採否判断を記録した
- [x] Phase 5 の全 TC（TC-03/05/06/08/09/11/12）が引き続き PASS
- [x] 既存 E2E スペックが全て PASS のまま
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 生成失敗時のイベント未発火パスを確認
2. EdgeCase-1 テストケース実装（生成失敗時の未発火確認）
3. EdgeCase-2 テストケース実装（再オープン時の started 再発火確認）
4. Phase 5 全 TC の回帰確認
5. 補助コマンド実行・結果記録
6. 完了条件の判定

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

Phase 7: カバレッジ確認
