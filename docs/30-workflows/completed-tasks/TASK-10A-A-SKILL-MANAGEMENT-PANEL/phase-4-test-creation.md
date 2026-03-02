# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目           | 値                                                                                   |
| -------------- | ------------------------------------------------------------------------------------ |
| タスク ID      | TASK-10A-A                                                                           |
| タスク名       | SkillManagementPanel 実装                                                            |
| Phase          | 4                                                                                    |
| 作成日         | 2026-03-02                                                                           |
| 前 Phase       | Phase 3（設計レビュー）                                                              |
| 次 Phase       | Phase 5（実装）                                                                      |
| 対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx` |
| 状態           | 未着手                                                                               |

## 目的

TDD の Red フェーズとして、SkillManagementPanel コンポーネントの全機能要件を網羅するテストを実装前に作成する。テストは全て失敗状態（Red）であること。

---

## 実行タスク

以下のタスクを順番に実行する。

---

### タスク 1: テストファイル骨格の作成

**目的**: テストファイルの雛形を作成し、モック設定と cleanup を構成する

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/__tests__/` ディレクトリに `SkillManagementPanel.test.tsx` を作成する
2. Vitest の `@vitest-environment happy-dom` アノテーションをファイル冒頭に付与する
3. モック対象の Store セレクタと初期状態を定義する
4. `beforeEach` で `vi.clearAllMocks()` と `currentStoreState` のリセットを行う（P9 対策）
5. `afterEach` で `cleanup()` を呼び出す

**作成ファイル**:

```typescript
/**
 * @vitest-environment happy-dom
 *
 * SkillManagementPanel Component Tests
 *
 * Tests for TASK-10A-A: SkillManagementPanel component.
 * Covers rendering, search, view transitions, skill operations,
 * loading states, and accessibility.
 *
 * @module @repo/desktop/renderer/components/skill/__tests__/SkillManagementPanel
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  act,
} from "@testing-library/react";

// --- Mock setup ---
const mockFetchSkills = vi.fn().mockResolvedValue(undefined);
const mockImportSkill = vi.fn().mockResolvedValue(undefined);
const mockRemoveSkill = vi.fn().mockResolvedValue(undefined);

const defaultStoreState = {
  availableSkillsMetadata: [
    {
      name: "skill-alpha",
      description: "Alpha skill for testing",
      path: "/skills/skill-alpha",
      allowedTools: ["Read", "Write"],
      updatedAt: new Date("2026-01-01"),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    },
    {
      name: "skill-beta",
      description: "Beta skill for search testing",
      path: "/skills/skill-beta",
      allowedTools: [],
      updatedAt: new Date("2026-01-15"),
      agents: [{ name: "agent1" }],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    },
  ],
  importedSkills: [
    {
      name: "skill-alpha",
      description: "Alpha skill for testing",
      path: "/skills/skill-alpha",
      allowedTools: ["Read", "Write"],
      updatedAt: new Date("2026-01-01"),
      importedAt: new Date("2026-02-01"),
      status: "active" as const,
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    },
    {
      name: "skill-beta",
      description: "Beta skill for search testing",
      path: "/skills/skill-beta",
      allowedTools: [],
      updatedAt: new Date("2026-01-15"),
      importedAt: new Date("2026-02-10"),
      status: "active" as const,
      agents: [{ name: "agent1" }],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    },
  ],
  isLoadingSkills: false,
  fetchSkills: mockFetchSkills,
  importSkill: mockImportSkill,
  removeSkill: mockRemoveSkill,
};

let currentStoreState = { ...defaultStoreState };

// Mock store with individual selectors (P31 対策)
vi.mock("../../../store", () => ({
  useAvailableSkillsMetadata: () => currentStoreState.availableSkillsMetadata,
  useImportedSkills: () => currentStoreState.importedSkills,
  useIsLoadingSkills: () => currentStoreState.isLoadingSkills,
  useFetchSkills: () => currentStoreState.fetchSkills,
  useImportSkill: () => currentStoreState.importSkill,
  useRemoveSkill: () => currentStoreState.removeSkill,
}));

vi.mock("@/renderer/store", () => ({
  useAvailableSkillsMetadata: () => currentStoreState.availableSkillsMetadata,
  useImportedSkills: () => currentStoreState.importedSkills,
  useIsLoadingSkills: () => currentStoreState.isLoadingSkills,
  useFetchSkills: () => currentStoreState.fetchSkills,
  useImportSkill: () => currentStoreState.importSkill,
  useRemoveSkill: () => currentStoreState.removeSkill,
}));

afterEach(() => {
  cleanup();
});

describe("SkillManagementPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentStoreState = { ...defaultStoreState };
  });

  // テストケースをここに追加（タスク 2〜6）
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx`（骨格）

