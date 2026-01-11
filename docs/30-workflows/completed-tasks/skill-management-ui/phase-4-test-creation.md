# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 4                   |
| Phase名    | テスト作成          |
| 前提Phase  | Phase 3             |
| 後続Phase  | Phase 5             |
| ステータス | 未実施              |
| 作成日     | 2026-01-10          |
| 機能名     | skill-management-ui |

---

## 目的

TDDのRed段階として、期待される動作を検証するテストを実装より先に作成する。

## 背景

Phase 3で設計がレビュー済みの状態を前提とし、各コンポーネント・統合ポイントのテストを作成する。テストは全て失敗状態（Red）であることを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: SkillCardコンポーネントのテスト作成

**目的**: SkillCardの表示・インタラクションをテストする

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/renderer/components/molecules/SkillCard/__tests__/SkillCard.test.tsx`
2. 以下のテストケースを実装:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillCard } from '../index';
import { Skill } from '@repo/shared/types/skill';

const mockSkill: Skill = {
  id: 'skill-1',
  name: 'tdd-principles',
  slug: 'tdd-principles',
  description: 'TDD原則に従った開発ガイド',
  path: '.claude/skills/tdd-principles/SKILL.md',
  triggers: ['tdd', 'test'],
  anchors: [{ source: 'TDD by Example', application: 'Red-Green-Refactor', purpose: 'テスト駆動開発' }],
  category: 'testing',
};

describe('SkillCard', () => {
  it('should display skill name', () => {
    render(<SkillCard skill={mockSkill} isSelected={false} onClick={jest.fn()} />);
    expect(screen.getByText('tdd-principles')).toBeInTheDocument();
  });

  it('should display skill description', () => {
    render(<SkillCard skill={mockSkill} isSelected={false} onClick={jest.fn()} />);
    expect(screen.getByText('TDD原則に従った開発ガイド')).toBeInTheDocument();
  });

  it('should display trigger badges', () => {
    render(<SkillCard skill={mockSkill} isSelected={false} onClick={jest.fn()} />);
    expect(screen.getByText('tdd')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should highlight when selected', () => {
    render(<SkillCard skill={mockSkill} isSelected={true} onClick={jest.fn()} />);
    const card = screen.getByRole('button');
    expect(card).toHaveClass('ring-2');
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<SkillCard skill={mockSkill} isSelected={false} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be keyboard accessible', () => {
    const handleClick = jest.fn();
    render(<SkillCard skill={mockSkill} isSelected={false} onClick={handleClick} />);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have proper aria-label', () => {
    render(<SkillCard skill={mockSkill} isSelected={false} onClick={jest.fn()} />);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'スキル: tdd-principles');
  });
});
```

3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/components/molecules/SkillCard/__tests__/SkillCard.test.tsx`

---

### タスク2: SkillListコンポーネントのテスト作成

**目的**: SkillListの一覧表示・フィルタリングをテストする

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/renderer/components/organisms/SkillList/__tests__/SkillList.test.tsx`
2. 以下のテストケースを実装:

