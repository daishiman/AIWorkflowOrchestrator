# 状態管理設計書 - スキル管理UI（AGENT-002）

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | AGENT-002  |
| Phase    | 2          |
| 作成日   | 2026-01-11 |

---

## 1. 概要

Zustand Sliceパターンに従い、スキル管理UIの状態管理を設計する。既存の`agentSlice`を拡張し、スキル管理に必要な状態とアクションを追加する。

---

## 2. 状態設計

### 2.1 SkillManagementState

```typescript
// apps/desktop/src/renderer/store/slices/skillSlice.ts

import { StateCreator } from "zustand";
import type {
  Skill,
  SkillCategory,
  SkillDetail,
} from "@repo/shared/types/skill";

/**
 * スキル管理の状態
 */
export interface SkillManagementState {
  /** 利用可能なスキル一覧（.claude/skills/配下） */
  availableSkills: Skill[];

  /** インポート済みスキル一覧 */
  importedSkills: Skill[];

  /** 選択中のスキル */
  selectedSkill: Skill | null;

  /** 選択中スキルの詳細情報 */
  selectedSkillDetail: SkillDetail | null;

  /** 検索フィルター */
  skillFilter: string;

  /** カテゴリフィルター */
  skillCategory: SkillCategory | null;

  /** スキル読み込み中 */
  isLoadingSkills: boolean;

  /** スキル詳細読み込み中 */
  isLoadingSkillDetail: boolean;

  /** インポート処理中 */
  isImporting: boolean;

  /** 削除処理中 */
  isRemoving: boolean;

  /** インポートダイアログ表示フラグ */
  isImportDialogOpen: boolean;

  /** 削除確認ダイアログ表示フラグ */
  isDeleteConfirmOpen: boolean;

  /** スキル読み込みエラー */
  skillLoadError: string | null;

  /** 操作エラー */
  skillOperationError: string | null;
}
```

### 2.2 初期状態

```typescript
/**
 * スキル管理状態の初期値
 */
export const initialSkillManagementState: SkillManagementState = {
  availableSkills: [],
  importedSkills: [],
  selectedSkill: null,
  selectedSkillDetail: null,
  skillFilter: "",
  skillCategory: null,
  isLoadingSkills: false,
  isLoadingSkillDetail: false,
  isImporting: false,
  isRemoving: false,
  isImportDialogOpen: false,
  isDeleteConfirmOpen: false,
  skillLoadError: null,
  skillOperationError: null,
};
```

---

## 3. アクション設計

### 3.1 SkillManagementActions

```typescript
/**
 * スキル管理のアクション
 */
export interface SkillManagementActions {
  // ===== データ取得 =====

  /**
   * 利用可能スキル一覧を取得
   * @description .claude/skills/配下の全スキルを取得
   */
  fetchAvailableSkills: () => Promise<void>;

  /**
   * インポート済みスキル一覧を取得
   * @description electron-storeから永続化されたスキルを取得
   */
  fetchImportedSkills: () => Promise<void>;

  /**
   * スキル詳細を取得
   * @param skillId スキルID
   */
  fetchSkillDetail: (skillId: string) => Promise<void>;

  // ===== スキル操作 =====

  /**
   * スキルをインポート
   * @param skillIds インポートするスキルIDの配列
   */
  importSkills: (skillIds: string[]) => Promise<void>;

  /**
   * スキルを削除（インポート解除）
   * @param skillId 削除するスキルID
   */
  removeSkill: (skillId: string) => Promise<void>;

  // ===== UI状態更新 =====

  /**
   * スキルを選択
   * @param skill 選択するスキル（nullで選択解除）
   */
  selectSkill: (skill: Skill | null) => void;

  /**
   * 検索フィルターを設定
   * @param filter 検索文字列
   */
  setSkillFilter: (filter: string) => void;

  /**
   * カテゴリフィルターを設定
   * @param category カテゴリ（nullで全カテゴリ）
   */
  setSkillCategory: (category: SkillCategory | null) => void;

  // ===== ダイアログ制御 =====

  /** インポートダイアログを開く */
  openImportDialog: () => void;

  /** インポートダイアログを閉じる */
  closeImportDialog: () => void;

  /** 削除確認ダイアログを開く */
  openDeleteConfirm: () => void;

  /** 削除確認ダイアログを閉じる */
  closeDeleteConfirm: () => void;

  // ===== リセット =====

  /** エラー状態をクリア */
  clearSkillErrors: () => void;

  /** スキル状態を全てリセット */
  resetSkillState: () => void;
}
```