---

### タスク 2: レンダリングテストの作成

**目的**: コンポーネントの初期表示が正しいことを検証するテストを作成する

**テストケース（6 件）**:

```typescript
describe("レンダリング", () => {
  it("TC-001: ヘッダーに「スキル管理」タイトルが表示される", () => {
    // render(<SkillManagementPanel />);
    // expect(screen.getByText("スキル管理")).toBeInTheDocument();
    expect(true).toBe(false); // Red
  });

  it("TC-002: 「新規スキル作成」ボタンが表示される", () => {
    // render(<SkillManagementPanel />);
    // expect(screen.getByRole("button", { name: /新規スキル作成/ })).toBeInTheDocument();
    expect(true).toBe(false);
  });

  it("TC-003: インポート済みスキル一覧が表示される", () => {
    // render(<SkillManagementPanel />);
    // expect(screen.getByText("skill-alpha")).toBeInTheDocument();
    // expect(screen.getByText("skill-beta")).toBeInTheDocument();
    expect(true).toBe(false);
  });

  it("TC-004: 各スキルカードに編集・分析・削除ボタンが表示される", () => {
    // render(<SkillManagementPanel />);
    // const editButtons = screen.getAllByRole("button", { name: /編集/ });
    // const analyzeButtons = screen.getAllByRole("button", { name: /分析/ });
    // const deleteButtons = screen.getAllByRole("button", { name: /削除/ });
    // expect(editButtons).toHaveLength(2);
    // expect(analyzeButtons).toHaveLength(2);
    // expect(deleteButtons).toHaveLength(2);
    expect(true).toBe(false);
  });

  it("TC-005: マウント時に fetchSkills が1回呼び出される", () => {
    // render(<SkillManagementPanel />);
    // expect(mockFetchSkills).toHaveBeenCalledTimes(1);
    expect(true).toBe(false);
  });

  it("TC-006: 検索入力フィールドが表示される", () => {
    // render(<SkillManagementPanel />);
    // expect(screen.getByPlaceholderText("スキルを検索...")).toBeInTheDocument();
    expect(true).toBe(false);
  });
});
```

---

### タスク 3: 検索機能テストの作成

**目的**: テキスト入力によるスキルフィルタリング機能を検証するテストを作成する

**テストケース（4 件）**:

```typescript
describe("検索機能", () => {
  it("TC-007: スキル名で検索するとマッチするスキルだけ表示される", () => {
    // render(<SkillManagementPanel />);
    // const input = screen.getByPlaceholderText("スキルを検索...");
    // fireEvent.change(input, { target: { value: "alpha" } });
    // expect(screen.getByText("skill-alpha")).toBeInTheDocument();
    // expect(screen.queryByText("skill-beta")).not.toBeInTheDocument();
    expect(true).toBe(false);
  });

  it("TC-008: 説明文で検索するとマッチするスキルだけ表示される", () => {
    // render(<SkillManagementPanel />);
    // const input = screen.getByPlaceholderText("スキルを検索...");
    // fireEvent.change(input, { target: { value: "search testing" } });
    // expect(screen.queryByText("skill-alpha")).not.toBeInTheDocument();
    // expect(screen.getByText("skill-beta")).toBeInTheDocument();
    expect(true).toBe(false);
  });

  it("TC-009: 空文字列で検索すると全スキルが表示される", () => {
    // render(<SkillManagementPanel />);
    // const input = screen.getByPlaceholderText("スキルを検索...");
    // fireEvent.change(input, { target: { value: "alpha" } });
    // fireEvent.change(input, { target: { value: "" } });
    // expect(screen.getByText("skill-alpha")).toBeInTheDocument();
    // expect(screen.getByText("skill-beta")).toBeInTheDocument();
    expect(true).toBe(false);
  });

  it("TC-010: 大文字小文字を区別せず検索できる", () => {
    // render(<SkillManagementPanel />);
    // const input = screen.getByPlaceholderText("スキルを検索...");
    // fireEvent.change(input, { target: { value: "ALPHA" } });
    // expect(screen.getByText("skill-alpha")).toBeInTheDocument();
    expect(true).toBe(false);
  });
});
```

