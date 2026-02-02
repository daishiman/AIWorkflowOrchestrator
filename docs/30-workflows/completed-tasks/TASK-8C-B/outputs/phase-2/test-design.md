# Phase 2: テスト設計書

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 2                            |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

## 1. テストファイル設計

### 1.1 ファイル構造

```
apps/desktop/src/__tests__/
├── __fixtures__/
│   └── skills/
│       ├── test-skill/
│       │   └── SKILL.md
│       └── another-skill/
│           └── SKILL.md
├── skillSelection.e2e.ts      ← 本タスクで作成
├── skillImportExecution.e2e.ts   ← TASK-8C-C（並列タスク）
└── skillPermission.e2e.ts        ← TASK-8C-D（並列タスク）
```

### 1.2 出力先

| ファイル                                           | 内容              |
| -------------------------------------------------- | ----------------- |
| `apps/desktop/src/__tests__/skillSelection.e2e.ts` | E2Eテストファイル |

## 2. テストスイート設計

### 2.1 テストスイート構造

```typescript
describe("Skill Selection E2E", () => {
  // ============================================
  // Setup / Teardown
  // ============================================
  let electronApp: ElectronApplication;
  let page: Page;

  beforeAll(async () => {
    // Electron起動、firstWindow取得
  });

  afterAll(async () => {
    // Electron終了
  });

  beforeEach(async () => {
    // 状態リセット
  });

  // ============================================
  // 基本表示テスト
  // ============================================
  describe("基本表示", () => {
    it("should display skill selector in chat panel");
    it("should open dropdown and show available skills");
  });

  // ============================================
  // スキル選択テスト
  // ============================================
  describe("スキル選択", () => {
    it("should select a skill");
    it("should deselect skill by clicking なし");
  });

  // ============================================
  // キーボード操作テスト
  // ============================================
  describe("キーボード操作", () => {
    it("should support keyboard navigation");
    it("should close dropdown when clicking outside");
  });

  // ============================================
  // アクセシビリティテスト
  // ============================================
  describe("アクセシビリティ", () => {
    it("should have proper ARIA attributes");
    it("should close dropdown on Escape key");
  });
});
```

### 2.2 テストケースグループ

| グループ名       | テストケース数 | 目的                     |
| ---------------- | -------------- | ------------------------ |
| 基本表示         | 2              | 表示・ドロップダウン開く |
| スキル選択       | 2              | 選択・解除               |
| キーボード操作   | 2              | キーナビ・外側クリック   |
| アクセシビリティ | 2              | ARIA属性・Escape         |

## 3. テストケース詳細設計

| No  | テストケース             | セレクタ                                     | アクション                   | 検証                          |
| --- | ------------------------ | -------------------------------------------- | ---------------------------- | ----------------------------- |
| 1   | セレクター表示           | `[role="combobox"][aria-haspopup="listbox"]` | 表示確認                     | `toBeVisible()`               |
| 2   | ドロップダウン開く       | `[role="listbox"]`                           | click → 表示確認             | `toBeVisible()`, "なし"表示   |
| 3   | スキル選択               | `[role="option"]:has-text("test-skill")`     | click                        | `toContainText("test-skill")` |
| 4   | スキル選択解除           | `[role="option"]:has-text("なし")`           | click → click                | `toContainText("なし")`       |
| 5   | キーボードナビゲーション | keyboard                                     | ArrowDown×2 → Enter          | dropdown `not.toBeVisible()`  |
| 6   | 外側クリックで閉じる     | `body`                                       | click(position: {x:10,y:10}) | dropdown `not.toBeVisible()`  |
| 7   | ARIA属性検証             | `[role="combobox"]`                          | 属性確認                     | `toHaveAttribute()`           |
| 8   | Escapeで閉じる           | keyboard                                     | Escape                       | dropdown `not.toBeVisible()`  |

## 4. セレクタ設計

### 4.1 セレクタ定数

