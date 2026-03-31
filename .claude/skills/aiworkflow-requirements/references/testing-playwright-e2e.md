# Playwright E2Eテスト仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [quality-e2e-testing.md](./quality-e2e-testing.md)

## 変更履歴

| Version | Date       | Changes                                      |
| ------- | ---------- | -------------------------------------------- |
| 1.2.0   | 2026-03-31 | UT-UIUX-PLAYWRIGHT-E2E-001: `ui-ux-layer1` / `ui-ux-layer2`、`TEST_TARGETS` 駆動、baseline 正本パス `layer2-visual.spec.ts-snapshots/`、implicit role / positive tabindex ルール、Phase 11 screenshot 導線を反映 |
| 1.1.0   | 2026-03-01 | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001: Playwright設定のCI/ローカル動的切替（timeout/expect/retries/workers/reporter）を反映。`ci.yml` の `e2e-desktop` ジョブ（xvfb + chromium + artifact保存）を追記 |
| 1.0.0   | 2026-02-02 | 初版作成（TASK-8C-D E2Eテスト実装を基に抽出） |

---

## 概要

PlaywrightによるE2Eテストの実装パターンを定義する。Electron Rendererプロセスを対象とし、ViteのDevサーバー経由で実行する。CIでは `CI=true` を前提に、タイムアウト・リトライ・ワーカー数・レポーターを動的に切り替える。

---

## テスト構成

### ディレクトリ構造

| パス                           | 役割                            |
| ------------------------------ | ------------------------------- |
| `apps/desktop/e2e/`            | E2Eテストファイル配置           |
| `apps/desktop/e2e/ui-ux/`      | UI/UX 3層評価テスト配置         |
| `apps/desktop/e2e/*.spec.ts`   | Playwrightテストスイート        |
| `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` | Visual baseline 正本 |
| `apps/desktop/playwright.config.ts` | Playwright設定ファイル    |

### テストフレームワーク

| 項目           | 値                    |
| -------------- | --------------------- |
| フレームワーク | Playwright Test       |
| パッケージ     | `@playwright/test`    |
| 実行方法       | Vite DevServer経由    |
| ベースURL      | `http://localhost:5173` |
| CI統合         | `ci.yml` の `e2e-desktop` ジョブ（xvfb + chromium） |

---

## セレクター戦略

### 優先順位

| 優先度 | セレクター種別    | 例                                    | 用途                   |
| ------ | ----------------- | ------------------------------------- | ---------------------- |
| 1      | ARIA Role         | `getByRole('button', {name: '許可'})` | アクセシビリティ重視   |
| 2      | data-testid       | `[data-testid="chat-input"]`          | 安定したテスト用ID     |
| 3      | aria-label        | `[aria-label="スキルを選択"]`         | ラベル付きコンポーネント |
| 4      | Text Content      | `getByText('権限の確認が必要です')`   | ユーザー視点のテスト   |
| 5      | CSS Selector      | `.permission-dialog`                  | 最終手段               |

### セレクター定数パターン

```typescript
const SELECTORS = {
  /** チャット入力欄 */
  chatInput: '[data-testid="chat-input"]',

  /** スキルセレクター */
  skillSelector: '[aria-label="スキルを選択"]',

  /** ダイアログコンテナ（ARIA） */
  dialogContainer: '[role="alertdialog"]',
} as const;
```

**設計原則**:
- `as const`で型安全性を確保
- JSDocコメントで用途を明記
- ARIA属性を優先（アクセシビリティテストと兼用）

---

## 待機戦略

### 推奨パターン

| パターン                      | 用途                       | 例                                           |
| ----------------------------- | -------------------------- | -------------------------------------------- |
| `waitForSelector`             | 要素の出現/消失待機        | `await page.waitForSelector('text="タイトル"')` |
| `expect().toBeVisible()`      | アサーション内待機         | `await expect(dialog).toBeVisible()`         |
| `waitForLoadState`            | ページ状態変化             | `await page.waitForLoadState('networkidle')` |
| `waitForSelector({ state })`  | 要素消失待機               | `{ state: 'hidden' }`                        |