```typescript
import { render, screen } from '@testing-library/react';
import { SkillList } from '../index';
import { Skill } from '@repo/shared/types/skill';

const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    name: 'tdd-principles',
    slug: 'tdd-principles',
    description: 'TDD原則',
    path: '.claude/skills/tdd-principles/SKILL.md',
    triggers: ['tdd', 'test'],
    anchors: [],
    category: 'testing',
  },
  {
    id: 'skill-2',
    name: 'code-review',
    slug: 'code-review',
    description: 'コードレビューガイド',
    path: '.claude/skills/code-review/SKILL.md',
    triggers: ['review', 'code'],
    anchors: [],
    category: 'development',
  },
];

describe('SkillList', () => {
  it('should render skill cards', () => {
    render(
      <SkillList
        skills={mockSkills}
        selectedSkillId={null}
        onSkillSelect={jest.fn()}
        isLoading={false}
        filter=""
        category={null}
      />
    );
    expect(screen.getByText('tdd-principles')).toBeInTheDocument();
    expect(screen.getByText('code-review')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(
      <SkillList
        skills={[]}
        selectedSkillId={null}
        onSkillSelect={jest.fn()}
        isLoading={true}
        filter=""
        category={null}
      />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display empty state when no skills', () => {
    render(
      <SkillList
        skills={[]}
        selectedSkillId={null}
        onSkillSelect={jest.fn()}
        isLoading={false}
        filter=""
        category={null}
      />
    );
    expect(screen.getByText('スキルがインポートされていません')).toBeInTheDocument();
  });

  it('should filter skills by search term', () => {
    render(
      <SkillList
        skills={mockSkills}
        selectedSkillId={null}
        onSkillSelect={jest.fn()}
        isLoading={false}
        filter="tdd"
        category={null}
      />
    );
    expect(screen.getByText('tdd-principles')).toBeInTheDocument();
    expect(screen.queryByText('code-review')).not.toBeInTheDocument();
  });

  it('should filter skills by category', () => {
    render(
      <SkillList
        skills={mockSkills}
        selectedSkillId={null}
        onSkillSelect={jest.fn()}
        isLoading={false}
        filter=""
        category="testing"
      />
    );
    expect(screen.getByText('tdd-principles')).toBeInTheDocument();
    expect(screen.queryByText('code-review')).not.toBeInTheDocument();
  });

  it('should highlight selected skill', () => {
    render(
      <SkillList
        skills={mockSkills}
        selectedSkillId="skill-1"
        onSkillSelect={jest.fn()}
        isLoading={false}
        filter=""
        category={null}
      />
    );
    const selectedCard = screen.getByText('tdd-principles').closest('button');
    expect(selectedCard).toHaveClass('ring-2');
  });
});
```

3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/components/organisms/SkillList/__tests__/SkillList.test.tsx`

---

### タスク3: SkillDetailPanelコンポーネントのテスト作成

**目的**: SkillDetailPanelの詳細表示・アクションをテストする

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/renderer/components/organisms/SkillDetailPanel/__tests__/SkillDetailPanel.test.tsx`
2. 以下のテストケースを実装:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillDetailPanel } from '../index';
import { Skill } from '@repo/shared/types/skill';

const mockSkill: Skill = {
  id: 'skill-1',
  name: 'tdd-principles',
  slug: 'tdd-principles',
  description: 'TDD原則に従った開発ガイド',
  path: '.claude/skills/tdd-principles/SKILL.md',
  triggers: ['tdd', 'test'],
  anchors: [
    { source: 'TDD by Example', application: 'Red-Green-Refactor', purpose: 'テスト駆動開発' },
    { source: 'Clean Code', application: 'テスト可読性', purpose: 'メンテナンス性' },
  ],
  category: 'testing',
};

