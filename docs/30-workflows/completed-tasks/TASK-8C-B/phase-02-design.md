# Phase 2: 設計

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 2                            |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

## 目的

E2Eテストの構造設計を行い、テストファイルの設計とテスト戦略を定義する。

## 実行タスク

- テストアーキテクチャ設計: Playwright + Electron E2Eテスト構造の設計
- テストケース設計: 6件のテストケースの詳細設計
- フィクスチャ設計: テストデータ・環境設定の設計

## 参照資料

| 資料名           | パス                                                 | 説明          |
| ---------------- | ---------------------------------------------------- | ------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`         | Phase 1成果物 |
| 並列タスク仕様書 | `task-8c-c-e2e-import-execute.md`                    | 類似E2Eテスト |
| テスト戦略       | `aiworkflow-requirements: development-guidelines.md` | テスト戦略    |

## 実行手順

### 1. テストファイル設計

**ファイル構造**:

```
apps/desktop/src/__tests__/
├── __fixtures__/
│   └── skills/
│       └── test-skill/
│           └── SKILL.md
├── skillSelection.e2e.ts      ← 本タスクで作成
├── skillImportExecution.e2e.ts   ← TASK-8C-C
└── skillPermission.e2e.ts        ← TASK-8C-D
```

### 2. テストスイート設計

**テストスイート構造**:

```typescript
describe("Skill Selection E2E", () => {
  // Setup/Teardown
  beforeAll: (Electron起動, firstWindow取得);
  afterAll: Electron終了;
  beforeEach: 状態リセット;

  // Test Cases
  it("should display skill selector in chat panel");
  it("should open dropdown and show available skills");
  it("should select a skill");
  it("should deselect skill by clicking なし");
  it("should support keyboard navigation");
  it("should close dropdown when clicking outside");
});
```

### 3. テストケース詳細設計

| No  | テストケース             | セレクタ                           | アクション                   | 検証                        |
| --- | ------------------------ | ---------------------------------- | ---------------------------- | --------------------------- |
| 1   | セレクター表示           | `[aria-label="スキルを選択"]`      | 表示確認                     | toBeVisible()               |
| 2   | ドロップダウン開く       | `[role="listbox"]`                 | click → 表示確認             | toBeVisible(), "なし"表示   |
| 3   | スキル選択               | `[role="option"]:has-text()`       | click                        | toContainText("test-skill") |
| 4   | スキル選択解除           | `[role="option"]:has-text("なし")` | click → click                | toContainText("なし")       |
| 5   | キーボードナビゲーション | keyboard                           | ArrowDown×2 → Enter          | dropdown not.toBeVisible()  |
| 6   | 外側クリックで閉じる     | `body`                             | click(position: {x:10,y:10}) | dropdown not.toBeVisible()  |

### 4. 環境設計

**テスト環境設定**:

| 設定項目           | 値                                           |
| ------------------ | -------------------------------------------- |
| テストランナー     | Vitest                                       |
| E2Eフレームワーク  | Playwright (Electron mode)                   |
| スキルディレクトリ | `TEST_SKILLS_DIR` 環境変数でフィクスチャ指定 |
| NODE_ENV           | `test`                                       |

**Electron起動設定**:

```typescript
{
  args: [path.join(__dirname, "../../dist/main/index.js")],
  env: {
    ...process.env,
    NODE_ENV: "test",
    TEST_SKILLS_DIR: path.join(__dirname, "__fixtures__/skills"),
  },
}
```

## 統合テスト連携【必須】

| 統合ポイント | 契約定義                                         |
| ------------ | ------------------------------------------------ |
| IPC呼び出し  | `window.electronAPI?.skill?.resetForTesting?.()` |
| UI要素       | aria-label, role, data-testid属性によるセレクタ  |
| 状態管理     | Zustand Store のスキル選択状態                   |

## アーキテクチャ層別設計

| 層               | 設計観点                                | 仕様参照先                 |
| ---------------- | --------------------------------------- | -------------------------- |
| テスト層         | Playwright API, Locator設計             | Playwright公式ドキュメント |
| Renderer Process | SkillSelector, DropdownコンポーネントUI | `ui-ux-design-system.md`   |
| IPC通信          | resetForTesting API                     | `security-electron-ipc.md` |

## 成果物

| 成果物       | パス                             | 説明           |
| ------------ | -------------------------------- | -------------- |
| テスト設計書 | `outputs/phase-2/test-design.md` | テスト構造設計 |
| セレクタ一覧 | `outputs/phase-2/selectors.md`   | UI要素定義     |

## 完了条件

- [ ] テストファイル構造が設計されている
- [ ] 6件のテストケースが詳細設計されている
- [ ] セレクタ戦略が定義されている
- [ ] フィクスチャ設計が完了している
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
