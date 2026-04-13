# Phase 12: 実装ガイド - UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                |
| 作成日   | 2026-04-12                                            |
| 対象     | スキルウィザード trackEvent E2E UI 到達確認テスト追加 |
| 状態     | completed（Phase 12 完了 / Phase 13 blocked）         |

---

## Part 1: 中学生向け説明

### E2E トラッキングテストとは何か？

スキルを作るウィザードを実際にブラウザで操作したときに、「どのボタンが押されたか」「どのページまで進んだか」を記録する仕組みが正しく動いているかを確かめるテストを追加した話です。

以前は「テストの環境（JSDOM）」でモック（ダミー）を使った確認だけでした。今回は「実際のブラウザ（Playwright/Chromium）」でウィザードを操作し、trackEvent が本当に呼ばれているかを確認できるようにしました。

**例えば：**

- 「スキップ」ボタンで Step 1 を飛ばしたとき、`skill_wizard_step1_completed` というイベントが `method: "skip"` と共に発火するか確認
- 「👍（満足）」ボタンを押したとき、`skill_skeleton_quality_feedback(satisfied=true)` が発火するか確認

**重要な発見（苦戦箇所）：**

- 現在のウィザード UI では `skill_wizard_step1_completed` は Step 1 をスキップするフローで呼ばれ、`method: "skip"` を渡す設計になっている
- そのため、「CompleteStep に到達できたか」の確認と「イベントの値が正しいか」の確認を分離して実装する必要があった

---

## Part 2: 技術詳細

### 追加ファイル

| ファイル                                           | 役割                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/desktop/e2e/skill-wizard-tracking.spec.ts`   | E2E テスト本体（7テストケース）                                     |
| `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` | trackEvent capture / onboarding store / skill API stub 統合ヘルパー |
| `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`  | trackEvent スタブ型定義                                             |

### 修正ファイル

| ファイル                          | 変更内容                                                 |
| --------------------------------- | -------------------------------------------------------- |
| `.github/workflows/ci.yml`        | e2e-desktop ジョブを skip から実行へ変更、timeout 5m→15m |
| `apps/desktop/vite.e2e.config.ts` | E2E 用 vite 設定追加                                     |

### wizard-tracking-stub.ts 設計

```typescript
// onboarding store mock を注入してウィザード起動を可能にする
await page.evaluate(() => {
  window.__trackEventCaptured = [];
  window.trackEvent = (eventName, payload) => {
    window.__trackEventCaptured.push({ eventName, payload });
  };
});

// キャプチャしたイベント一覧を取得
const events = await page.evaluate(() => window.__trackEventCaptured);
```

### skill_wizard_step1_completed の分離設計

```typescript
// AC-1: CompleteStep 到達確認（イベント値は問わない）
await expect(page.getByTestId("complete-step")).toBeVisible();

// 別途イベント確認（method: "skip" を期待）
const ev = events.find((e) => e.eventName === "skill_wizard_step1_completed");
expect(ev?.payload.method).toBe("skip");
```

### CI 統合

```yaml
e2e-desktop:
  name: E2E Test (desktop - wizard tracking)
  timeout-minutes: 15
  steps:
    - name: Run E2E tests (skill-wizard-tracking)
      run: pnpm --filter @repo/desktop exec playwright test e2e/skill-wizard-tracking.spec.ts --project=chromium
```

### Phase 11 証跡

- Phase 11 手動テスト: NON_VISUAL 判定（E2E テスト自体がビジュアル証跡不要）
- 代替証跡: Playwright Chromium 7 passed（`phase-11/manual-test-result.md`）
- 証跡ファイル: `outputs/phase-11/manual-test-result.md`（NON_VISUAL 判定記録）

### 検証証跡

- `pnpm --filter @repo/desktop exec playwright test e2e/skill-wizard-tracking.spec.ts --project=chromium`: PASS（7 passed）
- `pnpm --filter @repo/desktop typecheck`: PASS