---

### タスク 4: ビュー遷移テストの作成

**目的**: list / editor / analysis / create 間のビュー遷移が正しく動作することを検証するテストを作成する

**テストケース（5 件）**:

```typescript
describe("ビュー遷移", () => {
  it("TC-011: 編集ボタンをクリックするとエディタビューに遷移する", () => {
    // render(<SkillManagementPanel />);
    // const editButtons = screen.getAllByRole("button", { name: /編集/ });
    // fireEvent.click(editButtons[0]);
    // → エディタビュー（SkillEditor）が表示されることを検証
    expect(true).toBe(false);
  });

  it("TC-012: 分析ボタンをクリックすると分析ビューに遷移する", () => {
    // render(<SkillManagementPanel />);
    // const analyzeButtons = screen.getAllByRole("button", { name: /分析/ });
    // fireEvent.click(analyzeButtons[0]);
    // → 分析ビュー（SkillAnalysisView）が表示されることを検証
    expect(true).toBe(false);
  });

  it("TC-013: 「新規スキル作成」ボタンをクリックすると作成ビューに遷移する", () => {
    // render(<SkillManagementPanel />);
    // fireEvent.click(screen.getByRole("button", { name: /新規スキル作成/ }));
    // → 作成ビュー（SkillCreateWizard）が表示されることを検証
    expect(true).toBe(false);
  });

  it("TC-014: エディタビューの閉じる操作でリストビューに戻る", () => {
    // render(<SkillManagementPanel />);
    // const editButtons = screen.getAllByRole("button", { name: /編集/ });
    // fireEvent.click(editButtons[0]); // エディタビューに遷移
    // → 閉じるボタンまたはコールバックでリストビューに戻ることを検証
    expect(true).toBe(false);
  });

  it("TC-015: ビュー遷移時に選択されたスキルが正しく渡される", () => {
    // render(<SkillManagementPanel />);
    // const editButtons = screen.getAllByRole("button", { name: /編集/ });
    // fireEvent.click(editButtons[0]);
    // → 遷移先コンポーネントに skill-alpha の情報が渡されることを検証
    expect(true).toBe(false);
  });
});
```

---

### タスク 5: スキル操作テストの作成

**目的**: 削除操作が Store アクションを正しく呼び出すことを検証するテストを作成する

**テストケース（3 件）**:

```typescript
describe("スキル操作", () => {
  it("TC-016: 削除ボタンをクリックすると removeSkill が skill.name で呼び出される", () => {
    // render(<SkillManagementPanel />);
    // const deleteButtons = screen.getAllByRole("button", { name: /削除/ });
    // await act(async () => { fireEvent.click(deleteButtons[0]); });
    // expect(mockRemoveSkill).toHaveBeenCalledWith("skill-alpha");
    // P44/P45対策: skill.id ではなく skill.name を使用
    expect(true).toBe(false);
  });

  it("TC-017: 削除ボタンをクリックすると確認ダイアログが表示される", () => {
    // render(<SkillManagementPanel />);
    // const deleteButtons = screen.getAllByRole("button", { name: /削除/ });
    // fireEvent.click(deleteButtons[0]);
    // → 確認メッセージが表示されることを検証
    expect(true).toBe(false);
  });

  it("TC-018: 確認ダイアログでキャンセルすると removeSkill は呼び出されない", () => {
    // render(<SkillManagementPanel />);
    // → 削除ダイアログでキャンセルした場合、removeSkill が呼び出されないことを検証
    expect(true).toBe(false);
  });
});
```

---

### タスク 6: ローディング状態・アクセシビリティテストの作成

**目的**: ローディング表示とアクセシビリティ要件を検証するテストを作成する

**テストケース（5 件）**:

```typescript
describe("ローディング状態", () => {
  it("TC-019: isLoadingSkills=true の場合「読み込み中...」が表示される", () => {
    // currentStoreState = { ...defaultStoreState, isLoadingSkills: true };
    // render(<SkillManagementPanel />);
    // expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    expect(true).toBe(false);
  });

  it("TC-020: isLoadingSkills=true の場合スキルカードは表示されない", () => {
    // currentStoreState = { ...defaultStoreState, isLoadingSkills: true };
    // render(<SkillManagementPanel />);
    // expect(screen.queryByText("skill-alpha")).not.toBeInTheDocument();
    expect(true).toBe(false);
  });
});

describe("アクセシビリティ", () => {
  it("TC-021: 検索入力に aria-label が付与されている", () => {
    // render(<SkillManagementPanel />);
    // const input = screen.getByPlaceholderText("スキルを検索...");
    // expect(input).toHaveAttribute("aria-label");
    expect(true).toBe(false);
  });

  it("TC-022: 操作ボタンに aria-label が付与されている", () => {
    // render(<SkillManagementPanel />);
    // const editButtons = screen.getAllByRole("button", { name: /編集/ });
    // expect(editButtons[0]).toHaveAttribute("aria-label");
    expect(true).toBe(false);
  });

  it("TC-023: スキル一覧に role=list が付与されている", () => {
    // render(<SkillManagementPanel />);
    // expect(screen.getByRole("list")).toBeInTheDocument();
    expect(true).toBe(false);
  });
});
```

---

### タスク 7: テストの Red 状態確認

**目的**: 全テストが失敗状態（Red）であることを確認する

**実行手順**:

1. 以下のコマンドを実行する:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx
```

2. 全 23 件のテストが FAIL であることを確認する
3. テスト実行結果を `outputs/phase-4/test-red-result.md` に記録する

**記録フォーマット**:

```markdown
# Phase 4 テスト Red 状態確認

- テスト件数: 23
- PASS: 0
- FAIL: 23
- 実行日時: YYYY-MM-DD HH:mm:ss（実行時に記録）
```

---

## 参照資料

| 参照資料               | パス                                                                                        | 内容                             |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件定義       | `phase-1-requirements.md`                                                                   | 受け入れ基準とテスト観点の確認   |
| Phase 2 設計           | `phase-2-design.md`                                                                         | コンポーネント設計との整合確認   |
| Phase 3 設計レビュー   | `phase-3-design-review.md`                                                                  | レビュー指摘のテスト反映確認     |
| UI コンポーネント仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | スキル管理 UI 仕様               |
| UI 機能仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 既存機能とのテスト境界確認       |
| UI デザイン原則        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Apple HIG                        |
| スキルインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ImportedSkill, SkillMetadata 型  |
| IPC API契約            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPCモックと契約整合              |
| 状態管理               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand 個別セレクタ設計         |
| テスト方針             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ基準・TDD ルール       |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | fireEvent vs userEvent 使い分け  |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                        | P9, P31, P39, P40, P44, P45, P47 |

---

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、一覧/検索/編集/分析/削除/新規作成の入力・戻り値契約を一致させる。
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する。
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する。

## 成果物

| 成果物               | パス                                                                                 | 説明                            |
| -------------------- | ------------------------------------------------------------------------------------ | ------------------------------- |
| テストファイル       | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx` | 23 件のテストケース（Red 状態） |
| Red 状態確認レポート | `outputs/phase-4/test-red-result.md`                                                 | テスト実行結果の記録            |

---

## 完了条件

- [ ] テストファイル `SkillManagementPanel.test.tsx` が作成されている
- [ ] テストケースが 23 件以上存在する
- [ ] テスト実行で全件 FAIL（Red 状態）であることを確認した
- [ ] モック設定が個別セレクタベース（P31 対策）で構成されている
- [ ] happy-dom 環境で fireEvent を使用している（P39 対策：userEvent 未使用）
- [ ] テスト間で状態が共有されない（P9 対策：beforeEach でリセット）
- [ ] テストケース ID が TC-001 から連番で付与されている
- [ ] `outputs/phase-4/test-red-result.md` が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 次の Phase

Phase 5: 実装（`phase-5-implementation.md`）
