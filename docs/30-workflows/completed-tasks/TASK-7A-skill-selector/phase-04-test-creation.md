# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 4                      |
| 機能名 | TASK-7A-skill-selector |
| 作成日 | 2026-01-30             |

## 目的

SkillSelector コンポーネントの期待動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- テストシナリオ設計: 受け入れ基準からテストケースを導出
- コンポーネントテスト作成: React Testing Library を使用したユニットテスト
- アクセシビリティテスト: ARIA属性・キーボードナビゲーションのテスト
- 境界値テスト: エッジケース（空リスト、単一スキル等）のテスト

## 参照資料

| 資料名             | パス                                                         | 説明               |
| ------------------ | ------------------------------------------------------------ | ------------------ |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`                 | Phase 1成果物      |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`                     | Phase 1成果物      |
| コンポーネント設計 | `outputs/phase-2/component-design.md`                        | Phase 2成果物      |
| 設計レビュー       | `outputs/phase-3/design-review-result.md`                    | Phase 3成果物      |
| ModelSelector      | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx` | テストパターン参考 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                         | 内容                 |
| -------------------- | ---------------------------------------------------------------------------- | -------------------- |
| UIコンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    | コンポーネント階層   |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | skillSliceモック方針 |

## 実行手順

### ステップ1: テスト環境セットアップ

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx

import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillSelector } from "../SkillSelector";

// useAppStore モック
vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
}));

import { useAppStore } from "../../../store";
const mockUseAppStore = vi.mocked(useAppStore);
```

### ステップ2: テストケース定義

タスク仕様書で指定された8テストケースに加え、追加テストケースを定義:

**基本動作テスト**:

| TC-ID  | テストケース名                             | 対応要件 | 優先度 |
| ------ | ------------------------------------------ | -------- | ------ |
| TC-001 | スキル未選択時に「なし」と表示される       | FR-05    | 高     |
| TC-002 | クリックでドロップダウンが開く             | FR-01    | 高     |
| TC-003 | 外側クリックでドロップダウンが閉じる       | NFR-03   | 高     |
| TC-004 | オプションクリックでスキルが選択される     | FR-03    | 高     |
| TC-005 | インポート済みスキルセクションが表示される | FR-03    | 高     |
| TC-006 | 利用可能スキルセクションが表示される       | FR-04    | 高     |
| TC-007 | キーボードナビゲーションが動作する         | NFR-02   | 高     |
| TC-008 | 再スキャンボタンクリックで関数が呼ばれる   | FR-06    | 中     |

**追加テスト**:

| TC-ID  | テストケース名                              | 対応要件     | 優先度 |
| ------ | ------------------------------------------- | ------------ | ------ |
| TC-009 | 「なし」選択で selectSkill(null) が呼ばれる | FR-02        | 高     |
| TC-010 | 選択中スキル名がトリガーに表示される        | FR-05        | 高     |
| TC-011 | スキャン中に再スキャンボタンが無効化される  | FR-06        | 中     |
| TC-012 | ARIA属性が正しく設定されている              | NFR-01       | 高     |
| TC-013 | 空のスキルリストで適切に表示される          | エッジケース | 中     |

### ステップ3: テスト実装