```typescript
const selectors = {
  // トリガーボタン
  skillSelector: '[role="combobox"][aria-haspopup="listbox"]',

  // ドロップダウン
  dropdown: '[role="listbox"]',

  // オプション
  option: (text: string) => `[role="option"]:has-text("${text}")`,
  noneOption: '[role="option"]:has-text("なし（スキルを使用しない）")',

  // ChatPanel
  chatPanel: '[data-testid="chat-panel"]',
  chatHeader: '[data-testid="chat-header"]',
};
```

### 4.2 セレクタ選定理由

| セレクタ                     | 理由                                   |
| ---------------------------- | -------------------------------------- |
| `[role="combobox"]`          | セマンティックかつ安定                 |
| `[aria-haspopup="listbox"]`  | 特定のコンボボックスを識別             |
| `[role="listbox"]`           | ドロップダウンのセマンティック識別     |
| `[role="option"]:has-text()` | Playwright推奨のテキストベースセレクタ |
| `[data-testid]`              | テスト専用属性、UIに依存しない         |

## 5. ヘルパー関数設計

```typescript
// ============================================
// ヘルパー関数
// ============================================

/**
 * ドロップダウンを開く
 */
async function openDropdown(page: Page): Promise<void> {
  await page.click(selectors.skillSelector);
  await page.waitForSelector(selectors.dropdown, { state: "visible" });
}

/**
 * スキルを選択
 */
async function selectSkill(page: Page, skillName: string): Promise<void> {
  await openDropdown(page);
  await page.click(selectors.option(skillName));
}

/**
 * スキル選択を解除
 */
async function deselectSkill(page: Page): Promise<void> {
  await openDropdown(page);
  await page.click(selectors.noneOption);
}

/**
 * セレクターのテキストを取得
 */
async function getSelectorText(page: Page): Promise<string> {
  const selector = page.locator(selectors.skillSelector);
  return (await selector.textContent()) ?? "";
}
```

## 6. 環境設計

### 6.1 Electron起動設定

```typescript
const electronConfig = {
  args: [path.join(__dirname, "../../dist/main/index.js")],
  env: {
    ...process.env,
    NODE_ENV: "test",
    TEST_SKILLS_DIR: path.join(__dirname, "__fixtures__/skills"),
  },
};
```

### 6.2 Vitest設定（E2E用）

| 設定項目    | 値            | 理由                |
| ----------- | ------------- | ------------------- |
| testTimeout | 30000         | E2Eは長めに設定     |
| include     | `**/*.e2e.ts` | E2Eファイルのみ対象 |
| pool        | forks         | 並列実行            |

## 7. 統合ポイント設計

| 統合ポイント | 契約定義                                         |
| ------------ | ------------------------------------------------ |
| IPC呼び出し  | `window.electronAPI?.skill?.resetForTesting?.()` |
| UI要素       | aria-label, role, data-testid属性によるセレクタ  |
| 状態管理     | Zustand Store のスキル選択状態                   |
| フィクスチャ | `__fixtures__/skills/` ディレクトリ              |

## 8. テストデータ設計

### 8.1 テストフィクスチャ

| フィクスチャ                         | name          | description         |
| ------------------------------------ | ------------- | ------------------- |
| `__fixtures__/skills/test-skill/`    | test-skill    | E2Eテスト用のスキル |
| `__fixtures__/skills/another-skill/` | another-skill | 複数スキルテスト用  |

### 8.2 テスト状態

| 状態              | 初期値 | 検証タイミング     |
| ----------------- | ------ | ------------------ |
| selectedSkillName | null   | 選択前・選択後     |
| importedSkills    | []     | スキル表示時       |
| availableSkills   | []     | ドロップダウン表示 |

## 完了チェック

- [x] テストファイル構造が設計されている
- [x] 8件のテストケースが詳細設計されている（6件+エッジケース2件）
- [x] セレクタ戦略が定義されている
- [x] フィクスチャ設計が完了している
- [x] 統合ポイント/契約が設計に反映されている
- [x] ヘルパー関数が設計されている
