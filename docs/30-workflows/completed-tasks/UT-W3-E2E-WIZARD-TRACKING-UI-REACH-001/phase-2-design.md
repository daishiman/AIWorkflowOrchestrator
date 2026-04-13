# Phase 2: 設計

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| フェーズ番号 | 2                                                   |
| 作成日       | 2026-04-12                                          |
| 前フェーズ   | [Phase 1: 要件定義](./phase-1-requirements.md)      |
| 次フェーズ   | [Phase 3: 設計レビュー](./phase-3-design-review.md) |

---

## 目的

Phase 1 で策定した AC-1〜AC-9 を満たすための E2E テスト実装設計を行う。具体的には以下を設計する。

1. `trackEvent` スタブ注入パターン（`wizard-tracking-stub.ts`）
2. ウィザードマルチステップフロー再現用ヘルパー関数
3. Playwright テストファイル（`skill-wizard-tracking.spec.ts`）の構造と各テストケースの実装設計
4. CI `e2e-desktop` ジョブ改修設計
5. `vite.e2e.config.ts` への trackEvent alias 設計

---

## 実行タスク

### タスク 2-1: trackEvent スタブ注入パターンの設計

#### 設計方針の選択

E2E テストで `trackEvent` の発火を検出する方法は 1 つに絞る。

**採用パターン: Vite E2E alias + `window.__trackEventCalls`**

理由:

- `SkillCreateWizard.tsx` は `trackEvent` を静的 import しているため、実行後の `window` 差し替えだけでは追従しない
- `apps/desktop/vite.e2e.config.ts` で `trackEvent.ts` を `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts` に差し替えると、production code を触らずに記録を差し込める
- 記録形式を `window.__trackEventCalls` に統一すると、テスト側の取得 API を `page.evaluate` だけにできる

#### スタブファイル設計（`wizard-tracking-stub.ts`）

`apps/desktop/e2e/helpers/wizard-tracking-stub.ts` の役割は以下の 3 つである。

1. `page.addInitScript` で `window.__trackEventCalls` を初期化する
2. `page.evaluate` で記録済みイベントを取得・クリアする
3. `SkillWizardEvents` と整合する型ガードと検索ヘルパーを提供する

```typescript
// wizard-tracking-stub.ts の設計（実装は Phase 4 で行う）

import type { Page } from "@playwright/test";
import type { SkillWizardEvents } from "../../src/renderer/utils/trackEvent";

export type TrackEventEntry<
  K extends keyof SkillWizardEvents = keyof SkillWizardEvents,
> = {
  eventName: K;
  payload: SkillWizardEvents[K];
};

declare global {
  interface Window {
    __trackEventCalls?: TrackEventEntry[];
  }
}

// E2E capture を初期化するヘルパー
export async function initTrackingCapture(page: Page): Promise<void>;

// page から記録済みイベントを取得するヘルパー
export async function getTrackedEvents(page: Page): Promise<TrackEventEntry[]>;

// 特定イベントが発火されたかを確認するヘルパー
export async function assertEventFired<K extends keyof SkillWizardEvents>(
  page: Page,
  eventName: K,
  payload?: Partial<SkillWizardEvents[K]>,
): Promise<void>;

// 記録済みイベントをクリアするヘルパー
export async function clearTrackedEvents(page: Page): Promise<void>;
```

#### Vite E2E スタブファイル設計（`trackEvent.e2e-stub.ts`）

`apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts` として以下の内容を作成する（実装は Phase 4）。

```typescript
// trackEvent.e2e-stub.ts の設計

import type { SkillWizardEvents } from "./trackEvent";

declare global {
  interface Window {
    __trackEventCalls?: Array<{
      eventName: keyof SkillWizardEvents;
      payload: SkillWizardEvents[keyof SkillWizardEvents];
    }>;
  }
}

export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void {
  (window.__trackEventCalls ??= []).push({ eventName, payload });
}

export type TrackedEvent = {
  [K in keyof SkillWizardEvents]: {
    eventName: K;
    payload: SkillWizardEvents[K];
  };
}[keyof SkillWizardEvents];
```

#### `vite.e2e.config.ts` への alias 追加設計

```typescript
// 追加する alias 設定
resolve: {
  alias: {
    // E2E テスト時のみ trackEvent をスタブに差し替え
    [path.resolve(
      __dirname,
      "src/renderer/utils/trackEvent.ts",
    )]: path.resolve(__dirname, "e2e/helpers/trackEvent.e2e-stub.ts"),
  },
},
```

