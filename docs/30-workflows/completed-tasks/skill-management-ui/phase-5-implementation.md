# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 5                   |
| Phase名    | 実装                |
| 前提Phase  | Phase 4             |
| 後続Phase  | Phase 6             |
| ステータス | 未実施              |
| 作成日     | 2026-01-10          |
| 機能名     | skill-management-ui |

---

## 目的

TDDのGreen段階として、Phase 4で作成したテストを通すための最小限の実装を行う。

## 背景

Phase 4で作成した全てのテストが失敗状態（Red）であることを前提に、テストを通すための実装を行う。過度な最適化は行わず、テストを通すことに集中する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Skill型定義の実装

**目的**: 共有パッケージにSkill型を定義する

**実行手順**:

1. ファイルを作成: `packages/shared/src/types/skill.ts`
2. Phase 2で設計した型定義を実装:

```typescript
/**
 * スキルの基本情報
 */
export interface Skill {
  /** 一意識別子（パスのハッシュ） */
  id: string;
  /** スキル名（SKILL.md解析） */
  name: string;
  /** ディレクトリ名 */
  slug: string;
  /** 概要説明 */
  description: string;
  /** .claude/skills/xxx/SKILL.md */
  path: string;
  /** Triggerキーワード */
  triggers: string[];
  /** Anchor一覧 */
  anchors: Anchor[];
  /** カテゴリ（推論または手動設定） */
  category?: SkillCategory;
  /** 最終更新日 */
  lastUpdated?: string;
}

export interface Anchor {
  source: string;
  application: string;
  purpose: string;
}

export type SkillCategory =
  | "testing"
  | "design"
  | "development"
  | "documentation"
  | "security"
  | "performance"
  | "other";

export const SKILL_CATEGORIES: Record<
  SkillCategory,
  { label: string; color: string }
> = {
  testing: { label: "テスト", color: "green" },
  design: { label: "設計", color: "blue" },
  development: { label: "開発", color: "purple" },
  documentation: { label: "ドキュメント", color: "orange" },
  security: { label: "セキュリティ", color: "red" },
  performance: { label: "パフォーマンス", color: "yellow" },
  other: { label: "その他", color: "gray" },
};
```

3. エクスポートを追加: `packages/shared/src/types/index.ts`

**期待される成果物**:

- `packages/shared/src/types/skill.ts`

---

### タスク2: SkillCardコンポーネントの実装

**目的**: スキルカードを表示するコンポーネントを実装する

**実行手順**:

1. ディレクトリを作成: `apps/desktop/src/renderer/components/molecules/SkillCard/`
2. `index.tsx`を実装:

```typescript
import React from 'react';
import { Skill, SKILL_CATEGORIES } from '@repo/shared/types/skill';

interface SkillCardProps {
  skill: Skill;
  isSelected: boolean;
  onClick: () => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, isSelected, onClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`スキル: ${skill.name}`}
      className={`
        w-full p-4 text-left rounded-xl
        bg-glass border border-glass-border
        transition-all duration-200
        hover:scale-[1.02] hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-primary
        ${isSelected ? 'ring-2 ring-primary' : ''}
      `}
    >
      <h3 className="text-lg font-semibold text-primary mb-2">
        {skill.name}
      </h3>
      <p className="text-sm text-muted line-clamp-2 mb-3">
        {skill.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {skill.triggers.slice(0, 3).map((trigger) => (
          <span
            key={trigger}
            className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground"
          >
            {trigger}
          </span>
        ))}
        {skill.category && (
          <span
            className={`px-2 py-0.5 text-xs rounded-full bg-${SKILL_CATEGORIES[skill.category].color}-500/20 text-${SKILL_CATEGORIES[skill.category].color}-400`}
          >
            {SKILL_CATEGORIES[skill.category].label}
          </span>
        )}
      </div>
    </button>
  );
};
```

3. テストを実行して成功することを確認

**期待される成果物**:

- `apps/desktop/src/renderer/components/molecules/SkillCard/index.tsx`

---

### タスク3: SkillSearchBar・SkillCategoryFilterの実装

**目的**: 検索・フィルタリングコンポーネントを実装する

**実行手順**:

1. SkillSearchBarを実装: `apps/desktop/src/renderer/components/molecules/SkillSearchBar/index.tsx`

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';