### 避けるべきパターン

| パターン              | 問題点                       | 代替策                         |
| --------------------- | ---------------------------- | ------------------------------ |
| `waitForTimeout(ms)`  | フレーキー、非決定論的       | イベントベース待機に置換       |
| 固定時間スリープ      | 環境依存、CI不安定           | 状態変化を検知して待機         |
| ハードコード遅延      | テスト時間の無駄             | `waitForSelector`や`expect`利用 |

### 状態遷移待機パターン

```typescript
// ダイアログが閉じるまで待機
await page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, {
  state: "hidden",
});

// ロード完了まで待機
await page.waitForLoadState("networkidle");

// 要素が表示されるまで待機（タイムアウト付き）
await expect(page.getByText("実行中")).toBeVisible({ timeout: 5000 });
```

---

## ヘルパー関数パターン

### 基本構造

```typescript
/**
 * [操作内容]を実行する
 * @param page - Playwrightのページオブジェクト
 * @param [パラメータ名] - [パラメータ説明]
 */
async function [functionName](page: Page, param?: Type): Promise<void> {
  // 実装
}
```

### 標準ヘルパー一覧

| ヘルパー名                | 機能                           |
| ------------------------- | ------------------------------ |
| `selectSkill`             | スキルをドロップダウンから選択 |
| `triggerPermissionDialog` | 権限ダイアログをトリガー       |
| `waitForPermissionDialog` | ダイアログ表示を待機           |
| `approvePermission`       | 権限を許可                     |
| `denyPermission`          | 権限を拒否                     |
| `checkRememberChoice`     | 選択記憶チェックボックスをON   |

### ヘルパー実装例

```typescript
async function selectSkill(page: Page, skillName: string): Promise<void> {
  await page.click(SELECTORS.skillSelector);
  await page.getByRole("option", { name: skillName }).click();
  // Note: waitForTimeoutは非推奨、状態変化待機に置換推奨
}

async function approvePermission(page: Page): Promise<void> {
  await page.getByRole("button", { name: APPROVE_BUTTON_TEXT }).click();
  await page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, {
    state: "hidden",
  });
}
```

---

## テストスイート構造

### ファイル構造テンプレート

```typescript
/**
 * @file [feature].spec.ts
 * @description [機能名] E2Eテスト
 * @task [TASK-ID]
 */

import { test, expect, type Page } from "@playwright/test";

// ===== テストデータ定数 =====
const TEST_DATA = { ... };

// ===== セレクター定数 =====
const SELECTORS = { ... };

// ===== ヘルパー関数 =====
async function helperFunction(page: Page): Promise<void> { ... }

// ===== テストスイート =====
test.describe("[機能名] E2E テスト", () => {
  test.beforeEach(async ({ page }) => {
    // セットアップ
  });

  test.describe("TC-N: [テスト名]", () => {
    test("[期待動作]", async ({ page }) => {
      // Arrange, Act, Assert
    });
  });
});
```

### テストカテゴリ分類

| カテゴリ         | 命名規則                  | 内容                         |
| ---------------- | ------------------------- | ---------------------------- |
| Basic Flow       | TC-1〜TC-N                | 基本的なユーザーフロー       |
| Edge Cases       | Edge Cases: [説明]        | 境界値・例外的なシナリオ     |
| Error Handling   | Error Handling: [説明]    | エラー時の動作               |
| Accessibility    | Accessibility: [説明]     | WCAG準拠・キーボード操作     |

---

## アクセシビリティテスト

### 検証項目

| 項目                   | 検証方法                                  |
| ---------------------- | ----------------------------------------- |
| ARIA role              | `[role="alertdialog"]`の存在確認          |
| aria-modal             | `toHaveAttribute("aria-modal", "true")`   |
| キーボードナビゲーション | Tab/Enter/Escapeキー操作                 |
| フォーカストラップ     | Tab連打でダイアログ内に留まることを確認   |

### UI/UX Layer 1 / Layer 2 追加ルール