---

### タスク 2-2: ウィザードマルチステップフロー再現ヘルパーの設計

テストケースのうち CompleteStep（Step 3）での検証（AC-2〜AC-7）には、Step 0→1→2→3 のフローを経由する必要がある。このフローを再現するヘルパー関数を設計する。

#### ヘルパー関数一覧

```typescript
// skill-wizard-tracking.spec.ts 内に定義するヘルパー（または別ファイルに分離）

/**
 * ウィザードを表示した状態にする。
 * - スキルセンターページに遷移
 * - 「新しいスキルを作成」ボタンをクリック
 * - data-testid="skill-create-wizard" が visible になるまで待機
 */
async function openWizard(page: Page): Promise<void>;

/**
 * Step 0（InfoStep）を完了して Step 1 に遷移する。
 * - スキル名を入力（任意）
 * - 目的・背景に 10 文字以上入力
 * - カテゴリを選択
 * - 「次へ」ボタンをクリック
 * - data-testid="wizard-step-conversation-round" が visible になるまで待機
 */
async function completeInfoStep(page: Page): Promise<void>;

/**
 * Step 1（ConversationRoundStep）をスキップして Step 2 に遷移する。
 * - 「スキップして生成」ボタンをクリック（method="skip"）
 * - data-testid="wizard-step-generate" が visible になるまで待機
 */
async function skipConversationStep(page: Page): Promise<void>;

/**
 * Step 2（GenerateStep）の完了を待って Step 3 に遷移する。
 * - data-testid="wizard-step-complete" が visible になるまで待機（最大 30 秒）
 */
async function waitForCompleteStep(page: Page): Promise<void>;

/**
 * ウィザードを Step 3（CompleteStep）の状態にする。
 * openWizard → completeInfoStep → skipConversationStep → waitForCompleteStep を順に実行する。
 */
async function navigateToCompleteStep(page: Page): Promise<void>;
```

---

### タスク 2-3: テストファイル構造の設計

`apps/desktop/e2e/skill-wizard-tracking.spec.ts` の構造を設計する。

```typescript
/**
 * @file skill-wizard-tracking.spec.ts
 * @description スキルウィザード trackEvent E2E UI 到達確認テスト
 * @task UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001
 *
 * 検証対象:
 * - TC-03: InfoStep 完了 → ConversationRoundStep 遷移（AC-1）
 * - TC-05: 👍 フィードバック → skill_skeleton_quality_feedback 発火（AC-2）
 * - TC-06: 👎 フィードバック → skill_skeleton_quality_feedback 発火（AC-3）
 * - TC-08: execute アクション → skill_wizard_next_action(execute) 発火（AC-4）
 * - TC-09: open_editor アクション → skill_wizard_next_action(open_editor) 発火（AC-5）
 * - TC-11: create_another アクション → skill_wizard_next_action(create_another) 発火（AC-6）
 * - TC-12: 「もう一度作成」後に InfoStep へ戻る（AC-7）
 */

import { test, expect } from "@playwright/test";
import {
  assertEventFired,
  clearTrackedEvents,
  getTrackedEvents,
  initTrackingCapture,
} from "./helpers/wizard-tracking-stub";

// テスト定数
const SKILL_PURPOSE = "Slack通知を自動化するスキルを作成する";
const SKILL_NAME = "E2E テスト用スキル";

test.describe("スキルウィザード trackEvent E2E 確認", () => {
  // --- TC-03 ---
  test("TC-03: InfoStep を完了すると ConversationRoundStep に遷移する (AC-1)", async ({
    page,
  }) => {
    // ...
  });

  // --- CompleteStep 到達テスト群 ---
  test.describe("CompleteStep での trackEvent 発火確認", () => {
    test.beforeEach(async ({ page }) => {
      // CompleteStep まで遷移する（各テストの前提）
      await initTrackingCapture(page);
      await navigateToCompleteStep(page);
      await clearTrackedEvents(page);
    });

    test("TC-05: 👍（satisfied）クリックで skill_skeleton_quality_feedback が発火する (AC-2)", async ({
      page,
    }) => {
      // ...
    });

    test("TC-06: 👎（unsatisfied）クリックで skill_skeleton_quality_feedback が発火する (AC-3)", async ({
      page,
    }) => {
      // ...
    });

    test("TC-08: execute アクションで skill_wizard_next_action(execute) が発火する (AC-4)", async ({
      page,
    }) => {
      // ...
    });

    test("TC-09: open_editor アクションで skill_wizard_next_action(open_editor) が発火する (AC-5)", async ({
      page,
    }) => {
      // ...
    });

    test("TC-11: create_another アクションで skill_wizard_next_action(create_another) が発火する (AC-6)", async ({
      page,
    }) => {
      // ...
    });

    test("TC-12: 「もう一度作成」後にウィザードが InfoStep に戻る (AC-7)", async ({
      page,
    }) => {
      // ...
    });
  });
});
```