interface SkillSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SkillSearchBar: React.FC<SkillSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'スキルを検索...',
}) => {
  const [localValue, setLocalValue] = useState(value);

  // debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // 外部からの値変更に対応
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
        aria-label="検索"
      />
      <input
        type="search"
        role="searchbox"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        aria-label="スキルを検索"
        className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
};
```

2. SkillCategoryFilterを実装: `apps/desktop/src/renderer/components/molecules/SkillCategoryFilter/index.tsx`

```typescript
import React from 'react';
import { SkillCategory, SKILL_CATEGORIES } from '@repo/shared/types/skill';

interface SkillCategoryFilterProps {
  value: SkillCategory | null;
  onChange: (category: SkillCategory | null) => void;
  categories: SkillCategory[];
}

export const SkillCategoryFilter: React.FC<SkillCategoryFilterProps> = ({
  value,
  onChange,
  categories,
}) => {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value as SkillCategory || null)}
      aria-label="カテゴリでフィルター"
      className="px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="">全て</option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {SKILL_CATEGORIES[category].label}
        </option>
      ))}
    </select>
  );
};
```

3. テストを実行して成功することを確認

**期待される成果物**:

- `apps/desktop/src/renderer/components/molecules/SkillSearchBar/index.tsx`
- `apps/desktop/src/renderer/components/molecules/SkillCategoryFilter/index.tsx`

---

### タスク4: SkillList・SkillDetailPanelの実装

**目的**: 一覧表示・詳細表示コンポーネントを実装する

**実行手順**:

1. SkillListを実装: `apps/desktop/src/renderer/components/organisms/SkillList/index.tsx`

```typescript
import React, { useMemo } from 'react';
import { Skill, SkillCategory } from '@repo/shared/types/skill';
import { SkillCard } from '../../molecules/SkillCard';
import { Loader2 } from 'lucide-react';

interface SkillListProps {
  skills: Skill[];
  selectedSkillId: string | null;
  onSkillSelect: (skill: Skill) => void;
  isLoading: boolean;
  filter: string;
  category: SkillCategory | null;
}

export const SkillList: React.FC<SkillListProps> = ({
  skills,
  selectedSkillId,
  onSkillSelect,
  isLoading,
  filter,
  category,
}) => {
  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      // フィルター条件
      const matchesFilter = filter === '' ||
        skill.name.toLowerCase().includes(filter.toLowerCase()) ||
        skill.triggers.some((t) => t.toLowerCase().includes(filter.toLowerCase()));

      const matchesCategory = category === null || skill.category === category;

      return matchesFilter && matchesCategory;
    });
  }, [skills, filter, category]);

  if (isLoading) {
    return (
      <div role="status" className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">読み込み中...</span>
      </div>
    );
  }

  if (filteredSkills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted">
        <p>スキルがインポートされていません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredSkills.map((skill) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          isSelected={skill.id === selectedSkillId}
          onClick={() => onSkillSelect(skill)}
        />
      ))}
    </div>
  );
};
```

2. SkillDetailPanelを実装: `apps/desktop/src/renderer/components/organisms/SkillDetailPanel/index.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { Skill } from '@repo/shared/types/skill';
import { X, Play, Trash2 } from 'lucide-react';

interface SkillDetailPanelProps {
  skill: Skill | null;
  onExecute: (skill: Skill) => void;
  onDelete: (skill: Skill) => void;
  onClose: () => void;
}