- `TEST_TARGETS` を single source of truth にする
- native `button` / `textarea` / text `input` は explicit role がなくても implicit role を PASS 扱いにする
- `tabindex="0"` を多用する roving tabindex パターンは fail 条件にしない。重複検知は positive tabindex のみに適用する
- Phase 11 screenshot 証跡は workflow 配下 `outputs/phase-11/screenshots/` に保存する

### ダイアログ固有パターン

```typescript
// ARIA属性検証
await expect(dialog).toHaveAttribute("aria-modal", "true");

// Escapeキー動作
await page.keyboard.press("Escape");
await expect(dialog).not.toBeVisible();

// フォーカス＋Enterキー操作
await page.getByRole("button", { name: "許可" }).focus();
await page.keyboard.press("Enter");
```

---

## beforeEachパターン

### 標準セットアップ

```typescript
test.beforeEach(async ({ page }) => {
  // 1. アプリケーションルートに移動
  await page.goto("/");

  // 2. ページロード完了待機
  await page.waitForLoadState("networkidle");

  // 3. 対象画面への遷移
  const chatNav = page.getByRole("navigation", { name: "Main navigation" });
  await chatNav.getByRole("button").nth(1).click();

  // 4. 画面ロード確認
  await page.waitForSelector('[data-testid="chat-view"]', { timeout: 10000 });

  // 5. 前提条件設定（スキル選択等）
  await selectSkill(page, TEST_SKILL_NAME);
});
```

---

## テストスキップパターン

### 条件付きスキップ

```typescript
// 環境依存でスキップ
test.skip("タイムアウトテスト", async ({ page }) => {
  // Note: モック設定が必要なためスキップ
});

// 条件付き実行
test.skip(process.env.CI === 'true', 'CI環境ではスキップ');
```

---

## CI/CD統合

### GitHub Actions設定例

| 設定項目       | 推奨値                |
| -------------- | --------------------- |
| headless       | `true`                |
| timeout        | `60000`（CI） / `30000`（local） |
| retries        | `2`（CI環境のみ）     |
| workers        | `1`（並列競合防止）   |
| reporter       | `github + html`（CI） |

### `e2e-desktop` ジョブ標準構成（2026-03-01）

| ステップ | 内容 |
| --- | --- |
| 1 | `pnpm install --frozen-lockfile` |
| 2 | `actions/download-artifact@v4` で `shared-build` を取得 |
| 3 | `actions/cache@v4` で `~/.cache/ms-playwright` をキャッシュ |
| 4 | `pnpm --filter @repo/desktop exec playwright install --with-deps chromium` |
| 5 | `pnpm --filter @repo/desktop build` |
| 6 | `xvfb-run --auto-servernum pnpm --filter @repo/desktop exec playwright test` |
| 7 | `apps/desktop/playwright-report/` をartifact保存（7日） |

### playwright.config.ts推奨設定

```typescript
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  timeout: isCI ? 60_000 : 30_000,
  expect: { timeout: isCI ? 10_000 : 5_000 },
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx vite --config vite.e2e.config.ts',
    url: 'http://localhost:5173',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
```

---

## デバッグパターン

### Headed Mode実行

```bash
pnpm --filter @repo/desktop exec playwright test --headed
```

### 特定テスト実行

```bash
pnpm --filter @repo/desktop exec playwright test e2e/skill-permission.spec.ts
```

### トレース取得

```bash
pnpm --filter @repo/desktop exec playwright test --trace on
```

---

## 関連ドキュメント

| ドキュメント                                         | 内容                   |
| ---------------------------------------------------- | ---------------------- |
| [quality-e2e-testing.md](./quality-e2e-testing.md)   | E2Eテスト全体仕様      |
| [testing-accessibility.md](./testing-accessibility.md) | アクセシビリティ仕様 |
| [testing-fixtures.md](./testing-fixtures.md)         | テストフィクスチャ仕様 |
| [deployment-gha.md](./deployment-gha.md)             | CIでのE2E実行要件      |