### 3.2 Slice型定義

```typescript
/**
 * スキル管理Slice（State + Actions）
 */
export type SkillManagementSlice = SkillManagementState &
  SkillManagementActions;
```

---

## 4. Slice実装

### 4.1 createSkillSlice

```typescript
import { StateCreator } from "zustand";

export const createSkillSlice: StateCreator<
  SkillManagementSlice,
  [],
  [],
  SkillManagementSlice
> = (set, get) => ({
  // Initial state
  ...initialSkillManagementState,

  // ===== データ取得 =====

  fetchAvailableSkills: async () => {
    set({ isLoadingSkills: true, skillLoadError: null });
    try {
      const skills = await window.skillAPI.listAvailable();
      set({ availableSkills: skills, isLoadingSkills: false });
    } catch (error) {
      set({
        isLoadingSkills: false,
        skillLoadError:
          error instanceof Error ? error.message : "スキルの取得に失敗しました",
      });
    }
  },

  fetchImportedSkills: async () => {
    set({ isLoadingSkills: true, skillLoadError: null });
    try {
      const skills = await window.skillAPI.listImported();
      set({ importedSkills: skills, isLoadingSkills: false });
    } catch (error) {
      set({
        isLoadingSkills: false,
        skillLoadError:
          error instanceof Error ? error.message : "スキルの取得に失敗しました",
      });
    }
  },

  fetchSkillDetail: async (skillId: string) => {
    set({ isLoadingSkillDetail: true });
    try {
      const detail = await window.skillAPI.getDetail({ skillId });
      set({ selectedSkillDetail: detail, isLoadingSkillDetail: false });
    } catch (error) {
      set({
        isLoadingSkillDetail: false,
        skillOperationError:
          error instanceof Error ? error.message : "詳細の取得に失敗しました",
      });
    }
  },

  // ===== スキル操作 =====

  importSkills: async (skillIds: string[]) => {
    set({ isImporting: true, skillOperationError: null });
    try {
      const result = await window.skillAPI.import({ skillIds });
      if (result.success) {
        // インポート後に一覧を再取得
        await get().fetchImportedSkills();
        set({ isImporting: false, isImportDialogOpen: false });
      } else {
        throw new Error(result.error || "インポートに失敗しました");
      }
    } catch (error) {
      set({
        isImporting: false,
        skillOperationError:
          error instanceof Error ? error.message : "インポートに失敗しました",
      });
    }
  },

  removeSkill: async (skillId: string) => {
    set({ isRemoving: true, skillOperationError: null });
    try {
      const result = await window.skillAPI.remove({ skillId });
      if (result.success) {
        // 削除後に一覧を更新
        const { importedSkills, selectedSkill } = get();
        const updatedSkills = importedSkills.filter((s) => s.id !== skillId);
        set({
          importedSkills: updatedSkills,
          isRemoving: false,
          isDeleteConfirmOpen: false,
          // 削除したスキルが選択中だった場合は選択解除
          selectedSkill: selectedSkill?.id === skillId ? null : selectedSkill,
          selectedSkillDetail:
            selectedSkill?.id === skillId ? null : get().selectedSkillDetail,
        });
      } else {
        throw new Error(result.error || "削除に失敗しました");
      }
    } catch (error) {
      set({
        isRemoving: false,
        skillOperationError:
          error instanceof Error ? error.message : "削除に失敗しました",
      });
    }
  },

  // ===== UI状態更新 =====

  selectSkill: (skill: Skill | null) => {
    set({
      selectedSkill: skill,
      selectedSkillDetail: null, // 詳細はリセット
    });
    // 選択時に詳細を自動取得
    if (skill) {
      get().fetchSkillDetail(skill.id);
    }
  },

  setSkillFilter: (filter: string) => {
    set({ skillFilter: filter });
  },

  setSkillCategory: (category: SkillCategory | null) => {
    set({ skillCategory: category });
  },

  // ===== ダイアログ制御 =====

  openImportDialog: () => {
    set({ isImportDialogOpen: true });
    // ダイアログを開く際に利用可能スキルを取得
    get().fetchAvailableSkills();
  },

  closeImportDialog: () => {
    set({ isImportDialogOpen: false });
  },

  openDeleteConfirm: () => {
    set({ isDeleteConfirmOpen: true });
  },

  closeDeleteConfirm: () => {
    set({ isDeleteConfirmOpen: false });
  },

  // ===== リセット =====

  clearSkillErrors: () => {
    set({ skillLoadError: null, skillOperationError: null });
  },

  resetSkillState: () => {
    set(initialSkillManagementState);
  },
});
```