export const SkillDetailPanel: React.FC<SkillDetailPanelProps> = ({
  skill,
  onExecute,
  onDelete,
  onClose,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!skill) {
    return null;
  }

  const handleDelete = () => {
    onDelete(skill);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="h-full p-6 bg-glass border-l border-glass-border overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{skill.name}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="p-2 rounded-lg hover:bg-secondary"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <p className="text-muted mb-6">{skill.description}</p>

      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2">Triggers</h3>
        <div className="flex flex-wrap gap-2">
          {skill.triggers.map((trigger) => (
            <span
              key={trigger}
              className="px-2 py-1 text-sm rounded-full bg-secondary"
            >
              {trigger}
            </span>
          ))}
        </div>
      </div>

      {skill.anchors.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Anchors</h3>
          <ul className="space-y-2">
            {skill.anchors.map((anchor, index) => (
              <li key={index} className="text-sm">
                <span className="font-medium">{anchor.source}</span>
                <span className="text-muted"> - {anchor.application}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onExecute(skill)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Play className="h-4 w-4" />
          実行
        </button>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            <Trash2 className="h-4 w-4" />
            削除
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground"
            >
              はい
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 rounded-lg bg-secondary"
            >
              キャンセル
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

3. テストを実行して成功することを確認

**期待される成果物**:

- `apps/desktop/src/renderer/components/organisms/SkillList/index.tsx`
- `apps/desktop/src/renderer/components/organisms/SkillDetailPanel/index.tsx`

---

### タスク5: SkillImportDialogの実装

**目的**: スキルインポートダイアログを実装する

**実行手順**:

1. ファイルを作成: `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`
2. 実装を行う（モーダル、チェックボックスリスト、検索機能）
3. テストを実行して成功することを確認

**期待される成果物**:

- `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`

---

### タスク6: Zustand agentSlice拡張

**目的**: スキル管理用の状態管理を実装する

**実行手順**:

1. `apps/desktop/src/renderer/store/slices/agentSlice.ts`を更新
2. Phase 2で設計した状態・アクションを追加
3. IPC連携のアクションを実装

**期待される成果物**:

- `apps/desktop/src/renderer/store/slices/agentSlice.ts`（更新）

---

### タスク7: AgentViewへの統合

**目的**: 全コンポーネントをAgentViewに統合する

**実行手順**:

1. `apps/desktop/src/renderer/views/AgentView/index.tsx`を更新
2. SkillManagementSectionを追加
3. 全コンポーネントを接続

**期待される成果物**:

- `apps/desktop/src/renderer/views/AgentView/index.tsx`（更新）

---

### タスク8: 全テスト実行・Green確認

**目的**: 全てのテストがパスすることを確認する

**実行手順**:

1. 全テストを実行:

```bash
pnpm --filter @repo/desktop test
```

2. 全てのテストがパス（Green）することを確認

**期待される成果物**:

- テスト結果レポート（`outputs/phase-5/test-result.md`）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                         | 内容                  |
| ------------------------- | ---------------------------------------------------------------------------- | --------------------- |
| UI/UXコンポーネント仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | Props設計パターン     |
| UI/UXデザインシステム仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`   | Glass Panel、スタイル |
| アーキテクチャパターン    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Zustand Sliceパターン |
| Phase 2成果物             | `outputs/phase-2/design.md`                                                  | 設計書                |
| Phase 4成果物             | テストファイル群                                                             | テストケース          |

---

## 成果物

| 成果物              | パス                                                                           | 内容                 |
| ------------------- | ------------------------------------------------------------------------------ | -------------------- |
| Skill型定義         | `packages/shared/src/types/skill.ts`                                           | 型定義               |
| SkillCard           | `apps/desktop/src/renderer/components/molecules/SkillCard/index.tsx`           | カードコンポーネント |
| SkillSearchBar      | `apps/desktop/src/renderer/components/molecules/SkillSearchBar/index.tsx`      | 検索バー             |
| SkillCategoryFilter | `apps/desktop/src/renderer/components/molecules/SkillCategoryFilter/index.tsx` | フィルター           |
| SkillList           | `apps/desktop/src/renderer/components/organisms/SkillList/index.tsx`           | 一覧表示             |
| SkillDetailPanel    | `apps/desktop/src/renderer/components/organisms/SkillDetailPanel/index.tsx`    | 詳細パネル           |
| SkillImportDialog   | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`   | インポートダイアログ |
| agentSlice更新      | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                         | 状態管理             |
| AgentView更新       | `apps/desktop/src/renderer/views/AgentView/index.tsx`                          | ビュー統合           |
| テスト結果          | `outputs/phase-5/test-result.md`                                               | Green確認            |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 5での統合テスト連携アクション

- UI/IPC接続の実装とテスト支援コード整備
- モックデータでのIPC通信テスト
- Zustand状態とUIの接続確認

---

## 完了条件

- [ ] 全コンポーネントが実装されている
- [ ] スキル一覧が表示される
- [ ] 検索・フィルタリングが動作する
- [ ] 詳細パネルが表示される
- [ ] インポートダイアログが動作する
- [ ] テストがすべて通過（Green）

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

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-management-ui/phase-6-test-expansion.md`
