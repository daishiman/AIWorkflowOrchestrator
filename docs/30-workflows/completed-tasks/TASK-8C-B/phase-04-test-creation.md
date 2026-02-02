# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 4                            |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

## 目的

スキル選択フローのE2Eテストを実装する（6テストケース）。このタスクはE2Eテスト実装タスクのため、本Phaseが主要な実装Phaseとなる。

## 実行タスク

- E2Eテストファイル作成: `skillSelection.e2e.ts` の実装
- テストケース実装: 6件のテストケースを実装
- セレクタ定義: aria-label, role, data-testid によるセレクタ

## 参照資料

| 資料名           | パス                                         | 説明          |
| ---------------- | -------------------------------------------- | ------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| テスト設計書     | `outputs/phase-2/test-design.md`             | Phase 2成果物 |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |
| 元タスク仕様書   | `task-8c-b-e2e-selection.md`                 | 実装詳細      |

## 実行手順

### 1. テストファイル作成

**出力先**: `apps/desktop/src/__tests__/skillSelection.e2e.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { ElectronApplication, Page, _electron as electron } from "playwright";
import path from "path";

describe("Skill Selection E2E", () => {
  let electronApp: ElectronApplication;
  let page: Page;

  beforeAll(async () => {
    electronApp = await electron.launch({
      args: [path.join(__dirname, "../../dist/main/index.js")],
      env: {
        ...process.env,
        NODE_ENV: "test",
        TEST_SKILLS_DIR: path.join(__dirname, "__fixtures__/skills"),
      },
    });

    page = await electronApp.firstWindow();
    await page.waitForLoadState("domcontentloaded");
  });

  afterAll(async () => {
    await electronApp?.close();
  });

  beforeEach(async () => {
    await page.evaluate(() => {
      window.electronAPI?.skill?.resetForTesting?.();
    });
  });

  // テストケース実装
});
```

### 2. テストケース実装

#### テストケース1: スキルセレクター表示

```typescript
it("should display skill selector in chat panel", async () => {
  const skillSelector = page.locator('[aria-label="スキルを選択"]');
  await expect(skillSelector).toBeVisible();
});
```

#### テストケース2: ドロップダウン開く

```typescript
it("should open dropdown and show available skills", async () => {
  await page.click('[aria-label="スキルを選択"]');

  const dropdown = page.locator('[role="listbox"]');
  await expect(dropdown).toBeVisible();

  // "なし" オプションが表示される
  await expect(page.locator('text="なし"')).toBeVisible();
});
```

#### テストケース3: スキル選択

```typescript
it("should select a skill", async () => {
  await page.click('[aria-label="スキルを選択"]');
  await page.click('[role="option"]:has-text("test-skill")');

  const selector = page.locator('[aria-label="スキルを選択"]');
  await expect(selector).toContainText("test-skill");
});
```

#### テストケース4: スキル選択解除

```typescript
it("should deselect skill by clicking なし", async () => {
  // まずスキルを選択
  await page.click('[aria-label="スキルを選択"]');
  await page.click('[role="option"]:has-text("test-skill")');

  // 選択解除
  await page.click('[aria-label="スキルを選択"]');
  await page.click('[role="option"]:has-text("なし")');

  const selector = page.locator('[aria-label="スキルを選択"]');
  await expect(selector).toContainText("なし");
});
```

#### テストケース5: キーボードナビゲーション

```typescript
it("should support keyboard navigation", async () => {
  await page.click('[aria-label="スキルを選択"]');

  // Arrow downでナビゲート
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");

  // Enterで選択
  await page.keyboard.press("Enter");

  // ドロップダウンが閉じる
  const dropdown = page.locator('[role="listbox"]');
  await expect(dropdown).not.toBeVisible();
});
```

#### テストケース6: 外側クリックで閉じる

```typescript
it("should close dropdown when clicking outside", async () => {
  await page.click('[aria-label="スキルを選択"]');

  const dropdown = page.locator('[role="listbox"]');
  await expect(dropdown).toBeVisible();

  // 外側をクリック
  await page.click("body", { position: { x: 10, y: 10 } });

  await expect(dropdown).not.toBeVisible();
});
```

## 統合テスト連携【必須】

| シナリオカテゴリ | 検証内容                    | テストファイル          |
| ---------------- | --------------------------- | ----------------------- |
| UI連携テスト     | SkillSelector表示・操作     | `skillSelection.e2e.ts` |
| IPC連携テスト    | resetForTesting API呼び出し | beforeEach内で検証      |
| 状態同期テスト   | スキル選択後の状態反映      | テストケース3,4で検証   |

## アーキテクチャ層別テスト

| 層               | テスト観点                 | テストファイル配置                    |
| ---------------- | -------------------------- | ------------------------------------- |
| E2E（統合）      | ユーザー操作フロー全体     | `apps/desktop/src/__tests__/*.e2e.ts` |
| Renderer Process | UIコンポーネント表示・操作 | Playwright page操作                   |
| IPC通信          | electronAPI呼び出し        | page.evaluate内                       |

## 成果物

| 成果物            | パス                                               | 説明              |
| ----------------- | -------------------------------------------------- | ----------------- |
| E2Eテストファイル | `apps/desktop/src/__tests__/skillSelection.e2e.ts` | 6件のテストケース |
| テストケース一覧  | `outputs/phase-4/test-cases.md`                    | テストケース詳細  |

## 完了条件

- [ ] `skillSelection.e2e.ts` が作成されている
- [ ] 6件のテストケースが実装されている
- [ ] セットアップ（beforeAll/afterAll/beforeEach）が実装されている
- [ ] セレクタが適切に定義されている（aria-label, role使用）
- [ ] テストが実行可能な状態である
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:e2e

# 確認項目
# - [ ] テストファイルが認識されること
# - [ ] テストが実行されること（依存コンポーネント未実装の場合は失敗OK）
```

## 次のPhase

Phase 5: 実装（TDD: Green）