describe('SkillDetailPanel', () => {
  it('should display skill name', () => {
    render(
      <SkillDetailPanel
        skill={mockSkill}
        onExecute={jest.fn()}
        onDelete={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByRole('heading', { name: 'tdd-principles' })).toBeInTheDocument();
  });

  it('should display skill description', () => {
    render(
      <SkillDetailPanel
        skill={mockSkill}
        onExecute={jest.fn()}
        onDelete={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText('TDD原則に従った開発ガイド')).toBeInTheDocument();
  });

  it('should display triggers', () => {
    render(
      <SkillDetailPanel
        skill={mockSkill}
        onExecute={jest.fn()}
        onDelete={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText('tdd')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should display anchors list', () => {
    render(
      <SkillDetailPanel
        skill={mockSkill}
        onExecute={jest.fn()}
        onDelete={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText('TDD by Example')).toBeInTheDocument();
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
  });

  it('should call onExecute when execute button clicked', () => {
    const handleExecute = jest.fn();
    render(
      <SkillDetailPanel
        skill={mockSkill}
        onExecute={handleExecute}
        onDelete={jest.fn()}
        onClose={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /実行/i }));
    expect(handleExecute).toHaveBeenCalledWith(mockSkill);
  });

  it('should call onDelete when delete button clicked and confirmed', () => {
    const handleDelete = jest.fn();
    render(
      <SkillDetailPanel
        skill={mockSkill}
        onExecute={jest.fn()}
        onDelete={handleDelete}
        onClose={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /削除/i }));
    // 確認ダイアログで「はい」をクリック
    fireEvent.click(screen.getByRole('button', { name: /はい/i }));
    expect(handleDelete).toHaveBeenCalledWith(mockSkill);
  });

  it('should call onClose when close button clicked', () => {
    const handleClose = jest.fn();
    render(
      <SkillDetailPanel
        skill={mockSkill}
        onExecute={jest.fn()}
        onDelete={jest.fn()}
        onClose={handleClose}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /閉じる/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should close on Escape key', () => {
    const handleClose = jest.fn();
    render(
      <SkillDetailPanel
        skill={mockSkill}
        onExecute={jest.fn()}
        onDelete={jest.fn()}
        onClose={handleClose}
      />
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should return null when skill is null', () => {
    const { container } = render(
      <SkillDetailPanel
        skill={null}
        onExecute={jest.fn()}
        onDelete={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
```

3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/components/organisms/SkillDetailPanel/__tests__/SkillDetailPanel.test.tsx`

---

### タスク4: SkillSearchBar・SkillCategoryFilterのテスト作成

**目的**: 検索・フィルタリングコンポーネントをテストする

**実行手順**:

1. テストファイルを作成:
   - `apps/desktop/src/renderer/components/molecules/SkillSearchBar/__tests__/SkillSearchBar.test.tsx`
   - `apps/desktop/src/renderer/components/molecules/SkillCategoryFilter/__tests__/SkillCategoryFilter.test.tsx`

2. SkillSearchBarのテストケース:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SkillSearchBar } from '../index';

describe('SkillSearchBar', () => {
  it('should render input field', () => {
    render(<SkillSearchBar value="" onChange={jest.fn()} />);
    expect(screen.getByPlaceholderText('スキルを検索...')).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<SkillSearchBar value="tdd" onChange={jest.fn()} />);
    expect(screen.getByDisplayValue('tdd')).toBeInTheDocument();
  });

  it('should call onChange with debounce', async () => {
    const handleChange = jest.fn();
    render(<SkillSearchBar value="" onChange={handleChange} />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'test' } });

    // debounce 300ms
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith('test');
    }, { timeout: 500 });
  });

  it('should have search icon', () => {
    render(<SkillSearchBar value="" onChange={jest.fn()} />);
    expect(screen.getByLabelText('検索')).toBeInTheDocument();
  });

  it('should have proper aria attributes', () => {
    render(<SkillSearchBar value="" onChange={jest.fn()} />);
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-label', 'スキルを検索');
  });
});
```

3. SkillCategoryFilterのテストケース:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillCategoryFilter } from '../index';
import { SKILL_CATEGORIES } from '@repo/shared/types/skill';

describe('SkillCategoryFilter', () => {
  const categories = Object.keys(SKILL_CATEGORIES) as (keyof typeof SKILL_CATEGORIES)[];

  it('should render select element', () => {
    render(<SkillCategoryFilter value={null} onChange={jest.fn()} categories={categories} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should display all categories', () => {
    render(<SkillCategoryFilter value={null} onChange={jest.fn()} categories={categories} />);
    fireEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('テスト')).toBeInTheDocument();
    expect(screen.getByText('設計')).toBeInTheDocument();
    expect(screen.getByText('開発')).toBeInTheDocument();
  });

  it('should call onChange when category selected', () => {
    const handleChange = jest.fn();
    render(<SkillCategoryFilter value={null} onChange={handleChange} categories={categories} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'testing' } });
    expect(handleChange).toHaveBeenCalledWith('testing');
  });

  it('should display "全て" option for null value', () => {
    render(<SkillCategoryFilter value={null} onChange={jest.fn()} categories={categories} />);
    expect(screen.getByDisplayValue('全て')).toBeInTheDocument();
  });

  it('should have proper aria-label', () => {
    render(<SkillCategoryFilter value={null} onChange={jest.fn()} categories={categories} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', 'カテゴリでフィルター');
  });
});
```

4. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/components/molecules/SkillSearchBar/__tests__/SkillSearchBar.test.tsx`
- `apps/desktop/src/renderer/components/molecules/SkillCategoryFilter/__tests__/SkillCategoryFilter.test.tsx`

---

### タスク5: SkillImportDialogのテスト作成

**目的**: インポートダイアログの表示・操作をテストする

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx`
2. 以下のテストケースを実装:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillImportDialog } from '../index';
import { Skill } from '@repo/shared/types/skill';

const mockAvailableSkills: Skill[] = [
  {
    id: 'skill-1',
    name: 'tdd-principles',
    slug: 'tdd-principles',
    description: 'TDD原則',
    path: '.claude/skills/tdd-principles/SKILL.md',
    triggers: ['tdd'],
    anchors: [],
  },
  {
    id: 'skill-2',
    name: 'code-review',
    slug: 'code-review',
    description: 'コードレビュー',
    path: '.claude/skills/code-review/SKILL.md',
    triggers: ['review'],
    anchors: [],
  },
];

describe('SkillImportDialog', () => {
  it('should not render when closed', () => {
    render(
      <SkillImportDialog
        isOpen={false}
        onClose={jest.fn()}
        availableSkills={mockAvailableSkills}
        importedSkillIds={[]}
        onImport={jest.fn()}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(
      <SkillImportDialog
        isOpen={true}
        onClose={jest.fn()}
        availableSkills={mockAvailableSkills}
        importedSkillIds={[]}
        onImport={jest.fn()}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display available skills', () => {
    render(
      <SkillImportDialog
        isOpen={true}
        onClose={jest.fn()}
        availableSkills={mockAvailableSkills}
        importedSkillIds={[]}
        onImport={jest.fn()}
      />
    );
    expect(screen.getByText('tdd-principles')).toBeInTheDocument();
    expect(screen.getByText('code-review')).toBeInTheDocument();
  });

  it('should mark already imported skills', () => {
    render(
      <SkillImportDialog
        isOpen={true}
        onClose={jest.fn()}
        availableSkills={mockAvailableSkills}
        importedSkillIds={['skill-1']}
        onImport={jest.fn()}
      />
    );
    const checkbox = screen.getByLabelText('tdd-principles');
    expect(checkbox).toBeChecked();
    expect(checkbox).toBeDisabled();
  });

  it('should allow selecting skills', () => {
    render(
      <SkillImportDialog
        isOpen={true}
        onClose={jest.fn()}
        availableSkills={mockAvailableSkills}
        importedSkillIds={[]}
        onImport={jest.fn()}
      />
    );
    const checkbox = screen.getByLabelText('tdd-principles');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('should call onImport with selected skill ids', () => {
    const handleImport = jest.fn();
    render(
      <SkillImportDialog
        isOpen={true}
        onClose={jest.fn()}
        availableSkills={mockAvailableSkills}
        importedSkillIds={[]}
        onImport={handleImport}
      />
    );

    fireEvent.click(screen.getByLabelText('tdd-principles'));
    fireEvent.click(screen.getByLabelText('code-review'));
    fireEvent.click(screen.getByRole('button', { name: /インポート/i }));

    expect(handleImport).toHaveBeenCalledWith(['skill-1', 'skill-2']);
  });

  it('should call onClose when cancel button clicked', () => {
    const handleClose = jest.fn();
    render(
      <SkillImportDialog
        isOpen={true}
        onClose={handleClose}
        availableSkills={mockAvailableSkills}
        importedSkillIds={[]}
        onImport={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /キャンセル/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should close on Escape key', () => {
    const handleClose = jest.fn();
    render(
      <SkillImportDialog
        isOpen={true}
        onClose={handleClose}
        availableSkills={mockAvailableSkills}
        importedSkillIds={[]}
        onImport={jest.fn()}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should have search functionality', () => {
    render(
      <SkillImportDialog
        isOpen={true}
        onClose={jest.fn()}
        availableSkills={mockAvailableSkills}
        importedSkillIds={[]}
        onImport={jest.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('スキルを検索...'), { target: { value: 'tdd' } });
    expect(screen.getByText('tdd-principles')).toBeInTheDocument();
    expect(screen.queryByText('code-review')).not.toBeInTheDocument();
  });
});
```

3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx`

---

### タスク6: 統合テストシナリオの作成

**目的**: コンポーネント間の連携をテストするシナリオを作成する

**実行手順**:

1. 統合テストファイルを作成: `apps/desktop/src/renderer/views/AgentView/__tests__/SkillManagement.integration.test.tsx`
2. 以下のテストシナリオを実装:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AgentView } from '../index';
import { useStore } from '../../../store';

// モックデータ
const mockSkills = [
  { id: 'skill-1', name: 'tdd-principles', description: 'TDD原則', triggers: ['tdd'], anchors: [], path: '', slug: '' },
  { id: 'skill-2', name: 'code-review', description: 'コードレビュー', triggers: ['review'], anchors: [], path: '', slug: '' },
];

// IPC APIモック
jest.mock('../../../preload', () => ({
  skillAPI: {
    listAvailable: jest.fn().mockResolvedValue(mockSkills),
    listImported: jest.fn().mockResolvedValue([]),
    import: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('SkillManagement Integration', () => {
  beforeEach(() => {
    useStore.getState().resetAgentState();
  });

  describe('API接続テスト', () => {
    it('should fetch and display skills on mount', async () => {
      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText('tdd-principles')).toBeInTheDocument();
      });
    });

    it('should handle API error gracefully', async () => {
      // エラーをモック
      jest.spyOn(window.skillAPI, 'listImported').mockRejectedValueOnce(new Error('API Error'));

      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });
    });
  });

  describe('データフローテスト', () => {
    it('should flow: search -> filter -> display -> select -> detail', async () => {
      render(<AgentView />);

      // 検索
      fireEvent.change(screen.getByPlaceholderText('スキルを検索...'), { target: { value: 'tdd' } });

      await waitFor(() => {
        expect(screen.getByText('tdd-principles')).toBeInTheDocument();
        expect(screen.queryByText('code-review')).not.toBeInTheDocument();
      });

      // 選択
      fireEvent.click(screen.getByText('tdd-principles'));

      // 詳細表示確認
      expect(screen.getByRole('heading', { name: 'tdd-principles' })).toBeInTheDocument();
    });
  });

  describe('エラーハンドリングテスト', () => {
    it('should show error toast on import failure', async () => {
      jest.spyOn(window.skillAPI, 'import').mockRejectedValueOnce(new Error('Import failed'));

      render(<AgentView />);

      // インポートダイアログを開く
      fireEvent.click(screen.getByRole('button', { name: /インポート/i }));

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('tdd-principles'));
        fireEvent.click(screen.getByRole('button', { name: /インポート/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(/インポートに失敗しました/i)).toBeInTheDocument();
      });
    });
  });

  describe('状態同期テスト', () => {
    it('should sync state between components', async () => {
      render(<AgentView />);

      // 検索バーの変更がリストに反映される
      fireEvent.change(screen.getByPlaceholderText('スキルを検索...'), { target: { value: 'tdd' } });

      await waitFor(() => {
        // Zustand状態の確認
        expect(useStore.getState().skillFilter).toBe('tdd');
      });
    });
  });
});
```

3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/views/AgentView/__tests__/SkillManagement.integration.test.tsx`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料      | パス                                                                        | 内容               |
| ------------- | --------------------------------------------------------------------------- | ------------------ |
| Phase 2成果物 | `outputs/phase-2/design.md`                                                 | コンポーネント設計 |
| Phase 3成果物 | `outputs/phase-3/review-result.md`                                          | 設計レビュー結果   |
| 品質要件      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト要件         |

---

## 成果物

| 成果物                    | パス                                                                                                        | 内容                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------- |
| SkillCardテスト           | `apps/desktop/src/renderer/components/molecules/SkillCard/__tests__/SkillCard.test.tsx`                     | カードコンポーネント |
| SkillListテスト           | `apps/desktop/src/renderer/components/organisms/SkillList/__tests__/SkillList.test.tsx`                     | 一覧コンポーネント   |
| SkillDetailPanelテスト    | `apps/desktop/src/renderer/components/organisms/SkillDetailPanel/__tests__/SkillDetailPanel.test.tsx`       | 詳細パネル           |
| SkillSearchBarテスト      | `apps/desktop/src/renderer/components/molecules/SkillSearchBar/__tests__/SkillSearchBar.test.tsx`           | 検索バー             |
| SkillCategoryFilterテスト | `apps/desktop/src/renderer/components/molecules/SkillCategoryFilter/__tests__/SkillCategoryFilter.test.tsx` | フィルター           |
| SkillImportDialogテスト   | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx`     | インポートダイアログ |
| 統合テスト                | `apps/desktop/src/renderer/views/AgentView/__tests__/SkillManagement.integration.test.tsx`                  | 統合テスト           |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 4での統合テスト連携アクション

- 統合テストシナリオを全カテゴリで作成:
  - API接続テスト
  - データフローテスト
  - エラーハンドリングテスト
  - 状態同期テスト

---

## 完了条件

- [ ] 各コンポーネントのユニットテストがある
- [ ] フィルタリングロジックのテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-management-ui/phase-5-implementation.md`