---

## 5. Store統合

### 5.1 RootStore型定義

```typescript
// apps/desktop/src/renderer/store/index.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createUISlice, UISlice } from "./slices/uiSlice";
import { createAuthSlice, AuthSlice } from "./slices/authSlice";
import { createChatSlice, ChatSlice } from "./slices/chatSlice";
import { createSkillSlice, SkillManagementSlice } from "./slices/skillSlice";

/**
 * ルートストア型
 */
export type RootStore = UISlice & AuthSlice & ChatSlice & SkillManagementSlice;

/**
 * Zustandストア
 */
export const useStore = create<RootStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createUISlice(...args),
        ...createAuthSlice(...args),
        ...createChatSlice(...args),
        ...createSkillSlice(...args),
      }),
      {
        name: "aiworkflow-store",
        partialize: (state) => ({
          // 永続化する状態のみ
          importedSkillIds: state.importedSkills.map((s) => s.id),
        }),
      },
    ),
  ),
);
```

### 5.2 カスタムフック

```typescript
// apps/desktop/src/renderer/hooks/useSkillStore.ts

import { useStore } from "../store";
import { useMemo } from "react";
import type { Skill, SkillCategory } from "@repo/shared/types/skill";

/**
 * スキル状態とアクションを取得するフック
 */
export const useSkillStore = () => {
  return useStore((state) => ({
    // State
    availableSkills: state.availableSkills,
    importedSkills: state.importedSkills,
    selectedSkill: state.selectedSkill,
    selectedSkillDetail: state.selectedSkillDetail,
    skillFilter: state.skillFilter,
    skillCategory: state.skillCategory,
    isLoadingSkills: state.isLoadingSkills,
    isLoadingSkillDetail: state.isLoadingSkillDetail,
    isImporting: state.isImporting,
    isRemoving: state.isRemoving,
    isImportDialogOpen: state.isImportDialogOpen,
    isDeleteConfirmOpen: state.isDeleteConfirmOpen,
    skillLoadError: state.skillLoadError,
    skillOperationError: state.skillOperationError,
    // Actions
    fetchAvailableSkills: state.fetchAvailableSkills,
    fetchImportedSkills: state.fetchImportedSkills,
    fetchSkillDetail: state.fetchSkillDetail,
    importSkills: state.importSkills,
    removeSkill: state.removeSkill,
    selectSkill: state.selectSkill,
    setSkillFilter: state.setSkillFilter,
    setSkillCategory: state.setSkillCategory,
    openImportDialog: state.openImportDialog,
    closeImportDialog: state.closeImportDialog,
    openDeleteConfirm: state.openDeleteConfirm,
    closeDeleteConfirm: state.closeDeleteConfirm,
    clearSkillErrors: state.clearSkillErrors,
    resetSkillState: state.resetSkillState,
  }));
};

/**
 * フィルタリング済みスキル一覧を取得するフック
 */
export const useFilteredSkills = () => {
  const { importedSkills, skillFilter, skillCategory } = useSkillStore();

  return useMemo(() => {
    return importedSkills.filter((skill) => {
      // カテゴリフィルター
      if (skillCategory && skill.category !== skillCategory) {
        return false;
      }

      // テキストフィルター
      if (skillFilter) {
        const lowerFilter = skillFilter.toLowerCase();
        const matchesName = skill.name.toLowerCase().includes(lowerFilter);
        const matchesDescription = skill.description
          .toLowerCase()
          .includes(lowerFilter);
        const matchesTriggers = skill.triggers.some((t) =>
          t.toLowerCase().includes(lowerFilter),
        );

        if (!matchesName && !matchesDescription && !matchesTriggers) {
          return false;
        }
      }

      return true;
    });
  }, [importedSkills, skillFilter, skillCategory]);
};

/**
 * 利用可能なカテゴリ一覧を取得するフック
 */
export const useAvailableCategories = (): SkillCategory[] => {
  const { importedSkills } = useSkillStore();

  return useMemo(() => {
    const categories = new Set<SkillCategory>();
    importedSkills.forEach((skill) => {
      if (skill.category) {
        categories.add(skill.category);
      }
    });
    return Array.from(categories);
  }, [importedSkills]);
};
```