```typescript
describe("SkillSelector", () => {
  const mockSelectSkill = vi.fn();
  const mockRescanSkills = vi.fn();

  const defaultStoreState = {
    availableSkills: [
      { name: "skill-a", description: "Skill A description", version: "1.0.0" },
      { name: "skill-b", description: "Skill B description", version: "1.0.0" },
    ],
    importedSkills: [
      {
        name: "skill-a",
        description: "Skill A description",
        agents: [{ name: "agent1" }],
        references: [{ name: "ref1" }, { name: "ref2" }],
      },
    ],
    selectedSkillName: null,
    isLoadingSkills: false,
    isScanning: false,
    selectSkill: mockSelectSkill,
    rescanSkills: mockRescanSkills,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppStore.mockReturnValue(defaultStoreState);
  });

  it("should render with no skill selected", () => {
    render(<SkillSelector />);
    expect(screen.getByText("なし")).toBeInTheDocument();
  });

  it("should open dropdown when clicked", () => {
    render(<SkillSelector />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("should close dropdown when clicking outside", () => {
    render(<SkillSelector />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("should select skill when option clicked", () => {
    render(<SkillSelector />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("skill-a"));
    expect(mockSelectSkill).toHaveBeenCalledWith("skill-a");
  });

  it("should show imported skills section", () => {
    render(<SkillSelector />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText(/インポート済み/)).toBeInTheDocument();
  });

  it("should show available skills section", () => {
    render(<SkillSelector />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText(/利用可能なスキル/)).toBeInTheDocument();
  });

  it("should handle keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("should call rescan when button clicked", () => {
    render(<SkillSelector />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText(/再スキャン/));
    expect(mockRescanSkills).toHaveBeenCalled();
  });

  it("should select null when 'none' option clicked", () => {
    render(<SkillSelector />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText(/スキルを使用しない/));
    expect(mockSelectSkill).toHaveBeenCalledWith(null);
  });

  it("should display selected skill name in trigger", () => {
    mockUseAppStore.mockReturnValue({
      ...defaultStoreState,
      selectedSkillName: "skill-a",
    });
    render(<SkillSelector />);
    expect(screen.getByText("skill-a")).toBeInTheDocument();
  });

  it("should disable rescan button while scanning", () => {
    mockUseAppStore.mockReturnValue({
      ...defaultStoreState,
      isScanning: true,
    });
    render(<SkillSelector />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText(/スキャン中/)).toBeInTheDocument();
  });

  it("should have correct ARIA attributes", () => {
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("should render empty state when no skills available", () => {
    mockUseAppStore.mockReturnValue({
      ...defaultStoreState,
      availableSkills: [],
      importedSkills: [],
    });
    render(<SkillSelector />);
    fireEvent.click(screen.getByRole("combobox"));
    // ドロップダウンは開くが「なし」のみ表示
    expect(screen.getByText(/スキルを使用しない/)).toBeInTheDocument();
  });
});
```

## 統合テスト連携【必須】

統合テストシナリオを設計する:

| シナリオカテゴリ   | 検証内容                                     | テストファイル           |
| ------------------ | -------------------------------------------- | ------------------------ |
| Store連携テスト    | useAppStore モックによる状態取得・アクション | `SkillSelector.test.tsx` |
| コンポーネント連携 | SkillOption / SkillOptionUnimported 表示     | `SkillSelector.test.tsx` |

## アーキテクチャ層別テスト（AIが判断）

| 層               | テスト観点                     | テストファイル配置                                                            |
| ---------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| Renderer Process | UIコンポーネント、状態管理連携 | `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx` |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                               | 仕様参照先                                   |
| ------------------ | -------------------------------------- | -------------------------------------------- |
| セキュリティ       | スキル名・説明文の表示時XSS防止        | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装のため適用           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | Renderer Process内完結の確認           | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | rescanSkills失敗時の表示・空リスト対応 | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 不要な再レンダリング防止               | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | WAI-ARIA Listboxパターン準拠           | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断               | 仕様参照先                            |
| -------------------------- | ---------------------- | ------------------------------------- |
| フロントエンド（Renderer） | UI/React実装のため適用 | `aiworkflow-requirements: ui-ux-*.md` |

## 成果物

| 成果物         | パス                                                                          | 説明         |
| -------------- | ----------------------------------------------------------------------------- | ------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                       | テスト設計   |
| テストケース   | `outputs/phase-4/test-cases.md`                                               | ケース一覧   |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx` | テストコード |

## 完了条件

- [ ] 受け入れ基準ごとにテストケースがある（13件以上）
- [ ] 基本動作テスト（8件）が定義されている
- [ ] アクセシビリティテスト（ARIA属性確認）が含まれている
- [ ] エッジケーステスト（空リスト）が含まれている
- [ ] すべてのテストが失敗状態（Red）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. テスト環境セットアップ
3. 基本動作テスト作成（TC-001〜TC-008）
4. 追加テスト作成（TC-009〜TC-013）
5. Red状態の確認
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7A-skill-selector --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
