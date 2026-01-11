# 状態管理ドキュメント - スキル管理UI

## 概要

本ドキュメントは、スキル管理UIの状態管理（Zustand Slice Pattern）の仕様を記載します。

---

## AgentSlice（スキル状態拡張）

### 配置

`apps/desktop/src/renderer/store/slices/agentSlice.ts`

### State定義

```typescript
export interface AgentState {
  // 既存の状態
  agents: Agent[];
  selectedAgent: Agent | null;
  // ...

  // スキル管理状態
  skills: Skill[];
  availableSkills: Skill[];
  selectedSkill: Skill | null;
  skillFilter: string;
  skillCategory: SkillCategory | null;
  importedSkillIds: string[];
  isImportDialogOpen: boolean;
  isLoading: boolean;
  error: string | null;
  toastMessage: { type: "success" | "error"; message: string } | null;
}
```

### 状態の説明

| 状態               | 型                    | 説明                 |
| ------------------ | --------------------- | -------------------- |
| skills             | Skill[]               | インポート済みスキル |
| availableSkills    | Skill[]               | 利用可能スキル       |
| selectedSkill      | Skill \| null         | 選択中のスキル       |
| skillFilter        | string                | 検索フィルター       |
| skillCategory      | SkillCategory \| null | カテゴリフィルター   |
| importedSkillIds   | string[]              | インポート済みID     |
| isImportDialogOpen | boolean               | ダイアログ表示状態   |
| isLoading          | boolean               | ローディング状態     |
| error              | string \| null        | エラーメッセージ     |
| toastMessage       | object \| null        | トースト通知         |

---

## Actions定義

```typescript
export interface AgentActions {
  // スキル取得
  fetchSkills: () => Promise<void>;
  fetchAvailableSkills: () => Promise<void>;

  // スキル選択
  selectSkill: (skill: Skill | null) => void;

  // フィルター
  setSkillFilter: (filter: string) => void;
  setSkillCategory: (category: SkillCategory | null) => void;

  // インポート・削除
  importSkills: (skillIds: string[]) => Promise<void>;
  removeSkill: (skillId: string) => Promise<void>;

  // ダイアログ制御
  openImportDialog: () => void;
  closeImportDialog: () => void;

  // エラー処理
  clearError: () => void;
  setToast: (
    toast: { type: "success" | "error"; message: string } | null,
  ) => void;
}
```

---

## Selectors定義

```typescript
// フィルタリングされたスキル
export const selectFilteredSkills = (state: AgentState): Skill[] => {
  return state.skills.filter((skill) => {
    // カテゴリフィルター
    if (state.skillCategory && skill.category !== state.skillCategory) {
      return false;
    }

    // 検索フィルター
    if (state.skillFilter) {
      const lowerFilter = state.skillFilter.toLowerCase();
      const matchName = skill.name.toLowerCase().includes(lowerFilter);
      const matchDescription = skill.description
        .toLowerCase()
        .includes(lowerFilter);
      const matchTriggers = skill.triggers.some((t) =>
        t.toLowerCase().includes(lowerFilter),
      );
      return matchName || matchDescription || matchTriggers;
    }

    return true;
  });
};

// 利用可能なカテゴリ
export const selectAvailableCategories = (
  state: AgentState,
): SkillCategory[] => {
  const categories = new Set<SkillCategory>();
  state.skills.forEach((skill) => {
    if (skill.category) {
      categories.add(skill.category);
    }
  });
  return Array.from(categories);
};
```

---

## 使用パターン

### 基本的な使用

```tsx
import { useAppStore } from "@/store";

const SkillListContainer: React.FC = () => {
  const {
    skills,
    selectedSkill,
    isLoading,
    skillFilter,
    skillCategory,
    fetchSkills,
    selectSkill,
  } = useAppStore();

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return (
    <SkillList
      skills={skills}
      selectedSkillId={selectedSkill?.id ?? null}
      onSkillSelect={selectSkill}
      isLoading={isLoading}
      filter={skillFilter}
      category={skillCategory}
    />
  );
};
```

### フィルタリング

```tsx
const SearchFilterSection: React.FC = () => {
  const { skillFilter, skillCategory, setSkillFilter, setSkillCategory } =
    useAppStore();

  return (
    <div className="flex gap-4">
      <SkillSearchBar value={skillFilter} onChange={setSkillFilter} />
      <SkillCategoryFilter
        value={skillCategory}
        onChange={setSkillCategory}
        categories={["development", "testing"]}
      />
    </div>
  );
};
```

### インポートフロー

```tsx
const ImportSection: React.FC = () => {
  const {
    isImportDialogOpen,
    availableSkills,
    importedSkillIds,
    openImportDialog,
    closeImportDialog,
    fetchAvailableSkills,
    importSkills,
  } = useAppStore();

  const handleOpenDialog = async () => {
    await fetchAvailableSkills();
    openImportDialog();
  };

  const handleImport = async (skillIds: string[]) => {
    await importSkills(skillIds);
    closeImportDialog();
  };

  return (
    <>
      <button onClick={handleOpenDialog}>インポート</button>
      <SkillImportDialog
        isOpen={isImportDialogOpen}
        onClose={closeImportDialog}
        availableSkills={availableSkills}
        importedSkillIds={importedSkillIds}
        onImport={handleImport}
      />
    </>
  );
};
```

---

## エラーハンドリングパターン

```typescript
// アクション内でのエラー処理
fetchSkills: async () => {
  try {
    set({ isLoading: true, error: null });
    const skills = await window.api.invoke("skill:list");
    set({ skills, isLoading: false });
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : "スキルの取得に失敗しました",
      isLoading: false,
    });
  }
},

// UIでのエラー表示
const SkillError: React.FC = () => {
  const { error, clearError } = useAppStore();

  if (!error) return null;

  return (
    <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
      <p className="text-red-200">{error}</p>
      <button onClick={clearError}>閉じる</button>
    </div>
  );
};
```

---

## 初期化パターン

```typescript
// アプリ起動時の初期化
initializeSkillState: async () => {
  try {
    // 永続化設定を読み込み
    const savedConfig = await window.api.invoke("config:get", "skills");
    if (savedConfig?.importedSkillIds) {
      set({ importedSkillIds: savedConfig.importedSkillIds });
    }

    // スキル一覧を取得
    await get().fetchSkills();
  } catch (error) {
    set({ error: error.message });
  }
},
```

---

## 確認チェックリスト

| 項目                       | 確認    |
| -------------------------- | ------- |
| State定義                  | ✅ 完了 |
| Actions定義                | ✅ 完了 |
| Selectors定義              | ✅ 完了 |
| 使用パターン例             | ✅ 完了 |
| エラーハンドリングパターン | ✅ 完了 |