---

## 6. データフロー

### 6.1 初期ロードフロー

```
┌─────────────────────────────────────────────────────────────┐
│ AgentView マウント時                                         │
│                                                             │
│  useEffect(() => {                                          │
│    fetchImportedSkills();                                   │
│  }, []);                                                    │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ fetchImportedSkills()                                       │
│                                                             │
│  1. set({ isLoadingSkills: true })                          │
│  2. await window.skillAPI.listImported()                    │
│  3. set({ importedSkills: skills, isLoadingSkills: false }) │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ SkillList 再レンダリング                                     │
│                                                             │
│  isLoadingSkills ? <Skeleton /> : <SkillCard[] />           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 スキル選択フロー

```
┌─────────────────────────────────────────────────────────────┐
│ SkillCard クリック                                          │
│                                                             │
│  onClick={() => selectSkill(skill)}                         │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ selectSkill(skill)                                          │
│                                                             │
│  1. set({ selectedSkill: skill, selectedSkillDetail: null })│
│  2. fetchSkillDetail(skill.id)                              │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ SkillDetailPanel 表示                                       │
│                                                             │
│  isLoadingSkillDetail ? <Skeleton /> : <SkillDetail />      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 インポートフロー

```
┌─────────────────────────────────────────────────────────────┐
│ インポートボタン クリック                                    │
│                                                             │
│  onClick={() => openImportDialog()}                         │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ openImportDialog()                                          │
│                                                             │
│  1. set({ isImportDialogOpen: true })                       │
│  2. fetchAvailableSkills()                                  │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ SkillImportDialog 表示                                      │
│ ユーザーがスキルを選択                                       │
│                                                             │
│  onImport={() => importSkills(selectedIds)}                 │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ importSkills(skillIds)                                      │
│                                                             │
│  1. set({ isImporting: true })                              │
│  2. await window.skillAPI.import({ skillIds })              │
│  3. await fetchImportedSkills()  // 一覧再取得              │
│  4. set({ isImporting: false, isImportDialogOpen: false })  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. テスト容易性

### 7.1 モック可能なIPC API

```typescript
// テスト用モック
const mockSkillAPI: SkillAPI = {
  listAvailable: vi.fn().mockResolvedValue([]),
  listImported: vi.fn().mockResolvedValue([]),
  import: vi.fn().mockResolvedValue({ success: true }),
  remove: vi.fn().mockResolvedValue({ success: true }),
  getDetail: vi.fn().mockResolvedValue(null),
};

// テスト前にモックを設定
beforeEach(() => {
  window.skillAPI = mockSkillAPI;
});
```

### 7.2 Sliceテスト例

```typescript
// apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts

import { createSkillSlice, initialSkillManagementState } from "../skillSlice";

describe("skillSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    window.skillAPI = mockSkillAPI;
  });

  describe("fetchImportedSkills", () => {
    it("should set isLoadingSkills to true while fetching", async () => {
      const promise = store.getState().fetchImportedSkills();
      expect(store.getState().isLoadingSkills).toBe(true);
      await promise;
      expect(store.getState().isLoadingSkills).toBe(false);
    });

    it("should update importedSkills on success", async () => {
      const mockSkills = [{ id: "1", name: "test-skill" }];
      mockSkillAPI.listImported.mockResolvedValueOnce(mockSkills);

      await store.getState().fetchImportedSkills();

      expect(store.getState().importedSkills).toEqual(mockSkills);
    });

    it("should set skillLoadError on failure", async () => {
      mockSkillAPI.listImported.mockRejectedValueOnce(
        new Error("Network error"),
      );

      await store.getState().fetchImportedSkills();

      expect(store.getState().skillLoadError).toBe("Network error");
    });
  });
});
```

---

## 8. 確認済み

- [x] SkillManagementState が定義されている
- [x] SkillManagementActions が定義されている
- [x] createSkillSlice 実装が定義されている
- [x] Store統合パターンが定義されている
- [x] カスタムフックが定義されている
- [x] データフローが明確化されている
- [x] テスト容易性が確保されている