---

### タスク 2-4: CI `e2e-desktop` ジョブ改修設計

現状の `e2e-desktop` ジョブはスキップのみ行っている。以下のように改修する。

```yaml
e2e-desktop:
  name: E2E Test (desktop - wizard tracking)
  runs-on: ubuntu-latest
  needs: [build-shared]
  timeout-minutes: 15
  env:
    ELECTRON_SKIP_BINARY_DOWNLOAD: 1
  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup pnpm
      uses: pnpm/action-setup@v4

    - name: Setup Node.js
      uses: actions/setup-node@v6
      with:
        node-version: "22"
        cache: "pnpm"

    - name: Configure git to use HTTPS instead of SSH
      run: git config --global url."https://github.com/".insteadOf "git@github.com:"

    - name: Install dependencies
      uses: ./.github/actions/pnpm-install-retry

    - name: Download shared build artifact
      uses: actions/download-artifact@v4
      with:
        name: shared-build
        path: packages/shared/dist/

    - name: Install Playwright browsers
      run: pnpm --filter @repo/desktop exec playwright install --with-deps chromium

    - name: Run E2E tests (wizard tracking)
      run: pnpm --filter @repo/desktop exec playwright test e2e/skill-wizard-tracking.spec.ts --project=chromium

    - name: Upload Playwright report
      if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report-wizard-tracking
        path: apps/desktop/playwright-report/
        retention-days: 7
```

**設計上の判断事項**:

1. `xvfb-run` 不要: Playwright は Renderer の Vite dev サーバーに接続するため、Electron 本体は起動しない。ヘッドレス Chromium で動作可能。
2. `--with-deps chromium` のみインストール: Firefox/WebKit は不要なため最小限にする。
3. 失敗時のみレポートをアップロードしてデバッグに活用する。
4. `timeout-minutes: 15` とする（Playwright ブラウザインストール + テスト実行）。

---

### タスク 2-5: Playwright 設定は変更しない

現状の Playwright 実行設定では `testDir: "./e2e"` と `chromium` プロジェクトが既に定義されているため、`skill-wizard-tracking.spec.ts` はそのまま実行対象になる。追加の Playwright 設定は行わず、E2E 実行対象の絞り込みは CI コマンド側で行う。

**判断**:

- 既存の Playwright 設定は変更しない
- `skill-wizard-tracking.spec.ts` の実行は `--project=chromium` と spec パス指定で行う
- `vite.e2e.config.ts` の alias 追加のみを設定変更として扱う

---

### タスク 2-6: セレクター・data-testid の確認と設計

テストで使用するセレクターを既存実装から確認し、不足があれば記録する。

| セレクター                                            | 対応要素               | 確認状況                               |
| ----------------------------------------------------- | ---------------------- | -------------------------------------- |
| `[data-testid="skill-create-wizard"]`                 | ウィザード全体コンテナ | 確認済み（SkillCreateWizard.tsx L859） |
| `[data-testid="wizard-step-info"]`                    | Step 0 コンテナ        | 確認済み（SkillCreateWizard.tsx L871） |
| `[data-testid="wizard-step-conversation-round"]`      | Step 1 コンテナ        | 確認済み（SkillCreateWizard.tsx L943） |
| `[data-testid="wizard-step-generate"]`                | Step 2 コンテナ        | 確認済み（SkillCreateWizard.tsx L957） |
| `[data-testid="wizard-step-complete"]`                | Step 3 コンテナ        | 確認済み（SkillCreateWizard.tsx L993） |
| `[data-testid="complete-step-feedback-satisfied"]`    | 👍 ボタン              | 確認済み（CompleteStep.tsx L147）      |
| `[data-testid="complete-step-feedback-unsatisfied"]`  | 👎 ボタン              | 確認済み（CompleteStep.tsx L155）      |
| `[data-testid="complete-step-action-execute"]`        | 今すぐ実行ボタン       | 確認済み（CompleteStep.tsx L89）       |
| `[data-testid="complete-step-action-open-editor"]`    | エディタで開くボタン   | 確認済み（CompleteStep.tsx L96）       |
| `[data-testid="complete-step-action-create-another"]` | 別のスキルを作るボタン | 確認済み（CompleteStep.tsx L103）      |

