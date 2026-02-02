# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 8                            |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

## 目的

動作を変えずにテストコードの品質を改善する。

## 実行タスク

- コード整理: テストコードの構造改善
- 重複排除: 共通処理のヘルパー関数化
- 可読性向上: テストケース名・コメントの改善

## 参照資料

| 資料名            | パス                                               | 説明           |
| ----------------- | -------------------------------------------------- | -------------- |
| E2Eテストファイル | `apps/desktop/src/__tests__/skillSelection.e2e.ts` | リファクタ対象 |

## 実行手順

### 1. 共通処理の抽出

**ヘルパー関数候補**:

```typescript
// セレクタ定義
const selectors = {
  skillSelector: '[aria-label="スキルを選択"]',
  dropdown: '[role="listbox"]',
  option: (text: string) => `[role="option"]:has-text("${text}")`,
};

// 共通操作
async function openDropdown(page: Page) {
  await page.click(selectors.skillSelector);
  await page.waitForSelector(selectors.dropdown, { state: "visible" });
}

async function selectSkill(page: Page, skillName: string) {
  await openDropdown(page);
  await page.click(selectors.option(skillName));
}
```

### 2. テストケース整理

**グループ化**:

```typescript
describe("Skill Selection E2E", () => {
  describe("基本表示", () => {
    it("should display skill selector");
    it("should open dropdown");
  });

  describe("スキル選択", () => {
    it("should select a skill");
    it("should deselect skill");
  });

  describe("キーボード操作", () => {
    it("should support keyboard navigation");
    it("should close on outside click");
  });
});
```

### 3. コードスメル修正

| コードスメル       | 修正方法               |
| ------------------ | ---------------------- |
| マジックストリング | セレクタ定数化         |
| 重複コード         | ヘルパー関数抽出       |
| 長いテストケース   | Arrange-Act-Assert分離 |

## 統合テスト連携【必須】

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test:e2e skillSelection.e2e.ts

# 全テストが継続成功することを確認
```

## 成果物

| 成果物               | パス                                     | 説明         |
| -------------------- | ---------------------------------------- | ------------ |
| リファクタリング記録 | `outputs/phase-8/refactoring-summary.md` | 改善内容一覧 |

## 完了条件

- [ ] テストが継続成功
- [ ] セレクタが定数化されている
- [ ] 共通処理がヘルパー関数化されている
- [ ] テストケースが適切にグループ化されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:e2e

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## 次のPhase

Phase 9: 品質保証
