# Phase 4: テストケース一覧

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 4                            |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

## テストファイル

| ファイル                                           | 内容              |
| -------------------------------------------------- | ----------------- |
| `apps/desktop/src/__tests__/skillSelection.e2e.ts` | E2Eテストファイル |

## テストケース一覧

### 基本表示 (2件)

| No  | テストケース                                   | セレクタ                                     | アクション   | 検証            |
| --- | ---------------------------------------------- | -------------------------------------------- | ------------ | --------------- |
| 1   | should display skill selector in chat panel    | `[role="combobox"][aria-haspopup="listbox"]` | 表示確認     | `toBeVisible()` |
| 2   | should open dropdown and show available skills | `[role="listbox"]`                           | click → 確認 | `toBeVisible()` |

### スキル選択 (2件)

| No  | テストケース                           | セレクタ                                 | アクション    | 検証                          |
| --- | -------------------------------------- | ---------------------------------------- | ------------- | ----------------------------- |
| 3   | should select a skill                  | `[role="option"]:has-text("test-skill")` | click         | `toContainText("test-skill")` |
| 4   | should deselect skill by clicking なし | `[role="option"]:has-text("なし...")`    | click → click | `toContainText("なし")`       |

### キーボード操作 (2件)

| No  | テストケース                                | セレクタ | アクション             | 検証                |
| --- | ------------------------------------------- | -------- | ---------------------- | ------------------- |
| 5   | should support keyboard navigation          | keyboard | ArrowDown×2 → Enter    | `not.toBeVisible()` |
| 6   | should close dropdown when clicking outside | `body`   | click(position: {x,y}) | `not.toBeVisible()` |

### アクセシビリティ (2件)

| No  | テストケース                        | セレクタ            | アクション | 検証                |
| --- | ----------------------------------- | ------------------- | ---------- | ------------------- |
| 7   | should have proper ARIA attributes  | `[role="combobox"]` | 属性確認   | `toHaveAttribute()` |
| 8   | should close dropdown on Escape key | keyboard            | Escape     | `not.toBeVisible()` |

## テストコード構造

```typescript
describe("Skill Selection E2E", () => {
  // Setup
  let electronApp: ElectronApplication;
  let page: Page;

  beforeAll(async () => {
    /* Electron起動 */
  });
  afterAll(async () => {
    /* Electron終了 */
  });
  beforeEach(async () => {
    /* 状態リセット */
  });

  describe("基本表示", () => {
    it("should display skill selector in chat panel");
    it("should open dropdown and show available skills");
  });

  describe("スキル選択", () => {
    it("should select a skill");
    it("should deselect skill by clicking なし");
  });

  describe("キーボード操作", () => {
    it("should support keyboard navigation");
    it("should close dropdown when clicking outside");
  });

  describe("アクセシビリティ", () => {
    it("should have proper ARIA attributes");
    it("should close dropdown on Escape key");
  });
});
```

## ヘルパー関数

| 関数名          | 引数                       | 機能                 |
| --------------- | -------------------------- | -------------------- |
| `openDropdown`  | `page: Page`               | ドロップダウンを開く |
| `selectSkill`   | `page: Page, name: string` | スキルを選択         |
| `deselectSkill` | `page: Page`               | スキル選択を解除     |

## セレクタ定数

```typescript
const selectors = {
  skillSelector: '[role="combobox"][aria-haspopup="listbox"]',
  dropdown: '[role="listbox"]',
  noneOption: '[role="option"]:has-text("なし（スキルを使用しない）")',
  option: (text: string) => `[role="option"]:has-text("${text}")`,
  chatPanel: '[data-testid="chat-panel"]',
};
```

## 完了チェック

- [x] `skillSelection.e2e.ts` が作成されている
- [x] 8件のテストケースが実装されている
- [x] セットアップ（beforeAll/afterAll/beforeEach）が実装されている
- [x] セレクタが適切に定義されている（aria属性、role使用）
- [x] ヘルパー関数が実装されている