**未確認事項（Phase 4 実装時に要調査）**:

- スキルセンターページへの遷移方法（ルーティング・ナビゲーション要素）
- 「新しいスキルを作成」ボタンのセレクター
- ConversationRoundStep の「スキップして生成」ボタンのセレクター

---

## 参照資料

| 資料                                    | パス                                                                 |
| --------------------------------------- | -------------------------------------------------------------------- |
| trackEvent 実装                         | `apps/desktop/src/renderer/utils/trackEvent.ts`                      |
| SkillCreateWizard 実装                  | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   |
| CompleteStep 実装                       | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` |
| Vite E2E 設定                           | `apps/desktop/vite.e2e.config.ts`                                    |
| Vite E2E 設定                           | `apps/desktop/vite.e2e.config.ts`                                    |
| CI ワークフロー                         | `.github/workflows/ci.yml`                                           |
| E2E ヘルパー（既存）                    | `apps/desktop/e2e/helpers/electron-app.ts`                           |
| Playwright `addInitScript` ドキュメント | https://playwright.dev/docs/api/class-page#page-add-init-script      |
| Vite `resolve.alias` ドキュメント       | https://vitejs.dev/config/shared-options.html#resolve-alias          |

---

## 統合テスト連携

本フェーズで設計したスタブ注入パターン（Vite エイリアス + `trackEvent.e2e-stub.ts`）は AC-8（型整合性）の充足に直結する。Phase 3 レビューで型整合性の担保方法が承認されることで、Phase 4 実装に進む。

---

## 成果物

```
outputs/phase-2/
  design-summary.md           # 設計決定事項のサマリー
  stub-injection-pattern.md   # trackEvent スタブ注入パターン詳細設計
  test-file-structure.md      # skill-wizard-tracking.spec.ts の構造設計
  ci-job-design.md            # e2e-desktop ジョブ改修設計
  selector-inventory.md       # data-testid セレクター一覧
```

---

## 完了条件

- [ ] trackEvent スタブ注入パターン（パターン B: Vite エイリアス）の設計が完了している
- [ ] `wizard-tracking-stub.ts` のインターフェース（関数シグネチャ・型）が設計されている
- [ ] `trackEvent.e2e-stub.ts` の実装設計が完了し、型整合性が説明されている
- [ ] ウィザードマルチステップフロー再現ヘルパー関数が設計されている
- [ ] `skill-wizard-tracking.spec.ts` の構造（describe/test の階層・beforeEach）が設計されている
- [ ] CI `e2e-desktop` ジョブの改修内容が YAML レベルで設計されている
- [ ] 使用する全 `data-testid` セレクターの確認状況が記録されている
- [ ] 未確認事項が Phase 4 実装時の調査項目として明示されている

---

## タスク 100% 実行確認【必須】

- [ ] タスク 2-1: スタブ注入パターン 3 案を評価し、パターン B（Vite エイリアス）を採用理由とともに決定した
- [ ] タスク 2-1: `wizard-tracking-stub.ts` の関数シグネチャ 3 つを設計した
- [ ] タスク 2-1: `trackEvent.e2e-stub.ts` の実装設計を記述した
- [ ] タスク 2-1: `vite.e2e.config.ts` への alias 追加設計を記述した
- [ ] タスク 2-2: ウィザードマルチステップフロー再現ヘルパー関数 5 つを設計した
- [ ] タスク 2-3: テストファイルの describe/test 構造（7 テストケース）を設計した
- [ ] タスク 2-4: CI `e2e-desktop` ジョブの YAML 設計を記述した
- [ ] タスク 2-5: `vite.e2e.config.ts` への alias 追加設計を記述した
- [ ] タスク 2-6: 10 個の `data-testid` セレクターの確認状況を記録した

---

## 次 Phase

[Phase 3: 設計レビュー](./phase-3-design-review.md) - 設計の妥当性検証・Phase 4 進行可否ゲート判定
